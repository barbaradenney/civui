# CivUI Colors

How color is structured across the design system, where the WCAG contrast floors live, and what the rules are for picking a token in any surface. This rule covers the palette shape (semantic intent families, categorical color families, neutral ladder, accent families), the rendering conventions (dark mode, forced-colors, print), and the policy for when each applies. It does not redefine the palette itself — that lives in `packages/tokens/src/color.tokens.json` (light) and `packages/tokens/src/color-dark.tokens.json` (dark), with the build script in `packages/tokens/build/build-tokens.js` flattening both into `:root` and `@media (prefers-color-scheme: dark)` blocks.

CivUI's palette is **USWDS-derived**: the primary blues, error reds, warning ambers, success greens, and the neutral ladder closely match U.S. Web Design System values. The choice is deliberate — government-form audiences expect that visual vocabulary, and USWDS has done the WCAG legwork on most light-mode combinations. The dark-mode palette is hand-authored to preserve AA contrast on inverse backgrounds (USWDS doesn't ship a canonical dark mode); pairings were measured at the time of authoring.

No brand or custom-palette tokens are loaded by default. A future federal client may require a custom brand — the "Extending for a brand palette" section below captures what to add then.

---

## What's already in place

Spot fixes were made during audits and the system has accumulated a fair amount of color infrastructure. Inventory:

- **Light palette** (`color.tokens.json`) — 6 semantic-intent families (primary, error, warning, success, info, plus the optional accent cool/warm), 8 categorical tag color pairs (blue, teal, red, green, yellow, orange, purple, gray), and a 7-step neutral ladder (`base-lightest` → `base-darkest`).
- **Dark palette** (`color-dark.tokens.json`) — 1:1 family parity with the light palette. Build script wraps overrides in `@media (prefers-color-scheme: dark)`. iOS / Android tokens generate `Color` + dark variants per platform.
- **Manual override** — `civ.css` lines 141–155 honor a consumer-set `[data-color-mode="light|dark"]` attribute so a user can flip the rendered mode independent of the OS preference (e.g., a "Dark mode" toggle in the gov-app UI).
- **Semantic recipe lint** (`pnpm lint:semantic-color-recipe`) — gates the `civ-badge` and `civ-count` bg/text pairs for every emphasis × intent combination. Recipe lives in `tools/lint-semantic-color-recipe.ts` → `RECIPE`. Drift fails CI.
- **Color-class lint** (`pnpm lint:color-classes`) — every `civ-{text|bg|border|ring|fill|stroke|divide|outline}-{family}-{shade}` class used anywhere in the repo must resolve to a real `--civ-color-{family}-{shade}` token. Catches typos like `civ-text-success-darker` (success has no `-darker` shade).
- **Muted-body-text lint** (`pnpm lint:muted-body-text`) — forbids gray-text classes on `<p>` body text. The visual-hierarchy rule "size + weight, not color muting" is enforced.
- **Forced-colors mode** — `@media (forced-colors: active)` rules exist in `civ.css` (focus ring), `components.css:2970` (data-grid sort badge), `components.css:3366` (data-grid keyboard focus). Coverage is partial.
- **Print** — `@media print` rules in `civ.css:215–233` force black input borders and set hint text to `base-darker` so it prints legibly.
- **Reduced-motion** — `@media (prefers-reduced-motion: reduce)` is honored globally (every transition uses motion tokens). Not strictly a color concern but listed here because it intersects with state-change visibility.

What's NOT in place: a measured contrast matrix exported to a static doc, a `lint:contrast` that gates new bg/text pairs against AA, broader forced-colors coverage (most non-data-grid components have no high-contrast fallback), a print rule for preserving semantic intent colors, a `colors.stories.ts` "Failing combinations to avoid" pane.

---

## Palette structure

### Semantic intent families

Five intents represent **status**: the color carries meaning (this is an error / this is success / this is a warning / this is informational / this is neutral). Use these via the `intent` prop on `civ-badge`, `civ-count`, `civ-alert`, `civ-notice`, and through the `civ-text-{intent}` / `civ-bg-{intent}-{shade}` / `civ-border-{intent}` Tailwind utilities.

| Family | Light DEFAULT | Dark DEFAULT | Shades available |
|---|---|---|---|
| `primary` | `#005ea2` | `#73b3e7` | lightest, lighter, light, DEFAULT, vivid, dark, darker |
| `error` | `#b50909` | `#f28b82` | lightest, lighter, light, DEFAULT, dark |
| `warning` | `#e5a000` | `#f5c542` | lighter, light, DEFAULT, dark, darkest |
| `success` | `#00a91c` | `#5cb85c` | lighter, light, DEFAULT, dark, darkest |
| `info` | `#00bde3` | `#4dd0e1` | lighter, light, DEFAULT, dark |
| `accent.cool` | `#00bde3` | `#4dd0e1` | lightest, light, DEFAULT, dark |
| `accent.warm` | `#fa9441` | `#f5a654` | lightest, light, DEFAULT, dark, darkest |

**Shade-ladder irregularities to know about:**
- `primary` has an extra `vivid` step between `DEFAULT` and `dark` — it's the USWDS "vivid" hue used sparingly for hero accents. Not consumed by any component today.
- `warning` and `success` have a `darkest` shade NOT for surfaces but for **AA-compliant text on the lighter background** — `warning-darkest` (#6b4c11) hits 7.05:1 on `warning-lighter`; `warning-dark` (#936f38) hits 3.14:1, AA-large only.
- `error` has no `darker`/`darkest`. `error-dark` is the bottom of the ladder; the recipe uses it for AA text on `error-lighter`.
- `info` has no `lightest` or `darker`/`darkest`. `info-dark` carries the AA text role.
- `accent.cool` lacks `lighter` and `darkest` — it's a sparingly-used family.

These irregularities are captured by the `lint:color-classes` lint: a typo like `civ-text-info-darkest` fails because no token resolves.

### Categorical color families (`tag-*`)

Eight categorical pairs represent **visual grouping** — the color groups items aesthetically but carries no status meaning. Use these only for `civ-tag.color` and `civ-card.color`:

| Token | Light bg / text | Dark bg / text |
|---|---|---|
| `tag.blue`   | `#1a4480` / white | `#73b3e7` / `#162e51` |
| `tag.teal`   | `#2e6276` / white | `#7dd3e0` / `#1a3a40` |
| `tag.red`    | `#8b0a03` / white | `#f28b82` / `#3b0b0b` |
| `tag.green`  | `#2e7d32` / white | `#81d88a` / `#1e3a20` |
| `tag.yellow` | `#936f38` / white | `#f5d576` / `#3d2d0a` |
| `tag.orange` | `#c05600` / white | `#f5a654` / `#3d2200` |
| `tag.purple` | `#54278f` / white | `#b39ddb` / `#311b60` |
| `tag.gray`   | `#565c65` / white | `#a0a0a0` / `#1b1b1b` |

The `tag-{color}-bg` / `tag-{color}-text` tokens are **pre-composed pairs** that encode both light- and dark-mode rendering as one colour-keyed unit. The light tag uses a dark bg + white text; the dark tag inverts to a light bg + dark text. Both directions are measured to clear AA — see "Contrast measurements" below.

**Do NOT substitute** `{family}-dark + white` for the tag-primary pair. The categorical components rely on the paired tokens to swap correctly between modes; a manual bg/text combination won't flip on the mode change. The `design-rules.md` "Semantic-intent vs categorical-color components" rule has the full breakdown.

### Neutral / base ladder

The neutral ladder is the most-used family in the system. Seven steps, used for body text, container borders, surface backgrounds, disabled chrome, and dividers.

| Token | Light | Dark | Typical use |
|---|---|---|---|
| `base-lightest` | `#f0f0f0` | `#2d2d2d` | Subtle row stripe, secondary-emphasis recipe bg |
| `base-lighter` | `#dfe1e2` | `#3d3d3d` | Disabled chrome bg, divider bg, neutral pill bg |
| `base-light` | `#a9aeb1` | `#8a8a8a` | Container borders (`--civ-color-border` defaults here), disabled state |
| `base` (DEFAULT) | `#71767a` | `#a0a0a0` | Muted text, placeholder text (where allowed) |
| `base-dark` | `#565c65` | `#c4c4c4` | Hint text, secondary captions |
| `base-darker` | `#3d4551` | `#e0e0e0` | Print hint color, neutral primary bg |
| `base-darkest` | `#1b1b1b` | `#f0f0f0` | **Default body text** (inherited from `<body>`) |

**The `civ-text-base-light` / `civ-text-base` / `civ-text-base-dark` classes are forbidden on body text.** That rule lives in `government-patterns.md` "Text color rules" and is enforced by `pnpm lint:muted-body-text`. Visual hierarchy comes from font size and weight, not color muting.

### Surface / white / black

`white-DEFAULT` and `black-DEFAULT` are mode-aware aliases — they swap when dark mode is active:

| Token | Light | Dark |
|---|---|---|
| `white` | `#ffffff` (paper) | `#1b1b1b` (dark surface) |
| `black` | `#000000` (ink) | `#ffffff` (light text) |

The aliases mean `civ-bg-white` and `civ-text-black` keep their semantic meaning ("surface" / "ink") across modes — a card with `civ-bg-white` is a card on the default surface, regardless of light/dark.

---

## Contrast & WCAG

WCAG 2.1 success criteria that apply to color in CivUI:

- **SC 1.4.3 Contrast (Minimum) — AA**: 4.5:1 for body text, 3:1 for large text (≥18pt regular or ≥14pt bold).
- **SC 1.4.6 Contrast (Enhanced) — AAA**: 7:1 for body text, 4.5:1 for large text. Federal forms aren't required to hit AAA but the design system targets it where reasonable.
- **SC 1.4.11 Non-text Contrast — AA**: 3:1 for UI component boundaries (input borders, focus indicators, button outlines, divider lines that convey grouping).
- **SC 1.4.1 Use of Color — A**: information conveyed by color must also be conveyed by another visual means (icon, text label, position, shape).

### Measured contrast matrix

Computed for every blessed combination in the lint recipe + every common text-on-surface pairing. **Light mode:**

| Combination | Ratio | Tier |
|---|---:|---|
| body `base-darkest` on white | 17.22 | AAA |
| hint `base-dark` on white | 6.74 | AA |
| hint `base` on white | 4.59 | AA (just over) |
| **hint `base-light` on white** | **2.24** | **FAIL** |
| link `text-primary` on white | 6.72 | AA |
| link `text-primary-dark` on white | 9.62 | AAA |
| `text-error` on white | 6.98 | AA |
| **`text-success` (DEFAULT) on white** | **3.14** | **AA-large/non-text only** |
| `text-success-dark` on white | 4.63 | AA |
| badge/count secondary info | 6.06 | AA |
| badge/count secondary success | 8.77 | AAA |
| badge/count secondary warning | 7.05 | AAA |
| badge/count secondary error | 7.87 | AAA |
| badge/count secondary neutral | 8.50 | AAA |
| badge/count primary info | 6.72 | AA |
| badge/count primary success | 4.63 | AA (just over) |
| badge/count primary warning | 4.59 | AA (just over) |
| badge/count primary error | 6.98 | AA |
| badge/count primary neutral | 9.68 | AAA |
| tag.blue / tag.teal / tag.red / tag.green / tag.yellow / tag.orange / tag.purple / tag.gray | 4.59–10.18 | AA / AAA |

**Dark mode** — every combination measured passes AA, most hit AAA. No failures.

### Two findings worth shipping

1. **`base-light` (#a9aeb1) on a white surface is 2.24 — fails even SC 1.4.11 non-text contrast.** This affects:
   - `.civ-dropzone__icon` (file-upload SVG icon — UI-component contrast applies → FAIL).
   - `--civ-color-border` default — the input border, divider rule, and any consumer using `civ-border` without specifying a shade. **Inputs render with a 2.24:1 border, failing SC 1.4.11.** USWDS has the same compromise so this is a known industry pattern, but the design system should at minimum document the failure and consider darkening the default to `base` (4.59) or `base-dark` (6.74).
   - **Exempt**: disabled chrome (SC 1.4.3 explicitly exempts inactive UI components). `.civ-datepicker-today-btn:disabled` and out-of-month day cells using `civ-text-base-light` for the de-emphasis treatment are WCAG-compliant despite the 2.24 ratio.

2. **`success-DEFAULT` (#00a91c) hits only 3.14:1 on white** — usable for large text / icons / non-text UI, NOT for body-sized text. The recipe correctly uses `success-dark` (4.63:1 AA) for the badge/count tertiary text, but a consumer reaching for `civ-text-success` on a 16px paragraph gets a WCAG-failing render. The lint should flag this pattern.

These two findings are the punch list. Everything else passes AA.

### Why two intent primaries are "just over" AA

`success` primary (`success-dark` #4d8055 + white = 4.63) and `warning` primary (`warning-dark` #936f38 + white = 4.59) sit ~3% above the 4.5:1 floor. Any saturation drift in a future palette tune would push them under. Tokenized contrast targets (a static lint that computes ratios from the token JSON and fails on regression) would catch this; recommended in the punch list.

---

## Semantic intent vs categorical color

This rule is canonical in `design-rules.md` → "Semantic-intent vs categorical-color components." Summary:

- **Semantic-intent components** (`civ-badge`, `civ-count`, `civ-alert`, `civ-notice`) use a `intent="info|success|warning|error|neutral"` prop. The colour communicates status. Shared CSS recipe enforced by `lint:semantic-color-recipe`.
- **Categorical-color components** (`civ-tag`, `civ-card`) use a `color="blue|teal|red|green|yellow|orange|purple|gray"` prop. The colour groups but carries no status meaning. Uses pre-composed `tag-{color}-bg/text` tokens that flip correctly on dark mode.

Don't conflate the two — a new component that carries status should reuse the semantic recipe (extend badge/count); a new component that groups visually should reuse the categorical tokens (extend tag/card).

---

## Dark mode

### Mechanism

Dark mode is opt-out by default — `darkMode: 'media'` in the Tailwind config means `@media (prefers-color-scheme: dark)` controls the rendered palette. A consumer can also force the mode via `[data-color-mode="light|dark"]` on the document root (`civ.css:141–155`), which lets a gov-app UI ship a "Dark mode" toggle independent of OS preference.

The build script (`build-tokens.js`) generates two `:root` blocks:
1. The light palette in the bare `:root` (always loaded).
2. The dark palette wrapped in `@media (prefers-color-scheme: dark)` AND `[data-color-mode="dark"]`, so OS preference and manual override both work.

### Parity discipline

`color-dark.tokens.json` must have a corresponding entry for every leaf in `color.tokens.json`. The build script doesn't enforce this — a missing dark token silently inherits the light value, producing a one-shade-off render in dark mode (often invisible to light-mode-default authors). **Tokenized parity check** (recommended): a build-time assertion that the dark JSON has the same leaf paths as the light JSON.

### Recipe consistency across modes

The semantic-color-recipe lint validates the **light** palette pairs but not the **dark** palette pairs. The dark palette has its own implicit recipe (light bg + dark text vs. light's dark bg + white text), but it's not gated by CI. A drift in `color-dark.tokens.json` that breaks contrast would ship silently.

---

## Forced-colors mode (Windows High Contrast)

When a user enables Windows High Contrast Mode, `@media (forced-colors: active)` becomes true and the browser **strips** most CSS color properties, substituting OS-defined system colors (`Canvas`, `CanvasText`, `Highlight`, `HighlightText`, `LinkText`, `ButtonText`, `ButtonFace`, etc.). Backgrounds set via `background-color` are forced to `Canvas`; text becomes `CanvasText`; box-shadows drop entirely.

This produces three failure modes in CivUI today:

1. **Background-tinted surfaces lose their identity.** A `civ-bg-warning-lighter` callout becomes a plain `Canvas` rectangle — indistinguishable from a default container. The only way to preserve it is to switch from `background-color` to `background` (which forced-colors leaves alone) OR use a system-color fallback inside the `@media (forced-colors: active)` block.

2. **Focus indicators built on box-shadow disappear.** CivUI's focus ring uses `box-shadow` for the yellow halo + dark band. Forced-colors strips both. The current rule on `.civ-focus-ring` (civ.css:321) drops the transparent outline so the system Highlight color fills the focus shape — that's the GOV.UK pattern and it works.

3. **State indicators built on tinted backgrounds invert poorly.** `[data-civ-day][aria-selected="true"]`, `[role="option"][data-active]`, `[data-civ-tile]:has(:checked)` all use `background-color` to convey selection. Each has a `forced-colors: active` patch that adds a transparent outline so the system Highlight shows through.

**Coverage today** — the forced-colors patches exist for: focus ring, date-picker selected day, combobox active option, checked tile, data-grid sort badge, data-grid keyboard focus. That's six places. **Coverage gap** — every other tinted surface (alerts, callouts, notices, chips, tags, filter-chip selected state, segmented control selected, accordion expanded, modal scrim, drawer scrim, list-item selected, link-card colored variant, badge intent backgrounds) is unpatched. Real-world Windows High Contrast users see flat monochrome chrome with no semantic differentiation.

A systematic pass would: (a) for every component that uses `background-color: var(--civ-color-{intent})`, add a `forced-colors: active` rule with `forced-color-adjust: none; background-color: Highlight; color: HighlightText; border: 1px solid CanvasText;` (or similar system-color triplet). (b) document the recipe in this file. (c) test with Windows High Contrast turned on in a real Edge browser (no automated fixture can verify this — the OS does the substitution).

---

## Color blindness

Approximately 8% of male users and 0.5% of female users have some form of color vision deficiency. The three common types:

- **Protanopia** (no red cones, ~1%): red appears very dark or olive; red/green confusion.
- **Deuteranopia** (no green cones, ~1%): green appears beige; red/green confusion.
- **Tritanopia** (no blue cones, <0.5%): blue/yellow confusion.

CivUI's protections:

- **All semantic intents pair an icon with the color.** `civ-alert`, `civ-notice`, `civ-badge` (when `with-icon`), `civ-count` all have an icon-prefix that distinguishes info/success/warning/error visually beyond the color. The icon family (info "i", warning "!", error "×", success "✓") is universally recognizable.
- **All status text states the status.** "Error: …", "Warning: …", "Success" prefixes mean a screen-reader user OR a deuteranope still gets the meaning.
- **Focus rings use a yellow halo regardless of brand color.** The yellow + dark-band pattern (GOV.UK) is recognizable even when the underlying brand-color combo isn't.

The one **SC 1.4.1 risk** in the current API:

- **`civ-badge--dot` mode is color-alone.** A dot badge has no icon, no text — just a colored circle. A deuteranope can't distinguish a `success` dot (#4d8055) from a `warning` dot (#936f38) — both render as similar olive-beige. The component does support `aria-label` so screen readers get the intent, but a sighted CVD user sees the same shape regardless of intent.

**Mitigation paths** for the dot mode:
1. Document that dot-mode is non-status by default — it's a presence indicator only (e.g., "new notifications"). When intent matters, use `with-icon` instead.
2. Use shape + color (a triangle for warning, an X for error, a check for success) — but the dot shape is part of the badge's identity.
3. Require an `aria-label` whenever `intent` is set on a dot badge, AND surface that requirement via a dev-mode warning if missing.

Documented as a recommendation in the punch list.

---

## Print

Government forms get printed. `civ.css:202–233` defines the current print rules:

- Hide interactive UI (`.civ-btn`, `.civ-skip-link`, `.civ-progress-track`).
- Force input borders to **black** so they survive grayscale photocopying.
- Drop input shadows + backgrounds (no toner waste).
- Keep label/legend at 10pt, hint at 9pt + `base-darker` (#3d4551 — prints as dark gray, legible).
- Type sizes set elsewhere in `civ.css` for headings + body in points.

**What's NOT covered in print today:**

- **Status colors don't translate.** `civ-alert--error` renders with `error-lighter` bg + `error-dark` text on screen. In print, the bg disappears (background-printing is off by default in most browsers) and the text prints in red — which is **invisible on a B&W printer** (red ink renders as light gray, below readability). The status meaning is lost on the printed page unless the alert also has the icon + "Error:" prefix (which it does — but the user pays for the icon being a colored SVG that loses its color).
- **Semantic intent backgrounds don't print.** Same issue — `civ-bg-warning-lighter` callouts vanish in print.
- **Links lose their underline distinction from body text.** Underline is preserved automatically by browsers, so this is fine.

**Recommended fixes:**
1. In `@media print`, force semantic-intent text to `black` AND keep the leading icon at black (`filter: grayscale(1)` on the icon). The visible "Error:" / "Warning:" prefix still conveys intent.
2. Add a thin black border to semantic-intent containers (`civ-alert`, `civ-notice`, `civ-callout`) so the surface is visually delimited even without the bg color.
3. Add `print-color-adjust: exact` (modern, replaces `-webkit-print-color-adjust`) on critical intent surfaces if the design wants color backgrounds to print — opt-in per component since paper consumption matters.

Documented as a recommendation in the punch list.

---

## Token hygiene — no hardcoded hex

Every color usage in `components.css` and `civ.css` should reference a `var(--civ-color-…)` token. Hardcoded hex literals are:

1. **In `components.css`** — 6 instances, all `var(…, #fallback)` defensive fallbacks where the token resolves first and the hex is a safety net (line 1308 white, 7277/7280–7282 skeleton-shimmer grays). The skeleton fallback chain is `var(--civ-color-base-lighter, #e5e7eb) → … → var(--civ-color-base-lightest, #f3f4f6)` — token-driven with hex fallback for when the tokens CSS hasn't loaded. Acceptable pattern.
2. **In `civ.css`** — 2 instances at line 219 (`var(--civ-color-black-DEFAULT, #000)` print-mode input border) and line 232 (`var(--civ-color-base-darker, #333)` print hint color). Same defensive pattern.

There are no bare hex literals in the rendered CSS — every color flows through a token. **Could ship a `lint:hardcoded-hex` that gates this**: any hex literal NOT inside a `var(…, #fallback)` form is rejected. Low priority since the discipline is already followed.

---

## What NOT to do

Document these so future authors don't reflexively paste them in:

- **Gray text on body content.** `civ-text-base`, `civ-text-base-dark`, `civ-text-base-light`, `civ-text-muted` on `<p>` paragraphs violates the visual-hierarchy rule. Use font size + weight instead. Caught by `lint:muted-body-text`.
- **Color as the sole indicator of status.** Every status surface must also carry an icon, a text label, or a position cue. Caught by code review (no lint covers this; the design discipline is enforced by component API — `civ-alert`, `civ-notice`, `civ-badge`, `civ-count` all force a label or icon when `intent` is set).
- **`civ-text-success` on body text.** `success-DEFAULT` is 3.14:1 on white — fails AA for body sizes. Use `civ-text-success-dark` (4.63:1) when status text needs to be readable at body sizes. The lint should warn on this — recommended.
- **`civ-text-warning` on body text.** `warning-DEFAULT` (#e5a000) is 1.84:1 on white — fails everything including non-text contrast. Only ever use `warning-darkest` (`warning-darkest` on `warning-lighter` background per recipe) for status text.
- **`{family}-dark + white` substituted for the tag-color pair.** Breaks the dark-mode flip. Use `var(--civ-color-tag-{color}-bg)` + `var(--civ-color-tag-{color}-text)`.
- **`background-color: <hardcoded-hex>` anywhere in component CSS.** Use a token. Defensive `var(…, #fallback)` is acceptable only where the token may not be loaded yet (skeleton-shimmer animations, print mode).
- **`color: red` / `color: green` / `color: orange`** in inline styles or stories. Use semantic intent tokens. (Light-mode `red` reads as `#ff0000` which is 4.0:1 on white — passes large-text only.)
- **`opacity: 0.6` as a "muted" treatment.** Use `civ-opacity-disabled` (`var(--civ-opacity-disabled)`) for disabled state; for muted text, use `base-dark` (hint pattern) instead of overlaying with reduced opacity. Opacity compounds against the rendered background, so two stacked opacity-reduced surfaces produce unpredictable contrast.
- **Setting `color: var(--civ-color-base)` on a placeholder.** The default `::placeholder` color is already AA-compliant; overriding with a lighter token risks falling below 4.5:1.

---

## Extending for a brand palette

When a federal client requires a specific brand color (the most likely candidates are agency-specific blues — VA's `#003e73`, USCIS's `#005ea2`, HHS's `#1d4380`):

1. **Don't override `--civ-color-primary-*` directly.** That breaks downstream components that use primary for non-brand semantic meaning (focus rings, link color, button bg). Instead, introduce a `--civ-color-brand-*` family in `color.tokens.json` and reroute the consuming components via a brand-aware variant (`civ-button--brand`, `civ-link--brand`).
2. **Run the contrast matrix.** Use the inline `lum`/`ratio` math from `/tmp/contrast.mjs` (the audit's measurement script) against every brand bg/text combination. AA minimum. Document failures and either tune the brand or pick a different shade.
3. **Generate dark-mode counterparts.** A brand color typically needs to lighten ~30–40% to render correctly on a dark surface. Use HSL adjustment (increase L by 25–35) and verify contrast.
4. **Hand off pre-composed pairs.** If the brand needs a tag-style usage (a `civ-tag` brand color for "we belong to this agency" surfaces), generate `--civ-color-brand-bg` and `--civ-color-brand-text` pairs for both modes.
5. **Re-audit components.** Brand color applied to filter chips, link-card colored variants, alert intent backgrounds, anything else that takes a `color` prop. The cascade is wide.

A brand-color rollout is a real engineering branch, not a single file edit — same caveat as a brand-font rollout (typography rule).

---

## Recommendations to ship — prioritized

These are proposed work items, ordered by leverage. None are committed yet; each is a follow-on branch.

1. ~~**Fix `civ-dropzone__icon` low contrast**~~ — shipped 2026-05-26. Changed `color: var(--civ-color-base-light)` (2.24:1) to `color: var(--civ-color-base-dark)` (6.74:1) on `.civ-dropzone__icon`. The file-upload SVG icon now meets WCAG SC 1.4.11 (3:1 non-text contrast).
2. ~~**Tokenized contrast lint**~~ — shipped 2026-05-26 as `pnpm lint:contrast`. Reads `color.tokens.json` + `color-dark.tokens.json`, resolves dotted-path token references to hex values, and computes WCAG 2.1 luminance contrast for 31 blessed pairs (recipe combinations, body/hint/link text on surface, status text colors, all 8 tag categorical pairs) in both light and dark mode — 62 contrast checks per run. Fails on regressions below `minRatio` (4.5 AA body / 3.0 AA-large or non-text). Wired into `pnpm validate:lints` and the drift-lints CI gate. 19 helper tests in `tools/__tests__/lint-contrast.test.ts`. The lint catches the canonical drift mode: a designer brightens `success-dark` by 5% to look more lively and silently drops below the 4.5:1 AA floor.
3. **Light-mode `--civ-color-border` darkening** — `base-light` at 2.24:1 fails SC 1.4.11 as an input border. Darken to `base` (4.59:1) or `base-dark` (6.74:1). Will affect every input, divider, callout border in light mode — visible change but WCAG-correct. Requires design-team sign-off because the visual identity shifts.
4. **Forced-colors mode pass** — extend `@media (forced-colors: active)` patches to all tinted-bg surfaces (alerts, callouts, notices, chips, tags, filter-chip selected, segmented selected, accordion expanded, list-item selected, link-card colored, badge intent bgs). ~80 LOC across components.css. Test in real Edge browser with Windows High Contrast turned on; no automated test covers it.
5. **Dark-mode token parity check** — build-script assertion that `color-dark.tokens.json` has 1:1 leaf paths with `color.tokens.json`. ~30 LOC in `build-tokens.js`. Catches silent dark-mode drift.
6. **Dark-mode recipe lint** — extend `lint:semantic-color-recipe` to validate the dark palette pairs too. Today only the light palette is gated. ~40 LOC.
7. **Print intent preservation** — add `@media print` rules that force semantic-intent text to black + add a thin black border to intent containers (`civ-alert`, `civ-notice`, `civ-callout`). Intent stays conveyed via icon + text + container outline. ~25 LOC.
8. **`civ-text-success` / `civ-text-warning` on body — lint warning** — extend `lint:muted-body-text` (or a sibling lint `lint:status-text-contrast`) to flag bare `civ-text-success` and `civ-text-warning` on `<p>` body text and prompt the author to use `-dark` / `-darkest` shades instead. ~30 LOC.
9. **Color-blindness CVD pass on `civ-badge--dot`** — require `aria-label` when `intent` is set on dot mode, AND surface a dev-mode warning if missing. Also document in the badge docs page that dot-mode is presence-only, not status-by-color. ~10 LOC.
10. **Categorical color-blindness simulation in Storybook** — add a Foundations/Colors story that renders each intent + tag color through a CSS filter approximating protanopia / deuteranopia (`filter: url(#protanopia)` with an inline SVG filter definition). Designers see at a glance which colors collapse together. Visual-only, no test enforcement.
11. **Hardcoded-hex lint** — `pnpm lint:hardcoded-hex` that fails on any bare hex literal in `components.css` / `civ.css` NOT inside a `var(…, #fallback)` form. Low priority (discipline already followed) but useful as a forward-looking gate.
12. **Document a contrast playbook** — short doc on how to MEASURE contrast when picking new colors (the inline math the audit used). Lives at `apps/docs/docs/foundations/contrast.md`.
13. **Brand-palette extension point** — captured in this document for when a client requires it. Not a current ship item.

---

## Cross-references

- `packages/tokens/src/color.tokens.json` — light palette source of truth.
- `packages/tokens/src/color-dark.tokens.json` — dark palette source of truth.
- `packages/tokens/build/build-tokens.js` — token-flattening build script (sections `Dark mode color overrides`, `buildSwiftColorGroup`, `buildKotlinColorGroup`).
- `packages/core/src/styles/civ.css:73` — `--civ-color-border` default mapping.
- `packages/core/src/styles/civ.css:141–155` — manual color-mode override mechanism.
- `packages/core/src/styles/civ.css:215–233` — print-mode color rules.
- `packages/core/src/styles/civ.css:321` — forced-colors focus ring patch.
- `packages/core/src/colors/colors.stories.ts` — Storybook palette reference.
- `tools/lint-color-classes.ts` — color-class typo gate.
- `tools/lint-muted-body-text.ts` — gray-text-on-body gate.
- `tools/lint-semantic-color-recipe.ts` — `RECIPE` for badge/count intent pairs.
- `tools/lint-contrast.ts` — WCAG ratio gate for blessed token pairs in light + dark mode.
- `.claude/rules/design-rules.md` "Semantic-intent vs categorical-color components" — the canonical rule for the two color-family kinds.
- `.claude/rules/government-patterns.md` "Text color rules" — the gray-text policy.
- `.claude/rules/common-traps.md` "Color-utility class typos silently render unstyled text" — the canonical trap for token-name typos.

---

## Process

When proposing a new color token: measure contrast against every surface it'll be paired with (the inline math from this audit is the reference). Document AA/AAA tier for each pair in the same PR.

When tuning an existing palette value: re-run the contrast matrix. Any combination that drops below 4.5:1 body / 3:1 non-text must be either rejected or paired with an explicit `-darker` shade that holds AA.

When the user asks for a "more vibrant" hue or saturation change: contrast is the constraint. Vibrancy that breaks AA is not negotiable in federal forms. Push back with the measured ratio.

When adding a new component that takes an `intent` prop: the prop maps to the semantic-color recipe (`lint:semantic-color-recipe` will fail if the bg/text combination drifts from `RECIPE`). When adding a `color` prop instead: use the categorical `tag-*` pairs.

After shipping any item from "Recommendations to ship," update the relevant section here in the same change.
