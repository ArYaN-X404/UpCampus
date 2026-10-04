'use client';

import React, { useState } from 'react';
import { useUpCampus } from '@/lib/store';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function LoginModal({ isOpen, onClose, defaultMode = 'login' }: LoginModalProps) {
  const { login, loginAsDemo, signUp } = useUpCampus();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          setSuccessMsg('Authentication successful! Welcome back.');
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setErrorMsg('Invalid email or password. Please verify your credentials.');
        }
      } else {
        const success = await signUp(email, password, name, role);
        if (success) {
          setSuccessMsg('Account created successfully! Welcome to UpCampus.');
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setErrorMsg('Failed to create account. Please try another email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: 'admin' | 'student') => {
    if (demoRole === 'admin') {
      setEmail('admin@upcampus.edu');
      setPassword('Admin@2026');
      setName('Dr. S. Kapoor');
      setRole('admin');
    } else {
      setEmail('aarav@upcampus.edu');
      setPassword('Student@2026');
      setName('Aarav Sharma');
      setRole('student');
    }
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060D1E]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0B1428] border border-slate-700/80 shadow-[0_24px_80px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-white space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                {mode === 'login' ? 'UpCampus Portal Sign In' : 'Create Campus Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Secure Identity & Role-Based Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#070D1E] rounded-xl border border-slate-700/70 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Quick Demo Pre-fill Bar (Convenience for Judges & Reviewers) */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ 1-Click Instant Demo Login
            </span>
            <span className="text-[9px] text-sky-400 font-semibold">One Tap</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                loginAsDemo('admin');
                setSuccessMsg('Logged in as Dean of Facilities (Admin)!');
                setTimeout(() => onClose(), 600);
              }}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-mintGreen text-slate-200 text-left flex items-center gap-1.5 transition-colors group"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-mintGreen shrink-0" />
              <div className="truncate">
                <strong className="block text-[11px] text-white group-hover:text-mintGreen">Dean / Admin</strong>
                <span className="text-[9px] text-slate-400">Moderation Powers</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                loginAsDemo('student');
                setSuccessMsg('Logged in as Student Citizen (Aarav)!');
                setTimeout(() => onClose(), 600);
              }}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-400 text-slate-200 text-left flex items-center gap-1.5 transition-colors group"
            >
              <GraduationCap className="w-3.5 h-3.5 text-skyBlue shrink-0" />
              <div className="truncate">
                <strong className="block text-[11px] text-white group-hover:text-skyBlue">Student Citizen</strong>
                <span className="text-[9px] text-slate-400">Aarav (CS-25)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#091122] border border-slate-700/80 rounded-xl focus-within:border-sky-400 transition-colors">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="bg-transparent border-0 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Campus Email / ID</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#091122] border border-slate-700/80 rounded-xl focus-within:border-sky-400 transition-colors">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@upcampus.edu"
                className="bg-transparent border-0 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#091122] border border-slate-700/80 rounded-xl focus-within:border-sky-400 transition-colors">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent border-0 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Account Type</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 rounded-lg border text-center transition-all ${
                    role === 'student'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Student Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-lg border text-center transition-all ${
                    role === 'admin'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Admin / Staff
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-freshGreen hover:bg-mintGreen text-deepNavy font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-deepNavy" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Campus Wall' : 'Create Verified Account'}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
