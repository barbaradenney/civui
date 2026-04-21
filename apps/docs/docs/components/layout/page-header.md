---
title: Page Header
sidebar_position: 1
sidebar_label: Page Header
---

# civ-page-header

A structured page heading with slot areas for tag, eyebrow, heading, and subheading content. Use data attributes to assign children to each area.

## Slots

| Slot Attribute | Description |
|----------------|-------------|
| `data-tag` | Tag element displayed above the eyebrow |
| `data-eyebrow` | Category or breadcrumb text above the heading |
| `data-heading` | Main heading content (supports inline elements like tags) |
| `data-subheading` | Supplementary text below the heading |

Children without a data attribute are placed in the heading area by default.

## Examples

### Minimal header

```html
<civ-page-header>
  <h1 data-heading>Dashboard</h1>
</civ-page-header>
```

### Full header with eyebrow and subheading

```html
<civ-page-header>
  <span data-eyebrow>Benefits</span>
  <h1 data-heading>Apply for disability compensation</h1>
  <span data-subheading>VA Form 21-526EZ</span>
</civ-page-header>
```

### Header with stacked tag and inline tag

```html
<civ-page-header>
  <civ-tag data-tag label="Active" variant="green" tag-style="primary"></civ-tag>
  <span data-eyebrow>Benefits</span>
  <h1 data-heading>
    Apply for disability compensation
    <civ-tag label="In progress" variant="teal"></civ-tag>
  </h1>
  <span data-subheading>VA Form 21-526EZ</span>
</civ-page-header>
```

## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Eyebrow

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--with-eyebrow&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Subheading

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--with-subheading&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### With Status Tag

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--with-status-tag&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All Slot Combinations

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--all-slot-combinations&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Form Page

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--form-page-header&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Claim Detail

<iframe
  src="/civui/storybook/iframe.html?id=ui-page-header--claim-detail-header&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/ui-page-header--default)
