import { SkillCategory } from '../types';

/**
 * Central site configuration and skill metadata.
 *
 * `SITE_URL` is the full public origin INCLUDING the GitHub Pages subpath
 * (e.g. https://itsmemukesh.github.io/skilldrill). All SEO URLs (canonical,
 * Open Graph, sitemap, robots) are built as ABSOLUTE strings from this value
 * via `absoluteUrl()` so we never rely on relative metadataBase resolution
 * (which can double the basePath under static export).
 */
const DEFAULT_SITE_URL = 'https://itsmemukesh.github.io/skilldrill';

/**
 * Falls back to the default when the env var is missing OR blank. CI injects an
 * empty string for an undefined repository variable, and `??` would not catch
 * that — leaving `new URL('')` to throw ERR_INVALID_URL during static export.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL
).replace(/\/$/, '');

export const SITE_NAME = 'SkillDrill';

export const SITE_TAGLINE = 'Technical Writing Practice Platform';

export const SITE_DESCRIPTION =
  'Sharpen your documentation skills with interview-ready quizzes covering APIs, style guides, AI, Docs-as-Code, and more.';

/** GitHub handle + repo used for contact and source links. */
export const GITHUB_USER = 'Itsmemukesh';
export const GITHUB_REPO = 'skilldrill';
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USER}`;
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`;
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;

/** Date the legal pages were last reviewed (shown as "Last updated"). */
export const LEGAL_LAST_UPDATED = 'July 22, 2026';

/** Build an absolute URL for a path within the site (path should start with "/"). */
export function absoluteUrl(path = ''): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface SkillMeta {
  id: SkillCategory;
  name: string;
  desc: string;
  ready: boolean;
}

/**
 * Single source of truth for skill categories. Previously duplicated across
 * DashboardPage.tsx and practice/page.tsx. `ready: false` = "Coming Soon".
 */
export const SKILLS: SkillMeta[] = [
  {
    id: 'documentation-fundamentals',
    name: 'Documentation Fundamentals',
    desc: 'Active voice, sentence structure, clear steps, and readability principles.',
    ready: true,
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    desc: 'REST APIs, OpenAPI specification, authentication, schemas, and endpoint references.',
    ready: true,
  },
  {
    id: 'style-guides',
    name: 'Style Guides',
    desc: 'Google Developer Style Guide, Microsoft Writing Guide, and corporate tone.',
    ready: false,
  },
  {
    id: 'docs-as-code',
    name: 'Docs-as-Code',
    desc: 'Markdown, static site generators, Git workflows, CI/CD pipelines, and frontmatter.',
    ready: true,
  },
  {
    id: 'ai-for-technical-writers',
    name: 'AI for Technical Writers',
    desc: 'Prompt engineering, AI review guidelines, large language models, and content curation.',
    ready: true,
  },
  {
    id: 'content-strategy',
    name: 'Content Strategy',
    desc: 'Information mapping, taxonomy, document architecture, navigation flows, and sitemaps.',
    ready: true,
  },
  {
    id: 'professional-skills',
    name: 'Professional Skills',
    desc: 'Editing methods, stakeholder interviews, feedback collection, and review processes.',
    ready: true,
  },
  {
    id: 'interview-preparation',
    name: 'Interview Preparation',
    desc: 'Common technical writing interview questions, portfolio reviews, and writing tests.',
    ready: true,
  },
];

/** Slugs of skills that have a published question bank (used for static generation). */
export const READY_SKILLS: SkillCategory[] = SKILLS.filter((s) => s.ready).map((s) => s.id);

export function getSkillMeta(id: SkillCategory): SkillMeta | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getSkillName(id: SkillCategory): string {
  return getSkillMeta(id)?.name ?? id;
}
