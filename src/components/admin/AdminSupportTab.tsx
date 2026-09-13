import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  MessageCircle, 
  HelpCircle, 
  MessagesSquare, 
  Sliders, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Save, 
  Eye, 
  Bot, 
  User, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronDown,
  Phone
} from 'lucide-react';
import { SupportTicket, FAQItem, FAQCategory, SupportChatSession, PlatformSettings } from '../../types';
import { AdminKnowledgeChunksTab } from './AdminKnowledgeChunksTab';

interface AdminSupportTabProps {
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => void;
}

export const AdminSupportTab: React.FC<AdminSupportTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [subTab, setSubTab] = useState<'tickets' | 'faqs' | 'knowledge-chunks' | 'conversations' | 'widget-settings'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [conversations, setConversations] = useState<SupportChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Tickets filters & selected
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>('all');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('Alex Ross (Super Admin)');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // FAQ Modal / Form
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState<{
    categoryId: string;
    question: string;
    answer: string;
    questionBn: string;
    answerBn: string;
    status: 'published' | 'draft';
  }>({
    categoryId: 'cat-forum',
    question: '',
    answer: '',
    questionBn: '',
    answerBn: '',
    status: 'published'
  });

  // Conversation inspect
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [staffReplyText, setStaffReplyText] = useState('');
  const [sendingStaffReply, setSendingStaffReply] = useState(false);

  // Floating Widget Live Settings
  const [widgetSettings, setWidgetSettings] = useState<{
    floatingSupportEnabled: boolean;
    floatingSupportTagTextEn: string;
    floatingSupportTagTextBn: string;
    floatingSupportGreetingEn: string;
    floatingSupportGreetingBn: string;
    floatingSupportAiEnabled: boolean;
    floatingSupportDefaultPriority: 'Normal' | 'Urgent' | 'Critical';
    primarySupportEmail: string;
  }>({
    floatingSupportEnabled: settings.floatingSupportEnabled !== false,
    floatingSupportTagTextEn: settings.floatingSupportTagTextEn || 'Support Assistant & FAQs',
    floatingSupportTagTextBn: settings.floatingSupportTagTextBn || '২৪/৭ সাপোর্ট চ্যাট ও হেল্প',
    floatingSupportGreetingEn: settings.floatingSupportGreetingEn || 'Hello! How can our support team & AI assist your community journey today?',
    floatingSupportGreetingBn: settings.floatingSupportGreetingBn || 'নমস্কার! আমাদের সাপোর্ট টিম ও এআই অ্যাসিস্ট্যান্ট কীভাবে আপনাকে সহায়তা করতে পারে?',
    floatingSupportAiEnabled: settings.floatingSupportAiEnabled !== false,
    floatingSupportDefaultPriority: settings.floatingSupportDefaultPriority || 'Normal',
    primarySupportEmail: settings.primarySupportEmail || 'support@amacommunity.io'
  });

  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch tickets
      const tRes = await fetch('/api/admin/support/tickets');
      if (tRes.ok) {
        const tData = await tRes.json();
        setTickets(tData);
      }

      // 2. Fetch FAQs & Categories
      const fRes = await fetch('/api/support/faqs');
      if (fRes.ok) {
        const fData = await fRes.json();
        setFaqs(fData.faqs || []);
        setCategories(fData.categories || []);
      }

      // 3. Fetch conversations
      const cRes = await fetch('/api/admin/support/conversations');
      if (cRes.ok) {
        const cData = await cRes.json();
        setConversations(cData);
      }
    } catch (err) {
      console.error('Failed to load support admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Handle Ticket Reply & Status Update
  const handleUpdateTicket = async (ticketId: string, newStatus?: string, replyContent?: string) => {
    setReplySubmitting(true);
    try {
      const payload: any = {};
      if (newStatus) payload.status = newStatus;
      if (replyContent !== undefined) payload.adminAnswer = replyContent;
      if (selectedAssignee) payload.assignedTo = selectedAssignee;

      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updated);
        }
        setAdminReplyText('');
        showNotification(`Ticket #${updated.ticketNumber} updated successfully!`);
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setReplySubmitting(false);
    }
  };

  // Handle Ticket Deletion
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
        showNotification('Ticket deleted from database.');
      }
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  // Handle FAQ Create / Update
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;

    try {
      if (editingFaq) {
        // Update
        const res = await fetch(`/api/admin/support/faqs/${editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(faqForm)
        });
        if (res.ok) {
          const updated = await res.json();
          setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...updated } : f));
          showNotification('FAQ article updated successfully.');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/support/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(faqForm)
        });
        if (res.ok) {
          const created = await res.json();
          setFaqs(prev => [created, ...prev]);
          showNotification('New FAQ published to Support Hub.');
        }
      }
      setIsFaqModalOpen(false);
      setEditingFaq(null);
    } catch (err) {
      console.error('Failed to save FAQ:', err);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!window.confirm('Delete this FAQ article from the knowledge database?')) return;
    try {
      const res = await fetch(`/api/admin/support/faqs/${faqId}`, { method: 'DELETE' });
      if (res.ok) {
        setFaqs(prev => prev.filter(f => f.id !== faqId));
        showNotification('FAQ removed.');
      }
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    }
  };

  // Open Conversation
  const handleOpenConversation = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await fetch(`/api/support/messages?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const msgs = await res.json();
        setSessionMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  // Send Staff Reply into live conversation
  const handleSendStaffReply = async () => {
    if (!activeSessionId || !staffReplyText.trim()) return;
    setSendingStaffReply(true);
    try {
      const res = await fetch(`/api/admin/support/conversations/${encodeURIComponent(activeSessionId)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: staffReplyText.trim(),
          staffName: 'Alex Ross (Specialist)'
        })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setSessionMessages(prev => [...prev, newMsg]);
        setStaffReplyText('');
        showNotification('Staff reply delivered to live chat session.');
      }
    } catch (err) {
      console.error('Failed to send staff reply:', err);
    } finally {
      setSendingStaffReply(false);
    }
  };

  // Save Widget Settings
  const handleSaveWidgetSettings = async () => {
    setSavingSettings(true);
    try {
      const updatedPlatformSettings: PlatformSettings = {
        ...settings,
        ...widgetSettings
      };
      await onSaveSettings(updatedPlatformSettings);
      showNotification('Floating messenger & support settings synchronized to PostgreSQL!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = ticketStatusFilter === 'all' || t.status.toLowerCase() === ticketStatusFilter.toLowerCase();
    const matchesPriority = ticketPriorityFilter === 'all' || t.priority.toLowerCase() === ticketPriorityFilter.toLowerCase();
    const matchesSearch = !ticketSearch.trim() || 
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.question.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const answeredTicketsCount = tickets.filter(t => t.status === 'ANSWERED').length;

  return (
    <div className="space-y-6">
      {/* Toast notification banner */}
      {actionSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Header Card with Quick Stats */}
      <div className="rounded-3xl p-6 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            <Headphones className="w-4 h-4" />
            <span>Support & Help Desk Central</span>
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">
            Floating Messenger & AI Support Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage public ticket queues, bilingual knowledge FAQs, real-time user chat sessions, and the bottom-right floating messenger widget from one connected control center.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-3 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
          <div className="px-4 py-2.5 rounded-2xl bg-teal-50 border border-teal-100 flex flex-col items-center justify-center shrink-0 min-w-[90px]">
            <span className="text-lg font-bold text-teal-700">{openTicketsCount}</span>
            <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-tight">Open Tickets</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0 min-w-[90px]">
            <span className="text-lg font-bold text-blue-700">{answeredTicketsCount}</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-tight">Answered</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center shrink-0 min-w-[90px]">
            <span className="text-lg font-bold text-purple-700">{faqs.length}</span>
            <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-tight">Live FAQs</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center shrink-0 min-w-[90px]">
            <span className="text-lg font-bold text-amber-700">{conversations.length}</span>
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-tight">Live Chats</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 backdrop-blur-md max-w-fit overflow-x-auto">
        <button
          onClick={() => setSubTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'tickets'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Ticket Queue</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'faqs'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
          <span>Knowledge & FAQs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
            {faqs.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('knowledge-chunks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'knowledge-chunks'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>AI Knowledge & RAG Chunks</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </button>

        <button
          onClick={() => setSubTab('conversations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'conversations'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <MessagesSquare className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Chat Logs</span>
        </button>

        <button
          onClick={() => setSubTab('widget-settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'widget-settings'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-500" />
          <span>Floating Messenger Config</span>
        </button>
      </div>

      {/* SUB-VIEW 1: TICKETS QUEUE */}
      {subTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Tickets List */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter & Search Bar */}
            <div className="rounded-3xl p-4 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search tickets by subject, user, or #TKT..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                  title="Refresh ticket queue"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Status & Priority Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
                  {['all', 'open', 'in_progress', 'answered', 'closed'].map(st => (
                    <button
                      key={st}
                      onClick={() => setTicketStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all cursor-pointer ${
                        ticketStatusFilter === st
                          ? 'bg-teal-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Priority:</span>
                  {['all', 'Normal', 'Urgent', 'Critical'].map(pr => (
                    <button
                      key={pr}
                      onClick={() => setTicketPriorityFilter(pr)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                        ticketPriorityFilter === pr
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets Cards */}
            {filteredTickets.length === 0 ? (
              <div className="rounded-3xl p-10 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800">No Support Tickets Found</h4>
                <p className="text-xs text-slate-500 mt-1">There are no support tickets matching your current search or status filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const isAnswered = t.status === 'ANSWERED';
                  const isClosed = t.status === 'CLOSED';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`rounded-2xl p-4 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-400 shadow-md ring-2 ring-teal-500/20'
                          : 'bg-white/80 hover:bg-white border-white/90 shadow-xs hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                              #{t.ticketNumber}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              t.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : t.priority === 'Urgent'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {t.priority}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isAnswered
                                ? 'bg-emerald-100 text-emerald-700'
                                : isClosed
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-blue-100 text-blue-700 animate-pulse'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {t.question}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700 truncate max-w-[140px]">{t.userEmail}</span>
                          </div>
                          {t.userWhatsapp && (
                            <a
                              href={`https://wa.me/${t.userWhatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold hover:bg-emerald-100 transition-colors shrink-0"
                              title={`WhatsApp: ${t.userWhatsapp}`}
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[80px]">{t.userWhatsapp}</span>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {t.adminAnswer && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                              <Check className="w-3 h-3" /> Answered
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Ticket Detail & Action Console */}
          <div className="lg:col-span-5 sticky top-24">
            {selectedTicket ? (
              <div className="rounded-3xl p-5 bg-white/85 backdrop-blur-xl border border-white/90 shadow-lg space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-md">
                        #{selectedTicket.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{selectedTicket.priority} Priority</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">{selectedTicket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-[11px] text-slate-500">From: <span className="font-medium text-slate-700">{selectedTicket.userEmail}</span></p>
                      {selectedTicket.userWhatsapp && (
                        <a
                          href={`https://wa.me/${selectedTicket.userWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-100 transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{selectedTicket.userWhatsapp}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Body */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <span>User Inquiry</span>
                    <span className="text-slate-400 font-normal">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.question}
                  </p>
                </div>

                {/* Existing Admin Answer if present */}
                {selectedTicket.adminAnswer && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Staff Answer ({selectedTicket.assignedTo || 'Specialist'})</span>
                      </div>
                      <span className="text-emerald-600 font-normal text-[10px]">
                        {selectedTicket.answeredAt ? new Date(selectedTicket.answeredAt).toLocaleDateString() : 'Answered'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.adminAnswer}
                    </p>
                  </div>
                )}

                {/* Response / Resolution Box */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {selectedTicket.adminAnswer ? 'Update Official Response' : 'Compose Official Response & Sync to User Widget'}
                  </label>
                  <textarea
                    rows={3}
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type official support answer here. This will update the database and display in the user's My Tickets tracker..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400 leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicket(selectedTicket.id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none"
                      >
                        <option value="OPEN">Status: OPEN</option>
                        <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                        <option value="ANSWERED">Status: ANSWERED</option>
                        <option value="CLOSED">Status: CLOSED</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleUpdateTicket(selectedTicket.id, 'ANSWERED', adminReplyText || selectedTicket.adminAnswer)}
                      disabled={replySubmitting || (!adminReplyText.trim() && !selectedTicket.adminAnswer)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{replySubmitting ? 'Sending...' : 'Publish Answer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl p-8 bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs text-center text-slate-400 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                <p className="text-xs font-medium">Select a ticket from the list to view inquiry details, change status, or publish an official response.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: KNOWLEDGE BASE & FAQS */}
      {subTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Community Knowledge & FAQs</h3>
              <p className="text-xs text-slate-500">Manage questions and bilingual English & Bengali answers shown in the Support Hub & RAG AI.</p>
            </div>
            <button
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({
                  categoryId: categories[0]?.id || 'cat-forum',
                  question: '',
                  answer: '',
                  questionBn: '',
                  answerBn: '',
                  status: 'published'
                });
                setIsFaqModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New FAQ Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map(faq => {
              const catName = categories.find(c => c.id === faq.categoryId)?.name || 'General';
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl p-4 bg-white/85 backdrop-blur-xl border border-white/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-tight">
                        {catName}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingFaq(faq);
                            setFaqForm({
                              categoryId: faq.categoryId || 'cat-forum',
                              question: faq.question,
                              answer: faq.answer,
                              questionBn: faq.questionBn || '',
                              answerBn: faq.answerBn || '',
                              status: faq.status || 'published'
                            });
                            setIsFaqModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{faq.question}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>

                    {faq.questionBn && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                        <span className="text-[9px] font-bold uppercase text-teal-600">বাংলা অনুবাদ:</span>
                        <p className="font-medium text-slate-700">{faq.questionBn}</p>
                        <p className="text-slate-500 text-[11px]">{faq.answerBn}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                    <span>Status: <span className="font-semibold text-emerald-600 uppercase">{faq.status}</span></span>
                    <span>ID: {faq.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DYNAMIC AI KNOWLEDGE & RAG CHUNKS */}
      {subTab === 'knowledge-chunks' && (
        <AdminKnowledgeChunksTab onNotify={showNotification} />
      )}

      {/* SUB-VIEW 4: LIVE CHAT SESSIONS */}
      {subTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Chat Sessions List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Chat Sessions</h3>
                <p className="text-[11px] text-slate-500">{conversations.length} unique visitor conversations logged</p>
              </div>
              <button
                onClick={fetchData}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white/60 rounded-2xl border border-white/80">
                <MessagesSquare className="w-8 h-8 mx-auto opacity-40 mb-1" />
                <p className="text-xs">No active chat sessions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(c => {
                  const isActive = activeSessionId === c.sessionId;
                  return (
                    <div
                      key={c.sessionId}
                      onClick={() => handleOpenConversation(c.sessionId)}
                      className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-amber-50/80 border-amber-300 shadow-md ring-2 ring-amber-500/20'
                          : 'bg-white/80 hover:bg-white border-white/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          {c.userEmail ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-700 font-bold text-[10px] truncate">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">{c.userEmail}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium text-[10px]">
                              Guest Visitor
                            </span>
                          )}
                          {c.userWhatsapp && (
                            <a
                              href={`https://wa.me/${c.userWhatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold hover:bg-emerald-100 transition-colors shrink-0"
                              title={`WhatsApp: ${c.userWhatsapp}`}
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[70px]">{c.userWhatsapp}</span>
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.lastActive).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-1">
                        <span className="font-semibold text-slate-800">{c.lastSender}: </span>
                        {c.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>{c.messageCount} messages</span>
                        <span className="text-amber-600 font-semibold">Inspect Live &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Message Transcripts & Staff Intervention */}
          <div className="lg:col-span-7">
            {activeSessionId ? (
              <div className="rounded-3xl p-5 bg-white/85 backdrop-blur-xl border border-white/90 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Live Transcript</span>
                    <h3 className="text-xs font-mono font-bold text-slate-900">Session ID: {activeSessionId}</h3>
                    {(() => {
                      const conv = conversations.find(c => c.sessionId === activeSessionId);
                      if (!conv) return null;
                      return (
                        <div className="flex items-center gap-2 mt-1">
                          {conv.userEmail && (
                            <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
                              <User className="w-3 h-3" /> {conv.userEmail}
                            </span>
                          )}
                          {conv.userWhatsapp && (
                            <a
                              href={`https://wa.me/${conv.userWhatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-2.5 h-2.5" /> {conv.userWhatsapp}
                            </a>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Connected in DB
                  </span>
                </div>

                {/* Messages stream */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {sessionMessages.map((m, idx) => {
                    const isUser = m.sender === 'user';
                    const isStaff = m.source === 'STAFF';
                    return (
                      <div
                        key={m.id || idx}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white ${
                            isStaff ? 'bg-amber-600' : 'bg-teal-600'
                          }`}>
                            {isStaff ? <ShieldCheck className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#0084FF] text-white rounded-tr-xs'
                            : isStaff
                            ? 'bg-amber-50 border border-amber-200 text-amber-950 rounded-tl-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                        }`}>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          <div className={`text-[9px] mt-1 flex items-center justify-between gap-2 ${
                            isUser ? 'text-blue-100' : 'text-slate-400'
                          }`}>
                            <span>{m.source || (isUser ? 'USER' : 'AI')}</span>
                            <span>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Staff intervention reply box */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Live Specialist Intervention:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={staffReplyText}
                      onChange={(e) => setStaffReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendStaffReply()}
                      placeholder="Type direct staff message to this visitor session..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:outline-none text-slate-800"
                    />
                    <button
                      onClick={handleSendStaffReply}
                      disabled={sendingStaffReply || !staffReplyText.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      {sendingStaffReply ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl p-8 bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs text-center text-slate-400 space-y-2">
                <MessagesSquare className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs font-medium">Select a visitor chat session from the left to read conversation history or step in with a staff reply.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: FLOATING MESSENGER & INDICATOR TAG CONFIGURATION */}
      {subTab === 'widget-settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Settings Form */}
          <div className="lg:col-span-7 space-y-5 rounded-3xl p-6 bg-white/80 backdrop-blur-xl border border-white/90 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Floating Messenger Widget Customizer</h3>
              <p className="text-xs text-slate-500">Configure the bottom-right action button, hover indicator tags, greeting prompts, and AI routing.</p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="font-bold text-slate-800">Display Floating Support Button</h4>
                  <p className="text-[11px] text-slate-500">Show or hide the floating messenger bubble in the forum screen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgetSettings.floatingSupportEnabled}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
                </label>
              </div>

              {/* Hover Tag Text English */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hover Indicator Tag Text (English):
                </label>
                <input
                  type="text"
                  value={widgetSettings.floatingSupportTagTextEn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportTagTextEn: e.target.value }))}
                  placeholder="e.g. Support Assistant & FAQs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 font-medium"
                />
              </div>

              {/* Hover Tag Text Bengali */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hover Indicator Tag Text (বাংলা অনুবাদ):
                </label>
                <input
                  type="text"
                  value={widgetSettings.floatingSupportTagTextBn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportTagTextBn: e.target.value }))}
                  placeholder="e.g. ২৪/৭ সাপোর্ট চ্যাট ও হেল্প"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800 font-medium"
                />
              </div>

              {/* Welcome Prompt English */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assistant Welcome Greeting (English):
                </label>
                <textarea
                  rows={2}
                  value={widgetSettings.floatingSupportGreetingEn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportGreetingEn: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* Welcome Prompt Bengali */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assistant Welcome Greeting (বাংলা):
                </label>
                <textarea
                  rows={2}
                  value={widgetSettings.floatingSupportGreetingBn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportGreetingBn: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* AI Auto-reply switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-teal-900">Automated AI & RAG Responses</h4>
                    <p className="text-[11px] text-teal-700">Allow AI assistant to query PostgreSQL FAQs and answer member inquiries instantly</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgetSettings.floatingSupportAiEnabled}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportAiEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
                </label>
              </div>

              {/* Default Priority & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Ticket Priority:</label>
                  <select
                    value={widgetSettings.floatingSupportDefaultPriority}
                    onChange={(e: any) => setWidgetSettings(prev => ({ ...prev, floatingSupportDefaultPriority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Support Email:</label>
                  <input
                    type="email"
                    value={widgetSettings.primarySupportEmail}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, primarySupportEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={handleSaveWidgetSettings}
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving to Database...' : 'Save & Sync to Live Database'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 sticky top-24 rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Real-Time UI Preview</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold">
                Live Simulator
              </span>
            </div>

            <p className="text-xs text-slate-400">
              This interactive simulation shows exactly how the floating messenger action button and its hover indicator tag appear on the forum screen:
            </p>

            {/* Mock Screen Surface */}
            <div className="h-52 rounded-2xl bg-slate-950/70 border border-slate-800 relative overflow-hidden flex flex-col justify-end p-4">
              <div className="text-[10px] text-slate-500 font-mono absolute top-3 left-3">
                [Forum Bottom-Right Corner]
              </div>

              {widgetSettings.floatingSupportEnabled ? (
                <div className="flex items-center justify-end gap-3 group">
                  {/* Hover Tag simulation */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-medium shadow-2xl border border-slate-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="tracking-tight text-slate-200 whitespace-nowrap text-[11px]">
                      {widgetSettings.floatingSupportTagTextEn || 'Support Assistant & FAQs'}
                    </span>
                  </div>

                  {/* Messenger Button simulation */}
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#006AFF] via-[#0084FF] to-[#00C6FF] text-white shadow-lg border-2 border-white/50 flex items-center justify-center cursor-pointer">
                    <svg className="w-6 h-6 text-white fill-white drop-shadow-xs" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.517 3.735 7.185V22l3.418-1.875c.91.252 1.872.39 2.847.39 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2zm1.047 12.443l-2.55-2.72-4.975 2.72 5.473-5.81 2.613 2.72 4.912-2.72-5.473 5.81z" />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-rose-400 font-semibold py-8">
                  Floating Messenger Widget is currently DISABLED.
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
              <span className="font-bold text-slate-300">Database Sync Status:</span>
              <p>Changes saved here update the PostgreSQL <code className="text-teal-300">settings</code> table and apply globally in real-time across all client sessions.</p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Create / Edit Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingFaq ? 'Edit FAQ Article' : 'Create New Knowledge FAQ'}
              </h3>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category:</label>
                <select
                  value={faqForm.categoryId}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question (English):</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. How do I delete my discussion post?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Answer (English):</label>
                <textarea
                  rows={3}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Provide clear, step-by-step guidance..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question (বাংলা অনুবাদ - ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={faqForm.questionBn}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, questionBn: e.target.value }))}
                  placeholder="যেমন: কীভাবে আমার পোস্ট ডিলিট করব?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Answer (বাংলা অনুবাদ - ঐচ্ছিক):</label>
                <textarea
                  rows={2}
                  value={faqForm.answerBn}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answerBn: e.target.value }))}
                  placeholder="সহজ ভাষায় সমাধান লিখুন..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md"
                >
                  {editingFaq ? 'Update FAQ' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
