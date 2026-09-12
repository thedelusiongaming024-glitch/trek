import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  Save, 
  Bell, 
  ShieldCheck, 
  Clock, 
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { PlatformSettings } from '../../types';

interface AdminSettingsTabProps {
  settings: PlatformSettings;
  onSaveSettings: (newSettings: PlatformSettings) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<PlatformSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
          Platform Customization & Policies
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure global forum banners, automated moderation rules, and support SLA targets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Card */}
        <div className="rounded-3xl p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900">
                Global Announcement Banner
              </h3>
              <p className="text-xs text-slate-500">
                Displays a prominent glassmorphic alert at the top of the community homepage
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Broadcast Active Announcement
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAnnouncement}
                onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a8b5]"></div>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Banner Content Text
            </label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Identity & Support Settings */}
        <div className="rounded-3xl p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900">
                Community Metadata & Support Routing
              </h3>
              <p className="text-xs text-slate-500">
                Organization details displayed in knowledge base footers and transactional notifications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Portal Display Name
              </label>
              <input
                type="text"
                value={formData.forumName}
                onChange={(e) => setFormData({ ...formData, forumName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Escalation Email
              </label>
              <input
                type="email"
                value={formData.primarySupportEmail}
                onChange={(e) => setFormData({ ...formData, primarySupportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Community Tagline
            </label>
            <input
              type="text"
              value={formData.forumTagline}
              onChange={(e) => setFormData({ ...formData, forumTagline: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Automated Spam & Abuse Moderation</span>
              <span className="text-[11px] text-slate-500">Auto-quarantine unverified links and repeat message spam</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoModeration}
                onChange={(e) => setFormData({ ...formData, enableAutoModeration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a8b5]"></div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Settings successfully saved and live!
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
