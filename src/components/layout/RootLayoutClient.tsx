'use client';

import React from 'react';
import { AppShell } from './AppShell';
import { QuizNavigationProvider } from '../../contexts/QuizNavigationContext';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <QuizNavigationProvider>
      <AppShell>{children}</AppShell>
    </QuizNavigationProvider>
  );
}
