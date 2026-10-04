'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { 
  ArrowUpRight, 
  Plus, 
  RotateCcw, 
  LayoutDashboard,
  ShieldCheck, 
  Activity,
  LogIn,
  LogOut,
  UserCheck,
  ChevronDown,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';

interface NavbarProps {
  onOpenPostModal?: () => void;
}

export default function Navbar({ onOpenPostModal }: NavbarProps) {
  const pathname = usePathname();
  const { 
    isAdmin, 
    resetDemoData, 
    posts,
    currentUser,
    isAuthenticated,
    logout,
    loginAsDemo,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useUpCampus();

  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingCount = posts.filter((p) => p.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="bg-gradient-to-tr from-skyBlue via-sky-400 to-mintGreen text-deepNavy w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-skyBlue/20 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-softWhite leading-none">
              Up <span className="text-skyBlue">Campus</span>
            </span>
            <span className="text-[10px] text-paleBlueGrey font-semibold tracking-wider uppercase mt-1">
              Student Governance OS
            </span>
          </div>
        </Link>

        {/* Navigation pill links */}
        <nav className="hidden lg:flex items-center gap-1.5 ml-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === '/'
                ? 'bg-darkBlue text-softWhite border border-skyBlue/30 shadow-glass'
                : 'text-paleBlueGrey hover:bg-darkBlue/50 hover:text-softWhite'
            }`}
          >
            Feed
          </Link>
          <Link
            href="/queue"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/queue'
                ? 'bg-darkBlue text-softWhite border border-skyBlue/30 shadow-glass'
                : 'text-paleBlueGrey hover:bg-darkBlue/50 hover:text-softWhite'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-skyBlue" />
            <span>Supervisor</span>
            {pendingCount > 0 && (
              <span className="bg-skyBlue/20 border border-skyBlue/40 text-skyBlue text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/admin'
                ? 'bg-darkBlue text-softWhite border border-skyBlue/30 shadow-glass'
                : 'text-paleBlueGrey hover:bg-darkBlue/50 hover:text-softWhite'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-mintGreen" />
            <span>Control Room</span>
          </Link>
          <Link
            href="/live"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/live'
                ? 'bg-darkBlue text-softWhite border border-skyBlue/30 shadow-glass'
                : 'text-paleBlueGrey hover:bg-darkBlue/50 hover:text-softWhite'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-skyBlue" />
            <span>Live Wall</span>
          </Link>
        </nav>

        {/* Right Actions: Auth / Profile, Quick Demo, Reset, Primary CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Hydration Safe Auth & Profile Container */}
          {!mounted ? (
            <div className="w-28 h-8 rounded-xl bg-darkBlue/60 border border-paleBlueGrey/20 animate-pulse" />
          ) : isAuthenticated && currentUser ? (
            /* Logged In State: User Pill & Dropdown */
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-darkBlue/90 hover:bg-darkBlue border border-paleBlueGrey/25 transition-all text-xs font-bold shadow-sm"
                title="User Account & Security Profile"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                  currentUser.role === 'admin' 
                    ? 'bg-mintGreen/20 text-mintGreen border border-mintGreen/40' 
                    : 'bg-skyBlue/20 text-skyBlue border border-skyBlue/40'
                }`}>
                  {currentUser.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-mintGreen" /> : currentUser.display_name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-softWhite max-w-[120px] truncate">
                  {currentUser.display_name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  currentUser.role === 'admin' ? 'bg-mintGreen/20 text-mintGreen' : 'bg-skyBlue/20 text-skyBlue'
                }`}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Student'}
                </span>
                <ChevronDown className="w-3 h-3 text-paleBlueGrey" />
              </button>

              {/* Profile Popover Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0B1530] border border-slate-700/90 shadow-2xl p-3 space-y-2 z-50 fade-in text-xs text-softWhite">
                  <div className="p-3 rounded-xl bg-darkBlue/70 border border-paleBlueGrey/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="block text-white font-bold">{currentUser.display_name}</strong>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        currentUser.role === 'admin' ? 'bg-mintGreen/20 text-mintGreen' : 'bg-skyBlue/20 text-skyBlue'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-paleBlueGrey block truncate">{currentUser.email}</span>
                    <p className="text-[10px] text-skyBlue pt-1">
                      {currentUser.role === 'admin' 
                        ? '🛡️ Full administrative moderation & resolution permissions.' 
                        : '🎓 Verified student citizen identity with grievance rights.'}
                    </p>
                  </div>

                  {/* 1-Click Role Switcher for Hackathon Testing */}
                  <div className="p-2 rounded-xl bg-white/5 space-y-1.5">
                    <span className="text-[10px] font-semibold text-paleBlueGrey block">Quick Role Switch:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <button
                        onClick={() => {
                          loginAsDemo('admin');
                          setIsProfileOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                          currentUser.role === 'admin'
                            ? 'bg-mintGreen/20 border-mintGreen/50 text-mintGreen font-bold'
                            : 'border-white/10 hover:bg-white/5 text-paleBlueGrey'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-mintGreen shrink-0" />
                        <span className="truncate">Admin</span>
                      </button>

                      <button
                        onClick={() => {
                          loginAsDemo('student');
                          setIsProfileOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                          currentUser.role === 'student'
                            ? 'bg-skyBlue/20 border-skyBlue/50 text-skyBlue font-bold'
                            : 'border-white/10 hover:bg-white/5 text-paleBlueGrey'
                        }`}
                      >
                        <GraduationCap className="w-3 h-3 text-skyBlue shrink-0" />
                        <span className="truncate">Student</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-paleBlueGrey hover:text-white flex items-center gap-2 transition-colors font-semibold"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-skyBlue" />
                      <span>Account Portal</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out State: Prominent Sign In + 1-Click Demo Buttons */
            <div className="flex items-center gap-2">
              {/* Quick Demo Dropdown Pill for Hackathon Evaluators */}
              <div className="relative">
                <button
                  onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-paleBlueGrey/20 text-paleBlueGrey hover:text-softWhite text-xs font-semibold transition-all"
                  title="Quick Demo Role Select"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isDemoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0B1530] border border-slate-700 shadow-xl p-2 space-y-1 z-50 fade-in text-xs">
                    <button
                      onClick={() => {
                        loginAsDemo('admin');
                        setIsDemoMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-softWhite flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-mintGreen" />
                      <span>Login as Admin</span>
                    </button>
                    <button
                      onClick={() => {
                        loginAsDemo('student');
                        setIsDemoMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-softWhite flex items-center gap-2"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-skyBlue" />
                      <span>Login as Student</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dedicated Sign In CTA Button */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-skyBlue/15 hover:bg-skyBlue/25 border border-skyBlue/35 text-skyBlue hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Reset Demo Quick Button */}
          <button
            onClick={() => {
              if (confirm('Reset demo state to initial campus dataset?')) {
                resetDemoData();
              }
            }}
            className="p-2 text-paleBlueGrey hover:text-softWhite rounded-xl transition-all"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary CTA in Fresh Green (#38C982) */}
          <button
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-2 btn-fresh-green px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Issue</span>
          </button>
        </div>
      </div>

      {/* Professional Authentication Modal (Global Trigger) */}
      <LoginModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
}
