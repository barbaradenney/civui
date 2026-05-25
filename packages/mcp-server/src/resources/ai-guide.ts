/**
 * Embedded AI component usage guide derived from docs/ai-guide.md.
 * Kept as a string constant so the MCP server has zero filesystem dependencies at runtime.
 */
export const AI_GUIDE = `# CivUI AI Component Usage Guide

Comprehensive reference for AI coding assistants working with CivUI — an accessibility-first
web component library for government applications built on Lit 3 and Tailwind CSS.

For architecture and internals, see \`CLAUDE.md\` in the repo root.

> **Working through the MCP server?** Reach for the focused per-component tools before pulling this whole guide into context — they're cheaper and more current:
> - \`search_components({ query: "user uploads ID and signs" })\` — natural-language → ranked component matches
> - \`get_component_examples({ name: "civ-text-input" })\` — canonical snippets pulled from \`*.stories.ts\`
> - \`get_component_guide({ name: "civ-text-input" })\` — schema + examples + matching trap excerpts in one focused payload
>
> Use this guide for the broad catalog overview, the component-selection tables, and the cross-cutting design rules. Use the tools when you know the affordance you need.

---

## Component Quick Reference

| Tag | Category | Key Props | Event Detail |
|-----|----------|-----------|--------------|
| \`<civ-text-input>\` | Input | \`type\`, \`width\`, \`placeholder\`, \`maxlength\`, \`pattern\`, \`autocomplete\`, \`inputmode\` | \`{ value }\` |
| \`<civ-textarea>\` | Input | \`rows\`, \`maxlength\`, \`placeholder\` | \`{ value }\` |
| \`<civ-select>\` | Input | \`options\`, \`emptyLabel\`, \`preset\`, \`preset-variant\` | \`{ value }\` |
| \`<civ-combobox>\` | Input | \`options\`, \`placeholder\`, \`noResultsText\` | \`civ-input: { value }\`, \`civ-change: { value, label }\` |
| \`<civ-checkbox>\` | Choice | \`checked\`, \`indeterminate\`, \`description\`, \`tile\` | \`{ checked, value }\` |
| \`<civ-checkbox-group>\` | Group | \`legend\`, \`tile\`, \`orientation\`, \`preset\`, \`preset-variant\` | \`{ values: string[] }\` |
| \`<civ-radio>\` | Choice | \`label\`, \`value\`, \`checked\`, \`description\`, \`tile\` | (bubbles to group) |
| \`<civ-radio-group>\` | Group | \`legend\`, \`tile\`, \`orientation\`, \`preset\`, \`preset-variant\` | \`{ value }\` |
| \`<civ-toggle>\` | Choice | \`checked\`, \`description\` | \`{ checked, value }\` |
| \`<civ-segmented-control>\` | Group | \`legend\` | \`{ value }\` |
| \`<civ-segment>\` | Choice | \`label\`, \`value\`, \`selected\` | (bubbles to parent) |
| \`<civ-date-picker>\` | Date | \`min\`, \`max\`, \`placeholder\`, \`locale\`, \`weekStartsOn\` | \`{ value }\` |
| \`<civ-memorable-date>\` | Date | \`legend\`, \`monthLabel\`, \`dayLabel\`, \`yearLabel\`, \`locale\` | \`{ value, month, day, year }\` |
| \`<civ-file-upload>\` | File | \`accept\`, \`multiple\`, \`maxSize\`, \`maxFiles\` | \`{ files: File[] }\` |
| \`<civ-fieldset>\` | Wrapper | \`legend\`, \`hint\`, \`error\`, \`required\`, \`touched\`, \`heading-level\` (1-6), \`size\` (sm/md/lg/xl) | — |
| \`<civ-fieldset>\` | Layout | \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\`, \`heading-level\` (1-6), \`size\` (sm/md/lg/xl) | — |
| \`<civ-form>\` | Layout | \`action\`, \`method\` | \`civ-submit: { formData }\`, \`civ-invalid: { errors }\` |
| \`<civ-button>\` | Action | \`variant\` (primary/secondary/tertiary), \`danger\`, \`type\`, \`disabled\` | \`civ-analytics\` |
| \`<civ-filter-chip>\` | Action | \`label\`, \`value\`, \`selected\`, \`removable\`, \`disabled\`, \`chip-style\` (primary/secondary), \`chip-role\` (toggle/radio — set automatically by group in single mode), \`spacing\` (default/sm), \`icon-start\`, \`icon-end\`, \`count\`. Renders a non-interactive wrapper with sibling toggle + remove buttons. | \`civ-change\`, \`civ-remove\`, \`civ-analytics\` |
| \`<civ-filter-chip-group>\` | Action | \`mode\` (single/multi), \`label\`. Wraps a row of chips with roving tabindex (arrow-key navigation) and an aggregated \`civ-change\` event carrying \`value\` (string in single mode, array in multi). | \`civ-change\` |
| \`<civ-link>\` | Navigation | \`href\`, \`variant\` (primary/secondary/back), \`type\` (phone/email/download), \`danger\`, \`disabled\` | \`civ-analytics\` |
| \`<civ-tag>\` | Layout | \`label\`, \`variant\` (blue/orange/purple/gray), \`tag-style\` (primary/secondary), \`spacing\` (default/sm), \`icon-start\`. Categorization only — use \`<civ-badge>\` for status. | — |
| \`<civ-badge>\` | Feedback | \`label\`, \`dot\`, \`variant\` (info/warning/error/success/neutral), \`badge-style\` (primary/secondary), \`spacing\` (default/sm), \`overlay\`, \`with-icon\` (auto variant icon), \`icon-start\`, \`icon-end\`. Status pills + notification dots with \`role="status"\`. | — |
| \`<civ-count>\` | Feedback | \`count\`, \`max\`, \`variant\`, \`count-style\` (primary/secondary), \`spacing\`, \`overlay\`, \`live\` (off/polite/assertive). Numeric annotation; lighter chrome than badge. Used inside chips, list items, and as notification overlays. | — |
| \`<civ-card>\` | Layout | \`spacing\` (default/sm). Slots: \`data-card-header\`, \`data-card-footer\` | — |
| \`<civ-page-header>\` | Layout | Slots: \`data-tag\`, \`data-eyebrow\`, \`data-heading\`, \`data-subheading\` | — |
| \`<civ-link-card>\` | Navigation | \`href\`, \`heading\`, \`description\`, \`variant\` (primary/secondary/tertiary/critical) | \`civ-analytics\` |
| \`<civ-divider>\` | Layout | \`spacing\` (default/sm) | — |
| \`<civ-list>\` | Layout | \`dividers\` (boolean) — generic list container. Renders \`<ul role="list">\`. Use for task lists, side nav, link collections, search results. | — |
| \`<civ-list-item>\` | Layout | \`href\` (optional) — when set, the whole row becomes a clickable anchor. Use the \`data-list-item-end\` attribute on a child to place trailing content (status tag, switch, etc.). | \`civ-analytics\` |
| \`<civ-progress-percent>\` | Feedback | \`value\`, \`label\`, \`status\` | — |
| \`<civ-progress-steps>\` | Feedback | \`steps\` (JSON), \`current\`, \`show-counter\`, \`clickable\` | \`civ-step-click\` |
| \`<civ-form-step>\` | Form | \`persist\`, \`sensitive\`, \`show-pause\`, \`continue-label\`, \`complete-label\`, \`pause-label\`, \`nav-disabled\`, \`validate\` | \`civ-step-complete\`, \`civ-step-pause\` |
| \`<civ-yes-no>\` | Choice | \`legend\`, \`yes-label\`, \`no-label\`, \`unsure-label\`, \`skip-label\` | \`{ value }\` |
| \`<civ-conditional>\` | Layout | \`when\`, \`equals\`, \`not-equals\`, \`includes\`, \`has-value\`, \`matches\` | — |
| \`<civ-alert>\` | Feedback | \`intent\` (info/warning/error/success), \`heading\`, \`dismissible\`, \`slim\`, \`spacing\` (default/sm), \`emphasis\` | \`civ-dismiss\` |
| \`<civ-modal>\` | Overlay | \`open\`, \`heading\`, \`label\`, \`no-close-button\`, \`no-backdrop-close\`, \`no-escape-close\` | \`civ-close\` |
| \`<civ-action-sheet>\` | Overlay | \`open\`, \`max-height\`, \`trap-focus\`, \`no-click-outside-close\` | \`civ-close\` |
| \`<civ-address>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`hide-street2\`, \`show-country\`, \`show-military\` | \`{ value: AddressValue }\` |
| \`<civ-name>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`format\`, \`hide-middle\`, \`hide-suffix\` | \`{ value: NameValue }\` |
| \`<civ-direct-deposit>\` | Compound | \`legend\`, \`heading-level\`, \`size\` | \`{ value: DirectDepositValue }\` |
| \`<civ-signature>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`statement\` | \`{ value: { name, certified, signedAt } }\` |
| \`<civ-relationship>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`preset\`, \`show-deceased\`, \`hide-name\` | \`{ value: RelationshipValue }\` |
| \`<civ-race-ethnicity>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`ethnicity-legend\`, \`race-legend\` | \`{ value: RaceEthnicityValue }\` |
| \`<civ-partnership-history>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`show-marriage-type\`, \`status-assumed\` | \`{ value: PartnershipValue }\` |
| \`<civ-service-history>\` | Compound | \`legend\`, \`heading-level\`, \`size\`, \`show-service-number\` | \`{ value: ServicePeriodValue }\` |
| \`<civ-ssn>\` | Preset | \`mode\` (full/last4) | \`{ value }\` |
| \`<civ-ein>\` | Preset | — | \`{ value }\` |
| \`<civ-phone>\` | Preset | \`international\` | \`{ value }\` |
| \`<civ-email>\` | Preset | — | \`{ value }\` |
| \`<civ-zip>\` | Preset | \`extended\` | \`{ value }\` |
| \`<civ-currency>\` | Preset | — | \`{ value }\` |
| \`<civ-routing-number>\` | Preset | — | \`{ value }\` |
| \`<civ-va-file-number>\` | Preset | — | \`{ value }\` |
| \`<civ-country>\` | Preset | \`us-first\`, \`include\`, \`exclude\` | \`{ value }\` |
| \`<civ-image-preview>\` | Layout | \`src\`, \`alt\`, \`filename\`, \`file-size\`, \`size\` | — |
| \`<civ-skip-link>\` | Navigation | \`label\`, \`href\` | — |
| \`<civ-icon>\` | UI | \`name\`, \`label\` | — |

**All form-participating components** also have: \`name\`, \`value\`, \`required\`, \`disabled\`.

**Self-contained pattern:** Every CivUI control renders its own label / legend chrome — set \`label="..."\` directly on single inputs and \`legend="..."\` directly on group components (\`radio-group\`, \`checkbox-group\`, \`segmented-control\`, \`yes-no\`, \`memorable-date\`, \`date-range-picker\`). \`<civ-fieldset>\` exists only for genuine multi-field grouping.

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
<civ-text-input label="Email address" hint="We'll use this to send your confirmation" name="email" type="email" required autocomplete="email"></civ-text-input>
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
<civ-textarea label="Describe your issue" hint="Include any relevant details" name="description" rows="8" maxlength="2000" required></civ-textarea>
\`\`\`

---

### civ-select

Dropdown select. Populate via \`options\` property, slotted \`<option>\` elements, or the \`preset\` attribute.

**Props (beyond standard):**
- \`options\` — \`Array<{ value: string, label: string, disabled?: boolean }>\`
- \`emptyLabel\` — placeholder option text (default: \`'- Select -'\`)
- \`preset\` — pre-built option list: \`'us-state'\`, \`'service-branch'\`, \`'discharge-type'\`, \`'suffix'\`, \`'relationship-type'\`, \`'marital-status'\`, \`'ethnicity'\`, \`'gender'\`, \`'language'\`, \`'housing-status'\`, \`'education-level'\`, \`'employment-status'\`, \`'income-source'\`, \`'veteran-status'\`, \`'disability-type'\`, \`'citizenship-status'\`, \`'pay-frequency'\`, \`'contact-preference'\`
- \`preset-variant\` — variant of the preset (e.g., \`'territories'\`, \`'all'\`, \`'binary'\`)

> Presets also work on \`<civ-radio-group>\` and \`<civ-checkbox-group>\` with the same \`preset\` / \`preset-variant\` attributes. Use \`import { resolvePresetOptions } from '@civui/core'\` to customize preset data in JavaScript.

**Example (property-driven):**
\`\`\`html
<civ-select label="State" hint="Select your state of residence" name="state" required
    .options="\${[
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'TX', label: 'Texas' }
    ]}"></civ-select>
\`\`\`

**Example (preset):**
\`\`\`html
<civ-select label="State" name="state" preset="us-state" required></civ-select>
\`\`\`

> Note: \`.options="\${...}"\` uses Lit property binding syntax. In plain HTML (non-template),
> set options via JavaScript: \`el.options = [...]\`. The \`preset\` attribute replaces the
> former \`civ-us-state\`, \`civ-service-branch\`, and other data-list components.

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
<civ-combobox label="Agency" hint="Search by name or acronym" name="agency" placeholder="Start typing..."
    .options="\${[
      { value: 'doj', label: 'Department of Justice' },
      { value: 'doe', label: 'Department of Energy' },
      { value: 'dod', label: 'Department of Defense' }
    ]}"></civ-combobox>
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
- \`preset\` — pre-built option list (same presets as \`civ-select\`). Renders \`<civ-checkbox>\` children automatically.
- \`preset-variant\` — variant of the preset

**Event detail:** \`{ values: string[] }\` — array of checked values.

**Form value:** Submits \`FormData\` with multiple entries under the same name.

**Example:**
\`\`\`html
<civ-checkbox-group legend="Select all that apply" required name="interests">
  <civ-checkbox label="Education" value="education"></civ-checkbox>
  <civ-checkbox label="Healthcare" value="healthcare"></civ-checkbox>
  <civ-checkbox label="Transportation" value="transportation"></civ-checkbox>
</civ-checkbox-group>

<!-- Using a preset -->
<civ-checkbox-group legend="Disability categories" name="disabilities" preset="disability-type" required></civ-checkbox-group>
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
- \`preset\` — pre-built option list (same presets as \`civ-select\`). Renders \`<civ-radio>\` children automatically.
- \`preset-variant\` — variant of the preset

**Event detail:** \`{ value: string }\` — the selected radio's value.

**Keyboard:** Arrow keys navigate (RTL-aware), Home/End jump to first/last. Roving tabindex.

**Example:**
\`\`\`html
<civ-radio-group legend="Preferred contact method" required name="contact">
  <civ-radio label="Email" value="email"></civ-radio>
  <civ-radio label="Phone" value="phone"></civ-radio>
  <civ-radio label="Mail" value="mail" description="Physical mail to your address on file"></civ-radio>
</civ-radio-group>

<!-- Using a preset -->
<civ-radio-group legend="Gender" name="gender" preset="gender" required></civ-radio-group>
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
<civ-segmented-control legend="View mode" name="view">
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
<civ-date-picker label="Appointment date" hint="Select an available date" name="appointment" min="2026-01-01" max="2026-12-31" required></civ-date-picker>
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
<civ-memorable-date legend="Date of birth" hint="For example: January 15 1990" required name="dob"></civ-memorable-date>
\`\`\`

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
<civ-file-upload label="Supporting documents" hint="Upload PDF or image files" name="documents" accept=".pdf,.jpg,.png,image/*" multiple max-size="5242880" max-files="5" required></civ-file-upload>
\`\`\`

---

### Self-contained chrome (no wrapper)

Every CivUI control renders its own label / legend / hint / error / required indicator chrome from its own props. Set them directly on the control:

\`\`\`html
<civ-text-input label="Email address" hint="We'll send confirmation here" required-message="Enter your email address" name="email" type="email" required autocomplete="email"></civ-text-input>
\`\`\`

**Heading promotion:** Set \`heading-level="1"\` (and typically \`size="xl"\`) on the control when its label doubles as the page \`<h1>\` (single-question-per-page pattern). See **Heading hierarchy** below.

---

### civ-fieldset

Wrapper for multi-field grouping — e.g. a custom block of related controls sharing one section heading. Renders legend, hint, error, and required indicator. Tracks per-field \`touched\` state.

Single inputs and self-contained group components (radio-group, checkbox-group, segmented-control, yes-no, memorable-date, date-range-picker) already carry their own label / legend — **do not wrap them in \`civ-fieldset\`** or you'll get nested fieldsets with double legends.

**Props:** \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\`, \`tight-hint\` (pull hint flush with controls below), \`heading-level\` (1-6), \`size\` (sm/md/lg/xl)

**Example:**
\`\`\`html
<civ-radio-group legend="Preferred contact method" required name="contact">
  <civ-radio label="Email" value="email"></civ-radio>
  <civ-radio label="Phone" value="phone"></civ-radio>
  <civ-radio label="Mail" value="mail"></civ-radio>
</civ-radio-group>
\`\`\`

**Heading promotion:** Set \`heading-level="1"\` (and typically \`size="xl"\`) when the legend doubles as the page \`<h1>\`. See **Heading hierarchy** below.

---

### civ-fieldset

Structural grouping wrapper. Not a form-participating element.

**Props:** \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\`

**Example:**
\`\`\`html
<civ-fieldset legend="Mailing address" hint="Enter your current mailing address">
  <civ-text-input label="Street address" name="street" required></civ-text-input>
  <civ-text-input label="City" name="city" required></civ-text-input>
  <civ-select label="State" name="state" preset="us-state" required></civ-select>
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
<civ-button label="Cancel" emphasis="tertiary"></civ-button>
<civ-button label="Delete" emphasis="secondary" danger></civ-button>
\`\`\`

### civ-link

Navigation link. Always renders an \`<a>\` element. For actions, use \`<civ-button>\`.

**Variants:** \`primary\` (button-styled), \`secondary\` (underlined + trailing caret), \`tertiary\` (plain underlined, default), \`back\` (leading chevron-left)
**Props:** \`label\`, \`href\`, \`variant\`, \`danger\` (boolean), \`disabled\`

\`\`\`html
<civ-link href="/details" variant="primary">View details</civ-link>
<civ-link href="/hub" variant="back" label="Back to task list"></civ-link>
<civ-link href="/remove" variant="primary" danger>Remove item</civ-link>
\`\`\`

### civ-tag

Categorization label (topic, taxonomy, filter chip). For status indicators ("Approved", "Pending"), use \`civ-badge\` instead. Two emphasis levels: secondary (light bg, dark text) and primary (dark bg, light text).

**Props:** \`label\`, \`variant\` (blue/orange/purple/gray), \`tag-style\` (primary/secondary)

\`\`\`html
<civ-tag label="Healthcare" color="blue"></civ-tag>
<civ-tag label="Disability" color="purple" tag-style="primary"></civ-tag>
\`\`\`

### civ-badge

Compact status indicator (text or dot). Carries \`role="status"\` for label mode and dot-with-label mode. Restricted to semantic colors. For numeric counts, use \`civ-count\`.

**Props:** \`label\`, \`dot\`, \`variant\` (info/warning/error/success/neutral), \`badge-style\` (primary/secondary), \`spacing\` (default/sm), \`overlay\`, \`with-icon\`, \`icon-start\`, \`icon-end\`

Set \`with-icon\` to render the variant's semantic icon at the start (success → check-circle, warning → warning, error → error, info → info). Use \`icon-start\` / \`icon-end\` for explicit overrides.

\`\`\`html
<civ-badge label="Approved" intent="success" with-icon></civ-badge>
<civ-badge label="Denied" intent="error" emphasis="primary" with-icon></civ-badge>
<civ-badge label="Read more" intent="info" icon-end="chevron-right"></civ-badge>
<civ-badge dot label="Unread messages" intent="error"></civ-badge>
\`\`\`

### civ-count

Numeric annotation — match counts in filter chips, item counts in nav, notification counters. Lighter chrome than badge so it composes inside other components.

**Props:** \`count\`, \`max\` (default 99 — overflow as "99+"), \`variant\`, \`count-style\` (primary = filled pill / secondary = bare colored text), \`spacing\`, \`overlay\`, \`live\` (off/polite/assertive — default off)

\`\`\`html
<span>Inbox <civ-count count="12"></civ-count></span>
<civ-count count="3" intent="error" emphasis="primary"></civ-count>
<span class="civ-badge-anchor">
  <civ-icon name="mail"></civ-icon>
  <civ-count overlay count="3" intent="error" emphasis="primary"></civ-count>
</span>
\`\`\`

### civ-page-header

Structured page heading with four slot areas: tag, eyebrow, heading, subheading.

**Slots:** \`data-tag\` (above eyebrow), \`data-eyebrow\`, \`data-heading\`, \`data-subheading\`

\`\`\`html
<civ-page-header>
  <civ-badge data-tag label="Active" intent="success"></civ-badge>
  <span data-eyebrow>Benefits</span>
  <h1 data-heading class="civ-heading-xl">
    Apply for disability compensation
    <civ-badge label="In progress" intent="info"></civ-badge>
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
    <civ-badge label="In progress" intent="info"></civ-badge>
    <h3 class="civ-heading-md">Disability compensation</h3>
  </div>
  <p>Filed: March 10, 2026</p>
  <div data-card-footer>
    <civ-link href="#" variant="primary">View details</civ-link>
  </div>
</civ-card>
\`\`\`

### civ-list / civ-list-item (task list pattern)

The "task list" is a usage pattern, not a dedicated component. Compose \`<civ-list>\` + \`<civ-list-item>\` + \`<civ-badge>\`. Setting \`href\` on a list item makes the entire row a clickable anchor; omit \`href\` for locked rows. The status badge uses \`data-list-item-end\` to flow to the trailing edge. \`<civ-badge>\` carries \`role="status"\` and \`with-icon\` auto-renders the variant's semantic icon.

**Status badge mapping:**

| Status | label | variant | badge-style |
|---|---|---|---|
| not-started | Not started | info | secondary |
| in-progress | In progress | info | primary |
| complete | Complete | success | primary |
| cannot-start | Cannot start yet | neutral | secondary |
| error | Has errors | error | secondary |
| review | Needs review | warning | primary |

\`\`\`html
<h3 class="civ-heading-md">Fill out your application</h3>
<civ-list dividers>
  <civ-list-item href="#/personal">
    <span class="civ-block civ-font-bold">Personal info</span>
    <civ-badge data-list-item-end label="Complete" intent="success" emphasis="primary" with-icon></civ-badge>
  </civ-list-item>
  <civ-list-item href="#/contact">
    <span class="civ-block civ-font-bold">Contact info</span>
    <span class="civ-block civ-text-sm civ-text-muted">Phone needed</span>
    <civ-badge data-list-item-end label="In progress" intent="info" emphasis="primary" with-icon></civ-badge>
  </civ-list-item>
  <civ-list-item>
    <span class="civ-block civ-font-bold">Service history</span>
    <civ-badge data-list-item-end label="Cannot start yet" intent="neutral" emphasis="secondary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>
\`\`\`

### civ-form-step

Multi-step form with built-in validation, progress steps, and navigation.
Children with \`data-step\` define each step. Validates required fields before advancing.

**Props:** \`persist\`, \`progress\` ('minimal' | 'steps' | 'bar'), \`continue-label\`, \`complete-label\`
**Events:** \`civ-step-complete\` (all steps done), \`civ-step-change\` { current, total, label }

\`\`\`html
<civ-form-step persist="form-personal" complete-label="Save and continue">
  <div data-step data-step-label="Your name">
    <civ-name legend="Your name" name="fullName" required></civ-name>
  </div>
  <div data-step data-step-label="Date of birth">
    <civ-memorable-date legend="Date of birth" hint="For example: January 15 1990" required name="dob"></civ-memorable-date>
  </div>
</civ-form-step>
\`\`\`

\`civ-form-step\` automatically renders progress steps, Continue/Back buttons, and validates
required fields before advancing. No custom JavaScript needed.

### civ-progress-steps

Segmented step indicator for multi-step forms. Each step is a rectangle — filled for completed, highlighted for current.

**Props:** \`steps\` (JSON array of labels), \`current\` (0-based index), \`show-counter\`, \`clickable\`

\`\`\`html
<civ-progress-steps
  steps='["Your name","Date of birth","SSN"]'
  current="1"
  show-counter
></civ-progress-steps>
\`\`\`

---

### civ-progress-percent

Percentage-based progress indicator for dynamic forms.

**Props:** \`value\` (0-100), \`label\` (aria-label), \`status\` (e.g., "3 of 8 sections"), \`hide-percent\`

\`\`\`html
<civ-progress-percent value="37" label="Application progress" status="3 of 8 sections complete"></civ-progress-percent>
\`\`\`

---

### civ-divider

Visual separator between content sections.

**Props:** \`spacing\` (\`'default'\` | \`'sm'\`), \`variant\` (\`'default'\` | \`'light'\`)

\`\`\`html
<civ-divider></civ-divider>
<civ-divider rhythm="sm"></civ-divider>
\`\`\`

---

### civ-yes-no

Yes/No binary question rendered as a radio group. Self-contained (renders its own legend).

**Props:** \`legend\`, \`yes-label\`, \`no-label\`, \`unsure-label\`, \`unsure-value\`, \`skip-label\`, \`skip-value\`

\`\`\`html
<civ-yes-no legend="Are you a veteran?" name="veteran" required></civ-yes-no>
\`\`\`

---

### civ-conditional

Conditionally shows children based on another field's value. Not form-participating.

**Props:** \`when\` (field name), \`equals\`, \`not-equals\`, \`includes\` (comma-separated list), \`has-value\` (boolean), \`matches\` (regex)

\`\`\`html
<civ-conditional when="veteran" equals="yes">
  <civ-text-input label="Branch" name="branch" required></civ-text-input>
</civ-conditional>
\`\`\`

---

### civ-alert

Accessible alert for informational, warning, error, or success messages.

**Props:** \`intent\` (info/warning/error/success), \`heading\`, \`label\` (body text), \`dismissible\`, \`slim\` (compact single-line, also hides the heading and disables collapsible), \`spacing\` (default/sm — \`sm\` shrinks padding only, keeps heading visible), \`emphasis\` (primary/secondary/tertiary), \`heading-level\` (2-6).

\`\`\`html
<civ-alert intent="warning" heading="Action needed" label="Your session will expire in 5 minutes."></civ-alert>
<civ-alert intent="info" label="Processing takes up to 3 business days." slim></civ-alert>
\`\`\`

---

### civ-modal

Modal dialog built on native \`<dialog>\`. Centered on desktop, bottom sheet on mobile.

**Props:** \`open\`, \`heading\`, \`label\`, \`no-close-button\`, \`no-backdrop-close\`, \`no-escape-close\`

**Events:** \`civ-close\`

\`\`\`html
<civ-modal heading="Confirm submission" open>
  <p>Are you sure?</p>
  <civ-button label="Submit" type="submit"></civ-button>
  <civ-button label="Cancel" emphasis="secondary"></civ-button>
</civ-modal>
\`\`\`

---

### civ-action-sheet

Popup overlay: absolute dropdown on desktop, bottom sheet on mobile.

**Props:** \`open\`, \`max-height\`, \`trap-focus\`, \`no-click-outside-close\`

**Events:** \`civ-close\`

---

### civ-address

Compound address component with street, city, state, ZIP.

**Props:** \`legend\`, \`hide-street2\` (default true), \`show-street3\`, \`show-country\`, \`show-military\`, \`validate-address\` (JS only). Per-field errors: \`street-error\`, \`city-error\`, \`state-error\`, \`zip-error\`.

\`\`\`html
<civ-address legend="Mailing address" name="mailingAddress" required></civ-address>
\`\`\`

---

### civ-name

Compound name component with first, middle, last, suffix fields.

**Props:** \`legend\`, \`hide-middle\` (default true), \`hide-suffix\` (default true). Per-field errors: \`first-error\`, \`middle-error\`, \`last-error\`. Field labels read "First name or given name" and "Last name or family name" so they apply to any naming convention.

\`\`\`html
<civ-name legend="Your full legal name" name="fullName" required></civ-name>
\`\`\`

---

### civ-direct-deposit

Compound bank account entry: routing number, account number, account type.

**Props:** \`legend\`. Per-field errors: \`routing-error\`, \`account-error\`, \`type-error\`.

\`\`\`html
<civ-direct-deposit legend="Direct deposit information" name="bankInfo" required></civ-direct-deposit>
\`\`\`

---

### civ-signature

Electronic signature with certification statement, name input, and confirm checkbox.

**Props:** \`legend\`, \`statement\` (or slot \`[name="statement"]\`). Per-field errors: \`name-error\`, \`certify-error\`.

\`\`\`html
<civ-signature legend="Certification" name="signature" statement="I certify this is true." required></civ-signature>
\`\`\`

---

### civ-relationship

Compound component for a person and their relationship to the applicant.

**Props:** \`legend\`, \`preset\` (general/dependent/survivor/benefits-survivor/immigration/tax), \`hide-name\`, \`show-deceased\`, \`show-divorce-date\`, \`show-adoption-date\`, \`deceased-assumed\`. Per-field errors: \`name-error\`, \`relationship-error\`, \`marriage-date-error\`, etc.

\`\`\`html
<civ-relationship legend="About the dependent" name="dependent" preset="dependent" required></civ-relationship>
\`\`\`

---

### civ-race-ethnicity

OMB-standard race and ethnicity with ethnicity radio group and race multi-select checkboxes.

**Props:** \`legend\`, \`ethnicity-legend\`, \`race-legend\`, \`ethnicity-error\`, \`race-error\`

\`\`\`html
<civ-race-ethnicity legend="Race and ethnicity" name="demographics" required></civ-race-ethnicity>
\`\`\`

---

### civ-partnership-history

Single long-term partner relationship — marriage, civil union, registered DP, cohabitation, or other. Use inside \`civ-repeater\` for multiple entries. Status vocabulary adapts to the selected partnership type (marriage statuses for marriage, inclusive partnership statuses for non-marriage relationships).

**Props:** \`legend\` (default \`"About this partnership"\`), \`show-marriage-type\`, \`status-assumed\`. Per-field errors: \`spouse-error\`, \`marriage-date-error\`, \`status-error\`, \`end-date-error\`, etc.

---

### civ-service-history

Single military service period. Use inside \`civ-repeater\` for multiple periods.

**Props:** \`legend\`, \`show-service-number\`. Per-field errors: \`branch-error\`, \`start-date-error\`, \`end-date-error\`, \`discharge-error\`, \`service-number-error\`.

---

### Preset Input Components

Pre-configured wrappers with built-in masking, validation, and labeling. Set \`label\` directly on the preset element.

| Component | Unique props |
|-----------|-------------|
| \`<civ-ssn>\` | \`mode\` (full/last4) |
| \`<civ-ein>\` | — |
| \`<civ-phone>\` | \`international\` |
| \`<civ-email>\` | — |
| \`<civ-zip>\` | \`extended\` |
| \`<civ-currency>\` | — |
| \`<civ-routing-number>\` | — |
| \`<civ-va-file-number>\` | — |
| \`<civ-country>\` | \`us-first\`, \`include\`, \`exclude\` |

\`\`\`html
<civ-ssn label="Social Security number" required name="ssn"></civ-ssn>
\`\`\`

---

### Specialized Link Modes

\`civ-link\` accepts a \`type\` prop for device-action shortcuts: \`phone\` builds a \`tel:\` href + phone icon, \`email\` builds a \`mailto:\` href + mail icon, \`download\` passes the \`href\` through and renders a download icon + optional file-size suffix. Use \`civ-link\` for every anchor case — variant for visual emphasis, type for device-action shorthand.

Key props for typed modes: \`type\`, \`number\`, \`address\`, \`label\`, \`subject\`, \`filename\`, \`file-size\`.

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

### checkbox vs toggle

- **Checkbox**: Choice requires a form submit to take effect. "I agree", "Select features", preference lists.
- **Toggle**: Takes effect immediately on click. "Enable notifications", "Dark mode", feature switches.

---

## Usage Patterns

### Complete form with validation

\`\`\`html
<civ-form @civ-submit="\${this._onSubmit}" @civ-invalid="\${this._onInvalid}">
  <civ-fieldset legend="Personal information">
    <civ-text-input label="Full name" name="fullName" required autocomplete="name"></civ-text-input>

    <civ-text-input label="Email address" name="email" type="email" required autocomplete="email"></civ-text-input>

    <civ-text-input label="Phone number" hint="Include area code" name="phone" type="tel" autocomplete="tel" inputmode="tel"></civ-text-input>
  </civ-fieldset>

  <civ-memorable-date legend="Date of birth" hint="For example: January 15 1990" required name="dob"></civ-memorable-date>

  <civ-fieldset legend="Application details">
    <civ-select label="Application type" name="appType" required
        .options="\${[
          { value: 'new', label: 'New application' },
          { value: 'renewal', label: 'Renewal' },
          { value: 'amendment', label: 'Amendment' }
        ]}"></civ-select>

    <civ-textarea label="Additional comments" name="comments" maxlength="1000"></civ-textarea>
  </civ-fieldset>

  <civ-file-upload label="Supporting documents" name="docs" accept=".pdf,.jpg,.png" multiple max-size="10485760"></civ-file-upload>

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

### Heading hierarchy and labels-as-headings

Government forms commonly follow the **VA.gov / GOV.UK "one question per page" pattern**, where the main question on each page is *also* the page's \`<h1>\`. This:

- Lets screen-reader users navigate forms by heading.
- Satisfies WCAG 2.4.6 (Headings and Labels) and 2.4.10 (Section Headings).

CivUI exposes two opt-in props on every chrome-rendering control (every form input and group component, \`civ-fieldset\`, \`civ-repeater\`, and every compound component):

- **\`heading-level\`** (1-6) — adds \`role="heading"\` + \`aria-level=N\` to the rendered \`<label>\`/\`<legend>\`. The native element is preserved, so click-to-focus and \`for\`/\`aria-labelledby\` keep working — heading promotion is purely an accessibility-tree affordance.
- **\`size\`** (\`sm\` | \`md\` | \`lg\` | \`xl\`) — visual size variant. \`sm\` (default, omitted) = body size; \`md\` ≈ \`text-lg\`; \`lg\` ≈ \`text-xl\`; \`xl\` ≈ \`text-2xl\`. Independent of \`heading-level\`.

**Rules:**

- **Exactly one \`h1\` per page.** On a single-question page, set \`heading-level="1"\` on the field that asks the question.
- On a multi-question page, the page or step uses its own \`<h1>\` and each fieldset uses \`heading-level="2"\` or \`"3"\`.
- Pair a higher \`heading-level\` with a larger \`size\` so the visual hierarchy matches the semantic hierarchy.
- Don't promote sub-fields inside compound components — only the top-level legend is a heading.

**Single-question page:**

\`\`\`html
<civ-text-input label="What is your email address?" heading-level="1" size="xl" required type="email" name="email"></civ-text-input>
\`\`\`

**Multi-question page with a fieldset as h2:**

\`\`\`html
<h1 class="civ-heading-xl">Your contact information</h1>

<civ-radio-group legend="Preferred contact method" heading-level="2" size="md" required name="contact">
  <civ-radio value="email" label="Email"></civ-radio>
  <civ-radio value="phone" label="Phone"></civ-radio>
</civ-radio-group>
\`\`\`

**Compound component as the page h1:**

\`\`\`html
<civ-name legend="What is your full name?" heading-level="1" size="xl" required></civ-name>
\`\`\`

### Plain language requirements

Government forms must use clear, jargon-free labels. CivUI supports this through:

- \`label\` / \`legend\` — use plain language: "Date of birth", not "DOB" or "Natal Date"
- \`hint\` — explain what's expected: "For example: January 15 1990"
- \`error\` — state what went wrong and how to fix it: "Enter a valid email address"
- \`requiredMessage\` — customize the required error: "Enter your email address" (not "This field is required")

### Required fields in government forms

Always mark required fields with the \`required\` attribute:

\`\`\`html
<civ-text-input label="Social Security number" required-message="Enter your Social Security number" hint="We need this to verify your identity" name="ssn" required type="tel" inputmode="numeric"
    pattern="[0-9]{3}-?[0-9]{2}-?[0-9]{4}"></civ-text-input>
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
<civ-date-picker label="Fecha de cita" name="appointment" locale="es-US"
    choose-date-label="Elegir fecha"
    dialog-label="Elegir fecha"
    previous-month-label="Mes anterior"
    next-month-label="Mes siguiente"></civ-date-picker>
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
| 2.4.7 Focus Visible | Global rule in civ.css applies the ring to every interactive element |
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

3. **Never use \`civ-toggle\` for choices that require form submission.** Toggles have immediate-effect semantics. Use \`civ-checkbox\` for choices that take effect on submit.

4. **Always put label/hint/error directly on the input control.** Every CivUI control renders its own chrome — there is no separate wrapper for single inputs. Group components carry \`legend\` instead of \`label\`. \`<civ-fieldset>\` is only for multi-field grouping.

5. **Never use \`civ-form-group\` or \`civ-form-field\`.** Both have been retired — set \`label\` directly on single inputs and \`legend\` directly on group components.

6. **Never use \`civ-us-state\` or \`civ-service-branch\`.** Use \`preset="us-state"\` or \`preset="service-branch"\` on \`<civ-select>\`, \`<civ-radio-group>\`, or \`<civ-checkbox-group>\` instead.

7. **Never put \`civ-radio\` outside a \`civ-radio-group\`.** Radios are not form-participating on their own. The group handles form integration, keyboard navigation, and ARIA.

8. **Never put \`civ-segment\` outside a \`civ-segmented-control\`.** Same reason as radios.

9. **Never omit \`name\` on form-participating components.** Without \`name\`, the value won't appear in form data.

10. **Don't add a focus-ring class to interactive elements.** \`civ.css\` applies the focus indicator globally to every \`button\` / \`a[href]\` / \`input\` / \`select\` / \`textarea\` / \`[role="button"]\` / \`[tabindex]:not([tabindex="-1"])\` — render a real interactive element and the ring shows. The legacy \`focus:civ-outline-*\` and \`focus-visible:civ-focus-ring\` per-element classes are deprecated.

11. **Never use generic required messages.** Use \`required-message\` with field-specific text: "Enter your email address", not "This field is required".

12. **Never put commas in checkbox values** when using \`civ-checkbox-group\`. Commas are used internally as the value delimiter.

13. **Never skip \`afterEach(cleanupFixtures)\` in tests.** Test fixtures accumulate in the DOM and cause cross-test pollution.

14. **Never assume ElementInternals works in tests.** jsdom doesn't fully support it. Use guards: \`typeof this._internals?.setFormValue === 'function'\`.

15. **Never use \`civ-select\` for fewer than 5 options** when all options can be displayed. Use \`civ-radio-group\` to show all choices at once.

16. **Never dispatch native \`input\` or \`change\` events.** Always use \`civ-input\` and \`civ-change\` custom events.

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
| \`civ-bg-base\` / \`civ-border-base\` | Default neutral backgrounds and borders |

Each color has shades: \`lightest\`, \`lighter\`, \`light\`, DEFAULT, \`vivid\` (primary only), \`dark\`, \`darker\`.

Example: \`civ-bg-error-lighter\`, \`civ-text-primary-dark\`, \`civ-border-base-light\`.

### Focus ring

The focus ring is applied automatically by a global rule in \`civ.css\` — you don't add a class:

\`\`\`html
<!-- Standard ring shows on focus, no class needed -->
<button>Click me</button>

<!-- Inverse opt-in for dark / colored backgrounds -->
<button class="focus-visible:civ-focus-ring-inverse">Click me</button>
\`\`\`

The ring uses the W3C Two-Color Technique: 3px outline + halo. It triggers on \`:focus\` (so it shows on click as well as keyboard) — matches GOV.UK Design System.

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
