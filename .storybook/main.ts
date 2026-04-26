import type { StorybookConfig } from '@storybook/web-components-vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // When deployed to a subpath (e.g. GitHub Pages /storybook/), Vite needs
    // the correct base so asset URLs resolve properly.
    if (process.env.STORYBOOK_BASE) {
      config.base = process.env.STORYBOOK_BASE;
    }

    // Disable tree-shaking in production build — all CivUI components
    // register custom elements via @customElement which are side effects.
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    (config.build.rollupOptions as any).treeshake = false;

    // Resolve workspace packages to TypeScript source so Storybook dev
    // works without running `pnpm build` first.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      '@civui/core': resolve(root, 'packages/core/src/index.ts'),
      '@civui/inputs': resolve(root, 'packages/inputs/src/index.ts'),
      '@civui/controls': resolve(root, 'packages/controls/src/index.ts'),
      '@civui/compound': resolve(root, 'packages/compound/src/index.ts'),
      '@civui/form-patterns': resolve(root, 'packages/form-patterns/src/index.ts'),
      '@civui/feedback': resolve(root, 'packages/feedback/src/index.ts'),
      // Actions
      '@civui/actions/button': resolve(root, 'packages/actions/src/button/index.ts'),
      '@civui/actions/action-button': resolve(root, 'packages/actions/src/action-button/index.ts'),
      '@civui/actions/link': resolve(root, 'packages/actions/src/link/index.ts'),
      '@civui/actions/link-card': resolve(root, 'packages/actions/src/link-card/index.ts'),
      '@civui/actions/button-group': resolve(root, 'packages/actions/src/button-group/index.ts'),
      '@civui/actions': resolve(root, 'packages/actions/src/index.ts'),
      // Overlays
      '@civui/overlays/modal': resolve(root, 'packages/overlays/src/modal/index.ts'),
      '@civui/overlays/action-sheet': resolve(root, 'packages/overlays/src/action-sheet/index.ts'),
      '@civui/overlays': resolve(root, 'packages/overlays/src/index.ts'),
      // Layout
      '@civui/layout/card': resolve(root, 'packages/layout/src/card/index.ts'),
      '@civui/layout/divider': resolve(root, 'packages/layout/src/divider/index.ts'),
      '@civui/layout/input-group': resolve(root, 'packages/layout/src/input-group/index.ts'),
      '@civui/layout/page-header': resolve(root, 'packages/layout/src/page-header/index.ts'),
      '@civui/layout/tag': resolve(root, 'packages/layout/src/tag/index.ts'),
      '@civui/layout': resolve(root, 'packages/layout/src/index.ts'),
      '@civui/navigation': resolve(root, 'packages/navigation/src/index.ts'),
      '@civui/tokens/css': resolve(root, 'packages/tokens/dist/css/tokens.css'),
    };
    return config;
  },
};

export default config;
