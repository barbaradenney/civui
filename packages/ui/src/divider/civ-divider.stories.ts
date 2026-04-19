import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-divider.js';

const meta: Meta = {
  title: 'UI/Divider',
  component: 'civ-divider',
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
    <p>Content above the divider</p>
    <civ-divider></civ-divider>
    <p>Content below the divider</p>
  `,
};

export const Small: Story = {
  render: () => html`
    <p>Tighter spacing</p>
    <civ-divider spacing="sm"></civ-divider>
    <p>Between items</p>
  `,
};

export const InContext: Story = {
  render: () => html`
    <h3>Section 1</h3>
    <p>Some content here.</p>
    <civ-divider></civ-divider>
    <h3>Section 2</h3>
    <p>More content here.</p>
    <civ-divider></civ-divider>
    <h3>Section 3</h3>
    <p>Final content.</p>
  `,
};
