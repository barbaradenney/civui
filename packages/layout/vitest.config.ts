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
      '@civui/actions/action-button': resolve(__dirname, '../actions/src/action-button/index.ts'),
      '@civui/actions/link': resolve(__dirname, '../actions/src/link/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
      '@civui/feedback/badge': resolve(__dirname, '../feedback/src/badge/index.ts'),
      '@civui/feedback': resolve(__dirname, '../feedback/src/index.ts'),
    },
  },
});
