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
        className="flex items-center gap-1.5 text-xs font-semibold text-paleBlueGrey hover:text-softWhite transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-skyBlue" />
        <span>Back to Campus Feed</span>
      </button>

      {/* Main Post Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-paleBlueGrey/20">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-paleBlueGrey/15">
          <div className="flex items-center gap-2">
            <span className="badge-sky px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            {post.safety_risk && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-500/40 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Safety Risk
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-paleBlueGrey">
            <Clock className="w-3.5 h-3.5 text-skyBlue" />
            <span>Reported recently</span>
          </div>
        </div>

        {/* Title & Author */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-3xl font-extrabold text-softWhite leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-paleBlueGrey">
            <span>Posted by: <strong className="text-softWhite">{post.anonymous ? '🔒 Anonymous Student' : post.author_name}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-skyBlue" />
              {post.location_name || post.location?.name || 'Campus Grounds'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-mintGreen" />
              Dept: {post.department}
            </span>
          </div>
        </div>

        {/* Big Photo Preview */}
        {post.photos && post.photos.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-paleBlueGrey/20 max-h-96 bg-deepNavy shadow-inner">
            <img src={post.photos[0]} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        {post.description && (
          <div className="p-4 rounded-2xl bg-deepNavy/80 border border-paleBlueGrey/15 text-sm text-softWhite leading-relaxed font-sans font-medium">
            {post.description}
          </div>
        )}

        {/* Pinned Official Remark */}
        <div className="p-4 rounded-2xl bg-darkBlue/80 border border-mintGreen/30 space-y-1.5">
          <div className="flex items-center gap-2 text-mintGreen text-xs font-bold uppercase tracking-wider">
            <Pin className="w-4 h-4 fill-mintGreen" />
            <span>Pinned Official Administrative Remark</span>
          </div>
          <p className="text-xs sm:text-sm text-softWhite italic leading-relaxed">
            {post.admin_note || '"Work order issued to facility maintenance team. Vendor inspecting fixtures on site."'}
          </p>
          <span className="text-[10px] text-mintGreen/80 block pt-1">
            — Campus Administration • Recorded on Ledger
          </span>
        </div>

        {/* Community Verification Prompt if Awaiting */}
        {post.status === 'awaiting_verification' && (
          <div className="p-5 rounded-2xl badge-mint border border-mintGreen/40 space-y-3">
            <div className="flex items-center gap-2 text-mintGreen font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-mintGreen" />
              <span>Admin marked this issue as Solved. Does reality on campus match?</span>
            </div>
            <p className="text-xs text-paleBlueGrey">
              Your physical verification vote holds the administration accountable. 5 confirmations move this to the permanent Solved Archive.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => verifyPost(post.id, true)}
                className="btn-fresh-green text-deepNavy font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg transition-all"
              >
                Yes, Verified Fixed On-Site
              </button>
              <button
                onClick={() => verifyPost(post.id, false)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs rounded-xl transition-all"
              >
                No, Still Broken
              </button>
            </div>
          </div>
        )}

        {/* Voting & Impact Bar */}
        <div className="p-4 rounded-2xl bg-deepNavy/80 border border-paleBlueGrey/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-darkBlue border border-paleBlueGrey/20 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => upvotePost(post.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  post.user_vote === 1
                    ? 'badge-sky text-skyBlue shadow-sm'
                    : 'text-paleBlueGrey hover:text-softWhite'
                }`}
              >
                <ChevronUp className="w-4 h-4 stroke-[3]" />
                <span>Agree ({post.agree_count})</span>
              </button>
              <button
                onClick={() => downvotePost(post.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  post.user_vote === -1
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-paleBlueGrey hover:text-softWhite'
                }`}
              >
                <ChevronDown className="w-4 h-4 stroke-[3]" />
                <span>Disagree ({post.disagree_count})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="font-bold text-softWhite">Impact Score: {post.impact_score?.toFixed(1)}</span>
            <span className="text-paleBlueGrey text-[11px]">(Ranked #{post.impact_score && post.impact_score > 100 ? '1' : '3'} on campus)</span>
          </div>
        </div>

        {/* Public Status Timeline */}
        <div className="space-y-4 pt-4 border-t border-paleBlueGrey/15">
          <h3 className="text-sm font-bold uppercase tracking-wider text-paleBlueGrey">
            Public Resolution Timeline & Ledger
          </h3>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-paleBlueGrey/20">
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full badge-sky flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-skyBlue"></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-softWhite block">Submitted by Student with Photo Evidence</span>
                <span className="text-[11px] text-paleBlueGrey block">AI Triage tagged {post.department} • 3 days ago</span>
              </div>
            </div>

            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full badge-mint flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-mintGreen"></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-softWhite block">Approved by Student Supervisor Priya P.</span>
                <span className="text-[11px] text-paleBlueGrey block">Passed fraud & duplicate screening • Published to vote-ranking feed</span>
              </div>
            </div>

            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-skyBlue/20 text-skyBlue border border-skyBlue/40 flex items-center justify-center flex-shrink-0 z-10">
                <span className="w-2 h-2 rounded-full bg-skyBlue animate-pulse"></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-softWhite block">Status Updated to In Progress</span>
                <span className="text-[11px] text-paleBlueGrey block">Estate Office issued Work Order • 1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Comments */}
        <div className="space-y-4 pt-6 border-t border-paleBlueGrey/15">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-paleBlueGrey">
            <MessageSquare className="w-4 h-4 text-skyBlue" />
            <span>Student Discussion ({localComments.length})</span>
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add on-site update or question..."
              className="flex-1 bg-deepNavy/80 border border-paleBlueGrey/25 rounded-xl px-4 py-2 text-xs text-softWhite placeholder-paleBlueGrey/50 focus:outline-none focus:border-skyBlue shadow-inner"
            />
            <button
              type="submit"
              className="btn-fresh-green text-deepNavy font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>

          <div className="space-y-2.5">
            {localComments.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-deepNavy/60 border border-paleBlueGrey/15 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-softWhite">{c.author}</span>
                  <span className="text-paleBlueGrey/60">{c.time}</span>
                </div>
                <p className="text-xs text-paleBlueGrey leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
