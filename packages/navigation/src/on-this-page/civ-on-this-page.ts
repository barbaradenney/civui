// Schema: packages/schema/src/components/civ-on-this-page.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivOnThisPageItem } from './civ-on-this-page-item.js';

/**
 * CivUI On This Page
 *
 * In-page navigation ("table of contents") — a vertical list of
 * anchor links pointing at section headings in the current page.
 * `IntersectionObserver` tracks which heading is currently in the
 * viewport and flips the matching item's `active` flag so the
 * highlight follows the reader's scroll position.
 *
 * **Two usage modes**:
 *
 * 1. **Auto-detect** (default) — leave the default slot empty
 *    and the component scans for `h2[id], h3[id]` (configurable
 *    via `selector`) within the `scopeSelector` ancestor (default
 *    `main, article, body` — the first match wins). For each
 *    heading found, a `<civ-on-this-page-item>` is created
 *    pointing at `#{heading.id}` with the heading's text content
 *    as the label.
 *
 * 2. **Manual** — slot explicit `<civ-on-this-page-item>` children.
 *    Auto-detection is skipped; you control the list. Useful when
 *    headings live outside the scope element, when you want a
 *    different label, or when you want to skip some headings.
 *
 * @element civ-on-this-page
 *
 * @prop {string} label - Visible heading + accessible name for
 *   the navigation landmark. Default: "On this page".
 * @prop {string} selector - CSS selector for the headings to track.
 *   Default: `h2[id], h3[id]`.
 * @prop {string} scopeSelector - CSS selector for the ancestor
 *   that contains the headings. The first match wins. Default:
 *   `main, article, body`.
 *
 * @slot - Optional explicit `<civ-on-this-page-item>` children;
 *   when present, disables auto-detection.
 *
 * @example
 * ```html
 * <!-- Auto-detect mode -->
 * <civ-on-this-page label="On this page"></civ-on-this-page>
 *
 * <!-- Manual mode -->
 * <civ-on-this-page label="Sections">
 *   <civ-on-this-page-item href="#intro" label="Introduction"></civ-on-this-page-item>
 *   <civ-on-this-page-item href="#usage" label="Usage"></civ-on-this-page-item>
 * </civ-on-this-page>
 * ```
 */
@customElement('civ-on-this-page')
export class CivOnThisPage extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = 'On this page';
  @property({ type: String }) selector = 'h2[id], h3[id]';
  @property({ type: String, attribute: 'scope-selector' }) scopeSelector = 'main, article, body';

  private _observer?: IntersectionObserver;
  /** Map from heading id → corresponding civ-on-this-page-item element. */
  private _itemsById = new Map<string, CivOnThisPageItem>();
  /** Stack of currently-visible heading ids, in DOM order. */
  private _visibleIds = new Set<string>();

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-on-this-page-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // If no items were slotted, run auto-detection now that the
    // template's <ul> container is in the DOM.
    if (this._slottedChildren.get('default')?.length === 0) {
      this._autoDetect();
    }
    this._wireObserver();
  }

  /**
   * Scan for headings matching `selector` inside the first
   * matching `scopeSelector` element and append a
   * `<civ-on-this-page-item>` for each one. Runs only when the
   * consumer didn't supply explicit items.
   */
  private _autoDetect(): void {
    const scope = document.querySelector(this.scopeSelector);
    if (!scope) return;
    const headings = scope.querySelectorAll<HTMLElement>(this.selector);
    const list = this.querySelector('[data-civ-on-this-page-content]');
    if (!list) return;
    for (const heading of Array.from(headings)) {
      if (!heading.id) continue;
      const item = document.createElement('civ-on-this-page-item') as CivOnThisPageItem;
      item.href = `#${heading.id}`;
      item.label = heading.textContent?.trim() ?? '';
      list.appendChild(item);
    }
  }

  /**
   * Set up `IntersectionObserver` to track which headings are
   * currently in the viewport. The item closest to the top of
   * the visible region is marked `active`.
   *
   * `rootMargin` is tuned so a heading scrolling INTO view from
   * below activates when it crosses the top third of the
   * viewport — keeps the highlight ahead of the reader rather
   * than following them.
   */
  private _wireObserver(): void {
    // Collect the item ↔ heading mapping from whatever's in the
    // list now (whether slotted or auto-detected).
    const items = Array.from(
      this.querySelectorAll<CivOnThisPageItem>('civ-on-this-page-item'),
    );
    this._itemsById.clear();
    const headingsToWatch: HTMLElement[] = [];
    for (const item of items) {
      const id = item.href.replace(/^#/, '');
      if (!id) continue;
      const heading = document.getElementById(id);
      if (!heading) continue;
      this._itemsById.set(id, item);
      headingsToWatch.push(heading);
    }
    if (headingsToWatch.length === 0) return;

    // Seed the highlight before the first IntersectionObserver callback
    // fires. Without this, the rail renders with no `current` item until
    // the user scrolls — which is wrong both for the at-top initial
    // state (the user is reading the first section) and for the case
    // where the user lands on a fragment URL (the linked section is
    // already in view, but it stays unhighlighted until they nudge the
    // scroll position). The observer's first batch will reconcile this
    // with whatever is actually visible.
    if (items.length > 0 && !items.some((i) => i.current)) {
      items[0].current = true;
    }

    // jsdom and very old browsers don't implement IntersectionObserver —
    // skip observer setup; the rail still renders, just without
    // scroll-position tracking.
    if (typeof IntersectionObserver === 'undefined') return;

    this._observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) this._visibleIds.add(id);
          else this._visibleIds.delete(id);
        }
        this._highlight(headingsToWatch);
      },
      // Top trigger zone: when a heading crosses the top 1/3 of
      // the viewport. The negative bottom margin clips the
      // bottom 2/3 from being considered "visible" so multiple
      // headings on screen don't all light up.
      { rootMargin: '0px 0px -66% 0px', threshold: 0 },
    );

    for (const heading of headingsToWatch) {
      this._observer.observe(heading);
    }
  }

  /**
   * Pick the topmost visible heading and mark its item active.
   * Falls back to the last-active item if nothing is in view
   * (e.g. user scrolled past all headings), so the rail keeps
   * showing the last-known section instead of clearing.
   */
  private _highlight(headingsInOrder: HTMLElement[]): void {
    const firstVisible = headingsInOrder.find((h) => this._visibleIds.has(h.id));
    if (!firstVisible) return; // keep the previous active item
    for (const [id, item] of this._itemsById.entries()) {
      item.current = id === firstVisible.id;
    }
  }

  override render() {
    // Always name the landmark — even when the consumer opts out of
    // the visible heading by passing `label=""`. An unnamed <nav>
    // landmark can't be distinguished by AT users from any other
    // <nav> on the page.
    const landmarkLabel = this.label || 'On this page';
    return html`
      <nav class="civ-on-this-page" aria-label="${landmarkLabel}">
        ${this.label
          ? html`<p class="civ-on-this-page__heading">${this.label}</p>`
          : null}
        <ul class="civ-on-this-page__list" data-civ-on-this-page-content></ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-on-this-page': CivOnThisPage;
  }
}
