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
      '@civui/ui/tag': resolve(root, 'packages/ui/src/tag/index.ts'),
      '@civui/ui/link': resolve(root, 'packages/ui/src/link/index.ts'),
      '@civui/ui/button': resolve(root, 'packages/ui/src/button/index.ts'),
      '@civui/ui/card': resolve(root, 'packages/ui/src/card/index.ts'),
      '@civui/ui/divider': resolve(root, 'packages/ui/src/divider/index.ts'),
      '@civui/ui/page-header': resolve(root, 'packages/ui/src/page-header/index.ts'),
      '@civui/ui/link-card': resolve(root, 'packages/ui/src/link-card/index.ts'),
      '@civui/ui/action-button': resolve(root, 'packages/ui/src/action-button/index.ts'),
      '@civui/ui/button-group': resolve(root, 'packages/ui/src/button-group/index.ts'),
      '@civui/ui': resolve(root, 'packages/ui/src/index.ts'),
      '@civui/navigation': resolve(root, 'packages/navigation/src/index.ts'),
      '@civui/tokens/css': resolve(root, 'packages/tokens/dist/css/tokens.css'),
    };
    return config;
  },
};

export default config;
