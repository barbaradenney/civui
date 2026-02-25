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
| \`<civ-file-upload>\` | File | \`accept\`, \`multiple\`, \`maxSize\`, \`maxFiles\` | \`{ files: File[] }\` |
| \`<civ-fieldset>\` | Layout | \`legend\`, \`hint\`, \`error\`, \`required\`, \`disabled\` | — |
| \`<civ-form>\` | Layout | \`action\`, \`method\` | \`civ-submit: { formData }\`, \`civ-invalid: { errors }\` |

**All form-participating components** also have: \`label\`, \`name\`, \`value\`, \`hint\`, \`error\`, \`required\`, \`disabled\`, \`requiredMessage\`.
**Group components** (\`checkbox-group\`, \`radio-group\`, \`memorable-date\`, \`segmented-control\`) use \`legend\` instead of \`label\`.

---

## Component Details

### civ-text-input
Standard text input. Props: \`type\` (text|email|number|password|search|tel|url), \`width\`, \`placeholder\`, \`pattern\`, \`maxlength\`/\`minlength\`, \`autocomplete\`, \`inputmode\`.

### civ-textarea
Multi-line text input. Props: \`rows\` (default 5), \`maxlength\` (enables character count), \`placeholder\`.

### civ-select
Dropdown select. Props: \`options\` (Array<{value, label, disabled?}>), \`emptyLabel\` (default "- Select -").

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
