import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn' | 'ar';

export interface LanguageContextType {
  language: Language;
  isBn: boolean;
  isAr: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, bnText?: string, arText?: string) => string;
  formatNumber: (num: number | string) => string;
  formatDate: (dateStr: string | undefined | null) => string;
  formatTimeAgo: (timeStr: string | Date | number | undefined | null) => string;
  translateCategory: (cat: string) => string;
  translateRole: (role: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Centralized dictionary for every element across the Trek Consultancy Platform (English, Bengali, Arabic)
const dictionary: Record<string, { en: string; bn: string; ar: string }> = {
  // Navigation & Header
  "Home": { en: "Home", bn: "হোম", ar: "الرئيسية" },
  "About Us": { en: "About Us", bn: "আমাদের সম্পর্কে", ar: "من نحن" },
  "Services": { en: "Services", bn: "সেবাসমূহ", ar: "خدماتنا" },
  "Portfolio": { en: "Portfolio", bn: "পোর্টফোলিও", ar: "أعمالنا" },
  "Packages": { en: "Packages", bn: "প্যাকেজসমূহ", ar: "الباقات" },
  "Insights": { en: "Insights", bn: "ইনসাইটস", ar: "الرؤى والتحليلات" },
  "Customers": { en: "Customers", bn: "গ্রাহকবৃন্দ", ar: "العملاء" },
  "Customers & Conversations": { en: "Customers & Conversations", bn: "গ্রাহক ও কথোপকথন", ar: "العملاء والمحادثات" },
  "Admin": { en: "Admin", bn: "অ্যাডমিন", ar: "الإدارة" },
  "Admin Portal": { en: "Admin Portal", bn: "অ্যাডমিন পোর্টাল", ar: "لوحة تحكم المشرف" },
  "Discussions": { en: "Discussions", bn: "আলোচনা", ar: "المناقشات" },
  "Discussion": { en: "Discussion", bn: "আলোচনা", ar: "مناقشة" },
  "Forum": { en: "Forum", bn: "ফোরাম", ar: "المنتدى" },
  "Forums": { en: "Forums", bn: "ফোরাম", ar: "المنتديات" },
  "Sign In": { en: "Sign In", bn: "সাইন ইন", ar: "تسجيل الدخول" },
  "Sign Out": { en: "Sign Out", bn: "লগআউট", ar: "تسجيل الخروج" },
  "Post a Question": { en: "Post a Question", bn: "প্রশ্ন তৈরি করুন", ar: "طرح سؤال جديد" },
  "Ask Question": { en: "Ask Question", bn: "প্রশ্ন করুন", ar: "اسأل سؤالاً" },
  "Login or Register": { en: "Login or Register", bn: "লগইন বা নিবন্ধন", ar: "تسجيل الدخول أو التسجيل" },
  "Login or Register to Continue": { en: "Login or Register to Continue", bn: "এগিয়ে যেতে লগইন বা নিবন্ধন করুন", ar: "سجّل الدخول أو أنشئ حساباً للمتابعة" },
  "Language": { en: "Language", bn: "ভাষা নির্বাচন", ar: "اللغة" },

  // Hero Section
  "Welcome to Trek Consultancy Forum": { 
    en: "Welcome to Trek Consultancy Forum", 
    bn: "ট্রেক কনসালটেন্সি ফোরামে স্বাগতম",
    ar: "مرحباً بكم في منتدى تريك للاستشارات"
  },
  "The official community forum and support portal for Trek Consultancy": {
    en: "The official community forum and support portal for Trek Consultancy",
    bn: "ট্রেক কনসালটেন্সির অফিসিয়াল কমিউনিটি ফোরাম ও সাপোর্ট পোর্টাল",
    ar: "المنتدى المجتمعي الرسمي وبوابة الدعم لشركة تريك للاستشارات"
  },
  "Search for Topics, Solutions, & Guides....": {
    en: "Search for Topics, Solutions, & Guides....",
    bn: "টপিক, সমাধান ও গাইড খুঁজুন....",
    ar: "ابحث عن المواضيع والحلول والأدلة الإرشادية...."
  },
  "Trending:": { en: "Trending:", bn: "জনপ্রিয়:", ar: "الأكثر تداولاً:" },
  "Cloud Architecture": { en: "Cloud Architecture", bn: "ক্লাউড আর্কিটেকচার", ar: "هندسة السحابة" },
  "React & Vite": { en: "React & Vite", bn: "রিঅ্যাক্ট ও ভিট", ar: "رياكت وفايت (React & Vite)" },
  "DevOps & CI/CD": { en: "DevOps & CI/CD", bn: "ডেভঅপস ও সিআই/সিডি", ar: "عمليات التطوير والتكامل المستمر (DevOps & CI/CD)" },
  "Database Scaling": { en: "Database Scaling", bn: "ডাটাবেজ স্কেলিং", ar: "توسيع قواعد البيانات" },
  "Microservices": { en: "Microservices", bn: "মাইক্রোসার্ভিসেস", ar: "الخدمات المصغرة (Microservices)" },
  "Enterprise Security": { en: "Enterprise Security", bn: "এন্টারপ্রাইজ সিকিউরিটি", ar: "أمن المؤسسات والبيانات" },
  "Enterprise Architecture & Cloud Systems": {
    en: "Enterprise Architecture & Cloud Systems",
    bn: "এন্টারপ্রাইজ আর্কিটেকচার ও ক্লাউড সিস্টেম",
    ar: "بنية المؤسسات والأنظمة السحابية"
  },
  "Global Technology Strategy & Community Advisory": {
    en: "Global Technology Strategy & Community Advisory",
    bn: "গ্লোবাল প্রযুক্তি কৌশল ও কমিউনিটি পরামর্শ",
    ar: "استراتيجية التقنية العالمية والاستشارات المجتمعية"
  },
  "Performance Engineering & High-Traffic Optimization": {
    en: "Performance Engineering & High-Traffic Optimization",
    bn: "পারফরম্যান্স ইঞ্জিনিয়ারিং ও হাই-ট্রাফিক অপ্টিমাইজেশন",
    ar: "هندسة الأداء وتحسين التعامل مع حركة المرور العالية"
  },
  "Trek Enterprise Advisory": { en: "Trek Enterprise Advisory", bn: "ট্রেক এন্টারপ্রাইজ অ্যাডভাইজরি", ar: "استشارات تريك للمؤسسات" },
  "10,000+ Solutions Discussed": { en: "10,000+ Solutions Discussed", bn: "১০,০০০+ সমাধান আলোচিত", ar: "أكثر من ١٠,٠٠٠ حل تمت مناقشته" },
  "Verified Engineering Insights": { en: "Verified Engineering Insights", bn: "যাচাইকৃত ইঞ্জিনিয়ারিং অন্তর্দৃষ্টি", ar: "رؤى هندسية موثقة ومعتمدة" },
  "Previous slide": { en: "Previous slide", bn: "পূর্ববর্তী স্লাইড", ar: "الشريحة السابقة" },
  "Next slide": { en: "Next slide", bn: "পরবর্তী স্লাইড", ar: "الشريحة التالية" },
  "Clear search": { en: "Clear search", bn: "অনুসন্ধান মুছুন", ar: "مسح البحث" },

  // Forum Section & Tabs
  "Notable Forums": { en: "Notable Forums", bn: "জনপ্রিয় ফোরামসমূহ", ar: "أبرز المنتديات" },
  "Trek Consultancy Forum": { en: "Trek Consultancy Forum", bn: "ট্রেক কনসালটেন্সি ফোরাম", ar: "منتدى تريك للاستشارات" },
  "All": { en: "All", bn: "সকল", ar: "الكل" },
  "Popular": { en: "Popular", bn: "জনপ্রিয়", ar: "الشائعة" },
  "Featured": { en: "Featured", bn: "ফিচার্ড", ar: "المميزة" },
  "Recent": { en: "Recent", bn: "সাম্প্রতিক", ar: "الأحدث" },
  "Unloved": { en: "Unloved", bn: "উত্তরহীন", ar: "بدون ردود" },
  "Loved": { en: "Loved", bn: "সেরা পছন্দ", ar: "الأكثر تفاعلاً" },
  "Showing results for": { en: "Showing results for", bn: "ফলাফল প্রদর্শন:", ar: "عرض نتائج البحث عن" },
  "found": { en: "found", bn: "পাওয়া গেছে", ar: "تم العثور عليها" },
  "Found": { en: "Found", bn: "পাওয়া গেছে", ar: "تم العثور عليها" },
  "No discussions found": { en: "No discussions found", bn: "কোনো আলোচনা পাওয়া যায়নি", ar: "لم يتم العثور على أي مناقشات" },
  "No questions matched your search or selected filter. Try adjusting your keywords or start a new thread.": {
    en: "No questions matched your search or selected filter. Try adjusting your keywords or start a new thread.",
    bn: "আপনার সার্চ বা ফিল্টারের সাথে কোনো প্রশ্ন মেলেনি। কি-ওয়ার্ড পরিবর্তন করুন বা নতুন টপিক শুরু করুন।",
    ar: "لم تطابق أي أسئلة بحثك أو الفلتر المحدد. يرجى تعديل الكلمات المفتاحية أو بدء موضوع جديد."
  },
  "Create Topic": { en: "Create Topic", bn: "টপিক তৈরি করুন", ar: "إنشاء موضوع جديد" },

  // Forum Card & Metrics
  "You": { en: "You", bn: "আপনি", ar: "أنت" },
  "Views": { en: "Views", bn: "ভিউ", ar: "مشاهدات" },
  "View": { en: "View", bn: "ভিউ", ar: "مشاهدة" },
  "Likes": { en: "Likes", bn: "লাইক", ar: "إعجابات" },
  "Like": { en: "Like", bn: "লাইক", ar: "إعجاب" },
  "Replies": { en: "Replies", bn: "উত্তর", ar: "ردود" },
  "Reply": { en: "Reply", bn: "উত্তর", ar: "رد" },
  "Unlike this question": { en: "Unlike this question", bn: "লাইক সরান", ar: "إلغاء الإعجاب بهذا السؤال" },
  "Like this question": { en: "Like this question", bn: "এই প্রশ্নে লাইক দিন", ar: "الإعجاب بهذا السؤال" },
  "Unlike reply": { en: "Unlike reply", bn: "লাইক সরান", ar: "إلغاء الإعجاب بالرد" },
  "Like reply": { en: "Like reply", bn: "লাইক দিন", ar: "الإعجاب بالرد" },
  "Delete your post": { en: "Delete your post", bn: "আপনার পোস্ট মুছুন", ar: "حذف منشورك" },
  "Delete post (Admin)": { en: "Delete post (Admin)", bn: "পোস্ট মুছুন (অ্যাডমিন)", ar: "حذف المنشور (مسؤول)" },
  "Delete Your Post": { en: "Delete Your Post", bn: "পোস্ট মুছে ফেলুন", ar: "حذف منشورك" },
  "Delete Post": { en: "Delete Post", bn: "পোস্ট মুছুন", ar: "حذف المنشور" },
  "Edit your post": { en: "Edit your post", bn: "আপনার পোস্ট সম্পাদনা করুন", ar: "تعديل منشورك" },
  "Edit post (Admin)": { en: "Edit post (Admin)", bn: "পোস্ট সম্পাদনা (অ্যাডমিন)", ar: "تعديل المنشور (مسؤول)" },
  "Edit Your Post": { en: "Edit Your Post", bn: "পোস্ট সম্পাদনা", ar: "تعديل منشورك" },
  "Edit Post": { en: "Edit Post", bn: "পোস্ট সম্পাদনা", ar: "تعديل المنشور" },
  "Edit Discussion": { en: "Edit Discussion", bn: "আলোচনা সম্পাদনা", ar: "تعديل المناقشة" },
  "Update Your Post": { en: "Update Your Post", bn: "আপনার পোস্ট আপডেট করুন", ar: "تحديث منشورك" },
  "Target Post": { en: "Target Post", bn: "নির্দিষ্ট পোস্ট", ar: "المنشور المحدد" },

  // Forum Sidebar
  "Access our primary corporate platform for complete business solutions and architecture reviews.": {
    en: "Access our primary corporate platform for complete business solutions and architecture reviews.",
    bn: "পূর্ণাঙ্গ ব্যবসায়িক সমাধান ও আর্কিটেকচার পর্যালোচনার জন্য আমাদের কর্পোরেট প্ল্যাটফর্মে যান।",
    ar: "تفضل بزيارة منصتنا المؤسسية الرئيسية للاطلاع على حلول الأعمال الشاملة ومراجعات البنية التحتية."
  },
  "Visit Main Website": { en: "Visit Main Website", bn: "মূল ওয়েবসাইট দেখুন", ar: "زيارة الموقع الرئيسي" },
  "Recent Topics": { en: "Recent Topics", bn: "সাম্প্রতিক টপিক", ar: "أحدث المواضيع" },
  "Recent Replies": { en: "Recent Replies", bn: "সাম্প্রতিক উত্তর", ar: "أحدث الردود" },
  "No recent topics yet": { en: "No recent topics yet", bn: "এখনো কোনো সাম্প্রতিক টপিক নেই", ar: "لا توجد مواضيع حديثة حتى الآن" },
  "No recent replies yet": { en: "No recent replies yet", bn: "এখনো কোনো সাম্প্রতিক উত্তর নেই", ar: "لا توجد ردود حديثة حتى الآن" },
  "by": { en: "by", bn: "দ্বারা", ar: "بواسطة" },

  // Callout Banner
  "New to Communities?": { en: "New to Communities?", bn: "কমিউনিটিতে নতুন?", ar: "جديد في مجتمعنا؟" },
  "Its members are ambitious local authorities and development corporations planning and delivering exemplary support frameworks, architectural solutions, and collaborative knowledge.": {
    en: "Its members are ambitious local authorities and development corporations planning and delivering exemplary support frameworks, architectural solutions, and collaborative knowledge.",
    bn: "আমাদের সদস্যরা উচ্চাকাঙ্ক্ষী প্রকৌশলী এবং বিশেষজ্ঞ দল, যারা যৌথ জ্ঞান, আর্কিটেকচারাল সমাধান এবং অনুকরণীয় সহায়তা প্রদান করে থাকেন।",
    ar: "يضم مجتمعنا نخبة من المستشارين والخبراء والمؤسسات الرائدة التي تقدم أطراً استشارية نموذجية، وحلولاً معمارية، ومعرفة تعاونية متقدمة."
  },
  "Ask a Question": { en: "Ask a Question", bn: "প্রশ্ন জিজ্ঞাসা করুন", ar: "اطرح سؤالاً" },

  // Blog Section
  "Trek Consultancy Insights": { en: "Trek Consultancy Insights", bn: "ট্রেক কনসালটেন্সি ইনসাইটস", ar: "رؤى تريك للاستشارات" },
  "Insights, architectural tutorials, and product documentation from our core engineering team.": {
    en: "Insights, architectural tutorials, and product documentation from our core engineering team.",
    bn: "আমাদের কোর ইঞ্জিনিয়ারিং দলের বিশ্লেষণ, প্রযুক্তিগত টিউটোরিয়াল এবং ডকুমেন্টেশন।",
    ar: "رؤى استراتيجية ودروس في الهندسة المعمارية التقنية وتوثيق للأنظمة من فريقنا الاستشاري المتخصص."
  },
  "Login Required to Participate": { en: "Login Required to Participate", bn: "অংশগ্রহণের জন্য লগইন প্রয়োজন", ar: "يتطلب تسجيل الدخول للمشاركة" },
  "Login to Read & React": { en: "Login to Read & React", bn: "পড়তে ও রিঅ্যাক্ট দিতে লগইন করুন", ar: "سجّل الدخول للقراءة والتفاعل" },
  "No blog articles published yet": { en: "No blog articles published yet", bn: "কোনো ব্লগ নিবন্ধ এখনো প্রকাশিত হয়নি", ar: "لم يتم نشر أي مقالات حتى الآن" },
  "Articles published from the admin console will appear here.": {
    en: "Articles published from the admin console will appear here.",
    bn: "অ্যাডমিন কনসোল থেকে প্রকাশিত নিবন্ধ এখানে প্রদর্শিত হবে।",
    ar: "ستظهر المقالات المنشورة من لوحة تحكم المشرف هنا."
  },
  "Show More": { en: "Show More", bn: "আরও দেখুন", ar: "عرض المزيد" },
  "All Articles Loaded": { en: "All Articles Loaded", bn: "সব নিবন্ধ দেখানো হয়েছে", ar: "تم تحميل جميع المقالات" },
  "Back to Blogs": { en: "Back to Blogs", bn: "ইনসাইটস তালিকায় ফিরুন", ar: "العودة إلى المقالات" },
  "Open Link": { en: "Open Link", bn: "লিংক খুলুন", ar: "فتح الرابط" },
  "Visit Article Link": { en: "Visit Article Link", bn: "লিংকটি দেখুন", ar: "زيارة رابط المقال" },
  "This article includes an external reference link.": { 
    en: "This article includes an external reference link.", 
    bn: "এই নিবন্ধটিতে একটি বহিঃসংযোগ লিংক অন্তর্ভুক্ত আছে।",
    ar: "يتضمن هذا المقال رابط مرجع خارجي."
  },
  "External Article": { en: "External Article", bn: "বহিঃসংযোগ নিবন্ধ", ar: "مقال خارجي" },
  "Open link in new tab": { en: "Open link in new tab", bn: "নতুন ট্যাবে লিঙ্ক খুলুন", ar: "فتح الرابط في علامة تبويب جديدة" },
  "Share article link": { en: "Share article link", bn: "নিবন্ধের লিংক শেয়ার করুন", ar: "مشاركة رابط المقال" },
  "Core Community Author": { en: "Core Community Author", bn: "কমিউনিটি লেখক", ar: "كاتب معتمد في المجتمع" },
  "Participate in Blog Activities": { en: "Participate in Blog Activities", bn: "ব্লগ কার্যক্রমে অংশ নিন", ar: "المشاركة في أنشطة المقالات" },
  "Sign In / Create Account": { en: "Sign In / Create Account", bn: "লগইন / নিবন্ধন করুন", ar: "تسجيل الدخول / إنشاء حساب" },
  "Participating as": { en: "Participating as", bn: "অংশ নিচ্ছেন:", ar: "المشاركة بصفتك:" },
  "Loading discussions...": { en: "Loading discussions...", bn: "আলোচনা লোড হচ্ছে...", ar: "جاري تحميل المناقشات..." },
  "Posting...": { en: "Posting...", bn: "প্রকাশ করা হচ্ছে...", ar: "جاري النشر..." },
  "Liked": { en: "Liked", bn: "লাইক দেওয়া হয়েছে", ar: "تم الإعجاب" },
  "Like article": { en: "Like article", bn: "নিবন্ধে লাইক দিন", ar: "الإعجاب بالمقال" },
  "Sign in to like this article": { en: "Sign in to like this article", bn: "লাইক দিতে সাইন ইন করুন", ar: "سجّل الدخول للإعجاب بهذا المقال" },
  "To participate in blog activities and read full articles, you must have an account and be logged in. Please sign in or create an account.": {
    en: "To participate in blog activities and read full articles, you must have an account and be logged in. Please sign in or create an account.",
    bn: "ব্লগের কার্যক্রমে অংশ নিতে এবং সম্পূর্ণ নিবন্ধ পড়তে অ্যাকাউন্টে লগইন থাকা প্রয়োজন। অনুগ্রহ করে সাইন ইন করুন বা নতুন অ্যাকাউন্ট খুলুন।",
    ar: "للمشاركة في أنشطة المدونة وقراءة المقالات كاملة، يجب أن تمتلك حساباً وأن تكون مسجلاً للدخول. يُرجى تسجيل الدخول أو إنشاء حساب جديد."
  },
  "To like this article and join community discussions, please log in or create an account.": {
    en: "To like this article and join community discussions, please log in or create an account.",
    bn: "এই নিবন্ধে লাইক দিতে এবং কমিউনিটি আলোচনায় অংশ নিতে অনুগ্রহ করে লগইন করুন বা নতুন অ্যাকাউন্ট তৈরি করুন।",
    ar: "للإعجاب بهذا المقال والمشاركة في المناقشات المجتمعية، يُرجى تسجيل الدخول أو إنشاء حساب جديد."
  },
  "To participate in blog discussions and post comments, please log in or create an account.": {
    en: "To participate in blog discussions and post comments, please log in or create an account.",
    bn: "ব্লগ আলোচনায় অংশ নিতে এবং মন্তব্য করতে অনুগ্রহ করে লগইন করুন বা নতুন অ্যাকাউন্ট তৈরি করুন।",
    ar: "للمشاركة في مناقشات المقالات وإضافة التعليقات، يُرجى تسجيل الدخول أو إنشاء حساب جديد."
  },
  "To create a topic and post questions in the forum, you must have an account and be logged in.": {
    en: "To create a topic and post questions in the forum, you must have an account and be logged in.",
    bn: "ফোরামে প্রশ্ন বা আলোচনা তৈরি করতে আপনার একটি অ্যাকাউন্ট থাকতে হবে এবং লগইন করতে হবে।",
    ar: "لإنشاء موضوع وطرح الأسئلة في المنتدى، يجب أن تمتلك حساباً وأن تكون مسجلاً للدخول."
  },
  "To leave a reply and participate in this topic, you must have an account and be logged in.": {
    en: "To leave a reply and participate in this topic, you must have an account and be logged in.",
    bn: "আলোচনায় অংশ নিতে এবং উত্তর প্রদান করতে আপনার একটি অ্যাকাউন্ট থাকতে হবে এবং লগইন করতে হবে।",
    ar: "لإضافة رد والمشاركة في هذا الموضوع، يجب أن تمتلك حساباً وأن تكون مسجلاً للدخول."
  },
  "To leave a reply and contribute to this forum topic, you must have an account and be logged in.": {
    en: "To leave a reply and contribute to this forum topic, you must have an account and be logged in.",
    bn: "এই টপিকে উত্তর দিতে বা অংশ নিতে আপনাকে অবশ্যই লগইন করতে হবে।",
    ar: "للرد والمساهمة في هذا الموضوع بالمنتدى، يجب أن تكون مسجلاً للدخول."
  },
  "You must have an account and be logged in to create a topic.": {
    en: "You must have an account and be logged in to create a topic.",
    bn: "টপিক তৈরি করতে আপনাকে একটি অ্যাকাউন্ট থাকতে হবে এবং লগইন করতে হবে।",
    ar: "يجب أن تمتلك حساباً وأن تكون مسجلاً للدخول لإنشاء موضوع."
  },
  "Please provide both a topic title and details.": {
    en: "Please provide both a topic title and details.",
    bn: "অনুগ্রহ করে টপিকের শিরোনাম এবং বিবরণ উভয়ই প্রদান করুন।",
    ar: "يرجى تقديم عنوان للموضوع وتفاصيل المحتوى معاً."
  },
  "Verified Senior Consultant Resolution": {
    en: "Verified Senior Consultant Resolution",
    bn: "যাচাইকৃত সিনিয়র কনসালটেন্ট সমাধান",
    ar: "حل معتمد من كبير المستشارين"
  },
  "Knowledge Base & Verified Docs": {
    en: "Knowledge Base & Verified Docs",
    bn: "নলেজ বেস ও ভেরিফাইড ডকুমেন্টস",
    ar: "قاعدة المعرفة والوثائق المعتمدة"
  },

  // Newsletter Section
  "Follow our newsletter": { en: "Follow our newsletter", bn: "আমাদের নিউজলেটার সাবস্ক্রাইব করুন", ar: "اشترك في نشرتنا البريدية" },
  "Get weekly updates on WordPress architectural blueprints, support guidelines, theme optimizations, and community answers delivered straight to your inbox.": {
    en: "Get weekly updates on WordPress architectural blueprints, support guidelines, theme optimizations, and community answers delivered straight to your inbox.",
    bn: "সরাসরি আপনার ইনবক্সে ক্লাউড আর্কিটেকচার, সাপোর্ট গাইডলাইন, থিম অপ্টিমাইজেশন এবং সাপ্তাহিক কমিউনিটি প্রশ্নোত্তর পেতে যুক্ত থাকুন।",
    ar: "احصل على تحديثات أسبوعية حول الحلول المعمارية والأنظمة السحابية وإرشادات الدعم الفني مباشرة إلى صندوق بريدك."
  },
  "Enter your email address": { en: "Enter your email address", bn: "আপনার ইমেইল এড্রেস লিখুন", ar: "أدخل عنوان بريدك الإلكتروني" },
  "Subscribe": { en: "Subscribe", bn: "সাবস্ক্রাইব করুন", ar: "اشتراك" },
  "Subscribing...": { en: "Subscribing...", bn: "যুক্ত করা হচ্ছে...", ar: "جاري الاشتراك..." },
  "Subscribed!": { en: "Subscribed!", bn: "সাবস্ক্রাইব সম্পন্ন!", ar: "تم الاشتراك بنجاح!" },
  "Logged in as": { en: "Logged in as", bn: "লগইন করেছেন", ar: "مسجل الدخول كـ" },
  "Please enter a valid email address.": { en: "Please enter a valid email address.", bn: "অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।", ar: "يرجى إدخال عنوان بريد إلكتروني صحيح." },
  "Subscription failed. Please try again.": { en: "Subscription failed. Please try again.", bn: "সাবস্ক্রিপশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", ar: "فشل الاشتراك. يرجى المحاولة مرة أخرى." },
  "Network error. Please try again later.": { en: "Network error. Please try again later.", bn: "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", ar: "خطأ في الشبكة. يرجى المحاولة لاحقاً." },
  "Thank you! You are now subscribed to our weekly digest.": { 
    en: "Thank you! You are now subscribed to our weekly digest.", 
    bn: "ধন্যবাদ! আপনি সফলভাবে আমাদের সাপ্তাহিক ডাইজেস্টে যুক্ত হয়েছেন।",
    ar: "شكراً لك! لقد تم اشتراكك بنجاح في ملخصنا الأسبوعي."
  },

  // Footer
  "Your trusted partner for Saudi business setup, MISA licensing, software development, real estate investment, visa services, and international company formation. We help investors and businesses grow with end-to-end professional solutions.": {
    en: "Your trusted partner for Saudi business setup, MISA licensing, software development, real estate investment, visa services, and international company formation. We help investors and businesses grow with end-to-end professional solutions.",
    bn: "সৌদি আরবে ব্যবসা প্রতিষ্ঠা, ভিসা সার্ভিস, সফটওয়্যার ডেভেলপমেন্ট, রিয়েল এস্টেট ও আন্তর্জাতিক কোম্পানি গঠনের আপনার বিশ্বস্ত সহযোগী। এন্ড-টু-এন্ড সমাধান দিয়ে আমরা বিনিয়োগকারী ও ব্যবসার সম্প্রসারণে কাজ করি।",
    ar: "شريكك الموثوق لتأسيس الأعمال في السعودية، تراخيص وزارة الاستثمار (MISA)، تطوير البرمجيات، الاستثمار العقاري، خدمات التأشيرات، وتأسيس الشركات الدولية. نساعد المستثمرين والشركات على النمو بحلول احترافية متكاملة."
  },
  "Privacy Policy": { en: "Privacy Policy", bn: "গোপনীয়তা নীতি", ar: "سياسة الخصوصية" },
  "Terms of Service": { en: "Terms of Service", bn: "ব্যবহারের শর্তাবলী", ar: "شروط الخدمة" },
  "Refund Policy": { en: "Refund Policy", bn: "রিফান্ড পলিসি", ar: "سياسة الاسترداد" },
  "© 2023–2026 B2bfiy. All Rights Reserved.": {
    en: "© 2023–2026 B2bfiy. All Rights Reserved.",
    bn: "© ২০২৩–২০২৬ B2bfiy। সর্বস্বত্ব সংরক্ষিত।",
    ar: "© ٢٠٢٣–٢٠٢٦ B2bfiy. جميع الحقوق محفوظة."
  },

  // Modals & Forms
  "Start a New Discussion": { en: "Start a New Discussion", bn: "নতুন আলোচনা শুরু করুন", ar: "بدء مناقشة جديدة" },
  "Topic Title": { en: "Topic Title", bn: "টপিকের শিরোনাম", ar: "عنوان الموضوع" },
  "Category": { en: "Category", bn: "ক্যাটাগরি", ar: "التصنيف" },
  "Detailed Question or Description": { en: "Detailed Question or Description", bn: "বিস্তারিত প্রশ্ন বা বিবরণ", ar: "السؤال بالتفصيل أو الشرح" },
  "Your Display Name": { en: "Your Display Name", bn: "আপনার নাম", ar: "اسمك الظاهر" },
  "Publish Discussion": { en: "Publish Discussion", bn: "আলোচনা পোস্ট করুন", ar: "نشر المناقشة" },
  "Cancel": { en: "Cancel", bn: "বাতিল", ar: "إلغاء" },
  "Close": { en: "Close", bn: "বন্ধ করুন", ar: "إغلاق" },
  "Close dialog": { en: "Close dialog", bn: "ডায়ালগ বন্ধ করুন", ar: "إغلاق النافذة" },
  "Leave a Reply": { en: "Leave a Reply", bn: "উত্তর লিখুন", ar: "أضف رداً" },
  "Submit Reply": { en: "Submit Reply", bn: "উত্তর জমা দিন", ar: "إرسال الرد" },
  "Replying as": { en: "Replying as", bn: "উত্তর দিচ্ছেন:", ar: "الرد بصفتك:" },
  "Replies & Discussion": { en: "Replies & Discussion", bn: "উত্তর ও আলোচনা", ar: "الردود والمناقشة" },
  "No replies yet. Be the first to share an answer or solution!": {
    en: "No replies yet. Be the first to share an answer or solution!",
    bn: "এখনো কোনো উত্তর আসেনি। প্রথম উত্তরটি আপনিই লিখুন!",
    ar: "لا توجد ردود بعد. كن أول من يشارك إجابة أو حلاً!"
  },
  "Comments & Discussion": { en: "Comments & Discussion", bn: "মন্তব্য ও আলোচনা", ar: "التعليقات والمناقشة" },
  "Write a comment or share your insights...": { en: "Write a comment or share your insights...", bn: "আপনার মন্তব্য বা মতামত লিখুন...", ar: "اكتب تعليقاً أو شارك رؤيتك..." },
  "Post Comment": { en: "Post Comment", bn: "মন্তব্য প্রকাশ করুন", ar: "نشر التعليق" },
  "No comments yet. Be the first to share your thoughts!": {
    en: "No comments yet. Be the first to share your thoughts!",
    bn: "এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই লিখুন!",
    ar: "لا توجد تعليقات بعد. كن أول من يشارك أفكاره!"
  },
  "Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies.": {
    en: "Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies.",
    bn: "আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না এবং সমস্ত উত্তর স্থায়ীভাবে মুছে যাবে।",
    ar: "هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف هذه المناقشة وجميع ردودها بشكل دائم."
  },
  "Join this Discussion": { en: "Join this Discussion", bn: "এই আলোচনায় যোগ দিন", ar: "الانضمام إلى هذه المناقشة" },
  "Log In / Sign Up to Reply": { en: "Log In / Sign Up to Reply", bn: "উত্তর দিতে লগইন / সাইন আপ করুন", ar: "سجل الدخول / اشترك للرد" },
  "Copy share link": { en: "Copy share link", bn: "শেয়ার লিংক কপি করুন", ar: "نسخ رابط المشاركة" },
  "Guest User": { en: "Guest User", bn: "অতিথি ব্যবহারকারী", ar: "مستخدم ضيف" },
  "Your Name": { en: "Your Name", bn: "আপনার নাম", ar: "اسمك" },
  "Loading categories...": { en: "Loading categories...", bn: "ক্যাটাগরি লোড হচ্ছে...", ar: "جاري تحميل التصنيفات..." },
  "Type your response here...": { en: "Type your response here...", bn: "এখানে আপনার উত্তর লিখুন...", ar: "اكتب إجابتك هنا..." },

  // Common User Roles
  "Member": { en: "Member", bn: "সদস্য", ar: "عضو" },
  "Super Admin": { en: "Super Admin", bn: "সুপার অ্যাডমিন", ar: "مشرف رئيسي" },
  "Moderator": { en: "Moderator", bn: "মডারেটর", ar: "مشرف" },
  "Contributor": { en: "Contributor", bn: "কন্ট্রিবিউটর", ar: "مساهم" },
  "Staff": { en: "Staff", bn: "স্টাফ", ar: "فريق العمل" },
  "Author": { en: "Author", bn: "লেখক", ar: "كاتب" },

  // Support Assistant Header & Tabs
  "AI Support Hub": { en: "AI Support Hub", bn: "এআই সাপোর্ট হাব", ar: "مركز الدعم الذكي" },
  "Trek Support Assistant": { en: "Trek Support Assistant", bn: "ট্রেক সাপোর্ট সহকারী", ar: "مساعد تريك للدعم" },
  "24/7 AI & Help Center": { en: "24/7 AI & Help Center", bn: "২৪/৭ এআই ও হেল্প সেন্টার", ar: "الدعم الذكي ومركز المساعدة ٢٤/٧" },
  "AI Chat": { en: "AI Chat", bn: "এআই চ্যাট", ar: "المحادثة الذكية" },
  "FAQs & Knowledge": { en: "FAQs & Knowledge", bn: "প্রশ্নোত্তর ও নলেজ", ar: "الأسئلة الشائعة والمعرفة" },
  "Submit Ticket": { en: "Submit Ticket", bn: "টিকিট সাবমিট", ar: "إرسال تذكرة" },
  "My Tickets": { en: "My Tickets", bn: "আমার টিকিট", ar: "تذاكري" },
  "Online": { en: "Online", bn: "অনলাইন", ar: "متصل" },

  // Support Chat
  "Ask a question or describe your issue...": { en: "Ask a question or describe your issue...", bn: "আপনার প্রশ্ন বা সমস্যা লিখুন...", ar: "اطرح سؤالاً أو صف مشكلتك..." },
  "Type your message in English or বাংলা...": { en: "Type your message in English or বাংলা...", bn: "ইংরেজি বা বাংলায় আপনার বার্তা লিখুন...", ar: "اكتب رسالتك بالعربية أو الإنجليزية..." },
  "Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?": {
    en: "Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?",
    bn: "হ্যালো! ট্রেক কনসালটেন্সি ফোরাম সাপোর্টে স্বাগতম। আমি আপনার এআই সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
    ar: "مرحباً بكم في دعم منتدى تريك للاستشارات! أنا مساعدكم الذكي، كيف يمكنني مساعدتكم اليوم؟"
  },
  "Clear Chat": { en: "Clear Chat", bn: "চ্যাট মুছুন", ar: "مسح المحادثة" },
  "Frequently Asked Questions": { en: "Frequently Asked Questions", bn: "সচরাচর জিজ্ঞাস্য প্রশ্নাবলী (FAQ)", ar: "الأسئلة الأكثر شيوعاً" },
  "Search knowledge base & FAQs...": { en: "Search knowledge base & FAQs...", bn: "নলেজ বেস ও প্রশ্নোত্তর খুঁজুন...", ar: "ابحث في قاعدة المعرفة والأسئلة الشائعة..." },
  "All Categories": { en: "All Categories", bn: "সব ক্যাটাগরি", ar: "جميع التصنيفات" },
  "Community & Forum": { en: "Community & Forum", bn: "কমিউনিটি ও ফোরাম", ar: "المجتمع والمنتدى" },
  "Themes & bbPress": { en: "Themes & bbPress", bn: "থিম ও বিবিপ্রেস", ar: "القوالب والمكونات الإضافية" },
  "Consultancy & Pricing": { en: "Consultancy & Pricing", bn: "কনসালটেন্সি ও প্যাকেজ", ar: "الاستشارات والباقات" },
  "Technical & Database": { en: "Technical & Database", bn: "টেকনিক্যাল ও ডাটাবেজ", ar: "التقنية وقواعد البيانات" },
  "Ask AI About This": { en: "Ask AI About This", bn: "এআই-কে এ বিষয়ে জিজ্ঞাসা করুন", ar: "اسأل المساعد الذكي عن هذا" },
  "Ask AI Assistant": { en: "Ask AI Assistant", bn: "এআই সহকারীর সাহায্য নিন", ar: "طلب مساعدة الذكاء الاصطناعي" },
  "No matching articles or FAQs found.": { en: "No matching articles or FAQs found.", bn: "কোনো প্রাসঙ্গিক প্রশ্নোত্তর পাওয়া যায়নি।", ar: "لم يتم العثور على مقالات أو أسئلة شائعة مطابقة." },
  "Copy": { en: "Copy", bn: "কপি", ar: "نسخ" },
  "Copied": { en: "Copied", bn: "কপি সম্পন্ন", ar: "تم النسخ" },
  "AI Answer": { en: "AI Answer", bn: "এআই উত্তর", ar: "إجابة الذكاء الاصطناعي" },
  "Knowledge Base": { en: "Knowledge Base", bn: "নলেজ বেস", ar: "قاعدة المعرفة" },
  "FAQ Match": { en: "FAQ Match", bn: "সরাসরি FAQ", ar: "مطابقة من الأسئلة الشائعة" },
  "Support Specialist": { en: "Support Specialist", bn: "সাপোর্ট স্পেশালিস্ট", ar: "أخصائي دعم فني" },
  "Staff Resolution": { en: "Staff Resolution", bn: "অফিশিয়াল স্টাফ সমাধান", ar: "حل معتمد من فريق العمل" },

  // Article Editor & Management
  "Write": { en: "Write", bn: "লিখুন", ar: "كتابة" },
  "Preview": { en: "Preview", bn: "প্রিভিউ", ar: "معاينة" },
  "Remove Link": { en: "Remove Link", bn: "লিংক সরান", ar: "إزالة الرابط" },
  "Remove": { en: "Remove", bn: "মুছুন", ar: "حذف" },
  "Save Changes": { en: "Save Changes", bn: "সংরক্ষণ করুন", ar: "حفظ التغييرات" },
  "Publish Article": { en: "Publish Article", bn: "নিবন্ধ প্রকাশ করুন", ar: "نشر المقال" },
  "New Knowledge Base Article": { en: "New Knowledge Base Article", bn: "নতুন ইনসাইটস নিবন্ধ", ar: "مقال معرفي جديد" },
  "Edit Knowledge Base Article": { en: "Edit Knowledge Base Article", bn: "ইনসাইটস নিবন্ধ সম্পাদনা", ar: "تعديل المقال المعرفي" },
  "Full Article Body": { en: "Full Article Body", bn: "নিবন্ধের বিস্তারিত বিষয়বস্তু", ar: "نص المقال الكامل" },
  "Summary / Excerpt": { en: "Summary / Excerpt", bn: "সারসংক্ষেপ / বিবরণ", ar: "الموجز / المقتطف" },
  "Article Title": { en: "Article Title", bn: "নিবন্ধের শিরোনাম", ar: "عنوان المقال" },
  "Cover Image URL": { en: "Cover Image URL", bn: "কভার ছবির URL", ar: "رابط صورة الغلاف" },
  "Redirect Link / External URL (Optional)": { en: "Redirect Link / External URL (Optional)", bn: "বহিঃসংযোগ লিঙ্ক / রিডাইরেক্ট URL (ঐচ্ছিক)", ar: "رابط إعادة التوجيه / رابط خارجي (اختياري)" }
};

// Comprehensive category translations for Forum, Knowledge Base, and Business domains
const categoryMap: Record<string, { bn: string; ar: string }> = {
  // Forum categories
  'Docly Theme Support': { bn: 'ডকলি থিম সাপোর্ট', ar: 'دعم قالب دوكلي' },
  'Most requested features of 2020': { bn: 'জনপ্রিয় ফিচারসমূহ', ar: 'الميزات الأكثر طلباً' },
  'Latest Product Support': { bn: 'সর্বশেষ প্রোডাক্ট সাপোর্ট', ar: 'دعم أحدث المنتجات' },
  'About bbPress Plugin & Features': { bn: 'বিবিপ্রেস প্লাগইন ও ফিচার', ar: 'حول إضافة وميزات bbPress' },
  'Feedback Suggestions': { bn: 'মতামত ও পরামর্শ', ar: 'الملاحظات والمقترحات' },
  'Project flow diagram': { bn: 'প্রজেক্ট ফ্লো ডায়াগ্রাম', ar: 'مخطط سير العمل والمشروع' },
  'General Discussion': { bn: 'সাধারণ আলোচনা', ar: 'مناقشات عامة' },
  'Cloud Architecture': { bn: 'ক্লাউড আর্কিটেকচার', ar: 'هندسة السحابة والأنظمة' },
  'Community & Forum': { bn: 'কমিউনিটি ও ফোরাম', ar: 'المجتمع والمنتدى' },
  'Themes & bbPress': { bn: 'থিম ও বিবিপ্রেস', ar: 'القوالب والمكونات الإضافية' },
  'Consultancy & Pricing': { bn: 'কনসালটেন্সি ও প্যাকেজ', ar: 'الاستشارات والباقات' },
  'Technical & Database': { bn: 'টেকনিক্যাল ও ডাটাবেজ', ar: 'التقنية وقواعد البيانات' },

  // Knowledge Base & Insights categories
  'Architecture': { bn: 'আর্কিটেকচার', ar: 'الهندسة المعمارية التقنية' },
  'Technology': { bn: 'প্রযুক্তি ও সফটওয়্যার', ar: 'التقنية والبرمجيات' },
  'Business Setup': { bn: 'ব্যবসা প্রতিষ্ঠা', ar: 'تأسيس الأعمال والشركات' },
  'Design': { bn: 'ডিজাইন ও ইউআই', ar: 'التصميم وتجربة المستخدم' },
  'Design & UI': { bn: 'ডিজাইন ও ইউআই', ar: 'التصميم وواجهات المستخدم' },
  'DevOps': { bn: 'ডেভঅপস ও ক্লাউড', ar: 'عمليات التطوير والسحابة' },
  'DevOps & Scale': { bn: 'ডেভঅপস ও স্কেলিং', ar: 'عمليات التطوير والتوسيع' },
  'Performance': { bn: 'পারফরম্যান্স', ar: 'هندسة الأداء والسرعة' },
  'Security': { bn: 'সিকিউরিটি ও সুরক্ষা', ar: 'الأمن السيبراني وحماية البيانات' },
  'Tutorial': { bn: 'টিউটোরিয়াল ও গাইড', ar: 'دروس وأدلة إرشادية' },
  'Tutorial & Guides': { bn: 'টিউটোরিয়াল ও গাইড', ar: 'دروس وأدلة تعليمية' },
  'Legal & Compliance': { bn: 'আইন ও কমপ্লায়েন্স', ar: 'الشؤون القانونية والامتثال' },
  'MISA Licensing': { bn: 'মিলা লাইসেন্সিং', ar: 'تراخيص وزارة الاستثمار (MISA)' },
  'Real Estate': { bn: 'রিয়েল এস্টেট', ar: 'الاستثمار العقاري' },
  'Visa Services': { bn: 'ভিসা সার্ভিস', ar: 'خدمات التأشيرات والإقامة' },
  'Investment': { bn: 'বিনিয়োগ', ar: 'الاستثمار وتطوير الأعمال' }
};

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const monthMap: Record<string, string> = {
  'January': 'জানুয়ারি',
  'February': 'ফেব্রুয়ারি',
  'March': 'মার্চ',
  'April': 'এপ্রিল',
  'May': 'মে',
  'June': 'জুন',
  'July': 'জুলাই',
  'August': 'আগস্ট',
  'September': 'সেপ্টেম্বর',
  'October': 'অক্টোবর',
  'November': 'নভেম্বর',
  'December': 'ডিসেম্বর',
  'Jan': 'জানু',
  'Feb': 'ফেব',
  'Mar': 'মার্চ',
  'Apr': 'এপ্রিল',
  'Jun': 'জুন',
  'Jul': 'জুলাই',
  'Aug': 'আগস্ট',
  'Sep': 'সেপ্টে',
  'Sept': 'সেপ্টে',
  'Oct': 'অক্টো',
  'Nov': 'নভে',
  'Dec': 'ডিসে'
};

const monthMapAr: Record<string, string> = {
  'January': 'يناير',
  'February': 'فبراير',
  'March': 'مارس',
  'April': 'أبريل',
  'May': 'مايو',
  'June': 'يونيو',
  'July': 'يوليو',
  'August': 'أغسطس',
  'September': 'سبتمبر',
  'October': 'أكتوبر',
  'November': 'نوفمبر',
  'December': 'ديسمبر',
  'Jan': 'يناير',
  'Feb': 'فبراير',
  'Mar': 'مارس',
  'Apr': 'أبريل',
  'Jun': 'يونيو',
  'Jul': 'يوليو',
  'Aug': 'أغسطس',
  'Sep': 'سبتمبر',
  'Sept': 'سبتمبر',
  'Oct': 'أكتوبر',
  'Nov': 'نوفمبر',
  'Dec': 'ديسمبر'
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('trek_language') || localStorage.getItem('ama_language');
      if (saved === 'bn' || saved === 'ar') return saved as Language;
      return 'en';
    } catch {
      return 'en';
    }
  });

  const isBn = language === 'bn';
  const isAr = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('trek_language', lang);
    } catch (e) {
      console.warn('Storage write failed for language:', e);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'bn' : language === 'bn' ? 'ar' : 'en';
    setLanguage(next);
  };

  // Periodic 15-second tick to automatically update relative timestamps in real-time
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 1000000);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Sync document element attributes & styles with selected language (including RTL support)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      if (language === 'bn') {
        document.documentElement.classList.add('lang-bn');
        document.documentElement.classList.remove('lang-ar');
      } else if (language === 'ar') {
        document.documentElement.classList.add('lang-ar');
        document.documentElement.classList.remove('lang-bn');
      } else {
        document.documentElement.classList.remove('lang-bn', 'lang-ar');
      }
    }
  }, [language]);

  const t = (key: string, bnText?: string, arText?: string): string => {
    if (language === 'en') {
      return key;
    }

    if (dictionary[key]) {
      return language === 'bn' ? dictionary[key].bn : dictionary[key].ar;
    }

    if (language === 'bn' && bnText) {
      return bnText;
    }

    if (language === 'ar' && arText) {
      return arText;
    }

    return key;
  };

  // Number translation into Bengali and Arabic numerals
  const formatNumber = (num: number | string): string => {
    if (language === 'bn') {
      return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
    }
    if (language === 'ar') {
      return String(num).replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
    }
    return String(num);
  };

  // Date and month name formatting for English, Bengali, and Arabic
  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    if (language === 'en') return String(dateStr);

    let converted = String(dateStr);
    if (language === 'bn') {
      // Replace full and abbreviated month names
      for (const [enMonth, bnMonth] of Object.entries(monthMap)) {
        const reg = new RegExp(`\\b${enMonth}\\b`, 'gi');
        converted = converted.replace(reg, bnMonth);
      }
      // Replace numbers
      return converted.replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
    }

    if (language === 'ar') {
      for (const [enMonth, arMonth] of Object.entries(monthMapAr)) {
        const reg = new RegExp(`\\b${enMonth}\\b`, 'gi');
        converted = converted.replace(reg, arMonth);
      }
      return converted.replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
    }

    return converted;
  };

  // Accurate relative time calculation supporting Date, ISO timestamp, and relative strings
  const formatTimeAgo = (timeOrDate: string | Date | number | undefined | null): string => {
    if (!timeOrDate) {
      if (language === 'bn') return 'এইমাত্র';
      if (language === 'ar') return 'الآن';
      return 'Just now';
    }

    let dateObj: Date | null = null;
    let rawStr = '';

    if (timeOrDate instanceof Date) {
      dateObj = timeOrDate;
    } else if (typeof timeOrDate === 'number') {
      dateObj = new Date(timeOrDate);
    } else if (typeof timeOrDate === 'string') {
      rawStr = timeOrDate.trim();
      if (rawStr.length >= 8 && /\d/.test(rawStr)) {
        const normalized = rawStr.includes('T') ? rawStr : rawStr.replace(' ', 'T');
        const parsed = new Date(normalized);
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
        } else {
          const direct = new Date(rawStr);
          if (!isNaN(direct.getTime())) {
            dateObj = direct;
          }
        }
      }
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - dateObj.getTime()) / 1000));

      if (elapsedSeconds < 60) {
        if (language === 'bn') return 'এইমাত্র';
        if (language === 'ar') return 'الآن';
        return 'Just now';
      }

      const minutes = Math.floor(elapsedSeconds / 60);
      if (minutes < 60) {
        if (language === 'bn') return `${formatNumber(minutes)} মিনিট আগে`;
        if (language === 'ar') {
          if (minutes === 1) return 'منذ دقيقة';
          if (minutes === 2) return 'منذ دقيقتين';
          if (minutes <= 10) return `منذ ${formatNumber(minutes)} دقائق`;
          return `منذ ${formatNumber(minutes)} دقيقة`;
        }
        return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        if (language === 'bn') return `${formatNumber(hours)} ঘণ্টা আগে`;
        if (language === 'ar') {
          if (hours === 1) return 'منذ ساعة';
          if (hours === 2) return 'منذ ساعتين';
          if (hours <= 10) return `منذ ${formatNumber(hours)} ساعات`;
          return `منذ ${formatNumber(hours)} ساعة`;
        }
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      }

      const days = Math.floor(hours / 24);
      if (days === 1) {
        if (language === 'bn') return 'গতকাল';
        if (language === 'ar') return 'أمس';
        return 'Yesterday';
      }
      if (days < 7) {
        if (language === 'bn') return `${formatNumber(days)} দিন আগে`;
        if (language === 'ar') {
          if (days === 2) return 'منذ يومين';
          if (days <= 10) return `منذ ${formatNumber(days)} أيام`;
          return `منذ ${formatNumber(days)} يوماً`;
        }
        return `${days} days ago`;
      }

      const weeks = Math.floor(days / 7);
      if (weeks < 5) {
        if (language === 'bn') return `${formatNumber(weeks)} সপ্তাহ আগে`;
        if (language === 'ar') {
          if (weeks === 1) return 'منذ أسبوع';
          if (weeks === 2) return 'منذ أسبوعين';
          if (weeks <= 10) return `منذ ${formatNumber(weeks)} أسابيع`;
          return `منذ ${formatNumber(weeks)} أسبوعاً`;
        }
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
      }

      const months = Math.floor(days / 30);
      if (months < 12) {
        if (language === 'bn') return `${formatNumber(months)} মাস আগে`;
        if (language === 'ar') {
          if (months === 1) return 'منذ شهر';
          if (months === 2) return 'منذ شهرين';
          if (months <= 10) return `منذ ${formatNumber(months)} أشهر`;
          return `منذ ${formatNumber(months)} شهراً`;
        }
        return `${months} month${months === 1 ? '' : 's'} ago`;
      }

      const years = Math.floor(days / 365);
      if (language === 'bn') return `${formatNumber(years)} বছর আগে`;
      if (language === 'ar') {
        if (years === 1) return 'منذ عام';
        if (years === 2) return 'منذ عامين';
        if (years <= 10) return `منذ ${formatNumber(years)} أعوام`;
        return `منذ ${formatNumber(years)} عاماً`;
      }
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }

    // Fallback for legacy relative strings (e.g. 'Just now', 'yesterday')
    const lower = rawStr.toLowerCase();
    if (lower === 'just now') {
      if (language === 'bn') return 'এইমাত্র';
      if (language === 'ar') return 'الآن';
      return 'Just now';
    }
    if (lower === 'yesterday') {
      if (language === 'bn') return 'গতকাল';
      if (language === 'ar') return 'أمس';
      return 'Yesterday';
    }

    if (language === 'bn') {
      if (lower.includes('min') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '১';
        return `${formatNumber(num)} মিনিট আগে`;
      }
      if (lower.includes('hour') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '১';
        return `${formatNumber(num)} ঘণ্টা আগে`;
      }
      if (lower.includes('day') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '১';
        return `${formatNumber(num)} দিন আগে`;
      }
      if (lower.includes('week') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '১';
        return `${formatNumber(num)} সপ্তাহ আগে`;
      }
      if (lower.includes('month') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '১';
        return `${formatNumber(num)} মাস আগে`;
      }
      return formatDate(rawStr);
    }

    if (language === 'ar') {
      if (lower.includes('min') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '1';
        const parsed = parseInt(num, 10);
        if (parsed === 1) return 'منذ دقيقة';
        if (parsed === 2) return 'منذ دقيقتين';
        if (parsed <= 10) return `منذ ${formatNumber(parsed)} دقائق`;
        return `منذ ${formatNumber(parsed)} دقيقة`;
      }
      if (lower.includes('hour') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '1';
        const parsed = parseInt(num, 10);
        if (parsed === 1) return 'منذ ساعة';
        if (parsed === 2) return 'منذ ساعتين';
        if (parsed <= 10) return `منذ ${formatNumber(parsed)} ساعات`;
        return `منذ ${formatNumber(parsed)} ساعة`;
      }
      if (lower.includes('day') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '1';
        const parsed = parseInt(num, 10);
        if (parsed === 1) return 'أمس';
        if (parsed === 2) return 'منذ يومين';
        if (parsed <= 10) return `منذ ${formatNumber(parsed)} أيام`;
        return `منذ ${formatNumber(parsed)} يوماً`;
      }
      if (lower.includes('week') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '1';
        const parsed = parseInt(num, 10);
        if (parsed === 1) return 'منذ أسبوع';
        if (parsed === 2) return 'منذ أسبوعين';
        if (parsed <= 10) return `منذ ${formatNumber(parsed)} أسابيع`;
        return `منذ ${formatNumber(parsed)} أسبوعاً`;
      }
      if (lower.includes('month') && lower.includes('ago')) {
        const num = rawStr.match(/\d+/)?.[0] || '1';
        const parsed = parseInt(num, 10);
        if (parsed === 1) return 'منذ شهر';
        if (parsed === 2) return 'منذ شهرين';
        if (parsed <= 10) return `منذ ${formatNumber(parsed)} أشهر`;
        return `منذ ${formatNumber(parsed)} شهراً`;
      }
      return formatDate(rawStr);
    }

    return rawStr;
  };

  // Category name translation
  const translateCategory = (cat: string): string => {
    if (language === 'en' || !cat) return cat;
    const match = categoryMap[cat];
    if (match) {
      return language === 'bn' ? match.bn : match.ar;
    }
    return cat;
  };

  // User role translation
  const translateRole = (role: string): string => {
    if (language === 'en' || !role) return role;
    if (dictionary[role]) {
      return language === 'bn' ? dictionary[role].bn : dictionary[role].ar;
    }
    const lower = role.toLowerCase();
    if (language === 'ar') {
      if (lower.includes('super admin')) return 'مشرف رئيسي';
      if (lower.includes('admin')) return 'مسؤول';
      if (lower.includes('moderator')) return 'مشرف';
      if (lower.includes('staff')) return 'فريق العمل';
      if (lower.includes('member')) return 'عضو';
      if (lower.includes('author')) return 'كاتب';
      if (lower.includes('contributor')) return 'مساهم';
    } else {
      if (lower.includes('admin')) return 'অ্যাডমিন';
      if (lower.includes('moderator')) return 'মডারেটর';
      if (lower.includes('member')) return 'সদস্য';
      if (lower.includes('author')) return 'লেখক';
    }
    return role;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      isBn,
      isAr,
      setLanguage,
      toggleLanguage,
      t,
      formatNumber,
      formatDate,
      formatTimeAgo,
      translateCategory,
      translateRole
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
