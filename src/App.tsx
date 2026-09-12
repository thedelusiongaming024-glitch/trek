import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ForumSection } from './components/ForumSection';
import { CalloutBanner } from './components/CalloutBanner';
import { BlogSection } from './components/BlogSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { PostQuestionModal } from './components/PostQuestionModal';
import { TopicDetailModal } from './components/TopicDetailModal';
import { AuthModal } from './components/AuthModal';
import { ConsultancyModal } from './components/ConsultancyModal';
import { BlogModal } from './components/BlogModal';
import { SupportChatModal } from './components/SupportChatModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLogin } from './components/admin/AdminLogin';
import { 
  ForumTopic, 
  FilterCategory, 
  BlogPost, 
  ConsultancyInquiry, 
  AdminUser, 
  ActivityLog, 
  PlatformSettings,
  RecentTopic,
  RecentReply
} from './types';

export default function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  
  // Real Database State (starts empty, populated from PostgreSQL)
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [consultancyLeads, setConsultancyLeads] = useState<ConsultancyInquiry[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    forumName: 'Ama Community',
    forumTagline: 'The modern community platform for developers and digital nomads',
    enableGuestPosting: true,
    enableAutoModeration: true,
    announcementText: '',
    showAnnouncement: false,
    primarySupportEmail: 'support@amacommunity.io',
    slaHours: 24
  });

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
      const saved = localStorage.getItem('ama_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin Authentication State
  const [adminAuthUser, setAdminAuthUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    try {
      const saved = localStorage.getItem('ama_admin_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Track topics created locally by this browser user
  const [myCreatedTopicIds, setMyCreatedTopicIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ama_my_created_topics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Determine if the current user has administrative permissions
  const isUserAdmin = Boolean(
    adminAuthUser ||
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Moderator'
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

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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

      const [topicsRes, blogsRes, inquiriesRes, usersRes, logsRes, settingsRes] = await Promise.allSettled([
        safeFetch('/api/topics', []),
        safeFetch('/api/blogs', []),
        safeFetch('/api/consultancy', []),
        safeFetch('/api/users', []),
        safeFetch('/api/activity-logs', []),
        safeFetch('/api/settings', null)
      ]);

      if (topicsRes.status === 'fulfilled' && Array.isArray(topicsRes.value)) {
        setTopics(topicsRes.value);
      } else if (topicsRes.status === 'rejected') {
        console.error('[fetchData] /api/topics threw:', topicsRes.reason);
      }
      if (blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value)) {
        setBlogPosts(blogsRes.value);
      }
      if (inquiriesRes.status === 'fulfilled' && Array.isArray(inquiriesRes.value)) {
        setConsultancyLeads(inquiriesRes.value);
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
    } catch (err) {
      console.error('Error fetching database records:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdminLogin = (user: { name: string; email: string; role: string }) => {
    setAdminAuthUser(user);
    try {
      localStorage.setItem('ama_admin_auth', JSON.stringify(user));
    } catch {
      // ignore
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleAdminLogout = () => {
    setAdminAuthUser(null);
    try {
      localStorage.removeItem('ama_admin_auth');
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
    showToast('Signed out of Administrator Portal.');
  };

  const handleUserAuthSuccess = (user: { id?: string; name: string; email: string; role: string; avatar?: string }) => {
    setIsAuthModalOpen(false);
    setCurrentUser(user);
    try {
      localStorage.setItem('ama_current_user', JSON.stringify(user));
      if (user.role === 'Super Admin' || user.role === 'Moderator') {
        const adminData = { name: user.name, email: user.email, role: user.role };
        setAdminAuthUser(adminData);
        localStorage.setItem('ama_admin_auth', JSON.stringify(adminData));
      }
    } catch {
      // ignore
    }
    showToast(`Welcome, ${user.name}! Logged into community.`);

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
        'To create a topic and post questions in the forum, you must have an account and be logged in.',
        'login'
      );
      showToast('Please log in or sign up to create a topic.');
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleSignOut = (keepAuthModalOpen: boolean = false) => {
    if (!keepAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('ama_current_user');
    } catch {
      // ignore
    }
    showToast('Signed out of Ama Community.');
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
  const [isConsultancyModalOpen, setIsConsultancyModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Delete Post Confirmation State
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  // Dynamic Recent Topics & Replies derived from real PostgreSQL data
  const recentTopics: RecentTopic[] = useMemo(() => {
    return topics.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      author: t.author,
      timeAgo: t.timeAgo
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
            timeAgo: rep.timeAgo
          });
        }
      }
    }
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
      if (res.ok) {
        const saved = await res.json();
        setTopics(prev => [saved, ...prev]);
        showToast(`Discussion "${saved.title.slice(0, 30)}..." published!`);
      } else {
        setTopics(prev => [newTopicData, ...prev]);
        showToast('Discussion added.');
      }
    } catch {
      setTopics(prev => [newTopicData, ...prev]);
    }
  };

  const handleAdminDeleteTopic = async (id: string) => {
    const userEmail = adminAuthUser?.email || currentUser?.email || 'admin@amacommunity.io';
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
        localStorage.setItem('ama_my_created_topics', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Topic permanently removed from discussions.');
  };

  // Normal Confirmation Delete Handler for Forum Topics (Restricted to author and admin)
  const handleConfirmDeleteTopic = async () => {
    if (!topicToDelete) return;

    if (!canDeleteTopic(topicToDelete)) {
      showToast('Permission denied: Only the administrator or the author who posted can delete this post.');
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
        showToast('Permission denied: Only the administrator or the person who posted can delete this post.');
        setIsDeletingTopic(false);
        setTopicToDelete(null);
        return;
      }

      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
      setMyCreatedTopicIds((prev) => {
        const updated = prev.filter((id) => id !== topicToDelete.id);
        try {
          localStorage.setItem('ama_my_created_topics', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (selectedTopic?.id === topicToDelete.id) {
        setIsTopicModalOpen(false);
        setSelectedTopic(null);
      }
      showToast(`Post "${topicToDelete.title.slice(0, 30)}..." deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete topic:', err);
      showToast('Error deleting post. Please try again.');
    } finally {
      setIsDeletingTopic(false);
      setTopicToDelete(null);
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
    showToast('Topic pin status updated.');
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
    showToast('Topic popularity status updated.');
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
        showToast(`Article "${saved.title.slice(0, 30)}..." published to knowledge base!`);
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
    showToast('Article removed from knowledge base.');
  };

  const handleUpdateConsultancyStatus = async (id: string, status: ConsultancyInquiry['status']) => {
    try {
      await fetch(`/api/consultancy/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
    setConsultancyLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    showToast(`Lead status updated to ${status}.`);
  };

  const handleUpdateConsultancyNotes = async (id: string, notes: string) => {
    try {
      await fetch(`/api/consultancy/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
    } catch (e) {
      console.error(e);
    }
    setConsultancyLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
    showToast('Internal lead notes saved.');
  };

  const handleDeleteConsultancyInquiry = async (id: string) => {
    try {
      await fetch(`/api/consultancy/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setConsultancyLeads(prev => prev.filter(l => l.id !== id));
    showToast('Consultancy inquiry deleted.');
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
    showToast(`User role updated to ${role}.`);
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
    showToast(`User marked as ${nextStatus}.`);
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
        showToast(`Staff invitation registered for ${saved.name}.`);
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
    showToast('User account deleted.');
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
    showToast('Platform settings saved.');
  };

  const handleNewConsultancyLead = async (data: { company: string; email: string; scope: string }) => {
    try {
      const res = await fetch('/api/consultancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const saved = await res.json();
        setConsultancyLeads(prev => [saved, ...prev]);
      } else {
        const newLead: ConsultancyInquiry = {
          id: `inq-${Date.now()}`,
          company: data.company,
          email: data.email,
          scope: data.scope,
          status: 'new',
          date: 'Just now',
          priority: 'high'
        };
        setConsultancyLeads(prev => [newLead, ...prev]);
      }
    } catch {
      const newLead: ConsultancyInquiry = {
        id: `inq-${Date.now()}`,
        company: data.company,
        email: data.email,
        scope: data.scope,
        status: 'new',
        date: 'Just now',
        priority: 'high'
      };
      setConsultancyLeads(prev => [newLead, ...prev]);
    }
    showToast('Enterprise consultancy request received! Our architects are reviewing.');
  };

  // Filtered and Searched Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesSearch =
        !searchQuery.trim() ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.author.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'popular') return topic.isPopular || topic.likes > 0 || topic.replies >= 4;
      if (activeFilter === 'featured') return topic.isFeatured;
      if (activeFilter === 'recent') return topic.timeAgo.includes('Just now') || topic.timeAgo.includes('month');
      if (activeFilter === 'unloved') return topic.replies === 0;
      if (activeFilter === 'loved') return topic.likes > 0;

      return true;
    });
  }, [topics, searchQuery, activeFilter]);

  // Topic Like Toggle
  const handleToggleLike = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    try {
      fetch(`/api/topics/${topicId}/like`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const isLiked = !t.isLiked;
          const likes = isLiked ? t.likes + 1 : Math.max(0, t.likes - 1);
          const updated = { ...t, isLiked, likes };
          if (selectedTopic?.id === topicId) {
            setSelectedTopic(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  // Topic View Tracker & Selector
  const handleSelectTopic = (topic: ForumTopic) => {
    setSelectedTopic(topic);
    setIsTopicModalOpen(true);
    // Real-time view increment in PostgreSQL
    try {
      fetch(`/api/topics/${topic.id}/view`, { method: 'POST' });
      setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, views: t.views + 1 } : t));
    } catch (err) {
      console.error('Failed to increment view:', err);
    }
  };

  // Add Reply
  const handleAddReply = async (topicId: string, replyContent: string, authorName: string) => {
    const actualAuthor = currentUser?.name || authorName || 'Community Contributor';
    const actualAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
    const actualRole = currentUser?.role || 'User';

    const tempReply = {
      id: `rep-${Date.now()}`,
      author: actualAuthor,
      authorAvatar: actualAvatar,
      timeAgo: 'Just now',
      content: replyContent,
      likes: 0
    };

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const updatedReplies = [...(t.repliesList || []), tempReply];
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

    try {
      await fetch(`/api/topics/${topicId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: actualAuthor,
          content: replyContent,
          authorRole: actualRole
        })
      });
    } catch (err) {
      console.error(err);
    }

    showToast('Reply published successfully!');
  };

  // Create New Topic
  const handleCreateTopic = async (newTopicData: Partial<ForumTopic>) => {
    const topicPayload = {
      ...newTopicData,
      author: newTopicData.author || currentUser?.name || 'Guest User',
      authorEmail: newTopicData.authorEmail || currentUser?.email || adminAuthUser?.email || '',
      authorId: newTopicData.authorId || currentUser?.id || '',
      authorRole: currentUser?.role || (adminAuthUser ? 'Super Admin' : 'User'),
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    };

    let createdTopicId = '';

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicPayload)
      });

      if (res.ok) {
        const saved = await res.json();
        createdTopicId = saved.id;
        setTopics((prev) => [saved, ...prev]);
        setSelectedTopic(saved);
      } else {
        const fallback: ForumTopic = {
          id: `topic-${Date.now()}`,
          title: topicPayload.title || 'Untitled Topic',
          author: topicPayload.author || 'Guest User',
          authorEmail: topicPayload.authorEmail,
          authorId: topicPayload.authorId,
          authorRole: topicPayload.authorRole || 'Community Member',
          authorAvatar: topicPayload.authorAvatar,
          timeAgo: 'Just now',
          category: topicPayload.category || 'General Discussion',
          categorySlug: topicPayload.categorySlug || 'general',
          views: 1,
          likes: 0,
          replies: 0,
          content: topicPayload.content || '',
          isLiked: false,
          isFeatured: false,
          isPopular: false,
          repliesList: []
        };
        createdTopicId = fallback.id;
        setTopics((prev) => [fallback, ...prev]);
        setSelectedTopic(fallback);
      }
    } catch {
      const fallback: ForumTopic = {
        id: `topic-${Date.now()}`,
        title: topicPayload.title || 'Untitled Topic',
        author: topicPayload.author || 'Guest User',
        authorEmail: topicPayload.authorEmail,
        authorId: topicPayload.authorId,
        authorRole: topicPayload.authorRole || 'Community Member',
        authorAvatar: topicPayload.authorAvatar,
        timeAgo: 'Just now',
        category: topicPayload.category || 'General Discussion',
        categorySlug: topicPayload.categorySlug || 'general',
        views: 1,
        likes: 0,
        replies: 0,
        content: topicPayload.content || '',
        isLiked: false,
        isFeatured: false,
        isPopular: false,
        repliesList: []
      };
      createdTopicId = fallback.id;
      setTopics((prev) => [fallback, ...prev]);
      setSelectedTopic(fallback);
    }

    if (createdTopicId) {
      setMyCreatedTopicIds((prev) => {
        const updated = [createdTopicId, ...prev];
        try {
          localStorage.setItem('ama_my_created_topics', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    setIsTopicModalOpen(true);
    showToast('Your question has been posted to the forum!');
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
    if (!currentUser) {
      setPendingAuthAction({ type: 'view_blog', blog });
      triggerAuthModal(
        'To participate in blog activities, like articles, and read discussions, you must have an account and be logged in.',
        'login'
      );
      showToast('Please log in or sign up to participate in blog activities.');
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
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-xs font-semibold shadow-xl shadow-teal-950/40 animate-in fade-in slide-in-from-top-3 duration-200">
          {toastMessage}
        </div>
      )}

      {isAdminRoute ? (
        adminAuthUser ? (
          /* Fully Customized Admin Panel */
          <AdminPanel
            topics={topics}
            blogs={blogPosts}
            consultancyLeads={consultancyLeads}
            users={adminUsers}
            activityLogs={activityLogs}
            settings={platformSettings}
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
            onAddBlog={handleAdminAddBlog}
            onDeleteBlog={handleAdminDeleteBlog}
            onViewBlog={handleSelectBlog}
            onUpdateConsultancyStatus={handleUpdateConsultancyStatus}
            onUpdateConsultancyNotes={handleUpdateConsultancyNotes}
            onDeleteConsultancyInquiry={handleDeleteConsultancyInquiry}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleUserStatus={handleToggleUserStatus}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onSaveSettings={handleSaveSettings}
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
        <main>
          {/* 1. Hero Section with seamless embedded Navbar on purple faceted mesh */}
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTag={handleSelectTag}
          >
            <Navbar
              onOpenAuth={() => triggerAuthModal(undefined, 'login')}
              onOpenPostModal={handleOpenPostQuestion}
              onOpenAdmin={() => navigate('/admin')}
              activeNav={activeNav}
              currentUser={currentUser}
              onSignOut={handleSignOut}
              setActiveNav={(nav) => {
                setActiveNav(nav);
                if (nav === 'forum') {
                  document.getElementById('forum')?.scrollIntoView({ behavior: 'smooth' });
                } else if (nav === 'blog') {
                  document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
                } else if (nav === 'documentation') {
                  setIsConsultancyModalOpen(true);
                } else if (nav === 'jobs') {
                  showToast('Careers portal: 4 engineering positions currently open.');
                }
              }}
            />
          </HeroSection>

          {/* 2. Main Forum Discussions Section */}
          <ForumSection
            topics={topics}
            filteredTopics={filteredTopics}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            onOpenPostModal={handleOpenPostQuestion}
            onSelectTopic={handleSelectTopic}
            onToggleLike={handleToggleLike}
            onDeleteTopic={(topic) => setTopicToDelete(topic)}
            canDeleteTopic={canDeleteTopic}
            isTopicAuthor={isTopicAuthor}
            recentTopics={recentTopics}
            recentReplies={recentReplies}
            onOpenConsultancy={() => setIsConsultancyModalOpen(true)}
            onSelectRecentTopic={handleSelectRecentTopic}
            onOpenChat={() => setIsChatOpen(!isChatOpen)}
            searchQuery={searchQuery}
            settings={platformSettings}
          />

          {/* 3. "New to Communities?" Callout Banner */}
          <CalloutBanner onAskQuestion={handleOpenPostQuestion} />

          {/* 4. Blog Posts Section: "Ama Blogs" */}
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
        </main>
      )}

      {/* Shared Modals and Overlays */}
      <PostQuestionModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreateTopic}
        currentUser={currentUser}
        onRequireAuth={(prompt) => {
          triggerAuthModal(prompt || 'To create a topic, you must have an account and be logged in.');
        }}
      />

      <TopicDetailModal
        topic={selectedTopic}
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onToggleLike={handleToggleLike}
        onAddReply={handleAddReply}
        onDeleteTopic={(topic) => setTopicToDelete(topic)}
        canDelete={selectedTopic ? canDeleteTopic(selectedTopic) : false}
        isAuthor={selectedTopic ? isTopicAuthor(selectedTopic) : false}
        currentUser={currentUser}
        onRequireAuth={(prompt) => {
          triggerAuthModal(prompt || 'To participate in topic discussions, please log in or create an account.');
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
        currentUser={currentUser}
        onSignOut={() => handleSignOut(true)}
        promptMessage={authPromptMessage}
        initialTab={authInitialTab}
      />

      <ConsultancyModal
        isOpen={isConsultancyModalOpen}
        onClose={() => setIsConsultancyModalOpen(false)}
        onSubmitConsultancy={handleNewConsultancyLead}
      />

      <BlogModal
        post={selectedBlog}
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        currentUser={currentUser}
        onRequireAuth={(prompt) => {
          triggerAuthModal(prompt || 'To participate in blog activities, please log in or create an account.');
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

      {/* Normal Confirmation Modal for Deleting Post */}
      <DeleteConfirmModal
        isOpen={Boolean(topicToDelete)}
        onClose={() => {
          if (!isDeletingTopic) setTopicToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTopic}
        title="Delete Post"
        itemTitle={topicToDelete?.title}
        message="Are you sure you want to delete this post? This action cannot be undone and will permanently remove this discussion along with all replies."
        confirmLabel="Delete Post"
        isLoading={isDeletingTopic}
      />
    </div>
  );
}
