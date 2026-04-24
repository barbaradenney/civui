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
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
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
    <div style="display: flex; gap: 24px; align-items: start;">
      <civ-button-group orientation="vertical">
        <civ-action-button label="Option 1" variant="primary"></civ-action-button>
        <civ-action-button label="Option 2" variant="primary" pressed></civ-action-button>
        <civ-action-button label="Option 3" variant="primary"></civ-action-button>
      </civ-button-group>

      <civ-button-group orientation="vertical">
        <civ-action-button label="Option 1" variant="secondary"></civ-action-button>
        <civ-action-button label="Option 2" variant="secondary" pressed></civ-action-button>
        <civ-action-button label="Option 3" variant="secondary"></civ-action-button>
      </civ-button-group>

      <civ-button-group orientation="vertical">
        <civ-action-button label="Option 1" variant="tertiary"></civ-action-button>
        <civ-action-button label="Option 2" variant="tertiary" pressed></civ-action-button>
        <civ-action-button label="Option 3" variant="tertiary"></civ-action-button>
      </civ-button-group>
    </div>
  `,
};

export const DangerVariants: Story = {
  name: 'Danger Variants',
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <civ-action-button label="Delete" variant="primary" danger></civ-action-button>
      <civ-action-button label="Remove" variant="secondary" danger></civ-action-button>
      <civ-action-button label="Cancel" variant="tertiary" danger></civ-action-button>
    </div>
  `,
};

export const DangerButtonGroup: Story = {
  name: 'Danger Button Group',
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Keep" variant="tertiary"></civ-action-button>
      <civ-action-button label="Remove" variant="tertiary" danger></civ-action-button>
    </civ-button-group>
  `,
};
