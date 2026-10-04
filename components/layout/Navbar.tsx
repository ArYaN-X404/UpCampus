'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { 
  ArrowUpRight, 
  Plus, 
  Sun, 
  Moon, 
  RotateCcw, 
  CheckCheck,
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
    theme, 
    toggleTheme, 
    resetDemoData, 
    posts 
  } = useUpCampus();

  const pendingCount = posts.filter((p) => p.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm transition-all border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
              Up <span className="text-teal-600 dark:text-teal-400">Campus</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-1">
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
                ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            Feed
          </Link>
          <Link
            href="/queue"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/queue'
                ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supervisor</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/admin'
                ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Control Room</span>
          </Link>
          <Link
            href="/live"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/live'
                ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Live Wall</span>
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle, Admin View Switch, Post Issue Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Light/Dark Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Admin View Toggle from up_campus_code.html */}
          <label
            className="relative inline-flex items-center cursor-pointer select-none group"
            title="Toggle Admin Mode to resolve issues"
          >
            <input
              type="checkbox"
              id="admin-toggle"
              checked={isAdmin}
              onChange={toggleAdmin}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-teal-500 group-hover:bg-slate-300"></div>
            <span className="ml-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 peer-checked:text-slate-900 dark:peer-checked:text-white transition-colors hidden sm:block">
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
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-all"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary CTA: Post Issue Button */}
          <button
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Issue</span>
          </button>
        </div>
      </div>
    </header>
  );
}
