import { SITE_URL } from './siteConfig';

/**
 * Client-side score-card image generation (GAM-06).
 *
 * Static export can't render per-result OG images at build time, so we draw the
 * card in the browser with the Canvas 2D API (no external dependency) and let
 * the user download a PNG to attach to a LinkedIn/Slack post.
 */

export interface ScoreCardData {
  skillName: string;
  score: number;
  total: number;
  accuracy: number;
  avgTimeSec: string;
  streak: number;
}

// GitHub-inspired dark palette (mirrors the app's default theme).
const COLORS = {
  bg: '#0d1117',
  panel: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  sec: '#8b949e',
  accent: '#2f81f7',
  success: '#3fb950',
  warning: '#d29922',
  error: '#f85149',
};

function accuracyColor(accuracy: number): string {
  if (accuracy >= 80) return COLORS.success;
  if (accuracy >= 50) return COLORS.warning;
  return COLORS.error;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Render the score card to a canvas (2x scale for crisp output). */
export function renderScoreCard(data: ScoreCardData): HTMLCanvasElement {
  const W = 1200;
  const H = 630;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Outer panel
  ctx.fillStyle = COLORS.panel;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 40, W - 80, H - 80, 20);
  ctx.fill();
  ctx.stroke();

  const mono = "'JetBrains Mono', 'Courier New', monospace";
  const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // Brand
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 34px ${mono}`;
  ctx.fillText('Skill', 90, 130);
  const skillW = ctx.measureText('Skill').width;
  ctx.fillStyle = COLORS.accent;
  ctx.fillText('Drill', 90 + skillW, 130);

  // Streak pill (top-right)
  if (data.streak > 0) {
    const label = `🔥 ${data.streak}-day streak`;
    ctx.font = `bold 22px ${mono}`;
    const pillW = ctx.measureText(label).width + 40;
    ctx.fillStyle = COLORS.bg;
    ctx.strokeStyle = COLORS.warning;
    roundRect(ctx, W - 90 - pillW, 104, pillW, 40, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.warning;
    ctx.fillText(label, W - 70 - pillW, 131);
  }

  // Heading
  ctx.fillStyle = COLORS.sec;
  ctx.font = `20px ${mono}`;
  ctx.fillText('QUIZ COMPLETED', 90, 210);

  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 52px ${sans}`;
  ctx.fillText(data.skillName, 90, 270);

  // Big accuracy number
  ctx.fillStyle = accuracyColor(data.accuracy);
  ctx.font = `bold 150px ${sans}`;
  ctx.fillText(`${data.accuracy}%`, 90, 430);
  ctx.fillStyle = COLORS.sec;
  ctx.font = `24px ${mono}`;
  ctx.fillText('ACCURACY', 96, 470);

  // Right-side stat blocks
  const statX = 720;
  const drawStat = (label: string, value: string, y: number) => {
    ctx.fillStyle = COLORS.sec;
    ctx.font = `20px ${mono}`;
    ctx.fillText(label, statX, y);
    ctx.fillStyle = COLORS.text;
    ctx.font = `bold 56px ${sans}`;
    ctx.fillText(value, statX, y + 62);
  };
  drawStat('SCORE', `${data.score} / ${data.total}`, 260);
  drawStat('AVG RESPONSE', `${data.avgTimeSec}s`, 400);

  // Footer URL
  ctx.fillStyle = COLORS.sec;
  ctx.font = `22px ${mono}`;
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ''), 90, H - 70);

  return canvas;
}

function scoreCardFileName(data: ScoreCardData): string {
  return `skilldrill-${data.skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${data.accuracy}pct.png`;
}

/** Render the score card to a PNG Blob. */
function scoreCardBlob(data: ScoreCardData): Promise<Blob | null> {
  const canvas = renderScoreCard(data);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

/** Render and trigger a PNG download of the score card. */
export async function downloadScoreCard(data: ScoreCardData): Promise<void> {
  const blob = await scoreCardBlob(data);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = scoreCardFileName(data);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** A suggested LinkedIn post caption for a completed quiz. */
export function shareCaption(data: ScoreCardData): string {
  const streak = data.streak > 0 ? ` I'm on a ${data.streak}-day practice streak. 🔥` : '';
  return (
    `I scored ${data.accuracy}% (${data.score}/${data.total}) on a ${data.skillName} quiz on SkillDrill.${streak} ` +
    `Sharpening my technical-writing skills one drill at a time. Practice free:`
  );
}

/**
 * Result of a share attempt so the caller can give feedback:
 * - 'shared'    → native share sheet completed (image + caption sent)
 * - 'linkedin'  → opened LinkedIn's web share dialog (link + site preview)
 * - 'cancelled' → user dismissed the native share sheet
 */
export type ShareOutcome = 'shared' | 'linkedin' | 'cancelled';

/** URL that opens LinkedIn's share composer for a given page URL. */
export function linkedInShareUrl(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

/**
 * Share a quiz result (GAM-06). On devices that support sharing files via the
 * Web Share API (mostly mobile), this opens the native share sheet with the
 * score-card PNG + caption so the user can post straight into the LinkedIn app.
 * Everywhere else (most desktops) it falls back to LinkedIn's web share dialog,
 * which guarantees a clickable link back to SkillDrill + the site's OG preview.
 */
export async function shareResults(data: ScoreCardData, pageUrl: string): Promise<ShareOutcome> {
  const caption = shareCaption(data);

  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share && nav.canShare) {
    const blob = await scoreCardBlob(data);
    if (blob) {
      const file = new File([blob], scoreCardFileName(data), { type: 'image/png' });
      if (nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: 'My SkillDrill result', text: `${caption} ${pageUrl}` });
          return 'shared';
        } catch (err) {
          // AbortError = user dismissed the sheet; treat other errors as a fallback.
          if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
        }
      }
    }
  }

  // Desktop / unsupported: open LinkedIn's share dialog for the site URL.
  window.open(linkedInShareUrl(pageUrl), '_blank', 'noopener,noreferrer,width=600,height=640');
  return 'linkedin';
}
