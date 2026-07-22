import React from 'react';
import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/contact', label: 'Contact' },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border-base bg-surface-base py-6 transition-colors duration-150 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-4">

        {/* Legal / info links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-mono">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-sec hover:text-text-main transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-base/60 pt-4">
          {/* Brand Copyright */}
          <div className="flex items-center gap-2 text-xs text-text-mute font-mono">
            <span>&copy; {currentYear} SkillDrill.</span>
            <span>•</span>
            <span>Sharpen your documentation skills.</span>
          </div>

          {/* System Status Indicators (GitHub/Vercel inspired style) */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-success-base">
              <span className="h-2 w-2 rounded-full bg-success-base animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
            <span className="text-text-mute">v1.0.0 (MVP)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
