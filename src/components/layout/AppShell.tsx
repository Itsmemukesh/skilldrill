'use client';

import React, { useEffect } from 'react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { initializeAnalytics } from '../../services/analyticsService';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  // Initialize analytics once when the application mounts in the client
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-main transition-colors duration-150">
      {/* Top Header Navigation */}
      <TopNav />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col">
        {children}
      </main>

      {/* Page Footer */}
      <Footer />
    </div>
  );
};
export default AppShell;
