'use client';

import React, { useState, useEffect } from 'react';
import { useUpCampus } from '@/lib/store';
import { MOCK_LOCATIONS } from '@/lib/data/mockData';
import { Post, PostKind } from '@/lib/types';
import { 
  X, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const { addPost, searchSimilar, upvotePost } = useUpCampus();

  const [kind, setKind] = useState<PostKind>('grievance');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrical');
  const [severity, setSeverity] = useState<1 | 2 | 3>(2);
  const [safetyRisk, setSafetyRisk] = useState(false);
  const [department, setDepartment] = useState('Electrical Maintenance');
  const [locationId, setLocationId] = useState<number>(1);
  const [anonymous, setAnonymous] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [similarPosts, setSimilarPosts] = useState<Post[]>([]);
  const [ignoredDuplicate, setIgnoredDuplicate] = useState(false);

  // Debounced duplicate detection
  useEffect(() => {
    if (ignoredDuplicate || title.trim().length < 4) {
      setSimilarPosts([]);
      return;
    }

    const timer = setTimeout(() => {
      const results = searchSimilar(title, locationId);
      setSimilarPosts(results);
    }, 280);

    return () => clearTimeout(timer);
  }, [title, locationId, ignoredDuplicate, searchSimilar]);

  if (!isOpen) return null;

  // Simulate AI photo triage
  const handlePhotoSelect = (sampleUrl: string) => {
    setPhotoUrl(sampleUrl);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAiSuggested(true);

      // Intelligent prefill based on sample photo context
      if (sampleUrl.includes('street') || sampleUrl.includes('dark')) {
        setTitle('Broken streetlight and unlit bend near hostel path');
        setDescription('Corridor has zero illumination after sunset. Students walking from library face dark hazard.');
        setCategory('Electrical');
        setSeverity(3);
        setSafetyRisk(true);
        setDepartment('Electrical Maintenance');
        setLocationId(1);
      } else if (sampleUrl.includes('water') || sampleUrl.includes('sink') || sampleUrl.includes('tap')) {
        setTitle('Major water tap leak causing flooding on floor');
        setDescription('Pressure valve burst causing continuous stream of water along hallway.');
        setCategory('Plumbing');
        setSeverity(2);
        setSafetyRisk(false);
        setDepartment('Sanitation & Water Works');
        setLocationId(4);
      } else {
        setTitle('Damaged furniture and power strip sockets in study room');
        setCategory('Infrastructure');
        setSeverity(1);
        setDepartment('Estate & Infrastructure');
        setLocationId(3);
      }
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const loc = MOCK_LOCATIONS.find((l) => l.id === locationId);

    addPost({
      author_id: 'student-1',
      kind,
      title: title.trim(),
      description: description.trim() || null,
      category,
      severity,
      safety_risk: safetyRisk,
      department,
      location_id: locationId,
      location: loc,
      photos: photoUrl ? [photoUrl] : [],
      anonymous,
      status: 'pending',
      author_name: anonymous ? 'Anonymous Student' : 'Aarav Sharma (CS-25)',
      ai_meta: aiSuggested
        ? { confidence: 0.92, detected_tags: ['photo_triaged', category.toLowerCase()] }
        : null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-campus-bg/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl bg-campus-surface border border-campus-border rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-campus-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-campus-teal/20 border border-campus-teal/40 flex items-center justify-center text-campus-teal shadow-glow">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">
                Snap & Report Campus Issue
              </h2>
              <p className="text-xs text-slate-400">
                AI will inspect your photo and prefill department and urgency.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Post Kind Selector */}
          <div className="grid grid-cols-2 gap-2 bg-campus-bg/80 p-1 rounded-xl border border-campus-border">
            <button
              type="button"
              onClick={() => setKind('grievance')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                kind === 'grievance'
                  ? 'bg-campus-pink text-campus-bg shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fix a Broken Thing (Grievance)
            </button>
            <button
              type="button"
              onClick={() => setKind('suggestion')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                kind === 'suggestion'
                  ? 'bg-campus-amber text-campus-bg shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Build What is Missing (Suggestion)
            </button>
          </div>

          {/* Photo Triage Demo Selectors */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Step 1: Snap or Upload Evidence</span>
              {aiSuggested && (
                <span className="text-[11px] font-semibold text-campus-teal flex items-center gap-1 normal-case">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Triage Completed
                </span>
              )}
            </label>

            {/* Quick demo photos picker */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  label: 'Dark Streetlight',
                  url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
                },
                {
                  label: 'Plumbing Leak',
                  url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
                },
                {
                  label: 'Lab Workstation',
                  url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
                },
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePhotoSelect(sample.url)}
                  className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                    photoUrl === sample.url
                      ? 'border-campus-teal bg-campus-teal/15 shadow-glow'
                      : 'border-campus-border bg-campus-bg/60 hover:border-slate-500'
                  }`}
                >
                  <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-900">
                    <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300">{sample.label}</span>
                </button>
              ))}
            </div>

            {isAnalyzing && (
              <div className="p-3 bg-campus-teal/10 border border-campus-teal/30 rounded-xl flex items-center gap-2.5 text-campus-teal text-xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini Vision inspecting photo pixels: analyzing safety hazards & department...</span>
              </div>
            )}
          </div>

          {/* Title with Duplicate Detector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Title of Issue
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIgnoredDuplicate(false);
              }}
              placeholder="e.g. Streetlight not working near Hostel 7 road bend"
              className="w-full bg-campus-bg border border-campus-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-campus-teal transition-all"
            />
          </div>

          {/* Duplicate Alert Card if hits exist */}
          {similarPosts.length > 0 && !ignoredDuplicate && (
            <div className="p-3.5 bg-campus-amber/10 border border-campus-amber/40 rounded-xl space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-campus-amber font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Live Duplicate Interceptor: Similar open issues found on campus!</span>
              </div>
              <p className="text-xs text-slate-300">
                To maximize campus attention, upvoting an existing ticket has more weight than creating a duplicate:
              </p>
              <div className="space-y-1.5">
                {similarPosts.map((dupe) => (
                  <div
                    key={dupe.id}
                    className="p-2.5 rounded-lg bg-campus-bg/80 border border-campus-border flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-slate-200 line-clamp-1">{dupe.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        upvotePost(dupe.id);
                        onClose();
                      }}
                      className="px-3 py-1 bg-campus-teal text-campus-bg font-bold rounded-lg shadow-sm hover:scale-105 transition-transform flex-shrink-0"
                    >
                      Upvote This Instead (+{dupe.agree_count})
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIgnoredDuplicate(true)}
                className="text-[11px] text-slate-400 hover:text-white underline pt-1 block"
              >
                No, my issue is physically different. Continue creating.
              </button>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Description & Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact room/spot details, timing of breakdown, or safety implications..."
              className="w-full bg-campus-bg border border-campus-border rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-campus-teal transition-all"
            />
          </div>

          {/* Category, Location & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-campus-bg border border-campus-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-campus-teal"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Sanitation">Sanitation</option>
                <option value="IT / Wi-Fi">IT / Wi-Fi</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Safety">Safety & Security</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Campus Location</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                className="w-full bg-campus-bg border border-campus-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-campus-teal"
              >
                {MOCK_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Severity</label>
              <select
                value={severity}
                onChange={(e) => {
                  const val = Number(e.target.value) as 1 | 2 | 3;
                  setSeverity(val);
                  if (val === 3) setSafetyRisk(true);
                }}
                className="w-full bg-campus-bg border border-campus-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-campus-teal"
              >
                <option value={1}>Level 1: Minor</option>
                <option value={2}>Level 2: Disruptive</option>
                <option value={3}>Level 3: Safety Risk</option>
              </select>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-3 bg-campus-bg/60 border border-campus-border rounded-xl">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anon"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded border-campus-border text-campus-teal focus:ring-campus-teal w-4 h-4 bg-campus-bg"
              />
              <label htmlFor="anon" className="text-xs text-slate-200 cursor-pointer">
                Post anonymously to peers
              </label>
            </div>
            <span className="text-[10px] text-slate-400">
              (Admins & Supervisors can verify student email against spam)
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-campus-teal hover:bg-teal-300 text-campus-bg font-bold text-xs rounded-xl shadow-glow transition-all"
            >
              Submit for Supervisor Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
