import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-textarea.js';

const meta: Meta = {
  title: 'Forms/Textarea',
  component: 'civds-textarea',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    maxlength: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Message',
    name: 'message',
  },
  render: (args) => html`
    <civds-textarea
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint || ''}"
      error="${args.error || ''}"
      placeholder="${args.placeholder || ''}"
      rows="${args.rows || 5}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civds-textarea>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civds-textarea
      label="Additional comments"
      name="comments"
      hint="Please provide any additional details"
    ></civds-textarea>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-textarea
      label="Description"
      name="description"
      error="Description is required"
      required
    ></civds-textarea>
  `,
};

export const WithCharacterCount: Story = {
  render: () => html`
    <civds-textarea
      label="Bio"
      name="bio"
      hint="Tell us about yourself"
      maxlength="200"
    ></civds-textarea>
  `,
};

export const CustomRows: Story = {
  render: () => html`
    <civds-textarea
      label="Essay"
      name="essay"
      rows="10"
      placeholder="Write your essay here..."
    ></civds-textarea>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civds-textarea
      label="Read-only notes"
      name="notes"
      value="This field cannot be edited"
      disabled
    ></civds-textarea>
  `,
};
