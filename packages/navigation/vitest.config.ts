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
      // Defensive — match the alias pattern other packages use so a
      // future nav test that imports a sibling barrel resolves to
      // source instead of a (potentially stale) dist build.
      '@civui/feedback/badge': resolve(__dirname, '../feedback/src/badge/index.ts'),
      '@civui/feedback/count': resolve(__dirname, '../feedback/src/count/index.ts'),
      '@civui/feedback': resolve(__dirname, '../feedback/src/index.ts'),
      '@civui/actions/button': resolve(__dirname, '../actions/src/button/index.ts'),
      '@civui/actions/link': resolve(__dirname, '../actions/src/link/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
    },
  },
});
