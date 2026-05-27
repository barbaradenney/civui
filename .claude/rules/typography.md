# CivUI Typography

How text rendering decisions are made across the design system. This rule covers the rendering primitives (leading trim, tabular numerals, text wrap, underline geometry, font features) and the policy for when each applies. It does not redefine the type scale — that lives in `packages/tokens/src/typography.tokens.json` and the build script in `packages/tokens/build/build-tokens.js` (which wraps the discrete `xs / sm / base / lg / xl / 2xl / 3xl / 4xl / 5xl` ladder in `clamp()` per the `scales.tokens.json` viewport ranges, producing the fluid resize behavior on `[data-civ-scale="dense|spacious"]`).

The CivUI policy is **system-font-first**: the stack is `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No web fonts are loaded by default, so techniques that target web-font loading (`font-display`, `@font-face` metric overrides for fallback parity, font-subsetting) are not part of the baseline plan. A future federal client may need a brand font; the "Extending for a brand font" section below captures what to add then.

---

## What's already in place

Spot fixes were made during audits but never codified into rules. Inventory:

- **`text-box-trim: both; text-box-edge: cap alphabetic`** — applied to `.civ-label`, `.civ-legend`, `.civ-hint`, `.civ-data-field__value`, and the small-text variant inside `civ-data-field`. The header-row pattern of `<label>` / `<legend>` / `<hint>` over a control now reads visually flush.
- **`font-variant-numeric: tabular-nums`** — applied to `.civ-data-grid__td`, `.civ-table__num`, `.civ-count`, the itemized-total amount column (`.civ-itemized-total__amount` and `.civ-itemized-total__total-amount`).
- **`text-underline-offset`** — used twice with two different values (`2px` and `4px`). No documented policy; inconsistent.
- **`letter-spacing: 0.05em`** — applied to `.civ-eyebrow` for uppercase headings. Other uppercase tokens (badge text? button text?) need an audit.
- **Body font-size** — set on `body` in `civ.css:20` so every component inherits the design-system base size by default.
- **Discrete heading scale** — `civ-heading-{xl|lg|md|sm}` (bold) + `-secondary` (regular). Documented in `packages/core/src/typography/typography.stories.ts`.

What's NOT in place: `text-wrap: balance/pretty`, `font-optical-sizing`, `hanging-punctuation`, a consistent underline policy, a documented `font-feature-settings` baseline, a `.civ-prose` reading-width wrapper, or a lint that catches drift in any of the above.

---

## Rendering primitives — when each applies

### Leading trim (the half-leading at the top and bottom of a line box)

**Rule.** Any text element that sits at the top OR bottom of a visual container — first or last child of a card, callout, modal body, list item, table cell, button, badge — must trim its half-leading so the visible glyph aligns with the container's padding edge. The user reads `padding: 1rem` as 16px of clear space; without trim, the actual visible gap is `16px + (line-height − 1) × font-size / 2` ≈ 20–24px on body text, and the container looks loose-bottom / floaty.

**Mechanism.** `text-box-trim: both; text-box-edge: cap alphabetic;` on the text element. Trims half-leading from both top and bottom of the line box, aligning the box to cap-height on top and alphabetic baseline on bottom. Supported in Chrome 133+, Safari 16.4+, Firefox 142+ (>97% global as of 2026). Fallback for older browsers: the existing `:first-child { margin-top: 0 } :last-child { margin-bottom: 0 }` discipline on `civ-card`, `civ-callout`, `civ-modal-body`.

**Apply to:**
- All `.civ-heading-*` variants (currently NOT applied — biggest visible gap).
- All `.civ-text-body`, `.civ-text-caption`, `.civ-text-small`, `.civ-text-muted` paragraphs when used as a direct child of a container.
- Already applied to `.civ-label`, `.civ-legend`, `.civ-hint` — keep.
- Button labels, badge text, chip labels, tag labels — already approximately right via `line-height: 1` on the chrome, but switching to `text-box-trim` makes them robust against custom line-height inheritance.

**Don't apply to:**
- Multi-line body prose where the trim removes intentional descender clearance from line N to line N+1. `text-box-trim` only trims the FIRST and LAST line's half-leading — interior lines keep full leading. So this concern is theoretical; document anyway for the next reader.
- Display fonts with extreme ascenders (none used today). If a future federal brand font has unusual metrics, override `text-box-edge` per-component.

**Utility.** Add `.civ-text-trim` as a one-property utility:

```css
.civ-text-trim {
  text-box-trim: both;
  text-box-edge: cap alphabetic;
}
```

so consumers and one-off component CSS can opt in without re-typing the two declarations.

### Tabular numerals (digits align in columns)

**Rule.** Any surface where digits appear in adjacent rows or where two adjacent digit clusters are visually compared MUST render in tabular figures. The proportional default ("1" is narrower than "0") wobbles columns of dollar amounts, dates, phone numbers, IDs, percentages.

**Mechanism.** `font-variant-numeric: tabular-nums;` — standardized, no `font-feature-settings: 'tnum' 1` fallback needed (same browser support).

**Apply to:**
- `.civ-data-grid__td`, `.civ-table__num` — already applied. Audit `.civ-table` body cells generally — currently only the `--num` modifier opts in, but most table cells in gov forms are numeric.
- `.civ-count`, `.civ-badge` (when rendering a number), `.civ-pagination` page numbers.
- Itemized total amounts — applied.
- `.civ-metric-tile__value` — should be applied.
- `.civ-timeline-item__time` — relative-time renderings ("3 minutes ago") don't need it, but absolute timestamps ("2026-01-15 14:30") do. Recommend applying unconditionally.
- All preset masked inputs that render digits: `civ-text-input[type="tel"]`, currency, SSN, EIN, ZIP, routing-number, VA-file-number. These are typed inputs — the user watches digits appear as they type, and proportional rendering causes the visible character width to shift mid-keystroke. The `.civ-input` class should opt in when `inputmode="numeric|decimal|tel"` is set.

**Don't apply to:**
- Body prose where a number appears inline ("You have 3 dependents listed"). Tabular figures look mechanical in flowing prose.
- Headings ("Step 1 of 4") — proportional is fine; the digit doesn't repeat in alignment.

**Utility.** Add `.civ-num` as a one-property utility:

```css
.civ-num {
  font-variant-numeric: tabular-nums;
}
```

### Text wrap (balance for headings, pretty for body)

**Rule.** Headings should not orphan their last word onto a line of its own. Body prose should not orphan its last word onto a line of its own. Both are solved by CSS Text Module Level 4 features that are now broadly supported.

**Mechanism.**
- `text-wrap: balance;` on headings — distributes the heading evenly across its lines. Chrome 114+, Safari 17.5+, Firefox 121+. The browser limits the algorithm to short text (≤6 lines) for performance, which matches every heading placement in CivUI.
- `text-wrap: pretty;` on body prose — runs an optimized line-breaking algorithm that prevents single-word last lines and balances raggedness. Chrome 117+, Safari 17.5+, Firefox 142+ (behind a flag earlier).

Both degrade to `text-wrap: wrap` (the default) in unsupported browsers — pure progressive enhancement, never a layout regression.

**Apply to (balance):**
- All `.civ-heading-*` variants.
- `.civ-page-header__title`, `.civ-page-header__subtitle`.
- `.civ-modal__title`, `.civ-alert__heading`, `.civ-notice__heading`, `.civ-callout__heading`.
- `.civ-card__heading` (the `data-card-header` slot).
- `.civ-section-intro__heading`.
- `.civ-form-step__heading`.

**Apply to (pretty):**
- `.civ-text-body`, `.civ-text-muted`, `.civ-text-caption`, `.civ-text-small` when used as `<p>` elements.
- `.civ-hint` — hint text is short but can wrap on mobile; orphan prevention matters.
- `.civ-callout__body`, `.civ-notice__body`, `.civ-alert__body`.
- `.civ-section-intro__body`.

**Don't apply to:**
- Form labels — short, single-line in 99% of cases; `balance` on a 3-word label is wasted work.
- Data-grid cells — short content; wrapping behavior is governed by the column policy.

### Underline geometry (links)

**Rule.** Link underlines are a brand surface, not a browser default. The thickness and offset must be consistent across `civ-link`, `civ-link-card` titles, in-prose `<a>` tags, breadcrumb links, footer nav, and any other underlined text. Currently `2px` and `4px` offsets are both used; the gap reads as inconsistency to anyone seeing two link surfaces next to each other.

**Mechanism.**

```css
a, .civ-link, .civ-text-link {
  text-decoration-thickness: 0.0625em;  /* 1px at 16px body */
  text-underline-offset: 0.1875em;      /* 3px at 16px body */
}
```

`em`-based units make the geometry scale with font-size — a `civ-heading-xl` link gets a proportionally thicker underline at proportionally lower offset, which is what the eye expects. Token candidates: `--civ-typography-underline-thickness: 0.0625em` and `--civ-typography-underline-offset: 0.1875em` so consumers can rebrand both in one place.

**Hover/focus variants:** thicken the underline on hover (`text-decoration-thickness: 0.125em` = 2px at 16px). On focus, the focus ring carries the affordance — the underline can stay at its rest geometry or thicken; pick one and document.

**Apply to:**
- `.civ-link`, `.civ-link-card__title`.
- In-prose `<a>` tags (inherited via `body a` or `:where()` selectors).
- `.civ-breadcrumb-item__link`.
- `.civ-skip-link`.

**Don't apply to:**
- `civ-button[href]` — the `.civ-btn--link` modifier already adds an underline as the "this navigates" cue, and the geometry is button-context-specific (the chip background interacts with offset values differently than bare text).
- `.civ-nav-item__link` — primary nav links currently render without underline; the current-page accent is the cue.

### Font features (ligatures, kerning, contextual alternates)

**Rule.** Set a known-good baseline for all OpenType features once on `body`, so the rest of the system can rely on them being on. Different OS-default fonts ship different feature defaults — `San Francisco` on macOS enables `liga` and `calt` by default; `Segoe UI` on Windows 10 does not enable `calt`; `Roboto` on Android varies by version. Without an explicit baseline, the same text renders subtly different on each OS.

**Mechanism.**

```css
body {
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  font-kerning: normal;
}
```

`kern` (kerning), `liga` (standard ligatures: fi, fl), `calt` (contextual alternates) are universally supported and never produce undesirable output in plain prose. Other features (`dlig` discretionary ligatures, `salt` stylistic alternates) require font knowledge and stay off.

`font-kerning: normal` is the higher-level standardized property and matches `font-feature-settings: 'kern' 1` — declaring both is redundant but explicit.

**Tabular numerals exception.** Use `font-variant-numeric: tabular-nums` for the digit-alignment surfaces above. Do NOT add `'tnum' 1` to `font-feature-settings` site-wide — tabular figures make body prose look mechanical. Keep the on/off decision at the surface level via the higher-level property.

### Optical sizing (variable-font weight optimization)

**Rule.** When the rendered font is variable, the browser can pick an optical-size variant tuned for the rendered point size (small text gets a sturdier optical variant; large text gets a refined one). Setting `font-optical-sizing: auto` opts in. Non-variable fonts ignore the property — it's free quality bump with no downside.

**Mechanism.**

```css
body {
  font-optical-sizing: auto;
}
```

System-font reality:
- macOS / iOS: San Francisco is a variable font with multiple optical-size axes. Will benefit.
- Windows 11: Segoe UI Variable is variable. Will benefit.
- Android: Roboto Flex is variable when shipped (Android 12+). Will benefit.
- Windows 10 / older Android / Linux fallbacks: not variable, no-op.

### Hanging punctuation (quiet polish)

**Rule.** When a paragraph begins with a quote mark or ends with a period/comma/quote, hanging the punctuation outside the type column improves the optical edge of the prose. Safari supports this today; other browsers no-op without breaking layout.

**Mechanism.**

```css
.civ-prose, p.civ-text-body {
  hanging-punctuation: first allow-end last;
}
```

Safari-only as of 2026. Worth applying anyway — degrades gracefully and looks better on every iOS / macOS-using state employee, which is many of them in federal contexts.

### Reading width

**Rule.** Long-form prose (instructions, policy text, eligibility prose, error pages) should not span the full container width on a 1920px monitor. Eye-tracking research and WCAG SC 1.4.8 both recommend roughly 45–75 characters per line for readability; CivUI's body font-size at desktop puts that at ~65ch.

**Mechanism.** Add a `.civ-prose` utility:

```css
.civ-prose {
  max-width: 65ch;
}
```

Apply at the section/article wrapper, not on individual paragraphs. Consumers wrap their long-form content in `<div class="civ-prose">`.

`.civ-prose` is also the natural place to apply `hanging-punctuation` and `text-wrap: pretty` so consumers get them automatically.

---

## What NOT to do

Document these so future authors don't reflexively paste them in:

- **`-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale`** — overrides the OS-default subpixel rendering with grayscale antialiasing. Makes text visually thinner. Looks fine in design tools (which run macOS); looks anemic to Windows and Android users. CivUI keeps the OS defaults.
- **`text-rendering: optimizeLegibility`** — forces additional kerning and ligature passes on every text element. Browsers used to make this default-off because of perf cost on long pages; modern browsers handle it but `font-kerning: normal` + `font-feature-settings: 'liga' 1` express the intent more cleanly.
- **`font-weight: 300` (Light) for body text** — looks elegant in mockups, illegible on older monitors and at 14px. Body weight stays at 400 (regular).
- **`letter-spacing` on body text** — designed for display sizes (uppercase eyebrows, large headings). Spacing body text makes it harder to read, not easier. The only exception is `.civ-eyebrow` (already applied at 0.05em).
- **Hardcoded `font-size` / `line-height` in px or rem inside `components.css`** — bypasses the token system and the `[data-civ-scale]` resize behavior. Use `var(--civ-typography-fontSize-*)` and `var(--civ-typography-lineHeight-*)`. Caught by `pnpm lint:hardcoded-spacing`.
- **Composing typography by combining utility classes** when a semantic class exists. `<p class="civ-text-base civ-font-bold civ-mb-4">` reinvents `<h3 class="civ-heading-md">` — the semantic class carries the consistent margin-bottom and font-weight relationships.
- **Setting `line-height` on individual elements when the parent has it** — `line-height` inherits as a number, which re-multiplies against each element's own `font-size`. Adding `line-height: 1.5` inside a heading container that already has `line-height: 1.5` is a no-op; adding `line-height: 24px` is a bug (the heading at 28px will have `24px` lines).

---

## WCAG 1.4.12 — text spacing

WCAG 2.1 SC 1.4.12 requires that users can override the following without content loss:
- `line-height` to at least 1.5× the font-size
- Paragraph spacing to at least 2× the font-size
- Letter-spacing to at least 0.12× the font-size
- Word-spacing to at least 0.16× the font-size

CivUI must not block these overrides. Two patterns to watch:
- Fixed-height chrome (buttons, chips, badges, list rows) with text inside. When the user forces line-height to 1.5×, the text grows; the chrome must accommodate via `min-height` (not `height`). The hardcoded-spacing lint already gates every fixed `height: <px|rem>` in `components.css` (allowlist of decorative classes + `/* not density: <reason> */` annotation), so any non-allowlisted fixed height shows up in code review.
- `text-overflow: ellipsis` (or `clip`) explicitly truncates content past a width constraint — the user can't see the full label / value / heading. Prefer wrapping. When wrapping isn't acceptable (the truncation is decorative, or the host component renders the full content elsewhere), allowlist the class with a one-line rationale.

The `pnpm lint:wcag-text-spacing` lint enforces the second rule. It scans `components.css` for every `text-overflow` declaration and fails unless the selector targets an entry in `ALLOWLIST_CLASSES` (in `tools/lint-wcag-text-spacing.ts`) or the lines immediately above carry a `/* clip ok: <reason> */` annotation. The allowlist exists for the genuinely-decorative cases (signature preview, where the actual data is held in the form value, not the visual preview). Wired into `pnpm validate:lints` and the drift-lints CI gate.

A full Vitest-level sweep that fixtures each component with the four overrides applied and measures rendered clipping is not feasible in jsdom (no layout engine). The static lint is a strict over-approximation: it catches every CSS pattern that COULD clip text, regardless of whether a specific viewport actually triggers the clip.

---

## Print

`civ.css` already overrides `civ-label` to 10pt and `civ-hint` to 9pt for print. Audit the remaining typography classes for print sizing:
- Body text → 11pt
- Captions → 9pt
- Headings → 14pt / 13pt / 12pt / 11pt for xl/lg/md/sm
- Eyebrows → 8pt with `letter-spacing: 0.05em` preserved

`text-box-trim` is paint-time, not layout-time, so it doesn't affect print pagination. Tabular numerals MUST be preserved in print — financial / eligibility documents are routinely printed.

---

## Extending for a brand font

When a federal client requires a specific brand font (Public Sans for USWDS-aligned projects is the most likely candidate; SF Pro displayed-as-web-font is another):

1. **Load via `@font-face`** with `font-display: swap` (renders fallback immediately, swaps to brand font when loaded — eliminates FOIT). `font-display: optional` is more aggressive (only swaps if loaded within ~100ms) and is appropriate for connection-constrained gov contexts.
2. **Add metric overrides on the fallback** to eliminate CLS when the brand font loads. Tools like `fontpie` generate the `ascent-override`, `descent-override`, `line-gap-override`, and `size-adjust` values from the brand-font file:
   ```css
   @font-face {
     font-family: 'system-ui-fallback';
     src: local('Arial');
     ascent-override: 90%;
     descent-override: 22%;
     line-gap-override: 0%;
     size-adjust: 107%;  /* matches brand-font x-height */
   }
   body {
     font-family: 'Public Sans', 'system-ui-fallback', system-ui, ...;
   }
   ```
   With the override, the fallback renders at brand-font metrics, so the swap is visually invisible — same line breaks, same heading sizes, same paragraph heights.
3. **Subset the brand font** to Latin (or Latin + extended-Latin for Spanish content). A 500KB unhinted variable font subsets to ~80KB for Latin coverage.
4. **Add the brand font to the dark-mode and density variant CSS** if the brand has weight-specific variants (e.g., "Bold for headings, Display for hero").
5. **Re-audit** every spot in this document — brand fonts often need different `text-underline-offset` (different x-height shifts the optical optimum) and different optical-size enablement (only enable `font-optical-sizing` if the brand font is variable; bare `font-optical-sizing: auto` is harmless on non-variable but explicitly documenting it avoids confusion).

This work is real engineering — a brand font rollout is its own branch, not a single CSS file edit.

---

## Modular scale — retuned 2026-05-26

**Important distinction**: there are two `fontSize` ladders in this codebase, and the one that actually renders is NOT the one quoted in `typography.tokens.json`.

1. **Static ladder** (in `typography.tokens.json`): `12 / 14 / 16 / 18 / 20 / 22 / 26 / 30 / 48`. This populates a `:root` block in the generated CSS but is **immediately overridden** by the fluid default scale (see #2). It serves as a fallback when the fluid CSS hasn't loaded; for all practical purposes the static values never render. They're useful as a designer-facing "reference ladder" so the conceptual steps have integer names.
2. **Fluid ladder** (generated from `scales.tokens.json` → `scales.default`): each step `n` renders as `clamp(basePx.min × ratio.min^n, …, basePx.max × ratio.max^n)`. With `basePx { min: 17, max: 19 }` and `ratio { min: 1.125, max: 1.2 }`, the rendered sizes are:

   | Step | Token | Mobile (320 px) | Desktop (1200 px+) |
   |---|---|---|---|
   | −2 | xs | 13.4 px (static — negative steps don't scale) | 13.4 px |
   | −1 | sm | 15.1 px | 15.8 px |
   | 0 | base | 17 px | 19 px |
   | 1 | lg | 19.1 px | 22.8 px |
   | 2 | xl | 21.5 px | 27.4 px |
   | 3 | 2xl | 24.2 px | 32.8 px |
   | 4 | 3xl | 27.2 px | 39.4 px |
   | 5 | 4xl | 30.6 px | 47.3 px |
   | 6 | 5xl | 34.5 px | 56.7 px |

**Why this shape**: 1.125 (major-second) on mobile gives the dense, tight body-text rhythm USWDS uses for forms. Blending up to 1.2 (minor-third) on desktop opens the headings without going hyperbolic — the previous configuration (`{ min: 1.2, max: 1.333 }`) produced a 107 px desktop `5xl`, which is fine for an editorial hero but read as "shouting" inside a federal-form context. The retuned `5xl` at ~57 px desktop functions as the new display/hero step; no separate hero token is needed.

**Why the static ladder shape differs from the fluid rendering**: the static values are chosen for designer-readability ("the scale is 12/14/16/18/20/22/26/30, with 48 reserved as a hero") rather than as a literal description of what renders at any one viewport. The fluid scale interpolates *between* basePx min/max so a single step renders different sizes across screen widths.

**If you want to retune again**: change `scales.tokens.json` → `scales.default.ratio` and/or `basePx`. Keep the static ladder in `typography.tokens.json` aligned with the conceptual ladder for documentation purposes. Run `pnpm --filter @civui/tokens build` and inspect `packages/tokens/dist/css/tokens.css` to verify the generated clamps.

---

## Recommendations to ship — prioritized

These are the proposed work items, ordered by visible-quality leverage per line of code. None are committed yet; each is a follow-on branch.

1. **Leading trim on headings + body** — extend `text-box-trim: both; text-box-edge: cap alphabetic` to all `.civ-heading-*` and `.civ-text-body|caption|small|muted` paragraphs. Add the `.civ-text-trim` utility. The biggest visible win for ~30 lines of CSS — every card, callout, modal, alert, notice, and section reads visually tighter and more intentional.
2. **Tabular numerals on data surfaces and numeric inputs** — extend `font-variant-numeric: tabular-nums` to `.civ-metric-tile__value`, `.civ-timeline-item__time`, `.civ-pagination`, masked numeric inputs (SSN, EIN, ZIP, phone, currency, routing). Add the `.civ-num` utility. Government forms render a lot of numbers; this is high-leverage.
3. **Text wrap balance/pretty** — apply `balance` to all heading classes + page-header + modal-header + alert/notice/callout headers; apply `pretty` to body-text classes + hint + callout/notice/alert bodies. ~25 lines of CSS, prevents the "single orphan word on a line" issue everywhere.
4. ~~**Underline geometry tokens**~~ — shipped 2026-05-27. Three new tokens in `typography.tokens.json` → `typography.underline`: `thickness` (0.0625em / 1px at body size), `thicknessHover` (0.125em / 2px), `offset` (0.1875em / 3px). Applied uniformly across `.civ-link--*` + `.civ-breadcrumb__link` (thickness + offset) and `.civ-data-grid__sort-btn:hover` (thicknessHover + offset). The only remaining hardcoded value is `.civ-nav__link--current { text-underline-offset: 4px }` — a persistent state-indicator surface where the larger clearance reads as "accent line under the label" rather than "this is hyperlinked." Annotated in `components.css` as a deliberate one-off; promote to a token if a second state-indicator surface appears. Em-based geometry means a heading-sized link now gets a proportionally thicker underline at proportionally larger offset, which is what the eye expects.
5. **Font-feature baseline on body** — add `font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1; font-kerning: normal; font-optical-sizing: auto;` on `body`. ~5 lines. Quality bump on every text element, no API surface change.
6. **`.civ-prose` wrapper utility** — `max-width: 65ch; text-wrap: pretty; hanging-punctuation: first allow-end last;` for long-form content blocks. ~5 lines. Mostly relevant on docs pages and any future content-heavy gov pages.
7. **Print typography audit** — add print-mode font sizes for `.civ-text-body`, `.civ-text-caption`, `.civ-text-small`, all `.civ-heading-*`, `.civ-eyebrow`. ~25 lines in the `@media print` block. Government forms get printed routinely.
8. ~~**WCAG 1.4.12 test sweep** — fixture each component with the four user overrides applied, assert no clipping. Test, not CSS.~~ Shipped 2026-05-26 as `pnpm lint:wcag-text-spacing` — static CSS check (jsdom has no layout engine so a runtime fixture sweep can't measure actual clipping). The lint gates every `text-overflow: ellipsis|clip` in `components.css` against `ALLOWLIST_CLASSES` + `/* clip ok: <reason> */` annotations. Fixed `civ-data-field__label` (was `overflow: hidden + text-overflow: ellipsis + max-width: 50%` → now wraps within the 50% cap). Allowlist seeded with `civ-signature-preview__cursive` (decorative preview; signature value lives in the form control).
9. **Modular scale audit** — design-team decision, no code.
10. **Brand-font extension point** — captured in this document for when a client requires it. Not a current ship item.

---

## Cross-references

- `packages/tokens/src/typography.tokens.json` — font-family, font-size, font-weight, line-height tokens.
- `packages/tokens/build/build-tokens.js` — the build script that wraps font-sizes in `clamp()` per the active scale.
- `packages/core/src/styles/civ.css:20` — body font-size inheritance rule.
- `packages/core/src/styles/components.css:570–626` — heading classes (`civ-heading-{xl|lg|md|sm}` + secondary variants + eyebrow).
- `packages/core/src/styles/components.css:192–208` — body / muted / caption / small classes.
- `packages/core/src/typography/typography.stories.ts` — Storybook reference for the current scale.
- `.claude/rules/government-patterns.md` "Text color rules" — the gray-text rule.
- `.claude/rules/common-traps.md` "Muted/gray text classes on `<p>` body text" — the corresponding lint.
- `.claude/rules/density-convention.md` — how `[data-civ-scale]` retunes font-sizes alongside spacing.

---

## Process

After shipping any of the recommendations above, run `pnpm validate:lints` to confirm no `lint:hardcoded-spacing` regressions (the new utilities and overrides must use tokens, not literals). Run `pnpm storybook` and inspect the Foundations/Typography stories to confirm the visual effect. Cross-browser check Safari (Webkit), Firefox (Gecko), Chrome (Blink) — `text-box-trim` and `text-wrap` have the latest browser support but the renderings are not pixel-identical.

When adding a new typography token or class, document the placement decision here in the same change. The audit findings from 2026 are captured above so the next reader doesn't re-derive them.
