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
  AlertTriangle, 
  Flame, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Building2, 
  Zap, 
  Check 
} from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'complaint' | 'suggestion';
}

interface TriageResult {
  category: string;
  department: string;
  urgency: 'low' | 'medium' | 'urgent';
  safetyRisk: boolean;
  confidence: number;
}

export default function NewPostModal({ isOpen, onClose, defaultType = 'suggestion' }: NewPostModalProps) {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync defaultType when reopened
  useEffect(() => {
    if (isOpen) {
      setKind(defaultType === 'complaint' ? 'grievance' : 'suggestion');
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

  // Keyboard shortcuts: Escape to close, Ctrl/Cmd + Enter to submit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (title.trim()) {
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

    setTimeout(() => {
      setIsAnalyzing(false);
      if (url.includes('street') || url.includes('dark')) {
        setTitle('Street lights fused on Girls Hostel pathway');
        setLocation('Hostel Block 3 Road, North Campus');
        setDescription('Total darkness after 7:30 PM creates safety hazards for students walking back from evening computer labs.');
        setKind('grievance');
        setUrgency('urgent');
        setTriageResult({
          category: 'Electrical & Lighting',
          department: 'Maintenance Office',
          urgency: 'urgent',
          safetyRisk: true,
          confidence: 96,
        });
      } else if (url.includes('water') || url.includes('sink')) {
        setTitle('Severe washroom tap leak flooding corridor');
        setLocation('3rd Floor Science Block Washrooms');
        setDescription('Continuous high pressure water leakage leading to flooded corridor and slippery floor hazards.');
        setKind('grievance');
        setUrgency('medium');
        setTriageResult({
          category: 'Sanitation & Plumbing',
          department: 'Water Works',
          urgency: 'medium',
          safetyRisk: false,
          confidence: 92,
        });
      } else {
        setTitle('Need an automated Snack Vending Machine');
        setLocation('Central Library Ground Floor Lobby');
        setDescription('A 24/7 smart vending machine would serve students studying late during midterms and exam weeks.');
        setKind('suggestion');
        setUrgency('low');
        setTriageResult({
          category: 'Student Amenities',
          department: 'Campus Welfare',
          urgency: 'low',
          safetyRisk: false,
          confidence: 89,
        });
      }
    }, 850);
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

  const executeSubmit = () => {
    if (!title.trim()) return;

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

    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubmit();
  };

  const isComplaint = kind === 'grievance';
  const isFormValid = title.trim().length >= 3;

  // Real-time estimated Impact Score
  const estimatedImpact = (
    1 * 1.5 + 
    (isComplaint ? 4.5 : 2.0) + 
    (urgency === 'urgent' ? 6.0 : urgency === 'medium' ? 3.0 : 1.0)
  ).toFixed(1);

  return (
    <div className="fixed inset-0 bg-[#0B1530]/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto fade-in">
      <div className="relative my-4 sm:my-6 w-full max-w-5xl rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#142747]/95 via-[#0e1f3b]/95 to-[#0B1530]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden modal-enter transition-all duration-300">
        {/* Dynamic Top Ambient Corner Sheen */}
        <div 
          className={`absolute -top-28 -left-28 w-80 h-80 rounded-full pointer-events-none filter blur-3xl opacity-20 transition-all duration-700 ${
            isComplaint ? 'bg-amber-500' : 'bg-mintGreen'
          }`}
        />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-skyBlue/40 to-transparent pointer-events-none" />

        {/* Modal Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
          {/* LEFT COLUMN: Interactive Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Header Bar */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-softWhite tracking-tight">
                      Submit Campus Ticket
                    </h3>
                    <span className="badge-mint text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-mintGreen" />
                      +10 XP Reward
                    </span>
                  </div>
                  <p className="text-xs text-paleBlueGrey leading-relaxed">
                    Voice real campus problems. Votes trigger automated escalation to estate leadership.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-paleBlueGrey hover:text-softWhite transition-all active:scale-95 shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="new-post-form" onSubmit={handleFormSubmit} className="space-y-5">
                {/* 1. Category Selector (No Native Radios) */}
                <div>
                  <label className="block text-xs font-semibold text-paleBlueGrey mb-2.5">
                    Select Ticket Type
                  </label>
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Complaint Card */}
                    <div
                      onClick={() => setKind('grievance')}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all relative ${
                        isComplaint
                          ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                          : 'bg-white/5 border-white/5 hover:border-white/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isComplaint ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-paleBlueGrey'
                        }`}>
                          <Wrench className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        {isComplaint && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-deepNavy flex items-center justify-center text-[10px] font-bold shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-softWhite mb-0.5">
                        Broken (Fix It)
                      </h4>
                      <p className="text-[11px] text-paleBlueGrey leading-tight">
                        Damaged fixtures, water leaks, dark pathways.
                      </p>
                    </div>

                    {/* Suggestion Card */}
                    <div
                      onClick={() => setKind('suggestion')}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all relative ${
                        !isComplaint
                          ? 'bg-mintGreen/15 border-mintGreen/50 shadow-[0_0_20px_rgba(167,232,195,0.2)]'
                          : 'bg-white/5 border-white/5 hover:border-white/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          !isComplaint ? 'bg-mintGreen/20 text-mintGreen' : 'bg-white/5 text-paleBlueGrey'
                        }`}>
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </div>
                        {!isComplaint && (
                          <span className="w-5 h-5 rounded-full bg-mintGreen text-deepNavy flex items-center justify-center text-[10px] font-bold shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-softWhite mb-0.5">
                        Needs (Add It)
                      </h4>
                      <p className="text-[11px] text-paleBlueGrey leading-tight">
                        New amenities, study pods, vending machines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Photo Evidence & AI Triage Dropzone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-paleBlueGrey">Photo Evidence & AI Auto-Triage</span>
                    {triageResult && (
                      <span className="text-mintGreen text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-mintGreen" />
                        AI Verified ({triageResult.confidence}%)
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Dashed Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-3.5 ${
                      isDragging
                        ? 'border-skyBlue bg-skyBlue/10'
                        : photoUrl
                        ? 'border-mintGreen/40 bg-mintGreen/5 hover:border-mintGreen/60'
                        : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-skyBlue shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-softWhite">
                        {photoUrl ? 'Photo uploaded & attached' : 'Click to upload or drag photo evidence'}
                      </p>
                      <p className="text-[11px] text-paleBlueGrey">
                        AI scans context, predicts severity & auto-fills ticket details.
                      </p>
                    </div>
                  </div>

                  {/* Quick Try Sample Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-semibold text-paleBlueGrey/70">Or test AI vision sample:</span>
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
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                          photoUrl === sample.url
                            ? 'bg-skyBlue/20 text-skyBlue border-skyBlue/40 font-bold'
                            : 'bg-white/5 text-paleBlueGrey border-white/10 hover:text-softWhite hover:bg-white/10'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* AI Shimmer Analysis State */}
                  {isAnalyzing && (
                    <div className="p-3 rounded-xl bg-skyBlue/10 border border-skyBlue/30 text-skyBlue text-xs flex items-center gap-2.5 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-skyBlue shrink-0" />
                      <span>AI inspecting visual landmarks, safety hazards & facility department...</span>
                    </div>
                  )}

                  {/* AI Triage Ribbon */}
                  {triageResult && !isAnalyzing && (
                    <div className="p-3 rounded-xl bg-darkBlue/80 border border-mintGreen/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="badge-mint px-2 py-0.5 rounded text-[10px] font-bold">
                          {triageResult.category}
                        </span>
                        <span className="text-paleBlueGrey text-[11px]">
                          Dept: <strong className="text-softWhite">{triageResult.department}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-mintGreen font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Details auto-filled
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Title & Location in 8pt Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-paleBlueGrey mb-1.5">
                      Ticket Title
                    </label>
                    <div className="relative">
                      <PenTool className="w-4 h-4 text-paleBlueGrey/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Broken water filter tap..."
                        className="w-full h-11 text-xs sm:text-sm bg-[#0B1530]/80 border border-white/10 text-softWhite placeholder-paleBlueGrey/40 rounded-xl pl-10 pr-3 focus:outline-none focus:border-skyBlue focus:ring-2 focus:ring-skyBlue/30 transition-all font-medium shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-paleBlueGrey mb-1.5">
                      Campus Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-paleBlueGrey/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Ground Floor, Block 3"
                        className="w-full h-11 text-xs sm:text-sm bg-[#0B1530]/80 border border-white/10 text-softWhite placeholder-paleBlueGrey/40 rounded-xl pl-10 pr-3 focus:outline-none focus:border-skyBlue focus:ring-2 focus:ring-skyBlue/30 transition-all font-medium shadow-inner"
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
                        <p className="text-[11px] text-paleBlueGrey mb-2 leading-relaxed truncate">
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

                {/* 4. Details Context with Character Counter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-paleBlueGrey">
                      Detailed Context
                    </label>
                    <span className="text-[11px] text-paleBlueGrey/60 tabular-nums">
                      {description.length}/300
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific notes so technicians or administrators can address it immediately..."
                    className="w-full text-xs sm:text-sm bg-[#0B1530]/80 border border-white/10 text-softWhite placeholder-paleBlueGrey/40 rounded-xl p-3 focus:outline-none focus:border-skyBlue focus:ring-2 focus:ring-skyBlue/30 transition-all font-medium resize-none shadow-inner"
                  />
                </div>

                {/* 5. Gamification, Urgency & Anonymity Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Urgency Pills */}
                  <div>
                    <label className="block text-xs font-semibold text-paleBlueGrey mb-1.5">
                      Urgency Level
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'low', label: 'Low', color: 'text-paleBlueGrey' },
                        { id: 'medium', label: 'Medium', color: 'text-skyBlue' },
                        { id: 'urgent', label: 'Urgent', color: 'text-red-400' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setUrgency(item.id as 'low' | 'medium' | 'urgent')}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                            urgency === item.id
                              ? 'bg-white/15 border-white/30 text-softWhite shadow-sm'
                              : 'bg-white/5 border-transparent text-paleBlueGrey/70 hover:text-softWhite'
                          }`}
                        >
                          <span className={item.color}>•</span> {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Anonymity Switch */}
                  <div>
                    <label className="block text-xs font-semibold text-paleBlueGrey mb-1.5">
                      Privacy Setting
                    </label>
                    <button
                      type="button"
                      onClick={() => setAnonymous(!anonymous)}
                      className={`w-full h-9 rounded-xl border px-3 flex items-center justify-between text-xs transition-all ${
                        anonymous
                          ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                          : 'bg-white/5 border-white/10 text-paleBlueGrey hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        <span>Post Anonymously</span>
                      </div>
                      <span className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                        anonymous ? 'bg-purple-500' : 'bg-white/10'
                      }`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          anonymous ? 'translate-x-3' : 'translate-x-0'
                        }`} />
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[11px] text-paleBlueGrey/60 hidden sm:inline-flex items-center gap-1">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-softWhite font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-softWhite font-mono text-[10px]">Enter</kbd> to submit
              </span>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-paleBlueGrey hover:text-softWhite hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="new-post-form"
                  disabled={!isFormValid}
                  className={`btn-fresh-green text-deepNavy px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                    !isFormValid ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-deepNavy stroke-[2.5]" />
                  <span>Publish Ticket (+10 XP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Feed Preview & AI Forecast (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0B1530]/70 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between space-y-6">
            <div>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-softWhite uppercase tracking-wider">
                    Live Feed Preview
                  </h4>
                  <p className="text-[11px] text-paleBlueGrey">
                    Exact representation of your post in the public stream
                  </p>
                </div>
                <span className="badge-sky text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                  Realtime
                </span>
              </div>

              {/* Mockup Post Card */}
              <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 shadow-glass space-y-3.5">
                {/* Voting & Header Row */}
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

                      <span className="text-[10px] font-semibold text-paleBlueGrey bg-white/5 border border-white/10 px-2 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-[130px]">
                        <MapPin className="w-2.5 h-2.5 text-skyBlue" />
                        <span>{location.trim() || 'Campus Location'}</span>
                      </span>

                      {urgency === 'urgent' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-1.5 py-0.5 rounded-md">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Preview Title */}
                    <h4 className="text-sm font-bold text-softWhite line-clamp-2 leading-snug">
                      {title.trim() || 'Your ticket title will appear here...'}
                    </h4>
                  </div>
                </div>

                {/* Preview Description */}
                <p className="text-xs text-paleBlueGrey leading-relaxed line-clamp-2">
                  {description.trim() || 'Your detailed context and remarks will be visible to student voters and campus administrators.'}
                </p>

                {/* Preview Photo */}
                {photoUrl && (
                  <div className="h-28 rounded-xl overflow-hidden border border-white/10 bg-deepNavy">
                    <img src={photoUrl} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Preview Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-paleBlueGrey">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-skyBlue" />
                    <span>Just now</span>
                  </span>
                  <span>
                    By: <strong className="text-softWhite">{anonymous ? 'Anonymous Student' : currentUser?.display_name || 'Aarav Sharma (CS-25)'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* AI Impact Forecast & Escalation Protocol Box */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-darkBlue/70 border border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-softWhite flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    <span>Predicted Impact Score</span>
                  </span>
                  <span className="font-mono text-sm font-extrabold text-amber-400">
                    {estimatedImpact}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-paleBlueGrey pt-1 border-t border-white/10">
                  <div className="p-2 rounded-xl bg-deepNavy/80 border border-white/5">
                    <span className="text-[10px] text-paleBlueGrey/60 block">Target Threshold</span>
                    <strong className="text-softWhite font-bold">100 Votes</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-deepNavy/80 border border-white/5">
                    <span className="text-[10px] text-paleBlueGrey/60 block">Expected SLA</span>
                    <strong className="text-mintGreen font-bold">~1.4 Days</strong>
                  </div>
                </div>

                <p className="text-[10px] text-paleBlueGrey/70 leading-normal">
                  Hitting 100 votes triggers an automated push notification to the Estate Office head with mandatory 24h reminders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
