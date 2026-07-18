'use client';

import React, { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  getUserPreferences,
  saveLastPracticedSkill,
  saveHistoryRecord
} from '../../services/localStorageService';
import {
  loadQuestionsForSkill,
  filterAndSelectQuestions
} from '../../services/questionRepository';
import {
  createInitialSession,
  submitAnswer,
  advanceToNext,
  calculateResultsSummary
} from '../../services/quizSession';
import {
  trackQuizStarted,
  trackQuestionViewed,
  trackAnswerSubmitted,
  trackTimerExpired,
  trackQuizCompleted
} from '../../services/analyticsService';
import { SkillCategory, Difficulty, Question, QuizSessionState, QuizConfig } from '../../types';
import { useQuizNavigation } from '../../contexts/QuizNavigationContext';

const SKILLS = [
  { id: 'documentation-fundamentals', name: 'Documentation Fundamentals', desc: 'Active voice, sentence structure, clear steps, and readability principles.' },
  { id: 'api-documentation', name: 'API Documentation', desc: 'REST APIs, OpenAPI specification, authentication, schemas, and endpoint references.' },
  { id: 'docs-as-code', name: 'Docs-as-Code', desc: 'Markdown, static site generators, Git workflows, CI/CD pipelines, and frontmatter.' },
  { id: 'ai-for-technical-writers', name: 'AI for Technical Writers', desc: 'Prompt engineering, AI review guidelines, large language models, and content curation.' },
  { id: 'content-strategy', name: 'Content Strategy', desc: 'Information mapping, taxonomy, document architecture, navigation flows, and sitemaps.' },
  { id: 'professional-skills', name: 'Professional Skills', desc: 'Editing methods, stakeholder interviews, feedback collection, and review processes.' },
  { id: 'interview-preparation', name: 'Interview Preparation', desc: 'Common technical writing interview questions, portfolio reviews, and writing tests.' },
];

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

  // App flow state: 'setup' | 'loading' | 'quiz' | 'results'
  const [flowState, setFlowState] = useState<'setup' | 'loading' | 'quiz' | 'results'>('setup');
  
  // Session engine state
  const [session, setSession] = useState<QuizSessionState | null>(null);
  
  // Active Timer state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const sessionRef = useRef<QuizSessionState | null>(null);

  // Pre-load parameters from URL or user preferences
  useEffect(() => {
    const prefs = getUserPreferences();
    setQuestionCount(prefs.defaultQuestionCount);
    setDifficulty(prefs.defaultDifficulty);
    setTimerDuration(prefs.timerDuration);

    if (paramSkill && SKILLS.some(s => s.id === paramSkill)) {
      setSelectedSkill(paramSkill);
    }

    // Auto-launch modes
    if (paramMode === 'daily') {
      // Curated daily setup: mixed fundamentals, 10 questions, 30s
      startQuizSession({
        skill: 'documentation-fundamentals',
        questionCount: 10,
        difficulty: 'mixed',
        timerDuration: 30
      });
    } else if (paramMode === 'random') {
      // Pick random skill
      const randomIndex = Math.floor(Math.random() * SKILLS.length);
      startQuizSession({
        skill: SKILLS[randomIndex].id as SkillCategory,
        questionCount: 5,
        difficulty: 'mixed',
        timerDuration: 30
      });
    }
  }, [paramSkill, paramMode]);

  const clearQuizTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (flowState !== 'quiz') {
      setQuizActive(false);
      registerQuitHandler(null);
      return;
    }

    setQuizActive(true);
    registerQuitHandler(() => {
      clearQuizTimers();
      setSession(null);
      setFlowState('setup');
    });

    return () => {
      setQuizActive(false);
      registerQuitHandler(null);
    };
  }, [flowState, setQuizActive, registerQuitHandler, clearQuizTimers]);

  useEffect(() => {
    if (flowState !== 'quiz') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flowState]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearQuizTimers();
    };
  }, [clearQuizTimers]);

  // Keyboard navigation for options (keys 1-4, Enter to submit/advance)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flowState !== 'quiz' || !session) return;
      
      const key = e.key;
      
      // Numbers 1-4 select options
      if (!session.isSubmitted && ['1', '2', '3', '4'].includes(key)) {
        const optionIdx = parseInt(key) - 1;
        if (optionIdx < session.questions[session.currentIndex].options.length) {
          handleOptionSelect(optionIdx);
        }
      }

      // Enter key submits or advances
      if (key === 'Enter') {
        e.preventDefault();
        if (session.isSubmitted) {
          handleNextQuestion();
        } else {
          // If an answer is selected, submit it
          const selectedIdx = session.selectedAnswers[session.currentIndex];
          if (selectedIdx !== undefined) {
            handleAnswerSubmit(selectedIdx);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flowState, session]);

  // 1. Initializing and Starting Quiz
  const startQuizSession = async (configOverride?: QuizConfig) => {
    setFlowState('loading');
    
    const config: QuizConfig = configOverride || {
      skill: selectedSkill,
      questionCount,
      difficulty,
      timerDuration
    };

    saveLastPracticedSkill(config.skill);

    // Load static files
    const allQuestions = await loadQuestionsForSkill(config.skill);
    const selectedQuestions = filterAndSelectQuestions(allQuestions, config.questionCount, config.difficulty);
    
    if (selectedQuestions.length === 0) {
      alert("No questions could be loaded for this configuration. Please try another skill.");
      setFlowState('setup');
      return;
    }

    const initialSession = createInitialSession(config, selectedQuestions);
    setSession(initialSession);
    setFlowState('quiz');

    trackQuizStarted(config.skill, config.difficulty, config.questionCount, config.timerDuration);
    
    // Start first question timer
    initializeQuestionTimer(initialSession, 0);
  };

  const handleTimeout = useCallback(() => {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.isSubmitted) return;

    const question = currentSession.questions[currentSession.currentIndex];
    trackTimerExpired(question.id, currentSession.config.timerDuration);

    const timeSpentMs = currentSession.config.timerDuration * 1000;
    const updated = submitAnswer(currentSession, -1, timeSpentMs, 0);
    setSession(updated);
  }, []);

  // 2. Timer Mechanics
  const initializeQuestionTimer = useCallback((activeSession: QuizSessionState, index: number) => {
    clearQuizTimers();
    const duration = activeSession.config.timerDuration;
    setTimeLeft(duration);
    startTimeRef.current = Date.now();

    const question = activeSession.questions[index];
    trackQuestionViewed(question.id, activeSession.config.skill, question.difficulty, index + 1);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearQuizTimers, handleTimeout]);

  // 3. Submitting Answer
  const handleOptionSelect = (optionIndex: number) => {
    if (!session || session.isSubmitted) return;
    
    // Update local temporary selection state in session before submission
    setSession({
      ...session,
      selectedAnswers: {
        ...session.selectedAnswers,
        [session.currentIndex]: optionIndex
      }
    });
  };

  const handleAnswerSubmit = (selectedIdx: number) => {
    if (!session || session.isSubmitted) return;
    
    clearQuizTimers();
    const timeSpentMs = Date.now() - startTimeRef.current;
    const remainingSeconds = timeLeft;

    const question = session.questions[session.currentIndex];
    const isCorrect = selectedIdx === question.correctAnswer;

    trackAnswerSubmitted(question.id, selectedIdx, timeSpentMs, isCorrect);

    const updated = submitAnswer(session, selectedIdx, timeSpentMs, remainingSeconds);
    setSession(updated);
  };

  // 4. Advancing / Completing
  const handleNextQuestion = () => {
    if (!session) return;
    clearQuizTimers();

    const updated = advanceToNext(session);
    setSession(updated);

    if (updated.completed) {
      const summary = calculateResultsSummary(updated);
      saveHistoryRecord(summary);
      trackQuizCompleted(
        updated.config.skill,
        summary.score,
        summary.accuracy,
        summary.avgTimeMs,
        summary.total
      );
      setFlowState('results');
    } else {
      initializeQuestionTimer(updated, updated.currentIndex);
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
          Configure your preferred question volume, difficulty, and timer threshold before launching the practice deck.
        </p>

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
          <Card className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

            {/* Timer Durations */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-sec mb-3">TIMER PER QUESTION</label>
              <div className="flex flex-col gap-2">
                {([15, 30, 45, 60] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimerDuration(t)}
                    className={`py-2 px-3 text-xs font-mono font-medium rounded border text-center transition-colors cursor-pointer ${
                      timerDuration === t
                        ? 'bg-accent-base text-white border-transparent'
                        : 'bg-surface-base text-text-main border-border-base hover:bg-surface-hover'
                    }`}
                  >
                    {t} Seconds
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* CTA Trigger */}
          <Button variant="primary" size="lg" fullWidth onClick={() => startQuizSession()}>
            Start Quiz Session
          </Button>
        </div>
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
    const progressPercent = ((session.currentIndex) / session.questions.length) * 100;
    const selectedIdx = session.selectedAnswers[session.currentIndex];
    
    const isWarningTime = timeLeft <= 10;
    const timeFormatted = timeLeft === 0 ? 'Expired' : `${timeLeft}s`;

    return (
      <div className="max-w-2xl mx-auto flex-1 flex flex-col justify-center">
        {/* Progress header bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-text-sec mb-2">
            <span>QUESTION {session.currentIndex + 1} OF {session.questions.length}</span>
            <span className={`font-bold transition-colors ${isWarningTime ? 'text-error-base animate-pulse' : 'text-text-main'}`}>
              Time Left: {timeFormatted}
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
            <Badge variant="accent">{SKILLS.find(s => s.id === session.config.skill)?.name}</Badge>
            <Badge variant={question.difficulty === 'hard' ? 'error' : question.difficulty === 'medium' ? 'warning' : 'success'}>
              {question.difficulty.toUpperCase()}
            </Badge>
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

            if (session.isSubmitted) {
              if (isCorrect) {
                // Highlight correct answer in green
                btnStyle = 'bg-success-bg border-success-base text-success-base font-bold';
                checkIcon = (
                  <svg className="h-4.5 w-4.5 text-success-base" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                );
              } else if (isSelected) {
                // Highlight incorrect user selection in red
                btnStyle = 'bg-error-bg border-error-base text-error-base line-through';
                checkIcon = (
                  <svg className="h-4.5 w-4.5 text-error-base" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                );
              } else {
                // Mute rest of the options
                btnStyle = 'bg-surface-base border-border-base text-text-mute opacity-50';
              }
            } else if (isSelected) {
              // Active highlight style (before submit)
              btnStyle = 'bg-surface-hover border-accent-base ring-1 ring-accent-base text-text-main font-semibold';
            }

            return (
              <button
                key={idx}
                disabled={session.isSubmitted}
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
        <div className="flex items-center justify-between gap-4 h-12">
          {!session.isSubmitted ? (
            <Button
              variant="primary"
              fullWidth
              disabled={selectedIdx === undefined}
              onClick={() => handleAnswerSubmit(selectedIdx)}
            >
              Submit Answer (Enter)
            </Button>
          ) : (
            <Button variant="secondary" fullWidth onClick={handleNextQuestion}>
              {session.currentIndex + 1 >= session.questions.length ? 'View Results' : 'Next Question'}
            </Button>
          )}
        </div>

        {/* Feedback Panel (Explanation, Reference, Example) */}
        {session.isSubmitted && (
          <Card className={`mt-8 border-t-4 transition-all animate-fadeIn ${
            selectedIdx === question.correctAnswer
              ? 'border-t-success-base bg-success-bg/5'
              : 'border-t-error-base bg-error-bg/5'
          }`}>
            <h3 className="font-mono text-sm font-bold text-text-main mb-3 flex items-center gap-2">
              {selectedIdx === question.correctAnswer ? (
                <>
                  <span className="text-success-base">✓ Correct Response</span>
                </>
              ) : selectedIdx === -1 ? (
                <>
                  <span className="text-error-base">✗ Time Expired</span>
                </>
              ) : (
                <>
                  <span className="text-error-base">✗ Incorrect Response</span>
                </>
              )}
            </h3>
            
            <div className="space-y-4 text-sm leading-relaxed">
              {/* Explanation block */}
              <div>
                <h4 className="text-xs font-mono font-bold text-text-sec mb-1">EXPLANATION</h4>
                <p className="text-text-main">{question.explanation}</p>
              </div>

              {/* Real world example block */}
              <div>
                <h4 className="text-xs font-mono font-bold text-text-sec mb-1">REAL-WORLD APPLICATION</h4>
                <p className="text-text-sec italic font-sans">"{question.realWorldExample}"</p>
              </div>

              {/* Reference link block */}
              <div className="pt-2 border-t border-border-base/50 flex items-center justify-between gap-4 flex-wrap text-xs">
                <span className="font-mono text-text-mute">
                  SOURCE REFERENCE:
                </span>
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

    // Build lists of wrong questions for review
    const incorrectQuestions: { q: Question; selectedIdx: number }[] = [];
    session.questions.forEach((q, idx) => {
      const selected = session.selectedAnswers[idx];
      if (selected !== q.correctAnswer) {
        incorrectQuestions.push({ q, selectedIdx: selected });
      }
    });

    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-mono text-3xl font-bold text-text-main mb-2 text-center">Quiz Completed</h1>
        <p className="text-sm text-text-sec mb-10 text-center">
          Nice job! Review your overall metrics and examine the explanation key below for incorrect attempts.
        </p>

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
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Button variant="primary" className="flex-1" onClick={restartQuiz}>
            Retry Quiz
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setFlowState('setup')}>
            Configure New Deck
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>

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
                      <span>{selectedIdx === -1 ? 'Time Expired' : q.options[selectedIdx]}</span>
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

export default function PracticePage() {
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
