import DashboardPage from './DashboardPage';
import { getPublishedQuestionCounts } from '../services/questionBankServer';
import { SkillCategory } from '../types';

const READY_SKILLS: SkillCategory[] = [
  'documentation-fundamentals',
  'api-documentation',
  'docs-as-code',
  'ai-for-technical-writers',
  'content-strategy',
  'professional-skills',
  'interview-preparation',
];

export default function Page() {
  const questionCounts = getPublishedQuestionCounts(READY_SKILLS);

  return <DashboardPage questionCounts={questionCounts} />;
}
