import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenHelp: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenHelp, onOpenAdmin }) => {
  return (
    <footer className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 pt-12 sm:pt-16 pb-10 sm:pb-12 text-slate-600 dark:text-slate-400 relative">
      {/* Ambient glass glow at bottom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-teal-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 sm:pb-10">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-bold text-3xl tracking-tight text-slate-900 dark:text-white">
              Ama
            </span>
            <span className="h-2 w-2 rounded-full bg-teal-500 mt-2" />
          </div>

          {/* Primary Navigation with Help Pill */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium">
            <button
              onClick={() => onNavigate('blog')}
              className="px-2 py-1.5 min-h-[36px] text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Blog
            </button>
            <button
              onClick={() => onNavigate('forum')}
              className="px-2 py-1.5 min-h-[36px] text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Forums
            </button>
            {/* Help Pill Button matching reference */}
            <button
              onClick={onOpenHelp}
              className="px-4 py-1.5 min-h-[36px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs shadow-md shadow-teal-500/25 transition-all cursor-pointer backdrop-blur-md flex items-center justify-center"
            >
              Help
            </button>
            <button
              onClick={onOpenHelp}
              className="px-2 py-1.5 min-h-[36px] text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Social Icons matching reference colors */}
          <div className="flex items-center gap-3 sm:gap-2.5">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#0a66c2] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          {/* Sub Navigation Links matching reference */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => onNavigate('forum')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Single Forum
            </button>
            <button
              onClick={() => onNavigate('forum')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Topic Details
            </button>
            <button
              onClick={() => onNavigate('forum')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Forum User
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Articles
            </button>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors cursor-pointer"
                title="Go to /admin"
              >
                Admin Portal (/admin)
              </button>
            )}
          </div>

          {/* Copyright notice matching reference */}
          <div className="text-slate-500">
            © 2025 Ama — All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};
