import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Star, 
  Pin, 
  Trash2, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  Layers,
  Tag,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Palette,
  AlertCircle,
  Pencil
} from 'lucide-react';
import { ForumTopic, DiscussionCategory, StaffRoleBadge } from '../../types';
import { DeleteConfirmModal } from '../DeleteConfirmModal';
import { EditTopicModal } from '../EditTopicModal';
import { useLanguage } from '../../context/LanguageContext';

export interface AdminTopicsTabProps {
  topics: ForumTopic[];
  onToggleFeature: (id: string) => void;
  onTogglePopular: (id: string) => void;
  onDeleteTopic: (id: string) => void;
  onOpenNewTopicModal: () => void;
  onViewTopic: (topic: ForumTopic) => void;
  onUpdateTopic?: (updatedData: { id: string; title: string; category: string; categorySlug?: string; content: string }) => Promise<void> | void;
  categories?: (DiscussionCategory | string)[];
  staffRoles?: (StaffRoleBadge | string)[];
  onAddCategory?: (category: { name: string; description?: string }) => Promise<void> | void;
  onDeleteCategory?: (id: string) => Promise<void> | void;
  onAddStaffRole?: (role: { name: string; badgeLabel?: string; color?: string }) => Promise<void> | void;
  onDeleteStaffRole?: (id: string) => Promise<void> | void;
}

const COLOR_OPTIONS = [
  { id: 'teal', label: 'Teal', bg: 'bg-teal-500/15', text: 'text-teal-700', border: 'border-teal-500/30', swatch: 'bg-teal-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500/15', text: 'text-indigo-700', border: 'border-indigo-500/30', swatch: 'bg-indigo-500' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500/15', text: 'text-blue-700', border: 'border-blue-500/30', swatch: 'bg-blue-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500/15', text: 'text-purple-700', border: 'border-purple-500/30', swatch: 'bg-purple-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500/15', text: 'text-emerald-700', border: 'border-emerald-500/30', swatch: 'bg-emerald-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500/15', text: 'text-amber-700', border: 'border-amber-500/30', swatch: 'bg-amber-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500/15', text: 'text-rose-700', border: 'border-rose-500/30', swatch: 'bg-rose-500' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-500/15', text: 'text-sky-700', border: 'border-sky-500/30', swatch: 'bg-sky-500' }
];

export const AdminTopicsTab: React.FC<AdminTopicsTabProps> = ({
  topics,
  onToggleFeature,
  onTogglePopular,
  onDeleteTopic,
  onOpenNewTopicModal,
  onViewTopic,
  onUpdateTopic,
  categories = [],
  staffRoles = [],
  onAddCategory,
  onDeleteCategory,
  onAddStaffRole,
  onDeleteStaffRole
}) => {
  const { formatTimeAgo, formatNumber } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Topic edit modal state
  const [topicToEdit, setTopicToEdit] = useState<ForumTopic | null>(null);

  // Deletion modals state
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<DiscussionCategory | null>(null);
  const [staffRoleToDelete, setStaffRoleToDelete] = useState<StaffRoleBadge | null>(null);

  // Discussion Manager Panel state
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [managerTab, setManagerTab] = useState<'categories' | 'roles'>('categories');

  // New Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // New Staff Role Form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleBadgeLabel, setNewRoleBadgeLabel] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('teal');
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Combined categories for board filtering (dynamic metadata + topics categories)
  const boardCategories = useMemo(() => {
    const metaNames = categories.map(c => typeof c === 'string' ? c : c.name);
    const topicNames = topics.map(t => t.category);
    const combined = Array.from(new Set([...metaNames, ...topicNames])).filter(Boolean);
    return ['all', ...combined];
  }, [categories, topics]);

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.author.toLowerCase().includes(search.toLowerCase()) ||
                          t.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTopicCountForCategory = (catName: string) => {
    return topics.filter(t => t.category.toLowerCase() === catName.toLowerCase()).length;
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName || !onAddCategory) return;

    try {
      setIsSavingCategory(true);
      await onAddCategory({
        name: cleanName,
        description: newCatDescription.trim() || undefined
      });
      setNewCatName('');
      setNewCatDescription('');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleCreateStaffRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newRoleName.trim();
    if (!cleanName || !onAddStaffRole) return;

    try {
      setIsSavingRole(true);
      await onAddStaffRole({
        name: cleanName,
        badgeLabel: newRoleBadgeLabel.trim() || cleanName,
        color: newRoleColor
      });
      setNewRoleName('');
      setNewRoleBadgeLabel('');
      setNewRoleColor('teal');
    } finally {
      setIsSavingRole(false);
    }
  };

  const renderBadge = (label?: string, color?: string) => {
    const theme = COLOR_OPTIONS.find(c => c.id === color) || COLOR_OPTIONS[0];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${theme.bg} ${theme.text} ${theme.border}`}>
        {label || 'STAFF'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Discussions & Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Moderate community discussions, configure question categories, and assign staff badges.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsManagerOpen(!isManagerOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shadow-2xs ${
              isManagerOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>Categories & Roles</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {categories.length + staffRoles.length}
            </span>
            {isManagerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenNewTopicModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      {/* Discussion Category & Staff Badge Management Section */}
      {isManagerOpen && (
        <div className="rounded-xl p-5 bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Discussion Customization
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Categories are available when users post questions. Staff badges designate official responses.
              </p>
            </div>

            {/* Sub-tabs switch */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setManagerTab('categories')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  managerTab === 'categories'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                <span>Categories</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200/80 text-slate-700">
                  {categories.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setManagerTab('roles')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  managerTab === 'roles'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Staff Badges</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200/80 text-slate-700">
                  {staffRoles.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: Categories Management */}
          {managerTab === 'categories' && (
            <div className="space-y-5">
              {/* Add Category Form */}
              <form onSubmit={handleCreateCategory} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <FolderPlus className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Add Category
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Cloud Architecture, DevOps..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCatDescription}
                      onChange={(e) => setNewCatDescription(e.target.value)}
                      placeholder="Short summary for this category"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSavingCategory || !newCatName.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSavingCategory ? 'Saving...' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Categories List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Existing Categories ({categories.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Displayed in "Post Question" and filter dropdowns
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const catObj: DiscussionCategory = typeof cat === 'string' 
                      ? { id: cat, name: cat, slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-') } 
                      : cat;
                    const topicCount = getTopicCountForCategory(catObj.name);

                    return (
                      <div
                        key={catObj.id || catObj.name}
                        className="group flex items-start justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <h4 className="font-semibold text-xs text-slate-900 truncate">
                              {catObj.name}
                            </h4>
                          </div>

                          {catObj.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {catObj.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-600">
                              {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono truncate">
                              /{catObj.slug}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(catObj)}
                          title="Remove category"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Staff Roles & Badges Management */}
          {managerTab === 'roles' && (
            <div className="space-y-5">
              {/* Add Staff Role Form */}
              <form onSubmit={handleCreateStaffRole} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Add Staff Role & Badge
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Role Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g. Lead Architect"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={newRoleBadgeLabel}
                      onChange={(e) => setNewRoleBadgeLabel(e.target.value)}
                      placeholder="e.g. LEAD, MOD"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {COLOR_OPTIONS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setNewRoleColor(col.id)}
                          className={`w-5 h-5 rounded-md transition-transform cursor-pointer ${col.swatch} ${
                            newRoleColor === col.id ? 'ring-2 ring-offset-1 ring-slate-900 scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={col.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSavingRole || !newRoleName.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSavingRole ? 'Saving...' : 'Add'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">Preview:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {newRoleName.trim() || 'Role Title'}
                    </span>
                    {renderBadge(newRoleBadgeLabel.trim() || newRoleName.trim() || 'BADGE', newRoleColor)}
                  </div>
                </div>
              </form>

              {/* Staff Roles List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Configured Badges ({staffRoles.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Available in official topics
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {staffRoles.map((role) => {
                    const roleObj: StaffRoleBadge = typeof role === 'string'
                      ? { id: role, name: role, badgeLabel: role, color: 'teal' }
                      : role;

                    return (
                      <div
                        key={roleObj.id || roleObj.name}
                        className="group flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">
                            {roleObj.name}
                          </h4>
                          <div className="mt-1">
                            {renderBadge(roleObj.badgeLabel || roleObj.name, roleObj.color)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setStaffRoleToDelete(roleObj)}
                          title="Remove badge"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl p-3 bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions by title or author..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>

        {/* Dynamic Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Category:
          </span>
          {boardCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer capitalize border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Boards' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Table Card */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Topic / Author</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Engagement</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Topic Title & Author */}
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="flex items-start gap-2.5">
                      <img
                        src={topic.authorAvatar}
                        alt={topic.author}
                        className="w-7 h-7 rounded-lg ring-1 ring-slate-200 object-cover shrink-0 mt-0.5"
                      />
                      <div className="min-w-0">
                        <button
                          onClick={() => onViewTopic(topic)}
                          className="font-semibold text-xs text-slate-900 hover:text-teal-700 transition-colors text-left line-clamp-1 cursor-pointer"
                        >
                          {topic.title}
                        </button>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          By <span className="font-medium text-slate-700">{topic.author}</span> • {formatTimeAgo(topic.createdAt || topic.timeAgo)}
                        </p>
                        {topic.content && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {topic.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                      {topic.category}
                    </span>
                  </td>

                  {/* Engagement */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-500 text-[11px] font-mono">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {formatNumber(topic.views)}
                      </span>
                      <span className="flex items-center gap-1" title="Replies">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        {formatNumber(topic.repliesList?.length ?? topic.replies)}
                      </span>
                      <span className="flex items-center gap-1" title="Likes">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        {formatNumber(topic.likes)}
                      </span>
                    </div>
                  </td>

                  {/* Badges / Flags */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {topic.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {topic.isPopular && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                          <Star className="w-2.5 h-2.5" /> Hot
                        </span>
                      )}
                      {!topic.isFeatured && !topic.isPopular && (
                        <span className="text-[11px] text-slate-400 font-mono">-</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Toggle Pin/Featured */}
                      <button
                        onClick={() => onToggleFeature(topic.id)}
                        title={topic.isFeatured ? "Unpin Topic" : "Pin Topic to Top"}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          topic.isFeatured 
                            ? 'bg-amber-50 border-amber-200 text-amber-700' 
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Hot/Popular */}
                      <button
                        onClick={() => onTogglePopular(topic.id)}
                        title={topic.isPopular ? "Remove Hot status" : "Mark as Hot Topic"}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          topic.isPopular 
                            ? 'bg-teal-50 border-teal-200 text-teal-700' 
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>

                      {/* View Topic Detail */}
                      <button
                        onClick={() => onViewTopic(topic)}
                        title="Preview Discussion"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Topic */}
                      <button
                        onClick={() => setTopicToEdit(topic)}
                        title="Edit Discussion Post"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setTopicToDelete(topic)}
                        title="Delete Discussion"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTopics.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No discussions matching your filter criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or category selection</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Topic Deletion */}
      <DeleteConfirmModal
        isOpen={Boolean(topicToDelete)}
        onClose={() => setTopicToDelete(null)}
        onConfirm={() => {
          if (topicToDelete) {
            onDeleteTopic(topicToDelete.id);
            setTopicToDelete(null);
          }
        }}
        title="Delete Discussion Post"
        itemTitle={topicToDelete?.title}
        message="Are you sure you want to delete this discussion post? This action will permanently remove it and all replies from the database."
        confirmLabel="Delete Post"
      />

      {/* Confirmation Modal for Category Deletion */}
      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete && onDeleteCategory) {
            onDeleteCategory(categoryToDelete.id || categoryToDelete.name);
            setCategoryToDelete(null);
          }
        }}
        title="Delete Discussion Category"
        itemTitle={categoryToDelete?.name}
        message="Are you sure you want to remove this category? It will no longer appear when users ask questions or filter community discussion boards."
        confirmLabel="Delete Category"
      />

      {/* Confirmation Modal for Staff Role Deletion */}
      <DeleteConfirmModal
        isOpen={Boolean(staffRoleToDelete)}
        onClose={() => setStaffRoleToDelete(null)}
        onConfirm={() => {
          if (staffRoleToDelete && onDeleteStaffRole) {
            onDeleteStaffRole(staffRoleToDelete.id || staffRoleToDelete.name);
            setStaffRoleToDelete(null);
          }
        }}
        title="Delete Staff Badge & Role"
        itemTitle={staffRoleToDelete?.name}
        message="Are you sure you want to remove this staff badge? It will no longer appear as an official author designation option."
        confirmLabel="Delete Staff Role"
      />

      {/* Edit Topic Modal for Admin */}
      <EditTopicModal
        isOpen={Boolean(topicToEdit)}
        topic={topicToEdit}
        onClose={() => setTopicToEdit(null)}
        onSubmit={async (data) => {
          if (onUpdateTopic) {
            await onUpdateTopic(data);
          }
          setTopicToEdit(null);
        }}
        categories={categories}
      />
    </div>
  );
};
