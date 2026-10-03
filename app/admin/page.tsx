'use client';

import React, { useState } from 'react';
import { useUpCampus } from '@/lib/store';
import { Post, PostStatus } from '@/lib/types';
import { 
  Building2, 
  Pin, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Flame 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { posts, updatePostStatus } = useUpCampus();
  const [activeRemarkPost, setActiveRemarkPost] = useState<Post | null>(null);
  const [remarkText, setRemarkText] = useState('');

  const underReviewPosts = posts.filter((p) => p.status === 'under_review' || p.status === 'approved');
  const inProgressPosts = posts.filter((p) => p.status === 'in_progress');
  const awaitingVerificationPosts = posts.filter((p) => p.status === 'awaiting_verification');

  const handleOpenRemark = (post: Post) => {
    setActiveRemarkPost(post);
    setRemarkText('');
  };

  const handleSaveRemark = (newStatus?: PostStatus) => {
    if (!activeRemarkPost) return;
    const targetStatus = newStatus || activeRemarkPost.status;
    updatePostStatus(activeRemarkPost.id, targetStatus, remarkText.trim() || undefined, true);
    setActiveRemarkPost(null);
    setRemarkText('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Department Accountability Board */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-campus-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-campus-teal/20 text-campus-teal border border-campus-teal/30">
                <Building2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Campus Estate & Facility Control Room
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ranked action pipeline. Change status and post official progress remarks to student voters.
            </p>
          </div>
        </div>

        {/* Department Accountability KPI Strip */}
        <div className="bg-campus-surface border border-campus-border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-campus-teal" />
              Department Response Velocity (Live SLA Accountability)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-campus-bg/70 border border-campus-border rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Electrical Maintenance</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-emerald-400">1.4 days</span>
                <span className="text-[10px] text-emerald-400/80 font-bold">Fast</span>
              </div>
            </div>

            <div className="p-3 bg-campus-bg/70 border border-campus-border rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Sanitation & Water Works</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-campus-amber">2.8 days</span>
                <span className="text-[10px] text-campus-amber/80 font-bold">Normal</span>
              </div>
            </div>

            <div className="p-3 bg-campus-bg/70 border border-campus-border rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Estate & Civil Infrastructure</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-campus-amber">3.5 days</span>
                <span className="text-[10px] text-campus-amber/80 font-bold">Moderate</span>
              </div>
            </div>

            <div className="p-3 bg-campus-bg/70 border border-campus-border rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">IT & Campus Network (Wi-Fi)</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-campus-pink">5.6 days</span>
                <span className="text-[10px] text-campus-pink/80 font-bold">Delayed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Under Review */}
        <div className="space-y-3 bg-campus-surface/40 border border-campus-border rounded-3xl p-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Under Review ({underReviewPosts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {underReviewPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card p-4 rounded-2xl border border-campus-border space-y-3 hover:border-slate-500 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-campus-surface border border-campus-border text-campus-teal">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-campus-amber">
                    <Flame className="w-3 h-3 fill-campus-amber/20" />
                    <span>{post.impact_score?.toFixed(1)}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>📍 {post.location?.name || 'Campus'}</span>
                </p>

                <div className="pt-2 border-t border-campus-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{post.agree_count} Upvotes</span>
                  <button
                    onClick={() => {
                      updatePostStatus(post.id, 'in_progress', 'Admin acknowledged: Work order issued.');
                    }}
                    className="px-2.5 py-1 bg-campus-amber/20 hover:bg-campus-amber/30 text-campus-amber border border-campus-amber/40 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>Start Work</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-3 bg-campus-surface/40 border border-campus-border rounded-3xl p-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-campus-amber animate-pulse"></span>
              <h3 className="text-sm font-bold text-campus-amber uppercase tracking-wider">
                In Progress ({inProgressPosts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {inProgressPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card p-4 rounded-2xl border border-campus-border space-y-3 hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-campus-surface border border-campus-border text-campus-amber">
                    {post.department}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-campus-amber">
                    <Flame className="w-3 h-3 fill-campus-amber/20" />
                    <span>{post.impact_score?.toFixed(1)}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <div className="p-2.5 bg-campus-bg/80 border border-campus-border rounded-xl flex items-start gap-2 text-[11px] text-amber-200/90">
                  <Pin className="w-3.5 h-3.5 text-campus-amber flex-shrink-0 mt-0.5" />
                  <span className="italic">
                    Official Remark: &quot;Vendor parts arriving. Electrician dispatched.&quot;
                  </span>
                </div>

                <div className="pt-2 border-t border-campus-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenRemark(post)}
                    className="text-[11px] text-slate-400 hover:text-white underline"
                  >
                    Add Remark
                  </button>
                  <button
                    onClick={() => {
                      updatePostStatus(
                        post.id,
                        'awaiting_verification',
                        'Admin claims work complete. Awaiting student verification on site.',
                        true
                      );
                    }}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>Mark Done</span>
                    <CheckCircle2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Awaiting Student Verification */}
        <div className="space-y-3 bg-campus-surface/40 border border-campus-border rounded-3xl p-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                Awaiting Verification ({awaitingVerificationPosts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {awaitingVerificationPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card p-4 rounded-2xl border border-purple-500/30 space-y-3 hover:border-purple-500/60 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                    Student Voting Open
                  </span>
                  <span className="text-[10px] text-slate-400">4/5 Confirmed</span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <div className="p-2.5 bg-campus-bg/80 border border-campus-border rounded-xl text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">4 Verified Fixed</span>
                    <span className="text-rose-400 font-bold">0 Rejected</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[80%] rounded-full"></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-campus-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">1 more confirm to archive</span>
                  <button
                    onClick={() => {
                      updatePostStatus(post.id, 'resolved', 'Consensus achieved. Confirmed fixed by 5 students.');
                    }}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold rounded-lg transition-all"
                  >
                    Force Solved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remark Modal */}
      {activeRemarkPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-campus-bg/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-campus-surface border border-campus-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading">
              Pin Official Administrative Remark
            </h3>
            <p className="text-xs text-slate-400">
              This note will be pinned publicly on the student issue timeline for transparency.
            </p>
            <textarea
              rows={3}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="e.g. Work order #409 approved. Vendor arrived on site. Expected completion 5 PM."
              className="w-full bg-campus-bg border border-campus-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-campus-teal"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveRemarkPost(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRemark()}
                className="px-4 py-1.5 bg-campus-teal hover:bg-teal-300 text-campus-bg font-bold text-xs rounded-xl shadow-glow"
              >
                Pin Public Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
