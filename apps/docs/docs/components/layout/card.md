---
title: Card
sidebar_position: 2
sidebar_label: Card
---

# civ-card

A structured container with header, body, and footer slot areas. The card provides border, padding, and section styling. Use data attributes to assign children to header and footer; all other content goes into the body.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `'default' \| 'sm'` | `'default'` | Padding size inside the card |

## Slots

| Slot Attribute | Description |
|----------------|-------------|
| `data-card-header` | Content rendered in the card header area |
| `data-card-footer` | Content rendered in the card footer area |
| _(default)_ | All other children render in the body |

## Examples

### Basic card

```html
<civ-card>
  <p>Card content goes here.</p>
</civ-card>
```

### Card with header and footer

```html
<civ-card>
  <div data-card-header>
    <civ-tag label="In progress" variant="teal"></civ-tag>
    <h3 class="civ-heading-md">Disability compensation</h3>
  </div>
  <p>Filed: March 10, 2026</p>
  <div data-card-footer>
    <civ-link href="/claims/123" variant="secondary">View details</civ-link>
  </div>
</civ-card>
```

### Small spacing

```html
<civ-card spacing="sm">
  <p>Compact card content.</p>
</civ-card>
```

### Card with expandable footer

```html
<civ-card>
  <div data-card-header>
    <h3 class="civ-heading-md">Payment history</h3>
  </div>
  <p>Last payment: $1,234.56</p>
  <details data-card-footer>
    <summary>View breakdown</summary>
    <p>Detail content here</p>
  </details>
</civ-card>
```


## Live Example

<iframe
  src="/civui/storybook/iframe.html?id=ui-card--default&viewMode=story"
  width="100%"
  height="300"
  style={{border: '1px solid #dfe1e2', borderRadius: '6px'}}
></iframe>

[Open in Storybook →](/civui/storybook/?path=/story/ui-card--default)
