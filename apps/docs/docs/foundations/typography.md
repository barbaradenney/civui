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

### Eyebrow

<StoryEmbed id="foundations-typography--eyebrow" />

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

Bold weight for main section headers and page titles. Sizes are fluid — they grow smoothly from the mobile minimum to the desktop maximum.

| Class | Token | Fluid range (mobile → desktop) | Weight | Margin |
|-------|-------|--------------------------------|--------|--------|
| `.civ-heading-xl` | `2xl` | 24px → 33px | Bold (700) | `civ-mb-6` |
| `.civ-heading-lg` | `xl` | 22px → 27px | Bold (700) | `civ-mb-4` |
| `.civ-heading-md` | `lg` | 19px → 23px | Bold (700) | `civ-mb-3` |
| `.civ-heading-sm` | `base` | 17px → 19px | Bold (700) | `civ-mb-2` |

```html
<h1 class="civ-heading-xl">Apply for disability compensation</h1>
<h2 class="civ-heading-lg">Personal information</h2>
<h3 class="civ-heading-md">Mailing address</h3>
<h4 class="civ-heading-sm">Additional details</h4>
```

### Secondary headings

Regular weight for supporting context, sub-sections, or form step descriptions.

| Class | Token | Fluid range (mobile → desktop) | Weight | Margin |
|-------|-------|--------------------------------|--------|--------|
| `.civ-heading-xl-secondary` | `2xl` | 24px → 33px | Regular (400) | `civ-mb-6` |
| `.civ-heading-lg-secondary` | `xl` | 22px → 27px | Regular (400) | `civ-mb-4` |
| `.civ-heading-md-secondary` | `lg` | 19px → 23px | Regular (400) | `civ-mb-3` |
| `.civ-heading-sm-secondary` | `base` | 17px → 19px | Regular (400) | `civ-mb-2` |

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

| Class | Token | Fluid range (mobile → desktop) | Color | Use for |
|-------|-------|--------------------------------|-------|---------|
| `.civ-text-body` | `base` | 17px → 19px | `base-darkest` | Default paragraph text |
| `.civ-text-muted` | `base` | 17px → 19px | `base` | Secondary or de-emphasized text |
| `.civ-text-caption` | `sm` | 15px → 16px | `base-dark` | Field hints, footnotes, supplementary context |
| `.civ-text-small` | `xs` | 13px (static) | `base-dark` | Legal disclaimers, fine print, timestamps |

```html
<p class="civ-text-body">Your application has been submitted.</p>
<p class="civ-text-muted">You will receive a confirmation email within 24 hours.</p>
<p class="civ-text-caption">Last updated: April 24, 2026</p>
<p class="civ-text-small">OMB Control No. 2900-0747 | Estimated burden: 25 minutes</p>
```

## Eyebrow

A small uppercase caption that sits **above** a heading or value to give it context — a section label, a card category, a metric name. The `.civ-eyebrow` recipe is:

| Class | Recipe | Color |
|-------|--------|-------|
| `.civ-eyebrow` | `civ-text-sm` + `civ-font-semibold` + `uppercase` + `letter-spacing: 0.05em` | `base-dark` |

The slight letter-spacing is the one place CivUI adds tracking — it's a display treatment for uppercase text, never applied to body copy.

You rarely write `.civ-eyebrow` directly; three components compose it for you:

- **`<civ-page-header>`** — the `data-eyebrow` slot (category / breadcrumb text above the page title)
- **`<civ-link-card>`** — the `eyebrow` prop (category label above the card heading)
- **`<civ-metric-tile>`** — the `label` prop (the metric name above its value)

On a light surface the eyebrow renders in `base-dark` gray. Inside a dark-background variant (e.g. `<civ-link-card variant="primary">`), it resets to `color: inherit` so it picks up the variant's white foreground and stays legible — gray on a primary fill would be effectively invisible.

```html
<civ-page-header>
  <span data-eyebrow>Disability</span>
  <h1 data-heading>Apply for compensation</h1>
  <p data-subheading>Tell us about your service-connected condition</p>
</civ-page-header>

<!-- Standalone, if you need the style outside those components -->
<p class="civ-eyebrow">Healthcare</p>
```

## Font sizes

Available via Tailwind utilities with the `civ-` prefix. Sizes are fluid — they scale smoothly from a mobile minimum (at 320px viewport) up to a desktop maximum (at 1200px+). The ratio between adjacent steps is 1.125 (major-second) on mobile, smoothing to 1.2 (minor-third) on desktop.

| Class | Token step | Fluid range (mobile → desktop) |
|-------|------------|--------------------------------|
| `civ-text-xs` | −2 | 13px (static — negative steps don't scale) |
| `civ-text-sm` | −1 | 15px → 16px |
| `civ-text-base` | 0 | 17px → 19px |
| `civ-text-lg` | 1 | 19px → 23px |
| `civ-text-xl` | 2 | 22px → 27px |
| `civ-text-2xl` | 3 | 24px → 33px |
| `civ-text-3xl` | 4 | 27px → 39px |
| `civ-text-4xl` | 5 | 31px → 47px |
| `civ-text-5xl` | 6 | 34px → 57px (display / hero) |

The `[data-civ-scale="dense|spacious"]` density modifiers retune the base size and ratio — see [Density scaling](#density-scaling) below.

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

## Using a custom font

CivUI loads **no web fonts by default** — the system stack renders instantly with a native feel and zero network cost. If your agency requires a specific brand font (Public Sans for USWDS-aligned projects is the most common; SF Pro-as-webfont is another), you can swap it in without touching component CSS.

### 1. Override the font-family token

Every CivUI surface reads its font family from a single CSS custom property, `--civ-typography-fontFamily-sans`. Override it once on `:root` (after CivUI's stylesheet loads) and the new font flows through every heading, label, input, and body class:

```css
:root {
  --civ-typography-fontFamily-sans: 'Public Sans', system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

Keep the system fonts as the fallback tail so text still renders if the brand font fails to load. There's a matching `--civ-typography-fontFamily-mono` for code and masked inputs.

### 2. Load the font with `@font-face`

```css
@font-face {
  font-family: 'Public Sans';
  src: url('/fonts/PublicSans-Variable.woff2') format('woff2');
  font-weight: 100 900; /* variable font: declare the supported range */
  font-display: swap;   /* render the fallback immediately, swap when loaded */
}
```

`font-display: swap` eliminates the flash of invisible text (FOIT) — the system fallback shows immediately and is replaced when the brand font arrives. For connection-constrained government contexts, `font-display: optional` is more aggressive (it only swaps if the font loads within ~100ms, otherwise sticks with the fallback for that page view).

### 3. Prevent layout shift (recommended)

When the brand font swaps in, differing metrics from the fallback cause a reflow (CLS). Eliminate it with a metrics-matched fallback `@font-face` — tools like [`fontpie`](https://github.com/pixel-point/fontpie) or [`@capsizecss/core`](https://github.com/seek-oss/capsize) generate the override values from your font file:

```css
@font-face {
  font-family: 'Public Sans Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%; /* tune so the fallback's x-height matches the brand font */
}

:root {
  --civ-typography-fontFamily-sans: 'Public Sans', 'Public Sans Fallback', system-ui, sans-serif;
}
```

With the override, the fallback renders at the brand font's metrics, so the swap is visually invisible — same line breaks, same heading sizes, same paragraph heights.

### Production checklist

- **Subset the font to the scripts you ship.** Latin (or Latin + Latin-Extended for Spanish content) takes a 500 KB variable font down to ~80 KB.
- **Self-host the file** rather than linking a third-party CDN — government sites generally can't depend on external font hosts, and self-hosting avoids a render-blocking third-party request.
- **Re-check the optical details.** A brand font with a different x-height may want a different [underline offset](#link-underline-geometry); `font-optical-sizing: auto` (applied by CivUI) only does anything when the font is variable.
- A brand-font rollout is real engineering — plan it as its own task, not a one-line edit. The contributor guide's [_Extending for a brand font_](https://github.com/barbaradenney/civui/blob/main/.claude/rules/typography.md) section has the full rationale.

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

## Rendering primitives

CivUI applies several typography rendering primitives automatically to every named heading and body class. These produce the visual polish you see on cards, callouts, modals, and form chrome without any consumer markup. The contract and rationale live in [`.claude/rules/typography.md`](https://github.com/barbaradenney/civui/blob/main/.claude/rules/typography.md) (internal contributor guide).

### Leading trim

The half-leading at the top of the first line and bottom of the last line is trimmed via `text-box-trim: both` so text sits flush with container padding edges. Heading and body classes get this automatically:

<StoryEmbed id="foundations-typography--leading-trim" />

For arbitrary elements (a `<span>` inside a card, a one-off `<div>`), opt in with the utility:

```html
<span class="civ-text-trim">Visually flush text</span>
```

Browser support: Chrome 133+, Safari 16.4+, Firefox 142+. Older browsers wrap normally — pure progressive enhancement.

### Tabular numerals

Digits render in tabular figures (fixed-width per glyph) on surfaces where digit columns need to line up. Applied automatically to:

- Data grid cells (`.civ-data-grid__td--num`), reference tables (`.civ-table__num`)
- Pagination status text and numbered buttons
- Metric tile values, count badges
- Itemized total amounts
- Timeline timestamps
- Masked numeric inputs (SSN, EIN, ZIP, phone, currency, routing-number, VA-file-number) — anything that sets `inputmode="numeric|decimal|tel"` or `type="number"`

For arbitrary elements (any custom digit display), opt in with the utility:

```html
<span class="civ-num">$1,234.56</span>
```

Don't apply to body prose where a number appears inline ("You have 3 dependents listed") — tabular figures look mechanical in flowing text.

### Text wrap balance and pretty

Headings get `text-wrap: balance` so short text (≤6 lines) distributes evenly across lines instead of orphaning the last word. Body prose gets `text-wrap: pretty` so the last line isn't a single dangling word.

Applied automatically:

| Property | Applied to |
|---|---|
| `text-wrap: balance` | All `.civ-heading-*`, `.civ-page-header__heading` + `__subheading`, `.civ-alert__heading`, `.civ-notice__header`, `.civ-link-card__heading`, `.civ-section-intro__heading`, `.civ-repeater__row-heading` |
| `text-wrap: pretty` | All `.civ-text-body`, `.civ-text-muted`, `.civ-text-caption`, `.civ-text-small`, `.civ-hint`, `.civ-alert__body`, `.civ-notice__body`, `.civ-section-intro__body`, `.civ-link-card__description` |

For arbitrary elements, use Tailwind utilities:

```html
<h2 class="civ-text-balance">Custom heading</h2>
<p class="civ-text-pretty">Custom paragraph that needs orphan prevention.</p>
```

Both features degrade to default wrapping in unsupported browsers — pure progressive enhancement, never a layout regression.

### Link underline geometry

Link variants (`.civ-link--primary`, `.civ-link--secondary`, `.civ-link--back`, their `--danger` variants, and `.civ-breadcrumb__link`) get an em-relative underline thickness and offset:

- `text-decoration-thickness: 0.0625em` (1px at 16px body)
- `text-underline-offset: 0.1875em` (3px at 16px body)

The em values scale with font-size, so a heading-sized link gets a proportionally thicker underline at a proportionally lower offset. The browser default sits too close to the baseline and passes through descenders — the explicit offset clears them.

Two intentional non-link underlines keep context-specific values:

- `.civ-data-grid__sort-btn:hover` — 2px offset (subtle feedback for a sortable column header)
- `.civ-nav__link--current` — 4px offset + 2px thickness (thick accent line for the active page)

### Font feature baseline

All text inherits the following from the `body` element:

```css
font-kerning: normal;
font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
font-optical-sizing: auto;
```

This ensures consistent rendering across OS-default fonts (San Francisco on macOS / iOS, Segoe UI Variable on Windows 11, Roboto on Android), which ship different kerning, ligature, and contextual-alternate defaults. `font-optical-sizing: auto` opts into the optical-size variant when the rendered font is variable (no-op on non-variable fonts).

## Long-form prose (`.civ-prose`)

For pages with long body text — instructions, policy prose, eligibility text, error pages — wrap the content in `.civ-prose`:

```html
<div class="civ-prose">
  <p>VA collects this information under authority of 38 U.S.C. Sections 1705 and 1710 to determine your eligibility for VA health care benefits. The information you provide will be used to verify your identity, confirm your eligibility, and process your application.</p>
  <p>Failure to furnish the requested information may delay or prevent processing of your application.</p>
</div>
```

The wrapper:

- Caps reading width at 65 characters per line (WCAG SC 1.4.8 recommends 45–75 chars for readability)
- Inherits `text-wrap: pretty` for orphan prevention
- Adds `hanging-punctuation: first allow-end last` (Safari-only opt-in — degrades gracefully elsewhere)

Apply on the section / article wrapper, not on individual paragraphs.

## Print

Typography classes have paper-calibrated point sizes when printed. These activate inside `@media print` and use `!important` to override the screen-calibrated rem/px values:

| Class | Print size |
|-------|------------|
| `.civ-heading-xl` (+ secondary) | 14pt |
| `.civ-heading-lg` (+ secondary) | 13pt |
| `.civ-heading-md` (+ secondary) | 12pt |
| `.civ-heading-sm` (+ secondary) | 11pt |
| `.civ-text-body` | 11pt |
| `.civ-text-caption` | 9pt |
| `.civ-text-small` | 8pt |
| `.civ-eyebrow` | 8pt |
| `.civ-label` / `.civ-legend` | 10pt |
| `.civ-hint` | 9pt |

Tabular numerals are preserved in print — eligibility letters and itemized totals are routinely printed.

