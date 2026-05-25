import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-input-group.js';
import '@civui/actions/action-button';
import '@civui/inputs';

const meta: Meta = {
  title: 'Layout/Input Group',
  component: 'civ-input-group',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Default — search (input + button)',
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-text-input label="Search" name="search"></civ-text-input>
        <civ-action-button label="Search" emphasis="primary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};

export const ButtonOnLeft: Story = {
  name: 'Button on Left',
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-action-button label="$" emphasis="tertiary"></civ-action-button>
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
        <civ-action-button label="-" emphasis="tertiary"></civ-action-button>
        <civ-text-input label="Quantity" name="qty" value="1" width="xs"></civ-text-input>
        <civ-action-button label="+" emphasis="tertiary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};

export const WithSelect: Story = {
  render: () => html`
    <div class="civ-max-w-sm">
      <civ-input-group>
        <civ-select label="State" name="state"></civ-select>
        <civ-action-button label="Lookup" emphasis="secondary"></civ-action-button>
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
        <civ-action-button label="Go" emphasis="primary"></civ-action-button>
      </civ-input-group>

      <civ-input-group>
        <civ-text-input label="Secondary" name="b"></civ-text-input>
        <civ-action-button label="Go" emphasis="secondary"></civ-action-button>
      </civ-input-group>

      <civ-input-group>
        <civ-text-input label="Tertiary" name="c"></civ-text-input>
        <civ-action-button label="Go" emphasis="tertiary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};
