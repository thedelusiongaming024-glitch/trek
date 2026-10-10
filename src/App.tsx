import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ForumSection } from './components/ForumSection';
import { CalloutBanner } from './components/CalloutBanner';
import { BlogSection } from './components/BlogSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { PostQuestionModal } from './components/PostQuestionModal';
import { TopicDetailModal } from './components/TopicDetailModal';
import { EditTopicModal } from './components/EditTopicModal';
import { AuthModal } from './components/AuthModal';
import { BlogModal } from './components/BlogModal';
import { SupportChatModal } from './components/SupportChatModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLogin } from './components/admin/AdminLogin';
import { defaultAdminHeroSettings } from './components/admin/AdminHeroTab';
import trekSaudiBg from './assets/trek-saudi-bg.png';
import { useLanguage } from './context/LanguageContext';
import { normalizeUrl } from './utils/url';
import { 
  ForumTopic, 
  FilterCategory, 
  BlogPost, 
  AdminUser, 
  ActivityLog, 
  PlatformSettings,
  HeroSettings,
  SEOSettings,
  RecentTopic,
  RecentReply,
  DiscussionCategory,
  StaffRoleBadge,
  isAdministrativeRole
} from './types';
import { defaultSeoSettings, applySeoToDocument } from './utils/seo';
import { getRandomAvatar } from './utils/avatar';

export default function App() {
  const { language, t } = useLanguage();
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  
  // Real Database State (starts empty, populated from PostgreSQL)
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    forumName: 'Trek Consultancy Forum',
    forumTagline: 'The official community forum and support portal for Trek Consultancy',
    enableGuestPosting: true,
    enableAutoModeration: true,
    announcementText: '',
    showAnnouncement: false,
    primarySupportEmail: 'support@trekconsultancy.com',
    slaHours: 24
  });

  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultAdminHeroSettings);
  const [discussionCategories, setDiscussionCategories] = useState<DiscussionCategory[]>([]);
  const [staffRoles, setStaffRoles] = useState<StaffRoleBadge[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(defaultSeoSettings);

  const [isLoadingData, setIsLoadingData] = useState(true);

  // Client-Side Routing State (/ or /admin)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Community User Authentication State
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string; role: string; avatar?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('trek_current_user') || localStorage.getItem('ama_current_user');
      if (saved) return JSON.parse(saved);
      // Auto-sync: If admin credentials exist, automatically initialize currentUser as well
      const adminSaved = localStorage.getItem('trek_admin_auth') || localStorage.getItem('ama_admin_auth');
      if (adminSaved) return JSON.parse(adminSaved);
      return null;
    } catch {
      return null;
    }
  });

  // Admin Authentication State
  const [adminAuthUser, setAdminAuthUser] = useState<{ id?: string; name: string; email: string; role: string; avatar?: string } | null>(() => {
    try {
      const adminSaved = localStorage.getItem('trek_admin_auth') || localStorage.getItem('ama_admin_auth');
      if (adminSaved) return JSON.parse(adminSaved);
      // Auto-sync: If currentUser has an administrative role, automatically initialize adminAuthUser as well
      const userSaved = localStorage.getItem('trek_current_user') || localStorage.getItem('ama_current_user');
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (parsed && isAdministrativeRole(parsed.role)) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Bi-directional synchronization between Admin Portal and User Portal
  useEffect(() => {
    if (adminAuthUser) {
      if (!currentUser || currentUser.email.toLowerCase() !== adminAuthUser.email.toLowerCase()) {
        const fullUser = {
          id: adminAuthUser.id || currentUser?.id || 'usr-admin',
          name: adminAuthUser.name,
          email: adminAuthUser.email,
          role: adminAuthUser.role,
          avatar: adminAuthUser.avatar || currentUser?.avatar || getRandomAvatar(adminAuthUser.email || adminAuthUser.name)
        };
        setCurrentUser(fullUser);
        try {
          localStorage.setItem('trek_current_user', JSON.stringify(fullUser));
        } catch {
          // ignore
        }
      }
    } else if (currentUser && isAdministrativeRole(currentUser.role)) {
      const adminData = {
        id: currentUser.id || 'usr-admin',
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        avatar: currentUser.avatar || getRandomAvatar(currentUser.email || currentUser.name)
      };
      setAdminAuthUser(adminData);
      try {
        localStorage.setItem('trek_admin_auth', JSON.stringify(adminData));
      } catch {
        // ignore
      }
    }
  }, [adminAuthUser, currentUser]);

  // Track topics created locally by this browser user
  const [myCreatedTopicIds, setMyCreatedTopicIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trek_my_created_topics') || localStorage.getItem('ama_my_created_topics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent tracking of liked topics and replies for this browser session
  const [likedTopicIds, setLikedTopicIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trek_liked_topics') || localStorage.getItem('ama_liked_topics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedReplyIds, setLikedReplyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trek_liked_replies') || localStorage.getItem('ama_liked_replies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Deduplicate topic view increments per session
  const viewedTopicsRef = useRef<Set<string>>(new Set());

  // Determine if the current user has administrative permissions
  const isUserAdmin = Boolean(
    adminAuthUser ||
    isAdministrativeRole(currentUser?.role)
  );

  // Check if current user is the author of a given topic
  const isTopicAuthor = useCallback((topic: ForumTopic): boolean => {
    if (!topic) return false;
    // Checked against local session creations
    if (myCreatedTopicIds.includes(topic.id)) return true;

    // Checked against logged-in community user
    if (currentUser) {
      if (topic.authorEmail && currentUser.email && topic.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        return true;
      }
      if (topic.authorId && currentUser.id && topic.authorId === currentUser.id) {
        return true;
      }
      if (topic.author && currentUser.name && topic.author.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) {
        return true;
      }
    }

    // Checked against logged-in admin
    if (adminAuthUser) {
      if (topic.authorEmail && adminAuthUser.email && topic.authorEmail.toLowerCase() === adminAuthUser.email.toLowerCase()) {
        return true;
      }
      if (topic.author && adminAuthUser.name && topic.author.toLowerCase().trim() === adminAuthUser.name.toLowerCase().trim()) {
        return true;
      }
    }

    return false;
  }, [myCreatedTopicIds, currentUser, adminAuthUser]);

  // Authorization check: only admin and the author can delete
  const canDeleteTopic = useCallback((topic: ForumTopic): boolean => {
    return isUserAdmin || isTopicAuthor(topic);
  }, [isUserAdmin, isTopicAuthor]);

  // Authorization check: only admin and the author can edit
  const canEditTopic = useCallback((topic: ForumTopic): boolean => {
    return isUserAdmin || isTopicAuthor(topic);
  }, [isUserAdmin, isTopicAuthor]);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 3000);
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom client router navigator
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch initial data from PostgreSQL
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Each endpoint's failure is logged with its real status/body instead
      // of being silently converted to an empty array — that masking is
      // exactly what hid the original "DB connected but no data shows" bug,
      // just on the frontend side of the same anti-pattern we fixed in the
      // API layer.
      const safeFetch = async (url: string, fallback: any) => {
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          console.error(`[fetchData] ${url} failed with ${res.status}: ${body}`);
          return fallback;
        }
        return res.json();
      };

      const [topicsRes, blogsRes, usersRes, logsRes, settingsRes, heroRes, discMetaRes, seoRes] = await Promise.allSettled([
        safeFetch('/api/topics', []),
        safeFetch('/api/blogs', []),
        safeFetch('/api/users', []),
        safeFetch('/api/activity-logs', []),
        safeFetch('/api/settings', null),
        safeFetch('/api/hero', null),
        safeFetch('/api/discussion/meta', { categories: [], staffRoles: [] }),
        safeFetch('/api/seo', null)
      ]);

      if (topicsRes.status === 'fulfilled' && Array.isArray(topicsRes.value)) {
        let rawLikedTopics: string[] = [];
        let rawLikedReplies: string[] = [];
        try {
          rawLikedTopics = JSON.parse(localStorage.getItem('trek_liked_topics') || localStorage.getItem('ama_liked_topics') || '[]');
        } catch {}
        try {
          rawLikedReplies = JSON.parse(localStorage.getItem('trek_liked_replies') || localStorage.getItem('ama_liked_replies') || '[]');
        } catch {}
        const likedTopicsSet = new Set(rawLikedTopics);
        const likedRepliesSet = new Set(rawLikedReplies);

        const mappedTopics: ForumTopic[] = topicsRes.value.map((t: any) => {
          const repList = Array.isArray(t.repliesList)
            ? t.repliesList.map((r: any) => ({
                ...r,
                isLiked: likedRepliesSet.has(r.id),
                likes: Number(r.likes || 0)
              }))
            : [];
          return {
            ...t,
            isLiked: likedTopicsSet.has(t.id),
            likes: Number(t.likes || 0),
            views: Number(t.views || 0),
            replies: repList.length,
            repliesList: repList
          };
        });
        setTopics(mappedTopics);
      } else if (topicsRes.status === 'rejected') {
        console.error('[fetchData] /api/topics threw:', topicsRes.reason);
      }
      if (blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value)) {
        setBlogPosts(blogsRes.value);
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setAdminUsers(usersRes.value);
      }
      if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value)) {
        setActivityLogs(logsRes.value);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setPlatformSettings(settingsRes.value);
      }
      if (seoRes.status === 'fulfilled' && seoRes.value) {
        setSeoSettings(prev => ({ ...prev, ...seoRes.value }));
      }
      if (heroRes.status === 'fulfilled' && heroRes.value) {
        const val = heroRes.value;
        if (val.slides && val.slides.length > 0) {
          setHeroSettings(val);
        } else {
          setHeroSettings({
            ...defaultAdminHeroSettings,
            ...val,
            slides: defaultAdminHeroSettings.slides
          });
        }
      }
      if (discMetaRes.status === 'fulfilled' && discMetaRes.value) {
        if (Array.isArray(discMetaRes.value.categories)) {
          setDiscussionCategories(discMetaRes.value.categories);
        }
        if (Array.isArray(discMetaRes.value.staffRoles)) {
          setStaffRoles(discMetaRes.value.staffRoles);
        }
      }
    } catch (err) {
      console.error('Error fetching database records:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamically synchronize document head tags with SEO configuration
  useEffect(() => {
    applySeoToDocument(seoSettings);
  }, [seoSettings]);

  const handleAdminLogin = (user: { id?: string; name: string; email: string; role: string; avatar?: string }) => {
    const fullUser = {
      id: user.id || 'usr-admin',
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || getRandomAvatar(user.email || user.name)
    };
    setAdminAuthUser(fullUser);
    setCurrentUser(fullUser);
    try {
      localStorage.setItem('trek_admin_auth', JSON.stringify(fullUser));
      localStorage.setItem('trek_current_user', JSON.stringify(fullUser));

      // Claim and migrate any active guest chat session to this user account
      const activeChatSession = localStorage.getItem('trek_chat_session') || localStorage.getItem('ama_chat_session');
      if (activeChatSession && fullUser.email) {
        fetch('/api/support/conversations/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: activeChatSession,
            userId: fullUser.id,
            userEmail: fullUser.email,
            userName: fullUser.name
          })
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
    showToast(language === 'ar' ? `مرحباً بعودتك، ${user.name}! تم تسجيل الدخول إلى بوابتي الإدارة والمجتمع.` : (language === 'bn' ? `স্বাগতম, ${user.name}! অ্যাডমিন ও কমিউনিটি উভয় পোর্টালে সংযুক্ত।` : `Welcome back, ${user.name}! Logged into both Admin & Community portals.`));
  };

  const handleAdminLogout = () => {
    setAdminAuthUser(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('trek_admin_auth');
      localStorage.removeItem('ama_admin_auth');
      localStorage.removeItem('trek_current_user');
      localStorage.removeItem('ama_current_user');
      localStorage.removeItem('trek_chat_session');
      localStorage.removeItem('ama_chat_session');
      localStorage.removeItem('trek_guest_session');
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
    showToast(language === 'ar' ? 'تم تسجيل الخروج من بوابتي الإدارة والمجتمع بنجاح.' : (language === 'bn' ? 'অ্যাডমিন ও কমিউনিটি উভয় পোর্টাল থেকেই সাইন আউট সম্পন্ন।' : 'Signed out of both Administrator and Community portals.'));
  };

  const handleUserAuthSuccess = (user: { id?: string; name: string; email: string; role: string; avatar?: string }) => {
    setIsAuthModalOpen(false);
    const fullUser = {
      id: user.id || `usr-${Date.now()}`,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || getRandomAvatar(user.email || user.name)
    };
    setCurrentUser(fullUser);
    try {
      localStorage.setItem('trek_current_user', JSON.stringify(fullUser));
      if (isAdministrativeRole(user.role)) {
        setAdminAuthUser(fullUser);
        localStorage.setItem('trek_admin_auth', JSON.stringify(fullUser));
      } else {
        setAdminAuthUser(null);
        localStorage.removeItem('trek_admin_auth');
        localStorage.removeItem('ama_admin_auth');
      }

      // Claim and migrate any active guest chat session to this user account
      const activeChatSession = localStorage.getItem('trek_chat_session') || localStorage.getItem('ama_chat_session');
      if (activeChatSession && fullUser.email) {
        fetch('/api/support/conversations/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: activeChatSession,
            userId: fullUser.id,
            userEmail: fullUser.email,
            userName: fullUser.name
          })
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
    const welcomeMsg = isAdministrativeRole(user.role)
      ? (language === 'ar' ? `مرحباً بك، ${user.name}! تم تسجيل الدخول إلى بوابتي المجتمع والإدارة.` : (language === 'bn' ? `স্বাগতম, ${user.name}! অ্যাডমিন ও কমিউনিটি উভয় পোর্টালে সংযুক্ত।` : `Welcome, ${user.name}! Logged into both Community & Admin portals.`))
      : (language === 'ar' ? `مرحباً بك، ${user.name}! تم تسجيل الدخول إلى المجتمع بنجاح.` : (language === 'bn' ? `স্বাগতম, ${user.name}! কমিউনিটিতে লগইন সম্পন্ন।` : `Welcome, ${user.name}! Logged into community.`));
    showToast(welcomeMsg);

    // Fulfill any queued action that required auth
    if (pendingAuthAction) {
      if (pendingAuthAction.type === 'create_topic') {
        setIsPostModalOpen(true);
      } else if (pendingAuthAction.type === 'view_blog') {
        setSelectedBlog(pendingAuthAction.blog);
        setIsBlogModalOpen(true);
      }
      setPendingAuthAction(null);
    }
    setAuthPromptMessage(undefined);
  };

  const triggerAuthModal = (prompt?: string, tab: 'login' | 'register' = 'login') => {
    setAuthPromptMessage(prompt);
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleOpenPostQuestion = () => {
    if (!currentUser) {
      setPendingAuthAction({ type: 'create_topic' });
      triggerAuthModal(
        language === 'ar'
          ? 'لإنشاء موضوع وطرح الأسئلة في المنتدى، يجب أن يكون لديك حساب وتسجيل الدخول أولاً.'
          : (language === 'bn'
            ? 'ফোরামে একটি টপিক তৈরি ও প্রশ্ন পোস্ট করতে, আপনার একটি অ্যাকাউন্ট থাকতে হবে এবং লগইন করতে হবে।'
            : 'To create a topic and post questions in the forum, you must have an account and be logged in.'),
        'login'
      );
      showToast(language === 'ar' ? 'يرجى تسجيل الدخول أو إنشاء حساب لإنشاء موضوع جديد.' : (language === 'bn' ? 'টপিক তৈরি করতে অনুগ্রহ করে লগইন বা সাইন আপ করুন।' : 'Please log in or sign up to create a topic.'));
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleSignOut = (keepAuthModalOpen: boolean = false) => {
    if (!keepAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
    setCurrentUser(null);
    setAdminAuthUser(null);
    try {
      localStorage.removeItem('trek_current_user');
      localStorage.removeItem('ama_current_user');
      localStorage.removeItem('trek_admin_auth');
      localStorage.removeItem('ama_admin_auth');
      localStorage.removeItem('trek_chat_session');
      localStorage.removeItem('ama_chat_session');
      localStorage.removeItem('trek_guest_session');
    } catch {
      // ignore
    }
    showToast(language === 'ar' ? 'تم تسجيل الخروج من منتدى تريك للاستشارات بنجاح.' : (language === 'bn' ? 'ট্রেক কনসালটেন্সি ফোরাম থেকে লগআউট সম্পন্ন।' : 'Signed out of Trek Consultancy Forum.'));
  };

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(undefined);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [pendingAuthAction, setPendingAuthAction] = useState<
    | { type: 'create_topic' }
    | { type: 'view_blog'; blog: BlogPost }
    | null
  >(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Delete Post Confirmation State
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  // Edit Post Modal State
  const [topicToEdit, setTopicToEdit] = useState<ForumTopic | null>(null);

  // Dynamic Recent Topics & Replies derived from real PostgreSQL data
  const recentTopics: RecentTopic[] = useMemo(() => {
    const sorted = [...topics].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return sorted.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      author: t.author,
      timeAgo: t.timeAgo,
      createdAt: t.createdAt
    }));
  }, [topics]);

  const recentReplies: RecentReply[] = useMemo(() => {
    const allReplies: RecentReply[] = [];
    for (const topic of topics) {
      if (topic.repliesList && topic.repliesList.length > 0) {
        for (const rep of topic.repliesList) {
          allReplies.push({
            id: rep.id,
            author: rep.author,
            topicTitle: topic.title,
            timeAgo: rep.timeAgo,
            createdAt: rep.createdAt
          });
        }
      }
    }
    allReplies.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return allReplies.slice(0, 5);
  }, [topics]);

  // Admin Action Handlers connected to PostgreSQL API
  const handleAdminAddTopic = async (newTopicData: ForumTopic) => {
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopicData)
      });
      if (!res.ok) {
        throw new Error('Failed to create topic in database');
      }
      const saved = await res.json();
      setTopics(prev => [saved, ...prev]);
      if (saved.id) {
        setMyCreatedTopicIds(prev => {
          const updated = [saved.id, ...prev];
          try {
            localStorage.setItem('trek_my_created_topics', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
      showToast(language === 'ar' ? `تم نشر المناقشة "${saved.title.slice(0, 30)}..." وحفظها بنجاح!` : (language === 'bn' ? `আলোচনা "${saved.title.slice(0, 30)}..." প্রকাশিত ও ডাটাবেজে সংরক্ষিত হয়েছে!` : `Discussion "${saved.title.slice(0, 30)}..." published and saved to database!`));
    } catch (err) {
      console.error('Failed to add admin topic to database:', err);
      showToast(language === 'ar' ? 'حدث خطأ أثناء حفظ المناقشة في قاعدة البيانات.' : (language === 'bn' ? 'ডাটাবেজে আলোচনা সংরক্ষণে ত্রুটি হয়েছে।' : 'Error saving discussion to database.'));
    }
  };

  const handleAdminDeleteTopic = async (id: string) => {
    const userEmail = adminAuthUser?.email || currentUser?.email || 'admin@trekconsultancy.com';
    const userRole = adminAuthUser?.role || currentUser?.role || 'Super Admin';
    try {
      await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-email': userEmail
        },
        body: JSON.stringify({ userEmail, userRole })
      });
    } catch (e) {
      console.error(e);
    }
    setTopics(prev => prev.filter(t => t.id !== id));
    setMyCreatedTopicIds(prev => {
      const updated = prev.filter(tid => tid !== id);
      try {
        localStorage.setItem('trek_my_created_topics', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(language === 'ar' ? 'تمت إزالة الموضوع نهائياً من المناقشات.' : (language === 'bn' ? 'টপিকটি ফোরাম থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে।' : 'Topic permanently removed from discussions.'));
  };

  // Normal Confirmation Delete Handler for Forum Topics (Restricted to author and admin)
  const handleConfirmDeleteTopic = async () => {
    if (!topicToDelete) return;

    if (!canDeleteTopic(topicToDelete)) {
      showToast(
        language === 'ar'
          ? 'تم رفض الإذن: المشرف أو كاتب الموضوع فقط يمكنه حذف هذا المنشور.'
          : (language === 'bn'
            ? 'অনুমতি অস্বীকৃত: শুধুমাত্র অ্যাডমিনিস্ট্রেটর বা যিনি পোস্ট করেছেন তিনি এটি মুছতে পারবেন।'
            : 'Permission denied: Only the administrator or the author who posted can delete this post.')
      );
      setTopicToDelete(null);
      return;
    }

    setIsDeletingTopic(true);
    const userEmail = currentUser?.email || adminAuthUser?.email || '';
    const userRole = currentUser?.role || adminAuthUser?.role || '';
    const userName = currentUser?.name || adminAuthUser?.name || '';
    const userId = currentUser?.id || '';

    try {
      const res = await fetch(`/api/topics/${topicToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'x-user-role': userRole,
          'x-user-name': userName,
          'x-user-id': userId
        },
        body: JSON.stringify({ userEmail, userRole, userName, userId })
      });

      if (res.status === 403) {
        showToast(
          language === 'ar'
            ? 'تم رفض الإذن: المشرف أو كاتب الموضوع فقط يمكنه حذف هذا المنشور.'
            : (language === 'bn'
              ? 'অনুমতি অস্বীকৃত: শুধুমাত্র অ্যাডমিনিস্ট্রেটর বা যিনি পোস্ট করেছেন তিনি এটি মুছতে পারবেন।'
              : 'Permission denied: Only the administrator or the person who posted can delete this post.')
        );
        setIsDeletingTopic(false);
        setTopicToDelete(null);
        return;
      }

      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
      setMyCreatedTopicIds((prev) => {
        const updated = prev.filter((id) => id !== topicToDelete.id);
        try {
          localStorage.setItem('trek_my_created_topics', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (selectedTopic?.id === topicToDelete.id) {
        setIsTopicModalOpen(false);
        setSelectedTopic(null);
      }
      showToast(
        language === 'ar'
          ? `تم حذف المنشور "${topicToDelete.title.slice(0, 30)}..." بنجاح.`
          : (language === 'bn'
            ? `পোস্ট "${topicToDelete.title.slice(0, 30)}..." সফলভাবে মুছে ফেলা হয়েছে।`
            : `Post "${topicToDelete.title.slice(0, 30)}..." deleted successfully.`)
      );
    } catch (err) {
      console.error('Failed to delete topic:', err);
      showToast(
        language === 'ar'
          ? 'حدث خطأ أثناء حذف المنشور. يرجى المحاولة مرة أخرى.'
          : (language === 'bn'
            ? 'পোস্ট মুছতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Error deleting post. Please try again.')
      );
    } finally {
      setIsDeletingTopic(false);
      setTopicToDelete(null);
    }
  };

  // Topic Edit Handler (Restricted to author and admin)
  const handleUpdateTopic = async (updatedData: {
    id: string;
    title: string;
    category: string;
    categorySlug?: string;
    content: string;
  }) => {
    const target = topics.find((t) => t.id === updatedData.id);
    if (!target) return;

    if (!canEditTopic(target)) {
      showToast(
        language === 'ar'
          ? 'تم رفض الإذن: المشرفون أو كاتب الموضوع فقط يمكنهم تعديل هذه المناقشة.'
          : (language === 'bn'
            ? 'অনুমতি অস্বীকৃত: শুধুমাত্র অ্যাডমিনিস্ট্রেটর বা যিনি পোস্ট করেছেন তিনি এটি সম্পাদনা করতে পারবেন।'
            : 'Permission denied: Only administrators and the author who posted this discussion can edit it.')
      );
      return;
    }

    const userEmail = currentUser?.email || adminAuthUser?.email || '';
    const userRole = isUserAdmin ? 'Super Admin' : (currentUser?.role || adminAuthUser?.role || 'Member');
    const userName = currentUser?.name || adminAuthUser?.name || '';
    const userId = currentUser?.id || '';

    try {
      const res = await fetch(`/api/topics/${updatedData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'x-user-role': userRole,
          'x-user-name': userName,
          'x-user-id': userId
        },
        body: JSON.stringify({
          ...updatedData,
          userEmail,
          userRole,
          userName,
          userId
        })
      });

      if (res.status === 403) {
        showToast(
          language === 'ar'
            ? 'تم رفض الإذن: المشرفون أو كاتب الموضوع فقط يمكنهم تعديل هذه المناقشة.'
            : (language === 'bn'
              ? 'অনুমতি অস্বীকৃত: শুধুমাত্র অ্যাডমিনিস্ট্রেটর বা যিনি পোস্ট করেছেন তিনি এটি সম্পাদনা করতে পারবেন।'
              : 'Permission denied: Only administrators and the author who posted this discussion can edit it.')
        );
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to update discussion topic');
      }

      const updatedTopic: ForumTopic = await res.json();
      setTopics((prev) =>
        prev.map((t) => (t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t))
      );

      if (selectedTopic && selectedTopic.id === updatedTopic.id) {
        setSelectedTopic((prev) => (prev ? { ...prev, ...updatedTopic } : null));
      }

      showToast(
        language === 'ar'
          ? `تم تحديث المناقشة "${updatedTopic.title.slice(0, 30)}..." بنجاح.`
          : (language === 'bn'
            ? `আলোচনা "${updatedTopic.title.slice(0, 30)}..." সফলভাবে আপডেট করা হয়েছে।`
            : `Discussion "${updatedTopic.title.slice(0, 30)}..." updated successfully.`)
      );
    } catch (err: any) {
      console.error('Failed to update topic:', err);
      showToast(
        language === 'ar'
          ? 'حدث خطأ أثناء تحديث المنشور. يرجى المحاولة مرة أخرى.'
          : (language === 'bn'
            ? 'পোস্ট আপডেট করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Error updating post. Please try again.')
      );
      throw err;
    }
  };

  const handleAdminToggleFeature = async (id: string) => {
    try {
      const res = await fetch(`/api/topics/${id}/feature`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTopics(prev => prev.map(t => t.id === id ? { ...t, isFeatured: data.isFeatured } : t));
      } else {
        setTopics(prev => prev.map(t => t.id === id ? { ...t, isFeatured: !t.isFeatured } : t));
      }
    } catch {
      setTopics(prev => prev.map(t => t.id === id ? { ...t, isFeatured: !t.isFeatured } : t));
    }
    showToast(language === 'ar' ? 'تم تحديث حالة تثبيت الموضوع.' : (language === 'bn' ? 'টপিক পিন স্ট্যাটাস আপডেট হয়েছে।' : 'Topic pin status updated.'));
  };

  const handleAdminTogglePopular = async (id: string) => {
    try {
      const res = await fetch(`/api/topics/${id}/popular`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTopics(prev => prev.map(t => t.id === id ? { ...t, isPopular: data.isPopular } : t));
      } else {
        setTopics(prev => prev.map(t => t.id === id ? { ...t, isPopular: !t.isPopular } : t));
      }
    } catch {
      setTopics(prev => prev.map(t => t.id === id ? { ...t, isPopular: !t.isPopular } : t));
    }
    showToast(language === 'ar' ? 'تم تحديث حالة رواج الموضوع.' : (language === 'bn' ? 'টপিকের জনপ্রিয়তা স্ট্যাটাস আপডেট হয়েছে।' : 'Topic popularity status updated.'));
  };

  const handleAddDiscussionCategory = async (categoryData: { name: string; description?: string }) => {
    try {
      const res = await fetch('/api/discussion/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      if (!res.ok) {
        throw new Error('Failed to create category');
      }
      const newCat: DiscussionCategory = await res.json();
      setDiscussionCategories((prev) => {
        const filtered = prev.filter(
          (c) => c.name.toLowerCase() !== newCat.name.toLowerCase()
        );
        return [...filtered, newCat];
      });
      showToast(
        language === 'ar'
          ? `تم إنشاء التصنيف "${newCat.name}" بنجاح!`
          : (language === 'bn'
            ? `ক্যাটাগরি "${newCat.name}" সফলভাবে যোগ করা হয়েছে!`
            : `Category "${newCat.name}" created successfully!`)
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        language === 'ar'
          ? 'فشل إنشاء التصنيف.'
          : (language === 'bn'
            ? 'ক্যাটাগরি তৈরিতে সমস্যা হয়েছে।'
            : 'Failed to create category.')
      );
    }
  };

  const handleDeleteDiscussionCategory = async (idOrName: string) => {
    try {
      const res = await fetch(`/api/discussion/categories/${encodeURIComponent(idOrName)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete category');
      }
      setDiscussionCategories((prev) =>
        prev.filter((c) => c.id !== idOrName && c.name !== idOrName && c.slug !== idOrName)
      );
      showToast(
        language === 'ar'
          ? 'تم حذف التصنيف بنجاح.'
          : (language === 'bn'
            ? 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।'
            : 'Category deleted successfully.')
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        language === 'ar'
          ? 'فشل حذف التصنيف.'
          : (language === 'bn'
            ? 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।'
            : 'Failed to delete category.')
      );
    }
  };

  const handleAddStaffRole = async (roleData: { name: string; badgeLabel?: string; color?: string }) => {
    try {
      const res = await fetch('/api/discussion/staff-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });
      if (!res.ok) {
        throw new Error('Failed to create staff role');
      }
      const newRole: StaffRoleBadge = await res.json();
      setStaffRoles((prev) => {
        const filtered = prev.filter(
          (r) => r.name.toLowerCase() !== newRole.name.toLowerCase()
        );
        return [...filtered, newRole];
      });
      showToast(
        language === 'ar'
          ? `تم إنشاء رتبة الفريق "${newRole.name}" بنجاح!`
          : (language === 'bn'
            ? `স্টাফ পদবী "${newRole.name}" সফলভাবে তৈরি হয়েছে!`
            : `Staff role "${newRole.name}" created successfully!`)
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        language === 'ar'
          ? 'فشل إنشاء رتبة الفريق.'
          : (language === 'bn'
            ? 'স্টাফ ব্যাজ তৈরিতে সমস্যা হয়েছে।'
            : 'Failed to create staff role.')
      );
    }
  };

  const handleDeleteStaffRole = async (idOrName: string) => {
    try {
      const res = await fetch(`/api/discussion/staff-roles/${encodeURIComponent(idOrName)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete staff role');
      }
      setStaffRoles((prev) =>
        prev.filter((r) => r.id !== idOrName && r.name !== idOrName)
      );
      showToast(
        language === 'ar'
          ? 'تمت إزالة رتبة الفريق بنجاح.'
          : (language === 'bn'
            ? 'স্টাফ ব্যাজ মুছে ফেলা হয়েছে।'
            : 'Staff role removed successfully.')
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        language === 'ar'
          ? 'فشل حذف رتبة الفريق.'
          : (language === 'bn'
            ? 'স্টাফ ব্যাজ মুছতে ব্যর্থ হয়েছে।'
            : 'Failed to delete staff role.')
      );
    }
  };

  const handleAdminAddBlog = async (newBlog: BlogPost) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlog)
      });
      if (res.ok) {
        const saved = await res.json();
        setBlogPosts(prev => [saved, ...prev]);
        showToast(
          language === 'ar'
            ? `تم نشر المقال "${saved.title.slice(0, 30)}..." في الرؤى والتحليلات بنجاح!`
            : (language === 'bn'
              ? `নিবন্ধ "${saved.title.slice(0, 30)}..." সফলভাবে প্রকাশিত হয়েছে!`
              : `Article "${saved.title.slice(0, 30)}..." published to knowledge base!`)
        );
      } else {
        setBlogPosts(prev => [newBlog, ...prev]);
      }
    } catch {
      setBlogPosts(prev => [newBlog, ...prev]);
    }
  };

  const handleAdminDeleteBlog = async (id: string) => {
    try {
      await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setBlogPosts(prev => prev.filter(b => b.id !== id));
    showToast(
      language === 'ar'
        ? 'تمت إزالة المقال من الرؤى والتحليلات.'
        : (language === 'bn'
          ? 'নিবন্ধটি ইনসাইটস থেকে মুছে ফেলা হয়েছে।'
          : 'Article removed from knowledge base.')
    );
  };

  const handleAdminUpdateBlog = async (updatedBlog: BlogPost) => {
    try {
      const res = await fetch(`/api/blogs/${updatedBlog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBlog)
      });
      if (!res.ok) {
        throw new Error('Failed to update article in database');
      }
      const saved: BlogPost = await res.json();
      const normalizedSaved: BlogPost = {
        ...saved,
        redirectUrl: saved.redirectUrl || ''
      };
      setBlogPosts((prev) =>
        prev.map((b) => (b.id === normalizedSaved.id ? { ...b, ...normalizedSaved } : b))
      );
      if (selectedBlog && selectedBlog.id === normalizedSaved.id) {
        setSelectedBlog((prev) => (prev ? { ...prev, ...normalizedSaved } : null));
      }
      showToast(
        language === 'ar'
          ? `تم تحديث المقال "${saved.title.slice(0, 30)}..." بنجاح!`
          : (language === 'bn'
            ? `আর্টিকেল "${saved.title.slice(0, 30)}..." সফলভাবে আপডেট করা হয়েছে!`
            : `Article "${saved.title.slice(0, 30)}..." updated successfully!`)
      );
    } catch (err: any) {
      console.error('Failed to update blog article:', err);
      showToast(
        language === 'ar'
          ? 'فشل تحديث المقال.'
          : (language === 'bn'
            ? 'আর্টিকেল আপডেট করতে সমস্যা হয়েছে।'
            : 'Failed to update article.')
      );
      throw err;
    }
  };

  const handleUpdateUserRole = async (id: string, role: AdminUser['role']) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    } catch (e) {
      console.error(e);
    }
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    showToast(language === 'ar' ? `تم تحديث دور المستخدم إلى ${role}.` : (language === 'bn' ? `ব্যবহারকারীর রোল ${role} এ আপডেট করা হয়েছে।` : `User role updated to ${role}.`));
  };

  const handleToggleUserStatus = async (id: string) => {
    const user = adminUsers.find(u => u.id === id);
    if (!user) return;
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {
      console.error(e);
    }
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    showToast(language === 'ar' ? `تم تعيين حالة المستخدم إلى ${nextStatus === 'active' ? 'نشط' : 'معلّق'}.` : (language === 'bn' ? `ব্যবহারকারীকে ${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।` : `User marked as ${nextStatus}.`));
  };

  const handleAddUser = async (newUser: AdminUser) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        const saved = await res.json();
        setAdminUsers(prev => [...prev, saved]);
        showToast(language === 'ar' ? `تم تسجيل دعوة الفريق لـ ${saved.name}.` : (language === 'bn' ? `${saved.name}-এর জন্য স্টাফ আমন্ত্রণ নিবন্ধিত হয়েছে।` : `Staff invitation registered for ${saved.name}.`));
      } else {
        setAdminUsers(prev => [...prev, newUser]);
      }
    } catch {
      setAdminUsers(prev => [...prev, newUser]);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setAdminUsers(prev => prev.filter(u => u.id !== id));
    showToast(language === 'ar' ? 'تم حذف حساب المستخدم.' : (language === 'bn' ? 'ব্যবহারকারী একাউন্ট মুছে ফেলা হয়েছে।' : 'User account deleted.'));
  };

  const handleSaveSettings = async (newSettings: PlatformSettings) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {
      console.error(e);
    }
    setPlatformSettings(newSettings);
    showToast(language === 'ar' ? 'تم حفظ إعدادات المنصة بنجاح.' : (language === 'bn' ? 'প্ল্যাটফর্ম সেটিংস সংরক্ষিত হয়েছে।' : 'Platform settings saved.'));
  };

  const handleSaveHeroSettings = async (newHeroSettings: HeroSettings) => {
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHeroSettings)
      });
      if (!res.ok) {
        throw new Error(`Failed to save hero settings: ${res.statusText}`);
      }
      const saved = await res.json();
      setHeroSettings(saved.hero || saved);
      showToast(language === 'ar' ? 'تم تحديث ومزامنة إعدادات العرض الرئيسية بنجاح!' : (language === 'bn' ? 'হিরো স্লাইডশো সেটিংস ডাটাবেজে সংরক্ষিত হয়েছে!' : 'Hero slideshow settings updated & synced with database!'));
    } catch (e) {
      console.error('Failed to save hero settings:', e);
      showToast(language === 'ar' ? 'حدث خطأ أثناء حفظ إعدادات العرض الرئيسية.' : (language === 'bn' ? 'হিরো স্লাইডশো সেটিংস সংরক্ষণে ত্রুটি।' : 'Error saving hero slideshow settings.'));
    }
  };

  const handleSaveSeoSettings = async (newSeoSettings: SEOSettings) => {
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeoSettings)
      });
      if (!res.ok) {
        throw new Error(`Failed to save SEO settings: ${res.statusText}`);
      }
      const saved = await res.json();
      setSeoSettings(saved.seo || newSeoSettings);
      showToast(language === 'ar' ? 'تم تحديث ومزامنة إعدادات تحسين محركات البحث (SEO) بنجاح!' : (language === 'bn' ? 'এসইও সেটিংস ডাটাবেজে সংরক্ষিত হয়েছে!' : 'SEO settings updated & synced with database!'));
    } catch (e) {
      console.error('Failed to save SEO settings:', e);
      showToast(language === 'ar' ? 'فشل حفظ إعدادات تحسين محركات البحث.' : (language === 'bn' ? 'এসইও সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।' : 'Error saving SEO settings.'));
    }
  };

  // Filtered and Searched Topics
  const filteredTopics = useMemo(() => {
    const list = topics.filter((topic) => {
      const matchesSearch =
        !searchQuery.trim() ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.author.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'popular') return topic.isPopular || (topic.likes || 0) >= 2 || (topic.replies || 0) >= 3;
      if (activeFilter === 'featured') return topic.isFeatured;
      if (activeFilter === 'recent') {
        if (!topic.createdAt) return true;
        const topicTime = new Date(topic.createdAt).getTime();
        const diffDays = (Date.now() - topicTime) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      if (activeFilter === 'unloved') return (topic.replies || 0) === 0;
      if (activeFilter === 'loved') return (topic.likes || 0) > 0;

      return true;
    });

    if (activeFilter === 'recent') {
      return [...list].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (activeFilter === 'popular') {
      return [...list].sort((a, b) => {
        const scoreA = (a.likes || 0) * 2 + (a.replies || 0) * 3 + (a.views || 0) * 0.1;
        const scoreB = (b.likes || 0) * 2 + (b.replies || 0) * 3 + (b.views || 0) * 0.1;
        return scoreB - scoreA;
      });
    }

    return list;
  }, [topics, searchQuery, activeFilter]);

  // Topic Like Toggle directly synced with PostgreSQL and localStorage
  const handleToggleLike = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    const currentTopic = topics.find((t) => t.id === topicId);
    const nextIsLiked = !currentTopic?.isLiked;
    const delta = nextIsLiked ? 1 : -1;

    setLikedTopicIds((prev) => {
      const updated = nextIsLiked
        ? Array.from(new Set([...prev, topicId]))
        : prev.filter((id) => id !== topicId);
      try {
        localStorage.setItem('trek_liked_topics', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Optimistic UI state
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const likes = Math.max(0, (t.likes || 0) + delta);
          const updated = { ...t, isLiked: nextIsLiked, likes };
          if (selectedTopic?.id === topicId) {
            setSelectedTopic(updated);
          }
          return updated;
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/topics/${topicId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === 'number') {
          setTopics((prev) =>
            prev.map((t) => {
              if (t.id === topicId) {
                const updated = { ...t, likes: data.likes, isLiked: nextIsLiked };
                if (selectedTopic?.id === topicId) {
                  setSelectedTopic(updated);
                }
                return updated;
              }
              return t;
            })
          );
        }
      }
    } catch (err) {
      console.error('Failed to sync like with database:', err);
    }
  };

  // Reply Like Toggle synced with PostgreSQL and localStorage
  const handleToggleReplyLike = async (topicId: string, replyId: string) => {
    const currentTopic = topics.find((t) => t.id === topicId);
    const currentReply = currentTopic?.repliesList?.find((r) => r.id === replyId);
    const nextIsLiked = !currentReply?.isLiked;
    const delta = nextIsLiked ? 1 : -1;

    setLikedReplyIds((prev) => {
      const updated = nextIsLiked
        ? Array.from(new Set([...prev, replyId]))
        : prev.filter((id) => id !== replyId);
      try {
        localStorage.setItem('trek_liked_replies', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const updatedReplies = (t.repliesList || []).map((r) => {
            if (r.id === replyId) {
              return {
                ...r,
                isLiked: nextIsLiked,
                likes: Math.max(0, (r.likes || 0) + delta)
              };
            }
            return r;
          });
          const updated = { ...t, repliesList: updatedReplies };
          if (selectedTopic?.id === topicId) {
            setSelectedTopic(updated);
          }
          return updated;
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === 'number') {
          setTopics((prev) =>
            prev.map((t) => {
              if (t.id === topicId) {
                const updatedReplies = (t.repliesList || []).map((r) =>
                  r.id === replyId ? { ...r, likes: data.likes, isLiked: nextIsLiked } : r
                );
                const updated = { ...t, repliesList: updatedReplies };
                if (selectedTopic?.id === topicId) {
                  setSelectedTopic(updated);
                }
                return updated;
              }
              return t;
            })
          );
        }
      }
    } catch (err) {
      console.error('Failed to sync reply like with database:', err);
    }
  };

  // Topic View Tracker & Selector with session deduplication
  const handleSelectTopic = (topic: ForumTopic) => {
    const freshTopic = topics.find((t) => t.id === topic.id) || topic;
    setSelectedTopic(freshTopic);
    setIsTopicModalOpen(true);

    if (!viewedTopicsRef.current.has(topic.id)) {
      viewedTopicsRef.current.add(topic.id);
      fetch(`/api/topics/${topic.id}/view`, { method: 'POST' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.views === 'number') {
            setTopics((prev) =>
              prev.map((t) => (t.id === topic.id ? { ...t, views: data.views } : t))
            );
            setSelectedTopic((prev) =>
              prev && prev.id === topic.id ? { ...prev, views: data.views } : prev
            );
          }
        })
        .catch((err) => console.error('Failed to increment view:', err));

      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, views: (t.views || 0) + 1 } : t))
      );
      setSelectedTopic((prev) =>
        prev && prev.id === topic.id ? { ...prev, views: (prev.views || 0) + 1 } : prev
      );
    }
  };

  // Add Reply directly saved to PostgreSQL
  const handleAddReply = async (topicId: string, replyContent: string, authorName: string) => {
    const actualAuthor = currentUser?.name || authorName || 'Community Contributor';
    const actualAvatar = currentUser?.avatar || getRandomAvatar(currentUser?.email || actualAuthor);
    const actualRole = currentUser?.role || 'User';

    try {
      const res = await fetch(`/api/topics/${topicId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: actualAuthor,
          content: replyContent,
          authorRole: actualRole,
          authorAvatar: actualAvatar
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit reply');
      }

      const savedReply = await res.json();

      setTopics((prev) =>
        prev.map((t) => {
          if (t.id === topicId) {
            const updatedReplies = [...(t.repliesList || []), savedReply];
            const updated = {
              ...t,
              replies: updatedReplies.length,
              repliesList: updatedReplies
            };
            if (selectedTopic?.id === topicId) {
              setSelectedTopic(updated);
            }
            return updated;
          }
          return t;
        })
      );

      showToast(language === 'ar' ? 'تم نشر الرد وحفظه بنجاح!' : (language === 'bn' ? 'উত্তর সফলভাবে যোগ করা হয়েছে!' : 'Reply published and saved successfully!'));
    } catch (err: any) {
      console.error('Failed to save reply to database:', err);
      showToast(
        language === 'ar'
          ? 'فشل نشر الرد في قاعدة البيانات.'
          : (language === 'bn'
            ? 'উত্তর যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            : 'Failed to post reply to database.')
      );
    }
  };

  // Create New Topic with direct PostgreSQL persistence (no mockdata fallbacks)
  const handleCreateTopic = async (newTopicData: Partial<ForumTopic>) => {
    const topicPayload = {
      ...newTopicData,
      author: newTopicData.author || currentUser?.name || 'Guest User',
      authorEmail: newTopicData.authorEmail || currentUser?.email || adminAuthUser?.email || '',
      authorId: newTopicData.authorId || currentUser?.id || '',
      authorRole: currentUser?.role || (adminAuthUser ? 'Super Admin' : 'User'),
      authorAvatar: currentUser?.avatar || newTopicData.authorAvatar || getRandomAvatar(currentUser?.email || newTopicData.author || 'User')
    };

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicPayload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Database rejected new topic');
      }

      const saved = await res.json();
      setTopics((prev) => [saved, ...prev]);
      setSelectedTopic(saved);

      if (saved.id) {
        setMyCreatedTopicIds((prev) => {
          const updated = [saved.id, ...prev];
          try {
            localStorage.setItem('trek_my_created_topics', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      setIsPostModalOpen(false);
      setIsTopicModalOpen(true);
      showToast(
        language === 'ar'
          ? 'تم نشر سؤالك وحفظه بنجاح في قاعدة البيانات!'
          : (language === 'bn'
            ? 'আপনার প্রশ্নটি ফোরামে সফলভাবে পোস্ট ও ডাটাবেজে সংরক্ষিত হয়েছে!'
            : 'Your question has been posted and saved to the database!')
      );
    } catch (err: any) {
      console.error('Failed to create topic in database:', err);
      showToast(
        language === 'ar'
          ? 'فشل نشر المناقشة. تعذر الحفظ في قاعدة البيانات.'
          : (language === 'bn'
            ? 'প্রশ্নটি প্রকাশ করতে ব্যর্থ হয়েছে। ডাটাবেজে সংযোগ চেক করুন।'
            : 'Failed to post discussion. Could not save to database.')
      );
    }
  };

  // Tag Selected from Hero
  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
    const forumEl = document.getElementById('forum');
    if (forumEl) {
      forumEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sidebar item selected
  const handleSelectRecentTopic = (topicTitle: string) => {
    const found = topics.find((t) =>
      t.title.toLowerCase().includes(topicTitle.toLowerCase()) ||
      topicTitle.toLowerCase().includes(t.title.toLowerCase())
    );

    if (found) {
      setSelectedTopic(found);
      setIsTopicModalOpen(true);
    } else {
      setSearchQuery(topicTitle);
      const forumEl = document.getElementById('forum');
      if (forumEl) {
        forumEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Open Blog Modal & Participate in Blog Activities
  const handleSelectBlog = (blog: BlogPost) => {
    // If article has a redirect URL, redirect to that link!
    if (blog.redirectUrl && blog.redirectUrl.trim()) {
      const targetUrl = normalizeUrl(blog.redirectUrl);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!currentUser) {
      setPendingAuthAction({ type: 'view_blog', blog });
      triggerAuthModal(
        language === 'ar'
          ? 'للمشاركة في أنشطة المقالات، الإعجاب بها، وقراءة المناقشات، يرجى تسجيل الدخول أو إنشاء حساب جديد.'
          : (language === 'bn'
            ? 'ব্লগ কার্যক্রমে অংশ নিতে এবং আলোচনা পড়তে অনুগ্রহ করে অ্যাকাউন্টে লগইন করুন।'
            : 'To participate in blog activities, like articles, and read discussions, you must have an account and be logged in.'),
        'login'
      );
      showToast(language === 'ar' ? 'يرجى تسجيل الدخول أو إنشاء حساب للمشاركة في أنشطة المقالات.' : (language === 'bn' ? 'ব্লগ কার্যক্রমে অংশ নিতে অনুগ্রহ করে লগইন বা সাইন আপ করুন।' : 'Please log in or sign up to participate in blog activities.'));
      return;
    }
    setSelectedBlog(blog);
    setIsBlogModalOpen(true);
  };

  // Check if current route is /admin
  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 rtl:right-auto rtl:left-6 z-50 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-xs font-semibold shadow-xl shadow-teal-950/40 animate-in fade-in slide-in-from-top-3 duration-200">
          {toastMessage}
        </div>
      )}

      {isAdminRoute ? (
        adminAuthUser ? (
          /* Fully Customized Admin Panel */
          <AdminPanel
            topics={topics}
            blogs={blogPosts}
            users={adminUsers}
            activityLogs={activityLogs}
            settings={platformSettings}
            heroSettings={heroSettings}
            onSaveHeroSettings={handleSaveHeroSettings}
            categories={discussionCategories}
            staffRoles={staffRoles}
            onAddCategory={handleAddDiscussionCategory}
            onDeleteCategory={handleDeleteDiscussionCategory}
            onAddStaffRole={handleAddStaffRole}
            onDeleteStaffRole={handleDeleteStaffRole}
            currentAdminUser={adminAuthUser}
            onLogout={handleAdminLogout}
            onExitAdmin={() => navigate('/')}
            onAddTopic={handleAdminAddTopic}
            onDeleteTopic={handleAdminDeleteTopic}
            onToggleFeatureTopic={handleAdminToggleFeature}
            onTogglePopularTopic={handleAdminTogglePopular}
            onViewTopic={(topic) => {
              setSelectedTopic(topic);
              setIsTopicModalOpen(true);
            }}
            onUpdateTopic={handleUpdateTopic}
            onAddBlog={handleAdminAddBlog}
            onDeleteBlog={handleAdminDeleteBlog}
            onUpdateBlog={handleAdminUpdateBlog}
            onViewBlog={(blog) => setSelectedBlog(blog)}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleUserStatus={handleToggleUserStatus}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onSaveSettings={handleSaveSettings}
            seoSettings={seoSettings}
            onSaveSeoSettings={handleSaveSeoSettings}
          />
        ) : (
          /* Dedicated Admin Login at /admin */
          <AdminLogin
            adminUsers={adminUsers}
            onLogin={handleAdminLogin}
            onCancel={() => navigate('/')}
            currentUser={currentUser || adminAuthUser}
            onSignOut={() => {
              handleSignOut();
              handleAdminLogout();
            }}
          />
        )
      ) : (
        /* Public Community View */
        <main className="relative">
          {/* Floating Glassmorphic Pill Navbar matching user reference */}
          <Navbar
            onOpenAuth={() => triggerAuthModal(undefined, 'login')}
            onOpenPostModal={handleOpenPostQuestion}
            onOpenAdmin={() => navigate('/admin')}
            activeNav={activeNav}
            currentUser={currentUser}
            onSignOut={handleSignOut}
            setActiveNav={(nav) => {
              setActiveNav(nav);
              if (nav === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else if (nav === 'forum') {
                document.getElementById('forum')?.scrollIntoView({ behavior: 'smooth' });
              } else if (nav === 'blog') {
                document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* 1. Hero Section with faceted polyhedral background mesh and dynamic slideshow */}
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTag={handleSelectTag}
            heroSettings={heroSettings}
          />

          {/* Post-Hero Container with On-Scroll Background & Matching Project Gradient */}
          <div className="relative">
            {/* Fixed On-Scroll Background Image Layer */}
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
              aria-hidden="true"
            >
              {/* Saudi Corporate Partner Background Image with Fixed Scroll (sm:bg-fixed) */}
              <div 
                className="absolute inset-0 bg-top bg-no-repeat bg-cover sm:bg-fixed opacity-45 transition-opacity duration-300"
                style={{ 
                  backgroundImage: `url(${trekSaudiBg})`,
                  backgroundPosition: 'center 10%'
                }}
              />

              {/* Seamless Matching Project Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fd]/75 via-[#f8f9fd]/85 to-[#f8f9fd]/95" />

              {/* Ambient Brand Mesh / Glow Accents matching project theme */}
              <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-1/2 left-10 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[110px] pointer-events-none" />
              <div className="absolute bottom-20 right-10 w-[500px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* Foreground Content */}
            <div className="relative z-10">
              {/* 2. Main Forum Discussions Section */}
              <ForumSection
                topics={topics}
                filteredTopics={filteredTopics}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                onOpenPostModal={handleOpenPostQuestion}
                onSelectTopic={handleSelectTopic}
                onToggleLike={handleToggleLike}
                onEditTopic={(topic) => setTopicToEdit(topic)}
                onDeleteTopic={(topic) => setTopicToDelete(topic)}
                canEditTopic={canEditTopic}
                canDeleteTopic={canDeleteTopic}
                isTopicAuthor={isTopicAuthor}
                recentTopics={recentTopics}
                recentReplies={recentReplies}
                onSelectRecentTopic={handleSelectRecentTopic}
                onOpenChat={() => setIsChatOpen(!isChatOpen)}
                searchQuery={searchQuery}
                settings={platformSettings}
              />

              {/* 3. "New to Communities?" Callout Banner */}
              <CalloutBanner onAskQuestion={handleOpenPostQuestion} />

              {/* 4. Blog Posts Section: "Trek Consultancy Insights" */}
              <BlogSection
                posts={blogPosts}
                onSelectPost={handleSelectBlog}
                onShowMore={() => {}}
                hasMore={false}
                currentUser={currentUser}
                onRequireAuth={(prompt) => {
                  triggerAuthModal(prompt || 'To participate in blog activities, please log in or create an account.');
                }}
              />

              {/* 5. Newsletter Subscription Section */}
              <NewsletterSection currentUser={currentUser} />

              {/* 6. Footer Section */}
              <Footer
                onNavigate={(view) => {
                  if (view === 'forum') {
                    document.getElementById('forum')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (view === 'blog') {
                    document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onOpenHelp={() => setIsChatOpen(true)}
                onOpenAdmin={() => navigate('/admin')}
              />
            </div>
          </div>
        </main>
      )}

      {/* Shared Modals and Overlays */}
      <PostQuestionModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreateTopic}
        currentUser={currentUser}
        categories={discussionCategories}
        onRequireAuth={(prompt) => {
          triggerAuthModal(
            prompt ||
              (language === 'ar'
                ? 'لإنشاء موضوع، يجب أن يكون لديك حساب وتسجيل الدخول أولاً.'
                : (language === 'bn'
                  ? 'ফোরামে একটি টপিক তৈরি ও প্রশ্ন পোস্ট করতে, আপনার একটি অ্যাকাউন্ট থাকতে হবে এবং লগইন করতে হবে।'
                  : 'To create a topic, you must have an account and be logged in.'))
          );
        }}
      />

      <TopicDetailModal
        topic={selectedTopic}
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onToggleLike={handleToggleLike}
        onToggleReplyLike={handleToggleReplyLike}
        onAddReply={handleAddReply}
        onEditTopic={(topic) => setTopicToEdit(topic)}
        onDeleteTopic={(topic) => setTopicToDelete(topic)}
        canEdit={selectedTopic ? canEditTopic(selectedTopic) : false}
        canDelete={selectedTopic ? canDeleteTopic(selectedTopic) : false}
        isAuthor={selectedTopic ? isTopicAuthor(selectedTopic) : false}
        currentUser={currentUser}
        onRequireAuth={(prompt) => {
          triggerAuthModal(
            prompt ||
              (language === 'ar'
                ? 'للمشاركة في مناقشات الموضوع، يرجى تسجيل الدخول أو إنشاء حساب جديد.'
                : (language === 'bn'
                  ? 'আলোচনায় অংশ নিতে এবং উত্তর দিতে অনুগ্রহ করে অ্যাকাউন্টে লগইন করুন।'
                  : 'To participate in topic discussions, please log in or create an account.'))
          );
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptMessage(undefined);
          setPendingAuthAction(null);
        }}
        onSuccess={handleUserAuthSuccess}
        currentUser={currentUser || (adminAuthUser ? {
          id: adminAuthUser.id || 'usr-admin',
          name: adminAuthUser.name,
          email: adminAuthUser.email,
          role: adminAuthUser.role,
          avatar: adminAuthUser.avatar
        } : null)}
        onSignOut={() => handleSignOut(true)}
        promptMessage={authPromptMessage}
        initialTab={authInitialTab}
      />

      <BlogModal
        post={selectedBlog}
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        currentUser={currentUser}
        onRequireAuth={(prompt) => {
          triggerAuthModal(
            prompt ||
              (language === 'ar'
                ? 'للمشاركة في أنشطة المقالات، يرجى تسجيل الدخول أو إنشاء حساب جديد.'
                : (language === 'bn'
                  ? 'ব্লগ কার্যক্রমে অংশগ্রহণ করতে অনুগ্রহ করে অ্যাকাউন্টে লগইন করুন।'
                  : 'To participate in blog activities, please log in or create an account.'))
          );
        }}
        onBlogUpdated={(updatedBlog) => {
          setSelectedBlog(updatedBlog);
          setBlogPosts(prev => prev.map(b => b.id === updatedBlog.id ? updatedBlog : b));
        }}
      />

      <SupportChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Edit Discussion Post Modal */}
      <EditTopicModal
        isOpen={Boolean(topicToEdit)}
        topic={topicToEdit}
        onClose={() => setTopicToEdit(null)}
        onSubmit={handleUpdateTopic}
        categories={discussionCategories}
      />

      {/* Normal Confirmation Modal for Deleting Post */}
      <DeleteConfirmModal
        isOpen={Boolean(topicToDelete)}
        onClose={() => {
          if (!isDeletingTopic) setTopicToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTopic}
        title={language === 'ar' ? 'حذف المنشور' : (language === 'bn' ? 'পোস্ট মুছে ফেলুন' : 'Delete Post')}
        itemTitle={topicToDelete?.title}
        message={
          language === 'ar'
            ? 'هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف هذه المناقشة وجميع الردود المرتبطة بها نهائياً.'
            : (language === 'bn'
              ? 'আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান? এই অ্যাকশনটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না এবং এই আলোচনার সাথে সম্পর্কিত সকল উত্তর স্থায়ীভাবে মুছে ফেলা হবে।'
              : 'Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies.')
        }
        confirmLabel={language === 'ar' ? 'حذف المنشور' : (language === 'bn' ? 'পোস্ট মুছুন' : 'Delete Post')}
        isLoading={isDeletingTopic}
      />
    </div>
  );
}
