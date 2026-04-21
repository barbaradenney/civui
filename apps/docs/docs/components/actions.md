---
title: Actions
sidebar_position: 3
sidebar_label: Actions
---

# Action Components

## civ-button

A button component with three visual variants and a danger modifier.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `"primary"` | Visual style: `primary`, `secondary`, `tertiary` |
| `type` | `string` | `"button"` | Button type: `button`, `submit`, `reset` |
| `danger` | `boolean` | `false` | Applies destructive/danger styling |
| `disabled` | `boolean` | `false` | Disables the button |

### Variants

- **primary** — Solid filled button for primary actions
- **secondary** — Outlined button for secondary actions
- **tertiary** — Text-only button for low-emphasis actions
- **danger** (modifier) — Combines with any variant to indicate destructive action

### Example

```html
<civ-button variant="primary" type="submit">Submit application</civ-button>

<civ-button variant="secondary">Save as draft</civ-button>

<civ-button variant="tertiary">Cancel</civ-button>

<civ-button variant="secondary" danger>Remove entry</civ-button>

<civ-button variant="primary" disabled>Processing...</civ-button>
```

---

## civ-tag

A small label/badge for categorization or status indication. Supports 8 color variants and two styles.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Tag text |
| `tag-style` | `string` | `"primary"` | Fill style: `primary` (solid), `secondary` (outlined) |
| `variant` | `string` | `"default"` | Color variant |

### Color Variants

`default`, `info`, `success`, `warning`, `error`, `purple`, `teal`, `orange`

### Example

```html
<civ-tag label="Active" variant="success"></civ-tag>

<civ-tag label="Pending review" variant="warning" tag-style="secondary"></civ-tag>

<civ-tag label="Denied" variant="error"></civ-tag>

<civ-tag label="Draft" variant="default" tag-style="secondary"></civ-tag>
```
