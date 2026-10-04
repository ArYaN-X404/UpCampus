'use client';

import React, { useState, useMemo } from 'react';
import { useUpCampus } from '@/lib/store';
import { Post, PostStatus } from '@/lib/types';
import { 
  Building2, 
  Pin, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Flame,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  Zap,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { posts, updatePostStatus, resetDemoData } = useUpCampus();
  const [activeRemarkPost, setActiveRemarkPost] = useState<Post | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

  // Department list
  const departments = ['all', 'Electrical', 'Sanitation', 'Estate & Civil', 'IT & Wi-Fi'];

  // Filtered post queues
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (departmentFilter !== 'all') {
        const d = (p.department || '').toLowerCase();
        const f = departmentFilter.toLowerCase();
        if (!d.includes(f) && !f.includes(d)) return false;
      }
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.location_name && p.location_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [posts, departmentFilter, adminSearch]);

  const underReviewPosts = filteredPosts.filter((p) => p.status === 'under_review' || p.status === 'approved');
  const inProgressPosts = filteredPosts.filter((p) => p.status === 'in_progress');
  const awaitingVerificationPosts = filteredPosts.filter((p) => p.status === 'awaiting_verification');

  const handleOpenRemark = (post: Post) => {
    setActiveRemarkPost(post);
    setRemarkText(post.admin_note || '');
  };

  const handleSaveRemark = (newStatus?: PostStatus) => {
    if (!activeRemarkPost) return;
    const targetStatus = newStatus || activeRemarkPost.status;
    updatePostStatus(activeRemarkPost.id, targetStatus, remarkText.trim() || undefined, true);
    setActiveRemarkPost(null);
    setRemarkText('');
  };

  const presetRemarks = [
    'Work order issued. Facility technician dispatched.',
    'Replacement parts ordered. Arriving within 24 hours.',
    'Electrical inspection completed. Maintenance active.',
    'Sanitation team on site for deep cleaning.',
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header & Command Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-paleBlueGrey/15">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-2xl badge-sky shadow-sm">
              <Building2 className="w-6 h-6 text-skyBlue" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-softWhite tracking-tight">
                  Campus Facility & Estate Control Room
                </h1>
                <span className="badge-mint text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Live Operations
                </span>
              </div>
              <p className="text-xs sm:text-sm text-paleBlueGrey mt-0.5 font-medium">
                Administrative dispatch desk, SLA response tracking, and live campus accountability.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <Link
              href="/live"
              className="bg-darkBlue/80 hover:bg-darkBlue border border-paleBlueGrey/20 text-paleBlueGrey hover:text-softWhite text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Activity className="w-4 h-4 text-skyBlue" />
              <span>Projector Wall</span>
            </Link>
            <button
              onClick={() => resetDemoData()}
              className="bg-deepNavy/80 hover:bg-white/5 border border-paleBlueGrey/20 text-paleBlueGrey/80 hover:text-softWhite text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1"
              title="Reset sample campus data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Live SLA & Response Velocity Strip (Full Width) */}
        <div className="glass-card border border-paleBlueGrey/20 rounded-2xl p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-paleBlueGrey">
            <span className="flex items-center gap-2 text-skyBlue">
              <Activity className="w-4 h-4 text-skyBlue" />
              Department Response Velocity & SLA Compliance
            </span>
            <span className="text-[11px] text-mintGreen font-semibold normal-case">
              Target Resolution: &lt; 48h across campus
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 bg-deepNavy/85 border border-paleBlueGrey/15 rounded-xl hover:border-mintGreen/30 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="text-paleBlueGrey font-semibold">Electrical Facility</span>
                <span className="badge-mint text-[10px] font-bold px-2 py-0.2 rounded">Fast</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-mintGreen tabular-nums">1.4 days</span>
                <span className="text-[11px] text-paleBlueGrey/70">Avg SLA</span>
              </div>
              <div className="mt-2 w-full bg-darkBlue h-1.5 rounded-full overflow-hidden">
                <div className="bg-mintGreen h-full w-[88%] rounded-full" />
              </div>
            </div>

            <div className="p-3.5 bg-deepNavy/85 border border-paleBlueGrey/15 rounded-xl hover:border-skyBlue/30 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="text-paleBlueGrey font-semibold">Sanitation & Water</span>
                <span className="badge-sky text-[10px] font-bold px-2 py-0.2 rounded">Normal</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-skyBlue tabular-nums">2.8 days</span>
                <span className="text-[11px] text-paleBlueGrey/70">Avg SLA</span>
              </div>
              <div className="mt-2 w-full bg-darkBlue h-1.5 rounded-full overflow-hidden">
                <div className="bg-skyBlue h-full w-[72%] rounded-full" />
              </div>
            </div>

            <div className="p-3.5 bg-deepNavy/85 border border-paleBlueGrey/15 rounded-xl hover:border-skyBlue/30 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="text-paleBlueGrey font-semibold">Estate & Civil Works</span>
                <span className="badge-sky text-[10px] font-bold px-2 py-0.2 rounded">Moderate</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-skyBlue tabular-nums">3.5 days</span>
                <span className="text-[11px] text-paleBlueGrey/70">Avg SLA</span>
              </div>
              <div className="mt-2 w-full bg-darkBlue h-1.5 rounded-full overflow-hidden">
                <div className="bg-skyBlue h-full w-[60%] rounded-full" />
              </div>
            </div>

            <div className="p-3.5 bg-deepNavy/85 border border-paleBlueGrey/15 rounded-xl hover:border-amber-400/30 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="text-paleBlueGrey font-semibold">Campus Wi-Fi Network</span>
                <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.2 rounded">
                  Delayed
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400 tabular-nums">5.6 days</span>
                <span className="text-[11px] text-paleBlueGrey/70">Avg SLA</span>
              </div>
              <div className="mt-2 w-full bg-darkBlue h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[42%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-paleBlueGrey/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs text-paleBlueGrey/70 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    departmentFilter === dept
                      ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                      : 'bg-white/5 text-paleBlueGrey hover:text-softWhite hover:bg-white/10'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-paleBlueGrey/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search ticket, room, tags..."
                className="w-full text-xs border border-paleBlueGrey/20 bg-deepNavy/90 text-softWhite placeholder-paleBlueGrey/50 rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-skyBlue shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Kanban Board (Full Laptop Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Under Review / Backlog */}
        <div className="bg-darkBlue/75 border border-paleBlueGrey/20 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15 px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-skyBlue" />
              <h3 className="text-sm font-bold text-softWhite uppercase tracking-wider">
                Under Review
              </h3>
            </div>
            <span className="badge-sky text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {underReviewPosts.length}
            </span>
          </div>

          <div className="space-y-3.5">
            {underReviewPosts.length === 0 ? (
              <div className="text-center py-12 text-paleBlueGrey/60 text-xs border border-dashed border-paleBlueGrey/15 rounded-2xl">
                No tickets currently under review.
              </div>
            ) : (
              underReviewPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card p-4.5 rounded-2xl border border-paleBlueGrey/15 hover:border-skyBlue/40 transition-all space-y-3 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge-sky text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-skyBlue">
                      <Flame className="w-3.5 h-3.5 text-skyBlue" />
                      <span>{post.impact_score?.toFixed(1) || '6.5'}</span>
                    </div>
                  </div>

                  <Link href={`/post/${post.id}`}>
                    <h4 className="text-sm font-bold text-softWhite hover:text-skyBlue transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                  </Link>

                  <p className="text-xs text-paleBlueGrey/80 flex items-center gap-1">
                    <span>📍 {post.location_name || post.location?.name || 'Campus'}</span>
                  </p>

                  <div className="pt-2.5 border-t border-paleBlueGrey/15 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-paleBlueGrey/70 font-semibold tabular-nums">
                      {post.agree_count} Student Votes
                    </span>

                    <button
                      onClick={() => {
                        updatePostStatus(post.id, 'in_progress', 'Admin acknowledged: Work order issued.');
                      }}
                      className="btn-fresh-green text-deepNavy text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <span>Start Work</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-darkBlue/75 border border-paleBlueGrey/20 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15 px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-softWhite uppercase tracking-wider">
                Work In Progress
              </h3>
            </div>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {inProgressPosts.length}
            </span>
          </div>

          <div className="space-y-3.5">
            {inProgressPosts.length === 0 ? (
              <div className="text-center py-12 text-paleBlueGrey/60 text-xs border border-dashed border-paleBlueGrey/15 rounded-2xl">
                No active maintenance orders in progress.
              </div>
            ) : (
              inProgressPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card p-4.5 rounded-2xl border border-amber-400/25 hover:border-amber-400/50 transition-all space-y-3 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {post.department || 'Facility Ops'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{post.impact_score?.toFixed(1) || '8.2'}</span>
                    </div>
                  </div>

                  <Link href={`/post/${post.id}`}>
                    <h4 className="text-sm font-bold text-softWhite hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                  </Link>

                  <div className="p-2.5 bg-deepNavy/85 border border-paleBlueGrey/15 rounded-xl flex items-start gap-2 text-xs text-paleBlueGrey">
                    <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="italic leading-relaxed">
                      {post.admin_note || 'Technician dispatched with replacement equipment.'}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-paleBlueGrey/15 flex items-center justify-between text-xs gap-2">
                    <button
                      onClick={() => handleOpenRemark(post)}
                      className="text-xs font-semibold text-paleBlueGrey hover:text-softWhite underline"
                    >
                      Update Note
                    </button>

                    <button
                      onClick={() => {
                        updatePostStatus(
                          post.id,
                          'awaiting_verification',
                          'Admin completed work order. Awaiting physical student verification on site.',
                          true
                        );
                      }}
                      className="btn-fresh-green text-deepNavy text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <span>Mark Done</span>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Awaiting Student Verification */}
        <div className="bg-darkBlue/75 border border-paleBlueGrey/20 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15 px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-mintGreen" />
              <h3 className="text-sm font-bold text-softWhite uppercase tracking-wider">
                Awaiting Verification
              </h3>
            </div>
            <span className="badge-mint text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {awaitingVerificationPosts.length}
            </span>
          </div>

          <div className="space-y-3.5">
            {awaitingVerificationPosts.length === 0 ? (
              <div className="text-center py-12 text-paleBlueGrey/60 text-xs border border-dashed border-paleBlueGrey/15 rounded-2xl">
                No tickets awaiting verification.
              </div>
            ) : (
              awaitingVerificationPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card p-4.5 rounded-2xl border border-mintGreen/30 hover:border-mintGreen/60 transition-all space-y-3 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge-mint text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Student Verification
                    </span>
                    <span className="text-[11px] text-mintGreen font-bold">4/5 Confirmed</span>
                  </div>

                  <Link href={`/post/${post.id}`}>
                    <h4 className="text-sm font-bold text-softWhite hover:text-mintGreen transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                  </Link>

                  <div className="p-2.5 bg-deepNavy/85 border border-paleBlueGrey/15 rounded-xl text-xs text-paleBlueGrey space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-mintGreen">4 Students Confirmed Fixed</span>
                      <span className="text-paleBlueGrey/70">1 Needed</span>
                    </div>
                    <div className="w-full bg-deepNavy h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-mintGreen h-full w-[80%] rounded-full" />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-paleBlueGrey/15 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-paleBlueGrey/70">Automatic archive at 5</span>

                    <button
                      onClick={() => {
                        updatePostStatus(post.id, 'resolved', 'Consensus achieved. Confirmed fixed by students on site.');
                      }}
                      className="btn-fresh-green text-deepNavy text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                      Force Solved
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Remark Modal */}
      {activeRemarkPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deepNavy/85 backdrop-blur-md fade-in">
          <div className="w-full max-w-lg bg-darkBlue border border-paleBlueGrey/25 rounded-2xl p-6 space-y-4 shadow-2xl text-softWhite modal-enter">
            <div className="flex items-center justify-between pb-3 border-b border-paleBlueGrey/15">
              <h3 className="text-base font-bold text-softWhite flex items-center gap-2">
                <Pin className="w-4 h-4 text-skyBlue" />
                <span>Pin Official Administrative Remark</span>
              </h3>
              <button
                onClick={() => setActiveRemarkPost(null)}
                className="text-paleBlueGrey hover:text-softWhite text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-paleBlueGrey leading-relaxed">
              This note is displayed publicly to all students on the live ticket timeline and feed preview.
            </p>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-paleBlueGrey/70 block uppercase tracking-wider">
                Quick Preset Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetRemarks.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRemarkText(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-deepNavy/80 hover:bg-white/10 text-paleBlueGrey hover:text-softWhite border border-paleBlueGrey/15 transition-all text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="e.g. Work order #409 approved. Vendor arrived on site. Expected completion 5 PM."
              className="w-full bg-deepNavy/90 border border-paleBlueGrey/25 rounded-xl p-3.5 text-xs text-softWhite placeholder-paleBlueGrey/50 focus:outline-none focus:border-skyBlue shadow-inner leading-relaxed"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveRemarkPost(null)}
                className="px-4 py-2 text-xs font-semibold text-paleBlueGrey hover:text-softWhite transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRemark()}
                className="btn-fresh-green text-deepNavy font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
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
