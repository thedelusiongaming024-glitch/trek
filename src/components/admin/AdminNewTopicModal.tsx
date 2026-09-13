import React, { useState } from 'react';
import { Sparkles, Pin, Star, ShieldCheck } from 'lucide-react';
import { ForumTopic } from '../../types';

interface AdminNewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopic: (topic: ForumTopic) => void;
}

export const AdminNewTopicModal: React.FC<AdminNewTopicModalProps> = ({
  isOpen,
  onClose,
  onAddTopic
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Most requested features of 2020');
  const [authorRole, setAuthorRole] = useState('Administrator');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newTopic: ForumTopic = {
      id: `topic-${Date.now()}`,
      title: title.trim(),
      author: 'Forum Admin',
      authorRole: authorRole,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      timeAgo: 'Just now',
      category: category,
      categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      views: 1,
      likes: 0,
      replies: 0,
      isFeatured: isFeatured,
      isPopular: isPopular,
      content: content.trim(),
      repliesList: []
    };

    onAddTopic(newTopic);
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-5 sm:p-8 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900">
                Publish Official Forum Topic
              </h3>
              <p className="text-xs text-slate-500">
                Create an authoritative staff thread or product roadmap bulletin
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
              Topic Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ama Theme v3.5 Release Roadmap & Feature Voting"
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Forum Board Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs min-h-[44px]"
              >
                <option value="Most requested features of 2020">Feature Requests</option>
                <option value="Latest Product Support">Product Support</option>
                <option value="Docly Theme Support">Docly Theme Support</option>
                <option value="WordPress Integrations">WordPress Integrations</option>
                <option value="Announcement">Official Announcements</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Staff Badge / Role
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full p-2.5 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs min-h-[44px]"
              >
                <option value="Administrator">Administrator</option>
                <option value="Lead Architect">Lead Architect</option>
                <option value="Support Team">Support Team</option>
                <option value="Theme Specialist">Theme Specialist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Topic Body / Discussion Content
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide complete details, architectural requirements, or instructions for community participants..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 text-base sm:text-xs"
            />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="text-slate-700 font-semibold flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                Pin Topic to Top
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="text-slate-700 font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-teal-500" />
                Mark as Hot Discussion
              </span>
            </label>
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
              className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold shadow-md shadow-teal-500/20 cursor-pointer flex items-center justify-center"
            >
              Publish Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
