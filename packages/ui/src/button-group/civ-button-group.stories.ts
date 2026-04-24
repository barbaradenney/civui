import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-button-group.js';
import '../action-button/civ-action-button.js';

const meta: Meta = {
  title: 'UI/Button Group',
  component: 'civ-button-group',
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Bold"></civ-action-button>
      <civ-action-button label="Italic"></civ-action-button>
      <civ-action-button label="Underline"></civ-action-button>
    </civ-button-group>
  `,
};

export const Vertical: Story = {
  name: 'Vertical Group',
  render: () => html`
    <civ-button-group orientation="vertical">
      <civ-action-button label="Option 1"></civ-action-button>
      <civ-action-button label="Option 2"></civ-action-button>
      <civ-action-button label="Option 3"></civ-action-button>
    </civ-button-group>
  `,
};

export const WithPressed: Story = {
  name: 'With Pressed State',
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Left"></civ-action-button>
      <civ-action-button label="Center" pressed></civ-action-button>
      <civ-action-button label="Right"></civ-action-button>
    </civ-button-group>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div class="civ-flex civ-gap-6 civ-items-start">
      <civ-button-group>
        <civ-action-button label="One" variant="primary"></civ-action-button>
        <civ-action-button label="Two" variant="primary"></civ-action-button>
        <civ-action-button label="Three" variant="primary"></civ-action-button>
      </civ-button-group>

      <civ-button-group>
        <civ-action-button label="One" variant="secondary"></civ-action-button>
        <civ-action-button label="Two" variant="secondary"></civ-action-button>
        <civ-action-button label="Three" variant="secondary"></civ-action-button>
      </civ-button-group>

      <civ-button-group>
        <civ-action-button label="One" variant="tertiary"></civ-action-button>
        <civ-action-button label="Two" variant="tertiary"></civ-action-button>
        <civ-action-button label="Three" variant="tertiary"></civ-action-button>
      </civ-button-group>
    </div>
  `,
};
