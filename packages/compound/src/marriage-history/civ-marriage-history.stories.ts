import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-marriage-history.js';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Forms/Compound/Marriage History',
  component: 'civ-marriage-history',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-marriage-history
      legend="About this marriage"
      name="marriage"
    ></civ-marriage-history>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-marriage-history
      legend="About this marriage"
      name="marriage"
      required
    ></civ-marriage-history>
  `,
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => html`
    <civ-marriage-history
      legend="About this marriage"
      name="marriage"
      required
      spouse-error="Enter your spouse's name"
      marriage-date-error="Enter the date of marriage"
      status-error="Select the marriage status"
    ></civ-marriage-history>
  `,
};

export const InRepeater: Story = {
  name: 'Usage: In Repeater',
  render: () => html`
    <civ-repeater
      legend="Marriage history"
      name="marriages"
      item-label="marriage"
      mode="detail"
      min="0"
      max="10"
    >
      <civ-marriage-history name="entry"></civ-marriage-history>
    </civ-repeater>
  `,
};
