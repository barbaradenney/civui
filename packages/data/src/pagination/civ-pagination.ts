import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t } from '@civui/core';
import '@civui/actions/action-button';

/**
 * CivUI Pagination
 *
 * USWDS-style pagination control. Renders:
 * - "Showing X–Y of Z items" status (aria-live="polite")
 * - Page-size selector ("Show 25 per page")
 * - Previous / Next buttons
 * - Page-number buttons with truncation (1 2 … 5 [6] 7 … 10)
 *
 * The component is controlled by default — the consumer sets `total-items`,
 * `page-size`, and `page`, and listens for `civ-page-change` to update its
 * own state. The component never mutates its own page/pageSize without
 * dispatching an event first.
 *
 * On viewports ≤480px the page-number row is hidden and only Previous,
 * Next, and the page-size selector remain visible. The current-page-of-N
 * status is still announced.
 *
 * @element civ-pagination
 *
 * @prop {number} totalItems - Total item count across all pages. Required.
 * @prop {number} pageSize - Items per page. Defaults to 25.
 * @prop {number} page - 1-based current page. Defaults to 1.
 * @prop {string} pageSizeOptions - Comma-separated list of page-size choices. Defaults to '10,25,50,100'.
 * @prop {number} siblingCount - Page numbers shown on each side of current. Defaults to 1.
 * @prop {string} label - Accessible name for the nav landmark. Defaults to i18n 'Pagination'.
 * @prop {string} itemName - Singular noun used in status text (e.g. "row", "application"). Defaults to "item".
 *
 * @fires civ-page-change - { page, pageSize, offset } — user navigated to a page or changed page size
 *
 * @example
 * ```html
 * <civ-pagination
 *   total-items="847"
 *   page-size="25"
 *   page="3"
 *   item-name="application"
 * ></civ-pagination>
 * ```
 */
@customElement('civ-pagination')
export class CivPagination extends CivBaseElement {
  @property({ type: Number, attribute: 'total-items' }) totalItems = 0;
  @property({ type: Number, attribute: 'page-size' }) pageSize = 25;
  @property({ type: Number }) page = 1;
  @property({ type: String, attribute: 'page-size-options' }) pageSizeOptions = '10,25,50,100';
  @property({ type: Number, attribute: 'sibling-count' }) siblingCount = 1;
  @property({ type: String }) label = '';
  @property({ type: String, attribute: 'item-name' }) itemName = 'item';

  override createRenderRoot() {
    return this;
  }

  /** Total number of pages, minimum 1. */
  public get totalPages(): number {
    if (this.pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  /** 1-based, clamped to [1, totalPages]. */
  public get currentPage(): number {
    return Math.min(Math.max(1, this.page), this.totalPages);
  }

  /** Item indexes shown on the current page: { start, end } (1-based, inclusive). */
  public get currentRange(): { start: number; end: number } {
    if (this.totalItems === 0) return { start: 0, end: 0 };
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.totalItems, this.currentPage * this.pageSize);
    return { start, end };
  }

  override render() {
    const label = this.label || t('paginationLabel');

    if (this.totalItems === 0) {
      return html`
        <nav class="civ-pagination" aria-label="${label}">
          <p class="civ-pagination__empty" aria-live="polite">${t('paginationEmptyLabel')}</p>
        </nav>
      `;
    }

    const totalPages = this.totalPages;
    const current = this.currentPage;
    const pages = this._buildPageList(current, totalPages, this.siblingCount);
    const { start, end } = this.currentRange;
    const plural = this.totalItems === 1 ? this.itemName : `${this.itemName}s`;
    const rangeText = this._interpolate(t('paginationRangeLabel'), {
      start: String(start),
      end: String(end),
      total: String(this.totalItems),
      itemName: plural,
    });
    const sizeOptions = this.pageSizeOptions
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);

    return html`
      <nav class="civ-pagination" aria-label="${label}">
        <p class="civ-pagination__status" aria-live="polite">${rangeText}</p>

        ${sizeOptions.length > 0
          ? html`
              <div class="civ-pagination__page-size">
                <label class="civ-pagination__page-size-label">
                  ${t('paginationPageSizeLabel')}
                  <select
                    class="civ-pagination__page-size-select"
                    .value="${String(this.pageSize)}"
                    @change="${this._onPageSizeChange}"
                  >
                    ${sizeOptions.map(
                      (size) => html`
                        <option value="${size}" ?selected="${size === this.pageSize}">${size}</option>
                      `,
                    )}
                  </select>
                </label>
              </div>
            `
          : nothing}

        <ul class="civ-pagination__list">
          <li>
            <civ-action-button
              class="civ-pagination__prev"
              emphasis="tertiary"
              icon-start="chevron-left"
              label="${t('paginationPreviousLabel')}"
              ?disabled="${current === 1}"
              @click="${() => this._goto(current - 1)}"
            ></civ-action-button>
          </li>

          ${pages.map((p) => this._renderPageEntry(p, current))}

          <li>
            <civ-action-button
              class="civ-pagination__next"
              emphasis="tertiary"
              icon-end="chevron-right"
              label="${t('paginationNextLabel')}"
              ?disabled="${current === totalPages}"
              @click="${() => this._goto(current + 1)}"
            ></civ-action-button>
          </li>
        </ul>
      </nav>
    `;
  }

  private _renderPageEntry(p: number | 'gap', current: number) {
    if (p === 'gap') {
      return html`<li aria-hidden="true" class="civ-pagination__gap">…</li>`;
    }
    const isCurrent = p === current;
    const pageLabel = this._interpolate(t('paginationPageLabel'), { page: String(p) });
    const currentLabel = this._interpolate(t('paginationCurrentPageLabel'), {
      page: String(p),
      pageCount: String(this.totalPages),
    });
    return html`
      <li>
        <civ-action-button
          class="civ-pagination__page"
          emphasis="${isCurrent ? 'primary' : 'tertiary'}"
          label="${String(p)}"
          aria-label="${isCurrent ? currentLabel : pageLabel}"
          ?current="${isCurrent}"
          @click="${() => this._goto(p)}"
        ></civ-action-button>
      </li>
    `;
  }

  /**
   * Build the page-button sequence with truncation gaps:
   *   1 … (current-1) [current] (current+1) … total
   *
   * When the total page count is small enough to fit without
   * truncation, returns every page. The visible-button budget is
   * `2 * siblings + 5` — first, last, current ± siblings, and up to
   * two gap markers.
   */
  private _buildPageList(current: number, total: number, siblings: number): Array<number | 'gap'> {
    if (total <= 0) return [];

    const totalBlocks = 2 * siblings + 5;
    if (total <= totalBlocks) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(current - siblings, 2);
    const rightSibling = Math.min(current + siblings, total - 1);
    const showLeftGap = leftSibling > 3;
    const showRightGap = rightSibling < total - 2;

    const result: Array<number | 'gap'> = [1];

    if (!showLeftGap && showRightGap) {
      // Near the start: 1 2 3 4 5 … N
      const end = Math.max(rightSibling, 1 + 2 * siblings + 1);
      for (let p = 2; p <= end; p++) result.push(p);
      result.push('gap');
      result.push(total);
    } else if (showLeftGap && !showRightGap) {
      // Near the end: 1 … N-4 N-3 N-2 N-1 N
      result.push('gap');
      const start = Math.min(leftSibling, total - (2 * siblings + 1));
      for (let p = start; p < total; p++) result.push(p);
      result.push(total);
    } else if (showLeftGap && showRightGap) {
      // Middle: 1 … (c-s) … (c+s) … N
      result.push('gap');
      for (let p = leftSibling; p <= rightSibling; p++) result.push(p);
      result.push('gap');
      result.push(total);
    } else {
      // No gaps needed — defensive; should be handled by the early return.
      for (let p = 2; p < total; p++) result.push(p);
      result.push(total);
    }

    return result;
  }

  private _goto(targetPage: number): void {
    const totalPages = this.totalPages;
    const clamped = Math.min(Math.max(1, targetPage), totalPages);
    if (clamped === this.currentPage) return;
    const offset = (clamped - 1) * this.pageSize;
    dispatch(this, 'civ-page-change', { page: clamped, pageSize: this.pageSize, offset });
  }

  private _onPageSizeChange = (e: Event): void => {
    const select = e.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    if (!Number.isFinite(newSize) || newSize <= 0 || newSize === this.pageSize) return;
    dispatch(this, 'civ-page-change', { page: 1, pageSize: newSize, offset: 0 });
  };

  private _interpolate(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-pagination': CivPagination;
  }
}
