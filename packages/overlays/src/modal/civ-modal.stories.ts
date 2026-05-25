import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-modal.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Overlays/Modal',
  component: 'civ-modal',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.modal-demo')!;
      const modal = demo.querySelector('civ-modal') as any;
      modal.open = !modal.open;
    };
    const close = (e: Event) => {
      ((e.target as HTMLElement).closest('.modal-demo')!.querySelector('civ-modal') as any).open = false;
    };
    return html`
      <div class="modal-demo">
        <civ-button label="Open modal" @click="${toggle}"></civ-button>
        <civ-modal heading="Example Modal" @civ-close="${close}">
          <p class="civ-text-body">This is a general-purpose modal dialog. On mobile it renders as a bottom sheet.</p>
          <div data-modal-footer>
            <civ-button emphasis="secondary" label="Cancel" @click="${close}"></civ-button>
            <civ-button label="Confirm" @click="${close}"></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

export const Compact: Story = {
  name: 'Compact (spacing="sm")',
  parameters: {
    docs: {
      description: {
        story: `\`spacing="sm"\` shrinks the dialog chrome to 16px padding
with 12px header/body/footer rhythm (from 24px / 16px) for dense
admin quick-action dialogs. Per density-convention.md Contract A:
pure shrink, no chrome dropped, no layout change. Web-only —
native platforms have their own density mechanisms.`,
      },
    },
  },
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.modal-demo')!;
      const modal = demo.querySelector('civ-modal') as any;
      modal.open = !modal.open;
    };
    const close = (e: Event) => {
      ((e.target as HTMLElement).closest('.modal-demo')!.querySelector('civ-modal') as any).open = false;
    };
    return html`
      <div class="modal-demo">
        <civ-button label="Open compact modal" @click="${toggle}"></civ-button>
        <civ-modal heading="Reassign row" spacing="sm" @civ-close="${close}">
          <p class="civ-text-body civ-m-0">Move 3 selected rows to a different owner.</p>
          <div data-modal-footer>
            <civ-button emphasis="secondary" label="Cancel" @click="${close}"></civ-button>
            <civ-button label="Reassign" @click="${close}"></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

export const RequiredDecision: Story = {
  name: 'Required Decision (No Close)',
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.modal-demo')!;
      const modal = demo.querySelector('civ-modal') as any;
      modal.open = !modal.open;
    };
    const close = (e: Event) => {
      ((e.target as HTMLElement).closest('.modal-demo')!.querySelector('civ-modal') as any).open = false;
    };
    return html`
      <div class="modal-demo">
        <civ-button label="Open required decision" @click="${toggle}"></civ-button>
        <civ-modal heading="Confirm deletion" no-close-button no-backdrop-close @civ-close="${close}">
          <p class="civ-text-body">Are you sure you want to delete this application? This cannot be undone.</p>
          <div data-modal-footer>
            <civ-button emphasis="secondary" label="Cancel" @click="${close}"></civ-button>
            <civ-button danger label="Delete" @click="${close}"></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

export const AddressVerification: Story = {
  name: 'Usage: Address Verification',
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.modal-demo')!;
      const modal = demo.querySelector('civ-modal') as any;
      modal.open = !modal.open;
    };
    const close = (e: Event) => {
      ((e.target as HTMLElement).closest('.modal-demo')!.querySelector('civ-modal') as any).open = false;
    };
    return html`
      <div class="modal-demo">
        <civ-button label="Show address verification" @click="${toggle}"></civ-button>
        <civ-modal heading="Verify your address" no-close-button no-backdrop-close>
          <div class="civ-flex civ-flex-col civ-gap-6">
            <div>
              <p class="civ-font-semibold civ-mb-1">You entered</p>
              <p class="civ-text-body civ-m-0">123 Main St</p>
              <p class="civ-text-body civ-m-0">Austin, TX 78701</p>
            </div>
            <div>
              <p class="civ-font-semibold civ-mb-1">Suggested address</p>
              <p class="civ-text-body civ-m-0">123 Main Street</p>
              <p class="civ-text-body civ-m-0">Austin, TX 78701-1234</p>
            </div>
          </div>
          <div data-modal-footer>
            <civ-button emphasis="secondary" label="Keep my address" @click="${close}"></civ-button>
            <civ-button label="Use suggested address" @click="${close}"></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

export const LongFooterLabels: Story = {
  name: 'Long footer button labels — auto-stack',
  parameters: {
    docs: {
      description: {
        story: `Government button labels are often long — "Save this draft
and continue to the next page", "Yes, I confirm this is correct", "Go
back to the previous step". Side-by-side, one button wraps to two
lines while the sibling stays single-line and the heights mismatch.

The modal footer uses a container query: when the modal itself is
narrower than ~30rem, every footer button stretches to full width
and stacks. This catches narrow modals at any viewport, not just
on phones.`,
      },
    },
  },
  render: () => {
    const toggle = (e: Event) => {
      const demo = (e.target as HTMLElement).closest('.modal-demo')!;
      const modal = demo.querySelector('civ-modal') as any;
      modal.open = !modal.open;
    };
    const close = (e: Event) => {
      ((e.target as HTMLElement).closest('.modal-demo')!.querySelector('civ-modal') as any).open = false;
    };
    return html`
      <div class="modal-demo">
        <civ-button label="Show long-label demo" @click="${toggle}"></civ-button>
        <civ-modal heading="Save your application?" @civ-close="${close}">
          <p class="civ-text-body">
            We can save your progress so you can finish later. Your draft will
            be kept for 60 days.
          </p>
          <div data-modal-footer>
            <civ-button
              emphasis="secondary"
              label="Go back to the previous step"
              @click="${close}"
            ></civ-button>
            <civ-button
              label="Save this draft and continue"
              @click="${close}"
            ></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};
