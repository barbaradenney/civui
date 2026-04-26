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
      '@civui/controls': resolve(__dirname, '../controls/src/index.ts'),
      '@civui/core': resolve(__dirname, '../core/src/index.ts'),
      '@civui/overlays/modal': resolve(__dirname, '../overlays/src/modal/index.ts'),
      '@civui/overlays': resolve(__dirname, '../overlays/src/index.ts'),
    },
  },
});
