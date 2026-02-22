import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';

const VIEW_OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'table', label: 'Table' },
];

const meta: Meta<typeof SegmentedControl> = {
  title: 'Forms/SegmentedControl',
  component: SegmentedControl,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  args: {
    name: 'view',
    label: 'View mode',
    options: VIEW_OPTIONS,
  },
};

export const WithValue: Story = {
  args: {
    name: 'view',
    label: 'View mode',
    value: 'grid',
    options: VIEW_OPTIONS,
  },
};

export const WithHint: Story = {
  args: {
    name: 'view',
    label: 'View mode',
    hint: 'Choose how to display results',
    options: VIEW_OPTIONS,
  },
};

export const WithError: Story = {
  args: {
    name: 'view',
    label: 'View mode',
    error: 'Please select a view mode',
    required: true,
    options: VIEW_OPTIONS,
  },
};

export const Disabled: Story = {
  args: {
    name: 'view',
    label: 'View mode',
    value: 'list',
    disabled: true,
    options: VIEW_OPTIONS,
  },
};

function ControlledExample() {
  const [value, setValue] = useState('list');
  return (
    <SegmentedControl
      name="view"
      label="View mode"
      hint={`Selected: ${value}`}
      options={VIEW_OPTIONS}
      value={value}
      onChange={setValue}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
