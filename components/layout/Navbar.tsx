'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { 
  ArrowUpRight, 
  Plus, 
  RotateCcw, 
  LayoutDashboard,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface NavbarProps {
  onOpenPostModal?: () => void;
}

export default function Navbar({ onOpenPostModal }: NavbarProps) {
  const pathname = usePathname();
  const { 
    isAdmin, 
    toggleAdmin, 
    resetDemoData, 
    posts 
  } = useUpCampus();

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

        {/* Right Actions: Admin View Switch, Reset Button, Primary CTA in Fresh Green */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin View Switch */}
          <label
            className="relative inline-flex items-center cursor-pointer select-none group"
            title="Toggle Admin View to resolve issues"
          >
            <input
              type="checkbox"
              id="admin-toggle"
              checked={isAdmin}
              onChange={toggleAdmin}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-darkBlue border border-paleBlueGrey/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-deepNavy after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-softWhite after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-freshGreen group-hover:border-skyBlue/40"></div>
            <span className="ml-2.5 text-xs sm:text-sm font-bold text-paleBlueGrey peer-checked:text-mintGreen transition-colors hidden sm:block">
              Admin View
            </span>
          </label>

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
            className="inline-flex items-center gap-2 btn-fresh-green px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Issue</span>
          </button>
        </div>
      </div>
    </header>
  );
}
