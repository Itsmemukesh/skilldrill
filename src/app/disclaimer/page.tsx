import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { LegalPage, LegalSection } from '../../components/common/LegalPage';
import { SITE_NAME } from '../../lib/siteConfig';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `Educational-use and content-accuracy disclaimer for ${SITE_NAME}.`,
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <LegalSection title="Educational purpose">
        <p>{SITE_NAME} is a practice and learning tool for technical writers. Its content is provided for general educational purposes only and does not constitute professional, legal, or career advice.</p>
      </LegalSection>

      <LegalSection title="Accuracy of content">
        <ul className="list-disc pl-5 space-y-1">
          <li>Questions, answers, and explanations are prepared with care but may contain errors or become outdated as tools and standards evolve.</li>
          <li>Always verify important information against the official source references linked in each question.</li>
          <li>Passing quizzes here does not guarantee any particular outcome in interviews or employment.</li>
        </ul>
      </LegalSection>

      <LegalSection title="External links">
        <p>The site links to third-party resources (such as style guides and documentation). We do not control and are not responsible for their content or availability.</p>
      </LegalSection>

      <LegalSection title="Found an issue?">
        <p>If you spot an inaccurate question or explanation, please let us know via the <Link href="/contact" className="text-accent-base hover:underline">Contact</Link> page so we can fix it.</p>
      </LegalSection>
    </LegalPage>
  );
}
