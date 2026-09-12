import React, { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { BlogPost } from '../../types';

interface AdminNewBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlog: (blog: BlogPost) => void;
}

export const AdminNewBlogModal: React.FC<AdminNewBlogModalProps> = ({
  isOpen,
  onClose,
  onAddBlog
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) return;

    const newBlog: BlogPost = {
      id: `blog-${Date.now()}`,
      title: title.trim(),
      category: category,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80',
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: 'Forum Admin',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    };

    onAddBlog(newBlog);
    setTitle('');
    setExcerpt('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-5 sm:p-8 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900">
                Write Technical Knowledge Post
              </h3>
              <p className="text-xs text-slate-500">
                Publishes directly to the public Ama Blogs & Technical Guides section
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Article Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecting Distributed Redis Cache Leases for High-Traffic Support"
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Category Pillar
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs min-h-[44px]"
              >
                <option value="Architecture">Architecture</option>
                <option value="Design">Design & UI</option>
                <option value="DevOps">DevOps & Scale</option>
                <option value="Performance">Performance</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Featured Cover Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Brief Excerpt (Shown on Cards)
            </label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Summary of the key technical takeaways or architectural trade-offs..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Full Article Body
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Draft complete technical breakdown, step-by-step guides, code recommendations..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-full bg-[#007a64] hover:bg-[#006956] text-white font-semibold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center"
            >
              Publish Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
