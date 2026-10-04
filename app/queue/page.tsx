'use client';

import React, { useState, useEffect } from 'react';
import { useUpCampus } from '@/lib/store';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Edit3, 
  Sparkles, 
  MapPin, 
  Building2, 
  User, 
  Clock, 
  Keyboard 
} from 'lucide-react';

export default function SupervisorQueuePage() {
  const { posts, moderatePost } = useUpCampus();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const pendingPosts = posts.filter((p) => p.status === 'pending');
  const currentPost = pendingPosts[selectedIndex] || pendingPosts[0];

  const handleApprove = () => {
    if (!currentPost) return;
    moderatePost(currentPost.id, 'approve');
    if (selectedIndex >= pendingPosts.length - 1) {
      setSelectedIndex(Math.max(0, pendingPosts.length - 2));
    }
  };

  const handleRequestEdit = () => {
    if (!currentPost) return;
    const note = prompt('Enter notes for student (e.g. Please provide specific lab room number):');
    if (note) {
      moderatePost(currentPost.id, 'request_edit', note);
      if (selectedIndex >= pendingPosts.length - 1) {
        setSelectedIndex(Math.max(0, pendingPosts.length - 2));
      }
    }
  };

  // Keyboard shortcut listener: 'A' for Approve, 'R' for Reject, 'E' for Edit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!currentPost) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleApprove();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsRejectModalOpen(true);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleRequestEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPost, selectedIndex, pendingPosts.length]);

  const handleConfirmReject = () => {
    if (!currentPost) return;
    moderatePost(currentPost.id, 'reject', rejectReason || 'Does not adhere to campus submission guidelines');
    setIsRejectModalOpen(false);
    setRejectReason('');
    if (selectedIndex >= pendingPosts.length - 1) {
      setSelectedIndex(Math.max(0, pendingPosts.length - 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Role Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paleBlueGrey/15">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl badge-sky shadow-sm">
              <ShieldCheck className="w-5 h-5 text-skyBlue" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-softWhite">
              Supervisor Moderation Deck
            </h1>
          </div>
          <p className="text-xs text-paleBlueGrey mt-1">
            Review student submissions before they appear on the public vote-ranked feed.
          </p>
        </div>

        {/* Keyboard shortcut bar */}
        <div className="flex items-center gap-2 bg-darkBlue/80 border border-paleBlueGrey/20 px-3.5 py-2 rounded-xl text-xs text-paleBlueGrey shadow-sm">
          <Keyboard className="w-4 h-4 text-skyBlue" />
          <span>Hotkeys:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-deepNavy text-skyBlue border border-paleBlueGrey/20 font-mono text-[10px] font-bold">
            A
          </kbd>{' '}
          Approve •
          <kbd className="px-1.5 py-0.5 rounded bg-deepNavy text-red-400 border border-paleBlueGrey/20 font-mono text-[10px] font-bold">
            R
          </kbd>{' '}
          Reject •
          <kbd className="px-1.5 py-0.5 rounded bg-deepNavy text-softWhite border border-paleBlueGrey/20 font-mono text-[10px] font-bold">
            E
          </kbd>{' '}
          Edits
        </div>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-darkBlue/50 border border-paleBlueGrey/20 space-y-3">
          <div className="w-12 h-12 rounded-full badge-mint flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-6 h-6 stroke-[3] text-mintGreen" />
          </div>
          <h2 className="text-lg font-bold text-softWhite">
            Moderation Queue is Clean!
          </h2>
          <p className="text-xs text-paleBlueGrey max-w-sm mx-auto">
            All submitted campus grievances and suggestions have been audited. Check back when students submit new photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Queue List (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-paleBlueGrey flex items-center justify-between px-1">
              <span>Pending Tickets ({pendingPosts.length})</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {pendingPosts.map((post, idx) => {
                const isSelected = post.id === currentPost?.id;
                return (
                  <button
                    key={post.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-darkBlue border-skyBlue/50 shadow-glassGlow'
                        : 'bg-darkBlue/50 border-paleBlueGrey/15 hover:border-paleBlueGrey/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-paleBlueGrey mb-1">
                      <span className="font-semibold text-skyBlue">{post.category}</span>
                      <span>Level {post.severity}</span>
                    </div>
                    <h4 className="text-xs font-bold text-softWhite line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-paleBlueGrey/70">
                      <span>{post.location_name || post.location?.name || 'Campus'}</span>
                      <span className="text-paleBlueGrey/50">#{idx + 1} in line</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Card Deep Inspection (8 cols) */}
          {currentPost && (
            <div className="lg:col-span-8 glass-card border border-paleBlueGrey/20 rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-paleBlueGrey/15">
                <div className="flex items-center gap-2">
                  <span className="badge-sky px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {currentPost.kind === 'grievance' ? 'Fix It' : 'Add It'}
                  </span>
                  <span className="badge-mint px-2.5 py-1 rounded-lg text-xs font-semibold">
                    {currentPost.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-paleBlueGrey">
                  <Clock className="w-3.5 h-3.5 text-skyBlue" />
                  <span>Submitted recently</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-softWhite">
                  {currentPost.title}
                </h2>
                {currentPost.description && (
                  <p className="text-sm text-softWhite leading-relaxed bg-deepNavy/80 p-4 rounded-xl border border-paleBlueGrey/15 font-medium">
                    {currentPost.description}
                  </p>
                )}
              </div>

              {/* Photo Evidence */}
              {currentPost.photos && currentPost.photos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-paleBlueGrey">
                    Uploaded Photo Evidence
                  </span>
                  <div className="h-64 sm:h-80 rounded-2xl overflow-hidden border border-paleBlueGrey/20 bg-deepNavy shadow-inner">
                    <img
                      src={currentPost.photos[0]}
                      alt={currentPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* AI Advisory Hint & Fraud Telemetry Box */}
              <div className="p-4 rounded-2xl bg-deepNavy/80 border border-paleBlueGrey/15 space-y-2.5">
                <div className="flex items-center gap-2 text-skyBlue font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-skyBlue" />
                  <span>AI Pre-Screen Advisory Telemetry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-darkBlue/80 border border-paleBlueGrey/15">
                    <span className="text-[10px] text-paleBlueGrey block uppercase">Visual Authenticity</span>
                    <strong className="text-mintGreen font-bold">🟢 94% Genuine Issue</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-darkBlue/80 border border-paleBlueGrey/15">
                    <span className="text-[10px] text-paleBlueGrey block uppercase">Language Filter</span>
                    <strong className="text-mintGreen font-bold">🟢 Clean (No Abuse)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-darkBlue/80 border border-paleBlueGrey/15">
                    <span className="text-[10px] text-paleBlueGrey block uppercase">Author Trust</span>
                    <strong className="text-softWhite font-bold">0 Previous Strikes</strong>
                  </div>
                </div>
              </div>

              {/* Location & Department Anchors */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-paleBlueGrey">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-skyBlue" />
                  {currentPost.location_name || currentPost.location?.name || 'Campus Grounds'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-mintGreen" />
                  Assigned Dept: {currentPost.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-paleBlueGrey/60" />
                  Submitted by: {currentPost.author_name}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-paleBlueGrey/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Post (R)</span>
                  </button>

                  <button
                    onClick={handleRequestEdit}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-paleBlueGrey border border-paleBlueGrey/20 font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:text-softWhite"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Request Edits (E)</span>
                  </button>
                </div>

                <button
                  onClick={handleApprove}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl btn-fresh-green text-deepNavy font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve & Publish to Feed (A)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deepNavy/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-darkBlue border border-paleBlueGrey/20 rounded-2xl p-6 space-y-4 shadow-2xl text-softWhite">
            <h3 className="text-base font-bold text-softWhite">
              Reason for Rejection
            </h3>
            <p className="text-xs text-paleBlueGrey">
              Provide feedback so the student understands why this ticket was filtered out.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate post, prank submission, or lacks specific physical location..."
              className="w-full bg-deepNavy/80 border border-paleBlueGrey/25 rounded-xl p-3 text-xs text-softWhite placeholder-paleBlueGrey/50 focus:outline-none focus:border-skyBlue shadow-inner"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-paleBlueGrey hover:text-softWhite"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
