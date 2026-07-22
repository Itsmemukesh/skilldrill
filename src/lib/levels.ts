import { LevelInfo } from '../types';

/**
 * XP + level model (GAM-02).
 *
 * XP is awarded per quiz (see gamificationService). Levels use a gently
 * increasing curve so early progress feels quick and later levels take real
 * work — but never so steep it feels grindy. Titles lean documentation-craft,
 * matching the app's professional (non-childish) tone.
 */

// XP required to advance FROM the given level to the next. Index 0 = level 1.
// Level N needs LEVEL_XP[N-1] XP earned within that level to reach N+1.
const BASE_XP = 100;
const GROWTH = 60; // linear growth per level — predictable, not exponential.

/** XP needed to clear a given level (1-indexed). */
function xpToClearLevel(level: number): number {
  return BASE_XP + GROWTH * (level - 1);
}

const LEVEL_TITLES = [
  'Draft Apprentice',   // 1
  'Style Scout',        // 2
  'Clarity Contributor',// 3
  'Docs Craftsperson',  // 4
  'Reference Ranger',   // 5
  'Standards Steward',  // 6
  'Content Architect',  // 7
  'Docs Lead',          // 8
  'Principal Writer',   // 9
  'Documentation Sage', // 10+
];

export const MAX_LEVEL = 10;

export function titleForLevel(level: number): string {
  const idx = Math.min(level, MAX_LEVEL) - 1;
  return LEVEL_TITLES[idx] ?? LEVEL_TITLES[LEVEL_TITLES.length - 1];
}

/** Derive full level info from cumulative XP. */
export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));

  while (level < MAX_LEVEL) {
    const need = xpToClearLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }

  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      title: titleForLevel(MAX_LEVEL),
      currentLevelXp: remaining,
      xpForNextLevel: Infinity,
      xpIntoLevel: remaining,
      isMax: true,
    };
  }

  const span = xpToClearLevel(level);
  return {
    level,
    title: titleForLevel(level),
    currentLevelXp: remaining,
    xpForNextLevel: span,
    xpIntoLevel: remaining,
    isMax: false,
  };
}

/**
 * XP awarded for completing a quiz. Rewards effort (questions answered) and
 * mastery (correct answers), with a small accuracy bonus for strong runs.
 */
export function xpForQuiz(params: {
  total: number;
  correct: number;
  accuracy: number; // 0-100
}): number {
  const { total, correct, accuracy } = params;
  const effort = total * 2;          // 2 XP per question attempted
  const mastery = correct * 8;       // 8 XP per correct answer
  const bonus = accuracy >= 80 ? 25 : accuracy >= 50 ? 10 : 0;
  return effort + mastery + bonus;
}
