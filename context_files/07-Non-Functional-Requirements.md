# 07 - Non-Functional Requirements

# Purpose

This document defines the quality attributes, engineering standards, and
operational expectations for the Technical Writing Practice Platform.

------------------------------------------------------------------------

# NFR-001 Performance

**Priority:** Must

## Targets

  Metric                            Target
  --------------------------------- -----------
  Largest Contentful Paint (LCP)    \< 2.5 s
  First Contentful Paint (FCP)      \< 1.8 s
  Interaction to Next Paint (INP)   \< 200 ms
  Cumulative Layout Shift (CLS)     \< 0.10
  Lighthouse Performance            ≥ 95

## Notes

-   Static assets should be optimized.
-   Lazy-load non-critical resources.
-   Minimize JavaScript bundle size.

------------------------------------------------------------------------

# NFR-002 Availability

**Priority:** Must

-   Hosted on GitHub Pages.
-   Static-first architecture.
-   No backend dependency for MVP.
-   Site should remain usable if analytics fail.

------------------------------------------------------------------------

# NFR-003 Reliability

**Priority:** Must

-   Invalid question JSON must not crash the application.
-   Local Storage failures must fall back gracefully.
-   Missing explanations or references should display a friendly
    placeholder.

------------------------------------------------------------------------

# NFR-004 Accessibility

**Priority:** Must

Conform to WCAG 2.2 AA where practical.

Requirements:

-   Keyboard navigation
-   Logical focus order
-   Visible focus states
-   Semantic HTML
-   Screen reader labels
-   Sufficient color contrast
-   Touch targets ≥ 44×44 px

------------------------------------------------------------------------

# NFR-005 Responsiveness

**Priority:** Must

Supported breakpoints:

-   Mobile (≥ 360 px)
-   Tablet (≥ 768 px)
-   Laptop (≥ 1024 px)
-   Desktop (≥ 1440 px)

Layouts must adapt without horizontal scrolling.

------------------------------------------------------------------------

# NFR-006 Browser Support

**Priority:** Must

Support the latest two versions of:

-   Chrome
-   Edge
-   Firefox
-   Safari

Graceful degradation for unsupported browsers.

------------------------------------------------------------------------

# NFR-007 Security

**Priority:** Must

-   HTTPS only (GitHub Pages)
-   No secrets committed to the repository
-   Escape and sanitize rendered content
-   Avoid unsafe inline scripts where possible

------------------------------------------------------------------------

# NFR-008 Privacy

**Priority:** Must

-   No user accounts in MVP
-   No personally identifiable information stored
-   Local Storage used only for preferences and progress
-   Google Analytics 4 and Microsoft Clarity documented in the Privacy
    Policy

------------------------------------------------------------------------

# NFR-009 SEO

**Priority:** Should

Requirements:

-   Descriptive page titles
-   Meta descriptions
-   Open Graph tags
-   Structured headings
-   XML sitemap
-   robots.txt
-   Canonical URLs
-   Semantic HTML

------------------------------------------------------------------------

# NFR-010 Maintainability

**Priority:** Must

-   Modular component architecture
-   Centralized design tokens
-   JSON-driven content
-   Consistent naming conventions
-   Comprehensive documentation

------------------------------------------------------------------------

# NFR-011 Scalability

**Priority:** Should

Architecture should support:

-   Supabase integration
-   Authentication
-   Leaderboards
-   Streaks
-   Additional question types
-   AI-powered features

No major refactoring should be required.

------------------------------------------------------------------------

# NFR-012 Analytics & Observability

**Priority:** Must

Track:

-   Page views
-   Quiz events
-   Timer expirations
-   Completion rates
-   Skill popularity

Tools:

-   Google Analytics 4
-   Microsoft Clarity

Analytics failures must never impact usability.

------------------------------------------------------------------------

# NFR-013 Usability

**Priority:** Must

-   First quiz reachable within 60 seconds.
-   Minimal cognitive load.
-   Consistent navigation.
-   Immediate feedback after each answer.

------------------------------------------------------------------------

# NFR-014 Internationalization

**Priority:** Could

Prepare architecture for:

-   Multiple languages
-   Localized question banks
-   Region-specific content

------------------------------------------------------------------------

# Quality Gates

A release is production-ready only if:

-   All functional requirements pass.
-   Lighthouse scores meet targets.
-   No critical accessibility issues.
-   Mobile and desktop layouts verified.
-   Analytics events validated.
-   No console errors.
-   Broken links resolved.

------------------------------------------------------------------------

# Definition of Quality

The platform should feel:

-   Fast
-   Professional
-   Trustworthy
-   Minimal
-   Developer-oriented
-   Easy to extend
