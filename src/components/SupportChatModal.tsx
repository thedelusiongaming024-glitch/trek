import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  X,
  Send,
  Bot,
  Loader2,
  Sparkles,
  HelpCircle,
  Ticket,
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileText,
  AlertCircle,
  RefreshCw,
  User,
  ShieldAlert,
  Copy,
  Check,
  BookOpen,
  Database,
  Cloud,
  CheckCircle,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getGuestMessagesFromStorage,
  saveGuestMessagesToStorage,
  clearGuestMessagesFromStorage,
  syncGuestConversationToDb,
  ChatMessageToSync
} from '../utils/chatSync';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name?: string;
    email?: string;
    whatsapp?: string;
  } | null;
  onRequireAuth?: () => void;
}

interface MessageItem {
  id?: string;
  sender: 'bot' | 'user';
  text: string;
  source?: string;
  time: string;
  autoTicket?: {
    id: string;
    ticketNumber: string;
    subject: string;
    priority: string;
    status: string;
    assignedTo?: string;
  };
  suggestedActions?: string[];
}

interface FaqItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  question: string;
  answer: string;
  questionBn?: string;
  answerBn?: string;
}

interface FaqCategory {
  id: string;
  name: string;
  description?: string;
}

interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  userEmail: string;
  userWhatsapp?: string;
  subject: string;
  question: string;
  priority: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
  adminAnswer?: string;
  assignedTo?: string;
  createdAt: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireAuth
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'ticket' | 'my-tickets'>('chat');

  // Chat state
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check guest conversation limit (3 free messages for new visitors without account)
  const isGuest = !currentUser?.email;
  const userMessagesCount = messages.filter((m) => m.sender === 'user').length;
  const GUEST_MESSAGE_LIMIT = 3;
  const hasReachedGuestLimit = isGuest && userMessagesCount >= GUEST_MESSAGE_LIMIT;

  // FAQs state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketWhatsapp, setTicketWhatsapp] = useState(currentUser?.whatsapp || '');
  const [ticketQuestion, setTicketQuestion] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState('');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  // Persistent Session ID
  const sessionId = React.useMemo(() => {
    try {
      let id = localStorage.getItem('ama_chat_session');
      if (!id) {
        id = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        localStorage.setItem('ama_chat_session', id);
      }
      return id;
    } catch {
      return 'default-session';
    }
  }, []);

  // Update email if currentUser changes
  useEffect(() => {
    if (currentUser?.email && !ticketEmail) {
      setTicketEmail(currentUser.email);
    }
  }, [currentUser, ticketEmail]);

  // Fetch chat messages (Loaded from PostgreSQL Database for authenticated users, Ephemeral Local Storage for Guests)
  useEffect(() => {
    if (!isOpen) return;
    const fetchHistory = async () => {
      if (currentUser?.email) {
        // Automatically migrate & sync any pending guest conversation that was held before creating an account or logging in
        await syncGuestConversationToDb(currentUser.email, (currentUser as any)?.id, sessionId);

        try {
          const res = await fetch(`/api/support/messages?sessionId=${sessionId}&userEmail=${encodeURIComponent(currentUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setMessages(
                data.map((m: any) => ({
                  id: m.id,
                  sender: m.sender,
                  source: m.source || (m.sender === 'bot' ? 'AI' : 'USER'),
                  text: m.message,
                  time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recorded'
                }))
              );
              return;
            }
          }
        } catch (err) {
          console.error('Failed to load chat history from database:', err);
        }
      } else {
        // Pure guest user: Load temporary messages from local cache (NEVER fetched from/saved to DB)
        const cached = getGuestMessagesFromStorage(sessionId);
        if (cached && cached.length > 0) {
          setMessages(
            cached.map((m) => ({
              id: m.id,
              sender: m.sender,
              source: m.source || (m.sender === 'bot' ? 'AI' : 'USER'),
              text: m.text,
              time: m.time || 'Just now'
            }))
          );
          return;
        }
      }

      // Initial welcome message if no prior messages exist
      setMessages([
        {
          sender: 'bot',
          source: 'AI',
          text: language === 'bn'
            ? 'হ্যালো! **আমা কমিউনিটি** সাপোর্ট সেন্টারে আপনাকে স্বাগতম। আমি আপনার সার্বক্ষণিক এআই অ্যাসিস্ট্যান্ট।\n\nফোরাম ডিসকাশন, টেকনিক্যাল ডকুমেন্টেশন, প্ল্যাটফর্ম ফিচার বা এন্টারপ্রাইজ কনসালটেন্সি—যেকোনো বিষয়ে যেকোনো প্রশ্ন করতে পারেন। আজ আপনাকে কীভাবে সহায়তা করতে পারি?'
            : 'Hello! Welcome to **Ama Community Support**. I am your dedicated AI Assistant.\n\nWhether you need help navigating forum discussions, exploring technical documentation, resolving platform questions, or learning about our Enterprise Consultancy retainers—I am here to assist you! How can I help you today?',
          time: 'Just now',
          suggestedActions: language === 'bn'
            ? ['কীভাবে ফোরামে পোস্ট করব?', 'নলেজ বেস ডকুমেন্টেশন', 'এন্টারপ্রাইজ কনসালটেন্সি', 'সাপোর্ট টিকিট স্ট্যাটাস']
            : ['How do I post in forums?', 'Knowledge Base & Docs', 'Enterprise Consultancy Retainers', 'Track Support Tickets']
        }
      ]);
    };

    fetchHistory();
  }, [isOpen, sessionId, currentUser?.email, language, t]);

  // Fetch FAQs
  useEffect(() => {
    if (!isOpen) return;
    const fetchFaqs = async () => {
      setIsLoadingFaqs(true);
      try {
        const url = `/api/support/faqs?category=${encodeURIComponent(selectedCategory)}&q=${encodeURIComponent(faqSearch)}&lang=${language}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFaqs(data.faqs || []);
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setIsLoadingFaqs(false);
      }
    };

    const timer = setTimeout(fetchFaqs, faqSearch ? 250 : 0);
    return () => clearTimeout(timer);
  }, [isOpen, selectedCategory, faqSearch, language]);

  // Fetch User's Tickets
  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const emailParam = currentUser?.email || ticketEmail || '';
      const res = await fetch(`/api/support/tickets?sessionId=${sessionId}&email=${encodeURIComponent(emailParam)}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isOpen && (activeTab === 'my-tickets' || activeTab === 'ticket')) {
      loadTickets();
    }
  }, [isOpen, activeTab, currentUser?.email, ticketEmail, sessionId]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen) return null;

  // Handle sending a chat message
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const messageToSend = customPrompt || input.trim();
    if (!messageToSend || isSending) return;

    // If new user without account reaches preview limit, pop up auth modal to continue
    if (isGuest && userMessagesCount >= GUEST_MESSAGE_LIMIT) {
      onRequireAuth?.();
      return;
    }

    setInput('');
    setIsSending(true);

    const tempUserMsg: MessageItem = {
      sender: 'user',
      source: 'USER',
      text: messageToSend,
      time: 'Just now'
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageToSend,
          language,
          userEmail: currentUser?.email || undefined,
          userId: (currentUser as any)?.id || undefined,
          userWhatsapp: ticketWhatsapp.trim() || currentUser?.whatsapp || undefined,
          guestMessageCount: isGuest ? userMessagesCount : undefined,
          recentHistory: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUserMsg: MessageItem = {
          id: data.userMessage.id,
          sender: 'user',
          source: 'USER',
          text: data.userMessage.message,
          time: data.userMessage.time
        };
        const updatedBotMsg: MessageItem = {
          id: data.botReply.id,
          sender: 'bot',
          source: data.botReply.source || 'AI',
          text: data.botReply.message,
          time: data.botReply.time,
          autoTicket: data.autoTicket || undefined,
          suggestedActions: Array.isArray(data.botReply.suggestedActions) ? data.botReply.suggestedActions : undefined
        };

        setMessages((prev) => {
          const next = [...prev.slice(0, -1), updatedUserMsg, updatedBotMsg];
          // If guest, save conversation purely in ephemeral local storage, NOT to database
          if (isGuest) {
            saveGuestMessagesToStorage(sessionId, next.map(m => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              source: m.source,
              time: m.time,
              suggestedActions: m.suggestedActions
            })));
          }
          return next;
        });

        if (data.autoTicket) {
          loadTickets();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403 && errData.requiresAuth) {
          // Remove speculative user message if server rejected due to limit
          setMessages((prev) => prev.slice(0, -1));
          onRequireAuth?.();
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            source: 'AI',
            text: language === 'bn' 
              ? 'ধন্যবাদ! আপনার বার্তাটি রেকর্ড করা হয়েছে। আমাদের টিম পর্যালোচনা করবে।' 
              : 'Thanks for your message! Our community engineers have been notified.',
            time: 'Just now'
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          source: 'AI',
          text: language === 'bn' 
            ? 'সার্ভারে সাময়িক সমস্যা হচ্ছে। আপনি চাইলে সরাসরি সাপোর্ট টিকিট জমা দিতে পারেন।' 
            : 'Connection retry. You can also open an official support ticket in the Submit Ticket tab!',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle FAQ Ask AI
  const handleAskFaqToAi = (faq: FaqItem) => {
    const qText = language === 'bn' && faq.questionBn ? faq.questionBn : faq.question;
    setActiveTab('chat');
    handleSendMessage(undefined, qText);
  };

  // Handle Support Ticket Submit
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuestion.trim() || isSubmittingTicket) return;

    setIsSubmittingTicket(true);
    setTicketSuccessMsg('');

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userEmail: ticketEmail || currentUser?.email || 'guest@amacommunity.io',
          userWhatsapp: ticketWhatsapp.trim() || undefined,
          subject: ticketSubject || (ticketQuestion.slice(0, 45) + '...'),
          question: ticketQuestion,
          priority: ticketPriority,
          userId: currentUser?.name || undefined
        })
      });

      if (res.ok) {
        const newTicket = await res.json();
        setTickets((prev) => [newTicket, ...prev]);
        setTicketSuccessMsg(
          language === 'bn'
            ? `সফলভাবে টিকিট #${newTicket.ticketNumber} তৈরি হয়েছে! আমাদের প্রতিনিধি শীঘ্রই উত্তর দেবেন।`
            : `Ticket #${newTicket.ticketNumber} created successfully! Our specialists will respond shortly.`
        );
        setTicketQuestion('');
        setTicketSubject('');
        setTimeout(() => {
          setActiveTab('my-tickets');
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div
      id="floating-support-chat-modal"
      className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-20 sm:right-6 z-50 w-auto sm:w-[440px] md:w-[480px] max-h-[92dvh] sm:max-h-[85vh] h-[calc(100dvh-1rem)] sm:h-[640px] rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col text-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Top Header */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 ring-2 ring-white/20 shrink-0">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {t('Ama Support Assistant')}
              </h4>
              {currentUser?.email ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" title="All conversations are securely saved in your database account">
                  <Database className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{language === 'bn' ? 'ডাটাবেজে সংরক্ষিত' : 'DB Synced'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40" title="Guest chat is temporary and not saved to the database unless you create an account">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  <span>{language === 'bn' ? 'গেস্ট মোড (অস্থায়ী)' : 'Guest Mode'}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{t('24/7 AI & Help Center')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close support modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-2 sm:px-3 py-1.5 gap-1 text-xs font-medium overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{t('AI Chat')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t('FAQs & Knowledge')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ticket')}
          className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ticket'
              ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>{t('Submit Ticket')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-tickets')}
          className={`py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'my-tickets'
              ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="Track your submitted tickets"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          {tickets.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
              {tickets.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: AI CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m, i) => {
              const msgKey = m.id || `msg-${i}`;
              const isCopied = copiedMsgId === msgKey;

              return (
                <div
                  key={msgKey}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs ring-1 ring-slate-900/5'
                    }`}
                  >
                    {m.sender === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                    ) : (
                      <div className="space-y-2">
                        {/* Bot source header banner if RAG / Knowledge Base */}
                        {m.source && (m.source === 'RAG' || m.text.includes('From Knowledge Base') || m.text.includes('নলেজ বেস')) && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/90 border border-teal-200/60 text-teal-800 text-[11px] font-semibold mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{language === 'bn' ? 'নলেজ বেস ও ডকুমেন্টারি ডেটা' : 'Knowledge Base & Verified Docs'}</span>
                          </div>
                        )}

                        {/* Rich Decorated Markdown Content */}
                        <div className="markdown-content text-slate-800 leading-relaxed text-[12.5px]">
                          <Markdown
                            components={{
                              h1: ({ children }) => (
                                <h3 className="text-[13px] font-bold text-slate-900 mt-2 mb-1.5 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                                  {children}
                                </h3>
                              ),
                              h2: ({ children }) => (
                                <h4 className="text-[12.5px] font-bold text-teal-800 mt-2 mb-1 flex items-center gap-1.5">
                                  {children}
                                </h4>
                              ),
                              h3: ({ children }) => (
                                <h5 className="text-[12px] font-semibold text-slate-800 mt-1.5 mb-0.5">
                                  {children}
                                </h5>
                              ),
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 leading-relaxed text-slate-700 text-[12.5px]">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-slate-900 bg-slate-100/90 px-1 py-0.2 rounded text-[12px]">
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="space-y-1.5 my-2 pl-0.5 list-none">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="space-y-1.5 my-2 pl-2 list-decimal list-inside text-slate-700 text-[12px]">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-700 my-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                  <span className="flex-1">{children}</span>
                                </li>
                              ),
                              code: ({ inline, className, children, ...props }: any) => {
                                if (inline) {
                                  return (
                                    <code className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-[11px] border border-slate-200/80 font-medium">
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <div className="my-2 rounded-xl bg-slate-900 text-teal-300 p-3 text-[11px] font-mono overflow-x-auto border border-slate-800 shadow-inner whitespace-pre-wrap leading-relaxed">
                                    <code>{children}</code>
                                  </div>
                                );
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-teal-500 pl-3 py-1 my-2 bg-teal-50/50 rounded-r-xl text-slate-700 text-xs italic">
                                  {children}
                                </blockquote>
                              )
                            }}
                          >
                            {m.text}
                          </Markdown>
                        </div>

                        {/* Auto-Raised Ticket Notification Card */}
                        {m.autoTicket && (
                          <div className="mt-3 p-3 rounded-xl bg-teal-50/90 border border-teal-200/90 text-left flex flex-col gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-teal-800 text-white font-mono text-[11px] font-bold">
                                  #{m.autoTicket.ticketNumber}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase tracking-wider">
                                  {m.autoTicket.status || 'OPEN'}
                                </span>
                              </div>
                              <span className="text-[11px] text-teal-900 font-medium">
                                Priority: <strong className="text-teal-950 font-bold">{m.autoTicket.priority || 'Normal'}</strong>
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 font-medium line-clamp-2">
                              {m.autoTicket.subject}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-teal-200/70 text-[11px]">
                              <span className="text-slate-600">
                                Assigned: <strong className="text-slate-900">{m.autoTicket.assignedTo || 'Community Specialist'}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('my-tickets');
                                  loadTickets();
                                }}
                                className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                              >
                                <span>{language === 'bn' ? 'টিকিট ট্র্যাক করুন' : 'Track in My Tickets'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 1-Click Raise Community Support with Specialist Action Button (shown only when escalation/ticket submission is indicated and not already auto-created) */}
                        {!m.autoTicket && (m.text.includes('Submit Ticket') ||
                          m.text.includes('সাপোর্ট টিকিট') ||
                          m.text.includes('support ticket') ||
                          m.text.includes('হিউম্যান সাপোর্ট') ||
                          m.text.includes('Human Support') ||
                          m.text.includes('Community Support') ||
                          m.text.includes('কমিউনিটি সাপোর্ট') ||
                          m.text.includes('Specialist')) && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('ticket');
                                const lastUserMsg = [...messages].reverse().find(msg => msg.sender === 'user');
                                if (lastUserMsg && !ticketQuestion) {
                                  setTicketQuestion(lastUserMsg.text);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-[11px] font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>
                                {language === 'bn' ? 'কমিউনিটি সাপোর্ট ও স্পেশালিস্টের সাথে যোগাযোগ' : 'Community Support with Specialist'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message footer with quick copy */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{m.time}</span>
                    {m.sender === 'bot' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msgKey, m.text)}
                          className="hover:text-slate-600 inline-flex items-center gap-0.5 text-[10px] transition-colors cursor-pointer"
                          title="Copy response text"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">{t('Copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t('Copy')}</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/80 border border-slate-200/70 rounded-2xl p-3 w-fit shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>{language === 'bn' ? 'এআই উত্তর তৈরি করছে...' : 'AI Assistant is retrieving knowledge...'}</span>
              </div>
            )}

            {/* Guest message limit prompt */}
            {hasReachedGuestLimit && (
              <div className="my-2 p-4 rounded-2xl bg-gradient-to-br from-teal-50 via-cyan-50/50 to-emerald-50 border border-teal-200/90 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-900">
                      {language === 'bn' ? 'ফ্রি মেসেজ লিমিট পূর্ণ হয়েছে' : 'Conversation Preview Limit Reached'}
                    </h5>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      {userMessagesCount}/{GUEST_MESSAGE_LIMIT} {language === 'bn' ? 'মেসেজ' : 'Messages'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                    {language === 'bn'
                      ? 'সাপোর্ট অ্যাসিস্ট্যান্টের সাথে আলোচনা চালিয়ে যেতে এবং আনলিমিটেড এআই সহায়তা পেতে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন অথবা সাইন ইন করুন।'
                      : 'To continue your conversation with our support assistant and unlock unlimited questions, please sign in or create a free account.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRequireAuth?.()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি / সাইন ইন করুন' : 'Sign Up or Sign In to Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input box or Auth Prompt Action */}
          {hasReachedGuestLimit ? (
            <div className="p-3 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => onRequireAuth?.()}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-teal-200/90 text-slate-700 hover:text-teal-900 transition-all flex items-center justify-between shadow-xs cursor-pointer group"
              >
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-900">
                    {language === 'bn' ? 'কথোপকথন চালিয়ে যেতে সাইন আপ বা লগইন করুন' : 'Sign up or log in to continue chatting'}
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    {language === 'bn' ? 'ক্লিক করলেই অ্যাকাউন্ট উইন্ডো খুলে যাবে' : 'Click to open the account registration & sign in window'}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-teal-600 group-hover:bg-teal-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0">
                  <span>{language === 'bn' ? 'সাইন ইন / সাইন আপ' : 'Sign In / Up'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('Type your message in English or বাংলা...')}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: FAQS & KNOWLEDGE */}
      {activeTab === 'faqs' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 p-4 overflow-y-auto">
          {/* Search box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder={t('Search knowledge base & FAQs...')}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t('All Categories')}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t(c.name)}
              </button>
            ))}
          </div>

          {/* FAQs list */}
          {isLoadingFaqs ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span>{language === 'bn' ? 'প্রশ্নোত্তর লোড হচ্ছে...' : 'Loading FAQs & Knowledge...'}</span>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200/80">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                {t('No matching articles or FAQs found.')}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <span>{t('Open a Support Ticket')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const questionText = language === 'bn' && faq.questionBn ? faq.questionBn : faq.question;
                const answerText = language === 'bn' && faq.answerBn ? faq.answerBn : faq.answer;

                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full p-3.5 text-left flex items-start justify-between gap-2 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {questionText}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50">
                        <p className="leading-relaxed whitespace-pre-line">{answerText}</p>
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {faq.categoryName || 'General Knowledge'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAskFaqToAi(faq)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{t('Ask AI About This')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBMIT SUPPORT TICKET */}
      {activeTab === 'ticket' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 p-4 overflow-y-auto">
          <div className="mb-4">
            <h5 className="text-sm font-bold text-slate-900">{t('Open a Support Ticket')}</h5>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Our specialized engineering and moderation team responds within 2 business hours.')}
            </p>
          </div>

          {ticketSuccessMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{ticketSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleTicketSubmit} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t('Your Email Address')} *
              </label>
              <input
                type="email"
                required
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  {t('WhatsApp / Phone Number')}
                </label>
                <span className="text-[10px] text-slate-400 font-normal">{t('Optional')}</span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={ticketWhatsapp}
                  onChange={(e) => setTicketWhatsapp(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t('Subject / Topic')}
              </label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder={t('Brief summary of the issue...')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t('Priority Level')}
              </label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="Normal">{t('Normal')}</option>
                <option value="Urgent">{t('Urgent')}</option>
                <option value="Critical">{t('Critical')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t('Detailed Question / Request')} *
              </label>
              <textarea
                rows={3}
                required
                value={ticketQuestion}
                onChange={(e) => setTicketQuestion(e.target.value)}
                placeholder={t('Provide full details, steps to reproduce, or requirements...')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingTicket}
              className="w-full py-2.5 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingTicket ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('Submitting Ticket...')}</span>
                </>
              ) : (
                <>
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{t('Submit Support Ticket')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: MY TICKETS TRACKER */}
      {activeTab === 'my-tickets' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-bold text-slate-900">{t('Your Active Support Tickets')}</h5>
            <button
              type="button"
              onClick={loadTickets}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh tickets list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickets ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoadingTickets ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                {t('No support tickets opened yet.')}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className="mt-3 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {t('Open a Support Ticket')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700">
                      #{tkt.ticketNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tkt.status === 'ANSWERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tkt.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t(tkt.status)}
                    </span>
                  </div>

                  {tkt.userWhatsapp && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-100/60 w-fit">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-mono text-[10px]">{tkt.userWhatsapp}</span>
                    </div>
                  )}

                  <h6 className="text-xs font-bold text-slate-900 leading-snug">
                    {tkt.subject || tkt.question.slice(0, 45)}
                  </h6>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {tkt.question}
                  </p>

                  {tkt.adminAnswer ? (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900">
                      <div className="flex items-center gap-1 font-bold text-[11px] text-emerald-800 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('Admin Response:')}</span>
                      </div>
                      <p className="whitespace-pre-line">{tkt.adminAnswer}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t('Awaiting specialist review')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
