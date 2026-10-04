import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag, 
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Knowledge Base & Articles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish and curate official tutorials, guides, and documentation ({blogs.length} published).
          </p>
        </div>

        <button
          onClick={onOpenNewBlogModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Article</span>
        </button>
      </div>

      {/* Search filter */}
      <div className="rounded-xl p-3 bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by article title, category, or author..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 focus:outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Knowledge Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-white/95 text-slate-800 border border-slate-200/60 shadow-2xs">
                  {blog.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>By {blog.author}</span>
                </div>

                <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                  {blog.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => onViewBlog(blog)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Read Article
              </button>

              <button
                onClick={() => onDeleteBlog(blog.id)}
                title="Delete article"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
