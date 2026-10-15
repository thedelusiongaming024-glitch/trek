import React from 'react';
import { User, Clock, Tag, Eye, ThumbsUp, MessageSquare, ArrowUpRight, Trash2, Pencil } from 'lucide-react';
import { ForumTopic } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getFallbackAvatar } from '../utils/avatar';

interface ForumCardProps {
  topic: ForumTopic;
  onSelect: (topic: ForumTopic) => void;
  onToggleLike: (e: React.MouseEvent, topicId: string) => void;
  onEdit?: (e: React.MouseEvent, topic: ForumTopic) => void;
  onDelete?: (e: React.MouseEvent, topic: ForumTopic) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isAuthor?: boolean;
}

export const ForumCard: React.FC<ForumCardProps> = ({
  topic,
  onSelect,
  onToggleLike,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  isAuthor = false
}) => {
  const { t, formatNumber, formatTimeAgo, translateCategory, translateRole } = useLanguage();
  const showEdit = Boolean(canEdit && onEdit);
  const showDelete = Boolean(canDelete && onDelete);

  return (
    <article
      onClick={() => onSelect(topic)}
      className="group relative rounded-2xl bg-white/75 backdrop-blur-xl border border-white/80 p-5 sm:p-6 transition-all duration-200 hover:bg-white/90 hover:border-white shadow-[0_8px_30px_rgb(31,38,135,0.06)] hover:shadow-[0_16px_36px_rgb(31,38,135,0.12)] cursor-pointer"
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight group-hover:text-teal-600 transition-colors font-heading">
          {topic.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {showEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(e, topic);
              }}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title={isAuthor ? t('Edit your post', 'আপনার পোস্ট সম্পাদনা করুন') : t('Edit post (Admin)', 'পোস্ট সম্পাদনা (অ্যাডমিন)')}
              aria-label="Edit post"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(e, topic);
              }}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title={isAuthor ? t('Delete your post') : t('Delete post (Admin)')}
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-600">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Author & Timestamp */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
        <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
          {topic.authorAvatar ? (
            <img 
              src={topic.authorAvatar} 
              alt={topic.author} 
              className="w-4 h-4 rounded-full object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(topic.author);
              }}
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-700 flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
              {topic.author.charAt(0)}
            </div>
          )}
          <span>{topic.author}</span>
          {topic.authorRole && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {translateRole(topic.authorRole)}
            </span>
          )}
          {isAuthor && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-teal-500/15 text-teal-700 border border-teal-500/25">
              {t('You')}
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatTimeAgo(topic.createdAt || topic.timeAgo)}
        </span>
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-700 backdrop-blur-md transition-colors">
          <Tag className="w-3 h-3" />
          <span>{translateCategory(topic.category)}</span>
        </span>
      </div>

      {/* Discussion Content / Description */}
      {topic.content && (
        <p className="text-xs sm:text-sm text-slate-600/90 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
          {topic.content}
        </p>
      )}

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-slate-200/70 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong className="font-bold text-slate-700">
              {topic.views > 999 ? `${formatNumber((topic.views / 1000).toFixed(1))}k` : formatNumber(topic.views)}
            </strong>{' '}
            {topic.views === 1 ? t('View') : t('Views')}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => onToggleLike(e, topic.id)}
          className={`flex items-center gap-1.5 min-h-[32px] px-1.5 -mx-1.5 rounded-lg hover:bg-slate-100/60 transition-colors cursor-pointer ${
            topic.isLiked ? 'text-teal-600 font-semibold' : 'hover:text-slate-800'
          }`}
          title={topic.isLiked ? t('Unlike this question', 'লাইক সরান') : t('Like this question', 'এই প্রশ্নে লাইক দিন')}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${topic.isLiked ? 'fill-teal-500 text-teal-600' : 'text-slate-400'}`} />
          <span>
            <strong className="font-bold">{formatNumber(topic.likes)}</strong>{' '}
            {topic.likes === 1 ? t('Like') : t('Likes')}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong className="font-bold text-slate-700">
              {formatNumber(topic.repliesList?.length ?? topic.replies)}
            </strong>{' '}
            {(topic.repliesList?.length ?? topic.replies) === 1 ? t('Reply') : t('Replies')}
          </span>
        </div>
      </div>
    </article>
  );
};
