import fs from 'fs';
import path from 'path';
import { Question, SkillCategory } from '../types';

export function getPublishedQuestionCount(skill: SkillCategory): number {
  const filePath = path.join(process.cwd(), 'public', 'questions', `${skill}.json`);

  if (!fs.existsSync(filePath)) {
    return 0;
  }

  const questions: Question[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return questions.filter(
    (question) => question.status === 'published' && question.type === 'multiple-choice'
  ).length;
}

export function getPublishedQuestionCounts(
  skills: SkillCategory[]
): Partial<Record<SkillCategory, number>> {
  return Object.fromEntries(
    skills.map((skill) => [skill, getPublishedQuestionCount(skill)])
  );
}
