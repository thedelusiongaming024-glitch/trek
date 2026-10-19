import React, { useState } from 'react';
import { 
  Globe, 
  Save, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  FileCode, 
  ShieldCheck, 
  Search, 
  Sparkles,
  Smartphone,
  Monitor,
  Copy,
  Info,
  Check
} from 'lucide-react';
import { SEOSettings } from '../../types';
import { defaultSeoSettings } from '../../utils/seo';

interface AdminSeoTabProps {
  seoSettings?: SEOSettings;
  onSaveSeoSettings: (settings: SEOSettings) => Promise<void> | void;
}

export const AdminSeoTab: React.FC<AdminSeoTabProps> = ({
  seoSettings,
  onSaveSeoSettings
}) => {
  const [formData, setFormData] = useState<SEOSettings>({
    ...defaultSeoSettings,
    ...(seoSettings || {})
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSeoSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save SEO settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyFromGeneral = () => {
    setFormData(prev => ({
      ...prev,
      ogTitle: prev.metaTitle,
      ogDescription: prev.metaDescription
    }));
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Character count guidelines
  const titleLength = formData.metaTitle.length;
  const descLength = formData.metaDescription.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              SEO & Search Engine Visibility
            </h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              formData.robotsIndex 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${formData.robotsIndex ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {formData.robotsIndex ? 'Search Indexing Active' : 'Index Blocked (noindex)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage metadata, Open Graph cards, sitemaps, robots.txt directives, and webmaster verification tags.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
            title="View dynamic XML sitemap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>sitemap.xml</span>
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
            title="View live robots.txt"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>robots.txt</span>
          </a>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved to Database!</span>
              </>
            ) : isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save SEO Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Search Metadata */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-teal-50 text-teal-600 border border-teal-100">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Search Engine Snippet & Meta Tags
                </h2>
                <p className="text-[11px] text-slate-500">
                  Primary titles and descriptions indexed by Google, Bing, and web crawlers
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Page Title (Meta Title) <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono ${
                  titleLength >= 40 && titleLength <= 65 
                    ? 'text-emerald-600 font-semibold' 
                    : titleLength > 65 
                    ? 'text-amber-600' 
                    : 'text-slate-400'
                }`}>
                  {titleLength} / 60 characters {titleLength >= 40 && titleLength <= 65 ? '✓ Ideal' : ''}
                </span>
              </div>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="e.g. Trek Consultancy Forum - Discussion Community & Support Portal"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-medium"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Appears in browser tabs and as the clickable headline in search engine listings. Recommended: 50–60 characters.
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Meta Description <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono ${
                  descLength >= 130 && descLength <= 165 
                    ? 'text-emerald-600 font-semibold' 
                    : descLength > 165 
                    ? 'text-amber-600 font-semibold' 
                    : 'text-slate-400'
                }`}>
                  {descLength} / 160 characters {descLength >= 130 && descLength <= 165 ? '✓ Ideal' : descLength > 165 ? '⚠️ May truncate' : ''}
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Brief summary of the platform's services and community discussions..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white leading-relaxed"
                required
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Displayed beneath the title in search engine result pages (SERPs). Recommended: 140–160 characters.
              </p>
            </div>

            {/* Grid: Keywords & Canonical URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Meta Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="Saudi business setup, MISA license, CR registration, ERP software"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Target search terms relevant to institutional services and community inquiries.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Canonical Base URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://trekconsultancy.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Prevents duplicate content penalties by declaring the authoritative URL.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Search Engine SERP Preview Box */}
        <div className="rounded-xl p-5 bg-slate-900 text-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                Google Search Result Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Real-time SERP Rendering
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setActivePreviewDevice('desktop')}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  activePreviewDevice === 'desktop' 
                    ? 'bg-teal-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop Google Preview"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewDevice('mobile')}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  activePreviewDevice === 'mobile' 
                    ? 'bg-teal-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile Google Preview"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`bg-white rounded-lg p-4 text-slate-900 border border-slate-200/80 transition-all ${
            activePreviewDevice === 'mobile' ? 'max-w-md mx-auto' : 'w-full'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-teal-600 border border-slate-200 shrink-0">
                T
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-[12px] font-medium text-slate-800 truncate">
                  {formData.siteName || 'Trek Consultancy'}
                </div>
                <div className="text-[10px] text-emerald-800 font-mono truncate">
                  {formData.canonicalUrl || 'https://trekconsultancy.com'}
                </div>
              </div>
            </div>

            <h3 className="text-[15px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1 mt-0.5">
              {formData.metaTitle || 'Trek Consultancy Forum - Discussion Community & Support Portal'}
            </h3>

            <p className="text-[12px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
              {formData.metaDescription || 'The official community discussion forum and enterprise services portal for Trek Consultancy.'}
            </p>
          </div>
        </div>

        {/* Section 2: Social Media & Open Graph */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-sky-50 text-sky-600 border border-sky-100">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Social Media & Open Graph Sharing
                </h2>
                <p className="text-[11px] text-slate-500">
                  Rich card previews on WhatsApp, LinkedIn, Facebook, and X (Twitter)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyFromGeneral}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3 text-slate-500" />
              <span>Sync from Meta Tags</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Open Graph Title
                </label>
                <input
                  type="text"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                  placeholder="Title for social media shares"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Open Graph Description
                </label>
                <textarea
                  rows={2}
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                  placeholder="Summary for social shares"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Social Card Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    placeholder="/trek-logo.webp or https://example.com/share-image.jpg"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ogImage: '/trek-logo.webp' })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
                  >
                    Use Logo
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Recommended resolution: 1200 × 630 pixels (PNG, JPG, or WebP).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Twitter Card Type
                  </label>
                  <select
                    value={formData.twitterCard}
                    onChange={(e) => setFormData({ ...formData, twitterCard: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white cursor-pointer"
                  >
                    <option value="summary_large_image">Large Image Card (Recommended)</option>
                    <option value="summary">Small Thumbnail Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Twitter / X @Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitterSite}
                    onChange={(e) => setFormData({ ...formData, twitterSite: e.target.value })}
                    placeholder="@trekconsultancy"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Social Card Visual Preview */}
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-slate-600 mb-2 block">
                Social Share Card Preview (WhatsApp / LinkedIn / Twitter):
              </span>
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200 relative">
                  {formData.ogImage ? (
                    <img 
                      src={formData.ogImage} 
                      alt="Social share preview"
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs flex items-center gap-1.5">
                      <Share2 className="w-4 h-4" />
                      <span>No image set</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    1200 × 630
                  </span>
                </div>
                <div className="p-3 bg-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    {new URL(formData.canonicalUrl || 'https://trekconsultancy.com').hostname}
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {formData.ogTitle || formData.metaTitle || 'Trek Consultancy Forum'}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {formData.ogDescription || formData.metaDescription || 'The official community discussion forum and enterprise services portal.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Indexing, Crawlers & Webmaster Directives */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Indexing Directives & Webmaster Verification
                </h2>
                <p className="text-[11px] text-slate-500">
                  Robots instructions and domain ownership verification codes
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Directives */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Allow Search Engine Indexing
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Directs bots to index pages (`index`). Turn off only for staging/private environments (`noindex`).
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.robotsIndex}
                    onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Follow Links on Pages
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Directs bots to follow external and internal hyperlinks (`follow`).
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.robotsFollow}
                    onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="p-3 rounded-lg border border-teal-100 bg-teal-50/40 text-[11px] text-teal-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-600" />
                  <span>Current Live Directives:</span>
                </div>
                <div className="font-mono text-[10px] bg-white/70 p-1.5 rounded border border-teal-200/60">
                  &lt;meta name="robots" content="{formData.robotsIndex ? 'index' : 'noindex'}, {formData.robotsFollow ? 'follow' : 'nofollow'}"&gt;
                </div>
              </div>
            </div>

            {/* Verification Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={formData.googleSiteVerification}
                  onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
                  placeholder="google-site-verification token or meta code"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Input the content attribute from Google Search Console's HTML tag verification method.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Bing Webmaster Tools Verification Token
                </label>
                <input
                  type="text"
                  value={formData.bingSiteVerification}
                  onChange={(e) => setFormData({ ...formData, bingSiteVerification: e.target.value })}
                  placeholder="msvalidate.01 token"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Authenticates ownership in Microsoft Bing Webmaster Tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Structured Data Schema.org (JSON-LD) */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Structured Data (Schema.org JSON-LD)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Enables rich search results, knowledge graph cards, and breadcrumbs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowJsonLd(!showJsonLd)}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
            >
              {showJsonLd ? 'Hide Code' : 'View JSON-LD Code'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Organization Legal Name
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                placeholder="Trek Consultancy"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Organization Logo URL
              </label>
              <input
                type="text"
                value={formData.organizationLogo}
                onChange={(e) => setFormData({ ...formData, organizationLogo: e.target.value })}
                placeholder="/trek-logo.webp"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Official Support Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="support@trekconsultancy.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Official Support Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+966 50 000 0000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white font-mono"
              />
            </div>
          </div>

          {showJsonLd && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
              <pre>{JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "name": formData.organizationName,
                    "url": formData.canonicalUrl,
                    "logo": formData.organizationLogo,
                    "contactPoint": {
                      "@type": "ContactPoint",
                      "telephone": formData.contactPhone,
                      "email": formData.contactEmail,
                      "contactType": "customer support"
                    }
                  },
                  {
                    "@type": "WebSite",
                    "name": formData.siteName,
                    "url": formData.canonicalUrl,
                    "description": formData.metaDescription
                  }
                ]
              }, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            All SEO parameters are stored directly in PostgreSQL and applied live to the web platform.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved to Database!</span>
              </>
            ) : isSaving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All SEO Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
