import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-confirm-button.js';

const meta: Meta = {
  title: 'Actions/Confirm Button',
  component: 'civ-confirm-button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Text button that fires an action and shows a transient ✓ confirmation before reverting. Use for fire-and-forget actions whose feedback should appear inline without yanking the user to a toast — Copy, Paste, Scan, Generate. For toggleable two-state controls (Show / Hide password) use civ-toggle-button.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-confirm-button
      label="Copy"
      success-label="Copied"
      @civ-confirm=${() => navigator.clipboard?.writeText('sample value')}
    ></civ-confirm-button>
  `,
};

export const Tertiary: Story = {
  name: 'Tertiary emphasis (transparent text-link style)',
  render: () => html`
    <civ-confirm-button
      emphasis="tertiary"
      label="Copy"
      success-label="Copied"
      @civ-confirm=${() => navigator.clipboard?.writeText('sample value')}
    ></civ-confirm-button>
  `,
};

export const Emphasis: Story = {
  name: 'Emphasis — secondary / primary / tertiary',
  parameters: {
    docs: {
      description: {
        story:
          'Three emphasis levels via the `emphasis` prop. `secondary` (default) is the gray pill — the common case. `primary` is the filled brand pill for a louder inline CTA. `tertiary` is the transparent text-link style. (The legacy `variant="chip|inline"` prop is deprecated — use `emphasis`.)',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-confirm-button emphasis="secondary" label="Copy" success-label="Copied" @civ-confirm=${() => {}}></civ-confirm-button>
      <civ-confirm-button emphasis="primary" label="Generate token" success-label="Generated" @civ-confirm=${() => {}}></civ-confirm-button>
      <civ-confirm-button emphasis="tertiary" label="Copy link" success-label="Copied" @civ-confirm=${() => {}}></civ-confirm-button>
    </div>
  `,
};

export const CustomDuration: Story = {
  name: 'Custom duration (3 s)',
  render: () => html`
    <civ-confirm-button
      label="Generate token"
      success-label="Generated"
      success-ms="3000"
      @civ-confirm=${() => {}}
    ></civ-confirm-button>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-confirm-button label="Copy" disabled></civ-confirm-button>
  `,
};

export const InHelperRow: Story = {
  name: 'Inside an input helper row (typical usage)',
  render: () => html`
    <div style="max-width: 24rem;">
      <label class="civ-label" for="api-key-demo">API key</label>
      <div class="civ-input-icon-wrap"><input id="api-key-demo" class="civ-input" value="sk-abc123def456" readonly /></div>
      <div class="civ-input-helper-row">
        <civ-confirm-button
          label="Copy"
          success-label="Copied"
          @civ-confirm=${(e: Event) => {
            const input = (e.currentTarget as HTMLElement)
              .closest('div.civ-input-helper-row')
              ?.previousElementSibling
              ?.querySelector('input');
            if (input) navigator.clipboard?.writeText(input.value);
          }}
        ></civ-confirm-button>
      </div>
    </div>
    <p class="civ-mt-3 civ-text-sm">
      Most common shape: <code>&lt;civ-confirm-button&gt;</code> sits inside an <code>.civ-input-helper-row</code> directly below the input. The chip's padding stays stable across the success swap — no visual jump.
    </p>
  `,
};
