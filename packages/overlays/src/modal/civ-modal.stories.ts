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
