// ---------------------------------------------------------------------------
// This file is intentionally self-contained: db.ts and app.ts are inlined
// directly here rather than imported from src/server/*. Vercel's Node
// builder was failing to resolve those cross-directory relative TS imports
// at deploy time (ERR_MODULE_NOT_FOUND for src/server/app.ts), crashing this
// function before any route code ran. Inlining removes that failure mode
// entirely — only npm package imports remain, which Vercel handles reliably.
// The original src/server/db.ts and src/server/app.ts are still used by the
// local dev server (server.ts) and remain the source of truth for editing;
// re-run the merge if you change either of them.
// ---------------------------------------------------------------------------

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
if (!process.env.DATABASE_URL && fs.existsSync('env.txt')) {
  dotenv.config({ path: 'env.txt' });
}
if (!process.env.DATABASE_URL && fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

// Ensure WebSocket constructor is configured for Node.js environments (Vercel serverless / Node < 22)
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

const rawConnectionString = process.env.DATABASE_URL?.trim();
const connectionString = rawConnectionString ? rawConnectionString.replace(/^["']|["']$/g, '') : undefined;

if (!connectionString) {
  console.warn(
    '[Database] Warning: DATABASE_URL is not set. Database mock fallback is active.'
  );
}

export const defaultSettings = {
  forumName: 'Ama Community',
  forumTagline: 'The modern community platform for developers and digital nomads',
  enableGuestPosting: true,
  enableAutoModeration: true,
  announcementText: '',
  showAnnouncement: false,
  primarySupportEmail: 'support@amacommunity.io',
  slaHours: 24,
  floatingSupportEnabled: true,
  floatingSupportTagTextEn: 'Support Assistant & FAQs',
  floatingSupportTagTextBn: '২৪/৭ সাপোর্ট চ্যাট ও হেল্প',
  floatingSupportGreetingEn: 'Hello! How can our support team & AI assist your community journey today?',
  floatingSupportGreetingBn: 'নমস্কার! আমাদের সাপোর্ট টিম ও এআই অ্যাসিস্ট্যান্ট কীভাবে আপনাকে সহায়তা করতে পারে?',
  floatingSupportAiEnabled: true,
  floatingSupportDefaultPriority: 'Normal',
  floatingSupportMessengerTheme: 'messenger-blue'
};

// Real Pool instance when connectionString is provided
let realPool: any = null;
if (connectionString) {
  try {
    realPool = new Pool({ connectionString });
  } catch (err) {
    console.warn('[Database] Failed to initialize Neon Pool:', err);
  }
}

// Resilient pool wrapper that queries Neon PostgreSQL and falls back gracefully if offline/unconfigured
export const pool = {
  query: async (text: string | any, params?: any[]): Promise<{ rows: any[]; rowCount?: number }> => {
    if (realPool) {
      // Let errors propagate. Silently swallowing DB errors and returning an
      // empty result set makes real failures (missing tables, bad SSL config,
      // exhausted connections, etc.) look identical to "no data found",
      // which is exactly what was hiding the previous production bug.
      // The one deliberate exception is the very first settings bootstrap
      // read, which callers rely on to have sane defaults before initDb()
      // has necessarily finished — everything else must throw on failure.
      try {
        return await realPool.query(text, params);
      } catch (err: any) {
        console.error('[Database] Query failed:', err?.message, '\nQuery:', typeof text === 'string' ? text.slice(0, 200) : text);
        if (typeof text === 'string' && text.includes('FROM settings')) {
          console.warn('[Database] Falling back to default settings after query failure.');
          return { rows: [{ key: 'platform', value: defaultSettings }], rowCount: 1 };
        }
        throw err;
      }
    }
    if (typeof text === 'string' && text.includes('FROM settings')) {
      return { rows: [{ key: 'platform', value: defaultSettings }], rowCount: 1 };
    }
    throw new Error('DATABASE_URL is not configured — no database connection is available.');
  },
  connect: async () => {
    if (realPool) {
      return await realPool.connect();
    }
    throw new Error('DATABASE_URL is not configured — no database connection is available.');
  }
};

let initDbPromise: Promise<void> | null = null;

export async function initDb() {
  if (initDbPromise) {
    return initDbPromise;
  }

  initDbPromise = (async () => {
    if (!connectionString) {
      console.warn('[Database] DATABASE_URL is not set. Skipping schema initialization.');
      return;
    }

    let client;
    try {
      console.log('[Database] Connecting to Neon PostgreSQL...');
      client = await pool.connect();

    // 1. Users table (for authentication & community management)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(64) NOT NULL DEFAULT 'User',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        avatar TEXT,
        joined_date VARCHAR(64) DEFAULT 'Recent',
        threads_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE users DROP COLUMN IF EXISTS reputation;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'User';

      CREATE TABLE IF NOT EXISTS email_verifications (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(16) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes')
      );
      CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
    `);

    // 2. Topics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_role VARCHAR(100) DEFAULT 'Member',
        author_avatar TEXT,
        author_email VARCHAR(255),
        author_id VARCHAR(64),
        time_ago VARCHAR(100) DEFAULT 'Just now',
        category VARCHAR(255) NOT NULL,
        category_slug VARCHAR(255) NOT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        replies INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_popular BOOLEAN DEFAULT FALSE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Ensure backwards-compatibility for author_email and author_id columns
    await client.query(`
      ALTER TABLE topics ADD COLUMN IF NOT EXISTS author_email VARCHAR(255);
      ALTER TABLE topics ADD COLUMN IF NOT EXISTS author_id VARCHAR(64);
    `);

    // 3. Replies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS replies (
        id VARCHAR(64) PRIMARY KEY,
        topic_id VARCHAR(64) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        author VARCHAR(255) NOT NULL,
        author_role VARCHAR(100) DEFAULT 'Member',
        author_avatar TEXT,
        time_ago VARCHAR(100) DEFAULT 'Just now',
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Blogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        category VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        image_url TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_avatar TEXT,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE blogs ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

      CREATE TABLE IF NOT EXISTS blog_comments (
        id VARCHAR(64) PRIMARY KEY,
        blog_id VARCHAR(64) NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_avatar TEXT,
        author_role VARCHAR(100) DEFAULT 'Member',
        time_ago VARCHAR(100) DEFAULT 'Just now',
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);
    `);

    // 5. Consultancy Inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultancy_inquiries (
        id VARCHAR(64) PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        scope TEXT NOT NULL,
        date VARCHAR(100) NOT NULL,
        status VARCHAR(64) DEFAULT 'new',
        priority VARCHAR(64) DEFAULT 'normal',
        assigned_to VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 6. Activity Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(64) PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        actor VARCHAR(255) NOT NULL,
        target VARCHAR(255) NOT NULL,
        time_ago VARCHAR(100) NOT NULL,
        type VARCHAR(64) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 7. Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);

    // 8. Newsletter Subscribers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 9. Support & Chat Messages table (Persisted for authenticated users and converted accounts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id VARCHAR(64) PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64),
        user_email VARCHAR(255),
        sender VARCHAR(32) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(50) DEFAULT 'AI',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'AI';
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
      CREATE INDEX IF NOT EXISTS idx_support_messages_email ON support_messages(user_email);
      CREATE INDEX IF NOT EXISTS idx_support_messages_session ON support_messages(session_id);
    `);

    // 10. FAQ Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faq_categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 11. FAQs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR(64) PRIMARY KEY,
        category_id VARCHAR(64) REFERENCES faq_categories(id) ON DELETE SET NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        question_bn TEXT,
        answer_bn TEXT,
        status VARCHAR(50) DEFAULT 'published',
        created_by VARCHAR(255) DEFAULT 'System Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status);
      CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category_id);
    `);

    // 12. Knowledge Documents table for RAG
    await client.query(`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        status VARCHAR(50) DEFAULT 'published',
        created_by VARCHAR(255) DEFAULT 'System Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status ON knowledge_documents(status);
    `);

    // 13. Support Tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(64) PRIMARY KEY,
        ticket_number VARCHAR(64) NOT NULL,
        user_id VARCHAR(255),
        user_email VARCHAR(255),
        session_id VARCHAR(255),
        subject VARCHAR(500),
        question TEXT NOT NULL,
        priority VARCHAR(32) DEFAULT 'Normal',
        status VARCHAR(50) DEFAULT 'OPEN',
        admin_answer TEXT,
        assigned_to VARCHAR(255) DEFAULT 'Unassigned',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        answered_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_session ON support_tickets(session_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
    `);

    // Default configuration settings if not present
    const settingsCheck = await client.query("SELECT value FROM settings WHERE key = 'platform'");
    const defaultSettings = {
      forumName: 'Ama Community',
      forumTagline: 'The modern community platform for developers and digital nomads',
      enableGuestPosting: true,
      enableAutoModeration: true,
      announcementText: '',
      showAnnouncement: false,
      primarySupportEmail: 'support@amacommunity.io',
      slaHours: 24,
      floatingSupportEnabled: true,
      floatingSupportTagTextEn: 'Support Assistant & FAQs',
      floatingSupportTagTextBn: '২৪/৭ সাপোর্ট চ্যাট ও হেল্প',
      floatingSupportGreetingEn: 'Hello! How can our support team & AI assist your community journey today?',
      floatingSupportGreetingBn: 'নমস্কার! আমাদের সাপোর্ট টিম ও এআই অ্যাসিস্ট্যান্ট কীভাবে আপনাকে সহায়তা করতে পারে?',
      floatingSupportAiEnabled: true,
      floatingSupportDefaultPriority: 'Normal',
      floatingSupportMessengerTheme: 'messenger-blue'
    };

    if (settingsCheck.rows.length === 0) {
      await client.query("INSERT INTO settings (key, value) VALUES ('platform', $1)", [JSON.stringify(defaultSettings)]);
    } else {
      // Merge in any missing floating support keys without overwriting user custom settings
      const current = settingsCheck.rows[0].value || {};
      let updated = false;
      for (const [k, v] of Object.entries(defaultSettings)) {
        if (current[k] === undefined) {
          current[k] = v;
          updated = true;
        }
      }
      if (updated) {
        await client.query("UPDATE settings SET value = $1 WHERE key = 'platform'", [JSON.stringify(current)]);
      }
    }

    console.log('[Database] PostgreSQL schema initialized successfully on Neon.');
  } catch (err) {
    initDbPromise = null;
    console.error('[Database] Initialization error:', err);
    // Re-throw so callers (the Express init middleware) know schema setup
    // failed instead of silently proceeding as if the DB were ready.
    throw err;
  } finally {
    client?.release?.();
  }
  })();

  return initDbPromise;
}

import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

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
    try {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const text = result?.text || '';
      return { text, unsupported: text.trim().length === 0 };
    } catch (err: any) {
      console.error('[knowledge-extract] pdf-parse failed:', err?.message || err);
      return { text: '', unsupported: true };
    }
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

async function runOpenAIKnowledgeExtraction(
  fileData: string,
  fileName: string,
  mimeType: string,
  categoryHint: string
): Promise<{ title: string; category: string; content: string }[]> {
  const candidateModels = ['gpt-5-mini', 'gpt-4o', 'gpt-4.1-mini'];
  const systemPrompt = buildKnowledgeExtractionSystemPrompt(categoryHint);
  const isImage = mimeType.startsWith('image/');

  let userContent: any;
  if (isImage) {
    // Vision input: fileData is already a data: URL for non-text uploads.
    const imageUrl = fileData.startsWith('data:') ? fileData : `data:${mimeType};base64,${fileData}`;
    userContent = [
      { type: 'text', text: `File Name: ${fileName}\nPreferred Category: ${categoryHint}\nPlease analyze this image and extract the structured knowledge chunks.` },
      { type: 'image_url', image_url: { url: imageUrl } }
    ];
  } else {
    const { text, unsupported } = await extractRawTextFromUpload(fileData, fileName, mimeType);
    if (unsupported || !text.trim()) {
      // Nothing we can hand to a text model — let the caller's fallback/error path handle it.
      return [];
    }
    userContent = `File Name: ${fileName}\nFile Type: ${mimeType}\nPreferred Category: ${categoryHint}\n\nDocument Content:\n${text}`;
  }

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const chunks = await callOpenAIForChunks(model, systemPrompt, userContent);
        if (chunks && chunks.length > 0) return chunks;
        break; // valid response but no chunks — no point retrying this model
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error(`[knowledge-extract] OpenAI model "${model}" attempt ${attempt + 1} failed:`, msg);
        if (err?.status === 401 || msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
          console.error('[knowledge-extract] OPENAI_API_KEY looks invalid or missing. Generate one at https://platform.openai.com/api-keys and set it in your deployment\'s environment variables.');
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

  console.warn(`[knowledge-extract] All OpenAI models failed for "${fileName}" — falling back to non-AI chunker. Check the logged model errors above.`);
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
      const { author, content, authorAvatar, authorRole } = req.body;
      const replyId = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';

      const replyRes = await pool.query(`
        INSERT INTO replies (id, topic_id, author, author_role, author_avatar, time_ago, content, likes)
        VALUES ($1, $2, $3, $4, $5, 'Just now', $6, 0)
        RETURNING *
      `, [replyId, topicId, author || 'Community Member', authorRole || 'Member', avatar, content]);

      // Update topic replies count
      await pool.query('UPDATE topics SET replies = replies + 1 WHERE id = $1', [topicId]);

      const reply = {
        id: replyRes.rows[0].id,
        author: replyRes.rows[0].author,
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
        SELECT id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
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

  // Support Tickets Helper Function
  async function createSupportTicket({
    userEmail,
    subject,
    question,
    priority,
    sessionId = 'default-session',
    userId,
    source = 'Manual'
  }: {
    userEmail?: string;
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
    const cleanSubj = (subject || '').trim() || (question.trim().slice(0, 60) + '...');
    const cleanPriority = priority || 'Normal';
    const cleanSession = sessionId || 'default-session';

    const insertRes = await pool.query(`
      INSERT INTO support_tickets (id, ticket_number, user_id, user_email, session_id, subject, question, priority, status, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', 'Community Support Specialist')
      RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
                subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo", created_at as "createdAt"
    `, [id, ticketNum, userId || null, cleanEmail, cleanSession, cleanSubj, question.trim(), cleanPriority]);

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
      const { userEmail, subject, question, priority, sessionId, userId } = req.body;
      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question content is required to create a ticket.' });
      }

      const ticket = await createSupportTicket({
        userEmail,
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

  // Support Chat Messages: List (Loaded for Authenticated Users or Migrated Sessions)
  app.get('/api/support/messages', async (req, res) => {
    try {
      const sessionId = (req.query.sessionId as string) || 'default';
      const userEmail = ((req.query.userEmail as string) || (req.query.email as string) || '').trim().toLowerCase();

      let result;
      if (userEmail) {
        result = await pool.query(`
          SELECT id, sender, message, source, created_at as "createdAt"
          FROM support_messages
          WHERE LOWER(user_email) = $1 OR (user_email IS NULL AND session_id = $2)
          ORDER BY created_at ASC
        `, [userEmail, sessionId]);
      } else {
        result = await pool.query(`
          SELECT id, sender, message, source, created_at as "createdAt"
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
      const { sessionId, userEmail, userId, messages } = req.body;
      const cleanEmail = (userEmail || '').trim().toLowerCase();
      const cleanUserId = (userId || '').trim() || null;
      const cleanSession = sessionId || 'default';

      if (!cleanEmail) {
        return res.status(400).json({ error: 'User email is required to sync conversation.' });
      }

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.json({ success: true, syncedCount: 0, message: 'No messages to sync.' });
      }

      let syncedCount = 0;
      for (const msg of messages) {
        const text = (msg.text || msg.message || '').trim();
        if (!text) continue;
        const sender = msg.sender === 'bot' ? 'bot' : 'user';
        const source = msg.source || (sender === 'bot' ? 'AI' : 'USER');
        const id = msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const createdAt = msg.createdAt ? new Date(msg.createdAt) : new Date();

        // Check if already stored
        const dupCheck = await pool.query(
          `SELECT id FROM support_messages WHERE id = $1 OR (session_id = $2 AND sender = $3 AND message = $4)`,
          [id, cleanSession, sender, text]
        );

        if (dupCheck.rows.length === 0) {
          await pool.query(`
            INSERT INTO support_messages (id, session_id, user_email, user_id, sender, message, source, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [id, cleanSession, cleanEmail, cleanUserId, sender, text, source, createdAt]);
          syncedCount++;
        } else {
          await pool.query(`
            UPDATE support_messages 
            SET user_email = $1, user_id = $2 
            WHERE id = $3 AND (user_email IS NULL OR user_email = '')
          `, [cleanEmail, cleanUserId, dupCheck.rows[0].id]);
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
      const { sessionId, message, language, userEmail, userId, guestMessageCount } = req.body;
      const cleanSession = sessionId || 'default';
      const cleanMsg = (message || '').trim();
      const userLang = language === 'bn' ? 'bn' : 'en';
      const cleanEmail = (userEmail || '').trim().toLowerCase() || null;
      const cleanUserId = (userId || '').trim() || null;
      const isGuest = !cleanEmail;

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

      // 1. If authenticated user, save user message to DB. If GUEST, do NOT save to database!
      const userMsgId = `msg-${Date.now()}-u`;
      const dbSavePromise = !isGuest
        ? pool.query(`
            INSERT INTO support_messages (id, session_id, user_email, user_id, sender, message, source)
            VALUES ($1, $2, $3, $4, 'user', $5, 'USER')
          `, [userMsgId, cleanSession, cleanEmail, cleanUserId, cleanMsg])
        : Promise.resolve(null);

      const [, { faqsData, docsData, topicsData, settingsData }] = await Promise.all([
        dbSavePromise,
        getRagData()
      ]);

      const platformSettings = settingsData.rows[0]?.value || {};
      const supportEmail = platformSettings.primarySupportEmail || 'support@amacommunity.io';
      const forumName = platformSettings.forumName || 'Ama Community';
      const slaHours = platformSettings.slaHours || 2;

      let ragContext = `============================================================\n`;
      ragContext += `PROJECT KNOWLEDGE BASE, RAG CHUNKS & LIVE DATABASE CONTEXT:\n`;
      ragContext += `============================================================\n\n`;
      
      ragContext += `PLATFORM IDENTITY & SETTINGS:\n`;
      ragContext += `- Brand: ${forumName}\n`;
      ragContext += `- Support Email: ${supportEmail}\n`;
      ragContext += `- Official Ticket SLA: ${slaHours} Hours\n`;
      ragContext += `- Description: Modern bbPress & Docly-inspired community platform connecting developers and digital nomads, powered by Neon Serverless PostgreSQL persistence, role-based topic management, and enterprise full-stack development consultancy.\n\n`;

      ragContext += `CHUNK KNOWLEDGE DOCUMENTS (RAG CHUNKS FROM ADMIN & AI EXTRACTION):\n`;
      if (docsData.rows.length === 0) {
        ragContext += `(No custom documents uploaded yet)\n`;
      } else {
        docsData.rows.forEach((d, idx) => {
          ragContext += `--- [Chunk #${idx + 1}: ${d.title} | Category: ${d.category || 'General'}] ---\n${d.content}\n\n`;
        });
      }

      ragContext += `FREQUENTLY ASKED QUESTIONS (FAQS & ANSWERS):\n`;
      faqsData.rows.forEach(f => {
        ragContext += `[Category: ${f.category}]\n- Question (EN): ${f.question}\n  Answer (EN): ${f.answer}\n`;
        if (f.question_bn || f.answer_bn) {
          ragContext += `  Question (BN): ${f.question_bn || ''}\n  Answer (BN): ${f.answer_bn || ''}\n`;
        }
      });

      ragContext += `\nRECENT FORUM DISCUSSIONS (DATABASE TOPICS):\n`;
      topicsData.rows.forEach(t => {
        ragContext += `- Discussion: "${t.title}" (Category: ${t.category}, Author: ${t.author}, Views: ${t.views}, Replies: ${t.replies})\n`;
      });
      ragContext += `============================================================\n`;

      let botReply = '';
      let replySource = 'AI';
      let createdTicket: any = null;

      // 3. Try generating with Gemini API if GEMINI_API_KEY is configured.
      if (process.env.GEMINI_API_KEY) {
        const candidateModels = [
          'gemini-3.8-flash',
          'gemini-3.1-flash-lite'
        ];
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemInstruction = `You are the obedient, polite, respectful, and fully cooperative AI Support Assistant for Ama Community.
Your goal is to faithfully assist the user and represent Ama Community with the highest standard of helpfulness, professionalism, and brand excellence.

============================================================
COMPANY & PLATFORM KNOWLEDGE BASE (LIVE DATABASE CONTEXT):
${ragContext}
============================================================

YOUR 4 STRICT BEHAVIORAL PROTOCOLS:

1. NORMAL CONVERSATION & CASUAL GREETINGS (e.g., "hi", "hello", "hey", "assalamu alaikum", "good morning", "good evening", "how are you", "who are you", "what can you do", "thanks", "thank you", "bye"):
   - CLASSIFICATION: "GREETING"
   - TONE: Obedient, polite, warm, welcoming, and eager to help.
   - ACTION: Greet the user respectfully, introduce yourself as the official AI Assistant of Ama Community, and ask how you can help them navigate forum discussions, documentation, account guidance, or enterprise consultancy.
   - STRICT CONSTRAINT: NEVER mention support tickets, NEVER suggest creating or submitting tickets, and NEVER output errors or say you cannot answer. Simply offer your obedient assistance with a welcoming demeanor.

2. COMPANY & PLATFORM QUESTIONS (Information available in the Database or Platform Mechanics):
   - CLASSIFICATION: "COMPANY_ANSWER_FROM_DB"
   - TONE: Professional, obedient, helpful, and grounded.
   - ACTION: Answer the user's question accurately and thoroughly based on the Knowledge Documents, FAQs, Recent Discussions, Platform Identity, and platform mechanics provided in the context above:
     * Community forum posting and replying
     * Author and admin permissions (only the original author or system admin can delete a post)
     * Modern bbPress & Docly theme integration
     * Real-time serverless Neon PostgreSQL persistence across all topics and messages
     * Enterprise Consultancy retainers (custom architecture, ${slaHours}-hour SLA, priority support at ${supportEmail})
   - Ground all factual statements in the provided database context. Do not invent unverified facts.

3. COMPANY-SPECIFIC QUESTIONS OR ISSUES WHERE DATABASE HAS NO DATA / SPECIFIC INFO:
   - CLASSIFICATION: "COMPANY_SPECIFIC_NEEDS_TICKET"
   - TONE: Empathetic, polite, obedient, and action-oriented.
   - OCCURS WHEN: The user asks a question or reports an issue specifically about Ama Community, their user account, platform errors, billing/payment questions, custom enterprise agreements, feature roadmaps, or technical troubleshooting, BUT the database/knowledge base above DOES NOT contain the specific data or requires human staff intervention.
   - ACTION: You MUST automatically raise an official support ticket for the user!
   - In your reply:
     a) Explain politely and obediently that because this specific matter is not documented in the public database or requires direct team investigation, you have automatically created an official support ticket: {{TICKET_NUMBER}}.
     b) Reassure the user that our dedicated engineering and support specialists have received their ticket and will investigate under our official ${slaHours}-hour SLA.
     c) Mention they can track the status under the "My Tickets" tab or contact ${supportEmail} for further assistance.
   - Set ticketSubject to a clear, concise 3-8 word summary of the user's inquiry.
   - Set ticketPriority to "Normal", "High", or "Urgent" based on severity.

4. TOPICS OUTSIDE THE DATABASE OR NOT RELATED TO THE COMPANY:
   - CLASSIFICATION: "OUTSIDE_SCOPE_UNRELATED"
   - OCCURS WHEN: The user asks about topics completely unrelated to Ama Community (such as general trivia, recipes, cooking, weather, celebrity gossip, movies, sports, history, general homework, or non-company subjects).
   - TONE: Extremely humble, courteous, and respectful.
   - ACTION:
     a) HUMBLY APOLOGIZE: Express genuine, humble apologies (e.g., "I humbly apologize, but as the dedicated assistant for Ama Community, I am unable to assist with topics outside of our platform and software services...").
     b) BRAND THE COMPANY: Proudly highlight Ama Community's mission and core offerings:
        "**Ama Community** is the premier developer and digital nomad platform featuring modern Docly bbPress forum discussions, extensive technical knowledge base documentation, real-time serverless Neon PostgreSQL persistence, and custom enterprise software consultancy."
     c) RE-ENGAGE: Politely invite the user to ask about our community discussions, platform guides, technical stack, or consultancy services.
   - STRICT CONSTRAINT: DO NOT raise a ticket, and DO NOT ask or suggest the user to submit a ticket for unrelated topics!

LANGUAGE RULE:
- Reply in Bengali if the user wrote in Bengali or requested it; otherwise use clear, professional English.
- Use clean Markdown with bolding and bullet points where helpful. No headings, no excessive emojis.`;

        for (const modelName of candidateModels) {
          try {
            const response = await withTimeout(
              ai.models.generateContent({
                model: modelName,
                contents: cleanMsg,
                config: {
                  systemInstruction,
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      classification: {
                        type: Type.STRING,
                        description: 'One of: GREETING, COMPANY_ANSWER_FROM_DB, COMPANY_SPECIFIC_NEEDS_TICKET, OUTSIDE_SCOPE_UNRELATED'
                      },
                      reply: {
                        type: Type.STRING,
                        description: "The assistant's markdown response to the user"
                      },
                      ticketSubject: {
                        type: Type.STRING,
                        description: 'Short concise subject for the ticket if COMPANY_SPECIFIC_NEEDS_TICKET, else empty string'
                      },
                      ticketPriority: {
                        type: Type.STRING,
                        description: 'Priority: Normal, High, or Urgent if COMPANY_SPECIFIC_NEEDS_TICKET, else Normal'
                      }
                    },
                    required: ['classification', 'reply']
                  },
                  temperature: 0.2,
                  maxOutputTokens: 800
                }
              }),
              7000
            );

            if (response.text) {
              try {
                const parsedAi = JSON.parse(response.text.trim());
                if (parsedAi && parsedAi.reply) {
                  if (parsedAi.classification === 'COMPANY_SPECIFIC_NEEDS_TICKET') {
                    const autoTicket = await createSupportTicket({
                      userEmail: userEmail || undefined,
                      subject: parsedAi.ticketSubject || cleanMsg.slice(0, 60),
                      question: cleanMsg,
                      priority: parsedAi.ticketPriority || 'Normal',
                      sessionId: cleanSession,
                      source: 'AI_Auto'
                    });
                    createdTicket = autoTicket;

                    let finalReply = parsedAi.reply;
                    if (finalReply.includes('{{TICKET_NUMBER}}')) {
                      finalReply = finalReply.replace(/\{\{TICKET_NUMBER\}\}/g, `#${autoTicket.ticketNumber}`);
                    } else if (!finalReply.includes(autoTicket.ticketNumber)) {
                      finalReply += `\n\n**Support Ticket Created**: #${autoTicket.ticketNumber}`;
                    }
                    botReply = finalReply;
                    replySource = 'AI_AUTO_TICKET';
                  } else {
                    botReply = parsedAi.reply;
                    replySource = 'AI';
                  }
                  break;
                }
              } catch (parseErr) {
                // If model returned plain text instead of JSON
                botReply = response.text.trim();
                replySource = 'AI';
                break;
              }
            }
          } catch (aiErr: any) {
            // Move on to the next candidate model immediately — no sleep/retry.
            continue;
          }
        }
      }

      // Fallback: Intelligent heuristic matching with RAG context
      if (!botReply) {
        const lower = cleanMsg.toLowerCase().trim();
        const STOP_WORDS = new Set([
          'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
          'this', 'that', 'these', 'those', 'there', 'here',
          'the', 'and', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
          'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
          'again', 'further', 'then', 'once',
          'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
          'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
          'can', 'will', 'just', 'should', 'now', 'have', 'has', 'had', 'having',
          'does', 'did', 'doing', 'would', 'could', 'tell', 'give', 'know', 'want', 'need', 'please'
        ]);
        const cleanWords = lower
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w: string) => w.length >= 4 && !STOP_WORDS.has(w));

        // 1. Check if greeting / polite casual conversation
        const isGreeting = /^(hi|hello|hey|greetings|hola|assalamu\s*alaikum|salam|good\s*(morning|afternoon|evening|day)|howdy|who\s*are\s*you|what\s*can\s*you\s*do|what\s*are\s*you|thanks|thank\s*you|bye|goodbye)\b/i.test(lower) ||
          ['hi', 'hello', 'hey', 'salam', 'hola', 'namaste', 'test', 'হ্যালো', 'হাই', 'সালাম', 'কেমন আছেন', 'নমস্কার'].some(g => lower.includes(g));

        if (isGreeting) {
          botReply = userLang === 'bn'
            ? `হ্যালো! **আমা কমিউনিটি**-তে আপনাকে স্বাগতম। আমি আপনার অনুগত এআই অ্যাসিস্ট্যান্ট।\n\nআমাদের ফোরামের আলোচনা অনুসন্ধান, টেকনিক্যাল নলেজ বেস ডকুমেন্টেশন, প্ল্যাটফর্মের ফিচারসমূহ অথবা এন্টারপ্রাইজ কনসালটেন্সি সার্ভিস সম্পর্কে যেকোনো সহায়তার জন্য আমি সর্বদা প্রস্তুত। আজ আপনাকে কীভাবে সহায়তা করতে পারি?`
            : `Hello! Welcome to **Ama Community**. I am your dedicated AI Assistant, obediently at your service.\n\nI can help you search community discussions, explore technical documentation, explain Docly-inspired bbPress features, or guide you through our Enterprise Consultancy retainers. How may I assist you today?`;
          replySource = 'AI';
        } else {
          // 2. Check knowledge docs scoring
          let bestDoc: any = null;
        let bestDocScore = 0;

        for (const d of docsData.rows) {
          const dTitle = (d.title || '').toLowerCase();
          const dContent = (d.content || '').toLowerCase();
          const dCategory = (d.category || '').toLowerCase();
          let score = 0;

          if (lower.length > 4 && (dTitle.includes(lower) || dContent.includes(lower))) {
            score += 25;
          }

          for (const w of cleanWords) {
            if (dTitle.includes(w)) score += 6;
            if (dCategory.includes(w)) score += 4;
            if (dContent.includes(w)) score += 2;
          }

          if (score > bestDocScore) {
            bestDocScore = score;
            bestDoc = d;
          }
        }

        // 2. Check FAQ matching
        let bestFaq: any = null;
        let bestFaqScore = 0;

        for (const f of faqsData.rows) {
          const qLow = (f.question || '').toLowerCase();
          const aLow = (f.answer || '').toLowerCase();
          const qBnLow = (f.question_bn || '').toLowerCase();
          const aBnLow = (f.answer_bn || '').toLowerCase();
          let score = 0;

          if (lower.length > 4 && (qLow.includes(lower) || aLow.includes(lower) || qBnLow.includes(lower))) {
            score += 25;
          }

          for (const w of cleanWords) {
            if (qLow.includes(w) || qBnLow.includes(w)) score += 6;
            if (aLow.includes(w) || aBnLow.includes(w)) score += 2;
          }

          if (score > bestFaqScore) {
            bestFaqScore = score;
            bestFaq = f;
          }
        }

        if (bestDoc && bestDocScore >= 14) {
          botReply = userLang === 'bn'
            ? `নলেজ বেস থেকে তথ্য (${bestDoc.title}):\n\n${bestDoc.content}`
            : `**From Knowledge Base (${bestDoc.title}):**\n\n${bestDoc.content}`;
          replySource = 'RAG';
        } else if (bestFaq && bestFaqScore >= 14) {
          botReply = userLang === 'bn' && bestFaq.answer_bn ? bestFaq.answer_bn : bestFaq.answer;
          replySource = 'FAQ';
        } else if (/\b(demo|import|theme|docly|bbpress|wordpress)\b/i.test(lower)) {
          botReply = userLang === 'bn'
            ? 'Docly থিমে ডেমো ইম্পোর্ট করতে WordPress ড্যাশবোর্ডে Appearance > Import Demo Data অপশনে যান। bbPress প্লাগইন সক্রিয় থাকা নিশ্চিত করুন।'
            : 'To import demo content in the Docly theme, navigate to Appearance > Import Demo Data in your WordPress dashboard. Make sure bbPress is enabled!';
          replySource = 'RAG';
        } else if (/\b(delete|deleted|deleting|remove|removed|removing|permission|permissions|author|authors)\b/i.test(lower)) {
          botReply = userLang === 'bn'
            ? 'ফোরামের পোস্ট শুধুমাত্র পোস্টটির মূল লেখক (অথর) অথবা সিস্টেম অ্যাডমিনিস্ট্রেটর ডিলিট করতে পারবেন।'
            : 'Only the verified author who created the post or an authorized System Administrator has permission to delete that discussion post.';
          replySource = 'RAG';
        } else if (/\b(database|databases|postgres|postgresql|neon|sql|persist|persistence)\b/i.test(lower)) {
          botReply = userLang === 'bn'
            ? 'প্ল্যাটফর্মটি Neon PostgreSQL ডাটাবেজে রিয়েল-টাইমে সব আলোচনা, বার্তা ও সাপোর্ট টিকিট সংরক্ষণ করে।'
            : 'Our platform is securely connected to a serverless Neon PostgreSQL database with instant persistence across topics, replies, tickets, and messages.';
          replySource = 'RAG';
        } else if (/\b(consultancy|retainer|retainers|pricing|quote|quotation)\b/i.test(lower)) {
          botReply = userLang === 'bn'
            ? 'আমাদের এন্টারপ্রাইজ কনসালটেন্সি প্যাকেজে ফুলস্ট্যাক আর্কিটেকচার, কাস্টম ফোরাম ইন্টিগ্রেশন ও ডেডিকেটেড প্রায়োরিটি সাপোর্ট রয়েছে। সাইডবারের "Enterprise Consultancy" বাটনে ক্লিক করে প্রজেক্ট রিকোয়েস্ট পাঠাতে পারেন।'
            : 'Our Enterprise Retainers include custom fullstack architecture, forum optimizations, and dedicated SLA response. You can submit an inquiry through the Enterprise Consultancy modal in the sidebar!';
          replySource = 'RAG';
        } else {
          // 3. Company-specific questions or issues with no specific database record -> Auto-raise ticket
          const companyKeywords = [
            'account', 'login', 'signin', 'sign in', 'password', 'email', 'profile', 'username',
            'billing', 'invoice', 'payment', 'charge', 'refund', 'card', 'checkout', 'subscription', 'credit',
            'error', 'bug', 'glitch', 'crash', 'fail', 'broken', 'issue', 'problem', 'stuck', 'not working',
            'ticket', 'tickets', 'human', 'specialist', 'agent', 'support', 'help desk',
            'enterprise', 'contract', 'nda', 'security', 'audit', 'compliance',
            'sla', 'custom', 'feature', 'roadmap', 'api', 'webhook', 'integration',
            'ama', 'community', 'forum', 'moderator', 'banned', 'suspend', 'thread', 'reply'
          ];

          const isCompanySpecific = companyKeywords.some(k => {
            if (k.includes(' ')) {
              return lower.includes(k);
            }
            return new RegExp(`\\b${k}\\b`, 'i').test(lower);
          });

          if (isCompanySpecific) {
            const autoTicket = await createSupportTicket({
              userEmail: userEmail,
              subject: cleanMsg.slice(0, 60),
              question: cleanMsg,
              priority: lower.includes('urgent') || lower.includes('critical') || lower.includes('payment') ? 'High' : 'Normal',
              sessionId: cleanSession,
              source: 'AI_Auto'
            });
            createdTicket = autoTicket;

            botReply = userLang === 'bn'
              ? `যেহেতু এই নির্দিষ্ট বিষয়টি আমাদের বর্তমান নলেজ বেসে নথিভুক্ত নেই এবং এর জন্য সরাসরি বিশেষজ্ঞ অনুসন্ধান প্রয়োজন, তাই আমি আপনার জন্য স্বয়ংক্রিয়ভাবে একটি অফিশিয়াল সাপোর্ট টিকিট খুলেছি: **#${autoTicket.ticketNumber}**।\n\nআমাদের সাপোর্ট টিম আমাদের অফিশিয়াল ${slaHours} ঘণ্টার এসএলএ-এর মধ্যে এটি পর্যালোচনা করবে। আপনি "My Tickets" ট্যাবে এটি পর্যবেক্ষণ করতে পারেন অথবা সরাসরি **${supportEmail}**-এ ইমেইল করতে পারেন।`
              : `Because this specific inquiry is not available in our public knowledge base and requires direct investigation by our specialists, I have automatically raised an official support ticket for you: **#${autoTicket.ticketNumber}**.\n\nOur specialized engineering and support team has received your inquiry and will review it under our official ${slaHours}-hour SLA. You can track this anytime in the **"My Tickets"** tab, or email us directly at **${supportEmail}**.`;
            replySource = 'AI_AUTO_TICKET';
          } else {
            // 4. Topics outside the database or NOT related to the company -> Humbly apologize and brand the company
            botReply = userLang === 'bn'
              ? `আমি বিনীতভাবে ক্ষমা প্রার্থনা করছি, কিন্তু **আমা কমিউনিটি**-র অফিসিয়াল অ্যাসিস্ট্যান্ট হিসেবে আমি আমাদের প্ল্যাটফর্ম এবং সফটওয়্যার সার্ভিসের বাইরের বিষয়ে সহায়তা করতে অপারগ।\n\n**আমা কমিউনিটি** হলো ডেভেলপার ও ডিজিটাল নোম্যাডদের জন্য একটি আধুনিক প্ল্যাটফর্ম—যেখানে রয়েছে রিয়েল-টাইম নিয়ন পোস্টগ্রেসকিউএল ডেটাবেজ পারসিস্টেন্স, ডকলি বিবিপ্রেস ডিসকাশন ফোরাম এবং এন্টারপ্রাইজ কনসালটেন্সি সল্যুশন।\n\nআমাদের ফোরামের টপিক, টেকনিক্যাল গাইড কিংবা কনসালটেন্সি সম্পর্কিত যেকোনো বিষয়ে সহায়তা করতে আমি সর্বদা প্রস্তুত আছি!`
              : `I humbly apologize, but as the dedicated assistant for **Ama Community**, I am unable to assist with topics outside of our platform, developer discussions, and software services.\n\n**Ama Community** is a modern forum and knowledge hub built for developers and digital nomads—featuring real-time Neon PostgreSQL database persistence, seamless Docly bbPress community discussions, and comprehensive Enterprise Full-Stack Consultancy.\n\nPlease let me know how I can assist you with our community discussions, platform guides, technical stack, or consultancy services!`;
            replySource = 'AI';
          }
        }
      }
    }

      // 4. Save bot response to DB ONLY IF user is authenticated. If GUEST, do NOT save to database.
      const botMsgId = `msg-${Date.now()}-b`;
      if (!isGuest) {
        await pool.query(`
          INSERT INTO support_messages (id, session_id, user_email, user_id, sender, message, source)
          VALUES ($1, $2, $3, $4, 'bot', $5, $6)
        `, [botMsgId, cleanSession, cleanEmail, cleanUserId, botReply, replySource]);
      }

      res.status(201).json({
        userMessage: { id: userMsgId, sender: 'user', message: cleanMsg, source: 'USER', time: 'Just now' },
        botReply: { id: botMsgId, sender: 'bot', message: botReply, source: replySource, time: 'Just now' },
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
        SELECT id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
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
        RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
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
      const result = await pool.query(`
        SELECT 
          session_id as "sessionId",
          COUNT(*) as "messageCount",
          MAX(created_at) as "lastActive",
          (SELECT message FROM support_messages sm2 WHERE sm2.session_id = sm.session_id ORDER BY created_at DESC LIMIT 1) as "lastMessage",
          (SELECT sender FROM support_messages sm3 WHERE sm3.session_id = sm.session_id ORDER BY created_at DESC LIMIT 1) as "lastSender"
        FROM support_messages sm
        GROUP BY session_id
        ORDER BY MAX(created_at) DESC
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

      const msgId = `msg-${Date.now()}-staff`;
      const staffSender = staffName || 'Support Specialist';
      const insertRes = await pool.query(`
        INSERT INTO support_messages (id, session_id, sender, message, source)
        VALUES ($1, $2, 'bot', $3, 'STAFF')
        RETURNING id, sender, message, source, created_at as "createdAt"
      `, [msgId, sessionId, `[${staffSender}]: ${message.trim()}`]);

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

      // 1. If an OpenAI API key is present, use it for AI-powered chunk extraction
      // (with model failover/retry). This replaced the previous Gemini-based
      // extraction for this endpoint because Google's "AQ." auth-key rollout
      // currently breaks simple API-key auth against generativelanguage.googleapis.com
      // — see https://discuss.ai.google.dev for the ongoing issue. Gemini is still
      // used elsewhere in this app (the support chat pipeline) and is untouched.
      if (process.env.OPENAI_API_KEY) {
        extractedChunks = await runOpenAIKnowledgeExtraction(fileData, cleanFileName, cleanMime, cleanCategory);
      }
      // 2. High-quality intelligent fallback extraction if Gemini is unavailable/failed.
      // IMPORTANT: this must never decode arbitrary binary (PDF, DOCX, images) as UTF-8 —
      // that previously produced "chunks" made of raw PDF/DOCX file structure bytes
      // (e.g. "%PDF-1.4", "1 0 obj") instead of an error, which looked like a working
      // but very dumb extraction rather than a failure.
      if (extractedChunks.length === 0) {
        const { text: textToChunk, unsupported } = await extractRawTextFromUpload(fileData, cleanFileName, cleanMime);
        const baseTitle = cleanFileName.replace(/\.[^/.]+$/, '');

        if (unsupported) {
          return res.status(422).json({
            error: `AI extraction failed for "${cleanFileName}" and this file type has no offline fallback (scanned images and legacy .doc files need working AI extraction). Check the server logs for the AI extraction error (invalid OPENAI_API_KEY, retired model, or quota), or re-save the file as PDF/DOCX/TXT/MD and try again.`
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

      // 3. If autoSave is enabled, persist chunks directly into PostgreSQL
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
        extractedChunksCount: extractedChunks.length,
        chunks: extractedChunks,
        savedDocs: savedDocs
      });
    } catch (err: any) {
      console.error('File knowledge extraction failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: AI Real-Time Knowledge & RAG Status
  app.get('/api/admin/support/ai-knowledge-status', async (_req, res) => {
    try {
      const faqsCount = await pool.query(`SELECT COUNT(*) FROM faqs WHERE status = 'published'`);
      const chunksCount = await pool.query(`SELECT COUNT(*) FROM knowledge_documents WHERE status = 'published'`);
      const topicsCount = await pool.query(`SELECT COUNT(*) FROM topics`);
      const settingsData = await pool.query(`SELECT value FROM settings WHERE key = 'platform'`);
      const platform = settingsData.rows[0]?.value || {};

      res.json({
        totalFaqs: parseInt(faqsCount.rows[0].count, 10),
        totalChunks: parseInt(chunksCount.rows[0].count, 10),
        totalTopics: parseInt(topicsCount.rows[0].count, 10),
        platformBrand: platform.forumName || 'Trek Community',
        primaryEmail: platform.primarySupportEmail || 'support@trekcommunities.com',
        lastSyncedAt: new Date().toISOString(),
        liveSyncStatus: 'ACTIVE',
        activeAiModel: platform.activeAiModel || 'gemini-2.5-flash',
        aiProvider: platform.aiProvider || 'auto',
        aiTemperature: typeof platform.aiTemperature === 'number' ? platform.aiTemperature : 0.2,
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AQ.')),
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
        models: [
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

        const qLower = queryText.toLowerCase().trim();

        // 1. Check direct FAQs
        const matchedFaq = faqsData.rows.find((f: any) => {
          const fq = (f.question || '').toLowerCase();
          return qLower.includes(fq) || (fq.length > 8 && qLower.includes(fq.slice(0, 15)));
        });
        if (matchedFaq) {
          return `**${matchedFaq.question}** (${matchedFaq.category}):\n${matchedFaq.answer}`;
        }

        // 2. Semantic word overlap search in knowledge_documents
        const terms = qLower.split(/\s+/).filter(t => t.length > 3);
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

        return `Trek Consultancy provides end-to-end foreign business setup in Saudi Arabia (MISA licensing, 100% foreign ownership, Commercial Registration, corporate banking), custom software & ERP development, and investor visa services. Reach our advisory team directly via WhatsApp (${platform.whatsapp || '+966 50 241 1744'}) or email (${platform.primarySupportEmail || 'contact@trekconsultancy.com'}).`;
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

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Note: dotenv.config() and the env.txt/.env.example fallback loading were
// already run above (inlined from the former db.ts) when this module was
// first imported, so it's not repeated here.

// Reuse the same Express app + DB pool across warm invocations of this
// serverless function instead of rebuilding it on every request.
let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!appPromise) {
      appPromise = createApp();
    }
    const app = await appPromise;

    // Determine the requested route path in Vercel's serverless environment
    let targetUrl = req.url || '/api';

    // If Vercel rewrote /api/... to /api and stored the subpath in req.query.path
    if (req.query && req.query.path) {
      const subPath = Array.isArray(req.query.path)
        ? req.query.path.join('/')
        : String(req.query.path);

      try {
        const urlObj = new URL(targetUrl, 'http://localhost');
        urlObj.searchParams.delete('path');
        const search = urlObj.search;
        targetUrl = `/api/${subPath.replace(/^\/+/, '')}${search}`;
      } catch {
        targetUrl = `/api/${subPath.replace(/^\/+/, '')}`;
      }
    } else if (typeof req.headers['x-matched-path'] === 'string' && req.headers['x-matched-path'].startsWith('/api/')) {
      targetUrl = req.headers['x-matched-path'];
    }

    // Ensure /api prefix is present for Express route matching
    if (!targetUrl.startsWith('/api')) {
      targetUrl = '/api' + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
    }

    req.url = targetUrl;

    return await new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      res.on('error', (err) => reject(err));

      app(req, res);
    });
  } catch (err: any) {
    // Reset appPromise so subsequent invocations can recover if a transient error occurred
    appPromise = null;
    console.error('[Vercel Serverless Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err?.message || 'Failed to process request in serverless function'
      });
    }
  }
}
