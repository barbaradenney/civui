import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-button.js';

const meta: Meta = {
  title: 'Actions/Button',
  component: 'civ-button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    emphasis: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    danger: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    disabled: { control: 'boolean' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Continue',
    emphasis: 'primary',
    type: 'button',
    disabled: false,
    danger: false,
  },
  render: (args) => html`
    <civ-button
      label="${args.label}"
      emphasis="${args.emphasis}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?danger="${args.danger}"
    ></civ-button>
  `,
};

export const Primary: Story = {
  render: () => html`
    <civ-button emphasis="primary">Submit application</civ-button>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <civ-button emphasis="secondary">Save and continue later</civ-button>
  `,
};

export const Tertiary: Story = {
  render: () => html`
    <civ-button emphasis="tertiary">Cancel</civ-button>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Standard</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Primary</civ-button>
          <civ-button emphasis="secondary">Secondary</civ-button>
          <civ-button emphasis="tertiary">Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Danger</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary" danger>Primary</civ-button>
          <civ-button emphasis="secondary" danger>Secondary</civ-button>
          <civ-button emphasis="tertiary" danger>Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary" disabled>Primary</civ-button>
          <civ-button emphasis="secondary" disabled>Secondary</civ-button>
          <civ-button emphasis="tertiary" disabled>Tertiary</civ-button>
        </div>
      </div>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button emphasis="primary" danger>Delete account</civ-button>
      <civ-button emphasis="secondary" danger>Remove dependent</civ-button>
      <civ-button emphasis="tertiary" danger>Cancel claim</civ-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button disabled>Disabled primary</civ-button>
      <civ-button emphasis="secondary" disabled>Disabled secondary</civ-button>
      <civ-button emphasis="tertiary" disabled>Disabled tertiary</civ-button>
      <civ-button emphasis="primary" danger disabled>Disabled danger</civ-button>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
      <civ-button icon-start="download">Download</civ-button>
      <civ-button icon-end="arrow-right" emphasis="primary">Continue</civ-button>
      <civ-button icon-start="edit" emphasis="secondary">Edit</civ-button>
      <civ-button icon-start="print" icon-end="external-link" emphasis="tertiary">Print form</civ-button>
      <civ-button icon-start="trash" emphasis="primary" danger>Delete</civ-button>
    </div>
  `,
};

export const Loading: Story = {
  name: 'Loading state',
  parameters: {
    docs: {
      description: {
        story:
          'Async-submit state. Set `loading` to swap the label for a `civ-spinner`, set `aria-busy="true"`, force the inert/disabled state, and swap the accessible name to `loading-label` so AT users hear the in-flight verb ("Submitting…") instead of the stale label. Use a present-participle verb specific to the action. `loading` is suppressed in link mode (`href`) since navigation isn\'t a state we wait on.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button loading loading-label="Submitting…">Submit application</civ-button>
      <civ-button emphasis="secondary" loading loading-label="Saving…">Save and continue</civ-button>
      <civ-button emphasis="primary" danger loading loading-label="Deleting…">Delete account</civ-button>
    </div>
  `,
};

export const IconOnly: Story = {
  name: 'Icon only',
  parameters: {
    docs: {
      description: {
        story:
          'Set `icon-only` to render the label visually hidden so only the icon shows — for square icon buttons (compact toolbar actions, kebab triggers). The label still provides the accessible name, so always pass one (a dev warning fires if an icon-only button has no name). Requires at least one of `icon-start` / `icon-end`.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button icon-only icon-start="edit">Edit</civ-button>
      <civ-button icon-only icon-start="share" emphasis="secondary">Share</civ-button>
      <civ-button icon-only icon-start="more-vert" emphasis="tertiary">More options</civ-button>
      <civ-button icon-only icon-start="trash" emphasis="primary" danger>Delete</civ-button>
    </div>
  `,
};

export const AsLink: Story = {
  name: 'As Link (with href)',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <p class="civ-m-0 civ-text-sm">
        Setting <code>href</code> makes <code>civ-button</code> render as an
        <code>&lt;a&gt;</code> with the same button chrome, plus an underline so the
        link identity stays visible. Right-click "open in new tab", back-button
        history, and screen-reader role all behave as a real link.
      </p>
      <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
        <civ-button href="/dependents/new" emphasis="primary">Add dependent</civ-button>
        <civ-button href="/forms/21-526ez" emphasis="secondary" icon-start="plus">Start new claim</civ-button>
        <civ-button href="/help" emphasis="tertiary">Get help</civ-button>
      </div>
      <p class="civ-m-0 civ-text-sm">External links — pair with <code>new-tab</code> for the standard "open in new tab" treatment.</p>
      <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
        <civ-button href="https://www.va.gov" emphasis="secondary" new-tab>VA.gov</civ-button>
        <civ-button href="https://www.benefits.va.gov" emphasis="tertiary" new-tab icon-end="external-link">Benefits site</civ-button>
      </div>
    </div>
  `,
};

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Submit</civ-button>
          <civ-button emphasis="secondary">Save</civ-button>
          <civ-button emphasis="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Submit</civ-button>
          <civ-button emphasis="secondary">Save</civ-button>
          <civ-button emphasis="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Submit</civ-button>
          <civ-button emphasis="secondary">Save</civ-button>
          <civ-button emphasis="tertiary">Cancel</civ-button>
        </div>
      </div>
    </div>
  `,
};

export const FormActions: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        alert('Form submitted!');
      }}"
    >
      <p class="civ-mb-4">Complete your VA benefits application and submit for review.</p>
      <div class="civ-button-row">
        <civ-button type="submit">Submit application</civ-button>
        <civ-button emphasis="secondary">Save and continue later</civ-button>
        <civ-button emphasis="tertiary">Cancel</civ-button>
      </div>
    </form>
  `,
};

export const FormActionsMobile: Story = {
  name: 'Form Actions (mobile)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => html`
    <p class="civ-mb-4 civ-text-sm">
      Below 481px viewports, <code>.civ-button-row</code> stacks the cluster vertically so
      every button picks up the design system's full-width-on-mobile rule. Compare to plain
      <code>civ-flex civ-gap-3</code>, which keeps the row horizontal at every width and
      shrinks each button to its share of the row.
    </p>
    <div class="civ-button-row">
      <civ-button>Save and continue</civ-button>
      <civ-button emphasis="tertiary">Back</civ-button>
    </div>
  `,
};

export const FormActionsLongLabels: Story = {
  name: 'Form Actions (long labels — auto-stack in narrow containers)',
  parameters: {
    docs: {
      description: {
        story: `Government button labels can be long ("Save this draft and
continue to the next page", "Go back to the previous step"). When
side-by-side, one button wraps to two lines while the sibling stays
single-line, and the heights mismatch.

\`.civ-button-row\` uses a container query so when its own width
drops below ~30rem (narrow modals, drawers, side panels, narrow
chapter columns), every button stretches to full width and wraps
onto its own row. The viewport-driven mobile stack still applies
on phones; this catches the narrow-container case on every viewport.

Opt out with \`civ-button-row--no-stack\` if you have a design that
needs side-by-side buttons even in narrow contexts.`,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-mb-2 civ-text-sm civ-font-semibold">In a wide container (1000px)</p>
        <div style="max-width: 1000px;">
          <div class="civ-button-row">
            <civ-button label="Save this draft and continue"></civ-button>
            <civ-button emphasis="tertiary" label="Go back to the previous step"></civ-button>
          </div>
        </div>
      </div>
      <div>
        <p class="civ-mb-2 civ-text-sm civ-font-semibold">In a narrow container (380px) — auto-stacks</p>
        <div style="max-width: 380px;">
          <div class="civ-button-row">
            <civ-button label="Save this draft and continue"></civ-button>
            <civ-button emphasis="tertiary" label="Go back to the previous step"></civ-button>
          </div>
        </div>
      </div>
      <div>
        <p class="civ-mb-2 civ-text-sm civ-font-semibold">Narrow container + <code>--no-stack</code> — stays side-by-side, equal share</p>
        <div style="max-width: 380px;">
          <div class="civ-button-row civ-button-row--no-stack">
            <civ-button label="Save this draft and continue"></civ-button>
            <civ-button emphasis="tertiary" label="Go back to the previous step"></civ-button>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const ClaimActions: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Upload evidence</p>
        <div class="civ-button-row">
          <civ-button emphasis="primary">Upload documents</civ-button>
          <civ-button emphasis="tertiary">Skip for now</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Manage dependents</p>
        <div class="civ-button-row">
          <civ-button emphasis="secondary">Add dependent</civ-button>
          <civ-button emphasis="tertiary" danger>Remove dependent</civ-button>
        </div>
      </div>
    </div>
  `,
};
