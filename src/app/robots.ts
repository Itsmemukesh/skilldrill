import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/siteConfig';

// Required for `output: 'export'` — render this route to a static file at build.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/settings',
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
