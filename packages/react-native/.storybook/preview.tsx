import type { Preview } from '@storybook/react';
import { CivThemeProvider } from '../src/core/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <CivThemeProvider>
        <Story />
      </CivThemeProvider>
    ),
  ],
};

export default preview;
