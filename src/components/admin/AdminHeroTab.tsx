import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Layers, 
  ExternalLink,
  Info
} from 'lucide-react';
import { HeroSettings, HeroSlideImage } from '../../types';

interface AdminHeroTabProps {
  heroSettings?: HeroSettings;
  onSaveHeroSettings: (settings: HeroSettings) => Promise<void> | void;
}

export const defaultAdminHeroSettings: HeroSettings = {
  slides: [
    {
      id: 'slide-1',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      title: 'Enterprise Architecture & Cloud Systems',
      subtitle: 'Designing scalable, mission-critical platforms with modern resilience.',
      isActive: true
    },
    {
      id: 'slide-2',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
      title: 'Global Technology Strategy & Community Advisory',
      subtitle: 'Collaborative problem solving with leading senior engineers.',
      isActive: true
    },
    {
      id: 'slide-3',
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80',
      title: 'Performance Engineering & High-Traffic Optimization',
      subtitle: 'Turnkey solutions for database scaling, APIs, and microservices.',
      isActive: true
    }
  ],
  autoplay: true,
  intervalSeconds: 2,
  overlayOpacity: 0.65,
  overlayGradient: 'violet-dark',
  transitionEffect: 'fade',
  title: 'Welcome to Trek Consultancy Forum',
  subtitle: 'The official community forum and support portal for Trek Consultancy',
  searchPlaceholder: 'Search for Topics, Solutions, & Guides....',
  enableOverlayMesh: true,
  heroHeight: 'tall'
};

export const AdminHeroTab: React.FC<AdminHeroTabProps> = ({
  heroSettings,
  onSaveHeroSettings
}) => {
  const [settings, setSettings] = useState<HeroSettings>(() => {
    return heroSettings || defaultAdminHeroSettings;
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if props change from outside
  useEffect(() => {
    if (heroSettings) {
      setSettings(heroSettings);
    }
  }, [heroSettings]);

  const activeSlides = settings.slides.filter(s => s.isActive !== false);

  const handleAddSlide = () => {
    const targetUrl = newImageUrl.trim();
    if (!targetUrl) return;

    const newSlide: HeroSlideImage = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: targetUrl,
      title: newImageTitle.trim() || undefined,
      isActive: true
    };

    setSettings(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));

    setNewImageUrl('');
    setNewImageTitle('');
  };

  const handleDeleteSlide = (id: string) => {
    setSettings(prev => ({
      ...prev,
      slides: prev.slides.filter(s => s.id !== id)
    }));
  };

  const handleToggleSlideActive = (id: string) => {
    setSettings(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    }));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.slides.length) return;

    setSettings(prev => {
      const updated = [...prev.slides];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, slides: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveHeroSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save hero settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset hero slideshow to default corporate images?')) {
      setSettings(defaultAdminHeroSettings);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 text-xs font-semibold mb-2 border border-teal-500/20">
            <Image className="w-3.5 h-3.5 text-teal-600" />
            <span>Hero Background Slideshow</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Hero Slideshow Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Add web image links to display in the public hero section background slideshow. All changes are stored directly in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Restore original preset images"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving to Neon...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved & Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Hero Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Add New Slide Card */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 font-heading">
            Add New Background Image
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Image Web Link (HTTPS URL) *</label>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... or your web image URL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Caption / Category (Optional)</label>
            <input
              type="text"
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
              placeholder="e.g. Enterprise Cloud Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Enter any web image URL. High-resolution landscape images (1920×1080) look best.</span>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            disabled={!newImageUrl.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide to Hero</span>
          </button>
        </div>
      </div>

      {/* 3. Configured Slides List */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Configured Slides ({settings.slides.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {activeSlides.length} active in public rotation
          </span>
        </div>

        {settings.slides.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
            <Image className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No slides configured yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the input above to add background images for the hero slideshow.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                  slide.isActive !== false
                    ? 'bg-white border-slate-200/90 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                }`}
              >
                {/* Thumbnail and Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    <img
                      src={slide.url}
                      alt={slide.title || 'Hero slide'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-teal-700/85 backdrop-blur-xs text-[9px] font-bold text-white shadow-xs">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {slide.title || `Slide ${index + 1}`}
                      </p>
                      {slide.isActive === false && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">
                          Hidden
                        </span>
                      )}
                    </div>
                    <a
                      href={slide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 truncate max-w-xs sm:max-w-md mt-0.5"
                    >
                      <span className="truncate">{slide.url}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Actions: Reorder, Active toggle, Delete */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(index, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title="Move slide up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveSlide(index, 'down')}
                    disabled={index === settings.slides.length - 1}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title="Move slide down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSlideActive(slide.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      slide.isActive !== false
                        ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={slide.isActive !== false ? 'Hide from public hero' : 'Show in public hero'}
                  >
                    {slide.isActive !== false ? 'Active' : 'Hidden'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Hero Headline & Search Text Copywriting */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs p-6 sm:p-7 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-heading">
          Headline & Search Copywriting
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Main Hero Headline</label>
            <input
              type="text"
              value={settings.title || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Welcome to Trek Consultancy Forum"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Search Bar Placeholder</label>
            <input
              type="text"
              value={settings.searchPlaceholder || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, searchPlaceholder: e.target.value }))}
              placeholder="Search for Topics, Solutions, & Guides...."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
