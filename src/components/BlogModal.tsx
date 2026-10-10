import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { X, Calendar, Tag, Heart, MessageSquare, Send, Loader2, ArrowLeft, Share2, Check, Lock, UserPlus, ExternalLink } from 'lucide-react';
import { BlogPost, BlogComment } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { normalizeUrl } from '../utils/url';

interface BlogModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string; email: string; role: string; avatar?: string } | null;
  onRequireAuth?: (prompt?: string) => void;
  onBlogUpdated?: (updatedBlog: BlogPost) => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({
  post,
  isOpen,
  onClose,
  currentUser,
  onRequireAuth,
  onBlogUpdated
}) => {
  const { t, formatNumber, formatDate, formatTimeAgo, translateCategory, translateRole } = useLanguage();
  const [likes, setLikes] = useState(post?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post) {
      setLikes(post.likes || 0);
      setHasLiked(false);
      fetchComments(post.id);
    }
  }, [post]);

  const fetchComments = async (blogId: string) => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error('Failed to load blog comments:', e);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!isOpen || !post) return null;

  const handleToggleLike = async () => {
    if (!currentUser) {
      onRequireAuth?.(t('To like this article and join community discussions, please log in or create an account.'));
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setHasLiked(true);
        if (onBlogUpdated) {
          onBlogUpdated({ ...post, likes: data.likes });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth?.(t('To participate in blog discussions and post comments, please log in or create an account.'));
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await fetch(`/api/blogs/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          content: newComment.trim()
        })
      });

      if (res.ok) {
        const savedComment: BlogComment = await res.json();
        const updated = [savedComment, ...comments];
        setComments(updated);
        setNewComment('');
        if (onBlogUpdated) {
          onBlogUpdated({ ...post, commentsCount: updated.length });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/25 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl text-slate-800 overflow-hidden">
        {/* Top bar */}
        <div className="p-3 sm:p-5 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t('Back to Blogs', 'ব্লগ তালিকায় ফিরুন', 'العودة إلى المقالات')}</span>
          </button>
          
          <div className="flex items-center gap-2">
            {post.redirectUrl && (
              <a
                href={normalizeUrl(post.redirectUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-700 text-xs font-semibold border border-teal-200/80 transition-colors cursor-pointer"
                title={post.redirectUrl}
              >
                <span>{t('Open Link', 'লিংক খুলুন', 'فتح الرابط')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={handleShare}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t('Share article link', 'নিবন্ধের লিংক শেয়ার করুন', 'مشاركة رابط المقال')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close article"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article scrollable container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(post.date)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-teal-600 font-medium">
              <Tag className="w-3.5 h-3.5" />
              <span>{translateCategory(post.category)}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight leading-snug">
            {post.title}
          </h2>

          {post.redirectUrl && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-teal-900 font-medium">
                <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{t('This article includes an external reference link.', 'এই নিবন্ধটিতে একটি বহিঃসংযোগ লিংক অন্তর্ভুক্ত আছে।', 'يتضمن هذا المقال رابط مرجعي خارجي.')}</span>
              </div>
              <a
                href={normalizeUrl(post.redirectUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs transition-colors shrink-0"
              >
                <span>{t('Visit Article Link', 'লিংকটি দেখুন', 'زيارة رابط المقال')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 py-3 border-y border-slate-200/80">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">{post.author}</p>
                <p className="text-[11px] text-slate-400">{t('Core Community Author', 'কমিউনিটি লেখক', 'كاتب المجتمع الرئيسي')}</p>
              </div>
            </div>

            {/* Interactive Activity Button: Like / React */}
            <button
              type="button"
              id="blog-like-btn"
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                hasLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
              title={currentUser ? (hasLiked ? t('Liked') : t('Like article')) : t('Sign in to like this article')}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span><strong className="font-bold">{formatNumber(likes)}</strong> {likes === 1 ? t('Like') : t('Likes')}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="space-y-4 pt-1">
            {post.excerpt && (
              <div className="p-4 rounded-xl bg-teal-50/40 border-l-4 border-teal-500 border-y border-r border-teal-100/80 text-sm font-medium text-slate-800 leading-relaxed">
                {post.excerpt}
              </div>
            )}

            <div className="blog-body text-sm text-slate-700 leading-relaxed font-normal">
              <Markdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 font-heading">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5 pb-1.5 border-b border-slate-100 font-heading">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-slate-900 mt-4 mb-2 font-heading">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-semibold text-slate-800 mt-3 mb-1">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-slate-700 leading-relaxed whitespace-pre-line text-sm last:mb-0">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-800">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1.5 my-3 text-slate-700 text-sm">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1.5 my-3 text-slate-700 text-sm">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed text-slate-700 pl-0.5 my-0.5">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50/50 rounded-r-xl text-slate-700 italic text-sm">
                      {children}
                    </blockquote>
                  ),
                  code: ({ inline, className, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-xs border border-slate-200/80 font-medium">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="my-3 rounded-xl bg-slate-900 text-teal-300 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner whitespace-pre leading-relaxed">
                        <code>{children}</code>
                      </div>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 underline font-medium inline-flex items-center gap-1"
                    >
                      <span>{children}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  ),
                  hr: () => <hr className="my-6 border-slate-200" />
                }}
              >
                {post.content}
              </Markdown>
            </div>
          </div>

          {/* Interactive Blog Activity: Comments & Discussion Section */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00a8b5]" />
                <h3 className="text-sm font-bold text-slate-900 font-heading tracking-tight">
                  {t('Comments & Discussion')} (<strong className="font-bold text-slate-700">{formatNumber(comments.length)}</strong>)
                </h3>
              </div>
              {!currentUser && (
                <span className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3" /> {t('Login Required to Participate')}
                </span>
              )}
            </div>

            {/* Comment Form or Auth Prompt */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="flex items-center gap-2.5 mb-1">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {t('Participating as', 'অংশ নিচ্ছেন:', 'المشاركة باسم:')} {currentUser.name}
                  </span>
                </div>

                <textarea
                  rows={2}
                  id="blog-comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('Write a comment or share your insights...', 'আপনার মন্তব্য বা মতামত লিখুন...', 'اكتب تعليقاً أو شارك رؤيتك...')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-xs resize-none"
                />

                <div className="flex justify-end rtl:justify-start">
                  <button
                    type="submit"
                    id="blog-comment-submit-btn"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-4 py-2 min-h-[40px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-teal-500/20 active:scale-95"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('Posting...', 'প্রকাশ করা হচ্ছে...', 'جاري النشر...')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>{t('Post Comment')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-center space-y-2.5">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-500 text-white shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-teal-950 font-heading">
                  {t('Participate in Blog Activities', 'ব্লগ কার্যক্রমে অংশ নিন', 'المشاركة في أنشطة المقالات')}
                </h4>
                <p className="text-[11px] text-teal-800 max-w-sm mx-auto leading-relaxed">
                  {t('Join the community discussion, like articles, and share insights by logging in or creating your account.', 'কমিউনিটি আলোচনায় অংশ নিতে ও মন্তব্য করতে অ্যাকাউন্ট তৈরি বা লগইন করুন।', 'انضم إلى مناقشات المجتمع وتفاعل مع المقالات عبر تسجيل الدخول أو إنشاء حساب.')}
                </p>
                <button
                  type="button"
                  id="blog-auth-prompt-btn"
                  onClick={() => onRequireAuth?.('To participate in blog activities, like articles, and post comments, please log in or create an account.')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('Sign In / Create Account', 'লগইন / নিবন্ধন করুন', 'تسجيل الدخول / إنشاء حساب')}</span>
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {loadingComments ? (
                <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('Loading discussions...', 'আলোচনা লোড হচ্ছে...', 'جاري تحميل المناقشات...')}</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 text-xs text-slate-400">
                  {t('No comments yet. Be the first to share your thoughts!')}
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                          alt={comment.author}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-xs font-semibold text-slate-800">
                          {comment.author}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] rounded-md bg-teal-50 text-teal-700 font-medium border border-teal-200/60">
                          {translateRole(comment.authorRole || 'Member')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(comment.createdAt || comment.timeAgo)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 pl-8 rtl:pl-0 rtl:pr-8 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
