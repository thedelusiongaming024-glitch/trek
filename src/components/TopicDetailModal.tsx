import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Clock, 
  Tag, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Share2, 
  Check, 
  Trash2,
  Lock,
  UserPlus
} from 'lucide-react';
import { ForumTopic, ForumReply } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TopicDetailModalProps {
  topic: ForumTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (e: React.MouseEvent, topicId: string) => void;
  onAddReply: (topicId: string, replyContent: string, authorName: string) => void;
  onDeleteTopic?: (topic: ForumTopic) => void;
  canDelete?: boolean;
  isAuthor?: boolean;
  currentUser?: { id?: string; name: string; email: string; role: string; avatar?: string } | null;
  onRequireAuth?: (prompt?: string) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  isOpen,
  onClose,
  onToggleLike,
  onAddReply,
  onDeleteTopic,
  canDelete = false,
  isAuthor = false,
  currentUser,
  onRequireAuth
}) => {
  const { t, formatNumber, formatTimeAgo, translateCategory } = useLanguage();
  const [replyText, setReplyText] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || 'Community Member');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser?.name) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen || !topic) return null;

  const showDelete = Boolean(canDelete && onDeleteTopic);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('To post a reply and join this discussion, you must have an account and be logged in.');
      }
      return;
    }
    if (!replyText.trim()) return;
    onAddReply(topic.id, replyText.trim(), currentUser.name || authorName.trim() || 'Community Member');
    setReplyText('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-start justify-between gap-4 shrink-0 bg-white/80 backdrop-blur-md">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>{translateCategory(topic.category)}</span>
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading tracking-tight leading-snug">
              {topic.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {topic.author} {topic.authorRole && `(${topic.authorRole})`}
                {isAuthor && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-teal-500/15 text-teal-700 border border-teal-500/25">
                    {t('You')}
                  </span>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTimeAgo(topic.timeAgo)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showDelete && (
              <button
                type="button"
                onClick={() => onDeleteTopic?.(topic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 transition-colors cursor-pointer"
                title={isAuthor ? t('Delete your post') : t('Delete post (Admin)')}
                aria-label="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAuthor ? t('Delete Your Post') : t('Delete Post')}</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t('Copy share link', 'শেয়ার লিংক কপি করুন')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Question Body */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 text-sm leading-relaxed text-slate-700 space-y-3 backdrop-blur-md shadow-xs">
            <p>{topic.content}</p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between py-2 border-y border-slate-200/80 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                {formatNumber(topic.views)} {t('Views')}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                {formatNumber(topic.repliesList?.length || topic.replies)} {t('Replies')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => onToggleLike(e, topic.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                  topic.isLiked
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-700 font-semibold'
                    : 'border-slate-300/80 text-slate-600 hover:text-slate-900 bg-white/60'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${topic.isLiked ? 'fill-teal-500 text-teal-500' : ''}`} />
                <span>{formatNumber(topic.likes)} {t('Likes')}</span>
              </button>

              {showDelete && (
                <button
                  type="button"
                  onClick={() => onDeleteTopic?.(topic)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200/80 text-rose-600 hover:text-rose-700 hover:bg-rose-50 bg-white/60 transition-colors cursor-pointer"
                  title={isAuthor ? t('Delete your post') : t('Delete post (Admin)')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{isAuthor ? t('Delete Your Post') : t('Delete Post')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Discussion Replies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('Replies & Discussion')} ({formatNumber(topic.repliesList?.length || 0)})
            </h4>

            {(!topic.repliesList || topic.repliesList.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                {t('No replies yet. Be the first to share an answer or solution!')}
              </div>
            ) : (
              topic.repliesList.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-md shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-700 flex items-center justify-center text-xs font-bold uppercase">
                        {rep.author.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{rep.author}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatTimeAgo(rep.timeAgo)}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {rep.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Reply Form / Auth Required Prompt */}
          {currentUser ? (
            <form onSubmit={handleReplySubmit} className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800">{t('Leave a Reply')}</h4>
                <span className="text-[11px] text-teal-600 font-medium">{t('Replying as', 'উত্তর দিচ্ছেন:')} {currentUser.name}</span>
              </div>
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('Type your response here...', 'এখানে আপনার উত্তর লিখুন...')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-teal-500/25 active:scale-95 backdrop-blur-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('Submit Reply', 'উত্তর পোস্ট করুন')}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white shadow-xs">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-teal-950">
                {t('Join this Discussion', 'এই আলোচনায় যোগ দিন')}
              </h4>
              <p className="text-[11px] text-teal-800 max-w-sm mx-auto leading-relaxed">
                {t('To leave a reply and contribute to this forum topic, you must have an account and be logged in.', 'এই টপিকে উত্তর দিতে বা অংশ নিতে আপনাকে অবশ্যই লগইন করতে হবে।')}
              </p>
              <button
                type="button"
                onClick={() => onRequireAuth?.('To leave a reply and participate in this topic, you must have an account and be logged in.')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('Log In / Sign Up to Reply', 'উত্তর দিতে লগইন / সাইন আপ করুন')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
