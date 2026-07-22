import { GamificationState, AttemptedQuestion, LevelInfo } from '../types';
import { BADGES } from '../lib/badges';
import { levelFromXp, xpForQuiz } from '../lib/levels';

/**
 * Gamification store (GAM-01 streaks, GAM-02 XP/levels/badges, GAM-07 activity
 * heatmap). All state lives in localStorage; there is no backend.
 */

const GAMIFICATION_KEY = 'skilldrill_gamification';
const ATTEMPTS_KEY = 'skilldrill_attempts';

const isBrowser = () => typeof window !== 'undefined';

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  streak: { current: 0, longest: 0, lastActiveDate: null },
  badges: {},
  activity: {},
  totalQuizzes: 0,
  totalQuestions: 0,
  totalCorrect: 0,
};

/** Local calendar day as YYYY-MM-DD (streaks are day-based, in the user's timezone). */
export function localDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole-day difference between two YYYY-MM-DD keys (b - a). */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86400000);
}

export function getGamificationState(): GamificationState {
  if (!isBrowser()) return DEFAULT_STATE;
  try {
    const saved = localStorage.getItem(GAMIFICATION_KEY);
    if (saved) {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error parsing gamification state', e);
  }
  return DEFAULT_STATE;
}

function saveGamificationState(state: GamificationState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving gamification state', e);
  }
}

export function getAttempts(): AttemptedQuestion[] {
  if (!isBrowser()) return [];
  try {
    const saved = localStorage.getItem(ATTEMPTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing attempts', e);
  }
  return [];
}

function saveAttempts(attempts: AttemptedQuestion[]): void {
  if (!isBrowser()) return;
  try {
    // Cap to the most recent 2000 attempts to bound localStorage usage.
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(-2000)));
  } catch (e) {
    console.error('Error saving attempts', e);
  }
}

export interface QuizAwards {
  xpEarned: number;
  newBadges: string[];       // badge ids newly earned this quiz
  streak: number;            // streak after this quiz
  streakIncreased: boolean;
  level: LevelInfo;
  leveledUp: boolean;
}

/**
 * Record a completed quiz: append attempts, update streak/activity/XP, and
 * award any newly-earned badges. Returns the awards for a celebratory summary.
 */
export function recordQuizCompletion(attempts: AttemptedQuestion[]): QuizAwards {
  const prev = getGamificationState();
  const prevLevel = levelFromXp(prev.xp);
  const today = localDayKey();

  // --- Streak (GAM-01) ---
  let { current, longest, lastActiveDate } = prev.streak;
  let streakIncreased = false;
  if (lastActiveDate === today) {
    // Already practiced today — streak unchanged.
  } else if (lastActiveDate && dayDiff(lastActiveDate, today) === 1) {
    current += 1;
    streakIncreased = true;
  } else {
    current = 1; // first ever, or a gap broke the chain
    streakIncreased = true;
  }
  longest = Math.max(longest, current);
  lastActiveDate = today;

  // --- Activity heatmap (GAM-07) ---
  const activity = { ...prev.activity };
  activity[today] = (activity[today] ?? 0) + attempts.length;

  // --- Totals + XP (GAM-02) ---
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0;
  const xpEarned = xpForQuiz({ total: attempts.length, correct, accuracy });

  const next: GamificationState = {
    ...prev,
    xp: prev.xp + xpEarned,
    streak: { current, longest, lastActiveDate },
    activity,
    totalQuizzes: prev.totalQuizzes + 1,
    totalQuestions: prev.totalQuestions + attempts.length,
    totalCorrect: prev.totalCorrect + correct,
  };

  // --- Badges (GAM-02) ---
  const newBadges: string[] = [];
  for (const badge of BADGES) {
    if (!next.badges[badge.id] && badge.earned(next)) {
      next.badges[badge.id] = new Date().toISOString();
      newBadges.push(badge.id);
    }
  }

  saveGamificationState(next);
  saveAttempts([...getAttempts(), ...attempts]);

  const level = levelFromXp(next.xp);
  return {
    xpEarned,
    newBadges,
    streak: current,
    streakIncreased,
    level,
    leveledUp: level.level > prevLevel.level,
  };
}

/**
 * Streak grace check for display: if the user hasn't practiced today or
 * yesterday, the visible current streak is effectively 0 (the chain is broken)
 * even though we don't rewrite storage until they next practice.
 */
export function displayStreak(state: GamificationState, today = localDayKey()): number {
  const { current, lastActiveDate } = state.streak;
  if (!lastActiveDate) return 0;
  const gap = dayDiff(lastActiveDate, today);
  if (gap <= 0) return current;   // practiced today
  if (gap === 1) return current;  // practiced yesterday — still alive today
  return 0;                       // chain broken
}

export function clearGamification(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(GAMIFICATION_KEY);
  localStorage.removeItem(ATTEMPTS_KEY);
}
