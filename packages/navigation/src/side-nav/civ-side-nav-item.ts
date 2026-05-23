// Schema: packages/schema/src/components/civ-side-nav-item.schema.ts

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, sanitizeHref, dispatch } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Side Nav Item
 *
 * One row inside `<civ-side-nav>`. Two render modes — chosen
 * automatically based on whether the item has nested
 * `<civ-side-nav-item>` children:
 *
 * **Leaf** (no nested children): renders as `<a href>` link, or
 * `<span aria-disabled="true">` when `disabled`. The current page
 * sets `current` — that row gets `aria-current="page"` and a
 * leading-edge primary-color accent rail.
 *
 * **Parent / section** (has nested children): renders as a
 * `<button aria-expanded>` disclosure with a leading chevron caret
 * that rotates 90° on open. Click anywhere on the row toggles. The
 * nested `<ul>` is hidden via `hidden` when collapsed. Parents are
 * **disclosure-only** — `href` on a parent with children is
 * ignored; if you need a section to also be a link target, render
 * the section's landing page as the first child link inside.
 *
 * **Auto-expand**: on first paint, any parent containing a
 * descendant with `current` is automatically expanded so the
 * active page is visible in the rail without consumer wiring.
 * After first paint, the parent's `open` state is independent —
 * the consumer (or the user) drives it.
 *
 * Nested items live in the default slot. The sublist `<ul>` is
 * rendered unconditionally but stays hidden via `:empty` (leaf
 * mode) or `hidden` (collapsed parent), so items with no children
 * remain structurally clean.
 *
 * @element civ-side-nav-item
 *
 * @prop {string} label - Visible row text. Required.
 * @prop {string} href - Destination URL. Ignored when the item has nested children.
 * @prop {boolean} current - Mark as the active page. Sets `aria-current="page"` on leaf rows and applies the active-rail visual.
 * @prop {boolean} disabled - Disabled state — strips href on leaf rows, sets `aria-disabled`, applies disabled styling.
 * @prop {boolean} open - Whether the disclosure panel is expanded. Only meaningful on parents with nested children.
 *
 * @slot - Nested `<civ-side-nav-item>` children for sub-sections.
 *
 * @fires civ-toggle - When a parent row's expand state changes. Non-bubbling, mirrors civ-disclosure / civ-accordion-item.
 * @fires civ-analytics - On link activation or expand-state change.
 */
@customElement('civ-side-nav-item')
export class CivSideNavItem extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: Boolean, reflect: true }) current = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Whether this item renders as a disclosure parent (has nested
   * side-nav-item children) vs. a leaf link. Computed in
   * `connectedCallback` from the authored DOM — children are still
   * at the item's top level there, before the LightDomSlotMixin
   * moves them into the inner `<ul>`. We re-check on every render
   * by looking for any descendant `civ-side-nav-item`.
   */
  @state() private _hasChildren = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-side-nav-item-children]' };
  }

  override connectedCallback(): void {
    // Detect nested children BEFORE LightDomSlotMixin's
    // `_captureChildren` (inside `super.connectedCallback`)
    // removes them from our light DOM. After capture, querying
    // for `civ-side-nav-item` descendants returns nothing until
    // `_relocateSlots()` re-attaches them into the rendered UL.
    this._hasChildren = this.querySelector('civ-side-nav-item') !== null;
    super.connectedCallback();
    // The parent `<civ-side-nav>` renders a `<ul>` and expects
    // `<li role="listitem">` children. Setting role on the host so
    // the rendered HTML reads correctly when AT walks the list.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // Auto-expand if any descendant has `current` and the consumer
    // didn't explicitly set `open` in markup. Reads from the
    // querySelector descendant scan (current reflects to attr).
    if (this._hasChildren && !this.hasAttribute('open')) {
      const hasCurrentDescendant = this.querySelector('civ-side-nav-item[current]') !== null;
      if (hasCurrentDescendant) this.open = true;
    }
  }

  override updated(changes: Map<PropertyKey, unknown>): void {
    super.updated(changes);
    // Dispatch civ-toggle on every open transition after first paint.
    // changes.get('open') === undefined indicates the initial set
    // (Lit's first-update bookkeeping), so skip dispatch on mount.
    if (changes.has('open') && changes.get('open') !== undefined) {
      dispatch(this, 'civ-toggle', { open: this.open });
      this.sendAnalytics('change', { open: this.open });
    }
  }

  private get _linkClasses(): string {
    return [
      'civ-side-nav__link',
      this.current ? 'civ-side-nav__link--current' : '',
      this.disabled ? 'civ-side-nav__link--disabled' : '',
    ].filter(Boolean).join(' ');
  }

  private get _triggerClasses(): string {
    return [
      'civ-side-nav__trigger',
      this.open ? 'civ-side-nav__trigger--open' : '',
      this.disabled ? 'civ-side-nav__trigger--disabled' : '',
    ].filter(Boolean).join(' ');
  }

  private _onLinkClick(): void {
    this.sendAnalytics('click');
  }

  private _onToggle(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    this.open = !this.open;
  }

  override render() {
    if (this._hasChildren) {
      // Parent / section — disclosure button + collapsible sublist.
      // `href` is intentionally ignored on parents per the
      // disclosure-only contract.
      return html`
        <button
          type="button"
          class="${this._triggerClasses}"
          aria-expanded="${this.open ? 'true' : 'false'}"
          ?disabled="${this.disabled}"
          @click="${this._onToggle}"
        >
          <civ-icon
            class="civ-side-nav__caret"
            name="chevron-right"
            aria-hidden="true"
          ></civ-icon>
          <span class="civ-side-nav__trigger-label">${this.label}</span>
        </button>
        <ul
          class="civ-side-nav__sublist"
          data-civ-side-nav-item-children
          ?hidden="${!this.open}"
        ></ul>
      `;
    }

    // Leaf — link (or disabled span).
    const link = this.disabled
      ? html`<span class="${this._linkClasses}" aria-disabled="true">${this.label}</span>`
      : html`<a
          class="${this._linkClasses}"
          href="${sanitizeHref(this.href)}"
          aria-current="${this.current ? 'page' : nothing}"
          @click="${this._onLinkClick}"
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
