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
  Headphones,
  Image as ImageIcon
} from 'lucide-react';
import { AdminNavbar } from './AdminNavbar';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminHeroTab } from './AdminHeroTab';
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
  PlatformSettings,
  HeroSettings,
  DiscussionCategory,
  StaffRoleBadge 
} from '../../types';

interface AdminPanelProps {
  topics: ForumTopic[];
  blogs: BlogPost[];
  consultancyLeads: ConsultancyInquiry[];
  users: AdminUser[];
  activityLogs: ActivityLog[];
  settings: PlatformSettings;
  heroSettings?: HeroSettings;
  onSaveHeroSettings?: (heroSettings: HeroSettings) => Promise<void> | void;
  categories?: DiscussionCategory[];
  staffRoles?: StaffRoleBadge[];
  onAddCategory?: (category: { name: string; description?: string }) => Promise<void> | void;
  onDeleteCategory?: (id: string) => Promise<void> | void;
  onAddStaffRole?: (role: { name: string; badgeLabel?: string; color?: string }) => Promise<void> | void;
  onDeleteStaffRole?: (id: string) => Promise<void> | void;
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
  heroSettings,
  onSaveHeroSettings,
  categories = [],
  staffRoles = [],
  onAddCategory,
  onDeleteCategory,
  onAddStaffRole,
  onDeleteStaffRole,
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
    { id: 'hero' as AdminTab, label: 'Hero Slideshow', icon: ImageIcon },
    { id: 'topics' as AdminTab, label: 'Discussions', icon: MessageSquare, badge: topics.length },
    { id: 'consultancy' as AdminTab, label: 'Consultancy', icon: Briefcase, badge: pendingLeadsCount > 0 ? pendingLeadsCount : undefined, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'support' as AdminTab, label: 'Support & Messenger', icon: Headphones, badgeColor: 'bg-teal-500 text-white' },
    { id: 'blogs' as AdminTab, label: 'Knowledge Base', icon: BookOpen, badge: blogs.length },
    { id: 'users' as AdminTab, label: 'Staff & Roles', icon: Users, badge: users.length },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative selection:bg-teal-600 selection:text-white flex flex-col font-sans">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full flex-1 flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sticky Sidebar */}
        <aside className="w-full md:w-60 shrink-0 md:sticky md:top-20">
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs p-2">
            <div className="hidden md:block px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>

            <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar pb-1 md:pb-0 gap-1" aria-label="Admin Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`shrink-0 md:w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-slate-800 text-teal-300 border border-slate-700'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/70'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:block pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={onExitAdmin}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Return to Live Forum</span>
              </button>
            </div>
          </div>

          {/* System Status Info Card */}
          <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs space-y-1.5 hidden md:block">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Database Sync</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Direct connection to PostgreSQL. Changes reflect instantly on the public portal.
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

          {activeTab === 'hero' && (
            <AdminHeroTab
              heroSettings={heroSettings}
              onSaveHeroSettings={onSaveHeroSettings || (() => {})}
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
              categories={categories}
              staffRoles={staffRoles}
              onAddCategory={onAddCategory}
              onDeleteCategory={onDeleteCategory}
              onAddStaffRole={onAddStaffRole}
              onDeleteStaffRole={onDeleteStaffRole}
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
        categories={categories}
        staffRoles={staffRoles}
      />

      <AdminNewBlogModal
        isOpen={isNewBlogModalOpen}
        onClose={() => setIsNewBlogModalOpen(false)}
        onAddBlog={onAddBlog}
      />
    </div>
  );
};
