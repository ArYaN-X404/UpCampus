'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Share2,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = String(params?.id || '');

  const { 
    posts, 
    comments, 
    addComment, 
    deleteComment, 
    deletePost, 
    vote, 
    currentUser, 
    isAdmin 
  } = useUpCampus();

  const [commentInput, setCommentInput] = useState('');
  const [copied, setCopied] = useState(false);

  const post = posts.find((p) => String(p.id) === postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#070D1E] text-softWhite flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Ticket Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          This post may have been resolved, removed by its author, or never existed.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Feed</span>
        </Link>
      </div>
    );
  }

  const postComments = comments[post.id] || [];
  const isOwner = currentUser?.id === post.author_id || post.author_id === 'student-1' || isAdmin;
  const isGrievance = post.kind === 'grievance';
  const isSolved = post.status === 'resolved';

  const handleDeletePost = () => {
    if (window.confirm('Delete this campus ticket? This action is irreversible.')) {
      deletePost(post.id);
      router.push('/');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      deleteComment(post.id, commentId);
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'just now';
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) return 'recently';
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-softWhite py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campus Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors relative"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDeletePost}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Post Content Card */}
        <div className="bg-[#0B1530] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md font-bold ${
                isGrievance ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {isGrievance ? 'Broken (Fix It)' : 'Needs (Add It)'}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{post.location_name || 'Campus Grounds'}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{getTimeAgo(post.created_at)}</span>
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isSolved 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}>
              {isSolved ? 'Resolved' : 'Active'}
            </span>
          </div>

          {/* Title & Author */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-xs text-slate-400">
              Reported by <strong className="text-slate-200">{post.author_name || 'Anonymous Student'}</strong> ({post.department || 'Campus Facilities'})
            </p>
          </div>

          {/* Description */}
          {post.description && (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
              {post.description}
            </p>
          )}

          {/* Photos */}
          {post.photos && post.photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {post.photos.map((src, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-700/80 bg-black aspect-video max-h-72">
                  <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Vote Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => vote(post.id, 1)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                post.user_vote === 1 
                  ? 'bg-freshGreen text-deepNavy font-extrabold shadow-md' 
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ChevronUp className="w-4 h-4 stroke-[3]" />
              <span>Agree / Upvote ({post.agree_count})</span>
            </button>

            <span className="text-xs text-slate-400">
              Impact Score: <strong className="text-white font-bold">{post.impact_score || 1.0}</strong>
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#0B1530] border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Student & Faculty Updates ({postComments.length})</span>
            </h2>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={`Add a comment as @${currentUser?.display_name?.toLowerCase().replace(/\s+/g, '_') || 'student'}...`}
              className="flex-1 bg-[#091124] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Update</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {postComments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No updates posted yet. Students and faculty can contribute on-site verifications here.
              </p>
            ) : (
              postComments.map((c) => {
                const isCommentOwner = c.author_id === currentUser?.id || c.author_id === 'student-1' || isAdmin;
                return (
                  <div key={c.id} className="p-3.5 rounded-xl bg-[#091124] border border-slate-800 flex items-start justify-between gap-3 text-xs sm:text-sm">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">@{c.author_handle || c.author_name}</span>
                        <span className="text-[11px] text-slate-500">• {getTimeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed break-words">{c.text}</p>
                    </div>
                    {isCommentOwner && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                        title="Delete your comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
