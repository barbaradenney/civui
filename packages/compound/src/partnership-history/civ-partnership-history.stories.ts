import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-partnership-history.js';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Forms/Compound/Marriage History',
  component: 'civ-partnership-history',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="marriage"
    ></civ-partnership-history>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="marriage"
      required
    ></civ-partnership-history>
  `,
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="marriage"
      required
      spouse-error="Enter your spouse's name"
      marriage-date-error="Enter the date of marriage"
      status-error="Select the marriage status"
    ></civ-partnership-history>
  `,
};

export const InRepeater: Story = {
  name: 'Usage: In Repeater',
  render: () => html`
    <civ-repeater
      legend="Marriage history"
      size="lg"
      name="marriages"
      item-label="marriage"
      min="0"
      max="10"
    >
      <civ-partnership-history name="entry"></civ-partnership-history>
    </civ-repeater>
  `,
};
