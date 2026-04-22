import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-action-button.js';
import '../button-group/civ-button-group.js';

const meta: Meta = {
  title: 'UI/Action Button',
  component: 'civ-action-button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
    pressed: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-action-button label="Action"></civ-action-button>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <civ-action-button label="Primary" variant="primary"></civ-action-button>
      <civ-action-button label="Secondary" variant="secondary"></civ-action-button>
      <civ-action-button label="Tertiary" variant="tertiary"></civ-action-button>
    </div>
  `,
};

export const Pressed: Story = {
  name: 'Toggle (Pressed)',
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <civ-action-button label="Bold" pressed></civ-action-button>
      <civ-action-button label="Italic"></civ-action-button>
      <civ-action-button label="Underline"></civ-action-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-action-button label="Disabled" disabled></civ-action-button>
  `,
};

export const ButtonGroup: Story = {
  name: 'Button Group (Toolbar)',
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Bold"></civ-action-button>
      <civ-action-button label="Italic"></civ-action-button>
      <civ-action-button label="Underline"></civ-action-button>
    </civ-button-group>
  `,
};

export const ButtonGroupWithPressed: Story = {
  name: 'Button Group with Active Toggle',
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Left"></civ-action-button>
      <civ-action-button label="Center" pressed></civ-action-button>
      <civ-action-button label="Right"></civ-action-button>
    </civ-button-group>
  `,
};

export const ButtonGroupVertical: Story = {
  name: 'Vertical Button Group',
  render: () => html`
    <civ-button-group orientation="vertical">
      <civ-action-button label="Option 1"></civ-action-button>
      <civ-action-button label="Option 2" pressed></civ-action-button>
      <civ-action-button label="Option 3"></civ-action-button>
    </civ-button-group>
  `,
};
