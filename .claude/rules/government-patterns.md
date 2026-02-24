---
description: Government accessibility and UX patterns for CivUI form components
globs:
  - packages/forms/**
  - packages/core/src/templates/**
---

# Government Form Component Rules

## Render order
- Always render: label → hint → error → control → supplementary info.
- Group components render legend instead of label.
- Use `renderLabel()`, `renderHint()`, `renderError()` from `@civui/core` templates.

## Section 508 non-negotiables
- Every input MUST have a visible `label` (or `legend` for groups).
- Never use `placeholder` as the sole label.
- Set `required` attribute on mandatory fields — renders asterisk + `aria-required="true"`.
- Error messages MUST use `role="alert"` (handled by `renderError()`).
- Color must never be the sole error indicator — use text + border.
- Focus ring: `focus-visible:civ-focus-ring` on all interactive elements.

## Plain language
- Labels use plain language: "Date of birth" not "DOB", "Social Security number" not "SSN".
- Hint text shows expected format: "For example: January 15 1990".
- Error text states what went wrong and how to fix it.
- Use `required-message` with field-specific text, never generic "This field is required".

## Date input rules
- Use `civ-memorable-date` for known dates (birthday, document dates).
- Use `civ-date-picker` for scheduling and appointment dates.
- Never use `civ-date-input` — it is deprecated (Dragon, VoiceOver, TalkBack issues).
- Always provide a hint showing expected format.

## Event conventions
- Fire `civ-input` on every value change, `civ-change` on committed change.
- Single-value detail: `{ value: string }`.
- Multi-value detail: `{ values: string[] }` (checkbox-group).
- File detail: `{ files: File[] }` (file-upload).
- Boolean controls include `checked` in detail: `{ checked, value }`.
- Never dispatch native `input` or `change` events.

## Tailwind rules
- All utilities MUST use `civ-` prefix: `civ-p-4`, `civ-text-error`.
- Use semantic color tokens: `civ-text-primary`, `civ-bg-error-lighter`.
- Use logical properties for RTL safety: `civ-border-s-4`, `civ-rounded-s`, `civ-me-2`.
- Use `.civ-input` class for standard input styling (includes border, padding, full-width).

## Form validation
- Validate on submit, not on blur.
- `civ-form` renders error summary with anchor links automatically.
- Set `error` prop on fields for server-side validation errors.
- Use `clearErrors()` before re-validation.
