import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-input-group.js';
import '../action-button/civ-action-button.js';
import '@civui/inputs';

const meta: Meta = {
  title: 'UI/Input Group',
  component: 'civ-input-group',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Search (Input + Button)',
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-text-input label="Search" name="search"></civ-text-input>
        <civ-action-button label="Search" variant="primary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};

export const ButtonOnLeft: Story = {
  name: 'Button on Left',
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-action-button label="$" variant="tertiary"></civ-action-button>
        <civ-text-input label="Amount" name="amount"></civ-text-input>
      </civ-input-group>
    </div>
  `,
};

export const ButtonsBothSides: Story = {
  name: 'Buttons on Both Sides',
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-action-button label="-" variant="tertiary"></civ-action-button>
        <civ-text-input label="Quantity" name="qty" value="1" width="xs"></civ-text-input>
        <civ-action-button label="+" variant="tertiary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};

export const WithSelect: Story = {
  name: 'With Select',
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-select label="State" name="state"></civ-select>
        <civ-action-button label="Lookup" variant="secondary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};

export const AllVariants: Story = {
  name: 'Button Variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-sm">
      <civ-input-group>
        <civ-text-input label="Primary" name="a"></civ-text-input>
        <civ-action-button label="Go" variant="primary"></civ-action-button>
      </civ-input-group>

      <civ-input-group>
        <civ-text-input label="Secondary" name="b"></civ-text-input>
        <civ-action-button label="Go" variant="secondary"></civ-action-button>
      </civ-input-group>

      <civ-input-group>
        <civ-text-input label="Tertiary" name="c"></civ-text-input>
        <civ-action-button label="Go" variant="tertiary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};
