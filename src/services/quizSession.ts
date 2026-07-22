import { QuizConfig, Question, QuizSessionState, HistoryRecord, AttemptedQuestion } from '../types';

export const createInitialSession = (
  config: QuizConfig,
  questions: Question[]
): QuizSessionState => {
  return {
    config,
    questions,
    currentIndex: 0,
    selectedAnswers: {},
    responseTimes: {},
    timerValues: {},
    flagged: {},
    completed: false,
    score: 0,
  };
};

/** A question is "submitted" (feedback revealed) once it has a recorded answer. */
export const isQuestionSubmitted = (state: QuizSessionState, index: number): boolean => {
  return state.selectedAnswers[index] !== undefined;
};

export const isCurrentSubmitted = (state: QuizSessionState): boolean => {
  return isQuestionSubmitted(state, state.currentIndex);
};

/** Recompute score from all recorded answers (order-independent, back-nav safe). */
const computeScore = (state: QuizSessionState): number => {
  return state.questions.reduce((acc, q, idx) => {
    return state.selectedAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);
};

export const submitAnswer = (
  state: QuizSessionState,
  selectedOptionIndex: number, // -1 represents timeout / expired
  timeSpentMs: number,
  remainingSeconds: number
): QuizSessionState => {
  if (state.completed) return state;
  // Do not overwrite an already-answered question (revisiting is read-only).
  if (isQuestionSubmitted(state, state.currentIndex)) return state;

  const next: QuizSessionState = {
    ...state,
    selectedAnswers: {
      ...state.selectedAnswers,
      [state.currentIndex]: selectedOptionIndex,
    },
    responseTimes: {
      ...state.responseTimes,
      [state.currentIndex]: timeSpentMs,
    },
    timerValues: {
      ...state.timerValues,
      [state.currentIndex]: remainingSeconds,
    },
  };

  return { ...next, score: computeScore(next) };
};

/** Jump to an arbitrary question index (used by skip and back navigation). */
export const goToIndex = (state: QuizSessionState, index: number): QuizSessionState => {
  if (state.completed) return state;
  if (index < 0 || index >= state.questions.length) return state;
  return { ...state, currentIndex: index };
};

/** Advance to the next question, or mark completed if at the end. */
export const advanceToNext = (state: QuizSessionState): QuizSessionState => {
  if (state.completed) return state;

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.questions.length) {
    return { ...state, completed: true };
  }
  return { ...state, currentIndex: nextIndex };
};

/** Go back to the previous question (feedback shown read-only). */
export const goToPrevious = (state: QuizSessionState): QuizSessionState => {
  return goToIndex(state, state.currentIndex - 1);
};

/** Toggle the "flag for review" marker on the current question (UX-04). */
export const toggleFlag = (state: QuizSessionState): QuizSessionState => {
  const idx = state.currentIndex;
  return {
    ...state,
    flagged: { ...state.flagged, [idx]: !state.flagged[idx] },
  };
};

/** Index of the first question with no recorded answer, or -1 if all answered. */
export const firstUnansweredIndex = (state: QuizSessionState): number => {
  return state.questions.findIndex((_, idx) => state.selectedAnswers[idx] === undefined);
};

export const answeredCount = (state: QuizSessionState): number => {
  return state.questions.reduce(
    (acc, _, idx) => (state.selectedAnswers[idx] !== undefined ? acc + 1 : acc),
    0
  );
};

/** Force-complete the session (used by "Finish now"); unanswered stay unanswered. */
export const finishSession = (state: QuizSessionState): QuizSessionState => {
  return { ...state, completed: true, score: computeScore(state) };
};

/** Extract per-question outcomes for stats + review (GAM-02/03/04). */
export const extractAttempts = (state: QuizSessionState): AttemptedQuestion[] => {
  const date = new Date().toISOString();
  return state.questions.map((q, idx) => {
    const selected = state.selectedAnswers[idx];
    return {
      questionId: q.id,
      skill: q.skill,
      difficulty: q.difficulty,
      tags: q.tags ?? [],
      correct: selected === q.correctAnswer,
      selectedOption: selected === undefined ? -1 : selected,
      date,
    };
  });
};

export const calculateResultsSummary = (state: QuizSessionState): HistoryRecord => {
  const total = state.questions.length;
  const score = computeScore(state);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  const responseTimes = Object.values(state.responseTimes);
  const avgTimeMs = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  return {
    date: new Date().toISOString(),
    skill: state.config.skill,
    score,
    total,
    accuracy,
    avgTimeMs,
  };
};
