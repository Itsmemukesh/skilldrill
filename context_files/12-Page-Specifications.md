# 12 - Page Specifications

# Purpose

Define every MVP screen in sufficient detail for designers, frontend
engineers, and AI UI generation tools (Google Stitch, v0, Figma AI).

------------------------------------------------------------------------

# Global Layout

All pages share:

-   Top Navigation
-   Centered content container (max-width: 1280px)
-   Responsive layout
-   Light/Dark theme support
-   Footer

Navigation

-   Logo
-   Dashboard
-   Practice
-   Daily Challenge
-   About
-   Theme Toggle

------------------------------------------------------------------------

# Page 1 --- Landing Page

## Objective

Convince visitors to begin practicing within 30 seconds.

## Layout

    Navigation

    Hero
     ├─ Headline
     ├─ Supporting Text
     ├─ Start Practicing CTA

    Trust Indicators
     ├─ Skills Covered
     ├─ Interview Focus
     ├─ AI-era Topics

    Why This Platform

    Footer

## Hero Copy

Headline: **Sharpen your documentation skills. Every day.**

Supporting text: Practice interview-ready questions, master modern
documentation skills, and stay current with AI, Docs-as-Code, APIs, and
evolving technologies.

Primary CTA: Start Practicing

## Analytics

-   page_view
-   start_practicing_clicked

------------------------------------------------------------------------

# Page 2 --- Daily Dashboard

## Objective

Provide one-click access to daily learning.

## Sections

-   Continue Practice
-   Daily Challenge
-   Quick Practice
-   Practice by Skill
-   Random Quiz
-   Recent Performance

## Component Hierarchy

AppShell ├─ HeroBanner ├─ DashboardGrid │ ├─ ContinuePracticeCard │ ├─
DailyChallengeCard │ ├─ QuickPracticeCard │ └─ RandomQuizCard ├─
SkillGrid └─ RecentPerformanceCard

## Empty State

No recent activity yet. Start your first quiz.

------------------------------------------------------------------------

# Page 3 --- Practice by Skill

## Objective

Allow users to choose a learning area.

## Layout

Search (future)

Skill Grid

Each Skill Card

-   Icon
-   Name
-   Description
-   Question Count
-   Estimated Time
-   Start

Future

-   Difficulty badges
-   Completion %

------------------------------------------------------------------------

# Page 4 --- Quiz Configuration

## Objective

Configure quiz preferences before starting.

## Controls

Question Count

-   5
-   10
-   20

Difficulty

-   Easy
-   Medium
-   Hard
-   Mixed

Timer

-   15
-   30
-   45
-   60 seconds

CTA

Start Quiz

------------------------------------------------------------------------

# Page 5 --- Quiz

## Objective

Deliver a distraction-free learning experience.

## Layout

Sticky Header

-   Progress
-   Question Counter
-   Countdown Timer
-   Theme Toggle

Question Card

Answer Options

Submit Button

Feedback Panel

## Question Rules

-   One answer only
-   Skip disabled
-   Timer required
-   Auto-advance after feedback

## Feedback Panel

Displays

-   Correct / Incorrect
-   Explanation
-   Reference
-   Real-world Example

------------------------------------------------------------------------

# Page 6 --- Results

## Objective

Summarize learning and encourage another practice session.

## Sections

Score Summary

Statistics

Incorrect Answers

Actions

-   Retry
-   Practice Another Skill
-   Dashboard

Future

-   Share Result
-   XP
-   Badges

------------------------------------------------------------------------

# Page 7 --- Settings

## Controls

Theme

Timer

About

Future

Reset Local Progress

------------------------------------------------------------------------

# Page 8 --- About

Mission

Vision

Roadmap

Technology Stack

Open Source

GitHub Repository (future)

------------------------------------------------------------------------

# Responsive Specifications

Desktop

-   Multi-column dashboard
-   3--4 skill cards per row

Tablet

-   Two-column cards

Mobile

-   Single-column
-   Sticky actions
-   Larger touch targets

------------------------------------------------------------------------

# Loading States

-   Skeleton cards
-   Skeleton question
-   Skeleton statistics

------------------------------------------------------------------------

# Empty States

Dashboard

"No recent practice yet."

Results

"No completed quizzes."

------------------------------------------------------------------------

# Error States

-   Question JSON unavailable
-   Invalid configuration
-   Loading failure

Each must include a recovery action.

------------------------------------------------------------------------

# Accessibility

Every page must:

-   Support keyboard navigation
-   Preserve focus order
-   Use semantic headings
-   Meet WCAG AA contrast
-   Support screen readers

------------------------------------------------------------------------

# SEO

Landing Page

Title: Technical Writing Practice Platform

Description: Sharpen your documentation skills with interview-ready
quizzes covering APIs, style guides, AI, Docs-as-Code, and more.

------------------------------------------------------------------------

# Google Stitch Guidance

Generate all screens using:

-   GitHub-inspired visual language
-   Clean whitespace
-   Thin borders
-   Minimal shadows
-   Monochrome UI with subtle blue accents
-   Inter font
-   Rounded corners (8px)
-   Responsive desktop and mobile layouts
-   Reusable components from the Component Library
-   Design Tokens as the single source of truth
