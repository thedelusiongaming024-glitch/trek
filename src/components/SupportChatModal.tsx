import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  X,
  Send,
  Bot,
  Loader2,
  Sparkles,
  HelpCircle,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  User,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getRandomAvatar, getFallbackAvatar } from '../utils/avatar';
import aiAvatar from '../assets/ai-assistant-avatar.png';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
  onRequireAuth?: () => void;
}

interface MessageItem {
  id?: string;
  sender: 'bot' | 'user';
  text: string;
  source?: string;
  time: string;
}

interface FaqItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  question: string;
  answer: string;
  questionBn?: string;
  answerBn?: string;
  questionAr?: string;
  answerAr?: string;
}

interface FaqCategory {
  id: string;
  name: string;
  description?: string;
}

const normalizeMarkdown = (raw: string): string => {
  if (!raw) return '';
  let text = raw.replace(/^\[[^\]]+\]:\s*/, '');

  // 1. Normalize line endings
  text = text.replace(/\r\n/g, '\n');

  // 2. Convert unicode bullets (•, ●, ▪, ⁃, ‣) at start of lines into standard markdown list items '- '
  text = text.replace(/(^|\n)[ \t]*[•●▪⁃‣][ \t]*/g, '$1- ');

  // 3. Ensure empty line before lists if preceded by plain text (prevents CommonMark from merging list into paragraph)
  text = text.replace(/([^\n])\n([ \t]*[-*+][ \t]+|[ \t]*\d+\.[ \t]+)/g, '$1\n\n$2');

  // 4. Ensure empty line after list items if followed by a regular non-list paragraph
  text = text.replace(/(\n[ \t]*[-*+][^\n]+)\n([^\n\-*+\d#> \t])/g, '$1\n\n$2');

  // 5. Ensure empty line before headings
  text = text.replace(/([^\n])\n(#{1,4}[ \t]+)/g, '$1\n\n$2');

  // 6. Ensure empty line before blockquotes
  text = text.replace(/([^\n])\n>[ \t]*/g, '$1\n\n> ');

  // 7. Ensure empty line before horizontal rules
  text = text.replace(/([^\n])\n(---|\*\*\*|___)[ \t]*(\n|$)/g, '$1\n\n$2\n\n');

  return text.trim();
};

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireAuth
}) => {
  const { language, t, formatNumber } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs'>('chat');

  // Chat state
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Check guest conversation limit (3 free messages for new visitors without account)
  const isGuest = !currentUser?.email;
  const userMessagesCount = messages.filter((m) => m.sender === 'user').length;
  const GUEST_MESSAGE_LIMIT = 3;
  const hasReachedGuestLimit = isGuest && userMessagesCount >= GUEST_MESSAGE_LIMIT;

  // Session ID management that cleanly isolates registered users from guests
  const getInitialSessionId = () => {
    try {
      if ((currentUser as any)?.id) {
        return `user-${(currentUser as any).id}`;
      }
      let guestId = localStorage.getItem('trek_guest_session');
      if (!guestId) {
        guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('trek_guest_session', guestId);
      }
      return guestId;
    } catch {
      return (currentUser as any)?.id ? `user-${(currentUser as any).id}` : `guest-${Date.now()}`;
    }
  };

  const [sessionId, setSessionId] = useState<string>(getInitialSessionId);
  const prevUserEmailRef = useRef<string | undefined>(currentUser?.email);

  // Synchronize and isolate session state when user logs in or logs out
  useEffect(() => {
    const prevEmail = prevUserEmailRef.current;
    const currentEmail = currentUser?.email;
    prevUserEmailRef.current = currentEmail;

    if (currentEmail !== prevEmail) {
      if (currentUser) {
        // User logged in: Canonicalize session to this specific user account
        const userSessionId = `user-${(currentUser as any)?.id || (currentUser.email ? currentUser.email.replace(/[^a-zA-Z0-9]/g, '_') : 'user')}`;
        setSessionId(userSessionId);

        // If there was an anonymous guest session from this visit, claim it into the user's account
        const guestSession = localStorage.getItem('trek_guest_session');
        if (guestSession) {
          fetch('/api/support/conversations/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: guestSession,
              userId: (currentUser as any)?.id || undefined,
              userEmail: currentUser.email,
              userName: currentUser.name
            })
          })
          .catch(() => {})
          .finally(() => {
            try {
              localStorage.removeItem('trek_guest_session');
            } catch {}
          });
        }
      } else {
        // User logged out: Immediately purge all conversations from view and storage!
        const newGuestSession = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        try {
          localStorage.removeItem('trek_chat_session');
          localStorage.removeItem('ama_chat_session');
          localStorage.setItem('trek_guest_session', newGuestSession);
        } catch {}
        setSessionId(newGuestSession);
        setMessages([
          {
            sender: 'bot',
            source: 'AI',
            text: t('Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?'),
            time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
          }
        ]);
      }
    }
  }, [currentUser, language, t]);

  // User profile avatar (allocated or custom)
  const userAvatar = currentUser?.avatar || getRandomAvatar(currentUser?.email || currentUser?.name || sessionId);

  // FAQs state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  // Tab switcher
  const handleTabChange = (tab: 'chat' | 'faqs') => {
    setActiveTab(tab);
  };

  // Initial welcome message in selected language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'bot',
          source: 'AI',
          text: t('Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?'),
          time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
        }
      ]);
    } else if (messages.length === 1 && messages[0].sender === 'bot') {
      setMessages([
        {
          ...messages[0],
          text: t('Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?'),
          time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
        }
      ]);
    }
  }, [language, t]);

  // Fetch past chat messages for the current isolated session
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams();
        params.set('sessionId', sessionId);
        if ((currentUser as any)?.id) params.set('userId', (currentUser as any).id);
        if (currentUser?.email) params.set('userEmail', currentUser.email);

        const res = await fetch(`/api/support/messages?${params.toString()}`);
        if (!isMounted) return;

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
          } else {
            // Fresh greeting for clean session or new user without prior history
            setMessages([
              {
                sender: 'bot',
                source: 'AI',
                text: t('Hello! Welcome to Trek Consultancy Forum Support. I am your intelligent assistant. How can I help you today?'),
                time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen, sessionId, (currentUser as any)?.id, currentUser?.email, language, t]);

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

  // Scroll chat smartly:
  // After AI answers, smoothly position the screen so the user reads from the beginning of the question and answer.
  // When the user sends a message, scroll to the bottom so they see their question & the loading spinner.
  const scrollToQuestion = (questionIndex: number) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const targetEl = document.getElementById(`chat-msg-${questionIndex}`);
    if (targetEl) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = targetEl.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop - 12;
      container.scrollTo({
        top: Math.max(0, relativeTop),
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (activeTab !== 'chat' || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    if (lastMsg?.sender === 'bot') {
      // Find the user question that prompted this bot response
      let questionIndex = -1;
      for (let i = messages.length - 2; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          questionIndex = i;
          break;
        }
      }

      if (questionIndex >= 0) {
        // Smoothly scroll down so the user's question is at the top of the screen
        // allowing them to read the answer from the very beginning
        const timer1 = setTimeout(() => scrollToQuestion(questionIndex), 60);
        const timer2 = setTimeout(() => scrollToQuestion(questionIndex), 180);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      } else {
        // Fallback for initial welcome greeting
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // When user sends a message, scroll to bottom to show their question and the loading indicator
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
      time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
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
          userName: currentUser?.name || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversation?.sessionId && data.conversation.sessionId !== sessionId) {
          setSessionId(data.conversation.sessionId);
        }
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            id: data.userMessage.id,
            sender: 'user',
            source: 'USER',
            text: data.userMessage.message,
            time: data.userMessage.time
          },
          {
            id: data.botReply.id,
            sender: 'bot',
            source: data.botReply.source || 'AI',
            text: data.botReply.message,
            time: data.botReply.time
          }
        ]);
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
            text: language === 'ar'
              ? 'شكراً لك! تم استلام رسالتك وسيتم مراجعتها من قبل فريق العمل.'
              : (language === 'bn' 
                ? 'ধন্যবাদ! আপনার বার্তাটি রেকর্ড করা হয়েছে। আমাদের টিম পর্যালোচনা করবে।' 
                : 'Thanks for your message! Our community engineers have been notified.'),
            time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          source: 'AI',
          text: language === 'ar'
            ? 'يوجد عطل مؤقت في الاتصال بالخادم. يرجى إعادة المحاولة بعد قليل.'
            : (language === 'bn' 
              ? 'সার্ভারে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' 
              : 'Connection retry. Please try again in a few moments.'),
          time: language === 'ar' ? 'الآن' : (language === 'bn' ? 'এইমাত্র' : 'Just now')
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle FAQ Ask AI
  const handleAskFaqToAi = (faq: FaqItem) => {
    const qText = language === 'bn' && faq.questionBn ? faq.questionBn : faq.question;
    handleTabChange('chat');
    handleSendMessage(undefined, qText);
  };

  return (
    <div
      id="floating-support-chat-modal"
      className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-20 sm:right-6 rtl:sm:right-auto rtl:sm:left-6 z-50 w-auto sm:w-[440px] md:w-[480px] max-h-[92dvh] sm:max-h-[85vh] h-[calc(100dvh-1rem)] sm:h-[640px] rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col text-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Top Header - Trek Brand Color */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#005a4e] via-[#006d5f] to-[#00a8b5] text-white border-b border-teal-700/40 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <img
              src={aiAvatar}
              alt="Trek Support Assistant"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              {t('Trek Support Assistant')}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
            aria-label="Close support modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-3 py-1.5 gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => handleTabChange('chat')}
          className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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
          onClick={() => handleTabChange('faqs')}
          className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'bg-white text-teal-700 font-bold shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t('FAQs & Knowledge')}</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: AI CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
          {/* Messages list */}
          <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 relative">
            {messages.map((m, i) => {
              const msgKey = m.id || `msg-${i}`;
              const isCopied = copiedMsgId === msgKey;

              return (
                <div
                  key={msgKey}
                  id={`chat-msg-${i}`}
                  data-sender={m.sender}
                  className={`flex items-start gap-2 sm:gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Avatar on Left */}
                  {m.sender === 'bot' && (
                    <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                      <img
                        src={aiAvatar}
                        alt="Trek AI Assistant"
                        className="w-full h-full object-contain filter drop-shadow-2xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[84%] sm:max-w-[82%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`w-full rounded-2xl p-3.5 text-xs leading-relaxed transition-all ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs ring-1 ring-slate-900/5'
                      }`}
                    >
                    {m.sender === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                    ) : (
                      <div className="space-y-2">
                        {/* Bot source header banner if RAG / Knowledge Base / Staff Resolution */}
                        {m.source && (m.source === 'STAFF' || m.text.includes('Senior Advisory & Support resolution') || m.text.includes('سفير الدعم وحل معتمد') || m.text.includes('সিনিয়র কনসালটেন্ট টিম কর্তৃক')) ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/90 border border-amber-200/60 text-amber-900 text-[11px] font-semibold mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{language === 'ar' ? 'استلم مسؤول تنفيذي أول استفسارك' : (language === 'bn' ? 'একজন সিনিয়র এক্সিকিউটিভ আপনার প্রশ্নের দায়িত্ব গ্রহণ করেছেন' : 'An Executive Senior has received your query')}</span>
                          </div>
                        ) : m.source && (m.source === 'RAG' || m.text.includes('From Knowledge Base') || m.text.includes('قاعدة المعرفة') || m.text.includes('নলেজ বেস')) ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/90 border border-teal-200/60 text-teal-800 text-[11px] font-semibold mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{language === 'ar' ? 'قاعدة المعرفة والوثائق المعتمدة' : (language === 'bn' ? 'নলেজ বেস ও ডকুমেন্টারি ডেটা' : 'Knowledge Base & Verified Docs')}</span>
                          </div>
                        ) : null}

                        {/* Rich Decorated Markdown Content */}
                        <div
                          className="markdown-content text-slate-800 leading-relaxed text-[12.5px]"
                          dir={/[\u0600-\u06FF]/.test(m.text) ? 'rtl' : 'ltr'}
                        >
                          <Markdown
                            components={{
                              h1: ({ children }) => (
                                <h3 className="text-[13.5px] font-bold text-slate-900 mt-2.5 mb-1.5 pb-1 border-b border-slate-200/80 flex items-center gap-1.5 tracking-tight font-heading">
                                  {children}
                                </h3>
                              ),
                              h2: ({ children }) => (
                                <h4 className="text-[13px] font-bold text-teal-900 mt-2 mb-1 flex items-center gap-1.5 tracking-tight font-heading">
                                  {children}
                                </h4>
                              ),
                              h3: ({ children }) => (
                                <h5 className="text-[12.5px] font-bold text-slate-900 mt-2 mb-1 tracking-tight">
                                  {children}
                                </h5>
                              ),
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 leading-[1.65] text-slate-700 text-[12.5px]">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-slate-950">
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="my-2.5 space-y-1.5 pl-0.5 list-none">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="my-2.5 space-y-1.5 pl-4 list-decimal text-slate-700 text-[12px] leading-relaxed">
                                  {children}
                                </ol>
                              ),
                              li: ({ children, ordered }: any) => {
                                if (ordered) {
                                  return (
                                    <li className="text-[12px] leading-relaxed text-slate-700 my-1 pl-1">
                                      {children}
                                    </li>
                                  );
                                }
                                return (
                                  <li className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-slate-700 my-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0 ring-3 ring-teal-100" />
                                    <span className="flex-1">{children}</span>
                                  </li>
                                );
                              },
                              hr: () => (
                                <hr className="my-3 border-t border-slate-200/80" />
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-[3px] border-teal-600 pl-3.5 py-1.5 my-2.5 bg-teal-50/70 rounded-r-xl text-slate-800 text-[11.5px] leading-relaxed shadow-2xs">
                                  {children}
                                </blockquote>
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
                              }
                            }}
                          >
                            {normalizeMarkdown(m.text)}
                          </Markdown>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message footer with source tag & quick copy */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{m.time}</span>
                    {m.sender === 'bot' && (
                      <>
                        {m.source && (
                          <span className={`px-1.5 py-0.2 rounded font-medium border ${
                            m.source === 'STAFF'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-slate-100 text-slate-600 border-slate-200/50'
                          }`}>
                            {m.source === 'FAQ'
                              ? t('FAQ Match')
                              : m.source === 'RAG'
                              ? t('Knowledge Base')
                              : m.source === 'STAFF'
                              ? (language === 'ar' ? 'مسؤول تنفيذي أول' : (language === 'bn' ? 'সিনিয়র এক্সিকিউটিভ' : 'Executive Senior'))
                              : t('AI Answer')}
                          </span>
                        )}

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

                {/* Individual User Avatar on Right */}
                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs mt-0.5 ring-1 ring-slate-900/10">
                    <img
                      src={userAvatar}
                      alt={currentUser?.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackAvatar(currentUser?.name || 'User');
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-start gap-2 sm:gap-2.5 animate-in fade-in duration-200">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                <img
                  src={aiAvatar}
                  alt="Trek AI Assistant"
                  className="w-full h-full object-contain filter drop-shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3 w-fit shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>{language === 'ar' ? 'المساعد الذكي يسترجع المعلومات...' : (language === 'bn' ? 'এআই উত্তর তৈরি করছে...' : 'AI Assistant is retrieving knowledge...')}</span>
              </div>
            </div>
          )}

            {/* Guest message limit prompt */}
            {hasReachedGuestLimit && (
              <div className="my-2 p-4 rounded-2xl bg-gradient-to-br from-teal-50 via-cyan-50/50 to-emerald-50 border border-teal-200/90 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? 'تم الوصول إلى الحد المسموح به للمعاينة المجانية' : (language === 'bn' ? 'ফ্রি মেসেজ লিমিট পূর্ণ হয়েছে' : 'Conversation Preview Limit Reached')}
                    </h5>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      {formatNumber(userMessagesCount)}/{formatNumber(GUEST_MESSAGE_LIMIT)} {language === 'ar' ? 'رسائل' : (language === 'bn' ? 'মেসেজ' : 'Messages')}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                    {language === 'ar'
                      ? 'لمواصلة المحادثة مع مساعد الدعم والحصول على إجابات غير محدودة، يرجى تسجيل الدخول أو إنشاء حساب جديد مجاناً.'
                      : (language === 'bn'
                        ? 'সাপোর্ট অ্যাসিস্ট্যান্টের সাথে আলোচনা চালিয়ে যেতে এবং আনলিমিটেড এআই সহায়তা পেতে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন অথবা সাইন ইন করুন।'
                        : 'To continue your conversation with our support assistant and unlock unlimited questions, please sign in or create a free account.')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRequireAuth?.()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إنشاء حساب أو تسجيل الدخول للمتابعة' : (language === 'bn' ? 'অ্যাকাউন্ট তৈরি / সাইন ইন করুন' : 'Sign Up or Sign In to Continue')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
                <div className="text-left rtl:text-right">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-900">
                    {language === 'ar' ? 'سجل الدخول أو أنشئ حساباً لمتابعة المحادثة' : (language === 'bn' ? 'কথোপকথন চালিয়ে যেতে সাইন আপ বা লগইন করুন' : 'Sign up or log in to continue chatting')}
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    {language === 'ar' ? 'انقر لفتح نافذة تسجيل الدخول أو إنشاء الحساب' : (language === 'bn' ? 'ক্লিক করলেই অ্যাকাউন্ট উইন্ডো খুলে যাবে' : 'Click to open the account registration & sign in window')}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-teal-600 group-hover:bg-teal-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0">
                  <span>{language === 'ar' ? 'دخول / تسجيل' : (language === 'bn' ? 'সাইন ইন / সাইন আপ' : 'Sign In / Up')}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder={t('Search knowledge base & FAQs...')}
              className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
              <span>{language === 'ar' ? 'جاري تحميل الأسئلة الشائعة والمعلومات...' : (language === 'bn' ? 'প্রশ্নোত্তর লোড হচ্ছে...' : 'Loading FAQs & Knowledge...')}</span>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200/80">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                {t('No matching articles or FAQs found.')}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{t('Ask AI Assistant')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const questionText = language === 'ar' && faq.questionAr ? faq.questionAr : (language === 'bn' && faq.questionBn ? faq.questionBn : faq.question);
                const answerText = language === 'ar' && faq.answerAr ? faq.answerAr : (language === 'bn' && faq.answerBn ? faq.answerBn : faq.answer);

                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full p-3.5 text-left rtl:text-right flex items-start justify-between gap-2 hover:bg-slate-50/80 transition-colors cursor-pointer"
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

    </div>
  );
};

