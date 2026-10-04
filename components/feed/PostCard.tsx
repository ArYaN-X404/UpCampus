'use client';

import React, { useState } from 'react';
import { Post } from '@/lib/types';
import { useUpCampus } from '@/lib/store';
import { Check, CheckCheck, Trash2, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';

interface PostCardProps {
  post: Post;
  onResolveClick?: (postId: string) => void;
}

export default function PostCard({ post, onResolveClick }: PostCardProps) {
  if (!post) return null;

  const { vote, isAdmin, currentUser, deletePost, comments, addComment, deleteComment } = useUpCampus();
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const safeId = String(post.id || 'post-1');
  const agreeCount = typeof post.agree_count === 'number' && !isNaN(post.agree_count) ? post.agree_count : 0;
  const isEscalated = agreeCount >= 100 && post.status !== 'resolved';
  const isSolved = post.status === 'resolved';
  const isGrievance = post.kind === 'grievance';
  const photos = Array.isArray(post.photos) ? post.photos.filter((p) => typeof p === 'string' && p.trim()) : [];

  // Deterministic handle & top comment based on safe post id
  const safeAuthor = String(post.author_name || (post.anonymous ? 'Anonymous Student' : 'Student Citizen'));
  const handle = post.author_name
    ? safeAuthor.toLowerCase().replace(/\s+/g, '_')
    : `anon_${safeId.slice(-4) || 'user'}`;

  // Simulated / dynamic top comments for interactive fidelity
  const simulatedComments: Record<string, { user: string; text: string; votes: number }> = {
    c1: { user: 'priya_m21', text: 'Spoke with the facility staff today, parts are being ordered.', votes: 14 },
    c2: { user: 'dev_k44', text: 'This has been broken since Tuesday. Needs immediate attention.', votes: 29 },
    c3: { user: 'rohit_singh', text: 'Seconded. Almost slipped on the wet floor near the stairs.', votes: 19 },
    c4: { user: 'ananya_v', text: 'Super essential during mid-term exam week late nights.', votes: 38 },
  };

  const rawDigits = safeId.replace(/\D/g, '');
  const idNum = parseInt(rawDigits || '1', 10);
  const commentKey = 'c' + ((isNaN(idNum) ? 1 : idNum % 4) + 1);
  const topComment = simulatedComments[commentKey] || {
    user: 'campus_rep',
    text: 'Flagged this with the estate warden during morning rounds.',
    votes: Math.max(3, Math.floor(agreeCount / 3)),
  };

  const postComments = comments[post.id] || [];
  const commentCount = postComments.length;
  const isOwner = mounted && (Boolean(currentUser?.id && currentUser.id === post.author_id) || post.author_id === 'student-1' || isAdmin);

  const handleDeletePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Delete this ticket from the campus feed? This action is permanent.')) {
      deletePost(post.id);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Delete your comment?')) {
      deleteComment(post.id, commentId);
    }
  };

  // Time display with NaN safety
  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'just now';
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) return 'recently';
    const diffMs = Date.now() - timestamp;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
        const shareUrl = `${window.location.origin}/post/${safeId}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Status badge details
  const getStatusInfo = () => {
    if (isSolved) return { label: 'Solved', class: 'approved' };
    if (post.status === 'approved') return { label: 'Approved by Admin', class: 'approved' };
    if (post.status === 'rejected') return { label: 'Declined', class: 'declined' };
    return { label: 'Under Review', class: 'pending' };
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <article
        className={`uc-card ${isGrievance ? 'broken' : 'need'} ${isEscalated ? 'escalated' : ''} fade-in`}
      >
        {/* Header (Exact UpCampus 3.0 .hd) */}
        <div className="uc-hd">
          <span className="uc-av">↗</span>
          <div>
            <b>{post.author_name || 'Anonymous Student'}</b>
            <small>
              @{handle} · {getTimeAgo(post.created_at)}
            </small>
          </div>
          <span className="uc-cat">{post.category || (isGrievance ? 'Maintenance' : 'Student Amenities')}</span>
        </div>

        {/* Title */}
        <Link href={`/post/${post.id}`} className="block group">
          <h3 className="my-3 text-xl sm:text-[22px] font-bold text-softWhite group-hover:text-skyBlue transition-colors tracking-tight leading-snug">
            {post.title}
          </h3>
        </Link>

        {/* Description */}
        {post.description && (
          <p className="text-sm sm:text-[14.5px] text-paleBlueGrey/90 leading-relaxed font-normal mb-3">
            {post.description}
          </p>
        )}

        {/* Tags Row (.tags) */}
        <div className="uc-tags">
          <span className={`uc-tg ${isGrievance ? 'r' : 'g'}`}>
            {isGrievance ? 'Fix It' : '+ Add It'}
          </span>
          <span className="uc-tg">
            📍 {post.location_name || post.location?.name || 'Campus Grounds'}
          </span>
          {post.department && (
            <span className="uc-tg hidden sm:inline-flex">
              🏛️ {post.department}
            </span>
          )}
          {isEscalated && (
            <span className="uc-tg r font-bold animate-pulse">
              🚨 Escalated (100+ Votes)
            </span>
          )}
        </div>

        {/* Photos Grid / Carousel (.md / .car) */}
        {photos.length > 0 && (
          <>
            {photos.length === 1 && (
              <div className="uc-md n1">
                <img
                  src={photos[0]}
                  alt={post.title}
                  onClick={() => setLightboxImg(photos[0])}
                  className="rounded-xl"
                />
              </div>
            )}

            {photos.length === 2 && (
              <div className="uc-md n2">
                {photos.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`${post.title} photo ${idx + 1}`}
                    onClick={() => setLightboxImg(src)}
                  />
                ))}
              </div>
            )}

            {photos.length === 3 && (
              <div className="uc-md n3">
                {photos.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`${post.title} photo ${idx + 1}`}
                    onClick={() => setLightboxImg(src)}
                  />
                ))}
              </div>
            )}

            {photos.length >= 4 && (
              <div className="relative mt-3.5 rounded-xl overflow-hidden border border-white/10 bg-deepNavy/60 aspect-[16/9]">
                <img
                  src={photos[activeSlide]}
                  alt={`${post.title} photo ${activeSlide + 1}`}
                  onClick={() => setLightboxImg(photos[activeSlide])}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                />
                
                {/* Counter Pill */}
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-deepNavy/80 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-sm">
                  {activeSlide + 1}/{photos.length}
                </span>

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevSlide}
                  aria-label="Previous photo"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-darkBlue/80 hover:bg-darkBlue text-softWhite hover:text-skyBlue flex items-center justify-center border border-white/20 shadow-md backdrop-blur-sm transition-colors text-base"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextSlide}
                  aria-label="Next photo"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-darkBlue/80 hover:bg-darkBlue text-softWhite hover:text-skyBlue flex items-center justify-center border border-white/20 shadow-md backdrop-blur-sm transition-colors text-base"
                >
                  ›
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(i);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeSlide ? 'w-4 bg-skyBlue' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Solved Note Block if Resolved */}
        {isSolved && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-deepNavy/85 border border-mintGreen/30 text-xs flex items-start gap-2.5 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-mintGreen/20 text-mintGreen flex items-center justify-center shrink-0 mt-0.5 border border-mintGreen/40">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-mintGreen block">
                Verified Admin Resolution
              </span>
              <p className="text-softWhite font-medium leading-relaxed">
                {post.admin_note || 'Issue inspected, addressed, and physically confirmed on site.'}
              </p>
            </div>
          </div>
        )}

        {/* Action Row (Exact UpCampus 3.0 .acts) */}
        <div className="uc-acts">
          {/* Vote Capsule (.vt) */}
          <div className={`uc-vt ${post.user_vote === 1 ? 'on' : ''}`}>
            <button
              onClick={() => vote(post.id, 1)}
              disabled={isSolved}
              className={`uc-ab up ${post.user_vote === 1 ? 'on' : ''} ${
                isSolved ? 'opacity-40 cursor-not-allowed' : 'active:scale-90'
              }`}
              aria-label="Upvote"
              title="Upvote / Agree"
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 15l6-6 6 6" />
              </svg>
            </button>
            <b className="tabular-nums">{post.agree_count}</b>
          </div>

          {/* Comment Button (Toggles Interactive Drawer) */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`uc-ab ${isCommentsOpen ? 'bg-sky-500/20 text-sky-300 border-sky-400/40' : ''}`}
            aria-label="Comments"
            title="View & add comments"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentCount}</span>
          </button>

          {/* Share Button with Link Copy (.ab) */}
          <button
            onClick={handleShare}
            className="uc-ab relative"
            aria-label="Share via Telegram / Copy link"
            title="Copy share link"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zM21.854 2.147 10.914 13.086" />
            </svg>
            {copied && (
              <span className="absolute left-1/2 -top-6 -translate-x-1/2 px-2 py-0.5 rounded bg-freshGreen text-deepNavy font-extrabold text-[10px] whitespace-nowrap shadow-md fade-in">
                Copied!
              </span>
            )}
          </button>

          {/* Delete Post Button (Owner or Admin) */}
          {isOwner && (
            <button
              type="button"
              onClick={handleDeletePost}
              className="uc-ab text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
              title="Delete this ticket"
              aria-label="Delete ticket"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] font-semibold">Delete</span>
            </button>
          )}

          {/* Right Status Pill & Admin Action (.sp) */}
          <div className="uc-sp">
            {mounted && isAdmin && !isSolved && (
              <button
                onClick={() => onResolveClick?.(post.id)}
                className="uc-mb s flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Mark this issue as solved"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark Solved</span>
              </button>
            )}

            <span className={`uc-pl ${statusInfo.class}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Interactive Student Comments Drawer */}
        {isCommentsOpen && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-3 fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                Student Comments ({postComments.length})
              </span>
              <button 
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Close ✕
              </button>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={`Comment as @${currentUser?.display_name?.toLowerCase().replace(/\s+/g, '_') || 'student'}...`}
                className="flex-1 bg-[#091124] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {postComments.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">No comments yet. Share an on-site update!</p>
              ) : (
                postComments.map((c) => {
                  const isCommentOwner = c.author_id === currentUser?.id || c.author_id === 'student-1' || isAdmin;
                  return (
                    <div key={c.id} className="p-2 rounded-lg bg-[#091124] border border-slate-800/80 flex items-start justify-between gap-2 text-xs">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200">@{c.author_handle || c.author_name}</span>
                          <span className="text-[10px] text-slate-500">• {getTimeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed break-words">{c.text}</p>
                      </div>
                      {isCommentOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                          title="Delete your comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </article>

      {/* Lightbox Dialog (Exact UpCampus 3.0 Image Zoom) */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Enlarged photo preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <span className="absolute top-4 right-4 bg-deepNavy/80 text-softWhite text-xs px-3 py-1.5 rounded-full border border-white/20">
              Click anywhere to close
            </span>
          </div>
        </div>
      )}
    </>
  );
}
