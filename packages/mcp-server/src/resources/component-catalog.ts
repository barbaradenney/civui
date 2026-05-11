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
| \`<civ-form-fieldset>\` | Wrapper | \`legend\`, \`hint\`, \`error\`, \`required\`, \`requiredMessage\`, \`touched\`, \`heading-level\` (1-6), \`size\` (sm/md/lg/xl) | — |
| \`<civ-fieldset>\` | Layout | \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\`, \`heading-level\` (1-6), \`size\` (sm/md/lg/xl) | — |
| \`<civ-form>\` | Layout | \`action\`, \`method\` | \`civ-submit: { formData }\`, \`civ-invalid: { errors }\` |

**Self-contained pattern:** Every CivUI control renders its own label / legend chrome — set \`label="..."\` directly on single inputs and \`legend="..."\` directly on group components. \`<civ-form-fieldset>\` is only for genuine multi-field grouping (a section heading over several controls).
**All form-participating components** also have: \`name\`, \`value\`, \`required\`, \`disabled\`.

---

## Component Details

### civ-text-input
Standard text input. Props: \`type\` (text|email|number|password|search|tel|url), \`width\`, \`placeholder\`, \`pattern\`, \`maxlength\`/\`minlength\`, \`autocomplete\`, \`inputmode\`.

### civ-textarea
Multi-line text input. Props: \`rows\` (default 5), \`maxlength\` (enables character count), \`placeholder\`.

### civ-select
Dropdown select. Props: \`options\` (Array<{value, label, disabled?}>), \`emptyLabel\` (default "- Select -"), \`preset\` (pre-built list: \`'us-state'\`, \`'service-branch'\`, \`'discharge-type'\`, \`'suffix'\`, \`'gender'\`, \`'marital-status'\`, etc.), \`preset-variant\` (e.g., \`'territories'\`, \`'all'\`, \`'binary'\`). Presets also work on \`civ-radio-group\` and \`civ-checkbox-group\`. Use \`import { resolvePresetOptions } from '@civui/core'\` for programmatic access.

### civ-form-fieldset
Wrapper for multi-field groups (e.g., a custom address block with street/city/state inside). Renders legend, hint, error, required indicator. Props: \`legend\`, \`hint\`, \`error\`, \`required\`, \`requiredMessage\`, \`hide-required-indicator\`, \`touched\`, \`heading-level\` (1-6), \`size\` (sm/md/lg/xl). Single inputs and self-contained group components (radio-group, checkbox-group, etc.) already carry their own label / legend — do not wrap them here.

### civ-combobox
Searchable dropdown with type-ahead. Props: \`options\`, \`placeholder\`, \`noResultsText\`.

### civ-checkbox
Single checkbox. Props: \`checked\`, \`indeterminate\`, \`description\`, \`tile\`. Event: { checked, value }.

### civ-checkbox-group
Multi-checkbox group. Props: \`legend\`, \`tile\`, \`orientation\`, \`preset\`, \`preset-variant\`. Event: { values: string[] }. Presets auto-render \`<civ-checkbox>\` children.

### civ-radio-group > civ-radio
Mutually exclusive choices. Group props: \`legend\`, \`tile\`, \`orientation\`, \`preset\`, \`preset-variant\`. Radio props: \`label\`, \`value\`, \`description\`, \`tile\`. Presets auto-render \`<civ-radio>\` children.

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
Categorization label (topics, taxonomies, filter chips). Variants: \`blue\`, \`orange\`, \`purple\`, \`gray\`. \`tag-style="primary"\` for bold/dark background, \`"secondary"\` (default) for light. For **status** ("Approved", "In progress", "Error"), use \`<civ-badge>\` instead — it carries \`role="status"\` and uses semantic colors (info/success/warning/error/neutral).

### civ-page-header
Page heading. Slots: \`data-tag\` (top), \`data-eyebrow\`, \`data-heading\` (supports inline tags), \`data-subheading\`.

### civ-link-card
Clickable card. Props: \`href\`, \`heading\`, \`description\`, \`variant\` (primary/secondary/tertiary/critical).

### civ-card
Container with slots: \`data-card-header\`, \`data-card-footer\`. Prop: \`spacing\` (default/sm).

### civ-divider
Horizontal rule. Prop: \`spacing\` (default/sm).

### civ-list / civ-list-item
Generic list primitive. \`<civ-list>\` renders \`<ul role="list">\` with optional \`dividers\` prop. \`<civ-list-item>\` renders \`<li>\`; setting \`href\` makes the whole row a clickable anchor. Trailing content (status tag, switch, etc.) is placed via the \`data-list-item-end\` attribute on a child. Use this for task lists, side nav, link collections, search results.

### civ-progress-bar
Overall progress. Props: \`value\`, \`label\`, \`status\`.

### civ-progress
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
`;
