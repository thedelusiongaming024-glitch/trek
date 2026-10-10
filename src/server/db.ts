import { neon, neonConfig, Pool } from '@neondatabase/serverless';
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
  floatingSupportMessengerTheme: 'messenger-blue'
};

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
  intervalSeconds: 3,
  overlayOpacity: 0.65,
  overlayGradient: 'violet-dark',
  transitionEffect: 'fade',
  title: 'Welcome to Trek Consultancy Forum',
  subtitle: 'The official community forum and support portal for Trek Consultancy',
  searchPlaceholder: 'Search for Topics, Solutions, & Guides....',
  enableOverlayMesh: true,
  heroHeight: 'tall'
};

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
  } catch (err: any) {
    console.warn('[Database] Failed to initialize Neon Pool:', err?.message || err);
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
          created_at    TIMESTAMPTZ DEFAULT NOW(),
          redirect_url  TEXT
        );

        ALTER TABLE blogs ADD COLUMN IF NOT EXISTS redirect_url TEXT;

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
      // DOMAIN 7: COMMERCIAL INQUIRIES & LEADS (REMOVED)
      // ------------------------------------------------------------------------
      await client.query(`
        DROP TABLE IF EXISTS consultancy_inquiries CASCADE;

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
