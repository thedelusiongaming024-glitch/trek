import React from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Plus,
  UserCheck
} from 'lucide-react';
import { ForumTopic, BlogPost, AdminUser, ActivityLog } from '../../types';

interface AdminOverviewTabProps {
  topics: ForumTopic[];
  blogs: BlogPost[];
  users: AdminUser[];
  activityLogs: ActivityLog[];
  onNavigateTab: (tab: any) => void;
  onOpenNewTopicModal: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  topics,
  blogs,
  users,
  activityLogs,
  onNavigateTab,
  onOpenNewTopicModal
}) => {
  const totalViews = topics.reduce((acc, t) => acc + (t.views || 0), 0);
  const totalReplies = topics.reduce((acc, t) => acc + (t.replies || 0), 0);
  const totalLikes = topics.reduce((acc, t) => acc + (t.likes || 0), 0);
  const activeStaff = users.filter(u => u.status === 'active').length;
  const superAdminCount = users.filter(u => u.role === 'Super Admin').length;

  const kpis = [
    {
      label: 'Forum Topics',
      value: topics.length.toString(),
      subtext: topics.length === 0 
        ? 'No active discussions' 
        : `${totalViews.toLocaleString()} views • ${totalLikes} likes`,
      icon: MessageSquare,
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
    {
      label: 'Knowledge Base',
      value: blogs.length.toString(),
      subtext: blogs.length === 0
        ? '0 articles published'
        : `${blogs.length} guides & tutorials available`,
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Discussion Replies',
      value: totalReplies.toString(),
      subtext: totalReplies === 0
        ? '0 replies recorded'
        : `${(totalReplies / (topics.length || 1)).toFixed(1)} avg per topic`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Staff',
      value: users.length.toString(),
      subtext: users.length === 0
        ? '0 registered accounts'
        : `${activeStaff} active • ${superAdminCount} super admin`,
      icon: Users,
      color: 'text-slate-700',
      bg: 'bg-slate-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform health, forum activity, and knowledge base performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTopicModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Discussion</span>
          </button>
          <button
            onClick={() => onNavigateTab('customers')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Customers & Chats</span>
          </button>
          <button
            onClick={() => onNavigateTab('topics')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Discussions ({topics.length})</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="mt-1 text-xs text-slate-500 truncate">
                  {kpi.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Layout: Recent Discussions + Live Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Recent Forum Discussions */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent Discussions
                </h2>
                <p className="text-[11px] text-slate-500">
                  Latest forum topics posted across the community
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('topics')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View all ({topics.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topics.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active discussions yet.
              </div>
            ) : (
              topics.slice(0, 5).map((topic) => (
                <div key={topic.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1 max-w-lg min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {topic.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {topic.category}
                      </span>
                      <span className="text-[11px] text-slate-400">• by {topic.author}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 leading-normal">
                      {topic.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500 font-mono">
                    <span>{topic.replies || 0} replies</span>
                    <span>•</span>
                    <span>{topic.views || 0} views</span>
                    <button
                      onClick={() => onNavigateTab('topics')}
                      className="ml-2 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Activity Stream */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Live Activity
                </h2>
                <p className="text-[11px] text-slate-500">
                  Real-time events and audit trail
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="p-4 flex-1">
            {activityLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No system activity recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-slate-700 leading-normal">
                        <span className="font-semibold text-slate-900">{log.actor}</span>
                        {' '}
                        <span>{log.action.toLowerCase()}</span>
                        {' '}
                        <span className="font-medium text-slate-800 truncate inline-block max-w-[120px] align-bottom">
                          {log.target}
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {log.timeAgo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
