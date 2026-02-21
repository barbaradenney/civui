import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    name: 'state',
    label: 'State',
    options: STATES,
  },
};

export const WithHint: Story = {
  args: {
    name: 'state',
    label: 'State',
    hint: 'Select your state of residence',
    options: STATES,
  },
};

export const WithError: Story = {
  args: {
    name: 'state',
    label: 'State',
    error: 'Please select a state',
    required: true,
    options: STATES,
  },
};

export const Disabled: Story = {
  args: {
    name: 'state',
    label: 'State',
    value: 'CA',
    disabled: true,
    options: STATES,
  },
};

function ControlledExample() {
  const [value, setValue] = useState('');
  return (
    <Select
      name="state"
      label="State"
      hint={`Selected: ${value || 'none'}`}
      options={STATES}
      value={value}
      onChange={setValue}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
