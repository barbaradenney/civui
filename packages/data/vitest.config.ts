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
      '@civui/actions/action-button': resolve(__dirname, '../actions/src/action-button/index.ts'),
      '@civui/actions/button': resolve(__dirname, '../actions/src/button/index.ts'),
      '@civui/actions/filter-chip': resolve(__dirname, '../actions/src/filter-chip/index.ts'),
      '@civui/actions/filter-chip-group': resolve(__dirname, '../actions/src/filter-chip-group/index.ts'),
      '@civui/actions': resolve(__dirname, '../actions/src/index.ts'),
      '@civui/overlays/menu': resolve(__dirname, '../overlays/src/menu/index.ts'),
      '@civui/overlays': resolve(__dirname, '../overlays/src/index.ts'),
      '@civui/layout/list': resolve(__dirname, '../layout/src/list/index.ts'),
      '@civui/layout': resolve(__dirname, '../layout/src/index.ts'),
      '@civui/inputs/text-input': resolve(__dirname, '../inputs/src/text-input/index.ts'),
      '@civui/inputs/number': resolve(__dirname, '../inputs/src/number/index.ts'),
      '@civui/inputs/select': resolve(__dirname, '../inputs/src/select/index.ts'),
      '@civui/inputs': resolve(__dirname, '../inputs/src/index.ts'),
      '@civui/controls/checkbox': resolve(__dirname, '../controls/src/checkbox/index.ts'),
      '@civui/controls': resolve(__dirname, '../controls/src/index.ts'),
    },
  },
});
