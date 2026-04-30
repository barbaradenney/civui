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
      '@civui/core': resolve(__dirname, '../core/src/index.ts'),
      '@civui/navigation/link': resolve(__dirname, '../navigation/src/link/index.ts'),
      '@civui/navigation': resolve(__dirname, '../navigation/src/index.ts'),
    },
  },
});
