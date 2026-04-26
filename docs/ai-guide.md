# CivUI AI Component Usage Guide

Comprehensive reference for AI coding assistants working with CivUI — an accessibility-first
web component library for government applications built on Lit 3 and Tailwind CSS.

For architecture and internals, see `CLAUDE.md` in the repo root.

---

## Component Quick Reference

| Tag | Category | Key Props | Event Detail |
|-----|----------|-----------|--------------|
| `<civ-text-input>` | Input | `type`, `width`, `placeholder`, `maxlength`, `pattern`, `autocomplete`, `inputmode` | `{ value }` |
| `<civ-textarea>` | Input | `rows`, `maxlength`, `placeholder` | `{ value }` |
| `<civ-select>` | Input | `options`, `emptyLabel` | `{ value }` |
| `<civ-combobox>` | Input | `options`, `placeholder`, `noResultsText` | `{ value }` |
| `<civ-checkbox>` | Choice | `checked`, `indeterminate`, `description`, `tile` | `{ checked, value }` |
| `<civ-checkbox-group>` | Group | `legend`, `tile`, `orientation` | `{ values: string[] }` |
| `<civ-radio>` | Choice | `label`, `value`, `checked`, `description`, `tile` | (bubbles to group) |
| `<civ-radio-group>` | Group | `legend`, `tile`, `orientation` | `{ value }` |
| `<civ-toggle>` | Choice | `checked`, `description` | `{ checked, value }` |
| `<civ-segmented-control>` | Group | `legend` | `{ value }` |
| `<civ-segment>` | Choice | `label`, `value`, `selected` | (bubbles to parent) |
| `<civ-date-picker>` | Date | `min`, `max`, `placeholder`, `locale`, `weekStartsOn` | `{ value }` |
| `<civ-memorable-date>` | Date | `legend`, `monthLabel`, `dayLabel`, `yearLabel`, `locale` | `{ value, month, day, year }` |
| `<civ-date-input>` | Date | `min`, `max` | `{ value }` — **DEPRECATED** |
| `<civ-file-upload>` | File | `accept`, `multiple`, `maxSize`, `maxFiles` | `{ files: File[] }` |
| `<civ-yes-no>` | Choice | `legend`, `yesLabel`, `noLabel`, `unsureLabel`, `unsureValue`, `skipLabel`, `skipValue` | `{ value }` |
| `<civ-conditional>` | Layout | `when`, `eq`, `neq` | — |
| `<civ-progress-steps>` | Navigation | `steps`, `current`, `legend` | — |
| `<civ-fieldset>` | Layout | `legend`, `hint`, `error`, `required`, `disabled` | — |
| `<civ-form>` | Layout | `action`, `method`, `supportResources` | `civ-submit: { formData }`, `civ-invalid: { errors }` |
| `<civ-form-step>` | Layout | `persist`, `sensitive`, `showPause` | `civ-step-change`, `civ-step-pause`, `civ-step-complete` |
| `<civ-form-group>` | Layout | `legend`, `hint`, `error` | — |
| `<civ-repeater>` | Layout | `legend`, `name`, `min`, `max`, `addLabel`, `removeLabel` | `civ-change: { value }` |
| `<civ-section-intro>` | Layout | `heading`, `headingLevel`, `tone` | — |
| `<civ-summary>` | Display | `data`, `editLabel` | `civ-edit: { section }` |
| `<civ-read-only-field>` | Display | `label`, `value` | — |
| `<civ-button>` | UI | `label`, `variant`, `danger`, `disabled`, `type` | `civ-analytics` |
| `<civ-action-button>` | UI | `label`, `variant`, `danger`, `disabled`, `pressed`, `type` | `civ-analytics` |
| `<civ-link>` | UI | `label`, `href`, `variant`, `danger`, `disabled` | `civ-analytics` |
| `<civ-link-card>` | UI | `href`, `heading`, `description`, `variant`, `spacing` | `civ-analytics` |
| `<civ-card>` | UI | `heading`, `spacing` | — |
| `<civ-tag>` | UI | `label`, `variant`, `tagStyle`, `status`, `spacing` | — |
| `<civ-divider>` | UI | `spacing`, `variant` | — |
| `<civ-page-header>` | UI | `spacing` | — (uses slots: `data-tag`, `data-eyebrow`, `data-heading`, `data-subheading`) |
| `<civ-icon>` | UI | `name`, `label` | — |
| `<civ-alert>` | Feedback | `variant`, `heading`, `dismissible` | `civ-dismiss` |
| `<civ-button-group>` | UI | `orientation`, `label` | — (`role="toolbar"`) |
| `<civ-input-group>` | UI | — (layout container) | — |
| `<civ-address>` | Compound | `legend`, `value` | `civ-change: { value }` |
| `<civ-name>` | Compound | `legend`, `value` | `civ-change: { value }` |
| `<civ-direct-deposit>` | Compound | `legend`, `value` | `civ-change: { value }` |
| `<civ-signature>` | Compound | `legend`, `statement`, slot `[name="statement"]` for HTML | `civ-change: { value: { name, certified, signedAt } }` |
| `<civ-relationship>` | Compound | `legend`, `preset`, `showDeceased`, `showName` | `{ value: RelationshipValue }` |
| `<civ-task-list>` | Navigation | — | — (uses `<civ-task-group>` and `<civ-task>` children) |
| `<civ-skip-link>` | Navigation | `label`, `target` | — |

**All form-participating components** also have: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`, `requiredMessage`.

**Group components** (`checkbox-group`, `radio-group`, `memorable-date`, `segmented-control`) use `legend` instead of `label`.

---

## Component Catalog

### civ-text-input

Standard text input supporting multiple HTML input types.

**Props (beyond standard):**
- `type` — `'text'` | `'email'` | `'number'` | `'password'` | `'search'` | `'tel'` | `'url'` (default: `'text'`)
- `width` — `'default'` | `'2xs'` | `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'` | `'2xl'`
- `placeholder` — placeholder text
- `pattern` — validation regex
- `maxlength` / `minlength` — character limits. When `maxlength` is set, a "characters remaining" counter renders below the input (visual + `aria-live` polite, debounced 1s for SR). Suppressed when a mask is active.
- `autocomplete` — browser autocomplete hint
- `inputmode` — virtual keyboard hint
- `mask` / `mask-pattern` / `mask-mode` — see Mask System
- `validate` — `'email'` | `'phone'` | `'phoneIntl'` | `'ssn'` | `'ein'` | `'routing'` | `'zip'` | `'zip4'` | `'usState'` | `'url'` | `'currency'` | `'alphanumeric'` — see Validation System

**Example:**
```html
<civ-text-input
  label="Email address"
  name="email"
  type="email"
  hint="We'll use this to send your confirmation"
  required
  autocomplete="email"
></civ-text-input>

<!-- Character counter -->
<civ-text-input label="Short bio" name="bio" maxlength="60"></civ-text-input>
```

---

### civ-textarea

Multi-line text input. Shows character count when `maxlength` is set.

**Props (beyond standard):**
- `rows` — visible text rows (default: 5)
- `maxlength` / `minlength` — character limits
- `maxwords` — soft word limit (counter + over-limit error). Mutually exclusive with `maxlength`.
- `autogrow` / `max-height` — grow with content up to a CSS max-height
- `placeholder` — placeholder text
- `validate` — `'length'` — runs on blur, errors with `validateLengthMin`/`Max`/`Between` against `minlength` / `maxlength`. Empty values skipped (required is the base class's job).

**Example:**
```html
<civ-textarea
  label="Describe your issue"
  name="description"
  hint="Include any relevant details"
  rows="8"
  maxlength="2000"
  required
></civ-textarea>

<!-- Length validation on blur -->
<civ-textarea
  label="Why you're applying"
  name="why"
  validate="length"
  minlength="20"
  maxlength="500"
></civ-textarea>
```

---

### civ-select

Dropdown select. Populate via `options` property OR slotted `<option>` / `<optgroup>` children (read once on connect).

**Props (beyond standard):**
- `options` — `Array<{ value: string, label: string, disabled?: boolean, group?: string }>`
- `emptyLabel` — placeholder option text (default: `'- Select -'`)
- `width` — same enum as `civ-text-input` (default | 2xs | xs | sm | md | lg | xl | 2xl)

**Example (property-driven):**
```html
<civ-select
  label="State"
  name="state"
  hint="Select your state of residence"
  required
  .options="${[
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' }
  ]}"
></civ-select>
```

**Example (declarative HTML, no JS required):**
```html
<civ-select label="State" name="state">
  <option value="CA">California</option>
  <optgroup label="Pacific">
    <option value="OR">Oregon</option>
    <option value="WA" selected>Washington</option>
  </optgroup>
</civ-select>
```

Slotted children are read once in `connectedCallback`. The `options` property takes precedence when both are provided.

---

### civ-combobox

Searchable dropdown with type-ahead filtering. Includes a decorative chevron toggle on the trailing edge that opens the full unfiltered list — same visual affordance as a native `<select>`. The chevron is `aria-hidden` and `tabindex="-1"` since keyboard users already have ArrowDown/ArrowUp.

**Props (beyond standard):**
- `options` — `Array<{ value: string, label: string, group?: string }>`
- `placeholder` — input placeholder
- `noResultsText` — shown when filter matches nothing (default: `'No results found'`)
- `width` — same enum as `civ-text-input`

**Events:**
- `civ-input` — `{ value }` (filter text changes as user types)
- `civ-change` — `{ value, label }` (option selected)

**Example:**
```html
<civ-combobox
  label="Agency"
  name="agency"
  hint="Search by name or acronym"
  placeholder="Start typing..."
  .options="${[
    { value: 'doj', label: 'Department of Justice' },
    { value: 'doe', label: 'Department of Energy' },
    { value: 'dod', label: 'Department of Defense' }
  ]}"
></civ-combobox>
```

**Keyboard:** ArrowDown/Up navigate, Enter selects, Escape closes.

---

### civ-checkbox

Single checkbox. Use standalone or within `civ-checkbox-group`.

**Props (beyond standard):**
- `checked` — boolean checked state
- `indeterminate` — tri-state mixed indicator
- `description` — secondary text below the label
- `tile` — bordered card variant

**Event detail:** `{ checked: boolean, value: string }`

**Form value:** Sends `value` when checked, `null` when unchecked. Default value is `'on'`.

**Example (standalone):**
```html
<civ-checkbox
  label="I agree to the terms of service"
  name="terms"
  required
></civ-checkbox>
```

---

### civ-checkbox-group

Groups multiple checkboxes. Uses `legend` (not `label`). Multi-value.

**Props (beyond standard):**
- `legend` — group label (renders as `<legend>`)
- `tile` — apply tile variant to all children
- `orientation` — `'vertical'` (default) | `'horizontal'`
- `min-selections` — minimum required count. A positive value implicitly marks the group as required (legend asterisk + `valueMissing` validity error). Auto-appends "Select at least N" to the hint chain.
- `max-selections` — maximum allowed count. Blocks the over-pick interactively + auto-appends "Select up to N" hint.
- `show-select-all` — render a "Select all" / "Deselect all" toggle button.

**Event detail:** `{ values: string[] }` — array of checked values.

**Form value:** Submits `FormData` with multiple entries under the same name.

**Example:**
```html
<civ-checkbox-group
  legend="Select all that apply"
  name="interests"
  required
>
  <civ-checkbox label="Education" value="education"></civ-checkbox>
  <civ-checkbox label="Healthcare" value="healthcare"></civ-checkbox>
  <civ-checkbox label="Transportation" value="transportation"></civ-checkbox>
</civ-checkbox-group>
```

> Note: Individual checkbox values must not contain commas (used internally as delimiter).

---

### civ-radio / civ-radio-group

Mutually exclusive choice group. `civ-radio` is always used inside `civ-radio-group`.

**Radio props:** `label`, `value`, `checked`, `description`, `tile`, `disabled`

**Radio-group props (beyond standard):**
- `legend` — group label
- `tile` — apply tile variant to all children
- `orientation` — `'vertical'` (default) | `'horizontal'`
- `skipLabel` — when non-empty, renders a "Prefer not to answer" button below the group. See [Trauma-informed patterns](#trauma-informed-patterns).
- `skipValue` — form value when the skip affordance is selected (default: `'skip'`).

**Event detail:** `{ value: string }` — the selected radio's value, or `skipValue` if the skip affordance was used.

**Keyboard:** Arrow keys navigate (RTL-aware), Home/End jump to first/last. Roving tabindex.

**Example:**
```html
<civ-radio-group
  legend="Preferred contact method"
  name="contact"
  required
>
  <civ-radio label="Email" value="email"></civ-radio>
  <civ-radio label="Phone" value="phone"></civ-radio>
  <civ-radio label="Mail" value="mail" description="Physical mail to your address on file"></civ-radio>
</civ-radio-group>
```

---

### civ-toggle

On/off switch with immediate-effect semantics.

**Props (beyond standard):**
- `checked` — boolean toggle state
- `description` — secondary text below the label

**Event detail:** `{ checked: boolean, value: string }`

**Uses `role="switch"`** — not a checkbox.

**Example:**
```html
<civ-toggle
  label="Email notifications"
  name="notifications"
  description="Receive updates about your application status"
></civ-toggle>
```

---

### civ-segmented-control / civ-segment

Button-style radio group for mutually exclusive UI options.

**Segmented-control props (beyond standard):**
- `legend` — accessible label (rendered screen-reader-only)

**Segment props:** `label`, `value`, `selected`, `disabled`

**Keyboard:** Arrow keys navigate (RTL-aware). Roving tabindex.

**Example:**
```html
<civ-segmented-control
  legend="View mode"
  name="view"
>
  <civ-segment label="List" value="list"></civ-segment>
  <civ-segment label="Grid" value="grid"></civ-segment>
  <civ-segment label="Map" value="map"></civ-segment>
</civ-segmented-control>
```

---

### civ-date-picker

Calendar dialog with text input. Preferred for appointment/scheduling dates.

**Props (beyond standard):**
- `min` / `max` — date range constraints (YYYY-MM-DD)
- `placeholder` — input placeholder (default: `'mm/dd/yyyy'`)
- `locale` — date formatting locale (default: `'en-US'`)
- `weekStartsOn` — 0 = Sunday (default), 1 = Monday
- `disabled-dates` — JSON array of YYYY-MM-DD strings to block individually
- `hide-today-button` — hide the dialog footer "Today" button (use for date-of-birth pickers, etc.)
- `today-button-label` — override the Today button label (default from `datePickerTodayButton` locale key)

**i18n props:** `chooseDateLabel`, `selectedDateLabel`, `dialogLabel`, `previousMonthLabel`, `nextMonthLabel`, `dialogOpenedMessage`, `dateSelectedMessage`, `todayLabel`, `todayButtonLabel`

**Form value:** YYYY-MM-DD string.

**Keyboard (in calendar dialog):** Arrow keys navigate days, PageUp/Down navigate months, Shift+PageUp/Down navigate years, Enter/Space select, Escape closes. **`T` (or Shift+T) jumps focus to today** without selecting — Enter/Space still required to commit.

**Today button:** Appears in the dialog footer. Click selects today and closes the picker. Disabled when today is outside `min`/`max`. Suppress entirely with `hide-today-button` (recommended for DOB pickers).

**Month + year jump selects:** The dialog header has `<select>` elements for month and year so users can jump anywhere in the calendar in a single click — critical for date-of-birth pickers where the year might be 50+ years back. The year range honors `min`/`max` when set, otherwise defaults to today − 120 through today + 10. Months outside `min`/`max` for the boundary year are disabled. The focused day is clamped to the new month length on jump (Jan 31 → Feb 28).

**Example:**
```html
<civ-date-picker
  label="Appointment date"
  name="appointment"
  hint="Select an available date"
  min="2026-01-01"
  max="2026-12-31"
  required
></civ-date-picker>

<!-- Date of birth: Today button hidden -->
<civ-date-picker label="Date of birth" name="dob" hide-today-button max="2026-04-26"></civ-date-picker>
```

---

### civ-memorable-date

Three-field date entry (Month select + Day input + Year input). Preferred for known dates like birthdays.

**Props (beyond standard):**
- `legend` — group label
- `monthLabel`, `dayLabel`, `yearLabel` — field labels (default: `'Month'`, `'Day'`, `'Year'`)
- `monthEmptyLabel` — month select placeholder (default: `'- Month -'`)
- `dayPlaceholder`, `yearPlaceholder` — input placeholders
- `locale` — month name formatting locale (default: `'en-US'`)

**i18n props:** `dateSetMessage`, `invalidDateMessage`

**Event detail:** `{ value: string, month: string, day: string, year: string }`

**Form value:** YYYY-MM-DD string. Empty if any field is incomplete.

**Example:**
```html
<civ-memorable-date
  legend="Date of birth"
  name="dob"
  hint="For example: January 15 1990"
  required
></civ-memorable-date>
```

---

### civ-date-input — DEPRECATED

Native date input. **Do not use in new code.** Known issues with Dragon NaturallySpeaking, VoiceOver on Safari, and TalkBack on Firefox. Use `civ-date-picker` or `civ-memorable-date` instead.

---

### civ-file-upload

Drag-and-drop file upload with validation.

**Props (beyond standard):**
- `accept` — MIME types / extensions (e.g., `'.pdf,.jpg,image/*'`)
- `multiple` — allow multiple files
- `maxSize` — max file size in bytes (0 = unlimited)
- `maxFiles` — max file count (0 = unlimited)
- `capture` — `'user'` | `'environment'` | `''` — mobile camera hint, passed through to the native `<input type="file">`. `'environment'` uses the back camera (document scan), `'user'` uses the front camera (selfie). Pair with `accept="image/*"`.
- `variant` — `'default'` | `'compact'` | `'full'`
- `show-preview` — render image thumbnails for image files

**Built-in validation:**
- Empty files (0 bytes) rejected with `fileUploadEmptyFile`.
- **Duplicates** (same name + size + lastModified) rejected with `fileUploadDuplicateError`. Removing then re-adding works.
- File type / size / count rejections surface through the existing error channel.

**i18n props:** `dragText`, `browseText`, `acceptedLabel`, `maxSizeLabel`, `removeText`, `removeAriaLabel`, `filesListLabel`, `fileAddedMessage`, `fileRemovedMessage`, `fileSizeError`, `fileTypeError`, `maxFilesError`

**Event detail:** `{ files: File[] }`

**Example:**
```html
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

<!-- Camera capture for ID document scan on mobile -->
<civ-file-upload
  label="Driver's license photo"
  name="license"
  accept="image/*"
  capture="environment"
></civ-file-upload>
```

---

### civ-fieldset

Structural grouping wrapper. Not a form-participating element.

**Props:** `legend`, `hint`, `error`, `required`, `disabled`

**Example:**
```html
<civ-fieldset legend="Mailing address" hint="Enter your current mailing address">
  <civ-text-input label="Street address" name="street" required></civ-text-input>
  <civ-text-input label="City" name="city" required></civ-text-input>
  <civ-select label="State" name="state" required .options="${stateOptions}"></civ-select>
  <civ-text-input label="ZIP code" name="zip" required pattern="[0-9]{5}(-[0-9]{4})?"></civ-text-input>
</civ-fieldset>
```

---

### civ-form

Form validation coordinator. Renders error summary, handles submit/reset.

**Props:** `action`, `method` (`'get'` | `'post'`), `persist`, `prefill`, `prefillSrc`, `trackDirty`, `supportResources`, `supportResourcesHeading`, `formLabel`, `errorHeadingLevel`

**Events:**
- `civ-submit` — `{ formData: FormData }` (valid submission)
- `civ-invalid` — `{ errors: FormFieldError[] }` (client validation failed; each error has `name`, `message`, `element`)
- `civ-server-errors` — `{ errors: FormFieldError[] }` (fired by `setServerErrors()`)

**Methods:**
- `validate()` — runs client validation across all `[data-civ-form-field]` children
- `clearErrors()` — clears the summary and all field errors
- `getFormData()` — simple `Record<string, string>` snapshot
- `toFormData()` — `FormData` instance preserving Files and multi-value (use for submission)
- `setServerErrors(errors)` — inject server-side errors into the summary + per-field. Behaves like a client-validation failure (focuses summary, announces, anchor links). Pass `{}` (or call `clearErrors()`) to clear.

**Submit-button rule:** Only `<button type="submit">` triggers form submission. Typeless `<button>` inside the form is treated as a regular button (intentional — civ-form is a custom element, not a `<form>`, so the HTML default-submit rule doesn't apply).

**`supportResources`** — Array of `{ label, href, description? }` for a persistent non-modal footer region (crisis lines, helplines). URL scheme allowlist: `http`, `https`, `tel`, `mailto`, `sms`, same-origin paths and hashes. See [Trauma-informed patterns](#trauma-informed-patterns).

**Example:**
```html
<civ-form @civ-submit="${handleSubmit}" @civ-invalid="${handleErrors}">
  <civ-text-input label="Full name" name="name" required></civ-text-input>
  <civ-text-input label="Email" name="email" type="email" required></civ-text-input>
  <civ-textarea label="Message" name="message" required></civ-textarea>
  <civ-button type="submit">Submit</civ-button>
  <civ-button type="reset">Clear</civ-button>
</civ-form>
```

**Server-error injection:**
```js
form.addEventListener('civ-submit', async (e) => {
  const res = await fetch('/api/submit', { method: 'POST', body: e.detail.formData });
  if (!res.ok) {
    const { errors } = await res.json();
    form.setServerErrors(errors); // { email: 'Already in use', phone: 'Invalid' }
  }
});
```

On validation failure, `civ-form` renders an error summary with anchor links to each invalid field.

---

### Prefill System

CivUI provides a prefill engine for populating form fields from user profiles, APIs, or saved state. This is essential for government forms where signed-in users already have verified data on file.

#### civ-form prefill properties

| Property / Attribute | Type | Description |
|---|---|---|
| `prefillData` | `PrefillData` (JS property) | Data to populate fields. Keys are field `name` values. |
| `prefill-src` | `string` (attribute) | URL to fetch prefill JSON from. Fetched on connect. |
| `prefillHeaders` | `Record<string, string>` (JS property) | Custom headers for `prefill-src` fetch (e.g., auth tokens). |

**PrefillData shape:**
```typescript
type PrefillData = Record<string, PrefillField>;

interface PrefillField {
  value: string;
  source: 'profile' | 'api' | 'saved';
  locked?: boolean; // When true, field is disabled — user must edit in profile settings
}
```

**Prefill events:**
- `civ-prefill-applied` -- `{ fields: string[], meta: PrefillMeta }` -- fired after fields are populated
- `civ-prefill-error` -- `{ error: string }` -- fired if `prefill-src` fetch fails

**`getPrefillMeta()` method:** Returns `{ prefilled: string[], locked: string[], needsReview: string[] }` for task list integration.

**Example:**
```javascript
const form = document.querySelector('civ-form');
form.prefillData = {
  name: { value: 'Jane Doe', source: 'profile' },
  email: { value: 'jane@agency.gov', source: 'profile', locked: true },
  phone: { value: '(555) 123-4567', source: 'api' },
};
```

#### civ-read-only-field

Displays a label and value as a flat row with optional inline edit link. Used inside `civ-summary` and on review pages.

**Props:**
- `label` -- Field label (left side)
- `value` -- Display value (right side, bold)
- `values` -- `string[]` (JS property) -- multiple values, each on its own line
- `edit-href` -- Edit link destination (renders inline "Edit" link)
- `edit-label` -- Custom edit link text (default: "Edit")
- `hint` -- Optional hint text below the row

**Example:**
```html
<civ-read-only-field
  label="Phone number"
  value="(555) 123-4567"
  edit-href="#/contact/phone"
></civ-read-only-field>

<!-- Multi-value (address) -->
<civ-read-only-field
  label="Mailing address"
  .values="${['123 Main St', 'Springfield, IL 62701']}"
  edit-href="#/contact/address"
></civ-read-only-field>
```

#### civ-summary

Read-only review page that displays structured sections with headings, edit links, and key-value pairs using `civ-read-only-field` internally.

**Props:**
- `heading` -- Main heading for the summary page
- `sections` -- `SummarySection[]` (JS property) -- sections to display

**Events:**
- `civ-edit` (cancelable) -- fires on any edit-link click. Detail: `{ section, item?, href }`. Calling `preventDefault()` suppresses the default `<a>` navigation so SPAs can route on their own.

**Section types:**
```typescript
interface SummarySection {
  heading: string;
  editHref?: string;
  locked?: boolean;    // When true, edit link text changes to "Update your profile"
  items: SummaryItem[];
}

interface SummaryItem {
  label: string;
  value?: string | string[];
  editHref?: string;   // Per-row edit link (used when section has no heading)
  editLabel?: string;  // Custom edit link text
}
```

**Layout modes:**
- **Header edit:** When a section has a `heading`, the edit link appears in the section header (not per-row).
- **Flat row edit:** When a section has no heading (empty string), each item gets its own edit link from `item.editHref`.
- **Locked sections:** When `locked: true`, edit link text shows "Update your profile" instead of "Edit".

**Example:**
```html
<civ-summary heading="Review your information"></civ-summary>
<script>
  document.querySelector('civ-summary').sections = [
    {
      heading: 'Personal information',
      editHref: '#step-1',
      items: [
        { label: 'Name', value: 'Jane Doe' },
        { label: 'Date of birth', value: 'January 15, 1985' },
      ],
    },
  ];
</script>
```

#### civ-prefill-notice

Informational banner for chapter review pages explaining that data was prefilled from a profile.

**Props:**
- `heading` -- Custom heading text (uses i18n default if empty)
- `body` -- Custom body text (uses i18n default if empty)
- `profile-href` -- URL for the "update profile" link (omit to hide link)
- `link-text` -- Custom link text

**Example:**
```html
<civ-prefill-notice profile-href="/profile"></civ-prefill-notice>
```

#### civ-task (in @civui/navigation)

Individual task row within a task list. Renders label, hint, status tag, and optional link.

**Props:**
- `label` -- Task name
- `hint` -- Optional hint text below the label
- `href` -- Navigation target (omit for locked tasks)
- `status` -- `'not-started'` | `'in-progress'` | `'complete'` | `'cannot-start'` | `'error'` | `'review'`
- `prefilled` -- Boolean; shows a default prefill hint when no custom hint is set

**Example:**
```html
<civ-task
  label="Contact information"
  hint="Phone, email, and mailing address"
  href="#/contact"
  status="review"
  prefilled
></civ-task>
```

#### Prefill chapter flow pattern

The recommended flow for multi-chapter government forms with prefilled data:

```
Task List Hub → Chapter Prefill Review → (Edit Steps if needed) → Save & Complete → Hub
```

1. **Hub** -- `civ-task-list` with `civ-task` items. Prefilled chapters show `status="review"` and `prefilled` attribute.
2. **Chapter review** -- `civ-prefill-notice` banner + `civ-summary` showing prefilled data with edit links. Locked sections link to profile settings.
3. **Edit step** -- Standard form fields for editing a specific piece of data. "Update and continue" returns to chapter review.
4. **Complete** -- "Save and complete" marks the chapter done and returns to the hub.

---

### civ-yes-no

Yes/no radio group — common in government eligibility forms. Supports an optional third option for "unsure" or "not applicable" answers.

**Props (beyond standard):**
- `legend` — group label
- `yesLabel` / `noLabel` — customize option labels (defaults: `'Yes'` / `'No'`)
- `unsureLabel` — when non-empty, renders a third button with this label (semantic: *uncertainty* — "I don't know")
- `unsureValue` — form value for the third option (default: `'unsure'`)
- `skipLabel` — when non-empty, renders a "Prefer not to answer" link-button below the yes/no row (semantic: *opting out*, distinct from uncertainty)
- `skipValue` — form value when skip is selected (default: `'skip'`)

**Event detail:** `{ value: string }` — `'yes'`, `'no'`, `unsureValue`, or `skipValue`

**Examples:**
```html
<!-- Standard yes/no -->
<civ-yes-no
  legend="Are you a United States citizen?"
  name="citizen"
  required
></civ-yes-no>

<!-- With third option -->
<civ-yes-no
  legend="Do you have a service-connected disability?"
  name="disability"
  unsure-label="I'm not sure"
  required
></civ-yes-no>

<!-- Custom third option value -->
<civ-yes-no
  legend="Does this apply to your household?"
  name="applies"
  unsure-label="Does not apply"
  unsure-value="n/a"
></civ-yes-no>
```

---

### civ-conditional

Conditionally shows its children based on another field's value. Not form-participating.

**Props:**
- `when` — `name` of the controlling field to watch
- `eq` — show children when value equals this string
- `neq` — show children when value does NOT equal this string

**Example:**
```html
<civ-yes-no legend="Are you a veteran?" name="veteran" required></civ-yes-no>
<civ-conditional when="veteran" eq="yes">
  <civ-text-input label="Service branch" name="branch" required></civ-text-input>
</civ-conditional>
```

---

### civ-section-intro

Pre-section context panel. Sets expectations before a sensitive or complex form section. Presentational only — no form state, no validation. See [Trauma-informed patterns](#trauma-informed-patterns).

**Props:**
- `heading` — section heading (required for accessible labelling)
- `headingLevel` — `2` | `3` | `4` | `5` | `6` (default `3`)
- `tone` — `'info'` | `'sensitive'` | `'neutral'` (default `'info'`)

**Example:**
```html
<civ-section-intro heading="About your service-connected trauma" tone="sensitive">
  <p>The next questions ask about events that may be difficult to remember.</p>
  <p>You can skip any question, and your answers are saved as you go.</p>
</civ-section-intro>
```

---

### civ-relationship

Compound component for capturing a person and their relationship to the applicant. Supports agency-specific presets with conditional follow-up fields based on relationship category.

**Props (beyond standard):**
- `legend` — fieldset legend (default: `'About this person'`)
- `preset` — `'general'` | `'va-dependent'` | `'va-survivor'` | `'ssa-survivor'` | `'immigration'` | `'tax'`
- `options` — custom `RelationshipTypeConfig[]` (overrides preset)
- `show-name` — include name fields (default true)
- `show-deceased` — include deceased yes/no + date of death (default false)
- `show-divorce-date` — show divorce date for spousal types (default false)
- `show-adoption-date` — show adoption date for child types (default false)
- Per-field errors: `name-error`, `relationship-error`, `marriage-date-error`, `date-of-birth-error`, `date-of-death-error`, `other-description-error`

**Conditional fields by category:**
- Spousal (spouse, ex-spouse) → marriage date, divorce date
- Child (biological, adopted, step, foster) → date of birth, adoption date
- Other → free text description

**Example:**
```html
<civ-relationship
  legend="About the dependent"
  name="dependent"
  preset="va-dependent"
  show-adoption-date
  required
></civ-relationship>
```

---

### civ-progress-steps

Multi-step form progress indicator.

**Props:**
- `steps` — `Array<{ label: string, status?: 'complete' | 'current' | 'upcoming' }>`
- `current` — zero-based index of the current step
- `legend` — accessible label for the step list

**Example:**
```html
<civ-progress-steps
  legend="Application progress"
  .steps="${[
    { label: 'Personal info', status: 'complete' },
    { label: 'Employment', status: 'current' },
    { label: 'Review', status: 'upcoming' }
  ]}"
  current="1"
></civ-progress-steps>
```

---

## Validation System

CivUI provides 16 built-in validators via `validate` from `@civui/core`. Each returns `{ valid: boolean, error?: string }`.

**Available validators:** `required`, `email`, `phone`, `phoneIntl`, `ssn`, `ein`, `routing`, `zip`, `zip4`, `usState`, `isoDate`, `url`, `currency`, `range`, `length`, `alphanumeric`

`routing` enforces the ABA mod-10 checksum on US bank routing numbers. Used internally by `civ-direct-deposit` on its routing-number sub-input.

**Declarative usage:** Set the `validate` attribute on form components to auto-validate on submit:

```html
<civ-text-input label="Email" name="email" validate="email" required></civ-text-input>
<civ-text-input label="SSN" name="ssn" validate="ssn" required></civ-text-input>
```

**Programmatic usage:**
```javascript
import { validate } from '@civui/core';

const result = validate.email('user@example.com');
// { valid: true }

const bad = validate.ssn('000-12-3456');
// { valid: false, error: 'Enter a valid Social Security number' }
```

---

## Mask System

Input masking for formatted fields. Uses blur-mode by default (mask applied on blur, raw input on focus).

**Presets:** `ssn`, `phone-us`, `zip`, `zip4`, `ein`, `currency`

**Pattern syntax:** `#` = digit, `A` = letter, `*` = any character. All other characters are literal separators.

**PII protection:** Presets marked `pii: true` (SSN, EIN) trigger blur-mode masking automatically.

**Example:**
```html
<civ-text-input label="Phone number" name="phone" mask="phone-us"></civ-text-input>
<civ-text-input label="SSN" name="ssn" mask="ssn"></civ-text-input>
<civ-text-input label="Custom" name="code" mask="AA-####"></civ-text-input>
```

---

## Icon System

45 pure CSS icons rendered via `::before`/`::after` pseudo-elements. No font files, no SVG, no Unicode — just CSS.

**Usage:**
```html
<civ-icon name="check-circle" label="Success"></civ-icon>
```

Icons inherit `color` and scale with `font-size`. Each icon maps to platform-native equivalents (SF Symbols for iOS, Material Symbols for Android).

**Categories:** Navigation (chevrons, arrows, external-link), Actions (close, plus, minus, menu, search, edit), Status (check, error, warning), and more.

---

## Native Platform Support

CivUI provides iOS (SwiftUI) and Android (Jetpack Compose) implementations with 100% API parity validated in CI.

- **iOS:** `packages/ios/Sources/CivUI/` — Swift files with SwiftUI views
- **Android:** `packages/android/src/main/kotlin/gov/civui/components/` — Kotlin files with Compose composables
- **Parity CI:** The `parity.yml` workflow enforces 95%+ feature parity across platforms
- **Native CI:** The `native.yml` workflow verifies Swift and Kotlin files compile

---

## Component Selection Guide

### When to use which choice component

| Scenario | Component | Why |
|----------|-----------|-----|
| Single yes/no agreement | `civ-checkbox` | Single boolean, often standalone |
| Multiple selections from a list | `civ-checkbox-group` | Multi-select with group label |
| One choice from 2–7 options | `civ-radio-group` | Visible options, mutually exclusive |
| One choice from 8+ options | `civ-select` | Scrollable, saves space |
| One choice from large list, user knows value | `civ-combobox` | Type-ahead search |
| Immediate on/off toggle | `civ-toggle` | Instant effect (no submit needed) |
| UI mode switch, 2–5 options | `civ-segmented-control` | Visible, button-style |

### When to use which date component

| Scenario | Component | Why |
|----------|-----------|-----|
| Scheduling / appointment selection | `civ-date-picker` | Calendar browsing, min/max range |
| Known past date (birthday, issue date) | `civ-memorable-date` | Three-field entry, no calendar needed |
| **Never** | `civ-date-input` | Deprecated — accessibility issues |

### checkbox vs toggle

- **Checkbox**: Choice requires a form submit to take effect. "I agree", "Select features", preference lists.
- **Toggle**: Takes effect immediately on click. "Enable notifications", "Dark mode", feature switches.

---

## Usage Patterns

### Complete form with validation

```html
<civ-form @civ-submit="${this._onSubmit}" @civ-invalid="${this._onInvalid}">
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
      .options="${[
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
```

### Event handling

```javascript
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
```

### Error handling flow

```javascript
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
      const field = document.querySelector(`[name="${CSS.escape(err.field)}"]`);
      if (field) field.error = err.message;
    }
  }
}

// Clear errors before re-submit
formEl.clearErrors();
```

### Screen reader announcements

```javascript
import { announce } from '@civui/core';

// Polite — non-urgent status updates
announce('Form saved successfully');
announce('3 results found');

// Assertive — urgent, time-sensitive
announce('Session expires in 2 minutes', 'assertive');
announce('Error: payment declined', 'assertive');
```

---

## Government Design Patterns

### Section 508 compliance

CivUI components are built for WCAG 2.1 AA (which satisfies Section 508). Key patterns:

1. **Every input must have a visible label.** Never use `placeholder` as the only label.
2. **Required fields** use `required` attribute — renders asterisk and sets `aria-required="true"`.
3. **Error messages** render with `role="alert"` for immediate screen reader announcement.
4. **Focus management** — all interactive elements are keyboard accessible. Dialogs trap focus. Groups use roving tabindex.
5. **Color is never the sole indicator.** Errors use text + border, not just red color.
6. **Focus ring** meets WCAG 2.2 SC 2.4.13 — W3C Two-Color Technique (C40) with 3px outline + 2px offset + halo shadow.

### Plain language requirements

Government forms must use clear, jargon-free labels. CivUI supports this through:

- `label` / `legend` — use plain language: "Date of birth", not "DOB" or "Natal Date"
- `hint` — explain what's expected: "For example: January 15 1990"
- `error` — state what went wrong and how to fix it: "Enter a valid email address"
- `requiredMessage` — customize the required error: "Enter your email address" (not "This field is required")

### Required fields in government forms

Always mark required fields with the `required` attribute:

```html
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
```

### Date input rules for government forms

| Date Type | Component | Example |
|-----------|-----------|---------|
| Date of birth | `civ-memorable-date` | "When were you born?" |
| Document issue/expiry | `civ-memorable-date` | "Passport expiration date" |
| Appointment scheduling | `civ-date-picker` | "Select your appointment date" |
| Travel dates with range | `civ-date-picker` with `min`/`max` | "Choose a date within the filing period" |

Always provide a hint showing the expected format. For memorable-date: "For example: January 15 1990". For date-picker: default placeholder is "mm/dd/yyyy".

### Form validation for .gov applications

1. **Validate on submit, not on blur** — government form users often tab through fields to understand the form first.
2. **Error summary at top** — `civ-form` renders this automatically on validation failure with anchor links to each invalid field.
3. **Field-level errors** — set the `error` prop on individual fields after server validation.
4. **Custom required messages** — use `required-message` to provide field-specific instructions instead of generic "This field is required".
5. **Progressive disclosure** — group related fields with `civ-fieldset` and break long forms into logical sections.

### VA.gov form patterns

For VA-specific form patterns (name, address, SSN, service history, direct deposit, review pages,
eligibility screeners, and more), see **`docs/va-patterns.md`**. That guide maps every
[VA.gov Design System pattern](https://design.va.gov/patterns/) to CivUI components with
copy-paste HTML and MCP tool references.

### Bilingual/i18n support

Most components support label customization for i18n:

```html
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
```

---

## Trauma-informed patterns

Government forms routinely ask emotionally difficult questions — bereavement dates, service-connected trauma, substance use, health history. CivUI provides opt-in primitives so teams can build trauma-informed flows without reinventing them per form.

**Core idea:** pair a context panel with a sensitive step wrapper, give users a way to opt out of individual questions, and keep support resources visible across the flow.

### When to reach for which primitive

| Pattern | Primitive | Use when |
|---------|-----------|----------|
| Set expectations before a hard section | `civ-section-intro tone="sensitive"` | Opening a section that asks personal/clinical/bereavement questions |
| Soften step entry + enable pause | `civ-form-step` with `sensitive` attribute | A whole step covers emotionally heavy material |
| Let users save progress mid-flow | `civ-form-step` with `show-pause` (or `sensitive` auto-enables it) | Users may need to walk away and come back |
| Let users opt out of a single question | `civ-radio-group` / `civ-yes-no` with `skip-label` | The question is answerable but personally invasive (demographics, crisis screening) |
| Keep crisis resources visible | `civ-form` with `supportResources` | Form touches mental health, self-harm risk, domestic situations |
| Compound field for relationships | `civ-relationship` with `preset` and `show-deceased` | VA dependents, SSA survivor, immigration, tax |

### civ-form-step: `sensitive` + `show-pause`

- `sensitive` — marks the step as emotionally sensitive. Reflects `data-sensitive` on the host. Emits a polite screen-reader notice on entry ("This section asks personal questions. Your answers are saved as you go."). Auto-enables the pause action.
- `show-pause` — renders a "Save and come back later" link next to the continue button. Fires `civ-step-pause` with `{ current, label }`. Pair with `persist` on `civ-form` or `civ-form-step` so sessionStorage keeps state across the pause.
- `pause-label` — override the action label (default from locale).

### civ-form: `supportResources`

Renders a persistent non-modal `<aside>` footer that stays visible across steps. Each resource is `{ label, href, description? }`. Unsafe URL schemes (`javascript:`, `data:`, `vbscript:`) and protocol-relative URLs (`//evil.com`) are filtered out automatically.

### "Prefer not to answer" — `skip-label` on radio-group / yes-no

Rendered as a link-style button *outside* the radiogroup role so screen readers don't confuse it with a normal choice. Semantically distinct from `civ-yes-no`'s `unsureLabel`:
- `unsureLabel` — "I don't know" (uncertainty about a valid answer).
- `skipLabel` — "Prefer not to answer" (opting out of answering).

Both can coexist on the same `civ-yes-no`.

### Example: a complete sensitive step

```html
<civ-form
  form-label="Survivor benefits application"
  persist="ssa-survivor-benefits"
  .supportResources="${[
    { label: 'VA Bereavement Counseling', href: 'tel:202-461-6530', description: 'Mon–Fri, 8am–8pm ET' },
    { label: '988 Suicide & Crisis Lifeline', href: 'tel:988', description: '24/7' },
  ]}"
>
  <civ-form-step sensitive>
    <div data-step-label="About the person who died">
      <civ-section-intro heading="About your spouse" tone="sensitive">
        <p>These questions help us determine the benefits you're eligible for.</p>
        <p>You can skip any question and come back later.</p>
      </civ-section-intro>

      <civ-relationship
        legend="About the person who died"
        name="deceased"
        preset="va-survivor"
        show-deceased
        required
      ></civ-relationship>
    </div>

    <div data-step-label="Your relationship">
      <civ-yes-no
        legend="Were you legally married at the time of their death?"
        name="married"
        skip-label="Prefer not to answer"
        required
      ></civ-yes-no>
    </div>
  </civ-form-step>
</civ-form>
```

### What not to do

- Don't auto-submit a sensitive step on selection — users may want to revisit answers.
- Don't make every section `sensitive` — it dilutes the signal and the pause affordance becomes noise.
- Don't use `skip-label` to substitute for a proper "Not applicable" option when N/A is a *valid* domain answer; skip is specifically for *opting out of answering*.
- Don't persist PII fields across sessions — `civ-form`'s persist auto-excludes `data-civ-pii` fields. If the sensitive section collects PII, verify the form doesn't leak it into sessionStorage via `persist`.

---

## Accessibility Requirements

### WCAG 2.1 AA checklist for CivUI components

| Criterion | How CivUI Addresses It |
|-----------|----------------------|
| 1.1.1 Non-text Content | Labels rendered as text, not images |
| 1.3.1 Info and Relationships | Semantic HTML (fieldset/legend, label/input), ARIA attributes |
| 1.3.5 Identify Input Purpose | Support `autocomplete` attribute on text inputs |
| 2.1.1 Keyboard | All controls keyboard accessible, arrow nav in groups |
| 2.1.2 No Keyboard Trap | Focus trap only in modal dialogs, Escape closes |
| 2.4.3 Focus Order | DOM order matches visual order (Light DOM) |
| 2.4.7 Focus Visible | `focus-visible:civ-focus-ring` on all interactive elements |
| 2.4.13 Focus Appearance | W3C Two-Color Technique, 3px outline, WCAG 2.2 |
| 3.2.2 On Input | No unexpected context changes on input |
| 3.3.1 Error Identification | `role="alert"` on error messages |
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

Radio groups, segmented controls, and date pickers reverse arrow key behavior in RTL contexts. The `isRtl()` utility from `@civui/core` detects direction from CSS computed styles.

---

## Anti-Patterns

Avoid these common mistakes when using CivUI components:

1. **Never use Shadow DOM.** CivUI uses Light DOM exclusively. Do not override `createRenderRoot()` to return a shadow root. Tailwind classes will not work inside Shadow DOM.

2. **Never use placeholder as a label.** Always set the `label` (or `legend` for groups) prop. Placeholder text disappears on focus and fails accessibility.

3. **Never use `civ-date-input`.** It is deprecated. Use `civ-date-picker` for scheduling or `civ-memorable-date` for known dates.

4. **Never use `civ-toggle` for choices that require form submission.** Toggles have immediate-effect semantics. Use `civ-checkbox` for choices that take effect on submit.

5. **Never put `civ-radio` outside a `civ-radio-group`.** Radios are not form-participating on their own. The group handles form integration, keyboard navigation, and ARIA.

6. **Never put `civ-segment` outside a `civ-segmented-control`.** Same reason as radios.

7. **Never omit `name` on form-participating components.** Without `name`, the value won't appear in form data.

8. **Never use `focus:` prefix for focus styles.** Use `focus-visible:civ-focus-ring` for keyboard-only focus indication.

9. **Never use generic required messages.** Use `required-message` with field-specific text: "Enter your email address", not "This field is required".

10. **Never put commas in checkbox values** when using `civ-checkbox-group`. Commas are used internally as the value delimiter.

11. **Never skip `afterEach(cleanupFixtures)` in tests.** Test fixtures accumulate in the DOM and cause cross-test pollution.

12. **Never assume ElementInternals works in tests.** jsdom doesn't fully support it. Use guards: `typeof this._internals?.setFormValue === 'function'`.

13. **Never use `civ-select` for fewer than 5 options** when all options can be displayed. Use `civ-radio-group` to show all choices at once.

14. **Never dispatch native `input` or `change` events.** Always use `civ-input` and `civ-change` custom events.

---

## Tailwind & CSS Reference

### Prefix

All Tailwind utilities use the `civ-` prefix:

```html
<!-- Correct -->
<div class="civ-p-4 civ-text-base civ-bg-primary">

<!-- Wrong — no prefix -->
<div class="p-4 text-base bg-primary">
```

### Semantic color classes

| Token | Usage |
|-------|-------|
| `civ-text-primary` / `civ-bg-primary` | Brand primary, links, selected state |
| `civ-text-error` / `civ-bg-error` | Validation errors, required marks |
| `civ-text-warning` / `civ-bg-warning` | Warning messages |
| `civ-text-success` / `civ-bg-success` | Success confirmations |
| `civ-text-info` / `civ-bg-info` | Informational messages |
| `civ-text-base` / `civ-bg-base` | Default text and backgrounds |

Each color has shades: `lightest`, `lighter`, `light`, DEFAULT, `vivid` (primary only), `dark`, `darker`.

Example: `civ-bg-error-lighter`, `civ-text-primary-dark`, `civ-border-base-light`.

### Focus ring

```html
<!-- Standard focus ring (keyboard-only) -->
<button class="focus-visible:civ-focus-ring">Click me</button>

<!-- Inverse variant (for dark backgrounds) -->
<button class="focus-visible:civ-focus-ring-inverse">Click me</button>
```

The focus ring uses the W3C Two-Color Technique: 3px solid outline at 2px offset with a halo shadow for contrast.

### Density system

Switch layout density at any container level:

```html
<!-- Spacious: 1.25x spacing, larger fonts -->
<div data-civ-scale="spacious">...</div>

<!-- Default: standard spacing -->
<div>...</div>

<!-- Dense: 0.75x spacing, smaller fonts -->
<div data-civ-scale="dense">...</div>
```

All CivUI spacing and font-size utilities scale proportionally through CSS variables.

### Component CSS classes

These classes are defined in the design system and used internally by components:

| Class | Purpose |
|-------|---------|
| `.civ-label` | Standard form label |
| `.civ-legend` | Fieldset legend |
| `.civ-required-mark` | Required asterisk |
| `.civ-hint` | Hint text below label |
| `.civ-error-text` | Error message with `role="alert"` |
| `.civ-input` | Standard form input styling |
| `.civ-fieldset` | Fieldset reset |
| `.civ-check-input` | Checkbox/radio input |
| `.civ-check-tile` | Tile variant wrapper |
| `.civ-toggle-track` | Toggle switch track |
| `.civ-toggle-thumb` | Toggle switch thumb |
| `.civ-segment-btn` | Segmented control button |
| `.civ-dropzone` | File upload drop area |
| `.civ-combobox-listbox` | Combobox dropdown |
| `.civ-datepicker-dialog` | Date picker calendar dialog |
| `.civ-form-error-summary` | Form error summary box |

### Logical properties (RTL-safe)

CivUI provides logical-direction utilities:
- `.civ-border-s-4` / `.civ-border-s-0` — inline-start border
- `.civ-rounded-s` / `.civ-rounded-e` — start/end border radius
- `.civ-me-2` / `.civ-ms-2` — inline-end/start margin

### Dark mode

Dark mode activates via `prefers-color-scheme: dark`. All semantic color tokens have dark-mode overrides. Focus ring colors invert in dark mode automatically.

### Windows High Contrast Mode

Components include `@media (forced-colors: active)` overrides for date pickers, combobox options, checkboxes, toggles, and file uploads.

---

## Testing Quick Reference

```javascript
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
```

See `CLAUDE.md` for full testing patterns and ElementInternals guards.
