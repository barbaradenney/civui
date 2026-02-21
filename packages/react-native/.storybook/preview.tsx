import type { Preview } from '@storybook/react';
import { CivdsThemeProvider } from '../src/core/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <CivdsThemeProvider>
        <Story />
      </CivdsThemeProvider>
    ),
  ],
};

export default preview;
