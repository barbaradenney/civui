import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, isSafeHref } from '@civui/core';

/**
 * CivUI Menu Item
 *
 * Individual item inside a `<civ-menu>`. Renders as a `<button>` by default,
 * or as an `<a>` when `href` is set. The host listens for clicks at the
 * panel level and dispatches `civ-menu-select`, so consumers do not need
 * to wire per-item handlers — but a native `click` event still fires on
 * the item if a more granular listener is desired.
 *
 * @element civ-menu-item
 *
 * @prop {boolean} disabled - When true, the item is non-interactive and skipped during keyboard navigation.
 * @prop {boolean} destructive - Apply destructive (red) styling for delete-style actions.
 * @prop {string} href - When set, the item renders as an `<a>` link instead of a `<button>`.
 * @prop {string} value - Stable identifier surfaced in the parent menu's `civ-menu-select` event detail.
 *
 * @slot icon - Optional leading icon (e.g. `<civ-icon name="edit">`).
 * @slot - The item label.
 *
 * @example
 * ```html
 * <civ-menu-item value="edit">
 *   <civ-icon name="edit" slot="icon"></civ-icon>
 *   Edit
 * </civ-menu-item>
 * ```
 */
@customElement('civ-menu-item')
export class CivMenuItem extends CivBaseElement {
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) destructive = false;
  @property({ type: String }) href = '';
  @property({ type: String }) value = '';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    // Roving tabindex — arrow-key navigation moves focus; only the active
    // item is reachable via Tab from outside the menu.
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('disabled')) {
      if (this.disabled) {
        this.setAttribute('aria-disabled', 'true');
        this.setAttribute('tabindex', '-1');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
  }

  override focus(options?: FocusOptions): void {
    // Forward focus to the inner button/anchor so native focus styling
    // and keyboard activation work without a custom focus ring on the host.
    const inner = this.querySelector<HTMLElement>(
      '.civ-menu-item__inner',
    );
    inner?.focus(options);
  }

  override render() {
    const inner = this._renderInner();
    return inner;
  }

  private _renderInner() {
    const classes = [
      'civ-menu-item__inner',
      this.destructive ? 'civ-menu-item__inner--destructive' : '',
    ].filter(Boolean).join(' ');

    if (this.href) {
      const safeHref = isSafeHref(this.href) ? this.href : '#';
      return html`
        <a
          class="${classes}"
          href="${safeHref}"
          ?aria-disabled="${this.disabled}"
          tabindex="-1"
          @click="${this._onActivate}"
        >
          <span class="civ-menu-item__icon"><slot name="icon"></slot></span>
          <span class="civ-menu-item__label"><slot></slot></span>
        </a>
      `;
    }
    return html`
      <button
        type="button"
        class="${classes}"
        ?disabled="${this.disabled}"
        tabindex="-1"
        @click="${this._onActivate}"
      >
        <span class="civ-menu-item__icon"><slot name="icon"></slot></span>
        <span class="civ-menu-item__label"><slot></slot></span>
      </button>
    `;
  }

  private _onActivate(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Click bubbles up to civ-menu which handles selection + close.
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-menu-item': CivMenuItem;
  }
}
