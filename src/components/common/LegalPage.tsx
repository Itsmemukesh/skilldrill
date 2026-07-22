import React from 'react';
import { LEGAL_LAST_UPDATED } from '../../lib/siteConfig';

/**
 * Shared shell for legal / info pages (Privacy, Terms, Disclaimer). Keeps the
 * heading, "last updated" line, and prose styling consistent and minimal.
 */
export function LegalPage({
  title,
  children,
  showUpdated = true,
}: {
  title: string;
  children: React.ReactNode;
  showUpdated?: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-mono text-3xl font-bold text-text-main mb-2 pb-2 border-b border-border-base">
        {title}
      </h1>
      {showUpdated && (
        <p className="text-xs font-mono text-text-mute mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>
      )}
      <div className="space-y-8">{children}</div>
    </div>
  );
}

/** A titled block within a legal page. */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-lg font-bold text-text-main mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-text-sec leading-relaxed">{children}</div>
    </section>
  );
}
