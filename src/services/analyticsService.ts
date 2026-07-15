import { SkillCategory, Difficulty } from '../types';
import { GA_MEASUREMENT_ID } from '../lib/analytics';

/**
 * Analytics integration for GA4 and Microsoft Clarity.
 *
 * GA4 is loaded in `src/app/layout.tsx` <head> (Google's recommended placement).
 * Clarity is injected here on app mount. Custom quiz events use `trackEvent`.
 *
 * Override the GA ID with `NEXT_PUBLIC_GA_ID` in `.env.local` or GitHub Actions secrets.
 */

const CLARITY_PROJECT_ID = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CLARITY_ID : null;

// Safe check to determine if GA is hydrated in the browser
const getGtag = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    return (window as any).gtag;
  }
  return null;
};

export const initializeAnalytics = (): void => {
  if (typeof window === 'undefined') return;

  if (GA_MEASUREMENT_ID) {
    console.log(`[Analytics] GA4 active with ID: ${GA_MEASUREMENT_ID}`);
  }

  // Microsoft Clarity Script Injection
  if (CLARITY_PROJECT_ID) {
    const clarityScript = document.createElement('script');
    clarityScript.type = 'text/javascript';
    clarityScript.innerHTML = `
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","${CLARITY_PROJECT_ID}");
    `;
    document.head.appendChild(clarityScript);
    console.log(`[Analytics] Clarity Initialized with ID: ${CLARITY_PROJECT_ID}`);
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Clarity disabled in development. Set NEXT_PUBLIC_CLARITY_ID in .env.local to enable.');
    } else {
      console.warn('[Analytics] Microsoft Clarity ID missing. Session recording inactive.');
    }
  }
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
