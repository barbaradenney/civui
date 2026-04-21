---
title: Summary
sidebar_position: 4
sidebar_label: Summary
---

# civ-summary

Read-only review page component that displays form data before final submission. Renders structured sections with headings, edit links, and key-value pairs.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `string` | `''` | Main heading for the summary page |
| `sections` | `SummarySection[]` | `[]` | Sections to display (set via JavaScript) |

## Types

```typescript
interface SummarySection {
  heading: string;        // Section heading (e.g., "Personal information")
  editHref?: string;      // Link for the edit action (href or step ID)
  items: SummaryItem[];   // Key-value pairs to display
}

interface SummaryItem {
  label: string;                  // Label (e.g., "First name")
  value?: string | string[];      // Value(s) to display; falsy renders "Not provided"
}
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-summary-edit` | `{ section: string, href: string }` | When an edit link is clicked |

## Examples

```html
<civ-summary heading="Review your information"></civ-summary>

<script>
  const summary = document.querySelector('civ-summary');
  summary.sections = [
    {
      heading: 'Personal information',
      editHref: '#step-1',
      items: [
        { label: 'First name', value: 'Jane' },
        { label: 'Middle name' },
        { label: 'Last name', value: 'Doe' },
        { label: 'Date of birth', value: 'January 15, 1985' },
      ],
    },
    {
      heading: 'Contact information',
      editHref: '#step-2',
      items: [
        { label: 'Email', value: 'jane.doe@example.com' },
        { label: 'Phone', value: '(555) 123-4567' },
        { label: 'Preferred contact methods', value: ['Email', 'Text message'] },
      ],
    },
  ];
</script>
```