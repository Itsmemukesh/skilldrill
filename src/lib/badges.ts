import { BadgeDef, GamificationState } from '../types';

/**
 * Badge catalog (GAM-02). Understated emoji + craft-oriented names to fit the
 * app's professional tone. Each badge has a pure predicate evaluated against
 * the gamification state after a quiz completes.
 */

export interface BadgeRule extends BadgeDef {
  earned: (s: GamificationState) => boolean;
}

export const BADGES: BadgeRule[] = [
  {
    id: 'first-quiz',
    name: 'First Draft',
    description: 'Complete your first quiz.',
    icon: '📝',
    earned: (s) => s.totalQuizzes >= 1,
  },
  {
    id: 'streak-3',
    name: 'Warming Up',
    description: 'Reach a 3-day practice streak.',
    icon: '🔥',
    earned: (s) => s.streak.longest >= 3,
  },
  {
    id: 'streak-7',
    name: 'Consistent',
    description: 'Reach a 7-day practice streak.',
    icon: '⚡',
    earned: (s) => s.streak.longest >= 7,
  },
  {
    id: 'streak-30',
    name: 'Unbroken',
    description: 'Reach a 30-day practice streak.',
    icon: '🏔️',
    earned: (s) => s.streak.longest >= 30,
  },
  {
    id: 'questions-50',
    name: 'Half Century',
    description: 'Answer 50 questions in total.',
    icon: '📚',
    earned: (s) => s.totalQuestions >= 50,
  },
  {
    id: 'questions-250',
    name: 'Well Read',
    description: 'Answer 250 questions in total.',
    icon: '🗂️',
    earned: (s) => s.totalQuestions >= 250,
  },
  {
    id: 'correct-100',
    name: 'Century of Correct',
    description: 'Get 100 answers correct in total.',
    icon: '🎯',
    earned: (s) => s.totalCorrect >= 100,
  },
  {
    id: 'quizzes-10',
    name: 'Regular',
    description: 'Complete 10 quizzes.',
    icon: '📈',
    earned: (s) => s.totalQuizzes >= 10,
  },
];

export function getBadgeDef(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
