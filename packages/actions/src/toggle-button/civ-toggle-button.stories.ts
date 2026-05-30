import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-toggle-button.js';

const meta: Meta = {
  title: 'Actions/Toggle Button',
  component: 'civ-toggle-button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Text button with two persistent labels and an aria-pressed state. Click flips the label and the pressed flag. Use for show/hide toggles where each state has a clear name — password reveal, mute/unmute, expand/collapse a custom surface. For fire-and-forget actions with transient feedback see the Confirm Button component; for native disclosure use civ-disclosure.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>
  `,
};

export const Secondary: Story = {
  name: 'Secondary emphasis (prominent gray pill)',
  render: () => html`
    <civ-toggle-button emphasis="secondary" label="Show details" pressed-label="Hide details"></civ-toggle-button>
  `,
};

export const Emphasis: Story = {
  name: 'Emphasis — secondary / primary / tertiary',
  parameters: {
    docs: {
      description: {
        story:
          'Three emphasis levels via the `emphasis` prop. `secondary` (default) is the gray pill — the common case. `primary` is the filled brand pill. `tertiary` is the transparent text-link style for a quiet toggle. (The legacy `variant="chip|inline"` prop is deprecated — use `emphasis`.)',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-toggle-button emphasis="secondary" label="Show details" pressed-label="Hide details"></civ-toggle-button>
      <civ-toggle-button emphasis="primary" label="Show details" pressed-label="Hide details"></civ-toggle-button>
      <civ-toggle-button emphasis="tertiary" label="Show details" pressed-label="Hide details"></civ-toggle-button>
    </div>
  `,
};

export const WithIcon: Story = {
  name: 'With leading icon',
  parameters: {
    docs: {
      description: {
        story:
          'Pass `icon-start` for an optional leading glyph — e.g. a `chevron-down` on an "expand all / collapse all" toggle. The icon is `aria-hidden`, so the label / pressed-label remains the accessible name.',
      },
    },
  },
  render: () => html`
    <civ-toggle-button
      icon-start="chevron-down"
      label="Expand all"
      pressed-label="Collapse all"
    ></civ-toggle-button>
  `,
};

export const Pressed: Story = {
  name: 'Pre-pressed state',
  render: () => html`
    <civ-toggle-button label="Show" pressed-label="Hide" pressed></civ-toggle-button>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-toggle-button label="Show" pressed-label="Hide" disabled></civ-toggle-button>
  `,
};

export const PasswordRevealPattern: Story = {
  name: 'Password reveal (typical usage)',
  render: () => html`
    <div style="max-width: 24rem;">
      <label class="civ-label" for="pw-demo">Password</label>
      <div class="civ-input-icon-wrap">
        <input id="pw-demo" type="password" class="civ-input civ-input-with-trailing-reveal" value="hunter2-supersecret" />
        <civ-toggle-button
          label="Show"
          pressed-label="Hide"
          @civ-toggle=${(e: CustomEvent<{ pressed: boolean }>) => {
            const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement | null;
            if (input) input.type = e.detail.pressed ? 'text' : 'password';
          }}
          style="position: absolute; inset-inline-end: 0.5rem; top: 50%; transform: translateY(-50%);"
        ></civ-toggle-button>
      </div>
    </div>
    <p class="civ-mt-3 civ-text-sm">
      The civ-text-input component uses this same toggle pattern internally when <code>reveal-password</code> is set — see the password-reveal story on the Text Input page. This story demonstrates the standalone usage outside of a CivUI input.
    </p>
  `,
};
