export interface ForumReply {
  id: string;
  author: string;
  authorRole?: string;
  authorAvatar: string;
  timeAgo: string;
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
}

export interface RecentReply {
  id: string;
  author: string;
  topicTitle: string;
  timeAgo: string;
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
  likes?: number;
  isLiked?: boolean;
  commentsCount?: number;
  comments?: BlogComment[];
}

export type FilterCategory = 'all' | 'popular' | 'featured' | 'recent' | 'unloved' | 'loved';

export type AdminTab = 'overview' | 'topics' | 'consultancy' | 'blogs' | 'users' | 'hero' | 'settings' | 'support';

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

export interface ConsultancyInquiry {
  id: string;
  company: string;
  email: string;
  scope: string;
  date: string;
  status: 'new' | 'reviewing' | 'contacted' | 'resolved';
  priority: 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  notes?: string;
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
  type: 'topic' | 'reply' | 'consultancy' | 'user' | 'system' | 'blog' | 'setting' | 'support';
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
  lastMessage: string;
  lastSender: string;
  messageCount: number;
  lastActive: string;
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
}
