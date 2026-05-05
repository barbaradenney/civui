import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-service-history.js';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Compound/Service History',
  component: 'civ-service-history',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-service-history
      legend="About this service period"
      size="lg"
      name="service"
    ></civ-service-history>
  `,
};

export const WithServiceNumber: Story = {
  name: 'With Service Number',
  render: () => html`
    <civ-service-history
      legend="About this service period"
      size="lg"
      name="service"
      show-service-number
    ></civ-service-history>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-service-history
      legend="About this service period"
      size="lg"
      name="service"
      required
    ></civ-service-history>
  `,
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => html`
    <civ-service-history
      legend="About this service period"
      size="lg"
      name="service"
      required
      branch-error="Select a branch of service"
      start-date-error="Enter your service start date"
      discharge-error="Select your character of service"
    ></civ-service-history>
  `,
};

export const InRepeater: Story = {
  name: 'Usage: In Repeater',
  render: () => html`
    <civ-repeater
      legend="Service periods"
      size="lg"
      name="servicePeriods"
      item-label="service period"
      min="1"
      max="20"
    >
      <civ-service-history name="period"></civ-service-history>
    </civ-repeater>
  `,
};
