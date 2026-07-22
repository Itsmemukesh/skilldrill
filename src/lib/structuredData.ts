import { Question, SkillCategory } from '../types';
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  absoluteUrl,
  getSkillName,
} from './siteConfig';

/**
 * Builders for JSON-LD structured data (schema.org). Each returns a plain
 * object that is serialized into a <script type="application/ld+json"> tag,
 * server-rendered so search engines see it in the static HTML.
 */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl('/icon.svg'),
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function courseSchema(skill: SkillCategory, description: string, questionCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${getSkillName(skill)} — Technical Writing Practice`,
    description,
    url: absoluteUrl(`/skills/${skill}`),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    numberOfCredits: questionCount,
  };
}

/**
 * Quiz/Question schema for a single question page. Uses schema.org Question
 * with a suggestedAnswer (correct option) plus the alternative options.
 */
export function questionSchema(question: Question) {
  const correct = question.options[question.correctAnswer];
  const wrong = question.options.filter((_, idx) => idx !== question.correctAnswer);

  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    about: {
      '@type': 'Thing',
      name: getSkillName(question.skill),
    },
    url: absoluteUrl(`/questions/${question.id}`),
    hasPart: {
      '@type': 'Question',
      name: question.question,
      text: question.question,
      eduQuestionType: 'Multiple choice',
      acceptedAnswer: {
        '@type': 'Answer',
        text: correct,
        explanation: question.explanation,
      },
      suggestedAnswer: wrong.map((option) => ({
        '@type': 'Answer',
        text: option,
      })),
    },
  };
}
