'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2 
} from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'complaint' | 'suggestion';
}

export default function NewPostModal({ isOpen, onClose, defaultType = 'suggestion' }: NewPostModalProps) {
  const { addPost, searchSimilar, upvotePost } = useUpCampus();

  const [kind, setKind] = useState<PostKind>(defaultType === 'complaint' ? 'grievance' : 'suggestion');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [matchedPost, setMatchedPost] = useState<{ id: string; title: string; count: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Debounced duplicate checker matching up_campus_code.html
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
    }, 250);

    return () => clearTimeout(timer);
  }, [title, searchSimilar]);

  if (!isOpen) return null;

  const handlePhotoSelect = (sampleUrl: string) => {
    setPhotoUrl(sampleUrl);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (sampleUrl.includes('street') || sampleUrl.includes('dark')) {
        setTitle('Street lights fused on Girls Hostel pathway');
        setLocation('Hostel Block 3 Road');
        setDescription('Total darkness after 7 PM creates safety hazards for students walking back from evening labs.');
        setKind('grievance');
      } else if (sampleUrl.includes('water') || sampleUrl.includes('sink')) {
        setTitle('Severe water leakage in washroom');
        setLocation('3rd Floor Washrooms');
        setDescription('Continuous leak causing flooded corridor and low water pressure.');
        setKind('grievance');
      } else {
        setTitle('Need a Snack Vending Machine in Library');
        setLocation('Central Library Basement');
        setDescription('Automated vending machine would support late night exam prep sessions.');
        setKind('suggestion');
      }
    }, 900);
  };

  const handleUpvoteMatched = () => {
    if (matchedPost) {
      upvotePost(matchedPost.id);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addPost({
      author_id: 'student-1',
      kind,
      title: title.trim(),
      description: description.trim() || null,
      category: kind === 'grievance' ? 'Broken' : 'Needs',
      severity: kind === 'grievance' ? 2 : 1,
      safety_risk: title.toLowerCase().includes('dark') || title.toLowerCase().includes('leak'),
      department: kind === 'grievance' ? 'Maintenance' : 'Student Amenities',
      location_name: location.trim() || 'Campus Grounds',
      photos: photoUrl ? [photoUrl] : [],
      anonymous: false,
      status: 'approved',
      author_name: 'Aarav Sharma (CS-25)',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity fade-in overflow-y-auto">
      <div className="glass-card rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 modal-enter border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shadow-sm border border-teal-100 dark:border-teal-800">
            <PenTool className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Post</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Submit a new request or report a broken facility on campus.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Radio Cards */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              Post Category
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-start gap-1.5 transition-all shadow-sm ${
                  kind === 'grievance'
                    ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="postType"
                    value="grievance"
                    checked={kind === 'grievance'}
                    onChange={() => setKind('grievance')}
                    className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    Complaint
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-6">
                  Report broken things (Fix It).
                </span>
              </label>

              <label
                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-start gap-1.5 transition-all shadow-sm ${
                  kind === 'suggestion'
                    ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="postType"
                    value="suggestion"
                    checked={kind === 'suggestion'}
                    onChange={() => setKind('suggestion')}
                    className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-teal-500 stroke-[3]" />
                    Suggestion
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-6">
                  Request additions (Add It).
                </span>
              </label>
            </div>
          </div>

          {/* Quick Camera Evidence Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <span>Photo Evidence (AI Triage)</span>
              {photoUrl && (
                <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1 normal-case font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Auto-Analyzed
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Library Vending', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
                { label: 'Hostel Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80' },
                { label: 'Washroom Tap Leak', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
              ].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePhotoSelect(s.url)}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    photoUrl === s.url
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <img src={s.url} alt={s.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block truncate">{s.label}</span>
                </button>
              ))}
            </div>

            {isAnalyzing && (
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI inspecting photo context and prefilling details...</span>
              </div>
            )}
          </div>

          {/* Title Input (Triggers Realtime AI Duplicate Checker) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Need a vending machine in the library..."
              className="w-full text-sm border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:border-teal-500 transition-all font-semibold shadow-sm"
            />
          </div>

          {/* AI Duplicate Alert Box matching up_campus_code.html */}
          {matchedPost && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm fade-in">
              <div className="flex gap-4 items-start">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-amber-100 dark:border-amber-700 shrink-0">
                  <Bot className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-2">
                    Wait! Similar Post Found{' '}
                    <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                      AI Match
                    </span>
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-3 leading-relaxed">
                    Someone already posted:{' '}
                    <strong className="text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                      &quot;{matchedPost.title}&quot;
                    </strong>
                    <br />
                    Upvote theirs to help it reach the 100-vote threshold faster!
                  </p>
                  <button
                    type="button"
                    onClick={handleUpvoteMatched}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                    <span>Upvote Existing Instead (+{matchedPost.count})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Location Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Central Library Ground Floor"
              className="w-full text-sm border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:border-teal-500 transition-all font-semibold shadow-sm"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Details
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this needs to be addressed..."
              className="w-full text-sm border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:border-teal-500 transition-all font-medium resize-none shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 text-sm font-bold bg-slate-900 hover:bg-teal-600 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 rounded-xl shadow-lg transition-all active:scale-95"
            >
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
