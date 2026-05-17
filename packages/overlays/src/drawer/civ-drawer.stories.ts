import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-drawer.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Overlays/Drawer',
  component: 'civ-drawer',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const open = (root: HTMLElement) => {
  const drawer = root.querySelector('civ-drawer') as any;
  drawer.open = true;
};
const close = (root: HTMLElement) => {
  const drawer = root.querySelector('civ-drawer') as any;
  drawer.open = false;
};

export const Default: Story = {
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Open drawer (start)"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        heading="Filter results"
        position="start"
        @civ-drawer-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">Narrow your results by category. Slides in from the leading edge of the viewport.</p>
        <civ-button label="Apply filters"></civ-button>
      </civ-drawer>
    </div>
  `,
};

export const EndAnchored: Story = {
  name: 'End-anchored (settings panel)',
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Open settings"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        heading="Display settings"
        position="end"
        width="360px"
        @civ-drawer-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <div class="civ-flex civ-flex-col civ-gap-4">
          <civ-toggle label="Dark mode"></civ-toggle>
          <civ-toggle label="High contrast"></civ-toggle>
          <civ-toggle label="Reduce motion"></civ-toggle>
        </div>
      </civ-drawer>
    </div>
  `,
};

export const MainMenu: Story = {
  name: 'Usage: Mobile main menu',
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Open menu"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        label="Main menu"
        position="start"
        @civ-drawer-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <nav aria-label="Main">
          <ul class="civ-list-reset civ-flex civ-flex-col civ-gap-2">
            <li><civ-link href="#home">Home</civ-link></li>
            <li><civ-link href="#benefits">Benefits</civ-link></li>
            <li><civ-link href="#claims">Claims</civ-link></li>
            <li><civ-link href="#documents">My documents</civ-link></li>
            <li><civ-link href="#account">Account settings</civ-link></li>
          </ul>
        </nav>
      </civ-drawer>
    </div>
  `,
};

export const NoCloseAffordance: Story = {
  name: 'Custom dismiss (no built-in close)',
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Open"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        heading="Edit profile"
        position="end"
        no-close-button
        @civ-drawer-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">Drawer renders no built-in close button — consumer footer provides the dismiss action.</p>
        <div class="civ-flex civ-gap-2 civ-mt-4">
          <civ-button
            variant="secondary"
            label="Cancel"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
          <civ-button
            label="Save"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
        </div>
      </civ-drawer>
    </div>
  `,
};
