/**
 * Embedded component catalog content derived from docs/ai-guide.md.
 * Kept as a string constant so the MCP server has zero filesystem dependencies at runtime.
 */
export const COMPONENT_CATALOG = `# CivUI Component Catalog

## Component Quick Reference

| Tag | Category | Key Props | Event Detail |
|-----|----------|-----------|--------------|
| \`<civ-text-input>\` | Input | \`type\`, \`width\`, \`placeholder\`, \`maxlength\`, \`pattern\`, \`autocomplete\`, \`inputmode\` | \`{ value }\` |
| \`<civ-textarea>\` | Input | \`rows\`, \`maxlength\`, \`placeholder\` | \`{ value }\` |
| \`<civ-select>\` | Input | \`options\`, \`emptyLabel\`, \`preset\` | \`{ value }\` |
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
| \`<civ-file-upload>\` | File | \`accept\`, \`multiple\`, \`maxSize\`, \`maxFiles\` | \`{ files: File[] }\` |
| \`<civ-form-field>\` | Wrapper | \`label\`, \`hint\`, \`error\`, \`required\`, \`requiredMessage\`, \`touched\` | — |
| \`<civ-form-fieldset>\` | Wrapper | \`legend\`, \`hint\`, \`error\`, \`required\`, \`requiredMessage\`, \`touched\` | — |
| \`<civ-fieldset>\` | Layout | \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\` | — |
| \`<civ-form>\` | Layout | \`action\`, \`method\` | \`civ-submit: { formData }\`, \`civ-invalid: { errors }\` |

**Wrapper pattern:** Wrap single-value inputs in \`<civ-form-field>\` and group components in \`<civ-form-fieldset>\`. These wrappers provide label/legend, hint, error, required indicator, and per-field \`touched\` tracking. Self-contained components (\`civ-address\`, \`civ-name\`, \`civ-signature\`, \`civ-checkbox\`, \`civ-toggle\`) do not need wrapping.
**All form-participating components** also have: \`name\`, \`value\`, \`required\`, \`disabled\`.
**Group components** (\`checkbox-group\`, \`radio-group\`, \`memorable-date\`, \`segmented-control\`) use \`<civ-form-fieldset legend="...">\` instead of \`<civ-form-field label="...">\`.

---

## Component Details

### civ-text-input
Standard text input. Props: \`type\` (text|email|number|password|search|tel|url), \`width\`, \`placeholder\`, \`pattern\`, \`maxlength\`/\`minlength\`, \`autocomplete\`, \`inputmode\`.

### civ-textarea
Multi-line text input. Props: \`rows\` (default 5), \`maxlength\` (enables character count), \`placeholder\`.

### civ-select
Dropdown select. Props: \`options\` (Array<{value, label, disabled?}>), \`emptyLabel\` (default "- Select -"), \`preset\` (pre-built list: \`'us-state'\`, \`'us-territory'\`, \`'country'\`, \`'service-branch'\`, \`'suffix'\`, \`'month'\`). The \`preset\` attribute replaces the former \`civ-us-state\`, \`civ-service-branch\`, and other data-list components.

### civ-form-field
Wrapper for single-value inputs. Renders label, hint, error, required indicator. Props: \`label\`, \`hint\`, \`error\`, \`required\`, \`requiredMessage\`, \`hide-required-indicator\`, \`touched\`. Tracks per-field \`touched\` state (set after first \`civ-change\`).

### civ-form-fieldset
Wrapper for group components. Renders legend, hint, error, required indicator. Props: \`legend\`, \`hint\`, \`error\`, \`required\`, \`requiredMessage\`, \`hide-required-indicator\`, \`touched\`.

### civ-combobox
Searchable dropdown with type-ahead. Props: \`options\`, \`placeholder\`, \`noResultsText\`.

### civ-checkbox
Single checkbox. Props: \`checked\`, \`indeterminate\`, \`description\`, \`tile\`. Event: { checked, value }.

### civ-checkbox-group
Multi-checkbox group. Props: \`legend\`, \`tile\`, \`orientation\`. Event: { values: string[] }.

### civ-radio-group > civ-radio
Mutually exclusive choices. Group props: \`legend\`, \`tile\`, \`orientation\`. Radio props: \`label\`, \`value\`, \`description\`, \`tile\`.

### civ-toggle
On/off switch (immediate effect). Props: \`checked\`, \`description\`. Uses role="switch".

### civ-segmented-control > civ-segment
Button-style radio group. Control props: \`legend\`. Segment props: \`label\`, \`value\`, \`selected\`.

### civ-date-picker
Calendar dialog for scheduling dates. Props: \`min\`, \`max\`, \`placeholder\`, \`locale\`, \`weekStartsOn\`. Form value: YYYY-MM-DD.

### civ-memorable-date
Three-field date entry (Month/Day/Year) for known dates. Props: \`legend\`, \`monthLabel\`, \`dayLabel\`, \`yearLabel\`, \`locale\`.

### civ-file-upload
Drag-and-drop file upload. Props: \`accept\`, \`multiple\`, \`maxSize\`, \`maxFiles\`. Event: { files: File[] }.

### civ-fieldset
Structural grouping wrapper. Props: \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\`.

### civ-form
Form validation coordinator. Props: \`action\`, \`method\`. Events: \`civ-submit\` { formData }, \`civ-invalid\` { errors }.

### civ-button
Action button. Variants: \`primary\` (filled blue), \`secondary\` (outlined), \`tertiary\` (gray, input-height). Add \`danger\` for destructive.

### civ-link
Navigation link. Variants: \`primary\` (button-styled), \`secondary\` (underlined + caret), \`tertiary\` (plain underlined), \`back\` (left chevron). Add \`danger\` for destructive.

### civ-tag
Status label. 8 color variants. \`tag-style="primary"\` for bold/dark background, \`"secondary"\` (default) for light.

### civ-page-header
Page heading. Slots: \`data-tag\` (top), \`data-eyebrow\`, \`data-heading\` (supports inline tags), \`data-subheading\`.

### civ-link-card
Clickable card. Props: \`href\`, \`heading\`, \`description\`, \`variant\` (primary/secondary/tertiary/critical).

### civ-card
Container with slots: \`data-card-header\`, \`data-card-footer\`. Prop: \`spacing\` (default/sm).

### civ-divider
Horizontal rule. Prop: \`spacing\` (default/sm).

### civ-task-list / civ-task-group / civ-task
Task list navigation. civ-task props: \`label\`, \`hint\`, \`href\`, \`status\` (not-started/in-progress/complete/cannot-start/error).

### civ-progress-bar
Overall progress. Props: \`value\`, \`label\`, \`status\`.

### civ-progress-steps
Step indicator. Props: \`steps\` (JSON), \`current\`, \`show-counter\`, \`clickable\`.

---

## Component Selection Guide

| Scenario | Component |
|----------|-----------|
| Single yes/no agreement | civ-checkbox |
| Multiple selections from list | civ-checkbox-group |
| One choice from 2–7 options | civ-radio-group |
| One choice from 8+ options | civ-select |
| Searchable large list | civ-combobox |
| Immediate on/off toggle | civ-toggle |
| UI mode switch, 2–5 options | civ-segmented-control |
| Scheduling / appointments | civ-date-picker |
| Known past dates (birthday) | civ-memorable-date |

**DEPRECATED:** Never use civ-date-input — use civ-date-picker or civ-memorable-date instead.
`;
