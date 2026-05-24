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
      // Selection controls — moved from the former @civui/controls
      // into @civui/inputs. Tests inside this package that need the
      // checkbox/radio/segmented-control sub-paths resolve to local
      // source instead of going through the built dist.
      '@civui/inputs/checkbox': resolve(__dirname, 'src/checkbox/index.ts'),
      '@civui/inputs/radio': resolve(__dirname, 'src/radio/index.ts'),
      '@civui/inputs/segmented-control': resolve(__dirname, 'src/segmented-control/index.ts'),
      '@civui/inputs': resolve(__dirname, 'src/index.ts'),
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
