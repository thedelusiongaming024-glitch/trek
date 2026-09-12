import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, bnText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Centralized dictionary for visual labels and support center
const dictionary: Record<string, { en: string; bn: string }> = {
  // Navigation & General
  "Home": { en: "Home", bn: "হোম" },
  "About Us": { en: "About Us", bn: "আমাদের সম্পর্কে" },
  "Services": { en: "Services", bn: "সেবাসমূহ" },
  "Portfolio": { en: "Portfolio", bn: "পোর্টফোলিও" },
  "Packages": { en: "Packages", bn: "প্যাকেজসমূহ" },
  "Contact": { en: "Contact", bn: "যোগাযোগ" },
  "Admin": { en: "Admin", bn: "অ্যাডমিন" },
  "Discussions": { en: "Discussions", bn: "আলোচনা" },
  "Forum": { en: "Forum", bn: "ফোরাম" },

  // Support Assistant Header & Tabs
  "AI Support Hub": { en: "AI Support Hub", bn: "এআই সাপোর্ট হাব" },
  "Ama Support Assistant": { en: "Ama Support Assistant", bn: "আমা সাপোর্ট সহকারী" },
  "24/7 AI & Help Center": { en: "24/7 AI & Help Center", bn: "২৪/৭ এআই ও হেল্প সেন্টার" },
  "AI Chat": { en: "AI Chat", bn: "এআই চ্যাট" },
  "FAQs & Knowledge": { en: "FAQs & Knowledge", bn: "প্রশ্নোত্তর ও নলেজ" },
  "Submit Ticket": { en: "Submit Ticket", bn: "টিকিট সাবমিট" },
  "My Tickets": { en: "My Tickets", bn: "আমার টিকিট" },
  "Online": { en: "Online", bn: "অনলাইন" },

  // Support Chat
  "Ask a question or describe your issue...": { en: "Ask a question or describe your issue...", bn: "আপনার প্রশ্ন বা সমস্যা লিখুন..." },
  "Type your message in English or বাংলা...": { en: "Type your message in English or বাংলা...", bn: "ইংরেজি বা বাংলায় আপনার বার্তা লিখুন..." },
  "Hello! Welcome to Ama Community Support. I am your intelligent assistant. How can I help you today?": {
    en: "Hello! Welcome to Ama Community Support. I am your intelligent assistant. How can I help you today?",
    bn: "হ্যালো! ট্রেক ও আমা কমিউনিটি সাপোর্টে স্বাগতম। আমি আপনার এআই সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?"
  },
  "Clear Chat": { en: "Clear Chat", bn: "চ্যাট মুছুন" },
  "Quick Questions:": { en: "Quick Questions:", bn: "দ্রুত প্রশ্নসমূহ:" },
  "How to start a new discussion topic?": { en: "How to start a new discussion topic?", bn: "কীভাবে নতুন আলোচনার টপিক শুরু করবেন?" },
  "What is the Enterprise Consultancy scope?": { en: "What is the Enterprise Consultancy scope?", bn: "এন্টারপ্রাইজ কনসালটেন্সি সেবায় কী রয়েছে?" },
  "How does PostgreSQL persistence work?": { en: "How does PostgreSQL persistence work?", bn: "পোস্টগ্রেস এসকিউএল ডাটাবেজ কীভাবে কাজ করে?" },
  "How to customize Docly bbPress theme?": { en: "How to customize Docly bbPress theme?", bn: "ডকলি ও বিবিপ্রেস থিম কীভাবে কাস্টমাইজ করবেন?" },

  // FAQs Tab
  "Frequently Asked Questions": { en: "Frequently Asked Questions", bn: "সচরাচর জিজ্ঞাস্য প্রশ্নাবলী (FAQ)" },
  "Search knowledge base & FAQs...": { en: "Search knowledge base & FAQs...", bn: "নলেজ বেস ও প্রশ্নোত্তর খুঁজুন..." },
  "All Categories": { en: "All Categories", bn: "সব ক্যাটাগরি" },
  "Community & Forum": { en: "Community & Forum", bn: "কমিউনিটি ও ফোরাম" },
  "Themes & bbPress": { en: "Themes & bbPress", bn: "থিম ও বিবিপ্রেস" },
  "Consultancy & Pricing": { en: "Consultancy & Pricing", bn: "কনসালটেন্সি ও প্যাকেজ" },
  "Technical & Database": { en: "Technical & Database", bn: "টেকনিক্যাল ও ডাটাবেজ" },
  "Ask AI About This": { en: "Ask AI About This", bn: "এআই-কে এ বিষয়ে জিজ্ঞাসা করুন" },
  "No matching articles or FAQs found.": { en: "No matching articles or FAQs found.", bn: "কোনো প্রাসঙ্গিক প্রশ্নোত্তর পাওয়া যায়নি।" },

  // Ticket Form Tab
  "Open a Support Ticket": { en: "Open a Support Ticket", bn: "নতুন সাপোর্ট টিকিট খুলুন" },
  "Our specialized engineering and moderation team responds within 2 business hours.": {
    en: "Our specialized engineering and moderation team responds within 2 business hours.",
    bn: "আমাদের বিশেষজ্ঞ ইঞ্জিনিয়ার ও মডারেশন টিম ২ কর্মঘণ্টার মধ্যে উত্তর দিয়ে থাকে।"
  },
  "Your Email Address": { en: "Your Email Address", bn: "আপনার ইমেইল এড্রেস" },
  "Subject / Topic": { en: "Subject / Topic", bn: "বিষয় / টপিক" },
  "Brief summary of the issue...": { en: "Brief summary of the issue...", bn: "সমস্যার সংক্ষিপ্ত সারসংক্ষেপ..." },
  "Priority Level": { en: "Priority Level", bn: "অগ্রাধিকার স্তর" },
  "Normal": { en: "Normal", bn: "সাধারণ" },
  "Urgent": { en: "Urgent", bn: "জরুরি" },
  "Critical": { en: "Critical", bn: "অতীব জরুরি" },
  "Detailed Question / Request": { en: "Detailed Question / Request", bn: "বিস্তারিত প্রশ্ন বা অনুরোধ" },
  "Provide full details, steps to reproduce, or requirements...": {
    en: "Provide full details, steps to reproduce, or requirements...",
    bn: "বিস্তারিত বিবরণ, প্রয়োজনীয়তা বা সমস্যাটি বিস্তারিত লিখুন..."
  },
  "Submit Support Ticket": { en: "Submit Support Ticket", bn: "সাপোর্ট টিকিট জমা দিন" },
  "Submitting Ticket...": { en: "Submitting Ticket...", bn: "টিকিট জমা দেওয়া হচ্ছে..." },
  "Ticket created successfully!": { en: "Ticket created successfully!", bn: "টিকিট সফলভাবে তৈরি হয়েছে!" },

  // My Tickets Tab
  "Your Active Support Tickets": { en: "Your Active Support Tickets", bn: "আপনার সক্রিয় সাপোর্ট টিকিটসমূহ" },
  "No support tickets opened yet.": { en: "No support tickets opened yet.", bn: "এখনো কোনো সাপোর্ট টিকিট খোলা হয়নি।" },
  "Status": { en: "Status", bn: "অবস্থা" },
  "OPEN": { en: "OPEN", bn: "উন্মুক্ত (ওপেন)" },
  "IN_PROGRESS": { en: "IN_PROGRESS", bn: "প্রক্রিয়াধীন" },
  "ANSWERED": { en: "ANSWERED", bn: "উত্তর দেওয়া হয়েছে" },
  "CLOSED": { en: "CLOSED", bn: "সম্পন্ন" },
  "Admin Response:": { en: "Admin Response:", bn: "অ্যাডমিন উত্তর:" },
  "Awaiting specialist review": { en: "Awaiting specialist review", bn: "বিশেষজ্ঞ পর্যালোচনার অপেক্ষায়" },

  // Source Badges
  "AI Answer": { en: "AI Answer", bn: "এআই উত্তর" },
  "Knowledge Base": { en: "Knowledge Base", bn: "নলেজ বেস" },
  "FAQ Match": { en: "FAQ Match", bn: "সরাসরি FAQ" },
  "Support Specialist": { en: "Support Specialist", bn: "সাপোর্ট স্পেশালিস্ট" },

  // CTAs & General Buttons
  "Get a Free Consultation": { en: "Get a Free Consultation", bn: "ফ্রি কনসাল্টেশন নিন" },
  "Grow Your Business": { en: "Grow Your Business", bn: "আপনার ব্যবসা বড় করুন" },
  "Get Started": { en: "Get Started", bn: "শুরু করুন" },
  "Order Package": { en: "Order Package", bn: "প্যাকেজটি অর্ডার করুন" },
  "Sending...": { en: "Sending...", bn: "পাঠানো হচ্ছে..." },
  "WhatsApp Chat": { en: "WhatsApp Chat", bn: "হোয়াটসঅ্যাপ চ্যাট" }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ama_language');
      return (saved === 'bn' ? 'bn' : 'en') as Language;
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ama_language', lang);
    } catch (e) {
      console.warn('Storage write failed for language:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
