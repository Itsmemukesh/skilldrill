export type SkillCategory =
  | 'documentation-fundamentals'
  | 'api-documentation'
  | 'style-guides'
  | 'docs-as-code'
  | 'ai-for-technical-writers'
  | 'content-strategy'
  | 'professional-skills'
  | 'interview-preparation';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Reference {
  title: string;
  url: string;
}

export interface Question {
  schemaVersion: string;
  id: string;
  skill: SkillCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice';
  tags: string[];
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  reference: Reference;
  realWorldExample: string;
  estimatedTime: number; // in seconds
  status: 'draft' | 'review' | 'published' | 'archived';
}

export interface QuizConfig {
  skill: SkillCategory;
  questionCount: 5 | 10 | 20;
  difficulty: Difficulty;
  timerDuration: 15 | 30 | 45 | 60;
  timerEnabled: boolean;          // false = untimed "Learn" mode (UX-03)
  seed?: number;                  // deterministic seed for daily challenge (UX-05)
}

export interface QuizSessionState {
  config: QuizConfig;
  questions: Question[];
  currentIndex: number;
  selectedAnswers: Record<number, number>; // index -> selected option index (-1 = timed out; absent = unanswered)
  responseTimes: Record<number, number>;   // index -> time spent in ms
  timerValues: Record<number, number>;     // index -> remaining seconds when submitted
  flagged: Record<number, boolean>;        // index -> flagged for review (UX-04)
  completed: boolean;
  score: number;
}

/** Persisted wrapper for an in-progress quiz so it can be resumed (UX-01). */
export interface PersistedSession {
  session: QuizSessionState;
  savedAt: string;
}

export interface HistoryRecord {
  date: string;
  skill: SkillCategory;
  score: number;
  total: number;
  accuracy: number;
  avgTimeMs: number;
}

/** Per-question outcome captured at quiz completion (powers stats + review). */
export interface AttemptedQuestion {
  questionId: string;
  skill: SkillCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  correct: boolean;
  selectedOption: number; // -1 = timed out / unanswered
  date: string;           // ISO timestamp of the attempt
}

/** Daily streak state (GAM-01). */
export interface StreakState {
  current: number;
  longest: number;
  lastActiveDate: string | null; // YYYY-MM-DD (local calendar day)
}

/** Aggregate gamification state persisted to localStorage (GAM-01/02/07). */
export interface GamificationState {
  xp: number;
  streak: StreakState;
  badges: Record<string, string>;   // badgeId -> earnedAt ISO timestamp
  activity: Record<string, number>; // YYYY-MM-DD -> questions answered that day (GAM-07 heatmap)
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
}

/** A level derived from total XP (GAM-02). */
export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number; // XP accumulated within the current level
  xpForNextLevel: number; // XP span of the current level (Infinity at max)
  xpIntoLevel: number;    // progress within the current level
  isMax: boolean;
}

/** A badge definition (GAM-02). */
export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji, matches the app's understated style
}

/** A question flagged into the spaced-repetition review pool (GAM-04). */
export interface MissedItem {
  question: Question;      // snapshot so review works offline / after edits
  box: number;             // Leitner box: higher = answered correctly more often
  dueDate: string;         // YYYY-MM-DD when it should next resurface
  lastReviewed: string;    // ISO timestamp
  timesWrong: number;
}

/** A user-saved question for later review (GAM-05). */
export interface BookmarkItem {
  question: Question;      // snapshot
  savedAt: string;         // ISO timestamp
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timerEnabled: boolean;          // false = untimed "Learn" mode by default (UX-03)
  timerDuration: 15 | 30 | 45 | 60;
  defaultQuestionCount: 5 | 10 | 20;
  defaultDifficulty: Difficulty;
}
