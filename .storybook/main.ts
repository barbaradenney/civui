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
    // Resolve workspace packages to TypeScript source so Storybook dev
    // works without running `pnpm build` first.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      '@civui/core': resolve(root, 'packages/core/src/index.ts'),
      '@civui/forms': resolve(root, 'packages/forms/src/index.ts'),
      '@civui/feedback': resolve(root, 'packages/feedback/src/index.ts'),
      '@civui/ui': resolve(root, 'packages/ui/src/index.ts'),
      '@civui/navigation': resolve(root, 'packages/navigation/src/index.ts'),
      '@civui/tokens/css': resolve(root, 'packages/tokens/dist/css/tokens.css'),
    };
    return config;
  },
};

export default config;
