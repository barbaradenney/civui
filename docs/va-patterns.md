# VA.gov Form Patterns with CivUI

Recipes for rebuilding VA.gov forms using CivUI components. Each pattern maps to the
[VA.gov Design System patterns](https://design.va.gov/patterns/) with copy-paste HTML
and guidance on when to use each approach.

Reference: [VA.gov Pattern Library](https://design.va.gov/patterns/)

---

## Where CivUI Diverges from VA Patterns

CivUI follows VA patterns as a baseline but improves on areas with known usability issues:

| VA Pattern | VA Approach | CivUI Approach | Why |
|---|---|---|---|
| **Review page** | Accordions per section | Flat visible sections | Accordions hide content users need to scan; extra clicks to verify each section |
| **Add another** | Always navigate to separate page | Inline for simple items, detail mode for complex items | Simple items (phone numbers) work best inline; complex items (dependents with 5+ fields) benefit from a focused detail view |
| **Eligibility screener** | Yes/No button pair (stateless) | `civ-yes-no` (stateful radio group) | VA's buttons don't preserve state on back-nav; CivUI's yes-no is a form control with persistent `value` — state is preserved through back navigation and `civ-form` persistence |
| **One thing per page** | One field per page | Logically grouped fields per step | Grouping related fields (name + DOB, phone + email) reduces page count and abandonment without increasing cognitive load |
| **Error timing** | Unspecified | Submit-first, with eager validation for format fields | Most fields validate on submit; format-sensitive fields (email, SSN, ZIP) show inline feedback after the user finishes typing |
| **File upload** | No batch selection | Multi-select allowed | Modern mobile file pickers handle multi-select reliably; single-file-at-a-time adds unnecessary friction |

These divergences are called out in each pattern section below.

---

## Table of Contents

1. [Personal Information](#personal-information)
   - [Full Name](#full-name)
   - [Date of Birth](#date-of-birth)
   - [Social Security Number](#social-security-number)
   - [Gender / Demographics](#gender--demographics)
2. [Contact Information](#contact-information)
   - [Mailing Address](#mailing-address)
   - [Phone Numbers](#phone-numbers)
   - [Email Address](#email-address)
   - [Contact Preferences](#contact-preferences)
3. [Financial Information](#financial-information)
   - [Direct Deposit](#direct-deposit)
4. [Service Information](#service-information)
   - [Service History](#service-history)
   - [Relationship to Veteran](#relationship-to-veteran)
5. [Supporting Evidence](#supporting-evidence)
   - [File Upload](#file-upload)
6. [Form Structure Patterns](#form-structure-patterns)
   - [Mutually Exclusive Answer](#mutually-exclusive-answer)
   - [Multiple Responses (Add Another)](#multiple-responses-add-another)
   - [Conditional Reveal](#conditional-reveal)
   - [Marital Information](#marital-information)
7. [Review & Submission](#review--submission)
   - [Check Answers (Review Page)](#check-answers-review-page)
   - [Signature / Statement of Truth](#signature--statement-of-truth)
   - [Confirmation Page](#confirmation-page)
8. [Flow Patterns](#flow-patterns)
   - [Multi-Step Form with Progress](#multi-step-form-with-progress)
   - [Eligibility Screener](#eligibility-screener)
   - [Prefilled Data](#prefilled-data)
   - [Save and Resume](#save-and-resume)
9. [Complex Form Architecture](#complex-form-architecture)
   - [The Book Model](#the-book-model)
   - [Task List Hub](#task-list-hub)
   - [Chapter Flow](#chapter-flow)
   - [Dynamic Chapters](#dynamic-chapters)
   - [Multi-Level Review](#multi-level-review)
   - [Example: Disability Compensation Application](#example-disability-compensation-application)
10. [MCP Tool Reference](#mcp-tool-reference)

---

## Personal Information

### Full Name

VA pattern: [Ask users for Names](https://design.va.gov/patterns/ask-users-for/names)

Collect first, middle (optional), last name and suffix. Pair with date of birth on the same step.

```html
<civ-fieldset legend="Name" required>
  <civ-text-input
    label="First name"
    name="firstName"
    required
    required-message="Enter a first name"
    autocomplete="given-name"
  ></civ-text-input>

  <civ-text-input
    label="Middle name"
    name="middleName"
    autocomplete="additional-name"
  ></civ-text-input>

  <civ-text-input
    label="Last name"
    name="lastName"
    required
    required-message="Enter a last name"
    autocomplete="family-name"
  ></civ-text-input>

  <civ-select
    label="Suffix"
    name="suffix"
    empty-label="- Select -"
    autocomplete="honorific-suffix"
  ></civ-select>
</civ-fieldset>
```

**Suffix options:**
```js
document.querySelector('[name="suffix"]').options = [
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
];
```

**VA guidance:**
- Use "First name" not "First or given name" unless serving international populations
- Do not restrict character types — names may contain hyphens, apostrophes, accented characters
- Error for invalid characters: "You entered a character we can't accept. Try removing '[characters]'"

---

### Date of Birth

VA pattern: [Ask users for Dates](https://design.va.gov/patterns/ask-users-for/dates)

Use `civ-memorable-date` for dates users know (birth, marriage). Use `civ-date-picker` for scheduling.

```html
<civ-memorable-date
  label="Date of birth"
  name="dateOfBirth"
  required
  required-message="Enter a date of birth"
  hint="For example: January 15 1990"
></civ-memorable-date>
```

**For approximate dates** (service periods, employment):
```html
<civ-memorable-date
  label="Approximate date of service start"
  name="serviceStartDate"
  hint="If you don't know the exact date, give us your best estimate"
></civ-memorable-date>
```

**VA validation rules:**
- Day: 1 through max days in selected month
- Year: 1900 through current year (for birth dates)
- Error messages: "Enter a month", "Enter a day between 1 and [max]", "Enter a year between 1900 and [current year]"

---

### Social Security Number

VA pattern: [Ask users for SSN](https://design.va.gov/patterns/ask-users-for/social-security-number)

```html
<civ-text-input
  label="Social Security number"
  name="ssn"
  required
  required-message="Enter a Social Security number"
  hint="We need this to verify your identity"
  mask="ssn"
  validate="ssn"
  type="tel"
  inputmode="numeric"
  autocomplete="off"
></civ-text-input>
```

**VA guidance:**
- Use full label "Social Security number", never abbreviate to "SSN"
- Mask displays as `●●●-●●-6789` on blur, raw input on focus
- For authenticated users with verified identity (IAL2), show read-only last 4 digits only
- When VA file number is an alternative, pair both fields:

```html
<civ-text-input
  label="Social Security number"
  name="ssn"
  hint="You must enter a Social Security number or VA file number"
  mask="ssn"
  validate="ssn"
  type="tel"
></civ-text-input>

<civ-text-input
  label="VA file number"
  name="vaFileNumber"
  hint="You must enter this or a Social Security number"
  type="tel"
  inputmode="numeric"
></civ-text-input>
```

---

### Gender / Demographics

VA pattern: [Ask users for Race and ethnicity](https://design.va.gov/patterns/ask-users-for/race-and-ethnicity)

Use `civ-race-ethnicity` — the OMB-standard compound component with ethnicity (radio) and race (multi-select checkboxes):

```html
<civ-race-ethnicity
  legend="What is your race, ethnicity, or origin?"
  name="demographics"
  required
></civ-race-ethnicity>
```

---

## Contact Information

### Mailing Address

VA pattern: [Ask users for Addresses](https://design.va.gov/patterns/ask-users-for/addresses)

For US-only address collection, use `civ-address`:

```html
<civ-address
  legend="Mailing address"
  name="mailingAddress"
  required
  hint="We'll send any important notices to this address"
></civ-address>
```

**For home address with "same as mailing" shortcut:**

```html
<civ-address
  legend="Mailing address"
  name="mailingAddress"
  required
></civ-address>

<civ-yes-no
  label="Is your home address the same as your mailing address?"
  name="sameAddress"
  required
></civ-yes-no>

<civ-conditional when="sameAddress" equals="no">
  <civ-address
    legend="Home address"
    name="homeAddress"
    required
  ></civ-address>
</civ-conditional>
```

**VA guidance:**
- Mailing address always comes before home address
- Address validation should check against USPS data when possible
- Military address: present a checkbox that auto-selects US as country and shows APO/FPO/DPO fields

**For international addresses** (not yet supported by `civ-address`), compose manually:

```html
<civ-fieldset legend="Mailing address" required>
  <civ-select label="Country" name="country" required></civ-select>
  <civ-text-input label="Street address" name="street1" required autocomplete="address-line1"></civ-text-input>
  <civ-text-input label="Street address line 2" name="street2" autocomplete="address-line2"></civ-text-input>
  <civ-text-input label="City" name="city" required autocomplete="address-level2"></civ-text-input>
  <!-- State: use select for US/CA/MX, text input for other countries -->
  <civ-select label="State" name="state" required autocomplete="address-level1"></civ-select>
  <civ-text-input label="Postal code" name="postalCode" required autocomplete="postal-code"></civ-text-input>
</civ-fieldset>
```

---

### Phone Numbers

VA pattern: [Ask users for Phone numbers](https://design.va.gov/patterns/ask-users-for/phone-numbers)

```html
<civ-text-input
  label="Home phone number"
  name="homePhone"
  type="tel"
  inputmode="numeric"
  mask="phone-us"
  validate="phone"
  autocomplete="tel"
  hint="Enter a 10-digit phone number"
></civ-text-input>

<civ-text-input
  label="Mobile phone number"
  name="mobilePhone"
  type="tel"
  inputmode="numeric"
  mask="phone-us"
  validate="phone"
  autocomplete="tel"
></civ-text-input>
```

**VA guidance:**
- Error message: "Enter a 10-digit phone number (with or without dashes)"
- Pair phone fields with email on the same form step
- Mobile number is required if user opts into text message notifications

---

### Email Address

VA pattern: [Ask users for Email address](https://design.va.gov/patterns/ask-users-for/email-address)

```html
<civ-text-input
  label="Email address"
  name="email"
  type="email"
  required
  required-message="Enter an email address"
  validate="email"
  autocomplete="email"
></civ-text-input>
```

**VA guidance:**
- Error: "Enter a valid email address without spaces using this format: email@domain.com"
- Do NOT add a confirmation/re-enter email field (users just copy-paste, it doesn't prevent errors)
- Explain why email is needed: "We may use your email to contact you if we have questions"
- Prefill from VA Profile when authenticated

---

### Contact Preferences

VA pattern: [Ask users for Contact preferences](https://design.va.gov/patterns/ask-users-for/contact-preferences)

```html
<civ-radio-group
  legend="How should we contact you if we have questions?"
  name="contactMethod"
  required
>
  <civ-radio label="Email" value="email"></civ-radio>
  <civ-radio label="Home phone" value="homePhone"></civ-radio>
  <civ-radio label="Mobile phone" value="mobilePhone"></civ-radio>
  <civ-radio label="U.S. mail" value="mail"></civ-radio>
</civ-radio-group>
```

---

## Financial Information

### Direct Deposit

VA pattern: [Ask users for Direct deposit](https://design.va.gov/patterns/ask-users-for/direct-deposit)

```html
<civ-fieldset legend="Direct deposit information">
  <civ-radio-group
    legend="Account type"
    name="accountType"
    required
    required-message="Select an account type"
    orientation="horizontal"
  >
    <civ-radio label="Checking" value="checking"></civ-radio>
    <civ-radio label="Savings" value="savings"></civ-radio>
  </civ-radio-group>

  <civ-text-input
    label="Bank routing number"
    name="routingNumber"
    required
    required-message="Enter a routing number"
    hint="The 9-digit number on the bottom left of a check"
    type="tel"
    inputmode="numeric"
    maxlength="9"
    validate="length(9,9)"
  ></civ-text-input>

  <civ-text-input
    label="Bank account number"
    name="accountNumber"
    required
    required-message="Enter a bank account number"
    hint="The account number on the bottom of a check"
    type="tel"
    inputmode="numeric"
  ></civ-text-input>
</civ-fieldset>
```

**VA guidance:**
- Include a visual of a check showing where to find routing/account numbers
- Error: "Enter a valid nine digit routing number"
- In review/edit mode, mask routing and account numbers showing only last 4 digits
- Include note: "Direct deposit information is not required to determine eligibility"

---

## Service Information

### Service History

VA pattern: [Ask users for Service history](https://design.va.gov/patterns/ask-users-for/service-history)

Use `civ-repeater` for multiple service periods:

```html
<civ-repeater
  legend="Service periods"
  name="servicePeriods"
  item-label="service period"
  min="1"
  max="20"
  hint="Add each period of service separately"
>
  <civ-combobox
    label="Branch of service"
    name="branch"
    required
    required-message="Select a branch of service"
  ></civ-combobox>

  <civ-memorable-date
    label="Service start date"
    name="startDate"
    required
    hint="If you don't know the exact date, enter your best estimate"
  ></civ-memorable-date>

  <civ-memorable-date
    label="Service end date"
    name="endDate"
    required
    hint="If you don't know the exact date, enter your best estimate"
  ></civ-memorable-date>

  <civ-select
    label="Character of service"
    name="dischargeType"
    required
  ></civ-select>
</civ-repeater>
```

**Branch of service options** (set via JS):
```js
const branches = [
  { value: 'army', label: 'Army' },
  { value: 'navy', label: 'Navy' },
  { value: 'air-force', label: 'Air Force' },
  { value: 'marine-corps', label: 'Marine Corps' },
  { value: 'coast-guard', label: 'Coast Guard' },
  { value: 'space-force', label: 'Space Force' },
  { value: 'noaa', label: 'National Oceanic and Atmospheric Administration' },
  { value: 'usphs', label: 'United States Public Health Service' },
];
document.querySelectorAll('[name$=".branch"]').forEach(el => el.options = branches);
```

**Discharge type options:**
```js
const dischargeTypes = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General (under honorable conditions)' },
  { value: 'other-than-honorable', label: 'Other than honorable' },
  { value: 'bad-conduct', label: 'Bad conduct' },
  { value: 'dishonorable', label: 'Dishonorable' },
  { value: 'undesirable', label: 'Undesirable' },
];
```

---

### Relationship to Veteran

VA pattern: [Ask users for Relationship](https://design.va.gov/patterns/ask-users-for/relationship)

```html
<civ-radio-group
  legend="What is your relationship to the Veteran?"
  name="relationship"
  required
  required-message="Select your relationship to the Veteran"
>
  <civ-radio label="Spouse" value="spouse"></civ-radio>
  <civ-radio label="Child" value="child"></civ-radio>
  <civ-radio label="Parent" value="parent"></civ-radio>
  <civ-radio label="Executor or administrator of estate" value="executor"></civ-radio>
  <civ-radio label="Other" value="other"></civ-radio>
</civ-radio-group>

<civ-conditional when="relationship" equals="other">
  <civ-text-input
    label="Describe your relationship to the Veteran"
    name="relationshipOther"
    required
  ></civ-text-input>
</civ-conditional>
```

---

## Supporting Evidence

### File Upload

VA pattern: [Ask users for Files](https://design.va.gov/patterns/ask-users-for/files)

```html
<civ-file-upload
  label="Upload supporting documents"
  name="documents"
  accept=".pdf,.jpg,.jpeg,.png"
  max-size="20MB"
  max-files="10"
  multiple
  hint="Upload PDF, JPG, or PNG files. Maximum file size: 20MB"
  required
  required-message="Upload at least one supporting document"
></civ-file-upload>
```

**Guidance:**
- Use "upload" and "delete" — not "add" or "remove"
- List accepted file types and max size in hint text
- On mobile, avoid language like "scan" or "convert to PDF"
- If additional questions are needed per file, use the multiple responses pattern

**CivUI divergence:** VA recommends against batch file selection, but modern mobile
file pickers handle multi-select reliably. CivUI's `multiple` attribute allows users
to select several files at once, which is faster than adding files one at a time.
Individual file status, progress, and per-file errors are shown for each file regardless.

---

## Form Structure Patterns

### Mutually Exclusive Answer

VA pattern: [Ask users for A mutually exclusive answer](https://design.va.gov/patterns/ask-users-for/a-mutually-exclusive-answer)

**Use radio buttons** for 2-7 options:
```html
<civ-radio-group legend="What type of claim are you filing?" name="claimType" required>
  <civ-radio label="New claim" value="new"></civ-radio>
  <civ-radio label="Supplemental claim" value="supplemental"></civ-radio>
  <civ-radio label="Higher-level review" value="higher-level"></civ-radio>
</civ-radio-group>
```

**Use yes-no** for binary questions:
```html
<civ-yes-no
  label="Are you currently homeless or at risk of becoming homeless?"
  name="homelessRisk"
  required
></civ-yes-no>
```

**Use select** only for 7+ options (prefer radio for fewer):
```html
<civ-select label="Country" name="country" required></civ-select>
```

**VA guidance:**
- Always prefer radio buttons over select unless 7+ options
- For checkboxes with "none of these," consider breaking into separate yes/no questions
- Never use "all of these" unless partial selections are truly impossible

---

### Multiple Responses (Add Another)

VA pattern: [Ask users for Multiple responses](https://design.va.gov/patterns/ask-users-for/multiple-responses)

**CivUI divergence:** VA always navigates to a separate page to add each item. CivUI
supports two modes depending on complexity:

- **Inline mode** (`mode="inline"`, default) — fields visible on the page with add/remove.
  Best for simple items: additional phone numbers, short text entries, basic name+date pairs.
- **Detail mode** (`mode="detail"`) — shows summary cards for existing items. Clicking "Add"
  or "Edit" opens fields in a focused detail view. Best for complex items with 5+ fields
  (dependents, service periods, previous addresses).

**Inline mode** — simple items (1-3 fields):
```html
<civ-repeater
  legend="Other phone numbers"
  name="phones"
  item-label="phone number"
  min="0"
  max="5"
>
  <civ-text-input label="Phone number" name="phone" mask="phone-us" validate="phone" type="tel"></civ-text-input>
  <civ-text-input label="Label" name="phoneLabel" hint="For example: Work, Partner"></civ-text-input>
</civ-repeater>
```

**Detail mode** — complex items (4+ fields):
```html
<civ-repeater
  legend="Dependents"
  name="dependents"
  item-label="dependent"
  mode="detail"
  min="0"
  max="20"
>
  <civ-text-input label="First name" name="firstName" required></civ-text-input>
  <civ-text-input label="Last name" name="lastName" required></civ-text-input>
  <civ-memorable-date label="Date of birth" name="dob" required></civ-memorable-date>
  <civ-text-input label="Social Security number" name="ssn" mask="ssn" validate="ssn" type="tel"></civ-text-input>
  <civ-radio-group legend="Relationship" name="relationship" required>
    <civ-radio label="Son or daughter" value="child"></civ-radio>
    <civ-radio label="Stepchild" value="stepchild"></civ-radio>
    <civ-radio label="Adopted child" value="adopted"></civ-radio>
  </civ-radio-group>
</civ-repeater>
```

---

### Conditional Reveal

Use `civ-conditional` to show/hide sections based on user responses:

```html
<civ-yes-no label="Do you have a service-connected disability?" name="hasDisability"></civ-yes-no>

<civ-conditional when="hasDisability" equals="yes">
  <civ-text-input
    label="Disability rating percentage"
    name="disabilityRating"
    type="number"
    hint="Enter a number between 0 and 100"
    required
  ></civ-text-input>
</civ-conditional>
```

**Multiple conditions:**
```html
<civ-radio-group legend="What type of benefit are you applying for?" name="benefitType">
  <civ-radio label="Education" value="education"></civ-radio>
  <civ-radio label="Housing" value="housing"></civ-radio>
  <civ-radio label="Healthcare" value="healthcare"></civ-radio>
</civ-radio-group>

<civ-conditional when="benefitType" equals="education">
  <!-- Education-specific fields -->
  <civ-text-input label="School name" name="schoolName" required></civ-text-input>
</civ-conditional>

<civ-conditional when="benefitType" equals="housing">
  <!-- Housing-specific fields -->
  <civ-address legend="Property address" name="propertyAddress" required></civ-address>
</civ-conditional>
```

---

### Marital Information

VA pattern: [Ask users for Marital information](https://design.va.gov/patterns/ask-users-for/marital-information)

```html
<civ-radio-group
  legend="What is your current marital status?"
  name="maritalStatus"
  required
  required-message="Select a marital status"
>
  <civ-radio label="Married" value="married"></civ-radio>
  <civ-radio label="Divorced or annulled" value="divorced"></civ-radio>
  <civ-radio label="Separated" value="separated"></civ-radio>
  <civ-radio label="Widowed" value="widowed"></civ-radio>
  <civ-radio label="Never married" value="never-married"></civ-radio>
</civ-radio-group>

<civ-conditional when="maritalStatus" equals="married">
  <civ-fieldset legend="Spouse information">
    <civ-text-input label="Spouse's first name" name="spouseFirstName" required></civ-text-input>
    <civ-text-input label="Spouse's last name" name="spouseLastName" required></civ-text-input>
    <civ-memorable-date label="Date of marriage" name="marriageDate" required></civ-memorable-date>
    <civ-text-input
      label="Spouse's Social Security number"
      name="spouseSsn"
      mask="ssn"
      validate="ssn"
      type="tel"
    ></civ-text-input>
    <civ-yes-no label="Is your spouse a Veteran?" name="spouseIsVeteran"></civ-yes-no>
  </civ-fieldset>
</civ-conditional>
```

---

## Review & Submission

### Check Answers (Review Page)

VA pattern: [Help users to Check answers](https://design.va.gov/patterns/help-users-to/check-answers)

CivUI uses a flat, all-sections-visible layout instead of the VA accordion pattern.
Accordions force users to open each section individually to verify answers, adding
unnecessary clicks and hiding content that should be scannable. The flat layout lets
users scroll through all their answers at once, which is faster and more accessible.

Use `civ-summary` to render the review page:

```html
<civ-summary heading="Review your application"></civ-summary>
```

```js
const summary = document.querySelector('civ-summary');
summary.sections = [
  {
    heading: 'Personal information',
    editHref: '#step-personal',
    items: [
      { label: 'Name', value: 'Jane A. Doe' },
      { label: 'Date of birth', value: 'January 15, 1990' },
      { label: 'Social Security number', value: '●●●-●●-6789' },
    ],
  },
  {
    heading: 'Contact information',
    editHref: '#step-contact',
    items: [
      { label: 'Mailing address', value: ['123 Main St', 'Springfield, IL 62701'] },
      { label: 'Home phone', value: '(555) 123-4567' },
      { label: 'Email', value: 'jane.doe@email.com' },
    ],
  },
  {
    heading: 'Service history',
    editHref: '#step-service',
    items: [
      { label: 'Branch', value: 'Army' },
      { label: 'Service dates', value: 'March 2010 - September 2018' },
      { label: 'Character of service', value: 'Honorable' },
    ],
  },
  {
    heading: 'Supporting documents',
    editHref: '#step-documents',
    items: [
      { label: 'Files uploaded', value: ['DD214.pdf', 'medical-records.pdf'] },
    ],
  },
];

// Navigate to step when edit is clicked
summary.addEventListener('civ-summary-edit', (e) => {
  window.location.hash = e.detail.href;
});
```

**Guidance:**
- Sections appear in the same order as the form steps
- All sections are visible at once — no accordions (improves scannability and reduces interaction cost)
- Mask sensitive data (SSN shows last 4 only)
- Each section has an edit link that navigates back to the relevant form step
- File upload and repeater sections show the same presentation as their input pages

---

### Signature / Statement of Truth

VA pattern: [Ask users for Signature](https://design.va.gov/patterns/ask-users-for/signature)

```html
<civ-fieldset legend="Statement of truth">
  <p class="civ-text-base civ-text-secondary civ-mb-4">
    I certify that the information I have provided is true and correct
    to the best of my knowledge and belief.
  </p>

  <civ-text-input
    label="Your full name"
    name="signatureName"
    required
    required-message="Enter your full name to sign"
    hint="Please type your first and last name"
    autocomplete="name"
  ></civ-text-input>

  <civ-checkbox
    label="I certify the information above is correct and true to the best of my knowledge and belief"
    name="certify"
    value="true"
    required
    required-message="You must certify before submitting"
  ></civ-checkbox>
</civ-fieldset>
```

**VA guidance:**
- Placed at the end of the review page, before submit
- When using statement of truth, do NOT also show a separate privacy policy checkbox
- For PDF generation, the typed name goes into the Signature field with current UTC timestamp

---

### Confirmation Page

After successful submission, show a confirmation with key details:

```html
<civ-alert variant="success" heading="We've received your application">
  You submitted your application on April 18, 2026.
</civ-alert>

<civ-summary heading="What you submitted"></civ-summary>

<civ-fieldset legend="What happens next">
  <p>We'll review your application and contact you within 30 days.</p>
  <p>If we need more information, we'll reach out using your preferred contact method.</p>
</civ-fieldset>
```

---

## Flow Patterns

### Multi-Step Form with Progress

**CivUI divergence:** VA's "one thing per page" principle often results in one field per
page, creating 20+ page forms. Research from GDS and Baymard Institute shows that
grouping logically related fields on the same step (name + DOB, phone + email, street +
city + state + ZIP) reduces page count and form abandonment without increasing cognitive
load. Group by topic, not by field — each step should cover one *concept*, not one *input*.

Use `civ-progress-steps` for multi-page form navigation:

```html
<civ-progress-steps current="2"></civ-progress-steps>
```

```js
const steps = document.querySelector('civ-progress-steps');
steps.steps = [
  { label: 'Personal information', status: 'complete' },
  { label: 'Contact information', status: 'current' },
  { label: 'Service history', status: 'incomplete' },
  { label: 'Supporting documents', status: 'incomplete' },
  { label: 'Review and submit', status: 'incomplete' },
];
```

Or use `civ-progress-bar` for forms with dynamic/unknown step count:

```html
<civ-progress-bar
  value="40"
  label="Application progress"
  status="2 of 5 sections complete"
></civ-progress-bar>
```

---

### Eligibility Screener

VA pattern: [Help users to Check eligibility](https://design.va.gov/patterns/help-users-to/check-eligibility)

**CivUI divergence:** VA's yes/no buttons are stateless — they trigger immediate page
navigation without storing the user's choice, so the selection is lost on back-navigation.
CivUI's `civ-yes-no` is a stateful form control (`role="radiogroup"` with persistent
`value` property). State is preserved through back navigation and `civ-form` session
persistence, so it's safe to use for screening flows.

```html
<civ-form>
  <civ-yes-no
    label="Are you a Veteran or active-duty service member?"
    name="isVeteran"
    required
  ></civ-yes-no>

  <civ-conditional when="isVeteran" equals="no">
    <civ-alert variant="info" heading="You may not be eligible">
      This benefit is available to Veterans and active-duty service members.
      You may still be eligible as a dependent. Contact us for more information.
    </civ-alert>
  </civ-conditional>

  <civ-conditional when="isVeteran" equals="yes">
    <civ-yes-no
      label="Were you honorably discharged?"
      name="honorableDischarge"
      required
    ></civ-yes-no>

    <civ-conditional when="honorableDischarge" equals="yes">
      <civ-alert variant="success" heading="You may be eligible">
        Based on your answers, you may be eligible for this benefit. Continue to apply.
      </civ-alert>
    </civ-conditional>
  </civ-conditional>
</civ-form>
```

---

### Prefilled Data

VA pattern: [Help users to Know when their information is prefilled](https://design.va.gov/patterns/help-users-to/know-when-their-information-is-prefilled)

When the user is authenticated, show a notification and prefill form fields:

```html
<civ-alert variant="info" heading="We've prefilled some of your information">
  We pulled this from your VA.gov profile. If you need to update it,
  you can do so here or in your profile settings.
</civ-alert>

<civ-form prefill>
  <civ-text-input label="First name" name="firstName" value="Jane"></civ-text-input>
  <civ-text-input label="Last name" name="lastName" value="Doe"></civ-text-input>
  <civ-text-input label="Email" name="email" value="jane.doe@va.gov"></civ-text-input>
</civ-form>
```

**VA guidance:**
- Always tell users their information was prefilled
- Let users edit prefilled data (don't make it read-only unless identity-verified fields like SSN)
- For SSN on authenticated users, show read-only: "Social Security number: ●●●-●●-6789"

---

### Save and Resume

Use `civ-form` with the `persist` attribute for session storage:

```html
<civ-form persist="va-form-21-526ez">
  <!-- form fields... -->
</civ-form>
```

This auto-saves form state to `sessionStorage` and restores it on page reload. For longer persistence (days/weeks), implement server-side save with a "save and finish later" pattern:

```html
<div class="civ-flex civ-gap-3 civ-mt-6">
  <civ-button type="submit" label="Continue"></civ-button>
  <civ-button variant="secondary" label="Save and finish later"></civ-button>
</div>
```

---

## Complex Form Architecture

Large government applications (disability compensation, pension, education benefits) can
have 50-100+ fields across many sections, with content that expands and contracts based
on answers. These can't be treated as a single linear form. They need a hierarchical
structure: a **book** of **chapters**, where each chapter is a self-contained form with
its own steps, review, and validation.

### The Book Model

```
Book (the full application)
├── Chapter 1: Personal Information
│   ├── Step 1.1: Name + DOB
│   ├── Step 1.2: SSN + VA file number
│   └── Chapter Review
├── Chapter 2: Contact Information
│   ├── Step 2.1: Mailing address
│   ├── Step 2.2: Phone + email
│   └── Chapter Review
├── Chapter 3: Service History          ← may not appear if not a veteran
│   ├── Step 3.1: Service periods (repeater)
│   ├── Step 3.2: POW status            ← conditional
│   └── Chapter Review
├── Chapter 4: Disabilities             ← expands with each condition added
│   ├── Step 4.1: Condition list (repeater)
│   ├── Step 4.2-N: Details per condition
│   └── Chapter Review
├── Chapter 5: Supporting Documents
│   ├── Step 5.1: File upload
│   └── Chapter Review
├── Book Review (all chapters)
└── Signature + Submit
```

**Key principles:**
- Each chapter is independently completable and reviewable
- Chapters can be done in any order (unless one depends on another)
- The chapter list itself is dynamic — answers in one chapter can add/remove other chapters
- Progress is tracked at two levels: within each chapter and across the book
- Users can leave and return at any point (save/resume at book level)

---

### Task List Hub

The hub page is the user's home base. It shows all chapters as a task list with status.
Users navigate here between chapters, and return here after completing each one.

This follows the [GDS Task List pattern](https://design-system.service.gov.uk/components/task-list/)
adapted for government benefit applications.

```html
<h1 class="civ-text-2xl civ-font-bold civ-mb-2">Apply for disability compensation</h1>
<p class="civ-text-secondary civ-mb-6">Complete each section. You can do them in any order.</p>

<civ-progress-bar
  value="40"
  label="Overall progress"
  status="2 of 5 sections complete"
></civ-progress-bar>

<h3 class="civ-heading-md">Prepare</h3>
<civ-list dividers>
  <civ-list-item href="#/eligibility">
    <span class="civ-block civ-font-bold">Check your eligibility</span>
    <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>

<h3 class="civ-heading-md">Fill out your application</h3>
<civ-list dividers>
  <civ-list-item href="#/personal">
    <span class="civ-block civ-font-bold">Personal information</span>
    <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
  </civ-list-item>
  <civ-list-item href="#/contact">
    <span class="civ-block civ-font-bold">Contact information</span>
    <span class="civ-block civ-text-sm civ-text-muted">Phone number needed</span>
    <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
  </civ-list-item>
  <civ-list-item href="#/service">
    <span class="civ-block civ-font-bold">Service history</span>
    <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>

<h3 class="civ-heading-md">Review and submit</h3>
<civ-list dividers>
  <civ-list-item>
    <span class="civ-block civ-font-bold">Review your application</span>
    <span class="civ-block civ-text-sm civ-text-muted">Complete all sections first</span>
    <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
  </civ-list-item>
</civ-list>
```

`<civ-badge>` carries `role="status"` and `with-icon` auto-renders the variant's semantic icon (success → check-circle, error → ✕, warning → ⚠).

**Task statuses:**

| Status | Badge |
|---|---|
| `not-started` | `info` secondary |
| `in-progress` | `info` primary |
| `complete` | `success` primary |
| `cannot-start` | `neutral` secondary (omit `href` on the row to make it non-clickable) |
| `error` | `error` secondary |
| `review` | `warning` primary |

**Accessibility:**
- Each clickable row is an `<a>` filling the whole `<li>`
- Static rows are plain `<li>` with no anchor — same visual rhythm
- Section headings are real `<h3>` elements that screen readers can navigate to

---

### Chapter Flow

Within each chapter, use `civ-progress-steps` or `civ-progress-bar` for step-level
navigation. Each chapter ends with a chapter-level review page using `civ-summary`.

```
┌─────────────────────────────────────────┐
│  ← Back to task list                    │
│                                         │
│  Chapter: Service History               │
│  ████████░░░░░░░░  Step 1 of 3          │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Service periods                 │    │
│  │  [repeater with detail mode]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Back]              [Save and continue] │
└─────────────────────────────────────────┘
```

**Navigation within a chapter:**
```html
<!-- Top of each chapter page -->
<a href="#/hub" class="civ-link civ-mb-4 civ-block">
  <civ-icon name="arrow-left" size="sm"></civ-icon>
  Back to task list
</a>

<h2 class="civ-text-xl civ-font-bold civ-mb-2">Service history</h2>

<civ-progress-bar
  value="33"
  label="Service history progress"
  status="Step 1 of 3"
></civ-progress-bar>

<!-- Chapter content (one step at a time) -->
<civ-form>
  <!-- fields for this step -->

  <div class="civ-flex civ-justify-between civ-mt-6">
    <civ-button variant="secondary" label="Back"></civ-button>
    <civ-button label="Save and continue"></civ-button>
  </div>
</civ-form>
```

**Chapter review** — at the end of each chapter, show a mini-summary:

```html
<h2 class="civ-text-xl civ-font-bold civ-mb-2">Review: Service history</h2>

<civ-summary></civ-summary>

<div class="civ-flex civ-gap-3 civ-mt-6">
  <civ-button label="Mark as complete and return to task list"></civ-button>
  <civ-button variant="secondary" label="Save and return to task list"></civ-button>
</div>
```

---

### Dynamic Chapters

Chapters can appear, disappear, or change based on user answers. For example:
- Answering "married" adds a "Spouse information" chapter
- Adding 3 disabilities creates 3 sub-chapters for condition details
- Answering "no" to POW status removes the POW details step

Handle this by computing the chapter list from form state:

```js
function computeChapters(formData) {
  const chapters = [
    { id: 'personal', label: 'Personal information', required: true },
    { id: 'contact', label: 'Contact information', required: true },
  ];

  // Conditional chapters based on answers
  if (formData.isVeteran === 'yes') {
    chapters.push({ id: 'service', label: 'Service history', required: true });
  }

  if (formData.maritalStatus === 'married') {
    chapters.push({ id: 'spouse', label: 'Spouse information', required: true });
  }

  // Dynamic chapters from repeater data
  if (formData.disabilities?.length > 0) {
    for (const [i, disability] of formData.disabilities.entries()) {
      chapters.push({
        id: `disability-${i}`,
        label: `Details: ${disability.name || `Condition ${i + 1}`}`,
        required: true,
      });
    }
  }

  chapters.push({ id: 'documents', label: 'Supporting documents', required: true });
  chapters.push({ id: 'review', label: 'Review and submit', required: true });

  return chapters;
}
```

**Progress calculation** accounts for dynamic content:

```js
function computeProgress(chapters, completedChapterIds) {
  const required = chapters.filter(c => c.required);
  const done = required.filter(c => completedChapterIds.has(c.id));
  return Math.round((done.length / required.length) * 100);
}
```

---

### Multi-Level Review

The book has two levels of review:

**1. Chapter review** — shown at the end of each chapter. Uses `civ-summary` with
only that chapter's data. The user can edit within the chapter before marking it complete.

**2. Book review** — shown after all chapters are complete. Uses `civ-summary` with
ALL chapters' data. Edit links navigate back to the relevant chapter.

```html
<!-- Book-level review page -->
<h1 class="civ-text-2xl civ-font-bold civ-mb-6">Review your full application</h1>

<civ-summary heading=""></civ-summary>
```

```js
const summary = document.querySelector('civ-summary');
summary.sections = [
  // Each chapter becomes a section
  {
    heading: 'Personal information',
    editHref: '#/personal',  // navigates back to chapter
    items: [
      { label: 'Name', value: 'Jane A. Doe' },
      { label: 'Date of birth', value: 'January 15, 1990' },
      { label: 'SSN', value: '●●●-●●-6789' },
    ],
  },
  {
    heading: 'Contact information',
    editHref: '#/contact',
    items: [
      { label: 'Mailing address', value: ['123 Main St', 'Springfield, IL 62701'] },
      { label: 'Phone', value: '(555) 123-4567' },
      { label: 'Email', value: 'jane.doe@email.com' },
    ],
  },
  {
    heading: 'Service history',
    editHref: '#/service',
    items: [
      { label: 'Branch', value: 'Army' },
      { label: 'Dates', value: 'Mar 2010 – Sep 2018' },
      { label: 'Discharge', value: 'Honorable' },
    ],
  },
  // ... remaining chapters
];
```

After review, the signature/statement of truth and submit button appear below the summary.

---

### Example: Disability Compensation Application

Here's how a full VA Form 21-526EZ maps to the book model:

```
Book: VA Form 21-526EZ — Disability Compensation
│
├── Eligibility (screener)
│   └── Veteran status + discharge check
│
├── Chapter: Personal Information
│   ├── Name + DOB + SSN
│   └── Chapter review
│
├── Chapter: Contact Information
│   ├── Mailing address
│   ├── Home address (conditional: "same as mailing?")
│   ├── Phone + email
│   └── Chapter review
│
├── Chapter: Service History
│   ├── Service periods (repeater, detail mode)
│   ├── Reserves/National Guard (conditional)
│   ├── POW status (conditional)
│   └── Chapter review
│
├── Chapter: Disabilities                    ← dynamic
│   ├── Add conditions (repeater, detail mode)
│   ├── [For each condition]:
│   │   ├── Condition details
│   │   ├── Date of onset
│   │   ├── Cause (in-service, secondary, aggravated)
│   │   └── Treatment history
│   └── Chapter review
│
├── Chapter: Supporting Documents
│   ├── DD214 upload
│   ├── Medical evidence upload
│   └── Chapter review
│
├── Book Review
│   ├── All chapters summary (civ-summary)
│   ├── Statement of truth (signature)
│   └── Submit
│
└── Confirmation
    ├── Success alert
    ├── Submission summary
    └── Next steps
```

**Components used:**

| Concept | Component |
|---|---|
| Task list hub | `civ-list` + `civ-list-item` + `civ-tag` (composition pattern) |
| Book-level progress | `civ-progress-bar` |
| Chapter-level progress | `civ-progress-steps` or `civ-progress-bar` |
| Chapter navigation | `civ-button` (back/continue) |
| Conditional chapters | `civ-conditional` + JS chapter computation |
| Repeating items | `civ-repeater` (`mode="detail"` for complex items) |
| Chapter review | `civ-summary` (chapter data only) |
| Book review | `civ-summary` (all chapters) |
| Signature | `civ-text-input` + `civ-checkbox` |
| Confirmation | `civ-alert` (success) + `civ-summary` |
| Persistence | `civ-form` with `persist` + server-side draft saving |

**Pattern primitives:**
- `civ-list` — generic list container with optional `dividers`
- `civ-list-item` — list row; set `href` to make the whole row a clickable anchor, omit for locked rows
- `civ-badge` — semantic status indicator (`info | success | warning | error | neutral`) with `role="status"` and optional `with-icon` for the variant's semantic icon

---

## MCP Tool Reference

CivUI's MCP server includes tools that generate many of these patterns automatically:

| VA Pattern | MCP Tool | What It Generates |
|---|---|---|
| Full name | `compose-forms` | Name fieldset with first/middle/last/suffix |
| Address | `generate-address-block` | Complete address fieldset with validation |
| Direct deposit | `compose-forms` | Account type + routing + account number fieldset |
| Service history | `generate-repeatable-section` | Repeater with branch, dates, discharge |
| File upload | `compose-forms` | File upload with type/size constraints |
| Review page | `generate-summary` | Summary page from form schema |
| Signature | `generate-signature-block` | Statement of truth with name + checkbox |
| Confirmation | `generate-confirmation-page` | Success alert + summary + next steps |
| Eligibility | `generate-eligibility-screener` | Yes/no screening flow with alerts |
| Error messages | `generate-error-messages` | VA-compliant error text for all fields |
| Multi-step flow | `generate-section-progress` | Progress steps/bar from schema |
| Conditional logic | `generate-conditional-reveal` | Conditional sections from field dependencies |
| Prefill mapping | `generate-prefill-mapping` | Maps API fields to form field names |
| Save/resume | `generate-save-resume-ui` | Save/resume UI and persistence logic |
| Validation | `generate-validation-schema` | Field validation rules from schema |
| 508 report | `generate-508-report` | Accessibility compliance audit |
| Analytics | `generate-analytics-plan` | Event tracking plan for form interactions |
| Tests | `generate-tests` | Vitest test suite for form |
| Print CSS | `generate-print-css` | Print-friendly stylesheet |

### Example: Generate a complete VA form

```
Use the compose-forms tool to create a VA Form 21-526EZ
(Application for Disability Compensation) with these sections:
1. Personal information (name, DOB, SSN)
2. Contact information (address, phone, email)
3. Service history (repeatable service periods)
4. Disability details
5. Supporting documents (file upload)
6. Review and submit (summary + signature)
```

The MCP server will generate complete HTML, validation, error messages, and test scaffolding following all VA patterns documented above.
