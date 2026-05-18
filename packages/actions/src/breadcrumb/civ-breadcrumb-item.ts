import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, sanitizeHref } from '@civui/core';

/**
 * CivUI Breadcrumb Item
 *
 * A single link in a `<civ-breadcrumb>` trail. Renders as `<a href>` for
 * navigable steps and as a non-link `<span aria-current="page">` when
 * `current` is set or `href` is omitted — the latter is the convention
 * for the final crumb (the page the user is on).
 *
 * Item label is set via `label` (preferred) or initial child text.
 *
 * @element civ-breadcrumb-item
 *
 * @prop {string} label - Visible item text. Falls back to initial child text
 * @prop {string} href - Destination URL. Omit on the last item, or set `current` to render as a non-link
 * @prop {boolean} current - Mark as the current page. Forces non-link rendering with `aria-current="page"`
 *
 * @fires civ-analytics - On link activation
 */
@customElement('civ-breadcrumb-item')
export class CivBreadcrumbItem extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: Boolean, reflect: true }) current = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  private get _text(): string {
    return this.label || this._initialText;
  }

  private get _safeHref(): string {
    return sanitizeHref(this.href);
  }

  override render() {
    const text = this._text;
    if (this.current || !this._safeHref) {
      return html`
        <span
          class="civ-breadcrumb__current"
          aria-current="${this.current ? 'page' : nothing}"
        >${text}</span>
      `;
    }
    return html`
      <a
        class="civ-breadcrumb__link"
        href="${this._safeHref}"
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
    'civ-breadcrumb-item': CivBreadcrumbItem;
  }
}
