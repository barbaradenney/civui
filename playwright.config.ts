import { defineConfig } from '@playwright/test';

/**
 * Real-browser test runner — currently used only for the axe-core a11y
 * audit (`tests/a11y.spec.ts`), which catches contrast / focus-order
 * issues that jsdom can't see.
 *
 * Boots the pre-built Storybook static export from `storybook-static/`
 * via `npx http-server` so tests don't depend on a long-running dev
 * server. Run: `pnpm storybook:build && pnpm test:a11y`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:6007',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx http-server storybook-static -p 6007 -s',
    url: 'http://localhost:6007',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
