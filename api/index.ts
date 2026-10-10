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

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import zlib from 'node:zlib';

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
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;

const rawConnectionString = process.env.DATABASE_URL?.trim();
const connectionString = rawConnectionString ? rawConnectionString.replace(/^["']|["']$/g, '') : undefined;

if (!connectionString) {
  console.warn(
    '[Database] Warning: DATABASE_URL is not set. Database mock fallback is active.'
  );
}

export const defaultSettings = {
  forumName: 'Trek Consultancy Forum',
  forumTagline: 'The official community forum and support portal for Trek Consultancy',
  enableGuestPosting: true,
  enableAutoModeration: true,
  announcementText: '',
  showAnnouncement: false,
  primarySupportEmail: 'support@trekconsultancy.com',
  slaHours: 24,
  floatingSupportEnabled: true,
  floatingSupportTagTextEn: 'Support Assistant & FAQs',
  floatingSupportTagTextBn: '২৪/৭ সাপোর্ট চ্যাট ও হেল্প',
  floatingSupportGreetingEn: 'Hello! How can our support team & AI assist your Trek Consultancy journey today?',
  floatingSupportGreetingBn: 'নমস্কার! আমাদের সাপোর্ট টিম ও এআই অ্যাসিস্ট্যান্ট কীভাবে আপনাকে সহায়তা করতে পারে?',
  floatingSupportAiEnabled: true,
  floatingSupportDefaultPriority: 'Normal',
};

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
];

export function getRandomAvatar(seed?: string): string {
  if (seed && seed.trim()) {
    const clean = seed.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % DEFAULT_AVATARS.length;
    return DEFAULT_AVATARS[idx];
  }
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
}

export const defaultHeroSettings = {
  slides: [
    {
      id: 'slide-1',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      title: 'Enterprise Architecture & Cloud Systems',
      subtitle: 'Designing scalable, mission-critical platforms with modern resilience.',
      isActive: true
    },
    {
      id: 'slide-2',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
      title: 'Global Technology Strategy & Community Advisory',
      subtitle: 'Collaborative problem solving with leading senior engineers.',
      isActive: true
    },
    {
      id: 'slide-3',
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80',
      title: 'Performance Engineering & High-Traffic Optimization',
      subtitle: 'Turnkey solutions for database scaling, APIs, and microservices.',
      isActive: true
    }
  ],
  autoplay: true,
  intervalSeconds: 6,
  overlayOpacity: 0.65,
  overlayGradient: 'violet-dark',
  transitionEffect: 'fade',
  title: 'Welcome to Trek Consultancy Forum',
  subtitle: 'The official community forum and support portal for Trek Consultancy',
  searchPlaceholder: 'Search for Topics, Solutions, & Guides....',
  enableOverlayMesh: true,
  heroHeight: 'tall'
};

export const defaultDiscussionCategories = [
  'Business Setup',
  'Corporate Support',
  'Visa & PRO',
  'Real Estate',
  'Software & Digital',
  'General Discussion',
  'Cloud Architecture',
  'DevOps & CI/CD',
  'Enterprise Security',
  'Docly Theme Support',
  'Feedback Suggestions'
];

export const defaultStaffRoles = [
  { name: 'Administrator', badgeLabel: 'Admin', color: 'indigo' },
  { name: 'Lead Architect', badgeLabel: 'Architect', color: 'teal' },
  { name: 'Support Team', badgeLabel: 'Staff', color: 'emerald' },
  { name: 'Theme Specialist', badgeLabel: 'Specialist', color: 'blue' },
  { name: 'Moderator', badgeLabel: 'Mod', color: 'purple' },
  { name: 'Community Lead', badgeLabel: 'Lead', color: 'amber' },
  { name: 'Senior Consultant', badgeLabel: 'Consultant', color: 'rose' }
];

export const defaultSeoSettings = {
  metaTitle: 'Trek Consultancy Forum - Discussion Community & Support Portal',
  titleSeparator: ' - ',
  metaDescription: 'The official community discussion forum and enterprise services portal for Trek Consultancy. Expert advisory in Saudi business setup, custom software, visas, and corporate compliance.',
  metaKeywords: 'Trek Consultancy, Saudi business setup, MISA investment license, Commercial Registration CR, custom software ERP, corporate compliance, Riyadh advisory, Saudi Arabia company formation',
  canonicalUrl: 'https://trekconsultancy.com',
  siteName: 'Trek Consultancy Forum',
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: 'Trek Consultancy Forum - Discussion Community & Support Portal',
  ogDescription: 'The official community discussion forum and enterprise services portal for Trek Consultancy. Connecting developers, entrepreneurs, and senior advisors.',
  ogImage: '/trek-logo.webp',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@trekconsultancy',
  twitterCreator: '@trekconsultancy',
  googleSiteVerification: '',
  bingSiteVerification: '',
  organizationName: 'Trek Consultancy',
  organizationLogo: '/trek-logo.webp',
  contactEmail: 'support@trekconsultancy.com',
  contactPhone: '+966 50 000 0000',
  customHeadTags: ''
};

export const DEFAULT_PROVIDER_BASE_URLS: Record<string, string> = {
  gemini: 'https://generativelanguage.googleapis.com',
  openai: 'https://api.openai.com/v1'
};

export const TOP_AI_MODELS = [
  // Google Gemini (Gemini 3 Family)
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    tagline: 'Flagship workhorse with long-horizon reasoning & agentic execution (Google Default)',
    speed: 'Ultra Fast',
    intelligence: 'Very High',
    contextWindow: '1M Tokens',
    badge: 'DEFAULT',
    badgeColor: 'emerald',
    capabilities: ['General Support', 'Enterprise Advisory', 'Agentic Workflows', 'Multilingual'],
    description: 'Google state-of-the-art workhorse model optimized for high-speed multi-step reasoning, customer support, and autonomous assistance.'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    tagline: 'Deep thinking & complex corporate advisory',
    speed: 'Moderate',
    intelligence: 'Maximum',
    contextWindow: '2M Tokens',
    badge: 'MAX REASONING',
    badgeColor: 'indigo',
    capabilities: ['Statutory Compliance', 'MISA Licensing', 'Contract Analysis', 'Complex Logic'],
    description: 'Designed for intricate business consulting, statutory compliance, legal frameworks, and executive decision-making with a massive 2M token context window.'
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    tagline: 'Advanced reasoning with high-throughput response speed',
    speed: 'Very Fast',
    intelligence: 'Very High',
    contextWindow: '1M Tokens',
    badge: 'FAST REASONING',
    badgeColor: 'purple',
    capabilities: ['High Throughput', 'Multi-step Logic', 'Fast Response'],
    description: 'Frontier reasoning model combining deep analysis with low latency for interactive client consultations.'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'gemini',
    tagline: 'Balanced, highly efficient multimodal intelligence',
    speed: 'Fast',
    intelligence: 'High',
    contextWindow: '1M Tokens',
    badge: 'BALANCED',
    badgeColor: 'slate',
    capabilities: ['Community Support', 'Knowledge Retrieval', 'Multilingual'],
    description: 'Reliable and cost-effective daily driver for customer conversations and FAQ document indexing.'
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    provider: 'gemini',
    tagline: 'Ultra-low latency lightweight intelligence for instant chat',
    speed: 'Instant',
    intelligence: 'Standard',
    contextWindow: '1M Tokens',
    badge: 'ULTRA FAST',
    badgeColor: 'teal',
    capabilities: ['Instant Reply', 'FAQ Matching', 'High Concurrency'],
    description: 'Extremely lightweight, instantaneous model engineered for rapid-fire chat widgets and high-concurrency traffic.'
  },

  // OpenAI
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'openai',
    tagline: 'OpenAI Flagship Multimodal Model',
    speed: 'Fast',
    intelligence: 'Very High',
    contextWindow: '128K Tokens',
    badge: 'FLAGSHIP',
    badgeColor: 'emerald',
    capabilities: ['Executive Advisory', 'Deep Reasoning', 'Multilingual Mastery'],
    description: 'OpenAI flagship model with state-of-the-art conversational reasoning.'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    tagline: 'Fast, affordable & smart daily driver',
    speed: 'Very Fast',
    intelligence: 'High',
    contextWindow: '128K Tokens',
    badge: 'POPULAR',
    badgeColor: 'emerald',
    capabilities: ['Customer Support', 'FAQ RAG', 'Low Latency'],
    description: 'Exceptional balance of speed, cost efficiency, and consulting intelligence.'
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    tagline: 'High-speed reasoning model',
    speed: 'Moderate',
    intelligence: 'Maximum',
    contextWindow: '200K Tokens',
    badge: 'REASONING',
    badgeColor: 'indigo',
    capabilities: ['Complex Legal Analysis', 'Statutory Compliance', 'Logic'],
    description: 'Specialized logical reasoning model designed for deep legal and business analysis.'
  },
  {
    id: 'o1',
    name: 'o1 (Reasoning Flagship)',
    provider: 'openai',
    tagline: 'Frontier reasoning for hard problems',
    speed: 'Deliberate',
    intelligence: 'Maximum',
    contextWindow: '200K Tokens',
    badge: 'MAX REASONING',
    badgeColor: 'indigo',
    capabilities: ['Advanced Regulatory Analysis', 'Contractual Frameworks', 'Strategic Planning'],
    description: 'Deep-thinking reasoning model designed for maximum problem-solving fidelity.'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    tagline: 'High-accuracy enterprise workhorse',
    speed: 'Fast',
    intelligence: 'High',
    contextWindow: '128K Tokens',
    badge: 'ENTERPRISE',
    badgeColor: 'slate',
    capabilities: ['Enterprise Consulting', 'Structured Parsing', 'Reliable'],
    description: 'Proven high-precision model for business operations and advisory.'
  }
];

export const defaultAiSettings = {
  provider: 'gemini',
  apiKey: '',
  baseUrl: '',
  providerApiKeys: {} as Record<string, string>,
  selectedModel: 'gemini-3.8-flash',
  fallbackModels: ['gemini-3.7-flash', 'gemini-3.5-flash', 'gpt-4o-mini', 'gpt-4o'],
  temperature: 0.4,
  maxOutputTokens: 2048,
  customSystemInstruction: '',
  status: 'active',
  lastTestStatus: 'untested'
};

// Real Pool instance and Neon stateless HTTP client
let realPool: any = null;
let neonSql: any = null;

if (connectionString) {
  try {
    neonSql = neon(connectionString, { fullResults: true });
  } catch (err: any) {
    console.warn('[Database] Failed to initialize Neon HTTP client:', err?.message || err);
  }

  try {
    realPool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });
    realPool.on('error', (err: any) => {
      const msg = err?.message || err?.detail || err?.reason || String(err);
      console.warn('[Database] Neon pool client warning:', msg);
    });
  } catch (err) {
    console.warn('[Database] Failed to initialize Neon Pool:', err);
  }
}

export function formatDbError(err: any): string {
  if (!err) return 'Unknown database error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.detail) return `${err.code || 'DB_ERROR'}: ${err.detail}`;
  if (err.reason) return err.reason;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// Resilient pool wrapper that queries Neon PostgreSQL and falls back gracefully if offline/unconfigured
export const pool = {
  query: async (text: string | any, params?: any[]): Promise<{ rows: any[]; rowCount?: number }> => {
    const queryText = typeof text === 'string' ? text : text?.text;
    const queryParams = params ?? (typeof text === 'object' ? text?.values : undefined);

    // Primary execution path: Neon stateless HTTP driver (immune to WebSocket disconnects, 1006 drops & pool saturation)
    if (neonSql && typeof queryText === 'string') {
      try {
        const result = queryParams && queryParams.length > 0
          ? await neonSql(queryText, queryParams)
          : await neonSql(queryText);
        return {
          rows: result.rows || [],
          rowCount: result.rowCount ?? result.rows?.length ?? 0
        };
      } catch (httpErr: any) {
        const isMulti = httpErr?.message?.includes('cannot insert multiple commands');
        if (!isMulti) {
          // Automatic single retry for transient network hiccups
          try {
            await new Promise((resolve) => setTimeout(resolve, 120));
            const retryRes = queryParams && queryParams.length > 0
              ? await neonSql(queryText, queryParams)
              : await neonSql(queryText);
            return {
              rows: retryRes.rows || [],
              rowCount: retryRes.rowCount ?? retryRes.rows?.length ?? 0
            };
          } catch (retryErr: any) {
            httpErr = retryErr;
          }
        }

        // Secondary fallback to realPool if available
        if (realPool) {
          try {
            return await realPool.query(text, params);
          } catch {
            // Let original error or pool error handle below
          }
        }

        const errMsg = formatDbError(httpErr);
        console.error('[Database] Query failed:', errMsg, '\nQuery:', typeof queryText === 'string' ? queryText.slice(0, 200) : queryText);
        if (typeof queryText === 'string' && queryText.includes('FROM settings')) {
          console.warn('[Database] Falling back to default settings after query failure.');
          return { rows: [{ key: 'platform', value: defaultSettings }], rowCount: 1 };
        }
        throw httpErr;
      }
    }

    // Secondary execution path: realPool (WebSocket connection)
    if (realPool) {
      try {
        return await realPool.query(text, params);
      } catch (err: any) {
        const errMsg = formatDbError(err);
        console.error('[Database] Query failed:', errMsg, '\nQuery:', typeof queryText === 'string' ? queryText.slice(0, 200) : queryText);
        if (typeof queryText === 'string' && queryText.includes('FROM settings')) {
          console.warn('[Database] Falling back to default settings after query failure.');
          return { rows: [{ key: 'platform', value: defaultSettings }], rowCount: 1 };
        }
        throw err;
      }
    }

    if (typeof queryText === 'string' && queryText.includes('FROM settings')) {
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

      // ========================================================================
      // CLEAN ARCHITECTURAL SCHEMA INITIALIZATION (PostgreSQL / Neon)
      // ========================================================================

      // Vector extension for semantic AI & embeddings
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

      // ------------------------------------------------------------------------
      // DOMAIN 1: IDENTITY, CUSTOMERS & AUTHENTICATION
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id            VARCHAR(255) PRIMARY KEY,
          name          VARCHAR(255) NOT NULL,
          email         VARCHAR(255) UNIQUE NOT NULL,
          password      VARCHAR(255),
          password_hash TEXT,
          whatsapp      VARCHAR(255),
          phone         VARCHAR(255),
          role          VARCHAR(50) DEFAULT 'user',
          status        VARCHAR(32) DEFAULT 'active',
          avatar        TEXT,
          joined_date   VARCHAR(64) DEFAULT 'Recent',
          threads_count INT DEFAULT 0,
          email_verified BOOLEAN DEFAULT true,
          created_at    TIMESTAMPTZ DEFAULT NOW(),
          updated_at    TIMESTAMPTZ DEFAULT NOW(),
          last_login_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS email_verifications (
          id         VARCHAR(64) PRIMARY KEY,
          email      VARCHAR(255) NOT NULL,
          code       VARCHAR(16) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
        );
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 2: CUSTOMER CONVERSATIONS & MULTI-TURN AI CHAT
      // ------------------------------------------------------------------------
      await client.query(`
        -- Canonical conversations table (distinct sessions recognized by email/session/user)
        CREATE TABLE IF NOT EXISTS conversations (
          id            VARCHAR(255) PRIMARY KEY,
          session_id    VARCHAR(255) NOT NULL,
          user_id       VARCHAR(255),
          user_email    VARCHAR(255),
          user_whatsapp VARCHAR(255),
          user_name     VARCHAR(255),
          title         VARCHAR(255) DEFAULT 'Support Chat',
          is_guest      BOOLEAN DEFAULT TRUE,
          status        VARCHAR(50) DEFAULT 'active',
          message_count INT DEFAULT 0,
          last_message  TEXT DEFAULT '',
          last_sender   VARCHAR(50) DEFAULT '',
          created_at    TIMESTAMPTZ DEFAULT NOW(),
          updated_at    TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

        -- Canonical messages table
        CREATE TABLE IF NOT EXISTS messages (
          id              VARCHAR(255) PRIMARY KEY,
          conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          session_id      VARCHAR(255),
          role            VARCHAR(50) NOT NULL DEFAULT 'user',
          sender          VARCHAR(50) DEFAULT 'user',
          content         TEXT NOT NULL,
          message         TEXT,
          source          VARCHAR(50) NOT NULL DEFAULT 'AI',
          user_id         VARCHAR(255),
          user_email      VARCHAR(255),
          is_guest        BOOLEAN DEFAULT TRUE,
          created_at      TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

        -- Compatibility table: support_conversations
        CREATE TABLE IF NOT EXISTS support_conversations (
          id            VARCHAR(255) PRIMARY KEY,
          user_id       VARCHAR(255) DEFAULT NULL,
          user_email    VARCHAR(255) DEFAULT NULL,
          user_name     VARCHAR(255) DEFAULT NULL,
          title         VARCHAR(255) DEFAULT 'Support Chat',
          is_guest      BOOLEAN DEFAULT TRUE,
          status        VARCHAR(32) DEFAULT 'active',
          message_count INT DEFAULT 0,
          last_message  TEXT DEFAULT '',
          last_sender   VARCHAR(32) DEFAULT '',
          created_at    TIMESTAMPTZ DEFAULT NOW(),
          updated_at    TIMESTAMPTZ DEFAULT NOW()
        );

        -- Compatibility table: support_messages
        CREATE TABLE IF NOT EXISTS support_messages (
          id         VARCHAR(255) PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          sender     VARCHAR(32) NOT NULL,
          message    TEXT NOT NULL,
          source     VARCHAR(50) DEFAULT 'AI',
          user_id    VARCHAR(255) DEFAULT NULL,
          user_email VARCHAR(255) DEFAULT NULL,
          is_guest   BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 3: SUPPORT TICKETS & ESCALATIONS
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id              VARCHAR(255) PRIMARY KEY,
          ticket_number   VARCHAR(64) NOT NULL,
          user_id         VARCHAR(255),
          user_email      VARCHAR(255),
          user_whatsapp   VARCHAR(255),
          session_id      VARCHAR(255),
          conversation_id VARCHAR(255) REFERENCES conversations(id) ON DELETE SET NULL,
          subject         VARCHAR(500),
          question        TEXT NOT NULL,
          priority        VARCHAR(32) DEFAULT 'Normal',
          status          VARCHAR(50) DEFAULT 'OPEN',
          admin_answer    TEXT,
          assigned_to     VARCHAR(255) DEFAULT 'Senior Advisory Desk',
          created_at      TIMESTAMPTZ DEFAULT NOW(),
          answered_at     TIMESTAMPTZ
        );
        ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 4: KNOWLEDGE BASE, FAQS & RAG EMBEDDINGS
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS faq_categories (
          id          VARCHAR(255) PRIMARY KEY,
          name        VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at  TIMESTAMPTZ DEFAULT NOW(),
          updated_at  TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS faqs (
          id             VARCHAR(255) PRIMARY KEY,
          category_id    VARCHAR(255) REFERENCES faq_categories(id) ON DELETE SET NULL,
          question       TEXT NOT NULL,
          answer         TEXT NOT NULL,
          question_bn    TEXT,
          answer_bn      TEXT,
          status         VARCHAR(50) DEFAULT 'published',
          show_in_browse BOOLEAN DEFAULT true,
          display_order  INT DEFAULT 0,
          created_by     VARCHAR(255) DEFAULT 'System Admin',
          created_at     TIMESTAMPTZ DEFAULT NOW(),
          updated_at     TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS knowledge_documents (
          id         VARCHAR(255) PRIMARY KEY,
          title      VARCHAR(255) NOT NULL,
          content    TEXT NOT NULL,
          category   VARCHAR(100) DEFAULT 'General',
          status     VARCHAR(50) DEFAULT 'published',
          created_by VARCHAR(255) DEFAULT 'System Admin',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS knowledge_chunks (
          id          VARCHAR(255) PRIMARY KEY,
          document_id VARCHAR(255) NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
          content     TEXT NOT NULL,
          embedding   vector(1536),
          chunk_index INT NOT NULL DEFAULT 0,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 5: COMMUNITY DISCUSSIONS & FORUM
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS discussion_categories (
          id          VARCHAR(64) PRIMARY KEY,
          name        VARCHAR(255) NOT NULL UNIQUE,
          slug        VARCHAR(255) NOT NULL,
          description TEXT,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS staff_roles (
          id          VARCHAR(64) PRIMARY KEY,
          name        VARCHAR(100) NOT NULL UNIQUE,
          badge_label VARCHAR(100),
          color       VARCHAR(50) DEFAULT 'teal',
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS topics (
          id            VARCHAR(64) PRIMARY KEY,
          title         VARCHAR(500) NOT NULL,
          author        VARCHAR(255) NOT NULL,
          author_role   VARCHAR(100) DEFAULT 'Member',
          author_avatar TEXT,
          author_email  VARCHAR(255),
          author_id     VARCHAR(64),
          time_ago      VARCHAR(100) DEFAULT 'Just now',
          category      VARCHAR(255) NOT NULL,
          category_slug VARCHAR(255) NOT NULL,
          views         INT DEFAULT 0,
          likes         INT DEFAULT 0,
          replies       INT DEFAULT 0,
          is_featured   BOOLEAN DEFAULT FALSE,
          is_popular    BOOLEAN DEFAULT FALSE,
          content       TEXT NOT NULL,
          created_at    TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS replies (
          id          VARCHAR(64) PRIMARY KEY,
          topic_id    VARCHAR(64) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
          author      VARCHAR(255) NOT NULL,
          author_role VARCHAR(100) DEFAULT 'Member',
          author_avatar TEXT,
          time_ago    VARCHAR(100) DEFAULT 'Just now',
          content     TEXT NOT NULL,
          likes       INT DEFAULT 0,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 6: CONTENT & EDITORIAL
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          id            VARCHAR(64) PRIMARY KEY,
          title         VARCHAR(500) NOT NULL,
          category      VARCHAR(255) NOT NULL,
          date          VARCHAR(100) NOT NULL,
          image_url     TEXT NOT NULL,
          excerpt       TEXT NOT NULL,
          content       TEXT NOT NULL,
          author        VARCHAR(255) NOT NULL,
          author_avatar TEXT,
          likes         INT DEFAULT 0,
          created_at    TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS blog_comments (
          id            VARCHAR(64) PRIMARY KEY,
          blog_id       VARCHAR(64) NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
          author        VARCHAR(255) NOT NULL,
          author_avatar TEXT,
          author_role   VARCHAR(100) DEFAULT 'Member',
          time_ago      VARCHAR(100) DEFAULT 'Just now',
          content       TEXT NOT NULL,
          likes         INT DEFAULT 0,
          created_at    TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 7: COMMERCIAL INQUIRIES & LEADS
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS consultancy_inquiries (
          id          VARCHAR(64) PRIMARY KEY,
          company     VARCHAR(255) NOT NULL,
          email       VARCHAR(255) NOT NULL,
          scope       TEXT NOT NULL,
          date        VARCHAR(100) NOT NULL,
          status      VARCHAR(64) DEFAULT 'new',
          priority    VARCHAR(64) DEFAULT 'normal',
          assigned_to VARCHAR(255),
          notes       TEXT,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id            VARCHAR(64) PRIMARY KEY,
          email         VARCHAR(255) UNIQUE NOT NULL,
          subscribed_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // ------------------------------------------------------------------------
      // DOMAIN 8: SYSTEM CONFIGURATION & AUDIT LOGS
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          key   VARCHAR(64) PRIMARY KEY,
          value JSONB NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
          id         VARCHAR(64) PRIMARY KEY,
          action     VARCHAR(255) NOT NULL,
          actor      VARCHAR(255) NOT NULL,
          target     VARCHAR(255) NOT NULL,
          time_ago   VARCHAR(100) NOT NULL,
          type       VARCHAR(64) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // ------------------------------------------------------------------------
      // INDEXES FOR QUERY OPTIMIZATION & CUSTOMER RECOGNITION
      // ------------------------------------------------------------------------
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email_lower          ON users (LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_users_created_at           ON users (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_email_verifications_email  ON email_verifications (LOWER(email));

        CREATE INDEX IF NOT EXISTS idx_conversations_user_email   ON conversations (LOWER(user_email));
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id      ON conversations (user_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_session_id   ON conversations (session_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_updated_at   ON conversations (updated_at DESC);

        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id   ON messages (conversation_id, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_messages_session_id        ON messages (session_id, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_messages_user_email        ON messages (LOWER(user_email));

        CREATE INDEX IF NOT EXISTS idx_support_tickets_status     ON support_tickets (status, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_support_tickets_session_id ON support_tickets (session_id);
        CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email ON support_tickets (LOWER(user_email));
        CREATE INDEX IF NOT EXISTS idx_support_tickets_conv_id    ON support_tickets (conversation_id);

        CREATE INDEX IF NOT EXISTS idx_faqs_status_order          ON faqs (status, display_order ASC, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_faqs_category_id           ON faqs (category_id);
        CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status      ON knowledge_documents (status, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc_id    ON knowledge_chunks (document_id);

        CREATE INDEX IF NOT EXISTS idx_topics_category_slug       ON topics (category_slug);
        CREATE INDEX IF NOT EXISTS idx_topics_created_at          ON topics (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_replies_topic_id           ON replies (topic_id, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id      ON blog_comments (blog_id, created_at ASC);

        DO $$
        BEGIN
          BEGIN
            CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw
              ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
          EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping HNSW index on vector: %', SQLERRM;
          END;
        END $$;
      `);

      // ------------------------------------------------------------------------
      // SEED BASELINE SETTINGS IF MISSING
      // ------------------------------------------------------------------------
      const settingsCheck = await client.query("SELECT value FROM settings WHERE key = 'platform'");
      if (settingsCheck.rows.length === 0) {
        await client.query("INSERT INTO settings (key, value) VALUES ('platform', $1)", [JSON.stringify(defaultSettings)]);
      }

      const heroCheck = await client.query("SELECT value FROM settings WHERE key = 'hero'");
      if (heroCheck.rows.length === 0) {
        await client.query("INSERT INTO settings (key, value) VALUES ('hero', $1)", [JSON.stringify(defaultHeroSettings)]);
      }

      const seoCheck = await client.query("SELECT value FROM settings WHERE key = 'seo'");
      if (seoCheck.rows.length === 0) {
        await client.query("INSERT INTO settings (key, value) VALUES ('seo', $1)", [JSON.stringify(defaultSeoSettings)]);
      }

      const aiCheck = await client.query("SELECT value FROM settings WHERE key = 'ai'");
      if (aiCheck.rows.length === 0) {
        await client.query("INSERT INTO settings (key, value) VALUES ('ai', $1)", [JSON.stringify(defaultAiSettings)]);
      }

      // Seed discussion categories if table is empty
      const catCount = await client.query('SELECT COUNT(*) FROM discussion_categories');
      if (parseInt(catCount.rows[0].count, 10) === 0) {
        for (const name of defaultDiscussionCategories) {
          const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await client.query(
            'INSERT INTO discussion_categories (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
            [id, name, slug]
          );
        }
      }

      // Seed staff roles if table is empty
      const roleCount = await client.query('SELECT COUNT(*) FROM staff_roles');
      if (parseInt(roleCount.rows[0].count, 10) === 0) {
        for (const role of defaultStaffRoles) {
          const id = `role-${role.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          await client.query(
            'INSERT INTO staff_roles (id, name, badge_label, color) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
            [id, role.name, role.badgeLabel, role.color]
          );
        }
      }

      console.log('[Database] PostgreSQL schema initialized cleanly on Neon.');
    } catch (err: any) {
      initDbPromise = null;
      console.error('[Database] Initialization error:', formatDbError(err));
      throw err;
    } finally {
      client?.release?.();
    }
  })();

  return initDbPromise;
}

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Unified Business Memory & Knowledge Core (Inlined for Vercel Serverless)
// ---------------------------------------------------------------------------
export interface BusinessIdentity {
  name: string;
  brand: string;
  tagline: string;
  headquarters: string;
  internationalDesk: string;
  foundedEra: string;
  foundingStoryEn: string;
  foundingStoryBn: string;
  officialEmail: string;
  slaHours: number;
  responsibleTeams: {
    saudiAdvisoryAndLegal: string;
    saudiAdvisoryAndLegalBn: string;
    techAndEngineering: string;
    techAndEngineeringBn: string;
    proAndVisa: string;
    proAndVisaBn: string;
    financeAndTax: string;
    financeAndTaxBn: string;
    realEstate: string;
    realEstateBn: string;
  };
}

export interface BusinessPillar {
  id: number;
  code: string;
  title: string;
  titleBn: string;
  tagline: string;
  responsibleTeam: string;
  turnaroundTime: string;
  highlights: string[];
  summaryEn: string;
  summaryBn: string;
}

export interface IndexedFaq {
  id: string;
  question: string;
  questionBn?: string;
  questionAr?: string;
  answer: string;
  answerBn?: string;
  answerAr?: string;
  category: string;
  significantTokens: string[];
}

export interface IndexedKnowledgeDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  significantTokens: string[];
}

export interface VerifiedTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  question: string;
  adminAnswer: string;
  assignedTo: string;
  significantTokens: string[];
}

export interface CompiledBusinessMemory {
  version: number;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  identity: BusinessIdentity;
  pillars: BusinessPillar[];
  faqs: IndexedFaq[];
  knowledgeDocs: IndexedKnowledgeDoc[];
  verifiedTickets: VerifiedTicket[];
  quickFacts: {
    foreignOwnershipPct: string;
    misaLicenseDays: string;
    crIssuanceDays: string;
    bankAccountDays: string;
    vatStandardPct: string;
    corporateTaxPct: string;
    headquartersCity: string;
  };
  totalMemoryNodes: number;
}

export const CANONICAL_BUSINESS_IDENTITY: BusinessIdentity = {
  name: 'Trek Consultancy',
  brand: 'Trek Consultancy Forum',
  tagline: 'Premier Corporate Advisory & Enterprise Software Engineering',
  headquarters: 'King Fahd Road, Riyadh, Kingdom of Saudi Arabia',
  internationalDesk: 'Dhaka, Bangladesh',
  foundedEra: 'Established to accelerate Saudi Vision 2030 corporate market expansion',
  foundingStoryEn: 'Trek Consultancy was established to empower international entrepreneurs, foreign corporate investors, and technology founders expanding into Saudi Arabia under the Kingdom’s Vision 2030 economic transformation. Headquartered on King Fahd Road in Riyadh with an international liaison desk in Dhaka, Trek Consultancy provides end-to-end, turnkey company formation, accredited MISA licensing, and in-house enterprise software engineering.',
  foundingStoryBn: 'ট্রেক কনসালটেন্সি (Trek Consultancy) সৌদি আরবের ভিশন ২০৩০ (Vision 2030) অর্থনৈতিক রূপান্তরের অংশ হিসেবে আন্তর্জাতিক উদ্যোক্তা, করপোরেট বিনিয়োগকারী এবং প্রযুক্তি সংস্থাগুলোকে সৌদি বাজারে প্রাতিষ্ঠানিক বিস্তার ও ব্যবসা প্রতিষ্ঠায় সহায়তা করার লক্ষ্যে যাত্রা শুরু করে। আমাদের প্রধান কার্যালয় সৌদি আরবের রিয়াদে (কিং ফাহাদ রোড) এবং আন্তর্জাতিক লিয়াজোঁ অফিস ঢাকায় অবস্থিত। শুরু থেকেই আমরা ১০০% বিদেশি মালিকানাধীন কোম্পানি গঠন, MISA ইনভেস্টমেন্ট লাইসেন্সিং এবং নিজস্ব টেক ডিভিশনের মাধ্যমে কাস্টম সফটওয়্যার ইঞ্জিনিয়ারিং সেবা সফলভাবে প্রদান করে আসছি।',
  officialEmail: 'support@trekconsultancy.com',
  slaHours: 24,
  responsibleTeams: {
    saudiAdvisoryAndLegal: 'Trek Senior Advisory & Legal Desk in Riyadh (Accredited Saudi corporate lawyers and government liaisons managing MISA licensing, Ministry of Commerce Commercial Registration, Articles of Association, and notary public attestations)',
    saudiAdvisoryAndLegalBn: 'ট্রেক রিয়াদ সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (অনুমোদিত সৌদি আইনজীবী ও সরকারি লিয়াজোঁ টিম, যারা সরাসরি MISA ইনভেস্টমেন্ট লাইসেন্স, বাণিজ্য মন্ত্রণালয় থেকে সিআর, AoA এবং নোটারি সত্যায়ন সম্পন্ন করেন)',
    techAndEngineering: 'In-House Software & Digital Engineering Division (Specializing in enterprise ERPs, cloud architecture, AI automation, and custom web/mobile platforms)',
    techAndEngineeringBn: 'ইন-হাউস সফটওয়্যার ও ডিজিটাল ইঞ্জিনিয়ারিং ডিভিশন (কাস্টম ইআরপি, ক্লাউড আর্কিটেকচার, এআই এবং ওয়েব/মোবাইল অ্যাপস তৈরিতে বিশেষজ্ঞ)',
    proAndVisa: 'Government PRO & Visa Liaison Desk (Managing investor visas, executive Iqama issuance & renewals, and Qiwa/Muqeem portals)',
    proAndVisaBn: 'সরকারি পিআরও ও ভিসা লিয়াজোঁ ডেস্ক (ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, ইকামা প্রসেসিং এবং Qiwa ও Muqeem পোর্টাল ব্যবস্থাপনা)',
    financeAndTax: 'Corporate Support, Accounting & Tax Compliance Desk (Managing ZATCA Phase 2 e-invoicing, quarterly VAT returns, IFRS bookkeeping, and statutory audits)',
    financeAndTaxBn: 'কর্পোরেট একাউন্টিং ও ট্যাক্স কমপ্লায়েন্স ডেস্ক (ZATCA ফেজ ২ ই-ইনভয়েসিং, ভ্যাট ফাইলিং, আইএফআরএস হিসাবরক্ষণ ও অডিট রিপোর্ট)',
    realEstate: 'Commercial Real Estate Advisory Desk (Certified commercial leases Ejari, prime Riyadh/Jeddah office spaces, and industrial park warehousing)',
    realEstateBn: 'বাণিজ্যিক রিয়েল এস্টেট ডেস্ক (Ejari নিবন্ধিত বাণিজ্যিক অফিস স্পেস, রিয়াদ/জেদ্দায় প্রিমিয়াম অফিস এবং ইন্ডাস্ট্রিয়াল ওয়্যারহাউস লিজ)'
  }
};

export const CANONICAL_PILLARS: BusinessPillar[] = [
  {
    id: 1,
    code: 'pillar-1',
    title: 'Saudi Business Setup',
    titleBn: 'সৌদি বিজনেস সেটআপ',
    tagline: '100% Foreign Ownership & Turnkey MISA Company Formation',
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.saudiAdvisoryAndLegal,
    turnaroundTime: '2 to 4 weeks total (MISA License: 3-7 days, CR: 2-3 days)',
    highlights: [
      '100% Foreign Ownership under Vision 2030 (no local sponsor required)',
      'Ministry of Investment (MISA) Foreign Investment License issuance',
      'Ministry of Commerce Commercial Registration (CR)',
      'Articles of Association (AoA) ratified via authorized notary public',
      'Corporate Bank Account Opening & National Address (SPL) registration'
    ],
    summaryEn: 'Complete turnkey incorporation for international companies and foreign entrepreneurs. Trek Consultancy handles everything from initial document attestation and MISA licensing to Commercial Registration, Chamber of Commerce membership, and corporate banking.',
    summaryBn: 'বিদেশি উদ্যোক্তা ও আন্তর্জাতিক কোম্পানিগুলোর জন্য কোনো স্থানীয় সৌদি স্পন্সর ছাড়াই ১০০% বিদেশি মালিকানাধীন কোম্পানি গঠন। MISA ইনভেস্টমেন্ট লাইসেন্স, বাণিজ্য মন্ত্রণালয় (MoC) থেকে সিআর, নোটারি পাবলিকের মাধ্যমে AoA অনুমোদন এবং কর্পোরেট ব্যাংক অ্যাকাউন্ট খোলা।'
  },
  {
    id: 2,
    code: 'pillar-2',
    title: 'Software & Digital Engineering',
    titleBn: 'সফটওয়্যার ও ডিজিটাল সলিউশনস',
    tagline: 'Enterprise ERPs, Custom Web/Mobile Apps & Cloud Architecture',
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.techAndEngineering,
    turnaroundTime: 'Agile sprints; 2-4 weeks MVP delivery',
    highlights: [
      'Custom Enterprise ERP and business workflow automation',
      'Scalable Web & Mobile Application Development (React, TypeScript, Node.js)',
      'Resilient Cloud Infrastructure & Microservices (AWS, Neon PostgreSQL, Docker)',
      'AI-driven customer support chatbots and business process automation'
    ],
    summaryEn: 'In-house digital powerhouse designing mission-critical enterprise systems, custom ERPs, high-traffic SaaS portals, and automated business workflows.',
    summaryBn: 'ট্রেকের নিজস্ব টেক ডিভিশন দ্বারা আধুনিক এন্টারপ্রাইজ ERP, কাস্টম ওয়েব ও মোবাইল অ্যাপ্লিকেশন, ক্লাউড আর্কিটেকচার এবং এআই অটোমেশন তৈরি।'
  },
  {
    id: 3,
    code: 'pillar-3',
    title: 'Visa & Saudi PRO Government Liaison',
    titleBn: 'ভিসা ও সরকারি PRO সেবা',
    tagline: 'Investor Visas, Executive Iqamas & Ministry Portals',
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.proAndVisa,
    turnaroundTime: 'Visas in 5-10 days; Iqama issuance in 3-5 days',
    highlights: [
      'Investor Visas and General Manager entry permits',
      'Resident Identity (Iqama) issuance and annual renewals',
      'Qiwa and Muqeem governmental portal administration',
      'Saudi Embassy, MOFA, and Chamber of Commerce legal attestations'
    ],
    summaryEn: 'Dedicated government liaison desk managing full executive mobility, work authorizations, residency permits, and institutional labor platform compliance in the Kingdom.',
    summaryBn: 'ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, রেসিডেন্ট ইকামা (Iqama) প্রসেসিং এবং Qiwa ও Muqeem প্ল্যাটফর্মের মাধ্যমে শতভাগ সরকারি কমপ্লায়েন্স নিশ্চিতকরণ।'
  },
  {
    id: 4,
    code: 'pillar-4',
    title: 'Commercial Real Estate Investment',
    titleBn: 'বাণিজ্যিক রিয়েল এস্টেট ইনভেস্টমেন্ট',
    tagline: 'Certified Office Spaces, Warehousing & Property Advisory',
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.realEstate,
    turnaroundTime: 'Office lease verification in 2-4 business days',
    highlights: [
      'Certified commercial lease (Ejari) required for CR & MISA compliance',
      'Prime office spaces across Riyadh (King Fahd Rd, Olaya), Jeddah, and Dammam',
      'Industrial and logistics park warehousing for manufacturing & trade',
      'Foreign property acquisition legal advisory'
    ],
    summaryEn: 'Strategic commercial real estate advisory facilitating verified Ejari office registrations, corporate headquarters leasing, and industrial facility procurement.',
    summaryBn: 'রিয়াদ, জেদ্দা ও দাম্মামে সিআর নিবন্ধনের জন্য বাধ্যতামূলক বাণিজ্যিক অফিস লিজ (Ejari), ওয়ারহাউস এবং বিদেশি বিনিয়োগকারীদের বৈধ সম্পত্তি ক্রয় পরামর্শ।'
  },
  {
    id: 5,
    code: 'pillar-5',
    title: 'Corporate Support, Accounting & Tax',
    titleBn: 'কর্পোরেট সাপোর্ট, একাউন্টিং ও ট্যাক্স',
    tagline: 'IFRS Bookkeeping, ZATCA Phase 2 E-Invoicing & Statutory Audits',
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.financeAndTax,
    turnaroundTime: 'Monthly bookkeeping cycles; quarterly VAT filings',
    highlights: [
      'Full-cycle monthly accounting and IFRS financial reporting',
      'ZATCA Phase 2 e-invoicing integration and quarterly VAT returns',
      'Mandatory annual statutory audit reports for license renewal',
      'Wage Protection System (WPS) and GOSI social insurance compliance'
    ],
    summaryEn: 'Comprehensive corporate financial stewardship ensuring complete regulatory compliance with ZATCA, General Authority for Zakat and Tax, and Ministry of Human Resources.',
    summaryBn: 'আইএফআরএস মান অনুযায়ী নির্ভুল মাসিক বুককিপিং, ZATCA ফেজ ২ ই-ইনভয়েসিং কমপ্লায়েন্স, ত্রৈমাসিক ভ্যাট রিটার্ন এবং লাইসেন্স নবায়নে চার্টার্ড অডিট রিপোর্ট।'
  },
  {
    id: 6,
    code: 'pillar-6',
    title: 'International Business Expansion',
    titleBn: 'আন্তর্জাতিক ব্যবসা সম্প্রসারণ',
    tagline: 'USA LLCs, UK Companies House & Tier-1 Global Banking',
    responsibleTeam: 'Trek International Liaison Desk',
    turnaroundTime: 'USA/UK incorporation in 3 to 5 business days',
    highlights: [
      'USA entity formation across Delaware, Wyoming, and Florida with IRS EIN',
      'UK Companies House incorporation with London registered office',
      'Canadian federal and provincial corporate registration',
      'Global multi-currency business banking (Mercury, Wise Business, Relay)'
    ],
    summaryEn: 'Cross-border entity formation and tier-1 banking facilitation for global founders scaling between North America, Europe, and the Middle East.',
    summaryBn: 'আমেরিকায় USA LLC ও EIN, যুক্তরাজ্যে UK Ltd এবং কানাডায় কোম্পানি গঠনসহ Mercury ও Wise Business-এ বহু-মুদ্রা কর্পোরেট অ্যাকাউন্ট সুবিধা।'
  }
];

export const CANONICAL_QUICK_FACTS = {
  foreignOwnershipPct: '100% foreign ownership permitted under Saudi Vision 2030 (no local sponsor required)',
  misaLicenseDays: '3 to 7 business days for initial MISA Investment License approval',
  crIssuanceDays: '2 to 3 business days for Commercial Registration (CR) from Ministry of Commerce',
  bankAccountDays: '1 to 2 weeks for corporate bank account opening with Saudi tier-1 banks',
  vatStandardPct: '15% standard Value Added Tax (VAT) in Saudi Arabia',
  corporateTaxPct: '20% corporate income tax on foreign-owned entities (subject to approved exemptions/credits)',
  headquartersCity: 'Riyadh, Saudi Arabia (King Fahd Road)'
};

const QUERY_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'it', 'its', 'in', 'on', 'at', 'to', 'for', 'of',
  'and', 'or', 'do', 'does', 'did', 'have', 'has', 'had', 'what', 'when', 'where', 'which', 'who',
  'why', 'how', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'my',
  'your', 'our', 'their', 'can', 'could', 'will', 'would', 'shall', 'should', 'about', 'with', 'by',
  'কি', 'কী', 'কিভাবে', 'কেন', 'কখন', 'কোথায়', 'কোন', 'এবং', 'বা', 'এর', 'একটি', 'এই', 'সেই', 'আমি', 'আপনি', 'আমরা'
]);

export function extractSignificantTokens(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !QUERY_STOPWORDS.has(t));
}

// In-memory memory cache
let cachedMemory: CompiledBusinessMemory | null = null;
let lastMemoryCompileTime = 0;
const MEMORY_CACHE_TTL_MS = 60_000; // 1 minute TTL with instant invalidation

export function invalidateBusinessMemoryCache() {
  cachedMemory = null;
  lastMemoryCompileTime = 0;
}

/**
 * Re-analyzes all PostgreSQL database tables and compiles a unified Business Memory snapshot
 */
export async function compileBusinessMemory(pool: any): Promise<CompiledBusinessMemory> {
  try {
    const [faqsRes, docsRes, settingsRes, ticketsRes] = await Promise.all([
      pool.query(`
        SELECT f.id, f.question, f.answer, f.question_bn, f.answer_bn, COALESCE(c.name, 'General') as category
        FROM faqs f
        LEFT JOIN faq_categories c ON f.category_id = c.id
        WHERE f.status = 'published' OR f.status IS NULL OR f.status = 'active'
        ORDER BY f.created_at DESC
      `),
      pool.query(`SELECT id, title, category, content FROM knowledge_documents WHERE status = 'published' ORDER BY created_at DESC LIMIT 100`),
      pool.query(`SELECT key, value FROM settings WHERE key IN ('platform', 'ai')`),
      pool.query(`SELECT id, ticket_number, subject, question, admin_answer, assigned_to FROM support_tickets WHERE admin_answer IS NOT NULL AND TRIM(admin_answer) != '' ORDER BY created_at DESC LIMIT 50`)
    ]);

    const platformSetting = settingsRes.rows.find((r: any) => r.key === 'platform')?.value || {};
    const identity: BusinessIdentity = {
      ...CANONICAL_BUSINESS_IDENTITY,
      name: platformSetting.forumName || CANONICAL_BUSINESS_IDENTITY.name,
      brand: platformSetting.forumName || CANONICAL_BUSINESS_IDENTITY.brand,
      officialEmail: platformSetting.primarySupportEmail || CANONICAL_BUSINESS_IDENTITY.officialEmail,
      slaHours: platformSetting.slaHours || CANONICAL_BUSINESS_IDENTITY.slaHours
    };

    const faqs: IndexedFaq[] = (faqsRes.rows || []).map((f: any) => ({
      id: f.id,
      question: f.question || '',
      questionBn: f.question_bn || '',
      answer: f.answer || '',
      answerBn: f.answer_bn || '',
      category: f.category || 'General',
      significantTokens: extractSignificantTokens(`${f.question} ${f.question_bn || ''}`)
    }));

    const knowledgeDocs: IndexedKnowledgeDoc[] = (docsRes.rows || []).map((d: any) => {
      const cleanContent = (d.content || '').slice(0, 1500);
      return {
        id: d.id,
        title: d.title || 'Untitled Document',
        category: d.category || 'General',
        content: d.content || '',
        summary: cleanContent.slice(0, 280),
        significantTokens: extractSignificantTokens(`${d.title} ${d.category} ${cleanContent}`)
      };
    });

    const verifiedTickets: VerifiedTicket[] = (ticketsRes.rows || []).map((t: any) => ({
      id: t.id,
      ticketNumber: t.ticket_number || '',
      subject: t.subject || '',
      question: (t.question || '').slice(0, 200),
      adminAnswer: t.admin_answer || '',
      assignedTo: t.assigned_to || 'Senior Consultant',
      significantTokens: extractSignificantTokens(`${t.subject} ${t.question}`)
    }));

    const compiled: CompiledBusinessMemory = {
      version: Date.now(),
      lastUpdated: new Date().toISOString(),
      lastUpdatedTimestamp: Date.now(),
      identity,
      pillars: CANONICAL_PILLARS,
      faqs,
      knowledgeDocs,
      verifiedTickets,
      quickFacts: CANONICAL_QUICK_FACTS,
      totalMemoryNodes: 1 + CANONICAL_PILLARS.length + faqs.length + knowledgeDocs.length + verifiedTickets.length
    };

    cachedMemory = compiled;
    lastMemoryCompileTime = Date.now();

    // Persist snapshot asynchronously to database settings table
    try {
      await pool.query(`
        INSERT INTO settings (key, value)
        VALUES ('business_memory', $1::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [JSON.stringify(compiled)]);
    } catch (saveErr) {
      console.warn('[BusinessMemory] Snapshot DB write notice:', saveErr);
    }

    return compiled;
  } catch (err: any) {
    console.error('[BusinessMemory] Memory compilation error:', err);
    const fallback: CompiledBusinessMemory = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      lastUpdatedTimestamp: Date.now(),
      identity: CANONICAL_BUSINESS_IDENTITY,
      pillars: CANONICAL_PILLARS,
      faqs: [],
      knowledgeDocs: [],
      verifiedTickets: [],
      quickFacts: CANONICAL_QUICK_FACTS,
      totalMemoryNodes: 7
    };
    cachedMemory = fallback;
    return fallback;
  }
}

/**
 * Returns active business memory from in-memory cache or database
 */
export async function getOrCompileBusinessMemory(pool: any): Promise<CompiledBusinessMemory> {
  if (cachedMemory && (Date.now() - lastMemoryCompileTime) < MEMORY_CACHE_TTL_MS) {
    return cachedMemory;
  }

  try {
    const res = await pool.query(`SELECT value FROM settings WHERE key = 'business_memory'`);
    if (res.rows.length > 0 && res.rows[0].value) {
      let val = res.rows[0].value;
      if (typeof val === 'string') val = JSON.parse(val);
      if (val.identity && val.pillars) {
        cachedMemory = val;
        lastMemoryCompileTime = Date.now();
        return val;
      }
    }
  } catch {}

  return await compileBusinessMemory(pool);
}

/**
 * Produces a high-density, structured prompt injection string for Google Gemini
 */
export function formatBusinessMemoryForPrompt(memory: CompiledBusinessMemory): string {
  let prompt = `======================================================================\n`;
  prompt += `TREK CONSULTANCY - OFFICIAL BUSINESS MEMORY & VERIFIED KNOWLEDGE CORE:\n`;
  prompt += `======================================================================\n\n`;

  prompt += `1. INSTITUTIONAL IDENTITY & ORIGIN:\n`;
  prompt += `- Organization: ${memory.identity.name} (${memory.identity.tagline})\n`;
  prompt += `- Head Office: ${memory.identity.headquarters}\n`;
  prompt += `- International Liaison Office: ${memory.identity.internationalDesk}\n`;
  prompt += `- Contact Email: ${memory.identity.officialEmail} | SLA: ${memory.identity.slaHours} Hours\n`;
  prompt += `- Founding Origin & Mission: ${memory.identity.foundingStoryEn}\n\n`;

  prompt += `2. OPERATIONAL RESPONSIBILITIES & TEAMS (WHO IS RESPONSIBLE):\n`;
  prompt += `- Saudi Company Formation, MISA Licenses & CR: ${memory.identity.responsibleTeams.saudiAdvisoryAndLegal}\n`;
  prompt += `- Software & Digital Engineering: ${memory.identity.responsibleTeams.techAndEngineering}\n`;
  prompt += `- Government PRO & Investor Visas: ${memory.identity.responsibleTeams.proAndVisa}\n`;
  prompt += `- Corporate Accounting, ZATCA & Tax: ${memory.identity.responsibleTeams.financeAndTax}\n`;
  prompt += `- Commercial Real Estate & Ejari Leases: ${memory.identity.responsibleTeams.realEstate}\n\n`;

  prompt += `3. THE 6 STRATEGIC SERVICE PILLARS:\n`;
  memory.pillars.forEach(p => {
    prompt += `[Pillar ${p.id}: ${p.title}]\n`;
    prompt += `  - Tagline: ${p.tagline}\n`;
    prompt += `  - Turnaround Time: ${p.turnaroundTime}\n`;
    prompt += `  - Responsible Team: ${p.responsibleTeam}\n`;
    prompt += `  - Highlights: ${p.highlights.join('; ')}\n`;
    prompt += `  - Summary: ${p.summaryEn}\n\n`;
  });

  prompt += `4. FREQUENTLY ASKED QUESTIONS & ANSWERS (${memory.faqs.length} Verified Entries):\n`;
  memory.faqs.forEach((f, i) => {
    prompt += `[FAQ #${i + 1} | Category: ${f.category}]\n`;
    prompt += `Q: ${f.question}\n`;
    if (f.questionBn) prompt += `Q (BN): ${f.questionBn}\n`;
    prompt += `A: ${f.answer}\n\n`;
  });

  if (memory.knowledgeDocs.length > 0) {
    prompt += `5. UPLOADED BUSINESS KNOWLEDGE DOCUMENTS (${memory.knowledgeDocs.length} Chunks):\n`;
    memory.knowledgeDocs.slice(0, 20).forEach((d, i) => {
      prompt += `[Doc #${i + 1}: ${d.title} (${d.category})]\n${d.content.slice(0, 600)}\n\n`;
    });
  }

  if (memory.verifiedTickets.length > 0) {
    prompt += `6. VERIFIED CONSULTANT RESOLUTIONS (${memory.verifiedTickets.length} Resolved Cases):\n`;
    memory.verifiedTickets.slice(0, 10).forEach(t => {
      prompt += `[Case #${t.ticketNumber}: "${t.subject}"]\nInquiry: ${t.question}\nVerified Answer: ${t.adminAnswer}\n(By: ${t.assignedTo})\n\n`;
    });
  }

  prompt += `======================================================================\n`;
  return prompt;
}

/**
 * High-speed, offline-capable synthesized intelligence engine based on compiled business memory
 */
export function synthesizeBusinessMemoryAnswer({
  cleanMsg,
  userLang = 'en',
  memory,
  conversationHistory = []
}: {
  cleanMsg: string;
  userLang?: 'en' | 'bn' | 'ar';
  memory: CompiledBusinessMemory;
  conversationHistory?: { sender: string; message: string; source?: string }[];
}): { reply: string; source: string } {
  const lower = cleanMsg.toLowerCase().trim();
  const tokens = extractSignificantTokens(lower);

  const hasArabic = /[\u0600-\u06FF]/.test(cleanMsg);
  const isBanglish = /\b(ki|kivabe|ki\s*vabe|kivabhe|ki\s*ki|ki\s*hobe|ki\s*kora|lagbe|lagbo|lage|korte|korbo|korben|koren|korle|kore|kora|korche|korchen|chai|chan|chassi|ache|achhe|ase|asi|asen|nai|nay|nei|kothay|kothai|keno|kemon|amake|apnake|apnader|apnar|amader|amar|tader|tar|koto|shomoy|somoy|taka|khoroch|khroch|khulbo|khulte|shuru|suru|bolen|bolben|janan|janaben|sahajjo|sahayyo|sahata|bujhte|parbo|parben|pabo|paben|hobe|hoise|hoyeche|shob|sob|ektu|bepare|shomporke|somporke|thake|thakbe|deben|dite|apnara|amra|tara|dorkar|kichu|kisu|konta|konti|sathe|shathe)\b/i.test(cleanMsg);
  const isBn = userLang === 'bn' || /[\u0980-\u09FF]/.test(cleanMsg) || isBanglish;
  const isAr = userLang === 'ar' || hasArabic;

  // 1. INTENT: Company Origin, History, Inception & Founding
  const isFoundingOrOriginQuery = 
    /(when (did|was) (this|your|the) (business|company|firm|trek|platform) (start|started|founded|establish|established|began|created)|how long (have you been|has this business been|has trek been|has the company been)|history of (trek|this business|your company)|kobe shuru|kobe protisthito|shuru hoyeche kobe|kobe theke|start date|foundation year|business start year|কবে শুরু|কখন শুরু|কবে প্রতিষ্ঠা|প্রতিষ্ঠা কবে|প্রতিষ্ঠার ইতিহাস|ব্যবসায়ের ইতিহাস|متى (بدأت|تأسست|أنشئت|انطلقت)|تاريخ (الشركة|تريك|التأسيس)|سنة التأسيس)/i.test(lower) ||
    ((lower.includes('when') || lower.includes('kobe') || lower.includes('how long') || lower.includes('কবে') || lower.includes('কখন') || lower.includes('متى')) && (lower.includes('business') || lower.includes('company') || lower.includes('firm') || lower.includes('trek') || lower.includes('ব্যবসা') || lower.includes('কোম্পানি') || lower.includes('প্রতিষ্ঠান') || lower.includes('شركة') || lower.includes('تأسيس')) && (lower.includes('start') || lower.includes('found') || lower.includes('establish') || lower.includes('shuru') || lower.includes('শুরু') || lower.includes('প্রতিষ্ঠা') || lower.includes('بدأت') || lower.includes('تأسست')));

  if (isFoundingOrOriginQuery) {
    if (isAr) {
      return {
        reply: `### تريك للاستشارات — الخلفية المؤسسية ورؤية السعودية 2030\n\nتأسست **${memory.identity.name}** لتمكين الشركات الدولية والمستثمرين العالميين من التوسع المؤسسي في المملكة العربية السعودية في إطار **رؤية السعودية 2030**.\n\n- **المقر الرئيسي**: ${memory.identity.headquarters}\n- **مكتب الاتصال الدولي**: ${memory.identity.internationalDesk}\n- **الرسالة والخدمات**: توفير حلول متكاملة لتأسيس الشركات بملكية أجنبية 100% بموجب ترخيص MISA، وفتح الحسابات المصرفية لدى بنوك الفئة الأولى، والحلول الرقمية المتطورة.\n\n---\n> **المكتب الاستشاري:** يرافق فريقنا الاستشاري والقانوني في الرياض الشركات والمستثمرين عبر جميع مراحل الترخيص والتشغيل بمهنية تامة.`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### ট্রেক কনসালটেন্সি — প্রাতিষ্ঠানিক পরিচিতি ও ভিশন ২০৩০\n\n**${memory.identity.name}** সৌদি আরবের **ভিশন ২০৩০ (Vision 2030)** অর্থনৈতিক রূপান্তরের অংশ হিসেবে আন্তর্জাতিক উদ্যোক্তা, করপোরেট বিনিয়োগকারী এবং প্রযুক্তি দলগুলোকে সৌদি আরবের বাজারে ব্যবসা সম্প্রসারণে সহায়তা করার লক্ষ্যে যাত্রা শুরু করে।\n\n- **প্রধান কার্যালয়**: ${memory.identity.headquarters}\n- **আন্তর্জাতিক লিয়াজোঁ অফিস**: ${memory.identity.internationalDesk}\n- **মূল লক্ষ্য**: আন্তর্জাতিক ক্লায়েন্টদের জন্য কোনো স্থানীয় স্পন্সর ছাড়াই **১০০% বিদেশি মালিকানাধীন কোম্পানি গঠন**, MISA ইনভেস্টমেন্ট লাইসেন্সিং, কমার্শিয়াল রেজিস্ট্রেশন (CR) এবং ইন-হাউস সফটওয়্যার ও ডিজিটাল সলিউশন সরবরাহ করা।\n\n---\n> **সিনিয়র অ্যাডভাইজরি ডেস্ক:** শুরু থেকেই আমরা আন্তর্জাতিক মান বজায় রেখে শত শত উদ্যোক্তাকে সৌদি ও গ্লোবাল মার্কেটে সফলভাবে প্রতিষ্ঠিত হতে প্রাতিষ্ঠানিক পরামর্শ প্রদান করে আসছি।`,
        source: 'AI'
      };
    }
    return {
      reply: `### Trek Consultancy — Institutional Background & Vision 2030\n\n**${memory.identity.name}** was established to empower international enterprises, corporate investors, and technology founders expanding into the Kingdom of Saudi Arabia under **Saudi Vision 2030**.\n\n- **Headquarters**: ${memory.identity.headquarters}\n- **International Liaison Desk**: ${memory.identity.internationalDesk}\n- **Core Mission**: Providing turnkey corporate market entry—facilitating **100% foreign-owned company incorporation** under MISA, commercial tier-1 banking, government relations, and in-house enterprise digital engineering.\n\n---\n> **Executive Advisory:** Trek Consultancy continuously guides global entrepreneurs across North America, Europe, Asia, and the GCC through seamless market entry and commercial licensing.`,
      source: 'AI'
    };
  }

  // 2. INTENT: Operational Responsibility / Who is Responsible
  const isResponsibilityQuery = 
    /(who is responsible (for|to)|who (handles|manages|takes care of|does|is in charge of) (this|the)? (setup|company formation|licensing|process|work)|who are you|who runs this|who will do (the|my) setup|kara ei kaj kore|ke dayitto palon kore|kar dayitto|ke kore dibe|who is managing|responsible person|কার দায়িত্ব|কার দায়িত্ব|দায়িত্ব কার|দায়িত্ব কার|কে দায়িত্বপ্রাপ্ত|কে দায়িত্বপ্রাপ্ত|কে পরিচালনা করে|কারা করে|من (المسؤول|يتولى|يدير|يقوم|ينفذ)|مسؤولية|من أنتم|من يدير هذا)/i.test(lower) ||
    ((lower.includes('who') || lower.includes('ke') || lower.includes('kara') || lower.includes('কার') || lower.includes('কে') || lower.includes('من')) && (lower.includes('responsible') || lower.includes('dayitto') || lower.includes('handles') || lower.includes('manages') || lower.includes('দায়িত্ব') || lower.includes('দায়িত্ব') || lower.includes('مسؤول')) && (lower.includes('setup') || lower.includes('company') || lower.includes('business') || lower.includes('process') || lower.includes('সেটআপ') || lower.includes('ব্যবসা') || lower.includes('تأسيس')));
  if (isResponsibilityQuery) {
    if (isAr) {
      return {
        reply: `### المسؤولية التشغيلية — المكتب الاستشاري والقانوني الأول\n\nتتم إدارة عمليات تأسيس الشركات والترخيص الاستثماري مباشرة عبر **المكتب الاستشاري والقانوني لتريك في الرياض**.\n\n- **محامون ومستشارون معتمدون**: التنسيق المباشر مع **وزارة الاستثمار (MISA)** و**وزارة التجارة (MoC)** والموثقين المعتمدين لتوثيق عقد التأسيس ورخصة الاستثمار.\n- **فريق الخدمات المصرفية والضريبية**: تسجيل العنوان الوطني (SPL) وفتح الحسابات البنكية والامتثال الضريبي لدى هيئة الزكاة والضريبة والجمارك (ZATCA).\n- **مدير حسابات تنفيذي مخصص**: مستشار أول متخصص يتابع ملفك خطوة بخطوة ويقدم التحديثات المستمرة عند كل مرحلة نظامية.\n\n---\n> **التزام مؤسسي:** يتولى فريقنا المؤسسي المعتمد كامل المسؤولية من مرحلة التقديم الأولى وحتى التشغيل التجاري الكامل.`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### অপারেশনাল দায়িত্ব — সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক\n\nসৌদি আরবে আপনার কোম্পানি গঠন ও লাইসেন্সিং প্রক্রিয়াটি সরাসরি **ট্রেক কনসালটেন্সির রিয়াদস্থ সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক**-এর প্রত্যক্ষ দায়িত্বে পরিচালিত হয়।\n\n- **সনদপ্রাপ্ত সৌদি করপোরেট আইনজীবী ও সরকারি লিয়াজোঁ টিম**: সরাসরি **Ministry of Investment (MISA)** ও **বাণিজ্য মন্ত্রণালয়ের (Ministry of Commerce)** সাথে সমন্বয় করে আপনার ১০০% বিদেশি মালিকানা লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন (CR) এবং নোটারি পাবলিক সত্যায়ন নিশ্চিত করেন।\n- **কর্পোরেট ব্যাংকিং ও ট্যাক্স বিভাগ**: ন্যাশনাল অ্যাড্রেস (SPL) স্থাপন, টিয়ার-১ কর্পোরেট ব্যাংক অ্যাকাউন্ট ও ZATCA ফেজ ২ ভ্যাট রেজিস্ট্রেশন সম্পন্ন করেন।\n- **ডেডিকেটেড সিনিয়র কনসালটেন্ট**: আপনার সার্বিক ফাইল তত্ত্বাবধানের জন্য একজন সুনির্দিষ্ট সিনিয়র কনসালটেন্ট সরাসরি নিয়োজিত থাকেন।\n\n---\n> **প্রাতিষ্ঠানিক নিশ্চয়তা:** সম্পূর্ণ প্রক্রিয়াটি আমাদের সনদপ্রাপ্ত পেশাদার দলের প্রত্যক্ষ দায়িত্বে টার্নকি ভিত্তিতে সুচারুভাবে সম্পন্ন হয়।`,
        source: 'AI'
      };
    }
    return {
      reply: `### Operational Responsibility — Senior Advisory & Legal Desk\n\nCompany setup and foreign investment licensing are managed directly by **Trek Consultancy’s Senior Advisory & Legal Desk in Riyadh**.\n\n- **Accredited Saudi Corporate Lawyers & Government Liaisons**: Directly interface with the **Ministry of Investment (MISA)**, the **Ministry of Commerce (MoC)**, and authorized Saudi notaries to ratify your 100% foreign ownership license, Commercial Registration (CR), and Articles of Association (AoA).\n- **Corporate Banking & Tax Specialists**: Oversee commercial National Address (SPL) registration, tier-1 corporate bank account opening, and ZATCA Phase 2 tax compliance.\n- **Dedicated Senior Account Manager**: A designated senior consultant coordinates your entire file, keeping you updated at every statutory milestone.\n\nYou have an accredited, accredited corporate team taking end-to-end institutional responsibility for your business setup.`,
      source: 'AI'
    };
  }

  // 3. INTENT: Greetings
  const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|assalamu\s*alaikum|salam|hola|halo|হ্যালো|হাই|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*আছেন|কেমন\s*আসেন|kemon\s*achen|নমস্কার|আদাব|مرحبا|أهلا|اهلا|السلام عليكم|سلام|صباح الخير|مساء الخير|حياك الله|تحياتي)(\s*!|\s*\?|\s*$|\s+.*)/i.test(cleanMsg);
  if (isGreeting) {
    if (isAr) {
      return {
        reply: `### مرحبا بكم في تريك للاستشارات — المكتب الاستشاري التنفيذي\n\nأهلاً بك! أنا المستشار الآلي المساعد لـ **${memory.identity.brand}**. يسعدني مساعدتك بناءً على الذاكرة المؤسسية والبيانات المعتمدة لدينا:\n\n- **تأسيس الشركات في السعودية**: ملكية أجنبية 100%، رخصة MISA، السجل التجاري، والحسابات البنكية.\n- **الحلول البرمجية والرقمية**: أنظمة ERP سحابية، تطبيقات الهاتف، والمنصات المؤسسية.\n- **التأشيرات والخدمات الحكومية (PRO)**: تأشيرات المستثمرين، الإقامات، والامتثال لمنصتي قوى ومقيم.\n- **العقارات التجارية**: عقود إيجار المكاتب المعتمدة (إيجاري) والمستودعات.\n- **المحاسبة والضرائب**: الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة (ZATCA)، ومسك الدفاتر، والتدقيق القانوني.\n\n---\n> **كيف يمكننا مساعدتك اليوم؟** لا تتردد في طرح أي استفسار حول الإجراءات والمدد النظامية والرسوم.`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### ট্রেক কনসালটেন্সিতে স্বাগতম — এক্সিকিউটিভ অ্যাডভাইজরি\n\nনমস্কার / আসসালামু আলাইকুম! **${memory.identity.brand}**-এ আপনাকে স্বাগতম। আমি ট্রেকের এআই সাপোর্ট কনসালটেন্ট। আমাদের প্রাতিষ্ঠানিক বিজনেস মেমোরির আলোকে আপনাকে সহায়তা করতে প্রস্তুত:\n\n- **সৌদি বিজনেস সেটআপ**: ১০০% বিদেশি মালিকানা, MISA লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন (CR) ও ব্যাংক একাউন্ট\n- **সফটওয়্যার ও ডিজিটাল সলিউশনস**: কাস্টম এন্টারপ্রাইজ ERP, ওয়েব/মোবাইল অ্যাপস এবং ক্লাউড আর্কিটেকচার\n- **ভিসা ও সরকারি PRO সেবা**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট এবং রেসিডেন্ট ইকামা প্রসেসিং\n- **বাণিজ্যিক রিয়েল এস্টেট**: অনুমোদিত অফিস লিজ (Ejari) এবং শিল্পাঞ্চল ওয়্যারহাউস লিজ\n- **করপোরেট সাপোর্ট ও ট্যাক্স**: IFRS বুককিপিং, ZATCA ফেজ ২ ভ্যাট এবং সংবিধিবদ্ধ অডিট\n\n---\n> **আজ আপনাকে কীভাবে সহায়তা করতে পারি?** আপনার সুনির্দিষ্ট প্রশ্ন বা প্রয়োজনীয়তা লিখুন, আমি এখনই পূর্ণাঙ্গ তথ্য সরবরাহ করব!`,
        source: 'AI'
      };
    }
    return {
      reply: `### Welcome to Trek Consultancy — Executive Advisory\n\nHello and welcome to **${memory.identity.brand}**! I am your AI Support Consultant. I am equipped with our verified business knowledge to assist you across our strategic service pillars:\n\n- **Saudi Business Setup**: 100% foreign ownership, MISA licensing, Commercial Registration (CR), and tier-1 corporate banking\n- **Software & Digital Engineering**: Custom enterprise ERPs, web & mobile applications, and resilient cloud systems\n- **Visa & PRO Government Liaison**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem portals\n- **Commercial Real Estate**: Verified Ejari office leases and industrial park warehousing\n- **Corporate Support & Tax**: ZATCA Phase 2 e-invoicing, IFRS bookkeeping, and statutory audits\n\n---\n> **How may we assist you today?** Feel free to ask any question about requirements, turnaround timelines, fees, or our process!`,
      source: 'AI'
    };
  }

  // 4. INTENT: Contact, Phone & WhatsApp Escalation
  const isContactQuery = /(whatsapp|call you|call me|phone number|contact number|talk to (a )?human|talk to (a )?consultant|talk to someone|speak to (a )?human|speak to (a )?consultant|speak to advisor|meet in person|contact details|office address|location|হোয়াটসঅ্যাপ|ফোন নম্বর|যোগাযোগ|কথা বলতে চাই|হোয়াটসঅ্যাপে|অফিস কোথায়|ঠিকানা|কল করবেন|কল দিতে চাই|কথা বলব|দেখা করতে চাই|নাম্বার|واتساب|واتس اب|رقم الهاتف|اتصال|تواصل|مكتبكم|عنوانكم|مقركم|التحدث مع|استشارة مباشرة)/i.test(lower);
  if (isContactQuery) {
    if (isAr) {
      return {
        reply: `### طلب استشارة مباشرة — المكتب الاستشاري الأول\n\nتم تحويل طلبك مباشرة إلى **المكتب الاستشاري والقانوني لتريك في الرياض** للمتابعة الفورية.\n\n- **البريد الإلكتروني الرسمي**: ${memory.identity.officialEmail}\n- **المقر الرئيسي في السعودية**: ${memory.identity.headquarters}\n- **مكتب الاتصال الدولي**: ${memory.identity.internationalDesk}\n\n---\n> **للتواصل الفوري:** شارك رقم الواتساب أو الهاتف هنا في المحادثة، وسيقوم مستشار تنفيذي أول بالتواصل معك مباشرة لترتيب استشارتك.`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### সরাসরি পরামর্শ ও কনসালটেন্সি — সিনিয়র অ্যাডভাইজরি ডেস্ক\n\nআপনার অনুসন্ধানটি আমাদের রিয়াদের **সিনিয়র কনসালটেন্সি ও লিগ্যাল ডেস্কে** অগ্রাধিকার ভিত্তিতে তালিকাভুক্ত করা হয়েছে।\n\n- **কর্পোরেট ইমেইল**: ${memory.identity.officialEmail}\n- **সৌদি আরব প্রধান কার্যালয়**: ${memory.identity.headquarters}\n- **আন্তর্জাতিক লিয়াজোঁ অফিস**: ${memory.identity.internationalDesk}\n\n---\n> **ব্যক্তিগত পরামর্শের জন্য:** আপনার ফোন নম্বর বা হোয়াটসঅ্যাপ নম্বরটি এখানে প্রদান করুন, আমাদের একজন সিনিয়র কনসালটেন্ট সরাসরি আপনার সাথে যোগাযোগ করে পূর্ণাঙ্গ গাইডলাইন প্রদান করবেন।`,
        source: 'AI'
      };
    }
    return {
      reply: `### Direct Consultation Request — Senior Advisory Desk\n\nI have notified our **Senior Advisory & Legal Desk in Riyadh** to prioritize your consultation.\n\n- **Official Corporate Email**: ${memory.identity.officialEmail}\n- **Saudi Arabia Headquarters**: ${memory.identity.headquarters}\n- **International Liaison Desk**: ${memory.identity.internationalDesk}\n\n---\n> **Personalized Briefing:** Share your direct WhatsApp or phone number right here in this chat, and an Executive Senior Consultant will reach out to schedule your personalized consultation.`,
      source: 'AI'
    };
  }

  // 5. INTENT: HIGH-PRECISION FAQ MATCHING
  let bestFaq: IndexedFaq | null = null;
  let bestFaqScore = 0;

  for (const faq of memory.faqs) {
    if (faq.significantTokens.length === 0) continue;
    
    let matches = 0;
    for (const t of tokens) {
      if (faq.significantTokens.includes(t)) {
        matches++;
      }
    }

    if (matches >= 2) {
      const matchRatio = matches / Math.min(tokens.length, faq.significantTokens.length);
      let score = matches * 10 + matchRatio * 15;
      
      const qLow = faq.question.toLowerCase();
      if (lower.length > 10 && qLow.includes(lower)) {
        score += 40;
      }

      if (score > bestFaqScore && matchRatio >= 0.50) {
        bestFaqScore = score;
        bestFaq = faq;
      }
    }
  }

  if (bestFaq && bestFaqScore >= 25) {
    let ans = bestFaq.answer;
    if (isAr && bestFaq.answerAr) ans = bestFaq.answerAr;
    else if (isBn && bestFaq.answerBn) ans = bestFaq.answerBn;
    return {
      reply: ans,
      source: 'FAQ'
    };
  }

  // 6. DYNAMIC KNOWLEDGE BASE SEARCH: Search Knowledge Documents & Verified Tickets
  let bestDoc: IndexedKnowledgeDoc | null = null;
  let bestDocScore = 0;
  for (const doc of (memory.knowledgeDocs || [])) {
    if (!doc.significantTokens || doc.significantTokens.length === 0) continue;
    let matches = 0;
    for (const t of tokens) {
      if (doc.significantTokens.includes(t)) matches++;
    }
    const ratio = matches / Math.max(1, tokens.length);
    const score = matches * 12 + ratio * 20;
    if (score > bestDocScore && matches >= 2) {
      bestDocScore = score;
      bestDoc = doc;
    }
  }

  let bestTicket: VerifiedTicket | null = null;
  let bestTicketScore = 0;
  for (const tkt of (memory.verifiedTickets || [])) {
    if (!tkt.significantTokens || tkt.significantTokens.length === 0) continue;
    let matches = 0;
    for (const t of tokens) {
      if (tkt.significantTokens.includes(t)) matches++;
    }
    const ratio = matches / Math.max(1, tokens.length);
    const score = matches * 12 + ratio * 20;
    if (score > bestTicketScore && matches >= 2) {
      bestTicketScore = score;
      bestTicket = tkt;
    }
  }

  // 7. MULTI-PILLAR & SPECIFIC INTENT EXTRACTION
  const isPillar1 = /(saudi|misa|cr|commercial registration|company formation|incorporat|foreign ownership|সৌদি|কোম্পানি গঠন|ব্যবসা শুরু|লাইসেন্স|تأسيس|شركة|شركات|استثمار|ميزا|سجل تجاري|ملكية أجنبية|رخصة استثمار)/i.test(lower);
  const isPillar2 = /(software|digital|app|website|erp|code|react|node|developer|সফটওয়্যার|ওয়েবসাইট|অ্যাপ|প্রযুক্তি|برمجة|تطبيق|موقع|سوفتوير|نظام|تقنية|تطوير)/i.test(lower);
  const isPillar3 = /(visa|iqama|pro|work permit|qiwa|muqeem|engineer|workforce|employee|ভিসা|ইকামা|ওয়ার্ক পারমিট|পিআরও|ইঞ্জিনিয়ার|কর্মী|تأشيرة|فيزا|إقامة|اقامة|قوى|مقيم|جوازات|نقل كفالة)/i.test(lower);
  const isPillar4 = /(real estate|property|ejari|office space|warehouse|office lease|রিয়েল এস্টেট|অফিস|জমি|ফ্ল্যাট|বাণিজ্যিক প্রপার্টি|عقار|مكتب|إيجার|ايجار|ايجاري|مستودع|أراضي)/i.test(lower);
  const isPillar5 = /(accounting|tax|vat|zatca|audit|bookkeeping|e-invoicing|ট্যাক্স|ভ্যাট|হিসাব|অডিট|ই-ইনভয়েসিং|محاسبة|ضرائب|ضريبة|زكاة|فاتورة|فوترة|مراجعة|تدقيق)/i.test(lower);
  const isPillar6 = /(usa|uk|canada|delaware|wyoming|mercury|wise|cross-border|holding|subsidiary|আন্তর্জাতিক|আমেরিকা|ইউকে|হোল্ডিং|أمريكا|امريكا|بريطانيا|كندا|دولي|عالمي|ديلوير|وايومنغ)/i.test(lower);

  const matchedPillars: { pillar: BusinessPillar; id: number }[] = [];
  if (isPillar1) matchedPillars.push({ pillar: memory.pillars[0], id: 1 });
  if (isPillar2) matchedPillars.push({ pillar: memory.pillars[1], id: 2 });
  if (isPillar3) matchedPillars.push({ pillar: memory.pillars[2], id: 3 });
  if (isPillar4) matchedPillars.push({ pillar: memory.pillars[3], id: 4 });
  if (isPillar5) matchedPillars.push({ pillar: memory.pillars[4], id: 5 });
  if (isPillar6) matchedPillars.push({ pillar: memory.pillars[5], id: 6 });

  // Specific query nuances
  const isTimeline = /(timeline|timeframe|duration|how long|how many days|turnaround|koto din|koto shomoy|somoy|shomoy lagbe|সময়|কত দিন|কত সময়|কম সময়|كم يستغرق|مدة|وقت|المدة الزمنية)/i.test(lower);
  const isRequirements = /(requirement|documents|checklist|what is needed|prerequisite|what do we need|ki ki lagbe|kagoz|documents lagbe|প্রয়োজন|কী কী লাগবে|কাগজপত্র|ডকুমেন্টস|متطلبات|أوراق|شروط|مستندات)/i.test(lower);
  const isCost = /(cost|fee|fees|pricing|price|how much|taka|khoroch|khroch|expense|খরচ|ফি|টাকা|মূল্য|تكلفة|رسوم|أسعار|كم يكلف)/i.test(lower);

  // 8. CASE A: MULTI-PILLAR COMPREHENSIVE ROADMAP (Addresses cross-jurisdictional & combined questions)
  if (matchedPillars.length >= 2) {
    if (isAr) {
      let roadmap = `### استشارة مؤسسية متكاملة — خارطة التوسع عبر الخدمات المتعددة\n\nنعم، تقدم **${memory.identity.name}** حلولاً استشارية شاملة تغطي جميع المسارات المطلوبة بتنسيق مباشر بين مكاتبنا المتخصصة:\n\n`;
      for (const item of matchedPillars) {
        roadmap += `- **${item.pillar.title}**: ${item.pillar.highlights[0]} (${item.pillar.turnaroundTime}).\n`;
      }
      if (isTimeline) {
        roadmap += `\n- **الجدول الزمني المدمج**: تتم إدارة جميع المسارات بالتوازي لتقليص مدة التأسيس وبدء النشاط التجاري الفعلي.`;
      }
      roadmap += `\n\n---\n> **المكتب الاستشاري والتنفيذي بالرياض:** يتولى فريقنا المشترك إدارة الملف بالكامل بمسؤولية مؤسسية موحدة ودون الحاجة لتعدد الجهات.`;
      return { reply: roadmap, source: 'AI' };
    }

    if (isBn) {
      let roadmap = `### সমন্বিত মাল্টি-পিলার প্রাতিষ্ঠানিক গাইডলাইন — সামগ্রিক রোডম্যাপ\n\nহ্যাঁ, **${memory.identity.name}** আপনার উল্লেখিত প্রতিটি সেবাই নিজস্ব বিশেষায়িত বিভাগের মাধ্যমে সমন্বিতভাবে পরিচালনা করে:\n\n`;
      for (const item of matchedPillars) {
        roadmap += `- **${item.pillar.titleBn} (${item.pillar.title})**: ${item.pillar.highlights[0]} (আনুমানিক সময়: ${item.pillar.turnaroundTime})।\n`;
      }
      if (isTimeline) {
        roadmap += `\n- **সমন্বিত সময়সীমা**: প্রতিটি ধাপ সমান্তরালভাবে (parallel processing) সম্পন্ন করা হয় যাতে দ্রুততম সময়ে বাণিজ্যিক কার্যক্রম চালু করা যায়।`;
      }
      roadmap += `\n\n---\n> **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক:** ট্রেক কনসালটেন্সির রিয়াদ লিগ্যাল টিম, ট্যাক্স কনসালটেন্ট এবং টেক ডিভিশন একত্রিত হয়ে সিঙ্গেল-পয়েন্ট অ্যাকাউন্টেবিলিটির মাধ্যমে সম্পূর্ণ দায়িত্ব গ্রহণ করে।`;
      return { reply: roadmap, source: 'AI' };
    }

    let roadmap = `### Integrated Multi-Pillar Advisory — Turnkey Corporate Roadmap\n\nYes, **${memory.identity.name}** seamlessly coordinates your entire expansion plan across our specialized in-house desks:\n\n`;
    for (const item of matchedPillars) {
      roadmap += `- **${item.pillar.title}**: ${item.pillar.highlights[0]} (${item.pillar.turnaroundTime}).\n`;
    }
    if (isTimeline) {
      roadmap += `\n- **Turnaround Timelines**: Tracks are executed concurrently to eliminate bureaucratic delays and ensure rapid commercial activation.\n`;
    }
    roadmap += `\n---\n> **Senior Advisory Desk in Riyadh:** Our Riyadh corporate lawyers, tax specialists, and engineering leaders manage your file under unified institutional responsibility.`;
    return { reply: roadmap, source: 'AI' };
  }

  // 9. CASE B: SINGLE PILLAR WITH SPECIFIC INTENT ADAPTATION
  if (matchedPillars.length === 1) {
    const p = matchedPillars[0].pillar;

    if (isAr) {
      let details = `### ${p.title} — إحاطة استشارية تنفيذية\n\n${p.summaryEn}\n\n`;
      for (const h of p.highlights) {
        details += `- **${h.split(' ')[0]}**: ${h}\n`;
      }
      if (isTimeline) {
        details += `\n- **المدة الزمنية المعتمدة**: ${p.turnaroundTime}\n`;
      }
      details += `\n---\n> **المكتب المسؤول:** ${p.responsibleTeam} يرافقك عبر كافة الإجراءات النظامية حتى اكتمال المعاملة.`;
      return { reply: details, source: 'AI' };
    }

    if (isBn) {
      let details = `### ${p.titleBn} (${p.title}) — সুনির্দিষ্ট প্রাতিষ্ঠানিক তথ্য\n\n${p.summaryBn}\n\n`;
      for (const h of p.highlights) {
        details += `- **${h.split(' ')[0]}**: ${h}\n`;
      }
      if (isTimeline) {
        details += `\n- **প্রক্রিয়া সম্পন্ন হওয়ার সময়সীমা**: ${p.turnaroundTime}\n`;
      }
      details += `\n---\n> **দায়িত্বপ্রাপ্ত বিভাগ:** ${p.responsibleTeam}-এর সার্বিক তত্ত্বাবধানে প্রতিটি ধাপ আইনগতভাবে সুরক্ষিত।`;
      return { reply: details, source: 'AI' };
    }

    let details = `### ${p.title} — Executive Advisory Briefing\n\n${p.summaryEn}\n\n`;
    for (const h of p.highlights) {
      details += `- **${h.split(' ')[0]}**: ${h}\n`;
    }
    if (isTimeline) {
      details += `\n- **Turnaround Timeframe**: ${p.turnaroundTime}\n`;
    }
    details += `\n---\n> **Operational Desk:** Managed directly by ${p.responsibleTeam} under formal institutional service level agreements.`;
    return { reply: details, source: 'AI' };
  }

  // 10. CASE C: BEST MATCHING KNOWLEDGE DOCUMENT FROM ADMIN
  if (bestDoc && bestDocScore >= 20) {
    if (isBn) {
      return {
        reply: `### ${bestDoc.title} — প্রাতিষ্ঠানিক নলেজ বেস\n\n${bestDoc.summary}\n\n- **ক্যাটেগরি**: ${bestDoc.category}\n- **মূল বিবরণ**: ${bestDoc.content.slice(0, 300)}...\n\n---\n> **সিনিয়র অ্যাডভাইজরি ডেস্ক:** বিস্তারিত তথ্যের জন্য আমাদের সাপোর্ট কনসালটেন্টের সাথে সরাসরি সংযুক্ত হতে পারেন।`,
        source: 'DOC'
      };
    }
    return {
      reply: `### ${bestDoc.title} — Institutional Knowledge Base\n\n${bestDoc.summary}\n\n- **Category**: ${bestDoc.category}\n- **Core Highlights**: ${bestDoc.content.slice(0, 300)}...\n\n---\n> **Senior Advisory Desk:** Our corporate advisory team is available for deep-dive consultative guidance on this topic.`,
      source: 'DOC'
    };
  }

  // 11. CASE D: BEST MATCHING RESOLVED SUPPORT TICKET
  if (bestTicket && bestTicketScore >= 20) {
    return {
      reply: `### ${bestTicket.subject} — Verified Consultant Resolution\n\n${bestTicket.adminAnswer}\n\n---\n> **Verified Resolution by ${bestTicket.assignedTo}:** Case #${bestTicket.ticketNumber} verified resolution.`,
      source: 'TICKET'
    };
  }

  // 12. GENERAL CONSULTATIVE FALLBACK
  if (isAr) {
    return {
      reply: `### ${memory.identity.brand} — المكتب الاستشاري التنفيذي\n\nأنا المستشار الآلي المساعد لـ **${memory.identity.brand}**. يسعدني تقديم المساعدة الدقيقة بناءً على الذاكرة المؤسسية المعتمدة.\n\n- **تأسيس الشركات في السعودية ورخصة MISA** (ملكية أجنبية 100%)\n- **الهندسة والحلول البرمجية المتطورة**\n- **تأشيرات المستثمرين والإقامات والتعقيب الحكومي**\n- **العقارات التجارية وعقود إيجاري المعتمدة**\n- **المحاسبة والامتثال الضريبي وهيئة الزكاة (ZATCA)**\n- **تأسيس الشركات الدولية** (USA LLC, UK Ltd)\n\n---\n> **تفضل بطرح استفسارك:** يرجى كتابة متطلباتك أو سؤالك بدقة وسأقدم لك الإجابة النظامية الفورية!`,
      source: 'AI'
    };
  }

  if (isBn) {
    return {
      reply: `### ${memory.identity.brand} — এক্সিকিউটিভ অ্যাডভাইজরি ডেস্ক\n\nআমি **${memory.identity.brand}**-এর এআই সাপোর্ট অ্যাসিস্ট্যান্ট। আমি আমাদের সমগ্র প্রাতিষ্ঠানিক বিজনেস মেমোরির তথ্যের আলোকে আপনাকে সহায়তা করতে প্রস্তুত।\n\n- **সৌদি কোম্পানি গঠন ও MISA লাইসেন্স** (১০০% বিদেশি মালিকানা)\n- **ইন-হাউস সফটওয়্যার ও ডিজিটাল ইঞ্জিনিয়ারিং**\n- **ভিসা, ইকামা ও সরকারি PRO লিয়াজোঁ**\n- **বাণিজ্যিক রিয়েল এস্টেট ও Ejari অফিস লিজ**\n- **কর্পোরেট একাউন্টিং, ZATCA ভ্যাট ও অডিট**\n- **আন্তর্জাতিক কোম্পানি গঠন** (USA LLC, UK Ltd)\n\n---\n> **আপনার প্রয়োজনটি জানান:** আপনার সুনির্দিষ্ট চাহিদা বা প্রশ্নটি লিখুন, আমি এখনই সঠিক প্রাতিষ্ঠানিক তথ্য ও গাইডলাইন সরবরাহ করব!`,
      source: 'AI'
    };
  }

  return {
    reply: `### ${memory.identity.brand} — Executive Advisory Desk\n\nI am the AI Support Consultant for **${memory.identity.brand}**. I draw directly from our verified institutional business memory to assist your corporate journey.\n\n- **Saudi Business Setup & MISA Licensing** (100% foreign ownership)\n- **In-House Software & Digital Engineering**\n- **Investor Visas, Executive Iqamas & PRO Portals**\n- **Commercial Real Estate & Certified Ejari Leases**\n- **Corporate Accounting, ZATCA Phase 2 VAT & Audits**\n- **Global Business Formation** (USA LLC, UK Ltd)\n\n---\n> **How can we assist you?** Please let me know your specific business requirement or question, and I will guide you with accurate regulatory information!`,
    source: 'AI'
  };
}

// ---------------------------------------------------------------------------
// AI support chat performance helpers
// ---------------------------------------------------------------------------
let ragCache: { data: RagData; expiresAt: number } | null = null;
const RAG_CACHE_TTL_MS = 15_000; // 15 seconds real-time dynamic sync

interface RagData {
  faqsData: { rows: any[] };
  docsData: { rows: any[] };
  topicsData: { rows: any[] };
  blogsData: { rows: any[] };
  settingsData: { rows: any[] };
  answeredTicketsData: { rows: any[] };
}

function invalidateRagCache() {
  ragCache = null;
  invalidateBusinessMemoryCache();
  compileBusinessMemory(pool).catch((err) => console.warn('[BusinessMemory] Background sync notice:', err));
}

async function getRagData(): Promise<RagData> {
  if (ragCache && ragCache.expiresAt > Date.now()) {
    return ragCache.data;
  }

  const [faqsData, docsData, topicsData, blogsData, settingsData, answeredTicketsData] = await Promise.all([
    pool.query(`
      SELECT f.question, f.answer, f.question_bn, f.answer_bn, COALESCE(c.name, 'General') as category 
      FROM faqs f 
      LEFT JOIN faq_categories c ON f.category_id = c.id 
      WHERE f.status = 'published' OR f.status IS NULL OR f.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT 100
    `),
    pool.query(`
      SELECT id, title, content, category, status 
      FROM knowledge_documents 
      WHERE status = 'published' OR status IS NULL OR status = 'active'
      ORDER BY created_at DESC 
      LIMIT 100
    `),
    pool.query(`SELECT id, title, category, author, views, replies, content FROM topics ORDER BY created_at DESC LIMIT 20`),
    pool.query(`SELECT id, title, category, excerpt, content FROM blogs ORDER BY created_at DESC LIMIT 20`),
    pool.query(`SELECT value FROM settings WHERE key = 'platform'`),
    pool.query(`
      SELECT id, ticket_number, subject, question, admin_answer, assigned_to, created_at, answered_at
      FROM support_tickets
      WHERE admin_answer IS NOT NULL AND TRIM(admin_answer) != ''
      ORDER BY answered_at DESC NULLS LAST, created_at DESC
      LIMIT 50
    `)
  ]);

  const data: RagData = { faqsData, docsData, topicsData, blogsData, settingsData, answeredTicketsData };
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

// ---------------------------------------------------------------------------
// Project-wide AI Configuration & Synchronization (Neon PostgreSQL)
// ---------------------------------------------------------------------------
let aiConfigCache: { config: any; expiresAt: number } | null = null;
const AI_CONFIG_CACHE_TTL_MS = 30_000;

export function invalidateAiConfigCache() {
  aiConfigCache = null;
}

export async function getAiConfigFromDb(): Promise<any> {
  if (aiConfigCache && aiConfigCache.expiresAt > Date.now()) {
    return aiConfigCache.config;
  }

  try {
    const res = await pool.query("SELECT value FROM settings WHERE key = 'ai'");
    let raw = res.rows[0]?.value;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch {}
    }
    const config = { ...defaultAiSettings, ...(raw || {}) };
    aiConfigCache = { config, expiresAt: Date.now() + AI_CONFIG_CACHE_TTL_MS };
    return config;
  } catch (err) {
    return defaultAiSettings;
  }
}

export async function getEffectiveAiRuntime() {
  const dbConfig = await getAiConfigFromDb();
  const rawProvider = ((dbConfig.provider as string) || 'gemini').toLowerCase();
  const provider = rawProvider === 'openai' ? 'openai' : 'gemini';
  
  // Resolve key for provider: either from providerApiKeys map or top-level apiKey
  let rawDbKey = '';
  if (dbConfig.providerApiKeys && typeof dbConfig.providerApiKeys === 'object' && dbConfig.providerApiKeys[provider]) {
    rawDbKey = (dbConfig.providerApiKeys[provider] || '').trim();
  } else if (dbConfig.apiKey) {
    rawDbKey = (dbConfig.apiKey || '').trim();
  }

  // Provider-specific env key fallback
  let envKey = '';
  if (provider === 'gemini') {
    envKey = (process.env.GEMINI_API_KEY || '').trim();
  } else if (provider === 'openai') {
    envKey = (process.env.OPENAI_API_KEY || '').trim();
  }

  const effectiveApiKey = rawDbKey || envKey;
  let baseUrl = (dbConfig.baseUrl || '').trim();
  if (!baseUrl || (dbConfig.provider !== provider)) {
    baseUrl = DEFAULT_PROVIDER_BASE_URLS[provider] || (provider === 'openai' ? 'https://api.openai.com/v1' : 'https://generativelanguage.googleapis.com');
  }

  const selectedModel = (
    dbConfig.selectedModel && (dbConfig.provider === provider)
      ? dbConfig.selectedModel
      : (provider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini')
  ).trim();

  const rawFallbacks = Array.isArray(dbConfig.fallbackModels) ? dbConfig.fallbackModels : [];
  const fallbackModels = rawFallbacks.filter((m: string) => m && m !== selectedModel);
  const candidateModels = [selectedModel, ...fallbackModels];

  const isKeyConfigured = Boolean(effectiveApiKey);

  return {
    provider,
    apiKey: effectiveApiKey,
    baseUrl,
    isKeyConfigured,
    hasCustomDbKey: Boolean(rawDbKey),
    usingEnvKey: Boolean(!rawDbKey && envKey),
    selectedModel,
    candidateModels,
    temperature: typeof dbConfig.temperature === 'number' ? dbConfig.temperature : 0.4,
    maxOutputTokens: typeof dbConfig.maxOutputTokens === 'number' ? dbConfig.maxOutputTokens : 2048,
    customSystemInstruction: (dbConfig.customSystemInstruction || '').trim(),
    status: dbConfig.status || 'active',
    providerApiKeys: (dbConfig.providerApiKeys && typeof dbConfig.providerApiKeys === 'object') ? dbConfig.providerApiKeys : {},
    dbConfig
  };
}

export async function executeAiCompletion({
  provider,
  apiKey,
  baseUrl,
  model,
  systemInstruction,
  messages,
  temperature = 0.4,
  maxTokens = 2048,
  timeoutMs = 12000
}: {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  systemInstruction: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ text: string; model: string }> {
  const normProvider = (provider || 'gemini').toLowerCase();

  // 1. Google Gemini Provider via official SDK
  if (normProvider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey });
    const contents: any[] = [];
    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens: maxTokens
        }
      }),
      timeoutMs
    );

    return { text: (response.text || '').trim(), model };
  }

  // 2. OpenAI Provider via standard Chat Completions
  const effectiveBaseUrl = (baseUrl || DEFAULT_PROVIDER_BASE_URLS.openai || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const url = `${effectiveBaseUrl}/chat/completions`;

  const requestMessages = [
    ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
    ...messages
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: requestMessages,
        temperature,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status} from ${normProvider}`;
      try {
        const errJson = JSON.parse(errText);
        const rawDetail = errJson.error?.metadata?.raw || errJson.error?.metadata?.error?.message;
        const remedy = errJson.error?.metadata?.remedy_hint;
        const primaryMsg = errJson.error?.message || errJson.message;
        if (rawDetail && rawDetail !== primaryMsg) {
          errMsg = rawDetail;
        } else if (primaryMsg) {
          errMsg = primaryMsg;
        }
        if (remedy && !errMsg.includes(remedy)) {
          errMsg += ` (${remedy})`;
        }
      } catch {
        if (errText) errMsg += `: ${errText.slice(0, 300)}`;
      }
      throw new Error(errMsg);
    }

    const data: any = await res.json();
    if (data?.error) {
      const detail = data.error?.metadata?.raw || data.error?.message || JSON.stringify(data.error);
      throw new Error(`Upstream provider error: ${detail}`);
    }
    let text = data?.choices?.[0]?.message?.content || '';
    // 1. Strip <think>...</think> tags
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 2. Strip "Here's a thinking process:" intros
    if (/^here('?s| is) a thinking process:?/i.test(text)) {
      const parts = text.split(/(?:\n\n(?=[#A-Z0-9\*])|###\s+|Answer:|Resolution:)/i);
      if (parts.length > 1) {
        text = parts.slice(1).join('\n\n').trim();
      }
    }

    // 3. Strip internal reasoning/scratchpad blocks (e.g. "1. **Analyze User Input:** ...")
    if (/^(?:1\.\s+)?\*\*(?:Analyze User Input|Analyze Input|Understanding|Thinking Process|Plan|Analysis):?\*\*/i.test(text)) {
      const markerRegex = /(?:###\s+[^\n]+|\n\n(?=> \*\*Senior)|\n\n(?=[A-Z][A-Za-z0-9\s—–-]+—[^\n]+)|(?:Draft (?:Response|Structure|Response Structure)|Final (?:Response|Answer)|Actual Response):?\s*\n+|(?:Hello|Welcome|Greetings|Thank you|Dear)[,\s][^\n]+)/i;
      const markerMatch = text.search(markerRegex);
      if (markerMatch !== -1) {
        const candidate = text.slice(markerMatch).replace(/^(?:Draft (?:Response|Structure|Response Structure)|Final (?:Response|Answer)|Actual Response):?\s*\n+/i, '').trim();
        if (candidate.length > 30) {
          text = candidate;
        }
      }
    }
    return { text: text.trim(), model };
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
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
      service: 'Trek Consultancy Forum API',
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
    '/api/admin/support/tickets',
    '/api/admin/support/conversations',
    '/api/admin/support/knowledge',
    '/api/admin/support/business-memory',
    '/api/admin/customers',
    '/api/admin/settings/ai',
    '/api/support/tickets',
    '/api/settings',
    '/api/blogs',
    '/api/topics'
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
      aiApi: { status: 'configured' | 'not_configured'; model?: string; provider?: string; hasCustomKey?: boolean; usingEnvKey?: boolean };
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
    const aiRuntime = await getEffectiveAiRuntime();
    if (aiRuntime.isKeyConfigured && aiRuntime.status !== 'disabled') {
      const providerLabels: Record<string, string> = {
        gemini: 'Google Gemini',
        openai: 'OpenAI'
      };
      checks.aiApi = {
        status: 'configured',
        provider: providerLabels[aiRuntime.provider] || aiRuntime.provider,
        model: aiRuntime.selectedModel,
        hasCustomKey: aiRuntime.hasCustomDbKey,
        usingEnvKey: aiRuntime.usingEnvKey
      };
    } else {
      checks.aiApi = {
        status: 'not_configured',
        provider: 'Local Dynamic Knowledge Synthesizer / PostgreSQL RAG',
        model: 'PostgreSQL Knowledge Fallback'
      };
    }

    const isHealthy = checks.database.status === 'connected';
    const totalDurationMs = Date.now() - startTime;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Trek Consultancy Forum API',
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
          createdAt: reply.created_at,
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
        createdAt: t.created_at,
        category: t.category,
        categorySlug: t.category_slug,
        views: t.views || 0,
        likes: t.likes || 0,
        replies: repliesByTopic[t.id]?.length ?? (t.replies || 0),
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

  // Discussion Meta: Categories & Staff Roles
  app.get('/api/discussion/meta', async (_req, res) => {
    try {
      const [catRes, roleRes] = await Promise.allSettled([
        pool.query('SELECT id, name, slug, description FROM discussion_categories ORDER BY created_at ASC'),
        pool.query('SELECT id, name, badge_label as "badgeLabel", color FROM staff_roles ORDER BY created_at ASC')
      ]);

      let categories = (catRes.status === 'fulfilled' && catRes.value.rows.length > 0)
        ? catRes.value.rows
        : defaultDiscussionCategories.map(c => ({
            id: `cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: c,
            slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }));

      let staffRoles = (roleRes.status === 'fulfilled' && roleRes.value.rows.length > 0)
        ? roleRes.value.rows
        : defaultStaffRoles.map(r => ({
            id: `role-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: r.name,
            badgeLabel: r.badgeLabel,
            color: r.color
          }));

      res.json({ categories, staffRoles });
    } catch (err: any) {
      res.json({
        categories: defaultDiscussionCategories.map(c => ({
          id: `cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: c,
          slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        })),
        staffRoles: defaultStaffRoles.map(r => ({
          id: `role-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: r.name,
          badgeLabel: r.badgeLabel,
          color: r.color
        }))
      });
    }
  });

  // Discussion Categories: Create
  app.post('/api/discussion/categories', async (req, res) => {
    try {
      const { name, description } = req.body;
      const cleanName = (name || '').trim();
      if (!cleanName) {
        return res.status(400).json({ error: 'Category name is required.' });
      }

      const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      let slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (!slug) {
        slug = `cat-${encodeURIComponent(cleanName).toLowerCase().replace(/%/g, '').slice(0, 50)}`;
      }
      if (!slug) {
        slug = `cat-${Date.now()}`;
      }

      const insertRes = await pool.query(`
        INSERT INTO discussion_categories (id, name, slug, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, description = COALESCE(EXCLUDED.description, discussion_categories.description)
        RETURNING id, name, slug, description
      `, [id, cleanName, slug, (description || '').trim() || null]);

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      console.error('[Create Category Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Discussion Categories: Delete
  app.delete('/api/discussion/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        'DELETE FROM discussion_categories WHERE id = $1 OR name = $1 OR slug = $1',
        [id]
      );
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Staff Roles / Badges: Create
  app.post('/api/discussion/staff-roles', async (req, res) => {
    try {
      const { name, badgeLabel, color } = req.body;
      const cleanName = (name || '').trim();
      if (!cleanName) {
        return res.status(400).json({ error: 'Staff role name is required.' });
      }

      const id = `role-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const cleanLabel = (badgeLabel || cleanName).trim();
      const cleanColor = (color || 'teal').trim();

      const insertRes = await pool.query(`
        INSERT INTO staff_roles (id, name, badge_label, color)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET badge_label = EXCLUDED.badge_label, color = EXCLUDED.color
        RETURNING id, name, badge_label as "badgeLabel", color
      `, [id, cleanName, cleanLabel, cleanColor]);

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Staff Roles / Badges: Delete
  app.delete('/api/discussion/staff-roles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        'DELETE FROM staff_roles WHERE id = $1 OR name = $1',
        [id]
      );
      res.json({ success: true, id });
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
      const avatar = authorAvatar || getRandomAvatar(authorEmail || author);

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
        createdAt: insertRes.rows[0].created_at || new Date().toISOString(),
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
      const { delta } = req.body || {};
      const change = typeof delta === 'number' ? delta : 1;
      const result = await pool.query(`
        UPDATE topics SET likes = GREATEST(0, likes + $2) WHERE id = $1 RETURNING likes
      `, [id, change]);
      res.json({ success: true, likes: result.rows[0]?.likes ?? 0 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/topics/:id/replies', async (req, res) => {
    try {
      const { id: topicId } = req.params;
      const { author, content, authorAvatar, authorRole } = req.body;
      const replyId = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = authorAvatar || getRandomAvatar(author);

      const replyRes = await pool.query(`
        INSERT INTO replies (id, topic_id, author, author_role, author_avatar, time_ago, content, likes)
        VALUES ($1, $2, $3, $4, $5, 'Just now', $6, 0)
        RETURNING *
      `, [replyId, topicId, author || 'Community Member', authorRole || 'Member', avatar, content]);

      // Update topic replies count directly from replies table
      await pool.query('UPDATE topics SET replies = (SELECT COUNT(*) FROM replies WHERE topic_id = $1) WHERE id = $1', [topicId]);

      const reply = {
        id: replyRes.rows[0].id,
        author: replyRes.rows[0].author,
        authorRole: replyRes.rows[0].author_role,
        authorAvatar: replyRes.rows[0].author_avatar,
        timeAgo: replyRes.rows[0].time_ago,
        createdAt: replyRes.rows[0].created_at || new Date().toISOString(),
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

  app.post('/api/replies/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const { delta } = req.body || {};
      const change = typeof delta === 'number' ? delta : 1;
      const result = await pool.query(`
        UPDATE replies SET likes = GREATEST(0, likes + $2) WHERE id = $1 RETURNING likes
      `, [id, change]);
      res.json({ success: true, likes: result.rows[0]?.likes ?? 0 });
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

      // Attempt real email dispatch via Resend if RESEND_API_KEY is configured
      let emailSent = false;
      let emailDeliveryError: string | null = null;
      const resendApiKey = process.env.RESEND_API_KEY?.trim();

      if (resendApiKey && resendApiKey !== 're_123456789') {
        try {
          const resend = new Resend(resendApiKey);
          let fromAddress = process.env.EMAIL_FROM?.trim() || 'Trek Consultancy Forum <onboarding@resend.dev>';
          const isUnverifiedPublicDomain = /@(gmail|yahoo|hotmail|outlook|icloud|live|aol|msn)\.com/i.test(fromAddress);
          if (fromAddress.includes('yourdomain.com') || isUnverifiedPublicDomain) {
            if (isUnverifiedPublicDomain) {
              console.warn(`[Resend Notice] Sender '${fromAddress}' uses a public mailbox domain (@gmail/@yahoo/etc.) which cannot be verified on Resend. Falling back to 'Trek Consultancy Forum <onboarding@resend.dev>'. To send from a custom domain, add and verify your domain at https://resend.com/domains.`);
            }
            fromAddress = 'Trek Consultancy Forum <onboarding@resend.dev>';
          }

          const { data: resendData, error: resendError } = await resend.emails.send({
            from: fromAddress,
            to: cleanEmail,
            subject: `${code} is your Trek Consultancy Forum verification code`,
            text: `Your Trek Consultancy Forum verification code is: ${code}\n\nThis code will expire in 15 minutes.\nIf you did not request this code, you can safely ignore this email.`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Trek Consultancy Forum Verification Code</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                        <tr>
                          <td>
                            <div style="font-size: 22px; font-weight: 800; color: #00a8b5; letter-spacing: -0.5px; margin-bottom: 24px;">
                              Trek Consultancy Forum
                            </div>
                            <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                              Verify Your Email Address
                            </h1>
                            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                              Hello${cleanName ? ` <strong>${cleanName}</strong>` : ''},<br>
                              Thank you for registering with <strong>Trek Consultancy Forum</strong>. Please use the following 6-digit confirmation code to complete your verification:
                            </p>
                            <div style="background-color: #f0fdfa; border: 1.5px dashed #00a8b5; border-radius: 14px; padding: 18px 24px; text-align: center; margin: 24px 0;">
                              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d9488; display: inline-block;">
                                ${code}
                              </span>
                            </div>
                            <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
                              ⏱️ This code will expire in <strong>15 minutes</strong>.<br>
                              If you did not request this email, please disregard it — no account will be created without this code.
                            </p>
                            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                              This is an automated notification from Trek Consultancy Forum Support & Identity Service.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `
          });

          if (resendError) {
            console.error('[Resend Error]:', resendError);
            emailDeliveryError = resendError.message;
          } else {
            emailSent = true;
            console.log(`[Resend Success] OTP email sent to ${cleanEmail} (ID: ${resendData?.id})`);
          }
        } catch (resendEx: any) {
          console.error('[Resend Exception]:', resendEx?.message);
          emailDeliveryError = resendEx?.message;
        }
      }

      // If email was successfully dispatched, do NOT expose previewCode to the client.
      // If no valid Resend key is provided (or in dev preview mode), provide previewCode as fallback.
      const isPlaceholderOrMissing = !resendApiKey || resendApiKey === 're_123456789';

      let responseMessage = `A 6-digit verification code was generated for ${cleanEmail}.`;
      if (emailSent) {
        responseMessage = `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`;
      } else if (emailDeliveryError && emailDeliveryError.includes('You can only send testing emails to your own email address')) {
        responseMessage = `Resend Test Mode: Real emails can only be sent to your registered Resend email until your domain is verified at resend.com/domains. Use the preview code below to continue testing.`;
      } else if (emailDeliveryError) {
        responseMessage = `Code generated, but email delivery encountered an error: ${emailDeliveryError}`;
      } else if (isPlaceholderOrMissing) {
        responseMessage = `A 6-digit verification code was generated for ${cleanEmail}. (Development preview mode active)`;
      }

      res.json({
        success: true,
        message: responseMessage,
        previewCode: emailSent ? undefined : code,
        emailSent
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // User Registration with Email Verification (Community Member)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, verificationCode, currentLoggedInEmail, sessionId } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim() || cleanEmail.split('@')[0];
      const cleanPass = (password || '').trim();
      const cleanCode = (verificationCode || '').trim();
      const cleanCurrent = (currentLoggedInEmail || '').trim().toLowerCase();
      const cleanSession = (sessionId || '').trim();

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
      const avatar = getRandomAvatar(cleanEmail || cleanName);
      const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const insertRes = await pool.query(`
        INSERT INTO users (id, name, email, password, role, status, avatar, joined_date, threads_count, email_verified)
        VALUES ($1, $2, $3, $4, 'User', 'active', $5, $6, 0, true)
        RETURNING id, name, email, role, status, avatar, joined_date, threads_count, email_verified
      `, [id, cleanName, cleanEmail, cleanPass, avatar, joinedDate]);

      // If user had a guest chat session prior to registration, link the conversation and messages to their new account
      if (cleanSession) {
        try {
          await pool.query(`
            UPDATE conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE (id = $4 OR session_id = $4) AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [id, cleanEmail, cleanName, cleanSession]);

          await pool.query(`
            UPDATE messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE (conversation_id = $3 OR session_id = $3) AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [id, cleanEmail, cleanSession]);

          await pool.query(`
            UPDATE support_conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE id = $4 AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [id, cleanEmail, cleanName, cleanSession]);

          await pool.query(`
            UPDATE support_messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE session_id = $3 AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [id, cleanEmail, cleanSession]);
        } catch (claimErr) {
          console.error('Failed to claim guest conversation on register:', claimErr);
        }
      }

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
      const { email, password, currentLoggedInEmail, sessionId } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();
      const cleanCurrent = (currentLoggedInEmail || '').trim().toLowerCase();
      const cleanSession = (sessionId || '').trim();

      // If an account is already logged in on this browser and differs from the target login
      if (cleanCurrent && cleanCurrent !== cleanEmail) {
        return res.status(409).json({
          error: `An account (${cleanCurrent}) is already active. You cannot log into another account at the same time. Please sign out first.`
        });
      }

      const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);

      if (userRes.rows.length === 0) {
        // Fallback check for initial admin bootstrap
        if ((cleanEmail === 'admin@trekconsultancy.com' || cleanEmail === 'admin@amacommunity.io') && cleanPass === 'admin123') {
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

      // If user had a guest chat session prior to login, link the conversation and messages to their account
      if (cleanSession) {
        try {
          await pool.query(`
            UPDATE conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE (id = $4 OR session_id = $4) AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [user.id, cleanEmail, user.name, cleanSession]);

          await pool.query(`
            UPDATE messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE (conversation_id = $3 OR session_id = $3) AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [user.id, cleanEmail, cleanSession]);

          await pool.query(`
            UPDATE support_conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE id = $4 AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [user.id, cleanEmail, user.name, cleanSession]);

          await pool.query(`
            UPDATE support_messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE session_id = $3 AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
          `, [user.id, cleanEmail, cleanSession]);
        } catch (claimErr) {
          console.error('Failed to claim guest conversation on login:', claimErr);
        }
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

  // Support Tickets: Create
  app.post('/api/support/tickets', async (req, res) => {
    try {
      const { userEmail, userWhatsapp, subject, question, priority, sessionId, userId } = req.body;
      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question content is required to create a ticket.' });
      }

      const ticketNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const id = `tkt-${Date.now()}`;
      const cleanEmail = (userEmail || '').trim() || 'guest@trekconsultancy.com';
      const cleanWhatsapp = (userWhatsapp || '').trim() || null;
      const cleanSubj = (subject || '').trim() || question.trim().slice(0, 60) + '...';
      const cleanPriority = priority || 'Normal';
      const cleanSession = sessionId || 'default-session';

      const insertRes = await pool.query(`
        INSERT INTO support_tickets (id, ticket_number, user_id, user_email, user_whatsapp, session_id, conversation_id, subject, question, priority, status, assigned_to)
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, 'OPEN', 'Community Staff')
        RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", user_whatsapp as "userWhatsapp", session_id as "sessionId",
                  conversation_id as "conversationId", subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo", created_at as "createdAt"
      `, [id, ticketNum, userId || null, cleanEmail, cleanWhatsapp, cleanSession, cleanSubj, question.trim(), cleanPriority]);

      // Activity log
      try {
        await pool.query(`
          INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
          VALUES ($1, $2, $3, $4, 'Just now', 'support')
        `, [`act-${Date.now()}`, 'Opened Support Ticket', cleanEmail, `#${ticketNum}`,]);
      } catch (logErr) {
        console.warn('Failed to log ticket creation activity:', logErr);
      }

      res.status(201).json(insertRes.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Chat Messages: List (With strict account isolation and multi-device continuity)
  app.get('/api/support/messages', async (req, res) => {
    try {
      const sessionId = ((req.query.sessionId as string) || '').trim();
      const userId = ((req.query.userId as string) || '').trim();
      const userEmail = ((req.query.userEmail as string) || '').trim().toLowerCase();

      // Case 1: Registered user request (identified by userId or email)
      if (userId || userEmail) {
        const result = await pool.query(`
          SELECT id, 
                 COALESCE(sender, CASE WHEN role = 'assistant' THEN 'bot' ELSE role END) as sender,
                 COALESCE(message, content) as message,
                 content,
                 role,
                 source,
                 user_id as "userId",
                 user_email as "userEmail",
                 is_guest as "isGuest",
                 created_at as "createdAt"
          FROM messages
          WHERE (user_id IS NOT NULL AND user_id = $1)
             OR (user_email IS NOT NULL AND LOWER(user_email) = $2)
             OR (
                 (conversation_id = $3 OR session_id = $3)
                 AND (
                   (user_id IS NOT NULL AND user_id = $1)
                   OR (user_email IS NOT NULL AND LOWER(user_email) = $2)
                   OR (is_guest = FALSE AND LOWER(user_email) = $2)
                 )
             )
          ORDER BY created_at ASC
          LIMIT 100
        `, [userId || null, userEmail || null, sessionId || '']);
        return res.json(result.rows);
      }

      // Case 2: Guest user (no userId and no userEmail provided)
      if (!sessionId) {
        return res.json([]);
      }

      // Security Guardrail: Prevent guests from inspecting sessions belonging to registered users
      const ownerCheck = await pool.query(`
        SELECT user_email 
        FROM conversations 
        WHERE (id = $1 OR session_id = $1) 
          AND (is_guest = FALSE OR user_email IS NOT NULL) 
        LIMIT 1
      `, [sessionId]);

      const msgOwnerCheck = await pool.query(`
        SELECT user_email 
        FROM messages 
        WHERE (conversation_id = $1 OR session_id = $1) 
          AND (is_guest = FALSE OR user_email IS NOT NULL) 
        LIMIT 1
      `, [sessionId]);

      if (ownerCheck.rows.length > 0 || msgOwnerCheck.rows.length > 0 || sessionId.startsWith('user-')) {
        // Registered session access forbidden for guest requests
        return res.json([]);
      }

      // Return only guest messages for this guest session
      const result = await pool.query(`
        SELECT id, 
               COALESCE(sender, CASE WHEN role = 'assistant' THEN 'bot' ELSE role END) as sender,
               COALESCE(message, content) as message,
               content,
               role,
               source,
               user_id as "userId",
               user_email as "userEmail",
               is_guest as "isGuest",
               created_at as "createdAt"
        FROM messages
        WHERE (conversation_id = $1 OR session_id = $1)
          AND (is_guest = TRUE OR user_email IS NULL)
        ORDER BY created_at ASC
        LIMIT 100
      `, [sessionId]);
      return res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Chat: Get conversation history for a logged-in user
  app.get('/api/support/user-conversations', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || '';
      const email = ((req.query.email as string) || '').trim().toLowerCase();

      if (!userId && !email) {
        return res.status(400).json({ error: 'userId or email is required.' });
      }

      const result = await pool.query(`
        SELECT 
          id as "sessionId",
          session_id as "sessionIdAlt",
          user_id as "userId",
          user_email as "userEmail",
          user_whatsapp as "userWhatsapp",
          user_name as "userName",
          title,
          is_guest as "isGuest",
          status,
          message_count as "messageCount",
          last_message as "lastMessage",
          last_sender as "lastSender",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM conversations
        WHERE (user_id IS NOT NULL AND user_id = $1) 
           OR (user_email IS NOT NULL AND LOWER(user_email) = $2)
        ORDER BY updated_at DESC
        LIMIT 25
      `, [userId || null, email || null]);

      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Chat: Claim/Migrate a guest conversation to a registered user account
  app.post('/api/support/conversations/claim', async (req, res) => {
    try {
      const { sessionId, userId, userEmail, userName } = req.body;
      const cleanSession = (sessionId || '').trim();
      const cleanEmail = (userEmail || '').trim().toLowerCase();
      let cleanUserId = (userId || '').trim() || null;
      let cleanUserName = (userName || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : null);

      if (!cleanSession || !cleanEmail) {
        return res.status(400).json({ error: 'sessionId and userEmail are required.' });
      }

      // Security check: Reject claim if the session belongs to another registered user!
      const existingConv = await pool.query(
        `SELECT user_email, is_guest FROM conversations WHERE (id = $1 OR session_id = $1) AND user_email IS NOT NULL LIMIT 1`,
        [cleanSession]
      );
      if (existingConv.rows.length > 0) {
        const existingEmail = (existingConv.rows[0].user_email || '').toLowerCase();
        if (existingEmail && existingEmail !== cleanEmail) {
          return res.status(403).json({ error: 'Cannot claim a conversation belonging to another user.' });
        }
      }

      // Smart Identity Resolution: Match with user account if registered
      if (cleanEmail) {
        try {
          const userMatch = await pool.query('SELECT id, name FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
          if (userMatch.rows.length > 0) {
            cleanUserId = userMatch.rows[0].id;
            if (!userName) cleanUserName = userMatch.rows[0].name;
          }
        } catch {
          // Non-blocking fallback
        }
      }

      // Upsert conversation record in conversations
      const convRes = await pool.query(`
        INSERT INTO conversations (
          id, session_id, user_id, user_email, user_name, is_guest, status, updated_at
        )
        VALUES ($1, $1, $2, $3, $4, FALSE, 'active', NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          user_email = EXCLUDED.user_email,
          user_name = COALESCE(EXCLUDED.user_name, conversations.user_name),
          is_guest = FALSE,
          status = 'active',
          updated_at = NOW()
        WHERE conversations.is_guest = TRUE OR conversations.user_email IS NULL OR LOWER(conversations.user_email) = $3
        RETURNING id as "sessionId", user_id as "userId", user_email as "userEmail", user_name as "userName", is_guest as "isGuest", message_count as "messageCount", updated_at as "updatedAt"
      `, [cleanSession, cleanUserId, cleanEmail, cleanUserName]);

      // Mirror to support_conversations for backwards compatibility
      await pool.query(`
        INSERT INTO support_conversations (
          id, user_id, user_email, user_name, is_guest, status, updated_at
        )
        VALUES ($1, $2, $3, $4, FALSE, 'active', NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          user_email = EXCLUDED.user_email,
          user_name = COALESCE(EXCLUDED.user_name, support_conversations.user_name),
          is_guest = FALSE,
          status = 'active',
          updated_at = NOW()
        WHERE support_conversations.is_guest = TRUE OR support_conversations.user_email IS NULL OR LOWER(support_conversations.user_email) = $3
      `, [cleanSession, cleanUserId, cleanEmail, cleanUserName]);

      // Update all messages in messages table only if guest or owned by this email
      await pool.query(`
        UPDATE messages
        SET user_id = $1, user_email = $2, is_guest = FALSE
        WHERE (conversation_id = $3 OR session_id = $3)
          AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
      `, [cleanUserId, cleanEmail, cleanSession]);

      // Mirror to support_messages table
      await pool.query(`
        UPDATE support_messages
        SET user_id = $1, user_email = $2, is_guest = FALSE
        WHERE session_id = $3
          AND (is_guest = TRUE OR user_email IS NULL OR LOWER(user_email) = $2)
      `, [cleanUserId, cleanEmail, cleanSession]);

      res.json({
        success: true,
        message: 'Conversation successfully claimed and saved under user account.',
        conversation: convRes.rows[0]
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const STOPWORDS = new Set([
    'how', 'do', 'does', 'did', 'i', 'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
    'is', 'are', 'was', 'were', 'it', 'its', 'my', 'your', 'we', 'our', 'you', 'me', 'can', 'could',
    'would', 'will', 'with', 'about', 'this', 'that', 'there', 'what', 'when', 'where', 'which', 'who', 'why',
    'কি', 'কী', 'কিভাবে', 'কেন', 'কখন', 'কোথায়', 'কোন', 'এবং', 'বা', 'এর', 'একটি', 'এই', 'সেই', 'আমি', 'আপনি', 'আমরা',
    'kivabe', 'ki', 'korte', 'korbo', 'korben', 'kore', 'chai', 'chan', 'ache', 'achhe', 'ase', 'asi', 'te', 'er', 'r', 'amader', 'apnader', 'amar', 'apnar', 'koro', 'koren', 'lagbe', 'lage'
  ]);

  function synthesizeLocalAiResponse({
    cleanMsg,
    userLang,
    docs = [],
    faqs = [],
    topics = [],
    blogs = [],
    answeredTickets = [],
    forumName,
    supportEmail,
    conversationHistory = []
  }: {
    cleanMsg: string;
    userLang: 'en' | 'bn';
    docs: any[];
    faqs: any[];
    topics: any[];
    blogs: any[];
    answeredTickets?: any[];
    forumName: string;
    supportEmail: string;
    conversationHistory?: { sender: string; message: string; source?: string }[];
  }): { reply: string; source: string } {
    const lower = cleanMsg.toLowerCase();

    // Contextual Multi-Turn Memory Extraction across recent conversation window
    const userTurnsCombined = (conversationHistory || [])
      .filter(m => m.sender === 'user')
      .map(m => m.message)
      .join(' ');

    const isFollowUpQuery = /(next step|what next|what now|after that|then what|how long|how much|koto|tarpor|er por|pore ki|aro bolen|bistarito|details|tell me more|how to do that|kivabe korbo eta|etate|sheta|seta|koto din|koto taka|procedure|step by step|prothom dhap|porer dhap|what to do)\b/i.test(lower) ||
      (cleanMsg.split(/\s+/).length <= 4 && (lower.includes('next') || lower.includes('step') || lower.includes('then') || lower.includes('pore') || lower.includes('eta') || lower.includes('how') || lower.includes('kivabe') || lower.includes('koto') || lower.includes('dhap')));

    // Enriched contextual query combining all recent user turns in session
    const contextualCombined = userTurnsCombined ? `${userTurnsCombined} ${cleanMsg}` : cleanMsg;
    const contextualLower = contextualCombined.toLowerCase();

    // 1. Multilingual token extraction (utilizing conversational context when follow-up detected)
    const allTokens = (isFollowUpQuery ? contextualLower : lower)
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const sigTokens = allTokens.filter(w => !STOPWORDS.has(w));

    const bigrams: string[] = [];
    for (let i = 0; i < allTokens.length - 1; i++) {
      bigrams.push(`${allTokens[i]} ${allTokens[i + 1]}`);
    }

    // 2. High-priority conversational & platform intent checks (English, Bengali & Banglish)
    const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|assalamu\s*alaikum|salam|hola|halo|হ্যালো|হাই|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*আছেন|কেমন\s*আসেন|kemon\s*achen|kemon\s*asen|kemon\s*acho|valo\s*achen|bhalo\s*achen|নমস্কার|আদাব)(\s*!|\s*\?|\s*$|\s+.*)/i.test(cleanMsg);
    
    const isNextStepQuery = /(next step|what next|what is the (very )?next|what should i do next|porer dhap|tarpor ki|pore ki|er por ki|পরের ধাপ|এরপর কি|এরপর করণীয়)/i.test(lower);

    const isCostQuery = /(cost|fee|fees|pricing|price|how much|khoroch|khroch|khoroc|taka|koto taka|খরচ|ফি|প্রাইসিং|বাজেট|কত টাকা|কত খরচ)/i.test(lower);

    const phoneMatch = cleanMsg.match(/(?:\+|00)?(?:\d[\s\-\.\(\)]*){8,15}\d/);
    const extractedPhone = phoneMatch ? phoneMatch[0].trim() : null;
    const emailMatch = cleanMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const extractedEmail = emailMatch ? emailMatch[0].trim() : null;
    const isContactProvided = Boolean(extractedPhone || (extractedEmail && !extractedEmail.includes('default-session') && !extractedEmail.includes('guest@') && !extractedEmail.includes('client.trekconsultancy')));

    const isContactQuery = /(whatsapp|call you|call me|phone number|contact number|talk to (a )?human|talk to (a )?consultant|talk to someone|speak to (a )?human|speak to (a )?consultant|speak to advisor|meet in person|contact details|office address|location|হোয়াটসঅ্যাপ|ফোন নম্বর|যোগাযোগ|কথা বলতে চাই|হোয়াটসঅ্যাপে|অফিস কোথায়|ঠিকানা|কল করবেন|কল দিতে চাই|কথা বলব|দেখা করতে চাই|নাম্বার)/i.test(lower);

    const isBespokeQuery = /(custom quote|custom quotation|formal proposal|bespoke contract|sign nda|confidentiality agreement|enterprise contract|hire you|enterprise proposal|কাস্টম কোটেশন|ফরমাল প্রপোজাল|চুক্তি স্বাক্ষর)/i.test(lower);

    const isHowToPostQuery = /(how to (post|ask|create a topic|create a question|publish)|how do i (post|ask|publish)|পোস্ট করার নিয়ম|কিভাবে পোস্ট করব|কিভাবে প্রশ্ন করব|নতুন টপিক|প্রশ্ন পোস্ট|পোস্ট করব|kivabe post|post kivabe|post korar niyom|kivabe question|question kivabe|kivabe likhbo)/i.test(lower) ||
      ((lower.includes('kivabe') || lower.includes('how to') || lower.includes('kemne')) && (lower.includes('post') || lower.includes('question') || lower.includes('topic') || lower.includes('proshno')));

    const isRegistrationQuery = /(register|sign up|create account|login|sign in|password|otp|verification|নিবন্ধন|সাইন আপ|একাউন্ট তৈরি|লগইন|account khulbo|kivabe account|kivabe login|kivabe register|sign up kivabe)/i.test(lower);

    const isDeleteTopicQuery = /(delete|remove|permission to delete|who can delete|মুছে|ডিলিট|কে ডিলিট করতে পারবে|পোস্ট মুছব|post delete|kivabe delete|delete korbo)/i.test(lower);

    const isTechStackQuery = /(neon|postgres|docly|bbpress|database|persist|stack|থিম|ডাটাবেজ|পোস্টগ্রেস|tech stack|ki ki technology)/i.test(lower);

    const isAboutOrServices = /(what (services|do you do|can you do|is trek)|tell me about trek|about this platform|who are you|overview of trek|what is trek consultancy|কি কি সেবা|ট্রেক কি|ট্রেক কনসালটেন্সি কি|আপনাদের সার্ভিস|সার্ভিসসমূহ|পরিচয়|apnader service|service ki|ki ki service|ki service den|ki ki kaj koren)/i.test(lower);

    const isHelpQuery = /^(help|can you help|i need help|please help|what can you help me with|how can you assist|সাহায্য|সাহায্য করবেন|সহায়তা|sahajjo|sahayyo|help koren|help lagbe|help dorkar)(\s*!|\s*\?|\s*$|\s+.*)/i.test(lower) ||
      ((lower.includes('help') || lower.includes('সাহায্য') || lower.includes('sahajjo') || lower.includes('sahayyo')) &&
       (lower.includes('amake') || lower.includes('koren') || lower.includes('please') || lower.includes('can you') || lower.includes('korben')));

    const isSaudiSetupQuery = /(saudi|misa|cr|commercial registration|company formation|business setup|riyadh|jeddah|foreign ownership|zatca|gosi|setup company|incorporat|সৌদি|ব্যবসা শুরু|কোম্পানি তৈরি|লাইসেন্স|মিসে|সিআর|saudi te business|business start|company khulte|company kivabe|saudi te company)/i.test(lower);

    const isSoftwareQuery = /(software|digital|website|web app|mobile app|erp|tech division|react|node|ai automation|coding|developer|সফটওয়্যার|ওয়েবসাইট|অ্যাপ|প্রযুক্তি|ডিজিটাল|ডেভেলপমেন্ট|website banate|app banate|software banate|software service)/i.test(lower);

    const isVisaQuery = /(visa|pro|iqama|work permit|investor visa|muqeem|qiwa|chamber of commerce|attestation|ভিসা|ইকামা|কাজের অনুমতি|ওয়ার্ক পারমিট|পিআরও|iqama renewal|visa kivabe|pro service)/i.test(lower);

    const isRealEstateQuery = /(real estate|property|buying property|commercial property|residential property|industrial property|lease|foreign ownership property|রিয়েল এস্টেট|সম্পত্তি|জমি|ফ্ল্যাট|বাড়ি|property kinte|office space)/i.test(lower);

    const isAccountingTaxQuery = /(accounting|audit|tax|vat|zatca|payroll|hr|bookkeeping|financial audit|হিসাব|অডিট|ট্যাক্স|ভ্যাট|হিসাবরক্ষণ|বেতন|tax kivabe|vat kivabe|audit service)/i.test(lower);

    const isInternationalQuery = /(international|usa|uk|canada|global banking|delaware|wyoming|mercury|wise|offshore|আন্তর্জাতিক|আমেরিকা|ইউকে|কানাডা|ব্যাংক একাউন্ট|usa te|uk te|canada te|global bank)/i.test(lower);

    // Intent 1: Greetings
    if (isGreeting) {
      if (userLang === 'bn') {
        return {
          reply: `নমস্কার / আসসালামু আলাইকুম! **${forumName}** এআই অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম।\n\nআমি আপনাকে ট্রেকের সম্পূর্ণ প্রাতিষ্ঠানিক নলেজ বেস ও ডাটাবেজের তথ্যের ভিত্তিতে সহায়তা করতে পারি:\n\n1. **সৌদি বিজনেস সেটআপ**: ১০০% ফরেন ওনারশিপ, MISA ইনভেস্টমেন্ট লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন (CR) এবং ব্যাংক অ্যাকাউন্ট\n2. **সফটওয়্যার ও ডিজিটাল সলিউশনস**: কাস্টম ইআরপি, ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপমেন্ট এবং ক্লাউড আর্কিটেকচার\n3. **ভিসা ও সরকারি PRO সেবা**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, ইকামা প্রসেসিং এবং Qiwa/Muqeem পোর্টাল ম্যানেজমেন্ট\n4. **রিয়েল এস্টেট ইনভেস্টমেন্ট**: বাণিজ্যিক, আবাসিক ও শিল্প সম্পত্তি ক্রয় এবং লিজ পরামর্শ\n5. **করপোরেট সাপোর্ট**: অ্যাকাউন্টস, অডিট, ZATCA ভ্যাট ও ট্যাক্স কমপ্লায়েন্স এবং এইচআর/পেরোল\n6. **ফোরাম কমিউনিটি**: প্রশ্ন পোস্ট করা, উত্তর দেওয়া এবং প্রযুক্তিগত আলোচনা\n\nআপনার যেকোনো প্রশ্ন বা ব্যবসার প্রয়োজনীয়তা সরাসরি লিখুন, আমি বিস্তারিত বুঝিয়ে বলছি!`,
          source: 'AI'
        };
      }
      return {
        reply: `Hello and welcome to **${forumName}**! I am your 24/7 AI Consultant & Support Assistant.\n\nI am fully equipped with our verified knowledge base to answer questions across our core service pillars:\n\n1. **Saudi Business Setup**: 100% foreign ownership, MISA licensing, Commercial Registration (CR), and corporate banking\n2. **Software & Digital Solutions**: Custom software, enterprise ERPs, cloud architecture, and fullstack apps\n3. **Visa & PRO Government Liaison**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem compliance\n4. **Real Estate Investment**: Commercial, residential, and industrial property buying & leasing advisory\n5. **Corporate & Financial Support**: Bookkeeping, statutory audits, ZATCA Phase 2 e-invoicing, VAT & tax filings\n6. **Community Forum**: Posting questions, exploring engineering topics, and collaborating\n\nFeel free to ask any specific question, and I'll be glad to help you right away!`,
        source: 'AI'
      };
    }

    // Intent 2: How to Post on Forum
    if (isHowToPostQuery) {
      if (userLang === 'bn') {
        return {
          reply: `ফোরামে নতুন আলোচনা বা প্রশ্ন পোস্ট করার সহজ নিয়ম:\n\n1. প্ল্যাটফর্মের বাম পাশের সাইডবারে বা মূল ফোরাম পেজে **"+ Post a Question"** বাটনে ক্লিক করুন।\n2. ড্রপডাউন থেকে প্রাসঙ্গিক **Category** (যেমন Architecture, Cloud, DevOps, Business Setup ইত্যাদি) বেছে নিন।\n3. আপনার প্রশ্নের একটি স্পষ্ট এবং তথ্যবহুল **Title** লিখুন।\n4. মূল বিবরণে আপনার সমস্যা বা আলোচনার বিষয় বিস্তারিতভাবে তুলে ধরুন।\n5. **"Publish Question"** বাটনে ক্লিক করলেই আপনার পোস্টটি লাইভ হয়ে যাবে এবং কমিউনিটির সদস্য ও আমাদের ইঞ্জিনিয়াররা উত্তর দিতে পারবেন।\n\n📌 আপনার কোনো টেকনিক্যাল বা বিজনেস বিষয়ক প্রশ্ন থাকলে এখনই সরাসরি একটি থ্রেড তৈরি করতে পারেন!`,
          source: 'FAQ'
        };
      }
      return {
        reply: `Here is how to create a discussion thread or ask a question on our forum:\n\n1. Click the **"+ Post a Question"** button located in the sidebar or forum header.\n2. Choose the most appropriate **Category** (e.g., Cloud Architecture, Business Setup, DevOps, Software).\n3. Provide a clear, descriptive **Title** summarizing your question.\n4. Type your detailed question or technical challenge in the content editor.\n5. Click **"Publish Question"** to make your thread live immediately.\n\nOur community engineers, senior consultants, and fellow developers will be able to read and reply to your post!`,
        source: 'FAQ'
      };
    }

    // Intent 3: How to Register / Login
    if (isRegistrationQuery) {
      if (userLang === 'bn') {
        return {
          reply: `ফোরামে অ্যাকাউন্ট তৈরি ও সাইন-ইন করার নিয়ম:\n\n1. উপরের মেনুবারে **"Sign In"** অথবা **"Login or Register"** বাটনে ক্লিক করুন।\n2. নতুন ব্যবহারকারী হলে **"Register"** ট্যাবে গিয়ে আপনার নাম, ইমেইল ও পাসওয়ার্ড প্রদান করুন।\n3. আপনার ইমেইলে একটি ৬-সংখ্যার ওটিপি (OTP) ভেরিফিকেশন কোড পাঠানো হবে।\n4. কোডটি দিয়ে অ্যাকাউন্ট সক্রিয় করলেই আপনি যেকোনো প্রশ্ন করতে, লাইক দিতে ও উত্তর লিখতে পারবেন।\n\n💡 কোনো পাসওয়ার্ড ভুলে গেলে পুনরায় ইমেইল ভেরিফিকেশনের মাধ্যমে লগইন করতে পারবেন।`,
          source: 'FAQ'
        };
      }
      return {
        reply: `Here is how to register and sign in to the Trek Consultancy Forum:\n\n1. Click the **"Sign In"** or **"Login or Register"** button in the top navigation bar.\n2. Switch to the **Register** tab and input your full name, email address, and secure password.\n3. A 6-digit OTP email verification code will be sent to your inbox to verify your account.\n4. Enter the verification code, and your account will be activated instantly with full permissions to post questions, submit replies, and like community solutions!\n\n💡 Existing users can simply log in with their registered email and password anytime.`,
        source: 'FAQ'
      };
    }

    // Intent 4: Deletion & Moderation Rules
    if (isDeleteTopicQuery) {
      if (userLang === 'bn') {
        return {
          reply: `ফোরামের পোস্ট ও বিষয়বস্তু মোছার নিয়মাবলী:\n\n- **লেখক বা অথর (Author)**: আপনি যে পোস্টটি নিজে তৈরি করেছেন, শুধুমাত্র সেই পোস্টটির ওপর ডিলিট বাটন দেখতে পাবেন এবং নিজে মুছে ফেলতে পারবেন।\n- **অ্যাডমিনিস্ট্রেটর ও মডারেটর**: সিস্টেম অ্যাডমিন বা মডারেটরগণ কমিউনিটির নিয়মাবলী বজায় রাখতে যেকোনো পোস্ট পর্যালোচনা ও মুছতে পারেন।\n- অন্য কোনো সাধারণ ব্যবহারকারী আপনার তৈরি পোস্ট ডিলিট করতে পারবেন না।`,
          source: 'FAQ'
        };
      }
      return {
        reply: `Here are the deletion and authorization rules for our forum:\n\n- **Post Author**: You can delete any discussion thread that you personally authored.\n- **Administrators & Moderators**: Staff with administrative privileges have moderation authority to remove spam or non-compliant posts.\n- **Other Members**: Regular members cannot delete or alter topics created by other users.\n\nThis ensures complete ownership and data integrity for all community discussions.`,
        source: 'FAQ'
      };
    }

    // Intent 4.1: Contextual Next Steps
    if (isNextStepQuery) {
      if (contextualLower.includes('saudi') || contextualLower.includes('riyadh') || contextualLower.includes('firm') || contextualLower.includes('company') || contextualLower.includes('business') || contextualLower.includes('setup') || contextualLower.includes('misa') || contextualLower.includes('it') || contextualLower.includes('consult')) {
        if (userLang === 'bn') {
          return {
            reply: `সৌদি আরবে আপনার কোম্পানি গঠনের পরবর্তী ধারাবাহিক ধাপসমূহ:\n\n১. **ডকুমেন্ট প্রস্তুতি ও সত্যায়ন**: মূল কোম্পানির সিআর ও অডিটেড ফাইন্যান্সিয়াল স্টেটমেন্ট নোটারি এবং পররাষ্ট্র মন্ত্রণালয়/সৌদি দূতাবাস কর্তৃক সত্যায়ন।\n২. **MISA ইনভেস্টমেন্ট লাইসেন্স আবেদন**: ট্রেক কনসালটেন্সির মাধ্যমে Ministry of Investment থেকে ১০০% বিদেশি মালিকানা লাইসেন্স সংগ্রহ (সাধারণত ৩–৭ কার্যদিবস)।\n৩. **কমার্শিয়াল রেজিস্ট্রেশন (CR) ও AoA**: বাণিজ্য মন্ত্রণালয় (MoC) থেকে সিআর ইস্যু এবং নোটারি পাবলিকের মাধ্যমে আর্টিকেলস অফ অ্যাসোসিয়েশন অনুমোদন।\n৪. **সৌদি ন্যাশনাল অ্যাড্রেস ও কর্পোরেট ব্যাংক অ্যাকাউন্ট**: রিয়াদ বা জেদ্দায় নিবন্ধিত ন্যাশনাল অ্যাড্রেস স্থাপন এবং সৌদি ব্যাংকে কর্পোরেট অ্যাকাউন্ট চালু।\n৫. **সরকারি পোর্টাল ও ভিসা**: ZATCA, GOSI, Qiwa প্ল্যাটফর্ম অ্যাক্টিভেশন এবং জেনারেল ম্যানেজার/ইনভেস্টর ভিসা ও ইকামা প্রসেসিং।\n\nট্রেক কনসালটেন্সি আপনাকে প্রথম ধাপ—ডকুমেন্টেশন ও পাওয়ার অব অ্যাটর্নি (POA)—থেকে শুরু করে শেষ পর্যন্ত সার্বিক সহায়তা প্রদান করবে। আপনি কি প্রয়োজনীয় কাগজপত্র নিয়ে আলোচনা করতে চান?`,
            source: 'AI'
          };
        }
        return {
          reply: `Here are the sequential next steps to proceed with your company formation in Saudi Arabia:\n\n1. **Document Preparation & Attestation**: Legalize parent company Commercial Registration and audited financial statements via notary, MOFA, and Saudi Embassy (or individual investor credentials).\n2. **MISA Investment License Application**: Trek Consultancy files and expedites your 100% foreign investment license with the Ministry of Investment (issued in 3 to 7 business days).\n3. **Commercial Registration (CR) & Articles (AoA)**: Register your entity charter with the Ministry of Commerce and legalize Articles of Association through an authorized Saudi notary.\n4. **National Address & Corporate Banking**: Establish your official Saudi National Address (SPL) in Riyadh/Jeddah and open your business bank account.\n5. **Tax & Labor Portal Activations**: Activate ZATCA (tax/VAT), GOSI (social insurance), and Qiwa/Muqeem to issue General Manager & investor visas/Iqamas.\n\nTrek Consultancy manages this entire turnkey cycle. Would you like assistance preparing your initial document checklist and Power of Attorney (POA)?`,
          source: 'AI'
        };
      }
    }

    // Intent 4.2: Costs & Fees
    if (isCostQuery && (lower.includes('saudi') || lower.includes('company') || lower.includes('setup') || lower.includes('misa') || lower.includes('business') || contextualLower.includes('saudi') || contextualLower.includes('company') || contextualLower.includes('misa') || contextualLower.includes('firm'))) {
      if (userLang === 'bn') {
        return {
          reply: `সৌদি আরবে কোম্পানি গঠনের খরচ ও সরকারি ফির সারসংক্ষেপ:\n\n১. **MISA ইনভেস্টমেন্ট লাইসেন্স ফি**: অনুমোদিত স্টার্টআপ বা এসএমই (SME) ক্যাটাগরিতে প্রথম বছরের সরকারি ফি প্রায় ২,০০০ এসএআর (SAR)। স্ট্যান্ডার্ড কমার্শিয়াল লাইসেন্সের ক্ষেত্রে নিয়মিত ক্যাটাগরি ফি প্রযোজ্য।\n২. **কমার্শিয়াল রেজিস্ট্রেশন (CR) ও চেম্বার অফ কমার্স**: নির্বাচিত বাণিজ্যিক কার্যক্রম ও মূলধনের ওপর ভিত্তি করে সাধারণত ১,২০০ – ২,৫০০ এসএআর।\n৩. **ন্যাশনাল অ্যাড্রেস ও অফিস স্পেস (Ejari)**: বার্ষিক বাণিজ্যিক অফিস লিজ বা নিবন্ধিত ব্যবসায়িক ঠিকানা স্থাপন ফি।\n৪. **ZATCA ও GOSI পোর্টাল নিবন্ধন**: সরকারি রেজিস্ট্রেশন সম্পূর্ণ বিনামূল্যে।\n৫. **জেনারেল ম্যানেজার ভিসা ও ইকামা**: বার্ষিক রেসিডেন্সি পারমিট ও ওয়ার্ক লেভি সাধারণত ৯,৫০০ – ১০,০০০ এসএআর প্রতি নির্বাহীর জন্য।\n৬. **ট্রেক কনসালটেন্সি সার্ভিস প্যাকেজ**: আমরা আইনি খসড়া, পররাষ্ট্র মন্ত্রণালয় লিয়াজোঁ, সরকারি অনুমোদন ও ব্যাংক একাউন্ট চালুর পূর্ণাঙ্গ প্যাকেজ সরবরাহ করি।\n\nআপনার পরিকল্পিত খাতের (যেমন আইটি, ট্রেডিং বা সার্ভিস) ওপর ভিত্তি করে নির্দিষ্ট বাজেট জানতে আমাদের সাথে যোগাযোগ করতে পারেন!`,
          source: 'FAQ'
        };
      }
      return {
        reply: `Here is the comprehensive cost and fee breakdown for establishing a company in Saudi Arabia:\n\n1. **MISA Investment License Fee**: For qualifying startups and SMEs, the initial first-year Ministry of Investment fee starts at approximately **2,000 SAR**. Standard commercial/service licenses follow standard statutory rates.\n2. **Commercial Registration (CR) & Chamber of Commerce**: Typically ranges between **1,200 SAR to 2,500 SAR** depending on activities and capital structure.\n3. **National Address & Certified Office (Ejari)**: Commercial lease or verified business address registration required by the Ministry of Commerce.\n4. **ZATCA & GOSI Registrations**: Completely free governmental portal activations.\n5. **General Manager Visa & Iqama**: Annual governmental residency and work permit levies (typically **9,500 – 10,000 SAR** per executive).\n6. **Trek Consultancy Turn-Key Advisory**: Complete legal drafting, MOFA liaison, banking facilitation, and government portal administration packages.\n\nBecause exact government fees vary depending on the chosen commercial activity and capital tier, Trek Consultancy provides customized commercial proposals. Let us know your planned industry for an itemized estimate!`,
        source: 'FAQ'
      };
    }

    // Intent 4.3: Direct Client Contact Information Provided
    if (isContactProvided) {
      const contactVal = extractedPhone || extractedEmail;
      if (userLang === 'bn') {
        return {
          reply: `ধন্যবাদ! আপনার যোগাযোগের তথ্যটি (${contactVal}) আমি অত্যন্ত নিরাপদে আমাদের রিয়াদের সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্কে নথিভুক্ত করেছি। আমাদের একজন সিনিয়র কনসালটেন্ট সরাসরি আপনার সাথে WhatsApp বা ফোনে যোগাযোগ করে ব্যক্তিগত পরামর্শ প্রদান করবেন।\n\nআমাদের কনসালটেন্ট যোগাযোগ করার পূর্বে, আপনার কোম্পানি গঠন, লাইসেন্সিং বা ডিজিটাল সলিউশন সংক্রান্ত কোনো নির্দিষ্ট তথ্য নিয়ে আমি কি আপনাকে এখনই প্রাথমিক ব্রিফিং দিয়ে সহায়তা করতে পারি?`,
          source: 'AI'
        };
      }
      return {
        reply: `Thank you! I have securely recorded your contact details (${contactVal}) for our Senior Advisory & Legal Desk in Riyadh. A dedicated senior consultant will reach out to you directly via WhatsApp or phone with priority attention.\n\nWhile our team prepares your personalized consultation, please let me know if there are any specific business objectives, licensing categories, or questions you'd like me to clarify for you right now!`,
        source: 'AI'
      };
    }

    // Intent 4.4: Contact, Phone & WhatsApp Inquiries (Executive Concierge - No deflection)
    if (isContactQuery) {
      if (userLang === 'bn') {
        return {
          reply: `আপনার এই ইনকোয়ারিটি আমি আমাদের রিয়াদের **সিনিয়র কনসালটেন্সি ও লিগ্যাল ডেস্কে** অগ্রাধিকার ভিত্তিতে পৌঁছে দিয়েছি। আমাদের একজন সিনিয়র কনসালটেন্ট সরাসরি আপনার বিষয়টি পর্যালোচনা করছেন।\n\nইতিমধ্যে আমাদের প্রাতিষ্ঠানিক যোগাযোগের চ্যানেলসমূহ:\n• **অফিশিয়াল ইমেইল**: ${supportEmail}\n• **সৌদি আরব প্রধান কার্যালয়**: কিং ফাহাদ রোড, রিয়াদ, সৌদি আরব\n• **আন্তর্জাতিক লিয়াজোঁ অফিস**: ঢাকা, বাংলাদেশ\n\nআপনার সুবিধাজনক ফোন নম্বর বা হোয়াটসঅ্যাপ নম্বরটি এখানে চ্যাটে লিখে রাখলে আমাদের সিনিয়র কনসালটেন্ট সরাসরি আপনার সাথে যোগাযোগ করে পূর্ণাঙ্গ গাইডলাইন ও সমাধান প্রদান করবেন।`,
          source: 'AI'
        };
      }
      return {
        reply: `I have escalated and prioritized your inquiry directly with our **Senior Advisory & Legal Desk in Riyadh**. A dedicated senior consultant has been notified and is reviewing your request.\n\nIn the meantime, here are our verified executive contact channels:\n• **Direct Corporate Email**: ${supportEmail}\n• **Saudi Arabia Headquarters**: King Fahd Road, Riyadh, Kingdom of Saudi Arabia\n• **International Liaison Desk**: Dhaka, Bangladesh\n\nIf you share your preferred WhatsApp or direct phone number right here in this chat, our senior consultant will reach out to you directly with a personalized briefing.`,
        source: 'AI'
      };
    }

    // Intent 4.5: Bespoke Enterprise Proposals & Contracts
    if (isBespokeQuery) {
      if (userLang === 'bn') {
        return {
          reply: `কাস্টমাইজড এন্টারপ্রাইজ প্রপোজাল, প্রাতিষ্ঠানিক চুক্তি ও এনডিএ (NDA)-এর জন্য আপনার চাহিদাটি সরাসরি আমাদের সিনিয়র পার্টনার ডেস্কে ফরোয়ার্ড করা হয়েছে। আমাদের সিনিয়র টিম আপনার প্রয়োজনীয়তা যাচাই করে আনুষ্ঠানিক প্রপোজাল তৈরি করবে।\n\nআপনার প্রাতিষ্ঠানিক ইমেইল বা হোয়াটসঅ্যাপ নম্বরটি এখানে চ্যাটে প্রদান করলে আমাদের ম্যানেজিং কনসালটেন্ট সরাসরি আপনার সাথে যোগাযোগ করে প্রস্তাবনাটি পাঠিয়ে দেবেন।`,
          source: 'AI'
        };
      }
      return {
        reply: `For bespoke enterprise contracts, customized commercial proposals, and institutional NDAs, I have routed your specifications directly to our Senior Advisory Partners. Our executive team will review the parameters to prepare your customized documentation.\n\nPlease feel free to share your corporate contact email or WhatsApp number here in chat so our managing consultant can deliver the formal proposal directly to your executive desk.`,
        source: 'AI'
      };
    }

    // Intent 5: Tech Architecture
    if (isTechStackQuery) {
      if (userLang === 'bn') {
        return {
          reply: `**Trek Consultancy Forum**-এর আধুনিক কারিগরি আর্কিটেকচার:\n\n- **ফ্রন্টএন্ড**: React 19, TypeScript, Tailwind CSS v4 এবং Vite বিল্ড সিস্টেম।\n- **ডাটাবেজ ও পারসিস্টেন্স**: Neon Serverless PostgreSQL—সব আলোচনা, বার্তা ও সাপোর্ট টিকিট রিয়েল-টাইমে নিরাপদ ক্লাউড ডাটাবেজে সংরক্ষিত হয়।\n- **এআই অ্যাসিস্ট্যান্ট**: গুগুল জেমিনি ও লোকাল RAG নলেজ ইঞ্জিন দ্বারা চালিত ২৪/৭ ইন্টেলিজেন্ট সাপোর্ট।\n- **থিম ইন্টিগ্রেশন**: Docly ও bbPress কমপ্যাটিবল রেসপনসিভ ড্যাশবোর্ড ও ডকুমেন্টেশন সিস্টেম।`,
          source: 'RAG'
        };
      }
      return {
        reply: `**Trek Consultancy Forum** Technical Architecture:\n\n- **Frontend**: React 19, TypeScript, Tailwind CSS v4, and Vite.\n- **Database & Persistence**: Powered by Neon Serverless PostgreSQL with WebSocket connection pooling—providing real-time data persistence across threads, replies, tickets, and knowledge bases.\n- **AI & RAG Engine**: Multi-tiered RAG intelligence backed by Google Gemini and specialized local vector-heuristic chunking.\n- **Design & Layout**: Modern clean SaaS interface with full bilingual English & Bengali localization.`,
        source: 'RAG'
      };
    }

    // Intent 6: Services Overview / Brand Identity
    if (isAboutOrServices || (isHelpQuery && sigTokens.length <= 1)) {
      if (userLang === 'bn') {
        return {
          reply: `**Trek Consultancy** হলো আন্তর্জাতিক উদ্যোক্তা ও প্রযুক্তি দলগুলোর জন্য একটি শীর্ষস্থানীয় করপোরেট পরামর্শক ও পূর্ণাঙ্গ প্রযুক্তি সমাধান সংস্থা।\n\nআমাদের মূল ৬টি সেবামূলক স্তম্ভ:\n\n- **১. সৌদি বিজনেস সেটআপ (Pillar 1)**: বিদেশি উদ্যোক্তাদের জন্য ১০০% মালিকানাধীন কোম্পানি গঠন, MISA ইনভেস্টমেন্ট লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন (CR), চেম্বার অফ কমার্স এবং কর্পোরেট ব্যাংক অ্যাকাউন্ট ওপেনিং।\n- **২. সফটওয়্যার ও ডিজিটাল সলিউশনস (Pillar 2)**: ইন-হাউস টেক ডিভিশন দ্বারা আধুনিক এন্টারপ্রাইজ ERP, কাস্টম ওয়েব ও মোবাইল অ্যাপস, ক্লাউড আর্কিটেকচার এবং এআই অটোমেশন।\n- **৩. ভিসা ও সরকারি PRO সেবা (Pillar 3)**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, রেসিডেন্ট ইকামা, এবং Qiwa ও Muqeem প্ল্যাটফর্মের সম্পূর্ণ সরকারি লিয়াজোঁ।\n- **৪. রিয়েল এস্টেট ইনভেস্টমেন্ট (Pillar 4)**: রিয়াদ, জেদ্দাসহ সৌদি আরবের মূল অর্থনৈতিক অঞ্চলে কমার্শিয়াল অফিস স্পেস, জমি ও শিল্প স্থাপনা লিজ বা ক্রয়ের পরামর্শ।\n- **৫. করপোরেট ব্যাকঅফিস সাপোর্ট (Pillar 5)**: চার্টার্ড অ্যাকাউন্টিং, অডিট, ZATCA ই-ইনভয়েসিং ও ভ্যাট ফাইলিং, পেরোল এবং কমপ্লায়েন্স।\n- **৬. আন্তর্জাতিক সম্প্রসারণ (Pillar 6)**: যুক্তরাষ্ট্র (USA LLC), যুক্তরাজ্য (UK Ltd) ও কানাডায় কোম্পানি রেজিস্ট্রেশন এবং গ্লোবাল বিজনেস ব্যাংকিং।\n\nআপনার কি কোনো নির্দিষ্ট স্তম্ভ বা সেবা সম্পর্কে বিস্তারিত জানার প্রয়োজন? আমাকে জানালে আমি পদক্ষেপগুলো ধাপে ধাপে বুঝিয়ে দেব!`,
          source: 'AI'
        };
      }
      return {
        reply: `**Trek Consultancy** is a premier international advisory firm and technology powerhouse specializing in turnkey enterprise expansion, Saudi market entry, and high-impact digital solutions.\n\nOur **6 Strategic Pillars of Excellence**:\n\n- **Pillar 1: Saudi Business Setup**: 100% foreign-owned company incorporation, MISA Foreign Investment Licenses, Commercial Registration (CR), Articles of Association (AoA), and corporate banking setups.\n- **Pillar 2: Software & Digital Engineering**: In-house tech division providing enterprise ERP systems, custom web/mobile applications, resilient cloud architecture, and AI automation.\n- **Pillar 3: Visa & Saudi PRO Government Liaison**: Premium investor visas, employee work permits, executive Iqama issuance & renewals, and Qiwa/Muqeem government portal administration.\n- **Pillar 4: Real Estate Investment**: Commercial office spaces, warehouses, and industrial leases across Riyadh, Jeddah, and Khobar with foreign ownership compliance.\n- **Pillar 5: Corporate & Financial Support**: Accounting, statutory audits conforming to IFRS, ZATCA Phase 2 VAT/tax compliance, and HR/payroll administration.\n- **Pillar 6: International Expansion**: USA (Delaware/Wyoming LLCs), UK (Companies House Ltd), Canada corporate setups, and global tier-1 banking.\n\nWhich area would you like to explore in more detail? I can provide step-by-step guidance, timelines, and documentation requirements!`,
        source: 'AI'
      };
    }

    // 3. Score Knowledge Documents & FAQs using Significant Tokens
    const scoredDocs = docs.map((d: any) => {
      const titleLow = (d.title || '').toLowerCase();
      const contentLow = (d.content || '').toLowerCase();
      const catLow = (d.category || '').toLowerCase();
      let score = 0;

      if (lower.length > 5 && titleLow.includes(lower)) score += 40;
      if (lower.length > 8 && contentLow.includes(lower)) score += 20;

      for (const bg of bigrams) {
        if (titleLow.includes(bg)) score += 15;
        if (contentLow.includes(bg)) score += 6;
      }

      for (const w of sigTokens) {
        if (titleLow.includes(w)) score += 12;
        if (catLow.includes(w)) score += 8;
        if (contentLow.includes(w)) score += 3;
      }

      if ((lower.includes('zatca') || lower.includes('vat') || lower.includes('tax') || lower.includes('accounting') || lower.includes('e-invoicing')) && (titleLow.includes('pillar 5') || titleLow.includes('accounting') || titleLow.includes('tax') || contentLow.includes('zatca'))) {
        score += 50;
      }

      return { doc: d, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    const scoredFaqs = faqs.map((f: any) => {
      const qLow = (f.question || '').toLowerCase();
      const aLow = (f.answer || '').toLowerCase();
      const qBnLow = (f.question_bn || '').toLowerCase();
      const aBnLow = (f.answer_bn || '').toLowerCase();
      const catLow = (f.category || '').toLowerCase();
      let score = 0;

      if (lower.length > 5 && (qLow.includes(lower) || qBnLow.includes(lower))) score += 45;
      if (lower.length > 8 && (aLow.includes(lower) || aBnLow.includes(lower))) score += 20;

      for (const bg of bigrams) {
        if (qLow.includes(bg) || qBnLow.includes(bg)) score += 18;
        if (aLow.includes(bg) || aBnLow.includes(bg)) score += 8;
      }

      for (const w of sigTokens) {
        if (qLow.includes(w) || qBnLow.includes(w)) score += 14;
        if (catLow.includes(w)) score += 6;
        if (aLow.includes(w) || aBnLow.includes(w)) score += 3;
      }

      // Contextual boost: if asking for requirements/documents needed to do business
      if ((lower.includes('lagbe') || lower.includes('lage') || lower.includes('কাগজ') || lower.includes('ডকুমেন্ট') || lower.includes('document')) && (f.id?.includes('required') || qLow.includes('document') || qBnLow.includes('কাগজ'))) {
        score += 45;
      }

      if ((lower.includes('zatca') || lower.includes('vat') || lower.includes('tax') || lower.includes('accounting') || lower.includes('e-invoicing')) && (f.id?.includes('zatca') || f.id?.includes('tax') || qLow.includes('zatca') || qLow.includes('tax') || qBnLow.includes('ট্যাক্স') || qBnLow.includes('ভ্যাট'))) {
        score += 50;
      }

      return { faq: f, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    // Score Verified Human Support Tickets (Highest-Confidence Ground Truth from Senior Consultants)
    const scoredTickets = (answeredTickets || []).map((t: any) => {
      const qLow = (t.question || '').toLowerCase();
      const sLow = (t.subject || '').toLowerCase();
      const aLow = (t.adminAnswer || '').toLowerCase();
      let score = 0;

      if (lower.length > 5 && (qLow.includes(lower) || sLow.includes(lower))) score += 55;
      if (lower.length > 8 && aLow.includes(lower)) score += 25;

      for (const bg of bigrams) {
        if (qLow.includes(bg) || sLow.includes(bg)) score += 22;
        if (aLow.includes(bg)) score += 10;
      }

      for (const w of sigTokens) {
        if (qLow.includes(w) || sLow.includes(w)) score += 16;
        if (aLow.includes(w)) score += 5;
      }

      return { ticket: t, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    // Intent 6.5: Verified Human Consultant Ticket Resolution Match
    if (scoredTickets.length > 0 && scoredTickets[0].score >= 12) {
      const topTkt = scoredTickets[0].ticket;
      if (userLang === 'bn') {
        return {
          reply: `আমাদের সিনিয়র কনসালটেন্ট টিম কর্তৃক যাচাইকৃত সমাধান:\n\n${topTkt.adminAnswer}\n\nআপনার যদি এই বিষয়ে আরও কোনো বিস্তারিত তথ্য বা সহযোগিতার প্রয়োজন হয়, আমাকে নির্দ্বিধায় জিজ্ঞাসা করতে পারেন!`,
          source: 'STAFF'
        };
      }
      return {
        reply: `According to our Senior Advisory & Support resolution:\n\n${topTkt.adminAnswer}\n\nFeel free to ask if you would like further details or next steps on this!`,
        source: 'STAFF'
      };
    }

    // Intent 7: FAQ Match
    if (scoredFaqs.length > 0 && scoredFaqs[0].score >= 12) {
      const topFaq = scoredFaqs[0].faq;
      const faqAns = userLang === 'bn' && topFaq.answer_bn ? topFaq.answer_bn : topFaq.answer;
      return {
        reply: faqAns,
        source: 'FAQ'
      };
    }

    // Intent 8: Document Match
    if (scoredDocs.length > 0 && scoredDocs[0].score >= 12) {
      const topDoc = scoredDocs[0].doc;
      if (userLang === 'bn') {
        if (topDoc.title.includes('Pillar 5') || topDoc.title.includes('Accounting') || topDoc.title.includes('Tax') || topDoc.title.includes('Business Support') || isAccountingTaxQuery || lower.includes('zatca')) {
          return {
            reply: `ট্রেক কনসালটেন্সির কর্পোরেট একাউন্টিং ও ট্যাক্স সেবা:\n\n• **IFRS বুককিপিং**: নির্ভুল মাসিক হিসাব ও আর্থিক প্রতিবেদন।\n• **ZATCA ফেজ ২ ও ভ্যাট**: ই-ইনভয়েসিং কমপ্লায়েন্স ও সময়মতো ট্যাক্স রিটার্ন জমা।\n• **আইনি অডিট**: সনদপ্রাপ্ত চার্টার্ড অডিট রিপোর্ট।\n• **পেরোল ও GOSI**: কর্মী বেতন ও সামাজিক বীমা ব্যবস্থাপনা।`,
            source: 'RAG'
          };
        }
        if (topDoc.title.includes('Pillar 1') || topDoc.title.includes('Saudi Business')) {
          return {
            reply: `সৌদি আরবে কোম্পানি গঠনের সম্পূর্ণ গাইডলাইন:\n\n১. **১০০% বিদেশি মালিকানা ও MISA লাইসেন্স**: ভিশন ২০৩০-এর আওতায় বিদেশি উদ্যোক্তারা কোনো স্থানীয় স্পন্সর ছাড়াই ১০০% কোম্পানির মালিক হতে পারেন।\n২. **কমার্শিয়াল রেজিস্ট্রেশন (CR)**: বাণিজ্য মন্ত্রণালয় থেকে বাণিজ্যিক কার্যক্রমের নিবন্ধন।\n৩. **আর্টিকেলস অফ অ্যাসোসিয়েশন (AoA)**: নোটারি পাবলিকের মাধ্যমে আইনি অনুমোদন।\n৪. **কর্পোরেট ব্যাংক অ্যাকাউন্ট ও ন্যাশনাল অ্যাড্রেস**: রিয়াদ বা জেদ্দায় নিবন্ধিত ন্যাশনাল অ্যাড্রেস এবং সৌদি ব্যাংকে একাউন্ট ওপেনিং।\n৫. **ট্যাক্স ও শ্রম পোর্টাল**: ZATCA, GOSI, Qiwa ও Muqeem প্ল্যাটফর্ম অ্যাক্টিভেশন।\n\nট্রেক কনসালটেন্সি এই সম্পূর্ণ প্রক্রিয়াটি টার্নকি ভিত্তিতে পরিচালনা করে।`,
            source: 'RAG'
          };
        }
        if (topDoc.title.includes('Pillar 2') || topDoc.title.includes('Software')) {
          return {
            reply: `ট্রেক কনসালটেন্সির ইন-হাউস সফটওয়্যার ও ডিজিটাল সলিউশন:\n\n• **কাস্টম ইআরপি ও সফটওয়্যার**: ব্যবসার চাহিদা অনুযায়ী কাস্টমাইজড এন্টারপ্রাইজ সিস্টেম।\n• **ওয়েব ও মোবাইল অ্যাপস**: React, TypeScript, Node.js এবং ক্লাউড আর্কিটেকচার দ্বারা তৈরি স্কেলেবল প্ল্যাটফর্ম।\n• **এআই অটোমেশন**: ইন্টেলিজেন্ট চ্যাটবট, ডেটা প্রসেসিং ও প্রসেস অটোমেশন।\n• **ক্লাউড ও ডেভঅপস**: মাইক্রোসার্ভিসেস, সিকিউরিটি ও ক্লাউড ডেটাবেজ ম্যানেজমেন্ট।`,
            source: 'RAG'
          };
        }
        if (topDoc.title.includes('Pillar 3') || topDoc.title.includes('Visa') || topDoc.title.includes('PRO')) {
          return {
            reply: `ট্রেক কনসালটেন্সির সরকারি PRO ও ভিসা সেবাসমূহ:\n\n• **ইনভেস্টর ভিসা ও ওয়ার্ক পারমিট**: বিদেশি উদ্যোক্তা ও কর্মীদের জন্য সরকারি অনুমোদন।\n• **রেসিডেন্ট ইকামা (Iqama)**: এক্সিকিউটিভ রেসিডেন্স পারমিট প্রদান ও বার্ষিক রিনিউয়াল।\n• **Qiwa ও Muqeem পোর্টাল**: চুক্তি তৈরি, ট্রান্সফার অফ স্পনসরশিপ ও সরকারি কমপ্লায়েন্স।\n• **ডকুমেন্টেশন সত্যায়ন**: পররাষ্ট্র মন্ত্রণালয় ও চেম্বার অফ কমার্সে আইনি অনুমোদন।`,
            source: 'RAG'
          };
        }
        if (topDoc.title.includes('Pillar 4') || topDoc.title.includes('Real Estate')) {
          return {
            reply: `সৌদি আরবে বাণিজ্যিক রিয়েল এস্টেট সেবা:\n\n• **বাণিজ্যিক অফিস স্পেস**: রিয়াদ, জেদ্দা ও দাম্মামে প্রিমিয়াম অফিস লিজ (Ejari)।\n• **সম্পত্তি মালিকানা**: বিদেশি উদ্যোক্তাদের জন্য আইনসম্মত বাণিজ্যিক ও শিল্প সম্পত্তি ক্রয় পরামর্শ।\n• **শিল্প পার্ক ও গুদাম**: লজিস্টিক অঞ্চল ও কারখানার দীর্ঘমেয়াদি লিজ।`,
            source: 'RAG'
          };
        }
        if (topDoc.title.includes('Pillar 5') || topDoc.title.includes('Accounting') || topDoc.title.includes('Tax') || topDoc.title.includes('Business Support')) {
          return {
            reply: `ট্রেক কনসালটেন্সির কর্পোরেট একাউন্টিং ও ট্যাক্স সেবা:\n\n• **IFRS বুককিপিং**: নির্ভুল মাসিক হিসাব ও আর্থিক প্রতিবেদন।\n• **ZATCA ফেজ ২ ও ভ্যাট**: ই-ইনভয়েসিং কমপ্লায়েন্স ও সময়মতো ট্যাক্স রিটার্ন জমা।\n• **আইনি অডিট**: সনদপ্রাপ্ত চার্টার্ড অডিট রিপোর্ট।\n• **পেরোল ও GOSI**: কর্মী বেতন ও সামাজিক বীমা ব্যবস্থাপনা।`,
            source: 'RAG'
          };
        }
        if (topDoc.title.includes('Pillar 6') || topDoc.title.includes('International')) {
          return {
            reply: `ট্রেক কনসালটেন্সির আন্তর্জাতিক কোম্পানি সেটআপ সেবা:\n\n• **USA LLC ও C-Corp**: ডেলাওয়্যার, ওয়াইয়োমিং ও ফ্লোরিডায় কোম্পানি গঠন এবং IRS থেকে EIN সংগ্রহ।\n• **UK Ltd**: যুক্তরাজ্যে কোম্পানি রেজিস্ট্রেশন ও নিবন্ধিত ঠিকানা।\n• **কানাডা কর্পোরেশন**: কানাডার প্রাদেশিক বা ফেডারেল কোম্পানি নিবন্ধন।\n• **আন্তর্জাতিক ব্যাংকিং**: Mercury ও Wise Business-এ বহু-মুদ্রা অ্যাকাউন্ট সুবিধা।`,
            source: 'RAG'
          };
        }
      }
      return {
        reply: topDoc.content,
        source: 'RAG'
      };
    }

    // Intent 9: Domain fallbacks
    if (isSaudiSetupQuery) {
      const matchedDoc = docs.find((d: any) => d.title.includes('Pillar 1') || d.title.includes('Saudi Business Setup'));
      const content = matchedDoc ? matchedDoc.content : '';

      if (userLang === 'bn') {
        return {
          reply: `সৌদি আরবে ব্যবসা শুরু করা এবং কোম্পানি গঠনের সম্পূর্ণ প্রক্রিয়া:\n\n1. **১০০% বিদেশি মালিকানা ও MISA লাইসেন্স**: সৌদি সরকারের ভিশন ২০৩০-এর আওতায় বেশিরভাগ খাতে বিদেশি উদ্যোক্তারা কোনো স্থানীয় স্পন্সর ছাড়াই ১০০% কোম্পানির মালিক হতে পারেন। এর প্রথম ধাপ হলো Ministry of Investment (MISA) থেকে ইনভেস্টমেন্ট লাইসেন্স গ্রহণ।\n2. **কমার্শিয়াল রেজিস্ট্রেশন (CR)**: MISA লাইসেন্স অনুমোদনের পর বাণিজ্য মন্ত্রণালয় (Ministry of Commerce) থেকে কমার্শিয়াল রেজিস্ট্রেশন ইস্যু করা হয়।\n3. **আর্টিকেলস অফ অ্যাসোসিয়েশন (AoA)**: নোটারি পাবলিকের মাধ্যমে মেমোরেন্ডাম ও আর্টিকেলের আইনি অনুমোদন।\n4. **কর্পোরেট ব্যাংক অ্যাকাউন্ট ও ন্যাশনাল অ্যাড্রেস**: রিয়াদ বা জেদ্দায় নিবন্ধিত ন্যাশনাল অ্যাড্রেস (SPL) এবং শীর্ষস্থানীয় ব্যাংকে কর্পোরেট একাউন্ট স্থাপন।\n5. **ট্যাক্স ও সরকারি পোর্টাল সক্রিয়করণ**: ZATCA (ট্যাক্স ও ভ্যাট), GOSI (সামাজিক বীমা), এবং শ্রম মন্ত্রণালয়ের Qiwa ও Muqeem পোর্টাল অ্যাক্টিভেশন।\n\n${content ? `\n\n**আমাদের সেবার সারসংক্ষেপ:**\n${content.slice(0, 350)}...` : ''}\n\nট্রেক কনসালটেন্সি এই সম্পূর্ণ প্রক্রিয়াটি টার্নকি ভিত্তিতে পরিচালনা করে। আপনার কি নির্দিষ্ট কোনো সেক্টর বা ডকুমেন্টেশন সম্পর্কে জানার আছে?`,
          source: 'RAG'
        };
      }
      return {
        reply: `Here is the comprehensive guide to establishing a company in Saudi Arabia with Trek Consultancy:\n\n1. **100% Foreign Ownership via MISA License**: Under Saudi Vision 2030, international investors can own 100% of their enterprise in most commercial, industrial, and tech sectors without requiring a local Saudi partner. The foundational step is securing the **MISA Foreign Investment License** from the Ministry of Investment.\n2. **Commercial Registration (CR)**: Once MISA approves the license, the Ministry of Commerce issues the Commercial Registration defining your business activities.\n3. **Articles of Association (AoA)**: Formal notary legalization of the company charter and shareholder agreements.\n4. **National Address & Corporate Banking**: Setting up the official Saudi National Address (SPL) and opening an operational business bank account with top-tier Saudi banks (e.g. SNB, Al Rajhi, SAB).\n5. **Tax & Labor Portal Activations**: Registration with ZATCA (VAT/Corporate Tax), GOSI (Social Insurance), and the Qiwa & Muqeem labor platforms.\n\n${content ? `\n**Overview from our Knowledge Base:**\n${content.slice(0, 350)}...\n` : ''}\nTrek Consultancy handles this complete formation cycle from end to end. Let me know if you would like specific details regarding capital requirements or timelines!`,
        source: 'RAG'
      };
    }

    if (isSoftwareQuery) {
      const matchedDoc = docs.find((d: any) => d.title.includes('Software & Digital'));
      const content = matchedDoc ? matchedDoc.content : '';

      if (userLang === 'bn') {
        return {
          reply: `ট্রেক কনসালটেন্সির **Software & Digital Solutions** ডিভিশন এন্টারপ্রাইজ পর্যায়ে আধুনিক প্রযুক্তি সমাধান সরবরাহ করে:\n\n- **কাস্টম সফটওয়্যার ও ইআরপি (ERP)**: প্রতিটি ব্যবসার স্বতন্ত্র ওয়ার্কফ্লো অনুযায়ী তৈরি ইনভেন্টরি, একাউন্টিং, সাপ্লাই চেইন ও এন্টারপ্রাইজ ম্যানেজমেন্ট প্ল্যাটফর্ম।\n- **ওয়েব ও মোবাইল অ্যাপ্লিকেশন**: React, TypeScript, Node.js ও ক্লাউড ডাটাবেজ দিয়ে তৈরি দ্রুতগতির, সুরক্ষিত এবং স্কেলেবল অ্যাপ্লিকেশন।\n- **এআই ও অটোমেশন (AI Automation)**: আধুনিক এআই ইন্টিগ্রেশন, কাস্টমার সাপোর্ট বট এবং ব্যবসায়িক ডেটা অটোমেশন।\n- **ক্লাউড আর্কিটেকচার ও ডেভঅপস**: মাইক্রোসার্ভিসেস, ক্লাউড মাইগ্রেশন এবং নিরবচ্ছিন্ন সিআই/সিডি পাইপলাইন।\n\n${content ? `\n**নলেজ বেস সারসংক্ষেপ:**\n${content.slice(0, 300)}...` : ''}\n\nআপনার প্রজেক্টের জন্য কোনো আর্কিটেকচার রিভিউ বা সফটওয়্যার ডেভেলপমেন্ট প্রয়োজন হলে বিস্তারিত বলুন, আমি সমাধান সাজিয়ে দিতে পারি!`,
          source: 'RAG'
        };
      }
      return {
        reply: `Trek Consultancy's in-house **Software & Digital Solutions** division delivers enterprise-grade engineering tailored for modern businesses:\n\n- **Custom Enterprise Software & ERPs**: Tailored business operating systems, inventory management, CRM, and supply chain automation designed around your exact workflows.\n- **Modern Web & Mobile Applications**: High-performance, scalable applications built with React, TypeScript, Node.js, and resilient PostgreSQL/cloud backends.\n- **AI & Process Automation**: Custom conversational agents, RAG workflows, intelligent document extractors, and automated business operations.\n- **Cloud Architecture & DevOps**: High-traffic optimization, microservices, containerization, and automated CI/CD pipelines.\n\n${content ? `\n**From our Engineering Documentation:**\n${content.slice(0, 300)}...\n` : ''}\nFeel free to describe your project requirements or technical stack, and I can provide architectural recommendations!`,
        source: 'RAG'
      };
    }

    if (isVisaQuery) {
      const matchedDoc = docs.find((d: any) => d.title.includes('Visa & PRO') || d.title.includes('Pillar 3'));
      const content = matchedDoc ? matchedDoc.content : '';

      if (userLang === 'bn') {
        return {
          reply: `ট্রেক কনসালটেন্সির **Visa & Saudi PRO Government Liaison** সেবাসমূহ:\n\n- **ইনভেস্টর ভিসা (Investor Visa)**: বিদেশি কোম্পানির মালিক ও শেয়ারহোল্ডারদের জন্য প্রিমিয়াম ইনভেস্টর রেসিডেন্সি ও এক্সিকিউটিভ ভিসা প্রসেসিং।\n- **ওয়ার্ক পারমিট ও ইকামা (Iqama)**: সৌদি আরবে কর্মীদের জন্য ওয়ার্ক ভিসা কোটা সংগ্রহ, ইকামা ইস্যু ও বাৎসরিক নবায়ন।\n- **Qiwa ও Muqeem পোর্টাল পরিচালনা**: শ্রম মন্ত্রণালয়ের ডিজিটাল চুক্তি যাচাই, ট্রান্সফার অফ স্পনসরশিপ এবং প্রফেশন পরিবর্তন।\n- **ডকুমেন্ট অ্যাটেস্টেশন**: পররাষ্ট্র মন্ত্রণালয়, দূতাবাস এবং চেম্বার অফ কমার্স থেকে প্রয়োজনীয় প্রাতিষ্ঠানিক কাগজপত্রের আইনি সত্যায়ন।\n\n${content ? `\n**নলেজ বেস তথ্য:**\n${content.slice(0, 300)}...` : ''}\n\nভিসা ক্যাটাগরি বা ইকামা নবায়ন নিয়ে কোনো প্রশ্ন থাকলে আমাকে জানাতে পারেন!`,
          source: 'RAG'
        };
      }
      return {
        reply: `Trek Consultancy's **Visa & Saudi PRO Government Liaison Services** provide seamless regulatory management with Saudi authorities:\n\n- **Investor & Executive Visas**: Specialized foreign investor visas, GM visas, and residency permits for company principals and shareholders.\n- **Work Permits & Iqama Issuance**: Complete employee visa quota requests, labor ministry contracts, medical insurance enrollment, and Iqama renewals.\n- **Digital Government Portals**: Active administration of the **Qiwa** (labor contracts & transfers) and **Muqeem** (entry/exit visas & residency records) platforms.\n- **Attestation & Legalization**: Embassy attestations, Ministry of Foreign Affairs (MOFA) verifications, and Chamber of Commerce approvals.\n\n${content ? `\n**From our Official Records:**\n${content.slice(0, 300)}...\n` : ''}\nLet me know if you need specific advice on Iqama renewals, quota requirements, or investor visa documentation!`,
        source: 'RAG'
      };
    }

    if (isRealEstateQuery) {
      const matchedDoc = docs.find((d: any) => d.title.includes('Real Estate') || d.title.includes('Pillar 4'));
      const content = matchedDoc ? matchedDoc.content : '';

      if (userLang === 'bn') {
        return {
          reply: `সৌদি আরবে রিয়েল এস্টেট বিনিয়োগ ও বাণিজ্যিক সম্পত্তি সংক্রান্ত তথ্য:\n\n- **বাণিজ্যিক অফিস স্পেস**: নতুন কোম্পানির জন্য রিয়াদ, জেদ্দা ও দাম্মামের প্রাইম বাণিজ্যিক টাওয়ারে অফিস লিজ বা ক্রয়।\n- **বিদেশি মালিকানায় রিয়েল এস্টেট**: অনুমোদিত বিনিয়োগ কাঠামোর অধীনে বিদেশি উদ্যোক্তা ও কোম্পানিগুলোর জন্য বৈধ সম্পত্তি ক্রয় পরামর্শ।\n- **শিল্প ও গুদাম সুবিধা**: বিশেষ অর্থনৈতিক অঞ্চল ও লজিস্টিক পার্কে কারখানা ও গুদামের দীর্ঘমেয়াদী লিজ চুক্তি।\n- **আইনি যাচাই ও ডিউ ডিলিজেন্স**: জমির দলিল ও চুক্তির আইনি বিশুদ্ধতা পরীক্ষা এবং সরকারি রেজিস্ট্রেশন সাপোর্ট।\n\n${content ? `\n**নলেজ বেস গাইড:**\n${content.slice(0, 300)}...` : ''}\n\nআপনার কি কোনো নির্দিষ্ট শহর বা বাণিজ্যিক প্রপার্টি সম্পর্কিত পরামর্শ প্রয়োজন?`,
          source: 'RAG'
        };
      }
      return {
        reply: `Here is the advisory guide on **Real Estate Investment in Saudi Arabia** with Trek Consultancy:\n\n- **Commercial Property & Office Spaces**: Securing certified commercial leases (Ejari) required for corporate registration across Riyadh, Jeddah, and Khobar.\n- **Eligible Foreign Property Ownership**: Navigating updated Saudi investment laws allowing foreign investors and entities to acquire commercial, residential, and industrial assets.\n- **Industrial & Logistics Parks**: Warehouse leasing, manufacturing facility acquisitions, and special economic zone setups.\n- **Due Diligence & Title Deed Verification**: Comprehensive legal verification, deed authentication, and contract finalization.\n\n${content ? `\n**Knowledge Base Overview:**\n${content.slice(0, 300)}...\n` : ''}\nFeel free to ask about specific cities, commercial lease compliance, or foreign asset ownership regulations!`,
        source: 'RAG'
      };
    }

    if (isAccountingTaxQuery) {
      const matchedDoc = docs.find((d: any) => d.title.includes('Business Support') || d.title.includes('Corporate Support') || d.title.includes('Pillar 5'));
      const content = matchedDoc ? matchedDoc.content : '';

      if (userLang === 'bn') {
        return {
          reply: `ট্রেক কনসালটেন্সির **Corporate Support, Accounting & Tax Compliance** সেবাসমূহ:\n\n- **মাসিক হিসাবরক্ষণ (Bookkeeping)**: আইএফআরএস (IFRS) মান অনুযায়ী নির্ভুল জার্নাল, লেজার এবং ব্যালেন্স শিট তৈরি।\n- **ZATCA ই-ইনভয়েসিং ও ভ্যাট ফাইলিং**: সৌদি আরবের ফেজ ২ ই-ইনভয়েসিং সিস্টেম ইন্টিগ্রেশন এবং কোয়ার্টারলি ভ্যাট রিটার্ন জমা দেওয়া।\n- **আইনি অডিট (Statutory External Audit)**: লাইসেন্স নবায়নের জন্য প্রয়োজনীয় বার্ষিক অডিট রিপোর্ট প্রণয়ন।\n- **পেরোল ও GOSI কমপ্লায়েন্স**: কর্মীদের মাসিক বেতন প্রসেসিং এবং সামাজিক বীমা (GOSI) কন্ট্রিবিউশন পরিচালনা।\n\n${content ? `\n**সারসংক্ষেপ:**\n${content.slice(0, 300)}...` : ''}\n\nআপনার প্রতিষ্ঠানের ট্যাক্স বা অডিট সংক্রান্ত কোনো সহায়তার প্রয়োজন হলে জানাতে পারেন!`,
          source: 'RAG'
        };
      }
      return {
        reply: `Trek Consultancy's **Corporate Support, Accounting & Tax Division** guarantees end-to-end regulatory compliance for Saudi and international businesses:\n\n- **Full-Cycle Accounting & Bookkeeping**: IFRS-compliant monthly financial records, profit/loss statements, and balance sheets.\n- **ZATCA Phase 2 E-Invoicing & VAT Compliance**: Integration with ZATCA's Fatoora platform and quarterly VAT return filings.\n- **Statutory Financial Audits**: Preparation of certified independent audit reports mandated for commercial license renewals and shareholder reporting.\n- **Payroll & GOSI Contributions**: Wage Protection System (WPS) compliance and monthly social insurance administration.\n\n${content ? `\n**From our Compliance Records:**\n${content.slice(0, 300)}...\n` : ''}\nLet me know if you need specific guidance on ZATCA Phase 2 rules, corporate income tax, or VAT exemptions!`,
        source: 'RAG'
      };
    }

    if (isInternationalQuery) {
      const matchedDoc = docs.find((d: any) => d.title.includes('International') || d.title.includes('Pillar 6'));
      const content = matchedDoc ? matchedDoc.content : '';

      if (userLang === 'bn') {
        return {
          reply: `ট্রেক কনসালটেন্সির **International Business Services** (Pillar 6):\n\n- **যুক্তরাষ্ট্র (USA LLC & C-Corp)**: ডেলাওয়্যার (Delaware), ওয়াইয়োমিং (Wyoming), ফ্লোরিডাসহ যেকোনো রাজ্যে দ্রুততম সময়ে কোম্পানি গঠন ও ইআইএন (EIN) প্রাপ্তি।\n- **যুক্তরাজ্য (UK Ltd)**: Companies House-এ ইউকে লিমিটেড কোম্পানি রেজিস্ট্রেশন ও অফিসিয়াল অ্যাড্রেস।\n- **কানাডা কর্পোরেশন**: কানাডার প্রাদেশিক বা ফেডারেল কোম্পানি নিবন্ধন।\n- **গ্লোবাল বিজনেস ব্যাংকিং**: আন্তর্জাতিক কারেন্সি লেনদেনের জন্য Mercury, Wise Business ও টিয়ার-১ গ্লোবাল ব্যাংক অ্যাকাউন্ট খোলা।\n\n${content ? `\n**সারসংক্ষেপ:**\n${content.slice(0, 300)}...` : ''}\n\nআন্তর্জাতিক রেজিস্ট্রেশন নিয়ে কোনো নির্দিষ্ট প্রশ্ন থাকলে জানাতে পারেন!`,
          source: 'RAG'
        };
      }
      return {
        reply: `Trek Consultancy's **International Business Services** (Pillar 6) streamline global business expansion:\n\n- **USA LLC & C-Corp Formation**: Incorporation across Delaware, Wyoming, and Florida including IRS Employer Identification Number (EIN) issuance.\n- **UK Limited Companies**: Companies House registration, London registered office, and VAT/HMRC compliance.\n- **Canadian Corporations**: Federal and provincial entity incorporation.\n- **Global Business Banking**: Multi-currency banking accounts with Mercury, Wise, Relay, and tier-1 institutions.\n\n${content ? `\n**From our Records:**\n${content.slice(0, 300)}...\n` : ''}\nFeel free to ask about Delaware vs Wyoming advantages or global bank requirements!`,
        source: 'RAG'
      };
    }

    // Intent 10: Secondary matches
    if (scoredTickets.length > 0 && scoredTickets[0].score >= 6) {
      const topTkt = scoredTickets[0].ticket;
      if (userLang === 'bn') {
        return {
          reply: `আমাদের সিনিয়র কনসালটেন্ট টিম কর্তৃক সমাধান:\n\n${topTkt.adminAnswer}`,
          source: 'STAFF'
        };
      }
      return {
        reply: `According to our Senior Advisory & Support resolution:\n\n${topTkt.adminAnswer}`,
        source: 'STAFF'
      };
    }

    if (scoredFaqs.length > 0 && scoredFaqs[0].score >= 6) {
      const f = scoredFaqs[0].faq;
      const ans = userLang === 'bn' && f.answer_bn ? f.answer_bn : f.answer;
      return {
        reply: ans,
        source: 'FAQ'
      };
    }

    if (scoredDocs.length > 0 && scoredDocs[0].score >= 6) {
      const d = scoredDocs[0].doc;
      if (userLang === 'bn') {
        return {
          reply: d.content_bn || d.content,
          source: 'RAG'
        };
      }
      return {
        reply: d.content,
        source: 'RAG'
      };
    }

    // Universal Helpful AI Fallback (NEVER Deflect to "Submit Ticket")
    if (userLang === 'bn') {
      return {
        reply: `আমি Trek Consultancy-র এআই সাপোর্ট অ্যাসিস্ট্যান্ট। আপনার প্রশ্নের উত্তর দিতে আমি আনন্দের সাথে প্রস্তুত!\n\nআমাদের প্ল্যাটফর্মের মাধ্যমে আপনি নিম্নলিখিত বিষয়গুলো সম্পর্কে যেকোনো তথ্য ও সমাধান পেতে পারেন:\n\n- **সৌদি কোম্পানি গঠন ও MISA লাইসেন্স**: বিদেশি উদ্যোক্তাদের জন্য ১০০% কোম্পানি মালিকানা ও লাইসেন্সিং প্রক্রিয়া\n- **সফটওয়্যার ও ডিজিটাল সলিউশন**: কাস্টম ইআরপি, ওয়েব/মোবাইল অ্যাপস এবং ক্লাউড আর্কিটেকচার\n- **ভিসা ও সরকারি PRO সেবা**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট ও ইকামা প্রসেসিং\n- **বাণিজ্যিক রিয়েল এস্টেট**: অফিস স্পেস, জমি ও ইন্ডাস্ট্রিয়াল লিজ পরামর্শ\n- **ট্যাক্স ও অডিট**: ZATCA ই-ইনভয়েসিং, ভ্যাট ফাইলিং এবং বার্ষিক হিসাবরক্ষণ\n- **ফোরাম কমিউনিটি**: প্রযুক্তিগত যেকোনো প্রশ্ন পোস্ট করা ও বিশেষজ্ঞদের পরামর্শ নেওয়া\n\nআপনার কি এই ক্ষেত্রগুলোর কোনোটিতে নির্দিষ্ট পরামর্শ বা সহায়তার প্রয়োজন? আপনার প্রশ্নটি একটু বিস্তারিত লিখুন, আমি এখনই প্রয়োজনীয় তথ্য উপস্থাপন করব!`,
        source: 'AI'
      };
    }

    return {
      reply: `I am your Trek Consultancy AI Support Assistant, and I am glad to assist you!\n\nI can provide direct guidance, regulatory steps, and technical explanations across all of our enterprise services:\n\n- **Saudi Business Setup & MISA**: 100% foreign ownership company formation, Commercial Registration (CR), and corporate banking\n- **Software & Digital Solutions**: Enterprise ERPs, custom web/mobile applications, and modern cloud architecture\n- **Visa & PRO Government Liaison**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem portals\n- **Commercial Real Estate**: Office spaces, warehouses, and foreign asset investment advisory\n- **Corporate Support & Tax**: ZATCA Phase 2 e-invoicing, statutory accounting, and financial audits\n- **Community Forum**: How to post questions, explore solutions, and collaborate with our engineering team\n\nCould you share a bit more detail on what you are looking to achieve? I will provide you with the exact steps and information!`,
      source: 'AI'
    };
  }

  // Support Chat Messages: Send & AI Response (RAG + Gemini / Knowledge Base)
  app.post('/api/support/messages', async (req, res) => {
    try {
      const { sessionId, message, language, userEmail, userId, userName } = req.body;
      let cleanSession = (sessionId || '').trim();
      const cleanMsg = (message || '').trim();
      const cleanEmail = (userEmail || '').trim().toLowerCase();
      let cleanUserId = (userId || '').trim() || null;
      let cleanUserName = (userName || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : null);

      // Smart Identity Resolution: Match with user account if registered
      if (cleanEmail) {
        try {
          const userMatch = await pool.query('SELECT id, name FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
          if (userMatch.rows.length > 0) {
            cleanUserId = userMatch.rows[0].id;
            if (!userName) cleanUserName = userMatch.rows[0].name;
          }
        } catch {
          // Non-blocking fallback
        }
      }

      // If user introduces their name in chat
      if (!cleanUserName || cleanUserName === 'Guest User') {
        const nameMatch = cleanMsg.match(/(?:my name is|i am|i'm|this is|call me|اسمي|أنا|আমি|আমার নাম)\s+([A-Z][a-zA-Z0-9_\s]{1,25}|[\u0600-\u06FF\s]{2,25}|[\u0980-\u09FF\s]{2,25})/i);
        if (nameMatch && nameMatch[1]) {
          const detected = nameMatch[1].trim().split(/\s+/).slice(0, 2).join(' ');
          if (detected && !['here', 'interested', 'looking', 'asking', 'wondering', 'ready', 'fine'].includes(detected.toLowerCase())) {
            cleanUserName = detected;
          }
        }
      }

      const isGuest = !cleanEmail && !cleanUserId;

      // Identity and Session Canonicalization:
      if (!isGuest) {
        // Registered user: find their primary conversation or use canonical user-bound id
        if (!cleanSession || cleanSession.startsWith('guest-') || cleanSession === 'default') {
          cleanSession = `user-${cleanUserId || cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }
        const existingConv = await pool.query(`
          SELECT id FROM conversations 
          WHERE (user_id IS NOT NULL AND user_id = $1) 
             OR (user_email IS NOT NULL AND LOWER(user_email) = $2) 
          ORDER BY updated_at DESC LIMIT 1
        `, [cleanUserId, cleanEmail]);
        if (existingConv.rows.length > 0) {
          cleanSession = existingConv.rows[0].id;
        }
      } else {
        // Guest user: ensure guest cannot write into or pollute a registered user session
        if (!cleanSession || cleanSession.startsWith('user-') || cleanSession === 'default') {
          cleanSession = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        } else {
          const ownerCheck = await pool.query(`
            SELECT user_email FROM conversations 
            WHERE (id = $1 OR session_id = $1) 
              AND (is_guest = FALSE OR user_email IS NOT NULL) 
            LIMIT 1
          `, [cleanSession]);
          if (ownerCheck.rows.length > 0) {
            cleanSession = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          }
        }
      }

      // Retrieve previously remembered user name for this session if not provided
      if (!cleanUserName) {
        try {
          const convMatch = await pool.query('SELECT user_name FROM conversations WHERE id = $1 OR session_id = $1 LIMIT 1', [cleanSession]);
          if (convMatch.rows.length > 0 && convMatch.rows[0]?.user_name) {
            cleanUserName = convMatch.rows[0].user_name;
          }
        } catch {}
      }

      const hasBengaliScript = /[\u0980-\u09FF]/.test(cleanMsg);
      const hasArabicScript = /[\u0600-\u06FF]/.test(cleanMsg);
      const BANGLISH_REGEX = /\b(ki|kivabe|ki\s*vabe|kivabhe|ki\s*ki|ki\s*hobe|ki\s*kora|lagbe|lagbo|lage|korte|korbo|korben|koren|korle|kore|kora|korche|korchen|chai|chan|chassi|ache|achhe|ase|asi|asen|nai|nay|nei|kothay|kothai|keno|kemon|amake|apnake|apnader|apnar|amader|amar|tader|tar|koto|shomoy|somoy|taka|khoroch|khroch|khulbo|khulte|shuru|suru|bolen|bolben|janan|janaben|sahajjo|sahayyo|sahata|bujhte|parbo|parben|pabo|paben|hobe|hoise|hoyeche|shob|sob|ektu|bepare|shomporke|somporke|thake|thakbe|deben|dite|apnara|amra|tara|dorkar|kichu|kisu|konta|konti|sathe|shathe)\b/i;
      const isBanglish = BANGLISH_REGEX.test(cleanMsg);
      const userLang: 'en' | 'bn' | 'ar' = (language === 'ar' || hasArabicScript)
        ? 'ar'
        : (language === 'bn' || hasBengaliScript || isBanglish)
        ? 'bn'
        : 'en';

      if (!cleanMsg) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      // Guest message preview limit check (allow up to 3 guest messages before requiring account, exempt admin sessions)
      if (isGuest && !cleanSession.startsWith('admin-')) {
        const countRes = await pool.query(
          `SELECT COUNT(*) FROM messages WHERE (conversation_id = $1 OR session_id = $1) AND (role = 'user' OR sender = 'user')`,
          [cleanSession]
        );
        const existingCount = parseInt(countRes.rows[0].count, 10);
        if (existingCount >= 3) {
          return res.status(403).json({
            error: 'Free conversation preview limit reached. Please sign in or create an account to continue.',
            requiresAuth: true
          });
        }
      }

      // Upsert conversation record in conversations table
      await pool.query(`
        INSERT INTO conversations (
          id, session_id, user_id, user_email, user_name, is_guest, title, status, message_count, last_message, last_sender, created_at, updated_at
        )
        VALUES ($1, $1, $2, $3, $4, $5, $6, 'active', 1, $7, 'user', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = COALESCE(EXCLUDED.user_id, conversations.user_id),
          user_email = COALESCE(EXCLUDED.user_email, conversations.user_email),
          user_name = COALESCE(EXCLUDED.user_name, conversations.user_name),
          is_guest = CASE 
            WHEN EXCLUDED.user_email IS NOT NULL OR conversations.user_email IS NOT NULL THEN FALSE 
            ELSE conversations.is_guest 
          END,
          message_count = conversations.message_count + 1,
          last_message = EXCLUDED.last_message,
          last_sender = 'user',
          updated_at = NOW()
      `, [
        cleanSession,
        cleanUserId,
        cleanEmail || null,
        cleanUserName,
        isGuest,
        cleanMsg.slice(0, 60),
        cleanMsg
      ]);

      // Mirror to support_conversations for backwards compatibility
      await pool.query(`
        INSERT INTO support_conversations (
          id, user_id, user_email, user_name, is_guest, title, status, message_count, last_message, last_sender, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'active', 1, $7, 'user', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = COALESCE(EXCLUDED.user_id, support_conversations.user_id),
          user_email = COALESCE(EXCLUDED.user_email, support_conversations.user_email),
          user_name = COALESCE(EXCLUDED.user_name, support_conversations.user_name),
          is_guest = CASE 
            WHEN EXCLUDED.user_email IS NOT NULL OR support_conversations.user_email IS NOT NULL THEN FALSE 
            ELSE support_conversations.is_guest 
          END,
          message_count = support_conversations.message_count + 1,
          last_message = EXCLUDED.last_message,
          last_sender = 'user',
          updated_at = NOW()
      `, [
        cleanSession,
        cleanUserId,
        cleanEmail || null,
        cleanUserName,
        isGuest,
        cleanMsg.slice(0, 60),
        cleanMsg
      ]);

      // 1. Fetch prior conversation history, RAG context, and Business Memory in parallel
      const userMsgId = `msg-${Date.now()}-u`;
      const historyPromise = !isGuest
        ? pool.query(`
            SELECT COALESCE(sender, role) as sender, COALESCE(message, content) as message, source
            FROM messages
            WHERE (user_id IS NOT NULL AND user_id = $1) 
               OR (user_email IS NOT NULL AND LOWER(user_email) = $2)
               OR (conversation_id = $3 OR session_id = $3)
            ORDER BY created_at DESC
            LIMIT 6
          `, [cleanUserId, cleanEmail, cleanSession])
        : pool.query(`
            SELECT COALESCE(sender, role) as sender, COALESCE(message, content) as message, source
            FROM messages
            WHERE (conversation_id = $1 OR session_id = $1)
              AND (is_guest = TRUE OR user_email IS NULL)
            ORDER BY created_at DESC
            LIMIT 6
          `, [cleanSession]);

      const [historyRes, { faqsData, docsData, topicsData, blogsData, settingsData, answeredTicketsData }, businessMemory] = await Promise.all([
        historyPromise,
        getRagData(),
        getOrCompileBusinessMemory(pool)
      ]);

      // Save user message immediately in messages table
      await pool.query(`
        INSERT INTO messages (id, conversation_id, session_id, role, sender, content, message, source, user_id, user_email, is_guest, created_at)
        VALUES ($1, $2, $2, 'user', 'user', $3, $3, 'USER', $4, $5, $6, NOW())
      `, [userMsgId, cleanSession, cleanMsg, cleanUserId, cleanEmail || null, isGuest]);

      // Mirror to support_messages table for backwards compatibility
      await pool.query(`
        INSERT INTO support_messages (id, session_id, user_id, user_email, is_guest, sender, message, source)
        VALUES ($1, $2, $3, $4, $5, 'user', $6, 'USER')
      `, [userMsgId, cleanSession, cleanUserId, cleanEmail || null, isGuest, cleanMsg]);

      // Chronological conversation history for multi-turn dialog memory
      const conversationHistory: { sender: string; message: string; source?: string }[] = (historyRes?.rows || []).reverse();

      // Sanitize documents to strictly prevent leaking internal audit reports or raw binary PDF chunks
      const sanitizedDocs = (docsData?.rows || []).filter((d: any) => {
        const t = (d.title || '').toLowerCase();
        const c = (d.content || '');
        if (t.includes('report') || t.includes('analysis') || t.includes('audit')) return false;
        if (c.startsWith('%PDF') || c.includes('/MediaBox') || c.includes('INTERNAL AUDIT') || c.includes('CONFIDENTIAL:')) return false;
        return true;
      });

      // Sanitize answered tickets to extract verified human expert resolutions without leaking personal emails/phone numbers
      const sanitizedTickets = (answeredTicketsData?.rows || []).map((t: any) => {
        let cleanQ = (t.question || '')
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[contact email]')
          .replace(/(?:\+|00)?(?:\d[\s\-\.\(\)]*){8,15}\d/g, '[contact phone]');
        cleanQ = cleanQ.replace(/⚡ AUTO-FLAGGED BY AI SUPPORT ASSISTANT[\s\S]*?Latest Client Message:\s*/i, '');
        cleanQ = cleanQ.replace(/Recent Conversation Transcript:[\s\S]*/i, '');

        return {
          id: t.id,
          ticketNumber: t.ticket_number,
          subject: (t.subject || '').replace(/^\[Auto-Flagged VIP Lead\]\s*/i, ''),
          question: cleanQ.trim().slice(0, 300),
          adminAnswer: (t.admin_answer || '').trim(),
          assignedTo: t.assigned_to || 'Senior Advisory Desk'
        };
      }).filter((t: any) => t.adminAnswer.length > 0);

      // Automatic Background Secret Escalation (Auto-Flagging for Admin Attention)
      const phoneMatch = cleanMsg.match(/(?:\+|00)?(?:\d[\s\-\.\(\)]*){8,15}\d/);
      const extractedPhone = phoneMatch ? phoneMatch[0].trim() : null;
      const emailMatch = cleanMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const extractedEmail = emailMatch ? emailMatch[0].trim() : null;
      const isContactProvided = Boolean(extractedPhone || (extractedEmail && !extractedEmail.includes('default-session') && !extractedEmail.includes('guest@') && !extractedEmail.includes('client.trekconsultancy')));

      const isContactLead = /(whatsapp|call you|call me|phone number|contact number|talk to (a )?human|talk to (a )?consultant|talk to someone|speak to (a )?human|speak to (a )?consultant|speak to advisor|meet in person|contact details|office address|location|হোয়াটসঅ্যাপ|ফোন নম্বর|যোগাযোগ|কথা বলতে চাই|হোয়াটসঅ্যাপে|অফিস কোথায়|ঠিকানা|কল করবেন|কল দিতে চাই|কথা বলব|দেখা করতে চাই|নাম্বার)/i.test(cleanMsg);
      const isBespokeLead = /(custom quote|custom quotation|formal proposal|bespoke contract|sign nda|confidentiality agreement|enterprise contract|hire you|enterprise proposal|কাস্টম কোটেশন|ফরমাল প্রপোজাল|চুক্তি স্বাক্ষর)/i.test(cleanMsg);
      const isEscalationLead = /(speak to manager|call manager|supervisor|not helping|wrong answer|bad service|file complaint|ম্যানেজার|অভিযোগ|ভুল উত্তর)/i.test(cleanMsg);

      const shouldAutoFlag = isContactProvided || isContactLead || isBespokeLead || isEscalationLead;

      if (shouldAutoFlag) {
        try {
          const existingTktRes = await pool.query(
            `SELECT id, ticket_number, question, user_email FROM support_tickets WHERE session_id = $1 AND status IN ('OPEN', 'IN_PROGRESS') LIMIT 1`,
            [cleanSession]
          );

          const clientEmail = extractedEmail || userEmail || (existingTktRes.rows[0]?.user_email) || (extractedPhone ? `lead-${extractedPhone.replace(/\D/g, '')}@client.trekconsultancy.com` : `guest-${cleanSession.slice(0, 8)}@client.trekconsultancy.com`);

          if (existingTktRes.rows.length === 0) {
            const ticketNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
            const autoTktId = `tkt-auto-${Date.now()}`;
            const subj = `[Auto-Flagged VIP Lead] ${cleanMsg.slice(0, 48)}...`;

            let contextLog = `⚡ AUTO-FLAGGED BY AI SUPPORT ASSISTANT (SECRET BACKGROUND ESCALATION)\n\n`;
            contextLog += `Trigger Reason: ${isContactProvided ? 'Client Provided Direct Contact Info' : isContactLead ? 'Direct Consultation / WhatsApp Request' : isBespokeLead ? 'Bespoke Enterprise / Contract Inquiry' : 'Client Escalation'}\n`;
            if (extractedPhone) contextLog += `Captured Phone/WhatsApp: ${extractedPhone}\n`;
            if (extractedEmail) contextLog += `Captured Email: ${extractedEmail}\n`;
            contextLog += `Visitor Session: ${cleanSession}\n\n`;
            contextLog += `Latest Client Message:\n"${cleanMsg}"\n\n`;
            if (conversationHistory.length > 0) {
              contextLog += `Recent Conversation Transcript:\n` + conversationHistory.map(m => `[${m.sender.toUpperCase()}]: ${m.message}`).join('\n');
            }

            await pool.query(`
              INSERT INTO support_tickets (id, ticket_number, user_email, user_whatsapp, session_id, conversation_id, subject, question, priority, status, assigned_to)
              VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 'Urgent', 'OPEN', 'Senior Advisory Desk')
            `, [autoTktId, ticketNum, clientEmail, extractedPhone || null, cleanSession, subj, contextLog]);

            await pool.query(`
              INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
              VALUES ($1, 'Auto-Flagged VIP Client Lead', 'AI Assistant', $2, 'Just now', 'support')
            `, [`act-${Date.now()}`, `#${ticketNum}`]);
          } else {
            const currTkt = existingTktRes.rows[0];
            let appendText = `\n\n--- [Follow-up Update: ${new Date().toLocaleTimeString()}] ---\nClient Message: "${cleanMsg}"`;
            if (extractedPhone) appendText += `\n[Captured Phone/WhatsApp: ${extractedPhone}]`;
            if (extractedEmail) appendText += `\n[Captured Email: ${extractedEmail}]`;

            await pool.query(`
              UPDATE support_tickets 
              SET question = question || $1,
                  user_email = COALESCE($2, user_email),
                  priority = 'Urgent'
              WHERE id = $3
            `, [appendText, extractedEmail || (extractedPhone ? `lead-${extractedPhone.replace(/\D/g, '')}@client.trekconsultancy.com` : null), currTkt.id]);
          }
        } catch (flagErr) {
          console.warn('[Auto-Flag] Background escalation log failed:', flagErr);
        }
      }

      const platformSettings = settingsData.rows[0]?.value || {};
      const supportEmail = platformSettings.primarySupportEmail || 'support@trekconsultancy.com';
      const forumName = platformSettings.forumName || 'Trek Consultancy Forum';
      const slaHours = platformSettings.slaHours || 2;

      let ragContext = `============================================================\n`;
      ragContext += `PROJECT KNOWLEDGE BASE, RAG CHUNKS & LIVE DATABASE CONTEXT:\n`;
      ragContext += `============================================================\n\n`;
      
      ragContext += `PLATFORM IDENTITY & SETTINGS:\n`;
      ragContext += `- Brand: ${forumName}\n`;
      ragContext += `- Support Email: ${supportEmail}\n`;
      ragContext += `- Official Ticket SLA: ${slaHours} Hours\n`;
      ragContext += `- Description: Official community discussion forum and enterprise services portal for Trek Consultancy, connecting developers and clients, powered by Neon Serverless PostgreSQL persistence, role-based topic management, and enterprise full-stack development consultancy.\n\n`;

      ragContext += `CHUNK KNOWLEDGE DOCUMENTS (RAG CHUNKS FROM ADMIN & AI EXTRACTION):\n`;
      if (sanitizedDocs.length === 0) {
        ragContext += `(No custom documents uploaded yet)\n`;
      } else {
        sanitizedDocs.forEach((d: any, idx: number) => {
          ragContext += `--- [Chunk #${idx + 1}: ${d.title} | Category: ${d.category || 'General'}] ---\n${d.content}\n\n`;
        });
      }

      ragContext += `FREQUENTLY ASKED QUESTIONS (FAQS & ANSWERS):\n`;
      faqsData.rows.forEach((f: any) => {
        ragContext += `[Category: ${f.category}]\n- Question (EN): ${f.question}\n  Answer (EN): ${f.answer}\n`;
        if (f.question_bn || f.answer_bn) {
          ragContext += `  Question (BN): ${f.question_bn || ''}\n  Answer (BN): ${f.answer_bn || ''}\n`;
        }
      });

      ragContext += `\nRECENT FORUM DISCUSSIONS (DATABASE TOPICS):\n`;
      topicsData.rows.forEach((t: any) => {
        ragContext += `- Discussion: "${t.title}" (Category: ${t.category}, Author: ${t.author}, Views: ${t.views}, Replies: ${t.replies})\n`;
      });

      ragContext += `\nKNOWLEDGE BASE BLOGS & GUIDES:\n`;
      blogsData.rows.forEach((b: any) => {
        ragContext += `- Guide: "${b.title}" (Category: ${b.category}): ${b.excerpt || ''}\n`;
      });

      ragContext += `\nVERIFIED HUMAN SUPPORT TICKETS & SENIOR CONSULTANT RESOLUTIONS:\n`;
      if (sanitizedTickets.length === 0) {
        ragContext += `(No previous resolved support tickets yet)\n`;
      } else {
        sanitizedTickets.forEach((t: any) => {
          ragContext += `[Resolution #${t.ticketNumber} | Topic: "${t.subject}"]\n- Inquiry: ${t.question}\n- Verified Resolution: ${t.adminAnswer}\n  (Resolved by: ${t.assignedTo})\n\n`;
        });
      }
      ragContext += `============================================================\n`;

      let botReply = '';
      let replySource = 'AI';

      // 3. Try generating with configured AI engine (Gemini or OpenAI)
      const aiRuntime = await getEffectiveAiRuntime();
      if (aiRuntime.isKeyConfigured && aiRuntime.status !== 'disabled') {
        const candidateModels = aiRuntime.candidateModels;
        const memoryPromptBlock = formatBusinessMemoryForPrompt(businessMemory);
        const clientDisplayName = cleanUserName && cleanUserName !== 'Guest User' ? cleanUserName : '';
        const systemInstruction = `You are Trek Support Assistant, the premier AI Executive Consultant and support assistant for Trek Consultancy Forum.

CLIENT IDENTITY & CONTEXT:
- Client Name: ${clientDisplayName || 'Esteemed Client / Guest'}
- Client Status: ${isGuest ? 'Guest Investor' : 'Registered Corporate Member'}
- Support Email: ${supportEmail}
- Forum: ${forumName}
- SLA: ${slaHours} Hours

${memoryPromptBlock}

============================================================
ADDITIONAL LIVE DATABASE CONTEXT & RECENT PLATFORM POSTS:
============================================================

Guidelines:
- MANDATORY GREETING IN EVERY SINGLE RESPONSE (STRICT REQUIREMENT):
  * You MUST start EVERY response with a polite, warm, personalized executive greeting on the very first line before anything else. Never omit this greeting, even on follow-up questions, subsequent conversation turns, or quick inquiries!
  * If the client's name is known (${clientDisplayName ? `"${clientDisplayName}"` : 'or provided by user'}), address them directly by name:
    - English: "Hello ${clientDisplayName || 'there'}! Welcome to Trek Consultancy Support." or "Greetings, ${clientDisplayName || 'esteemed client'}!"
    - Arabic: "مرحباً بك يا ${clientDisplayName || 'ضيفنا الكريم'}! يسعدنا تواصلك مع تريك للاستشارات." or "أهلاً وسهلاً بك يا ${clientDisplayName || 'أخي الكريم'}!"
    - Bengali: "আসসালামু আলাইকুম ${clientDisplayName || 'সম্মানিত ক্লায়েন্ট'}! ট্রেক কনসালটেন্সিতে আপনাকে স্বাগতম।" or "স্বাগতম ${clientDisplayName || 'সম্মানিত অতিথি'}!"
  * If the client's name is not yet specified, greet them warmly as an esteemed client: "Greetings! Welcome to Trek Consultancy Support." / "أهلاً وسهلاً ومرحباً بكم في تريك للاستشارات!" / "আসসালামু আলাইকুম! ট্রেক কনসালটেন্সিতে আপনাকে স্বাগতম।".
  * The greeting must ALWAYS be on the very first line before any headers, analysis, or body text.
- Ground your answers in the verified Business Memory, Pillars, FAQs, and institutional documentation provided above.
- COMPANY ORIGINS & FOUNDING: When asked about when the business started, founded era, or background, reference the verified founding era and story from Business Memory (Vision 2030 corporate advisory).
- RESPONSIBILITY & LEADERSHIP: When asked who is responsible for setup, licensing, or services, reference the Senior Advisory & Legal Desk in Riyadh and the accredited team structure.
- HUMAN EXPERT & ADMIN RESOLUTIONS: Whenever a user's question relates to a topic or inquiry addressed in "VERIFIED HUMAN SUPPORT TICKETS & SENIOR CONSULTANT RESOLUTIONS", treat the senior consultant's verified resolution as highest-priority ground truth and synthesize it directly and accurately into your response.
- STRICT CONFIDENTIALITY & DATA PROTECTION: NEVER leak internal audit reports, backend system secrets, database credentials, server connection URLs, developer notes, or private employee telephone numbers. Treat all institutional information with executive discretion.
- EXECUTIVE CONCIERGE & BRAND INTEGRITY: Deliver responses with high institutional elegance, confidence, and warmth. Never make the user feel brushed off, deflected, or frustrated. Never tell users to go open or submit a ticket.
- AUTOMATIC SECRET ESCALATION: When a user asks for direct consultation, WhatsApp, phone calls, or custom enterprise contracting, reassure them that their inquiry has been prioritized with our Senior Advisory & Legal Desk in Riyadh. Invite them to share their WhatsApp or phone number right here in the conversation for a direct consultation. When they provide a phone number or email, warmly thank them and confirm that our senior consultant is notified.
- Maintain full conversation context across turns. If the user refers to previous questions (e.g. "next step", "what about costs", "how to do that"), answer contextually based on the ongoing conversation.
- If the user wrote in Arabic, reply in polished, executive Arabic. If the user wrote in Bengali script OR in Banglish (phonetic Bengali written using English alphabet like "kivabe post korbo", "ki ki lagbe"), you MUST reply completely in natural, polished, professional Bengali. If in English, reply in professional, warm English.
- NEVER repeat the user's question back to them as a title, quote, or heading.
- NEVER start with robotic boilerplate phrases like "Based on our verified knowledge base...". Jump directly into the answer.
- STRICT OUTPUT DIRECTIVE:
  * Output ONLY the final customer-facing decorated answer.
  * NEVER output thinking scratchpads, numbered planning steps (such as "1. Analyze User Input" or "2. Identify Relevant Knowledge"), or internal developer notes.
- SIGNATURE EXECUTIVE DECORATION PATTERN:
  * Greeting & Concierge Opening: Open warmly and contextually (e.g. "Welcome, Walid." or "Greetings!").
  * Decorated Section Headers: Use '### 🏛️ Main Topic — Strategic Pillar/Scope' for visual hierarchy.
  * Decorated Lists & Cards: Use standard markdown list hyphens with decorated bullet pips:
    - 🔹 **Key Framework**: Direct, precise explanation with numbers, fees, and timelines.
    - 🔹 **Regulatory Milestone**: Clear, step-by-step compliance criteria.
    - 🔹 **Operational Deliverable**: Exact action taken by Trek's dedicated desk.
  * Executive Strategic Callout: Include an executive takeaway callout when detailing multi-step processes:
    > 💡 **Executive Strategic Takeaway:** Key milestone or advantage for the client.
  * Official Closing Signature: ALWAYS conclude with our official executive advisory signature:
    > 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  
    > *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`;

        // Multi-turn messages array with history
        const multiTurnMessages: { role: 'user' | 'assistant'; content: string }[] = [];
        for (const item of conversationHistory) {
          const role = item.sender === 'user' ? 'user' : 'assistant';
          const text = (item.message || '').trim();
          if (!text) continue;

          if (multiTurnMessages.length > 0 && multiTurnMessages[multiTurnMessages.length - 1].role === role) {
            multiTurnMessages[multiTurnMessages.length - 1].content += `\n\n${text}`;
          } else {
            multiTurnMessages.push({ role, content: text });
          }
        }

        // Current user message
        if (multiTurnMessages.length > 0 && multiTurnMessages[multiTurnMessages.length - 1].role === 'user') {
          multiTurnMessages[multiTurnMessages.length - 1].content += `\n\n${cleanMsg}`;
        } else {
          multiTurnMessages.push({
            role: 'user',
            content: cleanMsg
          });
        }

        while (multiTurnMessages.length > 0 && multiTurnMessages[0].role !== 'user') {
          multiTurnMessages.shift();
        }

        const effectiveSystemPrompt = aiRuntime.customSystemInstruction
          ? `${systemInstruction}\n\nSPECIAL ADMINISTRATIVE DIRECTIVE:\n${aiRuntime.customSystemInstruction}`
          : systemInstruction;

        for (const modelName of candidateModels) {
          try {
            const aiResult = await executeAiCompletion({
              provider: aiRuntime.provider,
              apiKey: aiRuntime.apiKey,
              baseUrl: aiRuntime.baseUrl,
              model: modelName,
              systemInstruction: effectiveSystemPrompt,
              messages: multiTurnMessages,
              temperature: aiRuntime.temperature,
              maxTokens: Math.min(aiRuntime.maxOutputTokens, 2048),
              timeoutMs: 16000
            });

            if (aiResult.text && !/^(?:1\.\s+)?\*\*(?:Analyze User Input|Analyze Input)/i.test(aiResult.text)) {
              botReply = aiResult.text.trim();
              replySource = 'AI';
              break;
            }
          } catch (aiErr: any) {
            const errMsg = String(aiErr?.message || '');
            console.warn(`[AI Engine] Provider "${aiRuntime.provider}" model "${modelName}" failed:`, errMsg);
            const isAuthOrQuotaError = errMsg.includes('401') || errMsg.includes('UNAUTHENTICATED') || 
                                       errMsg.includes('API_KEY_INVALID') || errMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
                                       errMsg.includes('API_KEY_SERVICE_BLOCKED');
            if (isAuthOrQuotaError) {
              break;
            }
            continue;
          }
        }
      }

      // 4. Intelligent Business Memory synthesis engine (Sub-15ms, zero hallucination, strict domain matching)
      if (!botReply) {
        const synth = synthesizeBusinessMemoryAnswer({
          cleanMsg,
          userLang,
          memory: businessMemory,
          conversationHistory
        });
        botReply = synth.reply;
        replySource = synth.source;
      }

      // Guarantee warm executive greeting in every message if omitted by LLM or fallback
      const hasGreeting = /^(?:Hello|Greetings|Welcome|Good (?:morning|afternoon|evening|day)|Dear|Hi|مرحباً|أهلاً|السلام عليكم|تحية طيبة|أسعد الله|আসসালামু আলাইকুম|নমস্কার|হ্যালো|স্বাগতম)/i.test(botReply.trim());
      if (botReply && !hasGreeting) {
        let greetingText = '';
        const nameGreeting = cleanUserName && cleanUserName !== 'Guest User' ? cleanUserName : '';
        if (userLang === 'ar') {
          greetingText = nameGreeting 
            ? `مرحباً بك يا ${nameGreeting}! يسعدنا تواصلك مع تريك للاستشارات.` 
            : `أهلاً وسهلاً ومرحباً بكم في تريك للاستشارات!`;
        } else if (userLang === 'bn') {
          greetingText = nameGreeting 
            ? `আসসালামু আলাইকুম ${nameGreeting}! ট্রেক কনসালটেন্সিতে আপনাকে স্বাগতম।` 
            : `আসসালামু আলাইকুম! ট্রেক কনসালটেন্সিতে আপনাকে স্বাগতম।`;
        } else {
          greetingText = nameGreeting 
            ? `Hello ${nameGreeting}! Welcome to Trek Consultancy Support.` 
            : `Greetings! Welcome to Trek Consultancy Support.`;
        }
        botReply = `${greetingText}\n\n${botReply}`;
      }

      // Guarantee signature executive decoration pattern if omitted by LLM
      const hasClosingSignature = /(?:> |^|\n)\s*🏛️\s*\*\*(?:Senior Advisory & Legal Desk|সিনিয়র অ্যাডভাইজরি|مكتب الاستشارات)/m.test(botReply);
      if (botReply && !hasClosingSignature) {
        if (userLang === 'ar') {
          botReply += `\n\n> 🏛️ **مكتب الاستشارات العليا والشؤون القانونية (الرياض)**  \n> *تريك للاستشارات | حلول تأسيس الشركات ودخول السوق السعودي 2030*`;
        } else if (userLang === 'bn') {
          botReply += `\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও বিজনেস সলিউশন*`;
        } else {
          botReply += `\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`;
        }
      }

      // 4. Save bot response to messages and support_messages tables
      const botMsgId = `msg-${Date.now()}-b`;
      await pool.query(`
        INSERT INTO messages (id, conversation_id, session_id, role, sender, content, message, source, user_id, user_email, is_guest, created_at)
        VALUES ($1, $2, $2, 'assistant', 'bot', $3, $3, $4, $5, $6, $7, NOW())
      `, [botMsgId, cleanSession, botReply, replySource, cleanUserId, cleanEmail || null, isGuest]);

      await pool.query(`
        INSERT INTO support_messages (id, session_id, user_id, user_email, is_guest, sender, message, source)
        VALUES ($1, $2, $3, $4, $5, 'bot', $6, $7)
      `, [botMsgId, cleanSession, cleanUserId, cleanEmail || null, isGuest, botReply, replySource]);

      await pool.query(`
        UPDATE conversations
        SET message_count = message_count + 1,
            last_message = $1,
            last_sender = 'bot',
            updated_at = NOW()
        WHERE id = $2 OR session_id = $2
      `, [botReply, cleanSession]);

      await pool.query(`
        UPDATE support_conversations
        SET message_count = message_count + 1,
            last_message = $1,
            last_sender = 'bot',
            updated_at = NOW()
        WHERE id = $2
      `, [botReply, cleanSession]);

      res.status(201).json({
        userMessage: { id: userMsgId, sender: 'user', message: cleanMsg, source: 'USER', time: 'Just now' },
        botReply: { id: botMsgId, sender: 'bot', message: botReply, source: replySource, time: 'Just now' },
        conversation: {
          sessionId: cleanSession,
          isGuest,
          userId: cleanUserId || undefined,
          userEmail: cleanEmail || undefined
        }
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
      if (adminAnswer && (current.session_id || current.conversation_id)) {
        const targetSession = current.conversation_id || current.session_id;
        const msgId = `msg-${Date.now()}-admin`;
        const staffMsg = `[Admin Staff Reply to #${current.ticket_number}]: ${adminAnswer}`;

        await pool.query(`
          INSERT INTO messages (id, conversation_id, session_id, role, sender, content, message, source, user_id, user_email, is_guest, created_at)
          VALUES ($1, $2, $2, 'assistant', 'bot', $3, $3, 'STAFF', $4, $5, $6, NOW())
        `, [msgId, targetSession, staffMsg, current.user_id || null, current.user_email || null, !current.user_email]);

        await pool.query(`
          INSERT INTO support_messages (id, session_id, user_id, user_email, is_guest, sender, message, source)
          VALUES ($1, $2, $3, $4, $5, 'bot', $6, 'STAFF')
        `, [msgId, targetSession, current.user_id || null, current.user_email || null, !current.user_email, staffMsg]);

        await pool.query(`
          UPDATE conversations
          SET message_count = message_count + 1,
              last_message = $1,
              last_sender = 'staff',
              updated_at = NOW()
          WHERE id = $2 OR session_id = $2
        `, [staffMsg, targetSession]);

        await pool.query(`
          UPDATE support_conversations
          SET message_count = message_count + 1,
              last_message = $1,
              last_sender = 'staff',
              updated_at = NOW()
          WHERE id = $2
        `, [staffMsg, targetSession]);
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

      invalidateRagCache();
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
      invalidateRagCache();
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

      invalidateRagCache();
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

      invalidateRagCache();
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
      invalidateRagCache();
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
          c.id as "sessionId",
          c.session_id as "sessionIdAlt",
          c.user_id as "userId",
          c.user_email as "userEmail",
          c.user_whatsapp as "userWhatsapp",
          c.user_name as "userName",
          c.is_guest as "isGuest",
          c.status,
          c.message_count as "messageCount",
          c.last_message as "lastMessage",
          c.last_sender as "lastSender",
          c.updated_at as "lastActive",
          c.created_at as "createdAt"
        FROM conversations c
        ORDER BY c.updated_at DESC
        LIMIT 100
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

      // Check existing conversation to preserve user association
      const convRes = await pool.query('SELECT user_id, user_email, is_guest FROM conversations WHERE id = $1 OR session_id = $1', [sessionId]);
      const conv = convRes.rows[0] || {};

      const msgId = `msg-${Date.now()}-staff`;
      const staffSender = staffName || 'Support Specialist';
      const staffMsg = `[${staffSender}]: ${message.trim()}`;

      const insertRes = await pool.query(`
        INSERT INTO messages (id, conversation_id, session_id, role, sender, content, message, source, user_id, user_email, is_guest, created_at)
        VALUES ($1, $2, $2, 'assistant', 'bot', $3, $3, 'STAFF', $4, $5, $6, NOW())
        RETURNING id, sender, message, content, role, source, created_at as "createdAt"
      `, [msgId, sessionId, staffMsg, conv.user_id || null, conv.user_email || null, conv.is_guest !== false]);

      await pool.query(`
        INSERT INTO support_messages (id, session_id, user_id, user_email, is_guest, sender, message, source)
        VALUES ($1, $2, $3, $4, $5, 'bot', $6, 'STAFF')
      `, [msgId, sessionId, conv.user_id || null, conv.user_email || null, conv.is_guest !== false, staffMsg]);

      await pool.query(`
        UPDATE conversations
        SET message_count = message_count + 1,
            last_message = $1,
            last_sender = 'staff',
            updated_at = NOW()
        WHERE id = $2 OR session_id = $2
      `, [staffMsg, sessionId]);

      await pool.query(`
        UPDATE support_conversations
        SET message_count = message_count + 1,
            last_message = $1,
            last_sender = 'staff',
            updated_at = NOW()
        WHERE id = $2
      `, [staffMsg, sessionId]);

      invalidateRagCache();
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

      // Maintain knowledge_chunks table
      await pool.query(`
        INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, created_at)
        VALUES ($1, $2, $3, 0, NOW())
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
      `, [`chk-${id}-0`, id, content.trim()]);

      invalidateRagCache();
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

      // Update corresponding knowledge_chunk if content was supplied
      if (content) {
        await pool.query(`
          INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, created_at)
          VALUES ($1, $2, $3, 0, NOW())
          ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
        `, [`chk-${id}-0`, id, content.trim()]);
      }

      invalidateRagCache();
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
      invalidateRagCache();
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
      invalidateRagCache();
      res.json({ success: true, deletedCount: ids.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // Ephemeral In-Memory Document Parsers for Zero-Disk AI Analysis
  // ---------------------------------------------------------------------------
  function decodePdfString(str: string): string {
    return str
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
  }

  function decodePdfHexString(hex: string): string {
    const clean = hex.replace(/\s+/g, '');
    if (clean.length % 2 !== 0) return '';
    const buf = Buffer.from(clean, 'hex');
    if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
      let s = '';
      for (let i = 2; i < buf.length - 1; i += 2) {
        s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
      }
      return s;
    }
    if (buf.length >= 4 && buf[0] === 0 && buf[2] === 0) {
      let s = '';
      for (let i = 0; i < buf.length; i += 2) {
        s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
      }
      return s;
    }
    return buf.toString('latin1');
  }

  function formatDetectedTables(text: string): string {
    if (!text) return '';
    const lines = text.split('\n');
    const result: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length >= 2) {
        const colCount = Math.max(...tableRows.map(r => r.length));
        if (colCount >= 2) {
          const paddedRows = tableRows.map(r => {
            const row = [...r];
            while (row.length < colCount) row.push('-');
            return row;
          });
          const header = '| ' + paddedRows[0].join(' | ') + ' |';
          const divider = '| ' + Array(colCount).fill('---').join(' | ') + ' |';
          result.push(header, divider);
          for (let i = 1; i < paddedRows.length; i++) {
            result.push('| ' + paddedRows[i].join(' | ') + ' |');
          }
          tableRows = [];
          return;
        }
      }
      for (const row of tableRows) {
        result.push(row.join('   '));
      }
      tableRows = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed.includes('\t') || /[^\s]{2,}\s{3,}[^\s]{2,}/.test(trimmed))) {
        const cols = trimmed.split(/\t+|\s{3,}/).map(c => c.trim()).filter(Boolean);
        if (cols.length >= 2) {
          tableRows.push(cols);
          continue;
        }
      }
      flushTable();
      result.push(line);
    }
    flushTable();

    return result.join('\n');
  }

  function extractTextFromPdfStreamFallback(buffer: Buffer): string {
    const textPieces: string[] = [];
    const raw = buffer.toString('latin1');

    // Scan for all stream ... endstream blocks in PDF
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const streamStart = match.index + match[0].indexOf('\n') + 1;
      const streamEnd = match.index + match[0].lastIndexOf('endstream');
      const streamBuf = buffer.subarray(streamStart, streamEnd);

      let decompressed = '';
      try {
        decompressed = zlib.inflateSync(streamBuf).toString('latin1');
      } catch {
        try {
          decompressed = zlib.inflateRawSync(streamBuf).toString('latin1');
        } catch {
          decompressed = streamBuf.toString('latin1');
        }
      }

      if (decompressed && (decompressed.includes('BT') || decompressed.includes('Tj') || decompressed.includes('TJ'))) {
        const lines = decompressed.split(/\r?\n/);
        let currentLineText = '';

        for (const line of lines) {
          if (line.includes('T*') || line.match(/T[dDmM]/)) {
            if (currentLineText.trim()) {
              textPieces.push(currentLineText.trim());
              currentLineText = '';
            }
          }

          // Array TJ
          const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/gi;
          let tjMatch;
          while ((tjMatch = tjArrayRegex.exec(line)) !== null) {
            const inner = tjMatch[1];
            const tokenRegex = /\(([^)]*)\)|<([0-9a-fA-F]+)>/g;
            let token;
            while ((token = tokenRegex.exec(inner)) !== null) {
              if (token[1] !== undefined) {
                currentLineText += decodePdfString(token[1]);
              } else if (token[2] !== undefined) {
                currentLineText += decodePdfHexString(token[2]);
              }
            }
          }

          // Single Tj
          const tjSingleRegex = /\(([^)]*)\)\s*(?:Tj|'|")/gi;
          let singleMatch;
          while ((singleMatch = tjSingleRegex.exec(line)) !== null) {
            currentLineText += ' ' + decodePdfString(singleMatch[1]);
          }

          // Hex Tj
          const tjHexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/gi;
          let hexMatch;
          while ((hexMatch = tjHexRegex.exec(line)) !== null) {
            currentLineText += ' ' + decodePdfHexString(hexMatch[1]);
          }

          if (line.includes('ET')) {
            if (currentLineText.trim()) {
              textPieces.push(currentLineText.trim());
              currentLineText = '';
            }
          }
        }

        if (currentLineText.trim()) {
          textPieces.push(currentLineText.trim());
        }
      }
    }

    // Fallback: search for uncompressed literal text runs
    if (textPieces.length === 0) {
      const literalMatches = raw.match(/\(([^)]{4,})\)\s*Tj/g);
      if (literalMatches) {
        for (const lm of literalMatches) {
          const str = lm.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
          textPieces.push(decodePdfString(str));
        }
      }
    }

    return textPieces
      .filter(p => p.length > 1)
      .join('\n\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
      .replace(/[^\x20-\x7E\t\r\n\u00A0-\uFFFF]/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    // 1. Primary Engine: unpdf (powered by Mozilla's pdf.js)
    // Resolves /ToUnicode CMaps (fixes Caesar-shifted/font subset glyphs, Bangla/Arabic Unicode mappings),
    // and preserves tabular layouts!
    try {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      const rawText = Array.isArray(text) ? text.join('\n\n') : String(text || '');
      const cleaned = sanitizeCleanText(rawText);
      if (cleaned && isReadableCleanText(cleaned)) {
        return formatDetectedTables(cleaned);
      }
    } catch (unpdfErr) {
      console.warn('[PDF unpdf Engine] Fallback notice:', unpdfErr);
    }

    // 2. Fallback stream parser
    const fallbackText = extractTextFromPdfStreamFallback(buffer);
    return formatDetectedTables(fallbackText);
  }

  function extractTextFromDocx(buffer: Buffer): string {
    try {
      let offset = 0;
      while (offset < buffer.length - 30) {
        if (
          buffer[offset] === 0x50 &&
          buffer[offset + 1] === 0x4b &&
          buffer[offset + 2] === 0x03 &&
          buffer[offset + 3] === 0x04
        ) {
          const compressionMethod = buffer.readUInt16LE(offset + 8);
          const compressedSize = buffer.readUInt32LE(offset + 18);
          const fileNameLength = buffer.readUInt16LE(offset + 26);
          const extraFieldLength = buffer.readUInt16LE(offset + 28);

          const fileNameStart = offset + 30;
          const fileNameEnd = fileNameStart + fileNameLength;
          if (fileNameEnd <= buffer.length) {
            const fileName = buffer.toString('utf8', fileNameStart, fileNameEnd);
            const dataStart = fileNameEnd + extraFieldLength;
            const dataEnd = dataStart + compressedSize;

            if (fileName === 'word/document.xml' || fileName.endsWith('/document.xml')) {
              if (dataEnd <= buffer.length) {
                const compressedData = buffer.subarray(dataStart, dataEnd);
                let xmlContent = '';
                if (compressionMethod === 8) {
                  xmlContent = zlib.inflateRawSync(compressedData).toString('utf8');
                } else if (compressionMethod === 0) {
                  xmlContent = compressedData.toString('utf8');
                }

                if (xmlContent) {
                  return xmlContent
                    .replace(/<\/w:p>/gi, '\n\n')
                    .replace(/<w:br[^>]*>/gi, '\n')
                    .replace(/<w:tab[^>]*>/gi, '\t')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
                }
              }
            }
          }
          offset += 30 + fileNameLength + extraFieldLength + compressedSize;
        } else {
          offset++;
        }
      }
    } catch (err) {
      console.warn('[Docx Extraction] In-memory ZIP parse warning:', err);
    }

    try {
      const raw = buffer.toString('utf8');
      const matches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ').trim();
      }
    } catch {}

    return '';
  }

  function extractTextFromDoc(buffer: Buffer): string {
    try {
      const latin = buffer.toString('latin1');
      const clean = latin.replace(/[^\x20-\x7E\t\r\n]/g, ' ');
      const paragraphs = clean
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 25);
      if (paragraphs.length > 0) {
        return paragraphs.join('\n\n');
      }
    } catch {}
    return '';
  }

  async function extractTextFromImage(buffer: Buffer): Promise<string> {
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(buffer);
      await worker.terminate();
      return ret?.data?.text ? sanitizeCleanText(ret.data.text) : '';
    } catch (ocrErr) {
      console.warn('[Image OCR] In-memory recognition notice:', ocrErr);
      return '';
    }
  }

  function sanitizeCleanText(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
      .replace(/(\d+\s+\d+\s+obj\b[\s\S]*?\bendobj\b)/gi, ' ')
      .replace(/\b(xref|trailer|startxref)\b[\s\S]*/gi, ' ')
      .replace(/\/Type\s*\/[A-Za-z0-9]+/g, ' ')
      .replace(/<<[\s\S]*?>>/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function isReadableCleanText(text: string): boolean {
    if (!text || text.trim().length < 15) return false;
    const trimmed = text.trim();
    if (/^%PDF/i.test(trimmed) || /^\d+\s+\d+\s+obj\b/i.test(trimmed) || /<<\s*\/Type/i.test(trimmed)) return false;
    const readableChars = (text.match(/[a-zA-Z0-9\u0600-\u06FF\u0980-\u09FF\s.,:;!?\-()[\]{}"'%@#/]/g) || []).length;
    return (readableChars / text.length) >= 0.70;
  }

  // Support Admin: AI File & Elements Analysis & Knowledge Chunk Extraction
  // Note: Pure in-memory ephemeral extraction. Files, screenshots, or elements are NEVER saved to disk or database.
  app.post('/api/admin/support/knowledge-docs/extract-from-file', async (req, res) => {
    try {
      const { fileData, fileName, mimeType, elementText, categoryHint, autoSave, apiKey } = req.body;

      if (!fileData && !elementText) {
        return res.status(400).json({ error: 'Either file data or element text is required for analysis.' });
      }

      const cleanFileName = (fileName || (elementText ? 'Pasted Elements / Direct Input' : 'Uploaded Document')).trim();
      const cleanMime = (mimeType || 'text/plain').toLowerCase();
      const cleanCategory = (categoryHint || 'General').trim();
      const aiRuntime = await getEffectiveAiRuntime();
      const effectiveApiKey = (apiKey || aiRuntime.apiKey || '').trim();

      let extractedChunks: {
        title: string;
        category: string;
        summary?: string;
        tags?: string[];
        content: string;
      }[] = [];

      let directTextContent = '';
      let isPdfOrImage = false;
      let base64Pure = '';

      if (elementText && typeof elementText === 'string') {
        directTextContent = sanitizeCleanText(elementText);
      } else if (fileData) {
        const isDocx = cleanFileName.endsWith('.docx') || cleanMime.includes('wordprocessingml') || cleanMime.includes('docx');
        const isDoc = cleanFileName.endsWith('.doc') || cleanMime === 'application/msword';
        const isPdf = cleanFileName.endsWith('.pdf') || cleanMime === 'application/pdf';
        const isTextBased =
          cleanMime.startsWith('text/') ||
          cleanMime === 'application/json' ||
          cleanMime === 'text/csv' ||
          cleanFileName.endsWith('.md') ||
          cleanFileName.endsWith('.txt') ||
          cleanFileName.endsWith('.json') ||
          cleanFileName.endsWith('.csv');

        if (typeof fileData === 'string' && fileData.includes('base64,')) {
          base64Pure = fileData.split('base64,')[1];
        } else if (typeof fileData === 'string' && !fileData.startsWith('data:')) {
          base64Pure = fileData;
        }

        if (isPdf) {
          try {
            const buf = Buffer.from(base64Pure, 'base64');
            const pdfExtracted = await extractTextFromPdf(buf);
            if (pdfExtracted && pdfExtracted.length > 20) {
              directTextContent = pdfExtracted;
            } else {
              // Scanned image PDF without digital text streams
              isPdfOrImage = true;
            }
          } catch (pdfErr) {
            console.warn('[PDF Extraction] Warning:', pdfErr);
            isPdfOrImage = true;
          }
        } else if (isDocx || isDoc) {
          try {
            const buf = Buffer.from(base64Pure, 'base64');
            if (isDocx) {
              directTextContent = extractTextFromDocx(buf);
            } else {
              directTextContent = extractTextFromDoc(buf);
            }
          } catch (err) {
            console.warn('Word file buffer decode failed:', err);
          }
        } else if (isTextBased) {
          if (typeof fileData === 'string' && fileData.startsWith('data:')) {
            try {
              directTextContent = Buffer.from(base64Pure, 'base64').toString('utf-8');
            } catch {
              directTextContent = fileData;
            }
          } else {
            directTextContent = fileData;
          }
          directTextContent = sanitizeCleanText(directTextContent);
        } else if (
          cleanMime.startsWith('image/') ||
          cleanFileName.endsWith('.png') ||
          cleanFileName.endsWith('.jpg') ||
          cleanFileName.endsWith('.jpeg') ||
          cleanFileName.endsWith('.webp')
        ) {
          isPdfOrImage = true;
        }
      }

      // 1. Direct AI Analysis with Gemini API Key (Multimodal: PDF, Images, Word, MD, TXT, JSON, CSV, Elements)
      let aiAuthFailed = false;
      if (effectiveApiKey) {
        const candidateModels = aiRuntime.candidateModels;
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        const systemInstruction = `You are an elite technical documentation analyst and knowledge chunking engine for the Trek Consultancy platform.
Your task is to exhaustively analyze the provided document, screenshot image, or submitted elements in detail, and extract the MAXIMUM possible information into structured, self-contained Knowledge Chunks suitable for retrieval-augmented generation (RAG) and automated customer support.

CRITICAL DIRECTIVES FOR MAXIMUM INFORMATION RETENTION:
1. Do NOT summarize away or lose valuable details. Extract all essential domain knowledge: step-by-step instructions, business logic, pricing, rules, requirements, configurations, database details, FAQs, troubleshooting steps, and technical specifications.
2. Break the content into as many comprehensive, granular chunks as appropriate (e.g. 2 to 20+ chunks depending on document depth and volume). Do not arbitrarily condense multiple distinct topics into one.
3. Every chunk MUST be completely self-contained with enough context that an AI support assistant reading ONLY that chunk can give a complete, helpful answer.
4. Output MUST be valid JSON adhering strictly to this schema:
{
  "chunks": [
    {
      "title": "Clear, specific, search-optimized title (e.g. 'MISA Investment License Process & Timeline')",
      "category": "Topic category tag (e.g. '${cleanCategory}', 'Company Formation', 'Legal', 'Pricing', 'Technical', 'Security')",
      "summary": "1-2 sentence high-level overview of what this chunk explains",
      "tags": ["keyword1", "keyword2", "keyword3"],
      "content": "Comprehensive markdown content retaining all bullet points, numbers, procedures, conditions, and context."
    }
  ]
}`;

        let contentsPayload: any[];

        if (isPdfOrImage && base64Pure) {
          const effectiveMime = cleanMime.startsWith('image/') || cleanMime === 'application/pdf'
            ? cleanMime
            : cleanFileName.endsWith('.pdf') ? 'application/pdf' : 'image/png';

          contentsPayload = [
            {
              inlineData: {
                data: base64Pure,
                mimeType: effectiveMime
              }
            },
            `Document/Image Source: ${cleanFileName}\nPreferred Category: ${cleanCategory}\n\nPlease perform deep, exhaustive analysis of this document/image. Extract ALL key knowledge points, procedures, tables, and details into comprehensive knowledge chunks according to the system instruction.`
          ];
        } else {
          const textPayload = directTextContent || '';
          contentsPayload = [
            `Document/Element Source: ${cleanFileName}\nPreferred Category: ${cleanCategory}\n\nContent to analyze:\n${textPayload.slice(0, 120000)}`
          ];
        }

        for (const modelName of candidateModels) {
          let modelExtracted = false;
          let shouldAbortAll = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const response = await ai.models.generateContent({
                model: modelName,
                contents: contentsPayload,
                config: {
                  systemInstruction,
                  responseMimeType: 'application/json',
                  temperature: 0.15,
                  maxOutputTokens: 8192
                }
              });

              if (response.text) {
                let cleanJson = response.text.trim();
                if (cleanJson.startsWith('```json')) {
                  cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```\s*$/, '');
                } else if (cleanJson.startsWith('```')) {
                  cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
                }

                const parsed = JSON.parse(cleanJson);
                if (parsed.chunks && Array.isArray(parsed.chunks) && parsed.chunks.length > 0) {
                  extractedChunks = parsed.chunks.map((c: any, idx: number) => ({
                    title: sanitizeCleanText(String(c.title || `${cleanFileName} - Section ${idx + 1}`)),
                    category: sanitizeCleanText(String(c.category || cleanCategory)),
                    summary: sanitizeCleanText(String(c.summary || '')),
                    tags: Array.isArray(c.tags) ? c.tags.map((t: any) => sanitizeCleanText(String(t))) : [],
                    content: sanitizeCleanText(String(c.content || ''))
                  })).filter((c: any) => isReadableCleanText(c.content));

                  if (extractedChunks.length > 0) {
                    modelExtracted = true;
                    break;
                  }
                }
              }
            } catch (modelErr: any) {
              const msg = String(modelErr?.message || '');
              const isAuthError = msg.includes('401') || msg.includes('UNAUTHENTICATED') || 
                                  msg.includes('API_KEY_INVALID') || msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
                                  msg.includes('API_KEY_SERVICE_BLOCKED');
              if (isAuthError) {
                aiAuthFailed = true;
                shouldAbortAll = true;
                console.warn('[Gemini Auth Warning] Invalid or unauthenticated API key:', msg);
                break;
              }
              const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('high demand');
              if (isTransient && attempt === 0) {
                await new Promise(r => setTimeout(r, 400));
                continue;
              }
              break;
            }
          }
          if (shouldAbortAll || modelExtracted) break;
        }
      }

      // If Gemini did not extract chunks and we have an image/scanned document without digital text,
      // run offline in-memory OCR with Tesseract.js so image ingestion succeeds even without a Gemini API key!
      if (extractedChunks.length === 0 && isPdfOrImage && !directTextContent && base64Pure) {
        try {
          const imgBuf = Buffer.from(base64Pure, 'base64');
          const ocrText = await extractTextFromImage(imgBuf);
          if (ocrText && ocrText.length > 20) {
            directTextContent = ocrText;
          }
        } catch (ocrErr) {
          console.warn('[OCR Fallback] Offline image OCR notice:', ocrErr);
        }
      }

      // 2. High-fidelity Fallback Extractor (Runs on clean extracted document text)
      if (extractedChunks.length === 0) {
        let textToChunk = directTextContent;
        const baseTitle = cleanFileName.replace(/\.[^/.]+$/, '');

        // Strictly verify that textToChunk is actual human-readable text and NOT binary garbage
        if (textToChunk && isReadableCleanText(textToChunk)) {
          // Check if JSON format
          try {
            const parsedObj = JSON.parse(textToChunk);
            if (Array.isArray(parsedObj)) {
              parsedObj.slice(0, 20).forEach((item, idx) => {
                const title = sanitizeCleanText(item.title || item.name || item.subject || `${baseTitle} - Entry ${idx + 1}`);
                const content = sanitizeCleanText(typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item));
                if (isReadableCleanText(content)) {
                  extractedChunks.push({
                    title,
                    category: cleanCategory,
                    summary: `Data item ${idx + 1} from ${cleanFileName}`,
                    tags: ['JSON', cleanCategory],
                    content
                  });
                }
              });
            } else if (typeof parsedObj === 'object' && parsedObj !== null) {
              Object.keys(parsedObj).slice(0, 20).forEach(k => {
                const val = parsedObj[k];
                const content = sanitizeCleanText(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
                if (isReadableCleanText(content)) {
                  extractedChunks.push({
                    title: `${baseTitle}: ${k}`,
                    category: cleanCategory,
                    summary: `Property ${k} from ${cleanFileName}`,
                    tags: [k, cleanCategory],
                    content
                  });
                }
              });
            }
          } catch {}

          // Check if CSV format
          if (extractedChunks.length === 0 && (cleanMime === 'text/csv' || cleanFileName.endsWith('.csv') || textToChunk.includes(','))) {
            const lines = textToChunk.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length > 1 && lines[0].includes(',')) {
              const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
              lines.slice(1, 20).forEach((line, idx) => {
                const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
                const content = headers.map((h, i) => `**${h}**: ${cols[i] || ''}`).join('\n');
                if (isReadableCleanText(content)) {
                  extractedChunks.push({
                    title: `${baseTitle} - Row ${idx + 1} (${cols[0] || 'Record'})`,
                    category: cleanCategory,
                    summary: `Row ${idx + 1} data`,
                    tags: ['CSV', cleanCategory],
                    content
                  });
                }
              });
            }
          }

          // Check if Markdown with section headers
          if (extractedChunks.length === 0) {
            const markdownSections = textToChunk.split(/\n(?=#{1,3}\s+)/g).filter(s => s.trim().length > 20);
            if (markdownSections.length > 1) {
              markdownSections.slice(0, 20).forEach((sec, idx) => {
                const firstLine = sec.trim().split('\n')[0].replace(/^#{1,3}\s+/, '').trim();
                const body = sanitizeCleanText(sec.trim().replace(/^#{1,3}\s+[^\n]+\n?/, '').trim() || sec.trim());
                if (isReadableCleanText(body)) {
                  extractedChunks.push({
                    title: firstLine.length > 0 && firstLine.length < 80 ? firstLine : `${baseTitle} - Part ${idx + 1}`,
                    category: cleanCategory,
                    summary: `Section ${idx + 1} from ${cleanFileName}`,
                    tags: ['Documentation', cleanCategory],
                    content: body
                  });
                }
              });
            }
          }

          // Check distinct sections / paragraphs
          if (extractedChunks.length === 0) {
            const paragraphs = textToChunk.split(/\n\s*\n+/).map(p => sanitizeCleanText(p.trim())).filter(p => isReadableCleanText(p));
            if (paragraphs.length > 0) {
              // Group short paragraphs into comprehensive chunks of 100-300 words
              const groupedChunks: string[] = [];
              let currentGroup = '';
              for (const p of paragraphs) {
                if (currentGroup.length + p.length > 800) {
                  groupedChunks.push(currentGroup.trim());
                  currentGroup = p;
                } else {
                  currentGroup += (currentGroup ? '\n\n' : '') + p;
                }
              }
              if (currentGroup.trim()) groupedChunks.push(currentGroup.trim());

              extractedChunks = groupedChunks.slice(0, 15).map((p, idx) => {
                const firstSentence = p.split(/[.\n]/)[0].trim().slice(0, 70);
                let title = `${baseTitle} - Section ${idx + 1}`;
                if (firstSentence.length > 5) {
                  if (firstSentence.toLowerCase().startsWith(baseTitle.toLowerCase())) {
                    title = firstSentence;
                  } else {
                    title = `${baseTitle}: ${firstSentence}`;
                  }
                }
                return {
                  title,
                  category: cleanCategory,
                  summary: `Extracted section ${idx + 1}`,
                  tags: [cleanCategory],
                  content: p.trim()
                };
              });
            }
          }

          // Single overview fallback if readable
          if (extractedChunks.length === 0 && isReadableCleanText(textToChunk)) {
            extractedChunks = [{
              title: `${baseTitle} Overview`,
              category: cleanCategory,
              summary: `Extracted overview of ${cleanFileName}`,
              tags: [cleanCategory],
              content: sanitizeCleanText(textToChunk.trim().slice(0, 3000))
            }];
          }
        }
      }

      // Final sanity filter: ensure NO bytecode or unreadable chunks ever leak to the admin
      extractedChunks = extractedChunks.filter(c => isReadableCleanText(c.content));

      if (extractedChunks.length === 0) {
        return res.status(400).json({
          error: 'No readable text content could be recognized from this file or image. Please ensure the image contains clear, legible text, or supply a Gemini AI Studio API key.'
        });
      }

      // 3. If autoSave is explicitly requested, persist chunks into PostgreSQL
      const savedDocs: any[] = [];
      if (autoSave && extractedChunks.length > 0) {
        for (const chunk of extractedChunks) {
          const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const insertRes = await pool.query(`
            INSERT INTO knowledge_documents (id, title, content, category, status)
            VALUES ($1, $2, $3, $4, 'published')
            RETURNING id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
          `, [id, chunk.title.trim(), chunk.content.trim(), chunk.category || cleanCategory]);

          await pool.query(`
            INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, created_at)
            VALUES ($1, $2, $3, 0, NOW())
            ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
          `, [`chk-${id}-0`, id, chunk.content.trim()]);

          savedDocs.push(insertRes.rows[0]);
        }
        invalidateRagCache();
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

  // Support Admin: Bulk Create Knowledge Document Chunks
  app.post('/api/admin/support/knowledge-docs/bulk-create', async (req, res) => {
    try {
      const { chunks } = req.body;
      if (!Array.isArray(chunks) || chunks.length === 0) {
        return res.status(400).json({ error: 'Valid chunks array is required.' });
      }

      const savedDocs: any[] = [];
      for (const item of chunks) {
        if (!item.title || !item.content) continue;
        const id = `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const cleanCat = (item.category || 'General').trim();
        const insertRes = await pool.query(`
          INSERT INTO knowledge_documents (id, title, content, category, status)
          VALUES ($1, $2, $3, $4, 'published')
          RETURNING id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
        `, [id, item.title.trim(), item.content.trim(), cleanCat]);

        await pool.query(`
          INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, created_at)
          VALUES ($1, $2, $3, 0, NOW())
          ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
        `, [`chk-${id}-0`, id, item.content.trim()]);

        savedDocs.push(insertRes.rows[0]);
      }

      invalidateRagCache();
      res.status(201).json({
        success: true,
        count: savedDocs.length,
        documents: savedDocs
      });
    } catch (err: any) {
      console.error('Bulk knowledge creation failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: AI Real-Time Knowledge & RAG Status
  app.get('/api/admin/support/ai-knowledge-status', async (_req, res) => {
    try {
      const faqsCount = await pool.query(`SELECT COUNT(*) FROM faqs WHERE status = 'published'`);
      const chunksCount = await pool.query(`SELECT COUNT(*) FROM knowledge_documents WHERE status = 'published'`);
      const topicsCount = await pool.query(`SELECT COUNT(*) FROM topics`);
      const answeredTicketsCount = await pool.query(`SELECT COUNT(*) FROM support_tickets WHERE admin_answer IS NOT NULL AND TRIM(admin_answer) != ''`);
      const settingsData = await pool.query(`SELECT value FROM settings WHERE key = 'platform'`);
      const platform = settingsData.rows[0]?.value || {};
      const aiRuntime = await getEffectiveAiRuntime();

      res.json({
        totalFaqs: parseInt(faqsCount.rows[0].count, 10),
        totalChunks: parseInt(chunksCount.rows[0].count, 10),
        totalTopics: parseInt(topicsCount.rows[0].count, 10),
        totalAnsweredTickets: parseInt(answeredTicketsCount.rows[0].count, 10),
        platformBrand: platform.forumName || 'Trek Consultancy Forum',
        primaryEmail: platform.primarySupportEmail || 'support@trekconsultancy.com',
        lastSyncedAt: new Date().toISOString(),
        liveSyncStatus: 'ACTIVE',
        activeModel: aiRuntime.selectedModel,
        isKeyConfigured: aiRuntime.isKeyConfigured,
        hasCustomKey: aiRuntime.hasCustomDbKey,
        models: [...aiRuntime.candidateModels, 'Local PostgreSQL RAG Fallback']
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Business Memory Graph Status
  app.get('/api/admin/support/business-memory', async (_req, res) => {
    try {
      const memory = await getOrCompileBusinessMemory(pool);
      res.json({
        success: true,
        memory: {
          version: memory.version,
          lastUpdated: memory.lastUpdated,
          lastUpdatedTimestamp: memory.lastUpdatedTimestamp,
          totalMemoryNodes: memory.totalMemoryNodes,
          pillarsCount: memory.pillars.length,
          faqsCount: memory.faqs.length,
          docsCount: memory.knowledgeDocs.length,
          ticketsCount: memory.verifiedTickets.length,
          quickFacts: memory.quickFacts,
          identity: {
            brand: memory.identity.brand,
            headquarters: memory.identity.headquarters,
            foundedEra: memory.identity.foundedEra,
            officialEmail: memory.identity.officialEmail,
            slaHours: memory.identity.slaHours
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Admin: Force Rebuild Business Memory
  app.post('/api/admin/support/business-memory/rebuild', async (_req, res) => {
    try {
      invalidateBusinessMemoryCache();
      const memory = await compileBusinessMemory(pool);
      
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Rebuilt Business Memory Graph', 'Admin', $2, 'Just now', 'system')
      `, [`act-${Date.now()}`, `${memory.totalMemoryNodes} nodes synchronized`]).catch(() => {});

      res.json({
        success: true,
        message: 'Business Memory rebuilt successfully from live database',
        memory: {
          version: memory.version,
          lastUpdated: memory.lastUpdated,
          lastUpdatedTimestamp: memory.lastUpdatedTimestamp,
          totalMemoryNodes: memory.totalMemoryNodes,
          pillarsCount: memory.pillars.length,
          faqsCount: memory.faqs.length,
          docsCount: memory.knowledgeDocs.length,
          ticketsCount: memory.verifiedTickets.length,
          quickFacts: memory.quickFacts
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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

  // =========================================================================
  // AI ENGINE & MODEL CONFIGURATION (Neon PostgreSQL Sync)
  // =========================================================================
  app.get('/api/admin/settings/ai', async (_req, res) => {
    try {
      const dbConfig = await getAiConfigFromDb();
      const rawProvider = ((dbConfig.provider || 'gemini') as string).toLowerCase();
      const currentProvider = rawProvider === 'openai' ? 'openai' : 'gemini';
      const baseUrl = dbConfig.baseUrl || DEFAULT_PROVIDER_BASE_URLS[currentProvider] || '';
      const providerApiKeys = dbConfig.providerApiKeys || {};

      // Determine active key for the current provider
      const rawDbKey = (providerApiKeys[currentProvider] || (rawProvider === currentProvider ? dbConfig.apiKey : '') || '').trim();
      let envKey = '';
      if (currentProvider === 'gemini') envKey = (process.env.GEMINI_API_KEY || '').trim();
      else if (currentProvider === 'openai') envKey = (process.env.OPENAI_API_KEY || '').trim();

      const activeKey = rawDbKey || envKey;
      const apiKeyMasked = activeKey
        ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}`
        : '';

      res.json({
        provider: currentProvider,
        baseUrl,
        providerApiKeys: Object.fromEntries(
          Object.entries(providerApiKeys)
            .filter(([p]) => p === 'gemini' || p === 'openai')
            .map(([p, k]) => [
              p,
              typeof k === 'string' && k.length > 8 ? `${k.slice(0, 4)}...${k.slice(-4)}` : (k ? '••••••••' : '')
            ])
        ),
        selectedModel: dbConfig.selectedModel || (currentProvider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini'),
        fallbackModels: Array.isArray(dbConfig.fallbackModels) ? dbConfig.fallbackModels : ['gemini-3.7-flash', 'gemini-3.5-flash'],
        temperature: typeof dbConfig.temperature === 'number' ? dbConfig.temperature : 0.4,
        maxOutputTokens: typeof dbConfig.maxOutputTokens === 'number' ? dbConfig.maxOutputTokens : 2048,
        customSystemInstruction: dbConfig.customSystemInstruction || '',
        status: dbConfig.status || 'active',
        isKeyConfigured: Boolean(activeKey),
        hasCustomKey: Boolean(rawDbKey),
        usingEnvKey: Boolean(!rawDbKey && envKey),
        apiKeyMasked,
        lastTestedAt: dbConfig.lastTestedAt || null,
        lastTestStatus: dbConfig.lastTestStatus || 'untested',
        lastTestMessage: dbConfig.lastTestMessage || '',
        lastTestLatencyMs: dbConfig.lastTestLatencyMs || 0,
        updatedAt: dbConfig.updatedAt || null,
        availableModels: TOP_AI_MODELS
      });
    } catch (err: any) {
      console.error('[AI Settings] Failed to fetch settings:', err?.message || err);
      res.status(500).json({ error: 'Failed to load AI settings' });
    }
  });

  const handleSaveAiSettings = async (req: express.Request, res: express.Response) => {
    try {
      const currentConfig = await getAiConfigFromDb();
      const {
        provider,
        baseUrl,
        apiKey,
        providerApiKeys: incomingProviderKeys,
        selectedModel,
        fallbackModels,
        temperature,
        maxOutputTokens,
        customSystemInstruction,
        status
      } = req.body;

      const newProvider = ((provider || currentConfig.provider || 'gemini') as string).toLowerCase() === 'openai' ? 'openai' : 'gemini';

      // Merge providerApiKeys map
      const mergedProviderKeys: Record<string, string> = {
        ...(currentConfig.providerApiKeys || {})
      };

      if (incomingProviderKeys && typeof incomingProviderKeys === 'object') {
        for (const [p, k] of Object.entries(incomingProviderKeys)) {
          if (typeof k === 'string') {
            const trimmed = k.trim();
            if (trimmed === '') {
              delete mergedProviderKeys[p];
            } else if (!trimmed.includes('...') && !trimmed.includes('••••')) {
              mergedProviderKeys[p] = trimmed;
            }
          }
        }
      }

      // If single apiKey is provided
      if (typeof apiKey === 'string') {
        const trimmed = apiKey.trim();
        if (trimmed === '') {
          delete mergedProviderKeys[newProvider];
        } else if (!trimmed.includes('...') && !trimmed.includes('••••')) {
          mergedProviderKeys[newProvider] = trimmed;
        }
      }

      const sanitizedProviderKeys: Record<string, string> = {};
      if (mergedProviderKeys['gemini']) sanitizedProviderKeys['gemini'] = mergedProviderKeys['gemini'];
      if (mergedProviderKeys['openai']) sanitizedProviderKeys['openai'] = mergedProviderKeys['openai'];

      const activeKeyForProvider = sanitizedProviderKeys[newProvider] || '';

      const newConfig = {
        ...currentConfig,
        provider: newProvider,
        baseUrl: typeof baseUrl === 'string' && baseUrl.trim() ? baseUrl.trim() : (DEFAULT_PROVIDER_BASE_URLS[newProvider] || (newProvider === 'openai' ? 'https://api.openai.com/v1' : 'https://generativelanguage.googleapis.com')),
        providerApiKeys: sanitizedProviderKeys,
        apiKey: activeKeyForProvider,
        selectedModel: selectedModel || (newProvider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini'),
        fallbackModels: Array.isArray(fallbackModels) ? fallbackModels : currentConfig.fallbackModels,
        temperature: typeof temperature === 'number' ? Math.max(0, Math.min(1, temperature)) : currentConfig.temperature,
        maxOutputTokens: typeof maxOutputTokens === 'number' ? Math.max(256, Math.min(8192, maxOutputTokens)) : currentConfig.maxOutputTokens,
        customSystemInstruction: typeof customSystemInstruction === 'string' ? customSystemInstruction.trim() : currentConfig.customSystemInstruction,
        status: status === 'disabled' ? 'disabled' : 'active',
        updatedAt: new Date().toISOString()
      };

      await pool.query(
        "INSERT INTO settings (key, value) VALUES ('ai', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [JSON.stringify(newConfig)]
      );

      invalidateAiConfigCache();
      invalidateRagCache();

      // Log activity
      try {
        const logId = `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await pool.query(
          "INSERT INTO activity_logs (id, action, actor, target, time_ago, type, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
          [logId, 'UPDATED_AI_CONFIG', 'Administrator', `AI Provider: ${newConfig.provider} | Model: ${newConfig.selectedModel}`, 'Just now', 'system']
        );
      } catch {}

      let envKey = '';
      if (newProvider === 'gemini') envKey = (process.env.GEMINI_API_KEY || '').trim();
      else if (newProvider === 'openai') envKey = (process.env.OPENAI_API_KEY || '').trim();

      const activeKey = activeKeyForProvider || envKey;
      const apiKeyMasked = activeKey
        ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}`
        : '';

      res.json({
        success: true,
        message: 'AI Model configuration saved and synchronized with database.',
        ai: {
          ...newConfig,
          apiKey: undefined,
          apiKeyMasked,
          isKeyConfigured: Boolean(activeKey),
          hasCustomKey: Boolean(activeKeyForProvider),
          usingEnvKey: Boolean(!activeKeyForProvider && envKey)
        }
      });
    } catch (err: any) {
      console.error('[AI Settings] Failed to save settings:', err?.message || err);
      res.status(500).json({ error: 'Failed to save AI configuration' });
    }
  };

  app.post('/api/admin/settings/ai', handleSaveAiSettings);
  app.put('/api/admin/settings/ai', handleSaveAiSettings);

  app.post('/api/admin/settings/ai/test', async (req, res) => {
    try {
      const dbConfig = await getAiConfigFromDb();
      const { provider: inputProvider, apiKey: inputKey, baseUrl: inputBaseUrl, model: inputModel } = req.body;

      const rawInputProvider = ((inputProvider || dbConfig.provider || 'gemini') as string).toLowerCase();
      const provider = rawInputProvider === 'openai' ? 'openai' : 'gemini';
      let baseUrl = (inputBaseUrl || '').trim();
      if (!baseUrl) {
        baseUrl = DEFAULT_PROVIDER_BASE_URLS[provider] || (provider === 'openai' ? 'https://api.openai.com/v1' : 'https://generativelanguage.googleapis.com');
      }

      let testKey = (inputKey || '').trim();
      if (!testKey || testKey.includes('...') || testKey.includes('••••')) {
        testKey = (dbConfig.providerApiKeys?.[provider] || (dbConfig.provider === provider ? dbConfig.apiKey : '') || '').trim();
        if (!testKey) {
          if (provider === 'gemini') testKey = (process.env.GEMINI_API_KEY || '').trim();
          else if (provider === 'openai') testKey = (process.env.OPENAI_API_KEY || '').trim();
        }
      }

      if (!testKey) {
        return res.status(400).json({
          success: false,
          message: `No API key configured for provider "${provider}". Please enter an API key to test.`
        });
      }

      const defaultModelForProvider = provider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini';

      const testModel = (inputModel || (dbConfig.provider === provider ? dbConfig.selectedModel : defaultModelForProvider) || defaultModelForProvider).trim();
      const startTime = Date.now();

      const result = await executeAiCompletion({
        provider,
        apiKey: testKey,
        baseUrl,
        model: testModel,
        systemInstruction: 'You are a diagnostic verification probe. Reply strictly with the word READY.',
        messages: [{ role: 'user', content: 'Reply with the single word "READY" if you receive this diagnostic verification signal.' }],
        temperature: 0.1,
        maxTokens: 50,
        timeoutMs: 12000
      });

      const latencyMs = Date.now() - startTime;
      const responseText = result.text;

      // Persist success status
      try {
        const updatedConfig = {
          ...dbConfig,
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'success',
          lastTestMessage: `[${provider.toUpperCase()}] Model ${testModel} responded in ${latencyMs}ms: "${responseText.slice(0, 50)}"`,
          lastTestLatencyMs: latencyMs
        };
        await pool.query(
          "INSERT INTO settings (key, value) VALUES ('ai', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
          [JSON.stringify(updatedConfig)]
        );
        invalidateAiConfigCache();
      } catch {}

      return res.json({
        success: true,
        latencyMs,
        provider,
        model: testModel,
        response: responseText,
        message: `Successfully connected to ${provider} (${testModel}) in ${latencyMs}ms!`
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn('[AI Test] Ping failed:', errMsg);

      try {
        const dbConfig = await getAiConfigFromDb();
        const updatedConfig = {
          ...dbConfig,
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'failed',
          lastTestMessage: errMsg.slice(0, 500),
          lastTestLatencyMs: 0
        };
        await pool.query(
          "INSERT INTO settings (key, value) VALUES ('ai', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
          [JSON.stringify(updatedConfig)]
        );
        invalidateAiConfigCache();
      } catch {}

      return res.status(400).json({
        success: false,
        error: errMsg,
        message: errMsg
      });
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
          forumName: 'Trek Consultancy Forum',
          forumTagline: 'The official community forum and support portal for Trek Consultancy',
          enableGuestPosting: true,
          enableAutoModeration: true,
          announcementText: '',
          showAnnouncement: false,
          primarySupportEmail: 'support@trekconsultancy.com',
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

      invalidateRagCache();
      res.json({ success: true, settings: newSettings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hero Section Settings
  app.get('/api/hero', async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'hero'");
      if (result.rows.length > 0 && result.rows[0].value) {
        res.json(result.rows[0].value);
      } else {
        res.json(defaultHeroSettings);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/hero', async (req, res) => {
    try {
      const heroSettings = req.body;
      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('hero', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(heroSettings)]);

      res.json({ success: true, hero: heroSettings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/hero', async (req, res) => {
    try {
      const heroSettings = req.body;
      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('hero', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(heroSettings)]);

      res.json({ success: true, hero: heroSettings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // SEO & Metadata Management
  // ---------------------------------------------------------------------------
  const fallbackSeoConfig = {
    metaTitle: 'Trek Consultancy Forum - Discussion Community & Support Portal',
    titleSeparator: ' - ',
    metaDescription: 'The official community discussion forum and enterprise services portal for Trek Consultancy. Expert advisory in Saudi business setup, custom software, visas, and corporate compliance.',
    metaKeywords: 'Trek Consultancy, Saudi business setup, MISA investment license, Commercial Registration CR, custom software ERP, corporate compliance, Riyadh advisory',
    canonicalUrl: 'https://trekconsultancy.com',
    siteName: 'Trek Consultancy Forum',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Trek Consultancy Forum - Discussion Community & Support Portal',
    ogDescription: 'The official community discussion forum and enterprise services portal for Trek Consultancy. Connecting developers, entrepreneurs, and senior advisors.',
    ogImage: '/trek-logo.webp',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterSite: '@trekconsultancy',
    twitterCreator: '@trekconsultancy',
    googleSiteVerification: '',
    bingSiteVerification: '',
    organizationName: 'Trek Consultancy',
    organizationLogo: '/trek-logo.webp',
    contactEmail: 'support@trekconsultancy.com',
    contactPhone: '+966 50 000 0000',
    customHeadTags: ''
  };

  app.get('/api/seo', async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'seo'");
      if (result.rows.length > 0) {
        res.json(result.rows[0].value);
      } else {
        res.json(fallbackSeoConfig);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const handleSaveSeo = async (req: any, res: any) => {
    try {
      const newSeo = req.body;
      const cleanSeo = {
        ...fallbackSeoConfig,
        ...newSeo,
        updatedAt: new Date().toISOString()
      };

      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('seo', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(cleanSeo)]);

      try {
        await pool.query(`
          INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
          VALUES ($1, 'Updated SEO Configuration', 'Admin', 'SEO & Metadata', 'Just now', 'setting')
        `, [`act-${Date.now()}`]);
      } catch (logErr) {
        console.warn('Failed to log SEO activity:', logErr);
      }

      res.json({ success: true, seo: cleanSeo });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.post('/api/admin/seo', handleSaveSeo);
  app.post('/api/seo', handleSaveSeo);

  // Dynamic robots.txt
  app.get('/robots.txt', async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'seo'");
      const seo = result.rows.length > 0 ? result.rows[0].value : fallbackSeoConfig;
      const baseUrl = (seo.canonicalUrl || 'https://trekconsultancy.com').replace(/\/$/, '');

      let robotsContent = '';
      if (!seo.robotsIndex) {
        robotsContent = `# Trek Consultancy Robots Configuration\nUser-agent: *\nDisallow: /\n`;
      } else {
        robotsContent = `# Trek Consultancy Robots Configuration\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(robotsContent);
    } catch {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n`);
    }
  });

  // Dynamic sitemap.xml
  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const [seoRes, topicsRes, blogsRes] = await Promise.all([
        pool.query("SELECT value FROM settings WHERE key = 'seo'"),
        pool.query("SELECT id, created_at FROM topics ORDER BY created_at DESC LIMIT 100"),
        pool.query("SELECT id, created_at FROM blogs ORDER BY created_at DESC LIMIT 50")
      ]);

      const seo = seoRes.rows.length > 0 ? seoRes.rows[0].value : fallbackSeoConfig;
      const baseUrl = (seo.canonicalUrl || 'https://trekconsultancy.com').replace(/\/$/, '');
      const now = new Date().toISOString();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Homepage
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

      // Blogs section
      xml += `  <url>\n    <loc>${baseUrl}/#blogs</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

      // Individual Topics
      topicsRes.rows.forEach((t: any) => {
        const lastMod = t.created_at ? new Date(t.created_at).toISOString() : now;
        xml += `  <url>\n    <loc>${baseUrl}/#topic-${t.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      // Individual Blogs
      blogsRes.rows.forEach((b: any) => {
        const lastMod = b.created_at ? new Date(b.created_at).toISOString() : now;
        xml += `  <url>\n    <loc>${baseUrl}/#blog-${b.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://trekconsultancy.com/</loc></url></urlset>`);
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
