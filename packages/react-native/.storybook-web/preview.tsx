import type { Preview, Decorator } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { CivdsThemeProvider } from '../src/core/theme';
import './device-frame.css';

/**
 * Auto-wire controlled components so Storybook args stay in sync.
 *
 * Checkbox: onChange(checked: boolean) → updates `checked` arg
 * RadioGroup / Select: onChange(value: string) → updates `value` arg
 */
const withControlledState: Decorator = (Story, context) => {
  const [, updateArgs] = useArgs();

  const originalOnChange = context.args.onChange as ((...a: unknown[]) => void) | undefined;

  context.args.onChange = (...params: unknown[]) => {
    originalOnChange?.(...params);

    const first = params[0];
    if (typeof first === 'boolean') {
      updateArgs({ checked: first });
    } else if (typeof first === 'string') {
      updateArgs({ value: first });
    }
  };

  return <Story />;
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
  decorators: [
    withControlledState,
    (Story) => (
      <CivdsThemeProvider>
        <div className="device-frame">
          <div className="device-frame__screen">
            <Story />
          </div>
        </div>
      </CivdsThemeProvider>
    ),
  ],
};

export default preview;
