import React from 'react';
import { Calendar, Tag, ArrowUpRight, Heart, MessageSquare, Lock } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogSectionProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onShowMore: () => void;
  hasMore: boolean;
  currentUser?: { name: string; email: string; role: string; avatar?: string } | null;
  onRequireAuth?: (prompt?: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  onSelectPost,
  onShowMore,
  hasMore,
  currentUser,
  onRequireAuth
}) => {
  const handleCardClick = (post: BlogPost) => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('To participate in blog activities and read full articles, you must have an account and be logged in. Please sign in or create an account.');
      }
      return;
    }
    onSelectPost(post);
  };

  return (
    <section id="blog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Centered Heading */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Ama Blogs
          </h2>
          {!currentUser && (
            <button
              type="button"
              onClick={() => onRequireAuth?.('To participate in blog activities, like articles, and read full content, you must have an account and be logged in.')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Login Required to Participate</span>
            </button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto px-2">
          Insights, architectural tutorials, and product documentation from our core engineering team.
        </p>
      </div>

      {/* 3-Column Card Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/80 dark:border-white/10 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No blog articles published yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Articles published from the admin console will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => handleCardClick(post)}
              className="group rounded-3xl bg-white/75 dark:bg-white/10 backdrop-blur-xl border border-white/80 dark:border-white/20 overflow-hidden hover:bg-white/90 dark:hover:bg-white/15 hover:border-white shadow-[0_8px_30px_rgb(31,38,135,0.06)] hover:shadow-[0_16px_36px_rgb(31,38,135,0.12)] transition-all duration-300 cursor-pointer flex flex-col h-full relative"
            >
              {/* Image Container with high quality photography */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-slate-950/60 via-transparent to-transparent opacity-70" />
                
                {/* Blog Activity Metrics Badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/65 backdrop-blur-md text-white text-[11px] font-medium shadow-xs">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                    <span>{post.likes || 0}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-teal-300" />
                    <span>{post.commentsCount || 0}</span>
                  </span>
                </div>

                {!currentUser && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-amber-300 text-[10px] font-semibold border border-amber-400/30 shadow-xs">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Login to Read & React</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta Row: Date & Category */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-700 dark:text-teal-300 font-medium">
                      <Tag className="w-3 h-3" />
                      <span>{post.category}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors font-heading mb-2.5 leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author Footer */}
                <div className="pt-4 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-white/60 dark:border-white/20 shadow-xs"
                    />
                    <div>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {post.author}
                      </h5>
                      <p className="text-[11px] text-slate-400">{post.date}</p>
                    </div>
                  </div>

                  <span className="p-2 rounded-full bg-white/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 group-hover:bg-[#00a8b5] group-hover:text-white transition-all shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Show More Button (green #007a64 matching reference image) */}
      {posts.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={onShowMore}
            id="blog-show-more-btn"
            className="inline-flex items-center justify-center px-7 py-2.5 min-h-[44px] rounded-full bg-[#007a64] hover:bg-[#006653] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            {hasMore ? 'Show More' : 'All Articles Loaded'}
          </button>
        </div>
      )}
    </section>
  );
};
