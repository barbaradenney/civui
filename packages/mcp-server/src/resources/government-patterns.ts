/**
 * Embedded government accessibility rules derived from .claude/rules/government-patterns.md.
 * Kept as a string constant so the MCP server has zero filesystem dependencies at runtime.
 */
export const GOVERNMENT_PATTERNS = `# Government Form Accessibility Patterns

## Render Order
- Always render: label → hint → error → control → supplementary info.
- Group components render legend instead of label.

## Section 508 Non-Negotiables
- Every input MUST have a visible \`label\` (or \`legend\` for groups).
- Never use \`placeholder\` as the sole label.
- Set \`required\` attribute on mandatory fields — renders asterisk + \`aria-required="true"\`.
- Error messages MUST use \`role="alert"\` (handled by \`renderError()\`).
- Color must never be the sole error indicator — use text + border.
- Focus ring: \`focus-visible:civ-focus-ring\` on all interactive elements.

## Plain Language
- Labels use plain language: "Date of birth" not "DOB", "Social Security number" not "SSN".
- Hint text shows expected format: "For example: January 15 1990".
- Error text states what went wrong and how to fix it.
- Use \`required-message\` with field-specific text, never generic "This field is required".

## Date Input Rules
- Use \`civ-memorable-date\` for known dates (birthday, document dates).
- Use \`civ-date-picker\` for scheduling and appointment dates.
- Never use \`civ-date-input\` — it is deprecated (Dragon, VoiceOver, TalkBack issues).
- Always provide a hint showing expected format.

## Event Conventions
- Fire \`civ-input\` on every value change, \`civ-change\` on committed change.
- Single-value detail: \`{ value: string }\`.
- Multi-value detail: \`{ values: string[] }\` (checkbox-group).
- File detail: \`{ files: File[] }\` (file-upload).
- Boolean controls include \`checked\` in detail: \`{ checked, value }\`.
- Never dispatch native \`input\` or \`change\` events.

## Tailwind Rules
- All utilities MUST use \`civ-\` prefix: \`civ-p-4\`, \`civ-text-error\`.
- Use semantic color tokens: \`civ-text-primary\`, \`civ-bg-error-lighter\`.
- Use logical properties for RTL safety: \`civ-border-s-4\`, \`civ-rounded-s\`, \`civ-me-2\`.
- Use \`.civ-input\` class for standard input styling (includes border, padding, full-width).

## Form Validation
- Validate on submit, not on blur.
- \`civ-form\` renders error summary with anchor links automatically.
- Set \`error\` prop on fields for server-side validation errors.
- Use \`clearErrors()\` before re-validation.

## Required Field Patterns
Always mark required fields with the \`required\` attribute. Use \`required-message\` for
field-specific error text:

\`\`\`html
<civ-text-input
  label="Social Security number"
  name="ssn"
  required
  required-message="Enter your Social Security number"
  hint="We need this to verify your identity"
></civ-text-input>
\`\`\`

## Date Component Selection

| Date Type | Component | Example |
|-----------|-----------|---------|
| Date of birth | civ-memorable-date | "When were you born?" |
| Document issue/expiry | civ-memorable-date | "Passport expiration date" |
| Appointment scheduling | civ-date-picker | "Select your appointment date" |
| Travel dates with range | civ-date-picker with min/max | "Choose a date within the filing period" |

## WCAG 2.1 AA Checklist

| Criterion | CivUI Implementation |
|-----------|---------------------|
| 1.1.1 Non-text Content | Labels as text, not images |
| 1.3.1 Info and Relationships | Semantic HTML, ARIA attributes |
| 1.3.5 Identify Input Purpose | autocomplete support |
| 2.1.1 Keyboard | All controls keyboard accessible |
| 2.1.2 No Keyboard Trap | Escape closes dialogs |
| 2.4.3 Focus Order | DOM order = visual order (Light DOM) |
| 2.4.7 Focus Visible | focus-visible:civ-focus-ring |
| 3.3.1 Error Identification | role="alert" on errors |
| 3.3.2 Labels or Instructions | Visible labels + hint text |
| 3.3.3 Error Suggestion | Correction guidance in errors |
| 4.1.2 Name, Role, Value | ElementInternals + ARIA roles |
`;
