import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, sanitizeHref } from '@civui/core';

/**
 * CivUI Nav Item
 *
 * A single link inside `<civ-nav>`. Renders as `<a href>` by default
 * and as a non-interactive `<span>` with `aria-disabled` when
 * `disabled` is set. The active item should set `current` — it gets
 * `aria-current="page"` and visual emphasis.
 *
 * @element civ-nav-item
 *
 * @prop {string} label - Visible link text. Falls back to initial child text
 * @prop {string} href - Destination URL
 * @prop {boolean} current - Mark as the active page. Sets `aria-current="page"` and adds the active-state visual style
 * @prop {boolean} disabled - Disabled state — strips the href, sets `aria-disabled`, and applies disabled styling
 *
 * @fires civ-analytics - On link activation
 */
@customElement('civ-nav-item')
export class CivNavItem extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: Boolean, reflect: true }) current = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _classes(): string {
    return [
      'civ-nav__link',
      this.current ? 'civ-nav__link--current' : '',
      this.disabled ? 'civ-nav__link--disabled' : '',
    ].filter(Boolean).join(' ');
  }

  override render() {
    const text = this._text;
    if (this.disabled) {
      return html`
        <span class="${this._classes}" aria-disabled="true">${text}</span>
      `;
    }
    return html`
      <a
        class="${this._classes}"
        href="${sanitizeHref(this.href)}"
        aria-current="${this.current ? 'page' : nothing}"
        @click="${this._onClick}"
      >${text}</a>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-nav-item': CivNavItem;
  }
}
