// Schema: packages/schema/src/components/civ-side-nav-item.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, sanitizeHref } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Side Nav Item
 *
 * A single link inside `<civ-side-nav>`. Renders as `<a href>` by
 * default; as a non-interactive `<span aria-disabled="true">` when
 * `disabled`. The current page should set `current` — that item
 * gets `aria-current="page"` plus a leading-edge primary-color
 * accent rail.
 *
 * Nested items: place additional `<civ-side-nav-item>` elements
 * inside the default slot. They render as an indented sub-list
 * under the parent's link. The sub-list `<ul>` is rendered
 * unconditionally but hidden via `:empty` when no nested items
 * are slotted, so items with no children stay clean structurally.
 *
 * @element civ-side-nav-item
 *
 * @prop {string} label - Visible link text. Required.
 * @prop {string} href - Destination URL.
 * @prop {boolean} current - Mark as the active page. Sets
 *   `aria-current="page"` and applies the active-state visual.
 * @prop {boolean} disabled - Disabled state — strips the href,
 *   sets `aria-disabled`, applies disabled styling.
 *
 * @slot - Nested `<civ-side-nav-item>` children for sub-sections.
 *
 * @fires civ-analytics - On link activation
 */
@customElement('civ-side-nav-item')
export class CivSideNavItem extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: Boolean, reflect: true }) current = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-side-nav-item-children]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // The parent `<civ-side-nav>` renders a `<ul>` and expects
    // `<li role="listitem">` children. Setting role on the host so
    // the rendered HTML reads correctly when AT walks the list.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  private get _classes(): string {
    return [
      'civ-side-nav__link',
      this.current ? 'civ-side-nav__link--current' : '',
      this.disabled ? 'civ-side-nav__link--disabled' : '',
    ].filter(Boolean).join(' ');
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }

  override render() {
    const link = this.disabled
      ? html`<span class="${this._classes}" aria-disabled="true">${this.label}</span>`
      : html`<a
          class="${this._classes}"
          href="${sanitizeHref(this.href)}"
          aria-current="${this.current ? 'page' : nothing}"
          @click="${this._onClick}"
        >${this.label}</a>`;

    return html`
      ${link}
      <ul class="civ-side-nav__sublist" data-civ-side-nav-item-children></ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-side-nav-item': CivSideNavItem;
  }
}
