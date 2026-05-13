# @civui/figma-plugin

CivUI Figma plugin — converts `@civui/schema` component contracts into **variant-aware** Figma component sets, with bodies rendered from the real Lit web components.

> **Status:** v0.1 pilot — covers 4 components (button, text-input, checkbox, alert) across a managed variant matrix. The architecture supports the full 53-schema catalog; the pilot scope is set in `pilot.config.ts`.

## What it produces

For each pilot component, the plugin creates a **Figma Component Set** with one variant per (schema-axis × interaction-state) combination. Designers get:

- **Schema-driven variant properties** — e.g., `civ-button` exposes `Variant=Primary|Secondary|Tertiary`, `Danger=False|True`, `State=Default|Hover|Focus|Disabled`.
- **Tokens-native container** — outer auto-layout frame uses CivUI color, spacing, and radius tokens (background, border, padding, corner radius). Token changes flow into Figma on the next sync.
- **High-fidelity body** — each variant's body is a PNG captured from the actual Lit component running in headless Chromium against the production token CSS. (SVG capture is planned for v0.2.)
- **Category pages** — sets are organized onto pages named `CivUI · Form Control`, `CivUI · Feedback`, etc., matching `schema.category`.

## Architecture

```
┌─────────────────┐      ┌──────────────────────┐     ┌────────────────┐
│ @civui/schema   │      │  Playwright capture  │     │  Figma plugin  │
│ (contracts.json)│─────▶│  + Lit components    │────▶│  (sandboxed)   │
└─────────────────┘      │  + static page       │     │                │
        │                └──────────────────────┘     │  • reads inlined│
        │                          │                  │    manifest     │
        ▼                          ▼                  │  • creates frame│
┌─────────────────┐      ┌──────────────────────┐     │    + container  │
│ pilot.config.ts │      │  manifest-data/      │     │    + body fill  │
│  (axes/states)  │─────▶│   variants.json      │────▶│  • combineAs… │
└─────────────────┘      │   tokens.json        │     │    Variants     │
                         └──────────────────────┘     └────────────────┘
```

The plugin sandbox has no network or filesystem access. Both the captured variants and the token subset are inlined into `dist/code.js` via esbuild `define`, so the plugin loads instantly with no fetches.

## Files

| Path | Purpose |
|------|---------|
| `pilot.config.ts` | Which components are in v0.1, which props become axes, which states to capture, fixed prop values |
| `src/code.ts` | Plugin sandbox entry — reads inlined manifest, orchestrates sync |
| `src/ui/ui.ts` + `ui.html` | Plugin UI (component picker, status, sync button) |
| `src/builders/` | Per-step Figma node construction: container frame, body insertion, Component Set assembly |
| `src/shared/variant-axes.ts` | Derives the variant matrix from a schema + pilot entry |
| `src/shared/types.ts` | Manifest + message types shared across capture / sandbox / UI |
| `scripts/capture-variants.ts` | Playwright + static page → `variants.json` |
| `scripts/render-page.{html,ts}` | Static capture page — imports Lit components, exposes `window.civuiRender` |
| `scripts/build-tokens-subset.ts` | Extracts the slice of `@civui/tokens` the plugin needs |
| `manifest-data/` | Generated outputs (gitignored): `variants.json`, `tokens.json`, `captured/` |
| `dist/` | Built plugin (`code.js` + `ui.html`) (gitignored) |

## Build / run

```bash
# 1. Build prerequisites
pnpm --filter @civui/tokens build    # produces dist/css/tokens.css used by capture page
pnpm --filter @civui/schema build    # produces typed schemas + contracts.json

# 2. Extract the token subset for the plugin
pnpm --filter @civui/figma-plugin build:tokens

# 3. Capture variants (Playwright launches headless Chromium)
pnpm --filter @civui/figma-plugin capture

# 4. Bundle the plugin (inlines manifest + tokens)
pnpm --filter @civui/figma-plugin build
```

Then in Figma:

1. **Plugins → Development → Import plugin from manifest…**
2. Select `packages/figma-plugin/manifest.json`.
3. Run **CivUI Sync** from the plugin menu.
4. Pick components in the UI, click **Sync**.

To iterate on the plugin without re-capturing, just edit `src/` and run `pnpm build`. Figma's "Plugins → Development → Hot reload plugin" picks up new bundles.

## Extending to more components

1. Add a `PilotComponent` entry to `pilot.config.ts`:
   ```ts
   {
     name: 'civ-toggle',
     schemaAxes: ['checked'],
     states: ['default', 'focus', 'disabled'],
     fixedProps: { label: 'Email me updates' },
   }
   ```
2. Add the matching side-effect import to `scripts/render-page.ts`:
   ```ts
   import '@civui/inputs/toggle';
   ```
3. Re-run `capture` + `build`.

`schemaAxes` must be enum or boolean props (others throw). The full cartesian product × states is captured — keep the count under ~40/component or the manifest balloons.

## Trade-offs and known limits

- **PNG bodies, not SVG.** The capture page serializes DOM via `<foreignObject>`, which Figma's SVG importer doesn't parse reliably. v0.2 will use a vectorization library (probably `dom-to-svg`) and switch `insert-body.ts` to the SVG path (already coded behind a `kind: 'svg'` branch).
- **Interaction states are simulated, not real.** `:focus` / `:hover` are hard to trigger reliably in headless Chromium; the capture page applies equivalent CSS via `[data-state="..."]` instead. The visual is faithful; the underlying DOM is not interactively focused.
- **Tokens land as raw RGB, not Figma Variables.** A future version should publish the token subset as a Figma Variable Collection so designers can rebind locally.
- **No round-trip.** Edits made to Figma components are not reflected back into schemas or the web library — syncing again overwrites them. Treat the Figma library as a generated artifact.

## CI

`pnpm build` and `pnpm typecheck` run in turbo. There is no automated capture step in CI yet — re-capture is a manual rebuild after schema changes (see "Build / run" above). A `validate:figma-manifest-stale` lint is a candidate future addition.
