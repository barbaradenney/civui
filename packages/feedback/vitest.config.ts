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
      // Resolve to source so tests pick up locale-string additions
      // (and any other core changes) without a separate build step.
      '@civui/core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
});
