import React, { useState } from 'react';
import { X, Layers, CheckCircle, ExternalLink } from 'lucide-react';
import trekLogo from '../assets/trek-logo.webp';
import { useLanguage } from '../context/LanguageContext';

interface ConsultancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitConsultancy?: (data: { company: string; email: string; scope: string }) => void;
}

export const ConsultancyModal: React.FC<ConsultancyModalProps> = ({ isOpen, onClose, onSubmitConsultancy }) => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !email.trim() || !scope.trim()) return;
    if (onSubmitConsultancy) {
      onSubmitConsultancy({
        company: company.trim(),
        email: email.trim(),
        scope: scope.trim()
      });
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-5 sm:p-8 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <img
            src={trekLogo}
            alt="Trek Consultancy"
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <div>
            <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">
              {t('Enterprise Architecture & Consulting')}
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          {t('Access our primary corporate platform for complete business solutions. Our architects offer dedicated SLA response times, private code audits, high-traffic scalability audits, and turnkey WordPress/Docly enterprise customizations.')}
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-800 text-xs flex items-center gap-2 backdrop-blur-md">
            <CheckCircle className="w-4 h-4 shrink-0 text-teal-600" />
            <span>{t('Consultancy request received. Our senior architect will contact you within 24 hours.')}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('Company / Organization')}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Technologies"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('Work Email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lead@acme.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('Project Scope')}
              </label>
              <textarea
                rows={2}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder={t('Briefly describe your support or custom development requirements...', 'আপনার চাহিদা বা প্রজেক্টের বিবরণ সংক্ষেপে লিখুন...')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs resize-none"
                required
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
              >
                {t('Close')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md transition-all active:scale-95"
              >
                <span>{t('Request Consultation')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
