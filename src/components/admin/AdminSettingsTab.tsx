import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  Save, 
  Bell, 
  ShieldCheck, 
  Clock, 
  Sliders,
  CheckCircle2,
  Cpu,
  Zap,
  Bot,
  Activity,
  Key,
  Play,
  RefreshCw,
  AlertTriangle,
  Info,
  Layers,
  Terminal,
  Server,
  Database,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { PlatformSettings, AIModelPreset, AIKnowledgeStatus } from '../../types';
import { AI_MODEL_PRESETS, getModelPreset, resolveAIProvider } from '../../lib/aiModels';

interface AdminSettingsTabProps {
  settings: PlatformSettings;
  onSaveSettings: (newSettings: PlatformSettings) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<PlatformSettings>({
    ...settings,
    activeAiModel: settings.activeAiModel || 'gemini-2.5-flash',
    aiProvider: settings.aiProvider || 'auto',
    aiTemperature: typeof settings.aiTemperature === 'number' ? settings.aiTemperature : 0.2
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [liveStatus, setLiveStatus] = useState<AIKnowledgeStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Model Live Test state
  const [testPrompt, setTestPrompt] = useState('How does Trek Consultancy assist foreign companies with MISA licensing and commercial registration in Saudi Arabia?');
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    model: string;
    provider: string;
    latencyMs: number;
    reply?: string;
    error?: string;
    ragFallbackReply?: string;
    hasRagFallback?: boolean;
    isLocalRag?: boolean;
  } | null>(null);

  // Filter for model presets category
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'google' | 'openai' | 'flagship' | 'fast' | 'local'>('all');

  // Fetch AI Knowledge status from backend to verify live keys
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/support/ai-knowledge-status');
      if (res.ok) {
        const data = await res.json();
        setLiveStatus(data);
      }
    } catch (err) {
      console.warn('Failed to load AI knowledge status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleTestModel = async (overrideModel?: string) => {
    if (!testPrompt.trim()) return;
    setIsTestingModel(true);
    setTestResult(null);

    const targetModel = overrideModel || formData.activeAiModel || 'gemini-2.5-flash';
    const isLocal = targetModel === 'local-rag';

    try {
      const res = await fetch('/api/admin/support/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          provider: isLocal ? 'local' : formData.aiProvider,
          message: testPrompt.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          model: data.model || targetModel,
          provider: data.provider || (isLocal ? 'PostgreSQL Database' : 'AI Engine'),
          latencyMs: data.latencyMs || 0,
          reply: data.reply,
          isLocalRag: data.isLocalRag || isLocal
        });
      } else {
        setTestResult({
          success: false,
          model: targetModel,
          provider: data.provider || 'AI Engine',
          latencyMs: data.latencyMs || 0,
          error: data.error || 'Test query failed',
          ragFallbackReply: data.ragFallbackReply,
          hasRagFallback: Boolean(data.hasRagFallback)
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        model: targetModel,
        provider: 'Network Error',
        latencyMs: 0,
        error: err?.message || 'Could not connect to test endpoint'
      });
    } finally {
      setIsTestingModel(false);
    }
  };

  const activePreset = getModelPreset(formData.activeAiModel || 'gemini-2.5-flash');

  const filteredPresets = AI_MODEL_PRESETS.filter(p => {
    if (selectedCategory === 'google') return p.provider === 'gemini';
    if (selectedCategory === 'openai') return p.provider === 'openai';
    if (selectedCategory === 'local') return p.provider === 'local';
    if (selectedCategory === 'flagship') return p.tier === 'flagship' || p.tier === 'reasoning';
    if (selectedCategory === 'fast') return p.tier === 'fast';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-teal-600" />
            <span>Platform Configuration & AI Model Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage the global AI model architecture, provider failovers, knowledge base settings, and community policies.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
          <span>Refresh API Status</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ================================================================= */}
        {/* 1. GLOBAL AI MODEL SWITCHER & PROVIDER ARCHITECTURE */}
        {/* ================================================================= */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Title & Status Chips */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                  <Cpu className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                  Global Project Engine
                </span>
              </div>
              <h3 className="text-lg font-bold font-heading text-white">
                Active AI Model & Inference Pipeline
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Switching this model instantly redirects <strong>all conversational chat</strong>, <strong>file knowledge extractions</strong>, and <strong>automated response synthesizers</strong> across the entire application.
              </p>
            </div>

            {/* Live API Key & Database Health Status */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <div className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                liveStatus?.hasGeminiKey !== false 
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' 
                  : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${liveStatus?.hasGeminiKey !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>Gemini API: {liveStatus?.hasGeminiKey !== false ? 'Connected' : 'Missing Key'}</span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                liveStatus?.hasOpenAiKey !== false 
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' 
                  : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${liveStatus?.hasOpenAiKey !== false ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>OpenAI API: {liveStatus?.hasOpenAiKey !== false ? 'Connected' : 'Missing Key'}</span>
              </div>
            </div>
          </div>

          {/* Active Model Spotlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">
                      {activePreset ? activePreset.displayName : formData.activeAiModel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-700 text-teal-300 border border-slate-600">
                      {formData.activeAiModel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 uppercase">
                      {activePreset?.providerName || 'Universal'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {activePreset?.description || 'Standard language model for enterprise consultation and knowledge retrieval.'}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700 gap-1 text-[11px] text-slate-400">
                <span className="font-semibold text-teal-400">
                  Best For: {activePreset?.bestFor || 'General Purpose'}
                </span>
                <span className="text-slate-400">
                  Context: {activePreset?.contextWindow || '1M+ Tokens'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Preset Selection Grid */}
          <div className="space-y-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Select Target AI Model ({AI_MODEL_PRESETS.length} Models Available):</span>
              </label>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {([
                  { id: 'all', label: 'All Models' },
                  { id: 'local', label: 'Local PostgreSQL RAG' },
                  { id: 'google', label: 'Google Gemini' },
                  { id: 'openai', label: 'OpenAI' },
                  { id: 'flagship', label: 'Flagship / Reasoning' },
                  { id: 'fast', label: 'Fast' }
                ] as const).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-teal-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresets.map(preset => {
                const isSelected = formData.activeAiModel === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      activeAiModel: preset.id,
                      aiProvider: preset.provider === 'gemini' ? 'gemini' : preset.provider === 'openai' ? 'openai' : 'auto'
                    })}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-950/80 border-teal-400 shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40'
                        : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
                      </span>
                    )}

                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white">{preset.displayName}</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                          preset.provider === 'gemini' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {preset.providerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-teal-400 font-medium">
                        {preset.bestFor}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {preset.id}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Routing & Temperature Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 relative z-10">
            {/* Provider Routing Strategy */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                Provider Routing Mode
              </label>
              <select
                value={formData.aiProvider || 'auto'}
                onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value as any })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:border-teal-400 focus:outline-none"
              >
                <option value="auto">Auto-Detect (Matches Model ID with Automatic Fallback)</option>
                <option value="gemini">Enforce Google Gemini SDK Engine</option>
                <option value="openai">Enforce OpenAI SDK Engine</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Recommended: <strong>Auto-Detect</strong> seamlessly executes the native API SDK and falls back if quota limits are reached.
              </p>
            </div>

            {/* Inference Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 block">
                  Inference Temperature
                </label>
                <span className="text-xs font-mono font-bold text-teal-400">
                  {formData.aiTemperature?.toFixed(1) || '0.2'}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={formData.aiTemperature ?? 0.2}
                onChange={(e) => setFormData({ ...formData, aiTemperature: parseFloat(e.target.value) })}
                className="w-full accent-teal-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>0.0 (Strict Factual RAG)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Creative Consultative)</span>
              </div>
            </div>
          </div>

          {/* Real-Time Live AI Model Diagnostics & Latency Tester */}
          <div className="rounded-2xl p-4 sm:p-5 bg-slate-950/80 border border-slate-800 space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-200">
                  Live Model Diagnostic Console ({formData.activeAiModel})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Tests real-time execution & network latency
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter inquiry to benchmark model latency..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-teal-400 focus:outline-none"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  disabled={isTestingModel || !testPrompt.trim()}
                  onClick={() => handleTestModel()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  {isTestingModel ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Test Selected Model</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isTestingModel || !testPrompt.trim()}
                  onClick={() => handleTestModel('local-rag')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  title="Test deterministic PostgreSQL Local RAG execution (Zero external API dependencies)"
                >
                  <Database className="w-3.5 h-3.5 text-teal-400" />
                  <span>Test Local RAG</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 animate-in fade-in ${
                testResult.success 
                  ? 'bg-slate-900/95 border-teal-500/40 text-slate-200' 
                  : 'bg-slate-900/95 border-amber-500/40 text-slate-200'
              }`}>
                <div className="flex items-center justify-between font-mono text-[11px] pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${testResult.success ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' : 'bg-amber-400'}`} />
                    <span className="font-bold text-white">{testResult.model}</span>
                    <span className="text-slate-400 font-sans">({testResult.provider})</span>
                  </div>
                  <span className="text-teal-400 font-bold">
                    Latency: {testResult.latencyMs} ms
                  </span>
                </div>

                {testResult.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-teal-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Model Execution Verified:</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-sans text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      {testResult.reply}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Cloud AI Key Status</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        {testResult.error}
                      </p>
                    </div>

                    {testResult.hasRagFallback && testResult.ragFallbackReply && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-teal-300 flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-teal-400" />
                            PostgreSQL Knowledge Base Response (Live Fallback Active):
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                            Auto-Protected
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-300 font-sans text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                          {testResult.ragFallbackReply}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. IDENTITY, CONTACT DETAILS & SUPPORT CHANNELS */}
        {/* ================================================================= */}
        <div className="rounded-3xl p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900">
                Company Profile & Official Contact Channels
              </h3>
              <p className="text-xs text-slate-500">
                Official contact parameters automatically injected into AI responses and support escalations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Organization / Brand Name
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
                Primary Support & Lead Email
              </label>
              <input
                type="email"
                value={formData.primarySupportEmail}
                onChange={(e) => setFormData({ ...formData, primarySupportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Telephone Number
              </label>
              <input
                type="text"
                value={formData.phone || '+966 55 363 8960'}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official WhatsApp Number (Saudi Arabia)
              </label>
              <input
                type="text"
                value={formData.whatsapp || '+966 50 241 1744'}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Consultancy SLA Response Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.slaHours || 48}
                onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value, 10) || 48 })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Platform Slogan / Tagline
              </label>
              <input
                type="text"
                value={formData.forumTagline}
                onChange={(e) => setFormData({ ...formData, forumTagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white/90 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. ANNOUNCEMENT BANNER & AUTOMATION */}
        {/* ================================================================= */}
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

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
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

        {/* ================================================================= */}
        {/* SAVE BAR */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between pt-2 pb-8 sticky bottom-4 z-20">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>AI model & platform settings successfully saved and active across the whole project!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-teal-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply AI Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
