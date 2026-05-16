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
      '@civui/controls/checkbox': resolve(__dirname, '../controls/src/checkbox/index.ts'),
      '@civui/controls/segmented-control': resolve(__dirname, '../controls/src/segmented-control/index.ts'),
      '@civui/controls': resolve(__dirname, '../controls/src/index.ts'),
    },
  },
});
