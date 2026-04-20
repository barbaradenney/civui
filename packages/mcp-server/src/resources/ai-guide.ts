/**
 * Embedded AI component usage guide derived from docs/ai-guide.md.
 * Kept as a string constant so the MCP server has zero filesystem dependencies at runtime.
 */
export const AI_GUIDE = `# CivUI AI Component Usage Guide

Comprehensive reference for AI coding assistants working with CivUI — an accessibility-first
web component library for government applications built on Lit 3 and Tailwind CSS.

For architecture and internals, see \`CLAUDE.md\` in the repo root.

---

## Component Quick Reference

| Tag | Category | Key Props | Event Detail |
|-----|----------|-----------|--------------|
| \`<civ-text-input>\` | Input | \`type\`, \`width\`, \`placeholder\`, \`maxlength\`, \`pattern\`, \`autocomplete\`, \`inputmode\` | \`{ value }\` |
| \`<civ-textarea>\` | Input | \`rows\`, \`maxlength\`, \`placeholder\` | \`{ value }\` |
| \`<civ-select>\` | Input | \`options\`, \`emptyLabel\` | \`{ value }\` |
| \`<civ-combobox>\` | Input | \`options\`, \`placeholder\`, \`noResultsText\` | \`civ-input: { value }\`, \`civ-change: { value, label }\` |
| \`<civ-checkbox>\` | Choice | \`checked\`, \`indeterminate\`, \`description\`, \`tile\` | \`{ checked, value }\` |
| \`<civ-checkbox-group>\` | Group | \`legend\`, \`tile\`, \`orientation\` | \`{ values: string[] }\` |
| \`<civ-radio>\` | Choice | \`label\`, \`value\`, \`checked\`, \`description\`, \`tile\` | (bubbles to group) |
| \`<civ-radio-group>\` | Group | \`legend\`, \`tile\`, \`orientation\` | \`{ value }\` |
| \`<civ-toggle>\` | Choice | \`checked\`, \`description\` | \`{ checked, value }\` |
| \`<civ-segmented-control>\` | Group | \`legend\` | \`{ value }\` |
| \`<civ-segment>\` | Choice | \`label\`, \`value\`, \`selected\` | (bubbles to parent) |
| \`<civ-date-picker>\` | Date | \`min\`, \`max\`, \`placeholder\`, \`locale\`, \`weekStartsOn\` | \`{ value }\` |
| \`<civ-memorable-date>\` | Date | \`legend\`, \`monthLabel\`, \`dayLabel\`, \`yearLabel\`, \`locale\` | \`{ value, month, day, year }\` |
| \`<civ-date-input>\` | Date | \`min\`, \`max\` | \`{ value }\` — **DEPRECATED** |
| \`<civ-file-upload>\` | File | \`accept\`, \`multiple\`, \`maxSize\`, \`maxFiles\` | \`{ files: File[] }\` |
| \`<civ-fieldset>\` | Layout | \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\` | — |
| \`<civ-form>\` | Layout | \`action\`, \`method\` | \`civ-submit: { formData }\`, \`civ-invalid: { errors }\` |
| \`<civ-button>\` | Action | \`variant\` (primary/secondary/tertiary), \`danger\`, \`type\`, \`disabled\` | \`civ-analytics\` |
| \`<civ-link>\` | Navigation | \`href\`, \`variant\` (primary/secondary/tertiary/back/danger), \`danger\`, \`disabled\` | \`civ-analytics\` |
| \`<civ-tag>\` | Status | \`label\`, \`variant\` (blue/teal/red/green/yellow/orange/purple/gray), \`tag-style\` (primary/secondary) | — |
| \`<civ-card>\` | Layout | \`spacing\` (default/sm). Slots: \`data-card-header\`, \`data-card-footer\` | — |
| \`<civ-page-header>\` | Layout | Slots: \`data-tag\`, \`data-eyebrow\`, \`data-heading\`, \`data-subheading\` | — |
| \`<civ-link-card>\` | Navigation | \`href\`, \`heading\`, \`description\`, \`variant\` (primary/secondary/tertiary/critical) | \`civ-analytics\` |
| \`<civ-divider>\` | Layout | \`spacing\` (default/sm) | — |
| \`<civ-task-list>\` | Navigation | Container for \`<civ-task-group>\` elements | — |
| \`<civ-task-group>\` | Navigation | Slot: \`data-task-group-heading\` for group heading | — |
| \`<civ-task>\` | Navigation | \`label\`, \`hint\`, \`href\`, \`status\` (not-started/in-progress/complete/cannot-start/error) | — |
| \`<civ-progress-bar>\` | Feedback | \`value\`, \`label\`, \`status\` | — |
| \`<civ-progress-steps>\` | Feedback | \`steps\` (JSON), \`current\`, \`show-counter\`, \`clickable\`, \`orientation\` | \`civ-step-click\` |

**All form-participating components** also have: \`label\`, \`name\`, \`value\`, \`hint\`, \`error\`, \`required\`, \`disabled\`, \`requiredMessage\`, \`hide-required-indicator\`.

**Group components** (\`checkbox-group\`, \`radio-group\`, \`memorable-date\`, \`segmented-control\`) use \`legend\` instead of \`label\`.

---

## Component Catalog

### civ-text-input

Standard text input supporting multiple HTML input types.

**Props (beyond standard):**
- \`type\` — \`'text'\` | \`'email'\` | \`'number'\` | \`'password'\` | \`'search'\` | \`'tel'\` | \`'url'\` (default: \`'text'\`)
- \`width\` — \`'default'\` | \`'2xs'\` | \`'xs'\` | \`'sm'\` | \`'md'\` | \`'lg'\` | \`'xl'\` | \`'2xl'\`
- \`placeholder\` — placeholder text
- \`pattern\` — validation regex
- \`maxlength\` / \`minlength\` — character limits
- \`autocomplete\` — browser autocomplete hint
- \`inputmode\` — virtual keyboard hint

**Example:**
\`\`\`html
<civ-text-input
  label="Email address"
  name="email"
  type="email"
  hint="We'll use this to send your confirmation"
  required
  autocomplete="email"
></civ-text-input>
\`\`\`

---

### civ-textarea

Multi-line text input. Shows character count when \`maxlength\` is set.

**Props (beyond standard):**
- \`rows\` — visible text rows (default: 5)
- \`maxlength\` — max characters; enables character count display
- \`placeholder\` — placeholder text

**Example:**
\`\`\`html
<civ-textarea
  label="Describe your issue"
  name="description"
  hint="Include any relevant details"
  rows="8"
  maxlength="2000"
  required
></civ-textarea>
\`\`\`

---

### civ-select

Dropdown select. Populate via \`options\` property or slotted \`<option>\` elements.

**Props (beyond standard):**
- \`options\` — \`Array<{ value: string, label: string, disabled?: boolean }>\`
- \`emptyLabel\` — placeholder option text (default: \`'- Select -'\`)

**Example (property-driven):**
\`\`\`html
<civ-select
  label="State"
  name="state"
  hint="Select your state of residence"
  required
  .options="\${[
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' }
  ]}"
></civ-select>
\`\`\`

> Note: \`.options="\${...}"\` uses Lit property binding syntax. In plain HTML (non-template),
> set options via JavaScript: \`el.options = [...]\`.

---

### civ-combobox

Searchable dropdown with type-ahead filtering.

**Props (beyond standard):**
- \`options\` — \`Array<{ value: string, label: string }>\`
- \`placeholder\` — input placeholder
- \`noResultsText\` — shown when filter matches nothing (default: \`'No results found'\`)

**Events:**
- \`civ-input\` — \`{ value }\` (filter text changes as user types)
- \`civ-change\` — \`{ value, label }\` (option selected)

**Example:**
\`\`\`html
<civ-combobox
  label="Agency"
  name="agency"
  hint="Search by name or acronym"
  placeholder="Start typing..."
  .options="\${[
    { value: 'doj', label: 'Department of Justice' },
    { value: 'doe', label: 'Department of Energy' },
    { value: 'dod', label: 'Department of Defense' }
  ]}"
></civ-combobox>
\`\`\`

**Keyboard:** ArrowDown/Up navigate, Enter selects, Escape closes.

---

### civ-checkbox

Single checkbox. Use standalone or within \`civ-checkbox-group\`.

**Props (beyond standard):**
- \`checked\` — boolean checked state
- \`indeterminate\` — tri-state mixed indicator
- \`description\` — secondary text below the label
- \`tile\` — bordered card variant

**Event detail:** \`{ checked: boolean, value: string }\`

**Form value:** Sends \`value\` when checked, \`null\` when unchecked. Default value is \`'on'\`.

**Example (standalone):**
\`\`\`html
<civ-checkbox
  label="I agree to the terms of service"
  name="terms"
  required
></civ-checkbox>
\`\`\`

---

### civ-checkbox-group

Groups multiple checkboxes. Uses \`legend\` (not \`label\`). Multi-value.

**Props (beyond standard):**
- \`legend\` — group label (renders as \`<legend>\`)
- \`tile\` — apply tile variant to all children
- \`orientation\` — \`'vertical'\` (default) | \`'horizontal'\`

**Event detail:** \`{ values: string[] }\` — array of checked values.

**Form value:** Submits \`FormData\` with multiple entries under the same name.

**Example:**
\`\`\`html
<civ-checkbox-group
  legend="Select all that apply"
  name="interests"
  required
>
  <civ-checkbox label="Education" value="education"></civ-checkbox>
  <civ-checkbox label="Healthcare" value="healthcare"></civ-checkbox>
  <civ-checkbox label="Transportation" value="transportation"></civ-checkbox>
</civ-checkbox-group>
\`\`\`

> Note: Individual checkbox values must not contain commas (used internally as delimiter).

---

### civ-radio / civ-radio-group

Mutually exclusive choice group. \`civ-radio\` is always used inside \`civ-radio-group\`.

**Radio props:** \`label\`, \`value\`, \`checked\`, \`description\`, \`tile\`, \`disabled\`

**Radio-group props (beyond standard):**
- \`legend\` — group label
- \`tile\` — apply tile variant to all children
- \`orientation\` — \`'vertical'\` (default) | \`'horizontal'\`

**Event detail:** \`{ value: string }\` — the selected radio's value.

**Keyboard:** Arrow keys navigate (RTL-aware), Home/End jump to first/last. Roving tabindex.

**Example:**
\`\`\`html
<civ-radio-group
  legend="Preferred contact method"
  name="contact"
  required
>
  <civ-radio label="Email" value="email"></civ-radio>
  <civ-radio label="Phone" value="phone"></civ-radio>
  <civ-radio label="Mail" value="mail" description="Physical mail to your address on file"></civ-radio>
</civ-radio-group>
\`\`\`

---

### civ-toggle

On/off switch with immediate-effect semantics.

**Props (beyond standard):**
- \`checked\` — boolean toggle state
- \`description\` — secondary text below the label

**Event detail:** \`{ checked: boolean, value: string }\`

**Uses \`role="switch"\`** — not a checkbox.

**Example:**
\`\`\`html
<civ-toggle
  label="Email notifications"
  name="notifications"
  description="Receive updates about your application status"
></civ-toggle>
\`\`\`

---

### civ-segmented-control / civ-segment

Button-style radio group for mutually exclusive UI options.

**Segmented-control props (beyond standard):**
- \`legend\` — accessible label (rendered screen-reader-only)

**Segment props:** \`label\`, \`value\`, \`selected\`, \`disabled\`

**Keyboard:** Arrow keys navigate (RTL-aware). Roving tabindex.

**Example:**
\`\`\`html
<civ-segmented-control
  legend="View mode"
  name="view"
>
  <civ-segment label="List" value="list"></civ-segment>
  <civ-segment label="Grid" value="grid"></civ-segment>
  <civ-segment label="Map" value="map"></civ-segment>
</civ-segmented-control>
\`\`\`

---

### civ-date-picker

Calendar dialog with text input. Preferred for appointment/scheduling dates.

**Props (beyond standard):**
- \`min\` / \`max\` — date range constraints (YYYY-MM-DD)
- \`placeholder\` — input placeholder (default: \`'mm/dd/yyyy'\`)
- \`locale\` — date formatting locale (default: \`'en-US'\`)
- \`weekStartsOn\` — 0 = Sunday (default), 1 = Monday

**i18n props:** \`chooseDateLabel\`, \`selectedDateLabel\`, \`dialogLabel\`, \`previousMonthLabel\`, \`nextMonthLabel\`, \`dialogOpenedMessage\`, \`dateSelectedMessage\`, \`todayLabel\`

**Form value:** YYYY-MM-DD string.

**Keyboard (in calendar dialog):** Arrow keys navigate days, PageUp/Down navigate months, Shift+PageUp/Down navigate years, Enter/Space select, Escape closes.

**Example:**
\`\`\`html
<civ-date-picker
  label="Appointment date"
  name="appointment"
  hint="Select an available date"
  min="2026-01-01"
  max="2026-12-31"
  required
></civ-date-picker>
\`\`\`

---

### civ-memorable-date

Three-field date entry (Month select + Day input + Year input). Preferred for known dates like birthdays.

**Props (beyond standard):**
- \`legend\` — group label
- \`monthLabel\`, \`dayLabel\`, \`yearLabel\` — field labels (default: \`'Month'\`, \`'Day'\`, \`'Year'\`)
- \`monthEmptyLabel\` — month select placeholder (default: \`'- Month -'\`)
- \`dayPlaceholder\`, \`yearPlaceholder\` — input placeholders
- \`locale\` — month name formatting locale (default: \`'en-US'\`)

**i18n props:** \`dateSetMessage\`, \`invalidDateMessage\`

**Event detail:** \`{ value: string, month: string, day: string, year: string }\`

**Form value:** YYYY-MM-DD string. Empty if any field is incomplete.

**Example:**
\`\`\`html
<civ-memorable-date
  legend="Date of birth"
  name="dob"
  hint="For example: January 15 1990"
  required
></civ-memorable-date>
\`\`\`

---

### civ-date-input — DEPRECATED

Native date input. **Do not use in new code.** Known issues with Dragon NaturallySpeaking, VoiceOver on Safari, and TalkBack on Firefox. Use \`civ-date-picker\` or \`civ-memorable-date\` instead.

---

### civ-file-upload

Drag-and-drop file upload with validation.

**Props (beyond standard):**
- \`accept\` — MIME types / extensions (e.g., \`'.pdf,.jpg,image/*'\`)
- \`multiple\` — allow multiple files
- \`maxSize\` — max file size in bytes (0 = unlimited)
- \`maxFiles\` — max file count (0 = unlimited)

**i18n props:** \`dragText\`, \`browseText\`, \`acceptedLabel\`, \`maxSizeLabel\`, \`removeText\`, \`removeAriaLabel\`, \`filesListLabel\`, \`fileAddedMessage\`, \`fileRemovedMessage\`, \`fileSizeError\`, \`fileTypeError\`, \`maxFilesError\`

**Event detail:** \`{ files: File[] }\`

**Example:**
\`\`\`html
<civ-file-upload
  label="Supporting documents"
  name="documents"
  hint="Upload PDF or image files"
  accept=".pdf,.jpg,.png,image/*"
  multiple
  max-size="5242880"
  max-files="5"
  required
></civ-file-upload>
\`\`\`

---

### civ-fieldset

Structural grouping wrapper. Not a form-participating element.

**Props:** \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\`

**Example:**
\`\`\`html
<civ-fieldset legend="Mailing address" hint="Enter your current mailing address">
  <civ-text-input label="Street address" name="street" required></civ-text-input>
  <civ-text-input label="City" name="city" required></civ-text-input>
  <civ-select label="State" name="state" required .options="\${stateOptions}"></civ-select>
  <civ-text-input label="ZIP code" name="zip" required pattern="[0-9]{5}(-[0-9]{4})?"></civ-text-input>
</civ-fieldset>
\`\`\`

---

### civ-form

Form validation coordinator. Renders error summary, handles submit/reset.

**Props:** \`action\`, \`method\` (\`'get'\` | \`'post'\`)

**Events:**
- \`civ-submit\` — \`{ formData: Record<string, string> }\` (valid submission)
- \`civ-invalid\` — \`{ errors: FormFieldError[] }\` (validation failed; each error has \`name\`, \`message\`, \`element\`)

**Methods:** \`validate()\`, \`clearErrors()\`, \`getFormData()\`

**Example:**
\`\`\`html
<civ-form @civ-submit="\${handleSubmit}" @civ-invalid="\${handleErrors}">
  <civ-text-input label="Full name" name="name" required></civ-text-input>
  <civ-text-input label="Email" name="email" type="email" required></civ-text-input>
  <civ-textarea label="Message" name="message" required></civ-textarea>
  <button type="submit">Submit</button>
  <button type="reset">Clear</button>
</civ-form>
\`\`\`

On validation failure, \`civ-form\` renders an error summary with anchor links to each invalid field.

### civ-button

Action button. Always renders a \`<button>\` element. For links, use \`<civ-link>\`.

**Variants:** \`primary\` (filled blue), \`secondary\` (outlined border), \`tertiary\` (gray, input-height)
**Props:** \`label\`, \`variant\`, \`danger\` (boolean), \`type\` (button/submit/reset), \`disabled\`

\`\`\`html
<civ-button label="Submit" type="submit"></civ-button>
<civ-button label="Cancel" variant="tertiary"></civ-button>
<civ-button label="Delete" variant="secondary" danger></civ-button>
\`\`\`

### civ-link

Navigation link. Always renders an \`<a>\` element. For actions, use \`<civ-button>\`.

**Variants:** \`primary\` (button-styled), \`secondary\` (underlined + trailing caret), \`tertiary\` (plain underlined, default), \`back\` (leading chevron-left)
**Props:** \`label\`, \`href\`, \`variant\`, \`danger\` (boolean), \`disabled\`

\`\`\`html
<civ-link href="/details" variant="secondary">View details</civ-link>
<civ-link href="/hub" variant="back" label="Back to task list"></civ-link>
<civ-link href="/remove" variant="tertiary" danger>Remove item</civ-link>
\`\`\`

### civ-tag

Status label. Two emphasis levels: secondary (light bg, dark text) and primary (dark bg, light text).

**Props:** \`label\`, \`variant\` (blue/teal/red/green/yellow/orange/purple/gray), \`tag-style\` (primary/secondary)

\`\`\`html
<civ-tag label="Not started" variant="blue"></civ-tag>
<civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
\`\`\`

### civ-page-header

Structured page heading with four slot areas: tag, eyebrow, heading, subheading.

**Slots:** \`data-tag\` (above eyebrow), \`data-eyebrow\`, \`data-heading\`, \`data-subheading\`

\`\`\`html
<civ-page-header>
  <civ-tag data-tag label="Active" variant="green" tag-style="primary"></civ-tag>
  <span data-eyebrow>Benefits</span>
  <h1 data-heading class="civ-heading-xl">
    Apply for disability compensation
    <civ-tag label="In progress" variant="teal"></civ-tag>
  </h1>
  <span data-subheading>VA Form 21-526EZ</span>
</civ-page-header>
\`\`\`

### civ-link-card

Clickable card that navigates to a destination. The entire card is the click target.

**Variants:** \`primary\` (blue filled), \`secondary\` (blue border), \`tertiary\` (gray border), \`critical\` (#face00 gold)
**Props:** \`href\`, \`heading\`, \`description\`, \`variant\`

\`\`\`html
<civ-link-card href="/apply" heading="Apply for benefits" description="Start your application."></civ-link-card>
<civ-link-card href="/action" heading="Action needed" description="Upload documents." variant="critical"></civ-link-card>
\`\`\`

### civ-card

Structured container with header, body, and footer slots.

**Props:** \`spacing\` (default/sm)
**Slots:** \`data-card-header\`, \`data-card-footer\`. Everything else goes in the body.

\`\`\`html
<civ-card>
  <div data-card-header>
    <civ-tag label="In progress" variant="teal"></civ-tag>
    <h3 class="civ-heading-md">Disability compensation</h3>
  </div>
  <p>Filed: March 10, 2026</p>
  <div data-card-footer>
    <civ-link href="#" variant="secondary">View details</civ-link>
  </div>
</civ-card>
\`\`\`

### civ-task-list / civ-task-group / civ-task

Task list navigation for multi-chapter forms. Tasks show a label, optional hint, and status tag.

**civ-task props:** \`label\`, \`hint\`, \`href\`, \`status\` (not-started/in-progress/complete/cannot-start/error)
**civ-task-group slot:** \`data-task-group-heading\` for the group heading

\`\`\`html
<civ-task-list>
  <civ-task-group>
    <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
    <civ-task label="Personal info" href="#/personal" status="complete"></civ-task>
    <civ-task label="Contact info" hint="Phone needed" href="#/contact" status="in-progress"></civ-task>
    <civ-task label="Service history" status="cannot-start"></civ-task>
  </civ-task-group>
</civ-task-list>
\`\`\`

### civ-progress-steps

Step indicator for multi-step forms. Shows numbered circles with labels.

**Props:** \`steps\` (JSON array of labels or objects), \`current\` (0-based index), \`show-counter\`, \`clickable\`, \`orientation\`

\`\`\`html
<civ-progress-steps
  steps='["Your name","Date of birth","SSN"]'
  current="1"
  show-counter
></civ-progress-steps>
\`\`\`

---

## Component Selection Guide

### When to use which choice component

| Scenario | Component | Why |
|----------|-----------|-----|
| Single yes/no agreement | \`civ-checkbox\` | Single boolean, often standalone |
| Multiple selections from a list | \`civ-checkbox-group\` | Multi-select with group label |
| One choice from 2–7 options | \`civ-radio-group\` | Visible options, mutually exclusive |
| One choice from 8+ options | \`civ-select\` | Scrollable, saves space |
| One choice from large list, user knows value | \`civ-combobox\` | Type-ahead search |
| Immediate on/off toggle | \`civ-toggle\` | Instant effect (no submit needed) |
| UI mode switch, 2–5 options | \`civ-segmented-control\` | Visible, button-style |

### When to use which date component

| Scenario | Component | Why |
|----------|-----------|-----|
| Scheduling / appointment selection | \`civ-date-picker\` | Calendar browsing, min/max range |
| Known past date (birthday, issue date) | \`civ-memorable-date\` | Three-field entry, no calendar needed |
| **Never** | \`civ-date-input\` | Deprecated — accessibility issues |

### checkbox vs toggle

- **Checkbox**: Choice requires a form submit to take effect. "I agree", "Select features", preference lists.
- **Toggle**: Takes effect immediately on click. "Enable notifications", "Dark mode", feature switches.

---

## Usage Patterns

### Complete form with validation

\`\`\`html
<civ-form @civ-submit="\${this._onSubmit}" @civ-invalid="\${this._onInvalid}">
  <civ-fieldset legend="Personal information">
    <civ-text-input
      label="Full name"
      name="fullName"
      required
      autocomplete="name"
    ></civ-text-input>

    <civ-text-input
      label="Email address"
      name="email"
      type="email"
      required
      autocomplete="email"
    ></civ-text-input>

    <civ-text-input
      label="Phone number"
      name="phone"
      type="tel"
      hint="Include area code"
      autocomplete="tel"
      inputmode="tel"
    ></civ-text-input>
  </civ-fieldset>

  <civ-fieldset legend="Application details">
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 15 1990"
      required
    ></civ-memorable-date>

    <civ-select
      label="Application type"
      name="appType"
      required
      .options="\${[
        { value: 'new', label: 'New application' },
        { value: 'renewal', label: 'Renewal' },
        { value: 'amendment', label: 'Amendment' }
      ]}"
    ></civ-select>

    <civ-textarea
      label="Additional comments"
      name="comments"
      maxlength="1000"
    ></civ-textarea>
  </civ-fieldset>

  <civ-file-upload
    label="Supporting documents"
    name="docs"
    accept=".pdf,.jpg,.png"
    multiple
    max-size="10485760"
  ></civ-file-upload>

  <civ-checkbox
    label="I certify the information above is accurate"
    name="certify"
    required
  ></civ-checkbox>

  <button type="submit">Submit application</button>
  <button type="reset">Clear form</button>
</civ-form>
\`\`\`

### Event handling

\`\`\`javascript
// Listen for value changes
el.addEventListener('civ-input', (e) => {
  console.log('Current value:', e.detail.value);
});

// Listen for committed changes
el.addEventListener('civ-change', (e) => {
  console.log('Committed value:', e.detail.value);
});

// Multi-value (checkbox-group)
groupEl.addEventListener('civ-change', (e) => {
  console.log('Selected:', e.detail.values); // string[]
});

// File upload
uploadEl.addEventListener('civ-change', (e) => {
  console.log('Files:', e.detail.files); // File[]
});

// Form submission
formEl.addEventListener('civ-submit', (e) => {
  const data = e.detail.formData; // Record<string, string>
  fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
});

// Form validation failure
formEl.addEventListener('civ-invalid', (e) => {
  console.log('Errors:', e.detail.errors);
  // Each error: { name, message, element }
});
\`\`\`

### Error handling flow

\`\`\`javascript
// Server-side validation — set errors on individual fields
async function handleSubmit(e) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(e.detail.formData)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    // errors: [{ field: 'email', message: 'Email already registered' }]
    for (const err of errors) {
      const field = document.querySelector(\`[name="\${CSS.escape(err.field)}"]\`);
      if (field) field.error = err.message;
    }
  }
}

// Clear errors before re-submit
formEl.clearErrors();
\`\`\`

### Screen reader announcements

\`\`\`javascript
import { announce } from '@civui/core';

// Polite — non-urgent status updates
announce('Form saved successfully');
announce('3 results found');

// Assertive — urgent, time-sensitive
announce('Session expires in 2 minutes', 'assertive');
announce('Error: payment declined', 'assertive');
\`\`\`

---

## Government Design Patterns

### Section 508 compliance

CivUI components are built for WCAG 2.1 AA (which satisfies Section 508). Key patterns:

1. **Every input must have a visible label.** Never use \`placeholder\` as the only label.
2. **Required fields** use \`required\` attribute — renders asterisk and sets \`aria-required="true"\`.
3. **Error messages** render with \`role="alert"\` for immediate screen reader announcement.
4. **Focus management** — all interactive elements are keyboard accessible. Dialogs trap focus. Groups use roving tabindex.
5. **Color is never the sole indicator.** Errors use text + border, not just red color.
6. **Focus ring** meets WCAG 2.2 SC 2.4.13 — W3C Two-Color Technique (C40) with 3px outline + 2px offset + halo shadow.

### Plain language requirements

Government forms must use clear, jargon-free labels. CivUI supports this through:

- \`label\` / \`legend\` — use plain language: "Date of birth", not "DOB" or "Natal Date"
- \`hint\` — explain what's expected: "For example: January 15 1990"
- \`error\` — state what went wrong and how to fix it: "Enter a valid email address"
- \`requiredMessage\` — customize the required error: "Enter your email address" (not "This field is required")

### Required fields in government forms

Always mark required fields with the \`required\` attribute:

\`\`\`html
<civ-text-input
  label="Social Security number"
  name="ssn"
  required
  required-message="Enter your Social Security number"
  hint="We need this to verify your identity"
  type="tel"
  inputmode="numeric"
  pattern="[0-9]{3}-?[0-9]{2}-?[0-9]{4}"
></civ-text-input>
\`\`\`

### Date input rules for government forms

| Date Type | Component | Example |
|-----------|-----------|---------|
| Date of birth | \`civ-memorable-date\` | "When were you born?" |
| Document issue/expiry | \`civ-memorable-date\` | "Passport expiration date" |
| Appointment scheduling | \`civ-date-picker\` | "Select your appointment date" |
| Travel dates with range | \`civ-date-picker\` with \`min\`/\`max\` | "Choose a date within the filing period" |

Always provide a hint showing the expected format. For memorable-date: "For example: January 15 1990". For date-picker: default placeholder is "mm/dd/yyyy".

### Form validation for .gov applications

1. **Validate on submit, not on blur** — government form users often tab through fields to understand the form first.
2. **Error summary at top** — \`civ-form\` renders this automatically on validation failure with anchor links to each invalid field.
3. **Field-level errors** — set the \`error\` prop on individual fields after server validation.
4. **Custom required messages** — use \`required-message\` to provide field-specific instructions instead of generic "This field is required".
5. **Progressive disclosure** — group related fields with \`civ-fieldset\` and break long forms into logical sections.

### Bilingual/i18n support

Most components support label customization for i18n:

\`\`\`html
<!-- Spanish date picker -->
<civ-date-picker
  label="Fecha de cita"
  name="appointment"
  locale="es-US"
  choose-date-label="Elegir fecha"
  dialog-label="Elegir fecha"
  previous-month-label="Mes anterior"
  next-month-label="Mes siguiente"
></civ-date-picker>
\`\`\`

---

## Accessibility Requirements

### WCAG 2.1 AA checklist for CivUI components

| Criterion | How CivUI Addresses It |
|-----------|----------------------|
| 1.1.1 Non-text Content | Labels rendered as text, not images |
| 1.3.1 Info and Relationships | Semantic HTML (fieldset/legend, label/input), ARIA attributes |
| 1.3.5 Identify Input Purpose | Support \`autocomplete\` attribute on text inputs |
| 2.1.1 Keyboard | All controls keyboard accessible, arrow nav in groups |
| 2.1.2 No Keyboard Trap | Focus trap only in modal dialogs, Escape closes |
| 2.4.3 Focus Order | DOM order matches visual order (Light DOM) |
| 2.4.7 Focus Visible | \`focus-visible:civ-focus-ring\` on all interactive elements |
| 2.4.13 Focus Appearance | W3C Two-Color Technique, 3px outline, WCAG 2.2 |
| 3.2.2 On Input | No unexpected context changes on input |
| 3.3.1 Error Identification | \`role="alert"\` on error messages |
| 3.3.2 Labels or Instructions | Visible labels + hint text |
| 3.3.3 Error Suggestion | Error messages include correction guidance |
| 4.1.2 Name, Role, Value | ElementInternals + ARIA roles |

### Keyboard patterns by component

| Component | Keys |
|-----------|------|
| Text input, textarea, select | Standard native behavior |
| Checkbox, toggle | Space to toggle |
| Radio group | Arrow keys (RTL-aware), Home/End |
| Combobox | ArrowDown/Up, Enter, Escape |
| Segmented control | Arrow keys (RTL-aware), Home/End |
| Date picker dialog | Arrows (day), PageUp/Down (month), Shift+PageUp/Down (year), Enter, Escape |
| File upload dropzone | Enter/Space to open file browser |

### RTL support

Radio groups, segmented controls, and date pickers reverse arrow key behavior in RTL contexts. The \`isRtl()\` utility from \`@civui/core\` detects direction from CSS computed styles.

---

## Anti-Patterns

Avoid these common mistakes when using CivUI components:

1. **Never use Shadow DOM.** CivUI uses Light DOM exclusively. Do not override \`createRenderRoot()\` to return a shadow root. Tailwind classes will not work inside Shadow DOM.

2. **Never use placeholder as a label.** Always set the \`label\` (or \`legend\` for groups) prop. Placeholder text disappears on focus and fails accessibility.

3. **Never use \`civ-date-input\`.** It is deprecated. Use \`civ-date-picker\` for scheduling or \`civ-memorable-date\` for known dates.

4. **Never use \`civ-toggle\` for choices that require form submission.** Toggles have immediate-effect semantics. Use \`civ-checkbox\` for choices that take effect on submit.

5. **Never put \`civ-radio\` outside a \`civ-radio-group\`.** Radios are not form-participating on their own. The group handles form integration, keyboard navigation, and ARIA.

6. **Never put \`civ-segment\` outside a \`civ-segmented-control\`.** Same reason as radios.

7. **Never omit \`name\` on form-participating components.** Without \`name\`, the value won't appear in form data.

8. **Never use \`focus:\` prefix for focus styles.** Use \`focus-visible:civ-focus-ring\` for keyboard-only focus indication.

9. **Never use generic required messages.** Use \`required-message\` with field-specific text: "Enter your email address", not "This field is required".

10. **Never put commas in checkbox values** when using \`civ-checkbox-group\`. Commas are used internally as the value delimiter.

11. **Never skip \`afterEach(cleanupFixtures)\` in tests.** Test fixtures accumulate in the DOM and cause cross-test pollution.

12. **Never assume ElementInternals works in tests.** jsdom doesn't fully support it. Use guards: \`typeof this._internals?.setFormValue === 'function'\`.

13. **Never use \`civ-select\` for fewer than 5 options** when all options can be displayed. Use \`civ-radio-group\` to show all choices at once.

14. **Never dispatch native \`input\` or \`change\` events.** Always use \`civ-input\` and \`civ-change\` custom events.

---

## Tailwind & CSS Reference

### Prefix

All Tailwind utilities use the \`civ-\` prefix:

\`\`\`html
<!-- Correct -->
<div class="civ-p-4 civ-text-base civ-bg-primary">

<!-- Wrong — no prefix -->
<div class="p-4 text-base bg-primary">
\`\`\`

### Semantic color classes

| Token | Usage |
|-------|-------|
| \`civ-text-primary\` / \`civ-bg-primary\` | Brand primary, links, selected state |
| \`civ-text-error\` / \`civ-bg-error\` | Validation errors, required marks |
| \`civ-text-warning\` / \`civ-bg-warning\` | Warning messages |
| \`civ-text-success\` / \`civ-bg-success\` | Success confirmations |
| \`civ-text-info\` / \`civ-bg-info\` | Informational messages |
| \`civ-text-base\` / \`civ-bg-base\` | Default text and backgrounds |

Each color has shades: \`lightest\`, \`lighter\`, \`light\`, DEFAULT, \`vivid\` (primary only), \`dark\`, \`darker\`.

Example: \`civ-bg-error-lighter\`, \`civ-text-primary-dark\`, \`civ-border-base-light\`.

### Focus ring

\`\`\`html
<!-- Standard focus ring (keyboard-only) -->
<button class="focus-visible:civ-focus-ring">Click me</button>

<!-- Inverse variant (for dark backgrounds) -->
<button class="focus-visible:civ-focus-ring-inverse">Click me</button>
\`\`\`

The focus ring uses the W3C Two-Color Technique: 3px solid outline at 2px offset with a halo shadow for contrast.

### Density system

Switch layout density at any container level:

\`\`\`html
<!-- Spacious: 1.25x spacing, larger fonts -->
<div data-civ-scale="spacious">...</div>

<!-- Default: standard spacing -->
<div>...</div>

<!-- Dense: 0.75x spacing, smaller fonts -->
<div data-civ-scale="dense">...</div>
\`\`\`

All CivUI spacing and font-size utilities scale proportionally through CSS variables.

### Component CSS classes

These classes are defined in the design system and used internally by components:

| Class | Purpose |
|-------|---------|
| \`.civ-label\` | Standard form label |
| \`.civ-legend\` | Fieldset legend |
| \`.civ-required-mark\` | Required asterisk |
| \`.civ-hint\` | Hint text below label |
| \`.civ-error-text\` | Error message with \`role="alert"\` |
| \`.civ-input\` | Standard form input styling |
| \`.civ-fieldset\` | Fieldset reset |
| \`.civ-check-input\` | Checkbox/radio input |
| \`.civ-check-tile\` | Tile variant wrapper |
| \`.civ-toggle-track\` | Toggle switch track |
| \`.civ-toggle-thumb\` | Toggle switch thumb |
| \`.civ-segment-btn\` | Segmented control button |
| \`.civ-dropzone\` | File upload drop area |
| \`.civ-combobox-listbox\` | Combobox dropdown |
| \`.civ-datepicker-dialog\` | Date picker calendar dialog |
| \`.civ-form-error-summary\` | Form error summary box |

### Logical properties (RTL-safe)

CivUI provides logical-direction utilities:
- \`.civ-border-s-4\` / \`.civ-border-s-0\` — inline-start border
- \`.civ-rounded-s\` / \`.civ-rounded-e\` — start/end border radius
- \`.civ-me-2\` / \`.civ-ms-2\` — inline-end/start margin

### Dark mode

Dark mode activates via \`prefers-color-scheme: dark\`. All semantic color tokens have dark-mode overrides. Focus ring colors invert in dark mode automatically.

### Windows High Contrast Mode

Components include \`@media (forced-colors: active)\` overrides for date pickers, combobox options, checkboxes, toggles, and file uploads.

---

## Testing Quick Reference

\`\`\`javascript
import { fixture, cleanupFixtures, elementUpdated, pressKey, typeText } from '@civui/test-utils';

// Setup & teardown
afterEach(cleanupFixtures);

// Create component
const el = await fixture('<civ-text-input label="Name" name="name"></civ-text-input>');

// Update and wait
el.value = 'test';
await elementUpdated(el);

// Simulate keyboard
await pressKey(el, 'Enter');
await pressKey(el, 'ArrowDown');

// Simulate typing
await typeText(el.querySelector('input'), 'hello');

// Listen for events
const handler = vi.fn();
el.addEventListener('civ-change', handler);
\`\`\`

See \`CLAUDE.md\` for full testing patterns and ElementInternals guards.
`;
