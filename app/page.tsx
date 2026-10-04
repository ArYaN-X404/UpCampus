'use client';

import React, { useState, useMemo } from 'react';
import { useUpCampus } from '@/lib/store';
import PostCard from '@/components/feed/PostCard';
import NewPostModal from '@/components/post/NewPostModal';
import { 
  Wrench, 
  Lightbulb, 
  CheckCheck, 
  Search, 
  Camera, 
  GraduationCap, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Wind,
  Bell,
  Activity,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Zap,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const { 
    posts, 
    isAdmin, 
    escalatedPost, 
    closeEscalationModal, 
    resolvePostWithAdminNote 
  } = useUpCampus();

  const [currentTab, setCurrentTab] = useState<'complaint' | 'suggestion' | 'solved'>('complaint');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'new' | 'photo'>('top');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [resolvingPostId, setResolvingPostId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Counts for tabs with null safety
  const complaintCount = (posts || []).filter((p) => p && p.kind === 'grievance' && p.status !== 'resolved').length;
  const suggestionCount = (posts || []).filter((p) => p && p.kind === 'suggestion' && p.status !== 'resolved').length;
  const solvedCount = (posts || []).filter((p) => p && p.status === 'resolved').length;

  // Filter posts based on currentTab & search with complete null/undefined protection
  const filteredPosts = useMemo(() => {
    let result = (posts || []).filter((p) => {
      if (!p || typeof p !== 'object') return false;
      if (['rejected'].includes(p.status)) return false;

      if (currentTab === 'solved') {
        return p.status === 'resolved';
      }
      if (currentTab === 'complaint') {
        return p.kind === 'grievance' && p.status !== 'resolved';
      }
      return p.kind === 'suggestion' && p.status !== 'resolved';
    });

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        if (!p) return false;
        const title = String(p.title || '').toLowerCase();
        const desc = String(p.description || '').toLowerCase();
        const cat = String(p.category || '').toLowerCase();
        const loc = String(p.location_name || p.location?.name || '').toLowerCase();
        const dept = String(p.department || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q) || loc.includes(q) || dept.includes(q);
      });
    }

    // Safe Sort order
    if (sortBy === 'top') {
      result.sort((a, b) => (Number(b.agree_count) || 0) - (Number(a.agree_count) || 0));
    } else if (sortBy === 'new') {
      result.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime() || 0;
        const timeB = new Date(b.created_at || 0).getTime() || 0;
        return timeB - timeA;
      });
    } else if (sortBy === 'photo') {
      result.sort((a, b) => ((b.photos && b.photos.length) || 0) - ((a.photos && a.photos.length) || 0));
    }

    return result;
  }, [posts, currentTab, searchQuery, sortBy]);

  // Escalation radar items (closest to 100 votes)
  const escalationRadar = useMemo(() => {
    return (posts || [])
      .filter((p) => p && p.status !== 'resolved' && !['rejected'].includes(p.status))
      .sort((a, b) => (Number(b.agree_count) || 0) - (Number(a.agree_count) || 0))
      .slice(0, 3);
  }, [posts]);

  // Top trending for Live Wall teaser
  const liveWallTeaser = useMemo(() => {
    return (posts || [])
      .filter((p) => p && p.status !== 'resolved' && !['rejected'].includes(p.status))
      .sort((a, b) => (Number(b.impact_score) || 0) - (Number(a.impact_score) || 0))
      .slice(0, 3);
  }, [posts]);

  const handleOpenResolveModal = (postId: string) => {
    setResolvingPostId(postId);
    setAdminNoteInput('');
  };

  const handleConfirmResolve = () => {
    if (resolvingPostId) {
      resolvePostWithAdminNote(resolvingPostId, adminNoteInput.trim());
      setResolvingPostId(null);
      setAdminNoteInput('');
      setCurrentTab('solved');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero Banner (Widescreen Optimized) */}
      <section className="bg-gradient-to-br from-deepNavy via-darkBlue to-[#0e3158] rounded-[2rem] p-6 sm:p-10 lg:p-12 text-softWhite shadow-2xl relative overflow-hidden border border-paleBlueGrey/20 card-glow-top">
        {/* Subtle Watermark Icon */}
        <div className="absolute top-0 right-0 opacity-5 text-[16rem] -mt-16 -mr-16 pointer-events-none transform rotate-12">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="badge-sky text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
              Student Governance OS
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-softWhite">
              Fix what&apos;s broken. <br className="hidden sm:block" /> Build what&apos;s missing.
            </h1>
            <p className="text-paleBlueGrey text-sm sm:text-base max-w-2xl leading-relaxed font-light">
              Report campus infrastructure issues or suggest student amenities. Issues that hit{' '}
              <strong className="text-softWhite bg-white/10 px-2 py-0.5 rounded font-bold border border-white/20">
                100+ student votes
              </strong>{' '}
              automatically trigger the 24-hour administration escalation protocol.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="btn-fresh-green text-deepNavy font-extrabold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 text-xs sm:text-sm flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-deepNavy stroke-[2.5]" />
                <span>Report with photo</span>
              </button>
              <button
                onClick={() => setCurrentTab('complaint')}
                className="bg-white/5 hover:bg-white/10 text-softWhite font-bold px-5 py-3 rounded-xl border border-paleBlueGrey/25 transition-all text-xs sm:text-sm"
              >
                Browse Campus Issues
              </button>
              <Link
                href="/live"
                className="bg-skyBlue/15 hover:bg-skyBlue/25 text-skyBlue font-bold px-5 py-3 rounded-xl border border-skyBlue/30 transition-all text-xs sm:text-sm inline-flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span>Open Live Projector Wall</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip on Banner */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 bg-deepNavy/80 backdrop-blur-md p-4 rounded-2xl border border-paleBlueGrey/15 shadow-inner">
            <div className="p-3 bg-darkBlue/70 rounded-xl border border-paleBlueGrey/10">
              <span className="text-[10px] font-bold text-paleBlueGrey uppercase tracking-wider block">
                Active Issues
              </span>
              <span className="text-2xl font-black text-softWhite tabular-nums">
                {complaintCount}
              </span>
              <span className="text-[10px] text-skyBlue block mt-0.5">Under Review</span>
            </div>

            <div className="p-3 bg-darkBlue/70 rounded-xl border border-paleBlueGrey/10">
              <span className="text-[10px] font-bold text-paleBlueGrey uppercase tracking-wider block">
                Suggestions
              </span>
              <span className="text-2xl font-black text-mintGreen tabular-nums">
                {suggestionCount}
              </span>
              <span className="text-[10px] text-mintGreen block mt-0.5">Student Backed</span>
            </div>

            <div className="p-3 bg-darkBlue/70 rounded-xl border border-paleBlueGrey/10">
              <span className="text-[10px] font-bold text-paleBlueGrey uppercase tracking-wider block">
                Verified Solved
              </span>
              <span className="text-2xl font-black text-freshGreen tabular-nums">
                {solvedCount}
              </span>
              <span className="text-[10px] text-freshGreen block mt-0.5">Permanent Fixes</span>
            </div>

            <div className="p-3 bg-darkBlue/70 rounded-xl border border-paleBlueGrey/10">
              <span className="text-[10px] font-bold text-paleBlueGrey uppercase tracking-wider block">
                Escalations
              </span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">
                {posts.filter(p => p.agree_count >= 100 && p.status !== 'resolved').length}
              </span>
              <span className="text-[10px] text-amber-400 block mt-0.5">Dean Notified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Mode Alert Notice if Active */}
      {mounted && isAdmin && (
        <div className="badge-mint rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-sm fade-in">
          <ShieldCheck className="w-5 h-5 text-mintGreen flex-shrink-0" />
          <span className="text-softWhite">
            <strong className="text-mintGreen">Admin View Active:</strong> You can click{' '}
            <span className="btn-fresh-green text-deepNavy px-2 py-0.5 rounded font-extrabold text-xs inline-block">
              Admin: Mark Solved
            </span>{' '}
            on any ticket below to attach official remarks and move it to the Solved Archive.
          </span>
        </div>
      )}

      {/* Main Grid: 8 Cols Feed + 4 Cols Laptop Telemetry Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        
        {/* LEFT / CENTER: Feed Column (8 Cols on Laptop) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs & Search Navigation Bar */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 border-b border-paleBlueGrey/15 pb-4">
              <button
                onClick={() => setCurrentTab('complaint')}
                className={`flex-1 sm:flex-none px-5 py-3 font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border ${
                  currentTab === 'complaint'
                    ? 'bg-skyBlue/20 text-skyBlue border-skyBlue/50 shadow-glassGlow'
                    : 'text-paleBlueGrey bg-darkBlue/60 hover:bg-darkBlue border-paleBlueGrey/15 hover:text-softWhite'
                }`}
              >
                <Wrench className="w-4 h-4 text-skyBlue" />
                <span>Broken (Fix It)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-deepNavy/80 text-paleBlueGrey">
                  {complaintCount}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('suggestion')}
                className={`flex-1 sm:flex-none px-5 py-3 font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 border ${
                  currentTab === 'suggestion'
                    ? 'bg-mintGreen/20 text-mintGreen border-mintGreen/50 shadow-mintGlow'
                    : 'text-paleBlueGrey bg-darkBlue/60 hover:bg-darkBlue border-paleBlueGrey/15 hover:text-softWhite'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-mintGreen" />
                <span>Needs (Add It)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-deepNavy/80 text-paleBlueGrey">
                  {suggestionCount}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('solved')}
                className={`w-full sm:w-auto px-5 py-3 font-bold text-sm rounded-2xl transition-all sm:ml-auto border flex items-center justify-center gap-2 ${
                  currentTab === 'solved'
                    ? 'btn-fresh-green text-deepNavy shadow-greenGlow font-extrabold'
                    : 'border-paleBlueGrey/20 hover:border-mintGreen/40 text-paleBlueGrey bg-darkBlue/60 hover:text-softWhite'
                }`}
              >
                <CheckCheck className="w-4 h-4" />
                <span>Solved Archive</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-deepNavy/80 text-paleBlueGrey">
                  {solvedCount}
                </span>
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-paleBlueGrey/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, location or keywords..."
                  className="w-full text-sm border border-paleBlueGrey/20 bg-darkBlue/80 text-softWhite placeholder-paleBlueGrey/50 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-skyBlue transition-all font-medium shadow-inner"
                />
              </div>

              <div className="flex items-center bg-deepNavy/80 border border-paleBlueGrey/20 rounded-2xl p-1 shadow-inner self-start sm:self-auto">
                <button
                  onClick={() => setSortBy('top')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sortBy === 'top'
                      ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                      : 'text-paleBlueGrey hover:text-softWhite'
                  }`}
                >
                  Top Votes
                </button>
                <button
                  onClick={() => setSortBy('new')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sortBy === 'new'
                      ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                      : 'text-paleBlueGrey hover:text-softWhite'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('photo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sortBy === 'photo'
                      ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                      : 'text-paleBlueGrey hover:text-softWhite'
                  }`}
                >
                  With Photos
                </button>
              </div>
            </div>
          </section>

          {/* Real-Time Citizen Toast Alert */}
          {toastMsg && (
            <div className="p-3.5 rounded-xl bg-freshGreen/20 border border-freshGreen/40 text-softWhite flex items-center justify-between shadow-lg fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-mintGreen">
                <CheckCircle2 className="w-4 h-4 text-freshGreen shrink-0" />
                <span>{toastMsg}</span>
              </div>
              <button 
                onClick={() => setToastMsg(null)} 
                className="text-paleBlueGrey hover:text-softWhite text-xs font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Posts Feed */}
          <section className="space-y-4 pb-12">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-darkBlue/40 backdrop-blur-sm border-2 border-dashed border-paleBlueGrey/20 rounded-[2rem] shadow-sm fade-in space-y-3">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-paleBlueGrey">
                  <Wind className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-softWhite">All Clear!</h3>
                <p className="text-sm font-medium text-paleBlueGrey max-w-sm mx-auto">
                  No active campus posts in this section right now.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onResolveClick={handleOpenResolveModal}
                />
              ))
            )}
          </section>
        </div>

        {/* RIGHT: Laptop Governance Station & Real-Time Radar (4 Cols on Laptop) */}
        <aside className="lg:col-span-4 space-y-6 sticky top-20 hidden lg:block">
          
          {/* Card 1: 100-Vote Escalation Radar */}
          <div className="glass-card rounded-2xl p-5 border border-paleBlueGrey/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15">
              <span className="text-xs font-bold uppercase tracking-wider text-softWhite flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Auto-Escalation Radar
              </span>
              <span className="badge-sky text-[10px] px-2 py-0.5 rounded font-bold">100 Votes SLA</span>
            </div>

            <p className="text-xs text-paleBlueGrey leading-relaxed">
              When an issue crosses 100 votes, automated priority alerts are dispatched to the Dean & Facility Warden.
            </p>

            <div className="space-y-3 pt-1">
              {escalationRadar.map((p) => {
                const progressPct = Math.min(100, Math.round((p.agree_count / 100) * 100));
                const isOver = p.agree_count >= 100;
                return (
                  <Link
                    key={p.id}
                    href={`/post/${p.id}`}
                    className="block p-3 rounded-xl bg-deepNavy/85 border border-paleBlueGrey/15 hover:border-skyBlue/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-softWhite truncate group-hover:text-skyBlue transition-colors max-w-[180px]">
                        {p.title}
                      </span>
                      <span className={`font-extrabold tabular-nums ${isOver ? 'text-red-400' : 'text-skyBlue'}`}>
                        {p.agree_count}/100
                      </span>
                    </div>

                    <div className="w-full bg-darkBlue h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-red-500' : 'bg-gradient-to-r from-skyBlue to-mintGreen'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Card 2: Department Response Velocity (Live SLA) */}
          <div className="glass-card rounded-2xl p-5 border border-paleBlueGrey/20 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15">
              <span className="text-xs font-bold uppercase tracking-wider text-softWhite flex items-center gap-2">
                <Activity className="w-4 h-4 text-skyBlue" />
                Department Velocity
              </span>
              <span className="text-[10px] text-mintGreen font-semibold">Live SLA</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-deepNavy/70 border border-paleBlueGrey/10">
                <span className="text-paleBlueGrey font-medium">Electrical Facility</span>
                <div className="flex items-center gap-2">
                  <span className="text-mintGreen font-bold">1.4 days</span>
                  <span className="w-2 h-2 rounded-full bg-mintGreen"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-deepNavy/70 border border-paleBlueGrey/10">
                <span className="text-paleBlueGrey font-medium">Sanitation & Water</span>
                <div className="flex items-center gap-2">
                  <span className="text-skyBlue font-bold">2.8 days</span>
                  <span className="w-2 h-2 rounded-full bg-skyBlue"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-deepNavy/70 border border-paleBlueGrey/10">
                <span className="text-paleBlueGrey font-medium">Civil & Hostel Works</span>
                <div className="flex items-center gap-2">
                  <span className="text-skyBlue font-bold">3.5 days</span>
                  <span className="w-2 h-2 rounded-full bg-skyBlue"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-deepNavy/70 border border-paleBlueGrey/10">
                <span className="text-paleBlueGrey font-medium">Campus Wi-Fi Network</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">5.6 days</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                </div>
              </div>
            </div>

            <Link
              href="/admin"
              className="text-[11px] font-bold text-skyBlue hover:text-white flex items-center justify-end gap-1 pt-1"
            >
              <span>Open Control Room</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3: Live Wall Quick Preview */}
          <div className="glass-card rounded-2xl p-5 border border-paleBlueGrey/20 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-paleBlueGrey/15">
              <span className="text-xs font-bold uppercase tracking-wider text-softWhite flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Live Wall Leaderboard
              </span>
              <span className="text-[10px] text-skyBlue font-semibold">Real-Time</span>
            </div>

            <div className="space-y-2">
              {liveWallTeaser.map((p, idx) => (
                <Link
                  key={p.id}
                  href="/live"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <span className="w-6 h-6 rounded-lg bg-skyBlue/15 text-skyBlue font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-xs text-softWhite truncate group-hover:text-skyBlue transition-colors flex-1">
                    {p.title}
                  </span>
                  <span className="text-xs font-bold text-amber-400 tabular-nums">
                    {Number(p.impact_score || 0).toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href="/live"
              className="btn-fresh-green text-deepNavy text-xs font-extrabold w-full py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Projector Resolution Wall</span>
            </Link>
          </div>

        </aside>

      </div>

      {/* Create Post Modal */}
      <NewPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        defaultType={currentTab === 'complaint' ? 'complaint' : 'suggestion'}
        onPostCreated={(newPost) => {
          // 1. Switch to matching tab
          setCurrentTab(newPost.kind === 'grievance' ? 'complaint' : 'suggestion');
          // 2. Set sort to newest so the post is immediately displayed at the top of the feed
          setSortBy('new');
          // 3. Clear search filter
          setSearchQuery('');
          // 4. Show success banner
          setToastMsg(`🎉 Ticket "${newPost.title}" posted to the live feed! (+10 XP)`);
          setTimeout(() => setToastMsg(null), 6000);
        }}
      />

      {/* 100-Vote Escalation Alert Modal */}
      {escalatedPost && (
        <div className="fixed inset-0 bg-deepNavy/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-darkBlue rounded-[2rem] p-8 shadow-2xl max-w-sm w-full text-center relative border border-red-500/30 modal-enter text-softWhite">
            <div className="w-20 h-20 bg-red-950/60 text-red-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner pulse-red relative border border-red-500/40">
              <AlertTriangle className="w-10 h-10" />
              <div className="absolute -top-1 -right-1 bg-deepNavy text-softWhite text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center border-2 border-red-500">
                100
              </div>
            </div>

            <h3 className="text-2xl font-black text-softWhite mb-2">
              Auto-Escalated!
            </h3>
            <p className="text-xs text-paleBlueGrey leading-relaxed mb-6 font-medium">
              &quot;{escalatedPost.title}&quot; just reached{' '}
              <strong className="text-red-400 font-bold">100 student votes</strong>. The facility
              superintendent has been notified via priority SMS dispatch.
            </p>

            <button
              onClick={closeEscalationModal}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Admin Note / Resolution Modal */}
      {resolvingPostId && (
        <div className="fixed inset-0 bg-deepNavy/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-darkBlue rounded-[2rem] p-8 shadow-2xl max-w-md w-full relative modal-enter border border-paleBlueGrey/20 text-softWhite">
            <h3 className="text-xl font-extrabold text-softWhite mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-mintGreen/20 text-mintGreen rounded-xl flex items-center justify-center border border-mintGreen/30">
                <CheckCheck className="w-5 h-5" />
              </div>
              <span>Mark as Resolved</span>
            </h3>
            <p className="text-xs text-paleBlueGrey mb-5 font-medium">
              Provide an official administrative remark for the students. This will be permanently recorded in the Solved Archive.
            </p>

            <div className="mb-6">
              <label className="block text-[11px] font-bold text-paleBlueGrey uppercase tracking-widest mb-2">
                Official Remarks
              </label>
              <textarea
                rows={3}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="e.g., Electrical maintenance completed. LED fixtures replaced on pathway."
                className="w-full text-sm border border-paleBlueGrey/25 bg-deepNavy/90 text-softWhite placeholder-paleBlueGrey/50 rounded-2xl px-5 py-4 focus:outline-none focus:border-mintGreen resize-none transition-all shadow-inner font-medium"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-paleBlueGrey/15">
              <button
                onClick={() => setResolvingPostId(null)}
                className="px-6 py-2.5 font-bold text-paleBlueGrey hover:bg-white/5 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="btn-fresh-green text-deepNavy px-6 py-2.5 font-extrabold rounded-xl shadow-lg transition-all active:scale-95 text-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
