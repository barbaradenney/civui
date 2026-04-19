import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-card.js';

const meta: Meta = {
  title: 'UI/Card',
  component: 'civ-card',
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-card>
      <h3>Card title</h3>
      <p>Card content with default padding and border.</p>
    </civ-card>
  `,
};

export const Small: Story = {
  render: () => html`
    <civ-card spacing="sm">
      <p>Compact card with less padding.</p>
    </civ-card>
  `,
};

export const Stacked: Story = {
  render: () => html`
    <civ-card>
      <h3>Dependent 1</h3>
      <p>Jane Doe, born January 15, 2010</p>
    </civ-card>
    <civ-card>
      <h3>Dependent 2</h3>
      <p>John Doe, born March 22, 2012</p>
    </civ-card>
  `,
};
