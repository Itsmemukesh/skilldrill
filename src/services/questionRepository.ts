import { Question, SkillCategory, Difficulty } from '../types';

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getQuestionBankUrl(skill: SkillCategory): string {
  return `${PUBLIC_BASE_PATH}/questions/${skill}.json`;
}

// Shuffle helper using Fisher-Yates algorithm
export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

export const filterAndSelectQuestions = (
  questions: Question[],
  limit: number,
  difficulty: Difficulty
): Question[] => {
  if (questions.length === 0) return [];

  // 1. Filter by difficulty if not 'mixed'
  let filtered = questions;
  if (difficulty !== 'mixed') {
    filtered = questions.filter(q => q.difficulty === difficulty);
  }

  // If no questions match the specific difficulty filter, fall back to all available questions for this skill
  if (filtered.length === 0) {
    filtered = questions;
  }

  // 2. Randomize question order (without shuffling options to simplify maintenance)
  const randomized = shuffleArray(filtered);

  // 3. Limit the length
  return randomized.slice(0, limit);
};
