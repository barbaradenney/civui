import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-button-group.js';
import '@civui/actions/action-button';

const meta: Meta = {
  title: 'Layout/Button Group',
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
  render: () => html`
    <div class="civ-flex civ-gap-6 civ-items-start">
      <civ-button-group>
        <civ-action-button label="One" emphasis="primary"></civ-action-button>
        <civ-action-button label="Two" emphasis="primary"></civ-action-button>
        <civ-action-button label="Three" emphasis="primary"></civ-action-button>
      </civ-button-group>

      <civ-button-group>
        <civ-action-button label="One" emphasis="secondary"></civ-action-button>
        <civ-action-button label="Two" emphasis="secondary"></civ-action-button>
        <civ-action-button label="Three" emphasis="secondary"></civ-action-button>
      </civ-button-group>

      <civ-button-group>
        <civ-action-button label="One" emphasis="tertiary"></civ-action-button>
        <civ-action-button label="Two" emphasis="tertiary"></civ-action-button>
        <civ-action-button label="Three" emphasis="tertiary"></civ-action-button>
      </civ-button-group>
    </div>
  `,
};

export const WithOverflow: Story = {
  name: 'With overflow',
  parameters: {
    docs: {
      description: {
        story:
          'When the toolbar is narrower than the sum of its buttons, trailing buttons collapse into a "More" popover (composed from `civ-popover`). The hidden originals stay in the DOM so author-attached click handlers fire when the proxy is clicked. Resize the container to see overflow re-pack live.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 280px; border: 1px dashed var(--civ-color-base-light); padding: 8px;">
      <civ-button-group label="Row actions" allow-overflow>
        <civ-action-button label="Edit" icon-start="edit"></civ-action-button>
        <civ-action-button label="Duplicate" icon-start="content-copy"></civ-action-button>
        <civ-action-button label="Move" icon-start="open-with"></civ-action-button>
        <civ-action-button label="Archive" icon-start="archive"></civ-action-button>
        <civ-action-button label="Remove" icon-start="delete"></civ-action-button>
      </civ-button-group>
    </div>
  `,
};

export const WithOverflowAndDisabled: Story = {
  name: 'Overflow respects disabled state',
  render: () => html`
    <div style="max-width: 280px; border: 1px dashed var(--civ-color-base-light); padding: 8px;">
      <civ-button-group label="Row actions" allow-overflow>
        <civ-action-button label="Edit" icon-start="edit"></civ-action-button>
        <civ-action-button label="Duplicate" icon-start="content-copy"></civ-action-button>
        <civ-action-button label="Archive" icon-start="archive" disabled></civ-action-button>
        <civ-action-button label="Remove" icon-start="delete"></civ-action-button>
      </civ-button-group>
    </div>
  `,
};
