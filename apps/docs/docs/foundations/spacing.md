---
title: Spacing
sidebar_position: 7
sidebar_label: Spacing
---

# Spacing

CivUI uses a consistent spacing scale for padding, margin, and gap. All values are available as Tailwind utilities with the `civ-` prefix and respond to the density system.

## Spacing scale

| Token | Default | Class example |
|-------|---------|---------------|
| `0` | 0px | `civ-p-0`, `civ-m-0` |
| `px` | 1px | `civ-p-px` |
| `0.5` | 3px | `civ-p-0_5`, `civ-gap-0_5` |
| `1` | 5px | `civ-p-1`, `civ-m-1` |
| `1.5` | 8px | `civ-p-1_5`, `civ-gap-1_5` |
| `2` | 10px | `civ-p-2`, `civ-m-2` |
| `2.5` | 13px | `civ-p-2_5` |
| `3` | 15px | `civ-p-3`, `civ-gap-3` |
| `4` | 20px | `civ-p-4`, `civ-m-4` |
| `5` | 25px | `civ-p-5` |
| `6` | 30px | `civ-p-6`, `civ-gap-6` |
| `8` | 40px | `civ-p-8`, `civ-gap-8` |
| `10` | 50px | `civ-p-10` |
| `12` | 60px | `civ-p-12`, `civ-gap-12` |
| `16` | 80px | `civ-p-16` |
| `20` | 100px | `civ-p-20` |

Decimal tokens use underscores in Tailwind class names: `0.5` becomes `0_5`, `1.5` becomes `1_5`, `2.5` becomes `2_5`.

## Utility classes

Spacing utilities follow Tailwind conventions with the `civ-` prefix:

### Padding

| Pattern | Description |
|---------|-------------|
| `civ-p-{size}` | All sides |
| `civ-px-{size}` | Horizontal (left + right) |
| `civ-py-{size}` | Vertical (top + bottom) |
| `civ-pt-{size}` | Top |
| `civ-pb-{size}` | Bottom |
| `civ-ps-{size}` | Inline-start (RTL-safe) |
| `civ-pe-{size}` | Inline-end (RTL-safe) |

### Margin

| Pattern | Description |
|---------|-------------|
| `civ-m-{size}` | All sides |
| `civ-mx-{size}` | Horizontal |
| `civ-my-{size}` | Vertical |
| `civ-mt-{size}` | Top |
| `civ-mb-{size}` | Bottom |
| `civ-ms-{size}` | Inline-start (RTL-safe) |
| `civ-me-{size}` | Inline-end (RTL-safe) |

### Gap

| Pattern | Description |
|---------|-------------|
| `civ-gap-{size}` | Row and column gap |
| `civ-gap-x-{size}` | Column gap only |
| `civ-gap-y-{size}` | Row gap only |

## RTL-safe spacing

Use logical properties (`ps`, `pe`, `ms`, `me`) instead of physical (`pl`, `pr`, `ml`, `mr`) for layouts that need to work in right-to-left contexts:

```html
<!-- Correct — RTL-safe -->
<div class="civ-ps-4 civ-me-2">Content</div>

<!-- Avoid — breaks in RTL -->
<div class="civ-pl-4 civ-mr-2">Content</div>
```

## Density scaling

Spacing tokens respond to the density system. The same class produces different pixel values depending on the active scale:

| Token | Dense (0.75x) | Default (1x) | Spacious (1.5x) |
|-------|---------------|--------------|-----------------|
| `4` | 15px | 20px | 30px |
| `6` | 23px | 30px | 45px |
| `8` | 30px | 40px | 60px |

```html
<div data-civ-scale="dense">
  <div class="civ-p-4">15px padding</div>
</div>

<div>
  <div class="civ-p-4">20px padding (default)</div>
</div>

<div data-civ-scale="spacious">
  <div class="civ-p-4">30px padding</div>
</div>
```

## Common spacing patterns

### Form field spacing

Form components use `civ-mb-4` between fields automatically. For manual layouts:

```html
<div class="civ-flex civ-flex-col civ-gap-4">
  <civ-text-input label="First name" name="first"></civ-text-input>
  <civ-text-input label="Last name" name="last"></civ-text-input>
</div>
```

### Section spacing

Use larger tokens to separate form sections:

```html
<div class="civ-mb-8">
  <h2 class="civ-heading-lg">Personal information</h2>
  <!-- fields -->
</div>

<div class="civ-mb-8">
  <h2 class="civ-heading-lg">Contact information</h2>
  <!-- fields -->
</div>
```

### Inline elements

Use `civ-gap-2` for tight inline groupings, `civ-gap-4` for standard:

```html
<div class="civ-flex civ-items-center civ-gap-2">
  <civ-icon name="info"></civ-icon>
  <span>Additional details</span>
</div>
```

## CSS custom properties

All spacing tokens are available as CSS custom properties:

```css
padding: var(--civ-spacing-4);
margin-bottom: var(--civ-spacing-8);
gap: var(--civ-spacing-2);
```
