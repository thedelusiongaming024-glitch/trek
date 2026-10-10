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

if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

const rawConnectionString = process.env.DATABASE_URL?.trim();
const connectionString = rawConnectionString ? rawConnectionString.replace(/^["']|["']$/g, '') : undefined;

if (!connectionString) {
  console.error('[Rebuild] ERROR: DATABASE_URL is not set in environment or env.txt.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function rebuild() {
  const client = await pool.connect();
  try {
    console.log('========================================================================');
    console.log(' [Rebuild] Connected to Neon PostgreSQL.');
    console.log(' [Rebuild] Starting full schema wipe & arranged architecture rebuild...');
    console.log('========================================================================');

    // ------------------------------------------------------------------------
    // STEP 1: WIPE ALL EXISTING DATA & TABLES
    // ------------------------------------------------------------------------
    console.log('[Step 1/4] Dropping all existing tables in cascade order...');
    await client.query(`
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS conversations CASCADE;
      DROP TABLE IF EXISTS support_messages CASCADE;
      DROP TABLE IF EXISTS support_conversations CASCADE;
      DROP TABLE IF EXISTS support_tickets CASCADE;
      DROP TABLE IF EXISTS knowledge_chunks CASCADE;
      DROP TABLE IF EXISTS knowledge_documents CASCADE;
      DROP TABLE IF EXISTS faqs CASCADE;
      DROP TABLE IF EXISTS faq_categories CASCADE;
      DROP TABLE IF EXISTS replies CASCADE;
      DROP TABLE IF EXISTS topics CASCADE;
      DROP TABLE IF EXISTS staff_roles CASCADE;
      DROP TABLE IF EXISTS discussion_categories CASCADE;
      DROP TABLE IF EXISTS blog_comments CASCADE;
      DROP TABLE IF EXISTS blogs CASCADE;
      DROP TABLE IF EXISTS consultancy_inquiries CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
      DROP TABLE IF EXISTS email_verifications CASCADE;
      DROP TABLE IF EXISTS settings CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✓ All existing tables successfully wiped.');

    // ------------------------------------------------------------------------
    // STEP 2: CREATE PGVECTOR EXTENSION
    // ------------------------------------------------------------------------
    console.log('[Step 2/4] Enabling pgvector extension...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('✓ pgvector extension verified.');

    // ------------------------------------------------------------------------
    // STEP 3: CREATE CLEANLY ARRANGED SCHEMAS IN ARCHITECTURAL ORDER
    // ------------------------------------------------------------------------
    console.log('[Step 3/4] Rebuilding cleanly arranged database schema...');

    // ------------------------------------------------------------------------
    // DOMAIN 1: IDENTITY, CUSTOMERS & AUTHENTICATION
    // ------------------------------------------------------------------------
    await client.query(`
      -- 1. Users table (Customer accounts, Admin staff, Contact info)
      CREATE TABLE users (
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

      -- 2. Email verification codes for self-service authentication
      CREATE TABLE email_verifications (
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
      -- 3. Customer Conversations (Distinct multi-turn session tracking by Email and Session)
      CREATE TABLE conversations (
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

      -- 4. Messages (Granular multi-turn dialogue exchange history)
      CREATE TABLE messages (
        id              VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        session_id      VARCHAR(255),
        role            VARCHAR(50) NOT NULL DEFAULT 'user',
        sender          VARCHAR(50) DEFAULT 'user',
        content         TEXT NOT NULL,
        message         TEXT,
        source          VARCHAR(50) NOT NULL DEFAULT 'AI',
        user_id         VARCHAR(255) DEFAULT NULL,
        user_email      VARCHAR(255),
        is_guest        BOOLEAN DEFAULT TRUE,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );

      -- 5. Backwards-compatibility table: support_conversations
      CREATE TABLE support_conversations (
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

      -- 6. Backwards-compatibility table: support_messages
      CREATE TABLE support_messages (
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
      -- 7. Support tickets (Escalation to human advisory team)
      CREATE TABLE support_tickets (
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
    `);

    // ------------------------------------------------------------------------
    // DOMAIN 4: KNOWLEDGE BASE, FAQS & RAG EMBEDDINGS
    // ------------------------------------------------------------------------
    await client.query(`
      -- 8. FAQ Categories
      CREATE TABLE faq_categories (
        id          VARCHAR(255) PRIMARY KEY,
        name        VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );

      -- 9. FAQs (Bilingual English & Bengali)
      CREATE TABLE faqs (
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

      -- 10. Knowledge Documents (RAG knowledge base)
      CREATE TABLE knowledge_documents (
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
      CREATE TABLE knowledge_chunks (
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
      -- 12. Discussion Categories
      CREATE TABLE discussion_categories (
        id         VARCHAR(64) PRIMARY KEY,
        name       VARCHAR(255) NOT NULL UNIQUE,
        slug       VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 13. Staff Roles & Badges
      CREATE TABLE staff_roles (
        id          VARCHAR(64) PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        badge_label VARCHAR(100),
        color       VARCHAR(50) DEFAULT 'teal',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      -- 14. Topics
      CREATE TABLE topics (
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
      CREATE TABLE replies (
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
      -- 16. Blogs
      CREATE TABLE blogs (
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
      CREATE TABLE blog_comments (
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
      -- 18. Consultancy Inquiries
      CREATE TABLE consultancy_inquiries (
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
      CREATE TABLE newsletter_subscribers (
        id            VARCHAR(64) PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ------------------------------------------------------------------------
    // DOMAIN 8: SYSTEM CONFIGURATION & AUDIT LOGS
    // ------------------------------------------------------------------------
    await client.query(`
      -- 20. Settings (Platform, Hero, SEO JSON configurations)
      CREATE TABLE settings (
        key   VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL
      );

      -- 21. Activity Logs (Admin & user audit trail)
      CREATE TABLE activity_logs (
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
    // INDEXES FOR MAXIMUM QUERY PERFORMANCE & CUSTOMER RECOGNITION
    // ------------------------------------------------------------------------
    await client.query(`
      -- Identity & Customer Lookup
      CREATE INDEX idx_users_email_lower          ON users (LOWER(email));
      CREATE INDEX idx_users_created_at           ON users (created_at DESC);
      CREATE INDEX idx_email_verifications_email  ON email_verifications (LOWER(email));

      -- Customer Conversations & Sessions
      CREATE INDEX idx_conversations_user_email   ON conversations (LOWER(user_email));
      CREATE INDEX idx_conversations_user_id      ON conversations (user_id);
      CREATE INDEX idx_conversations_session_id   ON conversations (session_id);
      CREATE INDEX idx_conversations_updated_at   ON conversations (updated_at DESC);

      -- Messages
      CREATE INDEX idx_messages_conversation_id   ON messages (conversation_id, created_at ASC);
      CREATE INDEX idx_messages_session_id        ON messages (session_id, created_at ASC);
      CREATE INDEX idx_messages_user_email        ON messages (LOWER(user_email));

      -- Support Tickets
      CREATE INDEX idx_support_tickets_status     ON support_tickets (status, created_at DESC);
      CREATE INDEX idx_support_tickets_session_id ON support_tickets (session_id);
      CREATE INDEX idx_support_tickets_user_email ON support_tickets (LOWER(user_email));
      CREATE INDEX idx_support_tickets_conv_id    ON support_tickets (conversation_id);

      -- FAQs & Knowledge Chunks
      CREATE INDEX idx_faqs_status_order          ON faqs (status, display_order ASC, created_at DESC);
      CREATE INDEX idx_faqs_category_id           ON faqs (category_id);
      CREATE INDEX idx_knowledge_docs_status      ON knowledge_documents (status, updated_at DESC);
      CREATE INDEX idx_knowledge_chunks_doc_id    ON knowledge_chunks (document_id);

      -- Forum & Blogs
      CREATE INDEX idx_topics_category_slug       ON topics (category_slug);
      CREATE INDEX idx_topics_created_at          ON topics (created_at DESC);
      CREATE INDEX idx_replies_topic_id           ON replies (topic_id, created_at ASC);
      CREATE INDEX idx_blog_comments_blog_id      ON blog_comments (blog_id, created_at ASC);

      -- HNSW Vector Index for Semantic RAG
      DO $$
      BEGIN
        BEGIN
          CREATE INDEX idx_knowledge_chunks_embedding_hnsw
            ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Skipping HNSW index on vector: %', SQLERRM;
        END;
      END $$;
    `);
    console.log('✓ All 21 tables and optimized indexes successfully built.');

    // ------------------------------------------------------------------------
    // STEP 4: FRESH SEEDING
    // ------------------------------------------------------------------------
    console.log('[Step 4/4] Seeding clean baseline records...');

    // 1. Super Admin User
    await client.query(`
      INSERT INTO users (
        id, name, email, password, password_hash, role, status, avatar, joined_date, threads_count, email_verified
      ) VALUES (
        'usr-admin',
        'Administrator',
        'admin@trekconsultancy.com',
        'admin123',
        'admin123',
        'Super Admin',
        'active',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        'Founder',
        0,
        true
      );
    `);

    // 2. Settings: Platform, Hero, SEO
    const defaultSettings = {
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

    const defaultHeroSettings = {
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

    const defaultSeoSettings = {
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

    await client.query(`
      INSERT INTO settings (key, value) VALUES
        ('platform', $1),
        ('hero', $2),
        ('seo', $3);
    `, [
      JSON.stringify(defaultSettings),
      JSON.stringify(defaultHeroSettings),
      JSON.stringify(defaultSeoSettings)
    ]);

    // 3. Discussion Categories
    const categories = [
      { id: 'cat-business-setup', name: 'Business Setup', slug: 'business-setup', description: 'MISA investment licenses, Saudi CR, and company incorporation strategies' },
      { id: 'cat-corporate-support', name: 'Corporate Support', slug: 'corporate-support', description: 'Legal, tax, compliance, and government relations support' },
      { id: 'cat-visa-pro', name: 'Visa & PRO', slug: 'visa-pro', description: 'Investor visas, executive Iqama, Qiwa and Muqeem platform management' },
      { id: 'cat-real-estate', name: 'Real Estate', slug: 'real-estate', description: 'Commercial leasing, office acquisition, and foreign property ownership' },
      { id: 'cat-software-digital', name: 'Software & Digital', slug: 'software-digital', description: 'Enterprise ERP systems, custom software, and full-stack cloud applications' },
      { id: 'cat-general-discussion', name: 'General Discussion', slug: 'general-discussion', description: 'Open networking and discussions with business founders and consultants' },
      { id: 'cat-cloud-architecture', name: 'Cloud Architecture', slug: 'cloud-architecture', description: 'Scalable AWS/Azure infrastructure, serverless, and system design' },
      { id: 'cat-devops-ci-cd', name: 'DevOps & CI/CD', slug: 'devops-ci-cd', description: 'Containerization, Kubernetes, automated deployments, and pipelines' },
      { id: 'cat-enterprise-security', name: 'Enterprise Security', slug: 'enterprise-security', description: 'Data protection, cybersecurity compliance, and zero-trust systems' },
      { id: 'cat-docly-theme-support', name: 'Docly Theme Support', slug: 'docly-theme-support', description: 'Technical guidance, documentation layout, and styling assistance' },
      { id: 'cat-feedback-suggestions', name: 'Feedback Suggestions', slug: 'feedback-suggestions', description: 'Community suggestions to improve our platform and services' }
    ];

    for (const cat of categories) {
      await client.query(
        'INSERT INTO discussion_categories (id, name, slug, description) VALUES ($1, $2, $3, $4)',
        [cat.id, cat.name, cat.slug, cat.description]
      );
    }

    // 4. Staff Roles
    const staffRoles = [
      { id: 'role-administrator', name: 'Administrator', badge_label: 'Admin', color: 'indigo' },
      { id: 'role-lead-architect', name: 'Lead Architect', badge_label: 'Architect', color: 'teal' },
      { id: 'role-support-team', name: 'Support Team', badge_label: 'Staff', color: 'emerald' },
      { id: 'role-theme-specialist', name: 'Theme Specialist', badge_label: 'Specialist', color: 'blue' },
      { id: 'role-moderator', name: 'Moderator', badge_label: 'Mod', color: 'purple' },
      { id: 'role-community-lead', name: 'Community Lead', badge_label: 'Lead', color: 'amber' },
      { id: 'role-senior-consultant', name: 'Senior Consultant', badge_label: 'Consultant', color: 'rose' }
    ];

    for (const r of staffRoles) {
      await client.query(
        'INSERT INTO staff_roles (id, name, badge_label, color) VALUES ($1, $2, $3, $4)',
        [r.id, r.name, r.badge_label, r.color]
      );
    }

    // 5. FAQ Categories
    const faqCategories = [
      { id: 'cat-faq-business', name: 'Business Setup & Licensing', description: 'MISA licenses, CR formation, and 100% foreign ownership in Saudi Arabia' },
      { id: 'cat-faq-corporate', name: 'Corporate & PRO Services', description: 'Visas, Iqama, Qiwa, Muqeem, and government ministry compliance' },
      { id: 'cat-faq-software', name: 'Software & Technology Solutions', description: 'Enterprise ERP, custom software, AI automations, and cloud architecture' },
      { id: 'cat-faq-realestate', name: 'Real Estate & Properties', description: 'Commercial leases, office space, and property ownership laws' },
      { id: 'cat-faq-international', name: 'International Formation', description: 'Global company incorporation in the USA, UK, and Canada' }
    ];

    for (const fc of faqCategories) {
      await client.query(
        'INSERT INTO faq_categories (id, name, description) VALUES ($1, $2, $3)',
        [fc.id, fc.name, fc.description]
      );
    }

    // 6. FAQs (Bilingual English & Bengali)
    const faqs = [
      {
        id: 'faq-misa-basics',
        categoryId: 'cat-faq-business',
        question: 'What is a MISA License and do I need one?',
        answer: 'A MISA (Ministry of Investment of Saudi Arabia) license is the official foreign investment permit required for non-Saudi individuals or foreign corporations to conduct commercial operations in the Kingdom. It enables 100% foreign ownership in most business sectors without requiring a local Saudi sponsor. Trek Consultancy assists with pre-qualification, business plan drafting, and complete Ministry approval from start to finish.',
        questionBn: 'MISA লাইসেন্স কী এবং এটি কি আমার প্রয়োজন?',
        answerBn: 'MISA (Ministry of Investment of Saudi Arabia) লাইসেন্স হলো সৌদি আরবে বিদেশি নাগরিক বা আন্তর্জাতিক কোম্পানির জন্য প্রদত্ত অফিসিয়াল বিনিয়োগ অনুমতিপত্র। এটি বিদেশি উদ্যোক্তাদের স্থানীয় কোনো সৌদি স্পনসর বা পার্টনার ছাড়াই বেশিরভাগ খাতে ১০০% পর্যন্ত ব্যবসার পূর্ণ মালিকানা প্রদান করে। ট্রেক কনসালটেন্সি প্রি-কোয়ালিফিকেশন, অ্যাপ্লিকেশন ড্রাফটিং, বিজনেস প্ল্যান এবং মন্ত্রণালয় অনুমোদন প্রক্রিয়া শুরু থেকে শেষ পর্যন্ত সম্পূর্ণ পরিচালনা করে।',
        displayOrder: 1
      },
      {
        id: 'faq-open-company-foreigner',
        categoryId: 'cat-faq-business',
        question: 'How can a foreign citizen open a 100% owned company in Saudi Arabia?',
        answer: 'Foreign investors can establish a fully-owned LLC in Saudi Arabia through 5 core steps: 1) Secure a MISA Investment License, 2) Issue Commercial Registration (CR) from the Ministry of Commerce, 3) Legal notarization of Articles of Association (AoA), 4) Establish National Address (SPL) & corporate bank account, 5) Activate ZATCA tax, Qiwa, and Muqeem labor portals. Trek Consultancy provides turnkey, end-to-end handling across every phase.',
        questionBn: 'বিদেশি নাগরিক কীভাবে সৌদি আরবে কোম্পানি খুলতে পারেন?',
        answerBn: 'বিদেশি উদ্যোক্তারা সৌদি আরবে নিম্নলিখিত ধাপগুলো অনুসরণ করে শতভাগ মালিকানাধীন কোম্পানি গঠন করতে পারেন:\n\n১. MISA ইনভেস্টমেন্ট লাইসেন্স অনুমোদন গ্রহণ\n২. বাণিজ্য মন্ত্রণালয় (Ministry of Commerce) থেকে কমার্শিয়াল রেজিস্ট্রেশন (CR) ইস্যু\n৩. আর্টিকেলস অফ অ্যাসোসিয়েশন (AoA) আইনি নোটারাইজেশন ও অনুমোদন\n৪. ন্যাশনাল অ্যাড্রেস (SPL) স্থাপন ও শীর্ষস্থানীয় সৌদি ব্যাংকে কর্পোরেট অ্যাকাউন্ট খোলা\n৫. ZATCA (ভ্যাট ও ট্যাক্স) এবং শ্রম পোর্টাল (Qiwa ও Muqeem) সক্রিয়করণ।\n\nট্রেক কনসালটেন্সি এই সম্পূর্ণ প্রক্রিয়াটি ওয়ান-স্টপ সলিউশন হিসেবে পরিচালনা করে।',
        displayOrder: 2
      },
      {
        id: 'faq-setup-timeline',
        categoryId: 'cat-faq-business',
        question: 'How long does company setup take in Saudi Arabia?',
        answer: 'With attested and verified documents in place, a standard MISA-licensed company setup typically takes between 2 to 4 weeks. The initial MISA license approval is usually processed within 1 to 2 weeks, followed by Commercial Registration and Chamber of Commerce registration in just a few days.',
        questionBn: 'সৌদি আরবে কোম্পানি সেটআপ করতে কত সময় লাগে?',
        answerBn: 'প্রয়োজনীয় কাগজপত্র সত্যায়িত (Attested/Apostilled) থাকলে স্ট্যান্ডার্ড MISA লাইসেন্সপ্রাপ্ত কোম্পানি গঠন প্রক্রিয়া সাধারণত ২ থেকে ৪ সপ্তাহের মধ্যে সম্পন্ন হয়। MISA লাইসেন্স সাধারণত ১-২ সপ্তাহে অনুমোদিত হয় এবং এর পরপরই কমার্শিয়াল রেজিস্ট্রেশন ও চেম্বার অফ কমার্স নিবন্ধন সম্পন্ন করা হয়।',
        displayOrder: 3
      },
      {
        id: 'faq-required-documents',
        categoryId: 'cat-faq-business',
        question: 'What documents are required to start a business in Saudi Arabia?',
        answer: 'For foreign corporate investors: 1) Certificate of Incorporation / Commercial Registration attested by the Saudi Embassy, 2) Audited financial statements for the prior 1-2 years, 3) Board Resolution authorizing company setup in KSA, 4) Power of Attorney (POA) for Trek Consultancy, and 5) Passport copy of the General Manager. For individual investors, educational qualifications and financial proofs apply.',
        questionBn: 'সৌদি আরবে ব্যবসা শুরু করতে কী কী কাগজপত্র লাগে?',
        answerBn: 'বিদেশি বিনিয়োগকারীদের জন্য প্রয়োজনীয় মূল নথিপত্রসমূহ:\n\n১. মূল কোম্পানির কমার্শিয়াল রেজিস্ট্রেশন / ইনকর্পোরেশন সার্টিফিকেট (সৌদি দূতাবাস কর্তৃক সত্যায়িত)\n২. বিগত ১-২ বছরের নিরীক্ষিত আর্থিক বিবরণী (Audited Financial Statements)\n৩. সৌদি আরবে কোম্পানি খোলার বোর্ড রেজোলিউশন\n৪. ট্রেক কনসালটেন্সির জন্য পাওয়ার অফ অ্যাটর্নি (POA)\n৫. জেনারেল ম্যানেজারের পাসপোর্ট কপি।\n\nব্যক্তিগত বিনিয়োগকারীদের ক্ষেত্রে শিক্ষাগত সনদ ও ব্যাংক স্টেটমেন্ট প্রযোজ্য।',
        displayOrder: 4
      },
      {
        id: 'faq-property-rules',
        categoryId: 'cat-faq-realestate',
        question: 'Can foreigners buy or lease commercial and residential property in Saudi Arabia?',
        answer: 'Yes. Under modern Saudi investment regulations and Vision 2030 initiatives, foreign corporations and investors can lease or acquire commercial, residential, and industrial real estate in designated zones. Licensed businesses can own property necessary for offices, employee residences, logistics warehouses, and industrial operations.',
        questionBn: 'বিদেশিরা কি সৌদি আরবে সম্পত্তি কিনতে পারেন?',
        answerBn: 'হ্যাঁ, সৌদি আরবের আধুনিক বিদেশি মালিকানা আইন এবং ভিশন ২০৩০-এর আওতায় বিদেশি কোম্পানি এবং বিনিয়োগকারীরা নির্ধারিত অঞ্চলে বাণিজ্যিক, আবাসিক ও শিল্প সম্পত্তি ক্রয় এবং দীর্ঘমেয়াদি লিজ নিতে পারেন। MISA লাইসেন্সপ্রাপ্ত ব্যবসাগুলো তাদের অফিস, ওয়্যারহাউস ও কারখানা স্থাপনের উদ্দেশ্যে সম্পূর্ণ আইনসম্মতভাবে সম্পত্তির মালিকানা লাভ করতে পারে।',
        displayOrder: 5
      },
      {
        id: 'faq-full-setup-end-to-end',
        categoryId: 'cat-faq-corporate',
        question: 'Does Trek Consultancy provide turnkey, end-to-end services under one roof?',
        answer: 'Yes, Trek Consultancy operates as a true one-stop consultancy. We handle everything from foreign investment licenses and company registration to corporate bank opening, commercial leasing, executive Iqamas, and ongoing ZATCA tax and bookkeeping compliance under one roof.',
        questionBn: 'ট্রেক কনসালটেন্সি কি সব সেবা একক ছাদের নিচে সম্পূর্ণভাবে প্রদান করে?',
        answerBn: 'হ্যাঁ, একদম শুরু থেকে শেষ পর্যন্ত সম্পূর্ণ সেবা "এক ছাদের নিচে" প্রদান করা হয়। আমরা বিদেশি বিনিয়োগ লাইসেন্স, আইনি চুক্তি, কমার্শিয়াল রেজিস্ট্রেশন, ব্যাংক অ্যাকাউন্ট, অফিস স্পেস, রেসিডেন্ট ইকামা/ভিসা এবং কর্পোরেট ট্যাক্স কমপ্লায়েন্স সব একসাথে পরিচালনা করি।',
        displayOrder: 6
      },
      {
        id: 'faq-software-capabilities',
        categoryId: 'cat-faq-software',
        question: 'What software, AI, and digital engineering services does Trek Consultancy deliver?',
        answer: 'Our dedicated in-house technology division delivers enterprise-grade software: custom ERP & CRM solutions, full-stack cloud web and mobile apps, automated AI assistants with document processing, and resilient high-traffic cloud infrastructure designed for modern businesses.',
        questionBn: 'ট্রেক কনসালটেন্সি কী কী সফটওয়্যার ও ডিজিটাল সেবা দেয়?',
        answerBn: 'আমাদের ইন-হাউস টেকনোলজি ডিভিশন এন্টারপ্রাইজ-গ্রেডের প্রযুক্তি সেবা নিশ্চিত করে:\n\n• কাস্টম সফটওয়্যার ও এন্টারপ্রাইজ ইআরপি (ERP) সিস্টেম\n• ফুল-স্ট্যাক ক্লাউড ওয়েব এবং ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপস\n• এআই চ্যাটবট, ডকুমেন্ট এক্সট্রাক্টর ও আধুনিক অটোমেশন সলিউশন\n• হাই-ট্রাফিক ক্লাউড আর্কিটেকচার এবং সিআই/সিডি অটোমেশন।',
        displayOrder: 7
      },
      {
        id: 'faq-pro-services-list',
        categoryId: 'cat-faq-corporate',
        question: 'What are PRO services and why are they necessary in Saudi Arabia?',
        answer: 'PRO (Public Relations Officer / Mandoub) services handle all government liaison tasks: issuing investor visas, renewing executive Iqamas, managing government portals (Qiwa, Muqeem, GOSI, Mudad), and authenticating corporate documentation with ministries and the Chamber of Commerce.',
        questionBn: 'PRO ও ভিসা সেবা কী এবং এগুলো কেন প্রয়োজন?',
        answerBn: 'আমাদের ব্যাপক PRO (Public Relations Officer / মানদুব) সেবাগুলোর মধ্যে রয়েছে:\n\n• সৌদি ইনভেস্টর ভিসা ও ওয়ার্ক পারমিট ইস্যু\n• এক্সিকিউটিভ রেসিডেন্ট ইকামা প্রদান ও বার্ষিক রিনিউয়াল\n• Qiwa এবং Muqeem সরকারি পোর্টাল প্রশাসন\n• চেম্বার অফ কমার্স ও সরকারি মন্ত্রণালয়সমূহে ডকুমেন্টেশন সত্যায়ন।',
        displayOrder: 8
      },
      {
        id: 'faq-international-support',
        categoryId: 'cat-faq-international',
        question: 'Does Trek Consultancy assist with company formation in the US, UK, and other jurisdictions?',
        answer: 'Yes. Through our Montana, USA corporate office, Trek Consultancy assists international clients in establishing US LLCs/C-Corps with EINs and corporate banking, UK Ltd companies, and Canadian business structures with full compliance and nominee support.',
        questionBn: 'সৌদি আরবের বাইরে আন্তর্জাতিক কোম্পানি গঠনে ট্রেক কি সহায়তা দেয়?',
        answerBn: 'হ্যাঁ, মার্কিন যুক্তরাষ্ট্রের মন্টানায় আমাদের নিজস্ব কর্পোরেট অফিসের মাধ্যমে আমরা আমেরিকা (USA LLC/C-Corp ও EIN), যুক্তরাজ্য (UK Ltd) ও কানাডায় দ্রুত কোম্পানি গঠন এবং গ্লোবাল বিজনেস ব্যাংক অ্যাকাউন্ট খুলতে সম্পূর্ণ সহায়তা প্রদান করি।',
        displayOrder: 9
      },
      {
        id: 'faq-why-choose-trek',
        categoryId: 'cat-faq-business',
        question: 'Why choose Trek Consultancy over traditional advisory firms?',
        answer: 'Trek Consultancy combines international corporate presence with deep on-the-ground Riyadh regulatory expertise, delivering true turnkey solutions (both business setup and in-house digital software), transparent pricing with no hidden broker markups, and direct access to senior consultants.',
        questionBn: 'অন্যান্য ফার্মের পরিবর্তে ট্রেক কনসালটেন্সি কেন বেছে নেবেন?',
        answerBn: 'বিদেশি বিনিয়োগকারী ও প্রতিষ্ঠানগুলো ট্রেক কনসালটেন্সিকে বেছে নেয় কারণ:\n\n১. আন্তর্জাতিক অফিস ও বহুদেশীয় আইনি নেটওয়ার্ক\n২. প্রকৃত টার্নকি সেবা—বিজনেস সেটআপ ও ইন-হাউস সফটওয়্যার একই সাথে\n৩. কোনো লুকায়িত ফি বা ব্রোকার চার্জ নেই\n৪. স্থানীয় সৌদি রেগুলেশন ও মন্ত্রণালয়ে বছরের পর বছর কাজের বাস্তব অভিজ্ঞতা।',
        displayOrder: 10
      }
    ];

    for (const f of faqs) {
      await client.query(`
        INSERT INTO faqs (
          id, category_id, question, answer, question_bn, answer_bn, status, show_in_browse, display_order, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, 'published', true, $7, 'System Admin')
      `, [
        f.id,
        f.categoryId,
        f.question,
        f.answer,
        f.questionBn,
        f.answerBn,
        f.displayOrder
      ]);
    }

    // 7. Knowledge Documents & Chunks
    const knowledgeDocs = [
      {
        id: 'doc-saudi-setup-overview',
        title: 'Trek Consultancy: Saudi Arabia Business Setup & Enterprise Advisory Overview',
        category: 'Business Setup',
        content: `Trek Consultancy is a premier enterprise advisory and technology consultancy firm specializing in foreign direct investment, company formation in Saudi Arabia (MISA), corporate PRO services, commercial real estate acquisition, and custom enterprise software development.

Key Core Offerings:
1. Saudi Arabia 100% Foreign-Owned Company Setup:
- MISA (Ministry of Investment) Investment License procurement
- Commercial Registration (CR) with the Ministry of Commerce
- Articles of Association (AoA) drafting and legal notarization
- Corporate bank account opening with top Saudi financial institutions (SNB, Al Rajhi, SAB, Riyad Bank)
- National Address (SPL) registration and municipality licensing (Baladiya)

2. Corporate PRO & Government Affairs:
- Investor and executive visa issuance
- Resident ID (Iqama) issuance and annual renewals
- Ministry of Human Resources (Qiwa & Muqeem) portal management
- General Organization for Social Insurance (GOSI) and Mudad wage protection system
- ZATCA VAT and Corporate Income Tax registration and clearance certificates

3. Enterprise Software & Digital Systems:
- Custom ERP and CRM software architecture
- High-scale cloud web and mobile application engineering
- Intelligent AI chatbots, document extractors, and automated business workflows
- Cloud infrastructure setup, DevOps CI/CD pipelines, and microservices on AWS/Azure.`
      },
      {
        id: 'doc-misa-licensing-guide',
        title: 'MISA Licensing, Commercial Registration & Capital Requirements Guide',
        category: 'Legal & Licensing',
        content: `Ministry of Investment of Saudi Arabia (MISA) Licensing Guide:

A MISA license is the statutory investment permit that enables international companies and foreign citizens to operate legally in the Kingdom of Saudi Arabia with up to 100% foreign ownership.

Eligible Sectors for 100% Foreign Ownership:
- Services & Professional Consultancy
- Information Technology & Software Development
- Trading & Commercial Distribution (subject to specific capital and investment criteria)
- Manufacturing and Industrial Production
- Construction and Real Estate Development

Step-by-Step Procedure:
1. Pre-Qualification & Verification: Trek Consultancy verifies corporate eligibility and attestation status of certificates.
2. Application Submission: Submission of audited financial statements, board resolutions, and business plans to MISA.
3. Commercial Registration (CR): Immediately after MISA approval, the Ministry of Commerce issues the CR.
4. Chamber of Commerce Membership: Enrolling with the Riyadh or local Chamber of Commerce.
5. Tax & ZATCA Setup: Registering for VAT (15%) and corporate income tax (20% on foreign profit share).`
      },
      {
        id: 'doc-technology-capabilities',
        title: 'Trek Consultancy Technology Division: Software Engineering & Cloud Capabilities',
        category: 'Technology',
        content: `Trek Consultancy Technology Division Capabilities:

Unlike traditional consulting firms that outsource technical execution, Trek Consultancy operates a full-time, in-house software engineering practice.

Core Technical Competencies:
1. Enterprise Cloud Architecture: Designing resilient, high-concurrency cloud systems utilizing Docker, Kubernetes, microservices, and serverless architectures.
2. Custom ERP & Workflow Automation: Tailored enterprise resource planning systems replacing disjointed spreadsheets with centralized accounting, inventory, and HR modules.
3. AI-Powered Advisory Systems: Modern Retrieval-Augmented Generation (RAG) agents, natural language chatbots, automated OCR processing for invoices and government forms, and business intelligence dashboards.
4. Modern Web & Mobile Development: High-performance React, Next.js, TypeScript web applications and native/cross-platform mobile apps for iOS and Android.`
      }
    ];

    for (const doc of knowledgeDocs) {
      await client.query(`
        INSERT INTO knowledge_documents (id, title, content, category, status, created_by)
        VALUES ($1, $2, $3, $4, 'published', 'System Admin')
      `, [doc.id, doc.title, doc.content, doc.category]);

      // Seed baseline knowledge chunk
      await client.query(`
        INSERT INTO knowledge_chunks (id, document_id, content, chunk_index)
        VALUES ($1, $2, $3, 0)
      `, [`chk-${doc.id}-0`, doc.id, doc.content]);
    }

    // 8. Baseline Starter Topics
    const starterTopics = [
      {
        id: 'topic-welcome-guide',
        title: 'Welcome to Trek Consultancy Community Forum: Guidelines & Advisory Resources',
        author: 'Administrator',
        author_role: 'Admin',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        author_email: 'admin@trekconsultancy.com',
        author_id: 'usr-admin',
        category: 'General Discussion',
        category_slug: 'general-discussion',
        views: 124,
        likes: 18,
        replies: 1,
        is_featured: true,
        is_popular: true,
        content: 'Welcome to the official community forum and support portal for Trek Consultancy! Here you can engage with fellow founders, engineers, and senior corporate advisors on Saudi business formation, technology architecture, and PRO operations.'
      },
      {
        id: 'topic-misa-setup-2026',
        title: 'Step-by-Step Guide to Opening a 100% Foreign Owned Company in Riyadh (2026)',
        author: 'Lead Architect',
        author_role: 'Architect',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        author_email: 'architect@trekconsultancy.com',
        author_id: 'usr-admin',
        category: 'Business Setup',
        category_slug: 'business-setup',
        views: 89,
        likes: 14,
        replies: 0,
        is_featured: true,
        is_popular: false,
        content: 'Navigating MISA licensing and commercial registration has never been faster. In this guide, our advisory desk outlines the essential documents, timeline expectations, and banking procedures for foreign investors.'
      }
    ];

    for (const t of starterTopics) {
      await client.query(`
        INSERT INTO topics (
          id, title, author, author_role, author_avatar, author_email, author_id, time_ago,
          category, category_slug, views, likes, replies, is_featured, is_popular, content
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 'Just now', $8, $9, $10, $11, $12, $13, $14, $15
        )
      `, [
        t.id, t.title, t.author, t.author_role, t.author_avatar, t.author_email, t.author_id,
        t.category, t.category_slug, t.views, t.likes, t.replies, t.is_featured, t.is_popular, t.content
      ]);
    }

    // Starter reply
    await client.query(`
      INSERT INTO replies (id, topic_id, author, author_role, author_avatar, time_ago, content, likes)
      VALUES (
        'rep-welcome-1',
        'topic-welcome-guide',
        'Senior Consultant',
        'Consultant',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        'Just now',
        'Glad to have everyone here! Our advisory desk is active and ready to support all technical and corporate inquiries.',
        4
      );
    `);

    // 9. Baseline Blogs
    const starterBlogs = [
      {
        id: 'blog-saudi-vision-2030',
        title: 'How Foreign Investors Can Establish a 100% Owned Business in Saudi Arabia',
        category: 'Business Setup',
        date: 'October 2026',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'An authoritative review of MISA licensing, commercial registration, tax structures, and banking in Riyadh under Saudi Vision 2030.',
        content: `Under Saudi Vision 2030, the Kingdom has simplified foreign business ownership through the Ministry of Investment (MISA). Foreign entrepreneurs can now own up to 100% of their enterprise in services, IT, industrial production, and trading.

Key milestones include:
1. MISA License issuance (usually completed within 1 to 2 weeks).
2. Commercial Registration (CR) from the Ministry of Commerce.
3. Corporate bank account establishment at top tier domestic banks.
4. Qiwa and Muqeem portal activation for investor visas and resident Iqamas.

Trek Consultancy provides end-to-end guidance to help foreign founders launch smoothly and compliantly.`,
        author: 'Trek Advisory Team',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        likes: 26
      },
      {
        id: 'blog-enterprise-software-transformation',
        title: 'Digital Transformation & Custom ERP Solutions for Enterprise Modernization',
        category: 'Technology',
        date: 'September 2026',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'Why high-growth enterprises are replacing legacy systems with modern cloud ERP, AI-driven automation, and scalable microservices.',
        content: `Modern enterprises operate in high-tempo markets where disparate spreadsheets and off-the-shelf software create operational bottlenecks. Custom ERP solutions tailored to specific workflows provide real-time reporting, automated invoicing, and seamless multi-channel communications.

Trek Consultancy's in-house engineering team crafts cloud-native applications with zero operational friction, giving corporate leadership immediate visibility across their operations.`,
        author: 'Lead Technology Architect',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        likes: 31
      }
    ];

    for (const b of starterBlogs) {
      await client.query(`
        INSERT INTO blogs (id, title, category, date, image_url, excerpt, content, author, author_avatar, likes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [b.id, b.title, b.category, b.date, b.image_url, b.excerpt, b.content, b.author, b.author_avatar, b.likes]);
    }

    // 10. Initial Activity Log
    await client.query(`
      INSERT INTO activity_logs (id, action, actor, target, time_ago, type)
      VALUES (
        'act-init-1',
        'Rebuilt database schema and initialized baseline institutional data',
        'Administrator',
        'System Database',
        'Just now',
        'system'
      );
    `);

    console.log('✓ Baseline data seeding completed.');

    // ------------------------------------------------------------------------
    // VERIFICATION REPORT
    // ------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log(' [Rebuild] VERIFICATION AUDIT');
    console.log('========================================================================');

    const tables = [
      'users', 'email_verifications', 'conversations', 'messages',
      'support_conversations', 'support_messages', 'support_tickets',
      'faq_categories', 'faqs', 'knowledge_documents', 'knowledge_chunks',
      'discussion_categories', 'staff_roles', 'topics', 'replies',
      'blogs', 'blog_comments', 'consultancy_inquiries', 'newsletter_subscribers',
      'settings', 'activity_logs'
    ];

    for (const tbl of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${tbl}`);
      console.log(` - Table ${tbl.padEnd(25)} : ${res.rows[0].count} records`);
    }

    console.log('========================================================================');
    console.log(' [Rebuild] SUCCESS: Database rebuilt cleanly and arranged perfectly!');
    console.log('========================================================================');
  } catch (err) {
    console.error(' [Rebuild] FATAL ERROR during database rebuild:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

rebuild()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
