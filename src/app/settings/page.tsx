import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure your SkillDrill preferences: appearance theme, default question timer, quiz length, difficulty, and local data management.',
  alternates: { canonical: '/settings' },
  robots: { index: false, follow: true },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
