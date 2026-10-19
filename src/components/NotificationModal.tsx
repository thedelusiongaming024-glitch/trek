import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, XCircle, Clock, ArrowRight, Eye } from 'lucide-react';
import { UserNotification } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NotificationModalProps {
  notification: UserNotification | null;
  onClose: () => void;
  onViewTopic: (topicId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  onViewTopic
}) => {
  const { language, t } = useLanguage();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onViewTopicRef = useRef(onViewTopic);
  onViewTopicRef.current = onViewTopic;

  const notifId = notification?.id;

  // Auto-close after exactly 30 seconds (no rewinding loop)
  useEffect(() => {
    if (!notifId) return;

    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 30000);

    return () => {
      clearTimeout(timer);
    };
  }, [notifId]);

  if (!notification) return null;

  const isApproved = notification.type === 'topic_approved';
  const isPending = notification.type === 'topic_pending';

  const handleView = () => {
    onViewTopicRef.current(notification.topicId);
    onCloseRef.current();
  };

  const handleClose = () => {
    onCloseRef.current();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 text-slate-800 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
      >
        {/* Top-Left Close Button as specifically required */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          title={t('Close')}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className={`pt-9 pb-5 px-6 flex flex-col items-center text-center ${
          isApproved 
            ? 'bg-gradient-to-b from-emerald-50 via-teal-50/40 to-transparent' 
            : isPending
              ? 'bg-gradient-to-b from-amber-50 via-teal-50/30 to-transparent'
              : 'bg-gradient-to-b from-rose-50 via-red-50/40 to-transparent'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
            isApproved 
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/20' 
              : isPending
                ? 'bg-gradient-to-tr from-amber-500 to-teal-500 text-white shadow-amber-500/20'
                : 'bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-rose-500/20'
          }`}>
            {isApproved ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : isPending ? (
              <Clock className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </div>

          <h3 id="notification-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
            {notification.title || (isApproved 
              ? (language === 'ar' ? 'تمت الموافقة على سؤالك! 🎉' : language === 'bn' ? 'আপনার প্রশ্নটি অনুমোদিত হয়েছে! 🎉' : 'Discussion Question Approved! 🎉')
              : isPending
                ? (language === 'ar' ? 'تم تقديم سؤالك للمراجعة ⏳' : language === 'bn' ? 'প্রশ্নটি পর্যালোচনার জন্য জমা হয়েছে ⏳' : 'Question Submitted for Review ⏳')
                : (language === 'ar' ? 'تم رفض سؤالك' : language === 'bn' ? 'আপনার প্রশ্নটি বাতিল করা হয়েছে' : 'Discussion Post Update')
            )}
          </h3>

          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {notification.title?.includes('Edit') || notification.title?.includes('সম্পাদিত') || notification.title?.includes('المعدل')
              ? (isPending
                  ? (language === 'ar' ? 'سيقوم المشرف بمراجعة منشورك المعدل واعتماده قريباً.' : language === 'bn' ? 'অ্যাডমিন আপনার সম্পাদিত প্রশ্ন পর্যালোচনা করে শীঘ্রই অনুমোদন করবেন।' : 'The admin will review your edited post and approve it soon.')
                  : isApproved
                    ? (language === 'ar' ? 'تمت الموافقة على تعديلك ونشره في المنتدى.' : language === 'bn' ? 'আপনার সম্পাদিত প্রশ্নটি অনুমোদিত ও প্রকাশিত হয়েছে।' : 'Your edited question was approved and published on the forum.')
                    : (language === 'ar' ? 'تم رفض التعديل وظل منشورك الأصلي منشورًا بدون تغيير.' : language === 'bn' ? 'সম্পাদনা বাতিল হয়েছে এবং মূল পোস্টটি অপরিবর্তিত অবস্থায় বহাল রয়েছে।' : 'Edit was rejected. Your original post remains unchanged on the forum.')
                )
              : (isApproved
                ? (language === 'ar' ? 'راجع المشرف سؤالك ووافق على نشره في المنتدى.' : language === 'bn' ? 'অ্যাডমিন আপনার প্রশ্নটি পর্যালোচনা করেছেন এবং ফোরামে প্রকাশ অনুমোদন করেছেন।' : 'The admin reviewed and approved your post for the forum.')
                : isPending
                  ? (language === 'ar' ? 'سيقوم المشرف بمراجعة سؤالك واعتماده قريباً ليظهر في المنتدى.' : language === 'bn' ? 'অ্যাডমিন আপনার প্রশ্নটি পর্যালোচনা করে অনুমোদন করবেন।' : 'The admin will review your post and approve it soon to be published on the forum.')
                  : (language === 'ar' ? 'تمت مراجعة سؤالك من قبل المشرف ولم يتم اعتماده.' : language === 'bn' ? 'অ্যাডমিন কর্তৃক আপনার প্রশ্নটি পর্যালোচনা ও বাতিল করা হয়েছে।' : 'Your question was reviewed and not approved by the admin.')
              )
            }
          </p>
        </div>

        {/* Topic Title / Message Box */}
        <div className="px-6 py-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block mb-1">
              {language === 'ar' ? 'عنوان الموضوع:' : language === 'bn' ? 'প্রশ্নের শিরোনাম:' : 'Topic Title:'}
            </span>
            <p className="font-semibold text-slate-800 line-clamp-2">
              "{notification.topicTitle}"
            </p>
            {notification.message && (
              <p className="mt-2 pt-2 border-t border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                {notification.message}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 flex items-center gap-3">
          {isApproved || (notification.type === 'topic_rejected' && (notification.title?.includes('Edit') || notification.title?.includes('تعديل') || notification.title?.includes('সম্পাদনা'))) ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleView}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-semibold shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'عرض الموضوع' : language === 'bn' ? 'প্রশ্নটি দেখুন' : 'View Discussion'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'حسناً، فهمت' : language === 'bn' ? 'ঠিক আছে' : 'Got It'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
