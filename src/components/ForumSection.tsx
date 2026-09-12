import React from 'react';
import { 
  Plus, 
  Layers, 
  Flame, 
  Bookmark, 
  Clock, 
  HeartCrack, 
  Heart,
  MessageCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ForumTopic, RecentTopic, RecentReply, FilterCategory, PlatformSettings } from '../types';
import { ForumCard } from './ForumCard';
import { ForumSidebar } from './ForumSidebar';
import { useLanguage } from '../context/LanguageContext';

interface ForumSectionProps {
  topics: ForumTopic[];
  filteredTopics: ForumTopic[];
  activeFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  onOpenPostModal: () => void;
  onSelectTopic: (topic: ForumTopic) => void;
  onToggleLike: (e: React.MouseEvent, topicId: string) => void;
  onDeleteTopic?: (topic: ForumTopic) => void;
  canDeleteTopic?: (topic: ForumTopic) => boolean;
  isTopicAuthor?: (topic: ForumTopic) => boolean;
  recentTopics: RecentTopic[];
  recentReplies: RecentReply[];
  onOpenConsultancy: () => void;
  onSelectRecentTopic: (topicTitle: string) => void;
  onOpenChat?: () => void;
  searchQuery: string;
  settings?: PlatformSettings;
}

export const ForumSection: React.FC<ForumSectionProps> = ({
  filteredTopics,
  activeFilter,
  onSelectFilter,
  onOpenPostModal,
  onSelectTopic,
  onToggleLike,
  onDeleteTopic,
  canDeleteTopic,
  isTopicAuthor,
  recentTopics,
  recentReplies,
  onOpenConsultancy,
  onSelectRecentTopic,
  onOpenChat,
  searchQuery,
  settings
}) => {
  const { language, t } = useLanguage();
  const tabs: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'popular', label: 'Popular', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'featured', label: 'Featured', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: 'recent', label: 'Recent', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'unloved', label: 'Unloved', icon: <HeartCrack className="w-3.5 h-3.5" /> },
    { id: 'loved', label: 'Loved', icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  return (
    <section id="forum" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* 1. Primary Section Heading: "Notable Forums" */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
          Notable Forums
        </h2>
      </div>

      {/* 2. Subheader Bar: "Ama" on left, "Post a Question" button on right */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
            Ama
          </h3>
          <span className="text-xs px-2.5 sm:px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-white/80 dark:border-white/20 text-slate-700 dark:text-slate-200 font-medium backdrop-blur-md shadow-xs">
            {filteredTopics.length} Discussions
          </span>
        </div>

        <button
          onClick={onOpenPostModal}
          id="post-a-question-btn"
          className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] text-xs font-semibold rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white shadow-md shadow-teal-500/25 active:scale-98 transition-all cursor-pointer backdrop-blur-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Question</span>
        </button>
      </div>

      {/* 3. Filter Tabs Bar with edge-to-edge mobile swipe */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/75 dark:bg-white/10 border border-white/80 dark:border-white/20 shadow-[0_4px_20px_rgba(31,38,135,0.05)] backdrop-blur-xl min-w-max">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 backdrop-blur-md shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Forum Topics List (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {searchQuery && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/80 dark:border-white/20 text-xs text-slate-700 dark:text-slate-200 mb-2 backdrop-blur-md shadow-xs">
              <span>
                Showing results for <strong className="text-teal-600 dark:text-teal-400">"{searchQuery}"</strong>
              </span>
              <span className="text-slate-400">{filteredTopics.length} found</span>
            </div>
          )}

          {filteredTopics.length === 0 ? (
            <div className="rounded-3xl bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 p-12 text-center shadow-md">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">No discussions found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
                No questions matched your search or selected filter. Try adjusting your keywords or start a new thread.
              </p>
              <button
                onClick={onOpenPostModal}
                className="px-4 py-2 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold cursor-pointer shadow-md shadow-teal-500/20 backdrop-blur-md"
              >
                Create Topic
              </button>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <ForumCard
                key={topic.id}
                topic={topic}
                onSelect={onSelectTopic}
                onToggleLike={onToggleLike}
                onDelete={onDeleteTopic ? (_e, t) => onDeleteTopic(t) : undefined}
                canDelete={canDeleteTopic ? canDeleteTopic(topic) : false}
                isAuthor={isTopicAuthor ? isTopicAuthor(topic) : false}
              />
            ))
          )}
        </div>

        {/* Right column: Sidebar Widgets (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <ForumSidebar
            recentTopics={recentTopics}
            recentReplies={recentReplies}
            onOpenConsultancy={onOpenConsultancy}
            onSelectRecentTopic={onSelectRecentTopic}
          />
        </div>
      </div>

      {/* Floating Action Button (bottom-right messenger chat bubble with hover indicator tag) */}
      {settings?.floatingSupportEnabled !== false && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3 group/support">
          {/* Contextual pulse indicator tag - appears on desktop hover */}
          <div className="hidden sm:flex opacity-0 translate-x-3 pointer-events-none group-hover/support:opacity-100 group-hover/support:translate-x-0 group-focus-within/support:opacity-100 group-focus-within/support:translate-x-0 transition-all duration-300 ease-out items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-medium shadow-2xl backdrop-blur-md border border-slate-700/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-tight text-slate-200 whitespace-nowrap">
              {language === 'bn' 
                ? (settings?.floatingSupportTagTextBn || '২৪/৭ সাপোর্ট চ্যাট ও হেল্প')
                : (settings?.floatingSupportTagTextEn || 'Support Assistant & FAQs')}
            </span>
          </div>

          <button
            onClick={onOpenChat}
            id="floating-support-chat-btn"
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#006AFF] via-[#0084FF] to-[#00C6FF] hover:from-[#005cd6] hover:to-[#00b4f0] text-white shadow-[0_10px_30px_-5px_rgba(0,132,255,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(0,132,255,0.65)] border-2 border-white/50 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group focus:outline-none ring-4 ring-blue-500/20 hover:ring-blue-500/35"
            title={t('Ama Support Assistant')}
            aria-label={t('Ama Support Assistant')}
          >
            {/* Messenger Chat Icon */}
            <div className="relative flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white group-hover:scale-110 group-hover:rotate-6 transition-transform drop-shadow-xs"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.517 3.735 7.185V22l3.418-1.875c.91.252 1.872.39 2.847.39 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2zm1.047 12.443l-2.55-2.72-4.975 2.72 5.473-5.81 2.613 2.72 4.912-2.72-5.473 5.81z" />
              </svg>
            </div>

            {/* Active online pulsing status badge */}
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-xs" />
            </span>
          </button>
        </div>
      )}
    </section>
  );
};
