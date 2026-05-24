import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/inputs';
import '@civui/actions/button';
import '@civui/feedback/alert';

const meta: Meta = {
  title: 'Foundations/Dark Mode',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
CivUI activates dark mode automatically when the user's OS preference is
\`prefers-color-scheme: dark\`. The previews below force light and dark
palettes side-by-side via inline \`color-scheme\` + manual token
overrides so you can compare them without changing your system setting.

To preview the live dark palette: macOS System Settings → Appearance,
Windows Settings → Personalization → Colors, or Chrome DevTools →
Rendering → Emulate CSS media feature \`prefers-color-scheme: dark\`.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const surfaceStyle = (mode: 'light' | 'dark') =>
  `padding: var(--civ-spacing-4); border-radius: var(--civ-border-radius-md); background: var(--civ-color-base-lightest); color: var(--civ-color-base-darkest); color-scheme: ${mode};`;

const darkPanelStyle = `
  --civ-color-base-lightest: #1b1b1b;
  --civ-color-base-lighter: #2c2c2c;
  --civ-color-base-light: #555;
  --civ-color-base: #888;
  --civ-color-base-dark: #cbcbcb;
  --civ-color-base-darker: #e6e6e6;
  --civ-color-base-darkest: #f0f0f0;
  --civ-color-primary: #73b3e7;
  --civ-color-primary-dark: #5b9bce;
  --civ-color-primary-darker: #3d7fb4;
  --civ-color-primary-light: #a8d4f5;
  --civ-color-primary-lighter: #d0e6fa;
  --civ-color-error: #f28b82;
  --civ-color-error-lighter: #4a1f1c;
  --civ-color-success: #5cb85c;
  --civ-color-warning: #f4d03f;
  --civ-color-info: #93c5fd;
`;

export const SideBySide: Story = {
  name: 'Light vs. dark — side-by-side',
  render: () => html`
    <div
      class="civ-grid civ-gap-4"
      style="grid-template-columns: 1fr 1fr; align-items: start;"
    >
      <div style="${surfaceStyle('light')}">
        <p class="civ-text-caption civ-mb-2">Light (default)</p>
        <civ-text-input
          label="Email address"
          name="email-light"
          type="email"
          hint="Work email preferred"
        ></civ-text-input>
        <civ-button label="Continue" class="civ-mt-3"></civ-button>
      </div>
      <div style="${surfaceStyle('dark')} ${darkPanelStyle}">
        <p class="civ-text-caption civ-mb-2">Dark</p>
        <civ-text-input
          label="Email address"
          name="email-dark"
          type="email"
          hint="Work email preferred"
        ></civ-text-input>
        <civ-button label="Continue" class="civ-mt-3"></civ-button>
      </div>
    </div>
  `,
};

export const PaletteComparison: Story = {
  name: 'Palette — semantic tokens compared',
  render: () => {
    const tokens = [
      { name: 'primary', light: '#005ea2', dark: '#73b3e7' },
      { name: 'error', light: '#b50909', dark: '#f28b82' },
      { name: 'success', light: '#00a91c', dark: '#5cb85c' },
      { name: 'warning', light: '#facc15', dark: '#f4d03f' },
      { name: 'info', light: '#3b82f6', dark: '#93c5fd' },
      { name: 'base-darkest (text)', light: '#1b1b1b', dark: '#f0f0f0' },
      { name: 'base-lightest (bg)', light: '#f0f0f0', dark: '#1b1b1b' },
    ];
    return html`
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: start; padding: var(--civ-spacing-2);">Token</th>
            <th style="text-align: start; padding: var(--civ-spacing-2);">Light</th>
            <th style="text-align: start; padding: var(--civ-spacing-2);">Dark</th>
          </tr>
        </thead>
        <tbody>
          ${tokens.map(
            (t) => html`
              <tr>
                <td style="padding: var(--civ-spacing-2);">
                  <code>${t.name}</code>
                </td>
                <td style="padding: var(--civ-spacing-2);">
                  <span
                    class="civ-flex civ-items-center civ-gap-2"
                  >
                    <span
                      style="display: inline-block; width: 24px; height: 24px; border-radius: 4px; background: ${t.light}; border: 1px solid #ccc;"
                    ></span>
                    <code>${t.light}</code>
                  </span>
                </td>
                <td style="padding: var(--civ-spacing-2);">
                  <span
                    class="civ-flex civ-items-center civ-gap-2"
                  >
                    <span
                      style="display: inline-block; width: 24px; height: 24px; border-radius: 4px; background: ${t.dark}; border: 1px solid #ccc;"
                    ></span>
                    <code>${t.dark}</code>
                  </span>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  },
};

export const ComponentsInDark: Story = {
  name: 'Components — dark palette preview',
  render: () => html`
    <div style="${surfaceStyle('dark')} ${darkPanelStyle}">
      <h2 class="civ-heading-lg">Apply for benefits</h2>
      <p class="civ-mb-4">Complete the form below to apply.</p>
      <civ-text-input
        label="Full name"
        name="name"
        required
        class="civ-mb-3"
      ></civ-text-input>
      <civ-radio-group
        legend="Preferred contact method"
        name="contact"
        class="civ-mb-3"
      >
        <civ-radio value="email" label="Email"></civ-radio>
        <civ-radio value="phone" label="Phone"></civ-radio>
      </civ-radio-group>
      <civ-alert
        intent="error"
        heading="Sign-in failed"
        class="civ-mb-3"
      >
        Your username or password didn't match. Try again.
      </civ-alert>
      <civ-alert intent="success" heading="Application saved">
        We've saved your progress. You can return anytime.
      </civ-alert>
      <div class="civ-button-row civ-mt-3">
        <civ-button label="Save and continue"></civ-button>
        <civ-button variant="secondary" label="Save draft"></civ-button>
      </div>
    </div>
  `,
};
