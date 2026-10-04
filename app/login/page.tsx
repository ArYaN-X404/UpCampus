'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  LogOut,
  Wrench
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { 
    currentUser, 
    isAuthenticated, 
    login, 
    loginAsDemo, 
    signUp, 
    logout 
  } = useUpCampus();

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const ok = await login(email, password);
        if (ok) {
          setSuccessMsg('Authentication verified. Redirecting to Campus Feed...');
          setTimeout(() => {
            router.push('/');
          }, 600);
        } else {
          setErrorMsg('Invalid email or password. Please verify credentials or use Quick Demo below.');
        }
      } else {
        const ok = await signUp(email, password, name, role);
        if (ok) {
          setSuccessMsg('Account registered successfully! Redirecting to Campus Feed...');
          setTimeout(() => {
            router.push('/');
          }, 600);
        } else {
          setErrorMsg('Failed to create account. Please check details or try another email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = (demoRole: 'admin' | 'student' | 'supervisor') => {
    setErrorMsg(null);
    setSuccessMsg(`Logged in as ${demoRole === 'admin' ? 'Dean of Facilities (Admin)' : demoRole === 'supervisor' ? 'Estate Supervisor' : 'Student Citizen'}!`);
    loginAsDemo(demoRole);
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleFillDemo = (demoRole: 'admin' | 'student') => {
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

  if (!mounted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-skyBlue border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] w-full flex flex-col items-center justify-center py-8 px-4 sm:px-6 relative">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-skyBlue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-mintGreen/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Feed Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-paleBlueGrey hover:text-softWhite transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Feed</span>
        </Link>
        <span className="text-[10px] font-semibold text-skyBlue uppercase tracking-wider">
          Secured Campus Auth
        </span>
      </div>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#0B1530]/95 backdrop-blur-xl border border-paleBlueGrey/20 shadow-[0_24px_80px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-softWhite space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-1">
            <div className="bg-gradient-to-tr from-skyBlue via-sky-400 to-mintGreen text-deepNavy w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-skyBlue/20 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-softWhite">
              Up <span className="text-skyBlue">Campus</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {isAuthenticated ? 'Active Campus Session' : mode === 'login' ? 'Sign In to UpCampus' : 'Create Verified Campus Account'}
          </h1>
          <p className="text-xs text-paleBlueGrey font-light">
            {isAuthenticated 
              ? 'You are currently authenticated in the campus system.' 
              : 'Institutional identity & role-based student governance access.'}
          </p>
        </div>

        {/* If Already Authenticated: Show Profile & Fast Action */}
        {isAuthenticated && currentUser ? (
          <div className="space-y-5 fade-in">
            <div className="p-4 rounded-2xl bg-darkBlue/80 border border-paleBlueGrey/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                    currentUser.role === 'admin' 
                      ? 'bg-mintGreen/20 text-mintGreen border border-mintGreen/40' 
                      : 'bg-skyBlue/20 text-skyBlue border border-skyBlue/40'
                  }`}>
                    {currentUser.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : currentUser.display_name.charAt(0)}
                  </div>
                  <div>
                    <strong className="block text-sm text-white font-bold">{currentUser.display_name}</strong>
                    <span className="text-xs text-paleBlueGrey">{currentUser.email}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentUser.role === 'admin' ? 'bg-mintGreen/20 text-mintGreen' : 'bg-skyBlue/20 text-skyBlue'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-skyBlue pt-1 border-t border-paleBlueGrey/10">
                {currentUser.role === 'admin' 
                  ? '🛡️ Full administrative moderation & 24hr escalation permissions.' 
                  : '🎓 Verified student citizen identity with voting & grievance filing rights.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/"
                className="btn-fresh-green text-deepNavy font-extrabold py-3 rounded-xl text-center text-xs sm:text-sm shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Go to Campus Feed</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSuccessMsg('Signed out successfully.');
                }}
                className="px-4 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-paleBlueGrey">Or switch to another demo profile:</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin(currentUser.role === 'admin' ? 'student' : 'admin')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-paleBlueGrey/20 text-xs font-semibold text-softWhite transition-all"
                >
                  Switch to {currentUser.role === 'admin' ? '🎓 Student' : '🛡️ Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('supervisor')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-paleBlueGrey/20 text-xs font-semibold text-softWhite transition-all"
                >
                  Switch to 🔧 Supervisor
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authentication Form */
          <>
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-darkBlue/90 rounded-2xl border border-paleBlueGrey/20 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                    : 'text-paleBlueGrey hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-skyBlue text-deepNavy font-extrabold shadow-sm'
                    : 'text-paleBlueGrey hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Instant 1-Click Demo Accounts for Judges & Reviewers */}
            <div className="p-3.5 bg-darkBlue/70 rounded-2xl border border-paleBlueGrey/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-paleBlueGrey uppercase tracking-wider">
                  ⚡ 1-Click Instant Demo Login
                </span>
                <span className="text-[9px] text-skyBlue font-semibold">Hackathon Ready</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('admin')}
                  className="p-2.5 rounded-xl bg-[#091122] hover:bg-[#0d1830] border border-paleBlueGrey/20 hover:border-mintGreen/60 text-left transition-all group"
                  title="Instant login as Dean of Facilities"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-mintGreen shrink-0" />
                    <strong className="text-[11px] text-white group-hover:text-mintGreen truncate">Dean / Admin</strong>
                  </div>
                  <span className="text-[9px] text-paleBlueGrey block">Full Moderation SLA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('student')}
                  className="p-2.5 rounded-xl bg-[#091122] hover:bg-[#0d1830] border border-paleBlueGrey/20 hover:border-skyBlue/60 text-left transition-all group"
                  title="Instant login as Student Citizen"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-skyBlue shrink-0" />
                    <strong className="text-[11px] text-white group-hover:text-skyBlue truncate">Student Citizen</strong>
                  </div>
                  <span className="text-[9px] text-paleBlueGrey block">Aarav (CS-25)</span>
                </button>
              </div>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#091122] border border-paleBlueGrey/25 rounded-xl focus-within:border-skyBlue transition-colors">
                    <User className="w-4 h-4 text-paleBlueGrey" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="bg-transparent border-0 text-xs sm:text-sm text-white placeholder-paleBlueGrey/50 focus:outline-none w-full"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Campus Email / ID</label>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin')}
                    className="text-[10px] text-skyBlue hover:text-sky-300 underline"
                  >
                    Fill Admin
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#091122] border border-paleBlueGrey/25 rounded-xl focus-within:border-skyBlue transition-colors">
                  <Mail className="w-4 h-4 text-paleBlueGrey" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@upcampus.edu"
                    className="bg-transparent border-0 text-xs sm:text-sm text-white placeholder-paleBlueGrey/50 focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('student')}
                    className="text-[10px] text-skyBlue hover:text-sky-300 underline"
                  >
                    Fill Student
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#091122] border border-paleBlueGrey/25 rounded-xl focus-within:border-skyBlue transition-colors">
                  <Lock className="w-4 h-4 text-paleBlueGrey" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-transparent border-0 text-xs sm:text-sm text-white placeholder-paleBlueGrey/50 focus:outline-none w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-paleBlueGrey hover:text-white"
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
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        role === 'student'
                          ? 'bg-skyBlue/20 border-skyBlue text-skyBlue font-bold'
                          : 'border-paleBlueGrey/25 text-paleBlueGrey hover:text-white'
                      }`}
                    >
                      Student Citizen
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        role === 'admin'
                          ? 'bg-mintGreen/20 border-mintGreen text-mintGreen font-bold'
                          : 'border-paleBlueGrey/25 text-paleBlueGrey hover:text-white'
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
                className="w-full py-3 rounded-xl btn-fresh-green text-deepNavy font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-deepNavy" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Sign In to Campus Feed' : 'Create Verified Account'}</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer Note */}
        <div className="pt-2 text-center border-t border-paleBlueGrey/10">
          <p className="text-[10px] text-paleBlueGrey">
            Universal Sync &amp; Supabase Auth Powered &bull; UpCampus v2.0
          </p>
        </div>

      </div>
    </div>
  );
}
