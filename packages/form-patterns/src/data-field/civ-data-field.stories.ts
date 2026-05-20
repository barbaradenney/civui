import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-data-field.js';

const meta: Meta = {
  title: 'Forms/Form/Data Field',
  component: 'civ-data-field',
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
  render: (args) => html`<civ-data-field label="${args.label}" value="${args.value}"></civ-data-field>`,
};

export const WithHint: Story = {
  render: () => html`
    <civ-data-field
      label="Social Security number"
      value="●●●-●●-6789"
      hint="Only the last 4 digits are shown for security"
    ></civ-data-field>
  `,
};

export const EmptyValue: Story = {
  render: () => html`<civ-data-field label="Phone number"></civ-data-field>`,
};

export const MultipleFields: Story = {
  render: () => html`
    <civ-data-field label="Full name" value="Jane A. Doe"></civ-data-field>
    <civ-data-field label="Date of birth" value="January 15, 1990"></civ-data-field>
    <civ-data-field label="Social Security number" value="●●●-●●-6789" hint="Last 4 digits shown"></civ-data-field>
    <civ-data-field label="Email" value="jane.doe@email.com"></civ-data-field>
  `,
};

export const Compact: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default</p>
        <civ-data-field label="Full name" value="Jane A. Doe"></civ-data-field>
        <civ-data-field label="Date of birth" value="January 15, 1990"></civ-data-field>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <civ-data-field label="Full name" value="Jane A. Doe" spacing="sm"></civ-data-field>
        <civ-data-field label="Date of birth" value="January 15, 1990" spacing="sm"></civ-data-field>
      </div>
    </div>
  `,
};
