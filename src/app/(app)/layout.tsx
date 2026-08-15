'use client';

'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { AgencyProvider } from '@/context/AgencyContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgencyProvider>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </AgencyProvider>
  );
}
