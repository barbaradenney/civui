---
title: Link Card
sidebar_position: 2
sidebar_label: Link Card
---

# civ-link-card

A clickable card that navigates to a destination. The entire card is the click target and renders as an `<a>` element wrapping the content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | `''` | Navigation destination (required) |
| `heading` | `string` | `''` | Card heading text |
| `description` | `string` | `''` | Descriptive text below the heading |
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'critical'` | `'primary'` | Visual variant |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `civ-analytics` | — | Analytics tracking event fired on click |

## Variants

### Primary

Blue filled card with white text.

```html
<civ-link-card
  href="/benefits/disability"
  heading="Disability compensation"
  description="File a claim for a service-connected disability."
></civ-link-card>
```

### Secondary

White card with blue border and blue heading.

```html
<civ-link-card
  href="/benefits/education"
  heading="Education benefits"
  description="Apply for GI Bill and other education programs."
  variant="secondary"
></civ-link-card>
```

### Tertiary

White card with gray border and blue heading.

```html
<civ-link-card
  href="/profile"
  heading="Your profile"
  description="Update your personal information."
  variant="tertiary"
></civ-link-card>
```

### Critical

Yellow/gold background with black text for urgent actions.

```html
<civ-link-card
  href="/action-required"
  heading="Action required"
  description="You have a pending decision that needs your response."
  variant="critical"
></civ-link-card>
```

## Live Examples

### Default

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Primary

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--primary&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Secondary

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--secondary&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Tertiary

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--tertiary&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Critical

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--critical&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### All Variants

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--all-variants&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Density Scale

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--density-scale&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Benefits Hub

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--benefits-hub&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

### Dashboard Grid

<iframe
  src="/civui/storybook/iframe.html?id=ui-link-card--dashboard-grid&viewMode=story"
  width="100%"
  height="300"
  style={{border: "1px solid #dfe1e2", borderRadius: "6px"}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/ui-link-card--default)
