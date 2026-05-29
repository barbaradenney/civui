---
title: Performance
sidebar_position: 18
sidebar_label: Performance
---

# Performance

Minimal footprint, maximum capability. CivUI ships native web components with no framework runtime, no icon fonts, and no runtime CSS-in-JS — so you pay only for the components you import.

## Bundle sizes

Packages are compiled with TypeScript (`tsc -b`) and minified with esbuild. The figures below are the **minified JavaScript** output per package, measured from a clean build, with an estimated gzipped size (what a browser actually downloads).

| Package | Minified JS | Gzipped (est.) |
|---------|------------:|---------------:|
| `@civui/core` | 92 K | ~28 K |
| `@civui/inputs` | 177 K | ~39 K |
| `@civui/compound` | 76 K | ~13 K |
| `@civui/form-patterns` | 74 K | ~18 K |
| `@civui/data` | 66 K | ~16 K |
| `@civui/layout` | 38 K | ~9 K |
| `@civui/actions` | 37 K | ~7 K |
| `@civui/feedback` | 26 K | ~6 K |
| `@civui/navigation` | 26 K | ~5 K |
| `@civui/overlays` | 24 K | ~5 K |

:::note
These are point-in-time measurements of the **whole package**. You never download a whole package — tree-shaking (below) drops every component you don't import. Per-package size **budgets are enforced in CI** (see [Bundle size monitoring](#bundle-size-monitoring)), so these numbers can't silently regress.
:::

## Build pipeline

CivUI uses a build pipeline that balances developer experience with production performance:

1. **`tsc -b`** — TypeScript compilation with project references (per-package incremental builds).
2. **`postbuild`** — esbuild minification across **every** published package (~45% reduction). Minification runs per file and **preserves the file structure**, so bundlers in consuming apps can still tree-shake effectively.
3. **`build:cdn`** *(optional)* — produces bundled ESM for CDN delivery without a build step.

## Tree-shaking

CivUI is designed for effective tree-shaking. Each component has its own entry point, so importing one component never pulls in the others.

### Import only what you use

Use **sub-path side-effect imports** — they register exactly the custom element you need:

```ts
// Pulls in only text-input and select — not the rest of @civui/inputs
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/actions/button';
```

:::warning Avoid named barrel imports
`import { CivTextInput } from '@civui/inputs'` looks convenient, but the `@customElement` decorator that registers the tag is a side effect a bundler will tree-shake away — the element silently never registers. Always import the component's sub-path for its side effect. This is enforced by an ESLint `no-restricted-imports` rule in component source.
:::

## CSS optimization

CivUI uses Tailwind CSS with aggressive optimization to keep the stylesheet small:

- **Content purging** — only the classes actually used in components are generated.
- **`@layer`** keeps CivUI styles in their own cascade layer, preventing specificity conflicts with consumer styles.
- **`@apply`** bundles several utilities into semantic classes, reducing repeated class lists in markup.
- **Design tokens as CSS custom properties** — one source of truth, no duplicated color/spacing values.

## Runtime performance

Beyond bundle size, components are optimized at runtime to minimize allocations, reflows, and unnecessary work:

- **`Intl.DateTimeFormat` caching** — formatters are cached per locale, not recreated per render (eliminates dozens of allocations per calendar view).
- **`isRtl()` `WeakMap` cache** — `getComputedStyle()` is called once per element lifetime, not on every keystroke.
- **Batched `querySelectorAll`** — group components query their children once per update cycle, not per sync.
- **Debounced announcements** — screen-reader character counts are announced on a ~1-second debounce, not per keystroke (see the live-region utility in `@civui/core`).
- **Conditional document listeners** — click-outside handlers are attached only while a dropdown is open, then removed.
- **Listener & RAF cleanup** — event listeners and `requestAnimationFrame` callbacks are torn down in `disconnectedCallback` to prevent leaks and orphaned work.

## Bundle size monitoring

CivUI tracks bundle sizes in CI to prevent regressions. The `Bundle Size` workflow (`.github/workflows/bundle-size.yml`) runs on every pull request:

- Builds the publishable packages and minifies them.
- Enforces a **per-package KB budget** — the job **hard-fails** if any package exceeds its budget, or if a built publishable package has no budget entry (so a new package can't slip the gate).
- Writes a size / budget / status table to the GitHub step summary.

`pnpm build:cdn` additionally emits a `metafile.json` you can drop into [esbuild's bundle analyzer](https://esbuild.github.io/analyze/) for a visual breakdown.

## What CivUI doesn't ship

CivUI follows a near-zero-dependency philosophy:

- **No icon fonts or SVG sprites.** Icons are ~40 inline SVG paths (Material Icons Outlined) — `0 KB` extra payload and zero network requests. Icons inherit `currentColor` and scale with font size.
- **No runtime CSS-in-JS.** Tailwind generates static CSS at build time; no JavaScript runs to compute styles.
- **No framework wrappers.** Native web components work everywhere — React, Vue, Angular, or plain HTML.
- **No polyfills.** CivUI targets ES2022 browsers and ships no compatibility shims.

**Lit** (~16 KB gzipped) is the only external runtime dependency. Everything else is built in-house or resolved at build time.

## See the components in action

Explore the full library with live examples and accessibility notes in [Storybook](https://barbaradenney.github.io/civui/storybook/), or browse the [component docs](/civui/components/inputs/overview).
