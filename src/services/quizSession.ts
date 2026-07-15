import { QuizConfig, Question, QuizSessionState, HistoryRecord } from '../types';

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
    isSubmitted: false,
    completed: false,
    score: 0,
  };
};

export const submitAnswer = (
  state: QuizSessionState,
  selectedOptionIndex: number, // -1 represents timeout / expired
  timeSpentMs: number,
  remainingSeconds: number
): QuizSessionState => {
  if (state.isSubmitted || state.completed) return state;

  const currentQuestion = state.questions[state.currentIndex];
  const isCorrect = selectedOptionIndex === currentQuestion.correctAnswer;
  const newScore = isCorrect ? state.score + 1 : state.score;

  return {
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
    isSubmitted: true,
    score: newScore,
  };
};

export const advanceToNext = (state: QuizSessionState): QuizSessionState => {
  if (!state.isSubmitted || state.completed) return state;

  const nextIndex = state.currentIndex + 1;
  const isLastQuestion = nextIndex >= state.questions.length;

  return {
    ...state,
    currentIndex: isLastQuestion ? state.currentIndex : nextIndex,
    isSubmitted: false,
    completed: isLastQuestion,
  };
};

export const calculateResultsSummary = (state: QuizSessionState): HistoryRecord => {
  const total = state.questions.length;
  const score = state.score;
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
