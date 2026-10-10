import React from 'react';
import trekLogo from '../assets/trek-logo.webp';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate?: (view: string) => void;
  onOpenHelp?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { t, language } = useLanguage();
  return (
    <footer className="w-full bg-[#1c4447] text-white pt-14 sm:pt-16 pb-10 sm:pb-12 relative overflow-hidden select-none">
      {/* Ambient background glow accents matching Saudi corporate palette */}
      <div className="absolute top-0 right-1/4 w-96 h-36 bg-teal-400/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-10 w-96 h-36 bg-cyan-400/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Section: Brand Information & Blurb (Exact match to Image 1) */}
        <div className="pb-10 sm:pb-12 max-w-2xl space-y-4">
          <div className="flex items-center">
            <img
              src={trekLogo}
              alt="Trek Consultancy"
              className="h-11 sm:h-12 w-auto object-contain brightness-105"
            />
          </div>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed font-normal">
            {t('Your trusted partner for Saudi business setup, MISA licensing, software development, real estate investment, visa services, and international company formation. We help investors and businesses grow with end-to-end professional solutions.')}
          </p>
        </div>

        {/* Bottom Bar: Exact Match to Image 2 */}
        <div className="border-t border-white/15 pt-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          {/* Left Column: Policies & Copyright */}
          <div className="flex flex-col gap-3">
            {/* Policy & Company Links pointing to official Trek Consultancy pages */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-sm font-semibold text-white">
              <a
                href="https://www.trekconsultancy.com/about-us/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-200 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                {t('About Us')}
              </a>
              <a
                href="https://www.trekconsultancy.com/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-200 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                {t('Contact')}
              </a>
              <a
                href="https://www.trekconsultancy.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-200 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                {t('Privacy Policy')}
              </a>
              <a
                href="https://www.trekconsultancy.com/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-200 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                {t('Terms of Service')}
              </a>
              <a
                href="https://www.trekconsultancy.com/refund-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-200 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                {t('Refund Policy')}
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs sm:text-sm text-white/80 font-normal">
              {language === 'bn' ? (
                <>
                  © ২০২৩–২০২৬{' '}
                  <a
                    href="https://b2bfiy.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-teal-200 underline underline-offset-4 decoration-white/40 hover:decoration-teal-200 transition-colors cursor-pointer"
                  >
                    B2bfiy
                  </a>
                  । সর্বস্বত্ব সংরক্ষিত।
                </>
              ) : language === 'ar' ? (
                <>
                  © ٢٠٢٣–٢٠٢٦{' '}
                  <a
                    href="https://b2bfiy.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-teal-200 underline underline-offset-4 decoration-white/40 hover:decoration-teal-200 transition-colors cursor-pointer"
                  >
                    B2bfiy
                  </a>
                  . جميع الحقوق محفوظة.
                </>
              ) : (
                <>
                  © 2023–2026{' '}
                  <a
                    href="https://b2bfiy.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-teal-200 underline underline-offset-4 decoration-white/40 hover:decoration-teal-200 transition-colors cursor-pointer"
                  >
                    B2bfiy
                  </a>
                  . All Rights Reserved.
                </>
              )}
            </div>
          </div>

          {/* Right Column: Outlined Social Icon Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/70 hover:border-white hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13.5 22V12.5h3.1l.5-3.6h-3.6V6.6c0-1 .3-1.8 1.8-1.8h2V1.6c-.3 0-1.5-.2-2.9-.2-2.9 0-4.8 1.8-4.8 5v2.5H6.5v3.6h3.1V22h3.9z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/70 hover:border-white hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/70 hover:border-white hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/70 hover:border-white hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/70 hover:border-white hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.33 0 .64.05.94.15V8.98a6.34 6.34 0 0 0-.94-.07C6.01 8.91 3.5 11.42 3.5 14.52s2.51 5.61 5.61 5.61c3.1 0 5.61-2.51 5.61-5.61V8.58c1.55 1.1 3.44 1.76 5.48 1.83V6.95a4.87 4.87 0 0 1-.61-.26z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  };
