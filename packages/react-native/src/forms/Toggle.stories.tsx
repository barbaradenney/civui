import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Forms/Toggle',
  component: Toggle,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    name: 'notifications',
    label: 'Enable notifications',
  },
};

export const Checked: Story = {
  args: {
    name: 'notifications',
    label: 'Enable notifications',
    checked: true,
  },
};

export const WithDescription: Story = {
  args: {
    name: 'dark-mode',
    label: 'Dark mode',
    description: 'Use dark color scheme throughout the app',
  },
};

export const WithHint: Story = {
  args: {
    name: 'analytics',
    label: 'Share analytics',
    hint: 'Help us improve by sharing anonymous usage data',
  },
};

export const WithError: Story = {
  args: {
    name: 'terms',
    label: 'Accept terms',
    error: 'You must accept the terms to continue',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'locked',
    label: 'Locked setting',
    checked: true,
    disabled: true,
  },
};

function ControlledExample() {
  const [checked, setChecked] = useState(false);
  return (
    <Toggle
      name="controlled"
      label={`Toggle is ${checked ? 'on' : 'off'}`}
      checked={checked}
      onChange={setChecked}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
