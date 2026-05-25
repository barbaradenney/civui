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
        align="start"
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">Narrow your results by category. Slides in from the leading edge of the viewport.</p>
        <civ-button label="Apply filters"></civ-button>
      </civ-drawer>
    </div>
  `,
};

export const StickyFooter: Story = {
  name: 'Sticky footer with action buttons',
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Open drawer"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        heading="Filter results"
        align="end"
        width="380px"
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">Long content scrolls behind the sticky header and footer. Try scrolling — the action buttons stay pinned at the bottom.</p>
        ${Array.from({ length: 25 }, (_, i) => html`
          <civ-checkbox label="Category ${i + 1}"></civ-checkbox>
        `)}

        <div data-drawer-footer>
          <civ-button
            emphasis="secondary"
            label="Reset"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
          <civ-button
            label="Apply"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
        </div>
      </civ-drawer>
    </div>
  `,
};

export const NonStickyHeaderAndFooter: Story = {
  name: 'Non-sticky header and footer (scroll with content)',
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Open drawer"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        heading="Article preview"
        align="end"
        width="400px"
        no-sticky-header
        no-sticky-footer
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">Both header and footer scroll away with body content — useful for reading-mode drawers where you want the full viewport for content as the user reads.</p>
        ${Array.from({ length: 15 }, (_, i) => html`
          <p class="civ-text-body">Paragraph ${i + 1}. Long-form content that fills the drawer and demonstrates the non-sticky scroll behavior.</p>
        `)}

        <div data-drawer-footer>
          <civ-button
            label="Done reading"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
        </div>
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
        align="end"
        width="360px"
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
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
        align="start"
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
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
        align="end"
        no-close-button
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">Drawer renders no built-in close button — the sticky footer provides the dismiss action.</p>

        <div data-drawer-footer>
          <civ-button
            emphasis="secondary"
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

export const LongFooterLabels: Story = {
  name: 'Long footer button labels — auto-stack',
  parameters: {
    docs: {
      description: {
        story: `Drawers are typically narrow. Long government-form labels
("Save this draft and continue", "Go back to the previous step") next
to a single-word "Cancel" wrap the long button to two lines while the
short button stays one line, and heights mismatch.

The drawer footer uses a container query: when the drawer is narrower
than ~30rem, every footer button stretches to full width and stacks
on its own row. Heights stay matched and long labels read cleanly.`,
      },
    },
  },
  render: () => html`
    <div class="drawer-demo">
      <civ-button
        label="Show long-label demo"
        @click=${(e: Event) => open((e.target as HTMLElement).closest('.drawer-demo')!)}
      ></civ-button>
      <civ-drawer
        heading="Edit your contact information"
        align="end"
        @civ-close=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
      >
        <p class="civ-text-body">
          Update the address and phone number we use to send notices about
          your application.
        </p>
        <div data-drawer-footer>
          <civ-button
            emphasis="secondary"
            label="Discard my changes"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
          <civ-button
            label="Save and return to the form"
            @click=${(e: Event) => close((e.target as HTMLElement).closest('.drawer-demo')!)}
          ></civ-button>
        </div>
      </civ-drawer>
    </div>
  `,
};
