import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@civui/codegen',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
