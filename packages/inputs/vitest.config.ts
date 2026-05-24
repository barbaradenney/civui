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
      '@civui/controls/checkbox': resolve(__dirname, '../controls/src/checkbox/index.ts'),
      '@civui/controls/segmented-control': resolve(__dirname, '../controls/src/segmented-control/index.ts'),
      '@civui/controls': resolve(__dirname, '../controls/src/index.ts'),
      '@civui/actions/toggle-button': resolve(__dirname, '../actions/src/toggle-button/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
      // Defensive — the `@civui/actions` barrel transitively imports
      // `@civui/feedback/spinner` via civ-button. No inputs test pulls
      // civ-button today, but if one ever does we want it to resolve
      // to source instead of failing at module load.
      '@civui/feedback/spinner': resolve(__dirname, '../feedback/src/spinner/index.ts'),
      '@civui/feedback': resolve(__dirname, '../feedback/src/index.ts'),
      '@civui/layout/image': resolve(__dirname, '../layout/src/image/index.ts'),
      '@civui/layout': resolve(__dirname, '../layout/src/index.ts'),
    },
  },
});
