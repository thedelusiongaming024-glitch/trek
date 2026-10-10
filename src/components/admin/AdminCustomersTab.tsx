import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MessageSquare, 
  UserCheck, 
  Clock, 
  Send, 
  RefreshCw, 
  Sparkles, 
  Bot, 
  User, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink,
  MessageCircle,
  FileText,
  Copy,
  Check,
  UserX,
  MessagesSquare,
  ArrowUpDown,
  CornerDownRight
} from 'lucide-react';
import { Customer, CustomerConversationSession, CustomerConversationMessage, CustomerFullDetail } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getRandomAvatar, getFallbackAvatar } from '../../utils/avatar';

interface AdminCustomersTabProps {
  currentAdminUser?: { name: string; email: string; role: string } | null;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({ currentAdminUser }) => {
  const { language, t, formatNumber, formatTimeAgo, formatDate } = useLanguage();

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lead' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'registered' | 'leads' | 'has_conversations' | 'no_conversations'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'conversations' | 'messages' | 'newest' | 'name'>('recent');

  // Selected customer & conversation inspection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerFullDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Staff reply
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [replySuccess, setReplySuccess] = useState<boolean>(false);

  // Copied feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active view tab for selected customer (Conversation transcript vs Forum topics)
  const [activeDetailTab, setActiveDetailTab] = useState<'conversation' | 'topics'>('conversation');

  // Fetch Customers List
  const fetchCustomers = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/customers');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch customers`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
      
      // If we don't have a selected customer yet, select the first one if available on desktop
      if (!selectedCustomerId && data.length > 0 && window.innerWidth >= 1024) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err: any) {
      console.error('[Admin Customers] Fetch error:', err);
      setError(err.message || 'Failed to load customers');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch detailed conversation data whenever selectedCustomerId changes
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerDetail(null);
      return;
    }

    let isMounted = true;
    const fetchCustomerConversations = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(selectedCustomerId)}/conversations`);
        if (!res.ok) throw new Error('Failed to fetch conversation transcripts');
        const data: CustomerFullDetail = await res.json();
        if (isMounted) {
          setCustomerDetail(data);
          // Set active session to the first conversation if available
          if (data.conversations && data.conversations.length > 0) {
            setActiveSessionId(data.conversations[0].id);
          } else {
            setActiveSessionId(null);
          }
        }
      } catch (err: any) {
        console.error('[Admin Customer Detail] Error:', err);
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    };

    fetchCustomerConversations();
    return () => {
      isMounted = false;
    };
  }, [selectedCustomerId]);

  // Handle sending staff reply
  const handleSendStaffReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !replyText.trim()) return;

    setSendingReply(true);
    setReplySuccess(false);

    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(selectedCustomerId)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: replyText.trim(),
          staffName: currentAdminUser?.name || 'Senior Consultant'
        })
      });

      if (!res.ok) throw new Error('Failed to send staff reply');
      const newMsg = await res.json();

      setReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);

      // Refresh customer conversation detail silently
      const detailRes = await fetch(`/api/admin/customers/${encodeURIComponent(selectedCustomerId)}/conversations`);
      if (detailRes.ok) {
        const updatedDetail: CustomerFullDetail = await detailRes.json();
        setCustomerDetail(updatedDetail);
      }

      // Refresh customers list summary
      fetchCustomers(true);
    } catch (err: any) {
      alert(`Error sending reply: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesEmail = c.email.toLowerCase().includes(q);
          const matchesPhone = Boolean(c.phone && c.phone.toLowerCase().includes(q));
          const matchesSnippet = Boolean(c.latestMessageSnippet && c.latestMessageSnippet.toLowerCase().includes(q));
          if (!matchesName && !matchesEmail && !matchesPhone && !matchesSnippet) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && c.status !== statusFilter) {
          return false;
        }

        // Type filter
        if (typeFilter === 'registered' && !c.isRegistered) return false;
        if (typeFilter === 'leads' && c.isRegistered) return false;
        if (typeFilter === 'has_conversations' && c.conversationsCount === 0) return false;
        if (typeFilter === 'no_conversations' && c.conversationsCount > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
        }
        if (sortBy === 'conversations') {
          return b.conversationsCount - a.conversationsCount;
        }
        if (sortBy === 'messages') {
          return b.messagesCount - a.messagesCount;
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [customers, searchQuery, statusFilter, typeFilter, sortBy]);

  // Metrics
  const totalCustomersCount = customers.length;
  const registeredCount = customers.filter(c => c.isRegistered).length;
  const leadsCount = customers.filter(c => !c.isRegistered).length;
  const totalConversationsSum = customers.reduce((acc, c) => acc + c.conversationsCount, 0);
  const totalMessagesSum = customers.reduce((acc, c) => acc + c.messagesCount, 0);

  // Active session messages
  const currentSessionMessages = useMemo(() => {
    if (!customerDetail) return [];
    if (!activeSessionId) return customerDetail.allMessages || [];
    const targetSession = customerDetail.conversations.find(s => s.id === activeSessionId || s.sessionId === activeSessionId);
    return targetSession ? targetSession.messages : customerDetail.allMessages || [];
  }, [customerDetail, activeSessionId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <Users className="w-5 h-5 text-teal-700" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'bn' ? 'গ্রাহক ও কথোপকথন ব্যবস্থাপনা' : language === 'ar' ? 'إدارة العملاء والمحادثات' : 'Customer Directory & Conversations'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn' 
              ? 'ডাটাবেস থেকে নিবন্ধিত গ্রাহক ও অতিথি লিডসমূহের তালিকা দেখুন, তাদের সম্পূর্ণ কথোপকথনের ইতিহাস বিশ্লেষণ করুন এবং সরাসরি সহায়তা প্রদান করুন।'
              : language === 'ar'
              ? 'استعراض بيانات العملاء والزوار المسجلة في قاعدة البيانات، والاطلاع على سجل محادثاتهم الشامل مع إمكانية الرد المباشر.'
              : 'Inspect database-registered clients and guest leads, review their multi-turn conversation transcripts, and manage support interactions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => fetchCustomers()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            <span>{language === 'bn' ? 'রিফ্রেশ' : language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'মোট গ্রাহক' : language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
            </span>
            <span className="p-1 rounded-md bg-blue-50 text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {formatNumber(totalCustomersCount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatNumber(registeredCount)} {language === 'bn' ? 'নিবন্ধিত' : language === 'ar' ? 'مسجل' : 'Registered'} • {formatNumber(leadsCount)} {language === 'bn' ? 'লিড' : language === 'ar' ? 'زائر' : 'Leads'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'মোট কথোপকথন' : language === 'ar' ? 'جلسات المحادثة' : 'Conversations'}
            </span>
            <span className="p-1 rounded-md bg-teal-50 text-teal-600">
              <MessageCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {formatNumber(totalConversationsSum)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'bn' ? 'লাইভ সেশন সংরক্ষিত' : language === 'ar' ? 'جلسة محفوظة' : 'Live chat sessions stored'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'বার্তাসমূহ' : language === 'ar' ? 'إجمالي الرسائل' : 'Total Messages'}
            </span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <MessagesSquare className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {formatNumber(totalMessagesSum)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'bn' ? 'ব্যবহারকারী ও এআই বার্তা' : language === 'ar' ? 'متبادلة مع الذكاء الاصطناعي' : 'Exchanged with AI & Staff'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {language === 'bn' ? 'ডাটাবেস স্ট্যাটাস' : language === 'ar' ? 'حالة قاعدة البيانات' : 'Database Status'}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 mt-2 truncate">
            PostgreSQL Neon Sync
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'bn' ? 'তাৎক্ষণিক সিঙ্ক্রোনাইজেশন' : language === 'ar' ? 'مزامنة فورية حية' : 'Real-time multi-turn history'}
          </p>
        </div>
      </div>

      {/* Search, Filter & Controls Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'নাম, ইমেইল, ফোন অথবা বার্তার অংশ খুঁজুন...'
                  : language === 'ar'
                  ? 'بحث بالاسم، البريد، الهاتف أو نص الرسالة...'
                  : 'Search by customer name, email, phone, or message snippet...'
              }
              className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 text-slate-800 placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters & Sorter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                {language === 'bn' ? 'স্ট্যাটাস:' : language === 'ar' ? 'الحالة:' : 'Status:'}
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-teal-600 cursor-pointer"
              >
                <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : language === 'ar' ? 'كافة الحالات' : 'All Status'}</option>
                <option value="active">{language === 'bn' ? 'সক্রিয় (Active)' : language === 'ar' ? 'نشط (Active)' : 'Active'}</option>
                <option value="lead">{language === 'bn' ? 'অতিথি লিড (Lead)' : language === 'ar' ? 'زائر (Lead)' : 'Guest Lead'}</option>
                <option value="inactive">{language === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                {language === 'bn' ? 'টাইপ:' : language === 'ar' ? 'النوع:' : 'Type:'}
              </span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-teal-600 cursor-pointer"
              >
                <option value="all">{language === 'bn' ? 'সকল গ্রাহক' : language === 'ar' ? 'كافة الأنواع' : 'All Customers'}</option>
                <option value="registered">{language === 'bn' ? 'নিবন্ধিত ব্যবহারকারী' : language === 'ar' ? 'المستخدمون المسجلون' : 'Registered Users'}</option>
                <option value="leads">{language === 'bn' ? 'অতিথি লিডসমূহ' : language === 'ar' ? 'الزوار والعملاء المحتملين' : 'Guest Leads'}</option>
                <option value="has_conversations">{language === 'bn' ? 'কথোপকথন আছে' : language === 'ar' ? 'لديهم محادثات' : 'Has Conversations'}</option>
                <option value="no_conversations">{language === 'bn' ? 'কোনো কথোপকথন নেই' : language === 'ar' ? 'بدون محادثات' : 'No Conversations'}</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                {language === 'bn' ? 'সর্ট:' : language === 'ar' ? 'ترتيب:' : 'Sort:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-teal-600 cursor-pointer"
              >
                <option value="recent">{language === 'bn' ? 'সর্বশেষ সক্রিয়' : language === 'ar' ? 'الأحدث نشاطاً' : 'Most Recent Activity'}</option>
                <option value="conversations">{language === 'bn' ? 'কথোপকথনের সংখ্যা' : language === 'ar' ? 'الأكثر محادثات' : 'Most Conversations'}</option>
                <option value="messages">{language === 'bn' ? 'বার্তার সংখ্যা' : language === 'ar' ? 'الأكثر رسائل' : 'Most Messages'}</option>
                <option value="newest">{language === 'bn' ? 'নতুন যোগদানকৃত' : language === 'ar' ? 'تاريخ الانضمام' : 'Newest Joined'}</option>
                <option value="name">{language === 'bn' ? 'নামানুসারে (A-Z)' : language === 'ar' ? 'أبجدياً' : 'Name (A-Z)'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter results counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {language === 'bn' 
              ? `প্রদর্শিত হচ্ছে ${formatNumber(filteredCustomers.length)} জন গ্রাহক (মোট ${formatNumber(totalCustomersCount)} জনের মধ্যে)`
              : language === 'ar'
              ? `عرض ${formatNumber(filteredCustomers.length)} عميل من أصل ${formatNumber(totalCustomersCount)}`
              : `Showing ${formatNumber(filteredCustomers.length)} of ${formatNumber(totalCustomersCount)} customers`}
          </span>
          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customers Directory List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {language === 'bn' ? 'গ্রাহকদের তালিকা' : language === 'ar' ? 'قائمة العملاء' : 'Customer Roster'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {formatNumber(filteredCustomers.length)}
              </span>
            </div>

            {loading ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'ডাটাবেস থেকে গ্রাহকদের তথ্য লোড হচ্ছে...' : language === 'ar' ? 'جاري تحميل بيانات العملاء...' : 'Loading customers from PostgreSQL...'}
                </p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <UserX className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-700">
                  {language === 'bn' ? 'কোনো গ্রাহক পাওয়া যায়নি' : language === 'ar' ? 'لم يتم العثور على أي عميل' : 'No customers found'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'আপনার সার্চ অথবা ফিল্টারের মান পরিবর্তন করে চেষ্টা করুন।' : language === 'ar' ? 'جرب تغيير عبارة البحث أو الفلاتر المحددة.' : 'Try adjusting your search query or active filter settings.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[720px] overflow-y-auto">
                {filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomerId === customer.id;
                  return (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`w-full p-3.5 text-left rtl:text-right transition-all flex items-start gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-teal-50/70 border-l-4 rtl:border-l-0 rtl:border-r-4 border-teal-600 shadow-2xs'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={customer.avatar || getRandomAvatar(customer.email || customer.name)}
                          alt={customer.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(customer.name);
                          }}
                        />
                        {customer.isRegistered && (
                          <span
                            className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center ring-2 ring-white"
                            title="Verified Registered Account"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Info snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                            {customer.name}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {formatTimeAgo(customer.lastActive || customer.createdAt || '')}
                          </span>
                        </div>

                        {customer.email ? (
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">
                            {language === 'bn' ? 'ইমেইল নেই (অতিথি)' : language === 'ar' ? 'بدون بريد (زائر)' : 'No email (Anonymous Guest)'}
                          </p>
                        )}

                        {/* Badges / Stats row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {/* Role / Type badge */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              customer.isRegistered
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                            }`}
                          >
                            {customer.isRegistered
                              ? (language === 'bn' ? 'নিবন্ধিত' : language === 'ar' ? 'مسجل' : 'Registered')
                              : (language === 'bn' ? 'অতিথি লিড' : language === 'ar' ? 'زائر' : 'Guest Lead')}
                          </span>

                          {/* Status badge */}
                          {customer.status && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                customer.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {customer.status}
                            </span>
                          )}

                          {/* Conversations count */}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200/70">
                            <MessageCircle className="w-2.5 h-2.5 text-slate-400" />
                            <span>{formatNumber(customer.conversationsCount)}</span>
                          </span>

                          {/* Messages count */}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200/70">
                            <MessagesSquare className="w-2.5 h-2.5 text-slate-400" />
                            <span>{formatNumber(customer.messagesCount)}</span>
                          </span>
                        </div>

                        {/* Latest message snippet preview */}
                        {customer.latestMessageSnippet && (
                          <div className="mt-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 line-clamp-1 italic">
                            "{customer.latestMessageSnippet}"
                          </div>
                        )}
                      </div>

                      <ChevronRight className={`w-4 h-4 self-center text-slate-400 shrink-0 rtl:rotate-180 transition-transform ${isSelected ? 'text-teal-600 translate-x-0.5 rtl:-translate-x-0.5' : ''}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Individual Whole Conversation Transcript & Profile (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCustomerId ? (
            <div className="space-y-4">
              {/* Customer Profile Card */}
              <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={customerDetail?.customer.avatar || getRandomAvatar(selectedCustomerId)}
                      alt={customerDetail?.customer.name || 'Customer'}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getFallbackAvatar(customerDetail?.customer.name || 'Customer');
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">
                          {customerDetail?.customer.name || 'Loading customer details...'}
                        </h2>
                        {customerDetail?.customer.isRegistered && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            <Check className="w-2.5 h-2.5" />
                            {language === 'bn' ? 'নিবন্ধিত ক্লায়েন্ট' : language === 'ar' ? 'عميل مسجل' : 'Registered Client'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                        {customerDetail?.customer.email && (
                          <a
                            href={`mailto:${customerDetail.customer.email}`}
                            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{customerDetail.customer.email}</span>
                          </a>
                        )}

                        {customerDetail?.customer.phone && (
                          <a
                            href={`tel:${customerDetail.customer.phone}`}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{customerDetail.customer.phone}</span>
                          </a>
                        )}

                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {language === 'bn' ? 'যোগদান: ' : language === 'ar' ? 'تاريخ البدء: ' : 'Joined: '}
                            {customerDetail?.customer.joinedDate || 'Recent'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Copy ID Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(customerDetail?.customer.id || selectedCustomerId, 'cust-id')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono transition-colors cursor-pointer"
                      title="Copy Customer ID"
                    >
                      {copiedId === 'cust-id' ? (
                        <>
                          <Check className="w-3 h-3 text-teal-600" />
                          <span className="text-teal-600">{language === 'bn' ? 'কপি হয়েছে' : language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>ID: {(customerDetail?.customer.id || selectedCustomerId).slice(0, 10)}...</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Detailed Stats Strip */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="block text-[11px] text-slate-500">
                      {language === 'bn' ? 'কথোপকথন সেশন' : language === 'ar' ? 'جلسات المحادثة' : 'Conversations'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatNumber(customerDetail?.conversations.length || 0)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="block text-[11px] text-slate-500">
                      {language === 'bn' ? 'মোট বার্তা' : language === 'ar' ? 'مجموع الرسائل' : 'Total Messages'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatNumber(customerDetail?.allMessages.length || 0)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="block text-[11px] text-slate-500">
                      {language === 'bn' ? 'ফোরাম টপিকস' : language === 'ar' ? 'مواضيع المنتدى' : 'Forum Topics'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatNumber(customerDetail?.forumTopics?.length || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Tabs Selector: Conversation Transcripts vs Forum Discussions */}
              <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                  onClick={() => setActiveDetailTab('conversation')}
                  className={`pb-2 px-1 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDetailTab === 'conversation'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn' ? 'সম্পূর্ণ কথোপকথন ট্র্যান্সক্রিপ্ট' : language === 'ar' ? 'سجل المحادثة الكامل' : 'Whole Conversation Transcript'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
                    {formatNumber(customerDetail?.allMessages.length || 0)}
                  </span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('topics')}
                  className={`pb-2 px-1 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDetailTab === 'topics'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn' ? 'ফোরাম পোস্টসমূহ' : language === 'ar' ? 'مشاركات المنتدى' : 'Forum Discussions'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
                    {formatNumber(customerDetail?.forumTopics?.length || 0)}
                  </span>
                </button>
              </div>

              {/* View 1: Conversation Transcripts Tab */}
              {activeDetailTab === 'conversation' && (
                <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col">
                  {/* Session Selector Strip if customer has multiple conversation sessions */}
                  {customerDetail && customerDetail.conversations.length > 1 && (
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">
                        {language === 'bn' ? 'সেশনসমূহ:' : language === 'ar' ? 'الجلسات:' : 'Sessions:'}
                      </span>
                      {customerDetail.conversations.map((sess, idx) => {
                        const isSessActive = activeSessionId === sess.id;
                        return (
                          <button
                            key={sess.id}
                            onClick={() => setActiveSessionId(sess.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                              isSessActive
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <span>#{idx + 1}</span>
                            <span className="text-[10px] opacity-80">
                              ({formatNumber(sess.messages?.length || sess.messageCount)} {language === 'bn' ? 'বার্তা' : language === 'ar' ? 'رسالة' : 'msgs'})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Messages Timeline Feed */}
                  <div className="p-4 sm:p-5 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4 bg-slate-50/40">
                    {loadingDetail ? (
                      <div className="h-60 flex items-center justify-center space-y-2 flex-col">
                        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-500">
                          {language === 'bn' ? 'কথোপকথন লোড হচ্ছে...' : language === 'ar' ? 'جاري تحميل المحادثة...' : 'Retrieving conversation history...'}
                        </p>
                      </div>
                    ) : currentSessionMessages.length === 0 ? (
                      <div className="h-60 flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <MessageSquare className="w-10 h-10 text-slate-300" />
                        <p className="text-xs font-medium text-slate-700">
                          {language === 'bn' ? 'এই গ্রাহকের কোনো কথোপকথন শুরু হয়নি' : language === 'ar' ? 'لا توجد أي محادثات لهذا العميل بعد' : 'No conversation history found for this customer.'}
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-sm">
                          {language === 'bn' 
                            ? 'গ্রাহক এখনো লাইভ সাপোর্ট বা মেসেঞ্জারে বার্তা পাঠাননি। আপনি নিচে থেকে সরাসরি বার্তা পাঠাতে পারেন।'
                            : language === 'ar'
                            ? 'لم يقم العميل بإرسال رسائل عبر المحادثة المباشرة بعد. يمكنك بدء التواصل معه أدناه.'
                            : 'This customer has not initiated a support chat yet. You can write an initial message below to start reaching out.'}
                        </p>
                      </div>
                    ) : (
                      currentSessionMessages.map((msg, index) => {
                        const isUserMsg = msg.role === 'user' || msg.sender === 'user';
                        const isStaff = msg.source === 'STAFF' || (msg.content && msg.content.startsWith('['));
                        const isAI = !isUserMsg && !isStaff;

                        return (
                          <div
                            key={msg.id || index}
                            className={`flex items-start gap-3 ${isUserMsg ? 'flex-row' : 'flex-row'}`}
                          >
                            {/* Message Sender Icon / Avatar */}
                            <div className="shrink-0 mt-0.5">
                              {isUserMsg ? (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs ring-1 ring-slate-300">
                                  <User className="w-4 h-4" />
                                </div>
                              ) : isStaff ? (
                                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center ring-2 ring-teal-200">
                                  <ShieldCheck className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center ring-2 ring-indigo-200">
                                  <Bot className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-slate-800">
                                  {isUserMsg
                                    ? customerDetail?.customer.name || 'Customer'
                                    : isStaff
                                    ? (language === 'bn'
                                        ? 'একজন সিনিয়র এক্সিকিউটিভ আপনার প্রশ্নের দায়িত্ব গ্রহণ করেছেন'
                                        : language === 'ar'
                                        ? 'استلم مسؤول تنفيذي أول استفسارك'
                                        : 'An Executive Senior received your query')
                                    : (language === 'bn' ? 'এআই অ্যাসিস্ট্যান্ট' : language === 'ar' ? 'المساعد الذকি' : 'AI Assistant')}
                                </span>

                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider ${
                                    isUserMsg
                                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                      : isStaff
                                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  }`}
                                >
                                  {isUserMsg ? 'User' : isStaff ? (language === 'bn' ? 'এক্সিকিউটিভ' : language === 'ar' ? 'تنفيذي' : 'EXECUTIVE') : 'AI'}
                                </span>

                                <span className="text-[10px] text-slate-400 ml-auto font-mono">
                                  {formatTimeAgo(msg.createdAt || '')}
                                </span>
                              </div>

                              <div
                                className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                                  isUserMsg
                                    ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                                    : isStaff
                                    ? 'bg-teal-50 text-teal-950 border border-teal-200 shadow-2xs font-medium'
                                    : 'bg-white text-slate-800 border border-indigo-100 shadow-2xs'
                                }`}
                              >
                                {(msg.content || msg.message || '').replace(/^\[[^\]]+\]:\s*/, '')}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Direct Staff Reply Composer */}
                  <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSendStaffReply} className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                          <CornerDownRight className="w-3.5 h-3.5 text-teal-600" />
                          <span>
                            {language === 'bn' ? 'সরাসরি বার্তা পাঠান' : language === 'ar' ? 'إرسال رد مباشر للعميل' : 'Send Direct Response'}
                          </span>
                        </span>
                        <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                          {language === 'bn' 
                            ? 'একজন সিনিয়র এক্সিকিউটিভ হিসেবে উত্তর পাঠানো হবে' 
                            : language === 'ar' 
                            ? 'الرد بصفة مسؤول تنفيذي أول' 
                            : 'An Executive Senior reached your query'}
                        </span>
                      </div>

                      <div className="relative">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={
                            language === 'bn'
                              ? 'গ্রাহককে পাঠানোর জন্য আপনার বার্তা লিখুন...'
                              : language === 'ar'
                              ? 'اكتب رسالتك المباشرة للرد على العميل...'
                              : 'Type your official consultation response directly to this customer...'
                          }
                          className="w-full p-3 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 text-slate-800 placeholder:text-slate-400 transition-colors resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        {replySuccess ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {language === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : language === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Staff reply dispatched successfully!'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {language === 'bn' ? 'সরাসরি লাইভ চ্যাটে যুক্ত হবে' : language === 'ar' ? 'ستنعكس الرسالة فوراً في المحادثة' : 'Syncs immediately to customer session'}
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={sendingReply || !replyText.trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingReply ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'বার্তা পাঠান' : language === 'ar' ? 'إرسال الرد' : 'Send Staff Reply'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* View 2: Forum Topics Tab */}
              {activeDetailTab === 'topics' && (
                <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      {language === 'bn' ? 'এই গ্রাহকের পোস্টকৃত টপিকসমূহ' : language === 'ar' ? 'مواضيع المنتدى التي طرحها العميل' : 'Topics Created by Customer'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {formatNumber(customerDetail?.forumTopics?.length || 0)}
                    </span>
                  </div>

                  {!customerDetail?.forumTopics || customerDetail.forumTopics.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-medium text-slate-700">
                        {language === 'bn' ? 'কোনো ফোরাম টপিক পাওয়া যায়নি' : language === 'ar' ? 'لا توجد أي مواضيع منشورة من هذا العميل' : 'No forum discussions posted by this customer'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {language === 'bn' ? 'গ্রাহক এখনও ফোরামে কোনো প্রশ্ন বা আলোচনা তৈরি করেননি।' : language === 'ar' ? 'لم يقم العميل بنشر أي استفسار في المنتدى العام بعد.' : 'This customer has not created any public community discussions yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {customerDetail.forumTopics.map((topic) => (
                        <div key={topic.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-slate-900 truncate">
                              {topic.title}
                            </h3>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-100">
                                {topic.category}
                              </span>
                              <span>{formatNumber(topic.replies)} {language === 'bn' ? 'উত্তর' : language === 'ar' ? 'ردود' : 'replies'}</span>
                              <span>{formatNumber(topic.views)} {language === 'bn' ? 'ভিউ' : language === 'ar' ? 'مشاهدة' : 'views'}</span>
                              <span>{formatTimeAgo(topic.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty State when no customer is selected */
            <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[480px]">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center ring-8 ring-teal-50/50">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'একটি গ্রাহক প্রোফাইল নির্বাচন করুন' : language === 'ar' ? 'اختر عميلاً من القائمة' : 'Select a Customer from Directory'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {language === 'bn'
                  ? 'বামপাশের তালিকা থেকে যে কোনো গ্রাহকে ক্লিক করে তাদের প্রাথমিক তথ্য, সম্পূর্ণ কথোপকথনের ইতিহাস ও অনুসন্ধান পর্যালোচনা করুন।'
                  : language === 'ar'
                  ? 'انقر على أي عميل من القائمة الجانبية للاطلاع على ملفه التعريفي وسجل المحادثات الكامل والتفاعل معه.'
                  : 'Click on any customer in the left column to inspect their complete interaction profile, review their full conversation transcript, and send direct replies.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
