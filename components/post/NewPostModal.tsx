'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUpCampus } from '@/lib/store';
import { PostKind } from '@/lib/types';
import { 
  X, 
  PenTool, 
  Wrench, 
  Plus, 
  Bot, 
  ArrowUp, 
  Sparkles, 
  Loader2, 
  UploadCloud, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Check, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'complaint' | 'suggestion';
  onSuccessToast?: (msg: string) => void;
}

interface TriageResult {
  category: string;
  department: string;
  urgency: 'low' | 'medium' | 'urgent';
  safetyRisk: boolean;
  confidence: number;
  suggestedTitle: string;
  suggestedLocation: string;
  suggestedDescription: string;
}

export default function NewPostModal({ 
  isOpen, 
  onClose, 
  defaultType = 'suggestion',
  onSuccessToast 
}: NewPostModalProps) {
  const { addPost, searchSimilar, upvotePost, currentUser } = useUpCampus();

  const [kind, setKind] = useState<PostKind>(defaultType === 'complaint' ? 'grievance' : 'suggestion');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'urgent'>('medium');
  const [anonymous, setAnonymous] = useState(false);

  const [matchedPost, setMatchedPost] = useState<{ id: string; title: string; count: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync defaultType when reopened
  useEffect(() => {
    if (isOpen) {
      setKind(defaultType === 'complaint' ? 'grievance' : 'suggestion');
      setIsApplied(false);
      setShowToast(false);
    }
  }, [isOpen, defaultType]);

  // Debounced duplicate ticket search
  useEffect(() => {
    if (!title.trim() || title.length < 5) {
      setMatchedPost(null);
      return;
    }

    const timer = setTimeout(() => {
      const results = searchSimilar(title);
      if (results && results.length > 0) {
        setMatchedPost({
          id: results[0].id,
          title: results[0].title,
          count: results[0].agree_count,
        });
      } else {
        setMatchedPost(null);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [title, searchSimilar]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (title.trim().length >= 3 && location.trim().length >= 2) {
          e.preventDefault();
          executeSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, location, description, photoUrl, kind, urgency, anonymous]);

  if (!isOpen) return null;

  // Process AI Triage on image selection
  const processImageTriage = (url: string) => {
    setPhotoUrl(url);
    setIsAnalyzing(true);
    setTriageResult(null);
    setIsApplied(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (url.includes('street') || url.includes('dark')) {
        setTriageResult({
          category: 'Electrical & Lighting',
          department: 'Maintenance Office',
          urgency: 'urgent',
          safetyRisk: true,
          confidence: 96,
          suggestedTitle: 'Street lights fused on Girls Hostel pathway',
          suggestedLocation: 'Hostel Block 3 Road, North Campus',
          suggestedDescription: 'Total darkness after 7:30 PM creates safety hazards for students walking back from evening computer labs.',
        });
      } else if (url.includes('water') || url.includes('sink')) {
        setTriageResult({
          category: 'Sanitation & Plumbing',
          department: 'Water Works',
          urgency: 'medium',
          safetyRisk: false,
          confidence: 92,
          suggestedTitle: 'Severe washroom tap leak flooding corridor',
          suggestedLocation: '3rd Floor Science Block Washrooms',
          suggestedDescription: 'Continuous high pressure water leakage leading to flooded corridor and slippery floor hazards.',
        });
      } else {
        setTriageResult({
          category: 'Student Amenities',
          department: 'Campus Welfare',
          urgency: 'low',
          safetyRisk: false,
          confidence: 89,
          suggestedTitle: 'Need an automated Snack Vending Machine',
          suggestedLocation: 'Central Library Ground Floor Lobby',
          suggestedDescription: 'A 24/7 smart vending machine would serve students studying late during midterms and exam weeks.',
        });
      }
    }, 900);
  };

  const handleApplyTriage = () => {
    if (!triageResult) return;
    setTitle(triageResult.suggestedTitle);
    setLocation(triageResult.suggestedLocation);
    setDescription(triageResult.suggestedDescription);
    setUrgency(triageResult.urgency);
    setKind(triageResult.safetyRisk || triageResult.urgency === 'urgent' ? 'grievance' : 'suggestion');
    setIsApplied(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      processImageTriage(objectUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      processImageTriage(objectUrl);
    }
  };

  const isComplaint = kind === 'grievance';
  const isFormValid = title.trim().length >= 3 && location.trim().length >= 2;

  // Completeness score breakdown
  const factors = {
    title: title.trim().length >= 5,
    location: location.trim().length >= 3,
    photo: !!photoUrl,
    details: description.trim().length >= 10,
  };
  const factorCount = (factors.title ? 1 : 0) + (factors.location ? 1 : 0) + (factors.photo ? 1 : 0) + (factors.details ? 1 : 0);
  
  // Real-time calculated Impact Score
  const estimatedImpact = factorCount === 0 ? '—' : (
    2.0 + 
    (factorCount * 1.5) + 
    (isComplaint ? 1.0 : 0.5) + 
    (urgency === 'urgent' ? 1.5 : urgency === 'medium' ? 0.8 : 0.2)
  ).toFixed(1);

  const impactPercentage = factorCount === 0 ? 0 : Math.min(100, Math.round((parseFloat(estimatedImpact) / 10) * 100));

  const executeSubmit = () => {
    if (!isFormValid) return;

    addPost({
      author_id: currentUser?.id || 'student-1',
      kind,
      title: title.trim(),
      description: description.trim() || null,
      category: kind === 'grievance' ? 'Broken' : 'Needs',
      severity: urgency === 'urgent' ? 3 : urgency === 'medium' ? 2 : 1,
      safety_risk: urgency === 'urgent' || title.toLowerCase().includes('dark') || title.toLowerCase().includes('leak'),
      department: triageResult?.department || (kind === 'grievance' ? 'Maintenance' : 'Student Amenities'),
      location_name: location.trim() || 'Campus Grounds',
      photos: photoUrl ? [photoUrl] : [],
      anonymous,
      status: 'approved',
      author_name: anonymous ? 'Anonymous Student' : currentUser?.display_name || 'Aarav Sharma (CS-25)',
    });

    onSuccessToast?.('🎉 +10 XP Citizen Reward! Your ticket was posted to the campus feed.');
    setShowToast(true);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubmit();
  };

  return (
    <div className="fixed inset-0 bg-[#0B1530]/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto fade-in">
      <div 
        ref={modalRef}
        className="relative my-auto w-full max-w-5xl max-h-[calc(100dvh-48px)] flex flex-col rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#142747] via-[#0f213d] to-[#0B1530] shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden modal-enter transition-all duration-300"
      >
        {/* Dynamic Top Ambient Corner Sheen */}
        <div 
          className={`absolute -top-32 -left-32 w-80 h-80 rounded-full pointer-events-none filter blur-3xl opacity-20 transition-all duration-700 ${
            isComplaint ? 'bg-amber-500' : 'bg-mintGreen'
          }`}
        />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-skyBlue/40 to-transparent pointer-events-none" />

        {/* Modal Top Header with Far Top-Right Close Button */}
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-7 sm:pb-5 border-b border-white/10 flex items-center justify-between relative z-20">
          <div className="pr-12">
            <h3 className="text-2xl font-semibold tracking-tight text-softWhite">
              Submit campus ticket
            </h3>
            <p className="text-xs text-paleBlueGrey mt-0.5 max-w-xl leading-relaxed">
              Voice real campus problems. Verified tickets trigger automated administration review.
            </p>
          </div>

          {/* Close Button at Far Top-Right Corner */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-paleBlueGrey hover:text-softWhite transition-all active:scale-95 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable 2-Column Workspace */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 relative z-10">
          {/* LEFT COLUMN: Interactive Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            <form id="new-post-form" onSubmit={handleFormSubmit} className="space-y-6">
              {/* 1. Ticket Type Cards (RadioGroup with Arrow Nav) */}
              <div>
                <label className="block text-[13px] font-medium text-slate-300 mb-2">
                  Ticket type <span className="text-amber-400">*</span>
                </label>
                <div 
                  role="radiogroup" 
                  aria-label="Ticket Type"
                  className="grid grid-cols-2 gap-3.5"
                >
                  {/* Complaint Card */}
                  <div
                    role="radio"
                    aria-checked={isComplaint}
                    tabIndex={0}
                    onClick={() => setKind('grievance')}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setKind('suggestion');
                    }}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      isComplaint
                        ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-softWhite'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-softWhite'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isComplaint ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'
                      }`}>
                        <Wrench className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      {isComplaint && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-deepNavy flex items-center justify-center text-[10px] font-bold shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-softWhite mb-1">
                      Broken (Fix It)
                    </h4>
                    <p className="text-xs text-slate-400 leading-snug">
                      Damaged lights, leaks, broken fixtures or security concerns.
                    </p>
                  </div>

                  {/* Suggestion Card */}
                  <div
                    role="radio"
                    aria-checked={!isComplaint}
                    tabIndex={0}
                    onClick={() => setKind('suggestion')}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setKind('grievance');
                    }}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-mintGreen ${
                      !isComplaint
                        ? 'bg-gradient-to-br from-mintGreen/20 via-mintGreen/10 to-transparent border-mintGreen/60 shadow-[0_0_25px_rgba(167,232,195,0.25)] text-softWhite'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:text-softWhite'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        !isComplaint ? 'bg-mintGreen/20 text-mintGreen' : 'bg-white/5 text-slate-400'
                      }`}>
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </div>
                      {!isComplaint && (
                        <span className="w-5 h-5 rounded-full bg-mintGreen text-deepNavy flex items-center justify-center text-[10px] font-bold shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-softWhite mb-1">
                      Needs (Add It)
                    </h4>
                    <p className="text-xs text-slate-400 leading-snug">
                      Campus amenities, study spaces, vending machines, or bus routes.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Photo Evidence & AI Triage Dropzone (110px Tall) */}
              <div className="space-y-2.5">
                <label className="block text-[13px] font-medium text-slate-300">
                  Photo evidence <span className="text-paleBlueGrey/60 text-xs font-normal">(Optional)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* 110px Dashed Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed h-28 p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-skyBlue bg-skyBlue/10'
                      : photoUrl
                      ? 'border-mintGreen/50 bg-mintGreen/5 hover:border-mintGreen/70'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-softWhite">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-skyBlue">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-softWhite">
                      {photoUrl ? 'Photo attached (click to change)' : 'Drop a photo or browse'}
                    </span>
                  </div>
                  <p className="text-[12px] text-paleBlueGrey">
                    JPG or PNG up to 10MB • AI scans context and autofills ticket
                  </p>
                </div>

                {/* Sample Chips with 24px Rounded Thumbnails */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-medium text-paleBlueGrey block">
                    Or test AI vision sample:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { 
                        label: 'Library Vending', 
                        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' 
                      },
                      { 
                        label: 'Hostel Pathway', 
                        url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80' 
                      },
                      { 
                        label: 'Washroom Tap', 
                        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' 
                      },
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => processImageTriage(sample.url)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                          photoUrl === sample.url
                            ? 'bg-skyBlue/20 text-skyBlue border-skyBlue/50 font-semibold shadow-sm'
                            : 'bg-white/5 text-paleBlueGrey border-white/10 hover:text-softWhite hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <img 
                          src={sample.url} 
                          alt={sample.label} 
                          className="w-6 h-6 rounded-md object-cover" 
                        />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Title & Location Side by Side (48px Height) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-slate-300">
                      Ticket title <span className="text-amber-400">*</span>
                    </label>
                    {factors.title && (
                      <span className="text-mintGreen text-xs flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <PenTool className="w-4 h-4 text-paleBlueGrey/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Broken water filter tap"
                      className="w-full h-12 text-[15px] bg-[#0B1530]/80 border border-white/10 hover:border-white/20 text-softWhite placeholder-paleBlueGrey/40 rounded-xl pl-10 pr-3 focus:outline-none focus:border-skyBlue focus:ring-[3px] focus:ring-skyBlue/25 transition-all font-medium shadow-inner"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-slate-300">
                      Campus location <span className="text-amber-400">*</span>
                    </label>
                    {factors.location && (
                      <span className="text-mintGreen text-xs flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-paleBlueGrey/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Ground Floor, Block 3"
                      className="w-full h-12 text-[15px] bg-[#0B1530]/80 border border-white/10 hover:border-white/20 text-softWhite placeholder-paleBlueGrey/40 rounded-xl pl-10 pr-3 focus:outline-none focus:border-skyBlue focus:ring-[3px] focus:ring-skyBlue/25 transition-all font-medium shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* AI Duplicate Checker Warning */}
              {matchedPost && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-sm fade-in backdrop-blur-md">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-amber-300 mb-0.5 flex items-center gap-1.5">
                        <span>Similar Post Detected</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 font-extrabold">
                          AI Match
                        </span>
                      </h4>
                      <p className="text-[12px] text-paleBlueGrey mb-2 leading-relaxed truncate">
                        &quot;{matchedPost.title}&quot; ({matchedPost.count} votes)
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          upvotePost(matchedPost.id);
                          onClose();
                        }}
                        className="btn-fresh-green text-deepNavy text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Upvote Existing (+{matchedPost.count})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Details Context with Character Counter (112px Height) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-slate-300">
                    Detailed context <span className="text-paleBlueGrey/60 text-xs font-normal">(Optional)</span>
                  </label>
                  <span className="text-[12px] text-paleBlueGrey/60 tabular-nums">
                    {description.length}/300
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this needs to be addressed or how it impacts student life..."
                  className="w-full h-28 text-[15px] bg-[#0B1530]/80 border border-white/10 hover:border-white/20 text-softWhite placeholder-paleBlueGrey/40 rounded-xl p-3.5 focus:outline-none focus:border-skyBlue focus:ring-[3px] focus:ring-skyBlue/25 transition-all font-medium resize-none shadow-inner leading-relaxed"
                />
                <p className="text-[12px] text-paleBlueGrey/60 mt-1">
                  Clear context helps campus maintenance teams prioritize repairs.
                </p>
              </div>

              {/* 5. Urgency & Privacy Row (Both Aligned at 44px Height) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Urgency Pills (44px Height) */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-1.5">
                    Urgency level
                  </label>
                  <div className="flex items-center gap-2 h-11">
                    {[
                      { 
                        id: 'low', 
                        label: 'Low', 
                        activeStyle: 'border-slate-500/60 bg-slate-800/60 text-slate-200' 
                      },
                      { 
                        id: 'medium', 
                        label: 'Medium', 
                        activeStyle: 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                      },
                      { 
                        id: 'urgent', 
                        label: 'Urgent', 
                        activeStyle: 'border-red-500/60 bg-red-500/25 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.3)] ring-1 ring-red-500/40' 
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setUrgency(item.id as 'low' | 'medium' | 'urgent')}
                        className={`flex-1 h-full rounded-xl text-xs font-semibold transition-all border ${
                          urgency === item.id
                            ? item.activeStyle
                            : 'bg-white/[0.03] border-white/10 text-paleBlueGrey/70 hover:text-softWhite hover:border-white/20'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anonymity Switch (44px Height) */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-1.5">
                    Privacy setting
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={anonymous}
                    onClick={() => setAnonymous(!anonymous)}
                    className={`w-full h-11 rounded-xl border px-3.5 flex items-center justify-between text-xs transition-all ${
                      anonymous
                        ? 'bg-white/10 border-white/30 text-softWhite'
                        : 'bg-white/[0.03] border-white/10 text-paleBlueGrey hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-paleBlueGrey" />
                      <span className="font-medium text-softWhite">Post anonymously</span>
                    </div>

                    {/* Standard 44x24px Switch with Sliding Knob */}
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      anonymous ? (isComplaint ? 'bg-amber-500' : 'bg-mintGreen') : 'bg-white/15'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        anonymous ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Preview, AI Triage & Impact Completeness (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0B1530]/60 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-white/10 space-y-4 flex flex-col justify-start">
            {/* Panel Title (Sentence Case with Pulsing Green Dot) */}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-mintGreen animate-pulse shadow-[0_0_8px_#38C982]" />
                <h4 className="text-sm font-semibold text-softWhite">
                  Live preview
                </h4>
              </div>
              <p className="text-[12px] text-paleBlueGrey mt-0.5">
                Exact representation of your post in the campus feed.
              </p>
            </div>

            {/* 1. Live Feed Preview Card */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 shadow-glass space-y-3.5">
              <div className="flex items-start gap-3">
                {/* Miniature Vote Rail */}
                <div className="w-10 rounded-xl bg-deepNavy/90 border border-white/10 p-1.5 flex flex-col items-center justify-center shrink-0">
                  <ChevronUp className="w-4 h-4 text-skyBlue stroke-[2.5]" />
                  <span className="text-xs font-extrabold text-softWhite py-0.5">1</span>
                  <ChevronDown className="w-4 h-4 text-paleBlueGrey/40" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isComplaint ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Wrench className="w-2.5 h-2.5" />
                        <span>Fix It</span>
                      </span>
                    ) : (
                      <span className="badge-mint text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Plus className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Add It</span>
                      </span>
                    )}

                    {/* Location Badge (Dashed & Dimmed until filled) */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-[130px] border ${
                      location.trim()
                        ? 'font-semibold text-paleBlueGrey bg-white/5 border-white/10'
                        : 'border-dashed border-paleBlueGrey/25 text-paleBlueGrey/50'
                    }`}>
                      <MapPin className="w-2.5 h-2.5 text-skyBlue/80" />
                      <span>{location.trim() || 'Campus location'}</span>
                    </span>

                    {/* Urgency Badge with Pulsing Dot */}
                    {urgency === 'urgent' ? (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                        Urgent
                      </span>
                    ) : urgency === 'medium' ? (
                      <span className="text-[10px] font-medium text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                        Medium
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-paleBlueGrey/70 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">
                        Standard
                      </span>
                    )}
                  </div>

                  {/* Title (Dimmed 40% when empty) */}
                  <h4 className={`text-sm leading-snug line-clamp-2 ${
                    title.trim() 
                      ? 'font-bold text-softWhite' 
                      : 'text-softWhite/35 italic font-normal'
                  }`}>
                    {title.trim() || 'Your ticket title will appear here...'}
                  </h4>
                </div>
              </div>

              {/* Description (Dimmed 40% when empty) */}
              <p className={`text-xs leading-relaxed line-clamp-2 ${
                description.trim()
                  ? 'text-paleBlueGrey font-medium'
                  : 'text-paleBlueGrey/40 italic font-normal'
              }`}>
                {description.trim() || 'Detailed context and remarks will be visible to student voters and campus administrators.'}
              </p>

              {/* Uploaded Photo Preview */}
              {photoUrl && (
                <div className="h-28 rounded-xl overflow-hidden border border-white/10 bg-deepNavy">
                  <img src={photoUrl} alt="Upload preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Author Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-paleBlueGrey">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-skyBlue" />
                  <span>Just now</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  {anonymous ? (
                    <>
                      <Shield className="w-3 h-3 text-paleBlueGrey" />
                      <strong className="text-softWhite">Anonymous Student</strong>
                    </>
                  ) : (
                    <>
                      By: <strong className="text-softWhite">{currentUser?.display_name || 'Aarav Sharma (CS-25)'}</strong>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* 2. AI Triage Result Card (Directly Below Preview Card — Eliminating Void) */}
            <div className="rounded-2xl border border-white/10 bg-darkBlue/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-softWhite">
                  <Sparkles className="w-3.5 h-3.5 text-skyBlue" />
                  <span>AI triage analysis</span>
                </div>
                {triageResult && !isAnalyzing && (
                  <span className="text-[11px] font-bold text-mintGreen">
                    {triageResult.confidence}% confidence
                  </span>
                )}
              </div>

              {/* State A: Before Upload */}
              {!photoUrl && !isAnalyzing && (
                <div className="border border-dashed border-white/15 rounded-xl p-4 text-center space-y-1 bg-white/[0.01]">
                  <UploadCloud className="w-5 h-5 text-paleBlueGrey/40 mx-auto" />
                  <p className="text-xs text-paleBlueGrey font-medium">
                    Upload a photo to see AI triage
                  </p>
                  <p className="text-[11px] text-paleBlueGrey/50">
                    Automatically tags category, department & severity
                  </p>
                </div>
              )}

              {/* State B: During Analysis */}
              {isAnalyzing && (
                <div className="p-3.5 rounded-xl bg-skyBlue/10 border border-skyBlue/30 text-skyBlue text-xs space-y-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-skyBlue shrink-0" />
                    <span className="font-semibold">Analyzing image context & landmarks...</span>
                  </div>
                  <div className="w-full bg-skyBlue/20 h-1 rounded-full overflow-hidden">
                    <div className="bg-skyBlue h-full w-2/3 animate-pulse" />
                  </div>
                </div>
              )}

              {/* State C: After Analysis */}
              {triageResult && !isAnalyzing && (
                <div className="space-y-3 fade-in">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-deepNavy/80 border border-white/5">
                      <span className="text-[10px] text-paleBlueGrey/70 block uppercase font-medium">Category</span>
                      <strong className="text-softWhite text-[11px] block truncate">{triageResult.category}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-deepNavy/80 border border-white/5">
                      <span className="text-[10px] text-paleBlueGrey/70 block uppercase font-medium">Department</span>
                      <strong className="text-softWhite text-[11px] block truncate">{triageResult.department}</strong>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-paleBlueGrey">
                      <span>Visual authenticity</span>
                      <span className="text-mintGreen font-semibold">{triageResult.confidence}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-skyBlue to-mintGreen h-full rounded-full transition-all duration-500" 
                        style={{ width: `${triageResult.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Apply to Ticket Button */}
                  <button
                    type="button"
                    onClick={handleApplyTriage}
                    disabled={isApplied}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isApplied
                        ? 'bg-mintGreen/15 text-mintGreen border border-mintGreen/40 cursor-default'
                        : 'bg-white/10 hover:bg-white/15 text-softWhite border border-white/20 active:scale-95'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Applied to ticket fields</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-skyBlue" />
                        <span>Apply AI suggestions to ticket</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Hero Impact Score & Completeness Meter */}
            <div className="p-4 rounded-2xl bg-darkBlue/70 border border-white/10 space-y-3 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-semibold text-paleBlueGrey block">
                    Predicted impact score
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-extrabold text-softWhite tabular-nums tracking-tight">
                      {estimatedImpact}
                    </span>
                    <span className="text-sm font-semibold text-paleBlueGrey/60">
                      /10
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-paleBlueGrey/70 block uppercase font-medium">Escalation goal</span>
                  <span className="text-xs font-bold text-softWhite">100 Votes</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-skyBlue via-amber-400 to-mintGreen h-full rounded-full transition-all duration-300"
                  style={{ width: `${impactPercentage}%` }}
                />
              </div>

              {/* 4 Completeness Factors */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className={`flex items-center gap-1.5 ${factors.title ? 'text-mintGreen' : 'text-paleBlueGrey/50'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                    factors.title ? 'border-mintGreen bg-mintGreen/20' : 'border-white/20'
                  }`}>
                    {factors.title ? '✓' : ''}
                  </span>
                  <span>Title clarity</span>
                </div>

                <div className={`flex items-center gap-1.5 ${factors.location ? 'text-mintGreen' : 'text-paleBlueGrey/50'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                    factors.location ? 'border-mintGreen bg-mintGreen/20' : 'border-white/20'
                  }`}>
                    {factors.location ? '✓' : ''}
                  </span>
                  <span>Location detail</span>
                </div>

                <div className={`flex items-center gap-1.5 ${factors.photo ? 'text-mintGreen' : 'text-paleBlueGrey/50'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                    factors.photo ? 'border-mintGreen bg-mintGreen/20' : 'border-white/20'
                  }`}>
                    {factors.photo ? '✓' : ''}
                  </span>
                  <span>Photo proof</span>
                </div>

                <div className={`flex items-center gap-1.5 ${factors.details ? 'text-mintGreen' : 'text-paleBlueGrey/50'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                    factors.details ? 'border-mintGreen bg-mintGreen/20' : 'border-white/20'
                  }`}>
                    {factors.details ? '✓' : ''}
                  </span>
                  <span>Context notes</span>
                </div>
              </div>

              <p className="text-[12px] text-paleBlueGrey leading-relaxed pt-1 border-t border-white/10">
                Hitting 100 votes automatically notifies the Estate Office head with mandatory 24h reminders.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer (One Baseline) */}
        <div className="px-6 py-4 sm:px-8 border-t border-white/10 bg-[#0B1530]/95 backdrop-blur-md flex items-center justify-between relative z-20">
          <div className="flex items-center gap-1.5 text-xs text-paleBlueGrey/70">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-softWhite font-mono text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-softWhite font-mono text-[10px]">Enter</kbd>
            <span>to submit</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-paleBlueGrey hover:text-softWhite hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {/* Publish Button (Pops with High Contrast when Valid) */}
            <button
              type="submit"
              form="new-post-form"
              disabled={!isFormValid}
              title={!isFormValid ? 'Enter a ticket title and campus location to publish' : 'Publish ticket to feed (+10 XP)'}
              className={`h-11 px-6 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 active:scale-95 ${
                isFormValid
                  ? 'btn-fresh-green text-deepNavy shadow-[0_0_24px_rgba(56,201,130,0.45)] hover:scale-[1.02]'
                  : 'bg-slate-700/40 text-slate-400 border border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
              <span>Publish ticket (+10 XP)</span>
            </button>
          </div>
        </div>

        {/* Post-Submit Toast Notification */}
        {showToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-mintGreen text-deepNavy px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-2xl flex items-center gap-2 fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>+10 XP Citizen Reward! Ticket published.</span>
          </div>
        )}
      </div>
    </div>
  );
}
