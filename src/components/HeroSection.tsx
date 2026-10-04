import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, TrendingUp, Shield, Users, Sparkles } from 'lucide-react';
import { HeroSettings } from '../types';
import { defaultAdminHeroSettings } from './admin/AdminHeroTab';
import { useLanguage } from '../context/LanguageContext';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag?: (tag: string) => void;
  heroSettings?: HeroSettings;
  children?: React.ReactNode;
}

const DEFAULT_TRENDING_TAGS = [
  'Cloud Architecture',
  'React & Vite',
  'DevOps & CI/CD',
  'Database Scaling',
  'Microservices',
  'Enterprise Security'
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectTag,
  heroSettings,
  children
}) => {
  const { t } = useLanguage();
  // Filter active slides from settings or fallback to defaultAdminHeroSettings
  const activeSlides = useMemo(() => {
    const raw = heroSettings?.slides && heroSettings.slides.length > 0
      ? heroSettings.slides
      : defaultAdminHeroSettings.slides;
    const list = raw.filter(s => s.isActive !== false);
    return list.length > 0 ? list : defaultAdminHeroSettings.slides;
  }, [heroSettings?.slides]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Reset index safely if active slides change
  useEffect(() => {
    if (currentIndex >= activeSlides.length && activeSlides.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Autoplay slideshow timer: auto change every 2 seconds
  useEffect(() => {
    const shouldAutoplay = heroSettings ? heroSettings.autoplay : true;
    if (!shouldAutoplay || isPaused || activeSlides.length <= 1) return;

    const intervalSeconds = 2;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSlides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [heroSettings?.autoplay, isPaused, activeSlides.length]);

  // Determine section height / length
  const getHeroHeightClasses = (height?: string) => {
    switch (height) {
      case 'standard':
        return 'min-h-[620px] sm:min-h-[680px] md:min-h-[720px] pt-28 sm:pt-36 md:pt-40 pb-20 sm:pb-24';
      case 'cinematic':
        return 'min-h-[820px] sm:min-h-[900px] md:min-h-[960px] lg:min-h-[1020px] pt-36 sm:pt-48 md:pt-56 lg:pt-60 pb-32 sm:pb-40 md:pb-44';
      case 'fullscreen':
        return 'min-h-screen pt-36 sm:pt-44 md:pt-52 lg:pt-56 pb-28 sm:pb-36';
      case 'tall':
      default:
        return 'min-h-[720px] sm:min-h-[800px] md:min-h-[860px] lg:min-h-[920px] pt-32 sm:pt-42 md:pt-48 lg:pt-52 pb-24 sm:pb-32 md:pb-36';
    }
  };

  const isZoomEffect = heroSettings?.transitionEffect === 'zoom';
  const heroHeightClass = getHeroHeightClasses(heroSettings?.heroHeight);

  const headingText = heroSettings?.title || defaultAdminHeroSettings.title || 'Welcome to Trek Consultancy Forum';
  const subtitleText = heroSettings?.subtitle !== undefined ? heroSettings.subtitle : defaultAdminHeroSettings.subtitle;
  const searchPlaceholder = heroSettings?.searchPlaceholder || defaultAdminHeroSettings.searchPlaceholder || 'Search for Topics, Solutions, & Guides....';

  const handleTagClick = (tag: string) => {
    if (onSelectTag) {
      onSelectTag(tag);
    } else {
      onSearchChange(tag);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden select-none flex flex-col justify-between ${heroHeightClass}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slideshow Layer: Clean & Crystal Clear with NO Dimming Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-slate-950">
        {/* Render all active slides for instant smooth crossfade transitions */}
        {activeSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.url}
                alt={slide.title || 'Hero Background'}
                className={`w-full h-full object-cover object-center transform-gpu will-change-transform transition-transform duration-[7000ms] ease-out ${
                  isZoomEffect && isActive ? 'scale-[1.08]' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultAdminHeroSettings.slides[0].url) {
                    target.src = defaultAdminHeroSettings.slides[0].url;
                  }
                }}
              />
            </div>
          );
        })}

        {/* Fallback base gradient ONLY if no slides configured */}
        {activeSlides.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#180933] via-[#2a0f52] to-[#140628]" />
        )}
      </div>

      {/* Top Region: Render children (e.g. Floating Navbar) */}
      <div className="relative z-20">
        {children}
      </div>

      {/* Center Region: Main Hero Foreground Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10 my-auto py-8">
        {/* Slide Title / Category Badge if current slide has one */}
        {activeSlides.length > 0 && activeSlides[currentIndex]?.title && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-semibold text-white mb-4 animate-fade-in shadow-xl">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>{t(activeSlides[currentIndex].title)}</span>
          </div>
        )}

        {/* Main Heading: Crystal Clear with High-Contrast Text Drop Shadow */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 sm:mb-6 font-heading drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] px-2 leading-tight sm:leading-tight">
          {t(headingText)}
        </h1>

        {/* Optional Subtitle */}
        {subtitleText && (
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white font-medium mb-8 sm:mb-10 px-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-relaxed">
            {t(subtitleText)}
          </p>
        )}

        {/* Enhanced Search Bar Container */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto px-1 sm:px-0">
          <div className="relative flex items-center bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/80 transition-all focus-within:ring-3 focus-within:ring-teal-400 focus-within:border-transparent">
            <div className="pl-4 sm:pl-5 pr-2 py-4 sm:py-5 text-slate-400">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            </div>

            <input
              type="text"
              id="hero-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t(searchPlaceholder)}
              className="w-full py-4 sm:py-5 pr-12 text-slate-900 placeholder-slate-400 text-base sm:text-lg font-normal bg-transparent focus:outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-full cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title={t('Clear search', 'অনুসন্ধান মুছুন')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Trending / Popular Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-5 px-2">
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white mr-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('Trending:')}</span>
            </span>
            {DEFAULT_TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-black/50 hover:bg-black/75 active:scale-95 text-white border border-white/25 backdrop-blur-md transition-all cursor-pointer shadow-md"
              >
                {t(tag)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Region: Slide Indicators & Enterprise Highlights Strip */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 w-full pt-4 pb-2">
        {/* Interactive Slide Indicator Dots & Prev/Next Chevrons */}
        {activeSlides.length > 1 && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setCurrentIndex(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/20 shadow-lg"
              title={t('Previous slide', 'পূর্ববর্তী স্লাইড')}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-7 h-2 bg-teal-400 shadow-xs shadow-teal-400/80'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % activeSlides.length)}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/20 shadow-lg"
              title={t('Next slide', 'পরবর্তী স্লাইড')}
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Minimalist Corporate Credibility Badges */}
        <div className="hidden sm:flex items-center justify-center gap-6 md:gap-10 text-[11px] md:text-xs text-white font-semibold pt-2 border-t border-white/20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('Trek Enterprise Advisory')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('10,000+ Solutions Discussed')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('Verified Engineering Insights')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
