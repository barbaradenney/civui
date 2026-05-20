---
title: Typography
sidebar_position: 1
sidebar_label: Typography
---

import StoryEmbed from "@site/src/components/StoryEmbed";

# Typography

CivUI provides heading and body text classes built on design tokens. All classes use the `civ-` prefix and pair with semantic HTML elements.

## Examples

### Primary Headings

<StoryEmbed id="foundations-typography--primary-headings" />

### Secondary Headings

<StoryEmbed id="foundations-typography--secondary-headings" />

### Primary + Secondary Paired

<StoryEmbed id="foundations-typography--primary-and-secondary-paired" />

### Body Text

<StoryEmbed id="foundations-typography--body-text" />

### All Styles

<StoryEmbed id="foundations-typography--all-styles" />

### Government Form Example

<StoryEmbed id="foundations-typography--gov-form-example" />

### Density Scale

<StoryEmbed id="foundations-typography--density-scale" />

[Open in Storybook →](pathname:///civui/storybook/?path=/story/foundations-typography--all-styles)

## Headings

Headings come in two styles: **primary** (bold) for section titles and **secondary** (regular weight) for supporting context.

### Primary headings

Bold weight for main section headers and page titles.

| Class | Size | Weight | Margin |
|-------|------|--------|--------|
| `.civ-heading-xl` | 24px (1.5rem) | Bold (700) | `civ-mb-6` |
| `.civ-heading-lg` | 20px (1.25rem) | Bold (700) | `civ-mb-4` |
| `.civ-heading-md` | 18px (1.125rem) | Bold (700) | `civ-mb-3` |
| `.civ-heading-sm` | 16px (1rem) | Bold (700) | `civ-mb-2` |

```html
<h1 class="civ-heading-xl">Apply for disability compensation</h1>
<h2 class="civ-heading-lg">Personal information</h2>
<h3 class="civ-heading-md">Mailing address</h3>
<h4 class="civ-heading-sm">Additional details</h4>
```

### Secondary headings

Regular weight for supporting context, sub-sections, or form step descriptions.

| Class | Size | Weight | Margin |
|-------|------|--------|--------|
| `.civ-heading-xl-secondary` | 24px (1.5rem) | Regular (400) | `civ-mb-6` |
| `.civ-heading-lg-secondary` | 20px (1.25rem) | Regular (400) | `civ-mb-4` |
| `.civ-heading-md-secondary` | 18px (1.125rem) | Regular (400) | `civ-mb-3` |
| `.civ-heading-sm-secondary` | 16px (1rem) | Regular (400) | `civ-mb-2` |

```html
<h2 class="civ-heading-lg-secondary">We'll use this information to verify your identity</h2>
<h3 class="civ-heading-md-secondary">You can update this later in your profile</h3>
```

### When to use each

- **Primary:** page titles, fieldset legends, section headers that introduce new content
- **Secondary:** step descriptions, contextual subheadings, follow-up text under a primary heading

```html
<h1 class="civ-heading-xl">Step 2: Service history</h1>
<h2 class="civ-heading-lg-secondary">Tell us about your time in service</h2>
```

## Body text

| Class | Size | Color | Use for |
|-------|------|-------|---------|
| `.civ-text-body` | 16px | `base-darkest` | Default paragraph text |
| `.civ-text-muted` | 16px | `base` | Secondary or de-emphasized text |
| `.civ-text-caption` | 14px | `base-dark` | Field hints, footnotes, supplementary context |
| `.civ-text-small` | 12px | `base-dark` | Legal disclaimers, fine print, timestamps |

```html
<p class="civ-text-body">Your application has been submitted.</p>
<p class="civ-text-muted">You will receive a confirmation email within 24 hours.</p>
<p class="civ-text-caption">Last updated: April 24, 2026</p>
<p class="civ-text-small">OMB Control No. 2900-0747 | Estimated burden: 25 minutes</p>
```

## Font sizes

Available via Tailwind utilities with the `civ-` prefix:

| Class | Size |
|-------|------|
| `civ-text-xs` | 12px (0.75rem) |
| `civ-text-sm` | 14px (0.875rem) |
| `civ-text-base` | 16px (1rem) |
| `civ-text-lg` | 18px (1.125rem) |
| `civ-text-xl` | 20px (1.25rem) |
| `civ-text-2xl` | 24px (1.5rem) |
| `civ-text-3xl` | 28px (1.75rem) |
| `civ-text-4xl` | 36px (2.25rem) |
| `civ-text-5xl` | 48px (3rem) |

## Font weights

| Class | Weight |
|-------|--------|
| `civ-font-light` | 300 |
| `civ-font-regular` | 400 |
| `civ-font-semibold` | 600 |
| `civ-font-bold` | 700 |

## Line heights

| Class | Value |
|-------|-------|
| `civ-leading-none` | 1 |
| `civ-leading-tight` | 1.25 |
| `civ-leading-snug` | 1.375 |
| `civ-leading-normal` | 1.5 |
| `civ-leading-relaxed` | 1.625 |
| `civ-leading-loose` | 2 |

## Font stack

CivUI uses a system font stack for fast loading and native feel:

```
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
"Helvetica Neue", Arial, sans-serif
```

Monospace (for code and masked inputs):

```
"Roboto Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace
```

## Density scaling

All heading and text sizes respond to the density system. Wrap content in a `data-civ-scale` container to scale proportionally:

```html
<div data-civ-scale="dense">
  <h2 class="civ-heading-lg">Compact heading</h2>
</div>

<div data-civ-scale="spacious">
  <h2 class="civ-heading-lg">Spacious heading</h2>
</div>
```
