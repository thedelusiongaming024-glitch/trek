import React from 'react';
import { Layers, Circle, ArrowRight } from 'lucide-react';
import { RecentTopic, RecentReply } from '../types';

interface ForumSidebarProps {
  recentTopics: RecentTopic[];
  recentReplies: RecentReply[];
  onOpenConsultancy: () => void;
  onSelectRecentTopic: (topicTitle: string) => void;
}

export const ForumSidebar: React.FC<ForumSidebarProps> = ({
  recentTopics,
  recentReplies,
  onOpenConsultancy,
  onSelectRecentTopic
}) => {
  return (
    <aside className="space-y-6">
      {/* 1. Ama Consultancy Card with frosted glass */}
      <div className="rounded-2xl bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 p-6 text-center relative overflow-hidden group shadow-[0_8px_30px_rgb(31,38,135,0.06)] hover:shadow-[0_16px_36px_rgb(31,38,135,0.12)] transition-all">
        {/* Ambient glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-24 bg-teal-500/15 blur-2xl rounded-full pointer-events-none" />

        {/* Brand Icon Box */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 shadow-sm group-hover:scale-105 transition-transform backdrop-blur-md">
          <Layers className="w-7 h-7" />
        </div>

        <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2 font-heading tracking-tight">
          Ama Consultancy
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5 max-w-xs mx-auto">
          Access our primary corporate platform for complete business solutions and architecture reviews.
        </p>

        <button
          onClick={onOpenConsultancy}
          className="w-full py-2.5 px-4 text-xs font-semibold rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white shadow-md shadow-teal-500/20 active:scale-98 transition-all cursor-pointer backdrop-blur-md"
        >
          Visit Main Website
        </button>
      </div>

      {/* 2. Recent Topics Card with frosted glass */}
      <div className="rounded-2xl bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 p-5 sm:p-6 shadow-[0_8px_30px_rgb(31,38,135,0.06)] hover:shadow-[0_16px_36px_rgb(31,38,135,0.12)] transition-all">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200/70 dark:border-white/10">
          <Circle className="w-2.5 h-2.5 fill-[#00a8b5] text-[#00a8b5]" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight font-heading">
            Recent Topics
          </h4>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-white/10 space-y-3 pt-1">
          {recentTopics.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No recent topics yet</p>
          ) : (
            recentTopics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => onSelectRecentTopic(topic.title)}
                className={`pt-2 cursor-pointer group transition-colors ${index === 0 ? 'pt-0' : ''}`}
              >
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors flex items-center justify-between">
                  <span>{topic.title}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400" />
                </h5>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>by <span className="text-slate-700 dark:text-slate-300 font-medium">{topic.author}</span></span>
                  <span>•</span>
                  <span>{topic.timeAgo}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Recent Replies Card with frosted glass */}
      <div className="rounded-2xl bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 p-5 sm:p-6 shadow-[0_8px_30px_rgb(31,38,135,0.06)] hover:shadow-[0_16px_36px_rgb(31,38,135,0.12)] transition-all">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200/70 dark:border-white/10">
          <Circle className="w-2.5 h-2.5 fill-[#00a8b5] text-[#00a8b5]" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight font-heading">
            Recent Replies
          </h4>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-white/10 space-y-3 pt-1">
          {recentReplies.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No recent replies yet</p>
          ) : (
            recentReplies.map((reply, index) => (
              <div
                key={reply.id}
                onClick={() => onSelectRecentTopic(reply.topicTitle)}
                className={`pt-2 cursor-pointer group transition-colors ${index === 0 ? 'pt-0' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0 group-hover:bg-teal-500 transition-colors" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-800 dark:text-white">{reply.author}</span>
                      <span className="text-slate-400"> on </span>
                      <span className="text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors font-medium">{reply.topicTitle}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{reply.timeAgo}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
