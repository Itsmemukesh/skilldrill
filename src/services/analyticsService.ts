import { SkillCategory, Difficulty } from '../types';

/**
 * Custom analytics event helpers for GA4.
 * GA4 and Microsoft Clarity scripts load in `src/app/layout.tsx` <head>.
 * Set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_CLARITY_ID` in `.env.local` or GitHub Actions secrets.
 */

// Safe check to determine if GA is hydrated in the browser
const getGtag = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    return (window as any).gtag;
  }
  return null;
};

export const initializeAnalytics = (): void => {
  // GA4 and Clarity load from layout.tsx <head>. Kept for backward compatibility.
};

export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', eventName, params);
  } else {
    // Fallback logging during development
    console.log(`[Analytics Event] ${eventName}`, params);
  }
};

// Strongly typed event trackers matching 16-Analytics-Events.md
export const trackPageView = (pageName: string): void => {
  trackEvent('page_view', { page_name: pageName });
};

export const trackQuizStarted = (
  skill: SkillCategory,
  difficulty: Difficulty,
  questionCount: number,
  timer: number
): void => {
  trackEvent('quiz_started', {
    skill,
    difficulty,
    question_count: questionCount,
    timer,
  });
};

export const trackQuestionViewed = (
  questionId: string,
  skill: SkillCategory,
  difficulty: string,
  questionIndex: number
): void => {
  trackEvent('question_viewed', {
    question_id: questionId,
    skill,
    difficulty,
    question_index: questionIndex,
  });
};

export const trackAnswerSubmitted = (
  questionId: string,
  selectedOption: number,
  responseTimeMs: number,
  isCorrect: boolean
): void => {
  trackEvent('answer_submitted', {
    question_id: questionId,
    selected_option: selectedOption,
    response_time_ms: responseTimeMs,
  });

  trackEvent(isCorrect ? 'answer_correct' : 'answer_incorrect', {
    question_id: questionId,
    ...(isCorrect ? { response_time_ms: responseTimeMs } : { selected_option: selectedOption }),
  });
};

export const trackTimerExpired = (questionId: string, timerDuration: number): void => {
  trackEvent('timer_expired', {
    question_id: questionId,
    timer: timerDuration,
  });
};

export const trackQuizCompleted = (
  skill: SkillCategory,
  score: number,
  accuracy: number,
  avgResponseTime: number,
  questionCount: number
): void => {
  trackEvent('quiz_completed', {
    skill,
    score,
    accuracy,
    average_response_time: avgResponseTime,
    question_count: questionCount,
  });
};

export const trackButtonClick = (buttonName: string): void => {
  trackEvent('button_click', { button_name: buttonName });
};
