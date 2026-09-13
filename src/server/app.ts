import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { pool, initDb } from './db';
import {
  matchDirectKB,
  matchFuzzyFAQ,
  generateGroundedLLM,
  matchKeywordFallback,
  createHumanTicketFallback,
  buildWhatsAppLink,
  PipelineSettings
} from './pipeline';

// ---------------------------------------------------------------------------
// Non-AI text extraction for the knowledge-ingestion fallback path.
// Only ever returns text for formats it can genuinely parse — never decodes
// arbitrary binary as UTF-8. Plain-text formats are used as-is; PDF and DOCX
// get real parsers; anything else (images, legacy .doc) is reported as
// unsupported so the caller can surface a real error instead of fabricating
// a "chunk" out of raw binary file structure.
// ---------------------------------------------------------------------------
async function extractRawTextFromUpload(
  fileData: string,
  fileName: string,
  mimeType: string
): Promise<{ text: string; unsupported: boolean }> {
  const lowerName = (fileName || '').toLowerCase();
  const isDataUrl = typeof fileData === 'string' && fileData.startsWith('data:');
  const base64Payload = isDataUrl ? (fileData.split('base64,')[1] || '') : null;
  const buffer = base64Payload ? Buffer.from(base64Payload, 'base64') : null;

  const isPlainText = mimeType.startsWith('text/') || mimeType === 'application/json' ||
    lowerName.endsWith('.md') || lowerName.endsWith('.txt') || lowerName.endsWith('.csv') || lowerName.endsWith('.json');

  if (isPlainText && !isDataUrl) {
    return { text: fileData, unsupported: false };
  }

  const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf');
  const isDocx = mimeType.includes('wordprocessingml') || lowerName.endsWith('.docx');

  if (isPdf && buffer) {
    let extracted = '';
    // 1. Try pdf-parse library
    try {
      const pdfModule: any = await import('pdf-parse');
      if (typeof pdfModule === 'function') {
        const data = await pdfModule(buffer);
        extracted = data?.text || '';
      } else if (typeof pdfModule?.default === 'function') {
        const data = await pdfModule.default(buffer);
        extracted = data?.text || '';
      } else if (pdfModule?.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const res = await parser.getText();
        extracted = res?.text || '';
      }
    } catch (err: any) {
      console.warn('[knowledge-extract] pdf-parse library failed, attempting pure-JS stream parser:', err?.message || err);
    }

    if (extracted.trim().length > 0) {
      return { text: extracted, unsupported: false };
    }

    // 2. Pure JS stream text fallback for PDF without canvas or native binaries
    try {
      const rawPdf = buffer.toString('latin1');
      const textMatches: string[] = [];
      const textBlocks = rawPdf.match(/BT[\s\S]*?ET/g) || [];
      for (const block of textBlocks) {
        const stringMatches = block.match(/\((.*?)\)|<([0-9a-fA-F]+)>/g) || [];
        for (const sm of stringMatches) {
          if (sm.startsWith('(') && sm.endsWith(')')) {
            const inner = sm.slice(1, -1)
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\\\\/g, '\\');
            if (inner.trim()) textMatches.push(inner);
          }
        }
      }
      const streamText = textMatches.join(' ').replace(/\s+/g, ' ').trim();
      if (streamText.length > 20) {
        return { text: streamText, unsupported: false };
      }
    } catch (fallbackErr) {
      console.warn('[knowledge-extract] Stream fallback failed:', fallbackErr);
    }

    return { text: '', unsupported: true };
  }

  if (isDocx && buffer) {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      const text = result?.value || '';
      return { text, unsupported: text.trim().length === 0 };
    } catch (err: any) {
      console.error('[knowledge-extract] mammoth (docx) parsing failed:', err?.message || err);
      return { text: '', unsupported: true };
    }
  }

  // Legacy binary .doc, images, and anything else we can't safely parse as text.
  return { text: '', unsupported: true };
}

// ---------------------------------------------------------------------------
// OpenAI-powered knowledge chunk extraction for the admin "extract-from-file"
// endpoint. PDFs/DOCX are converted to plain text first (via extractRawTextFromUpload)
// and sent as text — OpenAI's chat completions API doesn't take raw PDF/DOCX bytes
// the way Gemini's inlineData did, but it takes text and images natively, which
// covers every format this endpoint supports.
// ---------------------------------------------------------------------------
const OPENAI_CHUNK_JSON_SCHEMA = {
  name: 'knowledge_chunks',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      chunks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            category: { type: 'string' },
            content: { type: 'string' }
          },
          required: ['title', 'category', 'content'],
          additionalProperties: false
        }
      }
    },
    required: ['chunks'],
    additionalProperties: false
  }
} as const;

function buildKnowledgeExtractionSystemPrompt(categoryHint: string): string {
  return `You are an expert technical documentation analyzer and knowledge chunking engine for the Ama Community platform.
Your task is to analyze the ENTIRE provided file/document exhaustively and extract clean, highly factual, self-contained Knowledge Chunks suitable for real-time RAG (Retrieval-Augmented Generation).

Guidelines:
1. Read and use the FULL document. Do not skip sections, tables, footnotes, or examples. Extract the maximum amount of distinct, useful information — do not stop at a small handful of chunks just because the document is short; do not merge unrelated topics into one chunk just to keep the count low.
2. Break the document into as many coherent, self-contained knowledge chunks as the content genuinely supports (this can be anywhere from 1 chunk for a trivial document to 30+ for a long, dense one). Each chunk should cover exactly one topic, procedure, policy, or fact cluster so it can be retrieved independently.
3. Each chunk MUST have:
   - "title": A concise, descriptive, search-friendly title.
   - "category": A clear category tag (e.g. "${categoryHint}", "WordPress & Themes", "PostgreSQL Database", "Forum Rules", "Consultancy", "Security").
   - "content": A well-structured, factual, DETAILED explanation of that topic — preserve concrete specifics (numbers, steps, names, conditions, exceptions) rather than vague summaries. Use bullet points for steps/lists and full sentences for explanations. Do not compress away specifics for the sake of brevity.
4. Remove only true redundant filler or formatting noise (page headers/footers, repeated boilerplate) — never remove substantive content.`;
}

async function callOpenAIForChunks(
  model: string,
  systemPrompt: string,
  userContent: any
): Promise<{ title: string; category: string; content: string }[] | null> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_schema', json_schema: OPENAI_CHUNK_JSON_SCHEMA },
      max_completion_tokens: 16000
    })
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    const err: any = new Error(`OpenAI ${response.status}: ${errBody.slice(0, 500)}`);
    err.status = response.status;
    throw err;
  }

  const data: any = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (!parsed?.chunks || !Array.isArray(parsed.chunks) || parsed.chunks.length === 0) return null;

  return parsed.chunks
    .map((c: any) => ({
      title: String(c.title || 'Untitled Chunk'),
      category: String(c.category || ''),
      content: String(c.content || '')
    }))
    .filter((c: { content: string }) => c.content.trim().length > 0);
}

async function callGeminiForChunks(
  model: string,
  systemPrompt: string,
  userContent: any
): Promise<{ title: string; category: string; content: string }[] | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const response = await ai.models.generateContent({
    model,
    contents: userContent,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chunks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ['title', 'category', 'content']
            }
          }
        },
        required: ['chunks']
      },
      temperature: 0.2
    }
  });

  if (!response.text) return null;
  const parsed = JSON.parse(response.text.trim());
  if (!parsed?.chunks || !Array.isArray(parsed.chunks) || parsed.chunks.length === 0) return null;

  return parsed.chunks
    .map((c: any) => ({
      title: String(c.title || 'Untitled Chunk'),
      category: String(c.category || ''),
      content: String(c.content || '')
    }))
    .filter((c: { content: string }) => c.content.trim().length > 0);
}

async function runAIKnowledgeExtraction(
  fileData: string,
  fileName: string,
  mimeType: string,
  categoryHint: string,
  preferredModel?: string
): Promise<{ title: string; category: string; content: string }[]> {
  const activeModel = (preferredModel || 'gpt-4.1-mini').trim();
  const isGeminiModel = activeModel.startsWith('gemini-');
  const systemPrompt = buildKnowledgeExtractionSystemPrompt(categoryHint);
  const lowerName = (fileName || '').toLowerCase();
  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf');

  let openAiUserContent: any = null;
  let geminiUserContent: any = null;

  if (isImage) {
    const imageUrl = fileData.startsWith('data:') ? fileData : `data:${mimeType};base64,${fileData}`;
    openAiUserContent = [
      { type: 'text', text: `File Name: ${fileName}\nPreferred Category: ${categoryHint}\nPlease analyze this image and extract the structured knowledge chunks.` },
      { type: 'image_url', image_url: { url: imageUrl } }
    ];
    const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
    geminiUserContent = [
      `File Name: ${fileName}\nPreferred Category: ${categoryHint}\nPlease analyze this image and extract the structured knowledge chunks.`,
      { inlineData: { mimeType, data: base64Data } }
    ];
  } else if (isPdf) {
    const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
    // Gemini supports native multimodal PDF understanding directly via inlineData!
    geminiUserContent = [
      `File Name: ${fileName}\nPreferred Category: ${categoryHint}\nPlease analyze this entire PDF document thoroughly and extract structured knowledge chunks.`,
      { inlineData: { mimeType: 'application/pdf', data: base64Data } }
    ];

    // For OpenAI (which does not accept raw PDF binary in chat completions), extract text first
    const { text } = await extractRawTextFromUpload(fileData, fileName, mimeType);
    if (text && text.trim()) {
      openAiUserContent = `File Name: ${fileName}\nFile Type: ${mimeType}\nPreferred Category: ${categoryHint}\n\nDocument Content:\n${text}`;
    }
  } else {
    const { text, unsupported } = await extractRawTextFromUpload(fileData, fileName, mimeType);
    if (unsupported || !text.trim()) {
      return [];
    }
    const textPrompt = `File Name: ${fileName}\nFile Type: ${mimeType}\nPreferred Category: ${categoryHint}\n\nDocument Content:\n${text}`;
    openAiUserContent = textPrompt;
    geminiUserContent = textPrompt;
  }

  // 1. If Gemini model is preferred and key is present
  if (isGeminiModel && process.env.GEMINI_API_KEY && geminiUserContent) {
    const geminiCandidates = Array.from(new Set([activeModel, 'gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite']));
    for (const model of geminiCandidates) {
      try {
        const chunks = await callGeminiForChunks(model, systemPrompt, geminiUserContent);
        if (chunks && chunks.length > 0) return chunks;
      } catch (err: any) {
        console.warn(`[knowledge-extract] Gemini model "${model}" extraction attempt failed:`, err?.message || err);
      }
    }
  }

  // 2. If OpenAI model is preferred (or Gemini fallback) and OpenAI key is present and content is available
  if (process.env.OPENAI_API_KEY && openAiUserContent) {
    const openAiCandidates = Array.from(new Set([
      isGeminiModel ? 'gpt-4.1-mini' : activeModel,
      'gpt-4.1-mini',
      'gpt-4o',
      'gpt-5-mini',
      'gpt-4o-mini'
    ]));

    for (const model of openAiCandidates) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const chunks = await callOpenAIForChunks(model, systemPrompt, openAiUserContent);
          if (chunks && chunks.length > 0) return chunks;
          break;
        } catch (err: any) {
          const msg = err?.message || String(err);
          console.error(`[knowledge-extract] OpenAI model "${model}" attempt ${attempt + 1} failed:`, msg);
          if (err?.status === 401 || msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
            console.error('[knowledge-extract] OPENAI_API_KEY looks invalid or missing.');
          }
          const isTransient = err?.status === 429 || err?.status === 503 || msg.includes('rate_limit') || msg.includes('overloaded');
          if (isTransient && attempt === 0) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          break;
        }
      }
    }
  }

  // 3. If OpenAI was preferred but failed (or skipped for PDF), try Gemini as secondary AI fallback
  if (!isGeminiModel && process.env.GEMINI_API_KEY && geminiUserContent) {
    const geminiCandidates = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const model of geminiCandidates) {
      try {
        const chunks = await callGeminiForChunks(model, systemPrompt, geminiUserContent);
        if (chunks && chunks.length > 0) return chunks;
      } catch (err: any) {
        console.warn(`[knowledge-extract] Gemini fallback model "${model}" failed:`, err?.message || err);
      }
    }
  }

  console.warn(`[knowledge-extract] All AI models failed for "${fileName}" — falling back to non-AI chunker.`);
  return [];
}

// ---------------------------------------------------------------------------
// AI support chat performance helpers
// ---------------------------------------------------------------------------
// The RAG context (FAQs, knowledge docs, recent topics, settings) used to be
// re-queried from the DB on every single chat message, adding 4 sequential
// round-trips before the AI call even started. It changes rarely, so it's
// cached in memory for a short TTL and shared across requests on this warm
// instance. Any admin mutation that touches this data invalidates the cache.
let ragCache: { data: RagData; expiresAt: number } | null = null;
const RAG_CACHE_TTL_MS = 60_000; // 1 minute

interface RagData {
  faqsData: { rows: any[] };
  docsData: { rows: any[] };
  topicsData: { rows: any[] };
  settingsData: { rows: any[] };
}

function invalidateRagCache() {
  ragCache = null;
}

async function getRagData(): Promise<RagData> {
  if (ragCache && ragCache.expiresAt > Date.now()) {
    return ragCache.data;
  }

  const [faqsData, docsData, topicsData, settingsData] = await Promise.all([
    pool.query(`
      SELECT f.question, f.answer, f.question_bn, f.answer_bn, COALESCE(c.name, 'General') as category 
      FROM faqs f 
      LEFT JOIN faq_categories c ON f.category_id = c.id 
      WHERE f.status = 'published' OR f.status IS NULL OR f.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT 30
    `),
    pool.query(`
      SELECT id, title, content, category, status 
      FROM knowledge_documents 
      WHERE status = 'published' OR status IS NULL OR status = 'active'
      ORDER BY created_at DESC 
      LIMIT 30
    `),
    pool.query(`SELECT title, category, author, views, replies FROM topics ORDER BY created_at DESC LIMIT 10`),
    pool.query(`SELECT value FROM settings WHERE key = 'platform'`)
  ]);

  const data: RagData = { faqsData, docsData, topicsData, settingsData };
  ragCache = { data, expiresAt: Date.now() + RAG_CACHE_TTL_MS };
  return data;
}

// Races a promise against a timeout so a slow/hanging Gemini model can't
// stall the whole reply — we bail out and try the next model (or the
// heuristic fallback) instead of waiting indefinitely.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const t = setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms);
      // @ts-ignore - unref so this timer never keeps the process alive
      t.unref?.();
    })
  ]);
}

// Builds and returns a fully-configured Express app with all API routes
// registered, but WITHOUT starting an HTTP listener and WITHOUT any static
// file / SPA serving. This is shared between the local dev server
// (server.ts) and the Vercel serverless function (api/index.ts).
export async function createApp() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Ensure the schema exists before any request is allowed to hit a data
  // route. Previously this ran in the background (fire-and-forget), which
  // meant early requests on a cold start could query tables that didn't
  // exist yet. Combined with the old pool.query() error-swallowing, that
  // produced empty-but-"successful" responses instead of a visible error.
  // initDb() itself caches its promise, so this only pays the cost once per
  // warm serverless instance.
  app.use(async (_req, res, next) => {
    try {
      await initDb();
      next();
    } catch (err: any) {
      console.error('[Database] Schema initialization failed:', err?.message);
      res.status(503).json({
        error: 'Database Unavailable',
        message: err?.message || 'Database schema initialization failed'
      });
    }
  });

  // Root API route
  app.get(['/api', '/api/'], (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Ama Community API',
      healthUrl: '/api/health',
      timestamp: new Date().toISOString()
    });
  });

  // Invalidate the cached RAG context (used by the AI support chat) whenever
  // an admin mutates FAQs, knowledge docs, or platform settings, so changes
  // show up on the next chat message instead of waiting out the cache TTL.
  const RAG_INVALIDATING_PATHS = [
    '/api/admin/support/faqs',
    '/api/admin/support/knowledge-docs',
    '/api/settings'
  ];
  app.use((req, res, next) => {
    if (req.method !== 'GET' && RAG_INVALIDATING_PATHS.some(p => req.path.startsWith(p))) {
      res.on('finish', () => {
        if (res.statusCode < 400) invalidateRagCache();
      });
    }
    next();
  });

  // API ROUTES

  // Health check (Public status overview without sensitive secrets)
  app.get('/api/health', async (_req, res) => {
    const startTime = Date.now();
    const checks: {
      database: { status: 'connected' | 'error'; responseTimeMs?: number; message?: string };
      aiApi: { status: 'configured' | 'not_configured'; model?: string; provider?: string };
      cache: { status: 'ready'; ragCacheActive: boolean };
    } = {
      database: { status: 'error' },
      aiApi: { status: 'not_configured' },
      cache: { status: 'ready', ragCacheActive: Boolean(ragCache && ragCache.expiresAt > Date.now()) }
    };

    // 1. Check Database connection & latency safely
    try {
      const dbStart = Date.now();
      await pool.query('SELECT 1');
      checks.database = {
        status: 'connected',
        responseTimeMs: Date.now() - dbStart,
        message: 'PostgreSQL connection operational'
      };
    } catch {
      checks.database = {
        status: 'error',
        message: 'Database service unavailable'
      };
    }

    // 2. Check AI API configuration safely (without revealing API keys)
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      checks.aiApi = {
        status: 'configured',
        provider: 'Google Gemini',
        model: 'gemini-3.8-flash'
      };
    } else {
      checks.aiApi = {
        status: 'not_configured',
        provider: 'Local Heuristic / PostgreSQL RAG'
      };
    }

    const isHealthy = checks.database.status === 'connected';
    const totalDurationMs = Date.now() - startTime;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Ama Community API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: totalDurationMs,
      checks
    });
  });

  // Topics
  app.get('/api/topics', async (_req, res) => {
    try {
      const topicsRes = await pool.query(`
        SELECT * FROM topics ORDER BY created_at DESC
      `);
      const repliesRes = await pool.query(`
        SELECT * FROM replies ORDER BY created_at ASC
      `);

      const repliesByTopic: Record<string, any[]> = {};
      for (const reply of repliesRes.rows) {
        if (!repliesByTopic[reply.topic_id]) {
          repliesByTopic[reply.topic_id] = [];
        }
        repliesByTopic[reply.topic_id].push({
          id: reply.id,
          author: reply.author,
          authorEmail: reply.author_email,
          authorId: reply.author_id,
          authorRole: reply.author_role,
          authorAvatar: reply.author_avatar,
          timeAgo: reply.time_ago,
          content: reply.content,
          likes: reply.likes || 0
        });
      }

      const topics = topicsRes.rows.map((t: any) => ({
        id: t.id,
        title: t.title,
        author: t.author,
        authorEmail: t.author_email,
        authorId: t.author_id,
        authorRole: t.author_role,
        authorAvatar: t.author_avatar,
        timeAgo: t.time_ago,
        category: t.category,
        categorySlug: t.category_slug,
        views: t.views || 0,
        likes: t.likes || 0,
        replies: t.replies || (repliesByTopic[t.id]?.length || 0),
        isFeatured: Boolean(t.is_featured),
        isPopular: Boolean(t.is_popular),
        content: t.content,
        repliesList: repliesByTopic[t.id] || []
      }));

      res.json(topics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics', async (req, res) => {
    try {
      const {
        title,
        author,
        authorEmail,
        authorId,
        authorRole,
        authorAvatar,
        timeAgo,
        category,
        categorySlug,
        content
      } = req.body;

      const id = `topic-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';

      const insertRes = await pool.query(`
        INSERT INTO topics (id, title, author, author_email, author_id, author_role, author_avatar, time_ago, category, category_slug, views, likes, replies, is_featured, is_popular, content)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, 0, 0, false, false, $11)
        RETURNING *
      `, [id, title, author || 'Community Member', authorEmail || null, authorId || null, authorRole || 'Member', avatar, timeAgo || 'Just now', category, categorySlug, content]);

      const newTopic = {
        id: insertRes.rows[0].id,
        title: insertRes.rows[0].title,
        author: insertRes.rows[0].author,
        authorEmail: insertRes.rows[0].author_email,
        authorId: insertRes.rows[0].author_id,
        authorRole: insertRes.rows[0].author_role,
        authorAvatar: insertRes.rows[0].author_avatar,
        timeAgo: insertRes.rows[0].time_ago,
        category: insertRes.rows[0].category,
        categorySlug: insertRes.rows[0].category_slug,
        views: 1,
        likes: 0,
        replies: 0,
        isFeatured: false,
        isPopular: false,
        content: insertRes.rows[0].content,
        repliesList: []
      };

      // Also log activity
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Published Topic', $2, $3, 'Just now', 'topic')
      `, [`act-${Date.now()}`, author || 'Community Member', title]);

      res.status(201).json(newTopic);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/topics/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const topicRes = await pool.query('SELECT * FROM topics WHERE id = $1', [id]);
      if (topicRes.rows.length === 0) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      const topic = topicRes.rows[0];

      // Extract requester identity from headers or body
      const userEmail = (
        (req.headers['x-user-email'] as string) ||
        req.body?.userEmail ||
        ''
      ).trim().toLowerCase();
      const userRole = (
        (req.headers['x-user-role'] as string) ||
        req.body?.userRole ||
        ''
      ).trim();
      const userName = (
        (req.headers['x-user-name'] as string) ||
        req.body?.userName ||
        ''
      ).trim().toLowerCase();
      const userId = (
        (req.headers['x-user-id'] as string) ||
        req.body?.userId ||
        ''
      ).trim();

      // Check if user is an administrator
      let isAllowed = false;

      if (userRole === 'Super Admin' || userRole === 'Moderator') {
        isAllowed = true;
      }

      // If not established as admin yet, check in users DB if role is admin/moderator
      if (!isAllowed && userEmail) {
        const uRes = await pool.query(
          'SELECT role, status FROM users WHERE LOWER(email) = $1',
          [userEmail]
        );
        if (uRes.rows.length > 0 && uRes.rows[0].status === 'active') {
          const r = uRes.rows[0].role;
          if (r === 'Super Admin' || r === 'Moderator') {
            isAllowed = true;
          }
        }
      }

      // Check if user is the person who posted
      if (!isAllowed) {
        const topicAuthorEmail = (topic.author_email || '').trim().toLowerCase();
        const topicAuthorName = (topic.author || '').trim().toLowerCase();
        const topicAuthorId = topic.author_id || '';

        if (topicAuthorEmail && userEmail && topicAuthorEmail === userEmail) {
          isAllowed = true;
        } else if (topicAuthorId && userId && topicAuthorId === userId) {
          isAllowed = true;
        } else if (topicAuthorName && userName && topicAuthorName === userName) {
          isAllowed = true;
        } else if (
          topicAuthorName &&
          userEmail &&
          topicAuthorName === userEmail.split('@')[0]
        ) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        return res.status(403).json({
          error: 'Permission denied: Only administrators and the author who posted this discussion can delete it.'
        });
      }

      await pool.query('DELETE FROM topics WHERE id = $1', [id]);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics/:id/feature', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET is_featured = NOT is_featured WHERE id = $1 RETURNING is_featured
      `, [id]);
      res.json({ success: true, isFeatured: result.rows[0]?.is_featured });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics/:id/popular', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET is_popular = NOT is_popular WHERE id = $1 RETURNING is_popular
      `, [id]);
      res.json({ success: true, isPopular: result.rows[0]?.is_popular });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET likes = likes + 1 WHERE id = $1 RETURNING likes
      `, [id]);
      res.json({ success: true, likes: result.rows[0]?.likes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics/:id/replies', async (req, res) => {
    try {
      const { id: topicId } = req.params;
      const { author, content, authorAvatar, authorRole, authorEmail, authorId } = req.body;
      const replyId = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
      const cleanEmail = (authorEmail || (req.headers['x-user-email'] as string) || '').trim().toLowerCase() || null;
      const cleanUserId = (authorId || (req.headers['x-user-id'] as string) || '').trim() || null;

      const replyRes = await pool.query(`
        INSERT INTO replies (id, topic_id, author, author_email, author_id, author_role, author_avatar, time_ago, content, likes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Just now', $8, 0)
        RETURNING *
      `, [replyId, topicId, author || 'Community Member', cleanEmail, cleanUserId, authorRole || 'Member', avatar, content]);

      // Update topic replies count
      await pool.query('UPDATE topics SET replies = replies + 1 WHERE id = $1', [topicId]);

      const reply = {
        id: replyRes.rows[0].id,
        author: replyRes.rows[0].author,
        authorEmail: replyRes.rows[0].author_email,
        authorId: replyRes.rows[0].author_id,
        authorRole: replyRes.rows[0].author_role,
        authorAvatar: replyRes.rows[0].author_avatar,
        timeAgo: replyRes.rows[0].time_ago,
        content: replyRes.rows[0].content,
        likes: 0
      };

      // Also log activity
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Added Reply', $2, 'Discussion Thread', 'Just now', 'reply')
      `, [`act-${Date.now()}`, author || 'Community Member']);

      res.status(201).json(reply);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics/:id/view', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET views = views + 1 WHERE id = $1 RETURNING views
      `, [id]);
      res.json({ success: true, views: result.rows[0]?.views });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Blogs
  app.get('/api/blogs', async (_req, res) => {
    try {
      const blogsRes = await pool.query(`
        SELECT b.*, 
          COALESCE(b.likes, 0) as likes,
          COALESCE((SELECT COUNT(*) FROM blog_comments bc WHERE bc.blog_id = b.id), 0) as comments_count
        FROM blogs b
        ORDER BY b.created_at DESC
      `);
      const blogs = blogsRes.rows.map((b: any) => ({
        id: b.id,
        title: b.title,
        category: b.category,
        date: b.date,
        imageUrl: b.image_url,
        excerpt: b.excerpt,
        content: b.content,
        author: b.author,
        authorAvatar: b.author_avatar,
        likes: Number(b.likes || 0),
        commentsCount: Number(b.comments_count || 0)
      }));
      res.json(blogs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/blogs/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const commentsRes = await pool.query(
        'SELECT * FROM blog_comments WHERE blog_id = $1 ORDER BY created_at ASC',
        [id]
      );
      const comments = commentsRes.rows.map((c: any) => ({
        id: c.id,
        blogId: c.blog_id,
        author: c.author,
        authorAvatar: c.author_avatar,
        authorRole: c.author_role,
        timeAgo: c.time_ago,
        content: c.content,
        likes: Number(c.likes || 0)
      }));
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/blogs/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const { author, authorAvatar, authorRole, content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Comment content is required.' });
      }
      const commentId = `bcm-${Date.now()}`;
      const avatar = authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
      const insertRes = await pool.query(`
        INSERT INTO blog_comments (id, blog_id, author, author_avatar, author_role, time_ago, content, likes)
        VALUES ($1, $2, $3, $4, $5, 'Just now', $6, 0)
        RETURNING *
      `, [commentId, id, author || 'Community Member', avatar, authorRole || 'Member', content.trim()]);

      const c = insertRes.rows[0];
      res.status(201).json({
        id: c.id,
        blogId: c.blog_id,
        author: c.author,
        authorAvatar: c.author_avatar,
        authorRole: c.author_role,
        timeAgo: c.time_ago,
        content: c.content,
        likes: 0
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/blogs/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'UPDATE blogs SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes',
        [id]
      );
      res.json({ success: true, likes: Number(result.rows[0]?.likes || 0) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/blogs', async (req, res) => {
    try {
      const { title, category, imageUrl, excerpt, content, author, authorAvatar } = req.body;
      const id = `blog-${Date.now()}`;
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const avatar = authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

      const insertRes = await pool.query(`
        INSERT INTO blogs (id, title, category, date, image_url, excerpt, content, author, author_avatar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [id, title, category, date, imageUrl, excerpt, content, author || 'Editorial Staff', avatar]);

      const newBlog = {
        id: insertRes.rows[0].id,
        title: insertRes.rows[0].title,
        category: insertRes.rows[0].category,
        date: insertRes.rows[0].date,
        imageUrl: insertRes.rows[0].image_url,
        excerpt: insertRes.rows[0].excerpt,
        content: insertRes.rows[0].content,
        author: insertRes.rows[0].author,
        authorAvatar: insertRes.rows[0].author_avatar
      };

      res.status(201).json(newBlog);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Consultancy Inquiries
  app.get('/api/consultancy', async (_req, res) => {
    try {
      const result = await pool.query('SELECT * FROM consultancy_inquiries ORDER BY created_at DESC');
      const inquiries = result.rows.map((r: any) => ({
        id: r.id,
        company: r.company,
        email: r.email,
        scope: r.scope,
        date: r.date,
        status: r.status,
        priority: r.priority,
        assignedTo: r.assigned_to,
        notes: r.notes
      }));
      res.json(inquiries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/consultancy', async (req, res) => {
    try {
      const { company, email, scope } = req.body;
      const id = `lead-${Date.now()}`;
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const insertRes = await pool.query(`
        INSERT INTO consultancy_inquiries (id, company, email, scope, date, status, priority)
        VALUES ($1, $2, $3, $4, $5, 'new', 'normal')
        RETURNING *
      `, [id, company, email, scope, date]);

      // Activity log
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'New Consultancy Lead', $2, $3, 'Just now', 'consultancy')
      `, [`act-${Date.now()}`, email, company]);

      res.status(201).json({
        id: insertRes.rows[0].id,
        company: insertRes.rows[0].company,
        email: insertRes.rows[0].email,
        scope: insertRes.rows[0].scope,
        date: insertRes.rows[0].date,
        status: insertRes.rows[0].status,
        priority: insertRes.rows[0].priority
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/consultancy/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, priority, assignedTo } = req.body;

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (status !== undefined) {
        fields.push(`status = $${idx++}`);
        values.push(status);
      }
      if (notes !== undefined) {
        fields.push(`notes = $${idx++}`);
        values.push(notes);
      }
      if (priority !== undefined) {
        fields.push(`priority = $${idx++}`);
        values.push(priority);
      }
      if (assignedTo !== undefined) {
        fields.push(`assigned_to = $${idx++}`);
        values.push(assignedTo);
      }

      values.push(id);
      await pool.query(`UPDATE consultancy_inquiries SET ${fields.join(', ')} WHERE id = $${idx}`, values);

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/consultancy/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM consultancy_inquiries WHERE id = $1', [id]);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Users & Staff
  app.get('/api/users', async (_req, res) => {
    try {
      const result = await pool.query('SELECT id, name, email, role, status, avatar, joined_date, threads_count FROM users ORDER BY created_at ASC');
      const users = result.rows.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        joinedDate: u.joined_date || 'Recent',
        threadsCount: u.threads_count || 0
      }));
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { name, email, password, role, avatar } = req.body;
      const id = `usr-${Date.now()}`;
      const joinedDate = 'Just now';

      const insertRes = await pool.query(`
        INSERT INTO users (id, name, email, password, role, status, avatar, joined_date, threads_count)
        VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, 0)
        RETURNING id, name, email, role, status, avatar, joined_date, threads_count
      `, [id, name, email, password || 'admin123', role || 'User', avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', joinedDate]);

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { role, status } = req.body;

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(role);
      }
      if (status !== undefined) {
        fields.push(`status = $${idx++}`);
        values.push(status);
      }

      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, values);

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send Email Verification Code
  app.post('/api/auth/send-verification', async (req, res) => {
    try {
      const { email, name, currentLoggedInEmail } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim();
      const cleanCurrent = (currentLoggedInEmail || '').trim().toLowerCase();

      if (cleanCurrent) {
        return res.status(409).json({
          error: `You are currently logged into an account (${cleanCurrent}). You cannot register or log into another account at the same time. Please log out first.`
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      // Check if email already has an existing account
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
      }

      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Clear any previous codes for this email
      await pool.query('DELETE FROM email_verifications WHERE LOWER(email) = $1', [cleanEmail]);

      // Save code with 15-minute expiration
      await pool.query(`
        INSERT INTO email_verifications (id, email, code, created_at, expires_at)
        VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '15 minutes')
      `, [`vcode-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, cleanEmail, code]);

      console.log(`[Email Verification] Code for ${cleanEmail} (${cleanName}): ${code}`);

      res.json({
        success: true,
        message: `A 6-digit verification code was generated for ${cleanEmail}.`,
        previewCode: code // Provided for seamless in-app preview and testing
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // User Registration with Email Verification (Community Member)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, verificationCode, currentLoggedInEmail } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim() || cleanEmail.split('@')[0];
      const cleanPass = (password || '').trim();
      const cleanCode = (verificationCode || '').trim();
      const cleanCurrent = (currentLoggedInEmail || '').trim().toLowerCase();

      if (cleanCurrent) {
        return res.status(409).json({
          error: `An account (${cleanCurrent}) is already logged in on this session. You cannot create or sign into another account at the same time. Please log out first.`
        });
      }

      if (!cleanEmail || !cleanPass) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      if (!cleanCode) {
        return res.status(400).json({ error: 'Please enter the 6-digit verification code sent to your email.' });
      }

      // Check if user already exists
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      // Verify the 6-digit email code
      const vRes = await pool.query(`
        SELECT * FROM email_verifications
        WHERE LOWER(email) = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [cleanEmail]);

      if (vRes.rows.length === 0) {
        return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
      }

      const vRecord = vRes.rows[0];
      const now = new Date();
      if (new Date(vRecord.expires_at) < now) {
        return res.status(400).json({ error: 'The verification code has expired. Please request a new code.' });
      }

      if (vRecord.code !== cleanCode) {
        return res.status(400).json({ error: 'Invalid verification code. Please check the code and try again.' });
      }

      // Delete the used verification code
      await pool.query('DELETE FROM email_verifications WHERE LOWER(email) = $1', [cleanEmail]);

      const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`;
      const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const insertRes = await pool.query(`
        INSERT INTO users (id, name, email, password, role, status, avatar, joined_date, threads_count, email_verified)
        VALUES ($1, $2, $3, $4, 'User', 'active', $5, $6, 0, true)
        RETURNING id, name, email, role, status, avatar, joined_date, threads_count, email_verified
      `, [id, cleanName, cleanEmail, cleanPass, avatar, joinedDate]);

      // Activity log
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Joined Community', $2, 'User Registration', 'Just now', 'user')
      `, [`act-${Date.now()}`, cleanName]);

      res.status(201).json({
        success: true,
        user: insertRes.rows[0]
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Authentication (Handles Admin & Community Members)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, currentLoggedInEmail } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();
      const cleanCurrent = (currentLoggedInEmail || '').trim().toLowerCase();

      // If an account is already logged in on this browser and differs from the target login
      if (cleanCurrent && cleanCurrent !== cleanEmail) {
        return res.status(409).json({
          error: `An account (${cleanCurrent}) is already active. You cannot log into another account at the same time. Please sign out first.`
        });
      }

      const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);

      if (userRes.rows.length === 0) {
        // Fallback check for initial admin bootstrap
        if (cleanEmail === 'admin@amacommunity.io' && cleanPass === 'admin123') {
          return res.json({
            success: true,
            user: {
              id: 'usr-admin',
              name: 'Administrator',
              email: cleanEmail,
              role: 'Super Admin',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
            }
          });
        }
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = userRes.rows[0];
      if (user.password !== cleanPass) {
        return res.status(401).json({ error: 'Invalid password. Access denied.' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'This account is suspended.' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Newsletter Subscription
  app.get('/api/newsletter', async (_req, res) => {
    try {
      const result = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/newsletter', async (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      const id = `sub-${Date.now()}`;
      await pool.query(`
        INSERT INTO newsletter_subscribers (id, email)
        VALUES ($1, $2)
        ON CONFLICT (email) DO NOTHING
      `, [id, cleanEmail]);

      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Subscribed to Newsletter', $2, 'Weekly Blueprint Digest', 'Just now', 'newsletter')
      `, [`act-${Date.now()}`, cleanEmail]);

      res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter!' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // FAQ Categories & FAQs
  app.get('/api/support/faqs', async (req, res) => {
    try {
      const q = ((req.query.q as string) || '').trim().toLowerCase();
      const categoryId = (req.query.category as string) || '';
      const lang = (req.query.lang as string) || 'en';

      let catQuery = 'SELECT * FROM faq_categories ORDER BY name ASC';
      const catRes = await pool.query(catQuery);

      let faqsQuery = `
        SELECT f.id, f.category_id as "categoryId", f.question, f.answer, f.question_bn as "questionBn", f.answer_bn as "answerBn", f.status, c.name as "categoryName"
        FROM faqs f
        LEFT JOIN faq_categories c ON f.category_id = c.id
        WHERE f.status = 'published'
      `;
      const queryParams: any[] = [];

      if (categoryId && categoryId !== 'all') {
        queryParams.push(categoryId);
        faqsQuery += ` AND f.category_id = $${queryParams.length}`;
      }

      if (q) {
        queryParams.push(`%${q}%`);
        const pIdx = queryParams.length;
        faqsQuery += ` AND (LOWER(f.question) LIKE $${pIdx} OR LOWER(f.answer) LIKE $${pIdx} OR LOWER(COALESCE(f.question_bn, '')) LIKE $${pIdx} OR LOWER(COALESCE(f.answer_bn, '')) LIKE $${pIdx})`;
      }

      faqsQuery += ' ORDER BY f.created_at ASC';
      const faqsRes = await pool.query(faqsQuery, queryParams);

      res.json({
        categories: catRes.rows,
        faqs: faqsRes.rows
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Knowledge Documents (RAG)
  app.get('/api/support/knowledge', async (req, res) => {
    try {
      const q = ((req.query.q as string) || '').trim().toLowerCase();
      let query = "SELECT id, title, content, category, status FROM knowledge_documents WHERE status = 'published'";
      const params: any[] = [];
      if (q) {
        params.push(`%${q}%`);
        query += ` AND (LOWER(title) LIKE $1 OR LOWER(content) LIKE $1)`;
      }
      query += ' ORDER BY created_at ASC';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Tickets: List
  app.get('/api/support/tickets', async (req, res) => {
    try {
      const sessionId = (req.query.sessionId as string) || '';
      const userEmail = (req.query.email as string) || '';

      let query = `
        SELECT id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", user_whatsapp as "userWhatsapp", session_id as "sessionId",
               subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo",
               created_at as "createdAt", answered_at as "answeredAt"
        FROM support_tickets
      `;
      const params: any[] = [];

      if (userEmail || sessionId) {
        if (userEmail && sessionId) {
          params.push(userEmail, sessionId);
          query += ' WHERE LOWER(user_email) = LOWER($1) OR session_id = $2';
        } else if (userEmail) {
          params.push(userEmail);
          query += ' WHERE LOWER(user_email) = LOWER($1)';
        } else {
          params.push(sessionId);
          query += ' WHERE session_id = $1';
        }
      }

      query += ' ORDER BY created_at DESC LIMIT 50';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Helper function to create support tickets with persistence and audit logging
  async function createSupportTicket({
    userEmail,
    userWhatsapp,
    subject,
    question,
    priority = 'Normal',
    sessionId = 'default-session',
    userId,
    source = 'Manual'
  }: {
    userEmail?: string;
    userWhatsapp?: string;
    subject?: string;
    question: string;
    priority?: string;
    sessionId?: string;
    userId?: string;
    source?: 'Manual' | 'AI_Auto';
  }) {
    const ticketNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `tkt-${Date.now()}`;
    const cleanEmail = (userEmail || '').trim() || 'guest@amacommunity.io';
    const cleanWhatsapp = (userWhatsapp || '').trim() || null;
    const cleanSubj = (subject || '').trim() || (question.trim().slice(0, 60) + '...');
    const cleanPriority = priority || 'Normal';
    const cleanSession = sessionId || 'default-session';

    const insertRes = await pool.query(`
      INSERT INTO support_tickets (id, ticket_number, user_id, user_email, user_whatsapp, session_id, subject, question, priority, status, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'OPEN', 'Community Support Specialist')
      RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", user_whatsapp as "userWhatsapp", session_id as "sessionId",
                subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo", created_at as "createdAt"
    `, [id, ticketNum, userId || null, cleanEmail, cleanWhatsapp, cleanSession, cleanSubj, question.trim(), cleanPriority]);

    const createdTicket = insertRes.rows[0];

    // Activity log
    try {
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, $2, $3, $4, 'Just now', 'support')
      `, [`act-${Date.now()}`, source === 'AI_Auto' ? 'AI Auto-Raised Support Ticket' : 'Opened Support Ticket', cleanEmail, `#${ticketNum}`]);
    } catch (logErr) {
      console.warn('Failed to log ticket creation activity:', logErr);
    }

    return createdTicket;
  }

  // Support Tickets: Create
  app.post('/api/support/tickets', async (req, res) => {
    try {
      const { userEmail, userWhatsapp, subject, question, priority, sessionId, userId } = req.body;
      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question content is required to create a ticket.' });
      }

      const ticket = await createSupportTicket({
        userEmail,
        userWhatsapp,
        subject,
        question,
        priority,
        sessionId,
        userId,
        source: 'Manual'
      });

      res.status(201).json(ticket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Helper to maintain unified conversations table
  async function upsertConversation({
    sessionId,
    userId,
    userEmail,
    userWhatsapp
  }: {
    sessionId: string;
    userId?: string | null;
    userEmail?: string | null;
    userWhatsapp?: string | null;
  }) {
    const cleanSession = (sessionId || 'default').trim();
    const convId = `conv_${cleanSession}`;
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : null;
    const cleanUserId = userId ? userId.trim() : null;
    const cleanWhatsapp = userWhatsapp ? userWhatsapp.trim() : null;

    try {
      await pool.query(`
        INSERT INTO conversations (id, session_id, user_id, user_email, user_whatsapp, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET 
          updated_at = NOW(),
          user_id = COALESCE(EXCLUDED.user_id, conversations.user_id),
          user_email = COALESCE(EXCLUDED.user_email, conversations.user_email),
          user_whatsapp = COALESCE(EXCLUDED.user_whatsapp, conversations.user_whatsapp)
      `, [convId, cleanSession, cleanUserId, cleanEmail, cleanWhatsapp]);
    } catch (err) {
      console.error('[Database] Failed to upsert conversation:', err);
    }
  }

  // Update conversation contact details (e.g. WhatsApp, Email)
  app.post('/api/support/conversation/contact', async (req, res) => {
    try {
      const { sessionId, userWhatsapp, userEmail, userId } = req.body;
      const cleanSession = (sessionId || '').trim();
      if (!cleanSession) {
        return res.status(400).json({ error: 'Session ID is required.' });
      }
      const cleanEmail = (userEmail || '').trim().toLowerCase() || null;
      const cleanUserId = (userId || '').trim() || null;
      const cleanWhatsapp = (userWhatsapp || '').trim() || null;

      await upsertConversation({
        sessionId: cleanSession,
        userId: cleanUserId,
        userEmail: cleanEmail,
        userWhatsapp: cleanWhatsapp
      });

      if (cleanEmail && cleanWhatsapp) {
        await pool.query('UPDATE users SET whatsapp = $1 WHERE LOWER(email) = $2', [cleanWhatsapp, cleanEmail]);
      }

      res.json({ success: true, message: 'Contact details saved to conversation record.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Chat Messages: List (Loaded for Authenticated Users or Migrated Sessions)
  app.get('/api/support/messages', async (req, res) => {
    try {
      const sessionId = (req.query.sessionId as string) || 'default';
      const userEmail = ((req.query.userEmail as string) || (req.query.email as string) || (req.headers['x-user-email'] as string) || '').trim().toLowerCase();
      const userId = ((req.query.userId as string) || (req.headers['x-user-id'] as string) || '').trim();

      let result;
      if (userEmail || userId) {
        if (userEmail && userId) {
          result = await pool.query(`
            SELECT id, session_id as "sessionId", conversation_id as "conversationId", sender, message, source, created_at as "createdAt", user_email as "userEmail", user_id as "userId"
            FROM support_messages
            WHERE LOWER(user_email) = $1 OR user_id = $2
            ORDER BY created_at ASC
          `, [userEmail, userId]);
        } else if (userEmail) {
          result = await pool.query(`
            SELECT id, session_id as "sessionId", conversation_id as "conversationId", sender, message, source, created_at as "createdAt", user_email as "userEmail", user_id as "userId"
            FROM support_messages
            WHERE LOWER(user_email) = $1
            ORDER BY created_at ASC
          `, [userEmail]);
        } else {
          result = await pool.query(`
            SELECT id, session_id as "sessionId", conversation_id as "conversationId", sender, message, source, created_at as "createdAt", user_email as "userEmail", user_id as "userId"
            FROM support_messages
            WHERE user_id = $1
            ORDER BY created_at ASC
          `, [userId]);
        }
      } else {
        result = await pool.query(`
          SELECT id, session_id as "sessionId", conversation_id as "conversationId", sender, message, source, created_at as "createdAt"
          FROM support_messages
          WHERE session_id = $1 AND (user_email IS NULL OR user_email = '')
          ORDER BY created_at ASC
        `, [sessionId]);
      }
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Chat Messages: Sync Guest Conversation when User Creates an Account
  app.post('/api/support/sync-conversation', async (req, res) => {
    try {
      const { sessionId, userEmail, userId, userWhatsapp, messages } = req.body;
      const cleanEmail = ((userEmail as string) || (req.headers['x-user-email'] as string) || '').trim().toLowerCase();
      const cleanUserId = ((userId as string) || (req.headers['x-user-id'] as string) || '').trim() || null;
      const cleanWhatsapp = ((userWhatsapp as string) || '').trim() || null;
      const cleanSession = sessionId || 'default';
      const convId = `conv_${cleanSession}`;

      if (!cleanEmail) {
        return res.status(400).json({ error: 'User email is required to sync conversation.' });
      }

      // Upsert conversation metadata
      await upsertConversation({
        sessionId: cleanSession,
        userId: cleanUserId,
        userEmail: cleanEmail,
        userWhatsapp: cleanWhatsapp
      });

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.json({ success: true, syncedCount: 0, message: 'No messages to sync.' });
      }

      let syncedCount = 0;
      for (const msg of messages) {
        const text = (msg.text || msg.message || '').trim();
        if (!text) continue;
        const sender = msg.sender === 'bot' ? 'bot' : 'user';
        const source = msg.source || (sender === 'bot' ? 'AI' : 'USER');
        const id = (msg.id && typeof msg.id === 'string' && msg.id.startsWith('msg-'))
          ? msg.id
          : `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const createdAt = msg.createdAt ? new Date(msg.createdAt) : new Date();

        // Check if already stored for this exact user
        const dupCheck = await pool.query(
          `SELECT id FROM support_messages WHERE id = $1 OR (LOWER(user_email) = $2 AND sender = $3 AND message = $4)`,
          [id, cleanEmail, sender, text]
        );

        if (dupCheck.rows.length === 0) {
          await pool.query(`
            INSERT INTO support_messages (id, session_id, conversation_id, user_email, user_id, sender, message, source, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [id, cleanSession, convId, cleanEmail, cleanUserId, sender, text, source, createdAt]);
          syncedCount++;
        } else {
          await pool.query(`
            UPDATE support_messages 
            SET user_email = $1, user_id = COALESCE($2, user_id), conversation_id = COALESCE(conversation_id, $3)
            WHERE id = $4 AND (user_email IS NULL OR user_email = '')
          `, [cleanEmail, cleanUserId, convId, dupCheck.rows[0].id]);
        }
      }

      res.json({
        success: true,
        syncedCount,
        message: `Successfully saved ${syncedCount} message(s) to the database for ${cleanEmail}.`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Chat Messages: Send & AI Response (RAG + Gemini / Knowledge Base)
  app.post('/api/support/messages', async (req, res) => {
    try {
      const { sessionId, message, language, guestMessageCount } = req.body;
      const cleanSession = sessionId || 'default';
      const cleanMsg = (message || '').trim();
      const userLang = language === 'bn' ? 'bn' : 'en';
      const cleanEmail = ((req.body.userEmail as string) || (req.headers['x-user-email'] as string) || '').trim().toLowerCase() || null;
      const cleanUserId = ((req.body.userId as string) || (req.headers['x-user-id'] as string) || '').trim() || null;
      const cleanWhatsapp = ((req.body.userWhatsapp as string) || '').trim() || null;
      const isGuest = !cleanEmail;
      const convId = `conv_${cleanSession}`;

      if (!cleanMsg) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      // Guest message preview limit check (allow up to 3 guest messages before requiring account)
      if (isGuest && typeof guestMessageCount === 'number' && guestMessageCount >= 3) {
        return res.status(403).json({
          error: 'Free conversation preview limit reached. Please sign in or create an account to continue.',
          requiresAuth: true
        });
      }

      // If authenticated or whatsapp provided, ensure conversation entry exists and update timestamp
      if (!isGuest || cleanWhatsapp) {
        await upsertConversation({
          sessionId: cleanSession,
          userId: cleanUserId,
          userEmail: cleanEmail,
          userWhatsapp: cleanWhatsapp
        });
      }

      // 1. If authenticated user, save user message to DB. If GUEST, do NOT save to database!
      const userMsgId = `msg-${Date.now()}-u`;
      const dbSavePromise = !isGuest
        ? pool.query(`
            INSERT INTO support_messages (id, session_id, conversation_id, user_email, user_id, sender, message, source, created_at)
            VALUES ($1, $2, $3, $4, $5, 'user', $6, 'USER', NOW())
          `, [userMsgId, cleanSession, convId, cleanEmail, cleanUserId, cleanMsg])
        : Promise.resolve(null);

      const [, { faqsData, docsData, topicsData, settingsData }] = await Promise.all([
        dbSavePromise,
        getRagData()
      ]);

      const platformSettings = settingsData.rows[0]?.value || {};
      const supportEmail = platformSettings.primarySupportEmail || 'contact@trekconsultancy.com';
      const forumName = platformSettings.forumName || 'Trek Consultancy';
      const slaHours = platformSettings.slaHours || 48;
      const phone = platformSettings.phone || '+966 55 363 8960';
      const whatsapp = platformSettings.whatsapp || '+966 50 241 1744';

      let ragContext = `============================================================\n`;
      ragContext += `TREK CONSULTANCY KNOWLEDGE BASE, SERVICE PILLARS & OFFICIAL CONTEXT:\n`;
      ragContext += `============================================================\n\n`;
      
      ragContext += `BUSINESS IDENTITY & GLOBAL PROFILE:\n`;
      ragContext += `- Firm Name: ${forumName} (Trek Consultancy)\n`;
      ragContext += `- Core Purpose: Helps foreign investors and international companies set up and grow businesses in Saudi Arabia with confidence under Vision 2030.\n`;
      ragContext += `- Global Offices: Saudi Arabia (Riyadh, Madinah — Jeddah upcoming), USA (Montana), Bangladesh (Dhaka).\n`;
      ragContext += `- Official Contact Channels:\n`;
      ragContext += `  * WhatsApp: ${whatsapp} (Direct: ${buildWhatsAppLink(whatsapp)})\n`;
      ragContext += `  * Telephone Call: ${phone}\n`;
      ragContext += `  * Official Email: ${supportEmail}\n`;
      ragContext += `  * Free Consultation: Book a session with one of our advisors — response guaranteed within ${slaHours} hours.\n`;
      ragContext += `- Brand Tenets & Tone: Professional, reassurance-oriented ("with Confidence", "trusted partner", "all services under one roof"), speaks directly to foreign investors, uses Islamic greeting conventions ("Assalamu Alaikum").\n\n`;

      ragContext += `THE 6 SERVICE PILLARS (ALL UNDER ONE ROOF):\n`;
      ragContext += `1. Saudi Business Setup: MISA Foreign Investment License, 100% Foreign-Owned Company Formation, Commercial Registration (CR), Business Bank Account, ZATCA Registration, GOSI Registration, Saudi National Address (SPL), Business Documentation, Government Portal Activation (Qiwa, Muqeem, Balady), Business Compliance Support, Office Space Assistance, Turnkey Business Consultation.\n`;
      ragContext += `2. Software & Digital Solutions: Custom Software Development, ERP Development, Website Development, Mobile App Development, AI Automation, Technical Documentation, Digital Marketing, SEO, Graphics Design, Video Editing.\n`;
      ragContext += `3. Visa & PRO Services: Investor Visa, Work Permit Processing, Iqama Services, Muqeem Services, Qiwa Services, Chamber Services, Document Attestation, Saudi PRO Services, Employee File Processing.\n`;
      ragContext += `4. Real Estate Investment: Property Buying Support, Property Leasing, Commercial Real Estate, Residential Investment, Industrial Property, Foreign Investor Guidance, Property Documentation, Real Estate Consultation.\n`;
      ragContext += `5. Business Support Services: Accounting Services, External Audit, Internal Audit, HR & Payroll, Tax & VAT Services.\n`;
      ragContext += `6. International Business Services: USA/UK/Canada Company Formation, International Bank Account Support, Amazon Seller Account, eBay Seller Setup, Dropshipping Support, Import & Export Support, China Product Sourcing.\n\n`;

      ragContext += `KNOWN PUBLISHED FAQS & VERIFIED POLICIES:\n`;
      ragContext += `• MISA License basics: Ministry of Investment license allowing up to 100% foreign ownership in services, trading, industrial, consulting, and real estate.\n`;
      ragContext += `• How foreigners open a company: MISA license -> Articles of Association (AOA) -> CR -> Chamber & National Address -> ZATCA & GOSI -> Qiwa & Muqeem -> Corporate Bank Account.\n`;
      ragContext += `• Setup timeline: Typically completed within 2 to 4 weeks end-to-end with pre-attested documents.\n`;
      ragContext += `• Required documents: Parent company CR/Certificate of Incorporation, audited financial statements (past 1-2 years), Board Resolution approving Saudi entity & appointing GM, Power of Attorney (POA) for Trek, and GM passport copy (attested by Saudi Embassy or apostilled).\n`;
      ragContext += `• Foreign property ownership rules: MISA licensed companies can own commercial, industrial, and administrative real estate. Individuals with Premium Residency or approved investor status can buy residential and commercial properties in designated zones.\n`;
      ragContext += `• End-to-end turnkey capability: Trek handles everything "under one roof"—legal licensing, CR, tax, government portals, office space, corporate bank account, and employee visas/PRO.\n`;
      ragContext += `• Software development capability: Dedicated in-house team building custom software, ERPs, mobile apps, modern web platforms, and AI automation.\n`;
      ragContext += `• PRO services list: Investor visas, work permits, Iqama issuance/renewals, Muqeem exit/re-entry, Qiwa contracts, and Chamber/MOFA attestations.\n`;
      ragContext += `• International formation: USA LLCs (Delaware, Wyoming, Montana), UK Ltd, Canada, global bank accounts (Mercury, Wise), and Amazon/eBay seller setup.\n`;
      ragContext += `• Why choose Trek: Global presence in Riyadh, Madinah, Montana, and Dhaka; true all-in-one ecosystem under one roof; dedicated advisors; responsive communication.\n\n`;

      ragContext += `KNOWLEDGE DOCUMENTS (DETAILED REPOSITORY):\n`;
      if (docsData.rows.length === 0) {
        ragContext += `(No custom documents uploaded yet)\n`;
      } else {
        docsData.rows.forEach((d, idx) => {
          ragContext += `--- [Chunk #${idx + 1}: ${d.title} | Category: ${d.category || 'General'}] ---\n${d.content}\n\n`;
        });
      }

      ragContext += `FREQUENTLY ASKED QUESTIONS (FAQS & ANSWERS FROM DB):\n`;
      faqsData.rows.forEach(f => {
        ragContext += `[Category: ${f.category}]\n- Question (EN): ${f.question}\n  Answer (EN): ${f.answer}\n`;
        if (f.question_bn || f.answer_bn) {
          ragContext += `  Question (BN): ${f.question_bn || ''}\n  Answer (BN): ${f.answer_bn || ''}\n`;
        }
      });

      ragContext += `\nRECENT COMMUNITY INQUIRIES & DISCUSSIONS:\n`;
      topicsData.rows.forEach(t => {
        ragContext += `- Discussion: "${t.title}" (Category: ${t.category}, Author: ${t.author}, Views: ${t.views}, Replies: ${t.replies})\n`;
      });
      ragContext += `============================================================\n`;

      let botReply = '';
      let replySource = 'AI';
      let createdTicket: any = null;
      let botSuggestedActions: string[] = [];

      // Extract recent conversation history for multi-turn conversational context & continuity
      const rawHistory = Array.isArray(req.body.recentHistory) && req.body.recentHistory.length > 0
        ? req.body.recentHistory.slice(-6)
        : [];

      const pipelineSettings: PipelineSettings = {
        supportEmail,
        forumName,
        slaHours: typeof slaHours === 'number' ? slaHours : 48,
        phone,
        whatsapp,
        activeAiModel: platformSettings.activeAiModel || 'gemini-2.5-flash',
        aiProvider: platformSettings.aiProvider || 'auto',
        aiTemperature: typeof platformSettings.aiTemperature === 'number' ? platformSettings.aiTemperature : 0.2
      };

      const lower = cleanMsg.toLowerCase().trim();

      // ---------------------------------------------------------------------
      // Pre-pipeline Stage: Conversational Intents & Pleasantries
      // ---------------------------------------------------------------------
      const isHowAreYou = /\b(how\s*(are|r)\s*(you|u|things|life)|how\s*do\s*you\s*do|how'?s\s*(it\s*going|everything|your\s*day)|are\s*you\s*(ok|okay|fine|good|well)|how\s*have\s*you\s*been|whats?\s*up|sup)\b/i.test(lower) ||
        ['কেমন আছেন', 'কেমন আছো', 'কি অবস্থা', 'কি খবর', 'কেমন চলছে', 'ভালো আছেন'].some(phrase => lower.includes(phrase));

      const isWhoAreYou = /\b(who\s*are\s*you|what\s*are\s*you|what\s*is\s*your\s*name|what'?s\s*your\s*name|are\s*you\s*(an?\s*)?(ai|bot|robot|human|real)|tell\s*me\s*about\s*yourself|introduce\s*yourself)\b/i.test(lower) ||
        ['আপনি কে', 'আপনার নাম কি', 'তোমার নাম কি', 'তুমি কে', 'পরিচয় দিন'].some(phrase => lower.includes(phrase));

      const isGratitude = /\b(thank\s*you|thanks|thx|thankyou|appreciate\s*it|great\s*job|awesome|good\s*job|helpful|nice\s*one|well\s*done)\b/i.test(lower) ||
        ['ধন্যবাদ', 'অনেক ধন্যবাদ', 'থ্যাংকস', 'অসাধারণ'].some(phrase => lower.includes(phrase));

      const isUserFine = /\b(i('?m| am)?\s*(good|fine|doing\s*well|great|okay|ok|alright)|doing\s*(good|fine|well))\b/i.test(lower) ||
        ['ভালো আছি', 'সব ঠিক আছে', 'আলহামদুলিল্লাহ'].some(phrase => lower.includes(phrase));

      const isGreeting = (
        /\b(hi|hello|hey|greetings|hola|assalamu\s*alaikum|salam|good\s*(morning|afternoon|evening|day)|howdy|yo)\b/i.test(lower) ||
        ['হ্যালো', 'হাই', 'সালাম', 'নমস্কার', 'শুভ সকাল', 'শুভ সন্ধ্যা'].some(g => lower.includes(g))
      ) && (lower.split(/\s+/).length <= 4 || /^(hi|hello|hey|salam|assalamu\s*alaikum)[\s,!.]*$/i.test(lower));

      if (isHowAreYou) {
        botReply = userLang === 'bn'
          ? `ওয়ালাইকুম আসসালাম! আমি খুব ভালো আছি, আন্তরিকভাবে জিজ্ঞাসা করার জন্য অনেক ধন্যবাদ! 😊\n\n**ট্রেক কনসালটেন্সি (Trek Consultancy)**-তে আপনাকে স্বাগতম। আমরা বিদেশি বিনিয়োগকারী ও আন্তর্জাতিক কোম্পানিগুলোকে সৌদি আরবে শতভাগ মালিকানায় কোম্পানি গঠন (MISA লাইসেন্স), ভিসা/প্রো সার্ভিস এবং আধুনিক সফটওয়্যার ডেভেলপমেন্টে পূর্ণ আস্থা ও নিশ্চয়তার সাথে সহায়তা করি।\n\nআজ আপনার সৌদি ব্যবসা বা বিনিয়োগ পরিকল্পনায় কীভাবে সহায়তা করতে পারি?`
          : `Assalamu Alaikum! I'm doing very well, thank you for asking! 😊\n\nWelcome to **Trek Consultancy**. We help foreign investors and international companies set up and scale their businesses in Saudi Arabia with complete confidence under Vision 2030—providing MISA licensing, turnkey company formation, PRO/visa processing, and software solutions all under one roof.\n\nHow can we assist your business expansion plans today?`;
        replySource = 'AI';
        botSuggestedActions = userLang === 'bn'
          ? ['সৌদি কোম্পানি গঠন', 'MISA লাইসেন্স তথ্য', 'সফটওয়্যার ও ERP সল্যুশন', 'ফ্রি কনসালটেন্সি বুকিং']
          : ['Saudi Business Setup', 'MISA License Details', 'Software & ERP Solutions', 'Book Free Consultation'];
      } else if (isWhoAreYou) {
        botReply = userLang === 'bn'
          ? `আমি **ট্রেক কনসালটেন্সি (Trek Consultancy)**-র অফিশিয়াল এআই অ্যাডভাইজরি স্পেশালিস্ট! 🏢✨\n\nআমাদের মূল লক্ষ্য হলো বিদেশি উদ্যোক্তা ও কোম্পানিগুলোকে সৌদি আরবে ব্যবসা স্থাপন ও সম্প্রসারণে এক ছাতার নিচে (under one roof) সম্পূর্ণ সমাধান দেওয়া।\n\n**আমাদের বৈশ্বিক অফিসসমূহ:**\n- **সৌদি আরব**: রিয়াদ ও মদিনা (জেদ্দায় শীঘ্রই চালু হচ্ছে)\n- **যুক্তরাষ্ট্র (USA)**: মন্টানা\n- **বাংলাদেশ**: ঢাকা\n\n**আমাদের ৬টি প্রধান সেবা স্তম্ভ:**\n1. **সৌদি বিজনেস সেটআপ**: MISA ফরেন ইনভেস্টমেন্ট লাইসেন্স (১০০% বিদেশি মালিকানা), কমার্শিয়াল রেজিস্ট্রেশন (CR), এবং করপোরেট ব্যাংক অ্যাকাউন্ট।\n2. **সফটওয়্যার ও ডিজিটাল সল্যুশন**: কাস্টম সফটওয়্যার, ইআরপি (ERP), মোবাইল অ্যাপ, এবং এআই অটোমেশন।\n3. **ভিসা ও প্রো (PRO) সার্ভিসেস**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, ইকামাহ, কিওয়া ও মুকিম পোর্টাল পরিচালনা।\n4. **রিয়েল এস্টেট ইনভেস্টমেন্ট**: বাণিজ্যিক প্রপার্টি লিজিং, ক্রয় এবং বিদেশি বিনিয়োগকারী গাইডেন্স।\n5. **হিসাব ও ট্যাক্স (ZATCA)**: ভ্যাট ও ট্যাক্স কমপ্লায়েন্স, অডিট ও পে-রোল।\n6. **আন্তর্জাতিক কোম্পানি গঠন**: ইউএসএ এলএলসি (USA LLC), ইউকে লিমিটেড ও গ্লোবাল ব্যাংকিং।\n\nআজ আপনার প্রজেক্ট বা ব্যবসার জন্য কী ধরনের তথ্য বা পরামর্শ প্রয়োজন?`
          : `I am the official AI Advisory Specialist for **Trek Consultancy**! 🏢✨\n\nTrek Consultancy is the premier international consulting firm helping foreign investors and global companies set up and grow businesses in Saudi Arabia with complete confidence under Vision 2030.\n\n**Our Global Presence:**\n- **Saudi Arabia**: Riyadh & Madinah (Jeddah upcoming)\n- **United States**: Montana\n- **Bangladesh**: Dhaka\n\n**Our 6 Core Service Pillars (All Under One Roof):**\n1. **Saudi Business Setup**: MISA Foreign Investment Licenses (up to 100% foreign ownership), Commercial Registration (CR), and Corporate Bank Accounts.\n2. **Software & Digital Solutions**: In-house Custom Software, ERP development, Mobile Apps, and AI Automation.\n3. **Visa & PRO Services**: Investor Visas, Work Permits, Iqama issuance/renewals, Qiwa & Muqeem management.\n4. **Real Estate Investment**: Commercial real estate, office leasing, and foreign investor acquisition.\n5. **Business Support & Tax**: ZATCA VAT compliance, accounting, and payroll.\n6. **International Expansion**: USA LLCs (Delaware/Wyoming/Montana), UK Ltd, and global banking.\n\nHow can we support your business setup or expansion today?`;
        replySource = 'AI';
        botSuggestedActions = userLang === 'bn'
          ? ['সৌদি সেটআপ রোডম্যাপ', 'প্রয়োজনীয় ডকুমেন্টস', 'হোয়াটসঅ্যাপে যোগাযোগ', 'ফ্রি কনসালটেন্সি বুকিং']
          : ['Saudi Setup Roadmap', 'Required Documents', 'WhatsApp Contact', 'Free Consultation'];
      } else if (isGratitude) {
        botReply = userLang === 'bn'
          ? `আপনাকে অনেক স্বাগতম! 😊 **ট্রেক কনসালটেন্সি**-তে আপনার সহায়তা করতে পেরে আমরা আনন্দিত। সৌদি আরবে আপনার ব্যবসার সাফল্যই আমাদের অঙ্গীকার। আর কোনো প্রশ্ন থাকলে নির্দ্বিধায় জানান, অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে (${whatsapp}) যোগাযোগ করতে পারেন!`
          : `You are very welcome! 😊 It is our pleasure to assist you at **Trek Consultancy**. We are committed to making your business expansion into Saudi Arabia seamless and secure. Feel free to ask any further questions, or reach out anytime via WhatsApp at **${whatsapp}**!`;
        replySource = 'AI';
        botSuggestedActions = userLang === 'bn'
          ? ['অন্য প্রশ্ন জিজ্ঞাসা করুন', 'হোয়াটসঅ্যাপে মেসেজ', 'ফ্রি কনসালটেন্সি']
          : ['Ask Another Question', 'Chat on WhatsApp', 'Book Free Consultation'];
      } else if (isUserFine) {
        botReply = userLang === 'bn'
          ? `আলহামদুলিল্লাহ, জেনে খুব ভালো লাগল! 😊 আজ আপনার সৌদি ব্যবসায়িক উদ্যোগের জন্য কী সহায়তা করতে পারি? MISA লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন, প্রপার্টি ইনভেস্টমেন্ট কিংবা সফটওয়্যার সমাধান সম্পর্কে যেকোনো প্রশ্ন করতে পারেন!`
          : `Delighted to hear that, Alhamdulillah! 😊 How can Trek Consultancy assist your business aspirations today? Feel free to ask about MISA investment licenses, Saudi company formation, software solutions, or visa processing!`;
        replySource = 'AI';
        botSuggestedActions = userLang === 'bn'
          ? ['সৌদি কোম্পানি গঠন', 'MISA লাইসেন্স', 'সফটওয়্যার সল্যুশন', 'ভিসা ও প্রো সার্ভিস']
          : ['Saudi Company Setup', 'MISA License Details', 'Software Solutions', 'PRO & Visa Services'];
      } else if (isGreeting) {
        botReply = userLang === 'bn'
          ? `আসসালামু আলাইকুম! **ট্রেক কনসালটেন্সি (Trek Consultancy)**-তে আপনাকে স্বাগতম। 🇸🇦✨\n\nআমরা সৌদি ভিশন ২০৩০-এর অধীনে বিদেশি বিনিয়োগকারী এবং আন্তর্জাতিক কোম্পানিগুলোকে সম্পূর্ণ আস্থা ও নিরাপত্তার সাথে সৌদি আরবে ব্যবসা স্থাপন, MISA লাইসেন্স, ব্যাংক অ্যাকাউন্ট, ভিসা/প্রো সার্ভিস এবং আধুনিক সফটওয়্যার সল্যুশন প্রদান করি।\n\nআমাদের অফিস রয়েছে **রিয়াদ, মদিনা, মন্টানা (USA) এবং ঢাকা (বাংলাদেশ)**-এ। আজ আপনার ব্যবসায়িক উদ্যোগ বা বিনিয়োগে কীভাবে সহায়তা করতে পারি?`
          : `Assalamu Alaikum and welcome to **Trek Consultancy**! 🇸🇦✨\n\nWe are your trusted partner helping foreign investors and international companies set up, launch, and scale businesses in Saudi Arabia with complete confidence under Vision 2030.\n\nWith physical offices in **Riyadh, Madinah, Montana (USA), and Dhaka (Bangladesh)**, we deliver end-to-end MISA licensing, CR formation, corporate banking, government PRO, and custom software engineering—all under one roof.\n\nHow may we assist your Saudi expansion or business setup today?`;
        replySource = 'AI';
        botSuggestedActions = userLang === 'bn'
          ? ['কীভাবে কোম্পানি খুলব?', 'MISA লাইসেন্স সুবিধা', 'প্রয়োজনীয় ডকুমেন্টস', 'ফ্রি কনসালটেন্সি বুকিং']
          : ['How to Set Up in Saudi', 'MISA License Benefits', 'Required Documents', 'Book Free Consultation'];
      }
      // Note: previously there was a keyword shortcut here that force-escalated any message
      // containing words like "quote" or "proposal" straight to a support ticket, before the
      // assistant had a chance to actually answer. Removed — genuine quote/consultation
      // requests now flow through the normal pipeline (Stages 1-3 answer what they can from
      // the KB) and only escalate via Stage 2's own grounded judgment or the narrower
      // Stage 4 fallback below, so simple questions get a real answer instead of a ticket.

      // ---------------------------------------------------------------------
      // 5-STAGE SUPPORT PIPELINE (REUSED FUNNEL ARCHITECTURE)
      // ---------------------------------------------------------------------

      // Stage 1: Direct KB match (Instant, deterministic answers for exact lookups)
      if (!botReply) {
        const stage1 = matchDirectKB(cleanMsg, userLang, pipelineSettings);
        if (stage1) {
          botReply = stage1.reply;
          replySource = stage1.source;
          botSuggestedActions = stage1.suggestedActions;
        }
      }

      // Stage 1b: Fuzzy FAQ match (Catches paraphrased versions of published FAQs via stemming & synonym dictionary)
      if (!botReply) {
        const stage1b = matchFuzzyFAQ(cleanMsg, userLang, faqsData.rows, docsData.rows);
        if (stage1b) {
          botReply = stage1b.reply;
          replySource = stage1b.source;
          botSuggestedActions = stage1b.suggestedActions;
        }
      }

      // Stage 2: Grounded LLM generation (Handles composite/exploratory questions using RAG context)
      if (!botReply) {
        const stage2 = await generateGroundedLLM(
          cleanMsg,
          userLang,
          ragContext,
          rawHistory,
          cleanEmail,
          cleanUserId,
          cleanSession,
          pipelineSettings,
          createSupportTicket
        );
        if (stage2) {
          botReply = stage2.reply;
          replySource = stage2.source;
          botSuggestedActions = stage2.suggestedActions;
          if (stage2.createdTicket) {
            createdTicket = stage2.createdTicket;
          }
        }
      }

      // Stage 3: Keyword fallback (Canned category answers per pillar if LLM fails or is unavailable)
      if (!botReply) {
        const stage3 = matchKeywordFallback(cleanMsg, userLang, pipelineSettings);
        if (stage3) {
          botReply = stage3.reply;
          replySource = stage3.source;
          botSuggestedActions = stage3.suggestedActions;
        }
      }

      // Stage 4: Human ticket fallback (Auto-creates ticket with 48-hour response promise if consulting query)
      if (!botReply) {
        // Only escalate to a ticket when the user is signaling they need a *custom, human*
        // deliverable (a quote, a proposal, a named advisor, a callback) — not just because
        // their message happens to contain an ordinary on-topic word like "tax" or "bank".
        // Everything else in-scope should already have been answered by Stages 1-3; if it
        // wasn't, the honest move is a helpful on-topic reply (below), not a silent ticket.
        const consultationKeywords = [
          'quote', 'quotation', 'proposal', 'retainer', 'contract review', 'nda',
          'custom pricing', 'custom quote', 'callback', 'call me back', 'call back',
          'named advisor', 'speak with an advisor', 'speak to an advisor', 'consultant callback',
          'case-specific', 'specific case', 'case review'
        ];

        const isConsultingScope = consultationKeywords.some(k => lower.includes(k));

        if (isConsultingScope) {
          const stage4 = await createHumanTicketFallback(
            cleanMsg,
            userLang,
            cleanEmail,
            cleanUserId,
            cleanSession,
            pipelineSettings,
            createSupportTicket
          );
          botReply = stage4.reply;
          replySource = stage4.source;
          botSuggestedActions = stage4.suggestedActions;
          createdTicket = stage4.createdTicket;
        } else {
          // Generic on-topic-or-unclear fallback: we don't actually know this is off-topic —
          // it just didn't match a specific KB entry. Say so honestly and keep the door open,
          // rather than falsely telling the user their question is out of scope.
          botReply = userLang === 'bn'
            ? `আপনার প্রশ্নটি সম্পর্কে সুনির্দিষ্ট তথ্য আমার কাছে মুহূর্তে নেই, তবে ট্রেক কনসালটেন্সি সাধারণত এসব বিষয়ে সহায়তা করে: সৌদি বিজনেস সেটআপ (MISA লাইসেন্স, CR), সফটওয়্যার ও ডিজিটাল সল্যুশন, ভিসা ও প্রো (PRO) সার্ভিস, রিয়েল এস্টেট ইনভেস্টমেন্ট, অ্যাকাউন্টিং/ট্যাক্স, এবং আন্তর্জাতিক কোম্পানি গঠন।\n\nএকটু ভিন্নভাবে প্রশ্নটি করে দেখতে পারেন, অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে (${whatsapp}) যোগাযোগ করলে একজন অ্যাডভাইজর দ্রুত সাহায্য করবেন।`
            : `I don't have a specific answer for that from our knowledge base right now, but Trek Consultancy generally helps with: Saudi business setup (MISA license, CR), software & digital solutions, visa/PRO services, real estate investment, accounting/tax, and international company formation.\n\nFeel free to rephrase your question, or message us directly on WhatsApp (${whatsapp}) and an advisor can help right away.`;
          replySource = 'AI';
          botSuggestedActions = ['Saudi Business Setup', 'MISA License Details', 'Software & ERP Solutions', 'Chat on WhatsApp'];
        }
      }

      // 4. Save bot response to DB ONLY IF user is authenticated. If GUEST, do NOT save to database.
      const botMsgId = `msg-${Date.now()}-b`;
      if (!isGuest) {
        await pool.query(`
          INSERT INTO support_messages (id, session_id, conversation_id, user_email, user_id, sender, message, source, created_at)
          VALUES ($1, $2, $3, $4, $5, 'bot', $6, $7, NOW())
        `, [botMsgId, cleanSession, convId, cleanEmail, cleanUserId, botReply, replySource]);
      }

      res.status(201).json({
        userMessage: { id: userMsgId, sender: 'user', message: cleanMsg, source: 'USER', time: 'Just now' },
        botReply: {
          id: botMsgId,
          sender: 'bot',
          message: botReply,
          source: replySource,
          time: 'Just now',
          suggestedActions: botSuggestedActions.length > 0 ? botSuggestedActions : undefined
        },
        autoTicket: createdTicket || null,
        savedToDb: !isGuest
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Full Tickets List with filters
  app.get('/api/admin/support/tickets', async (req, res) => {
    try {
      const status = (req.query.status as string) || '';
      const priority = (req.query.priority as string) || '';
      const q = ((req.query.q as string) || '').trim().toLowerCase();

      let query = `
        SELECT id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", user_whatsapp as "userWhatsapp", session_id as "sessionId",
               subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo",
               created_at as "createdAt", answered_at as "answeredAt"
        FROM support_tickets
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (status && status !== 'all') {
        params.push(status.toUpperCase());
        query += ` AND status = $${pIdx++}`;
      }
      if (priority && priority !== 'all') {
        params.push(priority);
        query += ` AND priority = $${pIdx++}`;
      }
      if (q) {
        params.push(`%${q}%`);
        query += ` AND (LOWER(subject) LIKE $${pIdx} OR LOWER(question) LIKE $${pIdx} OR LOWER(user_email) LIKE $${pIdx} OR LOWER(ticket_number) LIKE $${pIdx})`;
        pIdx++;
      }

      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Update Ticket (Answer, Status, Assignee)
  app.patch('/api/admin/support/tickets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminAnswer, assignedTo, priority } = req.body;

      const ticketCheck = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);
      if (ticketCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Support ticket not found.' });
      }

      const current = ticketCheck.rows[0];
      const newStatus = status || current.status;
      const newAnswer = adminAnswer !== undefined ? adminAnswer : current.admin_answer;
      const newAssigned = assignedTo !== undefined ? assignedTo : current.assigned_to;
      const newPriority = priority || current.priority;
      const answeredAt = newAnswer ? new Date().toISOString() : current.answered_at;

      const updateRes = await pool.query(`
        UPDATE support_tickets
        SET status = $1, admin_answer = $2, assigned_to = $3, priority = $4, answered_at = $5
        WHERE id = $6
        RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", user_whatsapp as "userWhatsapp", session_id as "sessionId",
                  subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo",
                  created_at as "createdAt", answered_at as "answeredAt"
      `, [newStatus, newAnswer, newAssigned, newPriority, answeredAt, id]);

      // If answered, also append message to the chat session if applicable
      if (adminAnswer && current.session_id) {
        const msgId = `msg-${Date.now()}-admin`;
        await pool.query(`
          INSERT INTO support_messages (id, session_id, sender, message, source)
          VALUES ($1, $2, 'bot', $3, 'STAFF')
        `, [msgId, current.session_id, `[Admin Staff Reply to #${current.ticket_number}]: ${adminAnswer}`]);
      }

      // Log activity
      try {
        await pool.query(`
          INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
          VALUES ($1, $2, $3, $4, 'Just now', 'support')
        `, [`act-${Date.now()}`, 'Updated Support Ticket', newAssigned || 'Admin Staff', `#${current.ticket_number}`]);
      } catch (logErr) {
        console.warn('Failed to log ticket update:', logErr);
      }

      res.json(updateRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Delete Ticket
  app.delete('/api/admin/support/tickets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM support_tickets WHERE id = $1 RETURNING ticket_number', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found.' });
      }
      res.json({ success: true, message: `Ticket #${result.rows[0].ticket_number} deleted.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Create FAQ
  app.post('/api/admin/support/faqs', async (req, res) => {
    try {
      const { categoryId, question, answer, questionBn, answerBn, status, createdBy } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and Answer are required.' });
      }

      const id = `faq-${Date.now()}`;
      const insertRes = await pool.query(`
        INSERT INTO faqs (id, category_id, question, answer, question_bn, answer_bn, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, category_id as "categoryId", question, answer, question_bn as "questionBn", answer_bn as "answerBn", status, created_by as "createdBy", created_at as "createdAt"
      `, [id, categoryId || 'cat-forum', question.trim(), answer.trim(), (questionBn || '').trim(), (answerBn || '').trim(), status || 'published', createdBy || 'Admin Staff']);

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Update FAQ
  app.put('/api/admin/support/faqs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, question, answer, questionBn, answerBn, status } = req.body;

      const updateRes = await pool.query(`
        UPDATE faqs
        SET category_id = COALESCE($1, category_id),
            question = COALESCE($2, question),
            answer = COALESCE($3, answer),
            question_bn = COALESCE($4, question_bn),
            answer_bn = COALESCE($5, answer_bn),
            status = COALESCE($6, status),
            updated_at = NOW()
        WHERE id = $7
        RETURNING id, category_id as "categoryId", question, answer, question_bn as "questionBn", answer_bn as "answerBn", status, updated_at as "updatedAt"
      `, [categoryId, question, answer, questionBn, answerBn, status, id]);

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'FAQ item not found.' });
      }

      res.json(updateRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Delete FAQ
  app.delete('/api/admin/support/faqs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'FAQ item not found.' });
      }
      res.json({ success: true, id: result.rows[0].id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Live Chat Conversations Overview
  app.get('/api/admin/support/conversations', async (_req, res) => {
    try {
      // Query from conversations table joined with support_messages
      const result = await pool.query(`
        SELECT 
          c.id,
          c.session_id as "sessionId",
          COALESCE(c.user_email, MAX(sm.user_email)) as "userEmail",
          COALESCE(c.user_id, MAX(sm.user_id)) as "userId",
          c.user_whatsapp as "userWhatsapp",
          c.created_at as "createdAt",
          c.updated_at as "lastActive",
          COUNT(sm.id) as "messageCount",
          (SELECT message FROM support_messages sm2 WHERE sm2.session_id = c.session_id ORDER BY created_at DESC LIMIT 1) as "lastMessage",
          (SELECT sender FROM support_messages sm3 WHERE sm3.session_id = c.session_id ORDER BY created_at DESC LIMIT 1) as "lastSender"
        FROM conversations c
        LEFT JOIN support_messages sm ON sm.session_id = c.session_id
        GROUP BY c.id, c.session_id, c.user_id, c.user_email, c.user_whatsapp, c.created_at, c.updated_at
        ORDER BY c.updated_at DESC
        LIMIT 50
      `);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Send Staff Reply to live user session
  app.post('/api/admin/support/conversations/:sessionId/reply', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message, staffName } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      // Check if session has user association
      const sessUser = await pool.query(
        `SELECT user_email, user_id FROM support_messages WHERE session_id = $1 AND user_email IS NOT NULL LIMIT 1`,
        [sessionId]
      );
      const userEmail = sessUser.rows[0]?.user_email || null;
      const userId = sessUser.rows[0]?.user_id || null;

      const msgId = `msg-${Date.now()}-staff`;
      const staffSender = staffName || 'Support Specialist';
      const convId = `conv_${sessionId}`;

      const insertRes = await pool.query(`
        INSERT INTO support_messages (id, session_id, conversation_id, user_email, user_id, sender, message, source, created_at)
        VALUES ($1, $2, $3, $4, $5, 'bot', $6, 'STAFF', NOW())
        RETURNING id, session_id as "sessionId", conversation_id as "conversationId", user_email as "userEmail", user_id as "userId", sender, message, source, created_at as "createdAt"
      `, [msgId, sessionId, convId, userEmail, userId, `[${staffSender}]: ${message.trim()}`]);

      // Update conversation timestamp
      await pool.query(`
        UPDATE conversations 
        SET updated_at = NOW(),
            user_email = COALESCE(user_email, $1),
            user_id = COALESCE(user_id, $2)
        WHERE session_id = $3 OR id = $4
      `, [userEmail, userId, sessionId, convId]);

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Knowledge Documents List (RAG Knowledge Chunks)
  app.get('/api/admin/support/knowledge-docs', async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
        FROM knowledge_documents
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Create Knowledge Document Chunk
  app.post('/api/admin/support/knowledge-docs', async (req, res) => {
    try {
      const { title, content, category, status } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }
      const id = `doc-${Date.now()}`;
      const cleanCat = category || 'General';
      const cleanStatus = status || 'published';

      const insertRes = await pool.query(`
        INSERT INTO knowledge_documents (id, title, content, category, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
      `, [id, title.trim(), content.trim(), cleanCat, cleanStatus]);

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Update Knowledge Document Chunk
  app.put('/api/admin/support/knowledge-docs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category, status } = req.body;

      const updateRes = await pool.query(`
        UPDATE knowledge_documents
        SET title = COALESCE($1, title),
            content = COALESCE($2, content),
            category = COALESCE($3, category),
            status = COALESCE($4, status),
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
      `, [title, content, category, status, id]);

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'Knowledge document not found.' });
      }

      res.json(updateRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Delete Knowledge Document Chunk
  app.delete('/api/admin/support/knowledge-docs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM knowledge_documents WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Knowledge document not found.' });
      }
      res.json({ success: true, id: result.rows[0].id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Bulk Delete Knowledge Document Chunks
  app.post('/api/admin/support/knowledge-docs/bulk-delete', async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required.' });
      }

      await pool.query('DELETE FROM knowledge_documents WHERE id = ANY($1)', [ids]);
      res.json({ success: true, deletedCount: ids.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: AI File Analysis & Knowledge Chunk Extraction
  app.post('/api/admin/support/knowledge-docs/extract-from-file', async (req, res) => {
    try {
      const { fileData, fileName, mimeType, categoryHint, autoSave } = req.body;

      if (!fileData) {
        return res.status(400).json({ error: 'File data is required for extraction.' });
      }

      const cleanFileName = fileName || 'Uploaded Document';
      const cleanMime = mimeType || 'text/plain';
      const cleanCategory = (categoryHint || 'General').trim();

      // Enforce a 2 MB source-file limit. Base64 (used for non-text files) inflates
      // size by ~4/3, so measure the actual decoded byte length, not the raw string length.
      const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
      const isDataUrl = typeof fileData === 'string' && fileData.startsWith('data:') && fileData.includes('base64,');
      const approxByteLength = typeof fileData === 'string'
        ? (isDataUrl ? Math.floor((fileData.split('base64,')[1] || '').length * 0.75) : Buffer.byteLength(fileData, 'utf-8'))
        : 0;
      if (approxByteLength > MAX_UPLOAD_BYTES) {
        return res.status(413).json({
          error: `File is too large (${(approxByteLength / (1024 * 1024)).toFixed(2)} MB). The maximum allowed upload size is 2 MB.`
        });
      }

      let extractedChunks: { title: string; category: string; content: string }[] = [];

      // 1. Fetch current platform settings to get active AI model
      let targetModel = req.body.preferredModel;
      if (!targetModel) {
        try {
          const settingsRes = await pool.query("SELECT value FROM settings WHERE key = 'platform'");
          const platform = settingsRes.rows[0]?.value || {};
          targetModel = platform.activeAiModel || 'gpt-4.1-mini';
        } catch {
          targetModel = 'gpt-4.1-mini';
        }
      }

      // 2. Perform AI-powered multi-model extraction with intelligent fallback
      extractedChunks = await runAIKnowledgeExtraction(fileData, cleanFileName, cleanMime, cleanCategory, targetModel);

      // 3. High-quality intelligent non-AI fallback extraction if AI models were unavailable/failed.
      // IMPORTANT: this must never decode arbitrary binary (PDF, DOCX, images) as UTF-8.
      if (extractedChunks.length === 0) {
        const { text: textToChunk, unsupported } = await extractRawTextFromUpload(fileData, cleanFileName, cleanMime);
        const baseTitle = cleanFileName.replace(/\.[^/.]+$/, '');

        if (unsupported) {
          return res.status(422).json({
            error: `AI extraction failed for "${cleanFileName}" and this file type has no offline fallback (scanned images and legacy .doc files need working AI extraction). Check the server logs or try switching the active AI model in Admin Settings.`
          });
        }

        if (textToChunk.trim()) {
          // Check if JSON format
          try {
            const parsedObj = JSON.parse(textToChunk);
            if (Array.isArray(parsedObj)) {
              parsedObj.slice(0, 8).forEach((item, idx) => {
                const title = item.title || item.name || item.subject || `${baseTitle} - Item ${idx + 1}`;
                const content = typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);
                extractedChunks.push({ title, category: cleanCategory, content });
              });
            } else if (typeof parsedObj === 'object' && parsedObj !== null) {
              Object.keys(parsedObj).slice(0, 8).forEach(k => {
                const val = parsedObj[k];
                const content = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
                extractedChunks.push({ title: `${baseTitle}: ${k}`, category: cleanCategory, content });
              });
            }
          } catch {
            // Not JSON
          }

          // Check if Markdown with section headers
          if (extractedChunks.length === 0) {
            const markdownSections = textToChunk.split(/\n(?=#{1,3}\s+)/g).filter(s => s.trim().length > 20);
            if (markdownSections.length > 1) {
              markdownSections.slice(0, 8).forEach((sec, idx) => {
                const firstLine = sec.trim().split('\n')[0].replace(/^#{1,3}\s+/, '').trim();
                const body = sec.trim().replace(/^#{1,3}\s+[^\n]+\n?/, '').trim() || sec.trim();
                extractedChunks.push({
                  title: firstLine.length > 0 && firstLine.length < 80 ? firstLine : `${baseTitle} - Part ${idx + 1}`,
                  category: cleanCategory,
                  content: body
                });
              });
            }
          }

          // Check distinct paragraphs
          if (extractedChunks.length === 0) {
            const paragraphs = textToChunk.split(/\n\s*\n+/).map(p => p.trim()).filter(p => p.length > 30);
            if (paragraphs.length > 0) {
              extractedChunks = paragraphs.slice(0, 6).map((p, idx) => ({
                title: `${baseTitle} - Section ${idx + 1}`,
                category: cleanCategory,
                content: p.trim()
              }));
            }
          }

          // Single summary fallback
          if (extractedChunks.length === 0) {
            extractedChunks = [{
              title: `${baseTitle} Overview`,
              category: cleanCategory,
              content: textToChunk.trim().slice(0, 1500)
            }];
          }
        } else {
          return res.status(422).json({
            error: `Could not extract any readable text from "${cleanFileName}". AI extraction failed (check server logs) and the file appears to contain no extractable text.`
          });
        }
      }

      // 4. If autoSave is enabled, persist chunks directly into PostgreSQL
      const savedDocs: any[] = [];
      if (autoSave && extractedChunks.length > 0) {
        for (const chunk of extractedChunks) {
          const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const insertRes = await pool.query(`
            INSERT INTO knowledge_documents (id, title, content, category, status)
            VALUES ($1, $2, $3, $4, 'published')
            RETURNING id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
          `, [id, chunk.title.trim(), chunk.content.trim(), chunk.category || cleanCategory]);

          savedDocs.push(insertRes.rows[0]);
        }
      }

      res.json({
        success: true,
        fileName: cleanFileName,
        modelUsed: targetModel,
        extractedChunksCount: extractedChunks.length,
        chunks: extractedChunks,
        savedDocs: savedDocs
      });
    } catch (err: any) {
      console.error('File knowledge extraction failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: AI Real-Time Knowledge & Model Status
  app.get('/api/admin/support/ai-knowledge-status', async (_req, res) => {
    try {
      const faqsCount = await pool.query(`SELECT COUNT(*) FROM faqs WHERE status = 'published'`);
      const chunksCount = await pool.query(`SELECT COUNT(*) FROM knowledge_documents WHERE status = 'published'`);
      const topicsCount = await pool.query(`SELECT COUNT(*) FROM topics`);
      const settingsData = await pool.query(`SELECT value FROM settings WHERE key = 'platform'`);
      const platform = settingsData.rows[0]?.value || {};
      const activeAiModel = platform.activeAiModel || 'gemini-2.5-flash';
      const aiProvider = platform.aiProvider || 'auto';
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      const hasOpenAiKey = !!process.env.OPENAI_API_KEY;

      res.json({
        totalFaqs: parseInt(faqsCount.rows[0].count, 10),
        totalChunks: parseInt(chunksCount.rows[0].count, 10),
        totalTopics: parseInt(topicsCount.rows[0].count, 10),
        platformBrand: platform.forumName || 'Trek Consultancy',
        primaryEmail: platform.primarySupportEmail || 'contact@trekconsultancy.com',
        lastSyncedAt: new Date().toISOString(),
        liveSyncStatus: 'ACTIVE',
        activeAiModel,
        aiProvider,
        aiTemperature: typeof platform.aiTemperature === 'number' ? platform.aiTemperature : 0.2,
        hasGeminiKey,
        hasOpenAiKey,
        models: [
          activeAiModel,
          'gemini-2.5-flash',
          'gemini-3.8-flash',
          'gpt-4.1-mini',
          'gpt-4o',
          'gpt-5-mini',
          'Local PostgreSQL RAG Fallback'
        ]
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Real-time Live Model Test & Diagnostics
  app.post('/api/admin/support/test-model', async (req, res) => {
    const startTime = Date.now();
    let modelToTest = 'gemini-2.5-flash';
    let providerName = 'Google Gemini';

    try {
      const settingsData = await pool.query(`SELECT value FROM settings WHERE key = 'platform'`);
      const platform = settingsData.rows[0]?.value || {};
      modelToTest = (req.body.model || platform.activeAiModel || 'gemini-2.5-flash').trim();
      const testPrompt = (req.body.message || 'Please respond in 1-2 concise sentences confirming that this AI model is active, operational, and connected to the Trek Consultancy platform.').trim();

      const isLocalRag = modelToTest === 'local-rag' || req.body.provider === 'local';
      const isOpenAi = !isLocalRag && (modelToTest.startsWith('gpt-') || modelToTest.startsWith('o1-') || modelToTest.startsWith('o3-') || req.body.provider === 'openai');
      providerName = isLocalRag ? 'PostgreSQL Database' : isOpenAi ? 'OpenAI' : 'Google Gemini';

      // Helper to execute PostgreSQL Local RAG
      const getLocalRagSynthesis = async (queryText: string) => {
        const [faqsData, docsData] = await Promise.all([
          pool.query(`
            SELECT f.question, f.answer, f.question_bn, f.answer_bn, COALESCE(c.name, 'General') as category 
            FROM faqs f 
            LEFT JOIN faq_categories c ON f.category_id = c.id 
            WHERE f.status = 'published' OR f.status IS NULL OR f.status = 'active'
          `),
          pool.query(`
            SELECT id, title, content, category, status 
            FROM knowledge_documents 
            WHERE status = 'published' OR status IS NULL OR status = 'active'
          `)
        ]);

        const pipelineSettings: PipelineSettings = {
          forumName: platform.forumName || 'Trek Consultancy',
          supportEmail: platform.primarySupportEmail || 'contact@trekconsultancy.com',
          phone: platform.phone || '+966 55 363 8960',
          whatsapp: platform.whatsapp || '+966 50 241 1744',
          slaHours: platform.slaHours || 48
        };

        const directKb = matchDirectKB(queryText, 'en', pipelineSettings);
        if (directKb) return directKb.reply;

        const fuzzy = matchFuzzyFAQ(queryText, 'en', faqsData.rows, docsData.rows);
        if (fuzzy) return fuzzy.reply;

        // Semantic word overlap search in knowledge_documents
        const terms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 3);
        let bestDoc: any = null;
        let bestScore = 0;

        for (const doc of docsData.rows) {
          const contentLower = `${doc.title || ''} ${doc.content || ''}`.toLowerCase();
          let score = 0;
          for (const t of terms) {
            if (contentLower.includes(t)) score += 1;
          }
          if (score > bestScore) {
            bestScore = score;
            bestDoc = doc;
          }
        }

        if (bestDoc && bestScore > 0) {
          return `**${bestDoc.title}** (${bestDoc.category || 'General'}):\n${bestDoc.content.slice(0, 450)}...`;
        }

        return `Trek Consultancy provides end-to-end foreign business setup in Saudi Arabia (MISA licensing, 100% foreign ownership, Commercial Registration, corporate banking), custom software & ERP development, and investor visa services. Reach our advisory team directly via WhatsApp (${pipelineSettings.whatsapp}) or email (${pipelineSettings.supportEmail}).`;
      };

      if (isLocalRag) {
        const ragReply = await getLocalRagSynthesis(testPrompt);
        const latencyMs = Date.now() - startTime;
        return res.status(200).json({
          success: true,
          model: 'PostgreSQL Local RAG',
          provider: 'PostgreSQL Database',
          latencyMs,
          reply: ragReply,
          isLocalRag: true
        });
      }

      if (isOpenAi) {
        if (!process.env.OPENAI_API_KEY) {
          const ragFallback = await getLocalRagSynthesis(testPrompt);
          return res.status(200).json({
            success: false,
            model: modelToTest,
            provider: 'OpenAI',
            latencyMs: 0,
            error: 'OPENAI_API_KEY is not configured in the server environment (Settings > Secrets).',
            ragFallbackReply: ragFallback,
            hasRagFallback: true
          });
        }

        try {
          const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: modelToTest,
              messages: [
                { role: 'system', content: 'You are the official AI test assistant for Trek Consultancy. Reply concisely.' },
                { role: 'user', content: testPrompt }
              ],
              max_tokens: 300,
              temperature: 0.2
            })
          });

          const latencyMs = Date.now() - startTime;
          if (!openAiRes.ok) {
            const errText = await openAiRes.text().catch(() => '');
            const isAuth = openAiRes.status === 401 || errText.includes('invalid_api_key');
            const ragFallback = await getLocalRagSynthesis(testPrompt);
            return res.status(200).json({
              success: false,
              model: modelToTest,
              provider: 'OpenAI',
              latencyMs,
              error: isAuth
                ? 'OpenAI Authentication Error (HTTP 401: Invalid API Key).'
                : `OpenAI API returned HTTP ${openAiRes.status}: ${errText.slice(0, 200)}`,
              ragFallbackReply: ragFallback,
              hasRagFallback: true
            });
          }

          const data: any = await openAiRes.json();
          const reply = data?.choices?.[0]?.message?.content || 'No text content returned';
          return res.status(200).json({
            success: true,
            model: modelToTest,
            provider: 'OpenAI',
            latencyMs,
            reply,
            usage: data?.usage
          });
        } catch (openAiErr: any) {
          const latencyMs = Date.now() - startTime;
          const ragFallback = await getLocalRagSynthesis(testPrompt);
          return res.status(200).json({
            success: false,
            model: modelToTest,
            provider: 'OpenAI',
            latencyMs,
            error: `OpenAI Network/Execution Error: ${openAiErr?.message || 'Connection failed'}`,
            ragFallbackReply: ragFallback,
            hasRagFallback: true
          });
        }
      } else {
        // Google Gemini
        if (!process.env.GEMINI_API_KEY) {
          const ragFallback = await getLocalRagSynthesis(testPrompt);
          return res.status(200).json({
            success: false,
            model: modelToTest,
            provider: 'Google Gemini',
            latencyMs: 0,
            error: 'GEMINI_API_KEY is not configured in the server environment (Settings > Secrets).',
            ragFallbackReply: ragFallback,
            hasRagFallback: true
          });
        }

        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });

          const geminiRes = await ai.models.generateContent({
            model: modelToTest,
            contents: testPrompt,
            config: {
              systemInstruction: 'You are the official AI test assistant for Trek Consultancy. Reply concisely in 1-2 sentences.',
              maxOutputTokens: 300,
              temperature: 0.2
            }
          });

          const latencyMs = Date.now() - startTime;
          return res.status(200).json({
            success: true,
            model: modelToTest,
            provider: 'Google Gemini',
            latencyMs,
            reply: geminiRes.text?.trim() || 'Operational'
          });
        } catch (geminiErr: any) {
          const latencyMs = Date.now() - startTime;
          const rawErr = geminiErr?.message || String(geminiErr);
          const isAuthError =
            rawErr.includes('401') ||
            rawErr.includes('UNAUTHENTICATED') ||
            rawErr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            rawErr.includes('invalid authentication credentials');

          const formattedError = isAuthError
            ? 'Cloud AI Key Authentication: To use live Gemini cloud inference, provide an API key in Settings > Secrets. In the meantime, the PostgreSQL Knowledge RAG engine is fully operational.'
            : `Gemini API Error: ${rawErr.slice(0, 300)}`;

          const ragFallback = await getLocalRagSynthesis(testPrompt);

          return res.status(200).json({
            success: false,
            model: modelToTest,
            provider: 'Google Gemini',
            latencyMs,
            error: formattedError,
            ragFallbackReply: ragFallback,
            hasRagFallback: true
          });
        }
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      res.status(200).json({
        success: false,
        model: modelToTest,
        provider: providerName,
        latencyMs,
        error: err.message || 'Model test execution failed'
      });
    }
  });

  // Activity logs
  app.get('/api/activity-logs', async (_req, res) => {
    try {
      const result = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 30');
      res.json(result.rows.map((r: any) => ({
        id: r.id,
        action: r.action,
        actor: r.actor,
        target: r.target,
        timeAgo: r.time_ago,
        type: r.type
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  app.get('/api/settings', async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'platform'");
      if (result.rows.length > 0) {
        res.json(result.rows[0].value);
      } else {
        res.json({
          forumName: 'Ama Community',
          forumTagline: 'The modern community platform for developers and digital nomads',
          enableGuestPosting: true,
          enableAutoModeration: true,
          announcementText: '',
          showAnnouncement: false,
          primarySupportEmail: 'support@amacommunity.io',
          slaHours: 24
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const newSettings = req.body;
      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('platform', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(newSettings)]);

      res.json({ success: true, settings: newSettings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Catch-all 404 handler for unhandled API routes so responses never hang
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.method} ${req.originalUrl || req.url} was not found`
    });
  });

  return app;
}
