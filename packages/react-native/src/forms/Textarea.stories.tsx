import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    name: 'message',
    label: 'Message',
    placeholder: 'Type your message...',
  },
};

export const WithCharacterCount: Story = {
  args: {
    name: 'bio',
    label: 'Bio',
    hint: 'Brief description about yourself',
    maxLength: 200,
  },
};

export const WithError: Story = {
  args: {
    name: 'comment',
    label: 'Comment',
    error: 'Comment is required',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'locked',
    label: 'Locked textarea',
    value: 'This content cannot be edited',
    disabled: true,
  },
};

function ControlledExample() {
  const [value, setValue] = useState('');
  return (
    <Textarea
      name="controlled"
      label="Feedback"
      hint="Tell us what you think"
      maxLength={500}
      value={value}
      onChange={setValue}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
