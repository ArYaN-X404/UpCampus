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
      <div className="pb-4 border-b border-paleBlueGrey/15">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl badge-mint shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-mintGreen" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-softWhite">
            Campus Solved & Verified Archive
          </h1>
        </div>
        <p className="text-xs text-paleBlueGrey mt-1">
          Every ticket here was reported by students, acted upon by campus administration, and physically verified on site.
        </p>
      </div>

      {resolvedPosts.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-darkBlue/50 border border-paleBlueGrey/20 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-paleBlueGrey/50 mx-auto" />
          <h2 className="text-base font-bold text-softWhite">
            No Resolved Issues Yet
          </h2>
          <p className="text-xs text-paleBlueGrey max-w-sm mx-auto">
            Issues move into this permanent archive once 5 students physically confirm the fix on site.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resolvedPosts.map((post) => (
            <div
              key={post.id}
              className="glass-card rounded-3xl p-5 border border-paleBlueGrey/20 hover:border-mintGreen/50 transition-all space-y-4"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="badge-mint px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-mintGreen" />
                  Verified Fix
                </span>

                <span className="text-[11px] font-semibold text-paleBlueGrey flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-skyBlue/70" />
                  Resolved in 3.2 days
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-softWhite leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-paleBlueGrey leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>

              {/* Admin Note if present */}
              {post.admin_note && (
                <div className="bg-deepNavy/80 px-4 py-2.5 rounded-xl border border-mintGreen/20 text-xs">
                  <span className="text-mintGreen font-bold uppercase text-[9px] tracking-wider block mb-0.5">
                    Official Admin Remark
                  </span>
                  <p className="text-softWhite font-medium">
                    {post.admin_note}
                  </p>
                </div>
              )}

              {/* Before & After Proof Display */}
              <div className="grid grid-cols-2 gap-2 bg-deepNavy/80 p-2 rounded-2xl border border-paleBlueGrey/15">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block px-1">
                    Before (Issue)
                  </span>
                  <div className="h-28 rounded-xl overflow-hidden bg-deepNavy border border-amber-500/30">
                    <img
                      src={post.photos[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mintGreen block px-1">
                    After (Fixed & Verified)
                  </span>
                  <div className="h-28 rounded-xl overflow-hidden bg-deepNavy border border-mintGreen/40">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                      alt="After fix"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Attribution */}
              <div className="pt-2 border-t border-paleBlueGrey/15 flex items-center justify-between text-xs text-paleBlueGrey">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-skyBlue" />
                  {post.location_name || post.location?.name || 'Campus Grounds'}
                </span>

                <span className="text-mintGreen font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-mintGreen" />
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
