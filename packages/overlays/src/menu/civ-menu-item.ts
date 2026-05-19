import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, isSafeHref } from '@civui/core';

/**
 * CivUI Menu Item
 *
 * Individual item inside a `<civ-menu>`. Renders as a `<button>` by default,
 * or as an `<a>` when `href` is set. The parent `<civ-menu>` listens for
 * clicks at the panel level and dispatches `civ-menu-select`, so consumers
 * do not need to wire per-item handlers.
 *
 * **Label.** Set the visible text via the `label` attribute. The item also
 * accepts text content (`<civ-menu-item>Edit</civ-menu-item>`) as a
 * convenience — the text is captured on first connect and used when
 * `label` is not set.
 *
 * **Icon.** Pass `icon="<name>"` to render a leading icon from the global
 * icon library. The icon slot from the previous draft was removed because
 * `<slot>` elements don't project content in Light DOM.
 *
 * @element civ-menu-item
 *
 * @prop {string} label - Visible item label. Takes precedence over text content.
 * @prop {boolean} disabled - When true, the item is non-interactive and skipped during keyboard navigation.
 * @prop {boolean} destructive - Apply destructive (red) styling for delete-style actions.
 * @prop {string} href - When set, the item renders as an `<a>` link instead of a `<button>`.
 * @prop {string} value - Stable identifier surfaced in the parent menu's `civ-menu-select` event detail.
 * @prop {string} icon - Optional leading icon name (resolved via the global icon library).
 *
 * @example
 * ```html
 * <civ-menu-item value="edit" icon="edit">Edit</civ-menu-item>
 * <civ-menu-item value="delete" icon="delete" destructive label="Delete"></civ-menu-item>
 * ```
 */
@customElement('civ-menu-item')
export class CivMenuItem extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) destructive = false;
  @property({ type: String }) href = '';
  @property({ type: String }) value = '';
  @property({ type: String }) icon = '';

  override connectedCallback(): void {
    // LightDomTextMixin captures authored text content into `_initialText`
    // AND clears it from the host before Lit's first render. Without the
    // clear, the original text would sit alongside Lit's rendered button,
    // duplicating the label visually ("Edit Edit" in each menu item).
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
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
    const inner = this.querySelector<HTMLElement>('.civ-menu-item__inner');
    inner?.focus(options);
  }

  private get _displayLabel(): string {
    return this.label || this._initialText;
  }

  override render() {
    const classes = [
      'civ-menu-item__inner',
      this.destructive ? 'civ-menu-item__inner--destructive' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const iconNode = this.icon
      ? html`<civ-icon name="${this.icon}" aria-hidden="true" class="civ-menu-item__icon"></civ-icon>`
      : nothing;
    const labelNode = html`<span class="civ-menu-item__label">${this._displayLabel}</span>`;

    if (this.href) {
      const safeHref = isSafeHref(this.href) ? this.href : '#';
      return html`
        <a
          class="${classes}"
          href="${safeHref}"
          ?aria-disabled="${this.disabled}"
          tabindex="-1"
          @click="${this._onActivate}"
        >${iconNode}${labelNode}</a>
      `;
    }
    return html`
      <button
        type="button"
        class="${classes}"
        ?disabled="${this.disabled}"
        tabindex="-1"
        @click="${this._onActivate}"
      >${iconNode}${labelNode}</button>
    `;
  }

  private _onActivate(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Otherwise click bubbles to civ-menu which handles selection + close.
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-menu-item': CivMenuItem;
  }
}
