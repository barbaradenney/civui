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
      '@civui/inputs/ssn': resolve(packages, 'inputs/src/ssn/index.ts'),
      '@civui/inputs/phone': resolve(packages, 'inputs/src/phone/index.ts'),
      '@civui/inputs/email': resolve(packages, 'inputs/src/email/index.ts'),
      '@civui/inputs/zip': resolve(packages, 'inputs/src/zip/index.ts'),
      '@civui/inputs/ein': resolve(packages, 'inputs/src/ein/index.ts'),
      '@civui/inputs/currency': resolve(packages, 'inputs/src/currency/index.ts'),
      '@civui/inputs/routing-number': resolve(packages, 'inputs/src/routing-number/index.ts'),
      '@civui/inputs/country': resolve(packages, 'inputs/src/country/index.ts'),
      '@civui/inputs/va-file-number': resolve(packages, 'inputs/src/va-file-number/index.ts'),
      '@civui/inputs': resolve(packages, 'inputs/src/index.ts'),
      '@civui/controls/checkbox': resolve(packages, 'controls/src/checkbox/index.ts'),
      '@civui/controls/radio': resolve(packages, 'controls/src/radio/index.ts'),
      '@civui/controls': resolve(packages, 'controls/src/index.ts'),
      '@civui/compound': resolve(packages, 'compound/src/index.ts'),
      '@civui/form-patterns': resolve(packages, 'form-patterns/src/index.ts'),
      // Actions
      '@civui/actions/button': resolve(packages, 'actions/src/button/index.ts'),
      '@civui/actions/action-button': resolve(packages, 'actions/src/action-button/index.ts'),
      '@civui/actions/link': resolve(packages, 'actions/src/link/index.ts'),
      '@civui/actions/link-card': resolve(packages, 'actions/src/link-card/index.ts'),
      '@civui/actions/button-group': resolve(packages, 'actions/src/button-group/index.ts'),
      '@civui/actions/external-link': resolve(packages, 'actions/src/external-link/index.ts'),
      '@civui/actions/phone-link': resolve(packages, 'actions/src/phone-link/index.ts'),
      '@civui/actions/download-link': resolve(packages, 'actions/src/download-link/index.ts'),
      '@civui/actions/email-link': resolve(packages, 'actions/src/email-link/index.ts'),
      '@civui/actions': resolve(packages, 'actions/src/index.ts'),
      // Overlays
      '@civui/overlays/modal': resolve(packages, 'overlays/src/modal/index.ts'),
      '@civui/overlays/action-sheet': resolve(packages, 'overlays/src/action-sheet/index.ts'),
      '@civui/overlays': resolve(packages, 'overlays/src/index.ts'),
      // Layout
      '@civui/layout/card': resolve(packages, 'layout/src/card/index.ts'),
      '@civui/layout/divider': resolve(packages, 'layout/src/divider/index.ts'),
      '@civui/layout/input-group': resolve(packages, 'layout/src/input-group/index.ts'),
      '@civui/layout/page-header': resolve(packages, 'layout/src/page-header/index.ts'),
      '@civui/layout/tag': resolve(packages, 'layout/src/tag/index.ts'),
      '@civui/layout': resolve(packages, 'layout/src/index.ts'),
      '@civui/navigation': resolve(packages, 'navigation/src/index.ts'),
      '@civui/feedback': resolve(packages, 'feedback/src/index.ts'),
      '@civui/tokens/css': resolve(packages, 'tokens/dist/css/tokens.css'),
      '@civui/test-utils': resolve(packages, 'test-utils/src/index.ts'),
    },
  },
});
