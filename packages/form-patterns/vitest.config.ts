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
      '@civui/navigation/link': resolve(__dirname, '../navigation/src/link/index.ts'),
      '@civui/navigation': resolve(__dirname, '../navigation/src/index.ts'),
      '@civui/layout/list': resolve(__dirname, '../layout/src/list/index.ts'),
      '@civui/layout/divider': resolve(__dirname, '../layout/src/divider/index.ts'),
      '@civui/layout': resolve(__dirname, '../layout/src/index.ts'),
      '@civui/actions/button': resolve(__dirname, '../actions/src/button/index.ts'),
      '@civui/actions/action-button': resolve(__dirname, '../actions/src/action-button/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
    },
  },
});
