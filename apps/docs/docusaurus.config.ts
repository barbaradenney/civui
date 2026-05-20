import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CivUI',
  tagline: 'Accessibility-first components for government applications',
  favicon: 'img/favicon.ico',
  url: 'https://barbaradenney.github.io',
  baseUrl: '/civui/',
  organizationName: 'barbaradenney',
  projectName: 'civui',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      // Initial mode follows the OS preference; the user can still
      // override via the navbar toggle, and that choice persists in
      // localStorage. Without this, the docs chrome stayed light on
      // dark-OS machines while embedded StoryEmbed iframes (which
      // load CivUI tokens that use `@media (prefers-color-scheme: dark)`)
      // auto-swapped to dark — the docs page chrome and the inline
      // previews disagreed about the mode.
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CivUI',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/barbaradenney/civui',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/' },
            { label: 'Components', to: '/category/components' },
            { label: 'MCP Server', to: '/mcp-server/overview' },
          ],
        },
        {
          title: 'Tools',
          items: [
            { label: 'Storybook', href: 'pathname:///civui/storybook/' },
            { label: 'VA Forms Demo', href: 'pathname:///civui/forms/' },
            { label: 'GitHub', href: 'https://github.com/barbaradenney/civui' },
          ],
        },
      ],
      copyright: `CivUI — Civic Design System. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
