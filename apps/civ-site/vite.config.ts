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
      // Disable tree-shaking — all CivUI components register custom elements
      // via @customElement decorators which are side effects
      treeshake: false,
    },
  },
  resolve: {
    alias: {
      '@civui/core': resolve(packages, 'core/src/index.ts'),
      '@civui/forms': resolve(packages, 'forms/src/index.ts'),
      '@civui/ui/tag': resolve(packages, 'ui/src/tag/index.ts'),
      '@civui/ui/link': resolve(packages, 'ui/src/link/index.ts'),
      '@civui/ui/button': resolve(packages, 'ui/src/button/index.ts'),
      '@civui/ui/card': resolve(packages, 'ui/src/card/index.ts'),
      '@civui/ui/divider': resolve(packages, 'ui/src/divider/index.ts'),
      '@civui/ui/page-header': resolve(packages, 'ui/src/page-header/index.ts'),
      '@civui/ui/link-card': resolve(packages, 'ui/src/link-card/index.ts'),
      '@civui/ui/action-button': resolve(packages, 'ui/src/action-button/index.ts'),
      '@civui/ui/button-group': resolve(packages, 'ui/src/button-group/index.ts'),
      '@civui/ui': resolve(packages, 'ui/src/index.ts'),
      '@civui/navigation': resolve(packages, 'navigation/src/index.ts'),
      '@civui/feedback': resolve(packages, 'feedback/src/index.ts'),
      '@civui/tokens/css': resolve(packages, 'tokens/dist/css/tokens.css'),
      '@civui/test-utils': resolve(packages, 'test-utils/src/index.ts'),
    },
  },
});
