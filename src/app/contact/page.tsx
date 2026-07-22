import type { Metadata } from 'next';
import React from 'react';
import { Card } from '../../components/common/Card';
import {
  SITE_NAME,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
  GITHUB_ISSUES_URL,
} from '../../lib/siteConfig';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${SITE_NAME} team — report a bug, suggest a question, or ask a question.`,
  alternates: { canonical: '/contact' },
};

const CHANNELS = [
  {
    label: 'Report a bug or wrong answer',
    desc: 'Open an issue on GitHub with the details.',
    href: GITHUB_ISSUES_URL,
    cta: 'Open an issue →',
  },
  {
    label: 'Suggest a feature or question',
    desc: 'Start a discussion or issue on the project repository.',
    href: GITHUB_REPO_URL,
    cta: 'View the repository →',
  },
  {
    label: 'General enquiries',
    desc: 'Reach out via the maintainer’s GitHub profile.',
    href: GITHUB_PROFILE_URL,
    cta: 'GitHub profile →',
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-mono text-3xl font-bold text-text-main mb-2 pb-2 border-b border-border-base">
        Contact
      </h1>
      <p className="text-sm text-text-sec mb-8">
        {SITE_NAME} is an open project. The fastest way to reach us is through GitHub.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CHANNELS.map((c) => (
          <Card key={c.label} className="flex flex-col">
            <h2 className="text-base font-bold text-text-main mb-1">{c.label}</h2>
            <p className="text-sm text-text-sec mb-4 flex-1">{c.desc}</p>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-bold text-accent-base hover:underline"
            >
              {c.cta}
            </a>
          </Card>
        ))}
      </div>

      <p className="text-xs text-text-mute mt-8 leading-relaxed">
        We read every report but can&apos;t guarantee a response time. For accuracy issues, please
        include the question ID or a link to the question page.
      </p>
    </div>
  );
}
