import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag, 
  Sparkles,
  Search
} from 'lucide-react';
import { BlogPost } from '../../types';

interface AdminBlogsTabProps {
  blogs: BlogPost[];
  onDeleteBlog: (id: string) => void;
  onOpenNewBlogModal: () => void;
  onViewBlog: (blog: BlogPost) => void;
}

export const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({
  blogs,
  onDeleteBlog,
  onOpenNewBlogModal,
  onViewBlog
}) => {
  const [search, setSearch] = useState('');

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Knowledge Base & Articles
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish and curate official tutorials, theme release logs, and architectural guides ({blogs.length} published).
          </p>
        </div>

        <button
          onClick={onOpenNewBlogModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007a64] hover:bg-[#006956] text-white text-xs font-semibold shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        >
          <Plus className="w-4 h-4" />
          <span>Write Technical Post</span>
        </button>
      </div>

      {/* Search filter */}
      <div className="rounded-2xl p-4 bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search article title, category, or author..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/80 border border-slate-200/80 focus:border-teal-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grid of Knowledge Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-teal-700 shadow-xs backdrop-blur-md">
                  {blog.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>By {blog.author}</span>
                </div>

                <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {blog.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => onViewBlog(blog)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Read Article
              </button>

              <button
                onClick={() => onDeleteBlog(blog.id)}
                title="Delete article"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
