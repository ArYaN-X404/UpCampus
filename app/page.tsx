'use client';

import React, { useState, useMemo } from 'react';
import { useUpCampus } from '@/lib/store';
import PostCard from '@/components/feed/PostCard';
import NewPostModal from '@/components/post/NewPostModal';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function FeedPage() {
  const { posts } = useUpCampus();
  const [activeTab, setActiveTab] = useState<'all' | 'grievance' | 'suggestion'>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'top' | 'new'>('impact');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  // Filter approved or public posts
  const publicPosts = useMemo(() => {
    return posts.filter((p) => {
      // Pending and rejected posts are in supervisor queue or hidden
      if (['pending', 'rejected'].includes(p.status)) return false;

      // Tab filter
      if (activeTab !== 'all' && p.kind !== activeTab) return false;

      // Category filter
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${p.title} ${p.description || ''} ${p.department} ${p.location?.name || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [posts, activeTab, selectedCategory, searchQuery]);

  // Sort logic
  const sortedPosts = useMemo(() => {
    return [...publicPosts].sort((a, b) => {
      if (sortBy === 'impact') {
        return (b.impact_score || 0) - (a.impact_score || 0);
      }
      if (sortBy === 'top') {
        const netA = a.agree_count - a.disagree_count;
        const netB = b.agree_count - b.disagree_count;
        return netB - netA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [publicPosts, sortBy]);

  // High priority lane (Safety risks)
  const safetyPosts = useMemo(() => {
    return sortedPosts.filter((p) => p.safety_risk && p.status !== 'resolved');
  }, [sortedPosts]);

  return (
    <div className="space-y-6">
      {/* Hero Strip */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-campus-surface via-campus-surface/90 to-campus-bg border border-campus-border p-6 sm:p-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-campus-teal/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -top-10 w-48 h-48 bg-campus-pink/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-campus-teal/15 border border-campus-teal/30 text-campus-teal text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Resolution Loop</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
              Fix what is broken. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-campus-teal via-teal-200 to-campus-amber">
                Build what is missing.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Vote on campus priorities. When administration acts, students verify the physical fix on-site before closure.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto bg-campus-bg/80 border border-campus-border rounded-2xl p-4 self-stretch md:self-auto">
            <div className="text-center px-2">
              <span className="block text-lg sm:text-xl font-extrabold text-campus-teal font-heading">
                38
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Fixed This Term
              </span>
            </div>
            <div className="text-center px-2 border-x border-campus-border">
              <span className="block text-lg sm:text-xl font-extrabold text-campus-amber font-heading">
                1.4d
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Avg Response
              </span>
            </div>
            <div className="text-center px-2">
              <span className="block text-lg sm:text-xl font-extrabold text-campus-pink font-heading">
                92%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Student Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar: Tabs, Search, Filters, Primary CTA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Segmented Feed Tabs */}
        <div className="flex items-center bg-campus-surface border border-campus-border p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-campus-teal text-campus-bg shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setActiveTab('grievance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'grievance'
                ? 'bg-campus-pink text-campus-bg shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fix (Grievances)
          </button>
          <button
            onClick={() => setActiveTab('suggestion')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'suggestion'
                ? 'bg-campus-amber text-campus-bg shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Build (Suggestions)
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus issues..."
              className="w-full bg-campus-surface border border-campus-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-campus-teal transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'impact' | 'top' | 'new')}
            className="bg-campus-surface border border-campus-border rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-campus-teal"
          >
            <option value="impact">⚡ Impact Score</option>
            <option value="top">▲ Top Upvoted</option>
            <option value="new">🕒 Newest First</option>
          </select>

          {/* Primary CTA */}
          <button
            onClick={() => setIsNewPostOpen(true)}
            className="px-4 py-2 bg-campus-teal hover:bg-teal-300 text-campus-bg font-extrabold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Safety Priorities Lane (if any) */}
      {safetyPosts.length > 0 && activeTab !== 'suggestion' && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-campus-pink">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>Needs Attention Today (Safety Risk Queue)</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {safetyPosts.slice(0, 1).map((post) => (
              <PostCard key={`safety-${post.id}`} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Main Stream Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{sortedPosts.length}</strong> active campus issues
          </span>
          <span className="hidden sm:inline">
            Ranked by {sortBy === 'impact' ? 'Severity × Multiplier + Age' : sortBy}
          </span>
        </div>

        {sortedPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-campus-surface/50 border border-campus-border space-y-3">
            <CheckCircle2 className="w-10 h-10 text-campus-teal mx-auto" />
            <h3 className="text-base font-bold text-white font-heading">
              No campus issues match your filter
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Everything in this category is currently operating smoothly or waiting for student reports.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* New Post Modal */}
      <NewPostModal isOpen={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} />
    </div>
  );
}
