import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, trapFocus as runTrapFocus, clickOutside, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Action Sheet
 *
 * A shared popup/overlay component that renders as an absolute dropdown
 * on desktop and a fixed bottom sheet on mobile (≤480px).
 *
 * The parent component controls the `open` state — the action sheet
 * fires `civ-action-sheet-close` when it wants to close (escape key,
 * click outside, backdrop tap) and the parent decides whether to
 * actually close.
 *
 * @element civ-action-sheet
 *
 * @prop {boolean} open - Controls visibility
 * @prop {string} maxHeight - Max height on mobile (default '50vh')
 * @prop {boolean} trapFocus - Enable focus trapping (default false). HTML attribute: `trap-focus`.
 * @prop {boolean} noClickOutside - Disable click-outside close (default false)
 *
 * @fires civ-action-sheet-close - When the sheet wants to close
 *
 * @example
 * ```html
 * <civ-action-sheet ?open="${this._open}" max-height="60vh" trap-focus>
 *   <div>Popup content</div>
 * </civ-action-sheet>
 * ```
 */
@customElement('civ-action-sheet')
export class CivActionSheet extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String, attribute: 'max-height' }) maxHeight = '50vh';
  @property({ type: Boolean, attribute: 'trap-focus' }) trapFocus = false;
  @property({ type: Boolean, attribute: 'no-click-outside' }) noClickOutside = false;

  private _clickOutside = clickOutside(this, () => this._requestClose());
  private _cleanupTrap: (() => void) | null = null;
  private _boundOnKeydown = this._onKeydown.bind(this);

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-action-sheet-content]' };
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
        class="civ-action-sheet-backdrop"
        @click="${this._requestClose}"
      ></div>
      <div
        class="civ-action-sheet civ-action-sheet--open civ-bottom-sheet"
        style="--civ-action-sheet-max-height: ${this.maxHeight}"
      >
        <div class="civ-action-sheet__mobile-close">
          <button
            type="button"
            class="civ-close-btn"
            aria-label="${t('closeLabel')}"
            @click="${this._requestClose}"
          ><civ-icon name="close" aria-hidden="true"></civ-icon></button>
        </div>
        <div data-civ-action-sheet-content></div>
      </div>
    `;
  }

  private _onOpen(): void {
    if (!this.noClickOutside) {
      this._clickOutside.add();
    }
    document.addEventListener('keydown', this._boundOnKeydown);

    if (this.trapFocus) {
      this.updateComplete.then(() => {
        const container = this.querySelector('[data-civ-action-sheet-content]');
        if (container instanceof HTMLElement) {
          this._cleanupTrap = runTrapFocus(container);
        }
      });
    }
  }

  private _onClose(): void {
    this._teardown();
  }

  private _teardown(): void {
    this._clickOutside.remove();
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

  private _requestClose(): void {
    dispatch(this, 'civ-action-sheet-close');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-sheet': CivActionSheet;
  }
}
