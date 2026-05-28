---
title: Performance
sidebar_position: 7
sidebar_label: Performance
---

# Performance

Load time is an accessibility feature. Government audiences reach `.gov`
services on throttled mobile data, rural broadband, shared library
machines, and older agency-issued hardware. Every kilobyte of JavaScript
that has to download, parse, and execute is time a user on a slow
connection or a low-end CPU spends staring at a blank screen — and that
falls hardest on exactly the people public services exist to reach. A
fast, light page is part of "accessible to everyone," not separate from
it.

CivUI is built to be small and fast by default. This page documents what
the design system does for you, what you should do as a consumer, and how
we guard against regressions.

## What CivUI does for you

### Zero network requests for chrome

The two heaviest "hidden" costs in most component libraries are web fonts
and icon fonts. CivUI ships neither by default.

- **System-font-first.** The font stack is
  `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …`
  (`packages/tokens/src/typography.tokens.json`). No `@font-face`, no
  font download, no flash-of-invisible-text, no layout shift when a
  brand font swaps in. The user's OS already has these fonts in memory.
- **Inline SVG icons.** All ~40 built-in icons
  (`packages/core/src/icon/icon-library.ts`) are SVG path strings
  bundled into JavaScript and rendered with `fill="currentColor"`. No
  icon font, no sprite sheet, no per-icon request. Each icon is roughly
  40–200 bytes and inherits color and size from its text context.
- **Material Symbols stays opt-in.** The full Material Symbols glyph
  catalog (~3.9 MB) is only loaded if a consumer explicitly imports
  `@civui/core/styles/material-symbols` — and the stylesheet itself
  carries a comment warning about its weight. You never pay for it
  unless you ask.

### Tree-shakeable JavaScript

- **Per-component sub-path exports.** Every package declares granular
  `exports` (e.g. `@civui/core/base`, `@civui/core/icon`). Importing
  `@civui/inputs/text-input` pulls in the text input and nothing else.
  This is the reason CivUI's import convention favors sub-path
  side-effect imports over barrel imports — barrels can defeat
  tree-shaking, and bundlers reliably preserve sub-path imports.
- **Pure ESM, minified output.** All packages are `"type": "module"`.
  After the TypeScript build, `scripts/minify.js` runs esbuild
  (`minify: true`, `target: es2022`, `format: esm`) as a `postbuild`
  step, so published `dist/` files are already minified while keeping
  the module structure intact for downstream tree-shaking.

### Light DOM — less work per component

Every component renders into Light DOM (`createRenderRoot()` returns
`this`, in `packages/core/src/base/civ-base-element.ts`). There is no
per-instance shadow root to construct and no per-instance style scope to
attach. Beyond the accessibility benefits (native labels, ARIA IDREFs,
and focus order all work without workarounds), this also means less
runtime work when a page mounts many controls — which matters on
low-powered devices.

### Smaller CSS

Tailwind is configured with content-based purging
(`content: ['./packages/*/src/**/*.ts']` in `tailwind.config.ts`), so
utility classes that no source file references are dropped at build time.
CSS is delivered as a small set of compiled files (`civ.css` for tokens +
base, `components.css` for component utilities) rather than per-component
stylesheets.

### Images that don't block or shift

The `<civ-image>` component bakes in performance defaults that a raw
`<img>` doesn't give you for free:

- `loading="lazy"` by default — off-screen images don't compete for
  bandwidth on first paint.
- `decoding="async"` by default — image decode never blocks the main
  thread / paint.
- CSS `aspect-ratio` derived from `ratio` (or `width`/`height`) reserves
  layout space before the bytes arrive, preventing Cumulative Layout
  Shift (CLS).
- Optional `webp-src` / `avif-src` render a `<picture>` fallback chain
  (AVIF → WebP → original), letting modern browsers download the
  smaller format. AVIF saves ~50% over JPEG; WebP ~25–35%.

## What you should do as a consumer

A light library can still be shipped heavily. The biggest wins are on
your side:

1. **Import from sub-paths, not barrels.**

   ```ts
   // ✓ ships only what you use
   import '@civui/inputs/text-input';
   import '@civui/actions/button';

   // ✗ can pull in far more than you need
   import '@civui/inputs';
   ```

2. **Don't import Material Symbols unless you genuinely need a glyph
   outside the built-in set.** The ~40 inline icons cover most form and
   navigation needs at zero network cost. Reach for the font only when
   you need broad icon coverage, and budget for the ~3.9 MB.

3. **Tune image priority for your above-the-fold content.** Leave the
   lazy defaults in place for below-the-fold imagery, but mark your
   hero / LCP image as high-priority:

   ```html
   <civ-image
     src="/hero.jpg"
     alt="…"
     ratio="16:9"
     loading="eager"
     decoding="sync"
     fetch-priority="high"
   ></civ-image>
   ```

4. **Ship modern image formats.** Produce WebP/AVIF alternates at build
   time or via your CDN and pass `webp-src` / `avif-src` — CivUI renders
   the `<picture>` fallback chain for you.

5. **Let the system fonts be.** Don't load a web font "to match the
   mockup" without a CLS budget and metric-overridden fallback. If a
   brand font is genuinely required, treat it as its own piece of work
   (`font-display: swap`, subset to Latin, metric-override the fallback)
   — see the typography rule's "Extending for a brand font" section.

## How we guard against regressions

A bundle-size CI workflow (`.github/workflows/bundle-size.yml`) builds
every PR and reports per-package `dist/` sizes to the PR summary. This is
the right shape for catching size creep over time.

:::caution Known gaps (as of 2026-05)
The current bundle-size gate is weaker than it looks, and we're being
honest about it here:

- **It references stale package names.** The workflow loops over
  `core forms ui feedback navigation`, but `forms` and `ui` no longer
  exist — they were restructured into `inputs`, `actions`, `layout`,
  and others. The `forms`-package 300K check measures a directory that
  isn't there, so it effectively does nothing.
- **The threshold is a `::warning::`, not a hard failure**, and only one
  (now-missing) package had a threshold at all. Size creep won't block a
  PR today.
- **It measures raw `dist/` bytes (`du -sh`), not gzip/brotli transfer
  size** — which is what users actually download over the wire.
- **No package declares `"sideEffects": false`.** Sub-path exports carry
  most of the tree-shaking, but adding a `sideEffects` declaration (with
  a carve-out for CSS) would let bundlers prune more aggressively.

These are tracked as follow-ups. If you're touching the performance
tooling, fixing the package list and switching to a hard gzip-size gate
are the highest-leverage changes.
:::

## Related

- [Accessibility](./accessibility.md) — the WCAG 2.1 AA checklist this
  page complements.
- [Quality Gates](./quality-gates.md) — the full CI gate inventory,
  including the bundle-size check.
- [Icons](./icons.md) — the inline-SVG icon system and the Material
  Symbols opt-in.
- [Typography](./typography.md) — the system-font policy and the
  brand-font extension point.
</content>
</invoke>
