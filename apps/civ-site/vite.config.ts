import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync } from 'fs';

const packages = resolve(__dirname, '..', '..', 'packages');

// Auto-discover all form HTML files for multi-page build
const formsDir = resolve(__dirname, 'forms');
const formInputs = Object.fromEntries(
  readdirSync(formsDir)
    .filter(f => f.endsWith('.html'))
    .map(f => [`forms/${f.replace('.html', '')}`, join(formsDir, f)])
);

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...formInputs,
      },
      // Disable tree-shaking — all CivUI components register custom elements
      // via @customElement decorators which are side effects
      treeshake: false,
    },
  },
  resolve: {
    // Array form so we can mix explicit-file aliases with regex-based
    // sub-path resolution. Vite walks entries in order, first match wins.
    alias: [
      // ── Explicit non-pattern targets ──
      // These don't follow the `packages/PKG/src/SUBPATH/index.ts` shape, so
      // they need a specific entry before the regex catch-all.
      { find: '@civui/tokens/css', replacement: resolve(packages, 'tokens/dist/css/tokens.css') },
      // memorable-date is publicly exposed as `@civui/inputs/memorable-date`
      // but its source lives at `inputs/src/date-input/` (one-off remap
      // documented in inputs/package.json exports field).
      { find: '@civui/inputs/memorable-date', replacement: resolve(packages, 'inputs/src/date-input/index.ts') },

      // ── Regex catch-all for component sub-paths ──
      // Matches `@civui/PKG/SUBPATH` → `packages/PKG/src/SUBPATH/index.ts`.
      // Sub-paths are the canonical CivUI import style per CLAUDE.md and
      // are enforced by an ESLint rule in component source. Listing each
      // one explicitly drifts every time a new component is added; the
      // regex keeps the config small and self-maintaining.
      {
        find: /^@civui\/([\w-]+)\/([\w-]+)$/,
        replacement: resolve(packages, '$1/src/$2/index.ts'),
      },

      // ── Regex catch-all for bare packages ──
      // Matches `@civui/PKG` → `packages/PKG/src/index.ts`. Used by tests
      // / stories that pull the whole barrel.
      {
        find: /^@civui\/([\w-]+)$/,
        replacement: resolve(packages, '$1/src/index.ts'),
      },
    ],
  },
});
