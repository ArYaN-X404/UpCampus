'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Clock, 
  Pin, 
  CheckCircle2, 
  Flame, 
  MessageSquare, 
  Send, 
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { posts, upvotePost, downvotePost, verifyPost, currentUser } = useUpCampus();

  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Array<{ id: number; author: string; text: string; time: string }>>([
    {
      id: 1,
      author: 'Sneha Roy (Chem-26)',
      text: 'Verified this morning as well. It is really dark near the bend, glad someone reported it with a photo.',
      time: '2h ago',
    },
    {
      id: 2,
      author: 'Rohan Verma (CS-25)',
      text: 'Upvoted! Hope Estate team orders high-lumen LEDs instead of the old halogens.',
      time: '45m ago',
    },
  ]);

  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Campus Issue Not Found</h2>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-campus-teal text-campus-bg font-bold rounded-xl text-xs"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLocalComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: currentUser.display_name,
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    setCommentText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Feed</span>
      </button>

      {/* Main Post Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-campus-border">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-campus-border">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-campus-teal/20 text-campus-teal border border-campus-teal/40">
              {post.category}
            </span>
            {post.safety_risk && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-campus-pink/20 text-campus-pink border border-campus-pink/40 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Safety Risk
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Reported 3 days ago</span>
          </div>
        </div>

        {/* Title & Author */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Posted by: <strong className="text-slate-200">{post.anonymous ? '🔒 Anonymous Student' : post.author_name}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-campus-teal" />
              {post.location?.name || 'Campus'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-campus-amber" />
              Dept: {post.department}
            </span>
          </div>
        </div>

        {/* Big Photo Preview */}
        {post.photos && post.photos.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-campus-border max-h-96 bg-slate-900">
            <img src={post.photos[0]} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        {post.description && (
          <div className="p-4 rounded-2xl bg-campus-bg/70 border border-campus-border text-sm text-slate-200 leading-relaxed font-sans">
            {post.description}
          </div>
        )}

        {/* Pinned Official Remark */}
        <div className="p-4 rounded-2xl bg-campus-amber/10 border border-campus-amber/30 space-y-1.5">
          <div className="flex items-center gap-2 text-campus-amber text-xs font-bold uppercase tracking-wider">
            <Pin className="w-4 h-4 fill-campus-amber" />
            <span>Pinned Official Administrative Remark</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-100 italic leading-relaxed">
            &quot;Work order issued to facility electrical contractor. High-lumen weather-proof LED fittings arriving tomorrow morning.&quot;
          </p>
          <span className="text-[10px] text-amber-300/80 block pt-1">
            — Dr. V. Ramanathan, Estate Office Head • Yesterday at 4:15 PM
          </span>
        </div>

        {/* Community Verification Prompt if Awaiting */}
        {post.status === 'awaiting_verification' && (
          <div className="p-5 rounded-2xl bg-purple-950/50 border border-purple-500/50 space-y-3">
            <div className="flex items-center gap-2 text-purple-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              <span>Admin marked this issue as Solved. Does reality on campus match?</span>
            </div>
            <p className="text-xs text-purple-300/80">
              Your physical verification vote holds the administration accountable. 5 confirmations move this to the permanent Solved Archive.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => verifyPost(post.id, true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-glow transition-all"
              >
                Yes, Verified Fixed On-Site
              </button>
              <button
                onClick={() => verifyPost(post.id, false)}
                className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-all"
              >
                No, Still Broken
              </button>
            </div>
          </div>
        )}

        {/* Voting & Impact Bar */}
        <div className="p-4 rounded-2xl bg-campus-surface border border-campus-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-campus-bg border border-campus-border rounded-xl p-1">
              <button
                onClick={() => upvotePost(post.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  post.user_vote === 1
                    ? 'bg-campus-teal text-campus-bg shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ChevronUp className="w-4 h-4 stroke-[3]" />
                <span>Agree ({post.agree_count})</span>
              </button>
              <button
                onClick={() => downvotePost(post.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  post.user_vote === -1
                    ? 'bg-campus-pink text-campus-bg shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ChevronDown className="w-4 h-4 stroke-[3]" />
                <span>Disagree ({post.disagree_count})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Flame className="w-4 h-4 text-campus-amber fill-campus-amber" />
            <span className="font-bold text-white">Impact Score: {post.impact_score?.toFixed(1)}</span>
            <span className="text-slate-400 text-[11px]">(Ranked #{post.impact_score && post.impact_score > 100 ? '1' : '3'} on campus)</span>
          </div>
        </div>

        {/* Public Status Timeline */}
        <div className="space-y-4 pt-4 border-t border-campus-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Public Resolution Timeline & Ledger
          </h3>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-campus-border">
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-campus-teal/20 text-campus-teal border border-campus-teal flex items-center justify-center flex-shrink-0 z-10">
                <span className="w-2 h-2 rounded-full bg-campus-teal"></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Submitted by Student with Photo Evidence</span>
                <span className="text-[11px] text-slate-400 block">AI Triage tagged Electrical Maintenance • 3 days ago</span>
              </div>
            </div>

            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-campus-amber/20 text-campus-amber border border-campus-amber flex items-center justify-center flex-shrink-0 z-10">
                <span className="w-2 h-2 rounded-full bg-campus-amber"></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Approved by Student Supervisor Priya P.</span>
                <span className="text-[11px] text-slate-400 block">Passed fraud & duplicate screening • Published to vote-ranking feed</span>
              </div>
            </div>

            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500 flex items-center justify-center flex-shrink-0 z-10">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Status Updated to In Progress</span>
                <span className="text-[11px] text-slate-400 block">Estate Office issued Work Order #EL-409 • 1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Comments */}
        <div className="space-y-4 pt-6 border-t border-campus-border">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <MessageSquare className="w-4 h-4 text-campus-teal" />
            <span>Student Discussion ({localComments.length})</span>
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add on-site update or question..."
              className="flex-1 bg-campus-bg border border-campus-border rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-campus-teal"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-campus-teal hover:bg-teal-300 text-campus-bg font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>

          <div className="space-y-2.5">
            {localComments.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-campus-bg/60 border border-campus-border space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200">{c.author}</span>
                  <span className="text-slate-500">{c.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
