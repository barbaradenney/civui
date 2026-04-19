import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-read-only-field.js';

const meta: Meta = {
  title: 'Forms/Read-Only Field',
  component: 'civ-read-only-field',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: 'Full name', value: 'Jane A. Doe' },
  render: (args) => html`<civ-read-only-field label="${args.label}" value="${args.value}"></civ-read-only-field>`,
};

export const WithHint: Story = {
  render: () => html`
    <civ-read-only-field
      label="Social Security number"
      value="●●●-●●-6789"
      hint="Only the last 4 digits are shown for security"
    ></civ-read-only-field>
  `,
};

export const EmptyValue: Story = {
  render: () => html`<civ-read-only-field label="Phone number"></civ-read-only-field>`,
};

export const MultipleFields: Story = {
  render: () => html`
    <civ-read-only-field label="Full name" value="Jane A. Doe"></civ-read-only-field>
    <civ-read-only-field label="Date of birth" value="January 15, 1990"></civ-read-only-field>
    <civ-read-only-field label="Social Security number" value="●●●-●●-6789" hint="Last 4 digits shown"></civ-read-only-field>
    <civ-read-only-field label="Email" value="jane.doe@email.com"></civ-read-only-field>
  `,
};
