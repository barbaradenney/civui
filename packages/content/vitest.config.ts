import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@civds/content',
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: true,
  },
});
