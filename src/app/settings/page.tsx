'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  getUserPreferences,
  saveUserPreferences,
  clearHistory,
  getThemePreference,
  setThemePreference
} from '../../services/localStorageService';
import { useTheme } from '../../hooks/useTheme';
import { Difficulty, UserPreferences } from '../../types';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  useEffect(() => {
    setPreferences(getUserPreferences());
  }, []);

  const handlePreferencesChange = (key: keyof UserPreferences, value: any) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveUserPreferences(updated);
  };

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    if (!preferences) return;
    setThemePreference(selectedTheme);
    handlePreferencesChange('theme', selectedTheme);

    // Apply theme
    if (typeof window !== 'undefined') {
      let themeToApply = selectedTheme;
      if (selectedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeToApply = prefersDark ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', themeToApply);
      if (themeToApply === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleResetHistory = () => {
    if (confirm('Are you sure you want to delete all practice scores and reset preferences? This cannot be undone.')) {
      clearHistory();
      
      const defaultPrefs: UserPreferences = {
        theme: 'dark',
        timerDuration: 30,
        defaultQuestionCount: 10,
        defaultDifficulty: 'mixed',
      };
      
      setPreferences(defaultPrefs);
      saveUserPreferences(defaultPrefs);
      handleThemeChange('dark');
      
      setResetStatus('Local data reset successfully.');
      setTimeout(() => setResetStatus(null), 3000);
    }
  };

  if (!preferences) {
    return (
        <div className="max-w-xl mx-auto font-mono text-sm text-text-sec">
          Loading preferences...
        </div>
    );
  }

  return (
      <div className="max-w-xl mx-auto">
        <h1 className="font-mono text-3xl font-bold text-text-main mb-6 pb-2 border-b border-border-base">
          Settings
        </h1>

        <div className="space-y-6">
          
          {/* Theme Selection */}
          <Card>
            <h3 className="text-base font-mono font-bold text-text-main mb-4">Appearance Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`py-2 px-3 text-sm font-mono font-medium rounded-md border text-center transition-colors cursor-pointer ${
                    preferences.theme === t
                      ? 'bg-accent-base text-white border-transparent'
                      : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-mute mt-3 leading-relaxed">
              Select between light theme, dark theme (recommended), or match your system environment preference.
            </p>
          </Card>

          {/* Quiz Timer Default */}
          <Card>
            <h3 className="text-base font-mono font-bold text-text-main mb-4">Default Question Timer</h3>
            <div className="grid grid-cols-4 gap-2">
              {([15, 30, 45, 60] as const).map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => handlePreferencesChange('timerDuration', seconds)}
                  className={`py-2 px-1 text-sm font-mono font-medium rounded-md border text-center transition-colors cursor-pointer ${
                    preferences.timerDuration === seconds
                      ? 'bg-accent-base text-white border-transparent'
                      : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
            <p className="text-xs text-text-mute mt-3 leading-relaxed">
              Change the countdown duration allowed per question. Expiration counts as an incorrect submission.
            </p>
          </Card>

          {/* Quiz Length & Difficulty defaults */}
          <Card>
            <h3 className="text-base font-mono font-bold text-text-main mb-4">Quiz Configurations</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-mono text-text-sec mb-2">DEFAULT QUESTION COUNT</label>
              <div className="grid grid-cols-3 gap-2">
                {([5, 10, 20] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => handlePreferencesChange('defaultQuestionCount', count)}
                    className={`py-1.5 text-xs font-mono font-medium rounded-md border text-center transition-colors cursor-pointer ${
                      preferences.defaultQuestionCount === count
                        ? 'bg-accent-base text-white border-transparent'
                        : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-sec mb-2">DEFAULT DIFFICULTY</label>
              <div className="grid grid-cols-4 gap-2">
                {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handlePreferencesChange('defaultDifficulty', diff)}
                    className={`py-1.5 text-xs font-mono font-medium rounded-md border text-center transition-colors cursor-pointer ${
                      preferences.defaultDifficulty === diff
                        ? 'bg-accent-base text-white border-transparent'
                        : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Reset / Destructive settings */}
          <Card className="border-error-base bg-error-bg/10">
            <h3 className="text-base font-mono font-bold text-error-base mb-2">Data Management</h3>
            <p className="text-xs text-text-sec mb-4 leading-relaxed">
              Clears all local statistics, completed quiz scores, last active category logs, and resets application preferences to default dark settings.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="danger" size="sm" onClick={handleResetHistory}>
                Clear All Data
              </Button>
              {resetStatus && (
                <span className="text-xs font-mono text-success-base font-semibold">
                  {resetStatus}
                </span>
              )}
            </div>
          </Card>

        </div>
      </div>
  );
}
