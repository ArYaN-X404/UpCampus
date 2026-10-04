'use client';

import React, { useState, useMemo } from 'react';
import { useUpCampus } from '@/lib/store';
import PostCard from '@/components/feed/PostCard';
import NewPostModal from '@/components/post/NewPostModal';
import { 
  Wrench, 
  Lightbulb, 
  CheckCheck, 
  GraduationCap, 
  Camera, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Wind,
  Bell,
  Sparkles
} from 'lucide-react';

export default function FeedPage() {
  const { 
    posts, 
    isAdmin, 
    escalatedPost, 
    closeEscalationModal, 
    resolvePostWithAdminNote 
  } = useUpCampus();

  const [currentTab, setCurrentTab] = useState<'complaint' | 'suggestion' | 'solved'>('suggestion');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'new' | 'photo'>('top');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [resolvingPostId, setResolvingPostId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Counts for tabs
  const complaintCount = posts.filter((p) => p.kind === 'grievance' && p.status !== 'resolved').length;
  const suggestionCount = posts.filter((p) => p.kind === 'suggestion' && p.status !== 'resolved').length;
  const solvedCount = posts.filter((p) => p.status === 'resolved').length;

  // Filter posts based on currentTab & search
  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => {
      if (['rejected'].includes(p.status)) return false;

      if (currentTab === 'solved') {
        return p.status === 'resolved';
      }
      if (currentTab === 'complaint') {
        return p.kind === 'grievance' && p.status !== 'resolved';
      }
      return p.kind === 'suggestion' && p.status !== 'resolved';
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.location_name && p.location_name.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'top') {
      result.sort((a, b) => b.agree_count - a.agree_count);
    } else if (sortBy === 'new') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'photo') {
      result.sort((a, b) => (b.photos.length > 0 ? 1 : 0) - (a.photos.length > 0 ? 1 : 0));
    }

    return result;
  }, [posts, currentTab, searchQuery, sortBy]);

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
      {/* Hero Banner matching up_campus_code.html */}
      <section className="bg-gradient-to-br from-deepNavy via-darkBlue to-[#0e3158] rounded-[2rem] p-8 sm:p-12 text-softWhite shadow-2xl relative overflow-hidden border border-paleBlueGrey/20 card-glow-top">
        {/* Subtle Watermark Icon */}
        <div className="absolute top-0 right-0 opacity-5 text-[16rem] -mt-16 -mr-16 pointer-events-none transform rotate-12">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <span className="badge-sky text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block shadow-sm">
            Student Governance OS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-softWhite">
            Fix what&apos;s broken. <br className="hidden sm:block" /> Build what&apos;s missing.
          </h1>
          <p className="text-paleBlueGrey text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-light">
            Report issues or suggest amenities. Posts that hit{' '}
            <strong className="text-softWhite bg-white/10 px-2 py-0.5 rounded font-bold border border-white/20">
              100+ votes
            </strong>{' '}
            trigger an automated escalation protocol to campus administration.
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
              Browse issues
            </button>
          </div>
        </div>
      </section>

      {/* Admin Mode Alert Notice if Active */}
      {isAdmin && (
        <div className="badge-mint rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-sm fade-in">
          <ShieldCheck className="w-5 h-5 text-mintGreen flex-shrink-0" />
          <span className="text-softWhite">
            <strong className="text-mintGreen">Admin View Active:</strong> You can click{' '}
            <span className="btn-fresh-green text-deepNavy px-2 py-0.5 rounded font-extrabold text-xs inline-block">
              Admin: Mark Resolved
            </span>{' '}
            on any ticket below to attach official remarks and move it to the Solved Archive.
          </span>
        </div>
      )}

      {/* Tabs & Search Navigation Bar */}
      <section className="space-y-4">
        {/* Navigation Tabs matching up_campus_code.html */}
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

      {/* Active Posts Feed */}
      <section className="space-y-5 pb-12">
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

      {/* Create Post Modal */}
      <NewPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        defaultType={currentTab === 'complaint' ? 'complaint' : 'suggestion'}
      />

      {/* 100-Vote Escalation Alert Modal matching up_campus_code.html */}
      {escalatedPost && (
        <div className="fixed inset-0 bg-deepNavy/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-darkBlue rounded-[2rem] p-8 shadow-2xl max-w-sm w-full text-center relative border border-red-500/30 modal-enter text-softWhite">
            <div className="w-20 h-20 bg-red-950/60 text-red-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner pulse-red relative border border-red-500/40">
              <AlertTriangle className="w-10 h-10" />
              <div className="absolute -top-1 -right-1 bg-deepNavy text-softWhite text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center border-2 border-red-500">
                100
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-softWhite mb-2 tracking-tight">
              Post Escalated!
            </h3>
            <p className="text-xs font-semibold text-paleBlueGrey mb-2 truncate">
              &quot;{escalatedPost.title}&quot;
            </p>
            <p className="text-sm text-paleBlueGrey mb-7 leading-relaxed font-medium">
              This issue has reached <strong className="text-red-400 font-bold">100 votes</strong> and is now escalated. Administration will receive automated reminders every 24 hours.
            </p>
            <button
              onClick={closeEscalationModal}
              className="w-full btn-fresh-green text-deepNavy font-extrabold py-3.5 rounded-xl transition-colors active:scale-95 shadow-md text-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Admin Note / Resolution Modal matching up_campus_code.html */}
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
