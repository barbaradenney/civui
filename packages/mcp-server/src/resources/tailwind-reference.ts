/**
 * Embedded Tailwind CSS reference for CivUI's `civ-` prefixed utility system.
 * Kept as a string constant so the MCP server has zero filesystem dependencies at runtime.
 *
 * Source data derived from:
 * - tailwind.config.ts (prefix, spacing, typography, shadows, radius, motion)
 * - packages/tokens/src/color.tokens.json (light mode hex values)
 * - packages/tokens/src/color-dark.tokens.json (dark mode hex values)
 * - packages/core/src/styles/components.css (semantic component classes)
 */
export const TAILWIND_REFERENCE = `# CivUI Tailwind CSS Reference

## 1. Prefix Rule

All Tailwind utilities in CivUI MUST use the \`civ-\` prefix. Standard Tailwind classes will NOT work.

| Correct | Wrong |
|---------|-------|
| \`civ-p-4\` | \`p-4\` |
| \`civ-text-primary\` | \`text-primary\` |
| \`civ-bg-white\` | \`bg-white\` |
| \`civ-flex civ-gap-2\` | \`flex gap-2\` |
| \`civ-font-bold\` | \`font-bold\` |

---

## 2. Semantic Colors

All colors use CSS custom properties for automatic dark mode switching.
Use semantic class names (e.g., \`civ-text-primary\`, \`civ-bg-error-lightest\`).

### primary
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #d9e8f6 | #1a3a5c | \`civ-bg-primary-lightest\` |
| lighter | #73b3e7 | #2e6ca8 | \`civ-text-primary-lighter\` |
| light | #2378c3 | #5aa3e8 | \`civ-border-primary-light\` |
| DEFAULT | #005ea2 | #73b3e7 | \`civ-text-primary\`, \`civ-bg-primary\` |
| dark | #1a4480 | #a4cef4 | \`civ-text-primary-dark\` |
| darker | #162e51 | #d0e4f8 | \`civ-bg-primary-darker\` |
| darkest | #0d1f38 | #e8f2fc | \`civ-text-primary-darkest\` (AAA / hero) |

### error
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #faf0f0 | #3a1a1a | \`civ-bg-error-lightest\` |
| lighter | #f4caca | #4a2020 | \`civ-bg-error-lighter\` (mid-tone — danger-button hover) |
| light | #d63e04 | #e87461 | \`civ-text-error-light\` |
| DEFAULT | #b50909 | #f28b82 | \`civ-text-error\`, \`civ-border-error\` |
| dark | #8b0a03 | #f5b7b1 | \`civ-text-error-dark\` |
| darker | #720802 | #f7c6c0 | \`civ-text-error-darker\` (AAA) |
| darkest | #5a0602 | #fad5d0 | \`civ-text-error-darkest\` (AAA / hero) |

### warning
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #faf3d1 | #4a3d1a | \`civ-bg-warning-lightest\` (softest surface) |
| lighter | #fcedb7 | #8a6c2f | \`civ-bg-warning-lighter\` (mid-pale, stronger soft bg) |
| light | #fee685 | #f5d576 | \`civ-text-warning-light\` |
| DEFAULT | #e5a000 | #f5c542 | \`civ-text-warning\`, \`civ-bg-warning\` |
| dark | #936f38 | #c9a24d | \`civ-text-warning-dark\` |
| darker | #7f5d24 | #e1c574 | \`civ-text-warning-darker\` (AA) |
| darkest | #6b4c11 | #f5d576 | \`civ-text-warning-darkest\` (AA text on lightest) |

### success
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #ecf3ec | #1e3a20 | \`civ-bg-success-lightest\` (softest surface) |
| lighter | #b8e6b8 | #3d6e42 | \`civ-bg-success-lighter\` (mid-pale, stronger soft bg) |
| light | #70e17b | #81d88a | \`civ-text-success-light\` |
| DEFAULT | #00a91c | #5cb85c | \`civ-text-success\`, \`civ-bg-success\` |
| dark | #4d8055 | #7ec97e | \`civ-text-success-dark\` |
| darker | #336637 | #93d897 | \`civ-text-success-darker\` (AA) |
| darkest | #1a4d1a | #81d88a | \`civ-text-success-darkest\` (AA text on lightest) |

### info
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #e7f6f8 | #1a3a40 | \`civ-bg-info-lightest\` (softest surface) |
| lighter | #c5ecf2 | #2d5e6a | \`civ-bg-info-lighter\` (mid-pale, stronger soft bg) |
| light | #99deea | #7dd3e0 | \`civ-text-info-light\` |
| DEFAULT | #00bde3 | #4dd0e1 | \`civ-text-info\`, \`civ-bg-info\` |
| dark | #2e6276 | #80deea | \`civ-text-info-dark\` |
| darker | #255365 | #9ce3ed | \`civ-text-info-darker\` (AAA) |
| darkest | #1d4554 | #7dd3e0 | \`civ-text-info-darkest\` (AAA / hero) |

### base
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #f0f0f0 | #2d2d2d | \`civ-bg-base-lightest\` |
| lighter | #dfe1e2 | #3d3d3d | \`civ-bg-base-lighter\` |
| light | #a9aeb1 | #8a8a8a | \`civ-text-base-light\`, \`civ-border-base-light\` |
| DEFAULT | #71767a | #a0a0a0 | \`civ-bg-base\`, \`civ-border-base\` (NOT \`civ-text-base\` — that's a font-size utility) |
| dark | #565c65 | #c4c4c4 | \`civ-text-base-dark\` |
| darker | #3d4551 | #e0e0e0 | \`civ-text-base-darker\` |
| darkest | #1b1b1b | #f0f0f0 | \`civ-text-base-darkest\` |

### white / black
| Token | Light | Dark | Class examples |
|-------|-------|------|----------------|
| white | #ffffff | #1b1b1b | \`civ-bg-white\`, \`civ-text-white\` |
| black | #000000 | #ffffff | \`civ-bg-black\`, \`civ-text-black\` |

### accent-cool
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #e1f3f8 | #1a3a40 | \`civ-bg-accent-cool-lightest\` |
| light | #97d4ea | #6bc5d8 | \`civ-text-accent-cool-light\` |
| DEFAULT | #00bde3 | #4dd0e1 | \`civ-text-accent-cool\` |
| dark | #28a0cb | #80deea | \`civ-text-accent-cool-dark\` |

### accent-warm
| Shade | Light | Dark | Class examples |
|-------|-------|------|----------------|
| lightest | #f2e4d4 | #3d2d1a | \`civ-bg-accent-warm-lightest\` |
| light | #ffbc78 | #f5b87a | \`civ-text-accent-warm-light\` |
| DEFAULT | #fa9441 | #f5a654 | \`civ-text-accent-warm\` |
| dark | #c05600 | #e8924a | \`civ-text-accent-warm-dark\` |

---

## 3. Typography

### Font Families
| Token | Value | Class |
|-------|-------|-------|
| sans | system-ui, sans-serif | \`civ-font-sans\` |
| mono | Roboto Mono, monospace | \`civ-font-mono\` |

### Font Sizes
| Token | Class |
|-------|-------|
| xs | \`civ-text-xs\` |
| sm | \`civ-text-sm\` |
| base | \`civ-text-base\` |
| lg | \`civ-text-lg\` |
| xl | \`civ-text-xl\` |
| 2xl | \`civ-text-2xl\` |
| 3xl | \`civ-text-3xl\` |
| 4xl | \`civ-text-4xl\` |
| 5xl | \`civ-text-5xl\` |

### Font Weights
| Token | Class |
|-------|-------|
| light (300) | \`civ-font-light\` |
| normal (400) | \`civ-font-normal\` |
| semibold (600) | \`civ-font-semibold\` |
| bold (700) | \`civ-font-bold\` |

### Line Heights
| Token | Class |
|-------|-------|
| none (1) | \`civ-leading-none\` |
| tight (1.25) | \`civ-leading-tight\` |
| snug (1.375) | \`civ-leading-snug\` |
| normal (1.5) | \`civ-leading-normal\` |
| relaxed (1.625) | \`civ-leading-relaxed\` |
| loose (2) | \`civ-leading-loose\` |

---

## 4. Spacing Scale

All spacing values are token-backed CSS variables that adjust with the density system.

**CivUI's spacing scale is the standard 4px scale** — same as default Tailwind and CivUI's own iOS/Android native tokens. \`civ-p-4\` is 16px, \`civ-p-2\` is 8px, etc. (Re-based from the former 5px scale on 2026-06-01 so web matches the rest of the ecosystem.) See \`.claude/rules/spacing.md\` for the three rhythm tiers (top-of-page → mb-6, block-stack → mb-4, gap-controlled → no mb).

| Token | CivUI value | Padding | Margin | Gap |
|-------|-------------|---------|--------|-----|
| 0 | 0px | \`civ-p-0\` | \`civ-m-0\` | \`civ-gap-0\` |
| px | 1px | \`civ-p-px\` | \`civ-m-px\` | \`civ-gap-px\` |
| 0.5 | 2px | \`civ-p-0.5\` | \`civ-m-0.5\` | \`civ-gap-0.5\` |
| 1 | 4px | \`civ-p-1\` | \`civ-m-1\` | \`civ-gap-1\` |
| 1.5 | 6px | \`civ-p-1.5\` | \`civ-m-1.5\` | \`civ-gap-1.5\` |
| 2 | 8px | \`civ-p-2\` | \`civ-m-2\` | \`civ-gap-2\` |
| 3 | 12px | \`civ-p-3\` | \`civ-m-3\` | \`civ-gap-3\` |
| 4 | 16px | \`civ-p-4\` | \`civ-m-4\` | \`civ-gap-4\` |
| 5 | 20px | \`civ-p-5\` | \`civ-m-5\` | \`civ-gap-5\` |
| 6 | 24px | \`civ-p-6\` | \`civ-m-6\` | \`civ-gap-6\` |
| 8 | 32px | \`civ-p-8\` | \`civ-m-8\` | \`civ-gap-8\` |
| 10 | 40px | \`civ-p-10\` | \`civ-m-10\` | \`civ-gap-10\` |
| 12 | 48px | \`civ-p-12\` | \`civ-m-12\` | \`civ-gap-12\` |
| 20 | 80px | \`civ-p-20\` | \`civ-m-20\` | \`civ-gap-20\` |

Directional variants: \`civ-pt-*\`, \`civ-pb-*\`, \`civ-ps-*\`, \`civ-pe-*\`, \`civ-px-*\`, \`civ-py-*\`, \`civ-mt-*\`, \`civ-mb-*\`, \`civ-ms-*\`, \`civ-me-*\`, \`civ-mx-*\`, \`civ-my-*\`.

---

## 5. Component CSS Classes

Semantic classes from \`components.css\` — use these instead of composing raw utilities.

### Form Primitives
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-label\` | Form field label | block, mb-1, text-base-darkest, font-bold, text-base |
| \`.civ-legend\` | Group legend | block, mb-1, text-base-darkest, font-bold |
| \`.civ-required-mark\` | Asterisk on required fields | text-error, no-underline |
| \`.civ-hint\` | Hint text below label | block, mb-1, text-sm, text-base |
| \`.civ-hint--group\` | Hint text for group components | block, mb-2, text-sm, text-base |
| \`.civ-error-text\` | Error message | block, mb-1, text-sm, text-error, font-bold |
| \`.civ-error-text--group\` | Error message for groups | block, mb-2, text-sm, text-error, font-bold |
| \`.civ-input\` | Text input / textarea / select | block, w-full, border, rounded, px-2, py-1.5, text-base, font-sans, text-base-darkest, bg-white, border-base-light |
| \`.civ-fieldset\` | Fieldset reset | border-0, p-0, m-0, mb-4 |
| \`.civ-group-layout--vertical\` | Vertical option group | flex, flex-col, gap-1 |
| \`.civ-group-layout--horizontal\` | Horizontal option group | flex, flex-row, flex-wrap, gap-4 |

### Checkbox / Radio
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-check-input\` | Checkbox or radio input | w-5, h-5, me-2, align-middle, accent-primary |
| \`.civ-check-label\` | Label next to checkbox/radio | text-base, font-sans, text-base-darkest |
| \`.civ-check-description\` | Description below option | block, text-sm, text-base, mt-0.5 |
| \`.civ-check-tile\` | Tile variant wrapper | relative, border, rounded, p-4, border-base-light, cursor-pointer |

### Toggle
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-toggle-track\` | Toggle switch track | relative, inline-flex, items-center, w-10, h-6, rounded-full, border, transition-colors, bg-base-light, border-base, cursor-pointer |
| \`.civ-toggle-thumb\` | Toggle switch thumb | absolute, bg-white, rounded-full, shadow-sm, transition-transform |

### Segmented Control
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-segment-btn\` | Segment button | px-4, py-2, text-sm, font-sans, font-medium, border, bg-white, text-base-darkest, border-base-light, cursor-pointer |

### File Upload
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-dropzone\` | Drag-and-drop area | block, w-full, border-2, border-dashed, rounded, p-6, text-center, transition-colors, border-base-light, cursor-pointer |
| \`.civ-list-item\` | Shared list item row (files, repeater summary) | flex, items-center, justify-between, p-2, bg-base-lightest, rounded, text-sm |
| \`.civ-list-item__content\` | List item content area | flex-1, min-w-0 |
| \`.civ-list-item__actions\` | List item action buttons | flex, items-center, gap-1, shrink-0 |

### Combobox
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-combobox-listbox\` | Dropdown list container | absolute, z-10, w-full, mt-0.5, bg-white, border, border-base-light, rounded, shadow-md, max-h-60, overflow-y-auto, list-none, p-0, m-0 |
| \`.civ-combobox-option\` | Dropdown option | px-3, py-2, text-base, cursor-pointer |

### Date Picker
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-datepicker-dialog\` | Calendar popup | absolute, z-50, mt-1, bg-white, border, border-base-light, rounded, shadow-lg, p-4 |
| \`.civ-datepicker-day\` | Calendar day cell | w-10, h-10, text-center, text-sm, rounded, cursor-pointer |
| \`.civ-datepicker-nav-btn\` | Month navigation button | p-1, rounded |
| \`.civ-datepicker-cal-btn\` | Calendar toggle button | border, border-s-0, border-base-light, rounded-e, px-2, py-1.5, bg-base-lightest |

### Form Error Summary
| Class | Purpose | Expands to |
|-------|---------|------------|
| \`.civ-form-error-summary\` | Error summary container | border-s-4, border-error, bg-error-lightest, p-4, mb-4 |
| \`.civ-form-error-heading\` | Error summary heading | text-error, font-bold, text-lg, mt-0, mb-2 |

### Screen Reader Only
| Class | Purpose |
|-------|---------|
| \`.civ-sr-only\` | Visually hidden, accessible to screen readers |

### Layout Utilities
| Class | Purpose | Behavior |
|-------|---------|----------|
| \`.civ-button-row\` | Primary + secondary form-flow button cluster | Stacks vertically on mobile (≤480px) so each \`<civ-button>\` picks up the full-width-on-mobile rule; switches to a horizontal row with gap-3 above 480px. Primary button comes first in source order. Use for Sign in / Start guest, Save and continue / Back, Submit / Cancel pairs. |

For **toolbar clusters** with connected/flush borders (text formatting, view toggles), use \`<civ-button-group>\` instead — that's \`role="toolbar"\`, no gap, distinct semantics.

For **row-action clusters** in list items (Edit / Remove next to a summary card or list row), keep \`civ-flex civ-gap-2\` — those intentionally stay row-laid-out on mobile so destructive labels don't expand to consume the whole screen.

---

## 6. Focus Ring

The focus ring is applied **automatically** by a global rule in \`civ.css\` to every
native interactive element: \`button\`, \`[role="button"]\`, \`a[href]\`, \`input\`,
\`select\`, \`textarea\`, \`summary\`, \`[contenteditable]\`, and \`[tabindex]:not([tabindex="-1"])\`.
Render real interactive elements and the ring shows on focus — no class required.

\`\`\`html
<button class="civ-segment-btn">Option</button>
<input class="civ-input" />
\`\`\`

The ring follows the GOV.UK pattern: triggers on \`:focus\` (so it shows on click as
well as keyboard focus), with a dark band flush against the element and a yellow
halo extending past it. WCAG 2.4.7 Focus Visible compliant.

For dark/inverse backgrounds, opt-in with \`focus-visible:civ-focus-ring-inverse\` —
the global rule's specificity is low enough that this opt-in still wins.

**DEPRECATED:** Do NOT use \`focus:civ-outline-*\` classes — they predate the global
rule and only suppressed the ring without replacing it.

---

## 7. Density System

CivUI supports three density scales. Set \`data-civ-scale\` on any parent element:

| Scale | Attribute | Effect |
|-------|-----------|--------|
| Dense | \`data-civ-scale="dense"\` | Tighter spacing and smaller font sizes |
| Default | (none) | Standard spacing |
| Spacious | \`data-civ-scale="spacious"\` | Larger spacing and font sizes |

\`\`\`html
<div data-civ-scale="dense">
  <!-- All CivUI components inside use dense spacing -->
</div>
\`\`\`

Spacing and font-size CSS variables automatically adjust per scale.

---

## 8. Dark Mode

Dark mode activates automatically via the \`prefers-color-scheme\` media query (Tailwind \`darkMode: 'media'\`). No manual toggle needed.

- All semantic color tokens have dark-mode counterparts (see color tables above)
- CSS variables switch values automatically — no class changes needed
- Focus ring colors adjust to token-based values (\`primary-lighter\`/\`primary-darker\`) in dark mode
- Test with browser/OS dark mode setting

---

## 9. Logical / RTL Properties

For right-to-left language support, use logical properties instead of physical direction classes:

| Physical (avoid) | Logical (use) | Purpose |
|-------------------|---------------|---------|
| \`civ-border-l-4\` | \`civ-border-s-4\` | Inline-start border width |
| \`civ-border-l-0\` | \`civ-border-s-0\` | Inline-start border reset |
| \`civ-rounded-l\` | \`civ-rounded-s\` | Start-side border radius |
| \`civ-rounded-r\` | \`civ-rounded-e\` | End-side border radius |
| \`civ-mr-2\` | \`civ-me-2\` | Inline-end margin |
| \`civ-ml-2\` | \`civ-ms-2\` | Inline-start margin |

---

## 10. Borders & Shadows

### Border Radius
| Class | Value |
|-------|-------|
| \`civ-rounded-none\` | 0 |
| \`civ-rounded-sm\` | 0.125rem |
| \`civ-rounded\` | 0.25rem (default) |
| \`civ-rounded-md\` | 0.375rem |
| \`civ-rounded-lg\` | 0.5rem |
| \`civ-rounded-full\` | 9999px |

### Shadows
| Class | Use case |
|-------|----------|
| \`civ-shadow-sm\` | Subtle lift (toggle thumb) |
| \`civ-shadow\` | Default elevation |
| \`civ-shadow-md\` | Dropdowns (combobox listbox) |
| \`civ-shadow-lg\` | Dialogs (date picker) |
| \`civ-shadow-none\` | Remove shadow |

### Border Widths
| Class | Value |
|-------|-------|
| \`civ-border\` | 1px |
| \`civ-border-2\` | 2px |
| \`civ-border-4\` | 4px |
| \`civ-border-0\` | 0 |

---

## 11. Motion

### Transition Durations
| Class | Value |
|-------|-------|
| \`civ-duration-75\` | 75ms |
| \`civ-duration-150\` | 150ms |
| \`civ-duration-200\` | 200ms |
| \`civ-duration-300\` | 300ms |
| \`civ-duration-500\` | 500ms |

### Easing Functions
| Class | Value |
|-------|-------|
| \`civ-ease-linear\` | linear |
| \`civ-ease-in\` | cubic-bezier(0.4, 0, 1, 1) |
| \`civ-ease-out\` | cubic-bezier(0, 0, 0.2, 1) |
| \`civ-ease-in-out\` | cubic-bezier(0.4, 0, 0.2, 1) |

CivUI respects \`prefers-reduced-motion\` — animations are disabled when the user prefers reduced motion.

---

## 12. Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| \`p-4\` (missing prefix) | \`civ-p-4\` |
| \`bg-[#005ea2]\` (raw hex) | \`civ-bg-primary\` (use semantic token) |
| \`focus:civ-outline-2\` (deprecated) | _(remove the class — focus ring is applied globally)_ |
| \`civ-border-l-4\` (physical direction) | \`civ-border-s-4\` (logical property) |
| \`civ-mr-2\` (physical margin) | \`civ-me-2\` (logical margin) |
| \`civ-rounded-l\` (physical radius) | \`civ-rounded-s\` (logical radius) |
| \`dark:civ-bg-gray-800\` (manual dark) | \`civ-bg-base-lighter\` (automatic via tokens) |
`;
