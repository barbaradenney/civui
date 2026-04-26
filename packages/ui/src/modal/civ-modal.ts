import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Modal
 *
 * A general-purpose modal dialog built on the native HTML `<dialog>` element.
 * Centered overlay on desktop, bottom sheet on mobile (≤480px).
 *
 * Uses the browser's built-in modal behavior:
 * - Native focus trap (no JS focus management needed)
 * - Native `::backdrop` pseudo-element
 * - Native Escape-to-close
 * - Automatic `inert` on background content
 *
 * The parent component controls the `open` state. The modal fires
 * `civ-modal-close` when the user tries to close it, and the parent
 * decides whether to actually close.
 *
 * @element civ-modal
 *
 * @prop {boolean} open - Controls visibility
 * @prop {string} heading - Modal heading text (rendered as h2)
 * @prop {boolean} noCloseButton - Hide the X close button
 * @prop {boolean} noBackdropClose - Disable closing via backdrop click
 *
 * @fires civ-modal-close - When the user tries to close the modal
 */
@customElement('civ-modal')
export class CivModal extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) heading = '';
  @property({ type: Boolean, attribute: 'no-close-button' }) noCloseButton = false;
  @property({ type: Boolean, attribute: 'no-backdrop-close' }) noBackdropClose = false;

  override _getSlotConfig(): SlotConfig {
    return {
      'data-modal-footer': '[data-civ-modal-footer]',
      default: '[data-civ-modal-body]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('open')) {
      if (this.open) {
        this._onOpen();
      } else {
        this._onClose();
      }
    }
  }

  override render() {
    return html`
      <dialog
        class="civ-modal"
        aria-labelledby="${this.heading ? 'civ-modal-heading' : nothing}"
        @close="${this._onNativeClose}"
        @click="${this._onDialogClick}"
      >
        ${this.heading || !this.noCloseButton ? html`
          <div class="civ-modal__header">
            ${this.heading ? html`
              <h2 id="civ-modal-heading" class="civ-heading-lg civ-m-0">${this.heading}</h2>
            ` : nothing}
            ${!this.noCloseButton ? html`
              <civ-action-button
                variant="tertiary"
                label="Close"
                icon-start="close"
                @click="${this._requestClose}"
                class="civ-modal__close"
              ></civ-action-button>
            ` : nothing}
          </div>
        ` : nothing}
        <div class="civ-modal__body" data-civ-modal-body></div>
        ${this._hasSlottedChildren('data-modal-footer') ? html`
          <div class="civ-modal__footer" data-civ-modal-footer></div>
        ` : nothing}
      </dialog>
    `;
  }

  private _onOpen(): void {
    this.updateComplete.then(() => {
      const dialog = this.querySelector('dialog') as HTMLDialogElement | null;
      if (dialog && !dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  }

  private _onClose(): void {
    const dialog = this.querySelector('dialog') as HTMLDialogElement | null;
    if (dialog?.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  }

  /** Native dialog fires 'close' on Escape — intercept and forward as our event */
  private _onNativeClose(e: Event): void {
    e.preventDefault();
    this._requestClose();
  }

  /** Detect clicks on the backdrop (the dialog element itself, not its children) */
  private _onDialogClick(e: MouseEvent): void {
    const dialog = this.querySelector('dialog');
    if (!dialog || this.noBackdropClose) return;
    // Click on the dialog element itself (the backdrop area) vs. inside the content
    if (e.target === dialog) {
      this._requestClose();
    }
  }

  private _requestClose(): void {
    dispatch(this, 'civ-modal-close');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-modal': CivModal;
  }
}
