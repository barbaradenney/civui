import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './Radio';

const SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

const PLANS = [
  { value: 'free', label: 'Free', description: 'Basic features, limited usage' },
  { value: 'pro', label: 'Pro', description: 'All features, unlimited usage' },
  { value: 'enterprise', label: 'Enterprise', description: 'Custom solutions and support' },
];

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    name: 'size',
    label: 'Size',
    options: SIZES,
  },
};

export const WithHint: Story = {
  args: {
    name: 'size',
    label: 'Size',
    hint: 'Choose your preferred size',
    options: SIZES,
  },
};

export const WithDescriptions: Story = {
  args: {
    name: 'plan',
    label: 'Subscription plan',
    options: PLANS,
  },
};

export const Tile: Story = {
  args: {
    name: 'plan',
    label: 'Choose a plan',
    options: PLANS,
    tile: true,
  },
};

export const WithError: Story = {
  args: {
    name: 'size',
    label: 'Size',
    error: 'Please select a size',
    required: true,
    options: SIZES,
  },
};

export const Horizontal: Story = {
  args: {
    name: 'size',
    label: 'Size',
    options: SIZES,
    orientation: 'horizontal',
  },
};

export const Disabled: Story = {
  args: {
    name: 'size',
    label: 'Size',
    value: 'md',
    disabled: true,
    options: SIZES,
  },
};

function ControlledExample() {
  const [value, setValue] = useState('');
  return (
    <RadioGroup
      name="plan"
      label="Choose a plan"
      hint={`Selected: ${value || 'none'}`}
      options={PLANS}
      tile
      value={value}
      onChange={setValue}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
