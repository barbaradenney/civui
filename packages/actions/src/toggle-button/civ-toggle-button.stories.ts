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
