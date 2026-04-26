import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, trapFocus } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Modal
 *
 * A general-purpose modal dialog. Centered overlay on desktop,
 * bottom sheet on mobile (≤480px). Includes focus trap, escape-to-close,
 * optional backdrop close, and return-focus-on-close.
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
 *
 * @example
 * ```html
 * <civ-modal ?open="${this._open}" heading="Confirm action"
 *   @civ-modal-close="${() => this._open = false}">
 *   <p>Are you sure?</p>
 *   <div data-modal-footer>
 *     <civ-button label="Yes" @click="${this._confirm}"></civ-button>
 *     <civ-button variant="secondary" label="Cancel"
 *       @click="${() => this._open = false}"></civ-button>
 *   </div>
 * </civ-modal>
 * ```
 */
@customElement('civ-modal')
export class CivModal extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) heading = '';
  @property({ type: Boolean, attribute: 'no-close-button' }) noCloseButton = false;
  @property({ type: Boolean, attribute: 'no-backdrop-close' }) noBackdropClose = false;

  private _cleanupTrap: (() => void) | null = null;
  private _boundOnKeydown = this._onKeydown.bind(this);
  private _triggerElement: HTMLElement | null = null;

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

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardown();
  }

  override render() {
    if (!this.open) return nothing;

    return html`
      <div
        class="civ-modal-backdrop"
        @click="${this._onBackdropClick}"
      ></div>
      <div
        class="civ-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${this.heading ? 'civ-modal-heading' : nothing}"
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
      </div>
    `;
  }

  private _onOpen(): void {
    this._triggerElement = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', this._boundOnKeydown);
    document.body.style.overflow = 'hidden';

    this.updateComplete.then(() => {
      const dialog = this.querySelector('[role="dialog"]');
      if (dialog instanceof HTMLElement) {
        this._cleanupTrap = trapFocus(dialog);
      }
    });
  }

  private _onClose(): void {
    this._teardown();
    document.body.style.overflow = '';

    // Return focus to the element that opened the modal
    if (this._triggerElement) {
      requestAnimationFrame(() => {
        this._triggerElement?.focus();
        this._triggerElement = null;
      });
    }
  }

  private _teardown(): void {
    this._cleanupTrap?.();
    this._cleanupTrap = null;
    document.removeEventListener('keydown', this._boundOnKeydown);
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      this._requestClose();
    }
  }

  private _onBackdropClick(): void {
    if (!this.noBackdropClose) {
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
