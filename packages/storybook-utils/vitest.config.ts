import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.ts'],
    // Suppress the jsdom "Not implemented: navigation" noise emitted by
    // the modifier-key and external-link tests — those intentionally let
    // the click pass through to the browser, which jsdom can't simulate.
    // The behavior is correct; the warnings are pure stderr noise.
    onConsoleLog(log) {
      if (log.includes('Not implemented: navigation')) return false;
      return undefined;
    },
  },
});
