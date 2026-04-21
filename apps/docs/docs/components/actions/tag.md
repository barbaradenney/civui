---
title: Tag
sidebar_position: 2
sidebar_label: Tag
---

# civ-tag

A small status label rendered as a colored pill. Used to indicate status, categories, or metadata.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Tag text content |
| `variant` | `'blue' \| 'teal' \| 'red' \| 'green' \| 'yellow' \| 'orange' \| 'purple' \| 'gray'` | `'gray'` | Color variant |
| `tag-style` | `'primary' \| 'secondary'` | `'secondary'` | Emphasis level |

## Styles

### Primary (high emphasis)

Bold/dark background with light text. Use for definitive statuses.

```html
<civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
<civ-tag label="Denied" variant="red" tag-style="primary"></civ-tag>
```

### Secondary (low emphasis, default)

Light background with dark text. Use for informational or in-progress statuses.

```html
<civ-tag label="Not started" variant="blue"></civ-tag>
<civ-tag label="In progress" variant="teal"></civ-tag>
```

## Color variants

| Variant | Typical use |
|---------|-------------|
| `blue` | Not started, new |
| `teal` | In progress, active |
| `green` | Complete, approved |
| `red` | Error, denied, rejected |
| `yellow` | Warning, needs attention |
| `orange` | Pending review |
| `purple` | Special category |
| `gray` | Inactive, archived |

## Dark mode

Tag colors are token-based and automatically adjust in dark mode via `prefers-color-scheme`. Primary style tags use darker backgrounds with lighter text; secondary style tags use lighter backgrounds with darker text.

## Density

Tag size is controlled by the density system. Wrap in a parent with `data-civ-scale="dense"` or `data-civ-scale="spacious"` to adjust sizing.

```html
<div data-civ-scale="dense">
  <civ-tag label="Compact" variant="blue"></civ-tag>
</div>
```

## Examples

```html
<civ-tag label="Denied" variant="red" tag-style="primary"></civ-tag>
<civ-tag label="Not started" variant="blue"></civ-tag>
<civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
<civ-tag label="In progress" variant="teal"></civ-tag>
<civ-tag label="Needs attention" variant="yellow"></civ-tag>
```

## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=ui-tag--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Primary

<iframe
  src="/civui/storybook/iframe.html?id=ui-tag--primary&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Secondary

<iframe
  src="/civui/storybook/iframe.html?id=ui-tag--secondary&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All Variants

<iframe
  src="/civui/storybook/iframe.html?id=ui-tag--all-variants&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=ui-tag--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Claim Statuses

<iframe
  src="/civui/storybook/iframe.html?id=ui-tag--claim-statuses&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/ui-tag--default)
