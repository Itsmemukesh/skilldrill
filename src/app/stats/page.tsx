import type { Metadata } from 'next';
import StatsClient from './StatsClient';

export const metadata: Metadata = {
  title: 'Your Stats',
  description: 'Track your SkillDrill progress: streak, level, badges, per-skill accuracy, weakest topics, and a practice activity heatmap.',
  alternates: { canonical: '/stats' },
  robots: { index: false, follow: true },
};

export default function StatsPage() {
  return <StatsClient />;
}
