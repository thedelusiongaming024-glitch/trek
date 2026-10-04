import React from 'react';
import { 
  MessageSquare, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  AlertCircle, 
  Plus
} from 'lucide-react';
import { ForumTopic, ConsultancyInquiry, AdminUser, ActivityLog } from '../../types';

interface AdminOverviewTabProps {
  topics: ForumTopic[];
  consultancyLeads: ConsultancyInquiry[];
  users: AdminUser[];
  activityLogs: ActivityLog[];
  onNavigateTab: (tab: any) => void;
  onOpenNewTopicModal: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  topics,
  consultancyLeads,
  users,
  activityLogs,
  onNavigateTab,
  onOpenNewTopicModal
}) => {
  const pendingLeads = consultancyLeads.filter(l => l.status === 'new' || l.status === 'reviewing');
  const handledLeads = consultancyLeads.filter(l => l.status === 'contacted' || l.status === 'resolved');
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
      label: 'Consultancy Inquiries',
      value: consultancyLeads.length.toString(),
      subtext: consultancyLeads.length === 0
        ? 'No pending inquiries'
        : `${pendingLeads.length} awaiting review • ${handledLeads.length} handled`,
      icon: Briefcase,
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
            Platform health, forum activity, and incoming consultancy inquiries.
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
            onClick={() => onNavigateTab('consultancy')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Inquiries ({pendingLeads.length})</span>
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

      {/* Two-Column Layout: Priority Inquiries + Live Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Priority Consultancy Inquiries */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Priority Consultancy Inquiries
                </h2>
                <p className="text-[11px] text-slate-500">
                  Recent architectural and enterprise engagement requests
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('consultancy')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View all ({consultancyLeads.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {consultancyLeads.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No consultancy inquiries in queue.
              </div>
            ) : (
              consultancyLeads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1 max-w-lg min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900">
                        {lead.company}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                        lead.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : lead.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {lead.priority}
                      </span>
                      <span className="text-[11px] text-slate-400">• {lead.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 leading-normal">
                      {lead.scope}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200/60">
                      {lead.status}
                    </span>
                    <button
                      onClick={() => onNavigateTab('consultancy')}
                      className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      Manage
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
                  Audit Activity
                </h2>
                <p className="text-[11px] text-slate-500">
                  Recent actions by staff
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70">
              Live
            </span>
          </div>

          <div className="p-4 space-y-3.5 flex-1">
            {activityLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent activity logged.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-slate-800 text-xs">
                      <span className="font-semibold text-slate-900">{log.actor}</span> {log.action}
                    </p>
                    <p className="text-slate-500 truncate text-[11px]">{log.target}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{log.timeAgo}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => onNavigateTab('topics')}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium text-center transition-colors cursor-pointer shadow-2xs"
            >
              Browse All Discussions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
