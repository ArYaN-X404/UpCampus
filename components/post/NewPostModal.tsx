'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUpCampus } from '@/lib/store';
import { PostKind } from '@/lib/types';
import { 
  X, 
  PenTool, 
  Wrench, 
  Lightbulb, 
  Bot, 
  ArrowUp, 
  Sparkles, 
  Loader2, 
  UploadCloud, 
  MapPin, 
  Shield, 
  Flame, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Check, 
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'complaint' | 'suggestion';
  onSuccessToast?: (msg: string) => void;
}

interface TriageData {
  category: string;
  department: string;
  urgency: 'low' | 'medium' | 'urgent';
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
  const [triageData, setTriageData] = useState<TriageData | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setKind(defaultType === 'complaint' ? 'grievance' : 'suggestion');
      setIsApplied(false);
    }
  }, [isOpen, defaultType]);

  // Duplicate checker
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

  const processImageTriage = (url: string) => {
    setPhotoUrl(url);
    setIsAnalyzing(true);
    setTriageData(null);
    setIsApplied(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (url.includes('street') || url.includes('dark')) {
        setTriageData({
          category: 'Electrical & Lighting',
          department: 'Maintenance Office',
          urgency: 'urgent',
          confidence: 96,
          suggestedTitle: 'Street lights fused on Girls Hostel pathway',
          suggestedLocation: 'Hostel Block 3 Road, North Campus',
          suggestedDescription: 'Total darkness after 7:30 PM creates safety hazards for students walking back from evening computer labs.',
        });
      } else if (url.includes('water') || url.includes('sink')) {
        setTriageData({
          category: 'Sanitation & Plumbing',
          department: 'Water Works',
          urgency: 'medium',
          confidence: 92,
          suggestedTitle: 'Severe washroom tap leak flooding corridor',
          suggestedLocation: '3rd Floor Science Block Washrooms',
          suggestedDescription: 'Continuous high pressure water leakage leading to flooded corridor and slippery floor hazards.',
        });
      } else {
        setTriageData({
          category: 'Student Amenities',
          department: 'Campus Welfare',
          urgency: 'low',
          confidence: 89,
          suggestedTitle: 'Need an automated Snack Vending Machine',
          suggestedLocation: 'Central Library Ground Floor Lobby',
          suggestedDescription: 'A 24/7 smart vending machine would serve students studying late during midterms and exam weeks.',
        });
      }
    }, 850);
  };

  const handleApplyTriage = () => {
    if (!triageData) return;
    setTitle(triageData.suggestedTitle);
    setLocation(triageData.suggestedLocation);
    setDescription(triageData.suggestedDescription);
    setUrgency(triageData.urgency);
    setKind(triageData.urgency === 'urgent' ? 'grievance' : 'suggestion');
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

  // Completeness score
  const hasTitle = title.trim().length >= 5;
  const hasLocation = location.trim().length >= 3;
  const hasPhoto = !!photoUrl;
  const hasDetails = description.trim().length >= 10;
  const factorCount = (hasTitle ? 1 : 0) + (hasLocation ? 1 : 0) + (hasPhoto ? 1 : 0) + (hasDetails ? 1 : 0);

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
      department: triageData?.department || (kind === 'grievance' ? 'Maintenance' : 'Student Amenities'),
      location_name: location.trim() || 'Campus Grounds',
      photos: photoUrl ? [photoUrl] : [],
      anonymous,
      status: 'approved',
      author_name: anonymous ? 'Anonymous Student' : currentUser?.display_name || 'Aarav Sharma (CS-25)',
    });

    onSuccessToast?.('🎉 +10 XP Citizen Reward! Your ticket was posted to the campus feed.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#070D1E]/90 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* High-Contrast Unified Surface Card */}
      <div className="relative my-auto w-full max-w-5xl max-h-[calc(100dvh-40px)] flex flex-col rounded-2xl bg-[#0D1527] border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#101A30] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Create Campus Ticket
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit an issue or amenity proposal for verified student voting and administration action.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unified 2-Column Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* LEFT COLUMN: Clean Form Stream (7 Cols) */}
          <div className="lg:col-span-7 p-6 space-y-6">
            <form id="unified-post-form" onSubmit={(e) => { e.preventDefault(); executeSubmit(); }} className="space-y-5">
              
              {/* 1. Unified Segmented Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 p-1 bg-[#142038] border border-slate-700/80 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setKind('grievance')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isComplaint
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Broken (Fix It)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKind('suggestion')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      !isComplaint
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Needs (Add It)</span>
                  </button>
                </div>
              </div>

              {/* 2. Core Inputs (Title & Location) */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Title <span className="text-amber-400">*</span>
                    </label>
                    {hasTitle && (
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <PenTool className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Street lights fused on Girls Hostel pathway"
                      className="w-full h-11 text-sm bg-[#121B30] border border-slate-700 rounded-xl pl-10 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Campus Location <span className="text-amber-400">*</span>
                    </label>
                    {hasLocation && (
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., North Campus Pathway near Block 3"
                      className="w-full h-11 text-sm bg-[#121B30] border border-slate-700 rounded-xl pl-10 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Duplicate Alert if detected */}
              {matchedPost && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                  <Bot className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-300 mb-0.5">
                      Similar issue already reported
                    </p>
                    <p className="text-xs text-slate-300 truncate mb-2">
                      &quot;{matchedPost.title}&quot; ({matchedPost.count} votes)
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        upvotePost(matchedPost.id);
                        onClose();
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowUp className="w-3 h-3 stroke-[3]" />
                      <span>Upvote Existing (+{matchedPost.count})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Detailed Context */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Description & Context <span className="text-slate-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {description.length}/300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this needs to be fixed or how it benefits students..."
                  className="w-full text-sm bg-[#121B30] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 font-medium resize-none"
                />
              </div>

              {/* 4. Unified Settings & Evidence Container */}
              <div className="bg-[#101A30] border border-slate-800 rounded-xl p-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Settings & Verification Evidence
                </span>

                {/* Photo Dropzone + Quick Test Samples */}
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-xl border border-dashed p-3 text-center transition-all flex items-center justify-center gap-3 ${
                      isDragging
                        ? 'border-sky-400 bg-sky-500/10'
                        : photoUrl
                        ? 'border-emerald-500/60 bg-emerald-500/5'
                        : 'border-slate-700 hover:border-slate-500 bg-[#142038]'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-sky-400 shrink-0" />
                    <div className="text-left text-xs">
                      <span className="font-semibold text-white">
                        {photoUrl ? 'Photo attached (click to change)' : 'Upload photo evidence'}
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        AI automatically scans visual landmarks & tags department
                      </span>
                    </div>
                  </div>

                  {/* Sample Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Test sample:</span>
                    {[
                      { label: 'Library Vending', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
                      { label: 'Hostel Pathway', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80' },
                      { label: 'Washroom Tap', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => processImageTriage(s.url)}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                          photoUrl === s.url
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency & Privacy Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  {/* Urgency Level */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-[#142038] border border-slate-700 p-1 rounded-lg">
                      {[
                        { id: 'low', label: 'Low', activeClass: 'bg-slate-700 text-white' },
                        { id: 'medium', label: 'Medium', activeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
                        { id: 'urgent', label: 'Urgent', activeClass: 'bg-red-500/20 text-red-300 border border-red-500/40' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setUrgency(item.id as 'low' | 'medium' | 'urgent')}
                          className={`py-1 rounded text-xs font-bold text-center transition-all ${
                            urgency === item.id
                              ? item.activeClass
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Setting */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Privacy
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={anonymous}
                      onClick={() => setAnonymous(!anonymous)}
                      className={`w-full py-1.5 px-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                        anonymous
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'bg-[#142038] border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Post Anonymously</span>
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full ${anonymous ? 'bg-sky-400' : 'bg-slate-600'}`} />
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Real-Time Preview & AI Intelligence (5 Cols) */}
          <div className="lg:col-span-5 p-6 bg-[#0B1222] space-y-5 flex flex-col justify-start">
            
            {/* Live Feed Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Preview
                </span>
                <span className="text-[11px] text-slate-500">Feed Card Output</span>
              </div>

              {/* Realistic Feed Card Representation */}
              <div className="bg-[#121B30] border border-slate-700/80 rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex items-start gap-3">
                  {/* Simulated Vote Column */}
                  <div className="w-9 bg-[#0B1222] border border-slate-700 rounded-lg p-1 flex flex-col items-center justify-center shrink-0 text-slate-400">
                    <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold text-white py-0.5">1</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isComplaint ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {isComplaint ? 'Fix It' : 'Add It'}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded truncate max-w-[140px]">
                        {location.trim() || 'Campus Grounds'}
                      </span>
                      {urgency === 'urgent' && (
                        <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm leading-snug line-clamp-2 ${
                      title.trim() ? 'font-bold text-white' : 'text-slate-500 italic'
                    }`}>
                      {title.trim() || 'Your ticket title will appear here...'}
                    </h4>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed line-clamp-2 ${
                  description.trim() ? 'text-slate-300' : 'text-slate-500 italic'
                }`}>
                  {description.trim() || 'Description preview will be visible to students and administration.'}
                </p>

                {photoUrl && (
                  <div className="h-28 rounded-lg overflow-hidden border border-slate-700 bg-black">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Just now</span>
                  </span>
                  <span>
                    By: <strong className="text-slate-200">{anonymous ? 'Anonymous Student' : currentUser?.display_name || 'Aarav Sharma (CS-25)'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* AI Intelligence & Impact Panel (Unified Single Container) */}
            <div className="bg-[#121B30] border border-slate-700/80 rounded-xl p-4 space-y-4">
              
              {/* Impact Score Hero */}
              <div className="flex items-end justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Impact Completeness
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white tabular-nums">
                      {estimatedImpact}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 10</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Threshold</span>
                  <span className="text-xs font-bold text-emerald-400">100 Votes (Escalation)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${impactPercentage}%` }}
                />
              </div>

              {/* AI Triage Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    AI Triage
                  </span>
                  {triageData && !isAnalyzing && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      {triageData.confidence}% Confidence
                    </span>
                  )}
                </div>

                {isAnalyzing ? (
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                    <span>Scanning landmarks & extracting context...</span>
                  </div>
                ) : triageData ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-[#142038] border border-slate-700/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Category</span>
                        <strong className="text-white text-xs truncate block">{triageData.category}</strong>
                      </div>
                      <div className="p-2 bg-[#142038] border border-slate-700/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Dept</span>
                        <strong className="text-white text-xs truncate block">{triageData.department}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyTriage}
                      disabled={isApplied}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isApplied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Applied to ticket fields</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply suggestions to ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-[#142038] p-2.5 rounded-lg border border-slate-800 text-center">
                    Upload or select a photo sample to activate automatic AI diagnosis.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Unified Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#101A30] flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">Enter</kbd>
            <span>to publish</span>
          </span>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="unified-post-form"
              disabled={!isFormValid}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                isFormValid
                  ? 'bg-[#38C982] hover:bg-[#2EB874] text-[#0B1530] shadow-[0_0_20px_rgba(56,201,130,0.4)] active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Publish Ticket (+10 XP)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
