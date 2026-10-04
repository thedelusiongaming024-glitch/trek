import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

export interface LanguageContextType {
  language: Language;
  isBn: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, bnText?: string) => string;
  formatNumber: (num: number | string) => string;
  formatTimeAgo: (timeStr: string) => string;
  translateCategory: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Centralized dictionary for every element across the Trek Consultancy Platform
const dictionary: Record<string, { en: string; bn: string }> = {
  // Navigation & Header
  "Home": { en: "Home", bn: "হোম" },
  "About Us": { en: "About Us", bn: "আমাদের সম্পর্কে" },
  "Services": { en: "Services", bn: "সেবাসমূহ" },
  "Portfolio": { en: "Portfolio", bn: "পোর্টফোলিও" },
  "Packages": { en: "Packages", bn: "প্যাকেজসমূহ" },
  "Contact": { en: "Contact", bn: "যোগাযোগ" },
  "Admin": { en: "Admin", bn: "অ্যাডমিন" },
  "Admin Portal": { en: "Admin Portal", bn: "অ্যাডমিন পোর্টাল" },
  "Discussions": { en: "Discussions", bn: "আলোচনা" },
  "Forum": { en: "Forum", bn: "ফোরাম" },
  "Sign In": { en: "Sign In", bn: "সাইন ইন" },
  "Sign Out": { en: "Sign Out", bn: "লগআউট" },
  "Post a Question": { en: "Post a Question", bn: "প্রশ্ন তৈরি করুন" },
  "Ask Question": { en: "Ask Question", bn: "প্রশ্ন করুন" },
  "Login or Register": { en: "Login or Register", bn: "লগইন বা নিবন্ধন" },

  // Hero Section
  "Welcome to Trek Consultancy Forum": { 
    en: "Welcome to Trek Consultancy Forum", 
    bn: "ট্রেক কনসালটেন্সি ফোরামে স্বাগতম" 
  },
  "The official community forum and support portal for Trek Consultancy": {
    en: "The official community forum and support portal for Trek Consultancy",
    bn: "ট্রেক কনসালটেন্সির অফিসিয়াল কমিউনিটি ফোরাম ও সাপোর্ট পোর্টাল"
  },
  "Search for Topics, Solutions, & Guides....": {
    en: "Search for Topics, Solutions, & Guides....",
    bn: "টপিক, সমাধান ও গাইড খুঁজুন...."
  },
  "Trending:": { en: "Trending:", bn: "জনপ্রিয়:" },
  "Cloud Architecture": { en: "Cloud Architecture", bn: "ক্লাউড আর্কিটেকচার" },
  "React & Vite": { en: "React & Vite", bn: "রিঅ্যাক্ট ও ভিট" },
  "DevOps & CI/CD": { en: "DevOps & CI/CD", bn: "ডেভঅপস ও সিআই/সিডি" },
  "Database Scaling": { en: "Database Scaling", bn: "ডাটাবেজ স্কেলিং" },
  "Microservices": { en: "Microservices", bn: "মাইক্রোসার্ভিসেস" },
  "Enterprise Security": { en: "Enterprise Security", bn: "এন্টারপ্রাইজ সিকিউরিটি" },
  "Enterprise Architecture & Cloud Systems": {
    en: "Enterprise Architecture & Cloud Systems",
    bn: "এন্টারপ্রাইজ আর্কিটেকচার ও ক্লাউড সিস্টেম"
  },
  "Global Technology Strategy & Community Advisory": {
    en: "Global Technology Strategy & Community Advisory",
    bn: "গ্লোবাল প্রযুক্তি কৌশল ও কমিউনিটি পরামর্শ"
  },
  "Performance Engineering & High-Traffic Optimization": {
    en: "Performance Engineering & High-Traffic Optimization",
    bn: "পারফরম্যান্স ইঞ্জিনিয়ারিং ও হাই-ট্রাফিক অপ্টিমাইজেশন"
  },
  "Trek Enterprise Advisory": { en: "Trek Enterprise Advisory", bn: "ট্রেক এন্টারপ্রাইজ অ্যাডভাইজরি" },
  "10,000+ Solutions Discussed": { en: "10,000+ Solutions Discussed", bn: "১০,০০০+ সমাধান আলোচিত" },
  "Verified Engineering Insights": { en: "Verified Engineering Insights", bn: "যাচাইকৃত ইঞ্জিনিয়ারিং অন্তর্দৃষ্টি" },

  // Forum Section & Tabs
  "Notable Forums": { en: "Notable Forums", bn: "জনপ্রিয় ফোরামসমূহ" },
  "Trek Consultancy Forum": { en: "Trek Consultancy Forum", bn: "ট্রেক কনসালটেন্সি ফোরাম" },
  "All": { en: "All", bn: "সকল" },
  "Popular": { en: "Popular", bn: "জনপ্রিয়" },
  "Featured": { en: "Featured", bn: "ফিচার্ড" },
  "Recent": { en: "Recent", bn: "সাম্প্রতিক" },
  "Unloved": { en: "Unloved", bn: "উত্তরহীন" },
  "Loved": { en: "Loved", bn: "সেরা পছন্দ" },
  "Showing results for": { en: "Showing results for", bn: "ফলাফল প্রদর্শন:" },
  "found": { en: "found", bn: "পাওয়া গেছে" },
  "No discussions found": { en: "No discussions found", bn: "কোনো আলোচনা পাওয়া যায়নি" },
  "No questions matched your search or selected filter. Try adjusting your keywords or start a new thread.": {
    en: "No questions matched your search or selected filter. Try adjusting your keywords or start a new thread.",
    bn: "আপনার সার্চ বা ফিল্টারের সাথে কোনো প্রশ্ন মেলেনি। কি-ওয়ার্ড পরিবর্তন করুন বা নতুন টপিক শুরু করুন।"
  },
  "Create Topic": { en: "Create Topic", bn: "টপিক তৈরি করুন" },

  // Forum Card & Metrics
  "You": { en: "You", bn: "আপনি" },
  "Views": { en: "Views", bn: "ভিউ" },
  "Likes": { en: "Likes", bn: "লাইক" },
  "Like": { en: "Like", bn: "লাইক" },
  "Replies": { en: "Replies", bn: "উত্তর" },
  "Delete your post": { en: "Delete your post", bn: "আপনার পোস্ট মুছুন" },
  "Delete post (Admin)": { en: "Delete post (Admin)", bn: "পোস্ট মুছুন (অ্যাডমিন)" },
  "Delete Your Post": { en: "Delete Your Post", bn: "পোস্ট মুছে ফেলুন" },
  "Delete Post": { en: "Delete Post", bn: "পোস্ট মুছুন" },

  // Forum Sidebar
  "Access our primary corporate platform for complete business solutions and architecture reviews.": {
    en: "Access our primary corporate platform for complete business solutions and architecture reviews.",
    bn: "পূর্ণাঙ্গ ব্যবসায়িক সমাধান ও আর্কিটেকচার পর্যালোচনার জন্য আমাদের কর্পোরেট প্ল্যাটফর্মে যান।"
  },
  "Visit Main Website": { en: "Visit Main Website", bn: "মূল ওয়েবসাইট দেখুন" },
  "Recent Topics": { en: "Recent Topics", bn: "সাম্প্রতিক টপিক" },
  "Recent Replies": { en: "Recent Replies", bn: "সাম্প্রতিক উত্তর" },
  "No recent topics yet": { en: "No recent topics yet", bn: "এখনো কোনো সাম্প্রতিক টপিক নেই" },
  "No recent replies yet": { en: "No recent replies yet", bn: "এখনো কোনো সাম্প্রতিক উত্তর নেই" },
  "by": { en: "by", bn: "দ্বারা" },

  // Callout Banner
  "New to Communities?": { en: "New to Communities?", bn: "কমিউনিটিতে নতুন?" },
  "Its members are ambitious local authorities and development corporations planning and delivering exemplary support frameworks, architectural solutions, and collaborative knowledge.": {
    en: "Its members are ambitious local authorities and development corporations planning and delivering exemplary support frameworks, architectural solutions, and collaborative knowledge.",
    bn: "আমাদের সদস্যরা উচ্চাকাঙ্ক্ষী প্রকৌশলী এবং বিশেষজ্ঞ দল, যারা যৌথ জ্ঞান, আর্কিটেকচারাল সমাধান এবং অনুকরণীয় সহায়তা প্রদান করে থাকেন।"
  },
  "Ask a Question": { en: "Ask a Question", bn: "প্রশ্ন জিজ্ঞাসা করুন" },

  // Blog Section
  "Trek Consultancy Insights": { en: "Trek Consultancy Insights", bn: "ট্রেক কনসালটেন্সি ইনসাইটস" },
  "Insights, architectural tutorials, and product documentation from our core engineering team.": {
    en: "Insights, architectural tutorials, and product documentation from our core engineering team.",
    bn: "আমাদের কোর ইঞ্জিনিয়ারিং দলের বিশ্লেষণ, প্রযুক্তিগত টিউটোরিয়াল এবং ডকুমেন্টেশন।"
  },
  "Login Required to Participate": { en: "Login Required to Participate", bn: "অংশগ্রহণের জন্য লগইন প্রয়োজন" },
  "Login to Read & React": { en: "Login to Read & React", bn: "পড়তে ও রিঅ্যাক্ট দিতে লগইন করুন" },
  "No blog articles published yet": { en: "No blog articles published yet", bn: "কোনো ব্লগ নিবন্ধ এখনো প্রকাশিত হয়নি" },
  "Articles published from the admin console will appear here.": {
    en: "Articles published from the admin console will appear here.",
    bn: "অ্যাডমিন কনসোল থেকে প্রকাশিত নিবন্ধ এখানে প্রদর্শিত হবে।"
  },
  "Show More": { en: "Show More", bn: "আরও দেখুন" },
  "All Articles Loaded": { en: "All Articles Loaded", bn: "সব নিবন্ধ দেখানো হয়েছে" },

  // Newsletter Section
  "Follow our newsletter": { en: "Follow our newsletter", bn: "আমাদের নিউজলেটার সাবস্ক্রাইব করুন" },
  "Get weekly updates on WordPress architectural blueprints, support guidelines, theme optimizations, and community answers delivered straight to your inbox.": {
    en: "Get weekly updates on WordPress architectural blueprints, support guidelines, theme optimizations, and community answers delivered straight to your inbox.",
    bn: "সরাসরি আপনার ইনবক্সে ক্লাউড আর্কিটেকচার, সাপোর্ট গাইডলাইন, থিম অপ্টিমাইজেশন এবং সাপ্তাহিক কমিউনিটি প্রশ্নোত্তর পেতে যুক্ত থাকুন।"
  },
  "Enter your email address": { en: "Enter your email address", bn: "আপনার ইমেইল এড্রেস লিখুন" },
  "Subscribe": { en: "Subscribe", bn: "সাবস্ক্রাইব করুন" },
  "Subscribing...": { en: "Subscribing...", bn: "যুক্ত করা হচ্ছে..." },
  "Subscribed!": { en: "Subscribed!", bn: "সাবস্ক্রাইব সম্পন্ন!" },
  "Logged in as": { en: "Logged in as", bn: "লগইন করেছেন" },

  // Footer
  "Your trusted partner for Saudi business setup, MISA licensing, software development, real estate investment, visa services, and international company formation. We help investors and businesses grow with end-to-end professional solutions.": {
    en: "Your trusted partner for Saudi business setup, MISA licensing, software development, real estate investment, visa services, and international company formation. We help investors and businesses grow with end-to-end professional solutions.",
    bn: "সৌদি আরবে ব্যবসা প্রতিষ্ঠা, ভিসা সার্ভিস, সফটওয়্যার ডেভেলপমেন্ট, রিয়েল এস্টেট ও আন্তর্জাতিক কোম্পানি গঠনের আপনার বিশ্বস্ত সহযোগী। এন্ড-টু-এন্ড সমাধান দিয়ে আমরা বিনিয়োগকারী ও ব্যবসার সম্প্রসারণে কাজ করি।"
  },
  "Privacy Policy": { en: "Privacy Policy", bn: "গোপনীয়তা নীতি" },
  "Terms of Service": { en: "Terms of Service", bn: "ব্যবহারের শর্তাবলী" },
  "Refund Policy": { en: "Refund Policy", bn: "রিফান্ড পলিসি" },
  "© 2023–2026 Trek Consultancy. All Rights Reserved.": {
    en: "© 2023–2026 Trek Consultancy. All Rights Reserved.",
    bn: "© ২০২৩–২০২৬ ট্রেক কনসালটেন্সি। সর্বস্বত্ব সংরক্ষিত।"
  },

  // Modals & Forms
  "Start a New Discussion": { en: "Start a New Discussion", bn: "নতুন আলোচনা শুরু করুন" },
  "Topic Title": { en: "Topic Title", bn: "টপিকের শিরোনাম" },
  "Category": { en: "Category", bn: "ক্যাটাগরি" },
  "Detailed Question or Description": { en: "Detailed Question or Description", bn: "বিস্তারিত প্রশ্ন বা বিবরণ" },
  "Your Display Name": { en: "Your Display Name", bn: "আপনার নাম" },
  "Publish Discussion": { en: "Publish Discussion", bn: "আলোচনা পোস্ট করুন" },
  "Cancel": { en: "Cancel", bn: "বাতিল" },
  "Close": { en: "Close", bn: "বন্ধ করুন" },
  "Leave a Reply": { en: "Leave a Reply", bn: "উত্তর লিখুন" },
  "Submit Reply": { en: "Submit Reply", bn: "উত্তর জমা দিন" },
  "Replies & Discussion": { en: "Replies & Discussion", bn: "উত্তর ও আলোচনা" },
  "No replies yet. Be the first to share an answer or solution!": {
    en: "No replies yet. Be the first to share an answer or solution!",
    bn: "এখনো কোনো উত্তর আসেনি। প্রথম উত্তরটি আপনিই লিখুন!"
  },
  "Enterprise Architecture & Consulting": {
    en: "Enterprise Architecture & Consulting",
    bn: "এন্টারপ্রাইজ আর্কিটেকচার ও কনসাল্টিং"
  },
  "Company / Organization": { en: "Company / Organization", bn: "কোম্পানি / প্রতিষ্ঠান" },
  "Work Email": { en: "Work Email", bn: "অফিসিয়াল ইমেইল" },
  "Project Scope": { en: "Project Scope", bn: "প্রজেক্টের বিবরণ" },
  "Request Consultation": { en: "Request Consultation", bn: "কনসাল্টেশন অনুরোধ করুন" },
  "Consultancy request received. Our senior architect will contact you within 24 hours.": {
    en: "Consultancy request received. Our senior architect will contact you within 24 hours.",
    bn: "কনসালটেন্সির অনুরোধ জমা হয়েছে। আমাদের সিনিয়র আর্কিটেক্ট ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবেন।"
  },
  "Comments & Discussion": { en: "Comments & Discussion", bn: "মন্তব্য ও আলোচনা" },
  "Write a comment or share your insights...": { en: "Write a comment or share your insights...", bn: "আপনার মন্তব্য বা মতামত লিখুন..." },
  "Post Comment": { en: "Post Comment", bn: "মন্তব্য প্রকাশ করুন" },
  "No comments yet. Be the first to share your thoughts!": {
    en: "No comments yet. Be the first to share your thoughts!",
    bn: "এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই লিখুন!"
  },
  "Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies.": {
    en: "Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies.",
    bn: "আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না এবং সমস্ত উত্তর স্থায়ীভাবে মুছে যাবে।"
  },

  // Support Assistant Header & Tabs
  "AI Support Hub": { en: "AI Support Hub", bn: "এআই সাপোর্ট হাব" },
  "Trek Support Assistant": { en: "Trek Support Assistant", bn: "ট্রেক সাপোর্ট সহকারী" },
  "24/7 AI & Help Center": { en: "24/7 AI & Help Center", bn: "২৪/৭ এআই ও হেল্প সেন্টার" },
  "AI Chat": { en: "AI Chat", bn: "এআই চ্যাট" },
  "FAQs & Knowledge": { en: "FAQs & Knowledge", bn: "প্রশ্নোত্তর ও নলেজ" },
  "Submit Ticket": { en: "Submit Ticket", bn: "টিকিট সাবমিট" },
  "My Tickets": { en: "My Tickets", bn: "আমার টিকিট" },
  "Online": { en: "Online", bn: "অনলাইন" },

  // Support Chat
  "Ask a question or describe your issue...": { en: "Ask a question or describe your issue...", bn: "আপনার প্রশ্ন বা সমস্যা লিখুন..." },
  "Type your message in English or বাংলা...": { en: "Type your message in English or বাংলা...", bn: "ইংরেজি বা বাংলায় আপনার বার্তা লিখুন..." },
  "Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?": {
    en: "Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?",
    bn: "হ্যালো! ট্রেক কনসালটেন্সি ফোরাম সাপোর্টে স্বাগতম। আমি আপনার এআই সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?"
  },
  "Clear Chat": { en: "Clear Chat", bn: "চ্যাট মুছুন" },
  "Frequently Asked Questions": { en: "Frequently Asked Questions", bn: "সচরাচর জিজ্ঞাস্য প্রশ্নাবলী (FAQ)" },
  "Search knowledge base & FAQs...": { en: "Search knowledge base & FAQs...", bn: "নলেজ বেস ও প্রশ্নোত্তর খুঁজুন..." },
  "All Categories": { en: "All Categories", bn: "সব ক্যাটাগরি" },
  "Community & Forum": { en: "Community & Forum", bn: "কমিউনিটি ও ফোরাম" },
  "Themes & bbPress": { en: "Themes & bbPress", bn: "থিম ও বিবিপ্রেস" },
  "Consultancy & Pricing": { en: "Consultancy & Pricing", bn: "কনসালটেন্সি ও প্যাকেজ" },
  "Technical & Database": { en: "Technical & Database", bn: "টেকনিক্যাল ও ডাটাবেজ" },
  "Ask AI About This": { en: "Ask AI About This", bn: "এআই-কে এ বিষয়ে জিজ্ঞাসা করুন" },
  "No matching articles or FAQs found.": { en: "No matching articles or FAQs found.", bn: "কোনো প্রাসঙ্গিক প্রশ্নোত্তর পাওয়া যায়নি।" },
  "Open a Support Ticket": { en: "Open a Support Ticket", bn: "নতুন সাপোর্ট টিকিট খুলুন" },
  "Your Email Address": { en: "Your Email Address", bn: "আপনার ইমেইল এড্রেস" },
  "Subject / Topic": { en: "Subject / Topic", bn: "বিষয় / টপিক" },
  "Priority Level": { en: "Priority Level", bn: "অগ্রাধিকার স্তর" },
  "Normal": { en: "Normal", bn: "সাধারণ" },
  "Urgent": { en: "Urgent", bn: "জরুরি" },
  "Critical": { en: "Critical", bn: "অতীব জরুরি" },
  "Detailed Question / Request": { en: "Detailed Question / Request", bn: "বিস্তারিত প্রশ্ন বা অনুরোধ" },
  "Submit Support Ticket": { en: "Submit Support Ticket", bn: "সাপোর্ট টিকিট জমা দিন" },
  "Submitting Ticket...": { en: "Submitting Ticket...", bn: "টিকিট জমা দেওয়া হচ্ছে..." },
  "Ticket created successfully!": { en: "Ticket created successfully!", bn: "টিকিট সফলভাবে তৈরি হয়েছে!" },
  "Your Active Support Tickets": { en: "Your Active Support Tickets", bn: "আপনার সক্রিয় সাপোর্ট টিকিটসমূহ" },
  "No support tickets opened yet.": { en: "No support tickets opened yet.", bn: "এখনো কোনো সাপোর্ট টিকিট খোলা হয়নি।" },
  "Status": { en: "Status", bn: "অবস্থা" },
  "OPEN": { en: "OPEN", bn: "উন্মুক্ত (ওপেন)" },
  "IN_PROGRESS": { en: "IN_PROGRESS", bn: "প্রক্রিয়াধীন" },
  "ANSWERED": { en: "ANSWERED", bn: "উত্তর দেওয়া হয়েছে" },
  "CLOSED": { en: "CLOSED", bn: "সম্পন্ন" },
  "AI Answer": { en: "AI Answer", bn: "এআই উত্তর" },
  "Knowledge Base": { en: "Knowledge Base", bn: "নলেজ বেস" },
  "FAQ Match": { en: "FAQ Match", bn: "সরাসরি FAQ" },
  "Support Specialist": { en: "Support Specialist", bn: "সাপোর্ট স্পেশালিস্ট" }
};

// Category translations
const categoryMap: Record<string, string> = {
  'Docly Theme Support': 'ডকলি থিম সাপোর্ট',
  'Most requested features of 2020': 'জনপ্রিয় ফিচারসমূহ',
  'Latest Product Support': 'সর্বশেষ প্রোডাক্ট সাপোর্ট',
  'About bbPress Plugin & Features': 'বিবিপ্রেস প্লাগইন ও ফিচার',
  'Feedback Suggestions': 'মতামত ও পরামর্শ',
  'Project flow diagram': 'প্রজেক্ট ফ্লো ডায়াগ্রাম',
  'General Discussion': 'সাধারণ আলোচনা',
  'Cloud Architecture': 'ক্লাউড আর্কিটেকচার',
  'Community & Forum': 'কমিউনিটি ও ফোরাম',
  'Themes & bbPress': 'থিম ও বিবিপ্রেস',
  'Consultancy & Pricing': 'কনসালটেন্সি ও প্যাকেজ',
  'Technical & Database': 'টেকনিক্যাল ও ডাটাবেজ'
};

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('trek_language') || localStorage.getItem('ama_language');
      return (saved === 'bn' ? 'bn' : 'en') as Language;
    } catch {
      return 'en';
    }
  });

  const isBn = language === 'bn';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('trek_language', lang);
    } catch (e) {
      console.warn('Storage write failed for language:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  // Sync document element attributes & styles with selected language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      if (language === 'bn') {
        document.documentElement.classList.add('lang-bn');
      } else {
        document.documentElement.classList.remove('lang-bn');
      }
    }
  }, [language]);

  const t = (key: string, bnText?: string): string => {
    if (language === 'en') {
      return key;
    }

    if (dictionary[key]) {
      return dictionary[key].bn;
    }

    if (bnText) {
      return bnText;
    }

    return key;
  };

  // Number translation into Bengali numerals
  const formatNumber = (num: number | string): string => {
    if (language === 'en') return String(num);
    return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
  };

  // Relative time translation
  const formatTimeAgo = (timeStr: string): string => {
    if (language === 'en' || !timeStr) return timeStr;
    const lower = timeStr.toLowerCase().trim();

    if (lower === 'just now') return 'এইমাত্র';
    if (lower === 'yesterday') return 'গতকাল';
    if (lower.includes('min') && lower.includes('ago')) {
      const num = timeStr.match(/\d+/)?.[0] || '১';
      return `${formatNumber(num)} মিনিট আগে`;
    }
    if (lower.includes('hour') && lower.includes('ago')) {
      const num = timeStr.match(/\d+/)?.[0] || '১';
      return `${formatNumber(num)} ঘণ্টা আগে`;
    }
    if (lower.includes('day') && lower.includes('ago')) {
      const num = timeStr.match(/\d+/)?.[0] || '১';
      return `${formatNumber(num)} দিন আগে`;
    }
    if (lower.includes('week') && lower.includes('ago')) {
      const num = timeStr.match(/\d+/)?.[0] || '১';
      return `${formatNumber(num)} সপ্তাহ আগে`;
    }
    if (lower.includes('month') && lower.includes('ago')) {
      const num = timeStr.match(/\d+/)?.[0] || '১';
      return `${formatNumber(num)} মাস আগে`;
    }
    return timeStr;
  };

  // Category name translation
  const translateCategory = (cat: string): string => {
    if (language === 'en' || !cat) return cat;
    return categoryMap[cat] || cat;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      isBn,
      setLanguage,
      toggleLanguage,
      t,
      formatNumber,
      formatTimeAgo,
      translateCategory
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
