/**
 * Resource: CivUI component decision tree.
 * Structured guide for choosing the right component for each field type.
 */

export const DECISION_TREE = `# CivUI Component Decision Tree

Use this guide to select the correct CivUI component for each form field.

## Is it a date?

- **Yes → Is it a date the user already knows (birthday, document date)?**
  - Yes → \`<civ-memorable-date>\` with \`hint="For example: January 15 1990"\`
  - No → **Is it a scheduling/appointment date?**
    - Yes → \`<civ-date-picker>\` with \`hint="For example: 01/15/2024"\`

## Is it a choice?

- **Yes → How many options?**
  - **2 options (yes/no, on/off)**
    - Is it an instant-effect setting? → \`<civ-toggle>\`
    - Is it a form field? → \`<civ-checkbox>\` (single) or \`<civ-radio-group>\` with 2 \`<civ-radio>\`
  - **2–5 options controlling a view/filter** → \`<civ-segmented-control>\` with \`<civ-segment>\` children
  - **2–7 options in a form** → \`<civ-radio-group>\` with \`<civ-radio>\` children
  - **Multiple selections (2–7 options)** → \`<civ-checkbox-group>\` with \`<civ-checkbox>\` children
  - **8+ options** → \`<civ-select>\`
  - **8+ options, searchable** → \`<civ-combobox>\`
  - **Multiple selections (8+ options)** → \`<civ-select multiple>\`

## Is it a file?

- **Yes** → \`<civ-file-upload>\`
  - Set \`accept\` for allowed types, \`max-size\` for size limit
  - Set \`multiple\` and \`max-files\` for multi-file
  - Max size should not exceed 25 MB for government forms

## Is it multi-line text?

- **Yes** → \`<civ-textarea>\`
  - Set \`rows\` for initial height, \`maxlength\` for character limit

## Text field type selection

- **Email** → \`<civ-text-input type="email" autocomplete="email">\`
- **Phone** → \`<civ-text-input type="tel" autocomplete="tel" inputmode="tel">\`
- **SSN** → \`<civ-form-field hint="For example: 123 45 6789"><civ-text-input inputmode="numeric">\`
- **ZIP code** → \`<civ-form-field><civ-text-input inputmode="numeric" autocomplete="postal-code">\`
- **URL** → \`<civ-text-input type="url">\`
- **Password** → \`<civ-text-input type="password" autocomplete="new-password">\`
- **Search** → \`<civ-text-input type="search">\`
- **Number** → \`<civ-text-input type="number">\` (with \`min\`, \`max\`, \`step\` as needed)
- **General text** → \`<civ-text-input>\`

## Structural decisions

### Should I wrap the input?
- **Single-value input** (text, textarea, select, combobox, date-picker, file-upload) → Wrap in \`<civ-form-field label="...">\`
- **Group component** (radio-group, checkbox-group, memorable-date, segmented-control) → Wrap in \`<civ-form-fieldset legend="...">\`
- **Self-contained component** (civ-address, civ-name, civ-signature, civ-checkbox, civ-toggle) → No wrapping needed, these manage their own labels

### Should I group fields?
- **Yes, if fields are logically related** → Wrap in \`<civ-fieldset legend="...">\`
- Keep fieldsets flat — avoid nesting fieldsets inside fieldsets
- Each fieldset should have no more than 7 direct form fields
- If the form has more than 20 fields without fieldsets, break it into sections

### Should I use a preset select?
- **US state list** → \`<civ-select preset="us-state">\` (replaces \`<civ-us-state>\`)
- **Service branch list** → \`<civ-select preset="service-branch">\` (replaces \`<civ-service-branch>\`)
- **Country, suffix, month** → \`<civ-select preset="country|suffix|month">\`

### Should I wrap in a form?
- **Yes** → Use \`<civ-form>\` for:
  - Automatic error summary with anchor links
  - Form submission handling
  - Validate-on-submit behavior (not validate-on-blur)
- All form-participating components should be inside \`<civ-form>\` or \`<form>\`

## Anti-patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| \`<civ-form-group>\` | Removed | Use \`<civ-form-field>\` or \`<civ-form-fieldset>\` |
| \`<civ-us-state>\` / \`<civ-service-branch>\` | Removed | Use \`<civ-select preset="us-state|service-branch">\` |
| Label on input component | Incorrect — wrapper owns the label | Move label/hint/error to \`<civ-form-field>\` or \`<civ-form-fieldset>\` |
| \`placeholder\` without \`label\` | Not accessible — placeholder is not a label | Always provide a \`label\` attribute |
| Radio group with 1 option | Semantically incorrect | Use \`<civ-checkbox>\` instead |
| Radio group with 8+ options | Too many options for radio | Use \`<civ-select>\` or \`<civ-combobox>\` |
| Nested fieldsets | Confusing for screen readers | Use headings or separate sections |
| Generic required-message | Not helpful for users | Use field-specific text: "Enter your full name" |
| Abbreviations in labels | Violates plain language | Spell out: "Date of birth" not "DOB" |
| Physical CSS properties | Breaks RTL layouts | Use logical properties: \`civ-ms-\` not \`civ-ml-\` |
| \`focus:civ-outline-*\` or \`focus-visible:civ-focus-ring\` | Both deprecated | Remove — focus ring is applied globally by \`civ.css\` to native interactive elements |
| Checkbox value with comma | Breaks checkbox-group delimiter | Remove commas from checkbox values |
`;
