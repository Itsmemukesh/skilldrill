# 11 - Component Library

# Purpose

This document defines every reusable UI component used throughout the
application. Components should be composable, accessible, responsive,
and optimized for React/Next.js with Tailwind CSS.

------------------------------------------------------------------------

# Component Inventory

## Layout

-   App Shell
-   Top Navigation
-   Footer
-   Container
-   Section
-   Page Header

## Navigation

-   Navigation Link
-   Breadcrumb (Future)
-   Theme Toggle

## Dashboard

-   Hero Banner
-   Dashboard Card
-   Continue Practice Card
-   Daily Challenge Card
-   Quick Practice Card
-   Random Quiz Card
-   Recent Performance Card

## Practice

-   Skill Card
-   Skill Grid
-   Filter Bar (Future)
-   Search Box (Future)

## Quiz

-   Quiz Header
-   Progress Indicator
-   Countdown Timer
-   Question Card
-   Answer Option
-   Submit Button
-   Feedback Panel
-   Explanation Block
-   Reference Block
-   Real-world Example Block

## Results

-   Score Summary
-   Statistics Card
-   Incorrect Answers List
-   Action Bar

## Common

-   Button
-   Card
-   Badge
-   Chip
-   Divider
-   Tooltip
-   Modal
-   Toast
-   Empty State
-   Loading Skeleton

------------------------------------------------------------------------

# Component Specification Template

Each component follows:

-   Purpose
-   Variants
-   Props
-   States
-   Accessibility
-   Analytics
-   Responsive Behavior
-   Dependencies

------------------------------------------------------------------------

# Skill Card

## Purpose

Represents one professional skill area.

## Props

-   icon
-   title
-   description
-   questionCount
-   estimatedDuration

## Variants

-   Default
-   Hover
-   Active
-   Disabled

## States

-   Normal
-   Loading
-   Empty

## Accessibility

-   Keyboard focus
-   Enter/Space activation
-   Screen reader label

## Analytics

skill_selected

------------------------------------------------------------------------

# Dashboard Card

## Purpose

Highlights a recommended action.

Examples

-   Continue Practice
-   Daily Challenge
-   Random Quiz

## Props

-   title
-   description
-   icon
-   CTA
-   optional badge

------------------------------------------------------------------------

# Quiz Header

Contains

-   Current question
-   Total questions
-   Progress bar
-   Countdown timer
-   Theme toggle

Sticky at top during quiz.

------------------------------------------------------------------------

# Question Card

Displays

-   Question
-   Optional image (future)
-   Four answer options

Requirements

-   One answer only
-   Clear spacing
-   Responsive typography

------------------------------------------------------------------------

# Answer Option

Variants

-   Default
-   Hover
-   Selected
-   Correct
-   Incorrect
-   Disabled

Must support keyboard navigation.

------------------------------------------------------------------------

# Feedback Panel

Appears immediately after submission.

Displays

-   Correct / Incorrect
-   Explanation
-   Reference
-   Real-world example

Automatically transitions to next question.

------------------------------------------------------------------------

# Countdown Timer

Displays remaining time.

Variants

-   Normal
-   Warning (\<10 sec)
-   Expired

Behavior

-   Counts down every second
-   Emits timer_expired event
-   Auto-submits incorrect answer

------------------------------------------------------------------------

# Score Summary

Displays

-   Final score
-   Accuracy
-   Average response time

Actions

-   Retry
-   Practice another skill
-   Dashboard

------------------------------------------------------------------------

# Theme Toggle

Variants

-   Light
-   Dark

Persist preference using Local Storage.

------------------------------------------------------------------------

# Empty State

Used when:

-   No quizzes
-   No recent activity
-   No results

Should provide a clear recovery action.

------------------------------------------------------------------------

# Loading Skeleton

Used while loading JSON content.

Avoid layout shifts.

------------------------------------------------------------------------

# Component Naming Convention

-   PascalCase for React components
-   Single responsibility
-   No business logic inside presentational components

Examples

-   SkillCard
-   QuestionCard
-   CountdownTimer
-   DashboardCard

------------------------------------------------------------------------

# Responsive Rules

Desktop

-   Multi-column layouts
-   Persistent navigation

Tablet

-   Two-column cards

Mobile

-   Single-column
-   Sticky quiz actions
-   Large touch targets

------------------------------------------------------------------------

# Accessibility Checklist

Every interactive component must:

-   Be keyboard accessible
-   Have visible focus state
-   Include accessible labels
-   Meet WCAG AA contrast
-   Support screen readers

------------------------------------------------------------------------

# Future Components

-   Leaderboard Table
-   User Profile Card
-   Streak Widget
-   Behavioral Assessment Matrix
-   Scenario Challenge Viewer
-   AI Review Panel

------------------------------------------------------------------------

# Design Consistency

All components must consume values from the Design Tokens document.

No component should introduce custom spacing, colors, typography, or
shadows outside the approved design system.
