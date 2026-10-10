-- ============================================================================
-- Trek Consultancy Enterprise Platform: PostgreSQL (Neon) Database Schema
-- Arranged cleanly by functional domain with customer recognition & AI RAG
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ----------------------------------------------------------------------------
-- DOMAIN 1: IDENTITY, CUSTOMERS & AUTHENTICATION
-- ----------------------------------------------------------------------------

-- 1. Users (Customer profiles, Administrators, Contact & Verification state)
CREATE TABLE IF NOT EXISTS users (
  id             VARCHAR(255) PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password       VARCHAR(255),
  password_hash  TEXT,
  whatsapp       VARCHAR(255),
  phone          VARCHAR(255),
  role           VARCHAR(50) DEFAULT 'user',
  status         VARCHAR(32) DEFAULT 'active',
  avatar         TEXT,
  joined_date    VARCHAR(64) DEFAULT 'Recent',
  threads_count  INT DEFAULT 0,
  email_verified BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Email Verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id         VARCHAR(64) PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  code       VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- ----------------------------------------------------------------------------
-- DOMAIN 2: CUSTOMER CONVERSATIONS & MULTI-TURN AI CHAT
-- ----------------------------------------------------------------------------

-- 3. Customer Conversations (Distinct multi-turn sessions recognized by email/session/user)
CREATE TABLE IF NOT EXISTS conversations (
  id            VARCHAR(255) PRIMARY KEY,
  session_id    VARCHAR(255) NOT NULL,
  user_id       VARCHAR(255) DEFAULT NULL,
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

-- 4. Messages (Turn-by-turn chat history with source provenance)
CREATE TABLE IF NOT EXISTS messages (
  id              VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  session_id      VARCHAR(255),
  role            VARCHAR(50) NOT NULL DEFAULT 'user',  -- 'user' | 'assistant' | 'system'
  sender          VARCHAR(50) DEFAULT 'user',          -- 'user' | 'bot' | 'staff'
  content         TEXT NOT NULL,
  message         TEXT,
  source          VARCHAR(50) NOT NULL DEFAULT 'AI',   -- 'USER' | 'AI' | 'FAQ' | 'RAG' | 'STAFF'
  user_id         VARCHAR(255) DEFAULT NULL,
  user_email      VARCHAR(255),
  is_guest        BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Compatibility table: support_conversations
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

-- 6. Compatibility table: support_messages
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

-- ----------------------------------------------------------------------------
-- DOMAIN 3: SUPPORT TICKETS & ESCALATIONS
-- ----------------------------------------------------------------------------

-- 7. Support Tickets (Escalations to human advisory staff)
CREATE TABLE IF NOT EXISTS support_tickets (
  id              VARCHAR(255) PRIMARY KEY,
  ticket_number   VARCHAR(64) NOT NULL,
  user_id         VARCHAR(255) DEFAULT NULL,
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

-- ----------------------------------------------------------------------------
-- DOMAIN 4: KNOWLEDGE BASE, FAQS & RAG EMBEDDINGS
-- ----------------------------------------------------------------------------

-- 8. FAQ Categories
CREATE TABLE IF NOT EXISTS faq_categories (
  id          VARCHAR(255) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAQs (Bilingual English and Bengali)
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

-- 10. Knowledge Documents (Source texts for RAG)
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

-- 11. Knowledge Chunks (Embeddings vector search)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id          VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  embedding   vector(1536),
  chunk_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- DOMAIN 5: COMMUNITY DISCUSSIONS & FORUM
-- ----------------------------------------------------------------------------

-- 12. Discussion Categories
CREATE TABLE IF NOT EXISTS discussion_categories (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  slug        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Staff Roles & Badges
CREATE TABLE IF NOT EXISTS staff_roles (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  badge_label VARCHAR(100),
  color       VARCHAR(50) DEFAULT 'teal',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Topics
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

-- 15. Replies
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

-- ----------------------------------------------------------------------------
-- DOMAIN 6: CONTENT & EDITORIAL
-- ----------------------------------------------------------------------------

-- 16. Blogs
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

-- 17. Blog Comments
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

-- ----------------------------------------------------------------------------
-- DOMAIN 7: COMMERCIAL INQUIRIES & LEADS
-- ----------------------------------------------------------------------------

-- 18. Consultancy Inquiries
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

-- 19. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            VARCHAR(64) PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- DOMAIN 8: SYSTEM CONFIGURATION & AUDIT LOGS
-- ----------------------------------------------------------------------------

-- 20. Settings (Platform, Hero, SEO JSON configurations)
CREATE TABLE IF NOT EXISTS settings (
  key   VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL
);

-- 21. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id         VARCHAR(64) PRIMARY KEY,
  action     VARCHAR(255) NOT NULL,
  actor      VARCHAR(255) NOT NULL,
  target     VARCHAR(255) NOT NULL,
  time_ago   VARCHAR(100) NOT NULL,
  type       VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------

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
