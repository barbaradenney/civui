import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@civds/react-native',
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
