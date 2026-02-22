import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { FormGroup } from './FormGroup';

const meta: Meta<typeof FormGroup> = {
  title: 'Forms/FormGroup',
  component: FormGroup,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FormGroup>;

export const Default: Story = {
  args: {
    label: 'Contact Information',
    children: <Text>Form fields go here</Text>,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Contact Information',
    hint: 'Please fill in all required fields',
    children: <Text>Form fields go here</Text>,
  },
};

export const WithError: Story = {
  args: {
    label: 'Contact Information',
    error: 'Please correct the errors below',
    children: <Text>Form fields go here</Text>,
  },
};

export const Required: Story = {
  args: {
    label: 'Contact Information',
    required: true,
    children: <Text>Form fields go here</Text>,
  },
};
