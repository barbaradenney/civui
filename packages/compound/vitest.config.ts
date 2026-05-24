import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@civui/inputs/text-input': resolve(__dirname, '../inputs/src/text-input/index.ts'),
      '@civui/inputs/textarea': resolve(__dirname, '../inputs/src/textarea/index.ts'),
      '@civui/inputs/select': resolve(__dirname, '../inputs/src/select/index.ts'),
      '@civui/inputs/country': resolve(__dirname, '../inputs/src/country/index.ts'),
      '@civui/inputs/memorable-date': resolve(__dirname, '../inputs/src/date-input/index.ts'),
      '@civui/inputs/yes-no': resolve(__dirname, '../inputs/src/yes-no/index.ts'),
      '@civui/inputs/routing-number': resolve(__dirname, '../inputs/src/routing-number/index.ts'),
      '@civui/inputs/currency': resolve(__dirname, '../inputs/src/currency/index.ts'),
      // Selection controls — moved from the former @civui/controls.
      // Sub-path aliases declared above the bare `@civui/inputs` entry
      // so longest-prefix match wins.
      '@civui/inputs/checkbox': resolve(__dirname, '../inputs/src/checkbox/index.ts'),
      '@civui/inputs/radio': resolve(__dirname, '../inputs/src/radio/index.ts'),
      '@civui/inputs/segmented-control': resolve(__dirname, '../inputs/src/segmented-control/index.ts'),
      '@civui/inputs': resolve(__dirname, '../inputs/src/index.ts'),
      '@civui/core': resolve(__dirname, '../core/src/index.ts'),
      '@civui/overlays/modal': resolve(__dirname, '../overlays/src/modal/index.ts'),
      '@civui/overlays': resolve(__dirname, '../overlays/src/index.ts'),
      '@civui/actions/button': resolve(__dirname, '../actions/src/button/index.ts'),
      '@civui/actions/toggle-button': resolve(__dirname, '../actions/src/toggle-button/index.ts'),
      '@civui/actions/confirm-button': resolve(__dirname, '../actions/src/confirm-button/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
      '@civui/feedback/spinner': resolve(__dirname, '../feedback/src/spinner/index.ts'),
      // Layout sub-paths used by transitively-imported components (e.g.
      // civ-file-upload composes <civ-image>).
      '@civui/layout/image': resolve(__dirname, '../layout/src/image/index.ts'),
      '@civui/layout': resolve(__dirname, '../layout/src/index.ts'),
      // Resolve test-utils to source so the lint:double-labels test
      // works in CI without a prebuilt @civui/test-utils dist (the
      // package's package.json points at dist/index.js, which fresh
      // CI checkouts don't have until something runs `pnpm build`).
      '@civui/test-utils': resolve(__dirname, '../test-utils/src/index.ts'),
    },
  },
});
