import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-input-group.js';
import '@civui/actions/action-button';
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
        <civ-form-field label="Search">
          <civ-text-input name="search"></civ-text-input>
        </civ-form-field>
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
        <civ-form-field label="Amount">
          <civ-text-input name="amount"></civ-text-input>
        </civ-form-field>
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
        <civ-form-field label="Quantity">
          <civ-text-input name="qty" value="1" width="xs"></civ-text-input>
        </civ-form-field>
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
        <civ-form-field label="State">
          <civ-select name="state"></civ-select>
        </civ-form-field>
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
        <civ-form-field label="Primary">
          <civ-text-input name="a"></civ-text-input>
        </civ-form-field>
        <civ-action-button label="Go" variant="primary"></civ-action-button>
      </civ-input-group>

      <civ-input-group>
        <civ-form-field label="Secondary">
          <civ-text-input name="b"></civ-text-input>
        </civ-form-field>
        <civ-action-button label="Go" variant="secondary"></civ-action-button>
      </civ-input-group>

      <civ-input-group>
        <civ-form-field label="Tertiary">
          <civ-text-input name="c"></civ-text-input>
        </civ-form-field>
        <civ-action-button label="Go" variant="tertiary"></civ-action-button>
      </civ-input-group>
    </div>
  `,
};
