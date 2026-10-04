'use client';

import React, { useState } from 'react';
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
  ChevronDown
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
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useUpCampus();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

        {/* Right Actions: Professional User Auth / Profile, Reset Button, Primary CTA in Fresh Green */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Professional User Auth / Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-darkBlue/90 hover:bg-darkBlue border border-paleBlueGrey/25 transition-all text-xs font-bold shadow-sm"
              title="User Account & Security Profile"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                isAdmin 
                  ? 'bg-mintGreen/20 text-mintGreen border border-mintGreen/40' 
                  : 'bg-skyBlue/20 text-skyBlue border border-skyBlue/40'
              }`}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-mintGreen" /> : currentUser?.display_name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-softWhite max-w-[130px] truncate">
                {currentUser?.display_name || 'Sign In'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                isAdmin ? 'bg-mintGreen/20 text-mintGreen' : 'bg-skyBlue/20 text-skyBlue'
              }`}>
                {isAdmin ? 'Admin' : 'Student'}
              </span>
              <ChevronDown className="w-3 h-3 text-paleBlueGrey" />
            </button>

            {/* Profile Popover Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0B1530] border border-slate-700/90 shadow-2xl p-3 space-y-2 z-50 fade-in text-xs text-softWhite">
                <div className="p-3 rounded-xl bg-darkBlue/70 border border-paleBlueGrey/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="block text-white font-bold">{currentUser?.display_name}</strong>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isAdmin ? 'bg-mintGreen/20 text-mintGreen' : 'bg-skyBlue/20 text-skyBlue'
                    }`}>
                      {isAdmin ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  <span className="text-[11px] text-paleBlueGrey block truncate">{currentUser?.email}</span>
                  <p className="text-[10px] text-skyBlue pt-1">
                    {isAdmin ? '🛡️ Full administrative moderation & resolution permissions.' : '🎓 Verified student citizen identity.'}
                  </p>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-paleBlueGrey hover:text-white flex items-center gap-2 transition-colors font-semibold"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-skyBlue" />
                    <span>Switch Account / Sign In</span>
                  </button>

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

      {/* Professional Authentication Modal */}
      <LoginModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
}
