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
      className={`bg-white dark:bg-slate-800/90 rounded-[2rem] border-2 transition-all duration-300 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start fade-in ${
        isEscalated
          ? 'border-red-300 dark:border-red-800 shadow-xl shadow-red-500/10'
          : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Voting Column */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-start bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shrink-0 w-full sm:w-16 shadow-inner">
        <button
          onClick={() => vote(post.id, 1)}
          disabled={isSolved}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            post.user_vote === 1
              ? 'text-teal-600 bg-teal-100 dark:bg-teal-900/60 dark:text-teal-300 shadow-sm'
              : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white'
          } ${isSolved ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
          title="Upvote / Agree"
          aria-label="Upvote"
        >
          <ChevronUp className="w-6 h-6 stroke-[2.5]" />
        </button>

        <span
          className={`text-base font-extrabold py-2 sm:py-3.5 tabular-nums ${
            isEscalated
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {post.agree_count}
        </span>

        <button
          onClick={() => vote(post.id, -1)}
          disabled={isSolved}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            post.user_vote === -1
              ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-300 shadow-sm'
              : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white'
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
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm inline-flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Fix It</span>
            </span>
          ) : (
            <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 shadow-sm inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 stroke-[3]" />
              <span>Add It</span>
            </span>
          )}

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.location_name || post.location?.name || 'Campus Grounds'}</span>
          </span>

          {post.department && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-flex items-center gap-1 ml-auto">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.department}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/post/${post.id}`} className="block group">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug tracking-tight">
            {post.title}
          </h3>
        </Link>

        {/* Description */}
        {post.description && (
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            {post.description}
          </p>
        )}

        {/* Photos Preview */}
        {post.photos && post.photos.length > 0 && (
          <div className="pt-1 flex items-center gap-3">
            {post.photos.slice(0, 2).map((photo, i) => (
              <div
                key={i}
                className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
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
          <div className="bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start sm:items-center gap-4 fade-in shadow-sm relative overflow-hidden">
            <div className="bg-red-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 pulse-red">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-red-900 dark:text-red-300 uppercase tracking-widest mb-0.5">
                Escalated (100+ Votes)
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                Admin notified. Automated reminders trigger every 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Solved Card View with Admin Remarks */}
        {isSolved ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-5 border-2 border-emerald-100 dark:border-emerald-800 w-full fade-in shadow-sm space-y-3">
            <div className="flex items-center text-emerald-800 dark:text-emerald-300 font-extrabold text-base">
              <div className="w-7 h-7 bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mr-2.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Officially Resolved</span>
            </div>

            <div className="bg-white dark:bg-slate-800/90 px-5 py-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest block mb-1">
                Admin Remarks
              </span>
              <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">
                {post.admin_note || 'Issue addressed by campus administration on site.'}
              </p>
            </div>
          </div>
        ) : (
          /* Footer Meta & Admin Action Buttons */
          <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-700/80 pt-4 gap-4">
            <div className="flex items-center text-xs font-bold text-slate-400">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>Reported {post.author_name ? `by ${post.author_name}` : 'recently'}</span>
            </div>

            {isAdmin ? (
              <button
                onClick={() => onResolveClick?.(post.id)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 ml-auto"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Admin: Mark Resolved</span>
              </button>
            ) : (
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800 uppercase tracking-widest shadow-sm">
                Under Review
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
