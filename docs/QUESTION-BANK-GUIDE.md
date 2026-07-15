# Question Bank Guide

This guide explains how to add questions at scale, where question files live today, and how to enable additional skill modules in SkillDrill.

For the full field-by-field schema contract, also see [`context_files/15-Question-JSON-Schema.md`](../context_files/15-Question-JSON-Schema.md).

---

## How questions are loaded today

SkillDrill is **static-first**: questions are JSON files served from `public/` and loaded in the browser when a quiz starts.

```text
User starts quiz
      ↓
practice/page.tsx calls loadQuestionsForSkill(skill)
      ↓
questionRepository.ts fetches /questions/{skill}.json
      ↓
Only questions with status: "published" and type: "multiple-choice" are used
      ↓
filterAndSelectQuestions() filters by difficulty, shuffles, and picks N questions
```

Loader implementation: [`src/services/questionRepository.ts`](../src/services/questionRepository.ts)

---

## Where to add questions (enabled modules)

Add questions to these files:

| Module | File path | Public URL |
|--------|-----------|------------|
| Documentation Fundamentals | `public/questions/documentation-fundamentals.json` | `/questions/documentation-fundamentals.json` |
| API Documentation | `public/questions/api-documentation.json` | `/questions/api-documentation.json` |

Each file is a **JSON array** of question objects.

### Minimal example

```json
[
  {
    "schemaVersion": "1.0",
    "id": "FUND-0004",
    "skill": "documentation-fundamentals",
    "difficulty": "easy",
    "type": "multiple-choice",
    "tags": ["active-voice", "clarity"],
    "question": "Which sentence is clearest for a general audience?",
    "options": [
      "The configuration is modified by the administrator.",
      "The administrator modifies the configuration.",
      "Configuration modification is performed.",
      "Modified configuration occurs administratively."
    ],
    "correctAnswer": 1,
    "explanation": "Active voice names the actor first and reduces wordiness.",
    "reference": {
      "title": "Microsoft Writing Style Guide - Active Voice",
      "url": "https://learn.microsoft.com/en-us/style-guide/grammar/active-voice"
    },
    "realWorldExample": "Write 'Click Save' instead of 'The Save button should be clicked'.",
    "estimatedTime": 30,
    "status": "published"
  }
]
```

### Important rules

- **`skill` must match the filename** (e.g. `"documentation-fundamentals"` in `documentation-fundamentals.json`).
- **`status` must be `"published"`** or the question will not appear in quizzes.
- **`type` must be `"multiple-choice"`** in the current app.
- **`correctAnswer` is zero-based** (`0` = first option).
- **Use unique `id` values** across the entire question bank (not just within one file).
- **Provide exactly 4 options** for MVP compatibility.

### Recommended ID prefixes

| Module | ID prefix | Example |
|--------|-----------|---------|
| Documentation Fundamentals | `FUND-` | `FUND-0123` |
| API Documentation | `API-` | `API-0456` |
| Style Guides | `STYLE-` | `STYLE-0001` |
| Docs-as-Code | `DAC-` | `DAC-0001` |
| AI for Technical Writers | `AI-` | `AI-0001` |
| Content Strategy | `CS-` | `CS-0001` |
| Professional Skills | `PRO-` | `PRO-0001` |
| Interview Preparation | `INT-` | `INT-0001` |

---

## Best approach for adding questions at large volume (e.g. 1000+)

### Recommended workflow (best overall)

Use a **content pipeline**, not hand-editing giant JSON files in the IDE.

```text
Author / generate questions
      ↓
Store as draft JSON or CSV
      ↓
Validate schema + IDs + duplicates (script/CI)
      ↓
Human review
      ↓
Set status: "published"
      ↓
Build merged JSON per skill
      ↓
Deploy
```

#### 1. Author in manageable chunks

Even if the app loads one file per skill, **author in smaller source files** and merge at build time.

Suggested source layout (not implemented yet, but best practice):

```text
content/questions/
├── documentation-fundamentals/
│   ├── active-voice.json
│   ├── readability.json
│   └── structure.json
├── api-documentation/
│   ├── rest.json
│   ├── openapi.json
│   └── auth.json
└── ...
```

Add a small Node script (e.g. `scripts/build-question-banks.ts`) to:

- merge topic files into `public/questions/{skill}.json`
- validate schema
- fail on duplicate IDs
- count published questions per skill

This keeps Git diffs reviewable and makes 1000-question banks maintainable.

#### 2. Use `status` as your publishing gate

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress; hidden from quizzes |
| `review` | Ready for editorial review; hidden from quizzes |
| `published` | Live in quizzes |
| `archived` | Retired; hidden from quizzes |

For bulk imports, add questions as `draft` or `review`, then flip to `published` after QA.

#### 3. Validate before merge/deploy

At minimum, validate:

- unique `id`
- valid `skill`
- `correctAnswer` in range `0..options.length-1`
- non-empty `question`, `explanation`, `reference`, `realWorldExample`
- exactly 4 options (current MVP rule)
- `estimatedTime > 0`

Recommended: JSON Schema Draft 2020-12 + CI check on every PR.

#### 4. AI-assisted generation (optional)

Good pattern for scale:

1. Generate candidate questions from source docs (style guides, RFCs, OpenAPI specs).
2. Output JSON matching the schema in [`context_files/15-Question-JSON-Schema.md`](../context_files/15-Question-JSON-Schema.md).
3. Auto-validate.
4. Human editor reviews explanation quality and references.
5. Publish.

Never skip human review for explanations and references.

#### 5. Spreadsheet → JSON (good for non-developer authors)

For manual bulk entry:

- maintain a Google Sheet / Excel template with columns for each field
- export CSV
- convert CSV → JSON with a script
- validate and merge

This is often faster than writing raw JSON by hand for hundreds of rows.

---

## Scaling considerations at ~1000 questions

### What works now (MVP)

- One JSON file per skill in `public/questions/`
- Full file fetched when a quiz starts
- Random selection happens client-side after load

This is fine for **roughly up to a few hundred questions per skill**.

### What to change before ~1000 per skill

| Concern | Why it matters | Recommended upgrade |
|---------|----------------|---------------------|
| File size | 1000 questions ≈ large JSON payload on every quiz start | Split source files + build step; consider chunked runtime loading |
| Initial load time | `fetch` + `JSON.parse` of a multi-MB file can exceed the 500 ms target | Lazy-load by difficulty or topic; or API route with pagination |
| Git diffs | One giant file is hard to review | Topic-based source files + merge script |
| Duplicate IDs | Hard to spot manually at scale | Validation script in CI |
| Dashboard counts | `count` is currently hardcoded in UI | Derive counts from built JSON or a manifest |

### Practical phased plan

| Phase | Size | Approach |
|-------|------|----------|
| **Phase 1 (now)** | 3–50 per skill | Edit `public/questions/{skill}.json` directly |
| **Phase 2** | 50–300 per skill | Topic files under `content/questions/` + merge script |
| **Phase 3** | 300–1000+ per skill | Add validation CI + optional chunked loading in `questionRepository.ts` |
| **Phase 4** | 1000+ total, frequent updates | Move to DB or headless CMS; keep JSON export for static deploys |

---

## How to enable a disabled module

Disabled modules already exist in the type system but are marked `ready: false` in the dashboard and are omitted from the practice setup screen.

### Files to change

| Step | File | What to do |
|------|------|------------|
| 1 | `public/questions/{skill-id}.json` | Create the question bank file (see skill IDs below) |
| 2 | `src/app/page.tsx` | Set `ready: true` and update `count` for that skill in the `SKILLS` array |
| 3 | `src/app/practice/page.tsx` | Add the skill to the local `SKILLS` array so it appears in quiz setup |
| 4 | `src/types/index.ts` | Only if adding a **brand-new** skill not already listed in `SkillCategory` |

### Skill IDs (already defined in types)

```text
documentation-fundamentals   ✅ enabled
api-documentation            ✅ enabled
style-guides                 ❌ disabled
docs-as-code                 ❌ disabled
ai-for-technical-writers     ❌ disabled
content-strategy             ❌ disabled
professional-skills          ❌ disabled
interview-preparation        ❌ disabled
```

### Example: enable **Style Guides**

**Step 1 — Create questions**

Create `public/questions/style-guides.json` with at least a few `published` questions where `"skill": "style-guides"`.

**Step 2 — Enable on dashboard**

In `src/app/page.tsx`, update the Style Guides entry:

```typescript
{
  id: 'style-guides',
  name: 'Style Guides',
  desc: 'Google Developer Style Guide, Microsoft Writing Guide, and corporate tone.',
  count: 25,      // update to published question count
  ready: true     // was false
}
```

**Step 3 — Enable in practice setup**

In `src/app/practice/page.tsx`, add to the `SKILLS` array:

```typescript
{
  id: 'style-guides',
  name: 'Style Guides',
  desc: 'Google Developer Style Guide, Microsoft Writing Guide, and corporate tone.'
}
```

**Step 4 — Verify**

1. Dashboard tile shows the module as selectable (not "Coming Soon").
2. `/practice` lists the skill in step 1 of quiz setup.
3. Starting a quiz loads `/questions/style-guides.json` without errors.

### Note on duplicated skill config

Skill metadata currently lives in **two places**:

- `src/app/page.tsx` — dashboard cards (`ready`, `count`, etc.)
- `src/app/practice/page.tsx` — practice setup picker

Both must be updated when enabling a module. A future improvement is a single shared `src/config/skills.ts` used by both pages.

---

## Quick reference

| Task | Location |
|------|----------|
| Add questions to Documentation Fundamentals | `public/questions/documentation-fundamentals.json` |
| Add questions to API Documentation | `public/questions/api-documentation.json` |
| Question loader / filtering logic | `src/services/questionRepository.ts` |
| Question TypeScript type | `src/types/index.ts` → `Question` |
| Enable module on dashboard | `src/app/page.tsx` → `SKILLS[].ready` |
| Enable module in practice flow | `src/app/practice/page.tsx` → `SKILLS` |
| Schema specification | `context_files/15-Question-JSON-Schema.md` |
| Quiz engine behavior | `context_files/14-Question-Engine.md` |

---

## Checklist for adding 1 new question

- [ ] Pick the correct `public/questions/{skill}.json` file
- [ ] Assign a unique `id`
- [ ] Set `skill` to match the file/skill category
- [ ] Set `difficulty` to `easy`, `medium`, or `hard`
- [ ] Write 4 options and set `correctAnswer` (0-based)
- [ ] Add `explanation`, `reference`, and `realWorldExample`
- [ ] Set `status` to `published`
- [ ] Validate JSON syntax
- [ ] Update dashboard `count` in `src/app/page.tsx` if you track it manually
- [ ] Test a quiz for that skill in the browser

---

## Checklist for enabling a new module

- [ ] Create `public/questions/{skill-id}.json` with published questions
- [ ] Set `ready: true` in `src/app/page.tsx`
- [ ] Add skill to `SKILLS` in `src/app/practice/page.tsx`
- [ ] Update `count` on the dashboard card
- [ ] Confirm `SkillCategory` in `src/types/index.ts` includes the skill ID
- [ ] Test dashboard tile + practice setup + full quiz flow
