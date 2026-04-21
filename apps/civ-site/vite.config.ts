import { defineConfig } from 'vite';
import { resolve } from 'path';

const packages = resolve(__dirname, '..', '..', 'packages');

export default defineConfig({
  resolve: {
    alias: {
      '@civui/core': resolve(packages, 'core/src/index.ts'),
      '@civui/forms': resolve(packages, 'forms/src/index.ts'),
      '@civui/ui': resolve(packages, 'ui/src/index.ts'),
      '@civui/navigation': resolve(packages, 'navigation/src/index.ts'),
      '@civui/feedback': resolve(packages, 'feedback/src/index.ts'),
      '@civui/tokens/css': resolve(packages, 'tokens/dist/css/tokens.css'),
      '@civui/test-utils': resolve(packages, 'test-utils/src/index.ts'),
    },
  },
});
