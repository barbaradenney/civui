import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/text-input';
import '@civui/overlays/modal';
import '@civui/actions/button';
import '@civui/actions/action-button';

const meta: Meta = {
  title: 'Foundations/Destructive Actions',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
CivUI confirms destructive actions (data loss, irreversible workflow,
PII attachment removal) via a \`civ-modal\` — never via inline patterns
(two-click confirm, hold-to-delete, swipe-to-delete). The modal owns
focus management, the cancel-safe default, and the keyboard contract.

See the [destructive-actions foundation](/docs/foundations/destructive-actions)
page for the full anti-pattern catalog and the cancelable-event +
\`skipConfirm\` wiring pattern.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const setupConfirmModal = (story: HTMLElement, modalId: string, openerId: string, onConfirm: () => void) => {
  const opener = story.querySelector<HTMLElement>(`#${openerId}`);
  const modal = story.querySelector<HTMLElement & { open: boolean }>(`#${modalId}`);
  if (!opener || !modal) return;

  opener.addEventListener('click', (e) => {
    e.preventDefault();
    modal.open = true;
  });

  const confirmBtn = modal.querySelector<HTMLElement>('[data-confirm]');
  const cancelBtn = modal.querySelector<HTMLElement>('[data-cancel]');
  confirmBtn?.addEventListener('click', () => {
    onConfirm();
    modal.open = false;
  });
  cancelBtn?.addEventListener('click', () => {
    modal.open = false;
  });
  modal.addEventListener('civ-close', () => {
    modal.open = false;
  });
};

export const ConfirmRemove: Story = {
  name: 'Confirm — remove a row',
  render: () => {
    const id = `destructive-${Math.random().toString(36).slice(2, 8)}`;
    requestAnimationFrame(() => {
      const root = document.getElementById(`${id}-root`);
      if (!root) return;
      const status = root.querySelector<HTMLElement>('[data-status]');
      setupConfirmModal(root, `${id}-modal`, `${id}-trigger`, () => {
        if (status) status.textContent = 'Alex Chen was removed.';
      });
    });
    return html`
      <div id="${id}-root">
        <div
          style="border: 1px solid var(--civ-color-base-lighter); border-radius: var(--civ-border-radius-md); padding: var(--civ-spacing-4);"
        >
          <p class="civ-font-semibold civ-m-0">Alex Chen</p>
          <p class="civ-text-caption civ-m-0">Spouse • Date of birth: April 12, 1985</p>
          <div class="civ-flex civ-gap-2 civ-justify-end civ-mt-3">
            <civ-action-button variant="tertiary" label="Edit"></civ-action-button>
            <civ-action-button
              id="${id}-trigger"
              variant="tertiary"
              danger
              label="Remove dependent"
            ></civ-action-button>
          </div>
        </div>
        <p
          data-status
          class="civ-text-caption civ-text-success civ-mt-3"
          role="status"
        ></p>
        <civ-modal
          id="${id}-modal"
          heading="Remove Alex Chen?"
        >
          <p>
            Alex Chen will be removed from your dependents list. This can't be undone.
          </p>
          <div data-civ-modal-footer class="civ-button-row civ-justify-end">
            <civ-button data-cancel variant="secondary" label="Cancel"></civ-button>
            <civ-button data-confirm danger label="Remove"></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

export const ConfirmDeleteFile: Story = {
  name: 'Confirm — delete an uploaded file',
  render: () => {
    const id = `destructive-${Math.random().toString(36).slice(2, 8)}`;
    requestAnimationFrame(() => {
      const root = document.getElementById(`${id}-root`);
      if (!root) return;
      const status = root.querySelector<HTMLElement>('[data-status]');
      const fileItem = root.querySelector<HTMLElement>('[data-file]');
      setupConfirmModal(root, `${id}-modal`, `${id}-trigger`, () => {
        if (fileItem) fileItem.style.display = 'none';
        if (status) status.textContent = 'tax-return-2025.pdf was deleted.';
      });
    });
    return html`
      <div id="${id}-root">
        <ul
          class="civ-list-none civ-p-0 civ-space-y-1"
          style="max-width: 480px;"
        >
          <li data-file class="civ-list-item">
            <div class="civ-list-item__content">
              <span class="civ-flex civ-items-center civ-gap-2">
                <civ-icon name="document"></civ-icon>
                <span class="civ-font-semibold">tax-return-2025.pdf</span>
                <span class="civ-ms-2">(1.2 MB)</span>
              </span>
            </div>
            <span class="civ-list-item__actions">
              <civ-action-button
                id="${id}-trigger"
                variant="tertiary"
                danger
                label="Delete file"
              ></civ-action-button>
            </span>
          </li>
        </ul>
        <p
          data-status
          class="civ-text-caption civ-text-success civ-mt-3"
          role="status"
        ></p>
        <civ-modal
          id="${id}-modal"
          heading="Delete attachment?"
        >
          <p>
            <code>tax-return-2025.pdf</code> will be removed from this
            application. You'll need to upload it again to include it.
          </p>
          <div data-civ-modal-footer class="civ-button-row civ-justify-end">
            <civ-button data-cancel variant="secondary" label="Cancel"></civ-button>
            <civ-button data-confirm danger label="Delete"></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

export const TypeToConfirm: Story = {
  name: 'Type-to-confirm escalation',
  parameters: {
    docs: {
      description: {
        story:
          'For high-stakes actions (account deletion, withdrawing a submitted claim) — escalate from tap-confirm to type-confirm. The phrase must come from real context the user already knows (the claim ID, the dependent\'s name), not a literal word like "DELETE".',
      },
    },
  },
  render: () => {
    const id = `destructive-${Math.random().toString(36).slice(2, 8)}`;
    const expectedPhrase = 'WD-2025-0114';
    requestAnimationFrame(() => {
      const root = document.getElementById(`${id}-root`);
      if (!root) return;
      const opener = root.querySelector<HTMLElement>(`#${id}-trigger`);
      const modal = root.querySelector<HTMLElement & { open: boolean }>(`#${id}-modal`);
      const input = root.querySelector<HTMLElement & { value: string }>(`#${id}-input`);
      const confirmBtn = root.querySelector<HTMLElement & { disabled: boolean }>('[data-confirm]');
      const cancelBtn = root.querySelector<HTMLElement>('[data-cancel]');
      const status = root.querySelector<HTMLElement>('[data-status]');
      if (!opener || !modal || !input || !confirmBtn) return;

      const reset = () => {
        input.value = '';
        confirmBtn.disabled = true;
      };
      reset();

      opener.addEventListener('click', (e) => {
        e.preventDefault();
        reset();
        modal.open = true;
      });
      input.addEventListener('civ-input', (e: any) => {
        confirmBtn.disabled = e.detail.value !== expectedPhrase;
      });
      confirmBtn.addEventListener('click', () => {
        if (input.value === expectedPhrase) {
          modal.open = false;
          if (status) status.textContent = `Claim ${expectedPhrase} was withdrawn.`;
        }
      });
      cancelBtn?.addEventListener('click', () => {
        modal.open = false;
      });
      modal.addEventListener('civ-close', () => {
        modal.open = false;
      });
    });
    return html`
      <div id="${id}-root">
        <div
          style="border: 1px solid var(--civ-color-base-lighter); border-radius: var(--civ-border-radius-md); padding: var(--civ-spacing-4);"
        >
          <p class="civ-font-semibold civ-m-0">Disability claim ${expectedPhrase}</p>
          <p class="civ-text-caption civ-m-0">Submitted April 14, 2025 • Status: Pending</p>
          <div class="civ-mt-3">
            <civ-button
              id="${id}-trigger"
              danger
              label="Withdraw claim"
            ></civ-button>
          </div>
        </div>
        <p
          data-status
          class="civ-text-caption civ-text-success civ-mt-3"
          role="status"
        ></p>
        <civ-modal
          id="${id}-modal"
          heading="Withdraw claim ${expectedPhrase}?"
        >
          <p>
            Withdrawing this claim cancels your active application and
            removes it from the queue. You'll need to start over to
            re-apply.
          </p>
          <civ-text-input
            id="${id}-input"
            label="Type the claim ID to confirm"
            hint="To proceed, enter ${expectedPhrase} exactly as shown above."
            name="confirm-phrase"
          ></civ-text-input>
          <div data-civ-modal-footer class="civ-button-row civ-justify-end">
            <civ-button data-cancel variant="secondary" label="Cancel"></civ-button>
            <civ-button data-confirm danger label="Withdraw claim" disabled></civ-button>
          </div>
        </civ-modal>
      </div>
    `;
  },
};

