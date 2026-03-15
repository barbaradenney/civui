import type { Preview } from '@storybook/web-components';
import '../packages/core/src/styles/civ.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme || 'light';
      const isDark = theme === 'dark';

      // Apply theme to the Storybook body so CSS variable overrides take effect
      document.body.setAttribute('data-civ-theme', theme);
      document.body.style.backgroundColor = isDark ? '#1b1b1b' : '#ffffff';

      return story();
    },
  ],
  parameters: {
    layout: 'padded',
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
