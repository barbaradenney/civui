import { defineWorkspace } from 'vitest/config';

// Auto-discover every package that ships its own vitest config. This is a
// glob rather than a hand-maintained list on purpose: the previous explicit
// list referenced the long-deleted `packages/forms` (breaking the run on
// startup) and omitted ~18 other test-bearing packages. A glob keeps new
// packages picked up automatically.
//
// Note: `pnpm test` runs per-package through turbo (see turbo.json). This
// workspace only backs the single-process `pnpm test:unit` / `pnpm test:watch`
// scripts.
export default defineWorkspace(['packages/*/vitest.config.ts']);
