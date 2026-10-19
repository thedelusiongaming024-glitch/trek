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
  Layers,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronDown,
  Zap,
  Sparkles
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
    primarySupportEmail: settings.primarySupportEmail || 'support@trekconsultancy.com'
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
        showNotification(
          replyContent
            ? `Ticket #${updated.ticketNumber} answered! Solution synchronized to AI Support Assistant.`
            : `Ticket #${updated.ticketNumber} updated successfully!`
        );
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
          message: staffReplyText.trim()
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
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Header with Quick Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Support & Messenger Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage user ticket queues, knowledge base FAQs, and floating messenger settings.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center shrink-0 min-w-[75px]">
            <span className="text-base font-bold font-mono text-slate-900">{openTicketsCount}</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Open</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center shrink-0 min-w-[75px]">
            <span className="text-base font-bold font-mono text-slate-900">{answeredTicketsCount}</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Answered</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center shrink-0 min-w-[75px]">
            <span className="text-base font-bold font-mono text-slate-900">{faqs.length}</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">FAQs</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center shrink-0 min-w-[75px]">
            <span className="text-base font-bold font-mono text-slate-900">{conversations.length}</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Chats</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200/80 max-w-fit overflow-x-auto">
        <button
          onClick={() => setSubTab('tickets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === 'tickets'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Tickets</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded font-mono bg-blue-100 text-blue-700 text-[10px]">
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('faqs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === 'faqs'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
          <span>Knowledge & FAQs</span>
          <span className="px-1.5 py-0.2 rounded font-mono bg-slate-200/70 text-slate-700 text-[10px]">
            {faqs.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('knowledge-chunks')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === 'knowledge-chunks'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          <span>Knowledge Chunks</span>
        </button>

        <button
          onClick={() => setSubTab('conversations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === 'conversations'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessagesSquare className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Chats</span>
        </button>

        <button
          onClick={() => setSubTab('widget-settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            subTab === 'widget-settings'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          <span>Widget Config</span>
        </button>
      </div>

      {/* SUB-VIEW 1: TICKETS QUEUE */}
      {subTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Tickets List */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Filter & Search Bar */}
            <div className="rounded-xl p-3 bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search tickets by subject, user, or #TKT..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                  title="Refresh ticket queue"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Status & Priority Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
                  {['all', 'open', 'in_progress', 'answered', 'closed'].map(st => (
                    <button
                      key={st}
                      onClick={() => setTicketStatusFilter(st)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer border ${
                        ticketStatusFilter === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Priority:</span>
                  {['all', 'Normal', 'Urgent', 'Critical'].map(pr => (
                    <button
                      key={pr}
                      onClick={() => setTicketPriorityFilter(pr)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer border ${
                        ticketPriorityFilter === pr
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
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
              <div className="rounded-xl p-8 bg-white border border-slate-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-700">No Support Tickets Found</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">There are no tickets matching your current search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const isAnswered = t.status === 'ANSWERED';
                  const isClosed = t.status === 'CLOSED';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`rounded-xl p-3.5 transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-teal-50/50 border-teal-500 shadow-xs'
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded">
                              #{t.ticketNumber}
                            </span>
                            {t.subject?.includes('[Auto-Flagged VIP Lead]') && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold tracking-wide bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-600" /> Auto-Flagged VIP
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium uppercase tracking-wider ${
                              t.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : t.priority === 'Urgent'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {t.priority}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium uppercase tracking-wider ${
                              isAnswered
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isClosed
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 truncate mt-1">{t.subject}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-normal">
                        {t.question}
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-700 truncate max-w-[160px]">{t.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.adminAnswer && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
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
          <div className="lg:col-span-5 sticky top-20">
            {selectedTicket ? (
              <div className="rounded-xl p-4 bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                        #{selectedTicket.ticketNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{selectedTicket.priority} Priority</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                    <p className="text-[11px] text-slate-500">From: <span className="font-medium text-slate-700">{selectedTicket.userEmail}</span></p>
                  </div>
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete ticket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* VIP Auto-Flag Notification Banner */}
                {selectedTicket.subject?.includes('[Auto-Flagged VIP Lead]') && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-900">AI Secret Escalation:</span> This client expressed high commercial intent or requested direct phone/WhatsApp advisory. The AI assistant has handled them with VIP care—review details below to follow up!
                    </div>
                  </div>
                )}

                {/* Question Body */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <span>Inquiry</span>
                    <span className="text-slate-400 font-mono text-[10px]">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-normal">
                    {selectedTicket.question}
                  </p>
                </div>

                {/* Existing Admin Answer if present */}
                {selectedTicket.adminAnswer && (
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Staff Answer ({selectedTicket.assignedTo || 'Specialist'})</span>
                      </div>
                      <span className="text-emerald-600 font-mono text-[10px]">
                        {selectedTicket.answeredAt ? new Date(selectedTicket.answeredAt).toLocaleDateString() : 'Answered'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 whitespace-pre-wrap leading-normal">
                      {selectedTicket.adminAnswer}
                    </p>
                    <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-teal-700">
                      <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                      <span className="font-medium">Active in 24/7 AI Support Knowledge Base (RAG Real-Time Sync)</span>
                    </div>
                  </div>
                )}

                {/* Response / Resolution Box */}
                <div className="space-y-2.5 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    {selectedTicket.adminAnswer ? 'Update Official Response' : 'Compose Official Response'}
                  </label>
                  <textarea
                    rows={3}
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type official support answer here..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400 leading-normal"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateTicket(selectedTicket.id, e.target.value)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="OPEN">Status: OPEN</option>
                      <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                      <option value="ANSWERED">Status: ANSWERED</option>
                      <option value="CLOSED">Status: CLOSED</option>
                    </select>

                    <button
                      onClick={() => handleUpdateTicket(selectedTicket.id, 'ANSWERED', adminReplyText || selectedTicket.adminAnswer)}
                      disabled={replySubmitting || (!adminReplyText.trim() && !selectedTicket.adminAnswer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{replySubmitting ? 'Sending...' : 'Publish Answer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-8 bg-white border border-slate-200 text-center text-slate-400 space-y-2">
                <MessageCircle className="w-7 h-7 mx-auto text-slate-300" />
                <p className="text-xs">Select a ticket from the list to view inquiry details and publish an official response.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: KNOWLEDGE BASE & FAQS */}
      {subTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Community Knowledge & FAQs</h2>
              <p className="text-xs text-slate-500">Manage bilingual English & Bengali questions and answers shown in the Support Hub.</p>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map(faq => {
              const catName = categories.find(c => c.id === faq.categoryId)?.name || 'General';
              return (
                <div
                  key={faq.id}
                  className="rounded-xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
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
                          className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 leading-snug">{faq.question}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-normal">{faq.answer}</p>
                    </div>

                    {faq.questionBn && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                        <span className="text-[9px] font-semibold uppercase text-teal-700">বাংলা:</span>
                        <p className="font-medium text-slate-700">{faq.questionBn}</p>
                        <p className="text-slate-500 text-[11px]">{faq.answerBn}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-50 font-mono">
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
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Active Chat Sessions</h3>
                <p className="text-[11px] text-slate-500">{conversations.length} visitor conversations</p>
              </div>
              <button
                onClick={fetchData}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                <MessagesSquare className="w-7 h-7 mx-auto opacity-40 mb-1" />
                <p className="text-xs">No active chat sessions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(c => {
                  const isActive = activeSessionId === c.sessionId;
                  const isFlaggedLead = tickets.some(t => t.sessionId === c.sessionId && t.subject?.includes('[Auto-Flagged VIP Lead]'));
                  return (
                    <div
                      key={c.sessionId}
                      onClick={() => handleOpenConversation(c.sessionId)}
                      className={`p-3 rounded-xl transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {c.isGuest === false && c.userEmail ? (
                            <>
                              <span className="font-semibold text-slate-900 truncate max-w-[130px]" title={c.userEmail}>
                                {c.userName || c.userEmail}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                                User
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-mono font-medium text-slate-700 truncate max-w-[130px]">
                                {c.sessionId}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                Guest
                              </span>
                            </>
                          )}
                          {isFlaggedLead && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5 shrink-0">
                              <Zap className="w-2.5 h-2.5 text-amber-600" /> VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(c.lastActive).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        <span className="font-semibold text-slate-700">{c.lastSender}: </span>
                        {c.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                        <span>{c.messageCount} messages</span>
                        <span className="text-amber-700 font-medium font-sans">Inspect &rarr;</span>
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
              <div className="rounded-xl p-4 bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Transcript</span>
                    <h3 className="text-xs font-mono font-semibold text-slate-900 flex items-center gap-2">
                      <span>Session: {activeSessionId}</span>
                      {conversations.find(c => c.sessionId === activeSessionId)?.userEmail ? (
                        <span className="text-teal-700 font-sans font-medium text-[11px]">
                          ({conversations.find(c => c.sessionId === activeSessionId)?.userName ? `${conversations.find(c => c.sessionId === activeSessionId)?.userName} - ` : ''}{conversations.find(c => c.sessionId === activeSessionId)?.userEmail})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px]">
                          (Guest Visitor)
                        </span>
                      )}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-emerald-800 bg-emerald-50 border border-emerald-200 text-[10px] font-medium font-mono">
                    Connected
                  </span>
                </div>

                {/* Messages stream */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {sessionMessages.map((m, idx) => {
                    const isUser = m.sender === 'user';
                    const isStaff = m.source === 'STAFF';
                    return (
                      <div
                        key={m.id || idx}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white ${
                            isStaff ? 'bg-amber-600' : 'bg-teal-600'
                          }`}>
                            {isStaff ? <ShieldCheck className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>
                        )}
                        <div className={`p-2.5 rounded-lg max-w-[80%] text-xs leading-normal ${
                          isUser
                            ? 'bg-teal-600 text-white'
                            : isStaff
                            ? 'bg-amber-50 border border-amber-200 text-amber-950'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{(m.message || m.content || '').replace(/^\[[^\]]+\]:\s*/, '')}</p>
                          <div className={`text-[9px] mt-1 flex items-center justify-between gap-2 font-mono ${
                            isUser ? 'text-teal-100' : 'text-slate-400'
                          }`}>
                            <span>{isStaff ? 'EXECUTIVE SENIOR' : (m.source || (isUser ? 'USER' : 'AI'))}</span>
                            <span>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Staff intervention reply box */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Executive Senior Direct Message:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={staffReplyText}
                      onChange={(e) => setStaffReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendStaffReply()}
                      placeholder="Type executive senior response to customer..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                    />
                    <button
                      onClick={handleSendStaffReply}
                      disabled={sendingStaffReply || !staffReplyText.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {sendingStaffReply ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-8 bg-white border border-slate-200 text-center text-slate-400 space-y-2">
                <MessagesSquare className="w-7 h-7 mx-auto text-slate-300" />
                <p className="text-xs">Select a visitor chat session from the left to read transcript or intervene.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: FLOATING MESSENGER CONFIGURATION */}
      {subTab === 'widget-settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Settings Form */}
          <div className="lg:col-span-7 space-y-4 rounded-xl p-5 bg-white border border-slate-200/90 shadow-2xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Floating Messenger Customizer</h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure the bottom-right action button, greeting prompts, and automated AI assistance.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-800">Display Floating Support Button</h3>
                  <p className="text-[11px] text-slate-500">Show or hide the floating messenger bubble in public view</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgetSettings.floatingSupportEnabled}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                </label>
              </div>

              {/* Hover Tag Text English */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Hover Tag (English):
                </label>
                <input
                  type="text"
                  value={widgetSettings.floatingSupportTagTextEn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportTagTextEn: e.target.value }))}
                  placeholder="e.g. Support Assistant & FAQs"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              {/* Hover Tag Text Bengali */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Hover Tag (বাংলা অনুবাদ):
                </label>
                <input
                  type="text"
                  value={widgetSettings.floatingSupportTagTextBn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportTagTextBn: e.target.value }))}
                  placeholder="e.g. ২৪/৭ সাপোর্ট চ্যাট ও হেল্প"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              {/* Welcome Prompt English */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Welcome Greeting (English):
                </label>
                <textarea
                  rows={2}
                  value={widgetSettings.floatingSupportGreetingEn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportGreetingEn: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              {/* Welcome Prompt Bengali */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Welcome Greeting (বাংলা):
                </label>
                <textarea
                  rows={2}
                  value={widgetSettings.floatingSupportGreetingBn}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportGreetingBn: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              {/* AI Auto-reply switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Automated AI Assistant</h3>
                    <p className="text-[11px] text-slate-500">Allow assistant to answer common questions from FAQs</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widgetSettings.floatingSupportAiEnabled}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, floatingSupportAiEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                </label>
              </div>

              {/* Default Priority & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Default Priority:</label>
                  <select
                    value={widgetSettings.floatingSupportDefaultPriority}
                    onChange={(e: any) => setWidgetSettings(prev => ({ ...prev, floatingSupportDefaultPriority: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Support Email:</label>
                  <input
                    type="email"
                    value={widgetSettings.primarySupportEmail}
                    onChange={(e) => setWidgetSettings(prev => ({ ...prev, primarySupportEmail: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={handleSaveWidgetSettings}
                disabled={savingSettings}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 sticky top-20 rounded-xl p-4 bg-white border border-slate-200/90 shadow-2xs space-y-3 text-slate-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">Widget Simulator</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Preview
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Preview of floating button and hover indicator tag as seen by visitors:
            </p>

            {/* Mock Screen Surface */}
            <div className="h-44 rounded-lg bg-slate-50 border border-slate-200 relative overflow-hidden flex flex-col justify-end p-4">
              <div className="text-[10px] text-slate-400 font-mono absolute top-2.5 left-2.5">
                [Viewport Corner]
              </div>

              {widgetSettings.floatingSupportEnabled ? (
                <div className="flex items-center justify-end gap-2.5">
                  {/* Hover Tag simulation */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-800 text-[11px] font-medium shadow-2xs border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate max-w-[150px]">
                      {widgetSettings.floatingSupportTagTextEn || 'Support Assistant & FAQs'}
                    </span>
                  </div>

                  {/* Messenger Button simulation */}
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white shadow-xs border border-white flex items-center justify-center cursor-pointer">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Widget currently disabled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Create / Edit Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingFaq ? 'Edit FAQ Article' : 'Create FAQ Article'}
              </h3>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Category:</label>
                <select
                  value={faqForm.categoryId}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Question (English):</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. How do I delete my discussion post?"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Answer (English):</label>
                <textarea
                  rows={3}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Provide clear, step-by-step guidance..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Question (বাংলা অনুবাদ - ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={faqForm.questionBn}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, questionBn: e.target.value }))}
                  placeholder="যেমন: কীভাবে আমার পোস্ট ডিলিট করব?"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Answer (বাংলা অনুবাদ - ঐচ্ছিক):</label>
                <textarea
                  rows={2}
                  value={faqForm.answerBn}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answerBn: e.target.value }))}
                  placeholder="সহজ ভাষায় সমাধান লিখুন..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs transition-colors cursor-pointer"
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
