'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface QuizNavigationContextValue {
  isQuizActive: boolean;
  setQuizActive: (active: boolean) => void;
  registerQuitHandler: (handler: (() => void) | null) => void;
  requestNavigation: (href: string) => void;
}

const QuizNavigationContext = createContext<QuizNavigationContextValue | null>(null);

export function QuizNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const quitHandlerRef = useRef<(() => void) | null>(null);

  const registerQuitHandler = useCallback((handler: (() => void) | null) => {
    quitHandlerRef.current = handler;
  }, []);

  const requestNavigation = useCallback(
    (href: string) => {
      if (!isQuizActive) {
        router.push(href);
        return;
      }
      setPendingHref(href);
    },
    [isQuizActive, router]
  );

  const handleConfirmQuit = useCallback(() => {
    quitHandlerRef.current?.();
    quitHandlerRef.current = null;
    setIsQuizActive(false);

    const href = pendingHref;
    setPendingHref(null);

    if (href) {
      router.push(href);
    }
  }, [pendingHref, router]);

  const handleCancelQuit = useCallback(() => {
    setPendingHref(null);
  }, []);

  return (
    <QuizNavigationContext.Provider
      value={{
        isQuizActive,
        setQuizActive: setIsQuizActive,
        registerQuitHandler,
        requestNavigation,
      }}
    >
      {children}
      <ConfirmDialog
        open={pendingHref !== null}
        title="Quit quiz?"
        description="Your current progress will be lost and this session won't be saved. Are you sure you want to leave?"
        confirmLabel="Quit Quiz"
        cancelLabel="Keep Practicing"
        onConfirm={handleConfirmQuit}
        onCancel={handleCancelQuit}
      />
    </QuizNavigationContext.Provider>
  );
}

export function useQuizNavigation() {
  const context = useContext(QuizNavigationContext);
  if (!context) {
    throw new Error('useQuizNavigation must be used within QuizNavigationProvider');
  }
  return context;
}
