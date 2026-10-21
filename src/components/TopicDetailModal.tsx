import React, { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  Pencil,
  CornerDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ForumTopic, ForumReply } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getFallbackAvatar } from '../utils/avatar';

interface TopicDetailModalProps {
  topic: ForumTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (e: React.MouseEvent, topicId: string) => void;
  onToggleReplyLike?: (topicId: string, replyId: string) => void;
  onAddReply: (topicId: string, replyContent: string, authorName: string, parentReplyId?: string | null) => void;
  onEditTopic?: (topic: ForumTopic) => void;
  onDeleteTopic?: (topic: ForumTopic) => void;
  canEdit?: boolean;
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
  onToggleReplyLike,
  onAddReply,
  onEditTopic,
  onDeleteTopic,
  canEdit = false,
  canDelete = false,
  isAuthor = false,
  currentUser,
  onRequireAuth
}) => {
  const { t, formatNumber, formatTimeAgo, translateCategory, translateRole } = useLanguage();
  const [replyText, setReplyText] = useState('');
  const [isReplyFocused, setIsReplyFocused] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);
  const [authorName, setAuthorName] = useState(currentUser?.name || 'Community Member');
  const [copied, setCopied] = useState(false);
  const [replyingToReplyId, setReplyingToReplyId] = useState<string | null>(null);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string>('');
  const [nestedReplyText, setNestedReplyText] = useState<string>('');
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentUser?.name) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen || !topic) return null;

  const showEdit = Boolean(canEdit && onEditTopic);
  const showDelete = Boolean(canDelete && onDeleteTopic);

  const totalRepliesCount = (topic.repliesList || []).reduce(
    (acc, r) => acc + 1 + (r.nestedReplies?.length || 0),
    0
  );
  const displayRepliesCount = Math.max(topic.replies || 0, totalRepliesCount);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(t('To post a reply and join this discussion, you must have an account and be logged in.'));
      }
      return;
    }
    if (!replyText.trim()) return;
    onAddReply(topic.id, replyText.trim(), currentUser.name || authorName.trim() || 'Community Member');
    setReplyText('');
    setTimeout(() => {
      repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleNestedReplySubmit = (parentReplyId: string) => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(t('To reply to this comment, you must have an account and be logged in.', 'এই মন্তব্যে উত্তর দিতে আপনাকে লগইন করতে হবে।', 'للرد على هذا التعليق، يجب عليك تسجيل الدخول أو إنشاء حساب.'));
      }
      return;
    }
    if (!nestedReplyText.trim()) return;
    onAddReply(topic.id, nestedReplyText.trim(), currentUser.name || authorName.trim() || 'Community Member', parentReplyId);
    setNestedReplyText('');
    setReplyingToReplyId(null);
    setReplyingToAuthor('');
    setExpandedThreads((prev) => ({ ...prev, [parentReplyId]: true }));
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
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                {topic.authorAvatar ? (
                  <img
                    src={topic.authorAvatar}
                    alt={topic.author}
                    className="w-5 h-5 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(topic.author);
                    }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-700 flex items-center justify-center text-[10px] font-bold uppercase border border-teal-500/30 shrink-0">
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
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTimeAgo(topic.createdAt || topic.timeAgo)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showEdit && (
              <button
                type="button"
                onClick={() => onEditTopic?.(topic)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isAuthor && (topic.editCount || 0) >= 3
                    ? 'text-slate-500 bg-slate-100 hover:bg-slate-200/80 border border-slate-200'
                    : 'text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80'
                }`}
                title={
                  isAuthor && (topic.editCount || 0) >= 3
                    ? t('Edit limit reached (3/3 used)', 'সম্পাদনা সীমা অতিক্রম করেছে (৩/৩ ব্যবহৃত)', 'تم الوصول للحد الأقصى للتعديل (3/3 مستخدمة)')
                    : (isAuthor ? t('Edit your post', 'আপনার পোস্ট সম্পাদনা করুন', 'تعديل منشورك') : t('Edit post (Admin)', 'পোস্ট সম্পাদনা (অ্যাডমিন)', 'تعديل المنشور (المشرف)'))
                }
                aria-label="Edit post"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isAuthor ? t('Edit Your Post', 'পোস্ট সম্পাদনা', 'تعديل المنشور') : t('Edit Post', 'পোস্ট সম্পাদনা', 'تعديل')}
                </span>
                {isAuthor && (topic.editCount || 0) > 0 && (
                  <span className="text-[10px] font-mono font-bold opacity-80">
                    ({topic.editCount}/3)
                  </span>
                )}
              </button>
            )}
            {showDelete && (
              <button
                type="button"
                onClick={() => onDeleteTopic?.(topic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 transition-colors cursor-pointer"
                title={isAuthor ? t('Delete your post', 'পোস্ট মুছুন', 'حذف منشورك') : t('Delete post (Admin)', 'পোস্ট মুছুন (অ্যাডমিন)', 'حذف المنشور (المشرف)')}
                aria-label="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAuthor ? t('Delete Your Post', 'পোস্ট মুছুন', 'حذف المنشور') : t('Delete Post', 'পোস্ট মুছুন', 'حذف')}</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t('Copy share link', 'শেয়ার লিংক কপি করুন', 'نسخ رابط المشاركة')}
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {/* Main Question Body */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 text-sm leading-relaxed text-slate-700 space-y-3 backdrop-blur-md shadow-xs">
            <p className="whitespace-pre-line">{topic.content}</p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between py-2 border-y border-slate-200/80 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="font-bold text-slate-700">{formatNumber(topic.views)}</strong> {topic.views === 1 ? t('View') : t('Views')}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="font-bold text-slate-700">{formatNumber(displayRepliesCount)}</strong> {displayRepliesCount === 1 ? t('Reply') : t('Replies')}
                </span>
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
                title={topic.isLiked ? t('Unlike this question', 'লাইক সরান', 'إلغاء الإعجاب بهذا السؤال') : t('Like this question', 'এই প্রশ্নে লাইক দিন', 'الإعجاب بهذا السؤال')}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${topic.isLiked ? 'fill-teal-500 text-teal-500' : ''}`} />
                <span><strong className="font-bold">{formatNumber(topic.likes)}</strong> {topic.likes === 1 ? t('Like') : t('Likes')}</span>
              </button>

              {showDelete && (
                <button
                  type="button"
                  onClick={() => onDeleteTopic?.(topic)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200/80 text-rose-600 hover:text-rose-700 hover:bg-rose-50 bg-white/60 transition-colors cursor-pointer"
                  title={isAuthor ? t('Delete your post', 'পোস্ট মুছুন', 'حذف منشورك') : t('Delete post (Admin)', 'পোস্ট মুছুন (অ্যাডমিন)', 'حذف المنشور (المشرف)')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{isAuthor ? t('Delete Your Post', 'পোস্ট মুছুন', 'حذف المنشور') : t('Delete Post', 'পোস্ট মুছুন', 'حذف')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Discussion Replies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('Replies & Discussion')} (<strong className="font-bold text-slate-700">{formatNumber(displayRepliesCount)}</strong>)
            </h4>

            {(!topic.repliesList || topic.repliesList.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                {t('No replies yet. Be the first to share an answer or solution!')}
              </div>
            ) : (
              topic.repliesList.map((rep) => (
                <div key={rep.id} className="space-y-2">
                  {/* Parent Reply Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        {rep.authorAvatar ? (
                          <img
                            src={rep.authorAvatar}
                            alt={rep.author}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(rep.author);
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500/20 text-teal-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {rep.author.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{rep.author}</span>
                            {rep.authorRole && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                {translateRole(rep.authorRole)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{formatTimeAgo(rep.createdAt || rep.timeAgo)}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9.5 rtl:pl-0 rtl:pr-9.5 whitespace-pre-line">
                      {rep.content}
                    </p>

                    {/* Parent Reply Actions */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 pl-9.5 rtl:pl-0 rtl:pr-9.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            onRequireAuth?.(t('To reply to this comment, you must have an account and be logged in.', 'এই মন্তব্যে উত্তর দিতে আপনাকে লগইন করতে হবে।', 'للرد على هذا التعليق، يجب عليك تسجيل الدخول أو إنشاء حساب.'));
                            return;
                          }
                          if (replyingToReplyId === rep.id) {
                            setReplyingToReplyId(null);
                            setReplyingToAuthor('');
                            setNestedReplyText('');
                          } else {
                            setReplyingToReplyId(rep.id);
                            setReplyingToAuthor(rep.author);
                            setNestedReplyText('');
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          replyingToReplyId === rep.id
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-teal-50 hover:bg-teal-100/90 text-teal-700 border border-teal-200/90 shadow-2xs'
                        }`}
                        title={t('Reply to this comment', 'এই মন্তব্যের উত্তর দিন', 'الرد على هذا التعليق')}
                      >
                        <CornerDownRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>{t('Reply', 'উত্তর দিন', 'رد')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleReplyLike?.(topic.id, rep.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                          rep.isLiked 
                            ? 'bg-teal-50 text-teal-700 border border-teal-200/80 font-semibold' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 border border-transparent'
                        }`}
                        title={rep.isLiked ? t('Unlike reply', 'লাইক সরান', 'إلغاء الإعجاب بالرد') : t('Like reply', 'লাইক দিন', 'الإعجاب بالرد')}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${rep.isLiked ? 'fill-teal-600 text-teal-600' : 'text-slate-400'}`} />
                        <span><strong className="font-bold">{formatNumber(rep.likes || 0)}</strong> {rep.likes === 1 ? t('Like') : t('Likes')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Nested Reply Form */}
                  {replyingToReplyId === rep.id && (
                    <div className="relative ml-7 sm:ml-10 rtl:ml-0 rtl:mr-7 sm:rtl:mr-10 pl-4 sm:pl-5 rtl:pl-0 rtl:pr-4 sm:rtl:pr-5 border-l-2 rtl:border-l-0 rtl:border-r-2 border-teal-400/90 py-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 before:content-[''] before:absolute before:-left-[18px] sm:before:-left-[22px] rtl:before:left-auto rtl:before:-right-[18px] sm:rtl:before:-right-[22px] before:top-4 before:w-4 before:h-3 before:border-b-2 before:border-l-2 rtl:before:border-l-0 rtl:before:border-r-2 before:border-teal-400/90 before:rounded-bl-lg rtl:before:rounded-bl-none rtl:before:rounded-br-lg">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleNestedReplySubmit(rep.id);
                        }}
                        className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/80 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-teal-700 font-medium">
                          <span className="flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 rtl:rotate-180" />
                            <span>{t('Replying to', 'উত্তর দিচ্ছেন:', 'الرد على:')} <strong>{replyingToAuthor || rep.author}</strong></span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToReplyId(null);
                              setReplyingToAuthor('');
                              setNestedReplyText('');
                            }}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer text-[10px]"
                          >
                            {t('Cancel', 'বাতিল', 'إلغاء')}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nestedReplyText}
                            onChange={(e) => setNestedReplyText(e.target.value)}
                            placeholder={`${t('Reply to', 'উত্তর দিন', 'رد على')} ${replyingToAuthor || rep.author}...`}
                            autoFocus
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                          />
                          <button
                            type="submit"
                            disabled={!nestedReplyText.trim()}
                            className="px-3.5 py-1.5 rounded-xl bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                          >
                            <Send className="w-3 h-3 rtl:rotate-180" />
                            <span>{t('Reply', 'উত্তর দিন', 'رد')}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* First-tier Nested Replies List */}
                  {rep.nestedReplies && rep.nestedReplies.length > 0 && (() => {
                    const isExpanded = Boolean(expandedThreads[rep.id]);
                    const totalChildren = rep.nestedReplies.length;
                    const displayedChildren = isExpanded ? rep.nestedReplies : rep.nestedReplies.slice(0, 2);
                    const remainingCount = totalChildren - 2;

                    return (
                      <div className="relative ml-7 sm:ml-10 rtl:ml-0 rtl:mr-7 sm:rtl:mr-10 pl-4 sm:pl-5 rtl:pl-0 rtl:pr-4 sm:rtl:pr-5 border-l-2 rtl:border-l-0 rtl:border-r-2 border-teal-200/90 space-y-2.5 pt-1">
                        {displayedChildren.map((nested) => (
                          <div 
                            key={nested.id} 
                            className="relative p-3 sm:p-3.5 rounded-xl bg-slate-100/75 hover:bg-slate-100/95 border border-slate-200/80 shadow-2xs transition-colors before:content-[''] before:absolute before:-left-[18px] sm:before:-left-[22px] rtl:before:left-auto rtl:before:-right-[18px] sm:rtl:before:-right-[22px] before:top-4 before:w-4 before:h-3 before:border-b-2 before:border-l-2 rtl:before:border-l-0 rtl:before:border-r-2 before:border-teal-200/90 before:rounded-bl-lg rtl:before:rounded-bl-none rtl:before:rounded-br-lg"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                {nested.authorAvatar ? (
                                  <img
                                    src={nested.authorAvatar}
                                    alt={nested.author}
                                    className="w-5 h-5 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(nested.author);
                                    }}
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-700 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                                    {nested.author.charAt(0)}
                                  </div>
                                )}
                                <span className="text-xs font-semibold text-slate-800">{nested.author}</span>
                                {nested.authorRole && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-white text-slate-600 border border-slate-200">
                                    {translateRole(nested.authorRole)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{formatTimeAgo(nested.createdAt || nested.timeAgo)}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed pl-7 rtl:pl-0 rtl:pr-7 whitespace-pre-line">
                              {nested.content}
                            </p>
                            <div className="flex items-center justify-end rtl:justify-start mt-2 pt-1.5 pl-7 rtl:pl-0 rtl:pr-7 border-t border-slate-200/60">
                              <button
                                type="button"
                                onClick={() => onToggleReplyLike?.(topic.id, nested.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] transition-colors cursor-pointer ${
                                  nested.isLiked 
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200/80 font-semibold' 
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 border border-transparent'
                                }`}
                                title={nested.isLiked ? t('Unlike reply', 'লাইক সরান', 'إلغاء الإعجاب بالرد') : t('Like reply', 'লাইক দিন', 'الإعجاب بالرد')}
                              >
                                <ThumbsUp className={`w-3 h-3 ${nested.isLiked ? 'fill-teal-600 text-teal-600' : 'text-slate-400'}`} />
                                <span><strong className="font-bold">{formatNumber(nested.likes || 0)}</strong> {nested.likes === 1 ? t('Like') : t('Likes')}</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Load more child replies button when there are more than 2 */}
                        {totalChildren > 2 && (
                          <div className="pt-0.5 pb-1">
                            {!isExpanded ? (
                              <button
                                type="button"
                                onClick={() => setExpandedThreads((prev) => ({ ...prev, [rep.id]: true }))}
                                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/90 hover:bg-teal-100 text-teal-700 border border-teal-200/80 text-xs font-semibold shadow-2xs transition-all cursor-pointer before:content-[''] before:absolute before:-left-[18px] sm:before:-left-[22px] rtl:before:left-auto rtl:before:-right-[18px] sm:rtl:before:-right-[22px] before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-px before:bg-teal-300"
                                title={t('Load More', 'আরও দেখুন', 'تحميل المزيد')}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>
                                  {t('Load More', 'আরও দেখুন', 'تحميل المزيد')}
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setExpandedThreads((prev) => ({ ...prev, [rep.id]: false }))}
                                className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 text-xs font-medium transition-colors cursor-pointer before:content-[''] before:absolute before:-left-[18px] sm:before:-left-[22px] rtl:before:left-auto rtl:before:-right-[18px] sm:rtl:before:-right-[22px] before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-px before:bg-teal-300"
                                title={t('Show Less', 'কম দেখান', 'عرض أقل')}
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>{t('Show Less', 'কম দেখান', 'عرض أقل')}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))
            )}
            <div ref={repliesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Reply Section */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          {currentUser ? (
            <form onSubmit={handleReplySubmit}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800">{t('Leave a Reply')}</h4>
                <span className="text-[11px] text-teal-600 font-medium">{t('Replying as', 'উত্তর দিচ্ছেন:', 'الرد باسم:')} {currentUser.name}</span>
              </div>
              <div className="space-y-2.5">
                <textarea
                  rows={isReplyFocused || replyText.trim().length > 0 ? 3 : 2}
                  onFocus={() => setIsReplyFocused(true)}
                  onBlur={() => setIsReplyFocused(false)}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleReplySubmit(e);
                    }
                  }}
                  placeholder={t('Type your response here...', 'এখানে আপনার উত্তর লিখুন...', 'اكتب ردك هنا...')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs resize-none"
                />
                <div className="flex justify-end rtl:justify-start">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-5 py-2 min-h-[40px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-teal-500/25 active:scale-95 backdrop-blur-md"
                  >
                    <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{t('Submit Reply', 'উত্তর পোস্ট করুন', 'إرسال الرد')}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left rtl:sm:text-right">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white shadow-xs shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-950">
                    {t('Join this Discussion', 'এই আলোচনায় যোগ দিন', 'انضم إلى هذه المناقشة')}
                  </h4>
                  <p className="text-[11px] text-teal-800 leading-snug">
                    {t('To leave a reply and contribute to this forum topic, you must have an account and be logged in.', 'এই টপিকে উত্তর দিতে বা অংশ নিতে আপনাকে অবশ্যই লগইন করতে হবে।', 'للرد والمشاركة في موضوع المنتدى هذا، يجب أن يكون لديك حساب وتسجيل الدخول أولاً.')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRequireAuth?.(t('To leave a reply and participate in this topic, you must have an account and be logged in.'))}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[38px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('Log In / Sign Up to Reply', 'উত্তর দিতে লগইন / সাইন আপ করুন', 'تسجيل الدخول / إنشاء حساب للرد')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
