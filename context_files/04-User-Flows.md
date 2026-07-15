# 04 - User Flows

# Purpose

This document defines the end-to-end user journeys for the MVP and
establishes extension points for future features.

------------------------------------------------------------------------

# Design Principles

-   Reach the first quiz in under 60 seconds.
-   Minimize clicks.
-   Always provide immediate feedback.
-   Maintain a distraction-free experience.
-   Optimize for daily repeat usage.

------------------------------------------------------------------------

# Primary Navigation

``` text
Landing
│
├── Dashboard
├── Practice
├── Daily Challenge
├── About
└── Settings
```

------------------------------------------------------------------------

# Flow 1 -- First-Time Visitor

## Goal

Help a new visitor complete their first quiz as quickly as possible.

### Steps

1.  User lands on the homepage.
2.  Reads the value proposition.
3.  Clicks **Start Practicing**.
4.  Arrives at the Dashboard.
5.  Chooses **Practice by Skill**.
6.  Selects a skill.
7.  Chooses:
    -   5 questions
    -   10 questions
    -   20 questions
8.  Chooses difficulty:
    -   Easy
    -   Medium
    -   Hard
    -   Mixed
9.  Starts the quiz.

### Success Criteria

-   First quiz starts within one minute.
-   No login required.
-   No unnecessary onboarding.

------------------------------------------------------------------------

# Flow 2 -- Dashboard

``` text
Homepage
      ↓
Daily Dashboard
      ↓
 ┌─────────────┬─────────────┬─────────────┐
 │Continue     │Daily        │Quick        │
 │Practice     │Challenge    │Practice     │
 └─────────────┴─────────────┴─────────────┘
             ↓
      Practice by Skill
```

Dashboard modules:

-   Continue Practice
-   Daily Challenge
-   Quick Practice
-   Practice by Skill
-   Random Quiz
-   Recent Performance

Future modules:

-   Streak
-   Leaderboard
-   Recommended Skills

------------------------------------------------------------------------

# Flow 3 -- Practice by Skill

``` text
Dashboard
      ↓
Practice by Skill
      ↓
Choose Skill
      ↓
Quiz Setup
```

Each skill card contains:

-   Skill name
-   Short description
-   Question count
-   Estimated duration
-   Start button

------------------------------------------------------------------------

# Flow 4 -- Quiz Configuration

User selects:

-   Question count
-   Difficulty
-   Timer

Defaults:

-   10 Questions
-   Mixed
-   30 seconds

Primary CTA:

**Start Quiz**

------------------------------------------------------------------------

# Flow 5 -- Quiz Experience

``` text
Question
      ↓
Countdown
      ↓
Select Answer
      ↓
Submit
      ↓
Evaluate
      ↓
Correct?
      ↓
Show:
  ✓ Result
  Explanation
  Reference
  Real-world Example
      ↓
Auto Advance
```

Rules

-   Timer expires → answer marked incorrect.
-   Correct answer displayed.
-   Explanation shown.
-   Automatically proceeds after a short delay.
-   Skip is not allowed.

------------------------------------------------------------------------

# Flow 6 -- Results

Display:

-   Total score
-   Accuracy
-   Average response time
-   Questions answered correctly
-   Questions answered incorrectly

Actions:

-   Retry Quiz
-   Practice Another Skill
-   Return to Dashboard

------------------------------------------------------------------------

# Flow 7 -- Settings

Settings include:

-   Timer duration
-   Theme
-   Reset local progress (future)
-   About

------------------------------------------------------------------------

# Error States

## Invalid Question Data

Display:

> This quiz is temporarily unavailable.

Allow user to return safely.

## Missing Local Storage

Continue without stored preferences.

## Timer Failure

Pause quiz and allow retry.

------------------------------------------------------------------------

# Future Flows

## Login

Landing → Sign in → Sync Progress

## Weekly Leaderboard

Dashboard → Leaderboard → Weekly Rankings

## Streak

Dashboard → Daily Completion → Maintain Streak

## Scenario Challenges

Dashboard → Scenario → Analyze Situation → Choose Best Response

## Behavioral Assessment

Dashboard → Assessment → Most Like Me → Least Like Me → Results

------------------------------------------------------------------------

# Analytics Mapping

  Flow               Event
  ------------------ ------------------
  Landing            page_view
  Dashboard          dashboard_view
  Skill Selected     skill_selected
  Quiz Started       quiz_started
  Answer Submitted   answer_submitted
  Timer Expired      timer_expired
  Quiz Completed     quiz_completed
  Results Viewed     results_viewed
  Retry              retry_clicked

------------------------------------------------------------------------

# Acceptance Criteria

-   Users can reach any quiz in three interactions or fewer after
    reaching the dashboard.
-   Every submitted answer receives immediate feedback.
-   Every question includes an explanation, reference, and real-world
    example.
-   Navigation is consistent across desktop and mobile.
-   Future features can be added without changing the primary navigation
    structure.
