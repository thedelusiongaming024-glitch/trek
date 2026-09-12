import React from 'react';
import { User, Clock, Tag, Eye, ThumbsUp, MessageSquare, ArrowUpRight, Trash2 } from 'lucide-react';
import { ForumTopic } from '../types';

interface ForumCardProps {
  topic: ForumTopic;
  onSelect: (topic: ForumTopic) => void;
  onToggleLike: (e: React.MouseEvent, topicId: string) => void;
  onDelete?: (e: React.MouseEvent, topic: ForumTopic) => void;
  canDelete?: boolean;
  isAuthor?: boolean;
}

export const ForumCard: React.FC<ForumCardProps> = ({
  topic,
  onSelect,
  onToggleLike,
  onDelete,
  canDelete = false,
  isAuthor = false
}) => {
  const showDelete = Boolean(canDelete && onDelete);

  return (
    <article
      onClick={() => onSelect(topic)}
      className="group relative rounded-2xl bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 p-5 sm:p-6 transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/15 hover:border-white shadow-[0_8px_30px_rgb(31,38,135,0.06)] hover:shadow-[0_16px_36px_rgb(31,38,135,0.12)] cursor-pointer"
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors font-heading">
          {topic.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {showDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(e, topic);
              }}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title={isAuthor ? 'Delete your post' : 'Delete post (Admin)'}
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Author & Timestamp */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {topic.author}
          {isAuthor && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25">
              You
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {topic.timeAgo}
        </span>
      </div>

      {/* Category badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-700 dark:text-teal-300 backdrop-blur-md transition-colors">
          <Tag className="w-3 h-3" />
          <span>{topic.category}</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-slate-200/70 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views} Views</span>
        </div>

        <button
          type="button"
          onClick={(e) => onToggleLike(e, topic.id)}
          className={`flex items-center gap-1.5 min-h-[32px] px-1.5 -mx-1.5 rounded-lg hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer ${
            topic.isLiked ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Like this question"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${topic.isLiked ? 'fill-teal-500 text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
          <span>{topic.likes} {topic.likes === 1 ? 'Like' : 'Likes'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{topic.replies} {topic.replies === 1 ? 'Reply' : 'Replies'}</span>
        </div>
      </div>
    </article>
  );
};
