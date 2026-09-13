import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import { seedTrekKnowledgeBase } from './trekSeedData';

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
  forumName: 'Trek Consultancy',
  forumTagline: 'Helping foreign investors and companies set up and grow in Saudi Arabia with confidence',
  enableGuestPosting: true,
  enableAutoModeration: true,
  announcementText: '',
  showAnnouncement: false,
  primarySupportEmail: 'contact@trekconsultancy.com',
  whatsapp: '+966 50 241 1744',
  phone: '+966 55 363 8960',
  slaHours: 48,
  floatingSupportEnabled: true,
  floatingSupportTagTextEn: 'Trek Advisory & Support',
  floatingSupportTagTextBn: 'ট্রেক অ্যাডভাইজরি ও ২৪/৭ সাপোর্ট',
  floatingSupportGreetingEn: 'Assalamu Alaikum! Welcome to Trek Consultancy. How may our advisors assist your business setup, software, or investment plans in Saudi Arabia today?',
  floatingSupportGreetingBn: 'আসসালামু আলাইকুম! ট্রেক কনসালটেন্সিতে স্বাগতম। সৌদি আরবে ব্যবসা গঠন, সফটওয়্যার সলিউশন কিংবা রিয়েল এস্টেট বিনিয়োগে আপনাকে কীভাবে সহায়তা করতে পারি?',
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
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
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
        author_email VARCHAR(255),
        author_id VARCHAR(64),
        author_role VARCHAR(100) DEFAULT 'Member',
        author_avatar TEXT,
        time_ago VARCHAR(100) DEFAULT 'Just now',
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE replies ADD COLUMN IF NOT EXISTS author_email VARCHAR(255);
      ALTER TABLE replies ADD COLUMN IF NOT EXISTS author_id VARCHAR(64);
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

    // 8.5. Conversations table (Tracking chat threads, session metadata, WhatsApp and user binding)
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        session_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_email VARCHAR(255),
        user_whatsapp VARCHAR(255)
      );
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_whatsapp VARCHAR(255);

      CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations (session_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations (session_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations (updated_at);
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_email ON conversations (user_email);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_whatsapp ON conversations (user_whatsapp);
    `);

    // 9. Support & Chat Messages table (Persisted for authenticated users and converted accounts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id VARCHAR(64) PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        conversation_id VARCHAR(255),
        user_id VARCHAR(64),
        user_email VARCHAR(255),
        sender VARCHAR(32) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(50) DEFAULT 'AI',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(255);
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'AI';
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
      CREATE INDEX IF NOT EXISTS idx_support_messages_email ON support_messages(LOWER(user_email));
      CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_messages_session ON support_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_support_messages_conv_id ON support_messages(conversation_id);
    `);

    // Backfill conversations table from existing support messages if any exist
    await client.query(`
      INSERT INTO conversations (id, session_id, user_id, user_email, created_at, updated_at)
      SELECT 
        'conv_' || session_id,
        session_id,
        MAX(user_id),
        MAX(user_email),
        COALESCE(MIN(created_at), NOW()),
        COALESCE(MAX(created_at), NOW())
      FROM support_messages
      WHERE session_id IS NOT NULL 
        AND session_id != ''
        AND session_id NOT IN (SELECT session_id FROM conversations)
      GROUP BY session_id
      ON CONFLICT (id) DO NOTHING;

      UPDATE support_messages
      SET conversation_id = 'conv_' || session_id
      WHERE conversation_id IS NULL AND session_id IS NOT NULL;
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
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS user_whatsapp VARCHAR(255);
    `);

    // Default configuration settings if not present
    const settingsCheck = await client.query("SELECT value FROM settings WHERE key = 'platform'");

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

    // Seed Trek Consultancy knowledge base documents and FAQs
    await seedTrekKnowledgeBase(client);

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
