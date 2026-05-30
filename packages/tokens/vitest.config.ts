import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The token builder is pure Node JS (fs + string transforms, no DOM),
    // so it runs in the default node environment. Tests live next to the
    // build script as build/*.test.js.
    environment: 'node',
    include: ['build/**/*.test.js'],
    globals: true,
  },
});
