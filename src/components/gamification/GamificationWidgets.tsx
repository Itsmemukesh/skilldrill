'use client';

import React from 'react';
import { GamificationState, LevelInfo } from '../../types';
import { BADGES } from '../../lib/badges';
import { localDayKey } from '../../services/gamificationService';

/** XP / level progress bar (GAM-02). */
export const LevelBar: React.FC<{ level: LevelInfo; xp: number }> = ({ level, xp }) => {
  const pct = level.isMax
    ? 100
    : Math.min(100, Math.round((level.xpIntoLevel / level.xpForNextLevel) * 100));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-bold text-text-main">
          Lv {level.level} · {level.title}
        </span>
        <span className="font-mono text-xs text-text-sec">{xp} XP</span>
      </div>
      <div className="h-2.5 w-full bg-surface-base border border-border-base rounded-full overflow-hidden">
        <div className="h-full bg-accent-base transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 font-mono text-xs text-text-mute">
        {level.isMax
          ? 'Max level reached — Documentation Sage.'
          : `${level.xpForNextLevel - level.xpIntoLevel} XP to level ${level.level + 1}`}
      </p>
    </div>
  );
};

/** Earned/locked badge grid (GAM-02). */
export const BadgeGrid: React.FC<{ earned: Record<string, string> }> = ({ earned }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {BADGES.map((badge) => {
        const isEarned = !!earned[badge.id];
        return (
          <div
            key={badge.id}
            title={badge.description}
            className={`flex flex-col items-center text-center p-3 rounded-lg border transition-colors ${
              isEarned
                ? 'bg-surface-base border-accent-base/40'
                : 'bg-surface-base border-border-base opacity-40 grayscale'
            }`}
          >
            <span className="text-2xl mb-1" aria-hidden="true">{badge.icon}</span>
            <span className="font-mono text-[11px] font-bold text-text-main leading-tight">{badge.name}</span>
            <span className="font-sans text-[10px] text-text-sec mt-1 leading-snug">{badge.description}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * GitHub-style contribution heatmap of the last ~26 weeks (GAM-07).
 * Renders columns of weeks, each column 7 day-cells, colored by intensity.
 */
export const ContributionHeatmap: React.FC<{ activity: Record<string, number> }> = ({ activity }) => {
  const WEEKS = 26;
  const today = new Date();
  // Start on the Sunday WEEKS*7 - (6 - todayDow) days back so the grid ends this week.
  const todayDow = today.getDay();
  const totalDays = WEEKS * 7;
  const start = new Date(today);
  start.setDate(today.getDate() - (totalDays - 1 - (6 - todayDow)));

  const cells: { key: string; count: number }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = localDayKey(d);
    cells.push({ key, count: activity[key] ?? 0 });
  }

  const intensity = (count: number): string => {
    if (count === 0) return 'bg-surface-base border border-border-base';
    if (count < 5) return 'bg-accent-base/30';
    if (count < 10) return 'bg-accent-base/55';
    if (count < 20) return 'bg-accent-base/80';
    return 'bg-accent-base';
  };

  // Group into week columns.
  const weeks: { key: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const todayKey = localDayKey(today);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.key}: ${cell.count} question${cell.count === 1 ? '' : 's'}`}
                className={`h-3 w-3 rounded-sm ${intensity(cell.count)} ${
                  cell.key === todayKey ? 'ring-1 ring-text-main' : ''
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] font-mono text-text-mute">
        <span>Less</span>
        <span className="h-3 w-3 rounded-sm bg-surface-base border border-border-base" />
        <span className="h-3 w-3 rounded-sm bg-accent-base/30" />
        <span className="h-3 w-3 rounded-sm bg-accent-base/55" />
        <span className="h-3 w-3 rounded-sm bg-accent-base/80" />
        <span className="h-3 w-3 rounded-sm bg-accent-base" />
        <span>More</span>
      </div>
    </div>
  );
};

/** Compact streak indicator used in nav / dashboard (GAM-01). */
export const StreakPill: React.FC<{ streak: number; className?: string }> = ({ streak, className = '' }) => {
  if (streak <= 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs font-bold text-warning-base ${className}`}
      title={`${streak}-day practice streak`}
    >
      🔥 {streak}
    </span>
  );
};

/** Full state helper for consumers that want everything derived at once. */
export type { GamificationState };
