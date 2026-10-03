'use client';

import React from 'react';
import { useUpCampus } from '@/lib/store';
import { CheckCircle2, Calendar, MapPin, ThumbsUp, ShieldCheck } from 'lucide-react';

export default function SolvedArchivePage() {
  const { posts } = useUpCampus();

  const resolvedPosts = posts.filter((p) => p.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-campus-border">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Campus Solved & Verified Archive
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Every ticket here was reported by students, acted upon by campus administration, and physically verified on site.
        </p>
      </div>

      {resolvedPosts.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-campus-surface/40 border border-campus-border space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h2 className="text-base font-bold text-white font-heading">
            No Resolved Issues Yet
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Issues move into this permanent archive once 5 students physically confirm the fix on site.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resolvedPosts.map((post) => (
            <div
              key={post.id}
              className="glass-card rounded-3xl p-5 border border-campus-border hover:border-emerald-500/40 transition-all space-y-4"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Fix
                </span>

                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Resolved in 3.2 days
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white font-heading leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>

              {/* Before & After Proof Display */}
              <div className="grid grid-cols-2 gap-2 bg-campus-bg/80 p-2 rounded-2xl border border-campus-border">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block px-1">
                    Before (Issue)
                  </span>
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-900 border border-rose-500/30">
                    <img
                      src={post.photos[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block px-1">
                    After (Fixed & Verified)
                  </span>
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                      alt="After fix"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Attribution */}
              <div className="pt-2 border-t border-campus-border/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-campus-teal" />
                  {post.location?.name || 'Campus'}
                </span>

                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Confirmed by {post.agree_count} Students
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
