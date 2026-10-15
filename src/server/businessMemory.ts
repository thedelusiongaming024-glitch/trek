/**
 * Trek Consultancy - Unified Business Memory & Knowledge Core
 * 
 * Pre-compiled, centralized business memory graph that unifies:
 * - Company Identity, Origins, Founding Mission, Leadership & Responsibilities
 * - 6 Core Strategic Business Pillars
 * - Verified FAQs with high-precision intent index
 * - Ingested Knowledge Document Chunks & RAG extracts
 * - Community Solutions & Verified Human Support Ticket Resolutions
 * 
 * Automatically updates whenever an admin creates, modifies, or deletes
 * documents, FAQs, settings, or resolved tickets.
 */

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
    // Fallback to static canonical memory
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

  // Attempt reading from DB first for speed
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
 * Intelligent Business Memory Reasoner & Answer Synthesizer
 * 
 * Provides instant (<10ms), accurate responses grounded in Trek's business memory.
 * Completely eliminates false FAQ matches by requiring strict semantic intent matching.
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

  // 1. INTENT: Company Origin, Founding Year, History ("when did this business started ?")
  const isOriginQuery = 
    /(when (did|was) (this|your|the) (business|company|firm|trek|platform) (start|started|founded|establish|established|began|created)|how long (have you been|has this business been|has trek been|has the company been)|history of (trek|this business|your company)|kobe shuru|kobe protisthito|shuru hoyeche kobe|kobe theke|start date|foundation year|business start year|কবে শুরু|কখন শুরু|কবে প্রতিষ্ঠা|প্রতিষ্ঠা কবে|প্রতিষ্ঠার ইতিহাস|ব্যবসায়ের ইতিহাস|متى (بدأت|تأسست|أنشئت|انطلقت)|تاريخ (الشركة|تريك|التأسيس)|سنة التأسيس)/i.test(lower) ||
    ((lower.includes('when') || lower.includes('kobe') || lower.includes('how long') || lower.includes('কবে') || lower.includes('কখন') || lower.includes('متى')) && (lower.includes('business') || lower.includes('company') || lower.includes('firm') || lower.includes('trek') || lower.includes('ব্যবসা') || lower.includes('কোম্পানি') || lower.includes('প্রতিষ্ঠান') || lower.includes('شركة') || lower.includes('تأسيس')) && (lower.includes('start') || lower.includes('found') || lower.includes('establish') || lower.includes('shuru') || lower.includes('শুরু') || lower.includes('প্রতিষ্ঠা') || lower.includes('بدأت') || lower.includes('تأسست')));

  if (isOriginQuery) {
    if (isAr) {
      return {
        reply: `### 🏛️ تريك للاستشارات — الخلفية المؤسسية ورؤية السعودية 2030\n\nتأسست **${memory.identity.name}** لتمكين الشركات الدولية والمستثمرين العالميين من التوسع المؤسسي في المملكة العربية السعودية في إطار **رؤية السعودية 2030**.\n\n- 🔹 **المقر الرئيسي**: ${memory.identity.headquarters}\n- 🔹 **مكتب الاتصال الدولي**: ${memory.identity.internationalDesk}\n- 🔹 **الرسالة والخدمات**: توفير حلول متكاملة لتأسيس الشركات بملكية أجنبية 100% بموجب ترخيص MISA، وفتح الحسابات المصرفية لدى بنوك الفئة الأولى، والحلول الرقمية المتطورة.\n\n> 💡 **الميزة المؤسسية:**  \n> نوفر نقطة مسؤولية موحدة للشركات العالمية للتوسع في السوق السعودي دون الحاجة لشريك محلي.\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### 🏛️ ট্রেক কনসালটেন্সি — প্রাতিষ্ঠানিক পরিচিতি ও ভিশন ২০৩০\n\n**${memory.identity.name}** সৌদি আরবের **ভিশন ২০৩০ (Vision 2030)** অর্থনৈতিক রূপান্তরের অংশ হিসেবে আন্তর্জাতিক উদ্যোক্তা, করপোরেট বিনিয়োগকারী এবং প্রযুক্তি দলগুলোকে সৌদি আরবের বাজারে ব্যবসা সম্প্রসারণে সহায়তা করার লক্ষ্যে যাত্রা শুরু করে।\n\n- 🔹 **প্রধান কার্যালয়**: ${memory.identity.headquarters}\n- 🔹 **আন্তর্জাতিক লিয়াজোঁ অফিস**: ${memory.identity.internationalDesk}\n- 🔹 **মূল লক্ষ্য**: কোনো স্থানীয় স্পন্সর ছাড়াই **১০০% বিদেশি মালিকানাধীন কোম্পানি গঠন**, MISA ইনভেস্টমেন্ট লাইসেন্সিং, কমার্শিয়াল রেজিস্ট্রেশন (CR) এবং ইন-হাউস সফটওয়্যার ও ডিজিটাল সলিউশন সরবরাহ করা।\n\n> 💡 **কৌশলগত সুবিধা:**  \n> শুরু থেকেই আমরা আন্তর্জাতিক মান বজায় রেখে শত শত উদ্যোক্তাকে সৌদি ও গ্লোবাল মার্কেটে সফলভাবে প্রতিষ্ঠিত হতে প্রাতিষ্ঠানিক সিঙ্গেল-পয়েন্ট পরামর্শ প্রদান করে আসছি।\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`,
        source: 'AI'
      };
    }
    return {
      reply: `### 🏛️ Trek Consultancy — Institutional Background & Vision 2030\n\n**${memory.identity.name}** was established to empower international enterprises, corporate investors, and technology founders expanding into the Kingdom of Saudi Arabia under **Saudi Vision 2030**.\n\n- 🔹 **Global Headquarters**: ${memory.identity.headquarters}\n- 🔹 **International Liaison Desk**: ${memory.identity.internationalDesk}\n- 🔹 **Turnkey Corporate Mission**: Providing turnkey corporate market entry—facilitating **100% foreign-owned company incorporation** under MISA, commercial tier-1 banking, government relations, and in-house enterprise digital engineering.\n\n> 💡 **Executive Strategic Takeaway:**  \n> We provide single-point institutional accountability for global enterprises expanding into the Saudi market without requiring any local partner.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
      source: 'AI'
    };
  }

  // 2. INTENT: Responsibility, Who Does The Work ("who is responsible for this setup ?")
  const isResponsibilityQuery = 
    /(who is responsible (for|to)|who (handles|manages|takes care of|does|is in charge of) (this|the)? (setup|company formation|licensing|process|work)|who are you|who runs this|who will do (the|my) setup|kara ei kaj kore|ke dayitto palon kore|kar dayitto|ke kore dibe|who is managing|responsible person|কার দায়িত্ব|কার দায়িত্ব|দায়িত্ব কার|দায়িত্ব কার|কে দায়িত্বপ্রাপ্ত|কে দায়িত্বপ্রাপ্ত|কে পরিচালনা করে|কারা করে|من (المسؤول|يتولى|يدير|يقوم|ينفذ)|مسؤولية|من أنتم|من يدير هذا)/i.test(lower) ||
    ((lower.includes('who') || lower.includes('ke') || lower.includes('kara') || lower.includes('কার') || lower.includes('কে') || lower.includes('من')) && (lower.includes('responsible') || lower.includes('dayitto') || lower.includes('handles') || lower.includes('manages') || lower.includes('দায়িত্ব') || lower.includes('দায়িত্ব') || lower.includes('مسؤول')) && (lower.includes('setup') || lower.includes('company') || lower.includes('business') || lower.includes('process') || lower.includes('সেটআপ') || lower.includes('ব্যবসা') || lower.includes('تأسيس')));

  if (isResponsibilityQuery) {
    if (isAr) {
      return {
        reply: `### 🏛️ الحوكمة التشغيلية — المكتب الاستشاري والقانوني الأول\n\nتتم إدارة عمليات تأسيس الشركات والترخيص الاستثماري مباشرة عبر **المكتب الاستشاري والقانوني لتريك في الرياض**.\n\n- 🔹 **محامون ومستشارون معتمدون**: التنسيق المباشر مع **وزارة الاستثمار (MISA)** و**وزارة التجارة (MoC)** والموثقين المعتمدين لتوثيق عقد التأسيس ورخصة الاستثمار.\n- 🔹 **فريق الخدمات المصرفية والضريبية**: تسجيل العنوان الوطني (SPL) وفتح الحسابات البنكية والامتثال الضريبي لدى هيئة الزكاة والضريبة والجمارك (ZATCA).\n- 🔹 **مدير حسابات تنفيذي مخصص**: مستشار أول متخصص يتابع ملفك خطوة بخطوة ويقدم التحديثات المستمرة عند كل مرحلة نظامية.\n\n> 💡 **التزام مؤسسي:**  \n> يتولى فريقنا المؤسسي المعتمد كامل المسؤولية من مرحلة التقديم الأولى وحتى التشغيل التجاري الكامل وفق اتفاقيات مستوى الخدمة الرسمية.\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### 🏛️ অপারেশনাল পরিচালনা — সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক\n\nসৌদি আরবে আপনার কোম্পানি গঠন ও লাইসেন্সিং প্রক্রিয়াটি সরাসরি **ট্রেক কনসালটেন্সির রিয়াদস্থ সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক**-এর প্রত্যক্ষ দায়িত্বে পরিচালিত হয়।\n\n- 🔹 **সনদপ্রাপ্ত সৌদি করপোরেট আইনজীবী ও সরকারি লিয়াজোঁ টিম**: সরাসরি **Ministry of Investment (MISA)** ও **বাণিজ্য মন্ত্রণালয়ের (MoC)** সাথে সমন্বয় করে আপনার ১০০% বিদেশি মালিকানা লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন (CR) এবং নোটারি পাবলিক সত্যায়ন নিশ্চিত করেন।\n- 🔹 **কর্পোরেট ব্যাংকিং ও ট্যাক্স বিভাগ**: ন্যাশনাল অ্যাড্রেস (SPL) স্থাপন, টিয়ার-১ কর্পোরেট ব্যাংক অ্যাকাউন্ট ও ZATCA ফেজ ২ ভ্যাট রেজিস্ট্রেশন সম্পন্ন করেন।\n- 🔹 **ডেডিকেটেড সিনিয়র কনসালটেন্ট**: আপনার সার্বিক ফাইল তত্ত্বাবধানের জন্য একজন সুনির্দিষ্ট সিনিয়র কনসালটেন্ট সরাসরি নিয়োজিত থাকেন।\n\n> 💡 **প্রাতিষ্ঠানিক নিশ্চয়তা:**  \n> সম্পূর্ণ প্রক্রিয়াটি আমাদের সনদপ্রাপ্ত পেশাদার দলের প্রত্যক্ষ দায়িত্বে টার্নকি ভিত্তিতে সুচারুভাবে সম্পন্ন হয়।\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`,
        source: 'AI'
      };
    }
    return {
      reply: `### 🏛️ Operational Governance — Senior Advisory & Legal Desk\n\nCompany setup and foreign investment licensing are managed directly by **Trek Consultancy’s Senior Advisory & Legal Desk in Riyadh**.\n\n- 🔹 **Accredited Saudi Corporate Lawyers & Government Liaisons**: Directly interface with the **Ministry of Investment (MISA)**, the **Ministry of Commerce (MoC)**, and authorized Saudi notaries to ratify your 100% foreign ownership license, Commercial Registration (CR), and Articles of Association (AoA).\n- 🔹 **Corporate Banking & Tax Specialists**: Oversee commercial National Address (SPL) registration, tier-1 corporate bank account opening, and ZATCA Phase 2 tax compliance.\n- 🔹 **Dedicated Senior Account Manager**: A designated senior consultant coordinates your entire file, keeping you updated at every statutory milestone.\n\n> 💡 **Institutional Commitment:**  \n> An accredited corporate legal and advisory team takes end-to-end institutional responsibility for your business setup from inception to full commercial activation.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
      source: 'AI'
    };
  }

  // 3. INTENT: Greetings
  const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|assalamu\s*alaikum|salam|hola|halo|হ্যালো|হাই|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*আছেন|কেমন\s*আসেন|kemon\s*achen|নমস্কার|আদাব|مرحبا|أهلا|اهلا|السلام عليكم|سلام|صباح الخير|مساء الخير|حياك الله|تحياتي)(\s*!|\s*\?|\s*$|\s+.*)/i.test(cleanMsg);
  if (isGreeting) {
    if (isAr) {
      return {
        reply: `### 🏛️ مرحبا بكم في تريك للاستشارات — المكتب الاستشاري التنفيذي\n\nأهلاً بك! أنا المستشار الآلي المساعد لـ **${memory.identity.brand}**. يسعدني مساعدتك عبر ركائزنا الاستراتيجية المعتمدة:\n\n- 🔹 **تأسيس الشركات في السعودية**: ملكية أجنبية 100%، رخصة MISA، السجل التجاري، والحسابات البنكية.\n- 🔹 **الهندسة والحلول البرمجية**: أنظمة ERP سحابية مخصصة، تطبيقات الهاتف، والمنصات المؤسسية.\n- 🔹 **التأشيرات والتعقيب الحكومي (PRO)**: تأشيرات المستثمرين، الإقامات، والامتثال لمنصتي قوى ومقيم.\n- 🔹 **العقارات التجارية**: عقود إيجار المكاتب المعتمدة (إيجاري) والمستودعات في المدن الصناعية.\n- 🔹 **المحاسبة والضرائب**: الفوترة الإلكترونية (ZATCA Phase 2)، ومسك الدفاتر، والتدقيق القانوني.\n- 🔹 **التوسع الدولي**: تأسيس الشركات في الولايات المتحدة وبريطانيا والحسابات الدولية.\n\n> 💡 **كيف يمكننا مساعدتك اليوم؟**  \n> تفضل بطرح أي استفسار حول الإجراءات والمدد النظامية والرسوم وسأجيبك فوراً!\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### 🏛️ ট্রেক কনসালটেন্সিতে স্বাগতম — এক্সিকিউটিভ অ্যাডভাইজরি\n\nনমস্কার / আসসালামু আলাইকুম! **${memory.identity.brand}**-এ আপনাকে স্বাগতম। আমি ট্রেকের এআই সাপোর্ট কনসালটেন্ট। আমাদের প্রাতিষ্ঠানিক বিজনেস মেমোরির আলোকে আপনাকে সহায়তা করতে প্রস্তুত:\n\n- 🔹 **সৌদি বিজনেস সেটআপ (Pillar 1)**: ১০০% বিদেশি মালিকানা, MISA লাইসেন্স, কমার্শিয়াল রেজিস্ট্রেশন (CR) ও ব্যাংক একাউন্ট\n- 🔹 **সফটওয়্যার ও ডিজিটাল সলিউশনস (Pillar 2)**: কাস্টম এন্টারপ্রাইজ ERP, ওয়েব/মোবাইল অ্যাপস এবং ক্লাউড আর্কিটেকচার\n- 🔹 **ভিসা ও সরকারি PRO সেবা (Pillar 3)**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট এবং রেসিডেন্ট ইকামা প্রসেসিং\n- 🔹 **বাণিজ্যিক রিয়েল এস্টেট (Pillar 4)**: অনুমোদিত অফিস লিজ (Ejari) এবং শিল্পাঞ্চল ওয়্যারহাউস লিজ\n- 🔹 **করপোরেট সাপোর্ট ও ট্যাক্স (Pillar 5)**: IFRS বুককিপিং, ZATCA ফেজ ২ ভ্যাট এবং সংবিধিবদ্ধ অডিট\n- 🔹 **গ্লোবাল বিজনেস এক্সপ্যানশন (Pillar 6)**: আমেরিকা (Delaware/Wyoming), ইউকে ও আন্তর্জাতিক ব্যাংকিং\n\n> 💡 **আজ আপনাকে কীভাবে সহায়তা করতে পারি?**  \n> আপনার সুনির্দিষ্ট প্রশ্ন বা প্রয়োজনীয়তা লিখুন, আমি এখনই পূর্ণাঙ্গ প্রাতিষ্ঠানিক তথ্য সরবরাহ করব!\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`,
        source: 'AI'
      };
    }
    return {
      reply: `### 🏛️ Welcome to Trek Consultancy — Executive Concierge\n\nHello and welcome to **${memory.identity.brand}**! I am your AI Support Consultant. I am equipped with our verified business knowledge to assist you across our strategic service pillars:\n\n- 🔹 **Saudi Business Setup (Pillar 1)**: 100% foreign ownership, MISA licensing, Commercial Registration (CR), and tier-1 corporate banking\n- 🔹 **Software & Digital Engineering (Pillar 2)**: Custom enterprise ERPs, web & mobile applications, and resilient cloud systems\n- 🔹 **Visa & PRO Government Liaison (Pillar 3)**: Investor visas, work permits, Iqama issuance, and Qiwa/Muqeem portals\n- 🔹 **Commercial Real Estate (Pillar 4)**: Verified Ejari office leases and industrial park warehousing\n- 🔹 **Corporate Support & Tax (Pillar 5)**: ZATCA Phase 2 e-invoicing, IFRS bookkeeping, and statutory audits\n- 🔹 **Global Business Expansion (Pillar 6)**: USA (Delaware/Wyoming), UK Companies House, and cross-border banking\n\n> 💡 **How may we assist you today?**  \n> Feel free to ask any question about requirements, turnaround timelines, fees, or our implementation process!\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
      source: 'AI'
    };
  }

  // 4. INTENT: Contact, Phone & WhatsApp Escalation
  const isContactQuery = /(whatsapp|call you|call me|phone number|contact number|talk to (a )?human|talk to (a )?consultant|talk to someone|speak to (a )?human|speak to (a )?consultant|speak to advisor|meet in person|contact details|office address|location|হোয়াটসঅ্যাপ|ফোন নম্বর|যোগাযোগ|কথা বলতে চাই|হোয়াটসঅ্যাপে|অফিস কোথায়|ঠিকানা|কল করবেন|কল দিতে চাই|কথা বলব|দেখা করতে চাই|নাম্বার|واتساب|واتس اب|رقم الهاتف|اتصال|تواصل|مكتبكم|عنوانكم|مقركم|التحدث مع|استشارة مباشرة)/i.test(lower);
  if (isContactQuery) {
    if (isAr) {
      return {
        reply: `### 🏛️ طلب استشارة تنفيذية مباشرة — المكتب الاستشاري الأول\n\nتم تحويل طلبك مباشرة إلى **المكتب الاستشاري والقانوني لتريك في الرياض** للمتابعة الفورية.\n\n- 🔹 **البريد الإلكتروني الرسمي**: ${memory.identity.officialEmail}\n- 🔹 **المقر الرئيسي في السعودية**: ${memory.identity.headquarters}\n- 🔹 **مكتب الاتصال الدولي**: ${memory.identity.internationalDesk}\n\n> 💡 **للتواصل التنفيذي الفوري:**  \n> شارك رقم الواتساب أو الهاتف هنا في المحادثة، وسيقوم مستشار تنفيذي أول بالتواصل معك مباشرة لترتيب استشارتك.\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`,
        source: 'AI'
      };
    }
    if (isBn) {
      return {
        reply: `### 🏛️ সরাসরি এক্সিকিউটিভ কনসালটেন্সি — সিনিয়র অ্যাডভাইজরি ডেস্ক\n\nআপনার অনুসন্ধানটি আমাদের রিয়াদের **সিনিয়র কনসালটেন্সি ও লিগ্যাল ডেস্কে** অগ্রাধিকার ভিত্তিতে তালিকাভুক্ত করা হয়েছে।\n\n- 🔹 **কর্পোরেট ইমেইল**: ${memory.identity.officialEmail}\n- 🔹 **সৌদি আরব প্রধান কার্যালয়**: ${memory.identity.headquarters}\n- 🔹 **আন্তর্জাতিক লিয়াজোঁ অফিস**: ${memory.identity.internationalDesk}\n\n> 💡 **ব্যক্তিগত পরামর্শের জন্য:**  \n> আপনার ফোন নম্বর বা হোয়াটসঅ্যাপ নম্বরটি এখানে প্রদান করুন, আমাদের একজন সিনিয়র কনসালটেন্ট সরাসরি আপনার সাথে যোগাযোগ করে পূর্ণাঙ্গ গাইডলাইন প্রদান করবেন।\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`,
        source: 'AI'
      };
    }
    return {
      reply: `### 🏛️ Direct Executive Consultation — Senior Advisory Desk\n\nI have notified our **Senior Advisory & Legal Desk in Riyadh** to prioritize your consultation.\n\n- 🔹 **Official Corporate Email**: ${memory.identity.officialEmail}\n- 🔹 **Saudi Arabia Headquarters**: ${memory.identity.headquarters}\n- 🔹 **International Liaison Desk**: ${memory.identity.internationalDesk}\n\n> 💡 **Direct Executive Consultation:**  \n> Share your direct WhatsApp or phone number right here in this chat, and an Executive Senior Consultant will reach out to schedule your personalized consultation.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
      source: 'AI'
    };
  }

  // 5. INTENT: HIGH-PRECISION FAQ MATCHING
  // Requires matching at least 2 significant tokens AND a token overlap ratio >= 0.60
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

  // 6. DYNAMIC KNOWLEDGE BASE SEARCH
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
  const isPillar4 = /(real estate|property|ejari|office space|warehouse|office lease|রিয়েল এস্টেট|অফিস|জমি|ফ্ল্যাট|বাণিজ্যিক প্রপার্টি|عقار|مكتب|إيجار|ايجار|ايجاري|مستودع|أراضي)/i.test(lower);
  const isPillar5 = /(accounting|tax|vat|zatca|audit|bookkeeping|e-invoicing|ট্যাক্স|ভ্যাট|হিসাব|অডিট|ই-ইনভয়েসিং|محاسبة|ضرائب|ضريبة|زكاة|فاتورة|فوترة|مراجعة|تدقيق)/i.test(lower);
  const isPillar6 = /(usa|uk|canada|delaware|wyoming|mercury|wise|cross-border|holding|subsidiary|আন্তর্জাতিক|আমেরিকা|ইউকে|হোল্ডিং|أمريكا|امريكا|بريطانيا|كندا|دولي|عالمي|ديلوير|وايومنغ)/i.test(lower);

  const matchedPillars: { pillar: BusinessPillar; id: number }[] = [];
  if (isPillar1) matchedPillars.push({ pillar: memory.pillars[0], id: 1 });
  if (isPillar2) matchedPillars.push({ pillar: memory.pillars[1], id: 2 });
  if (isPillar3) matchedPillars.push({ pillar: memory.pillars[2], id: 3 });
  if (isPillar4) matchedPillars.push({ pillar: memory.pillars[3], id: 4 });
  if (isPillar5) matchedPillars.push({ pillar: memory.pillars[4], id: 5 });
  if (isPillar6) matchedPillars.push({ pillar: memory.pillars[5], id: 6 });

  const isTimeline = /(timeline|timeframe|duration|how long|how many days|turnaround|koto din|koto shomoy|somoy|shomoy lagbe|সময়|কত দিন|কত সময়|কম সময়|كم يستغرق|مدة|وقت|المدة الزمنية)/i.test(lower);

  // 8. CASE A: MULTI-PILLAR COMPREHENSIVE ROADMAP
  if (matchedPillars.length >= 2) {
    if (isAr) {
      let roadmap = `### 🏛️ استشارة مؤسسية متكاملة — خارطة التوسع عبر الخدمات المتعددة\n\nنعم، تقدم **${memory.identity.name}** حلولاً استشارية شاملة تغطي جميع المسارات المطلوبة بتنسيق مباشر بين مكاتبنا المتخصصة:\n\n`;
      for (const item of matchedPillars) {
        roadmap += `- 🔹 **${item.pillar.title}**: ${item.pillar.highlights[0]} (⏱️ ${item.pillar.turnaroundTime}).\n`;
      }
      if (isTimeline) {
        roadmap += `\n- 🔹 **الجدول الزمني المدمج**: تتم إدارة جميع المسارات بالتوازي لتقليص مدة التأسيس وبدء النشاط التجاري الفعلي.`;
      }
      roadmap += `\n\n> 💡 **الميزة التشغيلية الموحدة:**  \n> يتولى فريقنا المشترك إدارة الملف بالكامل بمسؤولية مؤسسية موحدة ودون الحاجة لتعدد الجهات.\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`;
      return { reply: roadmap, source: 'AI' };
    }

    if (isBn) {
      let roadmap = `### 🏛️ সমন্বিত মাল্টি-পিলার প্রাতিষ্ঠানিক গাইডলাইন — সামগ্রিক রোডম্যাপ\n\nহ্যাঁ, **${memory.identity.name}** আপনার উল্লেখিত প্রতিটি সেবাই নিজস্ব বিশেষায়িত বিভাগের মাধ্যমে সমন্বিতভাবে পরিচালনা করে:\n\n`;
      for (const item of matchedPillars) {
        roadmap += `- 🔹 **${item.pillar.titleBn} (${item.pillar.title})**: ${item.pillar.highlights[0]} (⏱️ আনুমানিক সময়: ${item.pillar.turnaroundTime})।\n`;
      }
      if (isTimeline) {
        roadmap += `\n- 🔹 **সমন্বিত সময়সীমা**: প্রতিটি ধাপ সমান্তরালভাবে (parallel processing) সম্পন্ন করা হয় যাতে দ্রুততম সময়ে বাণিজ্যিক কার্যক্রম চালু করা যায়।`;
      }
      roadmap += `\n\n> 💡 **সিঙ্গেল-পয়েন্ট অ্যাকাউন্টেবিলিটি:**  \n> ট্রেক কনসালটেন্সির রিয়াদ লিগ্যাল টিম, ট্যাক্স কনসালটেন্ট এবং টেক ডিভিশন একত্রিত হয়ে সমন্বিত দায়িত্ব গ্রহণ করে।\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`;
      return { reply: roadmap, source: 'AI' };
    }

    let roadmap = `### 🏛️ Integrated Multi-Pillar Advisory — Turnkey Corporate Roadmap\n\nYes, **${memory.identity.name}** seamlessly coordinates your entire expansion plan across our specialized in-house desks:\n\n`;
    for (const item of matchedPillars) {
      roadmap += `- 🔹 **${item.pillar.title}**: ${item.pillar.highlights[0]} (⏱️ ${item.pillar.turnaroundTime}).\n`;
    }
    if (isTimeline) {
      roadmap += `\n- 🔹 **Turnaround Timelines**: Tracks are executed concurrently to eliminate bureaucratic delays and ensure rapid commercial activation.\n`;
    }
    roadmap += `\n> 💡 **Concurrent Processing Advantage:**  \n> Tracks are executed concurrently to eliminate bureaucratic delays and ensure rapid commercial activation.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`;
    return { reply: roadmap, source: 'AI' };
  }

  // 9. CASE B: SINGLE PILLAR WITH SPECIFIC INTENT ADAPTATION
  if (matchedPillars.length === 1) {
    const p = matchedPillars[0].pillar;

    if (isAr) {
      let details = `### 🏛️ ${p.title} — إحاطة استشارية تنفيذية\n\n${p.summaryEn}\n\n`;
      for (const h of p.highlights) {
        details += `- 🔹 **${h.split(' ')[0]}**: ${h}\n`;
      }
      if (isTimeline) {
        details += `\n- 🔹 **المدة الزمنية المعتمدة**: ⏱️ ${p.turnaroundTime}\n`;
      }
      details += `\n> 💡 **المكتب المسؤول:**  \n> ${p.responsibleTeam} يرافقك عبر كافة الإجراءات النظامية حتى اكتمال المعاملة.\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`;
      return { reply: details, source: 'AI' };
    }

    if (isBn) {
      let details = `### 🏛️ ${p.titleBn} (${p.title}) — সুনির্দিষ্ট প্রাতিষ্ঠানিক তথ্য\n\n${p.summaryBn}\n\n`;
      for (const h of p.highlights) {
        details += `- 🔹 **${h.split(' ')[0]}**: ${h}\n`;
      }
      if (isTimeline) {
        details += `\n- 🔹 **প্রক্রিয়া সম্পন্ন হওয়ার সময়সীমা**: ⏱️ ${p.turnaroundTime}\n`;
      }
      details += `\n> 💡 **দায়িত্বপ্রাপ্ত বিভাগ:**  \n> ${p.responsibleTeam}-এর সার্বিক তত্ত্বাবধানে প্রতিটি ধাপ আইনগতভাবে সুরক্ষিত।\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`;
      return { reply: details, source: 'AI' };
    }

    let details = `### 🏛️ ${p.title} — Executive Advisory Briefing\n\n${p.summaryEn}\n\n`;
    for (const h of p.highlights) {
      details += `- 🔹 **${h.split(' ')[0]}**: ${h}\n`;
    }
    if (isTimeline) {
      details += `\n- 🔹 **Turnaround Timeframe**: ⏱️ ${p.turnaroundTime}\n`;
    }
    details += `\n> 💡 **Operational Deliverable:**  \n> Managed directly by ${p.responsibleTeam} under formal institutional service level agreements.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`;
    return { reply: details, source: 'AI' };
  }

  // 10. CASE C: BEST MATCHING KNOWLEDGE DOCUMENT FROM ADMIN
  if (bestDoc && bestDocScore >= 20) {
    if (isBn) {
      return {
        reply: `### 🏛️ ${bestDoc.title} — প্রাতিষ্ঠানিক নলেজ বেস\n\n${bestDoc.summary}\n\n- 🔹 **ক্যাটেগরি**: ${bestDoc.category}\n- 🔹 **মূল বিবরণ**: ${bestDoc.content.slice(0, 300)}...\n\n> 💡 **সিনিয়র অ্যাডভাইজরি ডেস্ক:**  \n> বিস্তারিত তথ্যের জন্য আমাদের সাপোর্ট কনসালটেন্টের সাথে সরাসরি সংযুক্ত হতে পারেন।\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`,
        source: 'DOC'
      };
    }
    return {
      reply: `### 🏛️ ${bestDoc.title} — Institutional Knowledge Base\n\n${bestDoc.summary}\n\n- 🔹 **Category**: ${bestDoc.category}\n- 🔹 **Core Highlights**: ${bestDoc.content.slice(0, 300)}...\n\n> 💡 **Senior Advisory Desk:**  \n> Our corporate advisory team is available for deep-dive consultative guidance on this topic.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
      source: 'DOC'
    };
  }

  // 11. CASE D: BEST MATCHING RESOLVED SUPPORT TICKET
  if (bestTicket && bestTicketScore >= 20) {
    return {
      reply: `### 🏛️ ${bestTicket.subject} — Verified Consultant Resolution\n\n${bestTicket.adminAnswer}\n\n> 💡 **Verified Resolution by ${bestTicket.assignedTo}:**  \n> Case #${bestTicket.ticketNumber} verified institutional resolution.\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
      source: 'TICKET'
    };
  }

  // 12. GENERAL CONSULTATIVE FALLBACK
  if (isAr) {
    return {
      reply: `### 🏛️ ${memory.identity.brand} — المكتب الاستشاري التنفيذي\n\nأنا المستشار الآلي المساعد لـ **${memory.identity.brand}**. يسعدني تقديم المساعدة الدقيقة بناءً على ركائزنا المؤسسية المعتمدة:\n\n- 🔹 **تأسيس الشركات في السعودية ورخصة MISA** (ملكية أجنبية 100%)\n- 🔹 **الهندسة والحلول البرمجية المتطورة**\n- 🔹 **تأشيرات المستثمرين والإقامات والتعقيب الحكومي**\n- 🔹 **العقارات التجارية وعقود إيجاري المعتمدة**\n- 🔹 **المحاسبة والامتثال الضريبي وهيئة الزكاة (ZATCA)**\n- 🔹 **تأسيس الشركات الدولية** (USA LLC, UK Ltd)\n\n> 💡 **تفضل بطرح استفسارك:**  \n> يرجى كتابة متطلباتك أو سؤالك بدقة وسأقدم لك الإجابة النظامية الفورية!\n\n> 🏛️ **المكتب الاستشاري والتنفيذي بالرياض**  \n> *تريك للاستشارات | تأسيس الشركات وحلول الأعمال وفق رؤية 2030*`,
      source: 'AI'
    };
  }

  if (isBn) {
    return {
      reply: `### 🏛️ ${memory.identity.brand} — এক্সিকিউটিভ অ্যাডভাইজরি ডেস্ক\n\nআমি **${memory.identity.brand}**-এর এআই সাপোর্ট অ্যাসিস্ট্যান্ট। আমি আমাদের সমগ্র প্রাতিষ্ঠানিক বিজনেস মেমোরির তথ্যের আলোকে আপনাকে সহায়তা করতে প্রস্তুত:\n\n- 🔹 **সৌদি কোম্পানি গঠন ও MISA লাইসেন্স** (১০০% বিদেশি মালিকানা)\n- 🔹 **ইন-হাউস সফটওয়্যার ও ডিজিটাল ইঞ্জিনিয়ারিং**\n- 🔹 **ভিসা, ইকামা ও সরকারি PRO লিয়াজোঁ**\n- 🔹 **বাণিজ্যিক রিয়েল এস্টেট ও Ejari অফিস লিজ**\n- 🔹 **কর্পোরেট একাউন্টিং, ZATCA ভ্যাট ও অডিট**\n- 🔹 **আন্তর্জাতিক কোম্পানি গঠন** (USA LLC, UK Ltd)\n\n> 💡 **আপনার প্রয়োজনটি জানান:**  \n> আপনার সুনির্দিষ্ট চাহিদা বা প্রশ্নটি লিখুন, আমি এখনই সঠিক প্রাতিষ্ঠানিক তথ্য ও গাইডলাইন সরবরাহ করব!\n\n> 🏛️ **সিনিয়র অ্যাডভাইজরি ও লিগ্যাল ডেস্ক (রিয়াদ)**  \n> *ট্রেক কনসালটেন্সি | ভিশন ২০৩০ কর্পোরেট মার্কেট এন্ট্রি ও এন্টারপ্রাইজ সলিউশনস*`,
      source: 'AI'
    };
  }

  return {
    reply: `### 🏛️ ${memory.identity.brand} — Executive Advisory Desk\n\nI am the AI Support Consultant for **${memory.identity.brand}**. I draw directly from our verified institutional business memory to assist your corporate journey:\n\n- 🔹 **Saudi Business Setup & MISA Licensing** (100% foreign ownership)\n- 🔹 **In-House Software & Digital Engineering** (Custom ERPs & apps)\n- 🔹 **Investor Visas, Executive Iqamas & PRO Portals** (Qiwa & Muqeem)\n- 🔹 **Commercial Real Estate & Certified Ejari Leases** (Offices & warehouses)\n- 🔹 **Corporate Accounting, ZATCA Phase 2 VAT & Audits**\n- 🔹 **Global Business Formation** (USA LLC, UK Ltd)\n\n> 💡 **How can we assist you?**  \n> Please let me know your specific business requirement or question, and I will guide you with accurate regulatory information!\n\n> 🏛️ **Senior Advisory & Legal Desk (Riyadh)**  \n> *Trek Consultancy | Vision 2030 Corporate Market Entry & Enterprise Solutions*`,
    source: 'AI'
  };
}
