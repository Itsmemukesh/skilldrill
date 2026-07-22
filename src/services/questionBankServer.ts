import fs from 'fs';
import path from 'path';
import { Question, SkillCategory } from '../types';
import { READY_SKILLS } from '../lib/siteConfig';

function readSkillFile(skill: SkillCategory): Question[] {
  const filePath = path.join(process.cwd(), 'public', 'questions', `${skill}.json`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** All published multiple-choice questions for a single skill (build-time). */
export function getAllPublishedQuestions(skill: SkillCategory): Question[] {
  return readSkillFile(skill).filter(
    (question) => question.status === 'published' && question.type === 'multiple-choice'
  );
}

export function getPublishedQuestionCount(skill: SkillCategory): number {
  return getAllPublishedQuestions(skill).length;
}

export function getPublishedQuestionCounts(
  skills: SkillCategory[]
): Partial<Record<SkillCategory, number>> {
  return Object.fromEntries(
    skills.map((skill) => [skill, getPublishedQuestionCount(skill)])
  );
}

/** Every published question across all ready skills (build-time). */
export function getAllQuestions(): Question[] {
  return READY_SKILLS.flatMap((skill) => getAllPublishedQuestions(skill));
}

/** Look up a single published question by id, or null if not found (build-time). */
export function getPublishedQuestionById(id: string): Question | null {
  return getAllQuestions().find((question) => question.id === id) ?? null;
}
