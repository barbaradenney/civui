// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";
import type { StorybookConfig } from '@storybook/web-components-vite';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore — no types for this plugin
import twig from 'vite-plugin-twig-drupal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

const __dir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.ts',
    // Auto-generated contract reference (one MDX docs page per schema).
    // Files are written by `pnpm storybook:contract` (run automatically
    // via the prestorybook hook). Gitignored.
    '../.storybook/contract/*.docs.mdx',
  ],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
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

    // Twig plugin for Drupal SDC preview
    config.plugins = config.plugins || [];
    (config.plugins as any[]).push(twig({
      namespaces: {
        civui: join(root, 'packages/drupal/civui/components'),
      },
    }));

    // Resolve workspace packages to TypeScript source so Storybook dev
    // works without running `pnpm build` first.
    //
    // The `locutus/php/...` alias works around a packaging mismatch
    // between drupal-twig-extensions and locutus. drupal-twig-extensions
    // imports `locutus/php/datetime/date.js` (with `.js`); locutus's
    // exports map `./*` → `./esm/*.js` would resolve that to
    // `./esm/.../date.js.js` (non-existent). CJS resolution forgives
    // this at runtime (the Twig dev server works), but Rollup's strict
    // ESM resolution does not, breaking `pnpm storybook:build`. The
    // alias points the offending subpath directly at the real ESM
    // file. Remove this when drupal-twig-extensions ships an import
    // without the `.js` suffix.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      'locutus/php/datetime/date.js': resolve(root, 'node_modules/locutus/php/datetime/date.js'),
      '@civui/core/icon': resolve(root, 'packages/core/src/icon/index.ts'),
      '@civui/core': resolve(root, 'packages/core/src/index.ts'),
      '@civui/inputs/ssn': resolve(root, 'packages/inputs/src/ssn/index.ts'),
      '@civui/inputs/phone': resolve(root, 'packages/inputs/src/phone/index.ts'),
      '@civui/inputs/email': resolve(root, 'packages/inputs/src/email/index.ts'),
      '@civui/inputs/zip': resolve(root, 'packages/inputs/src/zip/index.ts'),
      '@civui/inputs/ein': resolve(root, 'packages/inputs/src/ein/index.ts'),
      '@civui/inputs/currency': resolve(root, 'packages/inputs/src/currency/index.ts'),
      '@civui/inputs/routing-number': resolve(root, 'packages/inputs/src/routing-number/index.ts'),
      '@civui/inputs/country': resolve(root, 'packages/inputs/src/country/index.ts'),
      '@civui/inputs/va-file-number': resolve(root, 'packages/inputs/src/va-file-number/index.ts'),
      '@civui/inputs/text-input': resolve(root, 'packages/inputs/src/text-input/index.ts'),
      '@civui/inputs/textarea': resolve(root, 'packages/inputs/src/textarea/index.ts'),
      '@civui/inputs/select': resolve(root, 'packages/inputs/src/select/index.ts'),
      '@civui/inputs/memorable-date': resolve(root, 'packages/inputs/src/date-input/index.ts'),
      '@civui/inputs/yes-no': resolve(root, 'packages/inputs/src/yes-no/index.ts'),
      '@civui/inputs': resolve(root, 'packages/inputs/src/index.ts'),
      '@civui/controls/checkbox': resolve(root, 'packages/controls/src/checkbox/index.ts'),
      '@civui/controls/radio': resolve(root, 'packages/controls/src/radio/index.ts'),
      '@civui/controls': resolve(root, 'packages/controls/src/index.ts'),
      '@civui/compound': resolve(root, 'packages/compound/src/index.ts'),
      '@civui/form-patterns': resolve(root, 'packages/form-patterns/src/index.ts'),
      '@civui/feedback/alert': resolve(root, 'packages/feedback/src/alert/index.ts'),
      '@civui/feedback/badge': resolve(root, 'packages/feedback/src/badge/index.ts'),
      '@civui/feedback/count': resolve(root, 'packages/feedback/src/count/index.ts'),
      '@civui/feedback': resolve(root, 'packages/feedback/src/index.ts'),
      // Actions
      '@civui/actions/button': resolve(root, 'packages/actions/src/button/index.ts'),
      '@civui/actions/action-button': resolve(root, 'packages/actions/src/action-button/index.ts'),
      '@civui/actions/filter-chip': resolve(root, 'packages/actions/src/filter-chip/index.ts'),
      '@civui/actions/filter-chip-group': resolve(root, 'packages/actions/src/filter-chip-group/index.ts'),
      '@civui/actions/action-link': resolve(root, 'packages/actions/src/action-link/index.ts'),
      '@civui/actions': resolve(root, 'packages/actions/src/index.ts'),
      // Overlays
      '@civui/overlays/modal': resolve(root, 'packages/overlays/src/modal/index.ts'),
      '@civui/overlays/action-sheet': resolve(root, 'packages/overlays/src/action-sheet/index.ts'),
      '@civui/overlays': resolve(root, 'packages/overlays/src/index.ts'),
      // Layout
      '@civui/layout/card': resolve(root, 'packages/layout/src/card/index.ts'),
      '@civui/layout/divider': resolve(root, 'packages/layout/src/divider/index.ts'),
      '@civui/layout/input-group': resolve(root, 'packages/layout/src/input-group/index.ts'),
      '@civui/layout/list': resolve(root, 'packages/layout/src/list/index.ts'),
      '@civui/layout/page-header': resolve(root, 'packages/layout/src/page-header/index.ts'),
      '@civui/layout/tag': resolve(root, 'packages/layout/src/tag/index.ts'),
      '@civui/layout/button-group': resolve(root, 'packages/layout/src/button-group/index.ts'),
      '@civui/layout/image-preview': resolve(root, 'packages/layout/src/image-preview/index.ts'),
      '@civui/layout': resolve(root, 'packages/layout/src/index.ts'),
      // Navigation
      '@civui/navigation/skip-link': resolve(root, 'packages/navigation/src/skip-link/index.ts'),
      '@civui/navigation/link': resolve(root, 'packages/navigation/src/link/index.ts'),
      '@civui/navigation/link-card': resolve(root, 'packages/navigation/src/link-card/index.ts'),
      '@civui/navigation': resolve(root, 'packages/navigation/src/index.ts'),
      '@civui/tokens/css': resolve(root, 'packages/tokens/dist/css/tokens.css'),
    };
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
