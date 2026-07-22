import type { Metadata } from 'next';
import PracticeClient from './PracticeClient';

export const metadata: Metadata = {
  title: 'Practice',
  description: 'Configure and take timed technical writing quizzes across documentation fundamentals, API docs, Docs-as-Code, AI, content strategy, and interview preparation.',
  alternates: { canonical: '/practice' },
};

export default function PracticePage() {
  return <PracticeClient />;
}
