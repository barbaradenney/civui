---
title: Layout
sidebar_position: 8
sidebar_label: Layout
---

# Layout

CivUI uses flexbox as its primary layout mechanism. All layout utilities use the `civ-` prefix and follow Tailwind naming conventions.

## Flexbox

### Display

```html
<div class="civ-flex">Flex container</div>
<div class="civ-inline-flex">Inline flex container</div>
```

### Direction

```html
<div class="civ-flex civ-flex-row">Horizontal (default)</div>
<div class="civ-flex civ-flex-col">Vertical stack</div>
<div class="civ-flex civ-flex-col-reverse">Vertical reversed</div>
```

### Alignment

| Class | CSS | Use for |
|-------|-----|---------|
| `civ-items-start` | `align-items: flex-start` | Top-align items |
| `civ-items-center` | `align-items: center` | Vertically center items |
| `civ-items-baseline` | `align-items: baseline` | Align text baselines |
| `civ-items-stretch` | `align-items: stretch` | Equal height items |

### Justification

| Class | CSS | Use for |
|-------|-----|---------|
| `civ-justify-start` | `justify-content: flex-start` | Pack items to start |
| `civ-justify-center` | `justify-content: center` | Center items |
| `civ-justify-between` | `justify-content: space-between` | Space items edge-to-edge |
| `civ-justify-end` | `justify-content: flex-end` | Pack items to end |

### Wrapping and sizing

```html
<div class="civ-flex civ-flex-wrap civ-gap-4">Wrap items</div>
<div class="civ-flex-1">Fill remaining space</div>
<div class="civ-flex-shrink-0">Don't shrink</div>
```

## Grid

CivUI provides `civ-grid` for display and `civ-grid-cols-*` for simple column layouts:

```html
<!-- Two equal columns -->
<div class="civ-grid civ-grid-cols-2 civ-gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Three equal columns -->
<div class="civ-grid civ-grid-cols-3 civ-gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

For responsive or complex grids, use inline styles for the template:

```html
<div class="civ-grid civ-gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
  <civ-link-card href="/a" heading="Card A"></civ-link-card>
  <civ-link-card href="/b" heading="Card B"></civ-link-card>
  <civ-link-card href="/c" heading="Card C"></civ-link-card>
</div>
```

## Width

| Class | CSS |
|-------|-----|
| `civ-w-full` | `width: 100%` |
| `civ-max-w-sm` | `max-width: 24rem` (384px) |
| `civ-max-w-md` | `max-width: 28rem` (448px) |
| `civ-max-w-lg` | `max-width: 32rem` (512px) |
| `civ-max-w-xl` | `max-width: 36rem` (576px) |
| `civ-max-w-2xl` | `max-width: 42rem` (672px) |

## Common layout patterns

### Vertical form stack

The most common layout — fields stacked vertically with consistent spacing:

```html
<div class="civ-flex civ-flex-col civ-gap-4">
  <civ-text-input label="First name" name="first"></civ-text-input>
  <civ-text-input label="Last name" name="last"></civ-text-input>
  <civ-text-input label="Email" name="email" type="email"></civ-text-input>
</div>
```

### Label + value inline

For read-only displays or summary rows:

```html
<div class="civ-flex civ-items-baseline civ-justify-between">
  <span class="civ-font-semibold">Full name</span>
  <span>Jane Smith</span>
</div>
```

### Icon + text

Align an icon with adjacent text:

```html
<div class="civ-flex civ-items-center civ-gap-2">
  <civ-icon name="check-circle"></civ-icon>
  <span>Application submitted</span>
</div>
```

### Card grid

Responsive card layout that wraps:

```html
<div class="civ-grid civ-gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
  <civ-link-card href="/benefits" heading="Benefits" description="View your benefits"></civ-link-card>
  <civ-link-card href="/claims" heading="Claims" description="Track your claims"></civ-link-card>
  <civ-link-card href="/profile" heading="Profile" description="Update your info"></civ-link-card>
</div>
```

### Action bar

Buttons aligned to the right:

```html
<div class="civ-flex civ-justify-end civ-gap-4">
  <civ-button variant="secondary" label="Save draft"></civ-button>
  <civ-button label="Continue"></civ-button>
</div>
```

### Centered content

```html
<div class="civ-flex civ-items-center civ-justify-center civ-p-8">
  <p class="civ-text-muted">No results found</p>
</div>
```

## Group layouts

Form groups (`civ-checkbox-group`, `civ-radio-group`) use built-in layout classes:

| Class | Description |
|-------|-------------|
| `.civ-group-layout--vertical` | Stack options vertically (default) |
| `.civ-group-layout--horizontal` | Options side by side |

These are applied automatically via the `orientation` prop on group components:

```html
<civ-radio-group legend="Preferred language" orientation="horizontal">
  <civ-radio label="English" value="en"></civ-radio>
  <civ-radio label="Spanish" value="es"></civ-radio>
</civ-radio-group>
```
