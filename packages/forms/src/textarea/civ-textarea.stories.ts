import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-textarea.js';

const meta: Meta = {
  title: 'Forms/Textarea',
  component: 'civ-textarea',
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
    <civ-textarea
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint || ''}"
      error="${args.error || ''}"
      placeholder="${args.placeholder || ''}"
      rows="${args.rows || 5}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-textarea>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-textarea
      label="Additional comments"
      name="comments"
      hint="Please provide any additional details"
    ></civ-textarea>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-textarea
      label="Description"
      name="description"
      error="Description is required"
      required
    ></civ-textarea>
  `,
};

export const WithCharacterCount: Story = {
  render: () => html`
    <civ-textarea
      label="Bio"
      name="bio"
      hint="Tell us about yourself"
      maxlength="200"
    ></civ-textarea>
  `,
};

export const CustomRows: Story = {
  render: () => html`
    <civ-textarea
      label="Essay"
      name="essay"
      rows="10"
      placeholder="Write your essay here..."
    ></civ-textarea>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-textarea
      label="Read-only notes"
      name="notes"
      value="This field cannot be edited"
      disabled
    ></civ-textarea>
  `,
};

export const WordCount: Story = {
  render: () => html`
    <civ-textarea
      label="Personal statement"
      name="statement"
      hint="Describe your qualifications in 250 words or fewer"
      maxwords="250"
      rows="8"
    ></civ-textarea>
  `,
};
