'use client';

import React from 'react';
import { UpCampusProvider } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UpCampusProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </UpCampusProvider>
  );
}
