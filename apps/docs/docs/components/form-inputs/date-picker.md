---
title: Date Picker
sidebar_position: 9
sidebar_label: Date Picker
---

# civ-date-picker

Accessible date picker implementing the W3C APG Dialog + Grid pattern. Combines a text input for manual date entry with a calendar dialog for browsing. Use for scheduling and appointment dates. For known dates (birthday, document dates), use `civ-memorable-date` instead.

## Shared Props

All form components share these props: `label`, `name`, `value`, `hint`, `error`, `required`, `disabled`.

## Component-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `string` | `''` | Minimum date in `YYYY-MM-DD` format |
| `max` | `string` | `''` | Maximum date in `YYYY-MM-DD` format |
| `placeholder` | `string` | `'mm/dd/yyyy'` | Input placeholder text |
| `locale` | `string` | `'en-US'` | Locale for date formatting |
| `week-starts-on` | `number` | `0` | Day week starts on (0 = Sunday, 1 = Monday) |
| `disabled-dates` | `string` | `''` | JSON array of ISO date strings to disable |

### Customization Labels

| Prop | Description |
|------|-------------|
| `choose-date-label` | "Choose date" button aria-label |
| `selected-date-label` | Button label when a date is selected |
| `dialog-label` | Calendar dialog aria-label |
| `previous-month-label` | Previous month button aria-label |
| `next-month-label` | Next month button aria-label |
| `clear-label` | Clear button aria-label |
| `today-label` | Suffix for today's date announcement |

## Value Format

The `value` is always in ISO `YYYY-MM-DD` format regardless of the display locale.

## Calendar Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow keys | Move focus by day (left/right) or week (up/down) |
| Page Down/Up | Next/previous month |
| Shift + Page Down/Up | Next/previous year |
| Home/End | Start/end of current week |
| Enter/Space | Select focused date |
| Escape | Close calendar, return focus to button |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-input` | `{ value: string }` | Fires when text input changes |
| `civ-change` | `{ value: string }` | Fires when a date is selected or typed |

## Examples

```html
<!-- Basic date picker -->
<civ-date-picker
  label="Appointment date"
  name="appointmentDate"
  hint="Choose an available date"
  required
></civ-date-picker>

<!-- With min/max constraints -->
<civ-date-picker
  label="Preferred start date"
  name="startDate"
  min="2026-01-01"
  max="2026-12-31"
  hint="Must be within the current year"
></civ-date-picker>

<!-- With disabled specific dates -->
<civ-date-picker
  label="Select a weekday"
  name="meetingDate"
  disabled-dates='["2026-04-25","2026-04-26"]'
></civ-date-picker>
```



## Live Examples

### appointment

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Value

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--with-value&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Hint

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--with-hint&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Error

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--with-error&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Required

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--required&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Disabled

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--disabled&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Min Max Range

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--min-max-range&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### In Native Form

<iframe
  src="/civui/storybook/iframe.html?id=forms-inputs-date-picker--in-native-form&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/forms-inputs-date-picker--default)
