import React, { useState } from 'react';
import { 
  Save, 
  Bell, 
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
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Platform Settings & Policies
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure announcements, platform metadata, and automated moderation rules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner Card */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Announcement Banner
              </h2>
              <p className="text-[11px] text-slate-500">
                Displays a prominent notice at the top of the community homepage
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">
              Display Announcement
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAnnouncement}
                onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1">
              Banner Content
            </label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
            />
          </div>
        </div>

        {/* Identity & Support Settings */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Platform Identity & Moderation
              </h2>
              <p className="text-[11px] text-slate-500">
                Site title, contact address, and automated filtering
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Portal Name
              </label>
              <input
                type="text"
                value={formData.forumName}
                onChange={(e) => setFormData({ ...formData, forumName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Primary Support Email
              </label>
              <input
                type="email"
                value={formData.primarySupportEmail}
                onChange={(e) => setFormData({ ...formData, primarySupportEmail: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.forumTagline}
              onChange={(e) => setFormData({ ...formData, forumTagline: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <span className="text-xs font-medium text-slate-800 block">Automated Spam & Link Filtering</span>
              <span className="text-[11px] text-slate-500">Quarantine unverified links and repeat spam</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoModeration}
                onChange={(e) => setFormData({ ...formData, enableAutoModeration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Settings saved successfully!
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

