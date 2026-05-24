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
      '@civui/inputs': resolve(__dirname, '../inputs/src/index.ts'),
      '@civui/core': resolve(__dirname, '../core/src/index.ts'),
      '@civui/layout/callout': resolve(__dirname, '../layout/src/callout/index.ts'),
      '@civui/layout/list': resolve(__dirname, '../layout/src/list/index.ts'),
      '@civui/layout/divider': resolve(__dirname, '../layout/src/divider/index.ts'),
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
      '@civui/feedback/spinner': resolve(__dirname, '../feedback/src/spinner/index.ts'),
    },
  },
});
