import React, { useState } from 'react';
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
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ForumTopic } from '../../types';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

interface AdminTopicsTabProps {
  topics: ForumTopic[];
  onToggleFeature: (id: string) => void;
  onTogglePopular: (id: string) => void;
  onDeleteTopic: (id: string) => void;
  onOpenNewTopicModal: () => void;
  onViewTopic: (topic: ForumTopic) => void;
}

export const AdminTopicsTab: React.FC<AdminTopicsTabProps> = ({
  topics,
  onToggleFeature,
  onTogglePopular,
  onDeleteTopic,
  onOpenNewTopicModal,
  onViewTopic
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);

  const categories = ['all', ...Array.from(new Set(topics.map(t => t.category)))];

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.author.toLowerCase().includes(search.toLowerCase()) ||
                          t.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Forum Topics & Threads
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage, feature, pin, or moderate discussions across community boards ({topics.length} total).
          </p>
        </div>

        <button
          onClick={onOpenNewTopicModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white text-xs font-semibold shadow-md shadow-teal-500/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <Plus className="w-4 h-4" />
          <span>Post Official Topic</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl p-4 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter topics by keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/80 border border-slate-200/80 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-teal-600" />
            Board:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer capitalize ${
                selectedCategory === cat
                  ? 'bg-teal-500/15 text-teal-700 font-semibold border border-teal-500/30'
                  : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {cat === 'all' ? 'All Boards' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Table Card */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Topic / Author</th>
                <th className="py-3.5 px-4">Board Category</th>
                <th className="py-3.5 px-4 text-center">Stats</th>
                <th className="py-3.5 px-4 text-center">Flags</th>
                <th className="py-3.5 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="hover:bg-teal-500/5 transition-colors group">
                  {/* Topic Title & Author */}
                  <td className="py-4 px-6 max-w-sm">
                    <div className="flex items-start gap-3">
                      <img
                        src={topic.authorAvatar}
                        alt={topic.author}
                        className="w-8 h-8 rounded-full ring-1 ring-slate-200 object-cover shrink-0 mt-0.5"
                      />
                      <div className="min-w-0">
                        <button
                          onClick={() => onViewTopic(topic)}
                          className="font-heading font-bold text-sm text-slate-900 hover:text-teal-600 transition-colors text-left line-clamp-1 cursor-pointer"
                        >
                          {topic.title}
                        </button>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          By <span className="font-semibold text-slate-700">{topic.author}</span> • {topic.timeAgo}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      {topic.category}
                    </span>
                  </td>

                  {/* Stats */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {topic.views}
                      </span>
                      <span className="flex items-center gap-1" title="Replies">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        {topic.replies}
                      </span>
                      <span className="flex items-center gap-1" title="Likes">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        {topic.likes}
                      </span>
                    </div>
                  </td>

                  {/* Badges / Flags */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {topic.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/20">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {topic.isPopular && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-700 border border-teal-500/20">
                          <Sparkles className="w-2.5 h-2.5" /> Hot
                        </span>
                      )}
                      {!topic.isFeatured && !topic.isPopular && (
                        <span className="text-[11px] text-slate-400">Standard</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Toggle Pin/Featured */}
                      <button
                        onClick={() => onToggleFeature(topic.id)}
                        title={topic.isFeatured ? "Unpin Topic" : "Pin Topic to Top"}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          topic.isFeatured 
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-700' 
                            : 'bg-white/80 border-slate-200/80 text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Hot/Popular */}
                      <button
                        onClick={() => onTogglePopular(topic.id)}
                        title={topic.isPopular ? "Remove Hot status" : "Mark as Hot Topic"}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          topic.isPopular 
                            ? 'bg-teal-500/20 border-teal-500/30 text-teal-700' 
                            : 'bg-white/80 border-slate-200/80 text-slate-500 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>

                      {/* View Topic Detail */}
                      <button
                        onClick={() => onViewTopic(topic)}
                        title="Preview Discussion"
                        className="p-2 rounded-xl bg-white/80 border border-slate-200/80 text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setTopicToDelete(topic)}
                        title="Delete Discussion"
                        className="p-2 rounded-xl bg-white/80 border border-slate-200/80 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or board selection</p>
          </div>
        )}
      </div>

      {/* Normal Confirmation Modal for Topic Deletion */}
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
    </div>
  );
};
