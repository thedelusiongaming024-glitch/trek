import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import {
  Mail,
  Users,
  Send,
  Download,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Calendar,
  RefreshCw,
  FileText,
  Sparkles,
  Filter,
  Eye,
  EyeOff,
  Key,
  Save,
  Check,
  X,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Share2,
  Globe
} from 'lucide-react';
import { NewsletterSubscriber, NewsletterCampaign } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import trekLogo from '../../assets/trek-logo.webp';

export const AdminNewsletterTab: React.FC = () => {
  const { language, t, formatNumber } = useLanguage();

  // State
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'subscribers' | 'campaigns' | 'settings'>('subscribers');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<NewsletterCampaign | null>(null);

  // Compose State
  const [composeSubject, setComposeSubject] = useState('');
  const [composePreview, setComposePreview] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeAuthor, setComposeAuthor] = useState('Trek Consultancy Editorial Team');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Deletion modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCampaignConfirmId, setDeleteCampaignConfirmId] = useState<string | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);

  // Email Sender Configuration (RESEND_API_KEY & EMAIL_FROM)
  const [resendApiKey, setResendApiKey] = useState('');
  const [emailFrom, setEmailFrom] = useState('Trek Consultancy Forum <onboarding@resend.dev>');
  const [showResendKey, setShowResendKey] = useState(false);
  const [isSavingEmailConfig, setIsSavingEmailConfig] = useState(false);
  const [emailConfigSaved, setEmailConfigSaved] = useState(false);
  const [emailConfigError, setEmailConfigError] = useState('');
  const [emailConfigSource, setEmailConfigSource] = useState<'database' | 'env'>('env');
  const [emailConfigUpdatedAt, setEmailConfigUpdatedAt] = useState<string | null>(null);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subsRes, campsRes, emailCfgRes] = await Promise.all([
        fetch('/api/newsletter'),
        fetch('/api/admin/newsletter/campaigns'),
        fetch('/api/admin/newsletter/email-config')
      ]);

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscribers(subsData || []);
      }
      if (campsRes.ok) {
        const campsData = await campsRes.json();
        setCampaigns(campsData || []);
      }
      if (emailCfgRes.ok) {
        const cfgData = await emailCfgRes.json();
        if (cfgData.resendApiKey) setResendApiKey(cfgData.resendApiKey);
        if (cfgData.emailFrom) setEmailFrom(cfgData.emailFrom);
        if (cfgData.source) setEmailConfigSource(cfgData.source);
        if (cfgData.updatedAt) setEmailConfigUpdatedAt(cfgData.updatedAt);
      }
    } catch (err) {
      console.error('Failed to load newsletter data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFrom.trim()) {
      setEmailConfigError('Sender address (EMAIL_FROM) is required.');
      return;
    }
    try {
      setIsSavingEmailConfig(true);
      setEmailConfigError('');
      setEmailConfigSaved(false);
      const res = await fetch('/api/admin/newsletter/email-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resendApiKey: resendApiKey.trim(),
          emailFrom: emailFrom.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendApiKey(data.config.resendApiKey);
        setEmailFrom(data.config.emailFrom);
        setEmailConfigSource('database');
        setEmailConfigUpdatedAt(data.config.updatedAt);
        setEmailConfigSaved(true);
        setTimeout(() => setEmailConfigSaved(false), 3000);
      } else {
        setEmailConfigError(data.error || 'Failed to save email settings.');
      }
    } catch {
      setEmailConfigError('Network error while saving email settings.');
    } finally {
      setIsSavingEmailConfig(false);
    }
  };

  const handleTestApiKey = async () => {
    const clean = resendApiKey.trim();
    if (!clean) {
      setApiKeyTestResult({ valid: false, message: 'Please enter a Resend API key first.' });
      return;
    }
    try {
      setIsTestingApiKey(true);
      setApiKeyTestResult(null);
      const res = await fetch('/api/admin/newsletter/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resendApiKey: clean })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setApiKeyTestResult({ valid: true, message: data.message || 'Resend API key is valid!' });
      } else {
        setApiKeyTestResult({ valid: false, message: data.error || 'Invalid Resend API key.' });
      }
    } catch {
      setApiKeyTestResult({ valid: false, message: 'Network error while verifying API key.' });
    } finally {
      setIsTestingApiKey(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Domain Breakdown
  const domainBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of subscribers) {
      const domain = sub.email.split('@')[1]?.toLowerCase() || 'other';
      counts[domain] = (counts[domain] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [subscribers]);

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter(sub => {
      const matchSearch = !q || sub.email.toLowerCase().includes(q) || sub.id.toLowerCase().includes(q);
      const matchDomain = selectedDomain === 'all' || sub.email.toLowerCase().endsWith(`@${selectedDomain}`);
      return matchSearch && matchDomain;
    });
  }, [subscribers, search, selectedDomain]);

  // Add Subscriber
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setAddError('Please enter a valid email address.');
      return;
    }

    try {
      setIsAdding(true);
      setAddError('');
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean })
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribers(prev => [data.subscriber, ...prev.filter(s => s.email !== clean)]);
        setNewEmail('');
        setIsAddModalOpen(false);
      } else {
        setAddError(data.error || 'Failed to add subscriber');
      }
    } catch {
      setAddError('Network error while adding subscriber.');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id && s.email !== id));
        setSelectedSubscribers(prev => prev.filter(sId => sId !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to remove subscriber:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Campaign / Published Issue
  const handleDeleteCampaign = async (id: string) => {
    try {
      setIsDeletingCampaign(true);
      const res = await fetch(`/api/admin/newsletter/campaigns/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        if (previewCampaign?.id === id) {
          setPreviewCampaign(null);
        }
        setDeleteCampaignConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to delete campaign issue:', err);
    } finally {
      setIsDeletingCampaign(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove ${selectedSubscribers.length} selected subscriber(s)?`)) return;

    try {
      await Promise.all(selectedSubscribers.map(id => fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' })));
      setSubscribers(prev => prev.filter(s => !selectedSubscribers.includes(s.id)));
      setSelectedSubscribers([]);
    } catch (err) {
      console.error('Failed to bulk delete subscribers:', err);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const listToExport = selectedSubscribers.length > 0
      ? subscribers.filter(s => selectedSubscribers.includes(s.id))
      : subscribers;

    if (listToExport.length === 0) return;

    const headers = ['Subscriber ID', 'Email Address', 'Subscribed At', 'Status'];
    const rows = listToExport.map(s => [
      s.id,
      s.email,
      s.subscribed_at ? new Date(s.subscribed_at).toISOString() : '',
      s.status || 'active'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(f => `"${f}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy email
  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Broadcast campaign
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeContent.trim()) return;

    try {
      setIsBroadcasting(true);
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: composeSubject.trim(),
          previewText: composePreview.trim(),
          content: composeContent.trim(),
          author: composeAuthor.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(prev => [data.campaign, ...prev]);
        setBroadcastSuccess(true);
        setTimeout(() => {
          setBroadcastSuccess(false);
          setIsComposeModalOpen(false);
          setComposeSubject('');
          setComposePreview('');
          setComposeContent('');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to broadcast newsletter:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'bn' ? 'নিউজলেটার ও সাপ্তাহিক ডাইজেস্ট' : language === 'ar' ? 'النشرة البريدية والموجز الأسبوعي' : 'Newsletter & Audience Management'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              {formatNumber(subscribers.length)} {language === 'bn' ? 'সাবস্ক্রাইবার' : language === 'ar' ? 'مشترك' : 'Subscribers'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' 
              ? 'কমিউনিটি ইমেইল গ্রাহক নিরীক্ষণ, সাপ্তাহিক ডাইজেস্ট প্রকাশনা এবং গ্রাহক তালিকা রপ্তানি।' 
              : language === 'ar'
              ? 'مراقبة مشتركي البريد الإلكتروني، وإدارة النشرات الأسبوعية، وتصدير قوائم الجمهور.'
              : 'Monitor audience subscriptions, review weekly published digests, and broadcast community insights.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            disabled={subscribers.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Download CSV of subscribers"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'সিএসভি রপ্তানি' : language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'bn' ? 'গ্রাহক যোগ করুন' : language === 'ar' ? 'إضافة مشترك' : 'Add Subscriber'}</span>
          </button>

          <button
            onClick={() => setIsComposeModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন সংস্করণ ড্রাফট' : language === 'ar' ? 'إصدار جديد' : 'Compose Digest'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Subscribers */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">{language === 'bn' ? 'মোট সাবস্ক্রাইবার' : language === 'ar' ? 'إجمالي المشتركين' : 'Total Subscribers'}</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatNumber(subscribers.length)}
          </div>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Active & Verified</span>
          </p>
        </div>

        {/* Latest Edition / Issues Published */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">{language === 'bn' ? 'সর্বশেষ সংস্করণ' : language === 'ar' ? 'أحدث إصدار' : 'Current Issue'}</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            #{campaigns[0]?.issueNumber || 44}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {campaigns[0]?.subject || 'Weekly Blueprint Digest'}
          </p>
        </div>

        {/* Top Email Domain Provider */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">{language === 'bn' ? 'শীর্ষ মেইল ডোমেন' : language === 'ar' ? 'أبرز نطاق بريدي' : 'Top Mail Provider'}</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight truncate">
            {domainBreakdown[0] ? `@${domainBreakdown[0][0]}` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500">
            {domainBreakdown[0] ? `${formatNumber(domainBreakdown[0][1])} subscribers (${Math.round((domainBreakdown[0][1] / (subscribers.length || 1)) * 100)}%)` : 'No subscribers'}
          </p>
        </div>

        {/* Delivery Frequency */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">{language === 'bn' ? 'ডেলিভারি শিডিউল' : language === 'ar' ? 'جدول الإرسال' : 'Delivery Cadence'}</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            Weekly
          </div>
          <p className="text-[11px] text-slate-500">
            Every Monday • 9:00 AM UTC
          </p>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('subscribers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'subscribers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'গ্রাহক তালিকা' : language === 'ar' ? 'قائمة المشتركين' : 'Audience List'} ({formatNumber(subscribers.length)})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'campaigns'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নিউজলেটার সংস্করণ' : language === 'ar' ? 'إصدارات النشرة' : 'Digest Editions'} ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ইমেইল কনফিগারেশন' : language === 'ar' ? 'إعدادات البريد' : 'Email Sender Settings'}</span>
        </button>
      </div>

      {/* 4. Tab Content A: Subscribers List */}
      {activeSubTab === 'subscribers' && (
        <div className="space-y-4">
          {/* Search, Domain Filters & Bulk Actions */}
          <div className="rounded-xl p-3 bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by email or subscriber ID..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Domain Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setSelectedDomain('all')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors border ${
                    selectedDomain === 'all'
                      ? 'bg-teal-50 border-teal-200 text-teal-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Domains
                </button>
                {domainBreakdown.slice(0, 4).map(([domain, count]) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => setSelectedDomain(domain)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors border ${
                      selectedDomain === domain
                        ? 'bg-teal-50 border-teal-200 text-teal-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    @{domain} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Selection Actions */}
            {selectedSubscribers.length > 0 && (
              <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-[11px] font-medium text-slate-700">
                  {selectedSubscribers.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  Remove Selected
                </button>
              </div>
            )}
          </div>

          {/* Subscribers Table */}
          <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            {filteredSubscribers.length === 0 ? (
              <div className="py-12 text-center p-6 space-y-2">
                <Mail className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">No subscribers found</p>
                <p className="text-[11px] text-slate-400">
                  {search ? 'Try clearing your search query.' : 'Subscribers will appear here once visitors sign up on the portal.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubscribers(filteredSubscribers.map(s => s.id));
                            } else {
                              setSelectedSubscribers([]);
                            }
                          }}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </th>
                      <th className="py-3 px-4">Subscriber Email</th>
                      <th className="py-3 px-4">Domain / Provider</th>
                      <th className="py-3 px-4">Subscribed Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSubscribers.map((sub) => {
                      const domain = sub.email.split('@')[1] || '';
                      const isSelected = selectedSubscribers.includes(sub.id);
                      const subDate = sub.subscribed_at ? new Date(sub.subscribed_at) : new Date();

                      return (
                        <tr
                          key={sub.id}
                          className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-teal-50/30' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubscribers(prev => [...prev, sub.id]);
                                } else {
                                  setSelectedSubscribers(prev => prev.filter(id => id !== sub.id));
                                }
                              }}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                          </td>

                          {/* Email & ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-teal-100/70 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {sub.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-900 truncate">{sub.email}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(sub.email)}
                                    className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                                    title="Copy email"
                                  >
                                    {copiedEmail === sub.email ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{sub.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Domain */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                              @{domain}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-700 text-xs">
                              {subDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {subDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={`mailto:${sub.email}`}
                                className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                                title="Compose email directly"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(sub.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove subscriber"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab Content B: Newsletter Editions & Live Preview */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Digest Editions */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Published Issues & Weekly Blueprints
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {campaigns.length} issues on file
                </span>
              </div>

              {campaigns.length === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-slate-200/90 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No published issues on file</p>
                  <p className="text-[11px] text-slate-400">Draft and publish a new weekly digest to see it listed here.</p>
                </div>
              ) : campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-teal-300">
                          Issue #{camp.issueNumber || 44}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Delivered</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(camp.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {camp.subject}
                      </h4>
                      {camp.previewText && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {camp.previewText}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewCampaign(camp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteCampaignConfirmId(camp.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete issue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Delivered to <strong>{formatNumber(camp.recipientCount)}</strong> subscribers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {camp.tags?.map(t => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Basic Details & Info Sidebar */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Newsletter Overview</span>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wide">
                      Publication Format
                    </span>
                    <p className="text-slate-600">
                      Weekly Blueprint Digest with curated architectural strategies, community Q&A, and technical guidelines.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wide">
                      Audience Reach
                    </span>
                    <p className="text-slate-600">
                      Currently reaching <strong>{formatNumber(subscribers.length)}</strong> active subscribers across corporate and individual engineering domains.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wide">
                      Auto-Subscription Sources
                    </span>
                    <p className="text-slate-600">
                      Sign-ups automatically capture visitors from the homepage newsletter glassmorphism card and user account registrations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft Next Weekly Edition</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content C: Email Sender Configuration */}
      {activeSubTab === 'settings' && (
        <div className="max-w-3xl space-y-4">
          <form onSubmit={handleSaveEmailConfig} className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Email Delivery & Resend API Configuration</span>
            </div>

            {emailConfigError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailConfigError}</span>
              </div>
            )}

            {emailConfigSaved && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Email delivery settings saved to database and applied immediately (no manual <code>.env</code> edit required).</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Outbound Provider Info */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Outbound Mail Provider</label>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px] flex items-center justify-between">
                  <span>Resend (Transactional OTP Verification & Newsletter Broadcast API)</span>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-sans font-semibold underline"
                  >
                    <span>Resend Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* RESEND_API_KEY */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-teal-600" />
                    <span>Resend API Key (<code className="text-[11px] font-mono text-teal-700">RESEND_API_KEY</code>)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Used for OTP verification & newsletter broadcasts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showResendKey ? 'text' : 'password'}
                      value={resendApiKey}
                      onChange={(e) => {
                        setResendApiKey(e.target.value);
                        if (apiKeyTestResult) setApiKeyTestResult(null);
                      }}
                      placeholder="re_ajK7NuLH_TfHfBwcML4dLXBTW69HSibqL"
                      className="w-full pl-3 pr-20 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResendKey(!showResendKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 px-1.5 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {showResendKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showResendKey ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={isTestingApiKey || !resendApiKey.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isTestingApiKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Test Key</span>
                      </>
                    )}
                  </button>
                </div>
                {apiKeyTestResult && (
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    apiKeyTestResult.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {apiKeyTestResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium">{apiKeyTestResult.message}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  Resend API Key for real transactional email delivery (OTP verification & newsletter issues). Get a free key at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">https://resend.com</a>.
                </p>
              </div>

              {/* EMAIL_FROM */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Default Sender Address (<code className="text-[11px] font-mono text-teal-700">EMAIL_FROM</code>)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmailFrom('Trek Consultancy Forum <onboarding@resend.dev>')}
                    className="text-[10px] text-teal-600 hover:text-teal-700 underline cursor-pointer"
                  >
                    Use Resend Default (onboarding@resend.dev)
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="Trek Consultancy Forum <thedelusiongaming024@gmail.com>"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 shadow-2xs"
                />
                <p className="text-[11px] text-slate-500">
                  Default sender before custom domain verification is <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">onboarding@resend.dev</code> (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Trek Consultancy Forum &lt;thedelusiongaming024@gmail.com&gt;</code>).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                {emailConfigUpdatedAt ? `Last updated: ${new Date(emailConfigUpdatedAt).toLocaleString()}` : 'Using active configuration'}
              </span>
              <button
                type="submit"
                disabled={isSavingEmailConfig || !emailFrom.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingEmailConfig ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Email Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Modal: Add Subscriber */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Add Newsletter Subscriber</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubscriber} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Subscriber Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. client.lead@company.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newEmail.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isAdding ? 'Adding...' : 'Add Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Remove Subscriber?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this email from the active newsletter audience? They can resubscribe anytime from the portal.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteSubscriber(deleteConfirmId)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                {isDeleting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8b. Modal: Delete Published Issue Confirmation */}
      {deleteCampaignConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Delete Published Issue?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to permanently delete this published newsletter issue from the archive?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCampaignConfirmId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCampaign}
                onClick={() => handleDeleteCampaign(deleteCampaignConfirmId)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                {isDeletingCampaign ? 'Deleting...' : 'Delete Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Compose & Broadcast Digest */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-xl my-6 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Compose Weekly Blueprint Digest</h3>
                  <p className="text-[11px] text-slate-500">Target Audience: {formatNumber(subscribers.length)} active subscribers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBroadcast} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Issue Subject Line *</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Weekly Blueprint Digest #45: Multi-Cloud Observability & Kafka Streams"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Preview Teaser Text (Inbox Snippet)</label>
                <input
                  type="text"
                  value={composePreview}
                  onChange={(e) => setComposePreview(e.target.value)}
                  placeholder="e.g. Critical takeaways on database lease locks, zero-trust mTLS, and scaling tips..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Digest Content (Markdown Supported) *</label>
                <textarea
                  rows={9}
                  required
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  placeholder="## Weekly Blueprint Digest&#10;&#10;Here are this week's technical architectural highlights:&#10;&#10;### 1. Topic Title&#10;Explanation and engineering takeaways..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
                />
              </div>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] flex items-center justify-between">
                <span>Will be saved to digest archives and queued to all {subscribers.length} subscribers.</span>
                <span className="font-mono font-semibold">Ready</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting || !composeSubject.trim() || !composeContent.trim()}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isBroadcasting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Broadcast...</span>
                    </>
                  ) : broadcastSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Published & Saved!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish & Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Modal: Live Email Preview */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl my-6 flex flex-col overflow-hidden max-h-[92vh]">
            {/* Top Chrome */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">Email Client Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCampaign(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Headers */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 w-16">Subject:</span>
                <span className="font-bold text-slate-900">{previewCampaign.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 w-16">From:</span>
                <span className="text-slate-700">{emailFrom || 'Trek Consultancy Forum <onboarding@resend.dev>'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 w-16">Date:</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {new Date(previewCampaign.sentAt).toUTCString()}
                </span>
              </div>
            </div>

            {/* Rendered Email Body Card */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white">
              {/* Branded Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <img src={trekLogo} alt="Trek Consultancy" className="h-8 w-auto object-contain" />
                <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold">
                  Issue #{previewCampaign.issueNumber || 44}
                </span>
              </div>

              {/* Title & Preview */}
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {previewCampaign.subject}
                </h2>
                {previewCampaign.previewText && (
                  <p className="text-sm text-slate-600 italic">
                    {previewCampaign.previewText}
                  </p>
                )}
              </div>

              {/* Markdown Content */}
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans">
                <Markdown>{previewCampaign.content}</Markdown>
              </div>

              {/* Email Footer */}
              <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
                <p>© 2026 Trek Consultancy Forum. All rights reserved.</p>
                <p>You received this digest because your email is subscribed on our community platform.</p>
                <p className="text-teal-600 underline cursor-pointer">Unsubscribe preferences</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
