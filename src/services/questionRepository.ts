import { Question, SkillCategory, Difficulty } from '../types';

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getQuestionBankUrl(skill: SkillCategory): string {
  return `${PUBLIC_BASE_PATH}/questions/${skill}.json`;
}

// ==================== Seeded RNG (for deterministic daily) ====================

/** Mulberry32 — small, fast, deterministic PRNG returning [0, 1). */
function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable numeric seed for the current calendar day (UX-05). */
export function getDailySeed(date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

// Fisher-Yates shuffle. Uses a provided RNG so results are deterministic when seeded.
export const shuffleArray = <T>(array: T[], rng: () => number = Math.random): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Shuffle a question's answer options and remap `correctAnswer` to the new
 * position (UX-06). Prevents users from memorizing answer positions.
 */
export const shuffleQuestionOptions = (question: Question, rng: () => number = Math.random): Question => {
  const indices = shuffleArray(
    question.options.map((_, idx) => idx),
    rng
  );
  const options = indices.map((idx) => question.options[idx]);
  const correctAnswer = indices.indexOf(question.correctAnswer);
  return { ...question, options, correctAnswer };
};

// Client-side fallback questions if JSON loading fails completely
const BACKUP_QUESTIONS: Question[] = [
  {
    schemaVersion: "1.0",
    "id": "FALLBACK-0001",
    "skill": "documentation-fundamentals",
    "difficulty": "easy",
    "type": "multiple-choice",
    "tags": ["fundamentals", "fallback"],
    "question": "What is the primary rule of technical writing clarity?",
    "options": [
      "Use passive voice as much as possible",
      "Write for your target audience, not yourself",
      "Use complex jargon to sound authoritative",
      "Omit headings and let users scan the wall of text"
    ],
    "correctAnswer": 1,
    "explanation": "Audience analysis is the core of technical writing. Knowing what the reader needs, their technical level, and their goals dictates the terminology, tone, and depth of the document.",
    "reference": {
      "title": "Microsoft Writing Style Guide - Topic Overview",
      "url": "https://learn.microsoft.com/en-us/style-guide/welcome/"
    },
    "realWorldExample": "Writing 'Run npm install' for developers vs. 'Set up the system requirements' for non-technical administrators.",
    "estimatedTime": 30,
    "status": "published"
  }
];

export const loadQuestionsForSkill = async (skill: SkillCategory): Promise<Question[]> => {
  try {
    const response = await fetch(getQuestionBankUrl(skill), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch questions for skill: ${skill} (HTTP ${response.status})`);
    }
    const questions: Question[] = await response.json();

    // Filter out unpublished questions in production (or keep only published)
    return questions.filter(q => q.status === 'published' && q.type === 'multiple-choice');
  } catch (error) {
    console.error(`Error loading questions for ${skill}, falling back.`, error);
    // Return backup questions belonging to the skill, or generic fallback
    return BACKUP_QUESTIONS.map(q => ({ ...q, skill }));
  }
};

/**
 * Load the combined question bank for several skills at once. Used by the Daily
 * Challenge so its deck can be drawn from a mix of all ready categories rather
 * than a single skill. Failed banks are simply skipped.
 */
export const loadQuestionsForSkills = async (skills: SkillCategory[]): Promise<Question[]> => {
  const banks = await Promise.all(skills.map((skill) => loadQuestionsForSkill(skill)));
  return banks.flat();
};

/** Result of building a quiz deck — carries metadata for an honest UX notice (UX-07). */
export interface SelectionResult {
  questions: Question[];
  requested: number;
  delivered: number;
  difficultyFallback: boolean; // true if we ignored the difficulty filter to fill the deck
}

export const filterAndSelectQuestions = (
  questions: Question[],
  limit: number,
  difficulty: Difficulty,
  seed?: number
): SelectionResult => {
  if (questions.length === 0) {
    return { questions: [], requested: limit, delivered: 0, difficultyFallback: false };
  }

  const rng = seed !== undefined ? createSeededRandom(seed) : Math.random;

  // 1. Filter by difficulty if not 'mixed'
  let filtered = questions;
  let difficultyFallback = false;
  if (difficulty !== 'mixed') {
    filtered = questions.filter(q => q.difficulty === difficulty);
  }

  // If no questions match the specific difficulty filter, fall back to all available questions.
  if (filtered.length === 0) {
    filtered = questions;
    difficultyFallback = difficulty !== 'mixed';
  }

  // 2. Randomize question order, then shuffle each question's options (UX-06).
  const randomized = shuffleArray(filtered, rng).map((q) => shuffleQuestionOptions(q, rng));

  // 3. Limit the length
  const selected = randomized.slice(0, limit);

  return {
    questions: selected,
    requested: limit,
    delivered: selected.length,
    difficultyFallback,
  };
};
