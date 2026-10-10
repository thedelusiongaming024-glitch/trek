"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_net = __toESM(require("net"), 1);
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_http = __toESM(require("http"), 1);

// src/server/app.ts
var import_express = __toESM(require("express"), 1);
var import_node_zlib = __toESM(require("node:zlib"), 1);
var import_genai = require("@google/genai");
var import_resend = require("resend");

// src/server/db.ts
var import_serverless = require("@neondatabase/serverless");
var import_ws = __toESM(require("ws"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
import_dotenv.default.config();
if (!process.env.DATABASE_URL && import_fs.default.existsSync("env.txt")) {
  import_dotenv.default.config({ path: "env.txt" });
}
if (!process.env.DATABASE_URL && import_fs.default.existsSync(".env.example")) {
  import_dotenv.default.config({ path: ".env.example" });
}
if (!import_serverless.neonConfig.webSocketConstructor) {
  import_serverless.neonConfig.webSocketConstructor = import_ws.default;
}
import_serverless.neonConfig.useSecureWebSocket = true;
import_serverless.neonConfig.pipelineTLS = false;
var rawConnectionString = process.env.DATABASE_URL?.trim();
var connectionString = rawConnectionString ? rawConnectionString.replace(/^["']|["']$/g, "") : void 0;
if (!connectionString) {
  console.warn(
    "[Database] Warning: DATABASE_URL is not set. Database mock fallback is active."
  );
}
var defaultSettings = {
  forumName: "Trek Consultancy Forum",
  forumTagline: "The official community forum and support portal for Trek Consultancy",
  enableGuestPosting: true,
  enableAutoModeration: true,
  announcementText: "",
  showAnnouncement: false,
  primarySupportEmail: "support@trekconsultancy.com",
  slaHours: 24,
  floatingSupportEnabled: true,
  floatingSupportTagTextEn: "Support Assistant & FAQs",
  floatingSupportTagTextBn: "\u09E8\u09EA/\u09ED \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099A\u09CD\u09AF\u09BE\u099F \u0993 \u09B9\u09C7\u09B2\u09CD\u09AA",
  floatingSupportGreetingEn: "Hello! How can our support team & AI assist your Trek Consultancy journey today?",
  floatingSupportGreetingBn: "\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09B0! \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u09AE \u0993 \u098F\u0986\u0987 \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7?",
  floatingSupportAiEnabled: true,
  floatingSupportDefaultPriority: "Normal",
  floatingSupportMessengerTheme: "messenger-blue"
};
var defaultHeroSettings = {
  slides: [
    {
      id: "slide-1",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
      title: "Enterprise Architecture & Cloud Systems",
      subtitle: "Designing scalable, mission-critical platforms with modern resilience.",
      isActive: true
    },
    {
      id: "slide-2",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
      title: "Global Technology Strategy & Community Advisory",
      subtitle: "Collaborative problem solving with leading senior engineers.",
      isActive: true
    },
    {
      id: "slide-3",
      url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80",
      title: "Performance Engineering & High-Traffic Optimization",
      subtitle: "Turnkey solutions for database scaling, APIs, and microservices.",
      isActive: true
    }
  ],
  autoplay: true,
  intervalSeconds: 3,
  overlayOpacity: 0.65,
  overlayGradient: "violet-dark",
  transitionEffect: "fade",
  title: "Welcome to Trek Consultancy Forum",
  subtitle: "The official community forum and support portal for Trek Consultancy",
  searchPlaceholder: "Search for Topics, Solutions, & Guides....",
  enableOverlayMesh: true,
  heroHeight: "tall"
};
var defaultSeoSettings = {
  metaTitle: "Trek Consultancy Forum - Discussion Community & Support Portal",
  titleSeparator: " - ",
  metaDescription: "The official community discussion forum and enterprise services portal for Trek Consultancy. Expert advisory in Saudi business setup, custom software, visas, and corporate compliance.",
  metaKeywords: "Trek Consultancy, Saudi business setup, MISA investment license, Commercial Registration CR, custom software ERP, corporate compliance, Riyadh advisory, Saudi Arabia company formation",
  canonicalUrl: "https://trekconsultancy.com",
  siteName: "Trek Consultancy Forum",
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: "Trek Consultancy Forum - Discussion Community & Support Portal",
  ogDescription: "The official community discussion forum and enterprise services portal for Trek Consultancy. Connecting developers, entrepreneurs, and senior advisors.",
  ogImage: "/trek-logo.webp",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "@trekconsultancy",
  twitterCreator: "@trekconsultancy",
  googleSiteVerification: "",
  bingSiteVerification: "",
  organizationName: "Trek Consultancy",
  organizationLogo: "/trek-logo.webp",
  contactEmail: "support@trekconsultancy.com",
  contactPhone: "+966 50 000 0000",
  customHeadTags: ""
};
var defaultDiscussionCategories = [
  "Business Setup",
  "Corporate Support",
  "Visa & PRO",
  "Real Estate",
  "Software & Digital",
  "General Discussion",
  "Cloud Architecture",
  "DevOps & CI/CD",
  "Enterprise Security",
  "Docly Theme Support",
  "Feedback Suggestions"
];
var defaultStaffRoles = [
  { name: "Administrator", badgeLabel: "Admin", color: "indigo" },
  { name: "Lead Architect", badgeLabel: "Architect", color: "teal" },
  { name: "Support Team", badgeLabel: "Staff", color: "emerald" },
  { name: "Theme Specialist", badgeLabel: "Specialist", color: "blue" },
  { name: "Moderator", badgeLabel: "Mod", color: "purple" },
  { name: "Community Lead", badgeLabel: "Lead", color: "amber" },
  { name: "Senior Consultant", badgeLabel: "Consultant", color: "rose" }
];
var TOP_AI_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tagline: "Fast and balanced for general queries (Default)",
    speed: "Fast",
    intelligence: "High",
    contextWindow: "1M Tokens",
    badge: "DEFAULT",
    badgeColor: "emerald",
    capabilities: ["General Support", "Document Indexing", "Multilingual"],
    description: "Fast response times and high accuracy for community discussions and customer support."
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tagline: "Advanced reasoning for complex business consulting",
    speed: "Moderate",
    intelligence: "Very High",
    contextWindow: "2M Tokens",
    badge: "ADVANCED",
    badgeColor: "slate",
    capabilities: ["Corporate Advisory", "Licensing & Compliance", "Complex Questions"],
    description: "Designed for detailed business consulting, Saudi MISA licensing analysis, and complex queries."
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    tagline: "High concurrency and low latency",
    speed: "Fast",
    intelligence: "High",
    contextWindow: "1M Tokens",
    badge: "HIGH SPEED",
    badgeColor: "slate",
    capabilities: ["High Volume", "Low Latency", "Chat"],
    description: "Optimized for high-volume message traffic with consistent, low-latency responses."
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    tagline: "Lightweight model with lower token usage",
    speed: "Instant",
    intelligence: "Standard",
    contextWindow: "1M Tokens",
    badge: "LIGHTWEIGHT",
    badgeColor: "slate",
    capabilities: ["FAQ Search", "Quick Answers", "Efficient"],
    description: "Resource-efficient model tuned for straightforward FAQ queries and brief answers."
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    tagline: "Extended context window for long reference documents",
    speed: "Standard",
    intelligence: "High",
    contextWindow: "2M Tokens",
    badge: "LONG CONTEXT",
    badgeColor: "slate",
    capabilities: ["PDF Documents", "Policy Manuals", "Large Files"],
    description: "2M token capacity for processing lengthy corporate guidelines, contracts, and manuals."
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    tagline: "Stable baseline model",
    speed: "Fast",
    intelligence: "Standard",
    contextWindow: "1M Tokens",
    badge: "STABLE",
    badgeColor: "slate",
    capabilities: ["General Support", "Consistent Baseline"],
    description: "Reliable, time-tested model for day-to-day community support."
  }
];
var defaultAiSettings = {
  apiKey: "",
  selectedModel: "gemini-2.5-flash",
  fallbackModels: ["gemini-2.0-flash", "gemini-1.5-flash"],
  temperature: 0.4,
  maxOutputTokens: 2048,
  provider: "Google Gemini",
  customSystemInstruction: "",
  status: "active",
  lastTestStatus: "untested"
};
var realPool = null;
var neonSql = null;
if (connectionString) {
  try {
    neonSql = (0, import_serverless.neon)(connectionString, { fullResults: true });
  } catch (err) {
    console.warn("[Database] Failed to initialize Neon HTTP client:", err?.message || err);
  }
  try {
    realPool = new import_serverless.Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 1e4,
      idleTimeoutMillis: 3e4
    });
    realPool.on("error", (err) => {
      const msg = err?.message || err?.detail || err?.reason || String(err);
      console.warn("[Database] Neon pool client warning:", msg);
    });
  } catch (err) {
    console.warn("[Database] Failed to initialize Neon Pool:", err?.message || err);
  }
}
function formatDbError(err) {
  if (!err) return "Unknown database error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.detail) return `${err.code || "DB_ERROR"}: ${err.detail}`;
  if (err.reason) return err.reason;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
var pool = {
  query: async (text, params) => {
    const queryText = typeof text === "string" ? text : text?.text;
    const queryParams = params ?? (typeof text === "object" ? text?.values : void 0);
    if (neonSql && typeof queryText === "string") {
      try {
        const result = queryParams && queryParams.length > 0 ? await neonSql(queryText, queryParams) : await neonSql(queryText);
        return {
          rows: result.rows || [],
          rowCount: result.rowCount ?? result.rows?.length ?? 0
        };
      } catch (httpErr) {
        const isMulti = httpErr?.message?.includes("cannot insert multiple commands");
        if (!isMulti) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 120));
            const retryRes = queryParams && queryParams.length > 0 ? await neonSql(queryText, queryParams) : await neonSql(queryText);
            return {
              rows: retryRes.rows || [],
              rowCount: retryRes.rowCount ?? retryRes.rows?.length ?? 0
            };
          } catch (retryErr) {
            httpErr = retryErr;
          }
        }
        if (realPool) {
          try {
            return await realPool.query(text, params);
          } catch {
          }
        }
        const errMsg = formatDbError(httpErr);
        console.error("[Database] Query failed:", errMsg, "\nQuery:", typeof queryText === "string" ? queryText.slice(0, 200) : queryText);
        if (typeof queryText === "string" && queryText.includes("FROM settings")) {
          console.warn("[Database] Falling back to default settings after query failure.");
          return { rows: [{ key: "platform", value: defaultSettings }], rowCount: 1 };
        }
        throw httpErr;
      }
    }
    if (realPool) {
      try {
        return await realPool.query(text, params);
      } catch (err) {
        const errMsg = formatDbError(err);
        console.error("[Database] Query failed:", errMsg, "\nQuery:", typeof queryText === "string" ? queryText.slice(0, 200) : queryText);
        if (typeof queryText === "string" && queryText.includes("FROM settings")) {
          console.warn("[Database] Falling back to default settings after query failure.");
          return { rows: [{ key: "platform", value: defaultSettings }], rowCount: 1 };
        }
        throw err;
      }
    }
    if (typeof queryText === "string" && queryText.includes("FROM settings")) {
      return { rows: [{ key: "platform", value: defaultSettings }], rowCount: 1 };
    }
    throw new Error("DATABASE_URL is not configured \u2014 no database connection is available.");
  },
  connect: async () => {
    if (realPool) {
      return await realPool.connect();
    }
    throw new Error("DATABASE_URL is not configured \u2014 no database connection is available.");
  }
};
var initDbPromise = null;
async function initDb() {
  if (initDbPromise) {
    return initDbPromise;
  }
  initDbPromise = (async () => {
    if (!connectionString) {
      console.warn("[Database] DATABASE_URL is not set. Skipping schema initialization.");
      return;
    }
    let client;
    try {
      console.log("[Database] Connecting to Neon PostgreSQL...");
      client = await pool.connect();
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
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
      await client.query(`
        DROP TABLE IF EXISTS consultancy_inquiries CASCADE;

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id            VARCHAR(64) PRIMARY KEY,
          email         VARCHAR(255) UNIQUE NOT NULL,
          subscribed_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
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
      const catCount = await client.query("SELECT COUNT(*) FROM discussion_categories");
      if (parseInt(catCount.rows[0].count, 10) === 0) {
        for (const name of defaultDiscussionCategories) {
          const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await client.query(
            "INSERT INTO discussion_categories (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING",
            [id, name, slug]
          );
        }
      }
      const roleCount = await client.query("SELECT COUNT(*) FROM staff_roles");
      if (parseInt(roleCount.rows[0].count, 10) === 0) {
        for (const role of defaultStaffRoles) {
          const id = `role-${role.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          await client.query(
            "INSERT INTO staff_roles (id, name, badge_label, color) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING",
            [id, role.name, role.badgeLabel, role.color]
          );
        }
      }
      console.log("[Database] PostgreSQL schema initialized cleanly on Neon.");
    } catch (err) {
      initDbPromise = null;
      console.error("[Database] Initialization error:", formatDbError(err));
      throw err;
    } finally {
      client?.release?.();
    }
  })();
  return initDbPromise;
}

// src/utils/avatar.ts
var DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
];
function getRandomAvatar(seed) {
  if (seed && seed.trim()) {
    const clean = seed.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % DEFAULT_AVATARS.length;
    return DEFAULT_AVATARS[index];
  }
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
}

// src/server/businessMemory.ts
var CANONICAL_BUSINESS_IDENTITY = {
  name: "Trek Consultancy",
  brand: "Trek Consultancy Forum",
  tagline: "Premier Corporate Advisory & Enterprise Software Engineering",
  headquarters: "King Fahd Road, Riyadh, Kingdom of Saudi Arabia",
  internationalDesk: "Dhaka, Bangladesh",
  foundedEra: "Established to accelerate Saudi Vision 2030 corporate market expansion",
  foundingStoryEn: "Trek Consultancy was established to empower international entrepreneurs, foreign corporate investors, and technology founders expanding into Saudi Arabia under the Kingdom\u2019s Vision 2030 economic transformation. Headquartered on King Fahd Road in Riyadh with an international liaison desk in Dhaka, Trek Consultancy provides end-to-end, turnkey company formation, accredited MISA licensing, and in-house enterprise software engineering.",
  foundingStoryBn: "\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF (Trek Consultancy) \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09AD\u09BF\u09B6\u09A8 \u09E8\u09E6\u09E9\u09E6 (Vision 2030) \u0985\u09B0\u09CD\u09A5\u09A8\u09C8\u09A4\u09BF\u0995 \u09B0\u09C2\u09AA\u09BE\u09A8\u09CD\u09A4\u09B0\u09C7\u09B0 \u0985\u0982\u09B6 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE, \u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997\u0995\u09BE\u09B0\u09C0 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09B8\u0982\u09B8\u09CD\u09A5\u09BE\u0997\u09C1\u09B2\u09CB\u0995\u09C7 \u09B8\u09CC\u09A6\u09BF \u09AC\u09BE\u099C\u09BE\u09B0\u09C7 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0 \u0993 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09AF\u09BC \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0995\u09B0\u09BE\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09C7 \u09AF\u09BE\u09A4\u09CD\u09B0\u09BE \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C7\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u0995\u09BE\u09B0\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09C7 (\u0995\u09BF\u0982 \u09AB\u09BE\u09B9\u09BE\u09A6 \u09B0\u09CB\u09A1) \u098F\u09AC\u0982 \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u0985\u09AB\u09BF\u09B8 \u09A2\u09BE\u0995\u09BE\u09AF\u09BC \u0985\u09AC\u09B8\u09CD\u09A5\u09BF\u09A4\u0964 \u09B6\u09C1\u09B0\u09C1 \u09A5\u09C7\u0995\u09C7\u0987 \u0986\u09AE\u09B0\u09BE \u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE\u09A7\u09C0\u09A8 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8, MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09BF\u0982 \u098F\u09AC\u0982 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u099F\u09C7\u0995 \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0987\u099E\u09CD\u099C\u09BF\u09A8\u09BF\u09AF\u09BC\u09BE\u09B0\u09BF\u0982 \u09B8\u09C7\u09AC\u09BE \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C7 \u0986\u09B8\u099B\u09BF\u0964",
  officialEmail: "support@trekconsultancy.com",
  slaHours: 24,
  responsibleTeams: {
    saudiAdvisoryAndLegal: "Trek Senior Advisory & Legal Desk in Riyadh (Accredited Saudi corporate lawyers and government liaisons managing MISA licensing, Ministry of Commerce Commercial Registration, Articles of Association, and notary public attestations)",
    saudiAdvisoryAndLegalBn: "\u099F\u09CD\u09B0\u09C7\u0995 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u0993 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995 (\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B8\u09CC\u09A6\u09BF \u0986\u0987\u09A8\u099C\u09C0\u09AC\u09C0 \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u099F\u09BF\u09AE, \u09AF\u09BE\u09B0\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8, \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC \u09A5\u09C7\u0995\u09C7 \u09B8\u09BF\u0986\u09B0, AoA \u098F\u09AC\u0982 \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09B8\u09A4\u09CD\u09AF\u09BE\u09AF\u09BC\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C7\u09A8)",
    techAndEngineering: "In-House Software & Digital Engineering Division (Specializing in enterprise ERPs, cloud architecture, AI automation, and custom web/mobile platforms)",
    techAndEngineeringBn: "\u0987\u09A8-\u09B9\u09BE\u0989\u09B8 \u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u0987\u099E\u09CD\u099C\u09BF\u09A8\u09BF\u09AF\u09BC\u09BE\u09B0\u09BF\u0982 \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8 (\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0987\u0986\u09B0\u09AA\u09BF, \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0, \u098F\u0986\u0987 \u098F\u09AC\u0982 \u0993\u09AF\u09BC\u09C7\u09AC/\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09B8 \u09A4\u09C8\u09B0\u09BF\u09A4\u09C7 \u09AC\u09BF\u09B6\u09C7\u09B7\u099C\u09CD\u099E)",
    proAndVisa: "Government PRO & Visa Liaison Desk (Managing investor visas, executive Iqama issuance & renewals, and Qiwa/Muqeem portals)",
    proAndVisaBn: "\u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AA\u09BF\u0986\u09B0\u0993 \u0993 \u09AD\u09BF\u09B8\u09BE \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u09A1\u09C7\u09B8\u09CD\u0995 (\u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F, \u0987\u0995\u09BE\u09AE\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982 \u098F\u09AC\u0982 Qiwa \u0993 Muqeem \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE)",
    financeAndTax: "Corporate Support, Accounting & Tax Compliance Desk (Managing ZATCA Phase 2 e-invoicing, quarterly VAT returns, IFRS bookkeeping, and statutory audits)",
    financeAndTaxBn: "\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982 \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8 \u09A1\u09C7\u09B8\u09CD\u0995 (ZATCA \u09AB\u09C7\u099C \u09E8 \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982, \u09AD\u09CD\u09AF\u09BE\u099F \u09AB\u09BE\u0987\u09B2\u09BF\u0982, \u0986\u0987\u098F\u09AB\u0986\u09B0\u098F\u09B8 \u09B9\u09BF\u09B8\u09BE\u09AC\u09B0\u0995\u09CD\u09B7\u09A3 \u0993 \u0985\u09A1\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F)",
    realEstate: "Commercial Real Estate Advisory Desk (Certified commercial leases Ejari, prime Riyadh/Jeddah office spaces, and industrial park warehousing)",
    realEstateBn: "\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u09A1\u09C7\u09B8\u09CD\u0995 (Ejari \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8, \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6/\u099C\u09C7\u09A6\u09CD\u09A6\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0985\u09AB\u09BF\u09B8 \u098F\u09AC\u0982 \u0987\u09A8\u09CD\u09A1\u09BE\u09B8\u09CD\u099F\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2 \u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0\u09B9\u09BE\u0989\u09B8 \u09B2\u09BF\u099C)"
  }
};
var CANONICAL_PILLARS = [
  {
    id: 1,
    code: "pillar-1",
    title: "Saudi Business Setup",
    titleBn: "\u09B8\u09CC\u09A6\u09BF \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B8\u09C7\u099F\u0986\u09AA",
    tagline: "100% Foreign Ownership & Turnkey MISA Company Formation",
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.saudiAdvisoryAndLegal,
    turnaroundTime: "2 to 4 weeks total (MISA License: 3-7 days, CR: 2-3 days)",
    highlights: [
      "100% Foreign Ownership under Vision 2030 (no local sponsor required)",
      "Ministry of Investment (MISA) Foreign Investment License issuance",
      "Ministry of Commerce Commercial Registration (CR)",
      "Articles of Association (AoA) ratified via authorized notary public",
      "Corporate Bank Account Opening & National Address (SPL) registration"
    ],
    summaryEn: "Complete turnkey incorporation for international companies and foreign entrepreneurs. Trek Consultancy handles everything from initial document attestation and MISA licensing to Commercial Registration, Chamber of Commerce membership, and corporate banking.",
    summaryBn: "\u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE \u0993 \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u0997\u09C1\u09B2\u09CB\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC \u09B8\u09CC\u09A6\u09BF \u09B8\u09CD\u09AA\u09A8\u09CD\u09B8\u09B0 \u099B\u09BE\u09A1\u09BC\u09BE\u0987 \u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE\u09A7\u09C0\u09A8 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8\u0964 MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8, \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC (MoC) \u09A5\u09C7\u0995\u09C7 \u09B8\u09BF\u0986\u09B0, \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09AA\u09BE\u09AC\u09B2\u09BF\u0995\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 AoA \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u098F\u09AC\u0982 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0996\u09CB\u09B2\u09BE\u0964"
  },
  {
    id: 2,
    code: "pillar-2",
    title: "Software & Digital Engineering",
    titleBn: "\u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8\u09B8",
    tagline: "Enterprise ERPs, Custom Web/Mobile Apps & Cloud Architecture",
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.techAndEngineering,
    turnaroundTime: "Agile sprints; 2-4 weeks MVP delivery",
    highlights: [
      "Custom Enterprise ERP and business workflow automation",
      "Scalable Web & Mobile Application Development (React, TypeScript, Node.js)",
      "Resilient Cloud Infrastructure & Microservices (AWS, Neon PostgreSQL, Docker)",
      "AI-driven customer support chatbots and business process automation"
    ],
    summaryEn: "In-house digital powerhouse designing mission-critical enterprise systems, custom ERPs, high-traffic SaaS portals, and automated business workflows.",
    summaryBn: "\u099F\u09CD\u09B0\u09C7\u0995\u09C7\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u099F\u09C7\u0995 \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C ERP, \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0993\u09AF\u09BC\u09C7\u09AC \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09CD\u09B2\u09BF\u0995\u09C7\u09B6\u09A8, \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0 \u098F\u09AC\u0982 \u098F\u0986\u0987 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8 \u09A4\u09C8\u09B0\u09BF\u0964"
  },
  {
    id: 3,
    code: "pillar-3",
    title: "Visa & Saudi PRO Government Liaison",
    titleBn: "\u09AD\u09BF\u09B8\u09BE \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u09B8\u09C7\u09AC\u09BE",
    tagline: "Investor Visas, Executive Iqamas & Ministry Portals",
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.proAndVisa,
    turnaroundTime: "Visas in 5-10 days; Iqama issuance in 3-5 days",
    highlights: [
      "Investor Visas and General Manager entry permits",
      "Resident Identity (Iqama) issuance and annual renewals",
      "Qiwa and Muqeem governmental portal administration",
      "Saudi Embassy, MOFA, and Chamber of Commerce legal attestations"
    ],
    summaryEn: "Dedicated government liaison desk managing full executive mobility, work authorizations, residency permits, and institutional labor platform compliance in the Kingdom.",
    summaryBn: "\u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F, \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u099F \u0987\u0995\u09BE\u09AE\u09BE (Iqama) \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982 \u098F\u09AC\u0982 Qiwa \u0993 Muqeem \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09B6\u09A4\u09AD\u09BE\u0997 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4\u0995\u09B0\u09A3\u0964"
  },
  {
    id: 4,
    code: "pillar-4",
    title: "Commercial Real Estate Investment",
    titleBn: "\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F",
    tagline: "Certified Office Spaces, Warehousing & Property Advisory",
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.realEstate,
    turnaroundTime: "Office lease verification in 2-4 business days",
    highlights: [
      "Certified commercial lease (Ejari) required for CR & MISA compliance",
      "Prime office spaces across Riyadh (King Fahd Rd, Olaya), Jeddah, and Dammam",
      "Industrial and logistics park warehousing for manufacturing & trade",
      "Foreign property acquisition legal advisory"
    ],
    summaryEn: "Strategic commercial real estate advisory facilitating verified Ejari office registrations, corporate headquarters leasing, and industrial facility procurement.",
    summaryBn: "\u09B0\u09BF\u09AF\u09BC\u09BE\u09A6, \u099C\u09C7\u09A6\u09CD\u09A6\u09BE \u0993 \u09A6\u09BE\u09AE\u09CD\u09AE\u09BE\u09AE\u09C7 \u09B8\u09BF\u0986\u09B0 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C (Ejari), \u0993\u09AF\u09BC\u09BE\u09B0\u09B9\u09BE\u0989\u09B8 \u098F\u09AC\u0982 \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997\u0995\u09BE\u09B0\u09C0\u09A6\u09C7\u09B0 \u09AC\u09C8\u09A7 \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u0995\u09CD\u09B0\u09AF\u09BC \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0964"
  },
  {
    id: 5,
    code: "pillar-5",
    title: "Corporate Support, Accounting & Tax",
    titleBn: "\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F, \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982 \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8",
    tagline: "IFRS Bookkeeping, ZATCA Phase 2 E-Invoicing & Statutory Audits",
    responsibleTeam: CANONICAL_BUSINESS_IDENTITY.responsibleTeams.financeAndTax,
    turnaroundTime: "Monthly bookkeeping cycles; quarterly VAT filings",
    highlights: [
      "Full-cycle monthly accounting and IFRS financial reporting",
      "ZATCA Phase 2 e-invoicing integration and quarterly VAT returns",
      "Mandatory annual statutory audit reports for license renewal",
      "Wage Protection System (WPS) and GOSI social insurance compliance"
    ],
    summaryEn: "Comprehensive corporate financial stewardship ensuring complete regulatory compliance with ZATCA, General Authority for Zakat and Tax, and Ministry of Human Resources.",
    summaryBn: "\u0986\u0987\u098F\u09AB\u0986\u09B0\u098F\u09B8 \u09AE\u09BE\u09A8 \u0985\u09A8\u09C1\u09AF\u09BE\u09AF\u09BC\u09C0 \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2 \u09AE\u09BE\u09B8\u09BF\u0995 \u09AC\u09C1\u0995\u0995\u09BF\u09AA\u09BF\u0982, ZATCA \u09AB\u09C7\u099C \u09E8 \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8, \u09A4\u09CD\u09B0\u09C8\u09AE\u09BE\u09B8\u09BF\u0995 \u09AD\u09CD\u09AF\u09BE\u099F \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u098F\u09AC\u0982 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u09A8\u09AC\u09BE\u09AF\u09BC\u09A8\u09C7 \u099A\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u0985\u09A1\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F\u0964"
  },
  {
    id: 6,
    code: "pillar-6",
    title: "International Business Expansion",
    titleBn: "\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3",
    tagline: "USA LLCs, UK Companies House & Tier-1 Global Banking",
    responsibleTeam: "Trek International Liaison Desk",
    turnaroundTime: "USA/UK incorporation in 3 to 5 business days",
    highlights: [
      "USA entity formation across Delaware, Wyoming, and Florida with IRS EIN",
      "UK Companies House incorporation with London registered office",
      "Canadian federal and provincial corporate registration",
      "Global multi-currency business banking (Mercury, Wise Business, Relay)"
    ],
    summaryEn: "Cross-border entity formation and tier-1 banking facilitation for global founders scaling between North America, Europe, and the Middle East.",
    summaryBn: "\u0986\u09AE\u09C7\u09B0\u09BF\u0995\u09BE\u09AF\u09BC USA LLC \u0993 EIN, \u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u099C\u09CD\u09AF\u09C7 UK Ltd \u098F\u09AC\u0982 \u0995\u09BE\u09A8\u09BE\u09A1\u09BE\u09AF\u09BC \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8\u09B8\u09B9 Mercury \u0993 Wise Business-\u098F \u09AC\u09B9\u09C1-\u09AE\u09C1\u09A6\u09CD\u09B0\u09BE \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u0964"
  }
];
var CANONICAL_QUICK_FACTS = {
  foreignOwnershipPct: "100% foreign ownership permitted under Saudi Vision 2030 (no local sponsor required)",
  misaLicenseDays: "3 to 7 business days for initial MISA Investment License approval",
  crIssuanceDays: "2 to 3 business days for Commercial Registration (CR) from Ministry of Commerce",
  bankAccountDays: "1 to 2 weeks for corporate bank account opening with Saudi tier-1 banks",
  vatStandardPct: "15% standard Value Added Tax (VAT) in Saudi Arabia",
  corporateTaxPct: "20% corporate income tax on foreign-owned entities (subject to approved exemptions/credits)",
  headquartersCity: "Riyadh, Saudi Arabia (King Fahd Road)"
};
var QUERY_STOPWORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "it",
  "its",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "how",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "me",
  "my",
  "your",
  "our",
  "their",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "about",
  "with",
  "by",
  "\u0995\u09BF",
  "\u0995\u09C0",
  "\u0995\u09BF\u09AD\u09BE\u09AC\u09C7",
  "\u0995\u09C7\u09A8",
  "\u0995\u0996\u09A8",
  "\u0995\u09CB\u09A5\u09BE\u09DF",
  "\u0995\u09CB\u09A8",
  "\u098F\u09AC\u0982",
  "\u09AC\u09BE",
  "\u098F\u09B0",
  "\u098F\u0995\u099F\u09BF",
  "\u098F\u0987",
  "\u09B8\u09C7\u0987",
  "\u0986\u09AE\u09BF",
  "\u0986\u09AA\u09A8\u09BF",
  "\u0986\u09AE\u09B0\u09BE"
]);
function extractSignificantTokens(text) {
  return (text || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((t) => t.length > 2 && !QUERY_STOPWORDS.has(t));
}
var cachedMemory = null;
var lastMemoryCompileTime = 0;
var MEMORY_CACHE_TTL_MS = 6e4;
function invalidateBusinessMemoryCache() {
  cachedMemory = null;
  lastMemoryCompileTime = 0;
}
async function compileBusinessMemory(pool2) {
  try {
    const [faqsRes, docsRes, settingsRes, ticketsRes] = await Promise.all([
      pool2.query(`
        SELECT f.id, f.question, f.answer, f.question_bn, f.answer_bn, COALESCE(c.name, 'General') as category
        FROM faqs f
        LEFT JOIN faq_categories c ON f.category_id = c.id
        WHERE f.status = 'published' OR f.status IS NULL OR f.status = 'active'
        ORDER BY f.created_at DESC
      `),
      pool2.query(`SELECT id, title, category, content FROM knowledge_documents WHERE status = 'published' ORDER BY created_at DESC LIMIT 100`),
      pool2.query(`SELECT key, value FROM settings WHERE key IN ('platform', 'ai')`),
      pool2.query(`SELECT id, ticket_number, subject, question, admin_answer, assigned_to FROM support_tickets WHERE admin_answer IS NOT NULL AND TRIM(admin_answer) != '' ORDER BY created_at DESC LIMIT 50`)
    ]);
    const platformSetting = settingsRes.rows.find((r) => r.key === "platform")?.value || {};
    const identity = {
      ...CANONICAL_BUSINESS_IDENTITY,
      name: platformSetting.forumName || CANONICAL_BUSINESS_IDENTITY.name,
      brand: platformSetting.forumName || CANONICAL_BUSINESS_IDENTITY.brand,
      officialEmail: platformSetting.primarySupportEmail || CANONICAL_BUSINESS_IDENTITY.officialEmail,
      slaHours: platformSetting.slaHours || CANONICAL_BUSINESS_IDENTITY.slaHours
    };
    const faqs = (faqsRes.rows || []).map((f) => ({
      id: f.id,
      question: f.question || "",
      questionBn: f.question_bn || "",
      answer: f.answer || "",
      answerBn: f.answer_bn || "",
      category: f.category || "General",
      significantTokens: extractSignificantTokens(`${f.question} ${f.question_bn || ""}`)
    }));
    const knowledgeDocs = (docsRes.rows || []).map((d) => {
      const cleanContent = (d.content || "").slice(0, 1500);
      return {
        id: d.id,
        title: d.title || "Untitled Document",
        category: d.category || "General",
        content: d.content || "",
        summary: cleanContent.slice(0, 280),
        significantTokens: extractSignificantTokens(`${d.title} ${d.category} ${cleanContent}`)
      };
    });
    const verifiedTickets = (ticketsRes.rows || []).map((t) => ({
      id: t.id,
      ticketNumber: t.ticket_number || "",
      subject: t.subject || "",
      question: (t.question || "").slice(0, 200),
      adminAnswer: t.admin_answer || "",
      assignedTo: t.assigned_to || "Senior Consultant",
      significantTokens: extractSignificantTokens(`${t.subject} ${t.question}`)
    }));
    const compiled = {
      version: Date.now(),
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
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
    try {
      await pool2.query(`
        INSERT INTO settings (key, value)
        VALUES ('business_memory', $1::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [JSON.stringify(compiled)]);
    } catch (saveErr) {
      console.warn("[BusinessMemory] Snapshot DB write notice:", saveErr);
    }
    return compiled;
  } catch (err) {
    console.error("[BusinessMemory] Memory compilation error:", err);
    const fallback = {
      version: 1,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
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
async function getOrCompileBusinessMemory(pool2) {
  if (cachedMemory && Date.now() - lastMemoryCompileTime < MEMORY_CACHE_TTL_MS) {
    return cachedMemory;
  }
  try {
    const res = await pool2.query(`SELECT value FROM settings WHERE key = 'business_memory'`);
    if (res.rows.length > 0 && res.rows[0].value) {
      let val = res.rows[0].value;
      if (typeof val === "string") val = JSON.parse(val);
      if (val.identity && val.pillars) {
        cachedMemory = val;
        lastMemoryCompileTime = Date.now();
        return val;
      }
    }
  } catch {
  }
  return await compileBusinessMemory(pool2);
}
function formatBusinessMemoryForPrompt(memory) {
  let prompt = `======================================================================
`;
  prompt += `TREK CONSULTANCY - OFFICIAL BUSINESS MEMORY & VERIFIED KNOWLEDGE CORE:
`;
  prompt += `======================================================================

`;
  prompt += `1. INSTITUTIONAL IDENTITY & ORIGIN:
`;
  prompt += `- Organization: ${memory.identity.name} (${memory.identity.tagline})
`;
  prompt += `- Head Office: ${memory.identity.headquarters}
`;
  prompt += `- International Liaison Office: ${memory.identity.internationalDesk}
`;
  prompt += `- Contact Email: ${memory.identity.officialEmail} | SLA: ${memory.identity.slaHours} Hours
`;
  prompt += `- Founding Origin & Mission: ${memory.identity.foundingStoryEn}

`;
  prompt += `2. OPERATIONAL RESPONSIBILITIES & TEAMS (WHO IS RESPONSIBLE):
`;
  prompt += `- Saudi Company Formation, MISA Licenses & CR: ${memory.identity.responsibleTeams.saudiAdvisoryAndLegal}
`;
  prompt += `- Software & Digital Engineering: ${memory.identity.responsibleTeams.techAndEngineering}
`;
  prompt += `- Government PRO & Investor Visas: ${memory.identity.responsibleTeams.proAndVisa}
`;
  prompt += `- Corporate Accounting, ZATCA & Tax: ${memory.identity.responsibleTeams.financeAndTax}
`;
  prompt += `- Commercial Real Estate & Ejari Leases: ${memory.identity.responsibleTeams.realEstate}

`;
  prompt += `3. THE 6 STRATEGIC SERVICE PILLARS:
`;
  memory.pillars.forEach((p) => {
    prompt += `[Pillar ${p.id}: ${p.title}]
`;
    prompt += `  - Tagline: ${p.tagline}
`;
    prompt += `  - Turnaround Time: ${p.turnaroundTime}
`;
    prompt += `  - Responsible Team: ${p.responsibleTeam}
`;
    prompt += `  - Highlights: ${p.highlights.join("; ")}
`;
    prompt += `  - Summary: ${p.summaryEn}

`;
  });
  prompt += `4. FREQUENTLY ASKED QUESTIONS & ANSWERS (${memory.faqs.length} Verified Entries):
`;
  memory.faqs.forEach((f, i) => {
    prompt += `[FAQ #${i + 1} | Category: ${f.category}]
`;
    prompt += `Q: ${f.question}
`;
    if (f.questionBn) prompt += `Q (BN): ${f.questionBn}
`;
    prompt += `A: ${f.answer}

`;
  });
  if (memory.knowledgeDocs.length > 0) {
    prompt += `5. UPLOADED BUSINESS KNOWLEDGE DOCUMENTS (${memory.knowledgeDocs.length} Chunks):
`;
    memory.knowledgeDocs.slice(0, 20).forEach((d, i) => {
      prompt += `[Doc #${i + 1}: ${d.title} (${d.category})]
${d.content.slice(0, 600)}

`;
    });
  }
  if (memory.verifiedTickets.length > 0) {
    prompt += `6. VERIFIED CONSULTANT RESOLUTIONS (${memory.verifiedTickets.length} Resolved Cases):
`;
    memory.verifiedTickets.slice(0, 10).forEach((t) => {
      prompt += `[Case #${t.ticketNumber}: "${t.subject}"]
Inquiry: ${t.question}
Verified Answer: ${t.adminAnswer}
(By: ${t.assignedTo})

`;
    });
  }
  prompt += `======================================================================
`;
  return prompt;
}
function synthesizeBusinessMemoryAnswer({
  cleanMsg,
  userLang = "en",
  memory,
  conversationHistory = []
}) {
  const lower = cleanMsg.toLowerCase().trim();
  const tokens = extractSignificantTokens(lower);
  const hasArabic = /[\u0600-\u06FF]/.test(cleanMsg);
  const isBanglish = /\b(ki|kivabe|ki\s*vabe|kivabhe|ki\s*ki|ki\s*hobe|ki\s*kora|lagbe|lagbo|lage|korte|korbo|korben|koren|korle|kore|kora|korche|korchen|chai|chan|chassi|ache|achhe|ase|asi|asen|nai|nay|nei|kothay|kothai|keno|kemon|amake|apnake|apnader|apnar|amader|amar|tader|tar|koto|shomoy|somoy|taka|khoroch|khroch|khulbo|khulte|shuru|suru|bolen|bolben|janan|janaben|sahajjo|sahayyo|sahata|bujhte|parbo|parben|pabo|paben|hobe|hoise|hoyeche|shob|sob|ektu|bepare|shomporke|somporke|thake|thakbe|deben|dite|apnara|amra|tara|dorkar|kichu|kisu|konta|konti|sathe|shathe)\b/i.test(cleanMsg);
  const isBn = userLang === "bn" || /[\u0980-\u09FF]/.test(cleanMsg) || isBanglish;
  const isAr = userLang === "ar" || hasArabic;
  const isOriginQuery = /(when (did|was) (this|your|the) (business|company|firm|trek|platform) (start|started|founded|establish|established|began|created)|how long (have you been|has this business been|has trek been|has the company been)|history of (trek|this business|your company)|kobe shuru|kobe protisthito|shuru hoyeche kobe|kobe theke|start date|foundation year|business start year|কবে শুরু|কখন শুরু|কবে প্রতিষ্ঠা|প্রতিষ্ঠা কবে|প্রতিষ্ঠার ইতিহাস|ব্যবসায়ের ইতিহাস|متى (بدأت|تأسست|أنشئت|انطلقت)|تاريخ (الشركة|تريك|التأسيس)|سنة التأسيس)/i.test(lower) || (lower.includes("when") || lower.includes("kobe") || lower.includes("how long") || lower.includes("\u0995\u09AC\u09C7") || lower.includes("\u0995\u0996\u09A8") || lower.includes("\u0645\u062A\u0649")) && (lower.includes("business") || lower.includes("company") || lower.includes("firm") || lower.includes("trek") || lower.includes("\u09AC\u09CD\u09AF\u09AC\u09B8\u09BE") || lower.includes("\u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF") || lower.includes("\u09AA\u09CD\u09B0\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8") || lower.includes("\u0634\u0631\u0643\u0629") || lower.includes("\u062A\u0623\u0633\u064A\u0633")) && (lower.includes("start") || lower.includes("found") || lower.includes("establish") || lower.includes("shuru") || lower.includes("\u09B6\u09C1\u09B0\u09C1") || lower.includes("\u09AA\u09CD\u09B0\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE") || lower.includes("\u0628\u062F\u0623\u062A") || lower.includes("\u062A\u0623\u0633\u0633\u062A"));
  if (isOriginQuery) {
    if (isAr) {
      return {
        reply: `### \u062A\u0631\u064A\u0643 \u0644\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u2014 \u0627\u0644\u062E\u0644\u0641\u064A\u0629 \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629 \u0648\u0631\u0624\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 2030

\u062A\u0623\u0633\u0633\u062A **${memory.identity.name}** \u0644\u062A\u0645\u0643\u064A\u0646 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u064A\u0646 \u0645\u0646 \u0627\u0644\u062A\u0648\u0633\u0639 \u0627\u0644\u0645\u0624\u0633\u0633\u064A \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0641\u064A \u0625\u0637\u0627\u0631 **\u0631\u0624\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 2030**.

- **\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0631\u0626\u064A\u0633\u064A**: ${memory.identity.headquarters}
- **\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u062F\u0648\u0644\u064A**: ${memory.identity.internationalDesk}
- **\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A**: \u062A\u0648\u0641\u064A\u0631 \u062D\u0644\u0648\u0644 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0644\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0628\u0645\u0644\u0643\u064A\u0629 \u0623\u062C\u0646\u0628\u064A\u0629 100% \u0628\u0645\u0648\u062C\u0628 \u062A\u0631\u062E\u064A\u0635 MISA\u060C \u0648\u0641\u062A\u062D \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629 \u0644\u062F\u0649 \u0628\u0646\u0648\u0643 \u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0623\u0648\u0644\u0649\u060C \u0648\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u062A\u0637\u0648\u0631\u0629.

---
> **\u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A:** \u064A\u0631\u0627\u0641\u0642 \u0641\u0631\u064A\u0642\u0646\u0627 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646 \u0639\u0628\u0631 \u062C\u0645\u064A\u0639 \u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u062A\u0631\u062E\u064A\u0635 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0645\u0647\u0646\u064A\u0629 \u062A\u0627\u0645\u0629.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### \u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u2014 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AA\u09B0\u09BF\u099A\u09BF\u09A4\u09BF \u0993 \u09AD\u09BF\u09B6\u09A8 \u09E8\u09E6\u09E9\u09E6

**${memory.identity.name}** \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 **\u09AD\u09BF\u09B6\u09A8 \u09E8\u09E6\u09E9\u09E6 (Vision 2030)** \u0985\u09B0\u09CD\u09A5\u09A8\u09C8\u09A4\u09BF\u0995 \u09B0\u09C2\u09AA\u09BE\u09A8\u09CD\u09A4\u09B0\u09C7\u09B0 \u0985\u0982\u09B6 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE, \u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997\u0995\u09BE\u09B0\u09C0 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09A6\u09B2\u0997\u09C1\u09B2\u09CB\u0995\u09C7 \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09AC\u09BE\u099C\u09BE\u09B0\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3\u09C7 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0995\u09B0\u09BE\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09C7 \u09AF\u09BE\u09A4\u09CD\u09B0\u09BE \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C7\u0964

- **\u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u0995\u09BE\u09B0\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC**: ${memory.identity.headquarters}
- **\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u0985\u09AB\u09BF\u09B8**: ${memory.identity.internationalDesk}
- **\u09AE\u09C2\u09B2 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF**: \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0995\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u099F\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC \u09B8\u09CD\u09AA\u09A8\u09CD\u09B8\u09B0 \u099B\u09BE\u09A1\u09BC\u09BE\u0987 **\u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE\u09A7\u09C0\u09A8 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8**, MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09BF\u0982, \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR) \u098F\u09AC\u0982 \u0987\u09A8-\u09B9\u09BE\u0989\u09B8 \u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8 \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9 \u0995\u09B0\u09BE\u0964

---
> **\u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u09A1\u09C7\u09B8\u09CD\u0995:** \u09B6\u09C1\u09B0\u09C1 \u09A5\u09C7\u0995\u09C7\u0987 \u0986\u09AE\u09B0\u09BE \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09AE\u09BE\u09A8 \u09AC\u099C\u09BE\u09AF\u09BC \u09B0\u09C7\u0996\u09C7 \u09B6\u09A4 \u09B6\u09A4 \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u0995\u09C7 \u09B8\u09CC\u09A6\u09BF \u0993 \u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09AE\u09BE\u09B0\u09CD\u0995\u09C7\u099F\u09C7 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF\u09B7\u09CD\u09A0\u09BF\u09A4 \u09B9\u09A4\u09C7 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C7 \u0986\u09B8\u099B\u09BF\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### Trek Consultancy \u2014 Institutional Background & Vision 2030

**${memory.identity.name}** was established to empower international enterprises, corporate investors, and technology founders expanding into the Kingdom of Saudi Arabia under **Saudi Vision 2030**.

- **Headquarters**: ${memory.identity.headquarters}
- **International Liaison Desk**: ${memory.identity.internationalDesk}
- **Core Mission**: Providing turnkey corporate market entry\u2014facilitating **100% foreign-owned company incorporation** under MISA, commercial tier-1 banking, government relations, and in-house enterprise digital engineering.

---
> **Executive Advisory:** Trek Consultancy continuously guides global entrepreneurs across North America, Europe, Asia, and the GCC through seamless market entry and commercial licensing.`,
      source: "AI"
    };
  }
  const isResponsibilityQuery = /(who is responsible (for|to)|who (handles|manages|takes care of|does|is in charge of) (this|the)? (setup|company formation|licensing|process|work)|who are you|who runs this|who will do (the|my) setup|kara ei kaj kore|ke dayitto palon kore|kar dayitto|ke kore dibe|who is managing|responsible person|কার দায়িত্ব|কার দায়িত্ব|দায়িত্ব কার|দায়িত্ব কার|কে দায়িত্বপ্রাপ্ত|কে দায়িত্বপ্রাপ্ত|কে পরিচালনা করে|কারা করে|من (المسؤول|يتولى|يدير|يقوم|ينفذ)|مسؤولية|من أنتم|من يدير هذا)/i.test(lower) || (lower.includes("who") || lower.includes("ke") || lower.includes("kara") || lower.includes("\u0995\u09BE\u09B0") || lower.includes("\u0995\u09C7") || lower.includes("\u0645\u0646")) && (lower.includes("responsible") || lower.includes("dayitto") || lower.includes("handles") || lower.includes("manages") || lower.includes("\u09A6\u09BE\u09DF\u09BF\u09A4\u09CD\u09AC") || lower.includes("\u09A6\u09BE\u09AF\u09BC\u09BF\u09A4\u09CD\u09AC") || lower.includes("\u0645\u0633\u0624\u0648\u0644")) && (lower.includes("setup") || lower.includes("company") || lower.includes("business") || lower.includes("process") || lower.includes("\u09B8\u09C7\u099F\u0986\u09AA") || lower.includes("\u09AC\u09CD\u09AF\u09AC\u09B8\u09BE") || lower.includes("\u062A\u0623\u0633\u064A\u0633"));
  if (isResponsibilityQuery) {
    if (isAr) {
      return {
        reply: `### \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u2014 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0627\u0644\u0623\u0648\u0644

\u062A\u062A\u0645 \u0625\u062F\u0627\u0631\u0629 \u0639\u0645\u0644\u064A\u0627\u062A \u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 **\u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0644\u062A\u0631\u064A\u0643 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636**.

- **\u0645\u062D\u0627\u0645\u0648\u0646 \u0648\u0645\u0633\u062A\u0634\u0627\u0631\u0648\u0646 \u0645\u0639\u062A\u0645\u062F\u0648\u0646**: \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0645\u0639 **\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 (MISA)** \u0648**\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u0629 (MoC)** \u0648\u0627\u0644\u0645\u0648\u062B\u0642\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0644\u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u062F \u0627\u0644\u062A\u0623\u0633\u064A\u0633 \u0648\u0631\u062E\u0635\u0629 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631.
- **\u0641\u0631\u064A\u0642 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629**: \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0648\u0637\u0646\u064A (SPL) \u0648\u0641\u062A\u062D \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0628\u0646\u0643\u064A\u0629 \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0644\u062F\u0649 \u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 (ZATCA).
- **\u0645\u062F\u064A\u0631 \u062D\u0633\u0627\u0628\u0627\u062A \u062A\u0646\u0641\u064A\u0630\u064A \u0645\u062E\u0635\u0635**: \u0645\u0633\u062A\u0634\u0627\u0631 \u0623\u0648\u0644 \u0645\u062A\u062E\u0635\u0635 \u064A\u062A\u0627\u0628\u0639 \u0645\u0644\u0641\u0643 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0648\u064A\u0642\u062F\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0645\u0631\u0629 \u0639\u0646\u062F \u0643\u0644 \u0645\u0631\u062D\u0644\u0629 \u0646\u0638\u0627\u0645\u064A\u0629.

---
> **\u0627\u0644\u062A\u0632\u0627\u0645 \u0645\u0624\u0633\u0633\u064A:** \u064A\u062A\u0648\u0644\u0649 \u0641\u0631\u064A\u0642\u0646\u0627 \u0627\u0644\u0645\u0624\u0633\u0633\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0645\u0646 \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0623\u0648\u0644\u0649 \u0648\u062D\u062A\u0649 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0643\u0627\u0645\u0644.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### \u0985\u09AA\u09BE\u09B0\u09C7\u09B6\u09A8\u09BE\u09B2 \u09A6\u09BE\u09AF\u09BC\u09BF\u09A4\u09CD\u09AC \u2014 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u0993 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995

\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8 \u0993 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09BF\u0982 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u099F\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF **\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09B8\u09CD\u09A5 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u0993 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995**-\u098F\u09B0 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u0995\u09CD\u09B7 \u09A6\u09BE\u09AF\u09BC\u09BF\u09A4\u09CD\u09AC\u09C7 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09BF\u09A4 \u09B9\u09AF\u09BC\u0964

- **\u09B8\u09A8\u09A6\u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4 \u09B8\u09CC\u09A6\u09BF \u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u0986\u0987\u09A8\u099C\u09C0\u09AC\u09C0 \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u099F\u09BF\u09AE**: \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF **Ministry of Investment (MISA)** \u0993 **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC\u09C7\u09B0 (Ministry of Commerce)** \u09B8\u09BE\u09A5\u09C7 \u09B8\u09AE\u09A8\u09CD\u09AC\u09AF\u09BC \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8, \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR) \u098F\u09AC\u0982 \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09AA\u09BE\u09AC\u09B2\u09BF\u0995 \u09B8\u09A4\u09CD\u09AF\u09BE\u09AF\u09BC\u09A8 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C7\u09A8\u0964
- **\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982 \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u09AC\u09BF\u09AD\u09BE\u0997**: \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 (SPL) \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8, \u099F\u09BF\u09AF\u09BC\u09BE\u09B0-\u09E7 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993 ZATCA \u09AB\u09C7\u099C \u09E8 \u09AD\u09CD\u09AF\u09BE\u099F \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C7\u09A8\u0964
- **\u09A1\u09C7\u09A1\u09BF\u0995\u09C7\u099F\u09C7\u09A1 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F**: \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AC\u09BF\u0995 \u09AB\u09BE\u0987\u09B2 \u09A4\u09A4\u09CD\u09A4\u09CD\u09AC\u09BE\u09AC\u09A7\u09BE\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u0995\u099C\u09A8 \u09B8\u09C1\u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09A8\u09BF\u09AF\u09BC\u09CB\u099C\u09BF\u09A4 \u09A5\u09BE\u0995\u09C7\u09A8\u0964

---
> **\u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09A8\u09BF\u09B6\u09CD\u099A\u09AF\u09BC\u09A4\u09BE:** \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09A8\u09A6\u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4 \u09AA\u09C7\u09B6\u09BE\u09A6\u09BE\u09B0 \u09A6\u09B2\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u0995\u09CD\u09B7 \u09A6\u09BE\u09AF\u09BC\u09BF\u09A4\u09CD\u09AC\u09C7 \u099F\u09BE\u09B0\u09CD\u09A8\u0995\u09BF \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09B8\u09C1\u099A\u09BE\u09B0\u09C1\u09AD\u09BE\u09AC\u09C7 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09AF\u09BC\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### Operational Responsibility \u2014 Senior Advisory & Legal Desk

Company setup and foreign investment licensing are managed directly by **Trek Consultancy\u2019s Senior Advisory & Legal Desk in Riyadh**.

- **Accredited Saudi Corporate Lawyers & Government Liaisons**: Directly interface with the **Ministry of Investment (MISA)**, the **Ministry of Commerce (MoC)**, and authorized Saudi notaries to ratify your 100% foreign ownership license, Commercial Registration (CR), and Articles of Association (AoA).
- **Corporate Banking & Tax Specialists**: Oversee commercial National Address (SPL) registration, tier-1 corporate bank account opening, and ZATCA Phase 2 tax compliance.
- **Dedicated Senior Account Manager**: A designated senior consultant coordinates your entire file, keeping you updated at every statutory milestone.

---
> **Institutional Commitment:** An accredited corporate legal and advisory team takes end-to-end institutional responsibility for your business setup from inception to full commercial activation.`,
      source: "AI"
    };
  }
  const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|assalamu\s*alaikum|salam|hola|halo|হ্যালো|হাই|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*আছেন|কেমন\s*আসেন|kemon\s*achen|নমস্কার|আদাব|مرحبا|أهلا|اهلا|السلام عليكم|سلام|صباح الخير|مساء الخير|حياك الله|تحياتي)(\s*!|\s*\?|\s*$|\s+.*)/i.test(cleanMsg);
  if (isGreeting) {
    if (isAr) {
      return {
        reply: `### \u0645\u0631\u062D\u0628\u0627 \u0628\u0643\u0645 \u0641\u064A \u062A\u0631\u064A\u0643 \u0644\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u2014 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A

\u0623\u0647\u0644\u0627\u064B \u0628\u0643! \u0623\u0646\u0627 \u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0622\u0644\u064A \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0644\u0640 **${memory.identity.brand}**. \u064A\u0633\u0639\u062F\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629 \u0648\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0644\u062F\u064A\u0646\u0627:

- **\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629**: \u0645\u0644\u0643\u064A\u0629 \u0623\u062C\u0646\u0628\u064A\u0629 100%\u060C \u0631\u062E\u0635\u0629 MISA\u060C \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u060C \u0648\u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0628\u0646\u0643\u064A\u0629.
- **\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0648\u0627\u0644\u0631\u0642\u0645\u064A\u0629**: \u0623\u0646\u0638\u0645\u0629 ERP \u0633\u062D\u0627\u0628\u064A\u0629\u060C \u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0647\u0627\u062A\u0641\u060C \u0648\u0627\u0644\u0645\u0646\u0635\u0627\u062A \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629.
- **\u0627\u0644\u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 (PRO)**: \u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646\u060C \u0627\u0644\u0625\u0642\u0627\u0645\u0627\u062A\u060C \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0645\u0646\u0635\u062A\u064A \u0642\u0648\u0649 \u0648\u0645\u0642\u064A\u0645.
- **\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629**: \u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 (\u0625\u064A\u062C\u0627\u0631\u064A) \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A.
- **\u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628**: \u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0644\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \u0645\u0646 \u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 (ZATCA)\u060C \u0648\u0645\u0633\u0643 \u0627\u0644\u062F\u0641\u0627\u062A\u0631\u060C \u0648\u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A.

---
> **\u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u0627 \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F** \u0644\u0627 \u062A\u062A\u0631\u062F\u062F \u0641\u064A \u0637\u0631\u062D \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062D\u0648\u0644 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u0645\u062F\u062F \u0627\u0644\u0646\u0638\u0627\u0645\u064A\u0629 \u0648\u0627\u0644\u0631\u0633\u0648\u0645.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### \u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09A4\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE \u2014 \u098F\u0995\u09CD\u09B8\u09BF\u0995\u09BF\u0989\u099F\u09BF\u09AD \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF

\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09B0 / \u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! **${memory.identity.brand}**-\u098F \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u0986\u09AE\u09BF \u099F\u09CD\u09B0\u09C7\u0995\u09C7\u09B0 \u098F\u0986\u0987 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AE\u09C7\u09AE\u09CB\u09B0\u09BF\u09B0 \u0986\u09B2\u09CB\u0995\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4:

- **\u09B8\u09CC\u09A6\u09BF \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B8\u09C7\u099F\u0986\u09AA**: \u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE, MISA \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8, \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR) \u0993 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F
- **\u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8\u09B8**: \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C ERP, \u0993\u09AF\u09BC\u09C7\u09AC/\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09B8 \u098F\u09AC\u0982 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0
- **\u09AD\u09BF\u09B8\u09BE \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u09B8\u09C7\u09AC\u09BE**: \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F \u098F\u09AC\u0982 \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u099F \u0987\u0995\u09BE\u09AE\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982
- **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F**: \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C (Ejari) \u098F\u09AC\u0982 \u09B6\u09BF\u09B2\u09CD\u09AA\u09BE\u099E\u09CD\u099A\u09B2 \u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0\u09B9\u09BE\u0989\u09B8 \u09B2\u09BF\u099C
- **\u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8**: IFRS \u09AC\u09C1\u0995\u0995\u09BF\u09AA\u09BF\u0982, ZATCA \u09AB\u09C7\u099C \u09E8 \u09AD\u09CD\u09AF\u09BE\u099F \u098F\u09AC\u0982 \u09B8\u0982\u09AC\u09BF\u09A7\u09BF\u09AC\u09A6\u09CD\u09A7 \u0985\u09A1\u09BF\u099F

---
> **\u0986\u099C \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?** \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C1\u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AC\u09BE \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC\u09A4\u09BE \u09B2\u09BF\u0996\u09C1\u09A8, \u0986\u09AE\u09BF \u098F\u0996\u09A8\u0987 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09A4\u09A5\u09CD\u09AF \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9 \u0995\u09B0\u09AC!`,
        source: "AI"
      };
    }
    return {
      reply: `### Welcome to Trek Consultancy \u2014 Executive Advisory

Hello and welcome to **${memory.identity.brand}**! I am your AI Support Consultant. I am equipped with our verified business knowledge to assist you across our strategic service pillars:

- **Saudi Business Setup**: 100% foreign ownership, MISA licensing, Commercial Registration (CR), and tier-1 corporate banking
- **Software & Digital Engineering**: Custom enterprise ERPs, web & mobile applications, and resilient cloud systems
- **Visa & PRO Government Liaison**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem portals
- **Commercial Real Estate**: Verified Ejari office leases and industrial park warehousing
- **Corporate Support & Tax**: ZATCA Phase 2 e-invoicing, IFRS bookkeeping, and statutory audits

---
> **How may we assist you today?** Feel free to ask any question about requirements, turnaround timelines, fees, or our process!`,
      source: "AI"
    };
  }
  const isContactQuery = /(whatsapp|call you|call me|phone number|contact number|talk to (a )?human|talk to (a )?consultant|talk to someone|speak to (a )?human|speak to (a )?consultant|speak to advisor|meet in person|contact details|office address|location|হোয়াটসঅ্যাপ|ফোন নম্বর|যোগাযোগ|কথা বলতে চাই|হোয়াটসঅ্যাপে|অফিস কোথায়|ঠিকানা|কল করবেন|কল দিতে চাই|কথা বলব|দেখা করতে চাই|নাম্বার|واتساب|واتس اب|رقم الهاتف|اتصال|تواصل|مكتبكم|عنوانكم|مقركم|التحدث مع|استشارة مباشرة)/i.test(lower);
  if (isContactQuery) {
    if (isAr) {
      return {
        reply: `### \u0637\u0644\u0628 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u2014 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u0623\u0648\u0644

\u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0637\u0644\u0628\u0643 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 **\u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0644\u062A\u0631\u064A\u0643 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636** \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629.

- **\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0627\u0644\u0631\u0633\u0645\u064A**: ${memory.identity.officialEmail}
- **\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629**: ${memory.identity.headquarters}
- **\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u062F\u0648\u0644\u064A**: ${memory.identity.internationalDesk}

---
> **\u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0641\u0648\u0631\u064A:** \u0634\u0627\u0631\u0643 \u0631\u0642\u0645 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0623\u0648 \u0627\u0644\u0647\u0627\u062A\u0641 \u0647\u0646\u0627 \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629\u060C \u0648\u0633\u064A\u0642\u0648\u0645 \u0645\u0633\u062A\u0634\u0627\u0631 \u062A\u0646\u0641\u064A\u0630\u064A \u0623\u0648\u0644 \u0628\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0633\u062A\u0634\u0627\u0631\u062A\u0643.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u0993 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u2014 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u09A1\u09C7\u09B8\u09CD\u0995

\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09C7\u09B0 **\u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u0993 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995\u09C7** \u0985\u0997\u09CD\u09B0\u09BE\u09A7\u09BF\u0995\u09BE\u09B0 \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE\u09AD\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964

- **\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u0987\u09AE\u09C7\u0987\u09B2**: ${memory.identity.officialEmail}
- **\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC \u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u0995\u09BE\u09B0\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC**: ${memory.identity.headquarters}
- **\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u0985\u09AB\u09BF\u09B8**: ${memory.identity.internationalDesk}

---
> **\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF:** \u0986\u09AA\u09A8\u09BE\u09B0 \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09BE \u09B9\u09CB\u09AF\u09BC\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u098F\u0996\u09BE\u09A8\u09C7 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8, \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u098F\u0995\u099C\u09A8 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u0997\u09BE\u0987\u09A1\u09B2\u09BE\u0987\u09A8 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09AC\u09C7\u09A8\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### Direct Consultation Request \u2014 Senior Advisory Desk

I have notified our **Senior Advisory & Legal Desk in Riyadh** to prioritize your consultation.

- **Official Corporate Email**: ${memory.identity.officialEmail}
- **Saudi Arabia Headquarters**: ${memory.identity.headquarters}
- **International Liaison Desk**: ${memory.identity.internationalDesk}

---
> **Personalized Briefing:** Share your direct WhatsApp or phone number right here in this chat, and an Executive Senior Consultant will reach out to schedule your personalized consultation.`,
      source: "AI"
    };
  }
  let bestFaq = null;
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
      if (score > bestFaqScore && matchRatio >= 0.5) {
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
      source: "FAQ"
    };
  }
  const isPillar1 = /(saudi|misa|cr|commercial registration|company formation|incorporat|foreign ownership|সৌদি|কোম্পানি গঠন|ব্যবসা শুরু|লাইসেন্স|تأسيس|شركة|شركات|استثمار|ميزا|سجل تجاري|ملكية أجنبية|رخصة استثمار)/i.test(lower);
  const isPillar2 = /(software|digital|app|website|erp|code|react|node|developer|সফটওয়্যার|ওয়েবসাইট|অ্যাপ|প্রযুক্তি|برمجة|تطبيق|موقع|سوفتوير|نظام|تقنية|تطوير)/i.test(lower);
  const isPillar3 = /(visa|iqama|pro|work permit|qiwa|muqeem|ভিসা|ইকামা|ওয়ার্ক পারমিট|পিআরও|تأشيرة|فيزا|إقامة|اقامة|قوى|مقيم|جوازات|نقل كفالة)/i.test(lower);
  const isPillar4 = /(real estate|property|ejari|office space|warehouse|রিয়েল এস্টেট|অফিস|জমি|ফ্ল্যাট|বাণিজ্যিক প্রপার্টি|عقار|مكتب|إيجار|ايجار|ايجاري|مستودع|أراضي)/i.test(lower);
  const isPillar5 = /(accounting|tax|vat|zatca|audit|bookkeeping|ট্যাক্স|ভ্যাট|হিসাব|অডিট|محاسبة|ضرائب|ضريبة|زكاة|فاتورة|فوترة|مراجعة|تدقيق)/i.test(lower);
  const isPillar6 = /(usa|uk|canada|delaware|wyoming|mercury|wise|আন্তর্জাতিক|আমেরিকা|ইউকে|أمريكا|امريكا|بريطانيا|كندا|دولي|عالمي|ديلوير|وايومنغ)/i.test(lower);
  if (isPillar1) {
    const p1 = memory.pillars[0];
    if (isAr) {
      return {
        reply: `### \u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 (MISA) \u2014 \u062F\u0644\u064A\u0644 \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0645\u062A\u0643\u0627\u0645\u0644

\u0641\u064A \u0625\u0637\u0627\u0631 \u0631\u0624\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 2030\u060C \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u062A\u0623\u0633\u064A\u0633 \u0643\u064A\u0627\u0646\u0627\u062A\u0647\u0645 \u0628\u0645\u0644\u0643\u064A\u0629 \u0623\u062C\u0646\u0628\u064A\u0629 100% \u062F\u0648\u0646 \u0627\u0634\u062A\u0631\u0627\u0637 \u0634\u0631\u064A\u0643 \u0623\u0648 \u0643\u0641\u064A\u0644 \u0633\u0639\u0648\u062F\u064A \u0645\u062D\u0644\u064A.

- **\u0645\u0644\u0643\u064A\u0629 \u0623\u062C\u0646\u0628\u064A\u0629 100%**: \u064A\u062D\u062A\u0641\u0638 \u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631 \u0627\u0644\u0623\u062C\u0646\u0628\u064A \u0628\u0643\u0627\u0645\u0644 \u0627\u0644\u062D\u0635\u0635 \u0648\u0627\u0644\u0633\u064A\u0637\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629.
- **\u0631\u062E\u0635\u0629 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 (MISA)**: \u0625\u0635\u062F\u0627\u0631 \u0633\u0631\u064A\u0639 \u0644\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0639\u0628\u0631 \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 (${p1.turnaroundTime}).
- **\u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A (CR)**: \u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u0634\u0631\u0643\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0646 \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u0629.
- **\u0639\u0642\u062F \u0627\u0644\u062A\u0623\u0633\u064A\u0633 (AoA)**: \u0635\u064A\u0627\u063A\u0629 \u0648\u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u062F \u0627\u0644\u062A\u0623\u0633\u064A\u0633 \u0639\u0628\u0631 \u0643\u0627\u062A\u0628 \u0639\u062F\u0644 \u0645\u0639\u062A\u0645\u062F.
- **\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0648\u0637\u0646\u064A (SPL)**: \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0648\u0637\u0646\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0648\u0641\u062A\u062D \u062D\u0633\u0627\u0628 \u0628\u0646\u0643\u064A \u0644\u0644\u0634\u0631\u0643\u0627\u062A \u0644\u062F\u0649 \u0628\u0646\u0648\u0643 \u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0623\u0648\u0644\u0649.

---
> **\u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A:** \u064A\u062A\u0648\u0644\u0649 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0644\u062A\u0631\u064A\u0643 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0625\u062F\u0627\u0631\u0629 \u0643\u0627\u0641\u0629 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062D\u062A\u0649 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u062A\u0627\u0645.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### ${p1.titleBn} (${p1.title}) \u2014 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u099F\u09BE\u09B0\u09CD\u09A8\u0995\u09BF \u0997\u09BE\u0987\u09A1\u09B2\u09BE\u0987\u09A8

\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09AD\u09BF\u09B6\u09A8 \u09E8\u09E6\u09E9\u09E6-\u098F\u09B0 \u0985\u09A7\u09C0\u09A8\u09C7 \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC \u09B8\u09CC\u09A6\u09BF \u09B8\u09CD\u09AA\u09A8\u09CD\u09B8\u09B0 \u099B\u09BE\u09A1\u09BC\u09BE\u0987 \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09B0\u09BE \u09E7\u09E6\u09E6% \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3 \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u09B2\u09BE\u09AD \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964

- **\u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE**: \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0987\u0995\u09C1\u0987\u099F\u09BF \u098F\u09AC\u0982 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09A8\u09BF\u09AF\u09BC\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3 \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997\u0995\u09BE\u09B0\u09C0\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09A5\u09BE\u0995\u09AC\u09C7\u0964
- **MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8**: \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC\u09C7 \u0986\u09AC\u09C7\u09A6\u09A8\u09C7\u09B0 \u09AA\u09C2\u09B0\u09CD\u09AC\u09C7 Ministry of Investment \u09A5\u09C7\u0995\u09C7 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u09B8\u0982\u0997\u09CD\u09B0\u09B9 (${p1.turnaroundTime})\u0964
- **\u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR)**: \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC (MoC) \u09A5\u09C7\u0995\u09C7 \u0985\u09AB\u09BF\u09B8\u09BF\u09AF\u09BC\u09BE\u09B2 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8\u09AA\u09A4\u09CD\u09B0 \u0987\u09B8\u09CD\u09AF\u09C1\u0964
- **AoA \u0993 \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09AA\u09BE\u09AC\u09B2\u09BF\u0995**: \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09CB\u099F\u09BE\u09B0\u09BF\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09B0\u09CD\u099F\u09BF\u0995\u09C7\u09B2\u09B8 \u0985\u09AB \u0985\u09CD\u09AF\u09BE\u09B8\u09CB\u09B8\u09BF\u09AF\u09BC\u09C7\u09B6\u09A8 \u0986\u0987\u09A8\u0997\u09A4 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964
- **\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8**: \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09C7 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 (SPL) \u098F\u09AC\u0982 \u099F\u09BF\u09AF\u09BC\u09BE\u09B0-\u09E7 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u0964

---
> **\u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995:** \u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u0993 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u09A1\u09C7\u09B8\u09CD\u0995 \u098F\u0987 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u099F\u09BF \u099F\u09BE\u09B0\u09CD\u09A8\u0995\u09BF \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C7\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### ${p1.title} \u2014 Turnkey Institutional Advisory

Under Saudi Vision 2030, foreign investors and global companies can establish fully owned entities in the Kingdom without requiring a local Saudi national sponsor.

- **100% Foreign Ownership**: Foreign investors retain complete equity and full corporate control under Vision 2030.
- **MISA Investment License**: Expedited licensing through the Ministry of Investment (${p1.turnaroundTime}).
- **Commercial Registration (CR)**: Corporate registration issued directly by the Ministry of Commerce.
- **Articles of Association (AoA)**: Legalized through an accredited Saudi notary public.
- **Corporate Banking & National Address (SPL)**: Registered commercial address and corporate tier-1 bank account opening.

---
> **Senior Advisory Desk:** Trek Consultancy's Senior Advisory & Legal Desk in Riyadh oversees your entire process end-to-end on a turnkey basis.`,
      source: "AI"
    };
  }
  if (isPillar2) {
    const p2 = memory.pillars[1];
    if (isAr) {
      return {
        reply: `### \u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0648\u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u2014 \u0623\u0646\u0638\u0645\u0629 \u0645\u0624\u0633\u0633\u064A\u0629 \u0645\u062A\u0637\u0648\u0631\u0629

\u064A\u0642\u062F\u0645 \u0642\u0633\u0645 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0641\u064A \u062A\u0631\u064A\u0643 \u062D\u0644\u0648\u0644\u0627\u064B \u0631\u0642\u0645\u064A\u0629 \u0645\u0635\u0645\u0645\u0629 \u062E\u0635\u064A\u0635\u0627\u064B \u0644\u0644\u0634\u0631\u0643\u0627\u062A \u0648\u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649.

- **\u0623\u0646\u0638\u0645\u0629 ERP \u0645\u062E\u0635\u0635\u0629**: \u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629\u060C \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A\u060C \u0648\u0644\u0648\u062D\u0627\u062A \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629.
- **\u0645\u0646\u0635\u0627\u062A \u0627\u0644\u0648\u064A\u0628 \u0648\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062C\u0648\u0627\u0644**: \u062D\u0644\u0648\u0644 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0645\u0628\u0646\u064A\u0629 \u0628\u0623\u062D\u062F\u062B \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0645\u062B\u0644 React \u0648TypeScript \u0648Node.js.
- **\u0633\u062D\u0627\u0628\u0629 \u0648\u0642\u0648\u0627\u0639\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0631\u0646\u0629**: \u0628\u0646\u064A\u0629 \u062A\u062D\u062A\u064A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0623\u062F\u0627\u0621 \u0645\u0639 \u0642\u0648\u0627\u0639\u062F \u0628\u064A\u0627\u0646\u0627\u062A Neon PostgreSQL \u0648\u0648\u0627\u062C\u0647\u0627\u062A \u0628\u0631\u0645\u062C\u064A\u0629 \u0622\u0645\u0646\u0629.
- **\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A**: \u0645\u0633\u0627\u0639\u062F\u0648\u0646 \u0623\u0630\u0643\u064A\u0627\u0621\u060C \u0648\u0645\u062D\u0631\u0643\u0627\u062A \u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.

---
> **\u0642\u0633\u0645 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629:** \u062A\u0646\u0641\u0630 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 \u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0647\u0646\u062F\u0633\u064A\u0646 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u0641\u064A \u062A\u0631\u064A\u0643 \u0645\u0639 \u0627\u0644\u062A\u0632\u0627\u0645 \u0643\u0627\u0645\u0644 \u0628\u0627\u062A\u0641\u0627\u0642\u064A\u0627\u062A \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062E\u062F\u0645\u0629 (SLA).`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### ${p2.titleBn} (${p2.title}) \u2014 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09B8\u09C7\u09AC\u09BE

\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u0987\u09A8-\u09B9\u09BE\u0989\u09B8 \u099F\u09C7\u0995 \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2\u09BE\u0987\u099C\u09C7\u09B6\u09A8 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C7\u0964

- **\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C ERP**: \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u09B8\u09BE\u09AE\u0997\u09CD\u09B0\u09BF\u0995 \u0995\u09BE\u099C\u09C7\u09B0 \u09A7\u09BE\u09B0\u09BE \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8, \u0987\u09A8\u09AD\u09C7\u09A8\u09CD\u099F\u09B0\u09BF \u0993 \u0985\u09AA\u09BE\u09B0\u09C7\u09B6\u09A8\u09BE\u09B2 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1\u0964
- **\u09B8\u09CD\u0995\u09C7\u09B2\u09C7\u09AC\u09B2 \u0993\u09AF\u09BC\u09C7\u09AC \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE**: React, TypeScript, Node.js \u0993 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8\u0964
- **\u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0993 \u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u099C \u09B8\u09BF\u0995\u09BF\u0989\u09B0\u09BF\u099F\u09BF**: Neon PostgreSQL \u09AA\u09BE\u09B0\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09A8\u09CD\u09B8, \u0989\u099A\u09CD\u099A-\u0997\u09A4\u09BF\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B8 \u0993 \u09B8\u09BF\u0995\u09BF\u0989\u09B0 \u098F\u09AA\u09BF\u0986\u0987\u0964
- **\u098F\u0986\u0987 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0993 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8**: \u0987\u09A8\u09CD\u099F\u09C7\u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u099F \u099A\u09CD\u09AF\u09BE\u099F \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995\u09AB\u09CD\u09B2\u09CB \u0987\u099E\u09CD\u099C\u09BF\u09A8 \u0993 \u09A1\u09C7\u099F\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982\u0964

---
> **\u099F\u09C7\u0995 \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8:** \u09B8\u0995\u09B2 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09AA\u09CD\u09B0\u0995\u09B2\u09CD\u09AA \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09A6\u0995\u09CD\u09B7 \u0987\u099E\u09CD\u099C\u09BF\u09A8\u09BF\u09AF\u09BC\u09BE\u09B0\u09BF\u0982 \u099F\u09BF\u09AE \u0995\u09B0\u09CD\u09A4\u09C3\u0995 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### ${p2.title} \u2014 Institutional Technology Solutions

Trek Consultancy delivers mission-critical digital systems built specifically for enterprise scale and security.

- **Custom Enterprise ERP**: Tailored business management, process automation, and operational dashboards.
- **Scalable Web & Mobile Platforms**: Full-stack systems engineered with React, TypeScript, Node.js, and modern cloud stacks.
- **Cloud & Database Resilience**: High-throughput microservices, Neon PostgreSQL persistence, and secure APIs.
- **AI Business Automation**: Intelligent conversational assistants, automated workflow engines, and process optimization.

---
> **Engineering Division:** Delivered directly by Trek Consultancy's in-house engineering division with enterprise SLA.`,
      source: "AI"
    };
  }
  if (isPillar3) {
    const p3 = memory.pillars[2];
    if (isAr) {
      return {
        reply: `### \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0642\u064A\u0628 \u0627\u0644\u062D\u0643\u0648\u0645\u064A (PRO) \u2014 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0648\u0627\u0644\u0625\u0642\u0627\u0645\u0627\u062A

\u0625\u062F\u0627\u0631\u0629 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0648\u0625\u0635\u062F\u0627\u0631 \u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0627\u0644\u0643\u0648\u0627\u062F\u0631 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A\u0629 \u0648\u0627\u0644\u0639\u0645\u0627\u0644\u064A\u0629 \u0648\u0641\u0642 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.

- **\u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646 \u0648\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0639\u0645\u0644**: \u0623\u0630\u0648\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0643\u0628\u0627\u0631 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0648\u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0627\u0644\u0641\u0646\u064A\u064A\u0646.
- **\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0625\u0642\u0627\u0645\u0627\u062A \u0648\u062A\u062C\u062F\u064A\u062F\u0647\u0627**: \u0625\u062F\u0627\u0631\u0629 \u0633\u0646\u0648\u064A\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u062A\u062C\u062F\u064A\u062F \u0647\u0648\u064A\u0627\u062A \u0645\u0642\u064A\u0645 \u0627\u0644\u0646\u0638\u0627\u0645\u064A\u0629.
- **\u0645\u0646\u0635\u062A\u0627 \u0642\u0648\u0649 \u0648\u0645\u0642\u064A\u0645**: \u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u0648\u062F \u0627\u0644\u0639\u0645\u0644\u060C \u0648\u0646\u0633\u0628 \u0627\u0644\u062A\u0648\u0637\u064A\u0646\u060C \u0648\u0625\u062F\u0627\u0631\u0629 \u062A\u0641\u0648\u064A\u0636\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0644\u064A\u0646 \u0639\u0628\u0631 \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0628\u0634\u0631\u064A\u0629.
- **\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 (MOFA)**: \u062A\u0635\u062F\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0639\u0628\u0631 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u0627\u0644\u0633\u0641\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629.

---
> **\u0645\u0643\u062A\u0628 \u0627\u0644\u062A\u0639\u0642\u064A\u0628 \u0627\u0644\u062D\u0643\u0648\u0645\u064A:** \u062A\u062F\u0627\u0631 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 \u0645\u0639\u0642\u0628\u064A\u0646\u0627 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0636\u0645\u0627\u0646 \u0633\u0631\u0639\u0629 \u0627\u0644\u0625\u0646\u062C\u0627\u0632.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### ${p3.titleBn} (${p3.title}) \u2014 \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8\u09BF \u0993 \u09B6\u09CD\u09B0\u09AE \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981

\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09B6\u09CD\u09B0\u09AE \u0986\u0987\u09A8 \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2\u09B8\u09AE\u09C2\u09B9\u09C7 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0986\u0987\u09A8\u0997\u09A4 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0993 \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8\u09BF \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964

- **\u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE \u0993 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F**: \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997\u0995\u09BE\u09B0\u09C0, \u09AA\u09BE\u09B0\u09CD\u099F\u09A8\u09BE\u09B0 \u0993 \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9\u09C0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u09A8\u09CD\u099F\u09CD\u09B0\u09BF \u09AA\u09BE\u09B0\u09AE\u09BF\u099F\u0964
- **\u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u099F \u0987\u0995\u09BE\u09AE\u09BE (Iqama)**: \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09B8\u0982\u09AC\u09BF\u09A7\u09BF\u09AC\u09A6\u09CD\u09A7 \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8\u09BF \u0995\u09BE\u09B0\u09CD\u09A1 \u0987\u09B8\u09CD\u09AF\u09C1 \u0993 \u09B0\u09BF\u09A8\u09BF\u0989\u09AF\u09BC\u09BE\u09B2 \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964
- **Qiwa \u0993 Muqeem \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2**: \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B6\u09CD\u09B0\u09AE \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC\u09C7\u09B0 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8, \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0993 \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0\u0964
- **\u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B8\u09A4\u09CD\u09AF\u09BE\u09AF\u09BC\u09A8 (MOFA)**: \u09AA\u09B0\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC \u0993 \u09B8\u09CC\u09A6\u09BF \u09A6\u09C2\u09A4\u09BE\u09AC\u09BE\u09B8 \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F \u09AD\u09C7\u09B0\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8\u0964

---
> **\u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u09A1\u09C7\u09B8\u09CD\u0995:** \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09C7\u09B0 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u099C\u09A8\u09B8\u0982\u09AF\u09CB\u0997 \u09A6\u09B2\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09B8\u09AE\u09AF\u09BC\u09C7 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09AF\u09BC\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### ${p3.title} \u2014 Government Liaison & Residency

Complete workforce legal mobilization and official government relations across all Saudi labor portals.

- **Investor Visas & Work Permits**: Entry authorizations for foreign executives, partners, and technical personnel.
- **Executive Iqama Issuance**: Annual statutory residency permits and renewals managed end-to-end.
- **Qiwa & Muqeem Portals**: Ministry of Human Resources labor contracts, Saudization quotas, and employee authorizations.
- **Document Legalization**: Ministry of Foreign Affairs (MOFA) and Embassy attestations for foreign certificates.

---
> **PRO Desk:** Managed directly through our authorized government liaisons in Riyadh.`,
      source: "AI"
    };
  }
  if (isPillar4) {
    const p4 = memory.pillars[3];
    if (isAr) {
      return {
        reply: `### \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u2014 \u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631\u064A \u0648\u0645\u0642\u0631\u0627\u062A \u0627\u0644\u0634\u0631\u0643\u0627\u062A

\u062A\u0648\u0641\u064A\u0631 \u0627\u0644\u0645\u0642\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0627\u0644\u0646\u0638\u0627\u0645\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0644\u0627\u0633\u062A\u064A\u0641\u0627\u0621 \u0627\u0634\u062A\u0631\u0627\u0637\u0627\u062A \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0648\u0627\u0644\u0628\u0644\u062F\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.

- **\u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 (\u0625\u064A\u062C\u0627\u0631\u064A)**: \u0645\u0643\u0627\u062A\u0628 \u062A\u062C\u0627\u0631\u064A\u0629 \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0627\u0634\u062A\u0631\u0627\u0637\u0627\u062A \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062C\u062F\u0629 \u0648\u0627\u0644\u062E\u0628\u0631.
- **\u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629**: \u062A\u0623\u062C\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629.
- **\u0627\u0644\u062A\u0645\u0644\u0643 \u0627\u0644\u0639\u0642\u0627\u0631\u064A \u0644\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0623\u062C\u0646\u0628\u064A\u0629**: \u062A\u0648\u062C\u064A\u0647 \u0642\u0627\u0646\u0648\u0646\u064A \u0628\u0634\u0623\u0646 \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u0646\u0638\u0627\u0645\u064A\u0629 \u0644\u062A\u0645\u0644\u0643 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0623\u062C\u0646\u0628\u064A\u0629 \u0644\u0644\u0639\u0642\u0627\u0631\u0627\u062A.
- **\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0635\u0643\u0648\u0643 \u0648\u0627\u0644\u0639\u0642\u0648\u062F**: \u062A\u062F\u0642\u064A\u0642 \u0648\u062A\u0648\u062B\u064A\u0642 \u0635\u0643\u0648\u0643 \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0648\u0639\u0642\u0648\u062F \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629.

---
> **\u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0639\u0642\u0627\u0631\u064A:** \u0628\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0645\u0639 \u0648\u0633\u0637\u0627\u0621 \u0639\u0642\u0627\u0631\u064A\u064A\u0646 \u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0644\u0645\u0646\u0635\u0629 \u0628\u0644\u062F\u064A \u0648\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u0629.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### ${p4.titleBn} (${p4.title}) \u2014 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 Ejari \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C \u0993 \u09AA\u09CD\u09B0\u09AA\u09BE\u09B0\u09CD\u099F\u09BF

\u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u0993 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09AF\u09BC\u09BF\u0995 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC \u09B8\u0982\u09AC\u09BF\u09A7\u09BF\u09AC\u09A6\u09CD\u09A7 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u0993 \u09B8\u09CD\u09AA\u09C7\u09B8 \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964

- **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8 (Ejari)**: \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6, \u099C\u09C7\u09A6\u09CD\u09A6\u09BE \u0993 \u09A6\u09BE\u09AE\u09CD\u09AE\u09BE\u09AE\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u0987\u09AE \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u099E\u09CD\u099A\u09B2\u09C7 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C\u0964
- **\u09B6\u09BF\u09B2\u09CD\u09AA\u09BE\u099E\u09CD\u099A\u09B2 \u0993 \u0997\u09C1\u09A6\u09BE\u09AE (Warehousing)**: \u09AC\u09BF\u09B6\u09C7\u09B7 \u0985\u09B0\u09CD\u09A5\u09A8\u09C8\u09A4\u09BF\u0995 \u0985\u099E\u09CD\u099A\u09B2 (SEZ) \u0993 \u09B2\u099C\u09BF\u09B8\u09CD\u099F\u09BF\u0995 \u09AA\u09BE\u09B0\u09CD\u0995\u09C7 \u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0\u09B9\u09BE\u0989\u09B8 \u09B2\u09BF\u099C\u0964
- **\u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE\u09AF\u09BC \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F**: \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997\u0995\u09BE\u09B0\u09C0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u0985\u09A7\u09BF\u0997\u09CD\u09B0\u09B9\u09A3 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0986\u0987\u09A8\u09BF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0964
- **\u099F\u09BE\u0987\u099F\u09C7\u09B2 \u09A1\u09BF\u09A1 \u0993 \u09A1\u09BF\u0989 \u09A1\u09BF\u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u09B8**: \u099C\u09AE\u09BF\u09B0 \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u09B6\u09A4\u09AD\u09BE\u0997 \u0986\u0987\u09A8\u09BF \u09AF\u09BE\u099A\u09BE\u0987 \u0993 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09BF\u0964

---
> **\u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u09A1\u09C7\u09B8\u09CD\u0995:** \u09B8\u09CC\u09A6\u09BF \u09AA\u09CC\u09B0\u09B8\u09AD\u09BE (Balady) \u0993 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC\u09C7\u09B0 \u09B6\u09A4\u09AD\u09BE\u0997 \u09A8\u09BF\u09AF\u09BC\u09AE \u09AE\u09C7\u09A8\u09C7 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09AA\u09A4\u09CD\u09B0 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### ${p4.title} \u2014 Certified Leases & Land Acquisition

Statutory physical premises required for commercial registration and operational setup across Saudi Arabia.

- **Certified Office Leases (Ejari)**: Compliant physical office spaces across prime business districts in Riyadh, Jeddah, and Khobar.
- **Industrial Warehousing**: Logistics facilities and warehouse leasing in authorized special economic zones (SEZ).
- **Foreign Property Ownership**: Legal navigation of statutory frameworks for international entities.
- **Title Deed & Due Diligence**: Certified deed verification and lease contract execution.

---
> **Real Estate Advisory:** Coordinated with certified Saudi real estate brokers ensuring 100% Balady and MoC compliance.`,
      source: "AI"
    };
  }
  if (isPillar5) {
    const p5 = memory.pillars[4];
    if (isAr) {
      return {
        reply: `### \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u2014 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629 (ZATCA)

\u062D\u0648\u0643\u0645\u0629 \u0645\u0627\u0644\u064A\u0629 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u062A\u0627\u0645 \u0645\u0639 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643.

- **\u0645\u0633\u0643 \u0627\u0644\u062F\u0641\u0627\u062A\u0631 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A\u0629**: \u0625\u0639\u062F\u0627\u062F \u062A\u0642\u0627\u0631\u064A\u0631 \u0645\u0627\u0644\u064A\u0629 \u0648\u0642\u0648\u0627\u0626\u0645 \u062F\u062E\u0644 \u0648\u0645\u0631\u0643\u0632 \u0645\u0627\u0644\u064A \u0634\u0647\u0631\u064A\u0629 \u0648\u0641\u0642 \u0645\u0639\u0627\u064A\u064A\u0631 IFRS.
- **\u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 (\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629)**: \u0631\u0628\u0637 \u0645\u0628\u0627\u0634\u0631 \u0645\u0639 \u0645\u0646\u0635\u0629 \u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u062A\u0642\u062F\u064A\u0645 \u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 15%.
- **\u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0648\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629**: \u062A\u0642\u0627\u0631\u064A\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u0646 \u0645\u062D\u0627\u0633\u0628\u064A\u0646 \u0642\u0627\u0646\u0648\u0646\u064A\u064A\u0646 \u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.
- **\u0627\u0644\u062A\u0623\u0645\u064A\u0646\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629 \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0623\u062C\u0648\u0631**: \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0646\u0638\u0627\u0645 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0623\u062C\u0648\u0631 (WPS) \u0648\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062A\u0623\u0645\u064A\u0646\u0627\u062A (GOSI).

---
> **\u0645\u0643\u062A\u0628 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u062A\u062F\u0642\u064A\u0642:** \u064A\u062F\u0627\u0631 \u0639\u0628\u0631 \u0645\u062D\u0627\u0633\u0628\u064A\u0646 \u0648\u0645\u0633\u062A\u0634\u0627\u0631\u064A\u0646 \u0636\u0631\u064A\u0628\u064A\u064A\u0646 \u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0645\u0646 \u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u064A\u0646 \u0648\u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A\u0646 (SOCPA).`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### ${p5.titleBn} (${p5.title}) \u2014 ZATCA \u09AB\u09C7\u099C \u09E8 \u0993 \u09AD\u09CD\u09AF\u09BE\u099F \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8

\u09B8\u09CC\u09A6\u09BF \u0995\u09B0 \u0995\u09B0\u09CD\u09A4\u09C3\u09AA\u0995\u09CD\u09B7\u09C7\u09B0 (ZATCA) \u0986\u0987\u09A8 \u09AE\u09C7\u09A8\u09C7 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09B8\u0982\u09AC\u09BF\u09A7\u09BF\u09AC\u09A6\u09CD\u09A7 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09B9\u09BF\u09B8\u09BE\u09AC \u0993 \u09A8\u09BF\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964

- **IFRS \u09AC\u09C1\u0995\u0995\u09BF\u09AA\u09BF\u0982**: \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09AE\u09BE\u09A8\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2 \u09AE\u09BE\u09B8\u09BF\u0995 \u09B9\u09BF\u09B8\u09BE\u09AC, \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09B6\u09BF\u099F \u0993 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8\u0964
- **ZATCA \u09AB\u09C7\u099C \u09E8 \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982**: ZATCA-\u09B0 Fatoora \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u0987\u09A8\u09CD\u099F\u09BF\u0997\u09CD\u09B0\u09C7\u09B6\u09A8 \u098F\u09AC\u0982 \u0995\u09CB\u09AF\u09BC\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09B2\u09BF \u09E7\u09EB% \u09AD\u09CD\u09AF\u09BE\u099F \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8\u0964
- **\u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u09B8\u0982\u09AC\u09BF\u09A7\u09BF\u09AC\u09A6\u09CD\u09A7 \u0985\u09A1\u09BF\u099F**: \u09B8\u09BF\u0986\u09B0 \u0993 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u09A8\u09AC\u09BE\u09AF\u09BC\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09BE\u09B0\u09CD\u099F\u09BF\u09AB\u09BE\u0987\u09A1 \u099A\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u0985\u09A1\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u0995\u09B0\u09A3\u0964
- **GOSI \u0993 \u09AA\u09C7\u09B0\u09CB\u09B2 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8**: \u0993\u09AF\u09BC\u09C7\u099C \u09AA\u09CD\u09B0\u09CB\u099F\u09C7\u0995\u09B6\u09A8 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE (WPS) \u0993 \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964

---
> **\u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0993 \u0985\u09A1\u09BF\u099F \u09A1\u09C7\u09B8\u09CD\u0995:** SOCPA-\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B8\u09BE\u09B0\u09CD\u099F\u09BF\u09AB\u09BE\u0987\u09A1 \u0985\u09A1\u09BF\u099F\u09B0 \u0993 \u0985\u09AD\u09BF\u099C\u09CD\u099E \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F\u09A6\u09C7\u09B0 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09BF\u09A4\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### ${p5.title} \u2014 ZATCA Phase 2 Compliance

Institutional financial governance ensuring complete statutory compliance with the Zakat, Tax and Customs Authority.

- **Full-Cycle Bookkeeping**: Monthly IFRS-compliant financial reporting, balance sheets, and profit & loss statements.
- **ZATCA Phase 2 E-Invoicing**: Direct integration with ZATCA's Fatoora portal and quarterly 15% VAT return filings.
- **Statutory Financial Audits**: Certified independent audit reports mandated for Commercial Registration renewals.
- **Payroll & GOSI Compliance**: Wage Protection System (WPS) and General Organization for Social Insurance administration.

---
> **Tax & Audit Desk:** Handled by certified Saudi tax advisors and SOCPA-accredited auditors.`,
      source: "AI"
    };
  }
  if (isPillar6) {
    const p6 = memory.pillars[5];
    if (isAr) {
      return {
        reply: `### \u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u2014 \u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629\u060C \u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0627\u060C \u0648\u0643\u0646\u062F\u0627

\u062D\u0644\u0648\u0644 \u062A\u0648\u0633\u0639 \u062A\u062C\u0627\u0631\u064A \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0641\u064A \u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0644\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629.

- **\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629 (USA LLC / C-Corp)**: \u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0641\u064A \u062F\u064A\u0644\u0627\u0648\u064A\u0631 \u0648\u0648\u0627\u064A\u0648\u0645\u0646\u063A \u0645\u0639 \u0625\u0635\u062F\u0627\u0631 \u0631\u0642\u0645 EIN \u0627\u0644\u0636\u0631\u064A\u0628\u064A (${p6.turnaroundTime}).
- **\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 (UK Ltd)**: \u062A\u0633\u062C\u064A\u0644 \u0645\u0639\u062A\u0645\u062F \u0644\u062F\u0649 Companies House \u0645\u0639 \u062A\u0648\u0641\u064A\u0631 \u0639\u0646\u0648\u0627\u0646 \u0631\u0633\u0645\u064A \u0641\u064A \u0644\u0646\u062F\u0646.
- **\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0643\u0646\u062F\u064A\u0629**: \u062A\u0633\u062C\u064A\u0644 \u0641\u064A\u062F\u0631\u0627\u0644\u064A \u0648\u0625\u0642\u0644\u064A\u0645\u064A \u0645\u0639 \u0644\u0648\u0627\u0626\u062D \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629.
- **\u062D\u0633\u0627\u0628\u0627\u062A \u0628\u0646\u0643\u064A\u0629 \u062F\u0648\u0644\u064A\u0629**: \u0641\u062A\u062D \u062D\u0633\u0627\u0628\u0627\u062A \u062A\u062C\u0627\u0631\u064A\u0629 \u0645\u0639 Mercury \u0648Wise Business \u0648\u0628\u0646\u0648\u0643 \u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0623\u0648\u0644\u0649.

---
> **\u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0627\u0644\u062F\u0648\u0644\u064A\u0629:** \u062A\u062A\u064A\u062D \u0644\u0643 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0639\u0628\u0631 \u0627\u0644\u062D\u062F\u0648\u062F \u0628\u0633\u0644\u0627\u0633\u0629 \u0628\u0627\u0644\u062A\u0648\u0627\u0632\u064A \u0645\u0639 \u0634\u0631\u0643\u062A\u0643 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.`,
        source: "AI"
      };
    }
    if (isBn) {
      return {
        reply: `### ${p6.titleBn} (${p6.title}) \u2014 \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8

\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09B9\u09BE\u09AC\u09B8\u09AE\u09C2\u09B9\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3 \u098F\u09AC\u0982 \u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u099A\u09BE\u09B2\u09C1\u0995\u09B0\u09A3\u0964

- **\u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 (USA LLC / C-Corp)**: \u09A1\u09C7\u09B2\u09BE\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u0993\u09AF\u09BC\u09BE\u0987\u09AF\u09BC\u09CB\u09AE\u09BF\u0982-\u098F \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8, IRS EIN \u0993 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u098F\u099C\u09C7\u09A8\u09CD\u099F \u09B8\u09C7\u09AC\u09BE (${p6.turnaroundTime})\u0964
- **\u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u099C\u09CD\u09AF (UK Ltd)**: Companies House-\u098F \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0993 \u09B2\u09A8\u09CD\u09A1\u09A8 \u0985\u09AB\u09BF\u09B8\u09BF\u09AF\u09BC\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8\u0964
- **\u0995\u09BE\u09A8\u09BE\u09A1\u09BF\u09AF\u09BC\u09BE\u09A8 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u09B6\u09A8**: \u09AB\u09C7\u09A1\u09BE\u09B0\u09C7\u09B2 \u0993 \u09AA\u09CD\u09B0\u09AD\u09BF\u09A8\u09CD\u09B8\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u098F\u09AC\u0982 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09BE\u0987-\u09B2 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964
- **\u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982**: Mercury, Wise Business \u0993 \u099F\u09BF\u09AF\u09BC\u09BE\u09B0-\u09E7 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7 \u09AE\u09BE\u09B2\u09CD\u099F\u09BF-\u0995\u09BE\u09B0\u09C7\u09A8\u09CD\u09B8\u09BF \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u0964

---
> **\u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995:** \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09AA\u09BE\u09B6\u09BE\u09AA\u09BE\u09B6\u09BF \u09AC\u09BF\u09B6\u09CD\u09AC\u099C\u09C1\u09A1\u09BC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE\u09B0 \u09A8\u09BF\u09B0\u09CD\u09AD\u09B0\u09AF\u09CB\u0997\u09CD\u09AF \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8\u0964`,
        source: "AI"
      };
    }
    return {
      reply: `### ${p6.title} \u2014 Global Corporate Formation

Turnkey corporate expansion into major international financial hubs for cross-border operations and trade.

- **United States (USA LLC / C-Corp)**: Delaware & Wyoming registration, IRS EIN issuance, and Registered Agent service (${p6.turnaroundTime}).
- **United Kingdom (UK Ltd)**: Companies House registration with official London registered office address.
- **Canadian Corporation**: Federal and provincial incorporation with certified corporate bylaws.
- **Global Tier-1 Banking**: Turnkey business accounts with Mercury, Wise Business, and global multi-currency clearing banks.

---
> **Global Desks:** Enabling seamless multi-currency international commerce alongside your Saudi enterprise.`,
      source: "AI"
    };
  }
  if (isAr) {
    return {
      reply: `### ${memory.identity.brand} \u2014 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A

\u0623\u0646\u0627 \u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0622\u0644\u064A \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0644\u0640 **${memory.identity.brand}**. \u064A\u0633\u0639\u062F\u0646\u064A \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629.

- **\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0631\u062E\u0635\u0629 MISA** (\u0645\u0644\u0643\u064A\u0629 \u0623\u062C\u0646\u0628\u064A\u0629 100%)
- **\u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0648\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629 \u0627\u0644\u0645\u062A\u0637\u0648\u0631\u0629**
- **\u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646 \u0648\u0627\u0644\u0625\u0642\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0642\u064A\u0628 \u0627\u0644\u062D\u0643\u0648\u0645\u064A**
- **\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629**
- **\u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0648\u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 (ZATCA)**
- **\u062A\u0623\u0633\u09BF\u09B8 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629** (USA LLC, UK Ltd)

---
> **\u062A\u0641\u0636\u0644 \u0628\u0637\u0631\u062D \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643:** \u064A\u0631\u062C\u0649 \u0643\u062A\u0627\u0628\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A\u0643 \u0623\u0648 \u0633\u0624\u0627\u0644\u0643 \u0628\u062F\u0642\u0629 \u0648\u0633\u0623\u0642\u062F\u0645 \u0644\u0643 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0646\u0638\u0627\u0645\u064A\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629!`,
      source: "AI"
    };
  }
  if (isBn) {
    return {
      reply: `### ${memory.identity.brand} \u2014 \u098F\u0995\u09CD\u09B8\u09BF\u0995\u09BF\u0989\u099F\u09BF\u09AD \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u09A1\u09C7\u09B8\u09CD\u0995

\u0986\u09AE\u09BF **${memory.identity.brand}**-\u098F\u09B0 \u098F\u0986\u0987 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u0964 \u0986\u09AE\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u0997\u09CD\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AE\u09C7\u09AE\u09CB\u09B0\u09BF\u09B0 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u0986\u09B2\u09CB\u0995\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u0964

- **\u09B8\u09CC\u09A6\u09BF \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8 \u0993 MISA \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8** (\u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE)
- **\u0987\u09A8-\u09B9\u09BE\u0989\u09B8 \u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u0987\u099E\u09CD\u099C\u09BF\u09A8\u09BF\u09AF\u09BC\u09BE\u09B0\u09BF\u0982**
- **\u09AD\u09BF\u09B8\u09BE, \u0987\u0995\u09BE\u09AE\u09BE \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981**
- **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u0993 Ejari \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C**
- **\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982, ZATCA \u09AD\u09CD\u09AF\u09BE\u099F \u0993 \u0985\u09A1\u09BF\u099F**
- **\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8** (USA LLC, UK Ltd)

---
> **\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u099F\u09BF \u099C\u09BE\u09A8\u09BE\u09A8:** \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C1\u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u099A\u09BE\u09B9\u09BF\u09A6\u09BE \u09AC\u09BE \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u099F\u09BF \u09B2\u09BF\u0996\u09C1\u09A8, \u0986\u09AE\u09BF \u098F\u0996\u09A8\u0987 \u09B8\u09A0\u09BF\u0995 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF \u0993 \u0997\u09BE\u0987\u09A1\u09B2\u09BE\u0987\u09A8 \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9 \u0995\u09B0\u09AC!`,
      source: "AI"
    };
  }
  return {
    reply: `### ${memory.identity.brand} \u2014 Executive Advisory Desk

I am the AI Support Consultant for **${memory.identity.brand}**. I draw directly from our verified institutional business memory to assist your corporate journey.

- **Saudi Business Setup & MISA Licensing** (100% foreign ownership)
- **In-House Software & Digital Engineering**
- **Investor Visas, Executive Iqamas & PRO Portals**
- **Commercial Real Estate & Certified Ejari Leases**
- **Corporate Accounting, ZATCA Phase 2 VAT & Audits**
- **Global Business Formation** (USA LLC, UK Ltd)

---
> **How can we assist you?** Please let me know your specific business requirement or question, and I will guide you with accurate regulatory information!`,
    source: "AI"
  };
}

// src/server/app.ts
var ragCache = null;
var RAG_CACHE_TTL_MS = 15e3;
function invalidateRagCache() {
  ragCache = null;
  invalidateBusinessMemoryCache();
  compileBusinessMemory(pool).catch((err) => console.warn("[BusinessMemory] Background sync notice:", err));
}
async function getRagData() {
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
  const data = { faqsData, docsData, topicsData, blogsData, settingsData, answeredTicketsData };
  ragCache = { data, expiresAt: Date.now() + RAG_CACHE_TTL_MS };
  return data;
}
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const t = setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms);
      t.unref?.();
    })
  ]);
}
var aiConfigCache = null;
var AI_CONFIG_CACHE_TTL_MS = 3e4;
function invalidateAiConfigCache() {
  aiConfigCache = null;
}
async function getAiConfigFromDb() {
  if (aiConfigCache && aiConfigCache.expiresAt > Date.now()) {
    return aiConfigCache.config;
  }
  try {
    const res = await pool.query("SELECT value FROM settings WHERE key = 'ai'");
    let raw = res.rows[0]?.value;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
      }
    }
    const config = { ...defaultAiSettings, ...raw || {} };
    aiConfigCache = { config, expiresAt: Date.now() + AI_CONFIG_CACHE_TTL_MS };
    return config;
  } catch (err) {
    return defaultAiSettings;
  }
}
async function getEffectiveAiRuntime() {
  const dbConfig = await getAiConfigFromDb();
  const rawDbKey = (dbConfig.apiKey || "").trim();
  const envKey = (process.env.GEMINI_API_KEY || "").trim();
  const effectiveApiKey = rawDbKey || envKey;
  const selectedModel = (dbConfig.selectedModel || "gemini-2.5-flash").trim();
  const rawFallbacks = Array.isArray(dbConfig.fallbackModels) ? dbConfig.fallbackModels : ["gemini-2.0-flash", "gemini-1.5-flash"];
  const fallbackModels = rawFallbacks.filter((m) => m && m !== selectedModel);
  const candidateModels = [selectedModel, ...fallbackModels];
  return {
    apiKey: effectiveApiKey,
    isKeyConfigured: Boolean(effectiveApiKey),
    hasCustomDbKey: Boolean(rawDbKey),
    usingEnvKey: Boolean(!rawDbKey && envKey),
    selectedModel,
    candidateModels,
    temperature: typeof dbConfig.temperature === "number" ? dbConfig.temperature : 0.4,
    maxOutputTokens: typeof dbConfig.maxOutputTokens === "number" ? dbConfig.maxOutputTokens : 2048,
    customSystemInstruction: (dbConfig.customSystemInstruction || "").trim(),
    status: dbConfig.status || "active",
    dbConfig
  };
}
async function createApp() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "25mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
  app.use(async (_req, res, next) => {
    try {
      await initDb();
      next();
    } catch (err) {
      console.error("[Database] Schema initialization failed:", err?.message);
      res.status(503).json({
        error: "Database Unavailable",
        message: err?.message || "Database schema initialization failed"
      });
    }
  });
  app.get(["/api", "/api/"], (_req, res) => {
    res.json({
      status: "ok",
      service: "Trek Consultancy Forum API",
      healthUrl: "/api/health",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  const RAG_INVALIDATING_PATHS = [
    "/api/admin/support/faqs",
    "/api/admin/support/knowledge-docs",
    "/api/admin/support/tickets",
    "/api/admin/support/conversations",
    "/api/admin/support/knowledge",
    "/api/admin/support/business-memory",
    "/api/admin/customers",
    "/api/admin/settings/ai",
    "/api/support/tickets",
    "/api/settings",
    "/api/blogs",
    "/api/topics"
  ];
  app.use((req, res, next) => {
    if (req.method !== "GET" && RAG_INVALIDATING_PATHS.some((p) => req.path.startsWith(p))) {
      res.on("finish", () => {
        if (res.statusCode < 400) invalidateRagCache();
      });
    }
    next();
  });
  app.get("/api/health", async (_req, res) => {
    const startTime = Date.now();
    const checks = {
      database: { status: "error" },
      aiApi: { status: "not_configured" },
      cache: { status: "ready", ragCacheActive: Boolean(ragCache && ragCache.expiresAt > Date.now()) }
    };
    try {
      const dbStart = Date.now();
      await pool.query("SELECT 1");
      checks.database = {
        status: "connected",
        responseTimeMs: Date.now() - dbStart,
        message: "PostgreSQL connection operational"
      };
    } catch {
      checks.database = {
        status: "error",
        message: "Database service unavailable"
      };
    }
    const aiRuntime = await getEffectiveAiRuntime();
    if (aiRuntime.isKeyConfigured && aiRuntime.status !== "disabled") {
      checks.aiApi = {
        status: "configured",
        provider: "Google Gemini",
        model: aiRuntime.selectedModel,
        hasCustomKey: aiRuntime.hasCustomDbKey,
        usingEnvKey: aiRuntime.usingEnvKey
      };
    } else {
      checks.aiApi = {
        status: "not_configured",
        provider: "Local Heuristic / PostgreSQL RAG",
        model: "PostgreSQL Knowledge Fallback"
      };
    }
    const isHealthy = checks.database.status === "connected";
    const totalDurationMs = Date.now() - startTime;
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "degraded",
      service: "Trek Consultancy Forum API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: totalDurationMs,
      checks
    });
  });
  app.get("/api/topics", async (_req, res) => {
    try {
      const topicsRes = await pool.query(`
        SELECT * FROM topics ORDER BY created_at DESC
      `);
      const repliesRes = await pool.query(`
        SELECT * FROM replies ORDER BY created_at ASC
      `);
      const repliesByTopic = {};
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
      const topics = topicsRes.rows.map((t) => ({
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/discussion/meta", async (_req, res) => {
    try {
      const [catRes, roleRes] = await Promise.allSettled([
        pool.query("SELECT id, name, slug, description FROM discussion_categories ORDER BY created_at ASC"),
        pool.query('SELECT id, name, badge_label as "badgeLabel", color FROM staff_roles ORDER BY created_at ASC')
      ]);
      let categories = catRes.status === "fulfilled" && catRes.value.rows.length > 0 ? catRes.value.rows : defaultDiscussionCategories.map((c) => ({
        id: `cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: c,
        slug: c.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      }));
      let staffRoles = roleRes.status === "fulfilled" && roleRes.value.rows.length > 0 ? roleRes.value.rows : defaultStaffRoles.map((r) => ({
        id: `role-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: r.name,
        badgeLabel: r.badgeLabel,
        color: r.color
      }));
      res.json({ categories, staffRoles });
    } catch (err) {
      res.json({
        categories: defaultDiscussionCategories.map((c) => ({
          id: `cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: c,
          slug: c.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        })),
        staffRoles: defaultStaffRoles.map((r) => ({
          id: `role-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: r.name,
          badgeLabel: r.badgeLabel,
          color: r.color
        }))
      });
    }
  });
  app.post("/api/discussion/categories", async (req, res) => {
    try {
      const { name, description } = req.body;
      const cleanName = (name || "").trim();
      if (!cleanName) {
        return res.status(400).json({ error: "Category name is required." });
      }
      const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      let slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (!slug) {
        slug = `cat-${encodeURIComponent(cleanName).toLowerCase().replace(/%/g, "").slice(0, 50)}`;
      }
      if (!slug) {
        slug = `cat-${Date.now()}`;
      }
      const insertRes = await pool.query(`
        INSERT INTO discussion_categories (id, name, slug, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, description = COALESCE(EXCLUDED.description, discussion_categories.description)
        RETURNING id, name, slug, description
      `, [id, cleanName, slug, (description || "").trim() || null]);
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      console.error("[Create Category Error]:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/discussion/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        "DELETE FROM discussion_categories WHERE id = $1 OR name = $1 OR slug = $1",
        [id]
      );
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/discussion/staff-roles", async (req, res) => {
    try {
      const { name, badgeLabel, color } = req.body;
      const cleanName = (name || "").trim();
      if (!cleanName) {
        return res.status(400).json({ error: "Staff role name is required." });
      }
      const id = `role-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const cleanLabel = (badgeLabel || cleanName).trim();
      const cleanColor = (color || "teal").trim();
      const insertRes = await pool.query(`
        INSERT INTO staff_roles (id, name, badge_label, color)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET badge_label = EXCLUDED.badge_label, color = EXCLUDED.color
        RETURNING id, name, badge_label as "badgeLabel", color
      `, [id, cleanName, cleanLabel, cleanColor]);
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/discussion/staff-roles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        "DELETE FROM staff_roles WHERE id = $1 OR name = $1",
        [id]
      );
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/topics", async (req, res) => {
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
      `, [id, title, author || "Community Member", authorEmail || null, authorId || null, authorRole || "Member", avatar, timeAgo || "Just now", category, categorySlug, content]);
      const newTopic = {
        id: insertRes.rows[0].id,
        title: insertRes.rows[0].title,
        author: insertRes.rows[0].author,
        authorEmail: insertRes.rows[0].author_email,
        authorId: insertRes.rows[0].author_id,
        authorRole: insertRes.rows[0].author_role,
        authorAvatar: insertRes.rows[0].author_avatar,
        timeAgo: insertRes.rows[0].time_ago,
        createdAt: insertRes.rows[0].created_at || (/* @__PURE__ */ new Date()).toISOString(),
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
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Published Topic', $2, $3, 'Just now', 'topic')
      `, [`act-${Date.now()}`, author || "Community Member", title]);
      res.status(201).json(newTopic);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/topics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const topicRes = await pool.query("SELECT * FROM topics WHERE id = $1", [id]);
      if (topicRes.rows.length === 0) {
        return res.status(404).json({ error: "Topic not found" });
      }
      const topic = topicRes.rows[0];
      const userEmail = (req.headers["x-user-email"] || req.body?.userEmail || "").trim().toLowerCase();
      const userRole = (req.headers["x-user-role"] || req.body?.userRole || "").trim();
      const userName = (req.headers["x-user-name"] || req.body?.userName || "").trim().toLowerCase();
      const userId = (req.headers["x-user-id"] || req.body?.userId || "").trim();
      let isAllowed = false;
      if (userRole === "Super Admin" || userRole === "Moderator") {
        isAllowed = true;
      }
      if (!isAllowed && userEmail) {
        const uRes = await pool.query(
          "SELECT role, status FROM users WHERE LOWER(email) = $1",
          [userEmail]
        );
        if (uRes.rows.length > 0 && uRes.rows[0].status === "active") {
          const r = uRes.rows[0].role;
          if (r === "Super Admin" || r === "Moderator") {
            isAllowed = true;
          }
        }
      }
      if (!isAllowed) {
        const topicAuthorEmail = (topic.author_email || "").trim().toLowerCase();
        const topicAuthorName = (topic.author || "").trim().toLowerCase();
        const topicAuthorId = topic.author_id || "";
        if (topicAuthorEmail && userEmail && topicAuthorEmail === userEmail) {
          isAllowed = true;
        } else if (topicAuthorId && userId && topicAuthorId === userId) {
          isAllowed = true;
        } else if (topicAuthorName && userName && topicAuthorName === userName) {
          isAllowed = true;
        } else if (topicAuthorName && userEmail && topicAuthorName === userEmail.split("@")[0]) {
          isAllowed = true;
        }
      }
      if (!isAllowed) {
        return res.status(403).json({
          error: "Permission denied: Only administrators and the author who posted this discussion can delete it."
        });
      }
      await pool.query("DELETE FROM topics WHERE id = $1", [id]);
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const handleUpdateTopic = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, categorySlug, content } = req.body;
      const topicRes = await pool.query("SELECT * FROM topics WHERE id = $1", [id]);
      if (topicRes.rows.length === 0) {
        return res.status(404).json({ error: "Topic not found" });
      }
      const topic = topicRes.rows[0];
      const userEmail = (req.headers["x-user-email"] || req.body?.userEmail || "").trim().toLowerCase();
      const userRole = (req.headers["x-user-role"] || req.body?.userRole || "").trim();
      const userName = (req.headers["x-user-name"] || req.body?.userName || "").trim().toLowerCase();
      const userId = (req.headers["x-user-id"] || req.body?.userId || "").trim();
      let isAllowed = false;
      if (userRole === "Super Admin" || userRole === "Moderator" || userRole === "Admin") {
        isAllowed = true;
      }
      if (!isAllowed && userEmail) {
        const uRes = await pool.query(
          "SELECT role, status FROM users WHERE LOWER(email) = $1",
          [userEmail]
        );
        if (uRes.rows.length > 0 && uRes.rows[0].status === "active") {
          const r = uRes.rows[0].role;
          if (r === "Super Admin" || r === "Moderator" || r === "Admin") {
            isAllowed = true;
          }
        }
      }
      if (!isAllowed) {
        const topicAuthorEmail = (topic.author_email || "").trim().toLowerCase();
        const topicAuthorName = (topic.author || "").trim().toLowerCase();
        const topicAuthorId = topic.author_id || "";
        if (topicAuthorEmail && userEmail && topicAuthorEmail === userEmail) {
          isAllowed = true;
        } else if (topicAuthorId && userId && topicAuthorId === userId) {
          isAllowed = true;
        } else if (topicAuthorName && userName && topicAuthorName === userName) {
          isAllowed = true;
        } else if (topicAuthorName && userEmail && topicAuthorName === userEmail.split("@")[0]) {
          isAllowed = true;
        }
      }
      if (!isAllowed) {
        return res.status(403).json({
          error: "Permission denied: Only administrators and the author who posted this discussion can edit it."
        });
      }
      const cleanTitle = (title !== void 0 ? title : topic.title).trim();
      const cleanCategory = (category !== void 0 ? category : topic.category).trim();
      let cleanCategorySlug = (categorySlug !== void 0 ? categorySlug : topic.category_slug || "").trim();
      if (!cleanCategorySlug && cleanCategory) {
        cleanCategorySlug = cleanCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      const cleanContent = (content !== void 0 ? content : topic.content).trim();
      const updateRes = await pool.query(`
        UPDATE topics
        SET title = $1, category = $2, category_slug = $3, content = $4
        WHERE id = $5
        RETURNING *
      `, [cleanTitle, cleanCategory, cleanCategorySlug, cleanContent, id]);
      const updated = updateRes.rows[0];
      const repliesRes = await pool.query("SELECT * FROM replies WHERE topic_id = $1 ORDER BY created_at ASC", [id]);
      const repliesList = repliesRes.rows.map((reply) => ({
        id: reply.id,
        author: reply.author,
        authorRole: reply.author_role,
        authorAvatar: reply.author_avatar,
        timeAgo: reply.time_ago,
        createdAt: reply.created_at,
        content: reply.content,
        likes: reply.likes || 0
      }));
      res.json({
        id: updated.id,
        title: updated.title,
        author: updated.author,
        authorEmail: updated.author_email,
        authorId: updated.author_id,
        authorRole: updated.author_role,
        authorAvatar: updated.author_avatar,
        timeAgo: updated.time_ago,
        createdAt: updated.created_at,
        category: updated.category,
        categorySlug: updated.category_slug,
        views: updated.views || 0,
        likes: updated.likes || 0,
        replies: repliesList.length,
        isFeatured: Boolean(updated.is_featured),
        isPopular: Boolean(updated.is_popular),
        content: updated.content,
        repliesList
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.patch("/api/topics/:id", handleUpdateTopic);
  app.put("/api/topics/:id", handleUpdateTopic);
  app.post("/api/topics/:id/feature", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET is_featured = NOT is_featured WHERE id = $1 RETURNING is_featured
      `, [id]);
      res.json({ success: true, isFeatured: result.rows[0]?.is_featured });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/topics/:id/popular", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET is_popular = NOT is_popular WHERE id = $1 RETURNING is_popular
      `, [id]);
      res.json({ success: true, isPopular: result.rows[0]?.is_popular });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/topics/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const { delta } = req.body || {};
      const change = typeof delta === "number" ? delta : 1;
      const result = await pool.query(`
        UPDATE topics SET likes = GREATEST(0, likes + $2) WHERE id = $1 RETURNING likes
      `, [id, change]);
      res.json({ success: true, likes: result.rows[0]?.likes ?? 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/topics/:id/replies", async (req, res) => {
    try {
      const { id: topicId } = req.params;
      const { author, content, authorAvatar, authorRole } = req.body;
      const replyId = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = authorAvatar || getRandomAvatar(author);
      const replyRes = await pool.query(`
        INSERT INTO replies (id, topic_id, author, author_role, author_avatar, time_ago, content, likes)
        VALUES ($1, $2, $3, $4, $5, 'Just now', $6, 0)
        RETURNING *
      `, [replyId, topicId, author || "Community Member", authorRole || "Member", avatar, content]);
      await pool.query("UPDATE topics SET replies = (SELECT COUNT(*) FROM replies WHERE topic_id = $1) WHERE id = $1", [topicId]);
      const reply = {
        id: replyRes.rows[0].id,
        author: replyRes.rows[0].author,
        authorRole: replyRes.rows[0].author_role,
        authorAvatar: replyRes.rows[0].author_avatar,
        timeAgo: replyRes.rows[0].time_ago,
        createdAt: replyRes.rows[0].created_at || (/* @__PURE__ */ new Date()).toISOString(),
        content: replyRes.rows[0].content,
        likes: 0
      };
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Added Reply', $2, 'Discussion Thread', 'Just now', 'reply')
      `, [`act-${Date.now()}`, author || "Community Member"]);
      res.status(201).json(reply);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/replies/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const { delta } = req.body || {};
      const change = typeof delta === "number" ? delta : 1;
      const result = await pool.query(`
        UPDATE replies SET likes = GREATEST(0, likes + $2) WHERE id = $1 RETURNING likes
      `, [id, change]);
      res.json({ success: true, likes: result.rows[0]?.likes ?? 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/topics/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE topics SET views = views + 1 WHERE id = $1 RETURNING views
      `, [id]);
      res.json({ success: true, views: result.rows[0]?.views });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/blogs", async (_req, res) => {
    try {
      const blogsRes = await pool.query(`
        SELECT b.*, 
          COALESCE(b.likes, 0) as likes,
          COALESCE((SELECT COUNT(*) FROM blog_comments bc WHERE bc.blog_id = b.id), 0) as comments_count
        FROM blogs b
        ORDER BY b.created_at DESC
      `);
      const blogs = blogsRes.rows.map((b) => ({
        id: b.id,
        title: b.title,
        category: b.category,
        date: b.date,
        imageUrl: b.image_url,
        excerpt: b.excerpt,
        content: b.content,
        author: b.author,
        authorAvatar: b.author_avatar,
        redirectUrl: b.redirect_url || "",
        likes: Number(b.likes || 0),
        commentsCount: Number(b.comments_count || 0)
      }));
      res.json(blogs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/blogs/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const commentsRes = await pool.query(
        "SELECT * FROM blog_comments WHERE blog_id = $1 ORDER BY created_at ASC",
        [id]
      );
      const comments = commentsRes.rows.map((c) => ({
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/blogs/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const { author, authorAvatar, authorRole, content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comment content is required." });
      }
      const commentId = `bcm-${Date.now()}`;
      const avatar = authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
      const insertRes = await pool.query(`
        INSERT INTO blog_comments (id, blog_id, author, author_avatar, author_role, time_ago, content, likes)
        VALUES ($1, $2, $3, $4, $5, 'Just now', $6, 0)
        RETURNING *
      `, [commentId, id, author || "Community Member", avatar, authorRole || "Member", content.trim()]);
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/blogs/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "UPDATE blogs SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes",
        [id]
      );
      res.json({ success: true, likes: Number(result.rows[0]?.likes || 0) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/blogs", async (req, res) => {
    try {
      const { title, category, imageUrl, excerpt, content, author, authorAvatar, redirectUrl } = req.body;
      const id = `blog-${Date.now()}`;
      const date = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const avatar = authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
      const cleanRedirect = (redirectUrl || "").trim() || null;
      const insertRes = await pool.query(`
        INSERT INTO blogs (id, title, category, date, image_url, excerpt, content, author, author_avatar, redirect_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [id, title, category, date, imageUrl, excerpt, content, author || "Editorial Staff", avatar, cleanRedirect]);
      const newBlog = {
        id: insertRes.rows[0].id,
        title: insertRes.rows[0].title,
        category: insertRes.rows[0].category,
        date: insertRes.rows[0].date,
        imageUrl: insertRes.rows[0].image_url,
        excerpt: insertRes.rows[0].excerpt,
        content: insertRes.rows[0].content,
        author: insertRes.rows[0].author,
        authorAvatar: insertRes.rows[0].author_avatar,
        redirectUrl: insertRes.rows[0].redirect_url || ""
      };
      res.status(201).json(newBlog);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/blogs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM blog_comments WHERE blog_id = $1", [id]);
      await pool.query("DELETE FROM blogs WHERE id = $1", [id]);
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const handleUpdateBlog = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, imageUrl, excerpt, content, author, authorAvatar, redirectUrl } = req.body;
      const blogRes = await pool.query("SELECT * FROM blogs WHERE id = $1", [id]);
      if (blogRes.rows.length === 0) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      const current = blogRes.rows[0];
      const cleanTitle = (title !== void 0 ? title : current.title).trim();
      const cleanCategory = (category !== void 0 ? category : current.category).trim();
      const cleanImageUrl = (imageUrl !== void 0 ? imageUrl : current.image_url).trim();
      const cleanExcerpt = (excerpt !== void 0 ? excerpt : current.excerpt).trim();
      const cleanContent = (content !== void 0 ? content : current.content).trim();
      const cleanAuthor = (author !== void 0 ? author : current.author).trim();
      const cleanAvatar = authorAvatar !== void 0 ? authorAvatar : current.author_avatar;
      const cleanRedirect = redirectUrl !== void 0 && redirectUrl !== null ? typeof redirectUrl === "string" && redirectUrl.trim() ? redirectUrl.trim() : null : redirectUrl === null ? null : current.redirect_url;
      const updateRes = await pool.query(`
        UPDATE blogs
        SET title = $1, category = $2, image_url = $3, excerpt = $4, content = $5, author = $6, author_avatar = $7, redirect_url = $8
        WHERE id = $9
        RETURNING *
      `, [cleanTitle, cleanCategory, cleanImageUrl, cleanExcerpt, cleanContent, cleanAuthor, cleanAvatar, cleanRedirect, id]);
      const updated = updateRes.rows[0];
      res.json({
        id: updated.id,
        title: updated.title,
        category: updated.category,
        date: updated.date,
        imageUrl: updated.image_url,
        excerpt: updated.excerpt,
        content: updated.content,
        author: updated.author,
        authorAvatar: updated.author_avatar,
        redirectUrl: updated.redirect_url || "",
        likes: updated.likes || 0
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.patch("/api/blogs/:id", handleUpdateBlog);
  app.put("/api/blogs/:id", handleUpdateBlog);
  app.get("/api/users", async (_req, res) => {
    try {
      const result = await pool.query("SELECT id, name, email, role, status, avatar, joined_date, threads_count FROM users ORDER BY created_at ASC");
      const users = result.rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        avatar: u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        joinedDate: u.joined_date || "Recent",
        threadsCount: u.threads_count || 0
      }));
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/users", async (req, res) => {
    try {
      const { name, email, password, role, avatar } = req.body;
      const id = `usr-${Date.now()}`;
      const joinedDate = "Just now";
      const insertRes = await pool.query(`
        INSERT INTO users (id, name, email, password, role, status, avatar, joined_date, threads_count)
        VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, 0)
        RETURNING id, name, email, role, status, avatar, joined_date, threads_count
      `, [id, name, email, password || "admin123", role || "User", avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", joinedDate]);
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { role, status } = req.body;
      const fields = [];
      const values = [];
      let idx = 1;
      if (role !== void 0) {
        fields.push(`role = $${idx++}`);
        values.push(role);
      }
      if (status !== void 0) {
        fields.push(`status = $${idx++}`);
        values.push(status);
      }
      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}`, values);
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const { email, name, currentLoggedInEmail } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanName = (name || "").trim();
      const cleanCurrent = (currentLoggedInEmail || "").trim().toLowerCase();
      if (cleanCurrent) {
        return res.status(409).json({
          error: `You are currently logged into an account (${cleanCurrent}). You cannot register or log into another account at the same time. Please log out first.`
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }
      const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "An account with this email address already exists. Please sign in." });
      }
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      await pool.query("DELETE FROM email_verifications WHERE LOWER(email) = $1", [cleanEmail]);
      await pool.query(`
        INSERT INTO email_verifications (id, email, code, created_at, expires_at)
        VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '15 minutes')
      `, [`vcode-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, cleanEmail, code]);
      console.log(`[Email Verification] Code for ${cleanEmail} (${cleanName}): ${code}`);
      let emailSent = false;
      let emailDeliveryError = null;
      const resendApiKey = process.env.RESEND_API_KEY?.trim();
      if (resendApiKey && resendApiKey !== "re_123456789") {
        try {
          const resend = new import_resend.Resend(resendApiKey);
          let fromAddress = process.env.EMAIL_FROM?.trim() || "Trek Consultancy Forum <onboarding@resend.dev>";
          const isUnverifiedPublicDomain = /@(gmail|yahoo|hotmail|outlook|icloud|live|aol|msn)\.com/i.test(fromAddress);
          if (fromAddress.includes("yourdomain.com") || isUnverifiedPublicDomain) {
            if (isUnverifiedPublicDomain) {
              console.warn(`[Resend Notice] Sender '${fromAddress}' uses a public mailbox domain (@gmail/@yahoo/etc.) which cannot be verified on Resend. Falling back to 'Trek Consultancy Forum <onboarding@resend.dev>'. To send from a custom domain, add and verify your domain at https://resend.com/domains.`);
            }
            fromAddress = "Trek Consultancy Forum <onboarding@resend.dev>";
          }
          const { data: resendData, error: resendError } = await resend.emails.send({
            from: fromAddress,
            to: cleanEmail,
            subject: `${code} is your Trek Consultancy Forum verification code`,
            text: `Your Trek Consultancy Forum verification code is: ${code}

This code will expire in 15 minutes.
If you did not request this code, you can safely ignore this email.`,
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
                              Hello${cleanName ? ` <strong>${cleanName}</strong>` : ""},<br>
                              Thank you for registering with <strong>Trek Consultancy Forum</strong>. Please use the following 6-digit confirmation code to complete your verification:
                            </p>
                            <div style="background-color: #f0fdfa; border: 1.5px dashed #00a8b5; border-radius: 14px; padding: 18px 24px; text-align: center; margin: 24px 0;">
                              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d9488; display: inline-block;">
                                ${code}
                              </span>
                            </div>
                            <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
                              \u23F1\uFE0F This code will expire in <strong>15 minutes</strong>.<br>
                              If you did not request this email, please disregard it \u2014 no account will be created without this code.
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
            console.error("[Resend Error]:", resendError);
            emailDeliveryError = resendError.message;
          } else {
            emailSent = true;
            console.log(`[Resend Success] OTP email sent to ${cleanEmail} (ID: ${resendData?.id})`);
          }
        } catch (resendEx) {
          console.error("[Resend Exception]:", resendEx?.message);
          emailDeliveryError = resendEx?.message;
        }
      }
      const isPlaceholderOrMissing = !resendApiKey || resendApiKey === "re_123456789";
      let responseMessage = `A 6-digit verification code was generated for ${cleanEmail}.`;
      if (emailSent) {
        responseMessage = `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`;
      } else if (emailDeliveryError && emailDeliveryError.includes("You can only send testing emails to your own email address")) {
        responseMessage = `Resend Test Mode: Real emails can only be sent to your registered Resend email until your domain is verified at resend.com/domains. Use the preview code below to continue testing.`;
      } else if (emailDeliveryError) {
        responseMessage = `Code generated, but email delivery encountered an error: ${emailDeliveryError}`;
      } else if (isPlaceholderOrMissing) {
        responseMessage = `A 6-digit verification code was generated for ${cleanEmail}. (Development preview mode active)`;
      }
      res.json({
        success: true,
        message: responseMessage,
        previewCode: emailSent ? void 0 : code,
        emailSent
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, verificationCode, currentLoggedInEmail, sessionId } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanName = (name || "").trim() || cleanEmail.split("@")[0];
      const cleanPass = (password || "").trim();
      const cleanCode = (verificationCode || "").trim();
      const cleanCurrent = (currentLoggedInEmail || "").trim().toLowerCase();
      const cleanSession = (sessionId || "").trim();
      if (cleanCurrent) {
        return res.status(409).json({
          error: `An account (${cleanCurrent}) is already logged in on this session. You cannot create or sign into another account at the same time. Please log out first.`
        });
      }
      if (!cleanEmail || !cleanPass) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      if (!cleanCode) {
        return res.status(400).json({ error: "Please enter the 6-digit verification code sent to your email." });
      }
      const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }
      const vRes = await pool.query(`
        SELECT * FROM email_verifications
        WHERE LOWER(email) = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [cleanEmail]);
      if (vRes.rows.length === 0) {
        return res.status(400).json({ error: "No verification code found. Please request a new code." });
      }
      const vRecord = vRes.rows[0];
      const now = /* @__PURE__ */ new Date();
      if (new Date(vRecord.expires_at) < now) {
        return res.status(400).json({ error: "The verification code has expired. Please request a new code." });
      }
      if (vRecord.code !== cleanCode) {
        return res.status(400).json({ error: "Invalid verification code. Please check the code and try again." });
      }
      await pool.query("DELETE FROM email_verifications WHERE LOWER(email) = $1", [cleanEmail]);
      const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = getRandomAvatar(cleanEmail || cleanName);
      const joinedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const insertRes = await pool.query(`
        INSERT INTO users (id, name, email, password, role, status, avatar, joined_date, threads_count, email_verified)
        VALUES ($1, $2, $3, $4, 'User', 'active', $5, $6, 0, true)
        RETURNING id, name, email, role, status, avatar, joined_date, threads_count, email_verified
      `, [id, cleanName, cleanEmail, cleanPass, avatar, joinedDate]);
      if (cleanSession) {
        try {
          await pool.query(`
            UPDATE conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE id = $4 OR session_id = $4
          `, [id, cleanEmail, cleanName, cleanSession]);
          await pool.query(`
            UPDATE messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE conversation_id = $3 OR session_id = $3
          `, [id, cleanEmail, cleanSession]);
          await pool.query(`
            UPDATE support_conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE id = $4
          `, [id, cleanEmail, cleanName, cleanSession]);
          await pool.query(`
            UPDATE support_messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE session_id = $3
          `, [id, cleanEmail, cleanSession]);
        } catch (claimErr) {
          console.error("Failed to claim guest conversation on register:", claimErr);
        }
      }
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Joined Community', $2, 'User Registration', 'Just now', 'user')
      `, [`act-${Date.now()}`, cleanName]);
      res.status(201).json({
        success: true,
        user: insertRes.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, currentLoggedInEmail, sessionId } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPass = (password || "").trim();
      const cleanCurrent = (currentLoggedInEmail || "").trim().toLowerCase();
      const cleanSession = (sessionId || "").trim();
      if (cleanCurrent && cleanCurrent !== cleanEmail) {
        return res.status(409).json({
          error: `An account (${cleanCurrent}) is already active. You cannot log into another account at the same time. Please sign out first.`
        });
      }
      const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [cleanEmail]);
      if (userRes.rows.length === 0) {
        if ((cleanEmail === "admin@trekconsultancy.com" || cleanEmail === "admin@amacommunity.io") && cleanPass === "admin123") {
          return res.json({
            success: true,
            user: {
              id: "usr-admin",
              name: "Administrator",
              email: cleanEmail,
              role: "Super Admin",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            }
          });
        }
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const user = userRes.rows[0];
      if (user.password !== cleanPass) {
        return res.status(401).json({ error: "Invalid password. Access denied." });
      }
      if (user.status === "suspended") {
        return res.status(403).json({ error: "This account is suspended." });
      }
      if (cleanSession) {
        try {
          await pool.query(`
            UPDATE conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE id = $4 OR session_id = $4
          `, [user.id, cleanEmail, user.name, cleanSession]);
          await pool.query(`
            UPDATE messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE conversation_id = $3 OR session_id = $3
          `, [user.id, cleanEmail, cleanSession]);
          await pool.query(`
            UPDATE support_conversations
            SET user_id = $1, user_email = $2, user_name = COALESCE(user_name, $3), is_guest = FALSE, updated_at = NOW()
            WHERE id = $4
          `, [user.id, cleanEmail, user.name, cleanSession]);
          await pool.query(`
            UPDATE support_messages
            SET user_id = $1, user_email = $2, is_guest = FALSE
            WHERE session_id = $3
          `, [user.id, cleanEmail, cleanSession]);
        } catch (claimErr) {
          console.error("Failed to claim guest conversation on login:", claimErr);
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/newsletter", async (_req, res) => {
    try {
      const result = await pool.query("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return res.status(400).json({ error: "A valid email address is required." });
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
      res.status(201).json({ success: true, message: "Successfully subscribed to the newsletter!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/support/faqs", async (req, res) => {
    try {
      const q = (req.query.q || "").trim().toLowerCase();
      const categoryId = req.query.category || "";
      const lang = req.query.lang || "en";
      let catQuery = "SELECT * FROM faq_categories ORDER BY name ASC";
      const catRes = await pool.query(catQuery);
      let faqsQuery = `
        SELECT f.id, f.category_id as "categoryId", f.question, f.answer, f.question_bn as "questionBn", f.answer_bn as "answerBn", f.status, c.name as "categoryName"
        FROM faqs f
        LEFT JOIN faq_categories c ON f.category_id = c.id
        WHERE f.status = 'published'
      `;
      const queryParams = [];
      if (categoryId && categoryId !== "all") {
        queryParams.push(categoryId);
        faqsQuery += ` AND f.category_id = $${queryParams.length}`;
      }
      if (q) {
        queryParams.push(`%${q}%`);
        const pIdx = queryParams.length;
        faqsQuery += ` AND (LOWER(f.question) LIKE $${pIdx} OR LOWER(f.answer) LIKE $${pIdx} OR LOWER(COALESCE(f.question_bn, '')) LIKE $${pIdx} OR LOWER(COALESCE(f.answer_bn, '')) LIKE $${pIdx})`;
      }
      faqsQuery += " ORDER BY f.created_at ASC";
      const faqsRes = await pool.query(faqsQuery, queryParams);
      res.json({
        categories: catRes.rows,
        faqs: faqsRes.rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/support/knowledge", async (req, res) => {
    try {
      const q = (req.query.q || "").trim().toLowerCase();
      let query = "SELECT id, title, content, category, status FROM knowledge_documents WHERE status = 'published'";
      const params = [];
      if (q) {
        params.push(`%${q}%`);
        query += ` AND (LOWER(title) LIKE $1 OR LOWER(content) LIKE $1)`;
      }
      query += " ORDER BY created_at ASC";
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/support/tickets", async (req, res) => {
    try {
      const sessionId = req.query.sessionId || "";
      const userEmail = req.query.email || "";
      let query = `
        SELECT id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
               subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo",
               created_at as "createdAt", answered_at as "answeredAt"
        FROM support_tickets
      `;
      const params = [];
      if (userEmail || sessionId) {
        if (userEmail && sessionId) {
          params.push(userEmail, sessionId);
          query += " WHERE LOWER(user_email) = LOWER($1) OR session_id = $2";
        } else if (userEmail) {
          params.push(userEmail);
          query += " WHERE LOWER(user_email) = LOWER($1)";
        } else {
          params.push(sessionId);
          query += " WHERE session_id = $1";
        }
      }
      query += " ORDER BY created_at DESC LIMIT 50";
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/support/tickets", async (req, res) => {
    try {
      const { userEmail, userWhatsapp, subject, question, priority, sessionId, userId } = req.body;
      if (!question || !question.trim()) {
        return res.status(400).json({ error: "Question content is required to create a ticket." });
      }
      const ticketNum = `TKT-${Math.floor(1e3 + Math.random() * 9e3)}`;
      const id = `tkt-${Date.now()}`;
      const cleanEmail = (userEmail || "").trim() || "guest@trekconsultancy.com";
      const cleanWhatsapp = (userWhatsapp || "").trim() || null;
      const cleanSubj = (subject || "").trim() || question.trim().slice(0, 60) + "...";
      const cleanPriority = priority || "Normal";
      const cleanSession = sessionId || "default-session";
      const insertRes = await pool.query(`
        INSERT INTO support_tickets (id, ticket_number, user_id, user_email, user_whatsapp, session_id, conversation_id, subject, question, priority, status, assigned_to)
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, 'OPEN', 'Community Staff')
        RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", user_whatsapp as "userWhatsapp", session_id as "sessionId",
                  conversation_id as "conversationId", subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo", created_at as "createdAt"
      `, [id, ticketNum, userId || null, cleanEmail, cleanWhatsapp, cleanSession, cleanSubj, question.trim(), cleanPriority]);
      try {
        await pool.query(`
          INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
          VALUES ($1, $2, $3, $4, 'Just now', 'support')
        `, [`act-${Date.now()}`, "Opened Support Ticket", cleanEmail, `#${ticketNum}`]);
      } catch (logErr) {
        console.warn("Failed to log ticket creation activity:", logErr);
      }
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/support/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId || "default";
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
        WHERE conversation_id = $1 OR session_id = $1
        ORDER BY created_at ASC
      `, [sessionId]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/support/user-conversations", async (req, res) => {
    try {
      const userId = req.query.userId || "";
      const email = (req.query.email || "").trim().toLowerCase();
      if (!userId && !email) {
        return res.status(400).json({ error: "userId or email is required." });
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/support/conversations/claim", async (req, res) => {
    try {
      const { sessionId, userId, userEmail, userName } = req.body;
      const cleanSession = (sessionId || "").trim();
      const cleanEmail = (userEmail || "").trim().toLowerCase();
      let cleanUserId = (userId || "").trim() || null;
      let cleanUserName = (userName || "").trim() || (cleanEmail ? cleanEmail.split("@")[0] : null);
      if (!cleanSession || !cleanEmail) {
        return res.status(400).json({ error: "sessionId and userEmail are required." });
      }
      if (cleanEmail) {
        try {
          const userMatch = await pool.query("SELECT id, name FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
          if (userMatch.rows.length > 0) {
            cleanUserId = userMatch.rows[0].id;
            if (!userName) cleanUserName = userMatch.rows[0].name;
          }
        } catch {
        }
      }
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
        RETURNING id as "sessionId", user_id as "userId", user_email as "userEmail", user_name as "userName", is_guest as "isGuest", message_count as "messageCount", updated_at as "updatedAt"
      `, [cleanSession, cleanUserId, cleanEmail, cleanUserName]);
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
      `, [cleanSession, cleanUserId, cleanEmail, cleanUserName]);
      await pool.query(`
        UPDATE messages
        SET user_id = $1, user_email = $2, is_guest = FALSE
        WHERE conversation_id = $3 OR session_id = $3
      `, [cleanUserId, cleanEmail, cleanSession]);
      await pool.query(`
        UPDATE support_messages
        SET user_id = $1, user_email = $2, is_guest = FALSE
        WHERE session_id = $3
      `, [cleanUserId, cleanEmail, cleanSession]);
      res.json({
        success: true,
        message: "Conversation successfully claimed and saved under user account.",
        conversation: convRes.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const STOPWORDS = /* @__PURE__ */ new Set([
    "how",
    "do",
    "does",
    "did",
    "i",
    "a",
    "an",
    "the",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "and",
    "or",
    "is",
    "are",
    "was",
    "were",
    "it",
    "its",
    "my",
    "your",
    "we",
    "our",
    "you",
    "me",
    "can",
    "could",
    "would",
    "will",
    "with",
    "about",
    "this",
    "that",
    "there",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "\u0995\u09BF",
    "\u0995\u09C0",
    "\u0995\u09BF\u09AD\u09BE\u09AC\u09C7",
    "\u0995\u09C7\u09A8",
    "\u0995\u0996\u09A8",
    "\u0995\u09CB\u09A5\u09BE\u09DF",
    "\u0995\u09CB\u09A8",
    "\u098F\u09AC\u0982",
    "\u09AC\u09BE",
    "\u098F\u09B0",
    "\u098F\u0995\u099F\u09BF",
    "\u098F\u0987",
    "\u09B8\u09C7\u0987",
    "\u0986\u09AE\u09BF",
    "\u0986\u09AA\u09A8\u09BF",
    "\u0986\u09AE\u09B0\u09BE",
    "kivabe",
    "ki",
    "korte",
    "korbo",
    "korben",
    "kore",
    "chai",
    "chan",
    "ache",
    "achhe",
    "ase",
    "asi",
    "te",
    "er",
    "r",
    "amader",
    "apnader",
    "amar",
    "apnar",
    "koro",
    "koren",
    "lagbe",
    "lage"
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
  }) {
    const lower = cleanMsg.toLowerCase();
    const userTurnsCombined = (conversationHistory || []).filter((m) => m.sender === "user").map((m) => m.message).join(" ");
    const isFollowUpQuery = /(next step|what next|what now|after that|then what|how long|how much|koto|tarpor|er por|pore ki|aro bolen|bistarito|details|tell me more|how to do that|kivabe korbo eta|etate|sheta|seta|koto din|koto taka|procedure|step by step|prothom dhap|porer dhap|what to do)\b/i.test(lower) || cleanMsg.split(/\s+/).length <= 4 && (lower.includes("next") || lower.includes("step") || lower.includes("then") || lower.includes("pore") || lower.includes("eta") || lower.includes("how") || lower.includes("kivabe") || lower.includes("koto") || lower.includes("dhap"));
    const contextualCombined = userTurnsCombined ? `${userTurnsCombined} ${cleanMsg}` : cleanMsg;
    const contextualLower = contextualCombined.toLowerCase();
    const allTokens = (isFollowUpQuery ? contextualLower : lower).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 1);
    const sigTokens = allTokens.filter((w) => !STOPWORDS.has(w));
    const bigrams = [];
    for (let i = 0; i < allTokens.length - 1; i++) {
      bigrams.push(`${allTokens[i]} ${allTokens[i + 1]}`);
    }
    const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|assalamu\s*alaikum|salam|hola|halo|হ্যালো|হাই|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*আছেন|কেমন\s*আসেন|kemon\s*achen|kemon\s*asen|kemon\s*acho|valo\s*achen|bhalo\s*achen|নমস্কার|আদাব)(\s*!|\s*\?|\s*$|\s+.*)/i.test(cleanMsg);
    const isNextStepQuery = /(next step|what next|what is the (very )?next|what should i do next|porer dhap|tarpor ki|pore ki|er por ki|পরের ধাপ|এরপর কি|এরপর করণীয়)/i.test(lower);
    const isCostQuery = /(cost|fee|fees|pricing|price|how much|khoroch|khroch|khoroc|taka|koto taka|খরচ|ফি|প্রাইসিং|বাজেট|কত টাকা|কত খরচ)/i.test(lower);
    const phoneMatch = cleanMsg.match(/(?:\+|00)?(?:\d[\s\-\.\(\)]*){8,15}\d/);
    const extractedPhone = phoneMatch ? phoneMatch[0].trim() : null;
    const emailMatch = cleanMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const extractedEmail = emailMatch ? emailMatch[0].trim() : null;
    const isContactProvided = Boolean(extractedPhone || extractedEmail && !extractedEmail.includes("default-session") && !extractedEmail.includes("guest@") && !extractedEmail.includes("client.trekconsultancy"));
    const isContactQuery = /(whatsapp|call you|call me|phone number|contact number|talk to (a )?human|talk to (a )?consultant|talk to someone|speak to (a )?human|speak to (a )?consultant|speak to advisor|meet in person|contact details|office address|location|হোয়াটসঅ্যাপ|ফোন নম্বর|যোগাযোগ|কথা বলতে চাই|হোয়াটসঅ্যাপে|অফিস কোথায়|ঠিকানা|কল করবেন|কল দিতে চাই|কথা বলব|দেখা করতে চাই|নাম্বার)/i.test(lower);
    const isBespokeQuery = /(custom quote|custom quotation|formal proposal|bespoke contract|sign nda|confidentiality agreement|enterprise contract|hire you|enterprise proposal|কাস্টম কোটেশন|ফরমাল প্রপোজাল|চুক্তি স্বাক্ষর)/i.test(lower);
    const isHowToPostQuery = /(how to (post|ask|create a topic|create a question|publish)|how do i (post|ask|publish)|পোস্ট করার নিয়ম|কিভাবে পোস্ট করব|কিভাবে প্রশ্ন করব|নতুন টপিক|প্রশ্ন পোস্ট|পোস্ট করব|kivabe post|post kivabe|post korar niyom|kivabe question|question kivabe|kivabe likhbo)/i.test(lower) || (lower.includes("kivabe") || lower.includes("how to") || lower.includes("kemne")) && (lower.includes("post") || lower.includes("question") || lower.includes("topic") || lower.includes("proshno"));
    const isRegistrationQuery = /(register|sign up|create account|login|sign in|password|otp|verification|নিবন্ধন|সাইন আপ|একাউন্ট তৈরি|লগইন|account khulbo|kivabe account|kivabe login|kivabe register|sign up kivabe)/i.test(lower);
    const isDeleteTopicQuery = /(delete|remove|permission to delete|who can delete|মুছে|ডিলিট|কে ডিলিট করতে পারবে|পোস্ট মুছব|post delete|kivabe delete|delete korbo)/i.test(lower);
    const isTechStackQuery = /(neon|postgres|docly|bbpress|database|persist|stack|থিম|ডাটাবেজ|পোস্টগ্রেস|tech stack|ki ki technology)/i.test(lower);
    const isAboutOrServices = /(what (services|do you do|can you do|is trek)|tell me about trek|about this platform|who are you|overview of trek|what is trek consultancy|কি কি সেবা|ট্রেক কি|ট্রেক কনসালটেন্সি কি|আপনাদের সার্ভিস|সার্ভিসসমূহ|পরিচয়|apnader service|service ki|ki ki service|ki service den|ki ki kaj koren)/i.test(lower);
    const isHelpQuery = /^(help|can you help|i need help|please help|what can you help me with|how can you assist|সাহায্য|সাহায্য করবেন|সহায়তা|sahajjo|sahayyo|help koren|help lagbe|help dorkar)(\s*!|\s*\?|\s*$|\s+.*)/i.test(lower) || (lower.includes("help") || lower.includes("\u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF") || lower.includes("sahajjo") || lower.includes("sahayyo")) && (lower.includes("amake") || lower.includes("koren") || lower.includes("please") || lower.includes("can you") || lower.includes("korben"));
    const isSaudiSetupQuery = /(saudi|misa|cr|commercial registration|company formation|business setup|riyadh|jeddah|foreign ownership|zatca|gosi|setup company|incorporat|সৌদি|ব্যবসা শুরু|কোম্পানি তৈরি|লাইসেন্স|মিসে|সিআর|saudi te business|business start|company khulte|company kivabe|saudi te company)/i.test(lower);
    const isSoftwareQuery = /(software|digital|website|web app|mobile app|erp|tech division|react|node|ai automation|coding|developer|সফটওয়্যার|ওয়েবসাইট|অ্যাপ|প্রযুক্তি|ডিজিটাল|ডেভেলপমেন্ট|website banate|app banate|software banate|software service)/i.test(lower);
    const isVisaQuery = /(visa|pro|iqama|work permit|investor visa|muqeem|qiwa|chamber of commerce|attestation|ভিসা|ইকামা|কাজের অনুমতি|ওয়ার্ক পারমিট|পিআরও|iqama renewal|visa kivabe|pro service)/i.test(lower);
    const isRealEstateQuery = /(real estate|property|buying property|commercial property|residential property|industrial property|lease|foreign ownership property|রিয়েল এস্টেট|সম্পত্তি|জমি|ফ্ল্যাট|বাড়ি|property kinte|office space)/i.test(lower);
    const isAccountingTaxQuery = /(accounting|audit|tax|vat|zatca|payroll|hr|bookkeeping|financial audit|হিসাব|অডিট|ট্যাক্স|ভ্যাট|হিসাবরক্ষণ|বেতন|tax kivabe|vat kivabe|audit service)/i.test(lower);
    const isInternationalQuery = /(international|usa|uk|canada|global banking|delaware|wyoming|mercury|wise|offshore|আন্তর্জাতিক|আমেরিকা|ইউকে|কানাডা|ব্যাংক একাউন্ট|usa te|uk te|canada te|global bank)/i.test(lower);
    if (isGreeting) {
      if (userLang === "bn") {
        return {
          reply: `\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09B0 / \u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE! **${forumName}** \u098F\u0986\u0987 \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964

\u0986\u09AE\u09BF \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u099F\u09CD\u09B0\u09C7\u0995\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09A8\u09B2\u09C7\u099C \u09AC\u09C7\u09B8 \u0993 \u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u099C\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF:

1. **\u09B8\u09CC\u09A6\u09BF \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B8\u09C7\u099F\u0986\u09AA**: \u09E7\u09E6\u09E6% \u09AB\u09B0\u09C7\u09A8 \u0993\u09A8\u09BE\u09B0\u09B6\u09BF\u09AA, MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8, \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR) \u098F\u09AC\u0982 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F
2. **\u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8\u09B8**: \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0987\u0986\u09B0\u09AA\u09BF, \u0993\u09AF\u09BC\u09C7\u09AC \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09CD\u09B2\u09BF\u0995\u09C7\u09B6\u09A8 \u09A1\u09C7\u09AD\u09C7\u09B2\u09AA\u09AE\u09C7\u09A8\u09CD\u099F \u098F\u09AC\u0982 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0
3. **\u09AD\u09BF\u09B8\u09BE \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u09B8\u09C7\u09AC\u09BE**: \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F, \u0987\u0995\u09BE\u09AE\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982 \u098F\u09AC\u0982 Qiwa/Muqeem \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09AE\u09C7\u09A8\u09CD\u099F
4. **\u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F**: \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995, \u0986\u09AC\u09BE\u09B8\u09BF\u0995 \u0993 \u09B6\u09BF\u09B2\u09CD\u09AA \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u0995\u09CD\u09B0\u09DF \u098F\u09AC\u0982 \u09B2\u09BF\u099C \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6
5. **\u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F**: \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09B8, \u0985\u09A1\u09BF\u099F, ZATCA \u09AD\u09CD\u09AF\u09BE\u099F \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8 \u098F\u09AC\u0982 \u098F\u0987\u099A\u0986\u09B0/\u09AA\u09C7\u09B0\u09CB\u09B2
6. **\u09AB\u09CB\u09B0\u09BE\u09AE \u0995\u09AE\u09BF\u0989\u09A8\u09BF\u099F\u09BF**: \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09BE, \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u0986\u09B2\u09CB\u099A\u09A8\u09BE

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AC\u09BE \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF\u09A4\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09B2\u09BF\u0996\u09C1\u09A8, \u0986\u09AE\u09BF \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AC\u09C1\u099D\u09BF\u09DF\u09C7 \u09AC\u09B2\u099B\u09BF!`,
          source: "AI"
        };
      }
      return {
        reply: `Hello and welcome to **${forumName}**! I am your 24/7 AI Consultant & Support Assistant.

I am fully equipped with our verified knowledge base to answer questions across our core service pillars:

1. **Saudi Business Setup**: 100% foreign ownership, MISA licensing, Commercial Registration (CR), and corporate banking
2. **Software & Digital Solutions**: Custom software, enterprise ERPs, cloud architecture, and fullstack apps
3. **Visa & PRO Government Liaison**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem compliance
4. **Real Estate Investment**: Commercial, residential, and industrial property buying & leasing advisory
5. **Corporate & Financial Support**: Bookkeeping, statutory audits, ZATCA Phase 2 e-invoicing, VAT & tax filings
6. **Community Forum**: Posting questions, exploring engineering topics, and collaborating

Feel free to ask any specific question, and I'll be glad to help you right away!`,
        source: "AI"
      };
    }
    if (isHowToPostQuery) {
      if (userLang === "bn") {
        return {
          reply: `\u09AB\u09CB\u09B0\u09BE\u09AE\u09C7 \u09A8\u09A4\u09C1\u09A8 \u0986\u09B2\u09CB\u099A\u09A8\u09BE \u09AC\u09BE \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09BE\u09B0 \u09B8\u09B9\u099C \u09A8\u09BF\u09DF\u09AE:

1. \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u09AC\u09BE\u09AE \u09AA\u09BE\u09B6\u09C7\u09B0 \u09B8\u09BE\u0987\u09A1\u09AC\u09BE\u09B0\u09C7 \u09AC\u09BE \u09AE\u09C2\u09B2 \u09AB\u09CB\u09B0\u09BE\u09AE \u09AA\u09C7\u099C\u09C7 **"+ Post a Question"** \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8\u0964
2. \u09A1\u09CD\u09B0\u09AA\u09A1\u09BE\u0989\u09A8 \u09A5\u09C7\u0995\u09C7 \u09AA\u09CD\u09B0\u09BE\u09B8\u0999\u09CD\u0997\u09BF\u0995 **Category** (\u09AF\u09C7\u09AE\u09A8 Architecture, Cloud, DevOps, Business Setup \u0987\u09A4\u09CD\u09AF\u09BE\u09A6\u09BF) \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964
3. \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u098F\u0995\u099F\u09BF \u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u098F\u09AC\u0982 \u09A4\u09A5\u09CD\u09AF\u09AC\u09B9\u09C1\u09B2 **Title** \u09B2\u09BF\u0996\u09C1\u09A8\u0964
4. \u09AE\u09C2\u09B2 \u09AC\u09BF\u09AC\u09B0\u09A3\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09AC\u09BE \u0986\u09B2\u09CB\u099A\u09A8\u09BE\u09B0 \u09AC\u09BF\u09B7\u09DF \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4\u09AD\u09BE\u09AC\u09C7 \u09A4\u09C1\u09B2\u09C7 \u09A7\u09B0\u09C1\u09A8\u0964
5. **"Publish Question"** \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09B2\u09C7\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F\u099F\u09BF \u09B2\u09BE\u0987\u09AD \u09B9\u09DF\u09C7 \u09AF\u09BE\u09AC\u09C7 \u098F\u09AC\u0982 \u0995\u09AE\u09BF\u0989\u09A8\u09BF\u099F\u09BF\u09B0 \u09B8\u09A6\u09B8\u09CD\u09AF \u0993 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0987\u099E\u09CD\u099C\u09BF\u09A8\u09BF\u09DF\u09BE\u09B0\u09B0\u09BE \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964

\u{1F4CC} \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09CB\u09A8\u09CB \u099F\u09C7\u0995\u09A8\u09BF\u0995\u09CD\u09AF\u09BE\u09B2 \u09AC\u09BE \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AC\u09BF\u09B7\u09DF\u0995 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09A5\u09BE\u0995\u09B2\u09C7 \u098F\u0996\u09A8\u0987 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u098F\u0995\u099F\u09BF \u09A5\u09CD\u09B0\u09C7\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!`,
          source: "FAQ"
        };
      }
      return {
        reply: `Here is how to create a discussion thread or ask a question on our forum:

1. Click the **"+ Post a Question"** button located in the sidebar or forum header.
2. Choose the most appropriate **Category** (e.g., Cloud Architecture, Business Setup, DevOps, Software).
3. Provide a clear, descriptive **Title** summarizing your question.
4. Type your detailed question or technical challenge in the content editor.
5. Click **"Publish Question"** to make your thread live immediately.

Our community engineers, senior consultants, and fellow developers will be able to read and reply to your post!`,
        source: "FAQ"
      };
    }
    if (isRegistrationQuery) {
      if (userLang === "bn") {
        return {
          reply: `\u09AB\u09CB\u09B0\u09BE\u09AE\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0993 \u09B8\u09BE\u0987\u09A8-\u0987\u09A8 \u0995\u09B0\u09BE\u09B0 \u09A8\u09BF\u09DF\u09AE:

1. \u0989\u09AA\u09B0\u09C7\u09B0 \u09AE\u09C7\u09A8\u09C1\u09AC\u09BE\u09B0\u09C7 **"Sign In"** \u0985\u09A5\u09AC\u09BE **"Login or Register"** \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8\u0964
2. \u09A8\u09A4\u09C1\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u09B9\u09B2\u09C7 **"Register"** \u099F\u09CD\u09AF\u09BE\u09AC\u09C7 \u0997\u09BF\u09DF\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE, \u0987\u09AE\u09C7\u0987\u09B2 \u0993 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964
3. \u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u098F\u0995\u099F\u09BF \u09EC-\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u0993\u099F\u09BF\u09AA\u09BF (OTP) \u09AD\u09C7\u09B0\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u0995\u09CB\u09A1 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09AC\u09C7\u0964
4. \u0995\u09CB\u09A1\u099F\u09BF \u09A6\u09BF\u09DF\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B8\u0995\u09CD\u09B0\u09BF\u09DF \u0995\u09B0\u09B2\u09C7\u0987 \u0986\u09AA\u09A8\u09BF \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09A4\u09C7, \u09B2\u09BE\u0987\u0995 \u09A6\u09BF\u09A4\u09C7 \u0993 \u0989\u09A4\u09CD\u09A4\u09B0 \u09B2\u09BF\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964

\u{1F4A1} \u0995\u09CB\u09A8\u09CB \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AD\u09C1\u09B2\u09C7 \u0997\u09C7\u09B2\u09C7 \u09AA\u09C1\u09A8\u09B0\u09BE\u09DF \u0987\u09AE\u09C7\u0987\u09B2 \u09AD\u09C7\u09B0\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964`,
          source: "FAQ"
        };
      }
      return {
        reply: `Here is how to register and sign in to the Trek Consultancy Forum:

1. Click the **"Sign In"** or **"Login or Register"** button in the top navigation bar.
2. Switch to the **Register** tab and input your full name, email address, and secure password.
3. A 6-digit OTP email verification code will be sent to your inbox to verify your account.
4. Enter the verification code, and your account will be activated instantly with full permissions to post questions, submit replies, and like community solutions!

\u{1F4A1} Existing users can simply log in with their registered email and password anytime.`,
        source: "FAQ"
      };
    }
    if (isDeleteTopicQuery) {
      if (userLang === "bn") {
        return {
          reply: `\u09AB\u09CB\u09B0\u09BE\u09AE\u09C7\u09B0 \u09AA\u09CB\u09B8\u09CD\u099F \u0993 \u09AC\u09BF\u09B7\u09DF\u09AC\u09B8\u09CD\u09A4\u09C1 \u09AE\u09CB\u099B\u09BE\u09B0 \u09A8\u09BF\u09DF\u09AE\u09BE\u09AC\u09B2\u09C0:

- **\u09B2\u09C7\u0996\u0995 \u09AC\u09BE \u0985\u09A5\u09B0 (Author)**: \u0986\u09AA\u09A8\u09BF \u09AF\u09C7 \u09AA\u09CB\u09B8\u09CD\u099F\u099F\u09BF \u09A8\u09BF\u099C\u09C7 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C7\u099B\u09C7\u09A8, \u09B6\u09C1\u09A7\u09C1\u09AE\u09BE\u09A4\u09CD\u09B0 \u09B8\u09C7\u0987 \u09AA\u09CB\u09B8\u09CD\u099F\u099F\u09BF\u09B0 \u0993\u09AA\u09B0 \u09A1\u09BF\u09B2\u09BF\u099F \u09AC\u09BE\u099F\u09A8 \u09A6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u09AC\u09C7\u09A8 \u098F\u09AC\u0982 \u09A8\u09BF\u099C\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964
- **\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u099F\u09B0 \u0993 \u09AE\u09A1\u09BE\u09B0\u09C7\u099F\u09B0**: \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AC\u09BE \u09AE\u09A1\u09BE\u09B0\u09C7\u099F\u09B0\u0997\u09A3 \u0995\u09AE\u09BF\u0989\u09A8\u09BF\u099F\u09BF\u09B0 \u09A8\u09BF\u09DF\u09AE\u09BE\u09AC\u09B2\u09C0 \u09AC\u099C\u09BE\u09DF \u09B0\u09BE\u0996\u09A4\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CB\u09B8\u09CD\u099F \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0993 \u09AE\u09C1\u099B\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964
- \u0985\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09C8\u09B0\u09BF \u09AA\u09CB\u09B8\u09CD\u099F \u09A1\u09BF\u09B2\u09BF\u099F \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE\u0964`,
          source: "FAQ"
        };
      }
      return {
        reply: `Here are the deletion and authorization rules for our forum:

- **Post Author**: You can delete any discussion thread that you personally authored.
- **Administrators & Moderators**: Staff with administrative privileges have moderation authority to remove spam or non-compliant posts.
- **Other Members**: Regular members cannot delete or alter topics created by other users.

This ensures complete ownership and data integrity for all community discussions.`,
        source: "FAQ"
      };
    }
    if (isNextStepQuery) {
      if (contextualLower.includes("saudi") || contextualLower.includes("riyadh") || contextualLower.includes("firm") || contextualLower.includes("company") || contextualLower.includes("business") || contextualLower.includes("setup") || contextualLower.includes("misa") || contextualLower.includes("it") || contextualLower.includes("consult")) {
        if (userLang === "bn") {
          return {
            reply: `\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8\u09C7\u09B0 \u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u09A7\u09BE\u09B0\u09BE\u09AC\u09BE\u09B9\u09BF\u0995 \u09A7\u09BE\u09AA\u09B8\u09AE\u09C2\u09B9:

\u09E7. **\u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u0993 \u09B8\u09A4\u09CD\u09AF\u09BE\u09DF\u09A8**: \u09AE\u09C2\u09B2 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u09B8\u09BF\u0986\u09B0 \u0993 \u0985\u09A1\u09BF\u099F\u09C7\u09A1 \u09AB\u09BE\u0987\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8\u09BF\u09DF\u09BE\u09B2 \u09B8\u09CD\u099F\u09C7\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u098F\u09AC\u0982 \u09AA\u09B0\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF/\u09B8\u09CC\u09A6\u09BF \u09A6\u09C2\u09A4\u09BE\u09AC\u09BE\u09B8 \u0995\u09B0\u09CD\u09A4\u09C3\u0995 \u09B8\u09A4\u09CD\u09AF\u09BE\u09DF\u09A8\u0964
\u09E8. **MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u0986\u09AC\u09C7\u09A6\u09A8**: \u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 Ministry of Investment \u09A5\u09C7\u0995\u09C7 \u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u09B8\u0982\u0997\u09CD\u09B0\u09B9 (\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3\u09A4 \u09E9\u2013\u09ED \u0995\u09BE\u09B0\u09CD\u09AF\u09A6\u09BF\u09AC\u09B8)\u0964
\u09E9. **\u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR) \u0993 AoA**: \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF (MoC) \u09A5\u09C7\u0995\u09C7 \u09B8\u09BF\u0986\u09B0 \u0987\u09B8\u09CD\u09AF\u09C1 \u098F\u09AC\u0982 \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09AA\u09BE\u09AC\u09B2\u09BF\u0995\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09B0\u09CD\u099F\u09BF\u0995\u09C7\u09B2\u09B8 \u0985\u09AB \u0985\u09CD\u09AF\u09BE\u09B8\u09CB\u09B8\u09BF\u09DF\u09C7\u09B6\u09A8 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964
\u09EA. **\u09B8\u09CC\u09A6\u09BF \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 \u0993 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F**: \u09B0\u09BF\u09DF\u09BE\u09A6 \u09AC\u09BE \u099C\u09C7\u09A6\u09CD\u09A6\u09BE\u09DF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u098F\u09AC\u0982 \u09B8\u09CC\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u099A\u09BE\u09B2\u09C1\u0964
\u09EB. **\u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u0993 \u09AD\u09BF\u09B8\u09BE**: ZATCA, GOSI, Qiwa \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u09B6\u09A8 \u098F\u09AC\u0982 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u09B2 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09BE\u09B0/\u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE \u0993 \u0987\u0995\u09BE\u09AE\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982\u0964

\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09AA\u09CD\u09B0\u09A5\u09AE \u09A7\u09BE\u09AA\u2014\u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u0993 \u09AA\u09BE\u0993\u09DF\u09BE\u09B0 \u0985\u09AC \u0985\u09CD\u09AF\u09BE\u099F\u09B0\u09CD\u09A8\u09BF (POA)\u2014\u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C7 \u09B6\u09C7\u09B7 \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09BE\u09B0\u09CD\u09AC\u09BF\u0995 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09AC\u09C7\u0964 \u0986\u09AA\u09A8\u09BF \u0995\u09BF \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u0995\u09BE\u0997\u099C\u09AA\u09A4\u09CD\u09B0 \u09A8\u09BF\u09DF\u09C7 \u0986\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u09A8?`,
            source: "AI"
          };
        }
        return {
          reply: `Here are the sequential next steps to proceed with your company formation in Saudi Arabia:

1. **Document Preparation & Attestation**: Legalize parent company Commercial Registration and audited financial statements via notary, MOFA, and Saudi Embassy (or individual investor credentials).
2. **MISA Investment License Application**: Trek Consultancy files and expedites your 100% foreign investment license with the Ministry of Investment (issued in 3 to 7 business days).
3. **Commercial Registration (CR) & Articles (AoA)**: Register your entity charter with the Ministry of Commerce and legalize Articles of Association through an authorized Saudi notary.
4. **National Address & Corporate Banking**: Establish your official Saudi National Address (SPL) in Riyadh/Jeddah and open your business bank account.
5. **Tax & Labor Portal Activations**: Activate ZATCA (tax/VAT), GOSI (social insurance), and Qiwa/Muqeem to issue General Manager & investor visas/Iqamas.

Trek Consultancy manages this entire turnkey cycle. Would you like assistance preparing your initial document checklist and Power of Attorney (POA)?`,
          source: "AI"
        };
      }
    }
    if (isCostQuery && (lower.includes("saudi") || lower.includes("company") || lower.includes("setup") || lower.includes("misa") || lower.includes("business") || contextualLower.includes("saudi") || contextualLower.includes("company") || contextualLower.includes("misa") || contextualLower.includes("firm"))) {
      if (userLang === "bn") {
        return {
          reply: `\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8\u09C7\u09B0 \u0996\u09B0\u099A \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AB\u09BF\u09B0 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA:

\u09E7. **MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u09AB\u09BF**: \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u099F\u0986\u09AA \u09AC\u09BE \u098F\u09B8\u098F\u09AE\u0987 (SME) \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09A4\u09C7 \u09AA\u09CD\u09B0\u09A5\u09AE \u09AC\u099B\u09B0\u09C7\u09B0 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AB\u09BF \u09AA\u09CD\u09B0\u09BE\u09AF\u09BC \u09E8,\u09E6\u09E6\u09E6 \u098F\u09B8\u098F\u0986\u09B0 (SAR)\u0964 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 \u09A8\u09BF\u09AF\u09BC\u09AE\u09BF\u09A4 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AB\u09BF \u09AA\u09CD\u09B0\u09AF\u09CB\u099C\u09CD\u09AF\u0964
\u09E8. **\u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR) \u0993 \u099A\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u0985\u09AB \u0995\u09AE\u09BE\u09B0\u09CD\u09B8**: \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE \u0993 \u09AE\u09C2\u09B2\u09A7\u09A8\u09C7\u09B0 \u0993\u09AA\u09B0 \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF \u0995\u09B0\u09C7 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3\u09A4 \u09E7,\u09E8\u09E6\u09E6 \u2013 \u09E8,\u09EB\u09E6\u09E6 \u098F\u09B8\u098F\u0986\u09B0\u0964
\u09E9. **\u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 \u0993 \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8 (Ejari)**: \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C \u09AC\u09BE \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09AF\u09BC\u09BF\u0995 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u09AB\u09BF\u0964
\u09EA. **ZATCA \u0993 GOSI \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8**: \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AC\u09BF\u09A8\u09BE\u09AE\u09C2\u09B2\u09CD\u09AF\u09C7\u0964
\u09EB. **\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u09B2 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09BE\u09B0 \u09AD\u09BF\u09B8\u09BE \u0993 \u0987\u0995\u09BE\u09AE\u09BE**: \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8\u09BF \u09AA\u09BE\u09B0\u09AE\u09BF\u099F \u0993 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09B2\u09C7\u09AD\u09BF \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3\u09A4 \u09EF,\u09EB\u09E6\u09E6 \u2013 \u09E7\u09E6,\u09E6\u09E6\u09E6 \u098F\u09B8\u098F\u0986\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9\u09C0\u09B0 \u099C\u09A8\u09CD\u09AF\u0964
\u09EC. **\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8 \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C**: \u0986\u09AE\u09B0\u09BE \u0986\u0987\u09A8\u09BF \u0996\u09B8\u09A1\u09BC\u09BE, \u09AA\u09B0\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09AF\u09BC \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981, \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0993 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F \u099A\u09BE\u09B2\u09C1\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9 \u0995\u09B0\u09BF\u0964

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09B0\u09BF\u0995\u09B2\u09CD\u09AA\u09BF\u09A4 \u0996\u09BE\u09A4\u09C7\u09B0 (\u09AF\u09C7\u09AE\u09A8 \u0986\u0987\u099F\u09BF, \u099F\u09CD\u09B0\u09C7\u09A1\u09BF\u0982 \u09AC\u09BE \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8) \u0993\u09AA\u09B0 \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF \u0995\u09B0\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09AC\u09BE\u099C\u09C7\u099F \u099C\u09BE\u09A8\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!`,
          source: "FAQ"
        };
      }
      return {
        reply: `Here is the comprehensive cost and fee breakdown for establishing a company in Saudi Arabia:

1. **MISA Investment License Fee**: For qualifying startups and SMEs, the initial first-year Ministry of Investment fee starts at approximately **2,000 SAR**. Standard commercial/service licenses follow standard statutory rates.
2. **Commercial Registration (CR) & Chamber of Commerce**: Typically ranges between **1,200 SAR to 2,500 SAR** depending on activities and capital structure.
3. **National Address & Certified Office (Ejari)**: Commercial lease or verified business address registration required by the Ministry of Commerce.
4. **ZATCA & GOSI Registrations**: Completely free governmental portal activations.
5. **General Manager Visa & Iqama**: Annual governmental residency and work permit levies (typically **9,500 \u2013 10,000 SAR** per executive).
6. **Trek Consultancy Turn-Key Advisory**: Complete legal drafting, MOFA liaison, banking facilitation, and government portal administration packages.

Because exact government fees vary depending on the chosen commercial activity and capital tier, Trek Consultancy provides customized commercial proposals. Let us know your planned industry for an itemized estimate!`,
        source: "FAQ"
      };
    }
    if (isContactProvided) {
      const contactVal = extractedPhone || extractedEmail;
      if (userLang === "bn") {
        return {
          reply: `\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF\u099F\u09BF (${contactVal}) \u0986\u09AE\u09BF \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u0987\u099C\u09B0\u09BF \u0993 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995\u09C7 \u09A8\u09A5\u09BF\u09AD\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C7\u099B\u09BF\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u098F\u0995\u099C\u09A8 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 WhatsApp \u09AC\u09BE \u09AB\u09CB\u09A8\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09AC\u09C7\u09A8\u0964

\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09BE\u09B0 \u09AA\u09C2\u09B0\u09CD\u09AC\u09C7, \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8, \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09BF\u0982 \u09AC\u09BE \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0995\u09CB\u09A8\u09CB \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09A4\u09A5\u09CD\u09AF \u09A8\u09BF\u09DF\u09C7 \u0986\u09AE\u09BF \u0995\u09BF \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u098F\u0996\u09A8\u0987 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09AC\u09CD\u09B0\u09BF\u09AB\u09BF\u0982 \u09A6\u09BF\u09DF\u09C7 \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF?`,
          source: "AI"
        };
      }
      return {
        reply: `Thank you! I have securely recorded your contact details (${contactVal}) for our Senior Advisory & Legal Desk in Riyadh. A dedicated senior consultant will reach out to you directly via WhatsApp or phone with priority attention.

While our team prepares your personalized consultation, please let me know if there are any specific business objectives, licensing categories, or questions you'd like me to clarify for you right now!`,
        source: "AI"
      };
    }
    if (isContactQuery) {
      if (userLang === "bn") {
        return {
          reply: `\u0986\u09AA\u09A8\u09BE\u09B0 \u098F\u0987 \u0987\u09A8\u0995\u09CB\u09AF\u09BC\u09BE\u09B0\u09BF\u099F\u09BF \u0986\u09AE\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6\u09C7\u09B0 **\u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u0993 \u09B2\u09BF\u0997\u09CD\u09AF\u09BE\u09B2 \u09A1\u09C7\u09B8\u09CD\u0995\u09C7** \u0985\u0997\u09CD\u09B0\u09BE\u09A7\u09BF\u0995\u09BE\u09B0 \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09AA\u09CC\u0981\u099B\u09C7 \u09A6\u09BF\u09DF\u09C7\u099B\u09BF\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u098F\u0995\u099C\u09A8 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09BF\u09B7\u09AF\u09BC\u099F\u09BF \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u099B\u09C7\u09A8\u0964

\u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997\u09C7\u09B0 \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u09B8\u09AE\u09C2\u09B9:
\u2022 **\u0985\u09AB\u09BF\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u0987\u09AE\u09C7\u0987\u09B2**: ${supportEmail}
\u2022 **\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC \u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u0995\u09BE\u09B0\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC**: \u0995\u09BF\u0982 \u09AB\u09BE\u09B9\u09BE\u09A6 \u09B0\u09CB\u09A1, \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6, \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC
\u2022 **\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981 \u0985\u09AB\u09BF\u09B8**: \u09A2\u09BE\u0995\u09BE, \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6

\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u099C\u09A8\u0995 \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AC\u09BE \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u098F\u0996\u09BE\u09A8\u09C7 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09B2\u09BF\u0996\u09C7 \u09B0\u09BE\u0996\u09B2\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u0997\u09BE\u0987\u09A1\u09B2\u09BE\u0987\u09A8 \u0993 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09AC\u09C7\u09A8\u0964`,
          source: "AI"
        };
      }
      return {
        reply: `I have escalated and prioritized your inquiry directly with our **Senior Advisory & Legal Desk in Riyadh**. A dedicated senior consultant has been notified and is reviewing your request.

In the meantime, here are our verified executive contact channels:
\u2022 **Direct Corporate Email**: ${supportEmail}
\u2022 **Saudi Arabia Headquarters**: King Fahd Road, Riyadh, Kingdom of Saudi Arabia
\u2022 **International Liaison Desk**: Dhaka, Bangladesh

If you share your preferred WhatsApp or direct phone number right here in this chat, our senior consultant will reach out to you directly with a personalized briefing.`,
        source: "AI"
      };
    }
    if (isBespokeQuery) {
      if (userLang === "bn") {
        return {
          reply: `\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u0987\u099C\u09A1 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C \u09AA\u09CD\u09B0\u09AA\u09CB\u099C\u09BE\u09B2, \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u0993 \u098F\u09A8\u09A1\u09BF\u098F (NDA)-\u098F\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09AA\u09A8\u09BE\u09B0 \u099A\u09BE\u09B9\u09BF\u09A6\u09BE\u099F\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u09AA\u09BE\u09B0\u09CD\u099F\u09A8\u09BE\u09B0 \u09A1\u09C7\u09B8\u09CD\u0995\u09C7 \u09AB\u09B0\u09CB\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BF\u09A8\u09BF\u09AF\u09BC\u09B0 \u099F\u09BF\u09AE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF\u09A4\u09BE \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C7 \u0986\u09A8\u09C1\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u09AA\u09CD\u09B0\u09AA\u09CB\u099C\u09BE\u09B2 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09AC\u09C7\u0964

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09AC\u09BE \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u098F\u0996\u09BE\u09A8\u09C7 \u099A\u09CD\u09AF\u09BE\u099F\u09C7 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09B2\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09BF\u0982 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC\u09A8\u09BE\u099F\u09BF \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7 \u09A6\u09C7\u09AC\u09C7\u09A8\u0964`,
          source: "AI"
        };
      }
      return {
        reply: `For bespoke enterprise contracts, customized commercial proposals, and institutional NDAs, I have routed your specifications directly to our Senior Advisory Partners. Our executive team will review the parameters to prepare your customized documentation.

Please feel free to share your corporate contact email or WhatsApp number here in chat so our managing consultant can deliver the formal proposal directly to your executive desk.`,
        source: "AI"
      };
    }
    if (isTechStackQuery) {
      if (userLang === "bn") {
        return {
          reply: `**Trek Consultancy Forum**-\u098F\u09B0 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09BF \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0:

- **\u09AB\u09CD\u09B0\u09A8\u09CD\u099F\u098F\u09A8\u09CD\u09A1**: React 19, TypeScript, Tailwind CSS v4 \u098F\u09AC\u0982 Vite \u09AC\u09BF\u09B2\u09CD\u09A1 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u0964
- **\u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u099C \u0993 \u09AA\u09BE\u09B0\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09A8\u09CD\u09B8**: Neon Serverless PostgreSQL\u2014\u09B8\u09AC \u0986\u09B2\u09CB\u099A\u09A8\u09BE, \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u0993 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u099F\u09BF\u0995\u09BF\u099F \u09B0\u09BF\u09DF\u09C7\u09B2-\u099F\u09BE\u0987\u09AE\u09C7 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u099C\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u0964
- **\u098F\u0986\u0987 \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F**: \u0997\u09C1\u0997\u09C1\u09B2 \u099C\u09C7\u09AE\u09BF\u09A8\u09BF \u0993 \u09B2\u09CB\u0995\u09BE\u09B2 RAG \u09A8\u09B2\u09C7\u099C \u0987\u099E\u09CD\u099C\u09BF\u09A8 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u099A\u09BE\u09B2\u09BF\u09A4 \u09E8\u09EA/\u09ED \u0987\u09A8\u09CD\u099F\u09C7\u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u099F \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F\u0964
- **\u09A5\u09BF\u09AE \u0987\u09A8\u09CD\u099F\u09BF\u0997\u09CD\u09B0\u09C7\u09B6\u09A8**: Docly \u0993 bbPress \u0995\u09AE\u09AA\u09CD\u09AF\u09BE\u099F\u09BF\u09AC\u09B2 \u09B0\u09C7\u09B8\u09AA\u09A8\u09B8\u09BF\u09AD \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1 \u0993 \u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u0964`,
          source: "RAG"
        };
      }
      return {
        reply: `**Trek Consultancy Forum** Technical Architecture:

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, and Vite.
- **Database & Persistence**: Powered by Neon Serverless PostgreSQL with WebSocket connection pooling\u2014providing real-time data persistence across threads, replies, tickets, and knowledge bases.
- **AI & RAG Engine**: Multi-tiered RAG intelligence backed by Google Gemini and specialized local vector-heuristic chunking.
- **Design & Layout**: Modern clean SaaS interface with full bilingual English & Bengali localization.`,
        source: "RAG"
      };
    }
    if (isAboutOrServices || isHelpQuery && !isSaudiSetupQuery && !isSoftwareQuery && !isVisaQuery && !isRealEstateQuery && !isAccountingTaxQuery && !isInternationalQuery) {
      if (userLang === "bn") {
        return {
          reply: `**Trek Consultancy** \u09B9\u09B2\u09CB \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE \u0993 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09A6\u09B2\u0997\u09C1\u09B2\u09CB\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u0995\u099F\u09BF \u09B6\u09C0\u09B0\u09CD\u09B7\u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09DF \u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0995 \u0993 \u09AA\u09C2\u09B0\u09CD\u09A3\u09BE\u0999\u09CD\u0997 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u09B8\u0982\u09B8\u09CD\u09A5\u09BE\u0964

\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AE\u09C2\u09B2 \u09EC\u099F\u09BF \u09B8\u09C7\u09AC\u09BE\u09AE\u09C2\u09B2\u0995 \u09B8\u09CD\u09A4\u09AE\u09CD\u09AD:

- **\u09E7. \u09B8\u09CC\u09A6\u09BF \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B8\u09C7\u099F\u0986\u09AA (Pillar 1)**: \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09E7\u09E6\u09E6% \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE\u09A7\u09C0\u09A8 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8, MISA \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8, \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR), \u099A\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u0985\u09AB \u0995\u09AE\u09BE\u09B0\u09CD\u09B8 \u098F\u09AC\u0982 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993\u09AA\u09C7\u09A8\u09BF\u0982\u0964
- **\u09E8. \u09B8\u09AB\u099F\u0993\u09DF\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8\u09B8 (Pillar 2)**: \u0987\u09A8-\u09B9\u09BE\u0989\u09B8 \u099F\u09C7\u0995 \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C ERP, \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0993\u09DF\u09C7\u09AC \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09B8, \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0 \u098F\u09AC\u0982 \u098F\u0986\u0987 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8\u0964
- **\u09E9. \u09AD\u09BF\u09B8\u09BE \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u09B8\u09C7\u09AC\u09BE (Pillar 3)**: \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F, \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u099F \u0987\u0995\u09BE\u09AE\u09BE, \u098F\u09AC\u0982 Qiwa \u0993 Muqeem \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B2\u09BF\u09AF\u09BC\u09BE\u099C\u09CB\u0981\u0964
- **\u09EA. \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F (Pillar 4)**: \u09B0\u09BF\u09DF\u09BE\u09A6, \u099C\u09C7\u09A6\u09CD\u09A6\u09BE\u09B8\u09B9 \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09AE\u09C2\u09B2 \u0985\u09B0\u09CD\u09A5\u09A8\u09C8\u09A4\u09BF\u0995 \u0985\u099E\u09CD\u099A\u09B2\u09C7 \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8, \u099C\u09AE\u09BF \u0993 \u09B6\u09BF\u09B2\u09CD\u09AA \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE \u09B2\u09BF\u099C \u09AC\u09BE \u0995\u09CD\u09B0\u09DF\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0964
- **\u09EB. \u0995\u09B0\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0995\u0985\u09AB\u09BF\u09B8 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F (Pillar 5)**: \u099A\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982, \u0985\u09A1\u09BF\u099F, ZATCA \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982 \u0993 \u09AD\u09CD\u09AF\u09BE\u099F \u09AB\u09BE\u0987\u09B2\u09BF\u0982, \u09AA\u09C7\u09B0\u09CB\u09B2 \u098F\u09AC\u0982 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8\u0964
- **\u09EC. \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3 (Pillar 6)**: \u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 (USA LLC), \u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u099C\u09CD\u09AF (UK Ltd) \u0993 \u0995\u09BE\u09A8\u09BE\u09A1\u09BE\u09DF \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u098F\u09AC\u0982 \u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982\u0964

\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BF \u0995\u09CB\u09A8\u09CB \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09B8\u09CD\u09A4\u09AE\u09CD\u09AD \u09AC\u09BE \u09B8\u09C7\u09AC\u09BE \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u099C\u09BE\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8? \u0986\u09AE\u09BE\u0995\u09C7 \u099C\u09BE\u09A8\u09BE\u09B2\u09C7 \u0986\u09AE\u09BF \u09AA\u09A6\u0995\u09CD\u09B7\u09C7\u09AA\u0997\u09C1\u09B2\u09CB \u09A7\u09BE\u09AA\u09C7 \u09A7\u09BE\u09AA\u09C7 \u09AC\u09C1\u099D\u09BF\u09DF\u09C7 \u09A6\u09C7\u09AC!`,
          source: "AI"
        };
      }
      return {
        reply: `**Trek Consultancy** is a premier international advisory firm and technology powerhouse specializing in turnkey enterprise expansion, Saudi market entry, and high-impact digital solutions.

Our **6 Strategic Pillars of Excellence**:

- **Pillar 1: Saudi Business Setup**: 100% foreign-owned company incorporation, MISA Foreign Investment Licenses, Commercial Registration (CR), Articles of Association (AoA), and corporate banking setups.
- **Pillar 2: Software & Digital Engineering**: In-house tech division providing enterprise ERP systems, custom web/mobile applications, resilient cloud architecture, and AI automation.
- **Pillar 3: Visa & Saudi PRO Government Liaison**: Premium investor visas, employee work permits, executive Iqama issuance & renewals, and Qiwa/Muqeem government portal administration.
- **Pillar 4: Real Estate Investment**: Commercial office spaces, warehouses, and industrial leases across Riyadh, Jeddah, and Khobar with foreign ownership compliance.
- **Pillar 5: Corporate & Financial Support**: Accounting, statutory audits conforming to IFRS, ZATCA Phase 2 VAT/tax compliance, and HR/payroll administration.
- **Pillar 6: International Expansion**: USA (Delaware/Wyoming LLCs), UK (Companies House Ltd), Canada corporate setups, and global tier-1 banking.

Which area would you like to explore in more detail? I can provide step-by-step guidance, timelines, and documentation requirements!`,
        source: "AI"
      };
    }
    const scoredDocs = docs.map((d) => {
      const titleLow = (d.title || "").toLowerCase();
      const contentLow = (d.content || "").toLowerCase();
      const catLow = (d.category || "").toLowerCase();
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
      if ((lower.includes("zatca") || lower.includes("vat") || lower.includes("tax") || lower.includes("accounting") || lower.includes("e-invoicing")) && (titleLow.includes("pillar 5") || titleLow.includes("accounting") || titleLow.includes("tax") || contentLow.includes("zatca"))) {
        score += 50;
      }
      return { doc: d, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    const scoredFaqs = faqs.map((f) => {
      const qLow = (f.question || "").toLowerCase();
      const aLow = (f.answer || "").toLowerCase();
      const qBnLow = (f.question_bn || "").toLowerCase();
      const aBnLow = (f.answer_bn || "").toLowerCase();
      const catLow = (f.category || "").toLowerCase();
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
      if ((lower.includes("lagbe") || lower.includes("lage") || lower.includes("\u0995\u09BE\u0997\u099C") || lower.includes("\u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F") || lower.includes("document")) && (f.id?.includes("required") || qLow.includes("document") || qBnLow.includes("\u0995\u09BE\u0997\u099C"))) {
        score += 45;
      }
      if ((lower.includes("zatca") || lower.includes("vat") || lower.includes("tax") || lower.includes("accounting") || lower.includes("e-invoicing")) && (f.id?.includes("zatca") || f.id?.includes("tax") || qLow.includes("zatca") || qLow.includes("tax") || qBnLow.includes("\u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8") || qBnLow.includes("\u09AD\u09CD\u09AF\u09BE\u099F"))) {
        score += 50;
      }
      return { faq: f, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    const scoredTickets = (answeredTickets || []).map((t) => {
      const qLow = (t.question || "").toLowerCase();
      const sLow = (t.subject || "").toLowerCase();
      const aLow = (t.adminAnswer || "").toLowerCase();
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
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    if (scoredTickets.length > 0 && scoredTickets[0].score >= 12) {
      const topTkt = scoredTickets[0].ticket;
      if (userLang === "bn") {
        return {
          reply: `\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BF\u09A8\u09BF\u09DF\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u099F\u09BF\u09AE \u0995\u09B0\u09CD\u09A4\u09C3\u0995 \u09AF\u09BE\u099A\u09BE\u0987\u0995\u09C3\u09A4 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8:

${topTkt.adminAnswer}

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09A6\u09BF \u098F\u0987 \u09AC\u09BF\u09B7\u09DF\u09C7 \u0986\u09B0\u0993 \u0995\u09CB\u09A8\u09CB \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09A4\u09A5\u09CD\u09AF \u09AC\u09BE \u09B8\u09B9\u09AF\u09CB\u0997\u09BF\u09A4\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09B9\u09DF, \u0986\u09AE\u09BE\u0995\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A6\u09CD\u09AC\u09BF\u09A7\u09BE\u09DF \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!`,
          source: "STAFF"
        };
      }
      return {
        reply: `According to our Senior Advisory & Support resolution:

${topTkt.adminAnswer}

Feel free to ask if you would like further details or next steps on this!`,
        source: "STAFF"
      };
    }
    if (scoredFaqs.length > 0 && scoredFaqs[0].score >= 12) {
      const topFaq = scoredFaqs[0].faq;
      const faqAns = userLang === "bn" && topFaq.answer_bn ? topFaq.answer_bn : topFaq.answer;
      return {
        reply: faqAns,
        source: "FAQ"
      };
    }
    if (scoredDocs.length > 0 && scoredDocs[0].score >= 12) {
      const topDoc = scoredDocs[0].doc;
      if (userLang === "bn") {
        if (topDoc.title.includes("Pillar 5") || topDoc.title.includes("Accounting") || topDoc.title.includes("Tax") || topDoc.title.includes("Business Support") || isAccountingTaxQuery || lower.includes("zatca")) {
          return {
            reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982 \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u09B8\u09C7\u09AC\u09BE:

\u2022 **IFRS \u09AC\u09C1\u0995\u0995\u09BF\u09AA\u09BF\u0982**: \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2 \u09AE\u09BE\u09B8\u09BF\u0995 \u09B9\u09BF\u09B8\u09BE\u09AC \u0993 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8\u0964
\u2022 **ZATCA \u09AB\u09C7\u099C \u09E8 \u0993 \u09AD\u09CD\u09AF\u09BE\u099F**: \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8 \u0993 \u09B8\u09AE\u09AF\u09BC\u09AE\u09A4\u09CB \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u099C\u09AE\u09BE\u0964
\u2022 **\u0986\u0987\u09A8\u09BF \u0985\u09A1\u09BF\u099F**: \u09B8\u09A8\u09A6\u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4 \u099A\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u0985\u09A1\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F\u0964
\u2022 **\u09AA\u09C7\u09B0\u09CB\u09B2 \u0993 GOSI**: \u0995\u09B0\u09CD\u09AE\u09C0 \u09AC\u09C7\u09A4\u09A8 \u0993 \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AC\u09C0\u09AE\u09BE \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964`,
            source: "RAG"
          };
        }
        if (topDoc.title.includes("Pillar 1") || topDoc.title.includes("Saudi Business")) {
          return {
            reply: `\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0997\u09BE\u0987\u09A1\u09B2\u09BE\u0987\u09A8:

\u09E7. **\u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u0993 MISA \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8**: \u09AD\u09BF\u09B6\u09A8 \u09E8\u09E6\u09E9\u09E6-\u098F\u09B0 \u0986\u0993\u09A4\u09BE\u09DF \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09B0\u09BE \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09DF \u09B8\u09CD\u09AA\u09A8\u09CD\u09B8\u09B0 \u099B\u09BE\u09DC\u09BE\u0987 \u09E7\u09E6\u09E6% \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AE\u09BE\u09B2\u09BF\u0995 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964
\u09E8. **\u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR)**: \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF \u09A5\u09C7\u0995\u09C7 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE\u09C7\u09B0 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8\u0964
\u09E9. **\u0986\u09B0\u09CD\u099F\u09BF\u0995\u09C7\u09B2\u09B8 \u0985\u09AB \u0985\u09CD\u09AF\u09BE\u09B8\u09CB\u09B8\u09BF\u09DF\u09C7\u09B6\u09A8 (AoA)**: \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09AA\u09BE\u09AC\u09B2\u09BF\u0995\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u0987\u09A8\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964
\u09EA. **\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8**: \u09B0\u09BF\u09DF\u09BE\u09A6 \u09AC\u09BE \u099C\u09C7\u09A6\u09CD\u09A6\u09BE\u09DF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 \u098F\u09AC\u0982 \u09B8\u09CC\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7 \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993\u09AA\u09C7\u09A8\u09BF\u0982\u0964
\u09EB. **\u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0993 \u09B6\u09CD\u09B0\u09AE \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2**: ZATCA, GOSI, Qiwa \u0993 Muqeem \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u09B6\u09A8\u0964

\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u098F\u0987 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u099F\u09BF \u099F\u09BE\u09B0\u09CD\u09A8\u0995\u09BF \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C7\u0964`,
            source: "RAG"
          };
        }
        if (topDoc.title.includes("Pillar 2") || topDoc.title.includes("Software")) {
          return {
            reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u0987\u09A8-\u09B9\u09BE\u0989\u09B8 \u09B8\u09AB\u099F\u0993\u09DF\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8:

\u2022 **\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0987\u0986\u09B0\u09AA\u09BF \u0993 \u09B8\u09AB\u099F\u0993\u09DF\u09CD\u09AF\u09BE\u09B0**: \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u099A\u09BE\u09B9\u09BF\u09A6\u09BE \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u0987\u099C\u09A1 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u0964
\u2022 **\u0993\u09DF\u09C7\u09AC \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09B8**: React, TypeScript, Node.js \u098F\u09AC\u0982 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u09A4\u09C8\u09B0\u09BF \u09B8\u09CD\u0995\u09C7\u09B2\u09C7\u09AC\u09B2 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964
\u2022 **\u098F\u0986\u0987 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8**: \u0987\u09A8\u09CD\u099F\u09C7\u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u099F \u099A\u09CD\u09AF\u09BE\u099F\u09AC\u099F, \u09A1\u09C7\u099F\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982 \u0993 \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8\u0964
\u2022 **\u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0993 \u09A1\u09C7\u09AD\u0985\u09AA\u09B8**: \u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B8, \u09B8\u09BF\u0995\u09BF\u0989\u09B0\u09BF\u099F\u09BF \u0993 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u09A1\u09C7\u099F\u09BE\u09AC\u09C7\u099C \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09AE\u09C7\u09A8\u09CD\u099F\u0964`,
            source: "RAG"
          };
        }
        if (topDoc.title.includes("Pillar 3") || topDoc.title.includes("Visa") || topDoc.title.includes("PRO")) {
          return {
            reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u0993 \u09AD\u09BF\u09B8\u09BE \u09B8\u09C7\u09AC\u09BE\u09B8\u09AE\u09C2\u09B9:

\u2022 **\u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE \u0993 \u0993\u09DF\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F**: \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE \u0993 \u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964
\u2022 **\u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u099F \u0987\u0995\u09BE\u09AE\u09BE (Iqama)**: \u098F\u0995\u09CD\u09B8\u09BF\u0995\u09BF\u0989\u099F\u09BF\u09AD \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0993 \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09B0\u09BF\u09A8\u09BF\u0989\u09AF\u09BC\u09BE\u09B2\u0964
\u2022 **Qiwa \u0993 Muqeem \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2**: \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u09A4\u09C8\u09B0\u09BF, \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0 \u0985\u09AB \u09B8\u09CD\u09AA\u09A8\u09B8\u09B0\u09B6\u09BF\u09AA \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8\u0964
\u2022 **\u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09B8\u09A4\u09CD\u09AF\u09BE\u09DF\u09A8**: \u09AA\u09B0\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF \u0993 \u099A\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u0985\u09AB \u0995\u09AE\u09BE\u09B0\u09CD\u09B8\u09C7 \u0986\u0987\u09A8\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964`,
            source: "RAG"
          };
        }
        if (topDoc.title.includes("Pillar 4") || topDoc.title.includes("Real Estate")) {
          return {
            reply: `\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u09B8\u09C7\u09AC\u09BE:

\u2022 **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8**: \u09B0\u09BF\u09DF\u09BE\u09A6, \u099C\u09C7\u09A6\u09CD\u09A6\u09BE \u0993 \u09A6\u09BE\u09AE\u09CD\u09AE\u09BE\u09AE\u09C7 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C (Ejari)\u0964
\u2022 **\u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE**: \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u0987\u09A8\u09B8\u09AE\u09CD\u09AE\u09A4 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0993 \u09B6\u09BF\u09B2\u09CD\u09AA \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u0995\u09CD\u09B0\u09DF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0964
\u2022 **\u09B6\u09BF\u09B2\u09CD\u09AA \u09AA\u09BE\u09B0\u09CD\u0995 \u0993 \u0997\u09C1\u09A6\u09BE\u09AE**: \u09B2\u099C\u09BF\u09B8\u09CD\u099F\u09BF\u0995 \u0985\u099E\u09CD\u099A\u09B2 \u0993 \u0995\u09BE\u09B0\u0996\u09BE\u09A8\u09BE\u09B0 \u09A6\u09C0\u09B0\u09CD\u0998\u09AE\u09C7\u09DF\u09BE\u09A6\u09BF \u09B2\u09BF\u099C\u0964`,
            source: "RAG"
          };
        }
        if (topDoc.title.includes("Pillar 5") || topDoc.title.includes("Accounting") || topDoc.title.includes("Tax") || topDoc.title.includes("Business Support")) {
          return {
            reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982 \u0993 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u09B8\u09C7\u09AC\u09BE:

\u2022 **IFRS \u09AC\u09C1\u0995\u0995\u09BF\u09AA\u09BF\u0982**: \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2 \u09AE\u09BE\u09B8\u09BF\u0995 \u09B9\u09BF\u09B8\u09BE\u09AC \u0993 \u0986\u09B0\u09CD\u09A5\u09BF\u0995 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8\u0964
\u2022 **ZATCA \u09AB\u09C7\u099C \u09E8 \u0993 \u09AD\u09CD\u09AF\u09BE\u099F**: \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982 \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8 \u0993 \u09B8\u09AE\u09AF\u09BC\u09AE\u09A4\u09CB \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u099C\u09AE\u09BE\u0964
\u2022 **\u0986\u0987\u09A8\u09BF \u0985\u09A1\u09BF\u099F**: \u09B8\u09A8\u09A6\u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4 \u099A\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u0985\u09A1\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F\u0964
\u2022 **\u09AA\u09C7\u09B0\u09CB\u09B2 \u0993 GOSI**: \u0995\u09B0\u09CD\u09AE\u09C0 \u09AC\u09C7\u09A4\u09A8 \u0993 \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AC\u09C0\u09AE\u09BE \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE\u0964`,
            source: "RAG"
          };
        }
        if (topDoc.title.includes("Pillar 6") || topDoc.title.includes("International")) {
          return {
            reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09B8\u09C7\u099F\u0986\u09AA \u09B8\u09C7\u09AC\u09BE:

\u2022 **USA LLC \u0993 C-Corp**: \u09A1\u09C7\u09B2\u09BE\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0, \u0993\u09AF\u09BC\u09BE\u0987\u09AF\u09BC\u09CB\u09AE\u09BF\u0982 \u0993 \u09AB\u09CD\u09B2\u09CB\u09B0\u09BF\u09A1\u09BE\u09DF \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8 \u098F\u09AC\u0982 IRS \u09A5\u09C7\u0995\u09C7 EIN \u09B8\u0982\u0997\u09CD\u09B0\u09B9\u0964
\u2022 **UK Ltd**: \u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u099C\u09CD\u09AF\u09C7 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u0993 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE\u0964
\u2022 **\u0995\u09BE\u09A8\u09BE\u09A1\u09BE \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u09B6\u09A8**: \u0995\u09BE\u09A8\u09BE\u09A1\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A6\u09C7\u09B6\u09BF\u0995 \u09AC\u09BE \u09AB\u09C7\u09A1\u09BE\u09B0\u09C7\u09B2 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8\u0964
\u2022 **\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982**: Mercury \u0993 Wise Business-\u098F \u09AC\u09B9\u09C1-\u09AE\u09C1\u09A6\u09CD\u09B0\u09BE \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u0964`,
            source: "RAG"
          };
        }
      }
      return {
        reply: topDoc.content,
        source: "RAG"
      };
    }
    if (isSaudiSetupQuery) {
      const matchedDoc = docs.find((d) => d.title.includes("Pillar 1") || d.title.includes("Saudi Business Setup"));
      const content = matchedDoc ? matchedDoc.content : "";
      if (userLang === "bn") {
        return {
          reply: `\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09BE \u098F\u09AC\u0982 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09DF\u09BE:

1. **\u09E7\u09E6\u09E6% \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u0993 MISA \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8**: \u09B8\u09CC\u09A6\u09BF \u09B8\u09B0\u0995\u09BE\u09B0\u09C7\u09B0 \u09AD\u09BF\u09B6\u09A8 \u09E8\u09E6\u09E9\u09E6-\u098F\u09B0 \u0986\u0993\u09A4\u09BE\u09DF \u09AC\u09C7\u09B6\u09BF\u09B0\u09AD\u09BE\u0997 \u0996\u09BE\u09A4\u09C7 \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09B0\u09BE \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09DF \u09B8\u09CD\u09AA\u09A8\u09CD\u09B8\u09B0 \u099B\u09BE\u09DC\u09BE\u0987 \u09E7\u09E6\u09E6% \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AE\u09BE\u09B2\u09BF\u0995 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964 \u098F\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u09A7\u09BE\u09AA \u09B9\u09B2\u09CB Ministry of Investment (MISA) \u09A5\u09C7\u0995\u09C7 \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u0997\u09CD\u09B0\u09B9\u09A3\u0964
2. **\u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 (CR)**: MISA \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u09C7\u09B0 \u09AA\u09B0 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF (Ministry of Commerce) \u09A5\u09C7\u0995\u09C7 \u0995\u09AE\u09BE\u09B0\u09CD\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u0987\u09B8\u09CD\u09AF\u09C1 \u0995\u09B0\u09BE \u09B9\u09DF\u0964
3. **\u0986\u09B0\u09CD\u099F\u09BF\u0995\u09C7\u09B2\u09B8 \u0985\u09AB \u0985\u09CD\u09AF\u09BE\u09B8\u09CB\u09B8\u09BF\u09DF\u09C7\u09B6\u09A8 (AoA)**: \u09A8\u09CB\u099F\u09BE\u09B0\u09BF \u09AA\u09BE\u09AC\u09B2\u09BF\u0995\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AE\u09C7\u09AE\u09CB\u09B0\u09C7\u09A8\u09CD\u09A1\u09BE\u09AE \u0993 \u0986\u09B0\u09CD\u099F\u09BF\u0995\u09C7\u09B2\u09C7\u09B0 \u0986\u0987\u09A8\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u0964
4. **\u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0993 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8**: \u09B0\u09BF\u09DF\u09BE\u09A6 \u09AC\u09BE \u099C\u09C7\u09A6\u09CD\u09A6\u09BE\u09DF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09A8\u09CD\u09AF\u09BE\u09B6\u09A8\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8 (SPL) \u098F\u09AC\u0982 \u09B6\u09C0\u09B0\u09CD\u09B7\u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09DF \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7 \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u099F \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u0964
5. **\u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u09B8\u0995\u09CD\u09B0\u09BF\u09DF\u0995\u09B0\u09A3**: ZATCA (\u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0993 \u09AD\u09CD\u09AF\u09BE\u099F), GOSI (\u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AC\u09C0\u09AE\u09BE), \u098F\u09AC\u0982 \u09B6\u09CD\u09B0\u09AE \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF\u09C7\u09B0 Qiwa \u0993 Muqeem \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u09B6\u09A8\u0964

${content ? `

**\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09C7\u09AC\u09BE\u09B0 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA:**
${content.slice(0, 350)}...` : ""}

\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u098F\u0987 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u099F\u09BF \u099F\u09BE\u09B0\u09CD\u09A8\u0995\u09BF \u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u09A4\u09C7 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE \u0995\u09B0\u09C7\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BF \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u0995\u09CB\u09A8\u09CB \u09B8\u09C7\u0995\u09CD\u099F\u09B0 \u09AC\u09BE \u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BE\u09A8\u09BE\u09B0 \u0986\u099B\u09C7?`,
          source: "RAG"
        };
      }
      return {
        reply: `Here is the comprehensive guide to establishing a company in Saudi Arabia with Trek Consultancy:

1. **100% Foreign Ownership via MISA License**: Under Saudi Vision 2030, international investors can own 100% of their enterprise in most commercial, industrial, and tech sectors without requiring a local Saudi partner. The foundational step is securing the **MISA Foreign Investment License** from the Ministry of Investment.
2. **Commercial Registration (CR)**: Once MISA approves the license, the Ministry of Commerce issues the Commercial Registration defining your business activities.
3. **Articles of Association (AoA)**: Formal notary legalization of the company charter and shareholder agreements.
4. **National Address & Corporate Banking**: Setting up the official Saudi National Address (SPL) and opening an operational business bank account with top-tier Saudi banks (e.g. SNB, Al Rajhi, SAB).
5. **Tax & Labor Portal Activations**: Registration with ZATCA (VAT/Corporate Tax), GOSI (Social Insurance), and the Qiwa & Muqeem labor platforms.

${content ? `
**Overview from our Knowledge Base:**
${content.slice(0, 350)}...
` : ""}
Trek Consultancy handles this complete formation cycle from end to end. Let me know if you would like specific details regarding capital requirements or timelines!`,
        source: "RAG"
      };
    }
    if (isSoftwareQuery) {
      const matchedDoc = docs.find((d) => d.title.includes("Software & Digital"));
      const content = matchedDoc ? matchedDoc.content : "";
      if (userLang === "bn") {
        return {
          reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 **Software & Digital Solutions** \u09A1\u09BF\u09AD\u09BF\u09B6\u09A8 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u09C7 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9 \u0995\u09B0\u09C7:

- **\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09B8\u09AB\u099F\u0993\u09DF\u09CD\u09AF\u09BE\u09B0 \u0993 \u0987\u0986\u09B0\u09AA\u09BF (ERP)**: \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u09B8\u09CD\u09AC\u09A4\u09A8\u09CD\u09A4\u09CD\u09B0 \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09AB\u09CD\u09B2\u09CB \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09A4\u09C8\u09B0\u09BF \u0987\u09A8\u09AD\u09C7\u09A8\u09CD\u099F\u09B0\u09BF, \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BF\u0982, \u09B8\u09BE\u09AA\u09CD\u09B2\u09BE\u0987 \u099A\u09C7\u0987\u09A8 \u0993 \u098F\u09A8\u09CD\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09BE\u0987\u099C \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964
- **\u0993\u09DF\u09C7\u09AC \u0993 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09CD\u09B2\u09BF\u0995\u09C7\u09B6\u09A8**: React, TypeScript, Node.js \u0993 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u099C \u09A6\u09BF\u09DF\u09C7 \u09A4\u09C8\u09B0\u09BF \u09A6\u09CD\u09B0\u09C1\u09A4\u0997\u09A4\u09BF\u09B0, \u09B8\u09C1\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u098F\u09AC\u0982 \u09B8\u09CD\u0995\u09C7\u09B2\u09C7\u09AC\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09CD\u09B2\u09BF\u0995\u09C7\u09B6\u09A8\u0964
- **\u098F\u0986\u0987 \u0993 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8 (AI Automation)**: \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u098F\u0986\u0987 \u0987\u09A8\u09CD\u099F\u09BF\u0997\u09CD\u09B0\u09C7\u09B6\u09A8, \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u09AC\u099F \u098F\u09AC\u0982 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09DF\u09BF\u0995 \u09A1\u09C7\u099F\u09BE \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8\u0964
- **\u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0 \u0993 \u09A1\u09C7\u09AD\u0985\u09AA\u09B8**: \u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B8, \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u09AE\u09BE\u0987\u0997\u09CD\u09B0\u09C7\u09B6\u09A8 \u098F\u09AC\u0982 \u09A8\u09BF\u09B0\u09AC\u099A\u09CD\u099B\u09BF\u09A8\u09CD\u09A8 \u09B8\u09BF\u0986\u0987/\u09B8\u09BF\u09A1\u09BF \u09AA\u09BE\u0987\u09AA\u09B2\u09BE\u0987\u09A8\u0964

${content ? `
**\u09A8\u09B2\u09C7\u099C \u09AC\u09C7\u09B8 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA:**
${content.slice(0, 300)}...` : ""}

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u099C\u09C7\u0995\u09CD\u099F\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CB\u09A8\u09CB \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0 \u09B0\u09BF\u09AD\u09BF\u0989 \u09AC\u09BE \u09B8\u09AB\u099F\u0993\u09DF\u09CD\u09AF\u09BE\u09B0 \u09A1\u09C7\u09AD\u09C7\u09B2\u09AA\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09B9\u09B2\u09C7 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AC\u09B2\u09C1\u09A8, \u0986\u09AE\u09BF \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u09B8\u09BE\u099C\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF!`,
          source: "RAG"
        };
      }
      return {
        reply: `Trek Consultancy's in-house **Software & Digital Solutions** division delivers enterprise-grade engineering tailored for modern businesses:

- **Custom Enterprise Software & ERPs**: Tailored business operating systems, inventory management, CRM, and supply chain automation designed around your exact workflows.
- **Modern Web & Mobile Applications**: High-performance, scalable applications built with React, TypeScript, Node.js, and resilient PostgreSQL/cloud backends.
- **AI & Process Automation**: Custom conversational agents, RAG workflows, intelligent document extractors, and automated business operations.
- **Cloud Architecture & DevOps**: High-traffic optimization, microservices, containerization, and automated CI/CD pipelines.

${content ? `
**From our Engineering Documentation:**
${content.slice(0, 300)}...
` : ""}
Feel free to describe your project requirements or technical stack, and I can provide architectural recommendations!`,
        source: "RAG"
      };
    }
    if (isVisaQuery) {
      const matchedDoc = docs.find((d) => d.title.includes("Visa & PRO") || d.title.includes("Pillar 3"));
      const content = matchedDoc ? matchedDoc.content : "";
      if (userLang === "bn") {
        return {
          reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 **Visa & Saudi PRO Government Liaison** \u09B8\u09C7\u09AC\u09BE\u09B8\u09AE\u09C2\u09B9:

- **\u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE (Investor Visa)**: \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AE\u09BE\u09B2\u09BF\u0995 \u0993 \u09B6\u09C7\u09DF\u09BE\u09B0\u09B9\u09CB\u09B2\u09CD\u09A1\u09BE\u09B0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8\u09BF \u0993 \u098F\u0995\u09CD\u09B8\u09BF\u0995\u09BF\u0989\u099F\u09BF\u09AD \u09AD\u09BF\u09B8\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982\u0964
- **\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F \u0993 \u0987\u0995\u09BE\u09AE\u09BE (Iqama)**: \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0993\u09DF\u09BE\u09B0\u09CD\u0995 \u09AD\u09BF\u09B8\u09BE \u0995\u09CB\u099F\u09BE \u09B8\u0982\u0997\u09CD\u09B0\u09B9, \u0987\u0995\u09BE\u09AE\u09BE \u0987\u09B8\u09CD\u09AF\u09C1 \u0993 \u09AC\u09BE\u09CE\u09B8\u09B0\u09BF\u0995 \u09A8\u09AC\u09BE\u09DF\u09A8\u0964
- **Qiwa \u0993 Muqeem \u09AA\u09CB\u09B0\u09CD\u099F\u09BE\u09B2 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE**: \u09B6\u09CD\u09B0\u09AE \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF\u09C7\u09B0 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u09AF\u09BE\u099A\u09BE\u0987, \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0 \u0985\u09AB \u09B8\u09CD\u09AA\u09A8\u09B8\u09B0\u09B6\u09BF\u09AA \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AB\u09C7\u09B6\u09A8 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u0964
- **\u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F \u0985\u09CD\u09AF\u09BE\u099F\u09C7\u09B8\u09CD\u099F\u09C7\u09B6\u09A8**: \u09AA\u09B0\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 \u09AE\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3\u09BE\u09B2\u09DF, \u09A6\u09C2\u09A4\u09BE\u09AC\u09BE\u09B8 \u098F\u09AC\u0982 \u099A\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u0985\u09AB \u0995\u09AE\u09BE\u09B0\u09CD\u09B8 \u09A5\u09C7\u0995\u09C7 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u09AA\u09CD\u09B0\u09BE\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09BF\u0995 \u0995\u09BE\u0997\u099C\u09AA\u09A4\u09CD\u09B0\u09C7\u09B0 \u0986\u0987\u09A8\u09BF \u09B8\u09A4\u09CD\u09AF\u09BE\u09DF\u09A8\u0964

${content ? `
**\u09A8\u09B2\u09C7\u099C \u09AC\u09C7\u09B8 \u09A4\u09A5\u09CD\u09AF:**
${content.slice(0, 300)}...` : ""}

\u09AD\u09BF\u09B8\u09BE \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AC\u09BE \u0987\u0995\u09BE\u09AE\u09BE \u09A8\u09AC\u09BE\u09DF\u09A8 \u09A8\u09BF\u09DF\u09C7 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09A5\u09BE\u0995\u09B2\u09C7 \u0986\u09AE\u09BE\u0995\u09C7 \u099C\u09BE\u09A8\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!`,
          source: "RAG"
        };
      }
      return {
        reply: `Trek Consultancy's **Visa & Saudi PRO Government Liaison Services** provide seamless regulatory management with Saudi authorities:

- **Investor & Executive Visas**: Specialized foreign investor visas, GM visas, and residency permits for company principals and shareholders.
- **Work Permits & Iqama Issuance**: Complete employee visa quota requests, labor ministry contracts, medical insurance enrollment, and Iqama renewals.
- **Digital Government Portals**: Active administration of the **Qiwa** (labor contracts & transfers) and **Muqeem** (entry/exit visas & residency records) platforms.
- **Attestation & Legalization**: Embassy attestations, Ministry of Foreign Affairs (MOFA) verifications, and Chamber of Commerce approvals.

${content ? `
**From our Official Records:**
${content.slice(0, 300)}...
` : ""}
Let me know if you need specific advice on Iqama renewals, quota requirements, or investor visa documentation!`,
        source: "RAG"
      };
    }
    if (isRealEstateQuery) {
      const matchedDoc = docs.find((d) => d.title.includes("Real Estate") || d.title.includes("Pillar 4"));
      const content = matchedDoc ? matchedDoc.content : "";
      if (userLang === "bn") {
        return {
          reply: `\u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F \u09AC\u09BF\u09A8\u09BF\u09AF\u09BC\u09CB\u0997 \u0993 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09A4\u09A5\u09CD\u09AF:

- **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8**: \u09A8\u09A4\u09C1\u09A8 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u099C\u09A8\u09CD\u09AF \u09B0\u09BF\u09AF\u09BC\u09BE\u09A6, \u099C\u09C7\u09A6\u09CD\u09A6\u09BE \u0993 \u09A6\u09BE\u09AE\u09CD\u09AE\u09BE\u09AE\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u0987\u09AE \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u099F\u09BE\u0993\u09DF\u09BE\u09B0\u09C7 \u0985\u09AB\u09BF\u09B8 \u09B2\u09BF\u099C \u09AC\u09BE \u0995\u09CD\u09B0\u09DF\u0964
- **\u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE\u09DF \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F**: \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09AC\u09BF\u09A8\u09BF\u09DF\u09CB\u0997 \u0995\u09BE\u09A0\u09BE\u09AE\u09CB\u09B0 \u0985\u09A7\u09C0\u09A8\u09C7 \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE \u0993 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u0997\u09C1\u09B2\u09CB\u09B0 \u099C\u09A8\u09CD\u09AF \u09AC\u09C8\u09A7 \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF \u0995\u09CD\u09B0\u09DF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6\u0964
- **\u09B6\u09BF\u09B2\u09CD\u09AA \u0993 \u0997\u09C1\u09A6\u09BE\u09AE \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE**: \u09AC\u09BF\u09B6\u09C7\u09B7 \u0985\u09B0\u09CD\u09A5\u09A8\u09C8\u09A4\u09BF\u0995 \u0985\u099E\u09CD\u099A\u09B2 \u0993 \u09B2\u099C\u09BF\u09B8\u09CD\u099F\u09BF\u0995 \u09AA\u09BE\u09B0\u09CD\u0995\u09C7 \u0995\u09BE\u09B0\u0996\u09BE\u09A8\u09BE \u0993 \u0997\u09C1\u09A6\u09BE\u09AE\u09C7\u09B0 \u09A6\u09C0\u09B0\u09CD\u0998\u09AE\u09C7\u09DF\u09BE\u09A6\u09C0 \u09B2\u09BF\u099C \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u0964
- **\u0986\u0987\u09A8\u09BF \u09AF\u09BE\u099A\u09BE\u0987 \u0993 \u09A1\u09BF\u0989 \u09A1\u09BF\u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u09B8**: \u099C\u09AE\u09BF\u09B0 \u09A6\u09B2\u09BF\u09B2 \u0993 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u0986\u0987\u09A8\u09BF \u09AC\u09BF\u09B6\u09C1\u09A6\u09CD\u09A7\u09A4\u09BE \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u098F\u09AC\u0982 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F\u0964

${content ? `
**\u09A8\u09B2\u09C7\u099C \u09AC\u09C7\u09B8 \u0997\u09BE\u0987\u09A1:**
${content.slice(0, 300)}...` : ""}

\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BF \u0995\u09CB\u09A8\u09CB \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09B6\u09B9\u09B0 \u09AC\u09BE \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09AA\u09CD\u09B0\u09AA\u09BE\u09B0\u09CD\u099F\u09BF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09BF\u09A4 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8?`,
          source: "RAG"
        };
      }
      return {
        reply: `Here is the advisory guide on **Real Estate Investment in Saudi Arabia** with Trek Consultancy:

- **Commercial Property & Office Spaces**: Securing certified commercial leases (Ejari) required for corporate registration across Riyadh, Jeddah, and Khobar.
- **Eligible Foreign Property Ownership**: Navigating updated Saudi investment laws allowing foreign investors and entities to acquire commercial, residential, and industrial assets.
- **Industrial & Logistics Parks**: Warehouse leasing, manufacturing facility acquisitions, and special economic zone setups.
- **Due Diligence & Title Deed Verification**: Comprehensive legal verification, deed authentication, and contract finalization.

${content ? `
**Knowledge Base Overview:**
${content.slice(0, 300)}...
` : ""}
Feel free to ask about specific cities, commercial lease compliance, or foreign asset ownership regulations!`,
        source: "RAG"
      };
    }
    if (isAccountingTaxQuery) {
      const matchedDoc = docs.find((d) => d.title.includes("Business Support") || d.title.includes("Corporate Support") || d.title.includes("Pillar 5"));
      const content = matchedDoc ? matchedDoc.content : "";
      if (userLang === "bn") {
        return {
          reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 **Corporate Support, Accounting & Tax Compliance** \u09B8\u09C7\u09AC\u09BE\u09B8\u09AE\u09C2\u09B9:

- **\u09AE\u09BE\u09B8\u09BF\u0995 \u09B9\u09BF\u09B8\u09BE\u09AC\u09B0\u0995\u09CD\u09B7\u09A3 (Bookkeeping)**: \u0986\u0987\u098F\u09AB\u0986\u09B0\u098F\u09B8 (IFRS) \u09AE\u09BE\u09A8 \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2 \u099C\u09BE\u09B0\u09CD\u09A8\u09BE\u09B2, \u09B2\u09C7\u099C\u09BE\u09B0 \u098F\u09AC\u0982 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09B6\u09BF\u099F \u09A4\u09C8\u09B0\u09BF\u0964
- **ZATCA \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982 \u0993 \u09AD\u09CD\u09AF\u09BE\u099F \u09AB\u09BE\u0987\u09B2\u09BF\u0982**: \u09B8\u09CC\u09A6\u09BF \u0986\u09B0\u09AC\u09C7\u09B0 \u09AB\u09C7\u099C \u09E8 \u0987-\u0987\u09A8\u09AD\u09DF\u09C7\u09B8\u09BF\u0982 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u0987\u09A8\u09CD\u099F\u09BF\u0997\u09CD\u09B0\u09C7\u09B6\u09A8 \u098F\u09AC\u0982 \u0995\u09CB\u09AF\u09BC\u09BE\u09B0\u09CD\u099F\u09BE\u09B0\u09B2\u09BF \u09AD\u09CD\u09AF\u09BE\u099F \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u099C\u09AE\u09BE \u09A6\u09C7\u0993\u09DF\u09BE\u0964
- **\u0986\u0987\u09A8\u09BF \u0985\u09A1\u09BF\u099F (Statutory External Audit)**: \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8 \u09A8\u09AC\u09BE\u09DF\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u0985\u09A1\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F \u09AA\u09CD\u09B0\u09A3\u09DF\u09A8\u0964
- **\u09AA\u09C7\u09B0\u09CB\u09B2 \u0993 GOSI \u0995\u09AE\u09AA\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u09B8**: \u0995\u09B0\u09CD\u09AE\u09C0\u09A6\u09C7\u09B0 \u09AE\u09BE\u09B8\u09BF\u0995 \u09AC\u09C7\u09A4\u09A8 \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982 \u098F\u09AC\u0982 \u09B8\u09BE\u09AE\u09BE\u099C\u09BF\u0995 \u09AC\u09C0\u09AE\u09BE (GOSI) \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09BF\u09AC\u09BF\u0989\u09B6\u09A8 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09A8\u09BE\u0964

${content ? `
**\u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA:**
${content.slice(0, 300)}...` : ""}

\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE\u09A8\u09C7\u09B0 \u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u09AC\u09BE \u0985\u09A1\u09BF\u099F \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0995\u09CB\u09A8\u09CB \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8 \u09B9\u09B2\u09C7 \u099C\u09BE\u09A8\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!`,
          source: "RAG"
        };
      }
      return {
        reply: `Trek Consultancy's **Corporate Support, Accounting & Tax Division** guarantees end-to-end regulatory compliance for Saudi and international businesses:

- **Full-Cycle Accounting & Bookkeeping**: IFRS-compliant monthly financial records, profit/loss statements, and balance sheets.
- **ZATCA Phase 2 E-Invoicing & VAT Compliance**: Integration with ZATCA's Fatoora platform and quarterly VAT return filings.
- **Statutory Financial Audits**: Preparation of certified independent audit reports mandated for commercial license renewals and shareholder reporting.
- **Payroll & GOSI Contributions**: Wage Protection System (WPS) compliance and monthly social insurance administration.

${content ? `
**From our Compliance Records:**
${content.slice(0, 300)}...
` : ""}
Let me know if you need specific guidance on ZATCA Phase 2 rules, corporate income tax, or VAT exemptions!`,
        source: "RAG"
      };
    }
    if (isInternationalQuery) {
      const matchedDoc = docs.find((d) => d.title.includes("International") || d.title.includes("Pillar 6"));
      const content = matchedDoc ? matchedDoc.content : "";
      if (userLang === "bn") {
        return {
          reply: `\u099F\u09CD\u09B0\u09C7\u0995 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u09B8\u09BF\u09B0 **International Business Services** (Pillar 6):

- **\u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u09B7\u09CD\u099F\u09CD\u09B0 (USA LLC & C-Corp)**: \u09A1\u09C7\u09B2\u09BE\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 (Delaware), \u0993\u09AF\u09BC\u09BE\u0987\u09AF\u09BC\u09CB\u09AE\u09BF\u0982 (Wyoming), \u09AB\u09CD\u09B2\u09CB\u09B0\u09BF\u09A1\u09BE\u09B8\u09B9 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09B0\u09BE\u099C\u09CD\u09AF\u09C7 \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09B8\u09AE\u09DF\u09C7 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8 \u0993 \u0987\u0986\u0987\u098F\u09A8 (EIN) \u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09A4\u09BF\u0964
- **\u09AF\u09C1\u0995\u09CD\u09A4\u09B0\u09BE\u099C\u09CD\u09AF (UK Ltd)**: Companies House-\u098F \u0987\u0989\u0995\u09C7 \u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u0993 \u0985\u09AB\u09BF\u09B8\u09BF\u09DF\u09BE\u09B2 \u0985\u09CD\u09AF\u09BE\u09A1\u09CD\u09B0\u09C7\u09B8\u0964
- **\u0995\u09BE\u09A8\u09BE\u09A1\u09BE \u0995\u09B0\u09CD\u09AA\u09CB\u09B0\u09C7\u09B6\u09A8**: \u0995\u09BE\u09A8\u09BE\u09A1\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A6\u09C7\u09B6\u09BF\u0995 \u09AC\u09BE \u09AB\u09C7\u09A1\u09BE\u09B0\u09C7\u09B2 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8\u0964
- **\u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982**: \u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u0995\u09BE\u09B0\u09C7\u09A8\u09CD\u09B8\u09BF \u09B2\u09C7\u09A8\u09A6\u09C7\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF Mercury, Wise Business \u0993 \u099F\u09BF\u09AF\u09BC\u09BE\u09B0-\u09E7 \u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u0996\u09CB\u09B2\u09BE\u0964

${content ? `
**\u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA:**
${content.slice(0, 300)}...` : ""}

\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u09A8\u09BF\u09DF\u09C7 \u0995\u09CB\u09A8\u09CB \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09A5\u09BE\u0995\u09B2\u09C7 \u099C\u09BE\u09A8\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8!`,
          source: "RAG"
        };
      }
      return {
        reply: `Trek Consultancy's **International Business Services** (Pillar 6) streamline global business expansion:

- **USA LLC & C-Corp Formation**: Incorporation across Delaware, Wyoming, and Florida including IRS Employer Identification Number (EIN) issuance.
- **UK Limited Companies**: Companies House registration, London registered office, and VAT/HMRC compliance.
- **Canadian Corporations**: Federal and provincial entity incorporation.
- **Global Business Banking**: Multi-currency banking accounts with Mercury, Wise, Relay, and tier-1 institutions.

${content ? `
**From our Records:**
${content.slice(0, 300)}...
` : ""}
Feel free to ask about Delaware vs Wyoming advantages or global bank requirements!`,
        source: "RAG"
      };
    }
    if (scoredTickets.length > 0 && scoredTickets[0].score >= 6) {
      const topTkt = scoredTickets[0].ticket;
      if (userLang === "bn") {
        return {
          reply: `\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BF\u09A8\u09BF\u09DF\u09B0 \u0995\u09A8\u09B8\u09BE\u09B2\u099F\u09C7\u09A8\u09CD\u099F \u099F\u09BF\u09AE \u0995\u09B0\u09CD\u09A4\u09C3\u0995 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8:

${topTkt.adminAnswer}`,
          source: "STAFF"
        };
      }
      return {
        reply: `According to our Senior Advisory & Support resolution:

${topTkt.adminAnswer}`,
        source: "STAFF"
      };
    }
    if (scoredFaqs.length > 0 && scoredFaqs[0].score >= 6) {
      const f = scoredFaqs[0].faq;
      const ans = userLang === "bn" && f.answer_bn ? f.answer_bn : f.answer;
      return {
        reply: ans,
        source: "FAQ"
      };
    }
    if (scoredDocs.length > 0 && scoredDocs[0].score >= 6) {
      const d = scoredDocs[0].doc;
      if (userLang === "bn") {
        return {
          reply: d.content_bn || d.content,
          source: "RAG"
        };
      }
      return {
        reply: d.content,
        source: "RAG"
      };
    }
    if (userLang === "bn") {
      return {
        reply: `\u0986\u09AE\u09BF Trek Consultancy-\u09B0 \u098F\u0986\u0987 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09BF\u09A4\u09C7 \u0986\u09AE\u09BF \u0986\u09A8\u09A8\u09CD\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4!

\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09AA\u09A8\u09BF \u09A8\u09BF\u09AE\u09CD\u09A8\u09B2\u09BF\u0996\u09BF\u09A4 \u09AC\u09BF\u09B7\u09DF\u0997\u09C1\u09B2\u09CB \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09A4\u09A5\u09CD\u09AF \u0993 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u09AA\u09C7\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8:

- **\u09B8\u09CC\u09A6\u09BF \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u0997\u09A0\u09A8 \u0993 MISA \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8**: \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09E7\u09E6\u09E6% \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF \u09AE\u09BE\u09B2\u09BF\u0995\u09BE\u09A8\u09BE \u0993 \u09B2\u09BE\u0987\u09B8\u09C7\u09A8\u09CD\u09B8\u09BF\u0982 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE
- **\u09B8\u09AB\u099F\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8**: \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0987\u0986\u09B0\u09AA\u09BF, \u0993\u09AF\u09BC\u09C7\u09AC/\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u0985\u09CD\u09AF\u09BE\u09AA\u09B8 \u098F\u09AC\u0982 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u0986\u09B0\u09CD\u0995\u09BF\u099F\u09C7\u0995\u099A\u09BE\u09B0
- **\u09AD\u09BF\u09B8\u09BE \u0993 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF PRO \u09B8\u09C7\u09AC\u09BE**: \u0987\u09A8\u09AD\u09C7\u09B8\u09CD\u099F\u09B0 \u09AD\u09BF\u09B8\u09BE, \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995 \u09AA\u09BE\u09B0\u09AE\u09BF\u099F \u0993 \u0987\u0995\u09BE\u09AE\u09BE \u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982
- **\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09B0\u09BF\u09AF\u09BC\u09C7\u09B2 \u098F\u09B8\u09CD\u099F\u09C7\u099F**: \u0985\u09AB\u09BF\u09B8 \u09B8\u09CD\u09AA\u09C7\u09B8, \u099C\u09AE\u09BF \u0993 \u0987\u09A8\u09CD\u09A1\u09BE\u09B8\u09CD\u099F\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B2\u09BF\u099C \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6
- **\u099F\u09CD\u09AF\u09BE\u0995\u09CD\u09B8 \u0993 \u0985\u09A1\u09BF\u099F**: ZATCA \u0987-\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8\u09BF\u0982, \u09AD\u09CD\u09AF\u09BE\u099F \u09AB\u09BE\u0987\u09B2\u09BF\u0982 \u098F\u09AC\u0982 \u09AC\u09BE\u09B0\u09CD\u09B7\u09BF\u0995 \u09B9\u09BF\u09B8\u09BE\u09AC\u09B0\u0995\u09CD\u09B7\u09A3
- **\u09AB\u09CB\u09B0\u09BE\u09AE \u0995\u09AE\u09BF\u0989\u09A8\u09BF\u099F\u09BF**: \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AA\u09CB\u09B8\u09CD\u099F \u0995\u09B0\u09BE \u0993 \u09AC\u09BF\u09B6\u09C7\u09B7\u099C\u09CD\u099E\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09A8\u09C7\u0993\u09DF\u09BE

\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09BF \u098F\u0987 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u0997\u09C1\u09B2\u09CB\u09B0 \u0995\u09CB\u09A8\u09CB\u099F\u09BF\u09A4\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09AC\u09BE \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8? \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u099F\u09BF \u098F\u0995\u099F\u09C1 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09B2\u09BF\u0996\u09C1\u09A8, \u0986\u09AE\u09BF \u098F\u0996\u09A8\u0987 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u09A4\u09A5\u09CD\u09AF \u0989\u09AA\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u0995\u09B0\u09AC!`,
        source: "AI"
      };
    }
    return {
      reply: `I am your Trek Consultancy AI Support Assistant, and I am glad to assist you!

I can provide direct guidance, regulatory steps, and technical explanations across all of our enterprise services:

- **Saudi Business Setup & MISA**: 100% foreign ownership company formation, Commercial Registration (CR), and corporate banking
- **Software & Digital Solutions**: Enterprise ERPs, custom web/mobile applications, and modern cloud architecture
- **Visa & PRO Government Liaison**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem portals
- **Commercial Real Estate**: Office spaces, warehouses, and foreign asset investment advisory
- **Corporate Support & Tax**: ZATCA Phase 2 e-invoicing, statutory accounting, and financial audits
- **Community Forum**: How to post questions, explore solutions, and collaborate with our engineering team

Could you share a bit more detail on what you are looking to achieve? I will provide you with the exact steps and information!`,
      source: "AI"
    };
  }
  app.post("/api/support/messages", async (req, res) => {
    try {
      const { sessionId, message, language, userEmail, userId, userName } = req.body;
      const cleanSession = sessionId || "default";
      const cleanMsg = (message || "").trim();
      const cleanEmail = (userEmail || "").trim().toLowerCase();
      let cleanUserId = (userId || "").trim() || null;
      let cleanUserName = (userName || "").trim() || (cleanEmail ? cleanEmail.split("@")[0] : null);
      if (cleanEmail) {
        try {
          const userMatch = await pool.query("SELECT id, name FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
          if (userMatch.rows.length > 0) {
            cleanUserId = userMatch.rows[0].id;
            if (!userName) cleanUserName = userMatch.rows[0].name;
          }
        } catch {
        }
      }
      const isGuest = !cleanEmail && !cleanUserId;
      const hasBengaliScript = /[\u0980-\u09FF]/.test(cleanMsg);
      const hasArabicScript = /[\u0600-\u06FF]/.test(cleanMsg);
      const BANGLISH_REGEX = /\b(ki|kivabe|ki\s*vabe|kivabhe|ki\s*ki|ki\s*hobe|ki\s*kora|lagbe|lagbo|lage|korte|korbo|korben|koren|korle|kore|kora|korche|korchen|chai|chan|chassi|ache|achhe|ase|asi|asen|nai|nay|nei|kothay|kothai|keno|kemon|amake|apnake|apnader|apnar|amader|amar|tader|tar|koto|shomoy|somoy|taka|khoroch|khroch|khulbo|khulte|shuru|suru|bolen|bolben|janan|janaben|sahajjo|sahayyo|sahata|bujhte|parbo|parben|pabo|paben|hobe|hoise|hoyeche|shob|sob|ektu|bepare|shomporke|somporke|thake|thakbe|deben|dite|apnara|amra|tara|dorkar|kichu|kisu|konta|konti|sathe|shathe)\b/i;
      const isBanglish = BANGLISH_REGEX.test(cleanMsg);
      const userLang = language === "ar" || hasArabicScript ? "ar" : language === "bn" || hasBengaliScript || isBanglish ? "bn" : "en";
      if (!cleanMsg) {
        return res.status(400).json({ error: "Message cannot be empty." });
      }
      if (isGuest && !cleanSession.startsWith("admin-")) {
        const countRes = await pool.query(
          `SELECT COUNT(*) FROM messages WHERE (conversation_id = $1 OR session_id = $1) AND (role = 'user' OR sender = 'user')`,
          [cleanSession]
        );
        const existingCount = parseInt(countRes.rows[0].count, 10);
        if (existingCount >= 3) {
          return res.status(403).json({
            error: "Free conversation preview limit reached. Please sign in or create an account to continue.",
            requiresAuth: true
          });
        }
      }
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
      const userMsgId = `msg-${Date.now()}-u`;
      const [historyRes, { faqsData, docsData, topicsData, blogsData, settingsData, answeredTicketsData }, businessMemory] = await Promise.all([
        pool.query(`
          SELECT COALESCE(sender, role) as sender, COALESCE(message, content) as message, source
          FROM messages
          WHERE conversation_id = $1 OR session_id = $1
          ORDER BY created_at DESC
          LIMIT 6
        `, [cleanSession]),
        getRagData(),
        getOrCompileBusinessMemory(pool)
      ]);
      await pool.query(`
        INSERT INTO messages (id, conversation_id, session_id, role, sender, content, message, source, user_id, user_email, is_guest, created_at)
        VALUES ($1, $2, $2, 'user', 'user', $3, $3, 'USER', $4, $5, $6, NOW())
      `, [userMsgId, cleanSession, cleanMsg, cleanUserId, cleanEmail || null, isGuest]);
      await pool.query(`
        INSERT INTO support_messages (id, session_id, user_id, user_email, is_guest, sender, message, source)
        VALUES ($1, $2, $3, $4, $5, 'user', $6, 'USER')
      `, [userMsgId, cleanSession, cleanUserId, cleanEmail || null, isGuest, cleanMsg]);
      const conversationHistory = (historyRes?.rows || []).reverse();
      const sanitizedDocs = (docsData?.rows || []).filter((d) => {
        const t = (d.title || "").toLowerCase();
        const c = d.content || "";
        if (t.includes("report") || t.includes("analysis") || t.includes("audit")) return false;
        if (c.startsWith("%PDF") || c.includes("/MediaBox") || c.includes("INTERNAL AUDIT") || c.includes("CONFIDENTIAL:")) return false;
        return true;
      });
      const sanitizedTickets = (answeredTicketsData?.rows || []).map((t) => {
        let cleanQ = (t.question || "").replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[contact email]").replace(/(?:\+|00)?(?:\d[\s\-\.\(\)]*){8,15}\d/g, "[contact phone]");
        cleanQ = cleanQ.replace(/⚡ AUTO-FLAGGED BY AI SUPPORT ASSISTANT[\s\S]*?Latest Client Message:\s*/i, "");
        cleanQ = cleanQ.replace(/Recent Conversation Transcript:[\s\S]*/i, "");
        return {
          id: t.id,
          ticketNumber: t.ticket_number,
          subject: (t.subject || "").replace(/^\[Auto-Flagged VIP Lead\]\s*/i, ""),
          question: cleanQ.trim().slice(0, 300),
          adminAnswer: (t.admin_answer || "").trim(),
          assignedTo: t.assigned_to || "Senior Advisory Desk"
        };
      }).filter((t) => t.adminAnswer.length > 0);
      const phoneMatch = cleanMsg.match(/(?:\+|00)?(?:\d[\s\-\.\(\)]*){8,15}\d/);
      const extractedPhone = phoneMatch ? phoneMatch[0].trim() : null;
      const emailMatch = cleanMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const extractedEmail = emailMatch ? emailMatch[0].trim() : null;
      const isContactProvided = Boolean(extractedPhone || extractedEmail && !extractedEmail.includes("default-session") && !extractedEmail.includes("guest@") && !extractedEmail.includes("client.trekconsultancy"));
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
          const clientEmail = extractedEmail || userEmail || existingTktRes.rows[0]?.user_email || (extractedPhone ? `lead-${extractedPhone.replace(/\D/g, "")}@client.trekconsultancy.com` : `guest-${cleanSession.slice(0, 8)}@client.trekconsultancy.com`);
          if (existingTktRes.rows.length === 0) {
            const ticketNum = `TKT-${Math.floor(1e3 + Math.random() * 9e3)}`;
            const autoTktId = `tkt-auto-${Date.now()}`;
            const subj = `[Auto-Flagged VIP Lead] ${cleanMsg.slice(0, 48)}...`;
            let contextLog = `\u26A1 AUTO-FLAGGED BY AI SUPPORT ASSISTANT (SECRET BACKGROUND ESCALATION)

`;
            contextLog += `Trigger Reason: ${isContactProvided ? "Client Provided Direct Contact Info" : isContactLead ? "Direct Consultation / WhatsApp Request" : isBespokeLead ? "Bespoke Enterprise / Contract Inquiry" : "Client Escalation"}
`;
            if (extractedPhone) contextLog += `Captured Phone/WhatsApp: ${extractedPhone}
`;
            if (extractedEmail) contextLog += `Captured Email: ${extractedEmail}
`;
            contextLog += `Visitor Session: ${cleanSession}

`;
            contextLog += `Latest Client Message:
"${cleanMsg}"

`;
            if (conversationHistory.length > 0) {
              contextLog += `Recent Conversation Transcript:
` + conversationHistory.map((m) => `[${m.sender.toUpperCase()}]: ${m.message}`).join("\n");
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
            let appendText = `

--- [Follow-up Update: ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ---
Client Message: "${cleanMsg}"`;
            if (extractedPhone) appendText += `
[Captured Phone/WhatsApp: ${extractedPhone}]`;
            if (extractedEmail) appendText += `
[Captured Email: ${extractedEmail}]`;
            await pool.query(`
              UPDATE support_tickets 
              SET question = question || $1,
                  user_email = COALESCE($2, user_email),
                  priority = 'Urgent'
              WHERE id = $3
            `, [appendText, extractedEmail || (extractedPhone ? `lead-${extractedPhone.replace(/\D/g, "")}@client.trekconsultancy.com` : null), currTkt.id]);
          }
        } catch (flagErr) {
          console.warn("[Auto-Flag] Background escalation log failed:", flagErr);
        }
      }
      const platformSettings = settingsData.rows[0]?.value || {};
      const supportEmail = platformSettings.primarySupportEmail || "support@trekconsultancy.com";
      const forumName = platformSettings.forumName || "Trek Consultancy Forum";
      const slaHours = platformSettings.slaHours || 2;
      let ragContext = `============================================================
`;
      ragContext += `PROJECT KNOWLEDGE BASE, RAG CHUNKS & LIVE DATABASE CONTEXT:
`;
      ragContext += `============================================================

`;
      ragContext += `PLATFORM IDENTITY & SETTINGS:
`;
      ragContext += `- Brand: ${forumName}
`;
      ragContext += `- Support Email: ${supportEmail}
`;
      ragContext += `- Official Ticket SLA: ${slaHours} Hours
`;
      ragContext += `- Description: Official community discussion forum and enterprise services portal for Trek Consultancy, connecting developers and clients, powered by Neon Serverless PostgreSQL persistence, role-based topic management, and enterprise full-stack development consultancy.

`;
      ragContext += `CHUNK KNOWLEDGE DOCUMENTS (RAG CHUNKS FROM ADMIN & AI EXTRACTION):
`;
      if (sanitizedDocs.length === 0) {
        ragContext += `(No custom documents uploaded yet)
`;
      } else {
        sanitizedDocs.forEach((d, idx) => {
          ragContext += `--- [Chunk #${idx + 1}: ${d.title} | Category: ${d.category || "General"}] ---
${d.content}

`;
        });
      }
      ragContext += `FREQUENTLY ASKED QUESTIONS (FAQS & ANSWERS):
`;
      faqsData.rows.forEach((f) => {
        ragContext += `[Category: ${f.category}]
- Question (EN): ${f.question}
  Answer (EN): ${f.answer}
`;
        if (f.question_bn || f.answer_bn) {
          ragContext += `  Question (BN): ${f.question_bn || ""}
  Answer (BN): ${f.answer_bn || ""}
`;
        }
      });
      ragContext += `
RECENT FORUM DISCUSSIONS (DATABASE TOPICS):
`;
      topicsData.rows.forEach((t) => {
        ragContext += `- Discussion: "${t.title}" (Category: ${t.category}, Author: ${t.author}, Views: ${t.views}, Replies: ${t.replies})
`;
      });
      ragContext += `
KNOWLEDGE BASE BLOGS & GUIDES:
`;
      blogsData.rows.forEach((b) => {
        ragContext += `- Guide: "${b.title}" (Category: ${b.category}): ${b.excerpt || ""}
`;
      });
      ragContext += `
VERIFIED HUMAN SUPPORT TICKETS & SENIOR CONSULTANT RESOLUTIONS:
`;
      if (sanitizedTickets.length === 0) {
        ragContext += `(No previous resolved support tickets yet)
`;
      } else {
        sanitizedTickets.forEach((t) => {
          ragContext += `[Resolution #${t.ticketNumber} | Topic: "${t.subject}"]
- Inquiry: ${t.question}
- Verified Resolution: ${t.adminAnswer}
  (Resolved by: ${t.assignedTo})

`;
        });
      }
      ragContext += `============================================================
`;
      let botReply = "";
      let replySource = "AI";
      const aiRuntime = await getEffectiveAiRuntime();
      if (aiRuntime.isKeyConfigured && aiRuntime.status !== "disabled") {
        const candidateModels = aiRuntime.candidateModels;
        const ai = new import_genai.GoogleGenAI({ apiKey: aiRuntime.apiKey });
        const memoryPromptBlock = formatBusinessMemoryForPrompt(businessMemory);
        const systemInstruction = `You are Trek Support Assistant, the premier AI Executive Consultant and support assistant for Trek Consultancy Forum.

${memoryPromptBlock}

============================================================
ADDITIONAL LIVE DATABASE CONTEXT & RECENT PLATFORM POSTS:
============================================================
- Support Email: ${supportEmail}
- Forum: ${forumName}
- SLA: ${slaHours} Hours

Guidelines:
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
- PRESENTATION & TYPOGRAPHY: Present answers with executive institutional clarity.
  * Headers: Use '### Title \u2014 Subtitle' for main section headings.
  * Lists: ALWAYS use standard markdown list hyphens ('- Item') preceded by a blank line before the list. NEVER use unicode bullets ('\u2022') or clump items together into single paragraphs.
  * Bold terms: Bold the primary concept at the beginning of each item (e.g. '- **Milestone**: Concise details').
  * Paragraphs: Use double linebreaks between paragraphs for clean executive spacing.
  * Closing: When concluding advice, include an executive advisory blockquote signature ('> **Senior Advisory Desk:** ...').`;
        const conversationContents = [];
        for (const item of conversationHistory) {
          const role = item.sender === "user" ? "user" : "model";
          const text = (item.message || "").trim();
          if (!text) continue;
          if (conversationContents.length > 0 && conversationContents[conversationContents.length - 1].role === role) {
            conversationContents[conversationContents.length - 1].parts[0].text += `

${text}`;
          } else {
            conversationContents.push({
              role,
              parts: [{ text }]
            });
          }
        }
        if (conversationContents.length > 0 && conversationContents[conversationContents.length - 1].role === "user") {
          conversationContents[conversationContents.length - 1].parts[0].text += `

${cleanMsg}`;
        } else {
          conversationContents.push({
            role: "user",
            parts: [{ text: cleanMsg }]
          });
        }
        while (conversationContents.length > 0 && conversationContents[0].role !== "user") {
          conversationContents.shift();
        }
        for (const modelName of candidateModels) {
          try {
            const response = await withTimeout(
              ai.models.generateContent({
                model: modelName,
                contents: conversationContents,
                config: {
                  systemInstruction: aiRuntime.customSystemInstruction ? `${systemInstruction}

SPECIAL ADMINISTRATIVE DIRECTIVE:
${aiRuntime.customSystemInstruction}` : systemInstruction,
                  temperature: aiRuntime.temperature,
                  maxOutputTokens: Math.min(aiRuntime.maxOutputTokens, 2048)
                }
              }),
              7e3
            );
            if (response.text) {
              botReply = response.text.trim();
              replySource = "AI";
              break;
            }
          } catch (aiErr) {
            const errMsg = String(aiErr?.message || "");
            const isAuthOrQuotaError = errMsg.includes("401") || errMsg.includes("UNAUTHENTICATED") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") || errMsg.includes("API_KEY_SERVICE_BLOCKED");
            if (isAuthOrQuotaError) {
              break;
            }
            continue;
          }
        }
      }
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
        userMessage: { id: userMsgId, sender: "user", message: cleanMsg, source: "USER", time: "Just now" },
        botReply: { id: botMsgId, sender: "bot", message: botReply, source: replySource, time: "Just now" },
        conversation: {
          sessionId: cleanSession,
          isGuest,
          userId: cleanUserId || void 0,
          userEmail: cleanEmail || void 0
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/support/tickets", async (req, res) => {
    try {
      const status = req.query.status || "";
      const priority = req.query.priority || "";
      const q = (req.query.q || "").trim().toLowerCase();
      let query = `
        SELECT id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
               subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo",
               created_at as "createdAt", answered_at as "answeredAt"
        FROM support_tickets
        WHERE 1=1
      `;
      const params = [];
      let pIdx = 1;
      if (status && status !== "all") {
        params.push(status.toUpperCase());
        query += ` AND status = $${pIdx++}`;
      }
      if (priority && priority !== "all") {
        params.push(priority);
        query += ` AND priority = $${pIdx++}`;
      }
      if (q) {
        params.push(`%${q}%`);
        query += ` AND (LOWER(subject) LIKE $${pIdx} OR LOWER(question) LIKE $${pIdx} OR LOWER(user_email) LIKE $${pIdx} OR LOWER(ticket_number) LIKE $${pIdx})`;
        pIdx++;
      }
      query += " ORDER BY created_at DESC";
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/admin/support/tickets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminAnswer, assignedTo, priority } = req.body;
      const ticketCheck = await pool.query("SELECT * FROM support_tickets WHERE id = $1", [id]);
      if (ticketCheck.rows.length === 0) {
        return res.status(404).json({ error: "Support ticket not found." });
      }
      const current = ticketCheck.rows[0];
      const newStatus = status || current.status;
      const newAnswer = adminAnswer !== void 0 ? adminAnswer : current.admin_answer;
      const newAssigned = assignedTo !== void 0 ? assignedTo : current.assigned_to;
      const newPriority = priority || current.priority;
      const answeredAt = newAnswer ? (/* @__PURE__ */ new Date()).toISOString() : current.answered_at;
      const updateRes = await pool.query(`
        UPDATE support_tickets
        SET status = $1, admin_answer = $2, assigned_to = $3, priority = $4, answered_at = $5
        WHERE id = $6
        RETURNING id, ticket_number as "ticketNumber", user_id as "userId", user_email as "userEmail", session_id as "sessionId",
                  subject, question, priority, status, admin_answer as "adminAnswer", assigned_to as "assignedTo",
                  created_at as "createdAt", answered_at as "answeredAt"
      `, [newStatus, newAnswer, newAssigned, newPriority, answeredAt, id]);
      if (adminAnswer && (current.session_id || current.conversation_id)) {
        const targetSession = current.conversation_id || current.session_id;
        const msgId = `msg-${Date.now()}-admin`;
        const staffMsg = adminAnswer.trim();
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
      try {
        await pool.query(`
          INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
          VALUES ($1, $2, $3, $4, 'Just now', 'support')
        `, [`act-${Date.now()}`, "Updated Support Ticket", newAssigned || "Admin Staff", `#${current.ticket_number}`]);
      } catch (logErr) {
        console.warn("Failed to log ticket update:", logErr);
      }
      invalidateRagCache();
      res.json(updateRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/support/tickets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM support_tickets WHERE id = $1 RETURNING ticket_number", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Ticket not found." });
      }
      invalidateRagCache();
      res.json({ success: true, message: `Ticket #${result.rows[0].ticket_number} deleted.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/support/faqs", async (req, res) => {
    try {
      const { categoryId, question, answer, questionBn, answerBn, status, createdBy } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and Answer are required." });
      }
      const id = `faq-${Date.now()}`;
      const insertRes = await pool.query(`
        INSERT INTO faqs (id, category_id, question, answer, question_bn, answer_bn, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, category_id as "categoryId", question, answer, question_bn as "questionBn", answer_bn as "answerBn", status, created_by as "createdBy", created_at as "createdAt"
      `, [id, categoryId || "cat-forum", question.trim(), answer.trim(), (questionBn || "").trim(), (answerBn || "").trim(), status || "published", createdBy || "Admin Staff"]);
      invalidateRagCache();
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/admin/support/faqs/:id", async (req, res) => {
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
        return res.status(404).json({ error: "FAQ item not found." });
      }
      invalidateRagCache();
      res.json(updateRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/support/faqs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM faqs WHERE id = $1 RETURNING id", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "FAQ item not found." });
      }
      invalidateRagCache();
      res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/support/conversations", async (_req, res) => {
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/support/conversations/:sessionId/reply", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message, staffName } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message cannot be empty." });
      }
      const convRes = await pool.query("SELECT user_id, user_email, is_guest FROM conversations WHERE id = $1 OR session_id = $1", [sessionId]);
      const conv = convRes.rows[0] || {};
      const msgId = `msg-${Date.now()}-staff`;
      const staffMsg = message.trim();
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/customers", async (_req, res) => {
    try {
      const usersRes = await pool.query(`
        SELECT 
          id, 
          name, 
          email, 
          phone, 
          whatsapp, 
          role, 
          status, 
          avatar, 
          joined_date as "joinedDate", 
          threads_count as "threadsCount", 
          created_at as "createdAt", 
          last_login_at as "lastLoginAt"
        FROM users
        ORDER BY created_at DESC
      `);
      const convsRes = await pool.query(`
        SELECT 
          id, 
          session_id as "sessionId", 
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
        ORDER BY updated_at DESC
      `);
      const convsByEmail = {};
      const convsByUserId = {};
      const unlinkedConvs = [];
      for (const conv of convsRes.rows) {
        let linked = false;
        if (conv.userId) {
          if (!convsByUserId[conv.userId]) convsByUserId[conv.userId] = [];
          convsByUserId[conv.userId].push(conv);
          linked = true;
        }
        if (conv.userEmail) {
          const emailKey = conv.userEmail.trim().toLowerCase();
          if (!convsByEmail[emailKey]) convsByEmail[emailKey] = [];
          convsByEmail[emailKey].push(conv);
          linked = true;
        }
        if (!linked) {
          unlinkedConvs.push(conv);
        }
      }
      const customersList = [];
      const processedEmails = /* @__PURE__ */ new Set();
      for (const u of usersRes.rows) {
        const emailKey = (u.email || "").trim().toLowerCase();
        if (emailKey) processedEmails.add(emailKey);
        const userConvs = [
          ...convsByUserId[u.id] || [],
          ...convsByEmail[emailKey] || []
        ];
        const uniqueConvs = Array.from(new Map(userConvs.map((c) => [c.id, c])).values());
        const convsCount = uniqueConvs.length;
        const totalMessages = uniqueConvs.reduce((acc, c) => acc + (Number(c.messageCount) || 0), 0);
        let lastActive = u.lastLoginAt || u.createdAt;
        let latestSnippet = "";
        if (uniqueConvs.length > 0) {
          uniqueConvs.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
          const latestConv = uniqueConvs[0];
          latestSnippet = latestConv.lastMessage || "";
          const convTime = new Date(latestConv.updatedAt || latestConv.createdAt);
          if (!lastActive || convTime > new Date(lastActive)) {
            lastActive = latestConv.updatedAt || latestConv.createdAt;
          }
        }
        customersList.push({
          id: u.id,
          name: u.name || (emailKey ? emailKey.split("@")[0] : "User"),
          email: u.email,
          phone: u.phone || u.whatsapp || "",
          whatsapp: u.whatsapp || u.phone || "",
          role: u.role || "User",
          status: u.status || "active",
          avatar: u.avatar || getRandomAvatar(u.email || u.name),
          joinedDate: u.joinedDate || "Recent",
          createdAt: u.createdAt,
          lastActive: lastActive ? new Date(lastActive).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          threadsCount: Number(u.threadsCount) || 0,
          conversationsCount: convsCount,
          messagesCount: totalMessages,
          isRegistered: true,
          latestMessageSnippet: latestSnippet,
          sessionIds: uniqueConvs.map((c) => c.id)
        });
      }
      for (const [emailKey, convs] of Object.entries(convsByEmail)) {
        if (!emailKey || processedEmails.has(emailKey)) continue;
        processedEmails.add(emailKey);
        const convsCount = convs.length;
        const totalMessages = convs.reduce((acc, c) => acc + (Number(c.messageCount) || 0), 0);
        convs.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        const latestConv = convs[0];
        customersList.push({
          id: latestConv.userId || `lead-${encodeURIComponent(emailKey)}`,
          name: latestConv.userName || emailKey.split("@")[0],
          email: emailKey,
          phone: latestConv.userWhatsapp || "",
          whatsapp: latestConv.userWhatsapp || "",
          role: "Guest Lead",
          status: "lead",
          avatar: getRandomAvatar(emailKey),
          joinedDate: new Date(latestConv.createdAt).toLocaleDateString(),
          createdAt: latestConv.createdAt,
          lastActive: latestConv.updatedAt || latestConv.createdAt,
          threadsCount: 0,
          conversationsCount: convsCount,
          messagesCount: totalMessages,
          isRegistered: false,
          latestMessageSnippet: latestConv.lastMessage || "",
          sessionIds: convs.map((c) => c.id)
        });
      }
      for (const conv of unlinkedConvs) {
        customersList.push({
          id: `guest-${conv.id}`,
          name: conv.userName || `Guest (${conv.id.slice(-6)})`,
          email: "",
          phone: conv.userWhatsapp || "",
          whatsapp: conv.userWhatsapp || "",
          role: "Guest Visitor",
          status: "lead",
          avatar: getRandomAvatar(conv.id),
          joinedDate: new Date(conv.createdAt).toLocaleDateString(),
          createdAt: conv.createdAt,
          lastActive: conv.updatedAt || conv.createdAt,
          threadsCount: 0,
          conversationsCount: 1,
          messagesCount: Number(conv.messageCount) || 0,
          isRegistered: false,
          latestMessageSnippet: conv.lastMessage || "",
          sessionIds: [conv.id]
        });
      }
      customersList.sort((a, b) => new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime());
      res.json(customersList);
    } catch (err) {
      console.error("[Admin Customers] Failed to fetch customers:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/customers/:id/conversations", async (req, res) => {
    try {
      const rawId = req.params.id;
      let targetEmail = "";
      let targetUserId = "";
      let targetSessionId = "";
      if (rawId.startsWith("lead-")) {
        targetEmail = decodeURIComponent(rawId.replace("lead-", "")).trim().toLowerCase();
      } else if (rawId.startsWith("guest-")) {
        targetSessionId = rawId.replace("guest-", "");
      } else if (rawId.includes("@")) {
        targetEmail = rawId.trim().toLowerCase();
      } else {
        targetUserId = rawId;
      }
      let userObj = null;
      if (targetUserId) {
        const uRes = await pool.query("SELECT * FROM users WHERE id = $1", [targetUserId]);
        if (uRes.rows[0]) {
          userObj = uRes.rows[0];
          targetEmail = (userObj.email || "").trim().toLowerCase();
        }
      } else if (targetEmail) {
        const uRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [targetEmail]);
        if (uRes.rows[0]) {
          userObj = uRes.rows[0];
          targetUserId = userObj.id;
        }
      }
      let convsQuery = `
        SELECT 
          id, 
          session_id as "sessionId", 
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
        WHERE 1=0
      `;
      const convsParams = [];
      let pIdx = 1;
      if (targetUserId) {
        convsQuery += ` OR user_id = $${pIdx++}`;
        convsParams.push(targetUserId);
      }
      if (targetEmail) {
        convsQuery += ` OR (user_email IS NOT NULL AND LOWER(user_email) = $${pIdx++})`;
        convsParams.push(targetEmail);
      }
      if (targetSessionId) {
        convsQuery += ` OR id = $${pIdx++} OR session_id = $${pIdx++}`;
        convsParams.push(targetSessionId, targetSessionId);
      } else if (rawId) {
        convsQuery += ` OR id = $${pIdx++} OR session_id = $${pIdx++}`;
        convsParams.push(rawId, rawId);
      }
      convsQuery += ` ORDER BY updated_at DESC`;
      const convsRes = await pool.query(convsQuery, convsParams);
      const convs = convsRes.rows;
      const sessionIds = Array.from(new Set(convs.map((c) => c.id).concat(convs.map((c) => c.sessionId)).filter(Boolean)));
      if (targetSessionId && !sessionIds.includes(targetSessionId)) {
        sessionIds.push(targetSessionId);
      }
      let messages = [];
      if (sessionIds.length > 0 || targetEmail || targetUserId) {
        let msgQuery = `
          SELECT 
            id, 
            conversation_id as "conversationId", 
            session_id as "sessionId", 
            role, 
            COALESCE(sender, CASE WHEN role = 'assistant' THEN 'bot' ELSE role END) as sender, 
            COALESCE(message, content) as message, 
            content, 
            source, 
            user_id as "userId", 
            user_email as "userEmail", 
            is_guest as "isGuest", 
            created_at as "createdAt"
          FROM messages
          WHERE 1=0
        `;
        const msgParams = [];
        let mIdx = 1;
        if (sessionIds.length > 0) {
          msgQuery += ` OR conversation_id = ANY($${mIdx++}) OR session_id = ANY($${mIdx++})`;
          msgParams.push(sessionIds, sessionIds);
        }
        if (targetEmail) {
          msgQuery += ` OR (user_email IS NOT NULL AND LOWER(user_email) = $${mIdx++})`;
          msgParams.push(targetEmail);
        }
        if (targetUserId) {
          msgQuery += ` OR user_id = $${mIdx++}`;
          msgParams.push(targetUserId);
        }
        msgQuery += ` ORDER BY created_at ASC`;
        const msgRes = await pool.query(msgQuery, msgParams);
        messages = msgRes.rows;
      }
      const messagesByConvId = {};
      for (const msg of messages) {
        const cId = msg.conversationId || msg.sessionId || "default";
        if (!messagesByConvId[cId]) messagesByConvId[cId] = [];
        messagesByConvId[cId].push(msg);
      }
      const enrichedConversations = convs.map((c) => ({
        ...c,
        messages: messagesByConvId[c.id] || messagesByConvId[c.sessionId] || []
      }));
      let forumTopics = [];
      if (targetEmail || targetUserId) {
        const topRes = await pool.query(`
          SELECT id, title, category, views, replies, created_at as "createdAt"
          FROM topics
          WHERE (author_email IS NOT NULL AND LOWER(author_email) = $1)
             OR (author_id IS NOT NULL AND author_id = $2)
          ORDER BY created_at DESC
          LIMIT 10
        `, [targetEmail || "___none___", targetUserId || "___none___"]);
        forumTopics = topRes.rows;
      }
      const customerInfo = {
        id: userObj ? userObj.id : rawId,
        name: userObj ? userObj.name : convs[0]?.userName || (targetEmail ? targetEmail.split("@")[0] : "Guest Visitor"),
        email: userObj ? userObj.email : targetEmail || "",
        phone: userObj ? userObj.phone || userObj.whatsapp || "" : convs[0]?.userWhatsapp || "",
        whatsapp: userObj ? userObj.whatsapp || userObj.phone || "" : convs[0]?.userWhatsapp || "",
        role: userObj ? userObj.role : "Guest Lead",
        status: userObj ? userObj.status : "lead",
        avatar: userObj?.avatar || getRandomAvatar(targetEmail || rawId),
        joinedDate: userObj ? userObj.joined_date : convs[0]?.createdAt ? new Date(convs[0].createdAt).toLocaleDateString() : "Recent",
        createdAt: userObj?.created_at || convs[0]?.createdAt,
        lastActive: convs[0]?.updatedAt || userObj?.last_login_at || (/* @__PURE__ */ new Date()).toISOString(),
        threadsCount: userObj ? Number(userObj.threads_count || 0) : forumTopics.length,
        conversationsCount: enrichedConversations.length,
        messagesCount: messages.length,
        isRegistered: Boolean(userObj)
      };
      res.json({
        customer: customerInfo,
        conversations: enrichedConversations,
        allMessages: messages,
        forumTopics
      });
    } catch (err) {
      console.error("[Admin Customer Conversations] Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/customers/:id/reply", async (req, res) => {
    try {
      const rawId = req.params.id;
      const { sessionId, message, staffName } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message cannot be empty." });
      }
      let activeSessionId = sessionId;
      let targetEmail = "";
      let targetUserId = "";
      if (rawId.startsWith("lead-")) {
        targetEmail = decodeURIComponent(rawId.replace("lead-", "")).trim().toLowerCase();
      } else if (rawId.includes("@")) {
        targetEmail = rawId.trim().toLowerCase();
      } else {
        targetUserId = rawId;
      }
      if (!activeSessionId) {
        const findConv = await pool.query(`
          SELECT id, session_id, user_id, user_email 
          FROM conversations 
          WHERE user_id = $1 OR (user_email IS NOT NULL AND LOWER(user_email) = $2)
          ORDER BY updated_at DESC LIMIT 1
        `, [targetUserId || "___none___", targetEmail || "___none___"]);
        if (findConv.rows[0]) {
          activeSessionId = findConv.rows[0].id;
          targetUserId = targetUserId || findConv.rows[0].user_id;
          targetEmail = targetEmail || findConv.rows[0].user_email;
        } else {
          activeSessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          await pool.query(`
            INSERT INTO conversations (id, session_id, user_id, user_email, title, is_guest, status, message_count, last_message, last_sender, created_at, updated_at)
            VALUES ($1, $1, $2, $3, 'Staff Direct Support', $4, 'active', 0, '', 'staff', NOW(), NOW())
          `, [activeSessionId, targetUserId || null, targetEmail || null, !targetUserId]);
        }
      }
      const msgId = `msg-${Date.now()}-staff`;
      const staffMsg = message.trim();
      const insertRes = await pool.query(`
        INSERT INTO messages (id, conversation_id, session_id, role, sender, content, message, source, user_id, user_email, is_guest, created_at)
        VALUES ($1, $2, $2, 'assistant', 'bot', $3, $3, 'STAFF', $4, $5, $6, NOW())
        RETURNING id, sender, message, content, role, source, created_at as "createdAt"
      `, [msgId, activeSessionId, staffMsg, targetUserId || null, targetEmail || null, !targetUserId]);
      await pool.query(`
        INSERT INTO support_messages (id, session_id, user_id, user_email, is_guest, sender, message, source)
        VALUES ($1, $2, $3, $4, $5, 'bot', $6, 'STAFF')
      `, [msgId, activeSessionId, targetUserId || null, targetEmail || null, !targetUserId, staffMsg]);
      await pool.query(`
        UPDATE conversations
        SET message_count = message_count + 1,
            last_message = $1,
            last_sender = 'staff',
            updated_at = NOW()
        WHERE id = $2 OR session_id = $2
      `, [staffMsg, activeSessionId]);
      invalidateRagCache();
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      console.error("[Admin Customer Reply] Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/support/knowledge-docs", async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
        FROM knowledge_documents
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/support/knowledge-docs", async (req, res) => {
    try {
      const { title, content, category, status } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
      }
      const id = `doc-${Date.now()}`;
      const cleanCat = category || "General";
      const cleanStatus = status || "published";
      const insertRes = await pool.query(`
        INSERT INTO knowledge_documents (id, title, content, category, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, content, category, status, created_at as "createdAt", updated_at as "updatedAt"
      `, [id, title.trim(), content.trim(), cleanCat, cleanStatus]);
      await pool.query(`
        INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, created_at)
        VALUES ($1, $2, $3, 0, NOW())
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
      `, [`chk-${id}-0`, id, content.trim()]);
      invalidateRagCache();
      res.status(201).json(insertRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/admin/support/knowledge-docs/:id", async (req, res) => {
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
        return res.status(404).json({ error: "Knowledge document not found." });
      }
      if (content) {
        await pool.query(`
          INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, created_at)
          VALUES ($1, $2, $3, 0, NOW())
          ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
        `, [`chk-${id}-0`, id, content.trim()]);
      }
      invalidateRagCache();
      res.json(updateRes.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/support/knowledge-docs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM knowledge_documents WHERE id = $1 RETURNING id", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Knowledge document not found." });
      }
      invalidateRagCache();
      res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/support/knowledge-docs/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required." });
      }
      await pool.query("DELETE FROM knowledge_documents WHERE id = ANY($1)", [ids]);
      invalidateRagCache();
      res.json({ success: true, deletedCount: ids.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  function decodePdfString(str) {
    return str.replace(/\\\\/g, "\\").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "	").replace(/\\b/g, "\b").replace(/\\f/g, "\f").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
  }
  function decodePdfHexString(hex) {
    const clean = hex.replace(/\s+/g, "");
    if (clean.length % 2 !== 0) return "";
    const buf = Buffer.from(clean, "hex");
    if (buf.length >= 2 && buf[0] === 254 && buf[1] === 255) {
      let s = "";
      for (let i = 2; i < buf.length - 1; i += 2) {
        s += String.fromCharCode(buf[i] << 8 | buf[i + 1]);
      }
      return s;
    }
    if (buf.length >= 4 && buf[0] === 0 && buf[2] === 0) {
      let s = "";
      for (let i = 0; i < buf.length; i += 2) {
        s += String.fromCharCode(buf[i] << 8 | buf[i + 1]);
      }
      return s;
    }
    return buf.toString("latin1");
  }
  function formatDetectedTables(text) {
    if (!text) return "";
    const lines = text.split("\n");
    const result = [];
    let tableRows = [];
    const flushTable = () => {
      if (tableRows.length >= 2) {
        const colCount = Math.max(...tableRows.map((r) => r.length));
        if (colCount >= 2) {
          const paddedRows = tableRows.map((r) => {
            const row = [...r];
            while (row.length < colCount) row.push("-");
            return row;
          });
          const header = "| " + paddedRows[0].join(" | ") + " |";
          const divider = "| " + Array(colCount).fill("---").join(" | ") + " |";
          result.push(header, divider);
          for (let i = 1; i < paddedRows.length; i++) {
            result.push("| " + paddedRows[i].join(" | ") + " |");
          }
          tableRows = [];
          return;
        }
      }
      for (const row of tableRows) {
        result.push(row.join("   "));
      }
      tableRows = [];
    };
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed.includes("	") || /[^\s]{2,}\s{3,}[^\s]{2,}/.test(trimmed))) {
        const cols = trimmed.split(/\t+|\s{3,}/).map((c) => c.trim()).filter(Boolean);
        if (cols.length >= 2) {
          tableRows.push(cols);
          continue;
        }
      }
      flushTable();
      result.push(line);
    }
    flushTable();
    return result.join("\n");
  }
  function extractTextFromPdfStreamFallback(buffer) {
    const textPieces = [];
    const raw = buffer.toString("latin1");
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const streamStart = match.index + match[0].indexOf("\n") + 1;
      const streamEnd = match.index + match[0].lastIndexOf("endstream");
      const streamBuf = buffer.subarray(streamStart, streamEnd);
      let decompressed = "";
      try {
        decompressed = import_node_zlib.default.inflateSync(streamBuf).toString("latin1");
      } catch {
        try {
          decompressed = import_node_zlib.default.inflateRawSync(streamBuf).toString("latin1");
        } catch {
          decompressed = streamBuf.toString("latin1");
        }
      }
      if (decompressed && (decompressed.includes("BT") || decompressed.includes("Tj") || decompressed.includes("TJ"))) {
        const lines = decompressed.split(/\r?\n/);
        let currentLineText = "";
        for (const line of lines) {
          if (line.includes("T*") || line.match(/T[dDmM]/)) {
            if (currentLineText.trim()) {
              textPieces.push(currentLineText.trim());
              currentLineText = "";
            }
          }
          const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/gi;
          let tjMatch;
          while ((tjMatch = tjArrayRegex.exec(line)) !== null) {
            const inner = tjMatch[1];
            const tokenRegex = /\(([^)]*)\)|<([0-9a-fA-F]+)>/g;
            let token;
            while ((token = tokenRegex.exec(inner)) !== null) {
              if (token[1] !== void 0) {
                currentLineText += decodePdfString(token[1]);
              } else if (token[2] !== void 0) {
                currentLineText += decodePdfHexString(token[2]);
              }
            }
          }
          const tjSingleRegex = /\(([^)]*)\)\s*(?:Tj|'|")/gi;
          let singleMatch;
          while ((singleMatch = tjSingleRegex.exec(line)) !== null) {
            currentLineText += " " + decodePdfString(singleMatch[1]);
          }
          const tjHexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/gi;
          let hexMatch;
          while ((hexMatch = tjHexRegex.exec(line)) !== null) {
            currentLineText += " " + decodePdfHexString(hexMatch[1]);
          }
          if (line.includes("ET")) {
            if (currentLineText.trim()) {
              textPieces.push(currentLineText.trim());
              currentLineText = "";
            }
          }
        }
        if (currentLineText.trim()) {
          textPieces.push(currentLineText.trim());
        }
      }
    }
    if (textPieces.length === 0) {
      const literalMatches = raw.match(/\(([^)]{4,})\)\s*Tj/g);
      if (literalMatches) {
        for (const lm of literalMatches) {
          const str = lm.replace(/^\(/, "").replace(/\)\s*Tj$/, "");
          textPieces.push(decodePdfString(str));
        }
      }
    }
    return textPieces.filter((p) => p.length > 1).join("\n\n").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ").replace(/[^\x20-\x7E\t\r\n\u00A0-\uFFFF]/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }
  async function extractTextFromPdf(buffer) {
    try {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      const rawText = Array.isArray(text) ? text.join("\n\n") : String(text || "");
      const cleaned = sanitizeCleanText(rawText);
      if (cleaned && isReadableCleanText(cleaned)) {
        return formatDetectedTables(cleaned);
      }
    } catch (unpdfErr) {
      console.warn("[PDF unpdf Engine] Fallback notice:", unpdfErr);
    }
    const fallbackText = extractTextFromPdfStreamFallback(buffer);
    return formatDetectedTables(fallbackText);
  }
  function extractTextFromDocx(buffer) {
    try {
      let offset = 0;
      while (offset < buffer.length - 30) {
        if (buffer[offset] === 80 && buffer[offset + 1] === 75 && buffer[offset + 2] === 3 && buffer[offset + 3] === 4) {
          const compressionMethod = buffer.readUInt16LE(offset + 8);
          const compressedSize = buffer.readUInt32LE(offset + 18);
          const fileNameLength = buffer.readUInt16LE(offset + 26);
          const extraFieldLength = buffer.readUInt16LE(offset + 28);
          const fileNameStart = offset + 30;
          const fileNameEnd = fileNameStart + fileNameLength;
          if (fileNameEnd <= buffer.length) {
            const fileName = buffer.toString("utf8", fileNameStart, fileNameEnd);
            const dataStart = fileNameEnd + extraFieldLength;
            const dataEnd = dataStart + compressedSize;
            if (fileName === "word/document.xml" || fileName.endsWith("/document.xml")) {
              if (dataEnd <= buffer.length) {
                const compressedData = buffer.subarray(dataStart, dataEnd);
                let xmlContent = "";
                if (compressionMethod === 8) {
                  xmlContent = import_node_zlib.default.inflateRawSync(compressedData).toString("utf8");
                } else if (compressionMethod === 0) {
                  xmlContent = compressedData.toString("utf8");
                }
                if (xmlContent) {
                  return xmlContent.replace(/<\/w:p>/gi, "\n\n").replace(/<w:br[^>]*>/gi, "\n").replace(/<w:tab[^>]*>/gi, "	").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
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
      console.warn("[Docx Extraction] In-memory ZIP parse warning:", err);
    }
    try {
      const raw = buffer.toString("utf8");
      const matches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        return matches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ").trim();
      }
    } catch {
    }
    return "";
  }
  function extractTextFromDoc(buffer) {
    try {
      const latin = buffer.toString("latin1");
      const clean = latin.replace(/[^\x20-\x7E\t\r\n]/g, " ");
      const paragraphs = clean.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 25);
      if (paragraphs.length > 0) {
        return paragraphs.join("\n\n");
      }
    } catch {
    }
    return "";
  }
  async function extractTextFromImage(buffer) {
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const ret = await worker.recognize(buffer);
      await worker.terminate();
      return ret?.data?.text ? sanitizeCleanText(ret.data.text) : "";
    } catch (ocrErr) {
      console.warn("[Image OCR] In-memory recognition notice:", ocrErr);
      return "";
    }
  }
  function sanitizeCleanText(raw) {
    if (!raw) return "";
    return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, " ").replace(/(\d+\s+\d+\s+obj\b[\s\S]*?\bendobj\b)/gi, " ").replace(/\b(xref|trailer|startxref)\b[\s\S]*/gi, " ").replace(/\/Type\s*\/[A-Za-z0-9]+/g, " ").replace(/<<[\s\S]*?>>/g, " ").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }
  function isReadableCleanText(text) {
    if (!text || text.trim().length < 15) return false;
    const trimmed = text.trim();
    if (/^%PDF/i.test(trimmed) || /^\d+\s+\d+\s+obj\b/i.test(trimmed) || /<<\s*\/Type/i.test(trimmed)) return false;
    const readableChars = (text.match(/[a-zA-Z0-9\u0600-\u06FF\u0980-\u09FF\s.,:;!?\-()[\]{}"'%@#/]/g) || []).length;
    return readableChars / text.length >= 0.7;
  }
  app.post("/api/admin/support/knowledge-docs/extract-from-file", async (req, res) => {
    try {
      const { fileData, fileName, mimeType, elementText, categoryHint, autoSave, apiKey } = req.body;
      if (!fileData && !elementText) {
        return res.status(400).json({ error: "Either file data or element text is required for analysis." });
      }
      const cleanFileName = (fileName || (elementText ? "Pasted Elements / Direct Input" : "Uploaded Document")).trim();
      const cleanMime = (mimeType || "text/plain").toLowerCase();
      const cleanCategory = (categoryHint || "General").trim();
      const aiRuntime = await getEffectiveAiRuntime();
      const effectiveApiKey = (apiKey || aiRuntime.apiKey || "").trim();
      let extractedChunks = [];
      let directTextContent = "";
      let isPdfOrImage = false;
      let base64Pure = "";
      if (elementText && typeof elementText === "string") {
        directTextContent = sanitizeCleanText(elementText);
      } else if (fileData) {
        const isDocx = cleanFileName.endsWith(".docx") || cleanMime.includes("wordprocessingml") || cleanMime.includes("docx");
        const isDoc = cleanFileName.endsWith(".doc") || cleanMime === "application/msword";
        const isPdf = cleanFileName.endsWith(".pdf") || cleanMime === "application/pdf";
        const isTextBased = cleanMime.startsWith("text/") || cleanMime === "application/json" || cleanMime === "text/csv" || cleanFileName.endsWith(".md") || cleanFileName.endsWith(".txt") || cleanFileName.endsWith(".json") || cleanFileName.endsWith(".csv");
        if (typeof fileData === "string" && fileData.includes("base64,")) {
          base64Pure = fileData.split("base64,")[1];
        } else if (typeof fileData === "string" && !fileData.startsWith("data:")) {
          base64Pure = fileData;
        }
        if (isPdf) {
          try {
            const buf = Buffer.from(base64Pure, "base64");
            const pdfExtracted = await extractTextFromPdf(buf);
            if (pdfExtracted && pdfExtracted.length > 20) {
              directTextContent = pdfExtracted;
            } else {
              isPdfOrImage = true;
            }
          } catch (pdfErr) {
            console.warn("[PDF Extraction] Warning:", pdfErr);
            isPdfOrImage = true;
          }
        } else if (isDocx || isDoc) {
          try {
            const buf = Buffer.from(base64Pure, "base64");
            if (isDocx) {
              directTextContent = extractTextFromDocx(buf);
            } else {
              directTextContent = extractTextFromDoc(buf);
            }
          } catch (err) {
            console.warn("Word file buffer decode failed:", err);
          }
        } else if (isTextBased) {
          if (typeof fileData === "string" && fileData.startsWith("data:")) {
            try {
              directTextContent = Buffer.from(base64Pure, "base64").toString("utf-8");
            } catch {
              directTextContent = fileData;
            }
          } else {
            directTextContent = fileData;
          }
          directTextContent = sanitizeCleanText(directTextContent);
        } else if (cleanMime.startsWith("image/") || cleanFileName.endsWith(".png") || cleanFileName.endsWith(".jpg") || cleanFileName.endsWith(".jpeg") || cleanFileName.endsWith(".webp")) {
          isPdfOrImage = true;
        }
      }
      let aiAuthFailed = false;
      if (effectiveApiKey) {
        const candidateModels = aiRuntime.candidateModels;
        const ai = new import_genai.GoogleGenAI({ apiKey: effectiveApiKey });
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
        let contentsPayload;
        if (isPdfOrImage && base64Pure) {
          const effectiveMime = cleanMime.startsWith("image/") || cleanMime === "application/pdf" ? cleanMime : cleanFileName.endsWith(".pdf") ? "application/pdf" : "image/png";
          contentsPayload = [
            {
              inlineData: {
                data: base64Pure,
                mimeType: effectiveMime
              }
            },
            `Document/Image Source: ${cleanFileName}
Preferred Category: ${cleanCategory}

Please perform deep, exhaustive analysis of this document/image. Extract ALL key knowledge points, procedures, tables, and details into comprehensive knowledge chunks according to the system instruction.`
          ];
        } else {
          const textPayload = directTextContent || "";
          contentsPayload = [
            `Document/Element Source: ${cleanFileName}
Preferred Category: ${cleanCategory}

Content to analyze:
${textPayload.slice(0, 12e4)}`
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
                  responseMimeType: "application/json",
                  temperature: 0.15,
                  maxOutputTokens: 8192
                }
              });
              if (response.text) {
                let cleanJson = response.text.trim();
                if (cleanJson.startsWith("```json")) {
                  cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```\s*$/, "");
                } else if (cleanJson.startsWith("```")) {
                  cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```\s*$/, "");
                }
                const parsed = JSON.parse(cleanJson);
                if (parsed.chunks && Array.isArray(parsed.chunks) && parsed.chunks.length > 0) {
                  extractedChunks = parsed.chunks.map((c, idx) => ({
                    title: sanitizeCleanText(String(c.title || `${cleanFileName} - Section ${idx + 1}`)),
                    category: sanitizeCleanText(String(c.category || cleanCategory)),
                    summary: sanitizeCleanText(String(c.summary || "")),
                    tags: Array.isArray(c.tags) ? c.tags.map((t) => sanitizeCleanText(String(t))) : [],
                    content: sanitizeCleanText(String(c.content || ""))
                  })).filter((c) => isReadableCleanText(c.content));
                  if (extractedChunks.length > 0) {
                    modelExtracted = true;
                    break;
                  }
                }
              }
            } catch (modelErr) {
              const msg = String(modelErr?.message || "");
              const isAuthError = msg.includes("401") || msg.includes("UNAUTHENTICATED") || msg.includes("API_KEY_INVALID") || msg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") || msg.includes("API_KEY_SERVICE_BLOCKED");
              if (isAuthError) {
                aiAuthFailed = true;
                shouldAbortAll = true;
                console.warn("[Gemini Auth Warning] Invalid or unauthenticated API key:", msg);
                break;
              }
              const isTransient = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("429") || msg.includes("high demand");
              if (isTransient && attempt === 0) {
                await new Promise((r) => setTimeout(r, 400));
                continue;
              }
              break;
            }
          }
          if (shouldAbortAll || modelExtracted) break;
        }
      }
      if (extractedChunks.length === 0 && isPdfOrImage && !directTextContent && base64Pure) {
        try {
          const imgBuf = Buffer.from(base64Pure, "base64");
          const ocrText = await extractTextFromImage(imgBuf);
          if (ocrText && ocrText.length > 20) {
            directTextContent = ocrText;
          }
        } catch (ocrErr) {
          console.warn("[OCR Fallback] Offline image OCR notice:", ocrErr);
        }
      }
      if (extractedChunks.length === 0) {
        let textToChunk = directTextContent;
        const baseTitle = cleanFileName.replace(/\.[^/.]+$/, "");
        if (textToChunk && isReadableCleanText(textToChunk)) {
          try {
            const parsedObj = JSON.parse(textToChunk);
            if (Array.isArray(parsedObj)) {
              parsedObj.slice(0, 20).forEach((item, idx) => {
                const title = sanitizeCleanText(item.title || item.name || item.subject || `${baseTitle} - Entry ${idx + 1}`);
                const content = sanitizeCleanText(typeof item === "object" ? JSON.stringify(item, null, 2) : String(item));
                if (isReadableCleanText(content)) {
                  extractedChunks.push({
                    title,
                    category: cleanCategory,
                    summary: `Data item ${idx + 1} from ${cleanFileName}`,
                    tags: ["JSON", cleanCategory],
                    content
                  });
                }
              });
            } else if (typeof parsedObj === "object" && parsedObj !== null) {
              Object.keys(parsedObj).slice(0, 20).forEach((k) => {
                const val = parsedObj[k];
                const content = sanitizeCleanText(typeof val === "object" ? JSON.stringify(val, null, 2) : String(val));
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
          } catch {
          }
          if (extractedChunks.length === 0 && (cleanMime === "text/csv" || cleanFileName.endsWith(".csv") || textToChunk.includes(","))) {
            const lines = textToChunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            if (lines.length > 1 && lines[0].includes(",")) {
              const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
              lines.slice(1, 20).forEach((line, idx) => {
                const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
                const content = headers.map((h, i) => `**${h}**: ${cols[i] || ""}`).join("\n");
                if (isReadableCleanText(content)) {
                  extractedChunks.push({
                    title: `${baseTitle} - Row ${idx + 1} (${cols[0] || "Record"})`,
                    category: cleanCategory,
                    summary: `Row ${idx + 1} data`,
                    tags: ["CSV", cleanCategory],
                    content
                  });
                }
              });
            }
          }
          if (extractedChunks.length === 0) {
            const markdownSections = textToChunk.split(/\n(?=#{1,3}\s+)/g).filter((s) => s.trim().length > 20);
            if (markdownSections.length > 1) {
              markdownSections.slice(0, 20).forEach((sec, idx) => {
                const firstLine = sec.trim().split("\n")[0].replace(/^#{1,3}\s+/, "").trim();
                const body = sanitizeCleanText(sec.trim().replace(/^#{1,3}\s+[^\n]+\n?/, "").trim() || sec.trim());
                if (isReadableCleanText(body)) {
                  extractedChunks.push({
                    title: firstLine.length > 0 && firstLine.length < 80 ? firstLine : `${baseTitle} - Part ${idx + 1}`,
                    category: cleanCategory,
                    summary: `Section ${idx + 1} from ${cleanFileName}`,
                    tags: ["Documentation", cleanCategory],
                    content: body
                  });
                }
              });
            }
          }
          if (extractedChunks.length === 0) {
            const paragraphs = textToChunk.split(/\n\s*\n+/).map((p) => sanitizeCleanText(p.trim())).filter((p) => isReadableCleanText(p));
            if (paragraphs.length > 0) {
              const groupedChunks = [];
              let currentGroup = "";
              for (const p of paragraphs) {
                if (currentGroup.length + p.length > 800) {
                  groupedChunks.push(currentGroup.trim());
                  currentGroup = p;
                } else {
                  currentGroup += (currentGroup ? "\n\n" : "") + p;
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
          if (extractedChunks.length === 0 && isReadableCleanText(textToChunk)) {
            extractedChunks = [{
              title: `${baseTitle} Overview`,
              category: cleanCategory,
              summary: `Extracted overview of ${cleanFileName}`,
              tags: [cleanCategory],
              content: sanitizeCleanText(textToChunk.trim().slice(0, 3e3))
            }];
          }
        }
      }
      extractedChunks = extractedChunks.filter((c) => isReadableCleanText(c.content));
      if (extractedChunks.length === 0) {
        return res.status(400).json({
          error: "No readable text content could be recognized from this file or image. Please ensure the image contains clear, legible text, or supply a Gemini AI Studio API key."
        });
      }
      const savedDocs = [];
      if (autoSave && extractedChunks.length > 0) {
        for (const chunk of extractedChunks) {
          const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
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
        savedDocs
      });
    } catch (err) {
      console.error("File knowledge extraction failed:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/support/knowledge-docs/bulk-create", async (req, res) => {
    try {
      const { chunks } = req.body;
      if (!Array.isArray(chunks) || chunks.length === 0) {
        return res.status(400).json({ error: "Valid chunks array is required." });
      }
      const savedDocs = [];
      for (const item of chunks) {
        if (!item.title || !item.content) continue;
        const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
        const cleanCat = (item.category || "General").trim();
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
    } catch (err) {
      console.error("Bulk knowledge creation failed:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/support/ai-knowledge-status", async (_req, res) => {
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
        platformBrand: platform.forumName || "Trek Consultancy Forum",
        primaryEmail: platform.primarySupportEmail || "support@trekconsultancy.com",
        lastSyncedAt: (/* @__PURE__ */ new Date()).toISOString(),
        liveSyncStatus: "ACTIVE",
        activeModel: aiRuntime.selectedModel,
        isKeyConfigured: aiRuntime.isKeyConfigured,
        hasCustomKey: aiRuntime.hasCustomDbKey,
        models: [...aiRuntime.candidateModels, "Local PostgreSQL RAG Fallback"]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/support/business-memory", async (_req, res) => {
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/support/business-memory/rebuild", async (_req, res) => {
    try {
      invalidateBusinessMemoryCache();
      const memory = await compileBusinessMemory(pool);
      await pool.query(`
        INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
        VALUES ($1, 'Rebuilt Business Memory Graph', 'Admin', $2, 'Just now', 'system')
      `, [`act-${Date.now()}`, `${memory.totalMemoryNodes} nodes synchronized`]).catch(() => {
      });
      res.json({
        success: true,
        message: "Business Memory rebuilt successfully from live database",
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/activity-logs", async (_req, res) => {
    try {
      const result = await pool.query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 30");
      res.json(result.rows.map((r) => ({
        id: r.id,
        action: r.action,
        actor: r.actor,
        target: r.target,
        timeAgo: r.time_ago,
        type: r.type
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/settings/ai", async (_req, res) => {
    try {
      const dbConfig = await getAiConfigFromDb();
      const rawDbKey = (dbConfig.apiKey || "").trim();
      const envKey = (process.env.GEMINI_API_KEY || "").trim();
      const activeKey = rawDbKey || envKey;
      const apiKeyMasked = activeKey ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}` : "";
      res.json({
        selectedModel: dbConfig.selectedModel || "gemini-2.5-flash",
        fallbackModels: Array.isArray(dbConfig.fallbackModels) ? dbConfig.fallbackModels : ["gemini-2.0-flash", "gemini-1.5-flash"],
        temperature: typeof dbConfig.temperature === "number" ? dbConfig.temperature : 0.4,
        maxOutputTokens: typeof dbConfig.maxOutputTokens === "number" ? dbConfig.maxOutputTokens : 2048,
        provider: dbConfig.provider || "Google Gemini",
        customSystemInstruction: dbConfig.customSystemInstruction || "",
        status: dbConfig.status || "active",
        isKeyConfigured: Boolean(activeKey),
        hasCustomKey: Boolean(rawDbKey),
        usingEnvKey: Boolean(!rawDbKey && envKey),
        apiKeyMasked,
        lastTestedAt: dbConfig.lastTestedAt || null,
        lastTestStatus: dbConfig.lastTestStatus || "untested",
        lastTestMessage: dbConfig.lastTestMessage || "",
        lastTestLatencyMs: dbConfig.lastTestLatencyMs || 0,
        updatedAt: dbConfig.updatedAt || null,
        availableModels: TOP_AI_MODELS
      });
    } catch (err) {
      console.error("[AI Settings] Failed to fetch settings:", err?.message || err);
      res.status(500).json({ error: "Failed to load AI settings" });
    }
  });
  const handleSaveAiSettings = async (req, res) => {
    try {
      const currentConfig = await getAiConfigFromDb();
      const {
        apiKey,
        selectedModel,
        fallbackModels,
        temperature,
        maxOutputTokens,
        customSystemInstruction,
        status
      } = req.body;
      let resolvedApiKey = currentConfig.apiKey || "";
      if (typeof apiKey === "string") {
        const trimmed = apiKey.trim();
        if (trimmed === "") {
          resolvedApiKey = "";
        } else if (!trimmed.includes("...")) {
          resolvedApiKey = trimmed;
        }
      }
      const newConfig = {
        ...currentConfig,
        apiKey: resolvedApiKey,
        selectedModel: selectedModel || currentConfig.selectedModel || "gemini-2.5-flash",
        fallbackModels: Array.isArray(fallbackModels) ? fallbackModels : currentConfig.fallbackModels,
        temperature: typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : currentConfig.temperature,
        maxOutputTokens: typeof maxOutputTokens === "number" ? Math.max(256, Math.min(8192, maxOutputTokens)) : currentConfig.maxOutputTokens,
        customSystemInstruction: typeof customSystemInstruction === "string" ? customSystemInstruction.trim() : currentConfig.customSystemInstruction,
        status: status === "disabled" ? "disabled" : "active",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ('ai', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [JSON.stringify(newConfig)]
      );
      invalidateAiConfigCache();
      invalidateRagCache();
      try {
        const logId = `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await pool.query(
          "INSERT INTO activity_logs (id, action, actor, target, time_ago, type, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
          [logId, "UPDATED_AI_CONFIG", "Administrator", `AI Model: ${newConfig.selectedModel}`, "Just now", "system"]
        );
      } catch {
      }
      const activeKey = resolvedApiKey || (process.env.GEMINI_API_KEY || "").trim();
      const apiKeyMasked = activeKey ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}` : "";
      res.json({
        success: true,
        message: "AI Model configuration saved and synchronized with database.",
        ai: {
          ...newConfig,
          apiKey: void 0,
          apiKeyMasked,
          isKeyConfigured: Boolean(activeKey),
          hasCustomKey: Boolean(resolvedApiKey),
          usingEnvKey: Boolean(!resolvedApiKey && process.env.GEMINI_API_KEY)
        }
      });
    } catch (err) {
      console.error("[AI Settings] Failed to save settings:", err?.message || err);
      res.status(500).json({ error: "Failed to save AI configuration" });
    }
  };
  app.post("/api/admin/settings/ai", handleSaveAiSettings);
  app.put("/api/admin/settings/ai", handleSaveAiSettings);
  app.post("/api/admin/settings/ai/test", async (req, res) => {
    try {
      const dbConfig = await getAiConfigFromDb();
      const { apiKey: inputKey, model: inputModel } = req.body;
      let testKey = (inputKey || "").trim();
      if (!testKey || testKey.includes("...")) {
        testKey = (dbConfig.apiKey || process.env.GEMINI_API_KEY || "").trim();
      }
      if (!testKey) {
        return res.status(400).json({
          success: false,
          message: "No Google Gemini API Key configured. Please enter an API key to test."
        });
      }
      const testModel = (inputModel || dbConfig.selectedModel || "gemini-2.5-flash").trim();
      const startTime = Date.now();
      const ai = new import_genai.GoogleGenAI({ apiKey: testKey });
      const testResponse = await withTimeout(
        ai.models.generateContent({
          model: testModel,
          contents: 'Reply with the single word "READY" if you receive this diagnostic verification signal.'
        }),
        9e3
      );
      const latencyMs = Date.now() - startTime;
      const responseText = (testResponse.text || "").trim();
      try {
        const updatedConfig = {
          ...dbConfig,
          lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastTestStatus: "success",
          lastTestMessage: `Model ${testModel} responded in ${latencyMs}ms: "${responseText.slice(0, 50)}"`,
          lastTestLatencyMs: latencyMs
        };
        await pool.query(
          "INSERT INTO settings (key, value) VALUES ('ai', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
          [JSON.stringify(updatedConfig)]
        );
        invalidateAiConfigCache();
      } catch {
      }
      return res.json({
        success: true,
        latencyMs,
        model: testModel,
        response: responseText,
        message: `Successfully connected to ${testModel} in ${latencyMs}ms!`
      });
    } catch (err) {
      const errMsg = err?.message || String(err);
      console.warn("[AI Test] Ping failed:", errMsg);
      try {
        const dbConfig = await getAiConfigFromDb();
        const updatedConfig = {
          ...dbConfig,
          lastTestedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastTestStatus: "failed",
          lastTestMessage: errMsg.slice(0, 200),
          lastTestLatencyMs: 0
        };
        await pool.query(
          "INSERT INTO settings (key, value) VALUES ('ai', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
          [JSON.stringify(updatedConfig)]
        );
        invalidateAiConfigCache();
      } catch {
      }
      return res.status(400).json({
        success: false,
        error: errMsg,
        message: `Connection failed: ${errMsg.slice(0, 150)}`
      });
    }
  });
  app.get("/api/settings", async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'platform'");
      if (result.rows.length > 0) {
        res.json(result.rows[0].value);
      } else {
        res.json({
          forumName: "Trek Consultancy Forum",
          forumTagline: "The official community forum and support portal for Trek Consultancy",
          enableGuestPosting: true,
          enableAutoModeration: true,
          announcementText: "",
          showAnnouncement: false,
          primarySupportEmail: "support@trekconsultancy.com",
          slaHours: 24
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/settings", async (req, res) => {
    try {
      const newSettings = req.body;
      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('platform', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(newSettings)]);
      invalidateRagCache();
      res.json({ success: true, settings: newSettings });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/hero", async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'hero'");
      if (result.rows.length > 0 && result.rows[0].value?.slides?.length > 0) {
        res.json(result.rows[0].value);
      } else {
        res.json(defaultHeroSettings);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/hero", async (req, res) => {
    try {
      const heroSettings = req.body;
      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('hero', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(heroSettings)]);
      res.json({ success: true, hero: heroSettings });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/hero", async (req, res) => {
    try {
      const heroSettings = req.body;
      await pool.query(`
        INSERT INTO settings (key, value) VALUES ('hero', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1
      `, [JSON.stringify(heroSettings)]);
      res.json({ success: true, hero: heroSettings });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const fallbackSeoConfig = {
    metaTitle: "Trek Consultancy Forum - Discussion Community & Support Portal",
    titleSeparator: " - ",
    metaDescription: "The official community discussion forum and enterprise services portal for Trek Consultancy. Expert advisory in Saudi business setup, custom software, visas, and corporate compliance.",
    metaKeywords: "Trek Consultancy, Saudi business setup, MISA investment license, Commercial Registration CR, custom software ERP, corporate compliance, Riyadh advisory",
    canonicalUrl: "https://trekconsultancy.com",
    siteName: "Trek Consultancy Forum",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "Trek Consultancy Forum - Discussion Community & Support Portal",
    ogDescription: "The official community discussion forum and enterprise services portal for Trek Consultancy. Connecting developers, entrepreneurs, and senior advisors.",
    ogImage: "/trek-logo.webp",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterSite: "@trekconsultancy",
    twitterCreator: "@trekconsultancy",
    googleSiteVerification: "",
    bingSiteVerification: "",
    organizationName: "Trek Consultancy",
    organizationLogo: "/trek-logo.webp",
    contactEmail: "support@trekconsultancy.com",
    contactPhone: "+966 50 000 0000",
    customHeadTags: ""
  };
  app.get("/api/seo", async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'seo'");
      if (result.rows.length > 0) {
        res.json(result.rows[0].value);
      } else {
        res.json(fallbackSeoConfig);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const handleSaveSeo = async (req, res) => {
    try {
      const newSeo = req.body;
      const cleanSeo = {
        ...fallbackSeoConfig,
        ...newSeo,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
        console.warn("Failed to log SEO activity:", logErr);
      }
      res.json({ success: true, seo: cleanSeo });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.post("/api/admin/seo", handleSaveSeo);
  app.post("/api/seo", handleSaveSeo);
  app.get("/robots.txt", async (_req, res) => {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'seo'");
      const seo = result.rows.length > 0 ? result.rows[0].value : fallbackSeoConfig;
      const baseUrl = (seo.canonicalUrl || "https://trekconsultancy.com").replace(/\/$/, "");
      let robotsContent = "";
      if (!seo.robotsIndex) {
        robotsContent = `# Trek Consultancy Robots Configuration
User-agent: *
Disallow: /
`;
      } else {
        robotsContent = `# Trek Consultancy Robots Configuration
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
      }
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(robotsContent);
    } catch {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
`);
    }
  });
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [seoRes, topicsRes, blogsRes] = await Promise.all([
        pool.query("SELECT value FROM settings WHERE key = 'seo'"),
        pool.query("SELECT id, created_at FROM topics ORDER BY created_at DESC LIMIT 100"),
        pool.query("SELECT id, created_at FROM blogs ORDER BY created_at DESC LIMIT 50")
      ]);
      const seo = seoRes.rows.length > 0 ? seoRes.rows[0].value : fallbackSeoConfig;
      const baseUrl = (seo.canonicalUrl || "https://trekconsultancy.com").replace(/\/$/, "");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      xml += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
      xml += `  <url>
    <loc>${baseUrl}/#blogs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      topicsRes.rows.forEach((t) => {
        const lastMod = t.created_at ? new Date(t.created_at).toISOString() : now;
        xml += `  <url>
    <loc>${baseUrl}/#topic-${t.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
      blogsRes.rows.forEach((b) => {
        const lastMod = b.created_at ? new Date(b.created_at).toISOString() : now;
        xml += `  <url>
    <loc>${baseUrl}/#blog-${b.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
      xml += `</urlset>`;
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://trekconsultancy.com/</loc></url></urlset>`);
    }
  });
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `API endpoint ${req.method} ${req.originalUrl || req.url} was not found`
    });
  });
  return app;
}

// server.ts
import_dotenv2.default.config();
if (!process.env.DATABASE_URL && import_fs2.default.existsSync("env.txt")) {
  import_dotenv2.default.config({ path: "env.txt" });
}
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = import_net.default.createServer().once("error", () => resolve(false)).once("listening", () => {
      tester.close(() => resolve(true));
    }).listen(port);
  });
}
async function findAvailablePort(defaultPort) {
  if (process.env.PORT) {
    return Number(process.env.PORT);
  }
  for (let port = defaultPort; port < defaultPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return defaultPort;
}
async function startServer() {
  const app = await createApp();
  const defaultPort = 3e3;
  const PORT = await findAvailablePort(defaultPort);
  if (PORT !== defaultPort && !process.env.PORT) {
    console.warn(`[Server] Port ${defaultPort} is currently in use or reserved by another process (e.g. Docker/WSL).`);
    console.warn(`[Server] Automatically switching to port ${PORT} to prevent connection hang.`);
  }
  const httpServer = import_http.default.createServer(app);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : { server: httpServer }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`
  \u{1F680} Trek Consultancy Forum server is running:`);
    console.log(`  \u279C  Local:   http://localhost:${PORT}/`);
    console.log(`  \u279C  Network: http://127.0.0.1:${PORT}/`);
    console.log(`  \u279C  API:     http://localhost:${PORT}/api/health
`);
  });
}
startServer().catch((err) => {
  console.error("[Server] Fatal error during startup:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
