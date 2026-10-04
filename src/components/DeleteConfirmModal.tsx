import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemTitle?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemTitle,
  message,
  confirmLabel,
  cancelLabel,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const displayTitle = title ? t(title) : t('Delete Post');
  const displayMessage = message ? t(message) : t('Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies.');
  const displayConfirmLabel = confirmLabel ? t(confirmLabel) : t('Delete Post');
  const displayCancelLabel = cancelLabel ? t(cancelLabel) : t('Cancel');
  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-6 sm:p-7 text-slate-800 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex-1 pr-6">
            <h3 id="delete-dialog-title" className="text-base sm:text-lg font-bold text-slate-900 font-heading tracking-tight">
              {displayTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {displayMessage}
            </p>
          </div>
        </div>

        {/* Item Preview Callout */}
        {itemTitle && (
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium line-clamp-2">
            <span className="text-[11px] text-slate-400 block mb-0.5 uppercase tracking-wider font-bold">
              {t('Target Post', 'পোস্ট')}
            </span>
            "{itemTitle}"
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-full border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
          >
            {displayCancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-semibold rounded-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white shadow-md shadow-rose-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('Deleting...', 'মুছে ফেলা হচ্ছে...')}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{displayConfirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
