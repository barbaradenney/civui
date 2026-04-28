<!-- Derived from docs/ai-guide.md — update both when component APIs change -->

# CivUI — Copilot Instructions

Accessibility-first Lit 3 web components for government applications.
Light DOM only. Tailwind CSS with `civ-` prefix. ElementInternals for form participation.

## Architecture Essentials

- All components use Light DOM (`createRenderRoot()` returns `this`) — no Shadow DOM
- Form components extend `CivFormElement` with `static formAssociated = true`
- Every form component has: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`
- Group components (`checkbox-group`, `radio-group`, `memorable-date`, `segmented-control`) use `legend` instead of `label`
- Events: `civ-input` (every change), `civ-change` (committed change)
- Single-value detail: `{ value }`. Multi-value: `{ values: string[] }`. File: `{ files: File[] }`
- Render order: label → hint → error → control → supplementary info
- Focus: use `focus-visible:civ-focus-ring` (not `focus:` prefix)
- All Tailwind classes prefixed: `civ-p-4`, `civ-text-error`, `civ-bg-primary`
- Density system: `data-civ-scale="spacious|dense"` on any container

## Component Quick Reference

| Tag | Key Props | Event Detail |
|-----|-----------|--------------|
| `<civ-text-input>` | `type`, `width`, `placeholder`, `maxlength`, `pattern`, `autocomplete`, `inputmode` | `{ value }` |
| `<civ-textarea>` | `rows`, `maxlength`, `placeholder` | `{ value }` |
| `<civ-select>` | `options`, `emptyLabel` | `{ value }` |
| `<civ-combobox>` | `options`, `placeholder`, `noResultsText` | `civ-change: { value, label }` |
| `<civ-checkbox>` | `checked`, `indeterminate`, `description`, `tile` | `{ checked, value }` |
| `<civ-checkbox-group>` | `legend`, `tile`, `orientation` | `{ values: string[] }` |
| `<civ-radio>` | `label`, `value`, `checked`, `description`, `tile` | (use in radio-group) |
| `<civ-radio-group>` | `legend`, `tile`, `orientation` | `{ value }` |
| `<civ-toggle>` | `checked`, `description` | `{ checked, value }` |
| `<civ-segmented-control>` | `legend` | `{ value }` |
| `<civ-segment>` | `label`, `value`, `selected` | (use in segmented-control) |
| `<civ-date-picker>` | `min`, `max`, `placeholder`, `locale`, `weekStartsOn` | `{ value }` |
| `<civ-memorable-date>` | `legend`, `monthLabel`, `dayLabel`, `yearLabel`, `locale` | `{ value, month, day, year }` |
| `<civ-file-upload>` | `accept`, `multiple`, `maxSize`, `maxFiles` | `{ files: File[] }` |
| `<civ-fieldset>` | `legend`, `hint`, `error`, `required`, `disabled` | — |
| `<civ-form>` | `action`, `method` | `civ-submit: { formData }`, `civ-invalid: { errors }` |

## HTML Examples

### Text input

```html
<civ-text-input
  label="Email address"
  name="email"
  type="email"
  hint="We'll use this to send your confirmation"
  required
  autocomplete="email"
></civ-text-input>
```

### Textarea with character count

```html
<civ-textarea
  label="Describe your issue"
  name="description"
  rows="8"
  maxlength="2000"
  required
></civ-textarea>
```

### Select

```html
<civ-select
  label="State"
  name="state"
  required
  .options="${[
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' }
  ]}"
></civ-select>
```

### Combobox

```html
<civ-combobox
  label="Agency"
  name="agency"
  placeholder="Start typing..."
  .options="${[
    { value: 'doj', label: 'Department of Justice' },
    { value: 'doe', label: 'Department of Energy' }
  ]}"
></civ-combobox>
```

### Checkbox (standalone)

```html
<civ-checkbox
  label="I agree to the terms of service"
  name="terms"
  required
></civ-checkbox>
```

### Checkbox group

```html
<civ-checkbox-group legend="Select all that apply" name="interests" required>
  <civ-checkbox label="Education" value="education"></civ-checkbox>
  <civ-checkbox label="Healthcare" value="healthcare"></civ-checkbox>
  <civ-checkbox label="Transportation" value="transportation"></civ-checkbox>
</civ-checkbox-group>
```

### Radio group

```html
<civ-radio-group legend="Preferred contact method" name="contact" required>
  <civ-radio label="Email" value="email"></civ-radio>
  <civ-radio label="Phone" value="phone"></civ-radio>
  <civ-radio label="Mail" value="mail" description="Physical mail to address on file"></civ-radio>
</civ-radio-group>
```

### Toggle

```html
<civ-toggle
  label="Email notifications"
  name="notifications"
  description="Receive updates about your application status"
></civ-toggle>
```

### Segmented control

```html
<civ-segmented-control legend="View mode" name="view">
  <civ-segment label="List" value="list"></civ-segment>
  <civ-segment label="Grid" value="grid"></civ-segment>
  <civ-segment label="Map" value="map"></civ-segment>
</civ-segmented-control>
```

### Date picker (scheduling)

```html
<civ-date-picker
  label="Appointment date"
  name="appointment"
  hint="Select an available date"
  min="2026-01-01"
  max="2026-12-31"
  required
></civ-date-picker>
```

### Memorable date (known dates like birthday)

```html
<civ-memorable-date
  label="Date of birth"
  name="dob"
  hint="For example: January 15 1990"
  required
></civ-memorable-date>
```

### File upload

```html
<civ-file-upload
  label="Supporting documents"
  name="documents"
  accept=".pdf,.jpg,.png,image/*"
  multiple
  max-size="5242880"
  max-files="5"
  required
></civ-file-upload>
```

### Fieldset grouping

```html
<civ-fieldset legend="Mailing address">
  <civ-text-input label="Street" name="street" required></civ-text-input>
  <civ-text-input label="City" name="city" required></civ-text-input>
  <civ-select label="State" name="state" required .options="${stateOptions}"></civ-select>
  <civ-text-input label="ZIP code" name="zip" required pattern="[0-9]{5}(-[0-9]{4})?"></civ-text-input>
</civ-fieldset>
```

### Complete form

```html
<civ-form @civ-submit="${handleSubmit}" @civ-invalid="${handleErrors}">
  <civ-text-input label="Full name" name="name" required autocomplete="name"></civ-text-input>
  <civ-text-input label="Email" name="email" type="email" required autocomplete="email"></civ-text-input>
  <civ-textarea label="Message" name="message" required maxlength="1000"></civ-textarea>
  <button type="submit">Submit</button>
  <button type="reset">Clear</button>
</civ-form>
```

## Accessibility Rules

1. **Every input must have a visible label.** Never use placeholder as label.
2. **Use `required` attribute** — renders asterisk and sets `aria-required="true"`.
3. **Error messages use `role="alert"`** — announced immediately by screen readers.
4. **Use `required-message` for field-specific errors** — "Enter your email address", not "This field is required".
5. **Focus ring** uses W3C Two-Color Technique (WCAG 2.2 SC 2.4.13): `focus-visible:civ-focus-ring`.
6. **Keyboard navigation** — groups use arrow keys (RTL-aware), Home/End. Date picker uses arrows, PageUp/Down, Escape.
7. **Color is never the sole indicator.** Errors use text + border, not just color.
8. **Screen reader announcements** — use `announce(message, priority)` from `@civui/core`.
9. **Light DOM ensures DOM order matches visual order** (WCAG 2.4.3 Focus Order).
10. **`autocomplete` attribute** on inputs for name, email, tel, address fields (WCAG 1.3.5).

## Government Patterns

- **Plain language labels**: "Date of birth", not "DOB". "Social Security number", not "SSN".
- **Hint text shows format**: "For example: January 15 1990" for dates, "Include area code" for phone.
- **Validate on submit, not on blur** — users tab through forms to understand them first.
- **Error summary at top** — `civ-form` renders this automatically with anchor links to invalid fields.
- **Date components**: `civ-memorable-date` for known dates (birthday), `civ-date-picker` for scheduling.
- **Section 508** is satisfied by WCAG 2.1 AA compliance, which CivUI components provide.
- **Bilingual support**: components accept i18n label props (e.g., `choose-date-label`, `month-label`).

## Component Choice Guide

| Scenario | Use |
|----------|-----|
| Yes/no agreement | `civ-checkbox` |
| Multiple selections | `civ-checkbox-group` |
| One from 2–7 visible options | `civ-radio-group` |
| One from 8+ options | `civ-select` |
| Searchable selection from large list | `civ-combobox` |
| Immediate on/off effect | `civ-toggle` |
| UI mode switch, 2–5 options | `civ-segmented-control` |
| Scheduling / appointment date | `civ-date-picker` |
| Known past date (birthday) | `civ-memorable-date` |

## Anti-Patterns

1. **No Shadow DOM** — CivUI is Light DOM only. Tailwind breaks in Shadow DOM.
2. **No placeholder-only labels** — always set `label` or `legend`.
3. **No toggle for submit-gated choices** — use checkbox. Toggle = immediate effect.
4. **No `civ-radio` outside `civ-radio-group`** — radio has no form participation alone.
5. **No `civ-segment` outside `civ-segmented-control`** — same reason.
6. **No missing `name` attribute** — value won't appear in form data.
7. **No `focus:` prefix** — use `focus-visible:civ-focus-ring`.
8. **No generic "This field is required"** — use `required-message` with specific text.
9. **No commas in checkbox values** — `civ-checkbox-group` uses commas as delimiter.
10. **No native `input`/`change` events** — use `civ-input` and `civ-change`.
11. **No `civ-select` for < 5 options** when space allows — show all options with `civ-radio-group`.

## Testing Patterns

```javascript
import { fixture, cleanupFixtures, elementUpdated, pressKey, typeText } from '@civui/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';

afterEach(cleanupFixtures); // Required — prevents DOM pollution

const el = await fixture('<civ-text-input label="Name" name="name"></civ-text-input>');
el.value = 'test';
await elementUpdated(el);
expect(el.value).toBe('test');

// Keyboard simulation
await pressKey(el, 'ArrowDown');
await typeText(el.querySelector('input'), 'hello');

// Event assertion
const handler = vi.fn();
el.addEventListener('civ-change', handler);
```

- Tests co-located: `civ-select.ts` → `civ-select.test.ts`
- jsdom doesn't fully support ElementInternals — use `typeof setFormValue === 'function'` guards
- Vitest + jsdom environment
