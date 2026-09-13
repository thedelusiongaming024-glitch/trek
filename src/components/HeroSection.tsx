import React from 'react';
import { Search, X, Bell } from 'lucide-react';
import { PlatformSettings } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag?: (tag: string) => void;
  children?: React.ReactNode;
  settings?: PlatformSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectTag,
  children,
  settings
}) => {
  return (
    <div className="relative pb-20 md:pb-24 overflow-hidden">
      {/* Announcement Banner (if configured in Database Platform Settings) */}
      {settings?.showAnnouncement && settings?.announcementText && (
        <div className="relative z-50 bg-gradient-to-r from-teal-600 via-[#00a8b5] to-emerald-600 text-white text-xs font-semibold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-2">
          <Bell className="w-3.5 h-3.5 animate-bounce shrink-0" />
          <span>{settings.announcementText}</span>
        </div>
      )}

      {/* Faceted Geometric Polyhedral Purple/Violet Background Mesh matching reference */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Deep purple base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#180933] via-[#2a0f52] to-[#140628]" />

        <svg
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="pGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c1055" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#16082d" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="pGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#481a85" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#240c49" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="pGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1b0a36" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#381467" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="pGradHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5b20a4" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#290f50" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="pGradDeep" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1c0a38" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#110522" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* Row 1 Top Facets */}
          <polygon points="0,0 260,0 150,150 0,130" fill="url(#pGrad1)" />
          <polygon points="260,0 540,0 380,140 150,150" fill="url(#pGrad2)" />
          <polygon points="540,0 860,0 680,130 380,140" fill="url(#pGradHighlight)" />
          <polygon points="860,0 1180,0 1020,150 680,130" fill="url(#pGrad2)" />
          <polygon points="1180,0 1440,0 1440,140 1280,130 1020,150" fill="url(#pGrad1)" />

          {/* Row 2 Center Facets */}
          <polygon points="0,130 150,150 140,290 0,270" fill="url(#pGrad3)" />
          <polygon points="150,150 380,140 320,310 140,290" fill="url(#pGradHighlight)" />
          <polygon points="380,140 680,130 560,280 320,310" fill="url(#pGrad2)" />
          <polygon points="680,130 1020,150 820,310 560,280" fill="url(#pGradHighlight)" />
          <polygon points="1020,150 1280,130 1160,290 820,310" fill="url(#pGrad1)" />
          <polygon points="1280,130 1440,140 1440,280 1160,290" fill="url(#pGrad3)" />

          {/* Row 3 Mid-Bottom Facets */}
          <polygon points="0,270 140,290 190,460 0,440" fill="url(#pGradDeep)" />
          <polygon points="140,290 320,310 440,460 190,460" fill="url(#pGrad1)" />
          <polygon points="320,310 560,280 720,440 440,460" fill="url(#pGrad3)" />
          <polygon points="560,280 820,310 960,450 720,440" fill="url(#pGradHighlight)" />
          <polygon points="820,310 1160,290 1220,460 960,450" fill="url(#pGrad2)" />
          <polygon points="1160,290 1440,280 1440,450 1220,460" fill="url(#pGradDeep)" />

          {/* Row 4 Bottom Edge Facets */}
          <polygon points="0,440 190,460 260,600 0,600" fill="url(#pGradDeep)" />
          <polygon points="190,460 440,460 580,600 260,600" fill="url(#pGrad3)" />
          <polygon points="440,460 720,440 880,600 580,600" fill="url(#pGrad1)" />
          <polygon points="720,440 960,450 1160,600 880,600" fill="url(#pGrad2)" />
          <polygon points="960,450 1220,460 1440,600 1160,600" fill="url(#pGrad3)" />
          <polygon points="1220,460 1440,450 1440,600" fill="url(#pGradDeep)" />

          {/* Facet White Line Overlays for authentic low-poly look */}
          <line x1="260" y1="0" x2="150" y2="150" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="540" y1="0" x2="380" y2="140" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="860" y1="0" x2="680" y2="130" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="1180" y1="0" x2="1020" y2="150" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />

          <line x1="150" y1="150" x2="380" y2="140" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="380" y1="140" x2="680" y2="130" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="680" y1="130" x2="1020" y2="150" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="1020" y1="150" x2="1280" y2="130" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />

          <line x1="150" y1="150" x2="140" y2="290" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          <line x1="380" y1="140" x2="320" y2="310" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="680" y1="130" x2="560" y2="280" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="1020" y1="150" x2="820" y2="310" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="1280" y1="130" x2="1160" y2="290" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />

          <line x1="140" y1="290" x2="320" y2="310" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="320" y1="310" x2="560" y2="280" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="560" y1="280" x2="820" y2="310" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="820" y1="310" x2="1160" y2="290" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />

          <line x1="320" y1="310" x2="440" y2="460" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          <line x1="560" y1="280" x2="720" y2="440" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="820" y1="310" x2="960" y2="450" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          <line x1="440" y1="460" x2="720" y2="440" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          <line x1="720" y1="440" x2="960" y2="450" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
        </svg>

        {/* Ambient subtle vignette overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#180933]/40 via-transparent to-[#140628]/30 pointer-events-none" />
      </div>

      {/* Render children (such as Navbar) seamlessly at top of faceted canvas */}
      {children}

      {/* Content Container */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10 pt-8 sm:pt-12">
        {/* Main Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 sm:mb-3 font-heading drop-shadow-sm px-2">
          Welcome to {settings?.forumName || 'Ama'} Support Center
        </h1>
        {settings?.forumTagline && (
          <p className="text-xs sm:text-sm text-teal-200/90 font-medium mb-5 sm:mb-7 max-w-xl mx-auto">
            {settings.forumTagline}
          </p>
        )}
        {!settings?.forumTagline && (
          <div className="mb-5 sm:mb-7" />
        )}

        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto px-1 sm:px-0">
          <div className="relative flex items-center bg-white/90 dark:bg-white/15 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] border border-white/80 dark:border-white/25 transition-all focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-transparent">
            <div className="pl-4 pr-2 py-3 sm:py-3.5 text-slate-400">
              <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>

            <input
              type="text"
              id="hero-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for Topics...."
              className="w-full py-3 sm:py-3.5 pr-10 text-slate-900 dark:text-white placeholder-slate-400 text-base font-normal bg-transparent focus:outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
