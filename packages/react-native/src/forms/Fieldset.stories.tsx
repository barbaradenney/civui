import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Fieldset } from './Fieldset';

const meta: Meta<typeof Fieldset> = {
  title: 'Forms/Fieldset',
  component: Fieldset,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Fieldset>;

export const Default: Story = {
  args: {
    legend: 'Address',
    children: <Text>Address fields go here</Text>,
  },
};

export const WithHint: Story = {
  args: {
    legend: 'Address',
    hint: 'Enter your mailing address',
    children: <Text>Address fields go here</Text>,
  },
};

export const WithError: Story = {
  args: {
    legend: 'Address',
    error: 'Please complete all address fields',
    children: <Text>Address fields go here</Text>,
  },
};

export const Required: Story = {
  args: {
    legend: 'Address',
    required: true,
    children: <Text>Address fields go here</Text>,
  },
};
