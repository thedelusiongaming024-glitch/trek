import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ForumTopic, DiscussionCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EditTopicModalProps {
  topic: ForumTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedData: {
    id: string;
    title: string;
    category: string;
    categorySlug?: string;
    content: string;
  }) => Promise<void> | void;
  categories?: (string | DiscussionCategory)[];
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({
  topic,
  isOpen,
  onClose,
  onSubmit,
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
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (topic) {
      setTitle(topic.title || '');
      setCategory(topic.category || (availableCategories[0] || 'General Discussion'));
      setContent(topic.content || '');
      setError('');
    }
  }, [topic, availableCategories]);

  if (!isOpen || !topic) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError(t('Please provide both a topic title and details.', 'অনুগ্রহ করে শিরোনাম এবং বিস্তারিত তথ্য প্রদান করুন।', 'يرجى تقديم عنوان للموضوع والتفاصيل.'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const selectedCategory = category || topic.category || availableCategories[0] || 'General Discussion';
      const categorySlug = selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await onSubmit({
        id: topic.id,
        title: title.trim(),
        category: selectedCategory,
        categorySlug,
        content: content.trim()
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || t('Failed to update topic. Please try again.', 'পোস্ট আপডেট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'فشل تحديث المنشور. يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-topic-title"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.14)] p-5 sm:p-8 text-slate-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label={t('Close dialog', 'ডায়ালগ বন্ধ করুন', 'إغلاق النافذة')}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
            {t('Edit Discussion', 'আলোচনা সম্পাদনা', 'تعديل المناقشة')}
          </span>
          <h2 id="edit-topic-title" className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-heading">
            {t('Update Your Post', 'আপনার পোস্ট আপডেট করুন', 'تحديث منشورك')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('Make changes to your question title, category, or content details.', 'আপনার প্রশ্নের শিরোনাম, ক্যাটাগরি বা বিস্তারিত বিষয়বস্তু পরিবর্তন করুন।', 'قم بإجراء التغييرات على عنوان سؤالك، التصنيف، أو تفاصيل المحتوى.')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('Topic Title', 'আলোচনার শিরোনাম', 'عنوان الموضوع')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('e.g. Best strategies for microservice load balancing', 'যেমন: মাইক্রোসার্ভিস লোড ব্যালেন্সিংয়ের সেরা কৌশল', 'مثال: أفضل استراتيجيات توزيع الأحمال في الخدمات المصغرة')}
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('Category', 'ক্যাটাগরি', 'التصنيف')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all text-slate-700"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat)}
                </option>
              ))}
              {!availableCategories.includes(category) && category && (
                <option value={category}>{translateCategory(category)}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('Details & Context', 'বিস্তারিত ও প্রাসঙ্গিক তথ্য', 'التفاصيل والسياق')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('Explain the problem or background context in detail...', 'সমস্যা বা প্রাসঙ্গিক বিষয় বিস্তারিত বর্ণনা করুন...', 'اشرح المشكلة أو السياق بالتفصيل...')}
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all placeholder:text-slate-400 resize-y"
            />
          </div>

          <div className="pt-3 flex items-center justify-end rtl:justify-start gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('Cancel', 'বাতিল', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-teal-600/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? t('Saving...', 'সংরক্ষণ করা হচ্ছে...', 'جاري الحفظ...') : t('Save Changes', 'পরিবর্তন সংরক্ষণ করুন', 'حفظ التغييرات')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
