import type { Metadata } from 'next';
import DashboardPage from './DashboardPage';
import { getPublishedQuestionCounts } from '../services/questionBankServer';
import { READY_SKILLS, SITE_DESCRIPTION } from '../lib/siteConfig';

// Title intentionally omitted so the home page inherits the branded
// `title.default` from the root layout ("... | SkillDrill").
export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

export default function Page() {
  const questionCounts = getPublishedQuestionCounts(READY_SKILLS);

  return <DashboardPage questionCounts={questionCounts} />;
}
