import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Forms/TextInput',
  component: TextInput,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    name: 'name',
    label: 'Full name',
    placeholder: 'Enter your name',
  },
};

export const WithHint: Story = {
  args: {
    name: 'email',
    label: 'Email address',
    hint: 'We will only use this to contact you',
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const WithError: Story = {
  args: {
    name: 'email',
    label: 'Email address',
    error: 'Please enter a valid email',
    type: 'email',
    required: true,
  },
};

export const Required: Story = {
  args: {
    name: 'phone',
    label: 'Phone number',
    type: 'tel',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'locked',
    label: 'Locked field',
    value: 'Cannot edit this',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
  },
};

function ControlledExample() {
  const [value, setValue] = useState('');
  return (
    <TextInput
      name="controlled"
      label="Controlled input"
      hint={`Current value: "${value}"`}
      value={value}
      onChange={setValue}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
