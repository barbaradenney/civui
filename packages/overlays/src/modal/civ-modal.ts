import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, renderCloseButton, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Modal
 *
 * A general-purpose modal dialog built on the native HTML `<dialog>` element.
 * Centered overlay on desktop, bottom sheet on mobile (≤480px).
 *
 * Uses the browser's built-in modal behavior:
 * - Native focus trap via `showModal()`
 * - Native `::backdrop` pseudo-element
 * - Escape-to-close via `cancel` event (preventable)
 * - Automatic top-layer stacking
 *
 * The parent component controls the `open` state. The modal fires
 * `civ-modal-close` when the user tries to close it, and the parent
 * decides whether to actually close.
 *
 * **Heading level:** Renders at `heading-level` (default 2). Set to match
 * your document outline — e.g., if the modal opens from an `h2` section,
 * use `heading-level="3"`.
 *
 * @element civ-modal
 *
 * @prop {boolean} open - Controls visibility
 * @prop {string} heading - Modal heading text
 * @prop {number} headingLevel - Heading level 2-6 (default: 2)
 * @prop {string} label - Accessible label when no heading is set
 * @prop {boolean} noCloseButton - Hide the X close button
 * @prop {boolean} noBackdropClose - Disable closing via backdrop click
 * @prop {boolean} noEscapeClose - Disable closing via Escape key
 *
 * @fires civ-modal-close - When the user tries to close the modal
 */
@customElement('civ-modal')
export class CivModal extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) heading = '';
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: 2 | 3 | 4 | 5 | 6 = 2;
  @property({ type: String }) label = '';
  @property({ type: Boolean, attribute: 'no-close-button' }) noCloseButton = false;
  @property({ type: Boolean, attribute: 'no-backdrop-close' }) noBackdropClose = false;
  @property({ type: Boolean, attribute: 'no-escape-close' }) noEscapeClose = false;

  private _previouslyFocused: Element | null = null;
  private _priorBodyOverflow = '';
  private _headingId = this.generateId('heading');

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
        aria-labelledby="${this.heading ? this._headingId : nothing}"
        aria-label="${!this.heading && this.label ? this.label : nothing}"
        @cancel="${this._onCancel}"
        @close="${this._onNativeClose}"
        @click="${this._onDialogClick}"
      >
        ${this.heading || !this.noCloseButton ? html`
          <div class="civ-modal__header">
            ${this.heading ? html`
              <span id="${this._headingId}" class="civ-heading-lg civ-m-0" role="heading" aria-level="${this.headingLevel}">${this.heading}</span>
            ` : nothing}
            ${!this.noCloseButton ? renderCloseButton({
              label: t('closeLabel'),
              onClick: this._requestClose,
              extraClass: 'civ-modal__close',
            }) : nothing}
          </div>
        ` : nothing}
        <div class="civ-modal__body" data-civ-modal-body></div>
        ${this._hasSlottedChildren('data-modal-footer') ? html`
          <div class="civ-modal__footer" data-civ-modal-footer></div>
        ` : nothing}
      </dialog>
    `;
  }

  private async _onOpen(): Promise<void> {
    this._previouslyFocused = document.activeElement;
    // Snapshot the prior inline overflow so we restore it on close
    // instead of always clearing to '' (which would clobber a host
    // page that had its own `body { overflow: visible }` inline rule).
    this._priorBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    try {
      await this.updateComplete;
      const dialog = this.querySelector('dialog') as HTMLDialogElement | null;
      if (dialog && !dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    } catch (err) {
      console.error('civ-modal: failed to open dialog', err);
    }
  }

  private _onClose(): void {
    const dialog = this.querySelector('dialog') as HTMLDialogElement | null;
    if (dialog?.open && typeof dialog.close === 'function') {
      dialog.close();
    }

    document.body.style.overflow = this._priorBodyOverflow;
    this._priorBodyOverflow = '';

    // Return focus to the element that opened the modal
    if (this._previouslyFocused instanceof HTMLElement) {
      requestAnimationFrame(() => {
        (this._previouslyFocused as HTMLElement)?.focus();
        this._previouslyFocused = null;
      });
    }
  }

  /** Native cancel event fires BEFORE dialog closes — can be prevented */
  private _onCancel(e: Event): void {
    if (this.noEscapeClose) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    this._requestClose();
  }

  /** Native close event fires AFTER dialog has closed */
  private _onNativeClose(): void {
    // Dialog already closed natively — sync our state
    if (this.open) {
      this._requestClose();
    }
  }

  /** Detect clicks on the backdrop (the dialog element itself, not its children) */
  private _onDialogClick(e: MouseEvent): void {
    const dialog = this.querySelector('dialog');
    if (!dialog || this.noBackdropClose) return;
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
