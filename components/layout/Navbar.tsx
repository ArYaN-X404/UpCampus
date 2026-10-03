'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUpCampus } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { 
  Flame, 
  RotateCcw, 
  UserCheck 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentRole, switchRole, resetDemoData, posts } = useUpCampus();

  const pendingCount = posts.filter((p) => p.status === 'pending').length;
  const awaitingCount = posts.filter((p) => p.status === 'awaiting_verification').length;

  const roles: { role: UserRole; label: string; icon: string }[] = [
    { role: 'student', label: 'Student', icon: '🎓' },
    { role: 'supervisor', label: 'Supervisor', icon: '🛡️' },
    { role: 'admin', label: 'Faculty Admin', icon: '🏢' },
  ];

  const navLinks = [
    { href: '/', label: 'Feed' },
    { 
      href: '/queue', 
      label: 'Supervisor Queue', 
      badge: pendingCount > 0 ? pendingCount : null,
      highlight: currentRole === 'supervisor'
    },
    { 
      href: '/admin', 
      label: 'Admin Control', 
      badge: awaitingCount > 0 ? awaitingCount : null,
      highlight: currentRole === 'admin'
    },
    { href: '/archive', label: 'Solved Archive' },
    { href: '/live', label: 'Live Wall', isLive: true },
  ];

  return (
    <header className="sticky top-0 z-50 glass-header px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-campus-teal/20 border border-campus-teal/40 flex items-center justify-center text-campus-teal group-hover:scale-105 transition-transform shadow-glow">
              <Flame className="w-4 h-4 fill-campus-teal" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading tracking-wide text-lg text-white font-bold leading-none">
                UP<span className="text-campus-teal">CAMPUS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-sans tracking-wider uppercase mt-0.5">
                Proof of Resolution
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-campus-teal text-campus-bg shadow-glow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-campus-pink opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-campus-pink"></span>
                    </span>
                  )}
                  {link.label}
                  {link.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-campus-bg text-campus-teal'
                          : 'bg-campus-pink/20 text-campus-pink border border-campus-pink/30'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo Switcher & Reset */}
        <div className="flex items-center gap-2">
          {/* Role Segmented Switcher */}
          <div className="flex items-center bg-campus-surface/90 border border-campus-border rounded-xl p-1 shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 px-2 hidden sm:inline-flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-campus-teal" />
              Role:
            </span>
            {roles.map((r) => {
              const active = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    active
                      ? 'bg-campus-teal text-campus-bg shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={`Switch view to ${r.label}`}
                >
                  <span className="text-xs">{r.icon}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={() => {
              if (confirm('Reset demo state to initial campus dataset?')) {
                resetDemoData();
              }
            }}
            className="p-2 text-slate-400 hover:text-campus-amber hover:bg-campus-amber/10 rounded-xl border border-transparent hover:border-campus-amber/30 transition-all text-xs flex items-center gap-1"
            title="Reset demo data to initial seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-medium">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
