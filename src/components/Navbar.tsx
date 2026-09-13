import React, { useState } from 'react';
import { Menu, X, HelpCircle } from 'lucide-react';

interface NavbarProps {
  darkMode?: boolean;
  onToggleTheme?: () => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Forum', id: 'forum' },
    { label: 'Documentation', id: 'documentation' },
    { label: 'Jobs', id: 'jobs' },
    { label: 'Blog', id: 'blog' },
  ];

  return (
    <header className="relative z-40 w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveNav('home')}
              className="flex items-center gap-1.5 text-left focus:outline-none group cursor-pointer"
            >
              <span className="font-heading font-bold text-3xl tracking-tight text-white transition-opacity group-hover:opacity-90">
                Ama
              </span>
              <span className="h-2 w-2 rounded-full bg-teal-400 mt-2 animate-pulse" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`text-sm font-medium transition-colors cursor-pointer relative py-1 ${
                    activeNav === item.id
                      ? 'text-teal-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeNav === item.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-400 rounded-full" />
                  )}
                </button>
              </div>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/40"
                  />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-xl p-1.5 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-teal-600 font-semibold">{currentUser.role}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenPostModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-teal-500/10 hover:text-teal-700 font-medium transition-colors"
                    >
                      Post a Question
                    </button>

                    {(currentUser.role === 'Super Admin' || currentUser.role === 'Moderator') && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-teal-500/10 hover:text-teal-700 font-medium transition-colors"
                      >
                        Admin Portal
                      </button>
                    )}

                    {onSignOut && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-rose-50 text-rose-600 font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Login/Ask Button (teal/cyan rounded pill matching image) */
              <button
                onClick={onOpenAuth}
                id="nav-login-ask-btn"
                className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white shadow-md shadow-teal-500/25 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md"
              >
                Login/Ask
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel with smooth backdrop and complete actions */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2.5 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{currentUser.role}</p>
                  </div>
                </div>
                {onSignOut && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#00a8b5] text-white font-semibold text-sm shadow-md shadow-teal-500/25 mb-2"
              >
                <span>Login or Register</span>
              </button>
            )}

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[44px] flex items-center px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors cursor-pointer ${
                  activeNav === item.id
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-teal-500/10 hover:text-teal-600'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Admin Portal link in mobile menu if privileged */}
            {currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Moderator') && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/10 transition-colors"
              >
                <span>Admin Portal</span>
              </button>
            )}

            {/* Mobile Actions: Post Question */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 space-y-2">
              <button
                onClick={() => {
                  onOpenPostModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-[44px] flex items-center justify-center py-2.5 px-4 text-center rounded-2xl bg-[#00a8b5] hover:bg-[#0096a3] active:scale-98 text-white font-semibold text-sm shadow-md shadow-teal-500/20 backdrop-blur-md cursor-pointer"
              >
                Post a Question
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
