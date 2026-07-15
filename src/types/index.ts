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
}

export interface QuizSessionState {
  config: QuizConfig;
  questions: Question[];
  currentIndex: number;
  selectedAnswers: Record<number, number>; // index -> selected option index
  responseTimes: Record<number, number>;   // index -> time spent in ms
  timerValues: Record<number, number>;     // index -> remaining seconds when submitted
  isSubmitted: boolean;                    // true if feedback is visible
  completed: boolean;
  score: number;
}

export interface HistoryRecord {
  date: string;
  skill: SkillCategory;
  score: number;
  total: number;
  accuracy: number;
  avgTimeMs: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timerDuration: 15 | 30 | 45 | 60;
  defaultQuestionCount: 5 | 10 | 20;
  defaultDifficulty: Difficulty;
}
