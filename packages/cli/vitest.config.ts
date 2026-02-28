import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@civui/cli',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
