import React, { useState, useEffect, useRef } from 'react';
import { 
  FileQuestion, 
  MessageSquarePlus, 
  ShieldCheck, 
  LogOut, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Globe
} from 'lucide-react';
import trekLogo from '../assets/trek-logo.webp';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenPostModal: () => void;
  onOpenAdmin: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  currentUser?: { name: string; email: string; role: string; avatar?: string } | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenPostModal,
  onOpenAdmin,
  activeNav,
  setActiveNav,
  currentUser,
  onSignOut
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle pill elevation and compression
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', bn: 'হোম' },
    { id: 'forum', label: 'Forums', bn: 'ফোরাম' },
    { id: 'blog', label: 'Knowledge Base', bn: 'নলেজ বেস' },
    { id: 'documentation', label: 'Consultancy', bn: 'পরামর্শ' },
    { id: 'jobs', label: 'Careers', bn: 'ক্যারিয়ার' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-[padding] duration-200 ease-out px-3 sm:px-6 md:px-8 ${
        isScrolled ? 'pt-2.5 sm:pt-3' : 'pt-3.5 sm:pt-4.5'
      }`}
    >
      <div className="w-full max-w-7xl flex flex-col items-center">
        {/* Floating Glassmorphic Pill Capsule Navbar - Pure Light Theme */}
        <nav
          className={`pointer-events-auto w-full rounded-full transition-[background-color,border-color,box-shadow,padding] duration-200 ease-out flex items-center justify-between transform-gpu ${
            isScrolled
              ? 'py-2 sm:py-2.5 px-3.5 sm:px-6 glass-navbar-scrolled bg-white/70 border border-white/80 shadow-[0_14px_45px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)]'
              : 'py-2.5 sm:py-3 px-4 sm:px-7 glass-navbar bg-white/60 border border-white/75 shadow-[0_10px_35px_rgba(0,0,0,0.08),inset_0_1px_1.5px_rgba(255,255,255,0.9)]'
          }`}
        >
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setActiveNav('home')}
              className="flex items-center text-left focus:outline-none group cursor-pointer shrink-0 py-0.5"
              aria-label="Trek Consultancy Home"
            >
              <img
                src={trekLogo}
                alt="Trek Consultancy"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-900 border border-teal-500/30 shadow-xs backdrop-blur-md'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {language === 'bn' ? item.bn : item.label}
                </button>
              );
            })}
          </div>

          {/* Right: Controls (Profile, Language Switcher, CTA Button) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 1. Account / Profile */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full bg-white/45 hover:bg-white/70 border border-white/70 text-slate-800 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-white"
                  />
                  <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-1.5 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-teal-600 font-semibold">{currentUser.role}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenPostModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-teal-500/10 hover:text-teal-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-teal-600" />
                      <span>{language === 'bn' ? 'প্রশ্ন তৈরি করুন' : 'Post a Question'}</span>
                    </button>

                    {(currentUser.role === 'Super Admin' || currentUser.role === 'Moderator') && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-teal-500/10 hover:text-teal-700 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>{language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
                      </button>
                    )}

                    {onSignOut && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-rose-50 text-rose-600 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/45 hover:bg-white/70 text-slate-800 hover:text-slate-950 text-xs font-semibold border border-white/70 backdrop-blur-md transition-all cursor-pointer shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>{language === 'bn' ? 'সাইন ইন' : 'Sign In'}</span>
              </button>
            )}

            {/* 2. Bilingual Language Switcher (matching reference design: 🌐 EN | বাং) */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 p-0.5 px-1.5 sm:px-2 rounded-full bg-white/45 hover:bg-white/70 border border-white/70 backdrop-blur-md transition-all text-xs font-semibold text-slate-800 cursor-pointer shadow-xs"
              title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600 ml-0.5" />
              <div className="flex items-center gap-0.5 text-[11px] font-semibold">
                <span
                  className={`px-1.5 py-0.5 rounded-full transition-all ${
                    language === 'en'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  EN
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full transition-all ${
                    language === 'bn'
                      ? 'bg-white text-teal-800 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  বাং
                </span>
              </div>
            </button>

            {/* 3. Primary CTA Button (matching reference design deep green/teal pill) */}
            <button
              onClick={currentUser ? onOpenPostModal : onOpenAuth}
              id="nav-ask-question-btn"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full bg-[#005a4e] hover:bg-[#00473e] text-white shadow-md shadow-teal-950/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রশ্ন করুন' : 'Ask Question'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-white/40 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden pointer-events-auto mt-2 w-full p-4 rounded-3xl glass-navbar bg-white/75 backdrop-blur-3xl border border-white/80 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User card in mobile menu if logged in */}
            {currentUser ? (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/80 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-teal-600 font-semibold">{currentUser.role}</p>
                  </div>
                </div>
                {onSignOut && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    {language === 'bn' ? 'লগআউট' : 'Sign Out'}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#005a4e] text-white font-semibold text-sm shadow-md shadow-teal-950/20 mb-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{language === 'bn' ? 'লগইন বা রেজিস্টার করুন' : 'Login or Register'}</span>
              </button>
            )}

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[42px] flex items-center px-4 py-2 rounded-2xl text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === item.id
                    ? 'bg-teal-500/15 text-teal-700 font-semibold'
                    : 'text-slate-700 hover:bg-teal-500/10 hover:text-teal-600'
                }`}
              >
                {language === 'bn' ? item.bn : item.label}
              </button>
            ))}

            {/* Admin Portal link in mobile menu if privileged */}
            {currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Moderator') && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-teal-700 hover:bg-teal-500/10 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
              </button>
            )}

            {/* Mobile Actions: Post Question */}
            <div className="pt-2 border-t border-slate-200/60 space-y-2">
              <button
                onClick={() => {
                  onOpenPostModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-center rounded-2xl bg-[#005a4e] hover:bg-[#00473e] active:scale-98 text-white font-semibold text-sm shadow-md shadow-teal-950/20 cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন প্রশ্ন লিখুন' : 'Post a Question'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
