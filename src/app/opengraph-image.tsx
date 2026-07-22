import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '../lib/siteConfig';

// Default branded share image used when a SkillDrill link is posted to
// LinkedIn / Slack / X. Statically generated at build time (no request-time
// APIs), so it works under `output: 'export'`.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Required under `output: 'export'` — generate this image at build time.
export const dynamic = 'force-static';

// Mirrors the app's GitHub-inspired dark palette.
const BG = '#0d1117';
const PANEL = '#161b22';
const BORDER = '#30363d';
const TEXT = '#e6edf3';
const SEC = '#8b949e';
const ACCENT = '#2f81f7';

export default function OpengraphImage() {
  const host = SITE_URL.replace(/^https?:\/\//, '');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG,
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            backgroundColor: PANEL,
            border: `2px solid ${BORDER}`,
            borderRadius: 24,
            padding: 64,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, color: TEXT }}>
              Skill
            </div>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, color: ACCENT }}>
              Drill
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 76,
                fontWeight: 800,
                color: TEXT,
                lineHeight: 1.1,
                letterSpacing: -1,
              }}
            >
              Sharpen your documentation skills.
            </div>
            <div style={{ display: 'flex', fontSize: 32, color: SEC, marginTop: 24 }}>
              Interview-ready quizzes on APIs, style guides, AI &amp; Docs-as-Code.
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', fontSize: 26, color: SEC }}>{host}</div>
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 700,
                color: ACCENT,
                border: `2px solid ${ACCENT}`,
                borderRadius: 999,
                padding: '10px 28px',
              }}
            >
              Practice free
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
