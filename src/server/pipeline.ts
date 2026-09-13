/**
 * Trek Consultancy - 5-Stage AI Support Funnel Pipeline
 * 
 * Stage 1:  Direct KB match (deterministic lookups: contact, service list, exact FAQ lookups)
 * Stage 1b: Fuzzy FAQ match (stemming + synonym-map approach seeded with Saudi/consultancy terms)
 * Stage 2:  Grounded LLM generation (draws on full RAG context for composite/exploratory questions)
 * Stage 3:  Keyword fallback (canned category answers per pillar if LLM step fails)
 * Stage 4:  Human ticket fallback (auto-creates ticket with guaranteed 48-hour response promise)
 */

import { GoogleGenAI, Type } from '@google/genai';

export interface PipelineSettings {
  forumName: string;
  supportEmail: string;
  phone: string;
  whatsapp: string;
  slaHours: number;
}

export interface PipelineResult {
  reply: string;
  source: 'FAQ' | 'RAG' | 'AI' | 'AI_AUTO_TICKET';
  suggestedActions: string[];
  autoTicket?: any;
  createdTicket?: any;
  stageExecuted: 'STAGE_1_DIRECT_KB' | 'STAGE_1B_FUZZY_FAQ' | 'STAGE_2_GROUNDED_LLM' | 'STAGE_3_KEYWORD_FALLBACK' | 'STAGE_4_HUMAN_TICKET' | 'CONVERSATIONAL';
}

// ============================================================
// §5: STEMMING & SAUDI/CONSULTANCY SYNONYM DICTIONARY
// ============================================================

/**
 * Domain-specific canonical synonym mappings for fuzzy FAQ matching
 */
export const DOMAIN_CANONICAL_SYNONYM_MAP: Record<string, string> = {
  // MISA / Licensing
  'misa': 'license',
  'sagia': 'license',
  'license': 'license',
  'licensing': 'license',
  'licence': 'license',

  // Company Setup / Registration
  'company setup': 'formation',
  'company formation': 'formation',
  'business setup': 'formation',
  'register': 'registration',
  'registration': 'registration',
  'incorporate': 'formation',
  'incorporation': 'formation',

  // Real Estate & Property
  'own land': 'property',
  'buy property': 'property',
  'buy land': 'property',
  'own property': 'property',
  'land': 'property',
  'real estate': 'property',
  'realestate': 'property',

  // Foreigner / Investor
  'foreigner': 'investor',
  'foreign': 'investor',
  'foreigners': 'investor',
  'expat': 'investor',
  'expats': 'investor',
  'foreign investor': 'investor',

  // Timeline / Duration
  'timeline': 'duration',
  'timeframe': 'duration',
  'how long': 'duration',
  'duration': 'duration',
  'how fast': 'duration',
  'how quickly': 'duration',
  'days': 'duration',
  'weeks': 'duration',

  // Requirements / Documents
  'requirements': 'documents',
  'requirement': 'documents',
  'papers': 'documents',
  'paperwork': 'documents',
  'documentation': 'documents',
  'document': 'documents',
  'attestation': 'documents',

  // Cost / Pricing
  'cost': 'price',
  'costs': 'price',
  'fee': 'price',
  'fees': 'price',
  'price': 'price',
  'pricing': 'price',
  'quote': 'price',
  'quotation': 'price',

  // Contact / WhatsApp
  'whatsapp': 'contact',
  'call': 'contact',
  'phone': 'contact',
  'telephone': 'contact',
  'email': 'contact',
  'reach': 'contact',

  // Software / Development
  'software': 'development',
  'app': 'development',
  'apps': 'development',
  'mobile app': 'development',
  'website': 'development',
  'web': 'development',
  'erp': 'development',
  'developer': 'development',
  'developers': 'development',
  'coding': 'development',
  'programming': 'development',
  'automation': 'development'
};

export const SAUDI_SYNONYM_MAP: Record<string, string[]> = {
  // Foreign Property Ownership
  property_ownership: [
    'land', 'plot', 'apartment', 'villa', 'flat', 'building', 'real estate', 'property',
    'commercial property', 'residential property', 'buy land', 'buy property', 'own land',
    'own property', 'foreigner own', 'foreign property', 'realestate', 'housing', 'plot of land',
    'জমি', 'ফ্ল্যাট', 'বাড়ি', 'প্রপার্টি', 'রিয়েল এস্টেট', 'জমি কেনা'
  ],
  // Setup Timeline
  setup_timeline: [
    'timeline', 'duration', 'timeframe', 'days', 'weeks', 'how long', 'how fast', 'how quickly',
    'turnaround', 'how long does it take', 'process time', 'completion time', 'schedule', 'speed',
    'কত দিন লাগবে', 'সময়সীমা', 'কত সময়', 'মেয়াদ'
  ],
  // Required Documents
  required_documents: [
    'documents', 'documentation', 'document', 'paperwork', 'papers', 'requirements', 'requirement',
    'attestation', 'apostille', 'board resolution', 'audited financials', 'poa', 'power of attorney',
    'gm passport', 'what do i need to submit', 'checklist', 'certificate of incorporation',
    'কাগজপত্র', 'ডকুমেন্টস', 'প্রয়োজনীয় কাগজপত্র', 'অ্যাটেস্টেশন'
  ],
  // MISA 100% Foreign Ownership
  misa_ownership: [
    'misa', 'sagia', 'ministry of investment', '100%', 'foreign ownership', 'foreign owner',
    'local sponsor', 'kafil', 'saudi partner', 'own 100 percent', 'wholly foreign owned', '100 percent',
    'foreign investor license', 'investment license', 'মিষা', '১০০% মালিকানা', 'কাফিল ছাড়া'
  ],
  // Step-by-Step Setup Process Roadmap
  setup_roadmap: [
    'process', 'steps', 'sequence', 'roadmap', 'formation', 'register company', 'start company',
    'open company', 'how to set up', 'incorporation steps', 'procedure', 'how do i start',
    'কীভাবে কোম্পানি খুলব', 'কোম্পানি খোলার নিয়ম', 'পদ্ধতি'
  ],
  // Turnkey / All Under One Roof
  turnkey_service: [
    'turnkey', 'under one roof', 'all in one', 'one stop', 'end to end', 'full service',
    'consulting only', 'do you handle everything', 'complete service', 'এক ছাতার নিচে'
  ],
  // Software & Digital Engineering
  software_digital: [
    'software', 'erp', 'developer', 'developers', 'coding', 'app', 'apps', 'mobile app',
    'website', 'web development', 'custom system', 'ai automation', 'tech stack', 'engineering team',
    'programming', 'custom software', 'সফটওয়্যার', 'অ্যাপ', 'ওয়েবসাইট'
  ],
  // Visa & PRO Services
  visa_pro: [
    'pro', 'visa', 'visas', 'iqama', 'work permit', 'qiwa', 'muqeem', 'balady',
    'labor contract', 'labor office', 'gosi', 'chamber', 'attestation', 'sponsorship transfer',
    'ভিসা', 'ইকামাহ', 'কিওয়া', 'মুকিম', 'ওয়ার্ক পারমিট'
  ],
  // Accounting, Tax & ZATCA
  tax_accounting: [
    'zatca', 'tax', 'taxes', 'vat', 'accounting', 'audit', 'payroll', 'bookkeeping',
    'zakat', 'financial audit', 'tax filing', 'কর', 'ভ্যাট', 'অডিট', 'ট্যাক্স'
  ],
  // International Company Formation
  international_expansion: [
    'international', 'usa llc', 'delaware', 'wyoming', 'montana', 'uk ltd', 'canada',
    'mercury bank', 'wise business', 'amazon seller', 'ebay', 'dropshipping', 'global banking',
    'আমেরিকা কোম্পানি', 'ইউএসএ এলএলসি', 'অ্যামাজন'
  ],
  // Why Choose Trek / Global Profile
  why_choose_trek: [
    'why trek', 'why choose trek', 'advantage', 'benefit of trek', 'compare', 'about trek',
    'who is trek', 'trek offices', 'কেন ট্রেক', 'ট্রেক কনসালটেন্সি কেন'
  ]
};

const STOP_WORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'this', 'that', 'these', 'those', 'there', 'here',
  'the', 'and', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'now', 'have', 'has', 'had', 'having',
  'does', 'did', 'doing', 'would', 'could', 'tell', 'give', 'know', 'want', 'need', 'please', 'trek'
]);

/**
 * Basic morphological stemmer removing common English suffixes
 */
export function stemWord(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return w;
  return w
    .replace(/(?:ing|edly|able|ible|tion|ment|ness|al|ic|ers|er|ed|es|s)$/, '')
    .trim();
}

/**
 * Apply multi-word canonical phrases and single-word synonyms
 */
export function applyCanonicalPhrases(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace multi-word canonical keys first
  const multiWordEntries = Object.entries(DOMAIN_CANONICAL_SYNONYM_MAP)
    .filter(([key]) => key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, canonical] of multiWordEntries) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), canonical);
  }

  return normalized;
}

/**
 * Tokenize and stem user input with canonical domain synonym mapping
 */
export function tokenizeAndStem(text: string): { tokens: string[]; stems: string[]; canonicalStems: string[] } {
  const phraseNormalized = applyCanonicalPhrases(text);
  const clean = phraseNormalized.replace(/[^a-z0-9\s]/g, ' ');
  const rawTokens = clean.split(/\s+/).filter(t => t.length >= 3 && !STOP_WORDS.has(t));
  
  const tokens: string[] = [];
  const stems: string[] = [];
  const canonicalStems: string[] = [];

  for (const tok of rawTokens) {
    tokens.push(tok);
    const st = stemWord(tok);
    stems.push(st);

    // Apply single-word canonical mapping
    const canonical = DOMAIN_CANONICAL_SYNONYM_MAP[tok] || DOMAIN_CANONICAL_SYNONYM_MAP[st] || tok;
    tokens.push(canonical);
    canonicalStems.push(stemWord(canonical));
  }

  return {
    tokens: Array.from(new Set(tokens)),
    stems: Array.from(new Set(stems)),
    canonicalStems: Array.from(new Set(canonicalStems))
  };
}

// ============================================================
// STAGE 1: DIRECT KB MATCH (Deterministic Lookups)
// ============================================================

export function matchDirectKB(
  cleanMsg: string,
  userLang: 'en' | 'bn',
  settings: PipelineSettings
): PipelineResult | null {
  const lower = cleanMsg.toLowerCase().trim();

  // 1. Direct Contact & Office Details
  const isDirectContact = /^(contact|call|phone|telephone|phone\s*number|whatsapp|whatsapp\s*number|email|support\s*email|office|offices|office\s*address|location|locations|where\s*is\s*your\s*office|riyadh\s*office|madinah\s*office|usa\s*office|dhaka\s*office|bangladesh\s*office)\b/i.test(lower) ||
    ['যোগাযোগ', 'ফোন নাম্বার', 'হোয়াটসঅ্যাপ', 'অফিস ঠিকানা', 'রিয়াদ অফিস', 'মদিনা অফিস', 'ঢাকা অফিস'].some(k => lower.includes(k));

  if (isDirectContact) {
    const reply = userLang === 'bn'
      ? `**ট্রেক কনসালটেন্সির সাথে যোগাযোগের মাধ্যম ও অফিসসমূহ:**\n\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **সরাসরি ফোন**: ${settings.phone}\n- ✉️ **অফিসিয়াল ইমেইল**: ${settings.supportEmail}\n- 🌐 **গ্লোবাল অফিসসমূহ**:\n  • **সৌদি আরব**: রিয়াদ ও মদিনা (জেদ্দায় শীঘ্রই চালু হচ্ছে)\n  • **যুক্তরাষ্ট্র (USA)**: মন্টানা\n  • **বাংলাদেশ**: ঢাকা\n\n*আমাদের সিনিয়র কনসালটেন্টের সাথে ফ্রি ৩০ মিনিটের অ্যাডভাইজরি বুকিং করতে পারেন—আমরা ৪৮ ঘণ্টার মধ্যে যোগাযোগ করব।*`
      : `**Trek Consultancy Official Contact Channels & Global Offices:**\n\n- 📱 **WhatsApp**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **Direct Call**: ${settings.phone}\n- ✉️ **Official Email**: ${settings.supportEmail}\n- 📍 **Global Physical Offices**:\n  • **Saudi Arabia**: Riyadh & Madinah (Jeddah upcoming)\n  • **United States**: Montana\n  • **Bangladesh**: Dhaka\n\n*You can also book a free 30-minute advisory consultation—guaranteed advisor response within ${settings.slaHours} hours.*`;

    return {
      reply,
      source: 'FAQ',
      suggestedActions: userLang === 'bn'
        ? ['হোয়াটসঅ্যাপে মেসেজ', 'ফ্রি কনসালটেন্সি বুকিং', 'সেবাসমূহের তালিকা']
        : ['Chat on WhatsApp', 'Book Free Consultation', 'Explore Service Pillars'],
      stageExecuted: 'STAGE_1_DIRECT_KB'
    };
  }

  // 2. Direct Service List Breakdown
  const isServiceList = /^(services|service\s*list|all\s*services|what\s*services\s*do\s*you\s*(offer|provide)|what\s*does\s*trek\s*do|list\s*of\s*services|our\s*services)\b/i.test(lower) ||
    ['সেবাসমূহ', 'সার্ভিস লিস্ট', 'কী কী সেবা দেন'].some(k => lower.includes(k));

  if (isServiceList) {
    const reply = userLang === 'bn'
      ? `**ট্রেক কনসালটেন্সির ৬টি প্রধান সেবা স্তম্ভ (এক ছাতার নিচে):**\n\n1. 🇸🇦 **সৌদি বিজনেস সেটআপ**: MISA লাইসেন্স (১০০% বিদেশি মালিকানা), কমার্শিয়াল রেজিস্ট্রেশন (CR), কর্পোরেট ব্যাংক অ্যাকাউন্ট, ZATCA ট্যাক্স ও GOSI রেজিস্ট্রেশন।\n2. 💻 **সফটওয়্যার ও ডিজিটাল সল্যুশন**: কাস্টম ERP, ওয়েব/মোবাইল অ্যাপ ডেভেলপমেন্ট, AI অটোমেশন ও এসইও (SEO)।\n3. 📋 **ভিসা ও প্রো (PRO) সার্ভিস**: ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, ইকামাহ প্রদান/রিনিউয়াল, ক্বিওয়া (Qiwa) ও মুকিম (Muqeem)।\n4. 🏢 **রিয়েল এস্টেট ইনভেস্টমেন্ট**: বাণিজ্যিক অফিস স্পেস লিজ ও শিল্প/বাণিজ্যিক প্রপার্টি ক্রয়ে গাইডেন্স।\n5. 📊 **হিসাব ও ট্যাক্স সাপোর্ট**: ZATCA ভ্যাট ও ট্যাক্স ফাইলিং, এক্সটার্নাল/ইন্টারনাল অডিট ও পে-রোল।\n6. 🌐 **আন্তর্জাতিক কোম্পানি গঠন**: ইউএসএ এলএলসি (USA LLC), ইউকে লিমিটেড, গ্লোবাল ব্যাংক অ্যাকাউন্ট (Mercury/Wise) ও অ্যামাজন সেলার অ্যাকাউন্ট।`
      : `**Trek Consultancy's 6 Core Service Pillars (All Under One Roof):**\n\n1. 🇸🇦 **Saudi Business Setup**: MISA Foreign Investment Licenses (100% foreign ownership), Commercial Registration (CR), Corporate Bank Accounts, ZATCA tax & GOSI registration.\n2. 💻 **Software & Digital Engineering**: In-house Custom ERP systems, High-Performance Web & Mobile Apps, AI Workflows, and Middle Eastern SEO.\n3. 📋 **Visa & PRO Services**: Investor Visas, General Manager Iqama, Qiwa employment contracts, Muqeem, and Chamber attestations.\n4. 🏢 **Real Estate Investment**: Commercial office leasing (MISA/Balady compliant), industrial real estate, and Premium Residency property acquisition.\n5. 📊 **Business Support & Accounting**: ZATCA VAT compliance, corporate bookkeeping, external audits, and payroll.\n6. 🌐 **International Expansion**: USA LLC Formation (Delaware, Wyoming, Montana), UK Ltd, Canadian corporate registration, and global banking (Mercury, Wise).`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['সৌদি সেটআপ রোডম্যাপ', 'MISA লাইসেন্স সুবিধা', 'ফ্রি কনসালটেন্সি']
        : ['Saudi Setup Roadmap', 'MISA License Details', 'Book Free Consultation'],
      stageExecuted: 'STAGE_1_DIRECT_KB'
    };
  }

  // 3. "Does Trek do X" direct checks
  if (/\bdoes\s+trek\s+(do|handle|provide|offer|build)\s+(software|erp|apps?|websites?)\b/i.test(lower)) {
    const reply = userLang === 'bn'
      ? `**হ্যাঁ, ট্রেক কনসালটেন্সির নিজস্ব ইন-হাউস সফটওয়্যার টিম রয়েছে!**\n\nআমরা কাস্টম এন্টারপ্রাইজ ERP, রিয়েক্ট ও নোড-জেএস ওয়েব অ্যাপ, আইওএস/অ্যান্ড্রয়েড মোবাইল অ্যাপ এবং এআই অটোমেশন তৈরি করি। আপনি চাইলে আপনার ব্যবসায়িক সফটওয়্যারের জন্য একটি ফ্রি টেকনিক্যাল কনসালটেন্সি বুক করতে পারেন!`
      : `**Yes, Trek Consultancy houses an elite in-house Software & Digital Engineering team.**\n\nUnlike standard consulting agencies, we build enterprise ERPs, cloud platforms (React/Node.js), mobile applications, and AI automations in-house. Schedule a tech advisory session to discuss your architecture!`;
    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['Software & ERP Solutions', 'Schedule Tech Consultation', 'Book Free Consultation'],
      stageExecuted: 'STAGE_1_DIRECT_KB'
    };
  }

  if (/\bdoes\s+trek\s+(do|handle|provide|offer)\s+(accounting|tax|vat|zatca|audit)\b/i.test(lower)) {
    const reply = userLang === 'bn'
      ? `**হ্যাঁ, ট্রেক কনসালটেন্সি সম্পূর্ণ ট্যাক্স ও অ্যাকাউন্টস সাপোর্ট প্রদান করে!**\n\nআমাদের সেবাগুলোর মধ্যে রয়েছে ZATCA ই-ইনভয়েসিং ও ভ্যাট কমপ্লায়েন্স, করপোরেট ট্যাক্স রিটার্ন, ইন্টারনাল ও এক্সটার্নাল অডিট এবং পে-রোল ম্যানেজমেন্ট।`
      : `**Yes, Trek Consultancy provides full Business Support & Accounting Services.**\n\nOur certified team handles ZATCA e-invoicing & VAT compliance, corporate income tax filing, quarterly reviews, external audits, and payroll administration.`;
    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['Tax & VAT Compliance', 'Accounting Services', 'Contact on WhatsApp'],
      stageExecuted: 'STAGE_1_DIRECT_KB'
    };
  }

  return null;
}

// ============================================================
// STAGE 1B: FUZZY FAQ MATCH (Stemming + Synonym Map Approach)
// ============================================================

export function matchFuzzyFAQ(
  cleanMsg: string,
  userLang: 'en' | 'bn',
  faqsList: any[],
  docsList: any[]
): PipelineResult | null {
  const lower = cleanMsg.toLowerCase().trim();
  const { tokens, stems, canonicalStems } = tokenizeAndStem(cleanMsg);

  // Check synonym map categories for deterministic thematic scoring
  const categoryScores: Record<string, number> = {};

  for (const [catKey, synList] of Object.entries(SAUDI_SYNONYM_MAP)) {
    let score = 0;
    for (const syn of synList) {
      if (syn.includes(' ')) {
        if (lower.includes(syn)) score += 15;
      } else {
        const synStem = stemWord(syn);
        if (tokens.includes(syn)) score += 8;
        else if (stems.includes(synStem) || canonicalStems.includes(synStem)) score += 6;
        else if (lower.includes(syn)) score += 3;
      }
    }
    categoryScores[catKey] = score;
  }

  // Find highest scoring category
  let topCategory = '';
  let topScore = 0;
  for (const [cat, sc] of Object.entries(categoryScores)) {
    if (sc > topScore) {
      topScore = sc;
      topCategory = cat;
    }
  }

  // 1. Foreign Property Ownership
  if (topCategory === 'property_ownership' && topScore >= 12) {
    const reply = userLang === 'bn'
      ? `**সৌদি আরবে বিদেশি বিনিয়োগকারীদের প্রপার্টি ও জমি ক্রয়ের নিয়ম:**\n\n1. **বাণিজ্যিক ও করপোরেট প্রপার্টি**: MISA লাইসেন্সধারী যেকোনো বিদেশি কোম্পানি তাদের ব্যবসায়িক কার্যক্রম, অফিস, কারখানা বা গুদামের জন্য সৌদি আরবে বাণিজ্যিক জমি ও ভবন কিনতে পারে।\n2. **আবাসিক প্রপার্টি**: সৌদি প্রিমিয়াম রেসিডেন্সি (Premium Residency) প্রোগ্রামের আওতায় বিদেশি নাগরিকরা সরাসরি নির্দিষ্ট এলাকায় আবাসিক বাড়ি/ফ্ল্যাট ক্রয় করতে পারেন।\n3. **অফিস স্পেস লিজ**: MISA ও স্থানীয় মিউনিসিপ্যাল (Balady) লাইসেন্সিং বিধিমালার সাথে সামঞ্জস্যপূর্ণ অফিস স্পেস লিজ নেওয়ার ক্ষেত্রে ট্রেক কনসালটেন্সি সার্বিক সহায়তা প্রদান করে।`
      : `**Foreign Property & Land Ownership Rules in Saudi Arabia:**\n\n1. **Corporate & Commercial Property**: Under Saudi investment law, any 100% foreign-owned company holding a valid MISA license is legally entitled to purchase and own commercial, industrial, and administrative real estate necessary for its operations.\n2. **Residential Property for Individuals**: Foreign nationals holding a Saudi Premium Residency (or eligible investor visa status) can directly own residential apartments and villas in designated metropolitan zones.\n3. **Commercial Office Leasing**: Trek Consultancy assists international clients in sourcing, inspecting, and securing physical office leases in Riyadh, Madinah, and Jeddah compliant with Balady municipal licensing.`;

    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['Office Space Assistance', 'Saudi Business Setup', 'Contact on WhatsApp'],
      stageExecuted: 'STAGE_1B_FUZZY_FAQ'
    };
  }

  // 2. Setup Timeline
  if (topCategory === 'setup_timeline' && topScore >= 10) {
    const reply = userLang === 'bn'
      ? `**সৌদি ব্যবসায়িক সেটআপের সময়সীমা:**\n\nপ্রয়োজনীয় দূতাবাস-প্রত্যায়িত ডকুমেন্টস প্রস্তুত থাকলে সম্পূর্ণ সেটআপ সাধারণত **২ থেকে ৪ সপ্তাহের** মধ্যে সম্পন্ন হয়:\n1. **MISA ইনভেস্টমেন্ট লাইসেন্স**: ৩ থেকে ৫ কর্মদিবস।\n2. **বাণিজ্যিক নিবন্ধন (CR) ও AOA**: ২ থেকে ৪ কর্মদিবস।\n3. **চেম্বার অব কমার্স ও ন্যাশনাল অ্যাড্রেস**: ২ থেকে ৩ কর্মদিবস।\n4. **ZATCA, GOSI, Qiwa ও Muqeem পোর্টাল সক্রিয়করণ**: ২ থেকে ৩ কর্মদিবস।\n5. **কর্পোরেট ব্যাংক অ্যাকাউন্ট সক্রিয়করণ**: ৫ থেকে ১০ কর্মদিবস।\n\nট্রেক কনসালটেন্সির এক্সপার্ট টিম দ্রুততম সময়ে কার্যক্রম সম্পন্ন করতে সহায়তা করে।`
      : `**Timeline for Establishing a Company in Saudi Arabia:**\n\nWith all required attested documents ready, the complete turnkey setup typically takes **2 to 4 weeks** end-to-end:\n1. **MISA Investment License**: 3 to 5 business days.\n2. **Commercial Registration (CR) & AOA**: 2 to 4 business days.\n3. **Chamber of Commerce & Saudi National Address (SPL)**: 2 to 3 business days.\n4. **ZATCA, GOSI, Qiwa & Muqeem Activation**: 2 to 3 business days.\n5. **Corporate Bank Account Activation**: 5 to 10 business days.\n\nTrek Consultancy actively manages every phase to eliminate bureaucratic delays.`;

    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['Required Documents', 'MISA License Details', 'Book Free Consultation'],
      stageExecuted: 'STAGE_1B_FUZZY_FAQ'
    };
  }

  // 3. Required Documents
  if (topCategory === 'required_documents' && topScore >= 10) {
    const reply = userLang === 'bn'
      ? `**সৌদি কোম্পানি গঠনের প্রয়োজনীয় কাগজপত্র:**\n\nবিদেশি কোম্পানির শাখা বা সাবসিডিয়ারি গঠনের জন্য প্রাথমিক রিকোয়ারমেন্টস:\n1. প্যারেন্ট কোম্পানির **কমার্শিয়াল রেজিস্ট্রেশন (CR)** বা ইনকর্পোরেশন সার্টিফিকেট।\n2. বিগত ১-২ বছরের **নিরীক্ষিত আর্থিক বিবরণী (Audited Financials)**।\n3. পরিচালনা পর্ষদের **বোর্ড রেজোলিউশন (Board Resolution)** যা সৌদি শাখা খোলার অনুমোদন দেয় ও জেনারেল ম্যানেজার (GM) নিয়োগ করে।\n4. ট্রেক কনসালটেন্সির অনুকূলে **পাওয়ার অফ অ্যাটর্নি (POA)**।\n5. প্রস্তাবিত জেনারেল ম্যানেজারের পাসপোর্টের স্পষ্ট কপি।\n\n*সকল করপোরেট ডকুমেন্ট নিজ দেশের সৌদি দূতাবাস কর্তৃক Attested অথবা Apostilled হতে হবে।*`
      : `**Required Documents for Establishing a Saudi Foreign Entity:**\n\nTo establish a 100% foreign-owned subsidiary or branch in Saudi Arabia, you will need:\n1. **Parent Company Commercial Registration (CR)** or Certificate of Incorporation.\n2. **Audited Financial Statements** for the past 1–2 fiscal years.\n3. **Board Resolution** approving the Saudi entity establishment and appointing the General Manager (GM).\n4. **Power of Attorney (POA)** issued to Trek Consultancy.\n5. **Passport Copy of the General Manager**.\n\n*All corporate documents must be attested by the Saudi Embassy in your origin country or apostilled.*`;

    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['MISA License Steps', 'Setup Timeline', 'Contact on WhatsApp'],
      stageExecuted: 'STAGE_1B_FUZZY_FAQ'
    };
  }

  // 4. MISA 100% Ownership
  if (topCategory === 'misa_ownership' && topScore >= 10) {
    const reply = userLang === 'bn'
      ? `**MISA ইনভেস্টমেন্ট লাইসেন্স ও ১০০% মালিকানা:**\n\nসৌদি মিনিস্ট্রি অব ইনভেস্টমেন্ট (MISA)-এর অধীনে বিদেশি উদ্যোক্তা ও কোম্পানিগুলো **১০০% বিদেশি মালিকানায়** ব্যবসা খুলতে পারে। কোনো স্থানীয় সৌদি স্পন্সর (Kafil) প্রয়োজন নেই!\n\n- **অনুমোদিত খাতসমূহ**: সার্ভিসেস, আইটি/সফটওয়্যার, ট্রেডিং/আমদানি-রপ্তানি, ম্যানুফ্যাকচারিং, কন্সাল্টিং এবং রিয়েল এস্টেট।\n- **প্রধান সুবিধা**: ১০০% ক্যাপিটাল ও প্রফিট বিদেশে ফেরত নেওয়ার পূর্ণ অধিকার, প্রপার্টি কেনার সুবিধা, এবং ইনভেস্টর রেসিডেন্সি (Iqama)।\n\nট্রেক কনসালটেন্সি শুরু থেকে শেষ পর্যন্ত সম্পূর্ণ লাইসেন্সিং ও সরকারি পোর্টাল অ্যাক্টিভেশন সম্পন্ন করে।`
      : `**MISA Foreign Investment License & 100% Ownership:**\n\nUnder Saudi Arabia's Ministry of Investment (MISA), foreign investors can enjoy **100% foreign company ownership** without requiring a local Saudi sponsor or partner.\n\n- **Eligible Sectors**: Services, IT & Software Engineering, Trading (wholesale/retail), Industrial & Manufacturing, Technical Consulting, and Real Estate.\n- **Core Benefits**: Full repatriation of capital and profits, legal rights to lease/own corporate properties, and eligibility for Investor Visas and Iqama.\n\nTrek Consultancy manages the entire MISA submission and government licensing process from start to finish.`;

    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['How to Open a Company', 'Required Documents', 'Book Free Consultation'],
      stageExecuted: 'STAGE_1B_FUZZY_FAQ'
    };
  }

  // 5. Why Choose Trek
  if (topCategory === 'why_choose_trek' && topScore >= 10) {
    const reply = userLang === 'bn'
      ? `**কেন ট্রেক কনসালটেন্সি বেছে নেবেন?**\n\n- 🌐 **গ্লোবাল উপস্থিতি**: রিয়াদ, মদিনা, মন্টানা (যুক্তরাষ্ট্র) এবং ঢাকা (বাংলাদেশ)-এ ফিজিক্যাল অফিস।\n- 🏢 **এক ছাতার নিচে সম্পূর্ণ সমাধান**: লিগ্যাল লাইসেন্সিং, CR, ট্যাক্স (ZATCA), ইন-হাউস সফটওয়্যার ডেভেলপমেন্ট এবং ভিসা/প্রো সেবা—সবকিছু এক জায়গা থেকেই সম্পন্ন হয়।\n- 🤝 **ডেডিকেটেড অ্যাডভাইজর**: অভিজ্ঞ দ্বিভাষিক কনসালটেন্ট যারা আন্তর্জাতিক বিনিয়োগকারীদের সাথে সরাসরি কাজ করেন।\n- ⏱️ **দ্রুত রেসপন্স টাইম**: ৪৮ ঘণ্টার মধ্যে পরামর্শকের নিশ্চয়তা এবং স্বচ্ছ ও নিশ্চিত রোডম্যাপ।`
      : `**Why Choose Trek Consultancy Over Other Firms?**\n\n- 🌐 **Global Physical Presence**: Offices in Riyadh & Madinah (Saudi Arabia), Montana (USA), and Dhaka (Bangladesh).\n- 🏢 **All Under One Roof**: Legal licensing (MISA), CR, corporate tax (ZATCA), in-house software engineering, and corporate PRO/visas handled by one unified team.\n- 🤝 **Dedicated Investor Advisors**: Direct consultation with experienced international corporate specialists.\n- ⏱️ **Guaranteed 48-Hour Response**: Structured onboarding, verified turnaround timelines, and reliable communication via WhatsApp and direct advisory desks.`;

    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['Explore Service Pillars', 'Chat on WhatsApp', 'Book Free Consultation'],
      stageExecuted: 'STAGE_1B_FUZZY_FAQ'
    };
  }

  // Also check database FAQs for fuzzy textual and synonym match
  for (const f of faqsList) {
    const qLow = (f.question || '').toLowerCase();
    const aLow = (f.answer || '').toLowerCase();
    const qBnLow = (f.question_bn || '').toLowerCase();
    let score = 0;

    if (lower.length > 6 && (qLow.includes(lower) || lower.includes(qLow))) {
      score += 30;
    }

    // Token & canonical token match
    for (const w of tokens) {
      if (qLow.includes(w) || qBnLow.includes(w)) score += 6;
      if (aLow.includes(w)) score += 2;
    }

    // Stem matching
    for (const s of stems) {
      if (qLow.includes(s)) score += 4;
    }

    // Canonical stem matching (domain synonyms)
    for (const cs of canonicalStems) {
      if (qLow.includes(cs)) score += 5;
    }

    if (score >= 20) {
      return {
        reply: userLang === 'bn' && f.answer_bn ? f.answer_bn : f.answer,
        source: 'FAQ',
        suggestedActions: userLang === 'bn'
          ? ['আরও প্রশ্ন জিজ্ঞাসা করুন', 'হোয়াটসঅ্যাপে যোগাযোগ', 'ফ্রি কনসালটেন্সি']
          : ['Ask Another Question', 'Chat on WhatsApp', 'Book Free Consultation'],
        stageExecuted: 'STAGE_1B_FUZZY_FAQ'
      };
    }
  }

  return null;
}

// ============================================================
// STAGE 2: GROUNDED LLM GENERATION (Composite / Exploratory)
// ============================================================

export async function generateGroundedLLM(
  cleanMsg: string,
  userLang: 'en' | 'bn',
  ragContext: string,
  rawHistory: any[],
  cleanEmail: string | null,
  cleanUserId: string | null,
  cleanSession: string,
  settings: PipelineSettings,
  createTicketFn: (ticketData: any) => Promise<any>
): Promise<PipelineResult | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ];

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const systemInstruction = `You are Trek Consultancy's Official AI Business Setup & Growth Assistant.
You have access to the live, verified knowledge base for Trek Consultancy (trekconsultancy.com) — a premier consultancy helping foreign investors and companies establish and grow businesses in Saudi Arabia, with additional offices in the USA and Bangladesh.

============================================================
LIVE VERIFIED TREK CONSULTANCY KNOWLEDGE BASE & CONTEXT:
${ragContext}
============================================================

YOUR CORE MANDATES & INDUSTRY COMPLIANCE RULES:

1. STRICT REGULATORY & COMPLIANCE GROUNDING:
- Because Trek Consultancy operates in regulated, high-stakes domains (immigration, licensing, tax, real estate law in Saudi Arabia), apply strict grounding discipline:
  • NEVER state specific government fees, exact processing timelines, or legal requirements as fixed unless explicitly published in the provided knowledge base context.
  • Acknowledge that Saudi regulations and government processing times can vary based on per-case variables (investor nationality, specific business activity, paid-up capital, entity type).
  • Default to "confirm with an advisor" language for anything case-specific (visa eligibility, exact CR costs, specific ZATCA obligations, property eligibility for a given nationality).
  • ESCALATE RATHER THAN GUESS on any regulatory, tax, or legal edge case. Err toward escalation over improvisation in this high-stakes domain.

2. WHATSAPP-FIRST CULTURE & TONE:
- Reflect Trek Consultancy's responsive WhatsApp-first culture. The website's primary contact channel is WhatsApp (+966 50 241 1744).
- Warmly welcome greetings with polite Islamic greeting conventions ("Wa Alaikum Assalam! Welcome to Trek Consultancy...") without assuming the religious identity of the user.
- Maintain a reassuring, professional, and knowledgeable advisory tone appropriate for foreign investors evaluating entry into the Saudi market.

3. STRICT TOPIC RELEVANCE:
- You ONLY answer questions about Trek Consultancy and our 6 service pillars:
  • Saudi business setup (MISA License, 100% Foreign Ownership, CR, ZATCA, GOSI, Saudi National Address/SPL, corporate bank accounts, government portal activation, compliance, office space)
  • Software & digital solutions (custom software, ERP, websites, mobile apps, AI automation, SEO, digital marketing)
  • Visa & PRO services (investor visas, work permits, Iqama, Muqeem, Qiwa, chamber services, document attestation)
  • Real estate investment in Saudi Arabia (buying, leasing, commercial/industrial property, foreign investor guidance)
  • Business support services (accounting, audit, HR & payroll, tax & VAT)
  • International business services (USA/UK/Canada company formation, international bank accounts, Amazon/eBay seller setup, dropshipping)

- GREETINGS & PLEASANTRIES:
  Casual greetings ("hello", "hi", "Assalamu Alaikum", "Salam"), well-being inquiries ("how are you"), and identity queries ("who are you") are warmly welcomed. State Trek's core mission and invite them to ask about our services. Do NOT create support tickets for greetings.

- IF THE INQUIRY IS OFF-TOPIC:
  Politely and professionally decline. State that you are dedicated to Trek Consultancy's business setup, software, visa/PRO, real estate, and international services. Do NOT create a ticket for off-topic messages.

4. GROUNDED COMPOSITE GENERATION:
- Draw across multiple KB sections to provide comprehensive, nuanced answers for multi-part or exploratory questions (e.g. "what do I need to start an e-commerce business targeting Saudi customers").
- Include direct links or contact references to WhatsApp (+966 50 241 1744) or booking a free 30-minute consultation.

5. ESCALATION FOR UNCOVERED IN-SCOPE REQUESTS (48-HOUR SLA):
- If the inquiry is in-scope but requires something beyond the knowledge base — such as a custom quote, case-specific legal/regulatory judgment, contract review, or callback from a named advisor:
  Format response starting with 'INSUFFICIENT_KNOWLEDGE: [brief note on what is needed]'.
  (e.g., "INSUFFICIENT_KNOWLEDGE: Client requires custom quotation for industrial MISA license and commercial office lease")
  This automatically creates an official support ticket promising a response from a senior advisor within 48 hours (matching Trek's published SLA).`;

  // Assemble multi-turn conversational turns
  const conversationTurns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of rawHistory) {
    if (turn && typeof turn.text === 'string' && turn.text.trim()) {
      const role = turn.sender === 'user' ? 'user' : 'model';
      if (conversationTurns.length === 0 && role !== 'user') continue;
      if (conversationTurns.length > 0 && conversationTurns[conversationTurns.length - 1].role === role) {
        conversationTurns[conversationTurns.length - 1].parts[0].text += `\n${turn.text.trim()}`;
      } else {
        conversationTurns.push({
          role,
          parts: [{ text: turn.text.trim() }]
        });
      }
    }
  }

  if (conversationTurns.length > 0 && conversationTurns[conversationTurns.length - 1].role === 'user') {
    conversationTurns[conversationTurns.length - 1].parts[0].text += `\n${cleanMsg}`;
  } else {
    conversationTurns.push({
      role: 'user',
      parts: [{ text: cleanMsg }]
    });
  }

  const geminiContents = conversationTurns.length > 1 ? conversationTurns : cleanMsg;

  for (const modelName of candidateModels) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: geminiContents as any,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                classification: {
                  type: Type.STRING,
                  description: 'One of: GREETING, IN_SCOPE_ANSWER, INSUFFICIENT_KNOWLEDGE, OFF_TOPIC'
                },
                reply: {
                  type: Type.STRING,
                  description: "The assistant's markdown response. If escalation is required, start with 'INSUFFICIENT_KNOWLEDGE: [brief note]'."
                },
                ticketSubject: {
                  type: Type.STRING,
                  description: 'Concise subject for the ticket if escalation is needed, else empty string'
                },
                ticketPriority: {
                  type: Type.STRING,
                  description: 'Priority: Normal, High, or Urgent if escalation is needed'
                },
                suggestedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 3 contextual follow-up prompts for the user'
                }
              },
              required: ['classification', 'reply']
            },
            temperature: 0.2,
            maxOutputTokens: 1200
          }
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout')), 9000))
      ]);

      if (response && response.text) {
        let parsedAi: any = null;
        try {
          parsedAi = JSON.parse(response.text.trim());
        } catch {
          const rawOutput = response.text.trim();
          if (rawOutput.includes('INSUFFICIENT_KNOWLEDGE:')) {
            const noteMatch = rawOutput.match(/INSUFFICIENT_KNOWLEDGE:\s*\[?(.*?)\]?(\n|$)/i);
            const note = noteMatch && noteMatch[1] ? noteMatch[1].trim() : cleanMsg.slice(0, 60);

            const autoTicket = await createTicketFn({
              userEmail: cleanEmail || undefined,
              userId: cleanUserId || undefined,
              subject: note,
              question: cleanMsg,
              priority: 'Normal',
              sessionId: cleanSession,
              source: 'AI_Auto'
            });

            return {
              reply: userLang === 'bn'
                ? `যেহেতু আপনার এই নির্দিষ্ট অনুসন্ধানের জন্য আমাদের বিদ্যমান নলেজ বেসের অতিরিক্ত কেস-স্পেসিফিক মূল্যায়ন প্রয়োজন, তাই আমি আপনার জন্য তাৎক্ষণিকভাবে একটি অফিশিয়াল সাপোর্ট টিকিট তৈরি করেছি: **#${autoTicket.ticketNumber}**।\n\nট্রেক কনসালটেন্সির একজন সিনিয়র অ্যাডভাইজর আগামী **৪৮ ঘণ্টার মধ্যে** আপনার সাথে যোগাযোগ করবেন।\n\nজরুরি প্রয়োজনে সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন:\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **সরাসরি ফোন**: ${settings.phone}\n- ✉️ **ইমেইল**: ${settings.supportEmail}\n- অথবা একটি ফ্রি কনসালটেন্সি বুকিং করুন।`
                : `Because your inquiry requires case-specific review or details beyond our published knowledge base, I have automatically created an official consultation ticket on your behalf: **#${autoTicket.ticketNumber}**.\n\nA Trek Consultancy senior advisor will review your case and follow up within **48 hours**.\n\nYou can also connect directly with our advisory team:\n- 📱 **WhatsApp**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **Direct Call**: ${settings.phone}\n- ✉️ **Email**: ${settings.supportEmail}\n- Or book a free 30-minute consultation.`,
              source: 'AI_AUTO_TICKET',
              suggestedActions: ['Track in My Tickets', 'Contact on WhatsApp', 'Book Free Consultation'],
              autoTicket,
              stageExecuted: 'STAGE_4_HUMAN_TICKET'
            };
          }

          return {
            reply: rawOutput,
            source: 'AI',
            suggestedActions: ['Saudi Business Setup', 'Contact on WhatsApp', 'Book Free Consultation'],
            stageExecuted: 'STAGE_2_GROUNDED_LLM'
          };
        }

        if (parsedAi && parsedAi.reply) {
          const isInsufficient =
            parsedAi.classification === 'INSUFFICIENT_KNOWLEDGE' ||
            parsedAi.classification === 'COMPANY_SPECIFIC_NEEDS_TICKET' ||
            (typeof parsedAi.reply === 'string' && parsedAi.reply.includes('INSUFFICIENT_KNOWLEDGE:'));

          if (isInsufficient) {
            const noteMatch = parsedAi.reply.match(/INSUFFICIENT_KNOWLEDGE:\s*\[?(.*?)\]?(\n|$)/i);
            const note = noteMatch && noteMatch[1] ? noteMatch[1].trim() : (parsedAi.ticketSubject || cleanMsg.slice(0, 60));

            const autoTicket = await createTicketFn({
              userEmail: cleanEmail || undefined,
              userId: cleanUserId || undefined,
              subject: note || parsedAi.ticketSubject || cleanMsg.slice(0, 60),
              question: cleanMsg,
              priority: parsedAi.ticketPriority || (cleanMsg.toLowerCase().includes('urgent') ? 'High' : 'Normal'),
              sessionId: cleanSession,
              source: 'AI_Auto'
            });

            let finalReply = parsedAi.reply.replace(/INSUFFICIENT_KNOWLEDGE:\s*\[?.*?\]?(\n|$)/gi, '').trim();
            if (!finalReply || finalReply.length < 10) {
              finalReply = userLang === 'bn'
                ? `যেহেতু আপনার এই নির্দিষ্ট অনুসন্ধানের জন্য আমাদের বিদ্যমান নলেজ বেসের অতিরিক্ত কেস-স্পেসিফিক মূল্যায়ন প্রয়োজন, তাই আমি আপনার জন্য তাৎক্ষণিকভাবে একটি অফিশিয়াল সাপোর্ট টিকিট তৈরি করেছি: **#${autoTicket.ticketNumber}**।\n\nট্রেক কনসালটেন্সির একজন সিনিয়র অ্যাডভাইজর আগামী **৪৮ ঘণ্টার মধ্যে** আপনার সাথে সরাসরি যোগাযোগ করবেন।\n\nজরুরি প্রয়োজনে সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন:\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **সরাসরি ফোন**: ${settings.phone}\n- ✉️ **ইমেইল**: ${settings.supportEmail}\n- অথবা একটি ফ্রি কনসালটেন্সি বুকিং করুন।`
                : `Because your inquiry requires case-specific review or details beyond our published knowledge base, I have automatically created an official consultation ticket on your behalf: **#${autoTicket.ticketNumber}**.\n\nA Trek Consultancy senior advisor will review your case and follow up within **48 hours**.\n\nYou can also connect directly with our advisory desk:\n- 📱 **WhatsApp**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **Direct Call**: ${settings.phone}\n- ✉️ **Email**: ${settings.supportEmail}\n- Or book a free 30-minute consultation.`;
            } else {
              if (finalReply.includes('{{TICKET_NUMBER}}')) {
                finalReply = finalReply.replace(/\{\{TICKET_NUMBER\}\}/g, `#${autoTicket.ticketNumber}`);
              } else if (!finalReply.includes(autoTicket.ticketNumber)) {
                finalReply += `\n\n**Official Support Ticket Created**: #${autoTicket.ticketNumber} (Advisor response within 48 hours)`;
              }
            }

            return {
              reply: finalReply,
              source: 'AI_AUTO_TICKET',
              suggestedActions: ['Track in My Tickets', 'Contact on WhatsApp', 'Book Free Consultation'],
              autoTicket,
              createdTicket: autoTicket,
              stageExecuted: 'STAGE_4_HUMAN_TICKET'
            };
          }

          const suggested = Array.isArray(parsedAi.suggestedActions) && parsedAi.suggestedActions.length > 0
            ? parsedAi.suggestedActions.slice(0, 3)
            : ['Saudi Business Setup', 'Contact on WhatsApp', 'Book Free Consultation'];

          return {
            reply: parsedAi.reply,
            source: 'AI',
            suggestedActions: suggested,
            stageExecuted: 'STAGE_2_GROUNDED_LLM'
          };
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

// ============================================================
// STAGE 3: KEYWORD FALLBACK (Tier 3 Safety Net Templates)
// ============================================================

export function matchKeywordFallback(
  cleanMsg: string,
  userLang: 'en' | 'bn',
  settings: PipelineSettings
): PipelineResult | null {
  const lower = cleanMsg.toLowerCase().trim();

  // 1. Business Setup keywords (misa, company formation, cr, registration, zatca, gosi, license)
  if (/\b(misa|company\s*formation|cr|registration|zatca|gosi|license|licensing|incorporat|business\s*setup|sagia)\b/i.test(lower) ||
      ['কোম্পানি গঠন', 'রেজিস্ট্রেশন', 'লাইসেন্স', 'ব্যবসা শুরু'].some(k => lower.includes(k))) {
    const reply = userLang === 'bn'
      ? `**ট্রেক কনসালটেন্সি সম্পূর্ণ সৌদি বিজনেস সেটআপ সাপোর্ট প্রদান করে:**\n- **MISA লাইসেন্সিং** — মিনিস্ট্রি অব ইনভেস্টমেন্টের অধীনে শতভাগ বৈধ বিদেশি বিনিয়োগকারী লাইসেন্স\n- **কোম্পানি গঠন ও কমার্শিয়াল রেজিস্ট্রেশন (CR)**\n- **ZATCA (ভ্যাট/ট্যাক্স) ও GOSI (এমপ্লয়ি ইন্স্যুরেন্স) রেজিস্ট্রেশন**\n- **সৌদি ন্যাশনাল অ্যাড্রেস (SPL), বিজনেস ব্যাংক অ্যাকাউন্ট সেটআপ ও সরকারি পোর্টাল সক্রিয়করণ**\n- **ধারাবাহিক কমপ্লায়েন্স সাপোর্ট**\n\nআপনার ব্যবসার ধরন ও জাতীয়তার ওপর ভিত্তি করে একটি নির্দিষ্ট সেটআপ প্ল্যানের জন্য একটি ফ্রি কনসালটেন্সি বুক করুন—আমাদের অ্যাডভাইজরদের একজন ৪৮ ঘণ্টার মধ্যে যোগাযোগ করবেন।`
      : `Trek Consultancy provides end-to-end Saudi business setup support:\n- MISA Licensing — legal foreign investor licensing under the Ministry of Investment\n- Company Formation & Commercial Registration (CR)\n- ZATCA (VAT/tax) and GOSI (employee insurance) registration\n- Saudi National Address (SPL), business bank account setup, and government portal activation\n- Ongoing compliance support\n\nFor a setup plan tailored to your business activity and nationality, book a free consultation and one of our advisors will respond within 48 hours.`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['প্রয়োজনীয় কাগজপত্র', 'সেটআপ টাইমলাইন', 'ফ্রি কনসালটেন্সি বুকিং']
        : ['Required Documents', 'Setup Timeline', 'Book Free Consultation'],
      stageExecuted: 'STAGE_3_KEYWORD_FALLBACK'
    };
  }

  // 2. Software & Digital keywords (software, website, app, erp, seo, marketing, automation)
  if (/\b(software|website|web|app|apps|mobile|erp|seo|marketing|automation|developer|coding)\b/i.test(lower) ||
      ['সফটওয়্যার', 'ওয়েবসাইট', 'অ্যাপ', 'অটোমেশন'].some(k => lower.includes(k))) {
    const reply = userLang === 'bn'
      ? `**ট্রেক কনসালটেন্সির সফটওয়্যার ও ডিজিটাল টিম যা যা তৈরি করে:**\n- **কাস্টম সফটওয়্যার ও ERP সিস্টেম**\n- **বিজনেস ওয়েবসাইট ও মোবাইল অ্যাপ (Android ও iOS)**\n- **ব্যবসায়িক কাজের জন্য AI অটোমেশন**\n- **SEO, ডিজিটাল মার্কেটিং, গ্রাফিক্স ডিজাইন এবং ভিডিও এডিটিং**\n\nআপনার নির্দিষ্ট প্রজেক্টের জন্য কোটেশন জানতে চান? আমাদের হোয়াটসঅ্যাপে (+966 50 241 1744) মেসেজ দিন অথবা একটি ফ্রি কনসালটেন্সি বুক করুন।`
      : `Trek Consultancy's software & digital team builds:\n- Custom software and ERP systems\n- Business websites and mobile apps (Android & iOS)\n- AI automation for business workflows\n- SEO, digital marketing, graphics design, and video editing\n\nWant a quote for your specific project? Message us on WhatsApp (+966 50 241 1744) or book a free consultation.`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['কাস্টম ERP সিস্টেম', 'হোয়াটসঅ্যাপে মেসেজ', 'ফ্রি কনসালটেন্সি বুকিং']
        : ['Custom ERP Systems', 'Chat on WhatsApp', 'Book Free Consultation'],
      stageExecuted: 'STAGE_3_KEYWORD_FALLBACK'
    };
  }

  // 3. Visa & PRO keywords (visa, iqama, qiwa, muqeem, work permit, pro service)
  if (/\b(visa|visas|iqama|qiwa|muqeem|work\s*permit|pro\s*service|pro\s*services|pro|attestation|chamber)\b/i.test(lower) ||
      ['ভিসা', 'ইকামাহ', 'কিওয়া', 'মুকিম', 'ওয়ার্ক পারমিট'].some(k => lower.includes(k))) {
    const reply = userLang === 'bn'
      ? `**আমাদের ভিসা ও প্রো (PRO) টিম যেসব সেবা পরিচালনা করে:**\n- **ইনভেস্টর ভিসা ও ওয়ার্ক পারমিট প্রসেসিং**\n- **ইকামাহ ইস্যু, নবায়ন এবং এমপ্লয়ি সাপোর্ট**\n- **ক্বিওয়া (Qiwa) ও মুকিম (Muqeem) পোর্টাল সার্ভিসেস**\n- **চেম্বার অফ কমার্স সার্ভিস ও ডকুমেন্ট সত্যায়ন (Attestation)**\n- **এমপ্লয়ি ফাইল সেটআপ ও অনবোর্ডিং**\n\nহোয়াটসঅ্যাপ বা ইমেইলের মাধ্যমে আমাদের সাথে যোগাযোগ করুন—আমাদের একজন অ্যাডভাইজর আপনার জন্য নির্দিষ্ট রিকোয়ারমেন্টস নিয়ে গাইড করবেন।`
      : `Our Visa & PRO team handles:\n- Investor visas and work permit processing\n- Iqama issuance, renewal, and employee support\n- Qiwa and Muqeem portal services\n- Chamber of Commerce services and document attestation\n- Employee file setup and onboarding\n\nContact us via WhatsApp or email and an advisor will guide you through the exact requirements for your case.`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['ইনভেস্টর ভিসা তথ্য', 'হোয়াটসঅ্যাপে মেসেজ', 'ফ্রি কনসালটেন্সি বুকিং']
        : ['Investor Visa Details', 'Chat on WhatsApp', 'Book Free Consultation'],
      stageExecuted: 'STAGE_3_KEYWORD_FALLBACK'
    };
  }

  // 4. Real Estate keywords (property, real estate, buy, lease, invest in land)
  if (/\b(property|properties|real\s*estate|buy|lease|leasing|invest\s*in\s*land|land|apartment|villa|office\s*space|commercial\s*property)\b/i.test(lower) ||
      ['প্রপার্টি', 'রিয়েল এস্টেট', 'জমি', 'ফ্ল্যাট', 'অফিস স্পেস'].some(k => lower.includes(k))) {
    const reply = userLang === 'bn'
      ? `**ট্রেক কনসালটেন্সি সৌদি আরবে বিদেশি রিয়েল এস্টেট বিনিয়োগে সহায়তা করে:**\n- **প্রপার্টি ক্রয় ও লিজ সহায়তা**\n- **বাণিজ্যিক, আবাসিক এবং শিল্প প্রপার্টি**\n- **বিদেশি বিনিয়োগকারী গাইডেন্স ও প্রপার্টি ডকুমেন্টেশন**\n- **রিয়েল এস্টেট বিনিয়োগ পরামর্শ**\n\nবর্তমান সৌদি নিয়মানুযায়ী বিদেশি বিনিয়োগকারীরা এখন অনুমোদিত রিয়েল এস্টেট প্রকল্পে বিনিয়োগ করতে পারেন। আপনার পরিস্থিতির জন্য নির্দিষ্ট নির্দেশনার জন্য একটি ফ্রি কনসালটেন্সি বুক করুন।`
      : `Trek Consultancy supports foreign real estate investment in Saudi Arabia:\n- Property buying and leasing support\n- Commercial, residential, and industrial property\n- Foreign investor guidance and property documentation\n- Real estate investment consultation\n\nForeign investors can now invest in approved real estate projects under current Saudi regulations. For guidance specific to your situation, book a free consultation.`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['অফিস স্পেস সহায়তা', 'সৌদি রিয়েল এস্টেট গাইড', 'ফ্রি কনসালটেন্সি বুকিং']
        : ['Office Space Assistance', 'Real Estate Guide', 'Book Free Consultation'],
      stageExecuted: 'STAGE_3_KEYWORD_FALLBACK'
    };
  }

  // 5. Business Support keywords (accounting, audit, payroll, hr, vat, tax)
  if (/\b(accounting|audit|payroll|hr|vat|tax|taxes|bookkeeping|compliance)\b/i.test(lower) ||
      ['হিসাব', 'ট্যাক্স', 'ভ্যাট', 'অডিট', 'পে-রোল'].some(k => lower.includes(k))) {
    const reply = userLang === 'bn'
      ? `**আমরা সৌদি আরবে চলমান ব্যবসায়িক সহায়তা সেবা প্রদান করি:**\n- **অ্যাকাউন্টিং, এক্সটার্নাল এবং ইন্টারনাল অডিট**\n- **এইচআর ও পে-রোল ম্যানেজমেন্ট**\n- **ভ্যাট ফাইলিং এবং ট্যাক্স কমপ্লায়েন্স**\n\nআপনার কোম্পানির নির্দিষ্ট অ্যাকাউন্টিং বা কমপ্লায়েন্সের প্রয়োজনীয়তা নিয়ে আলোচনা করতে যোগাযোগ করুন।`
      : `We provide ongoing business support services in Saudi Arabia:\n- Accounting, external and internal audit\n- HR & payroll management\n- VAT filing and tax compliance\n\nReach out to discuss your company's specific accounting or compliance needs.`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['ট্যাক্স ও ভ্যাট কমপ্লায়েন্স', 'অ্যাকাউন্টিং সার্ভিস', 'হোয়াটসঅ্যাপে যোগাযোগ']
        : ['Tax & VAT Compliance', 'Accounting Services', 'Chat on WhatsApp'],
      stageExecuted: 'STAGE_3_KEYWORD_FALLBACK'
    };
  }

  // 6. International Services keywords (usa company, uk company, canada, amazon, ebay, dropship, import, export, china sourcing)
  if (/\b(usa\s*company|usa\s*llc|uk\s*company|uk\s*ltd|canada|amazon|ebay|dropship|dropshipping|import|export|china\s*sourcing|delaware|wyoming|montana)\b/i.test(lower) ||
      ['আমেরিকা কোম্পানি', 'ইউকে কোম্পানি', 'অ্যামাজন সেলার', 'ড্রপশিপিং', 'চায়না সোর্সিং'].some(k => lower.includes(k))) {
    const reply = userLang === 'bn'
      ? `**সৌদি আরবের বাইরেও ট্রেক কনসালটেন্সি সহায়তা করে:**\n- **USA, UK এবং Canada কোম্পানি গঠন**\n- **আন্তর্জাতিক বিজনেস ব্যাংক অ্যাকাউন্ট সেটআপ**\n- **Amazon এবং eBay সেলার অ্যাকাউন্ট লঞ্চ**\n- **ড্রপশিপিং, আমদানি/রপ্তানি এবং চায়না প্রোডাক্ট সোর্সিং সাপোর্ট**`
      : `Beyond Saudi Arabia, Trek Consultancy also supports:\n- USA, UK, and Canada company formation\n- International business bank account setup\n- Amazon and eBay seller account launch\n- Dropshipping, import/export, and China product sourcing support`;

    return {
      reply,
      source: 'RAG',
      suggestedActions: userLang === 'bn'
        ? ['USA LLC গঠন', 'গ্লোবাল বিজনেস ব্যাংকিং', 'হোয়াটসঅ্যাপে যোগাযোগ']
        : ['USA LLC Formation', 'Global Banking Setup', 'Chat on WhatsApp'],
      stageExecuted: 'STAGE_3_KEYWORD_FALLBACK'
    };
  }

  return null;
}

// ============================================================
// STAGE 4: HUMAN TICKET FALLBACK (Guaranteed 48-Hour SLA Promise)
// ============================================================

export async function createHumanTicketFallback(
  cleanMsg: string,
  userLang: 'en' | 'bn',
  cleanEmail: string | null,
  cleanUserId: string | null,
  cleanSession: string,
  settings: PipelineSettings,
  createTicketFn: (ticketData: any) => Promise<any>
): Promise<PipelineResult> {
  const autoTicket = await createTicketFn({
    userEmail: cleanEmail || undefined,
    userId: cleanUserId || undefined,
    subject: cleanMsg.slice(0, 60),
    question: cleanMsg,
    priority: cleanMsg.toLowerCase().includes('urgent') || cleanMsg.toLowerCase().includes('critical') ? 'High' : 'Normal',
    sessionId: cleanSession,
    source: 'AI_Auto'
  });

  const reply = userLang === 'bn'
    ? `যেহেতু আপনার এই নির্দিষ্ট অনুসন্ধানের জন্য একজন অভিজ্ঞ কনসালটেন্টের সরাসরি মূল্যায়ন বা কাস্টম প্রস্তাবনা প্রয়োজন, তাই আমি তাৎক্ষণিকভাবে একটি অফিশিয়াল সাপোর্ট টিকিট তৈরি করেছি: **#${autoTicket.ticketNumber}**।\n\nট্রেক কনসালটেন্সির একজন সিনিয়র অ্যাডভাইজর আগামী **৪৮ ঘণ্টার মধ্যে** আপনার রিকোয়ারমেন্ট পর্যালোচনা করে যোগাযোগ করবেন।\n\nজরুরি প্রয়োজনে সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন:\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **সরাসরি ফোন**: ${settings.phone}\n- ✉️ **ইমেইল**: ${settings.supportEmail}\n- অথবা একটি ফ্রি কনসালটেন্সি বুকিং করুন।`
    : `Because your inquiry requires case-specific evaluation or custom review, I have automatically registered an official consultation ticket on your behalf: **#${autoTicket.ticketNumber}**.\n\nA Trek Consultancy senior advisor will review your requirements and follow up within **48 hours**.\n\nYou can also connect directly with our advisory team:\n- 📱 **WhatsApp**: [${settings.whatsapp}](https://wa.me/966502411744)\n- 📞 **Direct Call**: ${settings.phone}\n- ✉️ **Email**: ${settings.supportEmail}\n- Or book a free 30-minute consultation.`;

  return {
    reply,
    source: 'AI_AUTO_TICKET',
    suggestedActions: ['Track in My Tickets', 'Contact on WhatsApp', 'Book Free Consultation'],
    autoTicket,
    createdTicket: autoTicket,
    stageExecuted: 'STAGE_4_HUMAN_TICKET'
  };
}
