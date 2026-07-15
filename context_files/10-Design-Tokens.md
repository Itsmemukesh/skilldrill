# 10 - Design Tokens

# Purpose

Define the visual design tokens that ensure a consistent UI across the
application. These tokens are intended to map directly to Tailwind CSS
variables and can be consumed by AI design tools.

------------------------------------------------------------------------

# Design Philosophy

-   GitHub-inspired
-   Minimal
-   Documentation-first
-   Professional
-   Accessible
-   Responsive

------------------------------------------------------------------------

# 8px Spacing System

  Token       Value Usage
  --------- ------- -----------------
  space-1       4px Tight spacing
  space-2       8px Base spacing
  space-3      12px Compact groups
  space-4      16px Default padding
  space-5      24px Section spacing
  space-6      32px Large cards
  space-7      48px Page sections
  space-8      64px Hero spacing

Rule: Prefer multiples of 8px.

------------------------------------------------------------------------

# Border Radius

  Token         Value
  ----------- -------
  radius-sm       4px
  radius-md       6px
  radius-lg       8px
  radius-xl      12px

Default: **radius-lg (8px)**

------------------------------------------------------------------------

# Borders

-   1px solid
-   Neutral gray
-   Subtle only
-   Avoid heavy outlines

------------------------------------------------------------------------

# Elevation

  Level   Usage
  ------- ---------------
  0       Flat surfaces
  1       Cards
  2       Modal
  3       Dropdown

Shadows should be soft and used sparingly.

------------------------------------------------------------------------

# Typography

## Font Families

Primary: - Inter

Fallback: - system-ui - sans-serif

## Scale

  Token     Size
  --------- ------
  display   48px
  h1        36px
  h2        30px
  h3        24px
  h4        20px
  body-lg   18px
  body      16px
  body-sm   14px
  caption   12px

Line-height: - Headings: 1.2 - Body: 1.6

------------------------------------------------------------------------

# Color Tokens

## Neutral

-   background
-   surface
-   surface-hover
-   border
-   text-primary
-   text-secondary
-   text-muted

## Semantic

-   success
-   warning
-   error
-   info

## Accent

Primary accent: - Blue

Use only for: - Primary buttons - Active navigation - Links - Keyboard
focus

------------------------------------------------------------------------

# Buttons

Primary

-   Filled
-   Blue
-   White text

Secondary

-   Neutral background
-   Border

Ghost

-   Transparent
-   Text only

Danger

-   Reserved for destructive actions

------------------------------------------------------------------------

# Inputs

Height: 40px minimum

States

-   Default
-   Hover
-   Focus
-   Disabled
-   Error

------------------------------------------------------------------------

# Cards

Structure

-   Title
-   Description
-   Metadata
-   CTA

Padding: 24px

Border: 1px

Radius: 8px

------------------------------------------------------------------------

# Layout Grid

Desktop

-   Max width: 1280px
-   Content width: \~1100px
-   Center aligned

Tablet

-   Two-column layout where appropriate

Mobile

-   Single column
-   Full-width cards

------------------------------------------------------------------------

# Breakpoints

  Device       Width
  --------- --------
  Mobile       360px
  Tablet       768px
  Laptop      1024px
  Desktop     1440px

------------------------------------------------------------------------

# Motion

Duration

-   Fast: 150ms
-   Normal: 250ms
-   Slow: 350ms

Use subtle fade and scale transitions.

Avoid flashy animations.

------------------------------------------------------------------------

# Accessibility

-   WCAG 2.2 AA
-   Minimum contrast ratio 4.5:1
-   Visible keyboard focus
-   Minimum touch target 44×44px

------------------------------------------------------------------------

# Tailwind Mapping (Suggested)

-   spacing -\> theme.spacing
-   colors -\> CSS variables
-   radius -\> theme.borderRadius
-   typography -\> theme.fontSize
-   shadows -\> theme.boxShadow

------------------------------------------------------------------------

# AI Design Guidance

Use these tokens consistently across all screens.

Do not invent new spacing, radii, colors, or typography unless this
document is updated. Consistency is more important than visual novelty.
