import React from 'react';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { AdminTab } from '../../types';

interface AdminNavbarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  unreadCount?: number;
  currentAdminUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  unreadCount = 2,
  currentAdminUser,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-2xl border-b border-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand + Admin Pill Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-2xl tracking-tight text-slate-900">
              Ama
            </span>
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span className="ml-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 border border-teal-500/20 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Admin Portal
            </span>
          </div>

          {/* System status pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Operational
          </div>
        </div>

        {/* Center: Search in Admin */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics, consultancy leads, authors..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder:text-slate-400 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Right: Actions + Return to Live Forum + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Notifications button */}
          <button
            aria-label="Admin notifications"
            className="relative p-2 rounded-full bg-white/60 hover:bg-white/90 border border-slate-200/80 text-slate-600 hover:text-teal-600 transition-colors cursor-pointer shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
            )}
          </button>

          {/* Return to Live Forum Button (prominent glass pill with teal accent) */}
          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            title="Return to Public Forum (/)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Community</span>
            <span className="sm:hidden">Site</span>
          </button>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Admin avatar"
              className="w-8 h-8 rounded-full ring-2 ring-teal-500/30 object-cover shrink-0"
            />
            <div className="text-left leading-tight hidden xl:block max-w-[120px] truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{currentAdminUser?.name || 'Alex Ross'}</p>
              <p className="text-[10px] text-teal-600 font-medium truncate">{currentAdminUser?.role || 'Super Admin'}</p>
            </div>

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
                title="Log out of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
