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
    emphasis: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
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
      <civ-action-button label="Primary" emphasis="primary"></civ-action-button>
      <civ-action-button label="Secondary" emphasis="secondary"></civ-action-button>
      <civ-action-button label="Tertiary" emphasis="tertiary"></civ-action-button>
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
          <civ-action-button label="Edit" emphasis="tertiary"></civ-action-button>
          <civ-action-button label="Save" emphasis="primary"></civ-action-button>
          <civ-action-button label="Remove" emphasis="tertiary" danger></civ-action-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">spacing="sm"</p>
        <div class="civ-flex civ-gap-2 civ-items-center">
          <civ-action-button label="Edit" emphasis="tertiary" spacing="sm"></civ-action-button>
          <civ-action-button label="Save" emphasis="primary" spacing="sm"></civ-action-button>
          <civ-action-button label="Remove" emphasis="tertiary" danger spacing="sm"></civ-action-button>
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

export const IconOnly: Story = {
  name: 'Icon only',
  parameters: {
    docs: {
      description: {
        story:
          'Set `icon-only` to render the `label` visually hidden so only the icon shows — the canonical compact toolbar / row-action shape. The `label` still provides the accessible name (always pass one). Requires `icon-start` or `icon-end`.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-items-center">
      <civ-action-button label="Edit" icon-start="edit" icon-only></civ-action-button>
      <civ-action-button label="Copy" icon-start="copy" icon-only></civ-action-button>
      <civ-action-button label="Print" icon-start="print" icon-only></civ-action-button>
      <civ-action-button label="More actions" icon-start="more-vert" icon-only></civ-action-button>
      <civ-action-button label="Delete" icon-start="trash" icon-only danger></civ-action-button>
    </div>
  `,
};

export const Current: Story = {
  name: 'Current item (aria-current)',
  parameters: {
    docs: {
      description: {
        story:
          'Set `current` to mark the active item in a navigation set — the current page in a pagination strip, the active step in a wizard. Renders `aria-current="page"` so AT users hear "current page". Distinct from `pressed` (toggle semantics via `aria-pressed`).',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-items-center" role="group" aria-label="Pagination">
      <civ-action-button label="1"></civ-action-button>
      <civ-action-button label="2"></civ-action-button>
      <civ-action-button label="3" current aria-label="Page 3, current page"></civ-action-button>
      <civ-action-button label="4"></civ-action-button>
      <civ-action-button label="5"></civ-action-button>
    </div>
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
        <civ-action-button label="Option 1" emphasis="primary"></civ-action-button>
        <civ-action-button label="Option 2" emphasis="primary" pressed></civ-action-button>
        <civ-action-button label="Option 3" emphasis="primary"></civ-action-button>
      </civ-button-group>

      <civ-button-group orientation="vertical">
        <civ-action-button label="Option 1" emphasis="secondary"></civ-action-button>
        <civ-action-button label="Option 2" emphasis="secondary" pressed></civ-action-button>
        <civ-action-button label="Option 3" emphasis="secondary"></civ-action-button>
      </civ-button-group>

      <civ-button-group orientation="vertical">
        <civ-action-button label="Option 1" emphasis="tertiary"></civ-action-button>
        <civ-action-button label="Option 2" emphasis="tertiary" pressed></civ-action-button>
        <civ-action-button label="Option 3" emphasis="tertiary"></civ-action-button>
      </civ-button-group>
    </div>
  `,
};

export const DangerVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-items-center">
      <civ-action-button label="Delete" emphasis="primary" danger></civ-action-button>
      <civ-action-button label="Remove" emphasis="secondary" danger></civ-action-button>
      <civ-action-button label="Cancel" emphasis="tertiary" danger></civ-action-button>
    </div>
  `,
};

export const DangerButtonGroup: Story = {
  render: () => html`
    <civ-button-group>
      <civ-action-button label="Keep" emphasis="tertiary"></civ-action-button>
      <civ-action-button label="Remove" emphasis="tertiary" danger></civ-action-button>
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
            <civ-action-button href="/dependents/1/edit" emphasis="tertiary" label="Edit"></civ-action-button>
            <civ-action-button emphasis="tertiary" danger label="Remove"></civ-action-button>
          </span>
        </div>
        <div class="civ-list-item">
          <span class="civ-list-item__content civ-font-medium">Jordan Lee</span>
          <span class="civ-list-item__actions">
            <civ-action-button href="/dependents/2/edit" emphasis="tertiary" label="Edit"></civ-action-button>
            <civ-action-button emphasis="tertiary" danger label="Remove"></civ-action-button>
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

export const Loading: Story = {
  name: 'Loading state',
  parameters: {
    docs: {
      description: {
        story:
          'Async-in-flight state for toolbar / row-action use cases (apply filter, refresh, archive selected). Swaps the leading icon for a `civ-spinner`, sets `aria-busy="true"`, disables the button, and swaps the accessible name to `loading-label` so AT users hear the busy verb ("Applying…") instead of the stale label. Use a present-participle verb specific to the action.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
      <civ-action-button label="Apply" emphasis="primary" loading loading-label="Applying…"></civ-action-button>
      <civ-action-button label="Refresh" emphasis="secondary" icon-start="refresh" loading loading-label="Refreshing…"></civ-action-button>
      <civ-action-button label="Archive" emphasis="tertiary" loading loading-label="Archiving 12 rows…"></civ-action-button>
    </div>
  `,
};
