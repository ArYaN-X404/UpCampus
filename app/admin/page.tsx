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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-paleBlueGrey/15">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl badge-sky shadow-sm">
                <Building2 className="w-5 h-5 text-skyBlue" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-softWhite">
                Campus Estate & Facility Control Room
              </h1>
            </div>
            <p className="text-xs text-paleBlueGrey mt-1">
              Ranked action pipeline. Change status and post official progress remarks to student voters.
            </p>
          </div>
        </div>

        {/* Department Accountability KPI Strip */}
        <div className="glass-card border border-paleBlueGrey/20 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-paleBlueGrey">
            <span className="flex items-center gap-1.5 text-skyBlue">
              <Activity className="w-4 h-4 text-skyBlue" />
              Department Response Velocity (Live SLA Accountability)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl">
              <span className="text-[11px] font-semibold text-paleBlueGrey block">Electrical Maintenance</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-mintGreen">1.4 days</span>
                <span className="text-[10px] text-mintGreen/80 font-bold">Fast</span>
              </div>
            </div>

            <div className="p-3 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl">
              <span className="text-[11px] font-semibold text-paleBlueGrey block">Sanitation & Water Works</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-skyBlue">2.8 days</span>
                <span className="text-[10px] text-skyBlue/80 font-bold">Normal</span>
              </div>
            </div>

            <div className="p-3 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl">
              <span className="text-[11px] font-semibold text-paleBlueGrey block">Estate & Civil Infrastructure</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-skyBlue">3.5 days</span>
                <span className="text-[10px] text-skyBlue/80 font-bold">Moderate</span>
              </div>
            </div>

            <div className="p-3 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl">
              <span className="text-[11px] font-semibold text-paleBlueGrey block">IT & Campus Network (Wi-Fi)</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-amber-400">5.6 days</span>
                <span className="text-[10px] text-amber-400/80 font-bold">Delayed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Under Review */}
        <div className="space-y-3 bg-darkBlue/70 border border-paleBlueGrey/20 rounded-3xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-skyBlue"></span>
              <h3 className="text-sm font-bold text-softWhite uppercase tracking-wider">
                Under Review ({underReviewPosts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {underReviewPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card p-4 rounded-2xl border border-paleBlueGrey/15 space-y-3 hover:border-skyBlue/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="badge-sky text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-skyBlue">
                    <Flame className="w-3 h-3 text-skyBlue" />
                    <span>{post.impact_score?.toFixed(1)}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-softWhite leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <p className="text-[11px] text-paleBlueGrey flex items-center gap-1">
                  <span>📍 {post.location_name || post.location?.name || 'Campus'}</span>
                </p>

                <div className="pt-2 border-t border-paleBlueGrey/15 flex items-center justify-between">
                  <span className="text-[10px] text-paleBlueGrey/70">{post.agree_count} Upvotes</span>
                  <button
                    onClick={() => {
                      updatePostStatus(post.id, 'in_progress', 'Admin acknowledged: Work order issued.');
                    }}
                    className="px-2.5 py-1 bg-skyBlue/15 hover:bg-skyBlue/25 text-skyBlue border border-skyBlue/30 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
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
        <div className="space-y-3 bg-darkBlue/70 border border-paleBlueGrey/20 rounded-3xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-softWhite uppercase tracking-wider">
                In Progress ({inProgressPosts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {inProgressPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card p-4 rounded-2xl border border-paleBlueGrey/15 space-y-3 hover:border-amber-400/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                    {post.department}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span>{post.impact_score?.toFixed(1)}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-softWhite leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <div className="p-2.5 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl flex items-start gap-2 text-[11px] text-paleBlueGrey">
                  <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="italic">
                    Official Remark: &quot;Vendor parts arriving. Electrician dispatched.&quot;
                  </span>
                </div>

                <div className="pt-2 border-t border-paleBlueGrey/15 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenRemark(post)}
                    className="text-[11px] text-paleBlueGrey hover:text-softWhite underline"
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
                    className="px-2.5 py-1 bg-mintGreen/15 hover:bg-mintGreen/25 text-mintGreen border border-mintGreen/30 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
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
        <div className="space-y-3 bg-darkBlue/70 border border-paleBlueGrey/20 rounded-3xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mintGreen"></span>
              <h3 className="text-sm font-bold text-softWhite uppercase tracking-wider">
                Awaiting Verification ({awaitingVerificationPosts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {awaitingVerificationPosts.map((post) => (
              <div
                key={post.id}
                className="glass-card p-4 rounded-2xl border border-mintGreen/30 space-y-3 hover:border-mintGreen/60 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="badge-mint text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Student Voting Open
                  </span>
                  <span className="text-[10px] text-paleBlueGrey">4/5 Confirmed</span>
                </div>

                <h4 className="text-xs font-bold text-softWhite leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <div className="p-2.5 bg-deepNavy/80 border border-paleBlueGrey/15 rounded-xl text-[11px] text-paleBlueGrey space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-mintGreen font-bold">4 Verified Fixed</span>
                    <span className="text-amber-400 font-bold">0 Rejected</span>
                  </div>
                  <div className="w-full bg-deepNavy h-1.5 rounded-full overflow-hidden border border-paleBlueGrey/20">
                    <div className="bg-mintGreen h-full w-[80%] rounded-full"></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-paleBlueGrey/15 flex items-center justify-between">
                  <span className="text-[10px] text-paleBlueGrey/70">1 more confirm to archive</span>
                  <button
                    onClick={() => {
                      updatePostStatus(post.id, 'resolved', 'Consensus achieved. Confirmed fixed by 5 students.');
                    }}
                    className="btn-fresh-green text-deepNavy text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deepNavy/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-darkBlue border border-paleBlueGrey/20 rounded-2xl p-6 space-y-4 shadow-2xl text-softWhite">
            <h3 className="text-base font-bold text-softWhite">
              Pin Official Administrative Remark
            </h3>
            <p className="text-xs text-paleBlueGrey">
              This note will be pinned publicly on the student issue timeline for transparency.
            </p>
            <textarea
              rows={3}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="e.g. Work order #409 approved. Vendor arrived on site. Expected completion 5 PM."
              className="w-full bg-deepNavy/80 border border-paleBlueGrey/25 rounded-xl p-3 text-xs text-softWhite placeholder-paleBlueGrey/50 focus:outline-none focus:border-skyBlue shadow-inner"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveRemarkPost(null)}
                className="px-3 py-1.5 text-xs text-paleBlueGrey hover:text-softWhite"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRemark()}
                className="btn-fresh-green text-deepNavy font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg"
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
