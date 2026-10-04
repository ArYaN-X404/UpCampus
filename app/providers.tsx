'use client';

import React, { useState } from 'react';
import { UpCampusProvider } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import NewPostModal from '@/components/post/NewPostModal';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  return (
    <UpCampusProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar onOpenPostModal={() => setIsNewPostModalOpen(true)} />
        <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 flex flex-col">
          {children}
        </main>
      </div>

      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
      />
    </UpCampusProvider>
  );
}
