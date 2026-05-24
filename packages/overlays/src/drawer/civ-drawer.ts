import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, renderCloseButton, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Drawer
 *
 * A full-viewport-height dialog that slides in from the start or end edge.
 * Built on the native `<dialog>` element — inherits the same focus trap,
 * Escape-to-close, and top-layer stacking that `civ-modal` uses.
 *
 * Differences from `civ-modal`:
 * - Side-anchored (start/end edge) instead of centered.
 * - Spans the full viewport height regardless of content.
 * - Slides in from the chosen edge instead of fading + scaling.
 * - Intended for nav menus, settings panels, and secondary content.
 *
 * Differences from `civ-action-sheet`:
 * - Not anchored to a trigger element — it's a standalone dialog.
 * - Side-anchored, not bottom-anchored. The mobile bottom-sheet rule
 *   does NOT apply: a drawer with a typing surface (search-in-nav,
 *   filter panel) needs the full viewport height the soft keyboard
 *   doesn't get to push around.
 *
 * The parent controls `open`. The drawer fires `civ-drawer-close` when
 * the user tries to close it; the parent decides whether to actually
 * flip `open` to false.
 *
 * @element civ-drawer
 *
 * @prop {boolean} open - Controls visibility
 * @prop {'start' | 'end'} position - Edge the drawer slides in from (default 'start')
 * @prop {string} width - CSS width (default 'min(320px, 90vw)')
 * @prop {string} heading - Drawer heading text
 * @prop {number} headingLevel - Heading level 2-6 (default 2)
 * @prop {string} label - Accessible label when no heading is set
 * @prop {boolean} noCloseButton - Hide the X close button
 * @prop {boolean} noBackdropClose - Disable closing via backdrop click
 * @prop {boolean} noEscapeClose - Disable closing via Escape key
 * @prop {boolean} noStickyHeader - Header scrolls with body content instead of sticking to the top
 * @prop {boolean} noStickyFooter - Footer scrolls with body content instead of sticking to the bottom
 *
 * @fires civ-drawer-close - When the user tries to close the drawer
 *
 * @example Slide-in main navigation (mobile)
 * ```html
 * <civ-drawer ?open=${this._navOpen} position="start" label="Main menu"
 *             @civ-drawer-close=${() => this._navOpen = false}>
 *   <nav aria-label="Main">
 *     <civ-link href="/">Home</civ-link>
 *     <civ-link href="/benefits">Benefits</civ-link>
 *   </nav>
 * </civ-drawer>
 * ```
 *
 * @example End-anchored settings panel
 * ```html
 * <civ-drawer ?open=${this._open} position="end" heading="Display settings" width="360px">
 *   <civ-toggle label="Dark mode"></civ-toggle>
 * </civ-drawer>
 * ```
 */
@customElement('civ-drawer')
export class CivDrawer extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String, reflect: true }) position: 'start' | 'end' = 'start';
  @property({ type: String }) width = 'min(320px, 90vw)';
  @property({ type: String }) heading = '';
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: 2 | 3 | 4 | 5 | 6 = 2;
  @property({ type: String }) label = '';
  @property({ type: Boolean, attribute: 'no-close-button' }) noCloseButton = false;
  @property({ type: Boolean, attribute: 'no-backdrop-close' }) noBackdropClose = false;
  @property({ type: Boolean, attribute: 'no-escape-close' }) noEscapeClose = false;
  @property({ type: Boolean, attribute: 'no-sticky-header' }) noStickyHeader = false;
  @property({ type: Boolean, attribute: 'no-sticky-footer' }) noStickyFooter = false;

  private _previouslyFocused: Element | null = null;
  private _priorBodyOverflow = '';
  private _headingId = this.generateId('heading');

  override _getSlotConfig(): SlotConfig {
    return {
      'data-drawer-footer': '[data-civ-drawer-footer]',
      default: '[data-civ-drawer-content]',
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
    const hasHeader = this.heading || !this.noCloseButton;
    const headerClasses = `civ-drawer__header${this.noStickyHeader ? '' : ' civ-drawer__header--sticky'}`;
    const footerClasses = `civ-drawer__footer${this.noStickyFooter ? '' : ' civ-drawer__footer--sticky'}`;
    const hasFooter = this._hasSlottedChildren('data-drawer-footer');

    return html`
      <dialog
        class="civ-drawer civ-drawer--${this.position}"
        style="--civ-drawer-width: ${this.width};"
        aria-labelledby="${this.heading ? this._headingId : nothing}"
        aria-label="${!this.heading && this.label ? this.label : nothing}"
        @cancel="${this._onCancel}"
        @close="${this._onNativeClose}"
        @click="${this._onDialogClick}"
      >
        <div class="civ-drawer__body" data-civ-drawer-body>
          ${hasHeader ? html`
            <div class="${headerClasses}">
              ${this.heading ? html`
                <span id="${this._headingId}" class="civ-heading-lg civ-m-0" role="heading" aria-level="${this.headingLevel}">${this.heading}</span>
              ` : nothing}
              ${!this.noCloseButton ? renderCloseButton({
                label: t('closeLabel'),
                onClick: this._requestClose,
                extraClass: 'civ-drawer__close',
              }) : nothing}
            </div>
          ` : nothing}
          <div class="civ-drawer__content" data-civ-drawer-content></div>
          ${hasFooter ? html`
            <div class="${footerClasses}" data-civ-drawer-footer></div>
          ` : nothing}
        </div>
      </dialog>
    `;
  }

  private async _onOpen(): Promise<void> {
    this._previouslyFocused = document.activeElement;
    this._priorBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    try {
      await this.updateComplete;
      const dialog = this.querySelector('dialog') as HTMLDialogElement | null;
      if (dialog && !dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    } catch (err) {
      console.error('civ-drawer: failed to open dialog', err);
    }
  }

  private _onClose(): void {
    const dialog = this.querySelector('dialog') as HTMLDialogElement | null;
    if (dialog?.open && typeof dialog.close === 'function') {
      dialog.close();
    }

    document.body.style.overflow = this._priorBodyOverflow;
    this._priorBodyOverflow = '';

    if (this._previouslyFocused instanceof HTMLElement) {
      requestAnimationFrame(() => {
        (this._previouslyFocused as HTMLElement)?.focus();
        this._previouslyFocused = null;
      });
    }
  }

  private _onCancel(e: Event): void {
    if (this.noEscapeClose) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    this._requestClose();
  }

  private _onNativeClose(): void {
    if (this.open) {
      this._requestClose();
    }
  }

  private _onDialogClick(e: MouseEvent): void {
    const dialog = this.querySelector('dialog');
    if (!dialog || this.noBackdropClose) return;
    if (e.target === dialog) {
      this._requestClose();
    }
  }

  private _requestClose(): void {
    dispatch(this, 'civ-drawer-close');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-drawer': CivDrawer;
  }
}
