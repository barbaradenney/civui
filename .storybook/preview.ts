import type { Preview } from '@storybook/web-components';
import '@civui/tokens/css';
import '../packages/core/src/styles/civ.css';

/** Detect system color scheme preference. */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System', icon: 'mirror' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'system',
  },
  decorators: [
    (story, context) => {
      const themeSetting = context.globals.theme || 'system';
      const resolvedTheme = themeSetting === 'system' ? getSystemTheme() : themeSetting;
      const isDark = resolvedTheme === 'dark';

      // Apply theme to both the current document AND any parent document
      // (handles both canvas mode and iframe-based docs mode)
      const docs = [document];
      try { if (window.parent?.document) docs.push(window.parent.document); } catch {}

      for (const doc of docs) {
        doc.documentElement.setAttribute('data-civ-theme', resolvedTheme);
        doc.body.style.backgroundColor = isDark ? '#1b1b1b' : '#ffffff';
        doc.body.style.color = isDark ? '#f0f0f0' : '#1b1b1b';
      }

      return story();
    },
  ],
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        // Render stories in iframes within docs pages. Light DOM web
        // components share the parent document when rendered inline,
        // which causes style collisions, ID clashes, and broken
        // formAssociated / attachInternals() lifecycle for form elements.
        inline: false,
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
};

export default preview;
