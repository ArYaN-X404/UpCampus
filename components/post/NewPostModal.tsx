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
    <div className="fixed inset-0 bg-deepNavy/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity fade-in overflow-y-auto">
      <div className="glass-card rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 modal-enter border border-paleBlueGrey/20 bg-darkBlue text-softWhite">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-paleBlueGrey hover:text-softWhite bg-white/5 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-colors border border-paleBlueGrey/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-skyBlue/15 text-skyBlue flex items-center justify-center text-xl shadow-sm border border-skyBlue/30">
            <PenTool className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-softWhite">Create Post</h3>
            <p className="text-xs text-paleBlueGrey mt-1">
              Submit a new request or report a broken facility on campus.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Radio Cards */}
          <div>
            <label className="block text-[11px] font-bold text-paleBlueGrey uppercase tracking-widest mb-3">
              Post Category
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-start gap-1.5 transition-all shadow-sm ${
                  kind === 'grievance'
                    ? 'border-skyBlue bg-skyBlue/15 text-softWhite shadow-glassGlow'
                    : 'border-paleBlueGrey/15 bg-white/5 hover:bg-white/10 text-paleBlueGrey'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="postType"
                    value="grievance"
                    checked={kind === 'grievance'}
                    onChange={() => setKind('grievance')}
                    className="text-skyBlue focus:ring-skyBlue w-4 h-4 bg-deepNavy border-paleBlueGrey/30"
                  />
                  <span className="text-sm font-bold flex items-center gap-1.5 text-softWhite">
                    <Wrench className="w-4 h-4 text-skyBlue" />
                    Complaint
                  </span>
                </div>
                <span className="text-xs text-paleBlueGrey font-medium pl-6">
                  Report broken things (Fix It).
                </span>
              </label>

              <label
                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-start gap-1.5 transition-all shadow-sm ${
                  kind === 'suggestion'
                    ? 'border-mintGreen bg-mintGreen/15 text-softWhite shadow-mintGlow'
                    : 'border-paleBlueGrey/15 bg-white/5 hover:bg-white/10 text-paleBlueGrey'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="postType"
                    value="suggestion"
                    checked={kind === 'suggestion'}
                    onChange={() => setKind('suggestion')}
                    className="text-mintGreen focus:ring-mintGreen w-4 h-4 bg-deepNavy border-paleBlueGrey/30"
                  />
                  <span className="text-sm font-bold flex items-center gap-1.5 text-softWhite">
                    <Plus className="w-4 h-4 text-mintGreen stroke-[3]" />
                    Suggestion
                  </span>
                </div>
                <span className="text-xs text-paleBlueGrey font-medium pl-6">
                  Request additions (Add It).
                </span>
              </label>
            </div>
          </div>

          {/* Quick Camera Evidence Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-paleBlueGrey uppercase tracking-widest">
              <span>Photo Evidence (AI Triage)</span>
              {photoUrl && (
                <span className="text-mintGreen flex items-center gap-1 normal-case font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
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
                      ? 'border-mintGreen bg-mintGreen/15 shadow-sm'
                      : 'border-paleBlueGrey/20 bg-deepNavy/70 hover:border-paleBlueGrey/40'
                  }`}
                >
                  <img src={s.url} alt={s.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-semibold text-paleBlueGrey block truncate">{s.label}</span>
                </button>
              ))}
            </div>

            {isAnalyzing && (
              <div className="p-2.5 rounded-xl badge-sky text-xs flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-skyBlue" />
                <span className="text-skyBlue">AI inspecting photo context and prefilling details...</span>
              </div>
            )}
          </div>

          {/* Title Input (Triggers Realtime AI Duplicate Checker) */}
          <div>
            <label className="block text-[11px] font-bold text-paleBlueGrey uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Need a vending machine in the library..."
              className="w-full text-sm border border-paleBlueGrey/25 bg-deepNavy/80 text-softWhite placeholder-paleBlueGrey/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-skyBlue transition-all font-semibold shadow-inner"
            />
          </div>

          {/* AI Duplicate Alert Box matching up_campus_code.html */}
          {matchedPost && (
            <div className="bg-skyBlue/10 border border-skyBlue/30 rounded-2xl p-5 shadow-sm fade-in backdrop-blur-md">
              <div className="flex gap-4 items-start">
                <div className="bg-darkBlue p-2.5 rounded-xl shadow-sm border border-skyBlue/30 shrink-0 text-skyBlue">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-skyBlue mb-1 flex items-center gap-2">
                    Wait! Similar Post Found{' '}
                    <span className="badge-sky text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                      AI Match
                    </span>
                  </h4>
                  <p className="text-xs text-paleBlueGrey mb-3 leading-relaxed">
                    Someone already posted:{' '}
                    <strong className="text-softWhite bg-white/10 px-1.5 py-0.5 rounded">
                      &quot;{matchedPost.title}&quot;
                    </strong>
                    <br />
                    Upvote theirs to help it reach the 100-vote threshold faster!
                  </p>
                  <button
                    type="button"
                    onClick={handleUpvoteMatched}
                    className="btn-fresh-green text-deepNavy text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
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
            <label className="block text-[11px] font-bold text-paleBlueGrey uppercase tracking-widest mb-2">
              Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Central Library Ground Floor"
              className="w-full text-sm border border-paleBlueGrey/25 bg-deepNavy/80 text-softWhite placeholder-paleBlueGrey/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-skyBlue transition-all font-semibold shadow-inner"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-[11px] font-bold text-paleBlueGrey uppercase tracking-widest mb-2">
              Details
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this needs to be addressed..."
              className="w-full text-sm border border-paleBlueGrey/25 bg-deepNavy/80 text-softWhite placeholder-paleBlueGrey/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-skyBlue transition-all font-medium resize-none shadow-inner"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-paleBlueGrey/15">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-paleBlueGrey hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-fresh-green text-deepNavy px-8 py-3 text-sm font-extrabold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
