import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-action-sheet.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Overlays/Action Sheet',
  component: 'civ-action-sheet',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// All three stories read `open` directly from the action-sheet element
// rather than holding it in a render-time closure. The closure pattern
// silently desyncs the moment the sheet closes via Escape, backdrop tap,
// or its own close button — the parent's `open` variable still reads
// `true`, so the next toggle click flips it to `false` and the sheet
// stays shut. Mirrors the pattern in civ-modal.stories.ts.

export const Default: Story = {
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = !sheet.open;
    };
    const close = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Open action sheet" @click="${toggle}"></civ-button>
        <civ-action-sheet label="Choose an option" @civ-close="${close}">
          <div class="civ-p-4">
            <p class="civ-heading-sm">Choose an option</p>
            <ul class="civ-list-none civ-p-0 civ-m-0">
              <li class="civ-py-2 civ-border-b civ-border-base-lighter">Option 1</li>
              <li class="civ-py-2 civ-border-b civ-border-base-lighter">Option 2</li>
              <li class="civ-py-2">Option 3</li>
            </ul>
          </div>
        </civ-action-sheet>
      </div>
    `;
  },
};

export const WithMaxHeight: Story = {
  name: 'Custom Max Height',
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = !sheet.open;
    };
    const close = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Open tall sheet" @click="${toggle}"></civ-button>
        <civ-action-sheet label="Long list" max-height="70vh" @civ-close="${close}">
          <div class="civ-p-4">
            <p class="civ-heading-sm">Long list</p>
            <ul class="civ-list-none civ-p-0 civ-m-0">
              ${Array.from({ length: 20 }, (_, i) => html`
                <li class="civ-py-2 civ-border-b civ-border-base-lighter">Item ${i + 1}</li>
              `)}
            </ul>
          </div>
        </civ-action-sheet>
      </div>
    `;
  },
};

export const WithFocusTrap: Story = {
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = !sheet.open;
    };
    const close = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Open modal sheet" @click="${toggle}"></civ-button>
        <civ-action-sheet label="Confirm action" trap-focus @civ-close="${close}">
          <div class="civ-p-4">
            <p class="civ-heading-sm civ-mb-4">Confirm action</p>
            <p class="civ-mb-4">Are you sure you want to delete this item?</p>
            <div class="civ-button-row">
              <civ-button emphasis="secondary" label="Cancel" @click="${close}"></civ-button>
              <civ-button danger label="Delete" @click="${close}"></civ-button>
            </div>
          </div>
        </civ-action-sheet>
      </div>
    `;
  },
};

export const LongFooterLabels: Story = {
  name: 'Long footer button labels — auto-stack',
  parameters: {
    docs: {
      description: {
        story: `Action sheets are narrow by design, especially on mobile.
Long government-form button labels can wrap unevenly when placed
side-by-side. The \`.civ-button-row\` utility used inside the sheet
uses a container query to stretch each button to full width and
stack them when the sheet itself is narrow. This keeps tap targets
big and heights matched even when labels are long.`,
      },
    },
  },
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = !sheet.open;
    };
    const close = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.action-sheet-demo')!;
      const sheet = demo.querySelector('civ-action-sheet') as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Show long-label demo" @click="${toggle}"></civ-button>
        <civ-action-sheet label="Confirm submission" trap-focus @civ-close="${close}">
          <div class="civ-p-4">
            <p class="civ-heading-sm civ-mb-4">Submit your application?</p>
            <p class="civ-mb-4">
              Once submitted, you cannot edit your answers. You'll receive a
              confirmation email within 24 hours.
            </p>
            <div class="civ-button-row">
              <civ-button
                emphasis="secondary"
                label="Go back to review my answers"
                @click="${close}"
              ></civ-button>
              <civ-button
                label="Submit my application now"
                @click="${close}"
              ></civ-button>
            </div>
          </div>
        </civ-action-sheet>
      </div>
    `;
  },
};
