---
description: Government accessibility and UX patterns for CivUI form components
globs:
  - packages/forms/**
  - packages/core/src/templates/**
---

# Government Form Component Rules

## Render order
- Every form control renders its own chrome: label → hint → error → control via `renderFormHeader()` from `@civui/core`.
- `civ-form-fieldset` enforces: legend → hint → error → controls (multi-field grouping only).
- Single-input components (text-input, textarea, select, combobox, date-picker, file-upload) are self-contained — they render their own label/hint/error from props.
- Group components (radio-group, checkbox-group, segmented-control, yes-no, memorable-date, date-range-picker) are **self-contained** — they render their own legend/hint/error from a `legend` prop. Do NOT wrap in `<civ-form-fieldset>`.

## Section 508 non-negotiables
- Every single input MUST have a visible `label` prop set directly on the control.
- Every group input MUST have a `legend` prop set directly on the component (self-contained — no external wrapper).
- Never use `placeholder` as the sole label.
- Set `required` directly on the control — renders "(required)" text on the label/legend.
- Error messages MUST use `role="alert"` (handled by `renderError()`).
- Color must never be the sole error indicator — use text + border.
- Focus ring: applied automatically by `civ.css` to every native interactive element. Render a real `<button>` / `<a href>` / `<input>` — no class required.

## Plain language
- Labels use plain language: "Date of birth" not "DOB", "Social Security number" not "SSN".
- Hint text shows expected format: "For example: January 15 1990".
- Error text states what went wrong and how to fix it.
- Use `required-message` with field-specific text, never generic "This field is required".

## Date input rules
- Use `civ-memorable-date` for known dates (birthday, document dates).
- Use `civ-date-picker` for scheduling and appointment dates.
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

## Text color rules
- Do NOT use gray text (`civ-text-base-dark`, `civ-text-base-light`, `civ-text-base`) for labels, headings, descriptions, or body text. Let text inherit the default color (`base-darkest`).
- Visual hierarchy comes from **font size and weight**, not color muting.
- The only acceptable uses of muted/gray text are: hint text, disabled states (`civ-opacity-disabled`), placeholder text, and explicit consumer overrides.
- Error text uses `civ-text-error`, success uses `civ-text-success` — never gray for status.

## Form validation
- Validate on submit, not on blur.
- `civ-form` renders error summary with anchor links automatically.
- Set `error` prop on fields for server-side validation errors.
- Use `clearErrors()` before re-validation.
- Per-field `touched` tracking: fields have a `touched` property (set on first blur, reset on form reset).
- Use `civ-text-input[touched]` CSS selector to style touched vs pristine fields.

## Mobile design
- All popups, dropdowns, and dialogs MUST use bottom sheets on mobile (≤480px).
- No absolute-positioned dropdowns on small screens — they overflow and are hard to tap.
- Bottom sheets: `position: fixed; bottom: 0; left: 0; right: 0;` with rounded top corners.
- Max height 50-70vh with `overflow-y: auto` for scrollable content.

## Motion
- All transitions use `var(--civ-motion-duration-*)` tokens — never hardcode durations.
- `@media (prefers-reduced-motion: reduce)` is enforced globally — all motion is disabled.
- No inline style transitions — use CSS classes with tokenized values.

## Print
- `@media print` rules hide interactive UI and clean up form rendering.
- Use `break-inside: avoid` on form field containers to prevent page breaks mid-field.
