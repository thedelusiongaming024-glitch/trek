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
  activeAiModel?: string;
  aiProvider?: 'auto' | 'gemini' | 'openai';
  aiTemperature?: number;
}

/** Builds a wa.me deep link from whatever format the admin saved the WhatsApp number in. */
export function buildWhatsAppLink(whatsapp: string): string {
  const digits = (whatsapp || '').replace(/[^\d]/g, '');
  return `https://wa.me/${digits || '966502411744'}`;
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
      ? `সবচেয়ে দ্রুত হলো হোয়াটসঅ্যাপ — [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})। চাইলে সরাসরি কল করতে পারেন ${settings.phone} নম্বরে, বা ইমেইল করুন ${settings.supportEmail}-এ। আমাদের ফিজিক্যাল অফিস আছে রিয়াদ ও মদিনায় (জেদ্দায় শীঘ্রই চালু হচ্ছে), আর মন্টানা (USA) ও ঢাকাতেও।\n\nকথা বলে বিস্তারিত জানতে চাইলে একটা ফ্রি ৩০ মিনিটের কল বুক করে নিন — আমরা ${settings.slaHours} ঘণ্টার মধ্যে যোগাযোগ করব।`
      : `Quickest way to reach us is WhatsApp — [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)}). You can also call ${settings.phone} directly or email ${settings.supportEmail}. We've got physical offices in Riyadh and Madinah (Jeddah opening soon), plus Montana (USA) and Dhaka.\n\nIf you'd rather talk it through, book a free 30-minute call and someone will get back to you within ${settings.slaHours} hours.`;

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
      ? `আমরা মূলত এই ছয়টা জায়গায় সাহায্য করি:\n\n1. 🇸🇦 **সৌদি বিজনেস সেটআপ** — MISA লাইসেন্স (১০০% বিদেশি মালিকানা), কমার্শিয়াল রেজিস্ট্রেশন (CR), কর্পোরেট ব্যাংক অ্যাকাউন্ট, ZATCA ও GOSI রেজিস্ট্রেশন।\n2. 💻 **সফটওয়্যার ও ডিজিটাল** — কাস্টম ERP, ওয়েব/মোবাইল অ্যাপ, AI অটোমেশন, SEO।\n3. 📋 **ভিসা ও প্রো (PRO)** — ইনভেস্টর ভিসা, ওয়ার্ক পারমিট, ইকামাহ, কিওয়া ও মুকিম।\n4. 🏢 **রিয়েল এস্টেট** — বাণিজ্যিক অফিস স্পেস লিজ ও প্রপার্টি ক্রয়ে সহায়তা।\n5. 📊 **হিসাব ও ট্যাক্স** — ZATCA ভ্যাট, অডিট, পে-রোল।\n6. 🌐 **আন্তর্জাতিক কোম্পানি গঠন** — USA LLC, UK Ltd, গ্লোবাল ব্যাংকিং।\n\nকোনটা নিয়ে বিস্তারিত জানতে চান?`
      : `Here's what we help with, broadly:\n\n1. 🇸🇦 **Saudi Business Setup** — MISA license (100% foreign ownership), Commercial Registration (CR), corporate bank accounts, ZATCA & GOSI registration.\n2. 💻 **Software & Digital** — custom ERP, web/mobile apps, AI automation, SEO.\n3. 📋 **Visa & PRO** — investor visas, work permits, Iqama, Qiwa & Muqeem.\n4. 🏢 **Real Estate** — office leasing and property purchase guidance.\n5. 📊 **Accounting & Tax** — ZATCA VAT, audits, payroll.\n6. 🌐 **International Formation** — USA LLCs, UK Ltd, global banking.\n\nWhich one's relevant to you?`;

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
      ? `হ্যাঁ, আমাদের নিজস্ব সফটওয়্যার টিম আছে। কাস্টম ERP, রিয়েক্ট/নোড-জেএস ওয়েব অ্যাপ, আইওএস/অ্যান্ড্রয়েড মোবাইল অ্যাপ, এআই অটোমেশন — এসবই ইন-হাউসে বানাই। আপনার প্রজেক্টটা নিয়ে একটু কথা বলতে চাইলে একটা ফ্রি টেকনিক্যাল কনসালটেশন বুক করতে পারেন।`
      : `Yes — we build that in-house. Custom ERPs, React/Node.js web apps, iOS/Android mobile apps, AI automation, all done by our own team rather than outsourced. Happy to set up a quick technical call if you want to talk through what you need.`;
    return {
      reply,
      source: 'FAQ',
      suggestedActions: ['Software & ERP Solutions', 'Schedule Tech Consultation', 'Book Free Consultation'],
      stageExecuted: 'STAGE_1_DIRECT_KB'
    };
  }

  if (/\bdoes\s+trek\s+(do|handle|provide|offer)\s+(accounting|tax|vat|zatca|audit)\b/i.test(lower)) {
    const reply = userLang === 'bn'
      ? `হ্যাঁ, আমরা পূর্ণাঙ্গ ট্যাক্স ও অ্যাকাউন্টিং সাপোর্ট দিই — ZATCA ই-ইনভয়েসিং ও ভ্যাট কমপ্লায়েন্স, ট্যাক্স রিটার্ন, ইন্টারনাল/এক্সটার্নাল অডিট, পে-রোল ম্যানেজমেন্ট। কোনো নির্দিষ্ট চাহিদা থাকলে বলুন, বিস্তারিত জানাচ্ছি।`
      : `Yes — full tax and accounting support: ZATCA e-invoicing & VAT compliance, corporate tax filing, internal/external audits, and payroll. Tell me more about what you need and I can point you in the right direction.`;
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
      ? `সংক্ষেপে বললে:\n\n1. **বাণিজ্যিক প্রপার্টি**: MISA লাইসেন্সধারী যেকোনো বিদেশি কোম্পানি নিজের অফিস, কারখানা বা গুদামের জন্য সৌদি আরবে জমি ও ভবন কিনতে পারে।\n2. **আবাসিক প্রপার্টি**: প্রিমিয়াম রেসিডেন্সি থাকলে বিদেশি নাগরিকরা নির্দিষ্ট এলাকায় বাড়ি/ফ্ল্যাট সরাসরি কিনতে পারেন।\n3. **অফিস লিজ**: আমরা MISA ও Balady বিধিমালার সাথে মিলিয়ে অফিস স্পেস খুঁজে দিতে সাহায্য করি।`
      : `Short version:\n\n1. **Commercial property** — any 100% foreign-owned company with a valid MISA license can buy land or buildings for its own operations (office, factory, warehouse).\n2. **Residential property** — foreign nationals with Premium Residency can directly own homes/apartments in designated areas.\n3. **Office leasing** — we help clients find and secure office space compliant with MISA and Balady rules.`;

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
      ? `ডকুমেন্ট রেডি থাকলে পুরো সেটআপ সাধারণত **২-৪ সপ্তাহ** লাগে:\n1. MISA লাইসেন্স — ৩-৫ কর্মদিবস\n2. CR ও AOA — ২-৪ কর্মদিবস\n3. চেম্বার অব কমার্স ও ন্যাশনাল অ্যাড্রেস — ২-৩ কর্মদিবস\n4. ZATCA/GOSI/Qiwa/Muqeem অ্যাক্টিভেশন — ২-৩ কর্মদিবস\n5. ব্যাংক অ্যাকাউন্ট অ্যাক্টিভেশন — ৫-১০ কর্মদিবস\n\nএগুলো একে অপরের সাথে কিছুটা ওভারল্যাপ করে চলতে পারে, তাই আমরা যতটা সম্ভব সমান্তরালে এগিয়ে রাখার চেষ্টা করি।`
      : `With documents ready, the full setup usually takes **2-4 weeks**:\n1. MISA license — 3-5 business days\n2. CR & AOA — 2-4 business days\n3. Chamber of Commerce & National Address — 2-3 business days\n4. ZATCA/GOSI/Qiwa/Muqeem activation — 2-3 business days\n5. Bank account activation — 5-10 business days\n\nSome of these can run in parallel, so we try to keep things moving on multiple fronts at once rather than strictly one after another.`;

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
      ? `একটা বিদেশি ব্রাঞ্চ বা সাবসিডিয়ারি খুলতে সাধারণত এগুলো লাগে:\n1. প্যারেন্ট কোম্পানির CR বা ইনকর্পোরেশন সার্টিফিকেট\n2. গত ১-২ বছরের অডিটেড ফাইন্যান্সিয়াল স্টেটমেন্ট\n3. বোর্ড রেজোলিউশন (সৌদি ব্রাঞ্চ খোলা ও GM নিয়োগের অনুমোদন)\n4. আমাদের নামে পাওয়ার অফ অ্যাটর্নি (POA)\n5. প্রস্তাবিত GM-এর পাসপোর্ট কপি\n\nএকটা কথা মনে রাখবেন — সব করপোরেট ডকুমেন্ট নিজ দেশের সৌদি দূতাবাস থেকে Attested বা Apostilled করাতে হবে।`
      : `To set up a foreign branch or subsidiary, you'll typically need:\n1. Parent company's CR or Certificate of Incorporation\n2. Audited financial statements for the past 1-2 years\n3. A board resolution approving the Saudi branch and appointing the GM\n4. Power of Attorney (POA) in our name\n5. Passport copy of the proposed GM\n\nOne thing worth flagging early: all corporate documents need to be attested by the Saudi Embassy in your country, or apostilled.`;

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
      ? `সহজ কথায়, MISA লাইসেন্স থাকলে বিদেশি বিনিয়োগকারীরা কোনো স্থানীয় স্পন্সর (Kafil) ছাড়াই ১০০% মালিকানায় কোম্পানি চালাতে পারেন।\n\nযে খাতগুলোতে এটা অনুমোদিত: সার্ভিসেস, আইটি/সফটওয়্যার, ট্রেডিং, ম্যানুফ্যাকচারিং, কনসাল্টিং, রিয়েল এস্টেট। মূল সুবিধা হলো পুরো ক্যাপিটাল ও প্রফিট ফেরত নেওয়ার অধিকার, প্রপার্টি কেনার সুযোগ, এবং ইনভেস্টর রেসিডেন্সি (Iqama)।\n\nআমরা শুরু থেকে শেষ পর্যন্ত পুরো লাইসেন্সিং প্রসেসটা সামলে দিই।`
      : `In plain terms — with a MISA license, foreign investors can own 100% of their company with no local Saudi sponsor required.\n\nEligible sectors include services, IT/software, trading, manufacturing, consulting, and real estate. Core benefits: full repatriation of capital and profits, the right to own property, and eligibility for Investor Residency (Iqama).\n\nWe handle the whole submission and licensing process from start to finish.`;

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
      ? `কিছু বাস্তব কারণ:\n\n- আমাদের নিজস্ব অফিস আছে রিয়াদ, মদিনা, মন্টানা (USA) এবং ঢাকায় — শুধু কাগজে-কলমে না, সত্যিকারের উপস্থিতি।\n- লিগ্যাল লাইসেন্সিং, ট্যাক্স, সফটওয়্যার ডেভেলপমেন্ট, ভিসা/প্রো — সবকিছু একই টিম সামলায়, তাই জিনিসপত্র হাতবদল হয়ে হারিয়ে যায় না।\n- দ্বিভাষিক অ্যাডভাইজররা সরাসরি আপনার সাথে কাজ করেন, কোনো মিডলম্যান নেই।\n- ৪৮ ঘণ্টার মধ্যে রেসপন্স — এটা আমরা মেনে চলি, শুধু বলার জন্য বলি না।`
      : `A few honest reasons:\n\n- We actually have offices in Riyadh, Madinah, Montana (USA), and Dhaka — not just a mailing address.\n- Legal licensing, tax, software development, and visa/PRO all sit under one team, so nothing gets lost in handoffs between vendors.\n- Bilingual advisors work directly with you — no middleman.\n- The 48-hour response time is something we actually hold ourselves to, not just a line on the website.`;

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

const OPENAI_SUPPORT_JSON_SCHEMA = {
  name: 'support_chat_reply',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      classification: {
        type: 'string',
        description: 'One of: GREETING, IN_SCOPE_ANSWER, CLARIFYING_QUESTION, INSUFFICIENT_KNOWLEDGE, OFF_TOPIC'
      },
      reply: {
        type: 'string',
        description: "The assistant's markdown response. If escalation is required, start with 'INSUFFICIENT_KNOWLEDGE: [brief note]'."
      },
      ticketSubject: {
        type: 'string',
        description: 'Concise subject for the ticket if escalation is needed, else empty string'
      },
      ticketPriority: {
        type: 'string',
        description: 'Priority: Normal, High, or Urgent if escalation is needed'
      },
      suggestedActions: {
        type: 'array',
        items: { type: 'string' },
        description: '2 to 3 contextual follow-up prompts for the user'
      }
    },
    required: ['classification', 'reply', 'ticketSubject', 'ticketPriority', 'suggestedActions'],
    additionalProperties: false
  }
} as const;

async function callOpenAIGroundedLLM(
  modelName: string,
  systemInstruction: string,
  rawHistory: any[],
  cleanMsg: string
): Promise<{ classification: string; reply: string; ticketSubject?: string; ticketPriority?: string; suggestedActions?: string[] } | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const openAiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];

  for (const turn of rawHistory) {
    if (turn && typeof turn.text === 'string' && turn.text.trim()) {
      openAiMessages.push({
        role: turn.sender === 'user' ? 'user' : 'assistant',
        content: turn.text.trim()
      });
    }
  }
  openAiMessages.push({ role: 'user', content: cleanMsg });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: openAiMessages,
        response_format: { type: 'json_schema', json_schema: OPENAI_SUPPORT_JSON_SCHEMA },
        max_completion_tokens: 1200,
        temperature: 0.45
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[OpenAI GroundedLLM] ${modelName} returned status ${response.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data: any = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    return JSON.parse(rawContent);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[OpenAI GroundedLLM] ${modelName} call failed:`, err?.message || err);
    return null;
  }
}

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
  const preferredModel = (settings.activeAiModel || 'gemini-2.5-flash').trim();
  const explicitProvider = settings.aiProvider || 'auto';

  const isModelOpenAi =
    explicitProvider === 'openai' ||
    preferredModel.startsWith('gpt-') ||
    preferredModel.startsWith('o1-') ||
    preferredModel.startsWith('o3-') ||
    preferredModel.startsWith('chatgpt-');

  const systemInstruction = `You are Trek Consultancy's Official AI Business Setup & Growth Assistant, speaking on a support chat widget on trekconsultancy.com. Trek Consultancy helps foreign investors and companies establish and grow businesses in Saudi Arabia, with additional offices in the USA and Bangladesh.

============================================================
LIVE VERIFIED TREK CONSULTANCY KNOWLEDGE BASE & CONTEXT:
${ragContext}
============================================================

HOW TO ANSWER:
- Answer only from the knowledge base above and general, well-known facts about how Saudi business setup works. If the KB doesn't cover something, say so plainly rather than filling the gap — do not invent fees, processing days, or legal requirements.
- Numbers matter here: government fees, processing timelines, and eligibility rules genuinely vary by nationality, activity, capital, and entity type. State any number from the KB as an estimate ("typically", "as of our last update") and note that an advisor will confirm the exact figure for their case — never present a number as fixed unless the KB explicitly says it is fixed.
- Not knowing an exact number is not the same as not knowing the answer. If the KB covers the topic generally but lacks one specific figure (an exact fee, an exact day count), give the general answer plus the closest range or comparable figure you do have, and note what a human will confirm. Reserve escalation for when you genuinely have nothing useful to say, not for "I have 90% of this but not the exact number."
- If the question is ambiguous or missing a key detail you'd need to answer well (which country the client is from, which entity type, whether they already have a CR), ask ONE short clarifying question instead of escalating or dumping every possible scenario. A real advisor asks before guessing; so should you.
- When a question is regulatory, tax, or legal and you truly have nothing to go on, escalate rather than guess (see ESCALATION below). Guessing on immigration, licensing, or tax specifics can cost the client real money — do not do it.
- For multi-part or exploratory questions (e.g. "what do I need to start an e-commerce business targeting Saudi customers"), synthesize across the relevant KB sections into one coherent answer rather than answering only the first part.
- Use the conversation history: don't re-introduce yourself, re-list all six service pillars, or repeat what you already told the user earlier in the same chat. Build on what's already been said, the way a person continuing a conversation would.
- Reply in the same language the user wrote in (English or Bengali). Keep replies tight and scannable for a chat widget — short paragraphs or bullets, not walls of text. Only go long when the question genuinely has several parts.

TONE:
- Warm, direct, and competent — like a knowledgeable advisor texting back quickly, not a corporate brochure or a script. Skip filler ("We're delighted to inform you that...", "Thank you for reaching out to us regarding..."). Vary your openings — don't start every reply the same way.
- It's fine to show a little personality: a brief acknowledgement of what the person's trying to do, mild empathy if they sound stressed or in a hurry, a natural follow-up question. You're a helpful person on the other end of a chat, not a form letter.
- If greeted with an Islamic greeting ("Assalamu Alaikum", "Salam"), reply in kind ("Wa Alaikum Assalam") without assuming the user's religion beyond mirroring their own greeting.
- For plain greetings, "how are you", or "who are you": respond briefly and naturally, state what Trek does in a sentence, and invite the actual question. Don't create a ticket for these.

SCOPE — you only handle:
  • Saudi business setup (MISA license, 100% foreign ownership, CR, ZATCA, GOSI, Saudi National Address/SPL, corporate bank accounts, government portal activation, office space)
  • Software & digital solutions (custom software, ERP, websites, mobile apps, AI automation, SEO, digital marketing)
  • Visa & PRO services (investor visas, work permits, Iqama, Muqeem, Qiwa, chamber services, document attestation)
  • Real estate investment in Saudi Arabia
  • Business support services (accounting, audit, HR & payroll, tax & VAT)
  • International business services (USA/UK/Canada company formation, international banking, Amazon/eBay seller setup, dropshipping)
If a question falls outside this list, say plainly that you're focused on Trek's services and redirect — don't create a ticket for it.

CONTACT & NEXT STEPS:
- The live WhatsApp number and email are provided in the KB context above — always use those values, never a number you recall from elsewhere.
- Don't push WhatsApp or a consultation booking in every single reply; offer it when it's the natural next step (the user is ready to act, you're escalating, or they've asked how to reach a human) — not as a reflexive sign-off on every message.

ESCALATION (creates a real support ticket with a ${settings.slaHours}-hour SLA — this is for genuinely stuck cases, use it sparingly):
- Before reaching for it, ask yourself: "would a real advisor actually need to step in here, or could I just answer this?" Most questions — even detailed ones — can be answered from the KB plus reasonable general knowledge. Escalation is the exception, not the default response to uncertainty.
- Use it only when the inquiry is in-scope but genuinely needs something a chat reply can't provide: a bespoke price quote requiring case details, a legal/regulatory judgment call specific to the client's situation, contract or document review, or the client explicitly asking to speak with a named advisor.
- Never escalate just because one exact figure is missing, because the question is broad, or because a clarifying question would resolve it — ask the clarifying question or give your best grounded answer instead.
- When you do escalate, still answer whatever part of the question the KB *does* cover first, so the user gets real value immediately instead of only a ticket number. Then format that portion followed by 'INSUFFICIENT_KNOWLEDGE: [one concise line on what specifically needs advisor review]' — e.g. "INSUFFICIENT_KNOWLEDGE: Client needs a custom quotation for an industrial MISA license plus commercial office lease."`;

  // Helper to handle ticket creation when escalation is triggered
  const handleEscalationResult = async (parsedAi: { classification: string; reply: string; ticketSubject?: string; ticketPriority?: string; suggestedActions?: string[] }) => {
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
          ? `এই প্রশ্নটার জন্য একজন অ্যাডভাইজরের সরাসরি চোখ বুলানো দরকার, তাই একটা টিকিট খুলে দিলাম: **#${autoTicket.ticketNumber}**। ${settings.slaHours} ঘণ্টার মধ্যে একজন সিনিয়র অ্যাডভাইজর আপনার সাথে যোগাযোগ করবেন।\n\nদ্রুত দরকার হলে সরাসরি যোগাযোগ করুন:\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})\n- 📞 **ফোন**: ${settings.phone}\n- ✉️ **ইমেইল**: ${settings.supportEmail}`
          : `This one really needs a closer look from an advisor, so I've opened ticket **#${autoTicket.ticketNumber}** for you. A senior advisor will follow up within ${settings.slaHours} hours.\n\nIf it's urgent, reach us directly:\n- 📱 **WhatsApp**: [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})\n- 📞 **Phone**: ${settings.phone}\n- ✉️ **Email**: ${settings.supportEmail}`;
      } else {
        if (finalReply.includes('{{TICKET_NUMBER}}')) {
          finalReply = finalReply.replace(/\{\{TICKET_NUMBER\}\}/g, `#${autoTicket.ticketNumber}`);
        } else if (!finalReply.includes(autoTicket.ticketNumber)) {
          finalReply += `\n\n**Official Support Ticket Created**: #${autoTicket.ticketNumber} (Advisor response within ${settings.slaHours} hours)`;
        }
      }

      return {
        reply: finalReply,
        source: 'AI_AUTO_TICKET' as const,
        suggestedActions: ['Track in My Tickets', 'Contact on WhatsApp', 'Book Free Consultation'],
        autoTicket,
        createdTicket: autoTicket,
        stageExecuted: 'STAGE_4_HUMAN_TICKET' as const
      };
    }

    const suggested = Array.isArray(parsedAi.suggestedActions) && parsedAi.suggestedActions.length > 0
      ? parsedAi.suggestedActions.slice(0, 3)
      : ['Saudi Business Setup', 'Contact on WhatsApp', 'Book Free Consultation'];

    return {
      reply: parsedAi.reply,
      source: 'AI' as const,
      suggestedActions: suggested,
      stageExecuted: 'STAGE_2_GROUNDED_LLM' as const
    };
  };

  // Execution Path 1: If OpenAI is preferred or requested
  if (isModelOpenAi && process.env.OPENAI_API_KEY) {
    const openAiCandidates = Array.from(new Set([preferredModel, 'gpt-4.1-mini', 'gpt-4o', 'gpt-5-mini', 'gpt-4o-mini']));
    for (const modelName of openAiCandidates) {
      try {
        const parsed = await callOpenAIGroundedLLM(modelName, systemInstruction, rawHistory, cleanMsg);
        if (parsed && parsed.reply) {
          return await handleEscalationResult(parsed);
        }
      } catch (e) {
        console.warn(`[OpenAI GroundedLLM] Candidate ${modelName} failed:`, e);
      }
    }
  }

  // Execution Path 2: Google Gemini
  if (process.env.GEMINI_API_KEY) {
    const geminiCandidates = Array.from(new Set([
      isModelOpenAi ? 'gemini-2.5-flash' : preferredModel,
      'gemini-2.5-flash',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ]));

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

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

    for (const modelName of geminiCandidates) {
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
                    description: 'One of: GREETING, IN_SCOPE_ANSWER, CLARIFYING_QUESTION, INSUFFICIENT_KNOWLEDGE, OFF_TOPIC. Prefer IN_SCOPE_ANSWER or CLARIFYING_QUESTION over INSUFFICIENT_KNOWLEDGE whenever you can genuinely answer or a single follow-up question would let you answer.'
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
              temperature: 0.45,
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
                  ? `এই প্রশ্নটার জন্য একজন অ্যাডভাইজরের সরাসরি চোখ বুলানো দরকার, তাই একটা টিকিট খুলে দিলাম: **#${autoTicket.ticketNumber}**। ${settings.slaHours} ঘণ্টার মধ্যে একজন সিনিয়র অ্যাডভাইজর আপনার সাথে যোগাযোগ করবেন।\n\nদ্রুত দরকার হলে সরাসরি যোগাযোগ করুন:\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})\n- 📞 **ফোন**: ${settings.phone}\n- ✉️ **ইমেইল**: ${settings.supportEmail}`
                  : `This one really needs a closer look from an advisor, so I've opened ticket **#${autoTicket.ticketNumber}** for you. A senior advisor will follow up within ${settings.slaHours} hours.\n\nIf it's urgent, reach us directly:\n- 📱 **WhatsApp**: [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})\n- 📞 **Phone**: ${settings.phone}\n- ✉️ **Email**: ${settings.supportEmail}`,
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
            return await handleEscalationResult(parsedAi);
          }
        }
      } catch (err: any) {
        console.warn(`[Gemini GroundedLLM] ${modelName} failed:`, err?.message || err);
        continue;
      }
    }
  }

  // Execution Path 3: Fallback to OpenAI if Gemini failed or wasn't available
  if (!isModelOpenAi && process.env.OPENAI_API_KEY) {
    const openAiCandidates = ['gpt-4.1-mini', 'gpt-4o', 'gpt-5-mini', 'gpt-4o-mini'];
    for (const modelName of openAiCandidates) {
      try {
        const parsed = await callOpenAIGroundedLLM(modelName, systemInstruction, rawHistory, cleanMsg);
        if (parsed && parsed.reply) {
          return await handleEscalationResult(parsed);
        }
      } catch (e) {
        console.warn(`[OpenAI GroundedLLM Fallback] ${modelName} failed:`, e);
      }
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
      ? `আমরা সৌদি বিজনেস সেটআপের পুরো প্রসেসটাই সামলাই: MISA লাইসেন্সিং, কোম্পানি গঠন ও CR, ZATCA/GOSI রেজিস্ট্রেশন, ন্যাশনাল অ্যাড্রেস, ব্যাংক অ্যাকাউন্ট, এবং তারপর চলমান কমপ্লায়েন্স।\n\nআপনার ব্যবসার ধরন আর জাতীয়তার ওপর নির্ভর করে ধাপগুলো একটু আলাদা হতে পারে — একটা ফ্রি কনসালটেন্সি বুক করলে সেটআপ প্ল্যানটা নির্দিষ্ট করে দিতে পারব।`
      : `We handle the full Saudi business setup process: MISA licensing, company formation & CR, ZATCA/GOSI registration, national address, bank account setup, and then ongoing compliance.\n\nThe exact steps shift a bit depending on your business activity and nationality — book a free consultation and we can map out a plan specific to your case.`;

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
      ? `আমাদের সফটওয়্যার টিম মূলত এসব বানায়: কাস্টম সফটওয়্যার ও ERP, বিজনেস ওয়েবসাইট ও মোবাইল অ্যাপ (Android/iOS), AI অটোমেশন, আর SEO/ডিজিটাল মার্কেটিং।\n\nআপনার প্রজেক্টের জন্য একটা কোটেশন লাগবে? হোয়াটসঅ্যাপে (${settings.whatsapp}) মেসেজ দিন, নয়তো একটা ফ্রি কনসালটেশন বুক করুন — সরাসরি কথা বলে সবচেয়ে দ্রুত এগোনো যাবে।`
      : `Our software team mostly builds: custom software & ERP systems, business websites and mobile apps (Android/iOS), AI automation, and SEO/digital marketing on the side.\n\nWant a quote for your specific project? Message us on WhatsApp (${settings.whatsapp}) or book a free consultation — talking it through directly is usually the fastest way to scope it.`;

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
      ? `ভিসা ও প্রো (PRO) টিম এসব সামলায়: ইনভেস্টর ভিসা ও ওয়ার্ক পারমিট, ইকামাহ ইস্যু/রিনিউয়াল, কিওয়া ও মুকিম পোর্টাল, চেম্বার অব কমার্স সার্ভিস, ডকুমেন্ট অ্যাটেস্টেশন, আর এমপ্লয়ি অনবোর্ডিং।\n\nআপনার কেসটা একটু নির্দিষ্ট হলে হোয়াটসঅ্যাপ বা ইমেইলে জানান — একজন অ্যাডভাইজর ঠিক কী কী লাগবে সেটা বলে দেবেন।`
      : `Our Visa & PRO team covers: investor visas and work permits, Iqama issuance/renewal, Qiwa and Muqeem portal services, Chamber of Commerce services, document attestation, and employee onboarding.\n\nIf your case is fairly specific, message us on WhatsApp or email — an advisor can walk you through exactly what's needed.`;

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
      ? `আমরা বিদেশি রিয়েল এস্টেট বিনিয়োগে সাহায্য করি — প্রপার্টি কেনা ও লিজ, বাণিজ্যিক/আবাসিক/শিল্প প্রপার্টি, ডকুমেন্টেশন, সব মিলিয়ে।\n\nবর্তমান নিয়মে বিদেশি বিনিয়োগকারীরা অনুমোদিত প্রকল্পে বিনিয়োগ করতে পারেন — আপনার নির্দিষ্ট পরিস্থিতির জন্য একটা ফ্রি কনসালটেশন বুক করতে পারেন।`
      : `We help with foreign real estate investment — buying and leasing, commercial/residential/industrial property, and the paperwork that goes with it.\n\nForeign investors can invest in approved projects under current regulations. For guidance specific to your situation, book a free consultation.`;

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
      ? `আমরা চলমান বিজনেস সাপোর্ট দিই — অ্যাকাউন্টিং, ইন্টারনাল/এক্সটার্নাল অডিট, HR ও পে-রোল, ভ্যাট ফাইলিং ও ট্যাক্স কমপ্লায়েন্স।\n\nআপনার কোম্পানির নির্দিষ্ট চাহিদাটা জানালে সেই অনুযায়ী পরামর্শ দিতে পারি।`
      : `We provide ongoing business support — accounting, internal/external audits, HR & payroll, VAT filing, and tax compliance.\n\nLet me know what your company specifically needs and I can point you in the right direction.`;

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
      ? `সৌদি আরবের বাইরেও আমরা সাহায্য করি — USA/UK/Canada কোম্পানি গঠন, আন্তর্জাতিক ব্যাংক অ্যাকাউন্ট সেটআপ, Amazon/eBay সেলার অ্যাকাউন্ট, ড্রপশিপিং, আমদানি-রপ্তানি, এবং চায়না সোর্সিং।`
      : `Beyond Saudi Arabia, we also help with: USA/UK/Canada company formation, international bank account setup, Amazon/eBay seller accounts, dropshipping, import/export, and China sourcing.`;

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
    ? `এই একটা এমন কেস যেখানে একজন অভিজ্ঞ কনসালটেন্টের সরাসরি পর্যালোচনা দরকার, তাই একটা টিকিট খুলে দিলাম: **#${autoTicket.ticketNumber}**। একজন সিনিয়র অ্যাডভাইজর ${settings.slaHours} ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবেন।\n\nদ্রুত দরকার হলে সরাসরি যোগাযোগ করতে পারেন:\n- 📱 **হোয়াটসঅ্যাপ**: [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})\n- 📞 **ফোন**: ${settings.phone}\n- ✉️ **ইমেইল**: ${settings.supportEmail}\n- অথবা একটা ফ্রি কনসালটেশন বুক করতে পারেন।`
    : `This is the kind of thing that really needs a consultant's direct review, so I've opened ticket **#${autoTicket.ticketNumber}** for you. A senior advisor will reach out within ${settings.slaHours} hours.\n\nIf you need something faster, reach us directly:\n- 📱 **WhatsApp**: [${settings.whatsapp}](${buildWhatsAppLink(settings.whatsapp)})\n- 📞 **Phone**: ${settings.phone}\n- ✉️ **Email**: ${settings.supportEmail}\n- Or book a free consultation.`;

  return {
    reply,
    source: 'AI_AUTO_TICKET',
    suggestedActions: ['Track in My Tickets', 'Contact on WhatsApp', 'Book Free Consultation'],
    autoTicket,
    createdTicket: autoTicket,
    stageExecuted: 'STAGE_4_HUMAN_TICKET'
  };
}
