import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { LegalPage, LegalSection } from '../../components/common/LegalPage';
import { SITE_NAME, SITE_URL } from '../../lib/siteConfig';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} handles your data: local browser storage, analytics (Google Analytics, Microsoft Clarity), cookies, and advertising.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-sm text-text-sec leading-relaxed">
        This policy explains what information {SITE_NAME} ({SITE_URL}) collects and how it is used.
        {' '}{SITE_NAME} is a free, account-free practice tool. We aim to collect as little as possible.
      </p>

      <LegalSection title="Information we store on your device">
        <ul className="list-disc pl-5 space-y-1">
          <li>Quiz history, scores, streaks, XP, badges, bookmarks, and review data are saved in your browser&apos;s <strong className="text-text-main">local storage</strong>.</li>
          <li>This data stays on your device. We do not upload it, and we cannot see it.</li>
          <li>Clearing your browser data or using <Link href="/settings" className="text-accent-base hover:underline">Settings → Clear All Data</Link> removes it permanently.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Analytics">
        <p>We use privacy-respecting analytics to understand aggregate usage and improve the site:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-text-main">Google Analytics 4</strong> — collects anonymized usage data (pages viewed, general location, device/browser type). See Google&apos;s <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-base hover:underline">Privacy Policy</a>.</li>
          <li><strong className="text-text-main">Microsoft Clarity</strong> — collects aggregated interaction metrics (e.g. clicks, scrolls) to improve usability. See the <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer" className="text-accent-base hover:underline">Microsoft Privacy Statement</a>.</li>
        </ul>
        <p>These services may set cookies or similar identifiers. We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection title="Cookies & advertising">
        <ul className="list-disc pl-5 space-y-1">
          <li>Cookies may be used by the analytics providers above and, if enabled in the future, by advertising partners.</li>
          <li>{SITE_NAME} may display ads served by <strong className="text-text-main">Google AdSense</strong>. Third-party vendors, including Google, use cookies to serve ads based on prior visits to this and other websites.</li>
          <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visits. You can opt out of personalized advertising via <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent-base hover:underline">Google Ads Settings</a>.</li>
          <li>You can also manage or block cookies through your browser settings.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children's privacy">
        <p>{SITE_NAME} is intended for a general, professional audience and is not directed at children under 13. We do not knowingly collect personal information from children.</p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>We may update this policy from time to time. Material changes will be reflected by the &quot;Last updated&quot; date above.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Questions about this policy? See the <Link href="/contact" className="text-accent-base hover:underline">Contact</Link> page.</p>
      </LegalSection>
    </LegalPage>
  );
}
