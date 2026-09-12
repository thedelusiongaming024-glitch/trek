import React from 'react';
import { 
  MessageSquare, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  AlertCircle,
  Plus,
  FileText,
  ShieldAlert
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
      label: 'Total Forum Topics',
      value: topics.length.toString(),
      change: topics.length === 0 
        ? '0 active discussions' 
        : `${totalViews.toLocaleString()} views • ${totalLikes} likes`,
      icon: MessageSquare,
      iconColor: 'text-[#00a8b5]',
      iconBg: 'bg-teal-500/10'
    },
    {
      label: 'Consultancy Inquiries',
      value: consultancyLeads.length.toString(),
      change: consultancyLeads.length === 0
        ? '0 pending inquiries'
        : `${pendingLeads.length} awaiting review • ${handledLeads.length} handled`,
      icon: Briefcase,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500/10'
    },
    {
      label: 'Total Discussion Replies',
      value: totalReplies.toString(),
      change: totalReplies === 0
        ? '0 replies recorded'
        : `${(totalReplies / (topics.length || 1)).toFixed(1)} avg per topic`,
      icon: TrendingUp,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-500/10'
    },
    {
      label: 'Active Community Staff',
      value: users.length.toString(),
      change: users.length === 0
        ? '0 registered accounts'
        : `${activeStaff} active • ${superAdminCount} super admin`,
      icon: Users,
      iconColor: 'text-teal-700',
      iconBg: 'bg-teal-600/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner with Glassmorphic Gradient */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent border border-white/80 backdrop-blur-2xl shadow-sm overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-400/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-teal-700 text-xs font-semibold mb-3 border border-teal-500/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Community Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Ama Platform Control Center
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mt-1.5 leading-relaxed">
              Real-time administrative telemetry, discussion moderation, consultancy leads pipeline, and knowledge base publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTopicModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Official Topic</span>
            </button>
            <button
              onClick={() => onNavigateTab('consultancy')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 text-xs font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-md"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Review Leads ({pendingLeads.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - Strictly Glassmorphic & No Black Backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="relative rounded-2xl p-5 sm:p-6 bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_10px_30px_rgba(0,168,181,0.04)] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <div className={`p-2.5 rounded-xl ${kpi.iconBg} ${kpi.iconColor} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
                {kpi.value}
              </div>
              <div className="mt-2 text-xs font-medium text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Two-Column Layout: Urgent Inquiries + Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Inquiries Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900">
                    Priority Consultancy Inquiries
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-value enterprise architectural proposals awaiting assignment
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('consultancy')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all ({consultancyLeads.length})
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100/80 mt-2">
              {consultancyLeads.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No consultancy inquiries in the queue.
                </div>
              ) : (
                consultancyLeads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors">
                          {lead.company}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          lead.priority === 'urgent'
                            ? 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                            : lead.priority === 'high'
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            : 'bg-teal-500/10 text-teal-700 border border-teal-500/20'
                        }`}>
                          {lead.priority}
                        </span>
                        <span className="text-[11px] text-slate-400">• {lead.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {lead.scope}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {lead.status}
                      </span>
                      <button
                        onClick={() => onNavigateTab('consultancy')}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00a8b5] hover:bg-[#0096a3] text-white shadow-xs transition-all cursor-pointer backdrop-blur-md"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Stream */}
        <div className="rounded-3xl p-6 bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-heading font-bold text-slate-900">
                Live Audit Logs
              </h3>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Real-time
            </span>
          </div>

          <div className="mt-4 space-y-4 flex-1">
            {activityLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent administrative activity logged.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-slate-800 font-medium">
                      <span className="font-bold text-slate-900">{log.actor}</span> {log.action}
                    </p>
                    <p className="text-slate-500 truncate">{log.target}</p>
                    <p className="text-[10px] text-slate-400">{log.timeAgo}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('topics')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold text-center transition-colors cursor-pointer"
            >
              Browse All Forum Discussions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
