import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '../lib/siteConfig';

// basePath (e.g. "/skilldrill" on GitHub Pages) is not auto-prefixed onto
// string URLs inside the manifest body, so we prepend it explicitly.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Required for `output: 'export'` — render this route to a static file at build.
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#0d1117',
    theme_color: '#0d1117',
    icons: [
      {
        src: `${BASE_PATH}/icon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
