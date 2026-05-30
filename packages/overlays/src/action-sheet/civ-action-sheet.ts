import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, trapFocus as runTrapFocus, clickOutside, renderCloseButton, t, pushOverlay, removeOverlay, isTopOverlay, claimOverlayKey, isOverlayKeyClaimed } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Action Sheet
 *
 * A shared popup/overlay component that renders as an absolute dropdown
 * on desktop and a fixed bottom sheet on mobile (≤480px).
 *
 * The parent component controls the `open` state — the action sheet
 * fires `civ-close` when it wants to close (escape key,
 * click outside, backdrop tap) and the parent decides whether to
 * actually close.
 *
 * @element civ-action-sheet
 *
 * @prop {boolean} open - Controls visibility
 * @prop {string} maxHeight - Max height on mobile (default '50vh')
 * @prop {string} label - Accessible label announced as the dialog name
 * @prop {boolean} trapFocus - Enable focus trapping (default false). HTML attribute: `trap-focus`.
 * @prop {boolean} noClickOutsideClose - Disable click-outside close (default false)
 *
 * @fires civ-close - When the sheet wants to close
 *
 * @example
 * ```html
 * <civ-action-sheet ?open="${this._open}" label="Filter results" max-height="60vh" trap-focus>
 *   <div>Popup content</div>
 * </civ-action-sheet>
 * ```
 */
@customElement('civ-action-sheet')
export class CivActionSheet extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String, attribute: 'max-height' }) maxHeight = '50vh';
  @property({ type: String }) label = '';
  @property({ type: Boolean, attribute: 'trap-focus' }) trapFocus = false;
  @property({ type: Boolean, attribute: 'no-click-outside-close' }) noClickOutsideClose = false;

  private _clickOutside = clickOutside(this, () => this._requestClose());
  private _cleanupTrap: (() => void) | null = null;
  private _boundOnKeydown = this._onKeydown.bind(this);
  private _previouslyFocused: Element | null = null;

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
        role="dialog"
        aria-modal="true"
        aria-label="${this.label || t('actionSheetLabel')}"
        tabindex="-1"
        data-civ-action-sheet-panel
        style="--civ-action-sheet-max-height: ${this.maxHeight}"
      >
        <div class="civ-action-sheet__mobile-close">
          ${renderCloseButton({
            label: t('closeLabel'),
            onClick: this._requestClose,
          })}
        </div>
        <div data-civ-action-sheet-content></div>
      </div>
    `;
  }

  private async _onOpen(): Promise<void> {
    this._previouslyFocused = document.activeElement;

    // Register on the shared overlay stack so a nested dismissable overlay
    // (e.g. a civ-popover opened inside this sheet) consumes Escape first;
    // only the topmost layer responds to a single keypress.
    pushOverlay(this);
    if (!this.noClickOutsideClose) {
      this._clickOutside.add();
    }
    document.addEventListener('keydown', this._boundOnKeydown);

    try {
      await this.updateComplete;

      // Move focus into the sheet. Prefer the first focusable in the
      // content slot (the consumer's interactive UI); fall back to the
      // close button as a guaranteed focus target. Without this,
      // keyboard users land nowhere when the sheet opens and have to
      // Tab manually to reach the content. Uses a direct selector
      // rather than the core getFocusableElements helper so the
      // visibility check (which relies on offsetParent / computed
      // style) doesn't reject elements in jsdom or in the brief
      // moment after the sheet renders but before display:block lays
      // out the dimensions.
      const focusSelector = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const panel = this.querySelector<HTMLElement>('[data-civ-action-sheet-panel]');
      const content = this.querySelector('[data-civ-action-sheet-content]');
      const first = content?.querySelector<HTMLElement>(focusSelector);
      if (first) {
        first.focus();
      } else {
        // Fall back to the panel itself (tabindex=-1) rather than the
        // close button — the close button lives in a `display:none`
        // wrapper on desktop, so focusing it is a silent no-op there.
        panel?.focus();
      }

      if (this.trapFocus && panel) {
        // Trap the whole panel, not just the content slot, so the close
        // button (a sibling of the content) stays inside the focus cycle.
        this._cleanupTrap = runTrapFocus(panel);
      }
    } catch (err) {
      console.error('civ-action-sheet: failed to open', err);
    }
  }

  private _onClose(): void {
    this._teardown();

    // Return focus to the element that opened the sheet so keyboard
    // users don't get dumped at <body>. requestAnimationFrame defers
    // until after the close render has flushed.
    if (this._previouslyFocused instanceof HTMLElement) {
      const target = this._previouslyFocused;
      requestAnimationFrame(() => {
        target?.focus();
      });
      this._previouslyFocused = null;
    }
  }

  private _teardown(): void {
    removeOverlay(this);
    this._clickOutside.remove();
    this._cleanupTrap?.();
    this._cleanupTrap = null;
    document.removeEventListener('keydown', this._boundOnKeydown);
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Escape' || !this.open) return;
    // Only the topmost overlay handles a dismiss key, and each keypress is
    // consumed once — so an Escape pressed while a civ-popover is open
    // inside this sheet closes the popover only, not both layers. See
    // @civui/core overlay-stack.
    if (isOverlayKeyClaimed(e) || !isTopOverlay(this)) return;
    claimOverlayKey(e);
    e.preventDefault();
    this._requestClose();
  }

  private _requestClose(): void {
    dispatch(this, 'civ-close');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-sheet': CivActionSheet;
  }
}
