import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Sliders, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  Layers,
  Cpu,
  FileCode,
  Server,
  Globe,
  Sparkles,
  Zap,
  Terminal,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AiProvider, AiSettingsConfig, AiModelOption } from '../../types';

interface AdminAiTabProps {
  onNotify?: (msg: string) => void;
}

interface ProviderMeta {
  id: AiProvider;
  name: string;
  nameBn: string;
  nameAr: string;
  badge: string;
  badgeColor: string;
  description: string;
  descriptionBn: string;
  descriptionAr: string;
  defaultModel: string;
  defaultBaseUrl: string;
  apiKeyHelpUrl: string;
  keyLabel: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    nameBn: 'গুগল জেমিনি',
    nameAr: 'جوجل جيميني',
    badge: 'GOOGLE DEFAULT',
    badgeColor: 'emerald',
    description: 'Fast, native multimodal intelligence with 1M-2M context tokens (Gemini 3.8 Flash, 3.1 Pro, 3.7 Flash).',
    descriptionBn: '১এম-২এম কনটেক্সট উইন্ডো সহ দ্রুত ও কার্যকরী মাল্টিমোডাল এআই (Gemini 3.8 Flash, 3.1 Pro)।',
    descriptionAr: 'ذكاء اصطناعي متعدد الوسائط فائق السرعة بنافذة سياق ضخمة تصل إلى مليوني رمز.',
    defaultModel: 'gemini-3.8-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    apiKeyHelpUrl: 'https://aistudio.google.com/app/apikey',
    keyLabel: 'Google Gemini API Key'
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    nameBn: 'ওপেনএআই (চ্যাটজিপিটি)',
    nameAr: 'أوبن إيه آي (ChatGPT)',
    badge: 'FLAGSHIP',
    badgeColor: 'purple',
    description: 'Industry-standard reasoning and conversational power (GPT-4o, GPT-4o Mini, o3-mini, o1).',
    descriptionBn: 'আন্তর্জাতিক শীর্ষস্থানীয় রিজনিং ও কনভার্সেশনাল মডেল (GPT-4o, GPT-4o Mini, o1)।',
    descriptionAr: 'النماذج القياسية العالمية الرائدة في التحليل والاستشارات التنفيذية.',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyHelpUrl: 'https://platform.openai.com/api-keys',
    keyLabel: 'OpenAI API Key'
  }
];

export const AdminAiTab: React.FC<AdminAiTabProps> = ({ onNotify }) => {
  const { language, isBn, isAr, formatNumber } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    model?: string;
    provider?: string;
  } | null>(null);

  // Multi-Provider & Model State
  const [activeProvider, setActiveProvider] = useState<AiProvider>('gemini');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [providerApiKeys, setProviderApiKeys] = useState<Partial<Record<AiProvider, string>>>({});
  const [providerKeyInputs, setProviderKeyInputs] = useState<Partial<Record<AiProvider, string>>>({});
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [apiKeyMasked, setApiKeyMasked] = useState<string>('');
  const [isKeyConfigured, setIsKeyConfigured] = useState<boolean>(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);
  const [usingEnvKey, setUsingEnvKey] = useState<boolean>(false);

  // Model & Execution State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [customModelId, setCustomModelId] = useState<string>('');
  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [modelFilter, setModelFilter] = useState<'current_provider' | 'all'>('current_provider');
  const [temperature, setTemperature] = useState<number>(0.4);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(2048);
  const [fallbackModels, setFallbackModels] = useState<string[]>(['gemini-3.7-flash', 'gemini-3.5-flash']);
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'disabled' | 'fallback_only'>('active');
  const [availableModels, setAvailableModels] = useState<AiModelOption[]>([]);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);
  const [lastTestStatus, setLastTestStatus] = useState<string>('untested');

  // Fetch current AI settings from PostgreSQL database
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/ai');
      if (res.ok) {
        const data = await res.json();
        const prov: AiProvider = (data.provider || 'gemini').toLowerCase() as AiProvider;
        setActiveProvider(prov);
        setBaseUrl(data.baseUrl || '');
        setProviderApiKeys(data.providerApiKeys || {});

        const model = data.selectedModel || 'gemini-3.8-flash';
        setSelectedModel(model);
        setApiKeyMasked(data.apiKeyMasked || '');
        setIsKeyConfigured(Boolean(data.isKeyConfigured));
        setHasCustomKey(Boolean(data.hasCustomKey));
        setUsingEnvKey(Boolean(data.usingEnvKey));
        setTemperature(typeof data.temperature === 'number' ? data.temperature : 0.4);
        setMaxOutputTokens(typeof data.maxOutputTokens === 'number' ? data.maxOutputTokens : 2048);
        setFallbackModels(Array.isArray(data.fallbackModels) ? data.fallbackModels : ['gemini-3.7-flash', 'gemini-3.5-flash']);
        setCustomSystemInstruction(data.customSystemInstruction || '');
        setStatus(data.status || 'active');
        setAvailableModels(data.availableModels || []);
        setLastTestedAt(data.lastTestedAt || null);
        setLastTestStatus(data.lastTestStatus || 'untested');

        // Check if model is in the catalog or custom
        const isStandard = (data.availableModels || []).some((m: AiModelOption) => m.id === model);
        if (!isStandard && model) {
          setUseCustomModel(true);
          setCustomModelId(model);
        } else {
          setUseCustomModel(false);
          setCustomModelId('');
        }
      }
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const currentProviderMeta = PROVIDERS.find(p => p.id === activeProvider) || PROVIDERS[0];
  const activeTargetModel = useCustomModel && customModelId.trim() ? customModelId.trim() : selectedModel;
  const currentKeyInput = providerKeyInputs[activeProvider] ?? '';

  const handleProviderSelect = (newProvider: AiProvider) => {
    setActiveProvider(newProvider);
    const meta = PROVIDERS.find(p => p.id === newProvider);
    if (!meta) return;

    // Set base URL to provider's default if not customized
    if (!baseUrl || PROVIDERS.some(p => p.defaultBaseUrl === baseUrl)) {
      setBaseUrl(meta.defaultBaseUrl);
    }

    // If current model doesn't belong to new provider, auto-switch to default model
    const currentModelBelongsToProvider = availableModels.some(
      m => m.id === selectedModel && m.provider === newProvider
    );
    if (!currentModelBelongsToProvider && !useCustomModel) {
      setSelectedModel(meta.defaultModel);
    }
    setTestResult(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const targetModel = useCustomModel && customModelId.trim() ? customModelId.trim() : selectedModel;

      // Compile updated keys map
      const updatedKeys: Partial<Record<AiProvider, string>> = { ...providerApiKeys };
      if (currentKeyInput.trim()) {
        updatedKeys[activeProvider] = currentKeyInput.trim();
      }

      const payload: any = {
        provider: activeProvider,
        baseUrl: baseUrl.trim() || undefined,
        selectedModel: targetModel,
        providerApiKeys: updatedKeys,
        temperature,
        maxOutputTokens,
        fallbackModels,
        customSystemInstruction,
        status
      };

      if (currentKeyInput.trim()) {
        payload.apiKey = currentKeyInput.trim();
      }

      const res = await fetch('/api/admin/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setSavedSuccess(true);
        setProviderKeyInputs({ ...providerKeyInputs, [activeProvider]: '' });

        if (result.ai) {
          setApiKeyMasked(result.ai.apiKeyMasked || '');
          setIsKeyConfigured(Boolean(result.ai.isKeyConfigured));
          setHasCustomKey(Boolean(result.ai.hasCustomKey));
          setUsingEnvKey(Boolean(result.ai.usingEnvKey));
          setProviderApiKeys(result.ai.providerApiKeys || updatedKeys);
        }

        if (onNotify) {
          onNotify(isAr ? 'تم حفظ التغييرات ومزامنتها بنجاح' : isBn ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে' : 'Settings saved and synchronized with database.');
        }
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || errData.message || 'Failed to save configuration');
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      alert('Network error while saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const targetModel = useCustomModel && customModelId.trim() ? customModelId.trim() : selectedModel;
    const testKey = currentKeyInput.trim();

    try {
      const res = await fetch('/api/admin/settings/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeProvider,
          apiKey: testKey || undefined,
          baseUrl: baseUrl.trim() || undefined,
          model: targetModel
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          latencyMs: data.latencyMs,
          message: data.message,
          model: data.model,
          provider: data.provider || activeProvider
        });
        setLastTestStatus('success');
      } else {
        setTestResult({
          success: false,
          message: data.message || data.error || 'Connection failed',
          model: targetModel,
          provider: activeProvider
        });
        setLastTestStatus('failed');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection timeout or network failure',
        model: targetModel,
        provider: activeProvider
      });
      setLastTestStatus('failed');
    } finally {
      setTesting(false);
    }
  };

  const toggleFallback = (modelId: string) => {
    if (fallbackModels.includes(modelId)) {
      setFallbackModels(fallbackModels.filter(m => m !== modelId));
    } else {
      setFallbackModels([...fallbackModels, modelId]);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
        <span className="text-xs text-slate-500">
          {isAr ? 'جاري تحميل الإعدادات...' : isBn ? 'সেটিংস লোড হচ্ছে...' : 'Loading settings...'}
        </span>
      </div>
    );
  }

  // Filtered models list
  const filteredModels = modelFilter === 'current_provider'
    ? availableModels.filter(m => m.provider === activeProvider)
    : availableModels;

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isAr ? 'إعدادات النموذج ومزودي الذكاء الاصطناعي' : isBn ? 'মডেল সেটিংস ও এআই প্রোভাইডার কনফিগারেশন' : 'Model & AI Provider Settings'}
            </h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Multi-Provider
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? 'اختر بين نماذج Google Gemini أو OpenAI المتقدمة مع مزامنة فورية لقاعدة البيانات.' 
              : isBn 
              ? 'গুগল জেমিনি অথবা ওপেনএআই মডেল নির্বাচন ও পরিচালনা করুন।' 
              : 'Configure Google Gemini or OpenAI advanced models with live database sync.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/90 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500">{isAr ? 'النشط:' : isBn ? 'সক্রিয়:' : 'Active:'}</span>
            <span className="font-semibold text-slate-900 uppercase text-[11px]">{activeProvider}</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[11px] text-slate-700">{activeTargetModel}</span>
          </span>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">

        {/* SECTION 1: AI PROVIDER SELECTOR */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {isAr ? 'اختر مزود الذكاء الاصطناعي (AI Provider)' : isBn ? 'এআই প্রোভাইডার নির্বাচন করুন' : 'Select AI Provider'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isAr 
                    ? 'النموذج المختار سيتحكم فوراً في محادثات الدعم المباشرة وتحليل المستندات' 
                    : isBn 
                    ? 'নির্বাচিত প্রোভাইডার তাৎক্ষণিকভাবে গ্রাহক চ্যাট ও ডকুমেন্ট বিশ্লেষণে সক্রিয় হবে' 
                    : 'The selected provider will immediately power customer live chat and business memory.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROVIDERS.map((prov) => {
              const isSelected = activeProvider === prov.id;

              return (
                <div
                  key={prov.id}
                  onClick={() => handleProviderSelect(prov.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between text-left rtl:text-right relative ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {isAr ? prov.nameAr : isBn ? prov.nameBn : prov.name}
                        </span>
                      </div>
                      <span className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                        prov.badgeColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        prov.badgeColor === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        prov.badgeColor === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        prov.badgeColor === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        prov.badgeColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-teal-50 text-teal-700 border-teal-200'
                      }`}>
                        {prov.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {isAr ? prov.descriptionAr : isBn ? prov.descriptionBn : prov.description}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400 truncate max-w-[140px]">
                      {prov.defaultModel}
                    </span>
                    {isSelected ? (
                      <span className="text-slate-900 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{isAr ? 'محدد' : isBn ? 'নির্বাচিত' : 'Selected'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-slate-600">
                        {isAr ? 'اختيار' : isBn ? 'সিলেক্ট' : 'Select'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: API KEY & BASE URL FOR SELECTED PROVIDER */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {currentProviderMeta.keyLabel}
                  </h2>
                  {isKeyConfigured ? (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {hasCustomKey 
                        ? (isAr ? 'قاعدة البيانات' : isBn ? 'ডাটাবেজে সংরক্ষিত' : 'Database Key')
                        : (isAr ? 'ملف البيئة (.env)' : isBn ? 'সার্ভার .env' : 'Server Environment')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      {isAr ? 'غير مهيأ' : isBn ? 'কনফিগার করা নেই' : 'Key Needed'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr ? `المفتاح المطلوب للاتصال بخدمات ${currentProviderMeta.name}` : isBn ? `${currentProviderMeta.name}-এর সাথে সংযোগের জন্য এপিআই কি দিন` : `API authentication credential for ${currentProviderMeta.name}`}
                </p>
              </div>
            </div>

            <a
              href={currentProviderMeta.apiKeyHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              <span>{isAr ? 'الحصول على مفتاح' : isBn ? 'কি তৈরি করুন' : 'Get API Key'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="space-y-3">
            {/* Base URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'رابط نقطة النهاية (API Base URL):' : isBn ? 'এপিআই বেস ইউআরএল (Base URL):' : 'API Base URL:'}</span>
                </label>
                {baseUrl !== currentProviderMeta.defaultBaseUrl && (
                  <button
                    type="button"
                    onClick={() => setBaseUrl(currentProviderMeta.defaultBaseUrl)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    {isAr ? 'استعادة الافتراضي' : isBn ? 'ডিফল্ট রিসেট' : 'Reset to Default'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={currentProviderMeta.defaultBaseUrl}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
              />
              <p className="text-[10px] text-slate-400">
                {`Default: ${currentProviderMeta.defaultBaseUrl}`}
              </p>
            </div>

            {/* API Key Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                {isAr ? 'مفتاح الواجهة (API Key):' : isBn ? 'এপিআই কি (API Key):' : 'API Key:'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={currentKeyInput}
                    onChange={(e) => setProviderKeyInputs({ ...providerKeyInputs, [activeProvider]: e.target.value })}
                    placeholder={
                      apiKeyMasked && (!currentKeyInput)
                        ? `${apiKeyMasked} (Enter new key to replace)`
                        : 'sk-...'
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white pr-10 rtl:pr-3 rtl:pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer rtl:right-auto rtl:left-2.5"
                    title={showApiKey ? 'Hide' : 'Show'}
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAr ? 'اختبار الاتصال' : isBn ? 'সংযোগ পরীক্ষা' : 'Test Connection'}</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-0.5">
                <span className="text-slate-400 font-sans">{isAr ? 'النموذج المراد اختباره:' : isBn ? 'পরীক্ষার মডেল:' : 'Model to test:'}</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{activeTargetModel}</span>
              </div>
            </div>

            {/* Test result callout */}
            {testResult && (
              <div className={`p-3.5 rounded-xl text-xs flex flex-col gap-2 border ${
                testResult.success 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                <div className="flex items-start gap-2.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center justify-between">
                      <span>
                        {testResult.success 
                          ? (isAr ? `تم الاتصال بنجاح بـ ${testResult.provider || activeProvider}` : isBn ? `${testResult.provider || activeProvider} সংযোগ সফলভাবে যাচাই হয়েছে` : `Connection verified with ${testResult.provider || activeProvider}`)
                          : (isAr ? 'فشل التحقق من الاتصال' : isBn ? 'সংযোগ যাচাই ব্যর্থ হয়েছে' : 'Connection handshake failed')}
                      </span>
                      {testResult.latencyMs !== undefined && (
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                          {formatNumber(testResult.latencyMs)} ms
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-1 text-slate-600 flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400 font-sans">{isAr ? 'النموذج:' : isBn ? 'মডেল:' : 'Tested Model:'}</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-bold text-slate-800 break-all">{testResult.model}</span>
                    </div>
                    <p className="text-[11px] mt-1.5 opacity-90 break-words leading-relaxed">{testResult.message}</p>
                  </div>
                </div>

                {!testResult.success && testResult.message && (testResult.message.includes('rate-limited') || testResult.message.includes('429')) && (
                  <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">💡 Tip:</span>
                    <span className="leading-relaxed">
                      {isAr 
                        ? 'هذا النموذج مقيد بمعدل الاستخدام (Rate Limited) من قبل المزود في الحساب المجاني. يمكنك التبديل لأحد النماذج المجانية السريعة أدناه مثل nvidia/nemotron-3.5-lightning:free.'
                        : isBn 
                        ? 'এই মডেলটি ওপেনরাউটারের শেয়ার্ড পুলে সাময়িকভাবে রেট-লিমিটেড। নিচের ভেরিফাইড ফ্রি মডেল যেমন nvidia/nemotron-3.5-lightning:free বেছে নিন।'
                        : 'This model is temporarily rate-limited upstream on the free shared pool. Try switching to one of the verified free presets below (such as nvidia/nemotron-3.5-lightning:free or liquid/lfm-2.5-2.6b:free).'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                {isAr 
                  ? 'يتم تخزين المفاتيح والإعدادات بأمان في قاعدة بيانات PostgreSQL.'
                  : isBn 
                  ? 'প্রোভাইডার কি ও সেটিংস নিরাপদে পোস্টগ্রিসকিউএল ডাটাবেজে সংরক্ষিত থাকে।'
                  : 'Provider keys and endpoints are stored securely in PostgreSQL settings.'}
              </span>
              {hasCustomKey && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(isAr ? 'هل تريد إزالة مفتاح هذا المزود؟' : isBn ? 'এই প্রোভাইডারের কি মুছে ফেলতে চান?' : 'Remove database key for this provider?')) {
                      setProviderKeyInputs({ ...providerKeyInputs, [activeProvider]: '' });
                      const updated = { ...providerApiKeys };
                      delete updated[activeProvider];
                      setProviderApiKeys(updated);
                      fetch('/api/admin/settings/ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          provider: activeProvider,
                          apiKey: '',
                          providerApiKeys: updated
                        })
                      }).then(() => fetchSettings());
                    }
                  }}
                  className="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  {isAr ? 'إزالة المفتاح' : isBn ? 'কি মুছুন' : 'Remove Key'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: MODEL SELECTION & CATALOG */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {isAr ? 'اختيار النموذج (Language Model)' : isBn ? 'মডেল ক্যাটালগ ও নির্বাচন' : 'Model Selection & Catalog'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isAr 
                    ? 'اختر النموذج الذي يتولى الرد على الاستفسارات وفهرسة المستندات' 
                    : isBn 
                    ? 'সাপোর্ট এবং ডকুমেন্ট প্রসেসিংয়ের জন্য মডেল নির্বাচন করুন' 
                    : 'Choose the model to handle customer inquiries and dynamic business memory.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-medium">
                <button
                  type="button"
                  onClick={() => setModelFilter('current_provider')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    modelFilter === 'current_provider' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {currentProviderMeta.name}
                </button>
                <button
                  type="button"
                  onClick={() => setModelFilter('all')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    modelFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isAr ? 'جميع النماذج' : isBn ? 'সকল মডেল' : 'All Models'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setUseCustomModel(!useCustomModel)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  useCustomModel 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FileCode className="w-3 h-3 inline-block mr-1 rtl:mr-0 rtl:ml-1 text-slate-400" />
                {isAr ? 'معرّف مخصص' : isBn ? 'কাস্টম আইডি' : 'Custom Model ID'}
              </button>
            </div>
          </div>

          {/* Active Target Model Indicator Banner */}
          <div className="p-3 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs text-slate-300 font-medium">
                {isAr ? 'النموذج النشط حاليًا للتشغيل والاستشارات:' : isBn ? 'বর্তমানে সক্রিয় মডেল (সাপোর্ট ও পরামর্শ):' : 'Current Active Model for AI Support:'}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300 truncate bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700">
                {activeTargetModel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {useCustomModel ? (isAr ? 'معرف مخصص' : isBn ? 'কাস্টম আইডি' : 'Custom Model') : (isAr ? 'من الكتالوج' : isBn ? 'ক্যাটালগ' : 'Standard Catalog')}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/60">
                {currentProviderMeta.name}
              </span>
            </div>
          </div>

          {/* Custom Model ID field */}
          {useCustomModel && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAr ? 'معرف النموذج المخصص:' : isBn ? 'কাস্টম মডেল আইডি:' : 'Custom Model Identifier:'}</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isAr ? 'اكتب المعرف أو اضغط على أحد النماذج المقترحة' : isBn ? 'টাইপ করুন বা নিচের প্রিসেট চাপুন' : 'Enter ID or click preset below'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customModelId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomModelId(val);
                    if (val.trim()) {
                      setSelectedModel(val.trim());
                    }
                  }}
                  placeholder={
                    activeProvider === 'gemini'
                      ? 'e.g. gemini-3.8-flash, gemini-3.1-pro'
                      : 'e.g. gpt-4o, gpt-4o-mini, o3-mini'
                  }
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customModelId.trim()) {
                      setSelectedModel(customModelId.trim());
                      if (onNotify) {
                        onNotify(isAr ? `تم تطبيق النموذج ${customModelId.trim()}` : isBn ? `মডেল ${customModelId.trim()} প্রয়োগ করা হয়েছে` : `Applied model: ${customModelId.trim()}`);
                      }
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
                >
                  {isAr ? 'تطبيق' : isBn ? 'প্রয়োগ করুন' : 'Apply'}
                </button>
              </div>

              {/* Provider Quick Presets */}
              {activeProvider === 'gemini' && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                  <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                    <span>{isAr ? 'نماذج Google Gemini المقترحة:' : isBn ? 'জনপ্রিয় গুগল জেমিনি মডেলসমূহ:' : 'Recommended Google Gemini Models:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'gemini-3.8-flash', label: '⚡ Gemini 3.8 Flash (Ultra-fast & Agentic)' },
                      { id: 'gemini-3.1-pro', label: '🧠 Gemini 3.1 Pro (Deep Thinking & Advisory)' },
                      { id: 'gemini-3.7-flash', label: '🚀 Gemini 3.7 Flash (High Throughput)' },
                      { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (Balanced)' },
                      { id: 'gemini-3.5-flash-lite', label: '⚡ Gemini 3.5 Flash-Lite (Instant Chat)' }
                    ].map(preset => {
                      const isActive = activeTargetModel === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setUseCustomModel(true);
                            setCustomModelId(preset.id);
                            setSelectedModel(preset.id);
                            setTestResult(null);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold shadow-xs ring-1 ring-teal-600/30'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeProvider === 'openai' && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                  <div className="text-[11px] font-semibold text-slate-700">
                    <span>{isAr ? 'نماذج OpenAI المقترحة:' : isBn ? 'জনপ্রিয় ওপেনএআই মডেলসমূহ:' : 'Recommended OpenAI Models:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'gpt-4o', label: '🧠 GPT-4o (Flagship Omni)' },
                      { id: 'gpt-4o-mini', label: '⚡ GPT-4o Mini (Fast & Efficient)' },
                      { id: 'o3-mini', label: '🔬 o3-mini (High-Speed Reasoning)' },
                      { id: 'o1', label: '🔬 o1 (Deep Reasoning)' },
                      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
                    ].map(preset => {
                      const isActive = activeTargetModel === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setUseCustomModel(true);
                            setCustomModelId(preset.id);
                            setSelectedModel(preset.id);
                            setTestResult(null);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold shadow-xs ring-1 ring-teal-600/30'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clean Model List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredModels.map((m) => {
              const isSelected = !useCustomModel && selectedModel === m.id;
              
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setUseCustomModel(false);
                    setSelectedModel(m.id);
                    if (m.provider && m.provider !== activeProvider) {
                      handleProviderSelect(m.provider);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left rtl:text-right cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/10'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {m.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {m.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {m.provider && (
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {m.provider}
                          </span>
                        )}
                        {m.badge && (
                          <span className="text-[9px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                            {m.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {m.description || m.tagline}
                    </p>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{m.contextWindow}</span>
                      <span>&bull;</span>
                      <span>{m.speed}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="text-slate-900 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-slate-900" />
                          <span>{isAr ? 'محدد' : isBn ? 'নির্বাচিত' : 'Active'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {isAr ? 'تحديد' : isBn ? 'নির্বাচন' : 'Select'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: RESPONSE BEHAVIOR & DIRECTIVES */}
        <div className="rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isAr ? 'إعدادات الاستجابة' : isBn ? 'রেসপন্স কনফিগারেশন' : 'Response Behavior'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'تعديل سلوك الإجابات، الحدود القصوى، والنماذج الاحتياطية' 
                  : isBn 
                  ? 'উত্তরের টোন, সর্বোচ্চ দৈর্ঘ্য এবং ব্যাকআপ মডেল সমন্বয় করুন' 
                  : 'Fine-tune temperature, response limits, and fallback models'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ? 'درجة الدقة / الإبداع (Temperature):' : isBn ? 'টেম্পারেচার (Temperature):' : 'Temperature (Tone):'}
                </label>
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.0 ({isAr ? 'دقيق ومحدد' : isBn ? 'নির্ভুল' : 'Precise'})</span>
                <span>0.5 ({isAr ? 'متوازن' : isBn ? 'ভারসাম্যপূর্ণ' : 'Balanced'})</span>
                <span>1.0 ({isAr ? 'إبداعي' : isBn ? 'সৃজনশীল' : 'Creative'})</span>
              </div>
              {/* Presets */}
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setTemperature(0.2)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                    temperature === 0.2 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? 'دقيق (0.2)' : isBn ? 'নির্ভুল (0.2)' : 'Precise (0.2)'}
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature(0.4)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                    temperature === 0.4 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? 'متوازن (0.4)' : isBn ? 'ডিফল্ট (0.4)' : 'Balanced (0.4)'}
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature(0.7)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                    temperature === 0.7 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? 'إبداعي (0.7)' : isBn ? 'সৃজনশীল (0.7)' : 'Creative (0.7)'}
                </button>
              </div>
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ? 'الحد الأقصى للرموز (Max Tokens):' : isBn ? 'সর্বোচ্চ দৈর্ঘ্য (Max Tokens):' : 'Max Output Tokens:'}
                </label>
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {formatNumber(maxOutputTokens)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1024, 2048, 4096].map((tok) => (
                  <button
                    key={tok}
                    type="button"
                    onClick={() => setMaxOutputTokens(tok)}
                    className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      maxOutputTokens === tok
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {formatNumber(tok)}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'يحدد الحد الأقصى لطول الإجابة الواحدة.'
                  : isBn 
                  ? 'প্রতিটি মেসেজের জন্য উত্তরের সর্বোচ্চ শব্দসীমা নিয়ন্ত্রণ করে।'
                  : 'Controls the maximum response length per message.'}
              </p>
            </div>
          </div>

          {/* Backup Models */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {isAr ? 'النماذج الاحتياطية (Fallback Models):' : isBn ? 'ব্যাকআপ মডেল (Fallback Models):' : 'Fallback Models:'}
            </label>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? 'في حال عدم توفر النموذج الرئيسي أو نفاذ الحصة، سيتم استخدام النماذج التالية:'
                : isBn
                ? 'প্রধান মডেল অনুপলব্ধ বা কোটা শেষ হলে নিচের মডেলগুলো পর্যায়ক্রমে ব্যবহার হবে:'
                : 'If the primary model is unavailable or rate-limited, requests cascade to:'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gpt-4o-mini', 'gpt-4o'].map((mId) => {
                const isChecked = fallbackModels.includes(mId);
                return (
                  <label
                    key={mId}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                      isChecked 
                        ? 'bg-slate-100 text-slate-900 border-slate-300 font-semibold' 
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFallback(mId)}
                      className="rounded text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span className="font-mono text-[11px]">{mId}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {isAr ? 'توجيهات إضافية (Custom Instructions):' : isBn ? 'কাস্টম নির্দেশিকা (System Directive):' : 'Custom System Directive:'}
            </label>
            <textarea
              rows={2}
              value={customSystemInstruction}
              onChange={(e) => setCustomSystemInstruction(e.target.value)}
              placeholder={isAr ? 'أدخل أي توجيهات إضافية تريد تطبيقها على الإجابات...' : isBn ? 'অতিরিক্ত কোনো নির্দেশনা থাকলে এখানে লিখুন...' : 'e.g. Maintain a professional consulting tone and reference Saudi business setup guidelines when applicable.'}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
            />
            <p className="text-[10px] text-slate-400">
              {isAr
                ? 'تتم إضافة هذه التعليمات إلى موجه النظام الرئيسي لجميع الاستفسارات.'
                : isBn
                ? 'এই নির্দেশনাটি সাধারণ নির্দেশনার সাথে যুক্ত হয়ে স্বয়ংক্রিয়ভাবে কাজ করবে।'
                : 'Appended to the general system instructions for support queries.'}
            </p>
          </div>
        </div>

        {/* Clean Save Action Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {savedSuccess ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'تم حفظ التغييرات ومزامنتها بنجاح' : isBn ? 'পরিবর্তনগুলো সফলভাবে সংরক্ষিত হয়েছে' : 'Changes saved and synchronized with database'}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 truncate">
                <span>{isAr ? 'المزود والنموذج:' : isBn ? 'প্রোভাইডার ও মডেল:' : 'Provider & model:'} </span>
                <span className="font-semibold text-slate-900 uppercase text-[11px]">{activeProvider}</span>
                <span className="text-slate-300 mx-1">/</span>
                <span className="font-mono font-semibold text-slate-800">{activeTargetModel}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isAr ? 'حفظ التغييرات' : isBn ? 'সেভ করুন' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
