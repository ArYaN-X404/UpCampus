'use client';

import React, { useMemo } from 'react';
import { useUpCampus } from '@/lib/store';
import { 
  Flame, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  ChevronUp, 
  QrCode, 
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function LiveWallPage() {
  const { posts, vote } = useUpCampus();

  const activePosts = useMemo(() => {
    return (posts || [])
      .filter((p) => p && !['rejected'].includes(p.status))
      .sort((a, b) => (Number(b.impact_score) || 0) - (Number(a.impact_score) || 0))
      .slice(0, 8);
  }, [posts]);

  const maxImpact = Math.max(100, ...activePosts.map((p) => Number(p.impact_score) || 10));

  const totalVotes = useMemo(() => {
    return (posts || []).reduce((sum, p) => sum + (Number(p?.agree_count) || 0), 0);
  }, [posts]);

  const escalatedCount = useMemo(() => {
    return (posts || []).filter((p) => p && Number(p.agree_count) >= 100 && p.status !== 'resolved').length;
  }, [posts]);

  const solvedCount = useMemo(() => {
    return (posts || []).filter((p) => p && p.status === 'resolved').length;
  }, [posts]);

  // Escalation radar
  const nearEscalation = useMemo(() => {
    return (posts || [])
      .filter((p) => p && p.status !== 'resolved' && !['rejected'].includes(p.status))
      .sort((a, b) => (Number(b.agree_count) || 0) - (Number(a.agree_count) || 0))
      .slice(0, 4);
  }, [posts]);

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner with Projector Station and QR Code (Full Width) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-darkBlue via-[#0e274a] to-deepNavy border border-paleBlueGrey/20 card-glow-top shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-sky text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skyBlue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-skyBlue"></span>
              </span>
              <span>Live Campus Projector & Resolution Wall</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-softWhite tracking-tight">
              Realtime Campus Democracy & Priority Leaderboard
            </h1>

            <p className="text-xs sm:text-sm text-paleBlueGrey max-w-2xl leading-relaxed">
              As students vote from smartphones across campus, priority bars re-order dynamically based on the verified{' '}
              <strong className="text-softWhite font-semibold">Impact Formula</strong> (Votes × Urgency × Safety Weight).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-paleBlueGrey">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-mintGreen"></span>
                <span>Total Votes Cast: <strong className="text-softWhite tabular-nums">{totalVotes}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Active Escalations: <strong className="text-softWhite tabular-nums">{escalatedCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-skyBlue"></span>
                <span>Verified Solved: <strong className="text-softWhite tabular-nums">{solvedCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Dynamic QR Scan Box */}
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end">
            <div className="flex items-center gap-4 bg-deepNavy/90 border border-paleBlueGrey/25 p-4 rounded-2xl shadow-glass w-full sm:w-auto">
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full text-deepNavy fill-current">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm4-2h2v4h-2v-4zm-4 4h2v2h-2v-2zm4 2h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="text-left space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold text-skyBlue uppercase tracking-wider block">
                  Scan to Vote Live
                </span>
                <span className="text-xs font-extrabold text-softWhite block truncate">
                  upcampus.vercel.app
                </span>
                <span className="text-[10px] text-mintGreen font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-mintGreen animate-ping"></span>
                  Instant Vote Sync
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main 12-Col Widescreen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Leaderboard Stack (8 Cols on Laptop) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between pb-1 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-paleBlueGrey flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-skyBlue" />
              Ranked Campus Issues by Dynamic Impact Score
            </span>
            <span className="text-xs text-paleBlueGrey/70">Top 8 Active</span>
          </div>

          <div className="space-y-3">
            {activePosts.map((post, index) => {
              const percentage = Math.min(100, Math.max(12, Math.round(((post.impact_score || 10) / maxImpact) * 100)));
              
              // Top 3 medals
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={post.id}
                  className="glass-card rounded-2xl p-4 sm:p-4.5 border border-paleBlueGrey/20 space-y-2 relative overflow-hidden transition-all hover:border-skyBlue/40 group shadow-sm"
                >
                  {/* Dynamic Progress Fill Bar */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 pointer-events-none ${
                      isFirst
                        ? 'bg-amber-400/10 border-r-2 border-amber-400/40'
                        : isSecond
                        ? 'bg-skyBlue/10 border-r-2 border-skyBlue/40'
                        : isThird
                        ? 'bg-mintGreen/10 border-r-2 border-mintGreen/40'
                        : 'bg-white/5 border-r border-white/20'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Rank Indicator */}
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm tabular-nums shrink-0 shadow-sm ${
                          isFirst
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-deepNavy'
                            : isSecond
                            ? 'bg-gradient-to-br from-skyBlue to-sky-400 text-deepNavy'
                            : isThird
                            ? 'bg-gradient-to-br from-mintGreen to-emerald-400 text-deepNavy'
                            : 'bg-deepNavy/90 text-paleBlueGrey border border-paleBlueGrey/20'
                        }`}
                      >
                        #{index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            post.kind === 'grievance' ? 'badge-sky' : 'badge-mint'
                          }`}>
                            {post.category}
                          </span>

                          {post.safety_risk && (
                            <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-red-400" />
                              Safety Priority
                            </span>
                          )}

                          <span className="text-[11px] text-paleBlueGrey/70">
                            📍 {post.location_name || post.location?.name || 'Campus Grounds'}
                          </span>
                        </div>

                        <Link href={`/post/${post.id}`}>
                          <h3 className="text-sm sm:text-base font-bold text-softWhite group-hover:text-skyBlue transition-colors truncate">
                            {post.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Interactive Score & Upvote Pill */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-1 font-extrabold text-amber-400 text-sm sm:text-base tabular-nums">
                          <Flame className="w-4 h-4 fill-amber-400/20" />
                          <span>{Number(post.impact_score || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-paleBlueGrey block">
                          Impact Index
                        </span>
                      </div>

                      {/* Instant One-Tap Agree Button */}
                      <button
                        onClick={() => vote(post.id, 1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          post.user_vote === 1
                            ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                            : 'bg-deepNavy/85 hover:bg-skyBlue/20 text-skyBlue border border-skyBlue/30'
                        } active:scale-95`}
                        title="Agree / Upvote from Projector Wall"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                        <span className="tabular-nums">{post.agree_count}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Realtime Radar & Explainer (4 Cols on Laptop) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20 hidden lg:block">
          
          {/* Escalation Tracker */}
          <div className="glass-card rounded-2xl p-5 border border-paleBlueGrey/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15">
              <span className="text-xs font-bold uppercase tracking-wider text-softWhite flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Approaching Auto-Escalation
              </span>
              <span className="badge-sky text-[10px] px-2 py-0.5 rounded font-bold">100 Votes</span>
            </div>

            <p className="text-xs text-paleBlueGrey leading-relaxed">
              Issues within reach of the 100-vote threshold trigger SMS & dashboard dispatches directly to university leadership.
            </p>

            <div className="space-y-3">
              {nearEscalation.map((p) => {
                const pct = Math.min(100, Math.round((p.agree_count / 100) * 100));
                return (
                  <div key={p.id} className="p-3 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-softWhite font-semibold truncate max-w-[190px]">
                        {p.title}
                      </span>
                      <span className="text-skyBlue font-extrabold tabular-nums">
                        {p.agree_count}/100
                      </span>
                    </div>
                    <div className="w-full bg-darkBlue h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-skyBlue to-mintGreen h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impact Algorithm Formula Transparency */}
          <div className="glass-card rounded-2xl p-5 border border-paleBlueGrey/20 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15">
              <span className="text-xs font-bold uppercase tracking-wider text-softWhite flex items-center gap-2">
                <Award className="w-4 h-4 text-mintGreen" />
                The Impact Formula
              </span>
              <span className="text-[10px] text-mintGreen font-semibold">Mathematical Transparency</span>
            </div>

            <div className="p-3 bg-deepNavy/90 border border-paleBlueGrey/15 rounded-xl font-mono text-xs text-mintGreen space-y-1 shadow-inner">
              <div className="text-softWhite font-bold">Rank Score =</div>
              <div>(Votes × 1.5) + (Safety × 30) + Severity</div>
            </div>

            <ul className="text-xs text-paleBlueGrey space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-skyBlue font-bold">•</span>
                <span><strong>Votes:</strong> Each student agree vote contributes +1.5 points.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Safety Risk:</strong> Verified hazards receive instant +30 boost.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-mintGreen font-bold">•</span>
                <span><strong>Consensus:</strong> 5 on-site verifications seal the fix into the archive.</span>
              </li>
            </ul>
          </div>

          {/* Quick Link to Control Room */}
          <Link
            href="/admin"
            className="btn-fresh-green text-deepNavy text-xs font-extrabold w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4" />
            <span>Open Facility Control Room</span>
          </Link>

        </div>

      </div>

      {/* Live Activity Stream Ticker */}
      <div className="p-4 rounded-2xl bg-darkBlue/75 border border-paleBlueGrey/20 flex items-center justify-between text-xs text-paleBlueGrey overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-mintGreen animate-pulse shrink-0" />
          <span className="font-bold text-mintGreen uppercase tracking-wider text-[11px] shrink-0">
            Live Stream:
          </span>
          <span className="truncate text-softWhite">
            🔥 &quot;Street lights fused on Girls Hostel pathway&quot; hit 99 votes (1 vote away from Dean escalation) • ✅ &quot;Broken sink in 3rd Floor Washrooms&quot; physically verified by 5 students and moved to Solved Archive.
          </span>
        </div>
      </div>
    </div>
  );
}
