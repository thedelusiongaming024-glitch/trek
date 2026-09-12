import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Briefcase, 
  BookOpen, 
  Users, 
  Settings, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Headphones
} from 'lucide-react';
import { AdminNavbar } from './AdminNavbar';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminTopicsTab } from './AdminTopicsTab';
import { AdminConsultancyTab } from './AdminConsultancyTab';
import { AdminBlogsTab } from './AdminBlogsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminSupportTab } from './AdminSupportTab';
import { AdminNewTopicModal } from './AdminNewTopicModal';
import { AdminNewBlogModal } from './AdminNewBlogModal';
import { 
  AdminTab, 
  ForumTopic, 
  BlogPost, 
  ConsultancyInquiry, 
  AdminUser, 
  ActivityLog, 
  PlatformSettings 
} from '../../types';

interface AdminPanelProps {
  topics: ForumTopic[];
  blogs: BlogPost[];
  consultancyLeads: ConsultancyInquiry[];
  users: AdminUser[];
  activityLogs: ActivityLog[];
  settings: PlatformSettings;
  onExitAdmin: () => void;
  currentAdminUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  onAddTopic: (topic: ForumTopic) => void;
  onDeleteTopic: (id: string) => void;
  onToggleFeatureTopic: (id: string) => void;
  onTogglePopularTopic: (id: string) => void;
  onViewTopic: (topic: ForumTopic) => void;
  onAddBlog: (blog: BlogPost) => void;
  onDeleteBlog: (id: string) => void;
  onViewBlog: (blog: BlogPost) => void;
  onUpdateConsultancyStatus: (id: string, status: ConsultancyInquiry['status']) => void;
  onUpdateConsultancyNotes: (id: string, notes: string) => void;
  onDeleteConsultancyInquiry: (id: string) => void;
  onUpdateUserRole: (id: string, role: AdminUser['role']) => void;
  onToggleUserStatus: (id: string) => void;
  onAddUser: (user: AdminUser) => void;
  onDeleteUser?: (id: string) => void;
  onSaveSettings: (settings: PlatformSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  topics,
  blogs,
  consultancyLeads,
  users,
  activityLogs,
  settings,
  onExitAdmin,
  currentAdminUser,
  onLogout,
  onAddTopic,
  onDeleteTopic,
  onToggleFeatureTopic,
  onTogglePopularTopic,
  onViewTopic,
  onAddBlog,
  onDeleteBlog,
  onViewBlog,
  onUpdateConsultancyStatus,
  onUpdateConsultancyNotes,
  onDeleteConsultancyInquiry,
  onUpdateUserRole,
  onToggleUserStatus,
  onAddUser,
  onDeleteUser,
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [isNewBlogModalOpen, setIsNewBlogModalOpen] = useState(false);

  const pendingLeadsCount = consultancyLeads.filter(l => l.status === 'new').length;

  const navItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'topics' as AdminTab, label: 'Discussions', icon: MessageSquare, badge: topics.length },
    { id: 'consultancy' as AdminTab, label: 'Consultancy', icon: Briefcase, badge: pendingLeadsCount > 0 ? pendingLeadsCount : undefined, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'support' as AdminTab, label: 'Support & Messenger', icon: Headphones, badgeColor: 'bg-teal-500 text-white' },
    { id: 'blogs' as AdminTab, label: 'Knowledge Base', icon: BookOpen, badge: blogs.length },
    { id: 'users' as AdminTab, label: 'Staff & Roles', icon: Users, badge: users.length },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 relative selection:bg-teal-500 selection:text-white flex flex-col">
      {/* Ambient background mesh gradient matching the reference */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-teal-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-10 left-1/3 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation */}
      <AdminNavbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onExitAdmin={onExitAdmin}
        unreadCount={pendingLeadsCount}
        currentAdminUser={currentAdminUser}
        onLogout={onLogout}
      />

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 relative z-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sticky Glassmorphic Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24">
          <div className="rounded-3xl p-2.5 sm:p-3 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs">
            <div className="hidden md:block px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admin Navigation
            </div>

            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar pb-1 md:pb-0 gap-1.5 md:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`shrink-0 md:w-full flex items-center justify-between gap-2 px-3.5 py-2 sm:py-2.5 min-h-[40px] rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden md:block pt-3 mt-2 border-t border-slate-200/70">
              <button
                onClick={onExitAdmin}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50/50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-teal-600" />
                <span>Return to Live Forum</span>
              </button>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="mt-4 rounded-3xl p-4 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-xl border border-white/80 shadow-xs text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Live Admin Sync</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Modifications made in this portal directly update public forum discussions, knowledge articles, and consultancy queues.
            </p>
          </div>
        </aside>

        {/* Dynamic Content Region */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              topics={topics}
              consultancyLeads={consultancyLeads}
              users={users}
              activityLogs={activityLogs}
              onNavigateTab={setActiveTab}
              onOpenNewTopicModal={() => setIsNewTopicModalOpen(true)}
            />
          )}

          {activeTab === 'topics' && (
            <AdminTopicsTab
              topics={topics}
              onToggleFeature={onToggleFeatureTopic}
              onTogglePopular={onTogglePopularTopic}
              onDeleteTopic={onDeleteTopic}
              onOpenNewTopicModal={() => setIsNewTopicModalOpen(true)}
              onViewTopic={onViewTopic}
            />
          )}

          {activeTab === 'consultancy' && (
            <AdminConsultancyTab
              inquiries={consultancyLeads}
              onUpdateStatus={onUpdateConsultancyStatus}
              onUpdateNotes={onUpdateConsultancyNotes}
              onDeleteInquiry={onDeleteConsultancyInquiry}
            />
          )}

          {activeTab === 'blogs' && (
            <AdminBlogsTab
              blogs={blogs}
              onDeleteBlog={onDeleteBlog}
              onOpenNewBlogModal={() => setIsNewBlogModalOpen(true)}
              onViewBlog={onViewBlog}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={users}
              onUpdateRole={onUpdateUserRole}
              onToggleStatus={onToggleUserStatus}
              onAddUser={onAddUser}
              onDeleteUser={onDeleteUser}
            />
          )}

          {activeTab === 'support' && (
            <AdminSupportTab
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Creation Modals */}
      <AdminNewTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={() => setIsNewTopicModalOpen(false)}
        onAddTopic={onAddTopic}
      />

      <AdminNewBlogModal
        isOpen={isNewBlogModalOpen}
        onClose={() => setIsNewBlogModalOpen(false)}
        onAddBlog={onAddBlog}
      />
    </div>
  );
};
