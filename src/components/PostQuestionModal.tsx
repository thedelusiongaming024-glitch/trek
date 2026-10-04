import React, { useState } from 'react';
import { X, Send, AlertCircle, Lock, UserPlus } from 'lucide-react';
import { ForumTopic, DiscussionCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PostQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTopic: Partial<ForumTopic>) => void;
  currentUser?: { id?: string; name: string; email: string; role: string; avatar?: string } | null;
  onRequireAuth?: (prompt?: string) => void;
  categories?: (string | DiscussionCategory)[];
}

export const PostQuestionModal: React.FC<PostQuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  onRequireAuth,
  categories
}) => {
  const { t, translateCategory } = useLanguage();

  const availableCategories = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
    }
    return [];
  }, [categories]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || '');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [error, setError] = useState('');

  // Keep category valid if availableCategories changes
  React.useEffect(() => {
    if (availableCategories.length > 0 && (!category || !availableCategories.includes(category))) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);

  // Keep authorName in sync if user logs in
  React.useEffect(() => {
    if (currentUser?.name) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must have an account and be logged in to create a topic.');
      if (onRequireAuth) {
        onRequireAuth('To create a topic and post questions in the forum, you must have an account and be logged in.');
      }
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please provide both a topic title and details.');
      return;
    }

    const selectedCategory = category || availableCategories[0] || 'General Discussion';

    onSubmit({
      title: title.trim(),
      category: selectedCategory,
      categorySlug: selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: content.trim(),
      author: currentUser.name || authorName.trim() || 'Community Member',
      authorEmail: currentUser.email || '',
      authorId: currentUser.id || '',
      authorRole: currentUser.role || 'Contributor',
      timeAgo: 'Just now',
      views: 1,
      likes: 0,
      replies: 0,
      repliesList: []
    });

    setTitle('');
    setContent('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.12)] p-5 sm:p-8 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading tracking-tight mb-1 pr-8">
          {t('Start a New Discussion')}
        </h3>
        <p className="text-xs text-slate-500 mb-5 sm:mb-6">
          {t('Ask our community and support engineers for guidance on themes, plugins, and architecture.', 'থিম, প্লাগইন ও আর্কিটেকচার সংক্রান্ত যেকোনো প্রশ্ন আমাদের কমিউনিটি ও প্রকৌশলীদের জিজ্ঞাসা করুন।')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!currentUser && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="w-4 h-4 shrink-0 text-amber-600" />
              <span><strong>{t('Account required:', 'অ্যাকাউন্ট প্রয়োজন:')}</strong> {t('You must be logged in to post questions.', 'প্রশ্ন পোস্ট করতে লগইন করুন।')}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth?.('To create a topic and post questions in the forum, you must have an account and be logged in.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00a8b5] text-white font-semibold text-xs shadow-xs hover:bg-[#0096a3] shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('Log In / Sign Up', 'লগইন / সাইন আপ')}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('Topic Title')} <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('e.g., How do I customize the header typography?', 'যেমন: হেডার টাইপোগ্রাফি কীভাবে কাস্টমাইজ করব?')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-xs"
              >
                {availableCategories.length === 0 ? (
                  <option value="" disabled className="bg-white text-slate-500">
                    {t('Loading categories...', 'ক্যাটাগরি লোড হচ্ছে...')}
                  </option>
                ) : (
                  availableCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-slate-900">
                      {translateCategory(cat)}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('Your Display Name')}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Guest User"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('Detailed Question or Description')} <span className="text-teal-600">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('Provide relevant details, theme versions, or steps you have tried...', 'প্রাসঙ্গিক বিবরণ বা সমস্যাটি বিস্তারিত লিখুন...')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs resize-none"
              required
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('Publish Discussion')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
