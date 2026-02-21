import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker, type DatePickerProps } from './DatePicker.js';

const meta: Meta<DatePickerProps> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
};

export default meta;
type Story = StoryObj<DatePickerProps>;

function StatefulDatePicker(props: DatePickerProps) {
  const [value, setValue] = useState(props.value || '');
  return (
    <View style={{ padding: 16 }}>
      <DatePicker {...props} value={value} onChange={setValue} />
    </View>
  );
}

export const Default: Story = {
  render: () => (
    <StatefulDatePicker
      name="date"
      label="Appointment date"
    />
  ),
};

export const WithValue: Story = {
  render: () => (
    <StatefulDatePicker
      name="date"
      label="Start date"
      value="2026-03-15"
    />
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <StatefulDatePicker
      name="date"
      label="Booking date"
      min="2026-03-01"
      max="2026-03-31"
      hint="Available dates: March 1-31, 2026"
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <StatefulDatePicker
      name="date"
      label="Due date"
      error="Please select a valid date"
      required
    />
  ),
};

export const Required: Story = {
  render: () => (
    <StatefulDatePicker
      name="date"
      label="Delivery date"
      required
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <StatefulDatePicker
      name="date"
      label="Locked date"
      value="2026-03-15"
      disabled
    />
  ),
};
