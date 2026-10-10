import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  BookOpen,
  X,
  Save,
  AlertCircle,
  ExternalLink,
  Eye,
  Edit3,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code
} from 'lucide-react';
import { BlogPost } from '../../types';
import { normalizeUrl } from '../../utils/url';

interface AdminEditBlogModalProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBlog: (updatedBlog: BlogPost) => Promise<void> | void;
}

export const AdminEditBlogModal: React.FC<AdminEditBlogModalProps> = ({
  blog,
  isOpen,
  onClose,
  onUpdateBlog
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bodyTab, setBodyTab] = useState<'write' | 'preview'>('write');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '');
      setCategory(blog.category || 'Architecture');
      setRedirectUrl(blog.redirectUrl || '');
      setExcerpt(blog.excerpt || '');
      setContent(blog.content || '');
      setAuthor(blog.author || 'Editorial Staff');
      setImageUrl(blog.imageUrl || '');
      setError('');
      setBodyTab('write');
    }
  }, [blog]);

  if (!isOpen || !blog) return null;

  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) {
      setContent(prev => prev + prefix + suffix);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + selected + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      el.focus();
      const cursorTarget = start + prefix.length + selected.length;
      el.setSelectionRange(cursorTarget, cursorTarget);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError('Please provide title, summary, and article content.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // If user emptied or removed redirect link, store clean empty string (which clears it in DB)
      const cleanRedirect = redirectUrl.trim() ? normalizeUrl(redirectUrl.trim()) : '';

      const updated: BlogPost = {
        ...blog,
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim() || blog.author || 'Editorial Staff',
        imageUrl: imageUrl.trim() || blog.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80',
        redirectUrl: cleanRedirect
      };

      await onUpdateBlog(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-blog-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-xl text-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="edit-blog-title" className="text-sm font-semibold text-slate-900">
                Edit Knowledge Base Article
              </h3>
              <p className="text-xs text-slate-500">
                Update technical article details, content body, and metadata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecting Distributed Redis Cache Leases for High-Traffic Support"
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs"
              >
                <option value="Architecture">Architecture</option>
                <option value="Design">Design & UI</option>
                <option value="DevOps">DevOps & Scale</option>
                <option value="Performance">Performance</option>
                <option value="Security">Security</option>
                <option value="Tutorial">Tutorial & Guides</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Cover Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs"
            />
            {imageUrl && (
              <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                <span>Redirect Link / External URL (Optional)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Directly opens link when clicked</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="e.g. https://b2bfiy.me or https://www.trekconsultancy.com/resource"
                className="w-full px-3 py-2 pr-24 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs"
              />
              {redirectUrl.trim() && (
                <button
                  type="button"
                  onClick={() => setRedirectUrl('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="Remove external redirect link"
                >
                  <X className="w-3 h-3" />
                  <span>Remove Link</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              If configured, readers clicking this article card or read button will redirect directly to this link. Click <strong>Remove Link</strong> to clear it anytime.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Summary / Excerpt <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary displayed on article preview cards..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs resize-y"
            />
          </div>

          <div>
            {/* Header for Body editor with Write / Preview Tabs & Format Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-medium text-slate-700">
                Full Article Body <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setBodyTab('write')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    bodyTab === 'write'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBodyTab('preview')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    bodyTab === 'preview'
                      ? 'bg-white text-teal-700 shadow-2xs border border-teal-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Quick Markdown Toolbar (visible in write tab) */}
            {bodyTab === 'write' && (
              <div className="flex flex-wrap items-center gap-1 p-1 mb-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-slate-600">
                <button
                  type="button"
                  onClick={() => handleInsertFormat('**', '**')}
                  title="Bold (**text**)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs font-bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('*', '*')}
                  title="Italic (*text*)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                <button
                  type="button"
                  onClick={() => handleInsertFormat('\n## ')}
                  title="Heading 2 (## Title)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('\n### ')}
                  title="Heading 3 (### Title)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                <button
                  type="button"
                  onClick={() => handleInsertFormat('\n- ')}
                  title="Bullet List (- Item)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('\n1. ')}
                  title="Numbered List (1. Item)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('\n> ')}
                  title="Quote (> Quote)"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('```\n', '\n```')}
                  title="Code Block"
                  className="p-1 hover:bg-slate-200/80 rounded transition-colors text-xs"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <span className="ml-auto text-[10px] text-slate-400 pr-1">
                  Supports Markdown & Linebreaks
                </span>
              </div>
            )}

            {bodyTab === 'write' ? (
              <textarea
                ref={textareaRef}
                rows={11}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full technical content, architectural recommendations, and code snippets..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors shadow-2xs resize-y font-mono leading-relaxed"
              />
            ) : (
              <div className="w-full min-h-[220px] max-h-[350px] overflow-y-auto px-4 py-3 rounded-lg bg-slate-50/60 border border-slate-200 text-slate-800 text-xs">
                {content.trim() ? (
                  <div className="space-y-3 leading-relaxed">
                    <Markdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-base font-bold text-slate-900 mt-3 mb-1.5 pb-1 border-b border-slate-200 font-heading">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1 pb-0.5 border-b border-slate-200 font-heading">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-semibold text-slate-900 mt-2 mb-0.5 font-heading">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2.5 text-slate-700 leading-relaxed whitespace-pre-line text-xs last:mb-0">
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
                          <ul className="list-disc pl-4 space-y-1 my-2 text-slate-700 text-xs">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 space-y-1 my-2 text-slate-700 text-xs">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed text-slate-700 pl-0.5 my-0.5">
                            {children}
                          </li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-3 border-teal-500 pl-3 py-1 my-2 bg-teal-50/50 rounded-r text-slate-700 italic text-xs">
                            {children}
                          </blockquote>
                        ),
                        code: ({ inline, className, children, ...props }: any) => {
                          if (inline) {
                            return (
                              <code className="px-1.5 py-0.5 rounded bg-slate-200 text-teal-800 font-mono text-[11px] font-medium">
                                {children}
                              </code>
                            );
                          }
                          return (
                            <div className="my-2 rounded bg-slate-900 text-teal-300 p-2.5 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
                              <code>{children}</code>
                            </div>
                          );
                        }
                      }}
                    >
                      {content}
                    </Markdown>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-center py-8">
                    No article body content to preview. Switch to the Write tab to enter text.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
