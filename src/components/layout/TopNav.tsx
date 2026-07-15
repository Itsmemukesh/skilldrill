'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../hooks/useTheme';
import { useQuizNavigation } from '../../contexts/QuizNavigationContext';

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isQuizActive, requestNavigation } = useQuizNavigation();

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/practice', label: 'Practice' },
    { href: '/about', label: 'About' },
    { href: '/settings', label: 'Settings' }
  ];

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isQuizActive) return;
    event.preventDefault();
    requestNavigation(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-base bg-bg-base/80 backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group" onClick={(e) => handleNavClick(e, '/')}>
            <svg className="h-6 w-6 text-accent-base transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
            </svg>
            <span className="font-mono text-lg font-bold tracking-tight text-text-main">
              Skill<span className="text-accent-base">Drill</span>
            </span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-text-main bg-surface-base border border-border-base'
                      : 'text-text-sec hover:text-text-main hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right actions: Theme toggle and mobile nav trigger */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border-base hover:bg-surface-hover text-text-sec hover:text-text-main transition-colors focus-visible:ring-2 focus-visible:ring-accent-base"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              // Moon Icon (light theme active -> toggle to dark)
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              // Sun Icon (dark theme active -> toggle to light)
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </button>

          {/* Simple Mobile Navigation Links (only visible on mobile) */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              href="/practice"
              onClick={(e) => handleNavClick(e, '/practice')}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-accent-base hover:bg-accent-hover text-white transition-colors"
            >
              Practice
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile nav bar indicator */}
      <div className="md:hidden flex border-t border-border-base bg-surface-base justify-around py-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`text-xs font-medium py-1 px-3 rounded ${
                isActive ? 'text-accent-base font-bold' : 'text-text-sec'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
export default TopNav;
