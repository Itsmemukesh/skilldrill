import { UserPreferences, HistoryRecord, SkillCategory, PersistedSession, QuizSessionState } from '../types';

const THEME_KEY = 'skilldrill_theme';
const PREFERENCES_KEY = 'skilldrill_preferences';
const HISTORY_KEY = 'skilldrill_history';
const LAST_SKILL_KEY = 'skilldrill_last_skill';
const ACTIVE_SESSION_KEY = 'skilldrill_active_session';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark', // GitHub-inspired dark by default as per vision
  timerEnabled: false, // Untimed "Learn" mode by default (UX-03); less punitive for daily habit
  timerDuration: 30,
  defaultQuestionCount: 10,
  defaultDifficulty: 'mixed',
};

// Safe wrapper to check if we are in the browser
const isBrowser = () => typeof window !== 'undefined';

export const getThemePreference = (): 'light' | 'dark' | 'system' => {
  if (!isBrowser()) return 'dark';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'dark';
};

export const setThemePreference = (theme: 'light' | 'dark' | 'system'): void => {
  if (!isBrowser()) return;
  localStorage.setItem(THEME_KEY, theme);
};

export const getUserPreferences = (): UserPreferences => {
  if (!isBrowser()) return DEFAULT_PREFERENCES;
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error parsing preferences from localStorage', e);
  }
  return DEFAULT_PREFERENCES;
};

export const saveUserPreferences = (prefs: Partial<UserPreferences>): void => {
  if (!isBrowser()) return;
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving preferences to localStorage', e);
  }
};

export const getHistory = (): HistoryRecord[] => {
  if (!isBrowser()) return [];
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error parsing history from localStorage', e);
  }
  return [];
};

export const saveHistoryRecord = (record: HistoryRecord): void => {
  if (!isBrowser()) return;
  try {
    const history = getHistory();
    const updated = [record, ...history].slice(0, 50); // Keep last 50 attempts
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving history to localStorage', e);
  }
};

export const clearHistory = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(HISTORY_KEY);
};

export const getLastPracticedSkill = (): SkillCategory | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(LAST_SKILL_KEY) as SkillCategory | null;
};

export const saveLastPracticedSkill = (skill: SkillCategory): void => {
  if (!isBrowser()) return;
  localStorage.setItem(LAST_SKILL_KEY, skill);
};

// ==================== Active session persistence (UX-01) ====================

export const saveActiveSession = (session: QuizSessionState): void => {
  if (!isBrowser()) return;
  try {
    const payload: PersistedSession = { session, savedAt: new Date().toISOString() };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Error saving active session to localStorage', e);
  }
};

export const getActiveSession = (): PersistedSession | null => {
  if (!isBrowser()) return null;
  try {
    const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as PersistedSession;
    // Basic shape guard against stale/corrupt data from older schema versions.
    if (!parsed?.session?.questions?.length || parsed.session.completed) {
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Error parsing active session from localStorage', e);
    return null;
  }
};

export const clearActiveSession = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACTIVE_SESSION_KEY);
};
