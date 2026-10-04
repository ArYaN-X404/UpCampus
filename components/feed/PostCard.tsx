'use client';

import React from 'react';
import { Post } from '@/lib/types';
import { useUpCampus } from '@/lib/store';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Wrench, 
  Plus, 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import Link from 'next/link';

interface PostCardProps {
  post: Post;
  onResolveClick?: (postId: string) => void;
}

export default function PostCard({ post, onResolveClick }: PostCardProps) {
  const { vote, isAdmin } = useUpCampus();

  const isEscalated = post.agree_count >= 100 && post.status !== 'resolved';
  const isSolved = post.status === 'resolved';

  return (
    <div
      className={`glass-card rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start fade-in transition-all duration-300 ${
        isEscalated
          ? 'border-red-500/60 shadow-xl shadow-red-500/10'
          : 'border-paleBlueGrey/15 hover:border-skyBlue/40'
      }`}
    >
      {/* Voting Column */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-start bg-deepNavy/80 border border-paleBlueGrey/20 rounded-2xl p-2 shrink-0 w-full sm:w-16 shadow-inner">
        <button
          onClick={() => vote(post.id, 1)}
          disabled={isSolved}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            post.user_vote === 1
              ? 'text-skyBlue bg-skyBlue/20 border border-skyBlue/40 shadow-sm'
              : 'text-paleBlueGrey/70 hover:bg-white/5 hover:text-softWhite'
          } ${isSolved ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
          title="Upvote / Agree"
          aria-label="Upvote"
        >
          <ChevronUp className="w-6 h-6 stroke-[2.5]" />
        </button>

        <span
          className={`text-base font-extrabold py-2 sm:py-3.5 tabular-nums ${
            isEscalated
              ? 'text-red-400'
              : 'text-softWhite'
          }`}
        >
          {post.agree_count}
        </span>

        <button
          onClick={() => vote(post.id, -1)}
          disabled={isSolved}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            post.user_vote === -1
              ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-sm'
              : 'text-paleBlueGrey/70 hover:bg-white/5 hover:text-softWhite'
          } ${isSolved ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
          title="Downvote"
          aria-label="Downvote"
        >
          <ChevronDown className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Post Content */}
      <div className="flex-1 w-full min-w-0 pt-0.5 space-y-3.5">
        {/* Category & Location Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {post.kind === 'grievance' ? (
            <span className="badge-sky text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
              <Wrench className="w-3.5 h-3.5 text-skyBlue" />
              <span>Fix It</span>
            </span>
          ) : (
            <span className="badge-mint text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
              <Plus className="w-3.5 h-3.5 text-mintGreen stroke-[3]" />
              <span>Add It</span>
            </span>
          )}

          <span className="text-xs font-semibold text-paleBlueGrey bg-white/5 border border-paleBlueGrey/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-skyBlue/70" />
            <span>{post.location_name || post.location?.name || 'Campus Grounds'}</span>
          </span>

          {post.department && (
            <span className="text-xs font-medium text-paleBlueGrey/70 hidden sm:inline-flex items-center gap-1 ml-auto">
              <Building2 className="w-3.5 h-3.5 text-paleBlueGrey/50" />
              <span>{post.department}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/post/${post.id}`} className="block group">
          <h3 className="text-xl sm:text-2xl font-extrabold text-softWhite group-hover:text-skyBlue transition-colors leading-snug tracking-tight">
            {post.title}
          </h3>
        </Link>

        {/* Description */}
        {post.description && (
          <p className="text-paleBlueGrey text-sm sm:text-base leading-relaxed font-medium">
            {post.description}
          </p>
        )}

        {/* Photos Preview */}
        {post.photos && post.photos.length > 0 && (
          <div className="pt-1 flex items-center gap-3">
            {post.photos.slice(0, 2).map((photo, i) => (
              <div
                key={i}
                className="w-24 h-16 rounded-xl overflow-hidden border border-paleBlueGrey/20 bg-deepNavy shadow-inner"
              >
                <img
                  src={photo}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        )}

        {/* Escalation Alert Banner (Triggered when 100+ votes hit!) */}
        {isEscalated && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 flex items-start sm:items-center gap-4 fade-in shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="bg-red-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 pulse-red">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-red-300 uppercase tracking-widest mb-0.5">
                Escalated (100+ Votes)
              </p>
              <p className="text-xs text-red-200/80 font-semibold">
                Admin notified. Automated reminders trigger every 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Solved Card View with Admin Remarks */}
        {isSolved ? (
          <div className="badge-mint rounded-2xl p-5 border border-mintGreen/30 w-full fade-in shadow-sm space-y-3">
            <div className="flex items-center text-mintGreen font-extrabold text-base">
              <div className="w-7 h-7 bg-mintGreen/20 text-mintGreen rounded-full flex items-center justify-center mr-2.5 border border-mintGreen/30">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Officially Resolved</span>
            </div>

            <div className="bg-deepNavy/85 px-5 py-4 rounded-xl border border-mintGreen/25 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-mintGreen"></div>
              <span className="text-mintGreen font-bold uppercase text-[10px] tracking-widest block mb-1">
                Admin Remarks
              </span>
              <p className="text-softWhite text-sm font-medium leading-relaxed">
                {post.admin_note || 'Issue addressed by campus administration on site.'}
              </p>
            </div>
          </div>
        ) : (
          /* Footer Meta & Admin Action Buttons */
          <div className="flex flex-wrap items-center justify-between border-t border-paleBlueGrey/15 pt-4 gap-4">
            <div className="flex items-center text-xs font-semibold text-paleBlueGrey/70">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-paleBlueGrey/50" />
              <span>Reported {post.author_name ? `by ${post.author_name}` : 'recently'}</span>
            </div>

            {isAdmin ? (
              <button
                onClick={() => onResolveClick?.(post.id)}
                className="btn-fresh-green text-deepNavy text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 ml-auto"
              >
                <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Admin: Mark Resolved</span>
              </button>
            ) : (
              <span className="badge-sky text-xs font-extrabold px-3.5 py-1.5 rounded-xl uppercase tracking-widest">
                Under Review
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
