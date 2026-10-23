import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Flame, 
  Bookmark, 
  Clock, 
  HeartCrack, 
  Heart,
  AlertCircle,
  ChevronDown,
  ChevronUp
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
  onEditTopic?: (topic: ForumTopic) => void;
  onDeleteTopic?: (topic: ForumTopic) => void;
  canEditTopic?: (topic: ForumTopic) => boolean;
  canDeleteTopic?: (topic: ForumTopic) => boolean;
  isTopicAuthor?: (topic: ForumTopic) => boolean;
  recentTopics: RecentTopic[];
  recentReplies: RecentReply[];
  onSelectRecentTopic: (topicTitle: string) => void;
  onOpenChat?: () => void;
  searchQuery: string;
  settings?: PlatformSettings;
  isLoading?: boolean;
}

export const ForumSection: React.FC<ForumSectionProps> = ({
  filteredTopics,
  activeFilter,
  onSelectFilter,
  onOpenPostModal,
  onSelectTopic,
  onToggleLike,
  onEditTopic,
  onDeleteTopic,
  canEditTopic,
  canDeleteTopic,
  isTopicAuthor,
  recentTopics,
  recentReplies,
  onSelectRecentTopic,
  onOpenChat,
  searchQuery,
  settings,
  isLoading = false
}) => {
  const { language, t, formatNumber } = useLanguage();
  const [visibleCount, setVisibleCount] = useState<number>(5);

  // Reset to default 5 posts whenever filter or search query changes
  useEffect(() => {
    setVisibleCount(5);
  }, [activeFilter, searchQuery]);

  const displayedTopics = filteredTopics.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTopics.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 2);
  };

  const handleShowLess = () => {
    setVisibleCount(5);
  };

  const tabs: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'popular', label: 'Popular', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'recent', label: 'Recent', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'featured', label: 'Featured', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: 'loved', label: 'Loved', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'unloved', label: 'Unloved', icon: <HeartCrack className="w-3.5 h-3.5" /> },
  ];

  return (
    <section id="forum" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">
      {/* Subheader Bar: "Trek Consultancy Forum" on left, "Post a Question" button on right */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight drop-shadow-sm">
            {t('Trek Consultancy Forum')}
          </h3>
          <span className="text-xs px-2.5 sm:px-3 py-1 rounded-full bg-slate-900/60 border border-white/20 text-white font-medium backdrop-blur-md shadow-xs">
            <strong className="font-bold text-teal-300">{formatNumber(filteredTopics.length)}</strong> {language === 'bn' ? 'টি আলোচনা' : language === 'ar' ? 'مناقشة' : 'Discussions'}
          </span>
        </div>

        <button
          onClick={onOpenPostModal}
          id="post-a-question-btn"
          className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] text-xs font-semibold rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white shadow-md shadow-teal-500/25 active:scale-98 transition-all cursor-pointer backdrop-blur-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('Post a Question')}</span>
        </button>
      </div>

      {/* 3. Filter Tabs Bar with edge-to-edge mobile swipe */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/60 border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl min-w-max">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{t(tab.label)}</span>
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/80 border border-white/80 text-xs text-slate-700 mb-2 backdrop-blur-md shadow-xs">
              <span>
                {language === 'bn' ? (
                  <>
                    <strong className="text-teal-600">"{searchQuery}"</strong> এর জন্য ফলাফল:
                  </>
                ) : language === 'ar' ? (
                  <>
                    نتائج البحث عن <strong className="text-teal-600">"{searchQuery}"</strong>:
                  </>
                ) : (
                  <>
                    Showing results for <strong className="text-teal-600">"{searchQuery}"</strong>
                  </>
                )}
              </span>
              <span className="text-slate-400">
                {language === 'bn' ? (
                  <><strong className="font-bold text-slate-700">{formatNumber(filteredTopics.length)}</strong>টি পাওয়া গেছে</>
                ) : language === 'ar' ? (
                  <>تم العثور على <strong className="font-bold text-slate-700">{formatNumber(filteredTopics.length)}</strong></>
                ) : (
                  `${filteredTopics.length} found`
                )}
              </span>
            </div>
          )}

          {isLoading && filteredTopics.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="rounded-2xl bg-white/75 backdrop-blur-xl border border-white/80 p-5 sm:p-6 shadow-sm animate-pulse space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-slate-200/90 rounded-md w-3/5" />
                    <div className="h-6 w-16 bg-slate-200/90 rounded-full" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded-md w-full" />
                  <div className="h-4 bg-slate-100 rounded-md w-4/5" />
                  <div className="flex items-center gap-4 pt-2">
                    <div className="h-6 w-24 bg-slate-200/80 rounded-full" />
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 p-12 text-center shadow-md">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-800 mb-1">
                {t('No discussions found')}
              </h4>
              <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
                {t('No questions matched your search or selected filter. Try adjusting your keywords or start a new thread.')}
              </p>
              <button
                onClick={onOpenPostModal}
                className="px-4 py-2 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold cursor-pointer shadow-md shadow-teal-500/20 backdrop-blur-md"
              >
                {t('Create Topic')}
              </button>
            </div>
          ) : (
            <>
              {displayedTopics.map((topic) => (
                <ForumCard
                  key={topic.id}
                  topic={topic}
                  onSelect={onSelectTopic}
                  onToggleLike={onToggleLike}
                  onEdit={onEditTopic ? (_e, t) => onEditTopic(t) : undefined}
                  onDelete={onDeleteTopic ? (_e, t) => onDeleteTopic(t) : undefined}
                  canEdit={canEditTopic ? canEditTopic(topic) : false}
                  canDelete={canDeleteTopic ? canDeleteTopic(topic) : false}
                  isAuthor={isTopicAuthor ? isTopicAuthor(topic) : false}
                />
              ))}

              {(hasMore || visibleCount > 5) && (
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  {hasMore && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/85 hover:bg-white text-slate-700 hover:text-teal-700 font-semibold text-xs sm:text-sm border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 backdrop-blur-md group"
                      title={t('Load More', 'আরও দেখুন', 'تحميل المزيد')}
                    >
                      <ChevronDown className="w-4 h-4 text-teal-600 group-hover:translate-y-0.5 transition-transform" />
                      <span>{t('Load More', 'আরও দেখুন', 'تحميل المزيد')}</span>
                    </button>
                  )}

                  {visibleCount > 5 && (
                    <button
                      type="button"
                      onClick={handleShowLess}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/85 hover:bg-white text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 backdrop-blur-md group"
                      title={t('Show Less', 'কম দেখান', 'عرض أقل')}
                    >
                      <ChevronUp className="w-4 h-4 text-slate-500 group-hover:-translate-y-0.5 transition-transform" />
                      <span>{t('Show Less', 'কম দেখান', 'عرض أقل')}</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column: Sidebar Widgets (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <ForumSidebar
            recentTopics={recentTopics}
            recentReplies={recentReplies}
            onSelectRecentTopic={onSelectRecentTopic}
          />
        </div>
      </div>

      {/* Floating Action Button (bottom-right messenger chat bubble with hover indicator tag) */}
      {settings?.floatingSupportEnabled !== false && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3 group/support">
          {/* Contextual pulse indicator tag - appears on desktop hover */}
          <div className="hidden sm:flex opacity-0 translate-x-3 pointer-events-none group-hover/support:opacity-100 group-hover/support:translate-x-0 group-focus-within/support:opacity-100 group-focus-within/support:translate-x-0 transition-all duration-300 ease-out items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-medium shadow-xl backdrop-blur-md border border-slate-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-tight text-slate-700 whitespace-nowrap">
              {language === 'bn' 
                ? (settings?.floatingSupportTagTextBn || '২৪/৭ সাপোর্ট চ্যাট ও হেল্প')
                : language === 'ar'
                ? 'المساعد الذكي والأسئلة الشائعة ٢٤/٧'
                : (settings?.floatingSupportTagTextEn || 'Support Assistant & FAQs')}
            </span>
          </div>

          <button
            onClick={onOpenChat}
            id="floating-support-chat-btn"
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#006AFF] via-[#0084FF] to-[#00C6FF] hover:from-[#005cd6] hover:to-[#00b4f0] text-white shadow-[0_10px_30px_-5px_rgba(0,132,255,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(0,132,255,0.65)] border-2 border-white/50 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group focus:outline-none ring-4 ring-blue-500/20 hover:ring-blue-500/35"
            title={t('Trek Support Agent')}
            aria-label={t('Trek Support Agent')}
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
