import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Card } from '../../components/common/Card';
import { SITE_NAME } from '../../lib/siteConfig';

export const metadata: Metadata = {
  title: 'Docs & User Guide',
  description: `How to use ${SITE_NAME}: practice modes, the daily challenge, streaks and XP, reviewing missed questions, bookmarks, stats, and sharing your results.`,
  alternates: { canonical: '/docs' },
};

// Small presentational helpers kept local to this page.
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-none h-5 w-5 rounded-full bg-accent-base text-white text-[11px] font-mono font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-sm text-text-sec leading-relaxed">{children}</span>
    </li>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-mono text-xl font-bold text-text-main mb-4 pb-2 border-b border-border-base">
        {title}
      </h2>
      {children}
    </section>
  );
}

const TOC = [
  { id: 'quick-start', label: 'Quick start' },
  { id: 'practice-modes', label: 'Practice modes' },
  { id: 'in-quiz', label: 'During a quiz' },
  { id: 'progress', label: 'Streaks, XP & badges' },
  { id: 'review', label: 'Review & bookmarks' },
  { id: 'stats', label: 'Stats dashboard' },
  { id: 'sharing', label: 'Sharing results' },
  { id: 'settings', label: 'Settings & data' },
  { id: 'faq', label: 'FAQ' },
];

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-mono text-3xl font-bold text-text-main mb-2 pb-2 border-b border-border-base">
        User Guide
      </h1>
      <p className="text-sm text-text-sec mb-8">
        Everything you need to get the most out of {SITE_NAME}. No account needed — all progress is
        saved in your browser.
      </p>

      {/* On-page contents */}
      <Card className="mb-10">
        <h2 className="text-xs font-mono font-bold text-text-sec mb-3 uppercase">On this page</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {TOC.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-accent-base hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-12">
        <Section id="quick-start" title="Quick start">
          <ol className="space-y-3">
            <Step n={1}>
              Go to <Link href="/practice" className="text-accent-base hover:underline">Practice</Link> and
              pick a skill category.
            </Step>
            <Step n={2}>Under <strong className="text-text-main">Tune Your Session</strong>, set question count, difficulty, and timer (Learn or Timed).</Step>
            <Step n={3}>Select <strong className="text-text-main">Start Quiz Session</strong>.</Step>
            <Step n={4}>Choose an answer, submit, and read the explanation. Repeat to the end.</Step>
            <Step n={5}>Review your score, then share or download your result card.</Step>
          </ol>
        </Section>

        <Section id="practice-modes" title="Practice modes">
          <ul className="space-y-3 text-sm text-text-sec">
            <li>
              <strong className="text-text-main">Skill practice</strong> — choose one category and
              tune count, difficulty, and timer yourself.
            </li>
            <li>
              <strong className="text-text-main">Daily Challenge</strong> — a fixed 10-question deck
              mixed from every category. It&apos;s the same for everyone each day, so it&apos;s a fair
              daily habit. Launch it from the Dashboard.
            </li>
            <li>
              <strong className="text-text-main">Random Quiz</strong> — a fast 5-question quiz from a
              random ready category. Launch it from the Dashboard.
            </li>
            <li>
              <strong className="text-text-main">Review mode</strong> — re-drills questions you
              previously missed (see <a href="#review" className="text-accent-base hover:underline">Review &amp; bookmarks</a>).
            </li>
          </ul>
        </Section>

        <Section id="in-quiz" title="During a quiz">
          <ul className="space-y-3 text-sm text-text-sec">
            <li><strong className="text-text-main">Answer</strong> — click an option (or press keys <span className="font-mono">1–4</span>) then <strong className="text-text-main">Submit</strong> (or press <span className="font-mono">Enter</span>).</li>
            <li><strong className="text-text-main">Navigate</strong> — use <strong className="text-text-main">Previous</strong> / <strong className="text-text-main">Skip</strong> to move around; answered questions are read-only.</li>
            <li><strong className="text-text-main">Flag</strong> (<span className="font-mono">⚑ / F</span>) — mark a question to revisit within the current quiz.</li>
            <li><strong className="text-text-main">Save</strong> (<span className="font-mono">☆</span>) — bookmark a question to keep after the quiz ends.</li>
            <li><strong className="text-text-main">Learn vs. Timed</strong> — Learn mode has no countdown; in Timed mode, a timeout counts as incorrect.</li>
            <li><strong className="text-text-main">Finish now</strong> — end early; unanswered questions are marked unanswered.</li>
            <li>Leave mid-quiz and your progress is saved — a <strong className="text-text-main">Resume</strong> card appears next time on the Practice page.</li>
          </ul>
        </Section>

        <Section id="progress" title="Streaks, XP & badges">
          <ul className="space-y-3 text-sm text-text-sec">
            <li><strong className="text-text-main">Streak</strong> 🔥 — practice on consecutive days to grow it. Miss a day and it resets. Shown in the header and on your stats.</li>
            <li><strong className="text-text-main">XP &amp; levels</strong> — earned per quiz from questions answered, correct answers, and accuracy. XP unlocks craft-themed levels.</li>
            <li><strong className="text-text-main">Badges</strong> — milestone awards for streaks, totals, and accuracy. New badges pop up on the results screen.</li>
          </ul>
        </Section>

        <Section id="review" title="Review & bookmarks">
          <ul className="space-y-3 text-sm text-text-sec">
            <li><strong className="text-text-main">Missed questions</strong> are captured automatically and resurfaced on a spaced schedule (get one right and it comes back later; miss it and it returns sooner).</li>
            <li>When questions are due, a <strong className="text-text-main">Review Missed</strong> prompt appears on the Dashboard and Stats page.</li>
            <li><strong className="text-text-main">Bookmarks</strong> (☆ Save in-quiz) are a separate, permanent list you can revisit anytime from the Stats page.</li>
          </ul>
        </Section>

        <Section id="stats" title="Stats dashboard">
          <p className="text-sm text-text-sec mb-3">
            The <Link href="/stats" className="text-accent-base hover:underline">Stats</Link> page collects your local progress:
          </p>
          <ul className="space-y-2 text-sm text-text-sec">
            <li>• Headline metrics: streak, level, overall accuracy, badges earned.</li>
            <li>• Per-skill accuracy and your weakest topics.</li>
            <li>• A contribution-style activity heatmap.</li>
            <li>• Your bookmarked questions and questions due for review.</li>
          </ul>
        </Section>

        <Section id="sharing" title="Sharing results">
          <ul className="space-y-3 text-sm text-text-sec">
            <li><strong className="text-text-main">Flex on LinkedIn</strong> — on the results screen, opens LinkedIn with a link back to {SITE_NAME}. On mobile you can share the score-card image directly.</li>
            <li><strong className="text-text-main">Download Score Card</strong> — saves a PNG summary of your result to attach to any post.</li>
          </ul>
        </Section>

        <Section id="settings" title="Settings & data">
          <ul className="space-y-3 text-sm text-text-sec">
            <li>Set your default theme, timer mode/duration, question count, and difficulty on the <Link href="/settings" className="text-accent-base hover:underline">Settings</Link> page.</li>
            <li>All data is stored locally in your browser — nothing is uploaded.</li>
            <li><strong className="text-text-main">Clear All Data</strong> wipes history, streak, XP, badges, review pool, and bookmarks. This can&apos;t be undone.</li>
          </ul>
        </Section>

        <Section id="faq" title="FAQ">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-text-main">Do I need an account?</p>
              <p className="text-text-sec">No. Everything runs in your browser with no sign-up.</p>
            </div>
            <div>
              <p className="font-semibold text-text-main">Will I lose my progress?</p>
              <p className="text-text-sec">Progress lives in this browser&apos;s local storage. Clearing your browser data, using a different device, or private browsing will not carry it over.</p>
            </div>
            <div>
              <p className="font-semibold text-text-main">Is it free?</p>
              <p className="text-text-sec">Yes, {SITE_NAME} is free to use.</p>
            </div>
            <div>
              <p className="font-semibold text-text-main">How do I report a wrong answer or bug?</p>
              <p className="text-text-sec">See the <Link href="/contact" className="text-accent-base hover:underline">Contact</Link> page.</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
