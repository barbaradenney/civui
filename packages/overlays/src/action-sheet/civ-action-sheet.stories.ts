import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-action-sheet.js';

const meta: Meta = {
  title: 'UI/Action Sheet',
  component: 'civ-action-sheet',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    let open = false;
    const toggle = (e: Event) => {
      open = !open;
      const sheet = (e.target as HTMLElement).closest('.action-sheet-demo')?.querySelector('civ-action-sheet') as any;
      if (sheet) sheet.open = open;
    };
    const close = (e: Event) => {
      open = false;
      const sheet = (e.target as HTMLElement) as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Open action sheet" @click="${toggle}"></civ-button>
        <civ-action-sheet @civ-action-sheet-close="${close}">
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
    let open = false;
    const toggle = (e: Event) => {
      open = !open;
      const sheet = (e.target as HTMLElement).closest('.action-sheet-demo')?.querySelector('civ-action-sheet') as any;
      if (sheet) sheet.open = open;
    };
    const close = (e: Event) => {
      open = false;
      const sheet = (e.target as HTMLElement) as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Open tall sheet" @click="${toggle}"></civ-button>
        <civ-action-sheet max-height="70vh" @civ-action-sheet-close="${close}">
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
  name: 'With Focus Trap',
  render: () => {
    let open = false;
    const toggle = (e: Event) => {
      open = !open;
      const sheet = (e.target as HTMLElement).closest('.action-sheet-demo')?.querySelector('civ-action-sheet') as any;
      if (sheet) sheet.open = open;
    };
    const close = (e: Event) => {
      open = false;
      const sheet = (e.target as HTMLElement) as any;
      sheet.open = false;
    };
    return html`
      <div class="action-sheet-demo" style="position: relative;">
        <civ-button label="Open modal sheet" @click="${toggle}"></civ-button>
        <civ-action-sheet trap-focus @civ-action-sheet-close="${close}">
          <div class="civ-p-4">
            <p class="civ-heading-sm civ-mb-4">Confirm action</p>
            <p class="civ-text-body civ-mb-4">Are you sure you want to delete this item?</p>
            <div class="civ-flex civ-gap-4">
              <civ-button variant="secondary" label="Cancel" @click="${close}"></civ-button>
              <civ-button danger label="Delete" @click="${close}"></civ-button>
            </div>
          </div>
        </civ-action-sheet>
      </div>
    `;
  },
};
