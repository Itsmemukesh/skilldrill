import DashboardPage from './DashboardPage';
import { getPublishedQuestionCounts } from '../services/questionBankServer';
import { SkillCategory } from '../types';

const READY_SKILLS: SkillCategory[] = [
  'documentation-fundamentals',
  'api-documentation',
];

export default function Page() {
  const questionCounts = getPublishedQuestionCounts(READY_SKILLS);

  return <DashboardPage questionCounts={questionCounts} />;
}
