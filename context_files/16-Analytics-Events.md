# 16 - Analytics Events

# Purpose

Define the analytics strategy for the Technical Writing Practice
Platform.

The objective is to measure learning behavior, product adoption, content
quality, and engagement---not just traffic.

------------------------------------------------------------------------

# Analytics Stack

## MVP

-   Google Analytics 4 (GA4)
-   Microsoft Clarity

## Future

-   Supabase event warehouse
-   Looker Studio dashboards
-   BigQuery export (optional)

------------------------------------------------------------------------

# Guiding Principles

-   Respect user privacy
-   No personally identifiable information (PII)
-   Event names remain stable over time
-   Keep event payloads small
-   Every major user action should be measurable

------------------------------------------------------------------------

# Event Naming Convention

Use lowercase snake_case.

Examples

-   page_view
-   dashboard_view
-   quiz_started
-   question_viewed
-   answer_submitted

------------------------------------------------------------------------

# Common Event Parameters

  Parameter        Description
  ---------------- ------------------
  page_name        Current page
  skill            Selected skill
  difficulty       Quiz difficulty
  question_count   5, 10, or 20
  timer            Timer duration
  theme            Light or Dark
  app_version      Frontend version

------------------------------------------------------------------------

# Navigation Events

  Event            Trigger
  ---------------- ----------------------
  landing_view     Landing page loads
  dashboard_view   Dashboard displayed
  practice_view    Practice page opened
  settings_view    Settings opened
  about_view       About page opened

------------------------------------------------------------------------

# Quiz Events

## quiz_started

Triggered when the user starts a quiz.

Parameters

-   skill
-   difficulty
-   question_count
-   timer

------------------------------------------------------------------------

## question_viewed

Triggered whenever a question is rendered.

Parameters

-   question_id
-   skill
-   difficulty
-   question_index

------------------------------------------------------------------------

## answer_submitted

Parameters

-   question_id
-   selected_option
-   response_time_ms

------------------------------------------------------------------------

## answer_correct

Parameters

-   question_id
-   response_time_ms

------------------------------------------------------------------------

## answer_incorrect

Parameters

-   question_id
-   selected_option

------------------------------------------------------------------------

## timer_expired

Parameters

-   question_id
-   timer

------------------------------------------------------------------------

## quiz_completed

Parameters

-   skill
-   score
-   accuracy
-   average_response_time
-   question_count

------------------------------------------------------------------------

# Dashboard Events

-   continue_practice_clicked
-   daily_challenge_clicked
-   quick_practice_clicked
-   random_quiz_clicked
-   skill_selected

------------------------------------------------------------------------

# Settings Events

-   theme_changed
-   timer_changed

------------------------------------------------------------------------

# Error Events

-   invalid_question_schema
-   quiz_load_failed
-   local_storage_unavailable

These should be non-fatal.

------------------------------------------------------------------------

# Microsoft Clarity

Use Clarity to observe:

-   Heatmaps
-   Scroll depth
-   Rage clicks
-   Dead clicks
-   Session recordings (privacy-filtered)

Do not rely on Clarity for business metrics.

------------------------------------------------------------------------

# Recommended GA4 Reports

## Acquisition

-   Traffic sources
-   Returning users

## Engagement

-   Quiz starts
-   Quiz completions
-   Average engagement time

## Learning

-   Most practiced skills
-   Most difficult questions
-   Average accuracy by skill
-   Average response time

## Content Quality

-   Questions with highest timeout rate
-   Questions with lowest accuracy
-   Questions most frequently reviewed

------------------------------------------------------------------------

# Success Metrics

## Product

-   Daily Active Users
-   Quiz Completion Rate
-   Return Visitor Rate

## Learning

-   Average Accuracy
-   Average Response Time
-   Skill Popularity

## Content

-   Difficulty Distribution
-   Question Failure Rate
-   Explanation View Rate

------------------------------------------------------------------------

# Privacy

-   No names
-   No email addresses
-   No IP-based personalization
-   No user profiles in MVP
-   Store preferences locally only

------------------------------------------------------------------------

# Event Lifecycle

User Opens Site ↓ landing_view ↓ dashboard_view ↓ quiz_started ↓
question_viewed ↓ answer_submitted ↓ answer_correct / answer_incorrect ↓
quiz_completed

------------------------------------------------------------------------

# Future Analytics

After Supabase integration:

-   User retention
-   Weekly leaderboard participation
-   Streak completion
-   Skill progression
-   Behavioral assessment distribution
-   Scenario challenge success rate

------------------------------------------------------------------------

# Dashboard Recommendation

Create a Looker Studio dashboard with:

-   Traffic overview
-   Quiz funnel
-   Skill popularity
-   Question quality
-   Learning trends
-   Device breakdown
-   Geographic distribution

Review monthly to guide content updates and roadmap prioritization.
