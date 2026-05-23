// Schema: packages/schema/src/components/civ-on-this-page-item.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, sanitizeHref } from '@civui/core';

/**
 * CivUI On This Page Item
 *
 * A single anchor link inside `<civ-on-this-page>`. Renders as
 * `<a href="#fragment">`. The parent `<civ-on-this-page>` flips
 * `active` on the item whose target heading is currently in the
 * viewport via `IntersectionObserver` — consumers don't set
 * `active` themselves.
 *
 * @element civ-on-this-page-item
 *
 * @prop {string} label - Visible link text. Falls back to initial
 *   child text if not provided.
 * @prop {string} href - Fragment URL (e.g. `#installation`). The
 *   parent reads this to locate the corresponding heading element.
 * @prop {boolean} active - Set by the parent when this item's
 *   target heading is the closest one currently in the viewport.
 *   Reflects to `aria-current="location"` and a visual indicator.
 *
 * @fires civ-analytics - On link activation
 */
@customElement('civ-on-this-page-item')
export class CivOnThisPageItem extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: Boolean, reflect: true }) active = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  private get _text(): string {
    return this.label || this._initialText;
  }

  private _onClick(e: MouseEvent): void {
    this.sendAnalytics('click');
    // Smooth-scroll the target into view unless the user prefers
    // reduced motion. We let the default <a> navigation update the
    // URL fragment after — consumers can rely on `window.location
    // .hash` for deep linking.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = this.href.replace(/^#/, '');
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    // Manually update the URL hash since we preventDefault'd the
    // browser's default jump. Sanitize first — a programmatically-set
    // `javascript:` href would otherwise be written into the URL bar.
    history.pushState(null, '', sanitizeHref(this.href));
  }

  override render() {
    return html`
      <a
        class="civ-on-this-page__link ${this.active ? 'civ-on-this-page__link--active' : ''}"
        href="${sanitizeHref(this.href)}"
        aria-current="${this.active ? 'location' : nothing}"
        @click="${this._onClick}"
      >${this._text}</a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-on-this-page-item': CivOnThisPageItem;
  }
}
