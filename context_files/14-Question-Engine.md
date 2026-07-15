# 14 - Question Engine

# Purpose

Define the architecture and runtime behavior of the quiz engine that
powers all present and future question types.

------------------------------------------------------------------------

# Design Principles

-   JSON-driven
-   Static-first (GitHub Pages compatible)
-   No backend required for MVP
-   Easily extensible
-   Deterministic scoring
-   Fast (\<100 ms question transition)

------------------------------------------------------------------------

# Supported Question Types

## MVP

-   Multiple Choice (Single Correct)

## Future

-   Multiple Select
-   True / False
-   Match the Following
-   Ordering
-   Fill in the Blank
-   Scenario-based
-   Behavioral Assessment (Most Like Me / Least Like Me)
-   Documentation Review
-   Image-based Questions

------------------------------------------------------------------------

# Quiz Lifecycle

``` text
Select Skill
      ↓
Load Question Bank
      ↓
Validate JSON
      ↓
Randomize Questions
      ↓
Apply Quiz Settings
      ↓
Render Question
      ↓
Start Timer
      ↓
Submit / Timeout
      ↓
Evaluate Answer
      ↓
Display Feedback
      ↓
Next Question
      ↓
Results
```

------------------------------------------------------------------------

# Question Selection

## Inputs

-   Skill
-   Difficulty
-   Question Count

## Rules

-   Random without duplicates
-   Filter by difficulty
-   Support future tagging
-   Preserve randomness across sessions

------------------------------------------------------------------------

# Timer

Default: 30 seconds

Options:

-   15
-   30
-   45
-   60

Rules

-   Starts when question renders
-   Stops on submit
-   Expiry = incorrect answer
-   Correct answer displayed
-   Auto-advance after feedback

------------------------------------------------------------------------

# Answer Evaluation

For each submission:

1.  Validate selected option
2.  Compare against answer key
3.  Calculate response time
4.  Update score
5.  Record analytics
6.  Show explanation
7.  Auto-advance

------------------------------------------------------------------------

# Feedback Model

Every question must include:

-   Correct / Incorrect
-   Explanation
-   Reference
-   Real-world Example

Feedback is mandatory.

------------------------------------------------------------------------

# Scoring

MVP

-   Correct = 1
-   Incorrect = 0

Statistics

-   Total Score
-   Accuracy %
-   Average Response Time
-   Correct Count
-   Incorrect Count

Future

-   Weighted scoring
-   Difficulty multipliers
-   XP
-   Skill proficiency

------------------------------------------------------------------------

# Validation Rules

Every question must have:

-   Unique ID
-   Skill
-   Difficulty
-   Prompt
-   Four options
-   One valid answer
-   Explanation
-   Reference
-   Example

Invalid questions are skipped and logged.

------------------------------------------------------------------------

# Randomization

Randomize:

-   Question order

Do NOT randomize answer order in MVP to simplify review and maintenance.

Future: configurable answer shuffling.

------------------------------------------------------------------------

# Local State

Track during quiz:

-   Current index
-   Selected answers
-   Correct answers
-   Incorrect answers
-   Response times
-   Timer value
-   Quiz configuration

Persist after completion:

-   Last score
-   Last skill
-   Timer preference

------------------------------------------------------------------------

# Error Handling

Cases

-   Empty question bank
-   Invalid schema
-   Duplicate IDs
-   Missing explanation
-   Invalid answer index

Recovery

-   Skip invalid question
-   Notify user if quiz cannot continue

------------------------------------------------------------------------

# Extensibility

The engine must support future plugins for:

-   Scenario engine
-   Behavioral engine
-   AI review engine
-   Adaptive difficulty
-   Daily challenge generator

These should integrate without changing the core quiz loop.

------------------------------------------------------------------------

# Performance Targets

-   Initial JSON load \< 500 ms
-   Next question render \< 100 ms
-   Timer accuracy ±100 ms
-   Zero visible layout shifts

------------------------------------------------------------------------

# Testing Checklist

-   Question randomization
-   Timer expiration
-   Correct scoring
-   Invalid JSON handling
-   Duplicate prevention
-   Responsive behavior
-   Keyboard navigation
-   Local storage persistence

------------------------------------------------------------------------

# Developer Notes

Separate the engine from the UI.

Suggested modules:

-   QuestionRepository
-   QuizSession
-   TimerService
-   ScoringService
-   ValidationService
-   AnalyticsService

UI components should consume engine state rather than implement quiz
logic directly.
