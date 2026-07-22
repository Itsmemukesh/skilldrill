import type { MetadataRoute } from 'next';
import { READY_SKILLS, absoluteUrl } from '../lib/siteConfig';
import { getAllQuestions } from '../services/questionBankServer';

// Required for `output: 'export'` — render this route to a static file at build.
export const dynamic = 'force-static';

/**
 * Static sitemap generated at build time. All URLs are absolute (built from
 * SITE_URL, which already includes the GitHub Pages subpath), so we do not rely
 * on metadataBase/basePath resolution here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/practice'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/docs'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/disclaimer'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const skillRoutes: MetadataRoute.Sitemap = READY_SKILLS.map((skill) => ({
    url: absoluteUrl(`/skills/${skill}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const questionRoutes: MetadataRoute.Sitemap = getAllQuestions().map((q) => ({
    url: absoluteUrl(`/questions/${q.id}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...skillRoutes, ...questionRoutes];
}
