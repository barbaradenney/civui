---
title: Layout
sidebar_position: 1
sidebar_label: Layout
---

# Layout Components

## civ-page-header

A structured page header with support for tag, eyebrow text, heading, and subheading via named slots.

### Slots

| Slot | Description |
|------|-------------|
| `data-tag` | Optional tag/badge above the eyebrow |
| `data-eyebrow` | Small text above the heading (e.g., section name) |
| `data-heading` | Main page heading (rendered as h1) |
| `data-subheading` | Supporting text below the heading |

### Example

```html
<civ-page-header>
  <span data-tag>Draft</span>
  <span data-eyebrow>Application</span>
  <span data-heading>Apply for benefits</span>
  <span data-subheading>Complete all sections to submit your application.</span>
</civ-page-header>
```

---

## civ-card

A container card with optional header and footer slots.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `string` | `"md"` | Internal padding size (`sm`, `md`, `lg`) |

### Slots

| Slot | Description |
|------|-------------|
| `data-card-header` | Card header content |
| `data-card-footer` | Card footer content |

### Example

```html
<civ-card spacing="lg">
  <div data-card-header>
    <h2>Personal information</h2>
  </div>
  <p>Review and update your personal details below.</p>
  <div data-card-footer>
    <civ-button type="submit">Save changes</civ-button>
  </div>
</civ-card>
```

---

## civ-divider

A horizontal rule for visual separation between content sections.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `string` | `"md"` | Vertical margin above and below (`sm`, `md`, `lg`) |

### Example

```html
<civ-card>
  <p>Section one content.</p>
  <civ-divider spacing="lg"></civ-divider>
  <p>Section two content.</p>
</civ-card>
```
