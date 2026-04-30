---
title: Form Architecture
sidebar_position: 4
sidebar_label: Form Architecture
---

# Form Architecture

Government forms built with CivUI follow a consistent architecture that prioritizes accessibility, progressive disclosure, and one-thing-per-page design.

## Form Hierarchy

```
Application
├── Introduction Page
├── Task List (hub)
│   ├── Chapter 1
│   │   ├── Form Step 1.1
│   │   ├── Form Step 1.2
│   │   └── Form Step 1.3
│   ├── Chapter 2
│   │   ├── Form Step 2.1
│   │   └── Form Step 2.2
│   └── Chapter 3
│       └── Form Step 3.1
├── Review & Submit
└── Confirmation Page
```

## Page Anatomy

Every page follows a consistent structure using CivUI components:

```html
<!-- Page header with breadcrumb context -->
<civ-page-header>
  <span data-eyebrow>Benefits</span>
  <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
  <span data-subheading>VA Form 21-526EZ</span>
</civ-page-header>

<!-- Back navigation -->
<civ-link href="/task-list" variant="back" label="Back to task list"></civ-link>

<!-- Form step content -->
<civ-form action="/api/submit" method="POST">
  <!-- Fields go here -->
  <civ-button type="submit">Continue</civ-button>
</civ-form>
```

## One-Thing-Per-Page Pattern

Each form step asks about one topic. This reduces cognitive load and works well on mobile:

```
┌─────────────────────────────────┐
│  ← Back to task list            │
│                                 │
│  Step 2 of 4                    │
│  ━━━━━━━━━━━━░░░░░░░░           │
│                                 │
│  Your mailing address           │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Street address *        │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ City *                  │    │
│  └─────────────────────────┘    │
│  ┌────────┐ ┌──────────────┐   │
│  │ State *│ │ ZIP code *   │   │
│  └────────┘ └──────────────┘   │
│                                 │
│  [ Continue ]                   │
│                                 │
└─────────────────────────────────┘
```

Each step typically contains 1-5 related fields. Split steps when:
- The topic changes (personal info vs. contact info)
- Conditional branching occurs
- The user needs to upload documents

## Navigation and Progress

CivUI supports two navigation patterns that work together:

### Task List Hub

The task list shows all chapters and their completion status. It serves as the central navigation hub:

```html
<h3 class="civ-heading-md">Personal information</h3>
<civ-list dividers>
  <civ-list-item href="#/personal/name">
    <span class="civ-block civ-font-bold">Name and date of birth</span>
    <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
  </civ-list-item>
  <civ-list-item href="#/personal/contact">
    <span class="civ-block civ-font-bold">Contact information</span>
    <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>

<h3 class="civ-heading-md">Service history</h3>
<civ-list dividers>
  <civ-list-item href="#/service/history">
    <span class="civ-block civ-font-bold">Military service</span>
    <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary" with-icon></civ-badge>
  </civ-list-item>
  <civ-list-item>
    <span class="civ-block civ-font-bold">Service-connected conditions</span>
    <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>

<h3 class="civ-heading-md">Review and submit</h3>
<civ-list dividers>
  <civ-list-item>
    <span class="civ-block civ-font-bold">Review your answers</span>
    <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>
```

Setting `href` on a `<civ-list-item>` makes the whole row a clickable anchor; omit `href` for locked rows. The status badge uses the `data-list-item-end` attribute to flow to the trailing edge. `<civ-badge>` carries `role="status"` and `with-icon` auto-renders the variant's semantic icon. Status mapping: `not-started → info`, `in-progress → info primary`, `complete → success primary`, `cannot-start → neutral`, `error → error`, `review → warning primary`.

### Form Step Navigation

Within a chapter, linear step-by-step navigation with a progress indicator:

```html
<civ-progress-steps current="2" total="4">
  <span data-label>Step 2 of 4</span>
</civ-progress-steps>
```

## Dynamic and Conditional Forms

Fields and entire sections can show/hide based on answers:

```html
<!-- Yes/No drives conditional reveal -->
<civ-yes-no name="hasInsurance" label="Do you have health insurance?">
</civ-yes-no>

<civ-conditional watch="hasInsurance" show-when="yes">
  <civ-text-input name="provider" label="Insurance provider name"></civ-text-input>
  <civ-text-input name="policyNumber" label="Policy or group number"></civ-text-input>
</civ-conditional>
```

For complex conditions:

```html
<civ-conditional watch="contactMethod" show-when="call">
  <civ-text-input name="phone" label="Phone number" type="tel" required></civ-text-input>
</civ-conditional>
```

## Repeatable Sections

When users need to add multiple items (dependents, conditions, employment history):

```
┌─────────────────────────────────┐
│  Conditions you are claiming    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Condition 1               │  │
│  │ PTSD                      │  │
│  │ [Edit] [Remove]           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Condition 2               │  │
│  │ Tinnitus                  │  │
│  │ [Edit] [Remove]           │  │
│  └───────────────────────────┘  │
│                                 │
│  [ + Add another condition ]    │
│                                 │
│  [ Continue ]                   │
│                                 │
└─────────────────────────────────┘
```

Repeatable sections are defined in the schema with:
- `repeatable: true`
- `repeatableMin` / `repeatableMax` for limits
- `repeatableAddLabel` / `repeatableRemoveLabel` for button text

## Review and Submit

The review page renders all answers in a read-only summary with edit links:

```
┌─────────────────────────────────┐
│  Review your answers            │
│                                 │
│  Personal information    [Edit] │
│  ─────────────────────────────  │
│  Full name: Jane Smith          │
│  Date of birth: March 15, 1985  │
│  SSN: ***-**-6789               │
│                                 │
│  Contact information     [Edit] │
│  ─────────────────────────────  │
│  Email: jane@example.com        │
│  Phone: (555) 123-4567          │
│                                 │
│  ☐ I certify that the           │
│    information above is true    │
│    and correct.                 │
│                                 │
│  [ Submit application ]         │
│                                 │
└─────────────────────────────────┘
```

The review page:
- Groups answers by chapter
- Masks PII fields (SSN shows last 4 only)
- Links each section back to its edit step
- Includes a certification checkbox or signature block
- Shows the submit button only when certification is complete

## Complex Workflows

For multi-actor forms (e.g., representative delegation, reviewer approval):

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Applicant fills form                            │
│       │                                          │
│       ▼                                          │
│  Applicant submits                               │
│       │                                          │
│       ▼                                          │
│  Reviewer receives ──── Reviewer requests        │
│       │                  changes                 │
│       │                     │                    │
│       │                     ▼                    │
│       │              Applicant revises           │
│       │                     │                    │
│       │◄────────────────────┘                    │
│       ▼                                          │
│  Reviewer approves                               │
│       │                                          │
│       ▼                                          │
│  Decision issued                                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

Workflow features are generated with:
- `generate_workflow_ui` — Status banners and transition buttons
- `generate_delegation_sections` — Representative/POA assignment
- `generate_feedback_ui` — Inline reviewer comments
- `generate_case_dashboard` — Combined status, progress, and history
- `generate_audit_trail` — Change history timeline
- `generate_lock_matrix` — Role-based field permissions

## Component Reference

| Component | Purpose |
|-----------|---------|
| `<civ-page-header>` | Page title with eyebrow and subheading |
| `<civ-list>` | Generic list container; use for task list hub showing chapter statuses |
| `<civ-list-item>` | List row; set `href` to make the whole row clickable, omit for static rows |
| `<civ-progress-steps>` | Linear step progress indicator |
| `<civ-form>` | Form wrapper with validation and error summary |
| `<civ-yes-no>` | Yes/No radio group |
| `<civ-conditional>` | Conditional reveal container |
| `<civ-link>` | Navigation link (back, breadcrumb) |
| `<civ-link-card>` | Card-style navigation link |
| `<civ-button>` | Form actions (continue, submit, add another) |
