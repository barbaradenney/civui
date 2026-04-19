import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-tag.js';

const meta: Meta = {
  title: 'UI/Tag',
  component: 'civ-tag',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: 'Status', variant: 'blue' },
  render: (args) => html`<civ-tag label="${args.label}" variant="${args.variant}"></civ-tag>`,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
      <civ-tag label="Not started" variant="blue"></civ-tag>
      <civ-tag label="In progress" variant="teal"></civ-tag>
      <civ-tag label="Complete" variant="green"></civ-tag>
      <civ-tag label="Warning" variant="yellow"></civ-tag>
      <civ-tag label="Urgent" variant="orange"></civ-tag>
      <civ-tag label="Error" variant="red"></civ-tag>
      <civ-tag label="Special" variant="purple"></civ-tag>
      <civ-tag label="Default" variant="gray"></civ-tag>
    </div>
  `,
};

export const Small: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
      <civ-tag label="Not started" variant="blue" size="sm"></civ-tag>
      <civ-tag label="In progress" variant="teal" size="sm"></civ-tag>
      <civ-tag label="Complete" variant="green" size="sm"></civ-tag>
      <civ-tag label="Error" variant="red" size="sm"></civ-tag>
    </div>
  `,
};

export const SizeComparison: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span>Default:</span>
        <civ-tag label="In progress" variant="teal"></civ-tag>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <span>Small:</span>
        <civ-tag label="In progress" variant="teal" size="sm"></civ-tag>
      </div>
    </div>
  `,
};
