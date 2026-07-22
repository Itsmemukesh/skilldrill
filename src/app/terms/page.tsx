import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { LegalPage, LegalSection } from '../../components/common/LegalPage';
import { SITE_NAME, SITE_URL } from '../../lib/siteConfig';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `The terms of use for ${SITE_NAME} — acceptable use, intellectual property, and disclaimers.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p className="text-sm text-text-sec leading-relaxed">
        By using {SITE_NAME} ({SITE_URL}), you agree to these terms. If you do not agree, please do
        not use the site.
      </p>

      <LegalSection title="Use of the service">
        <ul className="list-disc pl-5 space-y-1">
          <li>{SITE_NAME} is provided free of charge for personal, educational practice.</li>
          <li>You agree not to misuse the site, disrupt its operation, or attempt to access it in unauthorized ways.</li>
          <li>No account is required; your progress is stored locally in your browser.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <ul className="list-disc pl-5 space-y-1">
          <li>Site content, branding, and question sets are the property of {SITE_NAME} unless otherwise noted.</li>
          <li>You may use the content for your own learning, but not republish or resell it without permission.</li>
          <li>Third-party references linked from questions belong to their respective owners.</li>
        </ul>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>The site and its content are provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the content is complete, accurate, or error-free. See the <Link href="/disclaimer" className="text-accent-base hover:underline">Disclaimer</Link>.</p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>To the fullest extent permitted by law, {SITE_NAME} is not liable for any damages arising from your use of, or inability to use, the site.</p>
      </LegalSection>

      <LegalSection title="Third-party links & ads">
        <p>The site may contain links to third-party websites and display third-party advertising. We are not responsible for the content, policies, or practices of those third parties.</p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>We may update these terms at any time. Continued use after changes constitutes acceptance of the revised terms.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Questions about these terms? See the <Link href="/contact" className="text-accent-base hover:underline">Contact</Link> page.</p>
      </LegalSection>
    </LegalPage>
  );
}
