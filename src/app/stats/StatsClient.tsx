'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  LevelBar,
  BadgeGrid,
  ContributionHeatmap,
} from '../../components/gamification/GamificationWidgets';
import {
  getGamificationState,
  getAttempts,
  displayStreak,
} from '../../services/gamificationService';
import { getBookmarks, getReviewPool, getDueReviewCount } from '../../services/reviewService';
import { levelFromXp } from '../../lib/levels';
import { BADGES } from '../../lib/badges';
import { getSkillName } from '../../lib/siteConfig';
import { GamificationState, AttemptedQuestion, BookmarkItem, SkillCategory } from '../../types';

const BADGE_TOTAL = BADGES.length;

interface SkillStat {
  skill: SkillCategory;
  attempted: number;
  correct: number;
  accuracy: number;
}

interface TagStat {
  tag: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export default function StatsClient() {
  const [state, setState] = useState<GamificationState | null>(null);
  const [attempts, setAttempts] = useState<AttemptedQuestion[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    setState(getGamificationState());
    setAttempts(getAttempts());
    setBookmarks(getBookmarks());
    setReviewCount(getReviewPool().length);
    setDueCount(getDueReviewCount());
  }, []);

  const skillStats = useMemo<SkillStat[]>(() => {
    const map = new Map<SkillCategory, { attempted: number; correct: number }>();
    for (const a of attempts) {
      const cur = map.get(a.skill) ?? { attempted: 0, correct: 0 };
      cur.attempted += 1;
      if (a.correct) cur.correct += 1;
      map.set(a.skill, cur);
    }
    return Array.from(map.entries())
      .map(([skill, v]) => ({
        skill,
        attempted: v.attempted,
        correct: v.correct,
        accuracy: v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0,
      }))
      .sort((a, b) => b.attempted - a.attempted);
  }, [attempts]);

  const weakestTags = useMemo<TagStat[]>(() => {
    const map = new Map<string, { attempted: number; correct: number }>();
    for (const a of attempts) {
      for (const tag of a.tags ?? []) {
        const cur = map.get(tag) ?? { attempted: 0, correct: 0 };
        cur.attempted += 1;
        if (a.correct) cur.correct += 1;
        map.set(tag, cur);
      }
    }
    return Array.from(map.entries())
      .map(([tag, v]) => ({
        tag,
        attempted: v.attempted,
        correct: v.correct,
        accuracy: v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0,
      }))
      .filter((t) => t.attempted >= 3) // enough signal to be meaningful
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 8);
  }, [attempts]);

  if (!state) {
    return (
      <div className="max-w-4xl mx-auto font-mono text-sm text-text-sec">Loading your stats...</div>
    );
  }

  const level = levelFromXp(state.xp);
  const streak = displayStreak(state);
  const overallAccuracy =
    state.totalQuestions > 0 ? Math.round((state.totalCorrect / state.totalQuestions) * 100) : 0;
  const badgeCount = Object.keys(state.badges).length;

  const hasData = state.totalQuizzes > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-mono text-3xl font-bold text-text-main mb-2">Your Stats</h1>
      <p className="text-sm text-text-sec mb-8">
        Progress, streaks, and mastery — stored locally in your browser.
      </p>

      {!hasData ? (
        <Card className="text-center py-12">
          <h4 className="text-lg font-mono font-bold text-text-main mb-2">No stats yet</h4>
          <p className="text-sm text-text-sec mb-6 max-w-sm mx-auto">
            Complete a quiz and your streak, XP, badges, and accuracy trends will appear here.
          </p>
          <Link href="/practice">
            <Button variant="primary">Take a Quiz</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Headline metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="text-center">
              <span className="block text-xs font-mono text-text-sec mb-2">STREAK</span>
              <span className="text-3xl font-extrabold text-warning-base">🔥 {streak}</span>
              <span className="block text-[11px] font-mono text-text-mute mt-1">
                Longest: {state.streak.longest}
              </span>
            </Card>
            <Card className="text-center">
              <span className="block text-xs font-mono text-text-sec mb-2">LEVEL</span>
              <span className="text-3xl font-extrabold text-text-main">{level.level}</span>
              <span className="block text-[11px] font-mono text-text-mute mt-1">{state.xp} XP</span>
            </Card>
            <Card className="text-center">
              <span className="block text-xs font-mono text-text-sec mb-2">ACCURACY</span>
              <Badge
                variant={overallAccuracy >= 80 ? 'success' : overallAccuracy >= 50 ? 'warning' : 'error'}
                className="text-base px-3 py-1 font-bold mt-1.5"
              >
                {overallAccuracy}%
              </Badge>
              <span className="block text-[11px] font-mono text-text-mute mt-2">
                {state.totalCorrect}/{state.totalQuestions} correct
              </span>
            </Card>
            <Card className="text-center">
              <span className="block text-xs font-mono text-text-sec mb-2">BADGES</span>
              <span className="text-3xl font-extrabold text-text-main">{badgeCount}</span>
              <span className="block text-[11px] font-mono text-text-mute mt-1">
                of {BADGE_TOTAL}
              </span>
            </Card>
          </div>

          {/* Level progress */}
          <Card>
            <h2 className="font-mono text-base font-bold text-text-main mb-4">Level Progress</h2>
            <LevelBar level={level} xp={state.xp} />
          </Card>

          {/* Review CTA */}
          {reviewCount > 0 && (
            <Card className="border-l-4 border-l-accent-base bg-surface-hover flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-mono text-base font-bold text-text-main mb-1">Review missed questions</h2>
                <p className="text-sm text-text-sec">
                  {dueCount > 0
                    ? `${dueCount} question${dueCount === 1 ? '' : 's'} due for review now`
                    : `${reviewCount} in your review pool — none due yet`}
                </p>
              </div>
              <Link href="/practice?mode=review">
                <Button variant="primary" disabled={dueCount === 0}>
                  {dueCount > 0 ? 'Start Review' : 'Nothing Due'}
                </Button>
              </Link>
            </Card>
          )}

          {/* Activity heatmap */}
          <Card>
            <h2 className="font-mono text-base font-bold text-text-main mb-4">Practice Activity</h2>
            <ContributionHeatmap activity={state.activity} />
          </Card>

          {/* Per-skill accuracy */}
          <Card>
            <h2 className="font-mono text-base font-bold text-text-main mb-4">Accuracy by Skill</h2>
            <div className="space-y-3">
              {skillStats.map((s) => (
                <div key={s.skill}>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-text-main font-semibold">{getSkillName(s.skill)}</span>
                    <span className="text-text-sec">
                      {s.correct}/{s.attempted} · {s.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-base border border-border-base rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        s.accuracy >= 80 ? 'bg-success-base' : s.accuracy >= 50 ? 'bg-warning-base' : 'bg-error-base'
                      }`}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weakest tags */}
          {weakestTags.length > 0 && (
            <Card>
              <h2 className="font-mono text-base font-bold text-text-main mb-2">Weakest Topics</h2>
              <p className="text-xs text-text-sec mb-4">
                Topics where your accuracy is lowest (min. 3 attempts). Good candidates for focused review.
              </p>
              <div className="flex flex-wrap gap-2">
                {weakestTags.map((t) => (
                  <span
                    key={t.tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-base bg-surface-base font-mono text-xs"
                    title={`${t.correct}/${t.attempted} correct`}
                  >
                    <span className="text-text-main">{t.tag}</span>
                    <span
                      className={
                        t.accuracy >= 80 ? 'text-success-base' : t.accuracy >= 50 ? 'text-warning-base' : 'text-error-base'
                      }
                    >
                      {t.accuracy}%
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Badges */}
          <Card>
            <h2 className="font-mono text-base font-bold text-text-main mb-4">Badges</h2>
            <BadgeGrid earned={state.badges} />
          </Card>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <Card>
              <h2 className="font-mono text-base font-bold text-text-main mb-4">
                Bookmarked Questions ({bookmarks.length})
              </h2>
              <div className="space-y-3">
                {bookmarks.slice(0, 20).map((b) => (
                  <Link
                    key={b.question.id}
                    href={`/questions/${b.question.id}`}
                    className="block p-3 rounded-md border border-border-base bg-surface-base hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <Badge variant="accent">{getSkillName(b.question.skill)}</Badge>
                      <span className="font-mono text-[11px] text-text-mute">{b.question.id}</span>
                    </div>
                    <p className="text-sm text-text-main line-clamp-2">{b.question.question}</p>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
