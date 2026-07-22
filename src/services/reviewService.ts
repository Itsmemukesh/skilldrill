import { MissedItem, BookmarkItem, Question } from '../types';
import { localDayKey } from './gamificationService';

/**
 * Review pool (GAM-04, spaced repetition) + bookmarks (GAM-05).
 *
 * Missed questions use a lightweight Leitner system: each item lives in a
 * "box". A correct review promotes it to a higher box (longer interval); a
 * wrong answer sends it back to box 1. Items resurface when their dueDate is
 * on/before today.
 */

const REVIEW_KEY = 'skilldrill_review_pool';
const BOOKMARKS_KEY = 'skilldrill_bookmarks';

const isBrowser = () => typeof window !== 'undefined';

// Leitner intervals in days, indexed by box (box 1 -> index 0).
const BOX_INTERVALS = [1, 2, 4, 9, 21];
const MAX_BOX = BOX_INTERVALS.length;

function addDays(dayKey: string, days: number): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function dueDateForBox(box: number, from = localDayKey()): string {
  const interval = BOX_INTERVALS[Math.min(box, MAX_BOX) - 1] ?? 1;
  return addDays(from, interval);
}

// ==================== Review pool (GAM-04) ====================

export function getReviewPool(): MissedItem[] {
  if (!isBrowser()) return [];
  try {
    const saved = localStorage.getItem(REVIEW_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing review pool', e);
  }
  return [];
}

function saveReviewPool(pool: MissedItem[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(pool));
  } catch (e) {
    console.error('Error saving review pool', e);
  }
}

/** Add a freshly-missed question to the review pool (or reset it to box 1 if present). */
export function addMissedQuestion(question: Question): void {
  const pool = getReviewPool();
  const existing = pool.find((item) => item.question.id === question.id);
  const now = new Date().toISOString();

  if (existing) {
    existing.box = 1;
    existing.dueDate = dueDateForBox(1);
    existing.lastReviewed = now;
    existing.timesWrong += 1;
    existing.question = question; // refresh snapshot
  } else {
    pool.push({
      question,
      box: 1,
      dueDate: dueDateForBox(1),
      lastReviewed: now,
      timesWrong: 1,
    });
  }
  saveReviewPool(pool);
}

/** Questions currently due for review (dueDate on/before today). */
export function getDueReviewQuestions(today = localDayKey()): Question[] {
  return getReviewPool()
    .filter((item) => item.dueDate <= today)
    .map((item) => item.question);
}

export function getDueReviewCount(today = localDayKey()): number {
  return getReviewPool().filter((item) => item.dueDate <= today).length;
}

/**
 * Record the outcome of reviewing a question. Correct -> promote a box (or
 * graduate out of the pool at max box); wrong -> demote to box 1.
 */
export function recordReviewOutcome(questionId: string, correct: boolean): void {
  const pool = getReviewPool();
  const item = pool.find((i) => i.question.id === questionId);
  if (!item) return;

  const now = new Date().toISOString();
  if (correct) {
    if (item.box >= MAX_BOX) {
      // Graduated — remove from the pool.
      saveReviewPool(pool.filter((i) => i.question.id !== questionId));
      return;
    }
    item.box += 1;
  } else {
    item.box = 1;
    item.timesWrong += 1;
  }
  item.dueDate = dueDateForBox(item.box);
  item.lastReviewed = now;
  saveReviewPool(pool);
}

export function clearReviewPool(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(REVIEW_KEY);
}

// ==================== Bookmarks (GAM-05) ====================

export function getBookmarks(): BookmarkItem[] {
  if (!isBrowser()) return [];
  try {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing bookmarks', e);
  }
  return [];
}

function saveBookmarks(items: BookmarkItem[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving bookmarks', e);
  }
}

export function isBookmarked(questionId: string): boolean {
  return getBookmarks().some((b) => b.question.id === questionId);
}

/** Toggle a bookmark; returns the new state (true = now bookmarked). */
export function toggleBookmark(question: Question): boolean {
  const items = getBookmarks();
  const exists = items.some((b) => b.question.id === question.id);
  if (exists) {
    saveBookmarks(items.filter((b) => b.question.id !== question.id));
    return false;
  }
  saveBookmarks([{ question, savedAt: new Date().toISOString() }, ...items]);
  return true;
}

export function removeBookmark(questionId: string): void {
  saveBookmarks(getBookmarks().filter((b) => b.question.id !== questionId));
}

export function clearBookmarks(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(BOOKMARKS_KEY);
}
