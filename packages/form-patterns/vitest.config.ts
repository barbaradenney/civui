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
      // Sub-path aliases declared before bare-package aliases so
      // longest-prefix match wins. (Selection controls moved from
      // the former @civui/controls into @civui/inputs.)
      '@civui/inputs/checkbox': resolve(__dirname, '../inputs/src/checkbox/index.ts'),
      '@civui/inputs/radio': resolve(__dirname, '../inputs/src/radio/index.ts'),
      '@civui/inputs/segmented-control': resolve(__dirname, '../inputs/src/segmented-control/index.ts'),
      '@civui/inputs': resolve(__dirname, '../inputs/src/index.ts'),
      '@civui/core': resolve(__dirname, '../core/src/index.ts'),
      '@civui/feedback/callout': resolve(__dirname, '../feedback/src/callout/index.ts'),
      '@civui/feedback/spinner': resolve(__dirname, '../feedback/src/spinner/index.ts'),
      '@civui/layout/list': resolve(__dirname, '../layout/src/list/index.ts'),
      '@civui/layout/divider': resolve(__dirname, '../layout/src/divider/index.ts'),
      '@civui/layout/accordion': resolve(__dirname, '../layout/src/accordion/index.ts'),
      // Needed for civ-file-upload's transitive import of <civ-image>.
      '@civui/layout/image': resolve(__dirname, '../layout/src/image/index.ts'),
      '@civui/layout': resolve(__dirname, '../layout/src/index.ts'),
      '@civui/actions/button': resolve(__dirname, '../actions/src/button/index.ts'),
      '@civui/actions/action-button': resolve(__dirname, '../actions/src/action-button/index.ts'),
      '@civui/actions/link': resolve(__dirname, '../actions/src/link/index.ts'),
      '@civui/actions/link-card': resolve(__dirname, '../actions/src/link-card/index.ts'),
      '@civui/actions/skip-link': resolve(__dirname, '../actions/src/skip-link/index.ts'),
      '@civui/actions/toggle-button': resolve(__dirname, '../actions/src/toggle-button/index.ts'),
      '@civui/actions/confirm-button': resolve(__dirname, '../actions/src/confirm-button/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
      // Resolve test-utils to source so tests run without a prebuilt
      // @civui/test-utils dist (fresh CI checkouts).
      '@civui/test-utils': resolve(__dirname, '../test-utils/src/index.ts'),
    },
  },
});
