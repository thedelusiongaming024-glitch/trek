import React from 'react';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { AdminTab } from '../../types';
import trekLogo from '../../assets/trek-logo.webp';
import { getRandomAvatar, getFallbackAvatar } from '../../utils/avatar';
import { useLanguage } from '../../context/LanguageContext';

interface AdminNavbarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  unreadCount?: number;
  currentAdminUser?: { id?: string; name: string; email: string; role: string; avatar?: string } | null;
  onLogout?: () => void;
}

const TAB_LABELS: Record<AdminTab, string> = {
  overview: 'Overview',
  customers: 'Customers',
  hero: 'Hero Slideshow',
  topics: 'Discussions',
  support: 'Support & Messenger',
  blogs: 'Insights',
  users: 'Staff & Roles',
  ai: 'Model Settings',
  settings: 'Settings',
  seo: 'SEO & Metadata'
};

const TAB_LABELS_BN: Record<AdminTab, string> = {
  overview: 'সংক্ষিপ্ত বিবরণ',
  customers: 'গ্রাহকবৃন্দ',
  hero: 'হিরো স্লাইডশো',
  topics: 'আলোচনাসমূহ',
  support: 'সাপোর্ট ও মেসেঞ্জার',
  blogs: 'ইনসাইটস',
  users: 'কর্মী ও ভূমিকা',
  ai: 'মডেল সেটিংস',
  settings: 'সেটিংস',
  seo: 'এসইও ও মেটাডাটা'
};

const TAB_LABELS_AR: Record<AdminTab, string> = {
  overview: 'نظرة عامة',
  customers: 'العملاء',
  hero: 'شريحة العرض الرئيسية',
  topics: 'المناقشات',
  support: 'الدعم والمراسلة',
  blogs: 'الرؤى والتحليلات',
  users: 'فريق العمل والصلاحيات',
  ai: 'إعدادات النموذج',
  settings: 'الإعدادات',
  seo: 'تحسين محركات البحث'
};

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentTab,
  onExitAdmin,
  unreadCount = 0,
  currentAdminUser,
  onLogout
}) => {
  const { language, setLanguage, t, translateRole } = useLanguage();

  const getTabLabel = (tab: AdminTab) => {
    if (language === 'bn') return TAB_LABELS_BN[tab] || 'সংক্ষিপ্ত বিবরণ';
    if (language === 'ar') return TAB_LABELS_AR[tab] || 'نظرة عامة';
    return TAB_LABELS[tab] || 'Overview';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src={trekLogo}
              alt="Trek Consultancy"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-800">
              {language === 'bn' ? 'অ্যাডমিন' : language === 'ar' ? 'الإدارة' : 'Admin'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 rtl:rotate-180" />
            <span className="text-slate-500 font-medium">{getTabLabel(currentTab)}</span>
          </nav>

          {/* Status badge */}
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === 'bn' ? 'সরাসরি' : language === 'ar' ? 'مباشر' : 'Live'}
          </span>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={
                language === 'bn'
                  ? 'টপিক, অনুসন্ধান, ব্যবহারকারী খুঁজুন...'
                  : language === 'ar'
                  ? 'بحث في المواضيع والاستفسارات...'
                  : 'Search topics, inquiries, users...'
              }
              className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600/30 text-slate-800 placeholder:text-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions + Return to Live Forum + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 3-way Language Switcher */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                language === 'bn'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="বাংলা"
            >
              বাং
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                language === 'ar'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="العربية"
            >
              عر
            </button>
          </div>

          {/* Notifications button */}
          <button
            aria-label="Admin notifications"
            className="relative p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
            )}
          </button>

          {/* Return to Live Forum Button */}
          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Return to Public Forum (/)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'সাইটে ফিরুন' : language === 'ar' ? 'العودة للموقع' : 'Exit to Site'}
            </span>
            <span className="sm:hidden">
              {language === 'bn' ? 'প্রস্থান' : language === 'ar' ? 'خروج' : 'Exit'}
            </span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pl-2 rtl:pl-0 rtl:pr-2 border-l rtl:border-l-0 rtl:border-r border-slate-200">
            <img
              src={currentAdminUser?.avatar || getRandomAvatar(currentAdminUser?.email || currentAdminUser?.name)}
              alt={currentAdminUser?.name || 'Administrator'}
              className="w-7 h-7 rounded-lg ring-1 ring-slate-200 object-cover shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(currentAdminUser?.name || 'Admin');
              }}
            />
            <div className="text-left rtl:text-right leading-tight hidden xl:block max-w-[120px] truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">{currentAdminUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{translateRole(currentAdminUser?.role || 'Super Admin')}</p>
            </div>

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ml-1 rtl:ml-0 rtl:mr-1"
                title="Log out of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5 rtl:rotate-180" />
                <span className="hidden md:inline">
                  {language === 'bn' ? 'লগআউট' : language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

