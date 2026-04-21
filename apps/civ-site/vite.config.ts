import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync } from 'fs';

const packages = resolve(__dirname, '..', '..', 'packages');

// Auto-discover all form HTML files for multi-page build
const formsDir = resolve(__dirname, 'forms');
const formInputs = Object.fromEntries(
  readdirSync(formsDir)
    .filter(f => f.endsWith('.html'))
    .map(f => [`forms/${f.replace('.html', '')}`, join(formsDir, f)])
);

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...formInputs,
      },
    },
  },
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
