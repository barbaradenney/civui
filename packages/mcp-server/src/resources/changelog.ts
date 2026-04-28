/**
 * Resource: CivUI changelog — breaking changes, new components, and deprecated APIs.
 */

export const CHANGELOG = `# CivUI Changelog

## Breaking Changes

### \`civ-date-input\` deprecated
\`<civ-date-input>\` has been removed. It had critical accessibility issues with Dragon NaturallySpeaking, VoiceOver, and TalkBack.

**Migration:**
- For known dates (birthdays, document dates): use \`<civ-memorable-date>\`
- For scheduling / appointment dates: use \`<civ-date-picker>\`

### \`civ-form-group\` replaced by \`civ-form-field\` / \`civ-form-fieldset\`
\`<civ-form-group>\` has been removed. Use \`<civ-form-field>\` for single-value inputs and \`<civ-form-fieldset>\` for group components. Labels, hints, errors, and required indicators now live on the wrapper, not on the input component itself.

\`\`\`html
<!-- Before (removed) -->
<civ-form-group>
  <civ-text-input label="Name" name="name" required></civ-text-input>
</civ-form-group>

<!-- After -->
<civ-form-field label="Name" required>
  <civ-text-input name="name" required></civ-text-input>
</civ-form-field>
\`\`\`

### Data-list components replaced by \`civ-select preset\`
\`<civ-us-state>\`, \`<civ-service-branch>\`, and other data-list components have been removed. Use \`<civ-select preset="...">\` instead.

Available presets: \`us-state\`, \`us-territory\`, \`country\`, \`service-branch\`, \`suffix\`, \`month\`.

\`\`\`html
<!-- Before (removed) -->
<civ-us-state label="State" name="state" required></civ-us-state>

<!-- After -->
<civ-form-field label="State" required>
  <civ-select name="state" preset="us-state" required></civ-select>
</civ-form-field>
\`\`\`

### Focus ring class change
\`focus:civ-outline-*\` classes are deprecated. Use \`focus-visible:civ-focus-ring\` on all interactive elements.

\`\`\`html
<!-- Before (deprecated) -->
<button class="focus:civ-outline-primary">Submit</button>

<!-- After -->
<button class="focus-visible:civ-focus-ring">Submit</button>
\`\`\`

### Physical → logical CSS properties
Physical CSS properties (\`civ-ml-\`, \`civ-mr-\`, \`civ-pl-\`, \`civ-pr-\`, \`civ-border-l-\`, \`civ-border-r-\`, \`civ-rounded-l-\`, \`civ-rounded-r-\`) are deprecated for RTL safety.

**Use logical equivalents:**
| Physical | Logical |
|----------|---------|
| \`civ-ml-\` | \`civ-ms-\` |
| \`civ-mr-\` | \`civ-me-\` |
| \`civ-pl-\` | \`civ-ps-\` |
| \`civ-pr-\` | \`civ-pe-\` |
| \`civ-border-l-\` | \`civ-border-s-\` |
| \`civ-border-r-\` | \`civ-border-e-\` |
| \`civ-rounded-l-\` | \`civ-rounded-s-\` |
| \`civ-rounded-r-\` | \`civ-rounded-e-\` |

## New Components

### \`civ-form-field\` / \`civ-form-fieldset\`
Wrapper components that provide label/legend, hint, error, required indicator, and per-field \`touched\` tracking. Use \`<civ-form-field>\` for single-value inputs and \`<civ-form-fieldset>\` for group components. Self-contained components (\`civ-address\`, \`civ-name\`, \`civ-signature\`, \`civ-checkbox\`, \`civ-toggle\`) do not need wrapping.

### \`civ-select preset\` attribute
Pre-built option lists for common data: \`us-state\`, \`us-territory\`, \`country\`, \`service-branch\`, \`suffix\`, \`month\`. Replaces removed data-list components (\`civ-us-state\`, \`civ-service-branch\`, etc.).

### \`civ-combobox\`
Searchable dropdown combining text input with filtered options. Use for lists with 8+ options where users benefit from typing to filter.

### \`civ-segmented-control\`
Mutually exclusive toggle group (tab-like). Use for 2–5 options that control a view or filter. Wraps \`<civ-segment>\` children.

### \`civ-toggle\`
Boolean on/off switch. Use for instant-effect settings (not for forms that need submit). Always provide an explicit \`value\` attribute.

### \`civ-file-upload\`
File attachment with drag-and-drop, accept filter, size limits, and multi-file support. Fires \`civ-change\` with \`{ files: File[] }\` detail.

## New Features

### \`required-message\` attribute
All form components now support \`required-message\` for field-specific validation text. Generic messages like "This field is required" are flagged as warnings.

\`\`\`html
<civ-form-field label="Full name" required required-message="Enter your full legal name">
  <civ-text-input name="full-name" required></civ-text-input>
</civ-form-field>
\`\`\`

### \`autocomplete\` attribute
Identity fields should include \`autocomplete\` for WCAG 1.3.5 compliance: \`email\`, \`tel\`, \`given-name\`, \`family-name\`, \`street-address\`, \`postal-code\`.

### \`inputmode\` attribute
Numeric-entry fields (\`type="tel"\`, SSN, ZIP) should include \`inputmode="numeric"\` or \`inputmode="tel"\` for mobile keyboard optimization.

### Tile variant
\`civ-checkbox\` and \`civ-radio\` support a \`tile\` variant for card-style selections.

### Density system
Apply \`[data-civ-scale="dense"]\` or \`[data-civ-scale="spacious"]\` on a parent element to adjust spacing and font sizes. Three scales: \`dense\`, default, \`spacious\`, plus a \`fluid\` scale for responsive sizing.

### Dark mode
\`darkMode: 'media'\` in Tailwind config — uses \`prefers-color-scheme\`. Token-based dark palette with parity validation. Focus ring colors adapt automatically.

### Error summary
\`<civ-form>\` renders an error summary with anchor links automatically on validation failure. Individual field errors display inline with \`role="alert"\`.

## Deprecated APIs

| API | Status | Replacement |
|-----|--------|-------------|
| \`<civ-date-input>\` | Removed | \`<civ-memorable-date>\` or \`<civ-date-picker>\` |
| \`<civ-form-group>\` | Removed | \`<civ-form-field>\` or \`<civ-form-fieldset>\` |
| \`<civ-us-state>\` | Removed | \`<civ-select preset="us-state">\` |
| \`<civ-service-branch>\` | Removed | \`<civ-select preset="service-branch">\` |
| Data-list components | Removed | \`<civ-select preset="...">\` |
| \`focus:civ-outline-*\` | Deprecated | \`focus-visible:civ-focus-ring\` |
| Physical CSS (\`civ-ml-\`, etc.) | Deprecated | Logical CSS (\`civ-ms-\`, etc.) |
`;
