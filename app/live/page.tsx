'use client';

import React, { useMemo } from 'react';
import { useUpCampus } from '@/lib/store';
import { Flame, Activity, ShieldAlert } from 'lucide-react';

export default function LiveWallPage() {
  const { posts } = useUpCampus();

  const activePosts = useMemo(() => {
    return posts
      .filter((p) => !['rejected'].includes(p.status))
      .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
      .slice(0, 7);
  }, [posts]);

  const maxImpact = Math.max(...activePosts.map((p) => p.impact_score || 10), 100);

  return (
    <div className="space-y-6">
      {/* Top Banner with QR Code info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-campus-surface via-campus-surface/90 to-campus-bg border border-campus-border">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-campus-pink/20 border border-campus-pink/40 text-campus-pink text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-campus-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-campus-pink"></span>
            </span>
            <span>Live Projector Resolution Wall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Realtime Campus Democracy & Priority Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            As students vote from their mobile devices, bars re-order dynamically based on the Impact Formula.
          </p>
        </div>

        {/* Dynamic Simulated QR Callout */}
        <div className="flex items-center gap-4 bg-campus-bg/90 border border-campus-border p-4 rounded-2xl flex-shrink-0 shadow-glow">
          <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center">
            {/* SVG Representation of a clean QR Code */}
            <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900 fill-current">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm4-2h2v4h-2v-4zm-4 4h2v2h-2v-2zm4 2h2v2h-2v-2z" />
            </svg>
          </div>
          <div className="text-left space-y-0.5">
            <span className="text-[11px] font-bold text-campus-teal uppercase tracking-wider block">
              Scan to Vote Now
            </span>
            <span className="text-xs font-extrabold text-white block">
              upcampus.vercel.app
            </span>
            <span className="text-[10px] text-slate-400 block">
              One-Tap Demo Mode Active
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Stack */}
      <div className="space-y-3">
        {activePosts.map((post, index) => {
          const percentage = Math.min(100, Math.max(15, Math.round(((post.impact_score || 10) / maxImpact) * 100)));

          return (
            <div
              key={post.id}
              className="glass-card rounded-2xl p-4 border border-campus-border space-y-2 relative overflow-hidden transition-all hover:border-slate-500"
            >
              {/* Background Rank Fill Bar */}
              <div
                className="absolute inset-y-0 left-0 bg-campus-teal/10 border-r border-campus-teal/30 transition-all duration-700 pointer-events-none"
                style={{ width: `${percentage}%` }}
              ></div>

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-heading font-black text-xl sm:text-2xl text-campus-teal tabular-nums min-w-[32px]">
                    #{index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-campus-bg border border-campus-border px-1.5 py-0.2 rounded">
                        {post.category}
                      </span>
                      {post.safety_risk && (
                        <span className="text-[10px] font-bold text-campus-pink flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Safety Priority
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        📍 {post.location?.name || 'Campus'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {post.title}
                    </h3>
                  </div>
                </div>

                {/* Score & Upvotes */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-campus-amber text-sm sm:text-base tabular-nums">
                      <Flame className="w-4 h-4 fill-campus-amber" />
                      <span>{post.impact_score?.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {post.agree_count} Students Agreed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Activity Stream Ticker */}
      <div className="p-4 rounded-2xl bg-campus-surface/70 border border-campus-border flex items-center justify-between text-xs text-slate-300 overflow-hidden">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-campus-teal animate-pulse" />
          <span className="font-bold text-campus-teal uppercase tracking-wider text-[11px]">
            Live Activity Ticker:
          </span>
          <span className="truncate text-slate-200">
            🔥 &quot;Hostel 7 Streetlight&quot; just received 4 new student votes from North Campus • ✅ &quot;Chemistry Lab Sink&quot; entered Awaiting Verification
          </span>
        </div>
      </div>
    </div>
  );
}
