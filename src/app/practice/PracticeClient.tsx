'use client';

import React, { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  getUserPreferences,
  saveLastPracticedSkill,
  saveHistoryRecord,
  saveActiveSession,
  getActiveSession,
  clearActiveSession
} from '../../services/localStorageService';
import {
  loadQuestionsForSkill,
  loadQuestionsForSkills,
  filterAndSelectQuestions,
  getDailySeed
} from '../../services/questionRepository';
import {
  createInitialSession,
  submitAnswer,
  advanceToNext,
  goToIndex,
  toggleFlag,
  isQuestionSubmitted,
  isCurrentSubmitted,
  answeredCount,
  finishSession,
  extractAttempts,
  calculateResultsSummary
} from '../../services/quizSession';
import {
  trackQuizStarted,
  trackQuestionViewed,
  trackAnswerSubmitted,
  trackTimerExpired,
  trackQuizCompleted
} from '../../services/analyticsService';
import { recordQuizCompletion, QuizAwards } from '../../services/gamificationService';
import {
  addMissedQuestion,
  getDueReviewQuestions,
  recordReviewOutcome,
  isBookmarked,
  toggleBookmark,
} from '../../services/reviewService';
import { downloadScoreCard, shareResults, ScoreCardData } from '../../lib/scoreCardImage';
import { getBadgeDef } from '../../lib/badges';
import { SkillCategory, Difficulty, Question, QuizSessionState, QuizConfig, PersistedSession } from '../../types';
import { useQuizNavigation } from '../../contexts/QuizNavigationContext';
import { SKILLS as ALL_SKILLS, SITE_URL } from '../../lib/siteConfig';

// Practice supports only skills with a published question bank.
const SKILLS = ALL_SKILLS.filter((s) => s.ready).map(({ id, name, desc }) => ({ id, name, desc }));

const skillName = (skill: SkillCategory) => SKILLS.find((s) => s.id === skill)?.name ?? skill;

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setQuizActive, registerQuitHandler } = useQuizNavigation();

  // Route parameters
  const paramSkill = searchParams.get('skill') as SkillCategory | null;
  const paramMode = searchParams.get('mode'); // 'daily' or 'random'

  // Quiz configuration state
  const [selectedSkill, setSelectedSkill] = useState<SkillCategory>('documentation-fundamentals');
  const [questionCount, setQuestionCount] = useState<5 | 10 | 20>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [timerDuration, setTimerDuration] = useState<15 | 30 | 45 | 60>(30);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);

  // App flow state: 'setup' | 'loading' | 'quiz' | 'results'
  const [flowState, setFlowState] = useState<'setup' | 'loading' | 'quiz' | 'results'>('setup');

  // Session engine state
  const [session, setSession] = useState<QuizSessionState | null>(null);
  // Pending (pre-submit) selection for the current question. Kept separate from
  // session.selectedAnswers, which now records only *submitted* answers.
  const [pending, setPending] = useState<number | null>(null);
  // Notice shown when the difficulty filter was relaxed to fill the deck (UX-07).
  const [difficultyFallback, setDifficultyFallback] = useState(false);
  // Screen-reader announcement for answer feedback (UX-08).
  const [feedbackAnnouncement, setFeedbackAnnouncement] = useState('');

  // Resume-in-progress support (UX-01)
  const [resumable, setResumable] = useState<PersistedSession | null>(null);

  // Gamification awards earned at completion (GAM-01/02).
  const [awards, setAwards] = useState<QuizAwards | null>(null);
  // Bookmark state for the current question (GAM-05).
  const [currentBookmarked, setCurrentBookmarked] = useState(false);
  // Whether this session is a spaced-repetition review run (GAM-04).
  const [reviewMode, setReviewMode] = useState(false);

  // No-questions dialog (UX-02, replaces native alert)
  const [noQuestionsOpen, setNoQuestionsOpen] = useState(false);
  // Finish-early confirmation when unanswered questions remain
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);

  // Active Timer state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const sessionRef = useRef<QuizSessionState | null>(null);
  const startedFromParamRef = useRef(false);

  const clearQuizTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Pre-load parameters from URL or user preferences, and check for a resumable session.
  useEffect(() => {
    const prefs = getUserPreferences();
    setQuestionCount(prefs.defaultQuestionCount);
    setDifficulty(prefs.defaultDifficulty);
    setTimerDuration(prefs.timerDuration);
    setTimerEnabled(prefs.timerEnabled);

    if (paramSkill && SKILLS.some((s) => s.id === paramSkill)) {
      setSelectedSkill(paramSkill);
    }

    // Auto-launch modes take precedence over resume.
    if (paramMode === 'daily' && !startedFromParamRef.current) {
      startedFromParamRef.current = true;
      // Deterministic Daily Challenge: same deck for everyone on a given calendar
      // day (UX-05), drawn from a mix of all ready skill categories.
      startDailySession(prefs.timerEnabled, prefs.timerDuration);
      return;
    }

    if (paramMode === 'random' && !startedFromParamRef.current) {
      startedFromParamRef.current = true;
      const randomIndex = Math.floor(Math.random() * SKILLS.length);
      startQuizSession({
        skill: SKILLS[randomIndex].id as SkillCategory,
        questionCount: 5,
        difficulty: 'mixed',
        timerDuration: prefs.timerDuration,
        timerEnabled: prefs.timerEnabled,
      });
      return;
    }

    if (paramMode === 'review' && !startedFromParamRef.current) {
      startedFromParamRef.current = true;
      startReviewSession(prefs.timerEnabled, prefs.timerDuration);
      return;
    }

    // No auto-launch: offer to resume an in-progress session, if any.
    setResumable(getActiveSession());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramSkill, paramMode]);

  // Register quiz-active state + quit handler with the navigation guard.
  useEffect(() => {
    if (flowState !== 'quiz') {
      setQuizActive(false);
      registerQuitHandler(null);
      return;
    }

    setQuizActive(true);
    registerQuitHandler(() => {
      clearQuizTimers();
      // Progress stays persisted in localStorage so it can be resumed.
      setSession(null);
      setPending(null);
      setFlowState('setup');
      setResumable(getActiveSession());
    });

    return () => {
      setQuizActive(false);
      registerQuitHandler(null);
    };
  }, [flowState, setQuizActive, registerQuitHandler, clearQuizTimers]);

  // Warn on tab close / refresh during an active quiz.
  useEffect(() => {
    if (flowState !== 'quiz') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flowState]);

  // Persist the active session on every change so it survives refresh/navigation (UX-01).
  useEffect(() => {
    if (flowState === 'quiz' && session && !session.completed) {
      saveActiveSession(session);
    }
  }, [session, flowState]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearQuizTimers();
  }, [clearQuizTimers]);

  const handleTimeout = useCallback(() => {
    const currentSession = sessionRef.current;
    if (!currentSession || isCurrentSubmitted(currentSession)) return;

    const question = currentSession.questions[currentSession.currentIndex];
    trackTimerExpired(question.id, currentSession.config.timerDuration);

    const timeSpentMs = currentSession.config.timerDuration * 1000;
    const updated = submitAnswer(currentSession, -1, timeSpentMs, 0);
    setSession(updated);
    setFeedbackAnnouncement('Time expired. The correct answer is now shown.');
  }, []);

  // Reset the response-time stopwatch whenever we land on a fresh question.
  useEffect(() => {
    if (flowState !== 'quiz') return;
    startTimeRef.current = Date.now();
    setPending(null);
  }, [flowState, session?.currentIndex]);

  // Sync the bookmark indicator to the current question (GAM-05).
  useEffect(() => {
    if (flowState !== 'quiz' || !session) return;
    setCurrentBookmarked(isBookmarked(session.questions[session.currentIndex].id));
  }, [flowState, session]);

  // Timer engine: runs only in timed mode, and only while the current question is unsubmitted.
  const submittedNow = session ? isCurrentSubmitted(session) : false;
  useEffect(() => {
    if (flowState !== 'quiz' || !session) return;
    if (!session.config.timerEnabled) return;
    if (isCurrentSubmitted(session)) return;

    setTimeLeft(session.config.timerDuration);
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = id;

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowState, session?.currentIndex, submittedNow, session?.config.timerEnabled]);

  // Keyboard shortcuts: 1-4 select, Enter submit/advance, F flag.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flowState !== 'quiz' || !session) return;
      const submitted = isCurrentSubmitted(session);
      const key = e.key;

      if (!submitted && ['1', '2', '3', '4'].includes(key)) {
        const optionIdx = parseInt(key, 10) - 1;
        if (optionIdx < session.questions[session.currentIndex].options.length) {
          setPending(optionIdx);
        }
      }

      if (key.toLowerCase() === 'f') {
        setSession((s) => (s ? toggleFlag(s) : s));
      }

      if (key === 'Enter') {
        e.preventDefault();
        if (submitted) {
          handleNextQuestion();
        } else if (pending !== null) {
          handleAnswerSubmit(pending);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowState, session, pending]);

  // ==================== Session lifecycle ====================

  const startQuizSession = async (configOverride?: QuizConfig) => {
    setFlowState('loading');

    const config: QuizConfig = configOverride || {
      skill: selectedSkill,
      questionCount,
      difficulty,
      timerDuration,
      timerEnabled,
    };

    saveLastPracticedSkill(config.skill);

    const allQuestions = await loadQuestionsForSkill(config.skill);
    const result = filterAndSelectQuestions(
      allQuestions,
      config.questionCount,
      config.difficulty,
      config.seed
    );

    if (result.questions.length === 0) {
      setNoQuestionsOpen(true);
      setFlowState('setup');
      return;
    }

    setDifficultyFallback(result.difficultyFallback);
    setReviewMode(false);
    setAwards(null);
    clearActiveSession();
    setResumable(null);

    const initialSession = createInitialSession(config, result.questions);
    setSession(initialSession);
    setPending(null);
    setFeedbackAnnouncement('');
    setFlowState('quiz');

    trackQuizStarted(config.skill, config.difficulty, config.questionCount, config.timerDuration);
    trackQuestionViewed(result.questions[0].id, config.skill, result.questions[0].difficulty, 1);
  };

  // Deterministic Daily Challenge drawn from a mix of ALL ready skills (UX-05).
  const startDailySession = async (timed: boolean, duration: 15 | 30 | 45 | 60) => {
    setFlowState('loading');

    const allQuestions = await loadQuestionsForSkills(SKILLS.map((s) => s.id as SkillCategory));
    const result = filterAndSelectQuestions(allQuestions, 10, 'mixed', getDailySeed());

    if (result.questions.length === 0) {
      setNoQuestionsOpen(true);
      setFlowState('setup');
      setResumable(getActiveSession());
      return;
    }

    // A mixed deck has no single skill; label the session by its first question's
    // category (per-question badges still reflect each question's own skill).
    const config: QuizConfig = {
      skill: result.questions[0].skill,
      questionCount: 10,
      difficulty: 'mixed',
      timerDuration: duration,
      timerEnabled: timed,
      seed: getDailySeed(),
    };

    setDifficultyFallback(false);
    setReviewMode(false);
    setAwards(null);
    clearActiveSession();
    setResumable(null);

    const initialSession = createInitialSession(config, result.questions);
    setSession(initialSession);
    setPending(null);
    setFeedbackAnnouncement('');
    setFlowState('quiz');

    trackQuizStarted(config.skill, 'mixed', result.questions.length, duration);
    trackQuestionViewed(result.questions[0].id, result.questions[0].skill, result.questions[0].difficulty, 1);
  };

  // Spaced-repetition review run over due missed questions (GAM-04).
  const startReviewSession = (timed: boolean, duration: 15 | 30 | 45 | 60) => {
    const due = getDueReviewQuestions();
    if (due.length === 0) {
      setNoQuestionsOpen(true);
      setFlowState('setup');
      setResumable(getActiveSession());
      return;
    }

    // Review decks are always mixed-difficulty and drawn from the pool itself.
    const config: QuizConfig = {
      skill: due[0].skill,
      questionCount: (due.length >= 20 ? 20 : due.length >= 10 ? 10 : 5) as 5 | 10 | 20,
      difficulty: 'mixed',
      timerDuration: duration,
      timerEnabled: timed,
    };

    setDifficultyFallback(false);
    setReviewMode(true);
    setAwards(null);
    clearActiveSession();
    setResumable(null);

    const initialSession = createInitialSession(config, due.slice(0, 20));
    setSession(initialSession);
    setPending(null);
    setFeedbackAnnouncement('');
    setFlowState('quiz');

    trackQuizStarted(config.skill, 'mixed', initialSession.questions.length, duration);
    trackQuestionViewed(due[0].id, due[0].skill, due[0].difficulty, 1);
  };

  const handleResume = () => {
    if (!resumable) return;
    setDifficultyFallback(false);
    setReviewMode(false);
    setAwards(null);
    setSession(resumable.session);
    setPending(null);
    setFeedbackAnnouncement('');
    setResumable(null);
    setFlowState('quiz');
  };

  const handleDiscardResume = () => {
    clearActiveSession();
    setResumable(null);
  };

  // ==================== In-quiz interactions ====================

  const handleOptionSelect = (optionIndex: number) => {
    if (!session || isCurrentSubmitted(session)) return;
    setPending(optionIndex);
  };

  const handleAnswerSubmit = (selectedIdx: number) => {
    if (!session || isCurrentSubmitted(session)) return;

    clearQuizTimers();
    const timeSpentMs = Date.now() - startTimeRef.current;
    const remainingSeconds = session.config.timerEnabled ? timeLeft : 0;

    const question = session.questions[session.currentIndex];
    const isCorrect = selectedIdx === question.correctAnswer;

    trackAnswerSubmitted(question.id, selectedIdx, timeSpentMs, isCorrect);
    setFeedbackAnnouncement(
      isCorrect ? 'Correct.' : `Incorrect. The correct answer is: ${question.options[question.correctAnswer]}.`
    );

    // In a review run, update the Leitner box for this question immediately (GAM-04).
    if (reviewMode) {
      recordReviewOutcome(question.id, isCorrect);
    }

    setSession(submitAnswer(session, selectedIdx, timeSpentMs, remainingSeconds));
  };

  const handleToggleBookmark = () => {
    if (!session) return;
    const q = session.questions[session.currentIndex];
    setCurrentBookmarked(toggleBookmark(q));
  };

  const goToQuestion = (index: number) => {
    if (!session) return;
    clearQuizTimers();
    setFeedbackAnnouncement('');
    setSession(goToIndex(session, index));
  };

  const handleSkip = () => {
    if (!session) return;
    const nextIndex = session.currentIndex + 1;
    trackQuestionViewedForIndex(session, nextIndex);
    goToQuestion(nextIndex);
  };

  const handlePrevious = () => {
    if (!session) return;
    goToQuestion(session.currentIndex - 1);
  };

  const handleFlag = () => {
    setSession((s) => (s ? toggleFlag(s) : s));
  };

  const trackQuestionViewedForIndex = (state: QuizSessionState, index: number) => {
    if (index >= 0 && index < state.questions.length && !isQuestionSubmitted(state, index)) {
      const q = state.questions[index];
      trackQuestionViewed(q.id, state.config.skill, q.difficulty, index + 1);
    }
  };

  const finalizeSession = useCallback((state: QuizSessionState) => {
    clearQuizTimers();
    const completed = finishSession(state);
    setSession(completed);
    setFlowState('results');

    const summary = calculateResultsSummary(completed);
    saveHistoryRecord(summary);

    // Capture per-question attempts → stats, XP, streak, badges (GAM-01/02/03).
    const attempts = extractAttempts(completed);
    setAwards(recordQuizCompletion(attempts));

    // Feed the spaced-repetition pool. In a normal quiz, missed questions are
    // added; correctly-answered ones already in the pool are promoted. In a
    // review run, each answer was already recorded on submit, so skip here.
    if (!reviewMode) {
      completed.questions.forEach((q, idx) => {
        if (completed.selectedAnswers[idx] !== q.correctAnswer) {
          addMissedQuestion(q);
        }
      });
    }

    clearActiveSession();
    trackQuizCompleted(
      completed.config.skill,
      summary.score,
      summary.accuracy,
      summary.avgTimeMs,
      summary.total
    );
  }, [clearQuizTimers, reviewMode]);

  const handleNextQuestion = () => {
    if (!session) return;
    clearQuizTimers();

    const isLast = session.currentIndex + 1 >= session.questions.length;
    if (isLast) {
      finalizeSession(session);
      return;
    }

    const nextIndex = session.currentIndex + 1;
    trackQuestionViewedForIndex(session, nextIndex);
    setSession(advanceToNext(session));
  };

  const requestFinish = () => {
    if (!session) return;
    if (answeredCount(session) < session.questions.length) {
      setFinishConfirmOpen(true);
    } else {
      finalizeSession(session);
    }
  };

  const restartQuiz = () => {
    if (!session) return;
    startQuizSession(session.config);
  };

  // ==================== RENDERS ====================

  // RENDER A: Setup View
  if (flowState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-mono text-3xl font-bold text-text-main mb-2">Quiz Configurations</h1>
        <p className="text-sm text-text-sec mb-8">
          Configure your preferred question volume, difficulty, and timer before launching the practice deck.
        </p>

        {resumable && (
          <Card className="mb-6 border-l-4 border-l-accent-base bg-surface-hover">
            <h3 className="text-base font-mono font-bold text-text-main mb-1">Resume your last session</h3>
            <p className="text-sm text-text-sec mb-4">
              You have an in-progress <span className="font-semibold text-text-main">{skillName(resumable.session.config.skill)}</span> quiz
              — {answeredCount(resumable.session)} of {resumable.session.questions.length} answered.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm" onClick={handleResume}>
                Resume Quiz
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDiscardResume}>
                Discard
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {/* Skill Selector */}
          <Card>
            <h3 className="text-base font-mono font-bold text-text-main mb-4">1. Choose a Skill Category</h3>
            <div className="space-y-3">
              {SKILLS.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill.id as SkillCategory)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                    selectedSkill === skill.id
                      ? 'bg-surface-hover border-accent-base ring-1 ring-accent-base'
                      : 'bg-surface-base border-border-base hover:bg-surface-hover hover:border-border-hover'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-text-main text-sm">{skill.name}</h4>
                    <p className="text-xs text-text-sec mt-1 max-w-lg">{skill.desc}</p>
                  </div>
                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                    selectedSkill === skill.id ? 'border-accent-base bg-accent-base' : 'border-border-hover'
                  }`}>
                    {selectedSkill === skill.id && (
                      <span className="h-2 w-2 rounded-full bg-white"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Volume, Timer, Difficulty Options */}
          <Card>
            <h3 className="text-base font-mono font-bold text-text-main mb-4">2. Tune Your Session</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Question Volume */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-sec mb-3">QUESTION COUNT</label>
              <div className="flex flex-col gap-2">
                {([5, 10, 20] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`py-2 px-3 text-xs font-mono font-medium rounded border text-center transition-colors cursor-pointer ${
                      questionCount === c
                        ? 'bg-accent-base text-white border-transparent'
                        : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                    }`}
                  >
                    {c} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-sec mb-3">DIFFICULTY</label>
              <div className="flex flex-col gap-2">
                {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 text-xs font-mono font-medium rounded border text-center transition-colors cursor-pointer ${
                      difficulty === d
                        ? 'bg-accent-base text-white border-transparent'
                        : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer mode + duration */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-sec mb-3">TIMER MODE</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setTimerEnabled(false)}
                  className={`py-2 px-3 text-xs font-mono font-medium rounded border text-center transition-colors cursor-pointer ${
                    !timerEnabled
                      ? 'bg-accent-base text-white border-transparent'
                      : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                  }`}
                >
                  Learn (Untimed)
                </button>
                {([15, 30, 45, 60] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTimerEnabled(true); setTimerDuration(t); }}
                    className={`py-2 px-3 text-xs font-mono font-medium rounded border text-center transition-colors cursor-pointer ${
                      timerEnabled && timerDuration === t
                        ? 'bg-accent-base text-white border-transparent'
                        : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                    }`}
                  >
                    {t}s Timed
                  </button>
                ))}
              </div>
            </div>
            </div>
          </Card>

          {/* CTA Trigger */}
          <Button variant="primary" size="lg" fullWidth onClick={() => startQuizSession()}>
            Start Quiz Session
          </Button>
        </div>

        <ConfirmDialog
          open={noQuestionsOpen}
          title="No questions available"
          description="No questions could be loaded for this configuration. Please try another skill or difficulty."
          confirmLabel="OK"
          cancelLabel="Close"
          onConfirm={() => setNoQuestionsOpen(false)}
          onCancel={() => setNoQuestionsOpen(false)}
        />
      </div>
    );
  }

  // RENDER B: Loading skeleton state
  if (flowState === 'loading') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-base mb-4"></div>
        <p className="font-mono text-sm text-text-sec">Assembling practice deck...</p>
      </div>
    );
  }

  // RENDER C: Active Quiz loop screen
  if (flowState === 'quiz' && session) {
    const question = session.questions[session.currentIndex];
    const total = session.questions.length;
    const progressPercent = (session.currentIndex / total) * 100;
    const submitted = isQuestionSubmitted(session, session.currentIndex);
    const selectedIdx = submitted ? session.selectedAnswers[session.currentIndex] : pending;
    const isFlagged = !!session.flagged[session.currentIndex];
    const isLast = session.currentIndex + 1 >= total;

    const timed = session.config.timerEnabled;
    const isWarningTime = timed && timeLeft <= 10;
    const timerLabel = !timed
      ? 'Learn mode'
      : timeLeft === 0
        ? 'Expired'
        : `Time Left: ${timeLeft}s`;

    const shortfall = session.config.questionCount - total;

    return (
      <div className="max-w-2xl mx-auto flex-1 flex flex-col justify-center">
        {/* Spaced-repetition review banner (GAM-04) */}
        {reviewMode && (
          <div className="mb-4 text-xs font-mono text-accent-base bg-info-bg/40 border border-info-base/40 rounded-md px-3 py-2">
            Review mode — questions you previously missed. Get them right to space them out; miss again and they come back sooner.
          </div>
        )}

        {/* Honest question-count / difficulty notice (UX-07) */}
        {(shortfall > 0 || difficultyFallback) && !reviewMode && (
          <div className="mb-4 text-xs font-mono text-warning-base bg-warning-bg/10 border border-warning-base/30 rounded-md px-3 py-2">
            {shortfall > 0 && (
              <span>
                Only {total} question{total === 1 ? '' : 's'} available for this configuration (you requested {session.config.questionCount}).{' '}
              </span>
            )}
            {difficultyFallback && <span>Not enough at the chosen difficulty — showing all difficulty levels.</span>}
          </div>
        )}

        {/* Progress header bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-text-sec mb-2">
            <span>QUESTION {session.currentIndex + 1} OF {total} · {answeredCount(session)} ANSWERED</span>
            <span
              role="status"
              aria-live={timed ? 'assertive' : 'off'}
              className={`font-bold transition-colors ${isWarningTime ? 'text-error-base animate-pulse' : 'text-text-main'}`}
            >
              {timerLabel}
            </span>
          </div>
          {/* Progress bar line */}
          <div className="h-1.5 w-full bg-surface-base border border-border-base rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-base transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* The Question prompt */}
        <Card className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Badge variant="accent">{skillName(question.skill)}</Badge>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleBookmark}
                aria-pressed={currentBookmarked}
                title="Save this question for later review"
                className={`text-xs font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                  currentBookmarked
                    ? 'bg-accent-base/15 border-accent-base text-accent-base'
                    : 'bg-surface-base border-border-base text-text-mute hover:bg-surface-hover'
                }`}
              >
                {currentBookmarked ? '★ Saved' : '☆ Save'}
              </button>
              <button
                type="button"
                onClick={handleFlag}
                aria-pressed={isFlagged}
                className={`text-xs font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                  isFlagged
                    ? 'bg-warning-bg/20 border-warning-base text-warning-base'
                    : 'bg-surface-base border-border-base text-text-mute hover:bg-surface-hover'
                }`}
              >
                {isFlagged ? '🚩 Flagged' : '⚑ Flag (F)'}
              </button>
              <Badge variant={question.difficulty === 'hard' ? 'error' : question.difficulty === 'medium' ? 'warning' : 'success'}>
                {question.difficulty.toUpperCase()}
              </Badge>
            </div>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-text-main leading-relaxed">
            {question.question}
          </h2>
        </Card>

        {/* Multiple choice options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = idx === question.correctAnswer;

            let btnStyle = 'bg-surface-base border-border-base text-text-main hover:bg-surface-hover';
            let checkIcon = null;

            if (submitted) {
              if (isCorrect) {
                btnStyle = 'bg-success-bg border-success-base text-success-base font-bold';
                checkIcon = (
                  <svg className="h-4.5 w-4.5 text-success-base" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                );
              } else if (isSelected) {
                btnStyle = 'bg-error-bg border-error-base text-error-base line-through';
                checkIcon = (
                  <svg className="h-4.5 w-4.5 text-error-base" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                );
              } else {
                btnStyle = 'bg-surface-base border-border-base text-text-mute opacity-50';
              }
            } else if (isSelected) {
              btnStyle = 'bg-surface-hover border-accent-base ring-1 ring-accent-base text-text-main font-semibold';
            }

            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-4 rounded-md border text-sm transition-all flex items-center justify-between gap-4 cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-text-mute px-1.5 py-0.5 rounded border border-border-base bg-surface-base">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>
                {checkIcon}
              </button>
            );
          })}
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={session.currentIndex === 0}
          >
            Previous
          </Button>

          {!submitted ? (
            <>
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={pending === null}
                onClick={() => pending !== null && handleAnswerSubmit(pending)}
              >
                Submit Answer (Enter)
              </Button>
            </>
          ) : (
            <Button variant="secondary" fullWidth onClick={handleNextQuestion}>
              {isLast ? 'View Results' : 'Next Question'}
            </Button>
          )}
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={requestFinish}
            className="text-xs font-mono text-text-mute hover:text-text-sec underline cursor-pointer"
          >
            Finish now
          </button>
        </div>

        {/* Screen-reader-only feedback announcer (UX-08) */}
        <p className="sr-only" role="status" aria-live="assertive">{feedbackAnnouncement}</p>

        {/* Feedback Panel (Explanation, Reference, Example) */}
        {submitted && (
          <Card className={`mt-8 border-t-4 transition-all animate-fadeIn ${
            selectedIdx === question.correctAnswer
              ? 'border-t-success-base bg-success-bg/5'
              : 'border-t-error-base bg-error-bg/5'
          }`}>
            <h3 className="font-mono text-sm font-bold text-text-main mb-3 flex items-center gap-2">
              {selectedIdx === question.correctAnswer ? (
                <span className="text-success-base">✓ Correct Response</span>
              ) : selectedIdx === -1 ? (
                <span className="text-error-base">✗ Time Expired</span>
              ) : (
                <span className="text-error-base">✗ Incorrect Response</span>
              )}
            </h3>

            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h4 className="text-xs font-mono font-bold text-text-sec mb-1">EXPLANATION</h4>
                <p className="text-text-main">{question.explanation}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold text-text-sec mb-1">REAL-WORLD APPLICATION</h4>
                <p className="text-text-sec italic font-sans">&quot;{question.realWorldExample}&quot;</p>
              </div>

              <div className="pt-2 border-t border-border-base/50 flex items-center justify-between gap-4 flex-wrap text-xs">
                <span className="font-mono text-text-mute">SOURCE REFERENCE:</span>
                <a
                  href={question.reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-accent-base hover:underline flex items-center gap-1"
                >
                  {question.reference.title}
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
        )}

        <ConfirmDialog
          open={finishConfirmOpen}
          title="Finish quiz now?"
          description={`You still have ${session.questions.length - answeredCount(session)} unanswered question(s). They will be marked as unanswered. Finish and view your results?`}
          confirmLabel="Finish Quiz"
          cancelLabel="Keep Going"
          onConfirm={() => { setFinishConfirmOpen(false); finalizeSession(session); }}
          onCancel={() => setFinishConfirmOpen(false)}
        />
      </div>
    );
  }

  // RENDER D: Results stats view
  if (flowState === 'results' && session) {
    const total = session.questions.length;
    const score = session.score;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    const responseTimes = Object.values(session.responseTimes);
    const avgTimeSec = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000).toFixed(1)
      : '0.0';

    // Build lists of wrong / unanswered questions for review.
    const incorrectQuestions: { q: Question; selectedIdx: number | undefined }[] = [];
    session.questions.forEach((q, idx) => {
      const selected = session.selectedAnswers[idx];
      if (selected !== q.correctAnswer) {
        incorrectQuestions.push({ q, selectedIdx: selected });
      }
    });

    const scoreCard: ScoreCardData = {
      skillName: skillName(session.config.skill),
      score,
      total,
      accuracy,
      avgTimeSec,
      streak: awards?.streak ?? 0,
    };

    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-mono text-3xl font-bold text-text-main mb-2 text-center">Quiz Completed</h1>
        <p className="text-sm text-text-sec mb-8 text-center">
          Nice job! Review your overall metrics and examine the explanation key below for incorrect attempts.
        </p>

        {/* Gamification awards (GAM-01/02) */}
        {awards && (
          <Card className="mb-8 bg-surface-base">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
              <div>
                <span className="block text-xs font-mono text-text-sec mb-1">XP EARNED</span>
                <span className="text-2xl font-extrabold text-accent-base">+{awards.xpEarned}</span>
              </div>
              <div>
                <span className="block text-xs font-mono text-text-sec mb-1">STREAK</span>
                <span className="text-2xl font-extrabold text-warning-base">🔥 {awards.streak}</span>
              </div>
              <div>
                <span className="block text-xs font-mono text-text-sec mb-1">LEVEL</span>
                <span className="text-2xl font-extrabold text-text-main">
                  {awards.level.level}
                  {awards.leveledUp && <span className="ml-1 text-sm text-success-base">↑</span>}
                </span>
              </div>
            </div>
            {awards.leveledUp && (
              <p className="mt-4 text-center font-mono text-sm text-success-base">
                Level up! You&apos;re now a {awards.level.title}.
              </p>
            )}
            {awards.newBadges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-base/50 text-center">
                <span className="block text-xs font-mono text-text-sec mb-2">NEW BADGE{awards.newBadges.length > 1 ? 'S' : ''}</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {awards.newBadges.map((id) => {
                    const def = getBadgeDef(id);
                    return def ? (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-base/40 bg-surface-hover font-mono text-xs">
                        <span aria-hidden="true">{def.icon}</span>
                        <span className="text-text-main">{def.name}</span>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Score metrics grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center bg-surface-base">
            <span className="block text-xs font-mono text-text-sec mb-2">FINAL SCORE</span>
            <span className="text-3xl font-extrabold text-text-main">{score} / {total}</span>
          </Card>

          <Card className="text-center bg-surface-base">
            <span className="block text-xs font-mono text-text-sec mb-2">ACCURACY</span>
            <Badge variant={accuracy >= 80 ? 'success' : accuracy >= 50 ? 'warning' : 'error'} className="text-base px-3 py-1 font-bold mt-1.5">
              {accuracy}%
            </Badge>
          </Card>

          <Card className="text-center bg-surface-base">
            <span className="block text-xs font-mono text-text-sec mb-2">AVG RESPONSE</span>
            <span className="text-3xl font-extrabold text-text-main">{avgTimeSec}s</span>
          </Card>
        </div>

        {/* Action button rows */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button variant="primary" className="flex-1" onClick={restartQuiz}>
            Retry Quiz
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setFlowState('setup')}>
            Configure New Deck
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => router.push('/stats')}>
            View Stats
          </Button>
        </div>

        {/* Shareable score card (GAM-06) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => shareResults(scoreCard, SITE_URL)}
          >
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
              </svg>
              Flex on LinkedIn
            </span>
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => downloadScoreCard(scoreCard)}>
            ⬇ Download Score Card
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>
        <p className="text-center text-xs text-text-mute font-mono mb-12">
          On desktop this opens LinkedIn with a link back to SkillDrill — attach the downloaded card to your post. On mobile you can share the card image directly.
        </p>

        {/* Incorrect answers review section */}
        {incorrectQuestions.length > 0 && (
          <section>
            <h2 className="font-mono text-xl font-bold text-text-main mb-6 pb-2 border-b border-border-base">
              Review Incorrect Answers ({incorrectQuestions.length})
            </h2>

            <div className="space-y-6">
              {incorrectQuestions.map(({ q, selectedIdx }, index) => (
                <Card key={index} className="border-l-4 border-l-error-base bg-error-bg/5">
                  <div className="flex items-center justify-between gap-4 mb-3 text-xs font-mono">
                    <span className="text-text-mute font-bold">QUESTION {session.questions.indexOf(q) + 1}</span>
                    <Badge variant="error">{q.difficulty.toUpperCase()}</Badge>
                  </div>

                  <h4 className="font-bold text-text-main mb-4 leading-relaxed">{q.question}</h4>

                  <div className="space-y-2 mb-4 text-xs font-mono">
                    <div className="p-2.5 rounded bg-error-bg/25 border border-error-base/10 text-error-base flex items-start gap-2">
                      <span className="font-bold">YOUR SELECTION:</span>
                      <span>
                        {selectedIdx === undefined
                          ? 'Not answered'
                          : selectedIdx === -1
                            ? 'Time Expired'
                            : q.options[selectedIdx]}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-success-bg/20 border border-success-base/10 text-success-base flex items-start gap-2">
                      <span className="font-bold">CORRECT ANSWER:</span>
                      <span>{q.options[q.correctAnswer]}</span>
                    </div>
                  </div>

                  <div className="text-xs leading-relaxed mt-4 pt-4 border-t border-border-base/50">
                    <h5 className="font-mono font-bold text-text-sec mb-1">EXPLANATION:</h5>
                    <p className="text-text-main font-sans text-sm">{q.explanation}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return null;
}

export default function PracticeClient() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-base mb-4"></div>
        <p className="font-mono text-sm text-text-sec">Loading quiz tools...</p>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
