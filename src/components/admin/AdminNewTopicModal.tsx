import React, { useState, useEffect, useMemo } from 'react';
import { X, Pin, Star, MessageSquare } from 'lucide-react';
import { ForumTopic, DiscussionCategory, StaffRoleBadge } from '../../types';

interface AdminNewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopic: (topic: ForumTopic) => void;
  categories?: (string | DiscussionCategory)[];
  staffRoles?: (string | StaffRoleBadge)[];
}

export const AdminNewTopicModal: React.FC<AdminNewTopicModalProps> = ({
  isOpen,
  onClose,
  onAddTopic,
  categories,
  staffRoles
}) => {
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
    }
    return [];
  }, [categories]);

  const availableRoles = useMemo(() => {
    if (staffRoles && staffRoles.length > 0) {
      return staffRoles.map(r => typeof r === 'string' ? r : r.name).filter(Boolean);
    }
    return [];
  }, [staffRoles]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || '');
  const [authorRole, setAuthorRole] = useState(availableRoles[0] || '');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    if (availableCategories.length > 0 && (!category || !availableCategories.includes(category))) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);

  useEffect(() => {
    if (availableRoles.length > 0 && (!authorRole || !availableRoles.includes(authorRole))) {
      setAuthorRole(availableRoles[0]);
    }
  }, [availableRoles, authorRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const chosenCat = category || availableCategories[0] || 'General Discussion';
    const chosenRole = authorRole || availableRoles[0] || 'Administrator';

    const newTopic: ForumTopic = {
      id: '',
      title: title.trim(),
      author: 'Forum Admin',
      authorRole: chosenRole,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      timeAgo: 'Just now',
      category: chosenCat,
      categorySlug: chosenCat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl text-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                New Discussion Topic
              </h3>
              <p className="text-xs text-slate-500">
                Create and publish a thread to the public forum
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Topic Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Platform Architecture Updates & Community Roadmap"
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
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
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
              >
                {availableCategories.length === 0 ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Author Role Badge
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
              >
                {availableRoles.length === 0 ? (
                  <option value="" disabled>Loading staff roles...</option>
                ) : (
                  availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide context, details, and guidelines for discussion..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs resize-y"
            />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-600" />
                Pin to top of list
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-slate-600" />
                Mark as trending discussion
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
            >
              Publish Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
