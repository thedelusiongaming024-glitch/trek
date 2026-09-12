import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[Database] Warning: DATABASE_URL is not set. Please ensure it is configured in your .env file.'
  );
}

// The Neon serverless driver talks to Neon PostgreSQL over HTTP/WebSocket.
// Exposes the standard pg Pool API (pool.query, pool.connect) to the rest of the application.
export const pool = new Pool({ connectionString: connectionString || '' });

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

    // 9. Support & Chat Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id VARCHAR(64) PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        sender VARCHAR(32) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(50) DEFAULT 'AI',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'AI';
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
  } finally {
    client?.release?.();
  }
  })();

  return initDbPromise;
}
