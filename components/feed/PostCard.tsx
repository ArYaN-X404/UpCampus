'use client';

import React from 'react';
import { Post } from '@/lib/types';
import { useUpCampus } from '@/lib/store';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Building2, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface PostCardProps {
  post: Post;
  showVoteRail?: boolean;
}

export default function PostCard({ post, showVoteRail = true }: PostCardProps) {
  const { upvotePost, downvotePost, verifyPost } = useUpCampus();

  const getStatusBadge = () => {
    switch (post.status) {
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Under Review
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'awaiting_verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
            Awaiting Verification
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Solved & Verified
          </span>
        );
      case 'reopened':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            Reopened by Students
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-campus-teal/10 text-campus-teal border border-campus-teal/30">
            Approved (Ranked)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-950/40 text-yellow-300 border border-yellow-600/40">
            Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = () => {
    if (post.severity === 3 || post.safety_risk) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-campus-pink bg-campus-pink/10 border border-campus-pink/30 px-2 py-0.5 rounded-md">
          <ShieldAlert className="w-3 h-3" />
          Safety Risk
        </span>
      );
    }
    if (post.severity === 2) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-campus-amber bg-campus-amber/10 border border-campus-amber/30 px-2 py-0.5 rounded-md">
          Disruptive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-md">
        Minor
      </span>
    );
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5 transition-all hover:border-slate-600 hover:shadow-lg relative overflow-hidden group">
      {/* Safety Risk Ambient Top Glow */}
      {post.safety_risk && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-campus-pink via-red-500 to-campus-amber"></div>
      )}

      <div className="flex items-start gap-4">
        {/* Left Vote Rail */}
        {showVoteRail && (
          <div className="flex flex-col items-center bg-campus-bg/70 border border-campus-border rounded-xl p-1 sm:p-1.5 min-w-[48px] self-start select-none">
            <button
              onClick={() => upvotePost(post.id)}
              className={`p-1.5 rounded-lg transition-all ${
                post.user_vote === 1
                  ? 'bg-campus-teal text-campus-bg shadow-glow'
                  : 'text-slate-400 hover:text-campus-teal hover:bg-campus-teal/10'
              }`}
              title="Agree / Upvote"
              aria-label="Upvote"
            >
              <ChevronUp className="w-5 h-5 stroke-[2.5]" />
            </button>

            <span
              className={`text-xs sm:text-sm font-extrabold my-1 tabular-nums ${
                post.user_vote === 1
                  ? 'text-campus-teal'
                  : post.user_vote === -1
                  ? 'text-campus-pink'
                  : 'text-slate-200'
              }`}
            >
              {post.net_votes ?? post.agree_count - post.disagree_count}
            </span>

            <button
              onClick={() => downvotePost(post.id)}
              className={`p-1.5 rounded-lg transition-all ${
                post.user_vote === -1
                  ? 'bg-campus-pink text-campus-bg shadow-sm'
                  : 'text-slate-400 hover:text-campus-pink hover:bg-campus-pink/10'
              }`}
              title="Disagree / Downvote"
              aria-label="Downvote"
            >
              <ChevronDown className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {getStatusBadge()}
            {getSeverityBadge()}
            
            <span className="text-[11px] font-medium text-slate-400 bg-campus-surface border border-campus-border px-2 py-0.5 rounded-md flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              {post.department}
            </span>

            {post.location && (
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto">
                <MapPin className="w-3 h-3 text-campus-teal" />
                {post.location.name}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`} className="block group-hover:text-campus-teal transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight">
              {post.title}
            </h3>
          </Link>

          {/* Description */}
          {post.description && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1.5 leading-relaxed font-sans">
              {post.description}
            </p>
          )}

          {/* Photos Preview */}
          {post.photos && post.photos.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              {post.photos.slice(0, 2).map((photo, i) => (
                <div
                  key={i}
                  className="w-20 h-14 rounded-lg overflow-hidden border border-campus-border bg-slate-900 flex-shrink-0"
                >
                  <img
                    src={photo}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              ))}
              {post.ai_meta?.confidence && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-campus-surface/80 border border-campus-border px-2 py-1 rounded-md">
                  <Sparkles className="w-3 h-3 text-campus-teal" />
                  AI Triage: {Math.round(post.ai_meta.confidence * 100)}% Match
                </span>
              )}
            </div>
          )}

          {/* Verification Banner if Awaiting Student Consensus */}
          {post.status === 'awaiting_verification' && (
            <div className="mt-3.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-purple-200">
                    Admin claims this issue is resolved. Have you checked it on site?
                  </p>
                  <p className="text-[10px] text-purple-300/80">
                    Needs 5 student confirmations to enter Solved Archive.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => verifyPost(post.id, true)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
                >
                  Yes, It&apos;s Fixed
                </button>
                <button
                  onClick={() => verifyPost(post.id, false)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                >
                  No, Still Broken
                </button>
              </div>
            </div>
          )}

          {/* Footer Card Telemetry */}
          <div className="mt-3.5 pt-3 border-t border-campus-border/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-300">
                {post.anonymous ? '🔒 Anonymous Student' : post.author_name || 'Student'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(post.created_at)}
              </span>
            </div>

            {/* Impact Badge */}
            <div
              className="flex items-center gap-1.5 bg-campus-bg/80 border border-campus-border px-2.5 py-1 rounded-lg text-slate-200 cursor-help"
              title="Impact Score = Net Votes × Severity Multiplier + Age Factor + Safety Risk Bump"
            >
              <Flame className="w-3.5 h-3.5 text-campus-amber fill-campus-amber/20" />
              <span className="font-bold text-xs tabular-nums text-campus-amber">
                {post.impact_score?.toFixed(1) || '0.0'}
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Impact</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
