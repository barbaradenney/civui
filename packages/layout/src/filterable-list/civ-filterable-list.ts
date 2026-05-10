import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, announce, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Filterable List
 *
 * A filtering controller that coordinates slotted filter controls with a
 * slotted list of items. The component is opinionated about filtering
 * behavior (search, named filters, AND composition, result counts,
 * screen-reader announcements) but unopinionated about filter UI — the
 * consumer provides whatever controls they want in the filter zone.
 *
 * ## How filtering works
 *
 * - Events (`civ-input`, `civ-change`) bubble from slotted filter controls.
 * - **Search inputs** (`type="search"` or `data-filterable-list-search`):
 *   text matched case-insensitively against `data-filter` attribute,
 *   `heading` prop, or `textContent` on each item.
 * - **Named controls** (controls with a `name` attribute): value matched
 *   against `data-filter-{name}` on items (e.g., `name="letter"` →
 *   `data-filter-letter`).
 * - Multiple filters compose with AND logic.
 *
 * @element civ-filterable-list
 *
 * @prop {string} label - Accessible label for the region.
 * @prop {string} noResultsMessage - Shown when zero items match.
 * @prop {number} announceDelay - Debounce ms for SR announcements.
 * @prop {boolean} resultCountHidden - Hide visible count.
 * @prop {string} filterAttribute - Attribute on items for text search.
 *
 * @fires civ-filter - After each filter pass: { query, matchCount, totalCount }
 *
 * @slot filters - Filter controls (via `data-filterable-list-filters`).
 * @slot - List content (typically `<civ-list>` with `<civ-list-item>`).
 */
@customElement('civ-filterable-list')
export class CivFilterableList extends LightDomSlotMixin(CivBaseElement) {
  /** Accessible label for the region. */
  @property({ type: String }) label = '';

  /** Message shown when zero items match. */
  @property({ attribute: 'no-results-message' }) noResultsMessage = '';

  /** Debounce in ms before result count is announced to screen readers. */
  @property({ type: Number, attribute: 'announce-delay' }) announceDelay = 300;

  /** When true, suppresses visible result count (SR still announces). */
  @property({ type: Boolean, attribute: 'result-count-hidden' }) resultCountHidden = false;

  /** Attribute name on items that holds searchable text. */
  @property({ attribute: 'filter-attribute' }) filterAttribute = 'data-filter';

  @state() private _matchCount = 0;
  @state() private _totalCount = 0;
  @state() private _hasActiveFilters = false;

  private _filters = new Map<string, (item: Element) => boolean>();
  private _searchQuery = '';
  private _announceTimer: ReturnType<typeof setTimeout> | null = null;
  private _observer: MutationObserver | null = null;

  /** Number of currently visible items. */
  get matchCount(): number { return this._matchCount; }

  /** Total number of filterable items. */
  get totalCount(): number { return this._totalCount; }

  override _getSlotConfig(): SlotConfig {
    return {
      'data-filterable-list-filters': '[data-civ-filterable-list-filters]',
      default: '[data-civ-filterable-list-content]',
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-input', this._onFilterInput as EventListener);
    this.addEventListener('civ-change', this._onFilterChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-input', this._onFilterInput as EventListener);
    this.removeEventListener('civ-change', this._onFilterChange as EventListener);
    if (this._announceTimer) clearTimeout(this._announceTimer);
    this._observer?.disconnect();
  }

  override firstUpdated(): void {
    this._relocateSlots();
    const contentZone = this.querySelector('[data-civ-filterable-list-content]');
    if (contentZone) {
      // Seed counts from a microtask so the state mutation is scheduled
      // outside the current update cycle (Lit warns when reactive state
      // mutates synchronously inside firstUpdated/updated). Then attach
      // the MutationObserver for runtime changes from the consumer.
      queueMicrotask(() => {
        const items = this._getFilterableItems();
        this._totalCount = items.length;
        this._matchCount = items.length;
      });
      this._observer = new MutationObserver(() => this._applyFilters());
      this._observer.observe(contentZone, { childList: true, subtree: true });
    }
  }

  // ── Public API ──────────────────────────────────────────────

  /** Apply a text search programmatically. */
  search(query: string): void {
    this._searchQuery = query.trim();
    if (this._searchQuery) {
      this._filters.set('__search__', (item) => this._textMatch(item, this._searchQuery));
    } else {
      this._filters.delete('__search__');
    }
    this._applyFilters();
  }

  /** Set a named filter programmatically. */
  setFilter(name: string, value: string | string[]): void {
    const attrName = `data-filter-${name}`;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        this._filters.delete(name);
      } else {
        this._filters.set(name, (item) => value.includes(item.getAttribute(attrName) ?? ''));
      }
    } else if (!value) {
      this._filters.delete(name);
    } else {
      this._filters.set(name, (item) => item.getAttribute(attrName) === value);
    }
    this._applyFilters();
  }

  /** Clear a specific named filter. */
  clearFilter(name: string): void {
    this._filters.delete(name);
    this._applyFilters();
  }

  /** Clear all filters and show all items. */
  clearAllFilters(): void {
    this._filters.clear();
    this._searchQuery = '';
    this._applyFilters();
  }

  // ── Render ──────────────────────────────────────────────────

  override render() {
    const showNoResults = this._matchCount === 0 && this._hasActiveFilters;
    const showCount = !this.resultCountHidden && this._hasActiveFilters && !showNoResults;
    const noResultsText = this.noResultsMessage || t('filterableListNoResults');

    return html`
      <div
        class="civ-filterable-list"
        role="region"
        aria-label="${this.label || nothing}"
      >
        <div class="civ-filterable-list__filters" data-civ-filterable-list-filters></div>

        <div
          class="civ-filterable-list__status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          ${showCount ? html`
            <p class="civ-filterable-list__count civ-text-sm civ-text-base-dark civ-py-2 civ-m-0">
              ${this._statusText}
            </p>
          ` : nothing}
          ${showNoResults ? html`
            <p class="civ-filterable-list__no-results civ-py-4 civ-m-0">
              ${noResultsText}
            </p>
          ` : nothing}
        </div>

        <div class="civ-filterable-list__content" data-civ-filterable-list-content></div>
      </div>
    `;
  }

  // ── Internal ────────────────────────────────────────────────

  private get _statusText(): string {
    if (this._matchCount === this._totalCount) {
      return t('filterableListShowingAll').replace('{total}', String(this._totalCount));
    }
    return t('filterableListShowingCount')
      .replace('{count}', String(this._matchCount))
      .replace('{total}', String(this._totalCount));
  }

  private _onFilterInput = (e: CustomEvent): void => {
    const target = e.composedPath()[0] as HTMLElement;
    if (!this._isInFilterZone(target)) return;

    if (this._isSearchSource(target)) {
      this._searchQuery = (e.detail?.value ?? '').trim();
      if (this._searchQuery) {
        this._filters.set('__search__', (item) => this._textMatch(item, this._searchQuery));
      } else {
        this._filters.delete('__search__');
      }
      this._applyFilters();
    }
  };

  private _onFilterChange = (e: CustomEvent): void => {
    const target = e.composedPath()[0] as HTMLElement;
    if (!this._isInFilterZone(target)) return;
    if (this._isSearchSource(target)) return;

    const name = target.getAttribute('name');
    if (!name) return;

    const value = e.detail?.value;
    const attrName = `data-filter-${name}`;

    if (!value || (Array.isArray(value) && value.length === 0)) {
      this._filters.delete(name);
    } else if (Array.isArray(value)) {
      this._filters.set(name, (item) => value.includes(item.getAttribute(attrName) ?? ''));
    } else {
      this._filters.set(name, (item) => item.getAttribute(attrName) === value);
    }
    this._applyFilters();
  };

  private _applyFilters(): void {
    const items = this._getFilterableItems();
    this._totalCount = items.length;
    this._hasActiveFilters = this._filters.size > 0;

    let matchCount = 0;
    for (const item of items) {
      const matches = this._filters.size === 0 ||
        [...this._filters.values()].every(fn => fn(item));
      if (matches) {
        item.removeAttribute('hidden');
        matchCount++;
      } else {
        item.setAttribute('hidden', '');
      }
    }

    this._matchCount = matchCount;

    // If the currently focused element was hidden, move focus to first visible item
    const active = document.activeElement;
    if (active && active.hasAttribute('hidden') && this.contains(active)) {
      const firstVisible = items.find(i => !i.hasAttribute('hidden'));
      if (firstVisible instanceof HTMLElement) {
        firstVisible.focus();
      }
    }

    // Update host attribute for CSS hooks
    if (matchCount === 0 && this._hasActiveFilters) {
      this.setAttribute('data-civ-no-results', '');
    } else {
      this.removeAttribute('data-civ-no-results');
    }

    // Debounced SR announcement
    if (this._announceTimer) clearTimeout(this._announceTimer);
    if (this._hasActiveFilters) {
      this._announceTimer = setTimeout(() => {
        if (matchCount === 0) {
          announce(this.noResultsMessage || t('filterableListNoResults'));
        } else {
          announce(
            t('filterableListResultAnnouncement').replace('{count}', String(matchCount)),
          );
        }
      }, this.announceDelay);
    }

    // Dispatch filter event
    this.dispatchEvent(new CustomEvent('civ-filter', {
      bubbles: true,
      composed: true,
      detail: {
        query: this._searchQuery,
        matchCount,
        totalCount: items.length,
      },
    }));
  }

  private _getFilterableItems(): Element[] {
    const contentZone = this.querySelector('[data-civ-filterable-list-content]');
    if (!contentZone) return [];
    return Array.from(contentZone.querySelectorAll(`[${this.filterAttribute}]`));
  }

  private _textMatch(item: Element, query: string): boolean {
    const lowerQuery = query.toLowerCase();
    // Check the filter attribute
    const filterText = item.getAttribute(this.filterAttribute) ?? '';
    if (filterText.toLowerCase().includes(lowerQuery)) return true;
    // Fallback: heading prop (e.g. civ-list-item exposes a `heading` field)
    const heading = (item as { heading?: unknown }).heading;
    if (typeof heading === 'string' && heading.toLowerCase().includes(lowerQuery)) return true;
    // Fallback: text content
    return (item.textContent ?? '').toLowerCase().includes(lowerQuery);
  }

  private _isInFilterZone(el: HTMLElement): boolean {
    const filterZone = this.querySelector('[data-civ-filterable-list-filters]');
    return !!filterZone?.contains(el);
  }

  private _isSearchSource(el: HTMLElement): boolean {
    return el.hasAttribute('data-filterable-list-search') ||
      (el.tagName.toLowerCase() === 'civ-text-input' &&
        el.getAttribute('type') === 'search');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-filterable-list': CivFilterableList;
  }
}
