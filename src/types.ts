export interface ForumReply {
  id: string;
  author: string;
  authorRole?: string;
  authorAvatar: string;
  timeAgo: string;
  createdAt?: string;
  content: string;
  likes: number;
  isLiked?: boolean;
}

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topicCount?: number;
}

export interface StaffRoleBadge {
  id: string;
  name: string;
  badgeLabel?: string;
  color?: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  author: string;
  authorEmail?: string;
  authorId?: string;
  authorRole?: string;
  authorAvatar: string;
  timeAgo: string;
  createdAt?: string;
  category: string;
  categorySlug: string;
  views: number;
  likes: number;
  replies: number;
  content: string;
  isLiked?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  repliesList: ForumReply[];
}

export interface RecentTopic {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  createdAt?: string;
}

export interface RecentReply {
  id: string;
  author: string;
  topicTitle: string;
  timeAgo: string;
  createdAt?: string;
}

export interface BlogComment {
  id: string;
  blogId: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  timeAgo: string;
  content: string;
  likes?: number;
  createdAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  redirectUrl?: string;
  likes?: number;
  isLiked?: boolean;
  commentsCount?: number;
  comments?: BlogComment[];
}

export type FilterCategory = 'all' | 'popular' | 'featured' | 'recent' | 'unloved' | 'loved';

export type AdminTab = 'overview' | 'customers' | 'hero' | 'topics' | 'support' | 'blogs' | 'users' | 'ai' | 'seo' | 'settings';

export interface SEOSettings {
  metaTitle: string;
  titleSeparator: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  siteName: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: 'summary_large_image' | 'summary';
  twitterSite: string;
  twitterCreator: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  organizationName: string;
  organizationLogo: string;
  contactEmail: string;
  contactPhone: string;
  customHeadTags?: string;
  updatedAt?: string;
}

export interface HeroSlideImage {
  id: string;
  url: string;
  title?: string;
  subtitle?: string;
  isActive: boolean;
}

export interface HeroSettings {
  slides: HeroSlideImage[];
  autoplay: boolean;
  intervalSeconds: number;
  overlayOpacity: number;
  overlayGradient?: 'violet-dark' | 'midnight-slate' | 'deep-emerald' | 'pure-dark';
  transitionEffect?: 'fade' | 'zoom' | 'slide';
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  enableOverlayMesh?: boolean;
  heroHeight?: 'standard' | 'tall' | 'cinematic' | 'fullscreen';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Moderator' | 'Support Specialist' | 'Community Lead' | 'User';
  status: 'active' | 'pending' | 'suspended';
  avatar: string;
  joinedDate: string;
  threadsCount: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timeAgo: string;
  type: 'topic' | 'reply' | 'user' | 'system' | 'blog' | 'setting' | 'support';
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  userEmail: string;
  sessionId: string;
  subject: string;
  question: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  status: 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
  adminAnswer?: string;
  assignedTo?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  faqCount?: number;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  question: string;
  answer: string;
  questionBn?: string;
  answerBn?: string;
  status: 'published' | 'draft';
  createdBy?: string;
  createdAt?: string;
}

export interface SupportChatSession {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  title?: string;
  isGuest?: boolean;
  status?: string;
  lastMessage: string;
  lastSender: string;
  messageCount: number;
  lastActive: string;
  createdAt?: string;
}

export interface PlatformSettings {
  forumName: string;
  forumTagline: string;
  enableGuestPosting: boolean;
  enableAutoModeration: boolean;
  announcementText: string;
  showAnnouncement: boolean;
  primarySupportEmail: string;
  slaHours: number;
  floatingSupportEnabled?: boolean;
  floatingSupportTagTextEn?: string;
  floatingSupportTagTextBn?: string;
  floatingSupportGreetingEn?: string;
  floatingSupportGreetingBn?: string;
  floatingSupportAiEnabled?: boolean;
  floatingSupportDefaultPriority?: 'Normal' | 'Urgent' | 'Critical';
  floatingSupportMessengerTheme?: string;
  hero?: HeroSettings;
  seo?: SEOSettings;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'published' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface AIKnowledgeStatus {
  totalFaqs: number;
  totalChunks: number;
  totalTopics: number;
  platformBrand: string;
  primaryEmail: string;
  lastSyncedAt: string;
  liveSyncStatus: 'ACTIVE' | 'SYNCING' | 'READY';
  models: string[];
  activeModel?: string;
  isKeyConfigured?: boolean;
}

export type AiProvider = 'gemini' | 'openai';

export interface AiModelOption {
  id: string;
  name: string;
  provider?: AiProvider;
  tagline: string;
  speed: string;
  intelligence: string;
  contextWindow: string;
  badge?: string;
  badgeColor?: string;
  capabilities: string[];
  description?: string;
}

export interface AiSettingsConfig {
  apiKey?: string;
  apiKeyMasked?: string;
  isKeyConfigured?: boolean;
  hasCustomKey?: boolean;
  usingEnvKey?: boolean;
  provider?: AiProvider;
  baseUrl?: string;
  providerApiKeys?: Partial<Record<AiProvider, string>>;
  selectedModel: string;
  fallbackModels: string[];
  temperature: number;
  maxOutputTokens: number;
  customSystemInstruction?: string;
  status: 'active' | 'disabled' | 'fallback_only';
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'untested';
  lastTestMessage?: string;
  lastTestLatencyMs?: number;
  updatedAt?: string;
  availableModels?: AiModelOption[];
}

export const isAdministrativeRole = (role?: string | null): boolean => {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  return (
    r === 'super admin' ||
    r === 'admin' ||
    r === 'administrator' ||
    r === 'moderator' ||
    r === 'support specialist' ||
    r === 'community lead' ||
    r.includes('admin')
  );
};

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  status: 'active' | 'inactive' | 'lead';
  avatar: string;
  joinedDate: string;
  createdAt?: string;
  lastActive?: string;
  threadsCount: number;
  conversationsCount: number;
  messagesCount: number;
  isRegistered: boolean;
  latestMessageSnippet?: string;
  sessionIds?: string[];
}

export interface CustomerConversationMessage {
  id: string;
  conversationId: string;
  sessionId?: string;
  role: 'user' | 'assistant' | 'system';
  sender: 'user' | 'bot' | 'staff' | string;
  content: string;
  message?: string;
  source: 'AI' | 'USER' | 'STAFF' | string;
  createdAt: string;
}

export interface CustomerConversationSession {
  id: string;
  sessionId: string;
  title: string;
  status: string;
  isGuest: boolean;
  messageCount: number;
  lastMessage: string;
  lastSender: string;
  createdAt: string;
  updatedAt: string;
  messages: CustomerConversationMessage[];
}

export interface CustomerFullDetail {
  customer: Customer;
  conversations: CustomerConversationSession[];
  allMessages: CustomerConversationMessage[];
  forumTopics?: {
    id: string;
    title: string;
    category: string;
    views: number;
    replies: number;
    createdAt: string;
  }[];
}

