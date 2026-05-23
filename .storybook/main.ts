// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";
import type { StorybookConfig } from '@storybook/web-components-vite';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore — no types for this plugin
import twig from 'vite-plugin-twig-drupal';
import remarkGfm from 'remark-gfm';

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
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        // MDX 3 (Storybook 10's default) ships with CommonMark only.
        // remark-gfm restores GitHub-Flavored Markdown tables, which the
        // auto-generated contract pages under .storybook/contract/ rely
        // on for the Props / Events / Cross-platform tables. Without
        // this, those tables render as literal-pipe paragraphs.
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
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

    // Stub Node-only globals that the bundled `twig` library (3.0.0,
    // pulled in via vite-plugin-twig-drupal) references when feature-
    // detecting whether it can `require('fs')`. In the browser those
    // references throw "ReferenceError: process is not defined" and
    // log "Missing fs and path modules" on every Drupal SDC story
    // load. Defining `process` as an empty env object lets the
    // try/catch around the require silently fail, suppressing the
    // noise. (The fs loader isn't used — the plugin feeds templates
    // inline.)
    config.define = {
      ...(config.define as Record<string, string> | undefined),
      'process.env': JSON.stringify({}),
      process: JSON.stringify({ env: {}, browser: true }),
    };

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
      '@civui/inputs/number': resolve(root, 'packages/inputs/src/number/index.ts'),
      '@civui/inputs/memorable-date': resolve(root, 'packages/inputs/src/date-input/index.ts'),
      '@civui/inputs/yes-no': resolve(root, 'packages/inputs/src/yes-no/index.ts'),
      '@civui/inputs/toggle': resolve(root, 'packages/inputs/src/toggle/index.ts'),
      '@civui/inputs': resolve(root, 'packages/inputs/src/index.ts'),
      '@civui/controls/checkbox': resolve(root, 'packages/controls/src/checkbox/index.ts'),
      '@civui/controls/radio': resolve(root, 'packages/controls/src/radio/index.ts'),
      '@civui/controls/segmented-control': resolve(root, 'packages/controls/src/segmented-control/index.ts'),
      '@civui/controls': resolve(root, 'packages/controls/src/index.ts'),
      '@civui/compound': resolve(root, 'packages/compound/src/index.ts'),
      '@civui/form-patterns/form': resolve(root, 'packages/form-patterns/src/form/index.ts'),
      '@civui/form-patterns': resolve(root, 'packages/form-patterns/src/index.ts'),
      '@civui/feedback/alert': resolve(root, 'packages/feedback/src/alert/index.ts'),
      '@civui/feedback/badge': resolve(root, 'packages/feedback/src/badge/index.ts'),
      '@civui/feedback/count': resolve(root, 'packages/feedback/src/count/index.ts'),
      '@civui/feedback': resolve(root, 'packages/feedback/src/index.ts'),
      // Actions (button, action-button, filter-chip, link, link-card, skip-link, confirm-button, toggle-button)
      '@civui/actions/button': resolve(root, 'packages/actions/src/button/index.ts'),
      '@civui/actions/action-button': resolve(root, 'packages/actions/src/action-button/index.ts'),
      '@civui/actions/filter-chip': resolve(root, 'packages/actions/src/filter-chip/index.ts'),
      '@civui/actions/filter-chip-group': resolve(root, 'packages/actions/src/filter-chip-group/index.ts'),
      '@civui/actions/link': resolve(root, 'packages/actions/src/link/index.ts'),
      '@civui/actions/link-card': resolve(root, 'packages/actions/src/link-card/index.ts'),
      '@civui/actions/skip-link': resolve(root, 'packages/actions/src/skip-link/index.ts'),
      '@civui/actions/confirm-button': resolve(root, 'packages/actions/src/confirm-button/index.ts'),
      '@civui/actions/toggle-button': resolve(root, 'packages/actions/src/toggle-button/index.ts'),
      '@civui/actions': resolve(root, 'packages/actions/src/index.ts'),
      // Navigation (breadcrumb, nav, side-nav, tabs, tab-nav, on-this-page, back-to-top)
      '@civui/navigation/breadcrumb': resolve(root, 'packages/navigation/src/breadcrumb/index.ts'),
      '@civui/navigation/nav': resolve(root, 'packages/navigation/src/nav/index.ts'),
      '@civui/navigation/tabs': resolve(root, 'packages/navigation/src/tabs/index.ts'),
      '@civui/navigation/tab-nav': resolve(root, 'packages/navigation/src/tab-nav/index.ts'),
      '@civui/navigation/side-nav': resolve(root, 'packages/navigation/src/side-nav/index.ts'),
      '@civui/navigation/on-this-page': resolve(root, 'packages/navigation/src/on-this-page/index.ts'),
      '@civui/navigation/back-to-top': resolve(root, 'packages/navigation/src/back-to-top/index.ts'),
      '@civui/navigation': resolve(root, 'packages/navigation/src/index.ts'),
      // Overlays
      '@civui/overlays/modal': resolve(root, 'packages/overlays/src/modal/index.ts'),
      '@civui/overlays/action-sheet': resolve(root, 'packages/overlays/src/action-sheet/index.ts'),
      '@civui/overlays/drawer': resolve(root, 'packages/overlays/src/drawer/index.ts'),
      '@civui/overlays/popover': resolve(root, 'packages/overlays/src/popover/index.ts'),
      '@civui/overlays/menu': resolve(root, 'packages/overlays/src/menu/index.ts'),
      '@civui/overlays': resolve(root, 'packages/overlays/src/index.ts'),
      // Layout
      '@civui/layout/accordion': resolve(root, 'packages/layout/src/accordion/index.ts'),
      '@civui/layout/callout': resolve(root, 'packages/layout/src/callout/index.ts'),
      '@civui/layout/card': resolve(root, 'packages/layout/src/card/index.ts'),
      '@civui/layout/divider': resolve(root, 'packages/layout/src/divider/index.ts'),
      '@civui/layout/input-group': resolve(root, 'packages/layout/src/input-group/index.ts'),
      '@civui/layout/list': resolve(root, 'packages/layout/src/list/index.ts'),
      '@civui/layout/page-header': resolve(root, 'packages/layout/src/page-header/index.ts'),
      '@civui/layout/tag': resolve(root, 'packages/layout/src/tag/index.ts'),
      '@civui/layout/button-group': resolve(root, 'packages/layout/src/button-group/index.ts'),
      '@civui/layout/image-preview': resolve(root, 'packages/layout/src/image-preview/index.ts'),
      '@civui/layout/disclosure': resolve(root, 'packages/layout/src/disclosure/index.ts'),
      '@civui/layout': resolve(root, 'packages/layout/src/index.ts'),
      // Data — admin / collection-display family
      '@civui/data/data-grid': resolve(root, 'packages/data/src/data-grid/index.ts'),
      '@civui/data/pagination': resolve(root, 'packages/data/src/pagination/index.ts'),
      '@civui/data/toolbar': resolve(root, 'packages/data/src/toolbar/index.ts'),
      '@civui/data/bulk-actions': resolve(root, 'packages/data/src/bulk-actions/index.ts'),
      '@civui/data/filterable-list': resolve(root, 'packages/data/src/filterable-list/index.ts'),
      '@civui/data/column-visibility': resolve(root, 'packages/data/src/column-visibility/index.ts'),
      '@civui/data/metric-tile': resolve(root, 'packages/data/src/metric-tile/index.ts'),
      '@civui/data/metric-group': resolve(root, 'packages/data/src/metric-group/index.ts'),
      '@civui/data/export': resolve(root, 'packages/data/src/export/index.ts'),
      '@civui/data': resolve(root, 'packages/data/src/index.ts'),
      // Storybook utilities — used by stories that wrap demos in
      // `<civ-demo-frame>`. Resolve to source so the storybook build
      // works without a prebuilt @civui/storybook-utils dist (the
      // package's exports point at dist/demo-frame/index.js, which
      // fresh CI checkouts don't have until something runs `pnpm build`).
      '@civui/storybook-utils/demo-frame': resolve(root, 'packages/storybook-utils/src/demo-frame/index.ts'),
      '@civui/storybook-utils/demo-frame.css': resolve(root, 'packages/storybook-utils/src/demo-frame/demo-frame.css'),
      '@civui/storybook-utils': resolve(root, 'packages/storybook-utils/src/index.ts'),
      '@civui/tokens/css': resolve(root, 'packages/tokens/dist/css/tokens.css'),
    };
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
