import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-action-button.js';
import '@civui/layout/button-group';

const meta: Meta = {
  title: 'Actions/Action Button',
  component: 'civ-action-button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
    spacing: { control: 'select', options: ['default', 'sm'] },
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
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-items-center">
      <civ-action-button label="Primary" variant="primary"></civ-action-button>
      <civ-action-button label="Secondary" variant="secondary"></civ-action-button>
      <civ-action-button label="Tertiary" variant="tertiary"></civ-action-button>
    </div>
  `,
};

export const Spacing: Story = {
  name: 'Spacing — default vs sm',
  parameters: {
    docs: {
      description: {
        story:
          '`spacing="sm"` shrinks padding, min-height, and font-size so the button sits flush next to `civ-input--sm` in dense surfaces like data-grid cell editors and compact input-groups.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">spacing="default"</p>
        <div class="civ-flex civ-gap-2 civ-items-center">
          <civ-action-button label="Edit" variant="tertiary"></civ-action-button>
          <civ-action-button label="Save" variant="primary"></civ-action-button>
          <civ-action-button label="Remove" variant="tertiary" danger></civ-action-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">spacing="sm"</p>
        <div class="civ-flex civ-gap-2 civ-items-center">
          <civ-action-button label="Edit" variant="tertiary" spacing="sm"></civ-action-button>
          <civ-action-button label="Save" variant="primary" spacing="sm"></civ-action-button>
          <civ-action-button label="Remove" variant="tertiary" danger spacing="sm"></civ-action-button>
        </div>
      </div>
    </div>
  `,
};

export const Pressed: Story = {
  name: 'Toggle (Pressed)',
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-items-center">
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
    <div class="civ-flex civ-gap-6 civ-items-start">
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
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-items-center">
      <civ-action-button label="Delete" variant="primary" danger></civ-action-button>
      <civ-action-button label="Remove" variant="secondary" danger></civ-action-button>
      <civ-action-button label="Cancel" variant="tertiary" danger></civ-action-button>
    </div>
  `,
};

export const DangerButtonGroup: Story = {
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Keep" variant="tertiary"></civ-action-button>
      <civ-action-button label="Remove" variant="tertiary" danger></civ-action-button>
    </civ-button-group>
  `,
};

export const AsLink: Story = {
  name: 'As Link (with href)',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <p class="civ-m-0 civ-text-sm">
        Setting <code>href</code> renders an <code>&lt;a&gt;</code> with action-
        button chrome plus an underline. Useful in list rows where the Edit
        affordance navigates to a route while Remove stays an in-page action —
        same visual weight, different semantics under the hood.
      </p>
      <div class="civ-card">
        <div class="civ-list-item">
          <span class="civ-list-item__content civ-font-medium">Alex Chen</span>
          <span class="civ-list-item__actions">
            <civ-action-button href="/dependents/1/edit" variant="tertiary" label="Edit"></civ-action-button>
            <civ-action-button variant="tertiary" danger label="Remove"></civ-action-button>
          </span>
        </div>
        <div class="civ-list-item">
          <span class="civ-list-item__content civ-font-medium">Jordan Lee</span>
          <span class="civ-list-item__actions">
            <civ-action-button href="/dependents/2/edit" variant="tertiary" label="Edit"></civ-action-button>
            <civ-action-button variant="tertiary" danger label="Remove"></civ-action-button>
          </span>
        </div>
      </div>
      <p class="civ-m-0 civ-text-sm">
        Underline tells a sighted reader at a glance which affordance navigates.
        Screen readers hear the role as "link" vs "button" via the rendered
        element.
      </p>
    </div>
  `,
};
