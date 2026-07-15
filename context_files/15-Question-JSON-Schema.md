# 15 - Question JSON Schema

# Purpose

Define the canonical content model for every question used by the
platform. This schema is the contract between content authors, AI
generation pipelines, validators, and the quiz engine.

------------------------------------------------------------------------

# Design Principles

-   Human-readable
-   JSON-first
-   Versioned
-   Backward compatible
-   AI-friendly
-   Validation before publishing

------------------------------------------------------------------------

# Folder Structure

``` text
questions/
├── documentation-fundamentals/
├── api-documentation/
├── style-guides/
├── docs-as-code/
├── ai-for-technical-writers/
├── content-strategy/
├── professional-skills/
└── interview-preparation/
```

Each folder contains one or more JSON files.

------------------------------------------------------------------------

# Canonical Question Schema

``` json
{
  "schemaVersion": "1.0",
  "id": "API-0001",
  "skill": "api-documentation",
  "difficulty": "medium",
  "type": "multiple-choice",
  "tags": [
    "rest",
    "http",
    "status-codes"
  ],
  "question": "Which HTTP status code indicates that a resource has permanently moved?",
  "options": [
    "200",
    "301",
    "404",
    "500"
  ],
  "correctAnswer": 1,
  "explanation": "301 indicates a permanent redirect.",
  "reference": {
    "title": "RFC 9110",
    "url": "https://www.rfc-editor.org/rfc/rfc9110"
  },
  "realWorldExample": "Use HTTP 301 when an API endpoint has permanently changed.",
  "estimatedTime": 30,
  "status": "published"
}
```

------------------------------------------------------------------------

# Field Definitions

  Field               Required  Description
  ------------------ ---------- -------------------------------------
  schemaVersion          ✅     Content schema version
  id                     ✅     Globally unique question identifier
  skill                  ✅     Skill category
  difficulty             ✅     easy, medium, hard
  type                   ✅     Question type
  tags                   ✅     Search and filtering tags
  question               ✅     Question text
  options                ✅     Answer choices
  correctAnswer          ✅     Zero-based array index
  explanation            ✅     Why the answer is correct
  reference              ✅     Source used for learning
  realWorldExample       ✅     Practical example
  estimatedTime          ✅     Suggested timer
  status                 ✅     draft, review, published, archived

------------------------------------------------------------------------

# Skill Taxonomy

-   documentation-fundamentals
-   api-documentation
-   style-guides
-   docs-as-code
-   ai-for-technical-writers
-   content-strategy
-   professional-skills
-   interview-preparation

Future skills can be added without changing the schema.

------------------------------------------------------------------------

# Difficulty Levels

## Easy

-   Recall basic concepts.

## Medium

-   Apply concepts to practical situations.

## Hard

-   Requires analysis and professional experience.

Future:

-   Expert

------------------------------------------------------------------------

# Question Types

## MVP

multiple-choice

## Future

-   multiple-select
-   true-false
-   ordering
-   fill-in-the-blank
-   scenario
-   behavioral
-   documentation-review

------------------------------------------------------------------------

# Validation Rules

-   Unique ID
-   Minimum 4 options for multiple-choice
-   Exactly one correct answer
-   Non-empty explanation
-   Valid reference object
-   Estimated time \> 0
-   Published questions only in production builds

------------------------------------------------------------------------

# Naming Convention

Question IDs

    API-0001
    API-0002
    MSTP-0104
    DOC-0321
    AI-0008

Use immutable IDs.

------------------------------------------------------------------------

# Versioning

Schema version:

    1.0

Increment:

-   Minor for backward-compatible additions
-   Major for breaking changes

------------------------------------------------------------------------

# Localization Ready

Future structure:

``` json
{
  "locale": "en-US"
}
```

Question content should remain language-independent where possible.

------------------------------------------------------------------------

# AI Generation Pipeline

1.  Generate question.
2.  Generate explanation.
3.  Add reference.
4.  Add real-world example.
5.  Validate schema.
6.  Review by human editor.
7.  Publish to repository.

------------------------------------------------------------------------

# JSON Schema Validation

Recommended standard:

JSON Schema Draft 2020-12

Validate every file during CI before deployment.

------------------------------------------------------------------------

# Repository Standards

-   One logical topic per file.
-   UTF-8 encoding.
-   Pretty-printed JSON.
-   Stable ordering of keys.
-   No duplicate IDs.

------------------------------------------------------------------------

# Future Extensions

Reserved fields:

``` json
{
  "scenario": {},
  "behavioral": {},
  "attachments": [],
  "images": [],
  "videos": [],
  "difficultyScore": 0,
  "aiGenerated": false,
  "reviewedBy": "",
  "reviewedOn": ""
}
```

These fields are optional today but reserved for future compatibility.
