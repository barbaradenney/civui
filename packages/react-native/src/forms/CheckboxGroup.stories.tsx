import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxGroup } from './CheckboxGroup';

const TOPPINGS = [
  { value: 'cheese', label: 'Extra Cheese' },
  { value: 'pepperoni', label: 'Pepperoni' },
  { value: 'mushrooms', label: 'Mushrooms' },
  { value: 'olives', label: 'Olives' },
];

const FEATURES = [
  { value: 'dark', label: 'Dark mode', description: 'Use a dark color scheme' },
  { value: 'notifications', label: 'Notifications', description: 'Receive push notifications' },
  { value: 'analytics', label: 'Analytics', description: 'Share usage data to help improve' },
];

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Forms/CheckboxGroup',
  component: CheckboxGroup,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

export const Default: Story = {
  args: {
    name: 'toppings',
    legend: 'Pizza Toppings',
    options: TOPPINGS,
  },
};

export const WithDescriptions: Story = {
  args: {
    name: 'features',
    legend: 'Features',
    options: FEATURES,
  },
};

export const Tile: Story = {
  args: {
    name: 'features',
    legend: 'Features',
    options: FEATURES,
    tile: true,
  },
};

export const Horizontal: Story = {
  args: {
    name: 'toppings',
    legend: 'Pizza Toppings',
    options: TOPPINGS,
    orientation: 'horizontal',
  },
};

export const WithError: Story = {
  args: {
    name: 'toppings',
    legend: 'Pizza Toppings',
    error: 'Please select at least one topping',
    required: true,
    options: TOPPINGS,
  },
};

export const Disabled: Story = {
  args: {
    name: 'toppings',
    legend: 'Pizza Toppings',
    value: 'cheese,mushrooms',
    disabled: true,
    options: TOPPINGS,
  },
};

function ControlledExample() {
  const [value, setValue] = useState('');
  return (
    <CheckboxGroup
      name="features"
      legend="Features"
      hint={`Selected: ${value || 'none'}`}
      options={FEATURES}
      tile
      value={value}
      onChange={setValue}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
