import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t, generateId } from '@civui/core';
import '@civui/actions/button';
import '@civui/overlays/menu';
import './civ-data-grid.types.js';
import type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridResponsiveMode,
  GridSelectionMode,
} from './civ-data-grid.types.js';

export type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridResponsiveMode,
  GridSelectionMode,
};

/**
 * CivUI Data Grid
 *
 * Semantic `<table>`-based data grid for admin and back-office screens.
 * Renders sortable column headers, selectable rows, per-row action menus,
 * and integrates with `civ-pagination`. Mobile (≤480px) stacks each row
 * into a vertical block via CSS — no JS re-template.
 *
 * **Why `<table>` instead of `role="grid"`?** The WAI-ARIA APG recommends
 * semantic `<table>` for predominantly readable tabular data, even when
 * sortable. `role="grid"` requires 2D arrow-key navigation that doesn't
 * map well to screen reader UX for data display. Future work (spreadsheet-
 * style cell selection, copy/paste) may promote a variant to `role="grid"`.
 *
 * **Data flow (controlled).** The consumer manages `rows`, `columns`,
 * `sortBy`, `sortDirection`, `page`, and `pageSize`. The grid emits
 * `civ-sort` and `civ-page-change` — the consumer updates state and the
 * grid re-renders.
 *
 * @element civ-data-grid
 *
 * @prop {string} caption - **Required.** Accessible name for the table. Visible by default.
 * @prop {boolean} captionHidden - Visually hide the caption (still announced to AT).
 * @prop {Array} columns - Column definitions (JS property; no HTML attribute).
 * @prop {Array} rows - Row data (JS property; no HTML attribute).
 * @prop {string} sortBy - Currently-sorted column key. Empty string = no active sort.
 * @prop {string} sortDirection - 'asc' | 'desc' | 'none'.
 * @prop {string} responsive - 'stacked' (default) collapses to vertical blocks on mobile; 'scroll' wraps in a horizontal scroll region.
 * @prop {boolean} stickyHeader - Sticks the header row to the top while scrolling vertically.
 * @prop {string} selectable - 'none' | 'single' | 'multiple' — row-selection mode.
 * @prop {Array} selectedRowIds - IDs of currently-selected rows (controlled). Items must match `row.id`.
 * @prop {boolean} loading - Show loading state instead of rows.
 * @prop {string} errorMessage - Show error state with this message instead of rows.
 * @prop {string} emptyMessage - Override the default "No data" empty-state message.
 * @prop {boolean} striped - Apply zebra striping to body rows.
 * @prop {boolean} bordered - Apply borders between cells.
 *
 * @fires civ-sort - { column, direction } — user clicked a sortable column header
 * @fires civ-selection-change - { selectedRowIds } — selection changed via checkbox
 * @fires civ-row-action - { rowId, action, row } — user activated a row-action item
 *
 * **Pagination.** Render `<civ-pagination>` as a sibling next to the grid
 * and wire its `civ-page-change` event to update the grid's `rows`.
 *
 * @example
 * ```ts
 * const grid = document.querySelector('civ-data-grid')!;
 * grid.columns = [
 *   { key: 'name', header: 'Name', sortable: true },
 *   { key: 'status', header: 'Status' },
 *   { key: 'updated', header: 'Updated', sortable: true, align: 'end' },
 * ];
 * grid.rows = [
 *   { id: '1', cells: { name: 'Smith, John', status: 'Active', updated: '2026-05-01' }, actions: [
 *     { id: 'edit', label: 'Edit' },
 *     { id: 'delete', label: 'Delete', destructive: true },
 *   ]},
 * ];
 * grid.addEventListener('civ-sort', (e) => fetchData(e.detail));
 * ```
 */
@customElement('civ-data-grid')
export class CivDataGrid extends CivBaseElement {
  @property({ type: String }) caption = '';
  @property({ type: Boolean, attribute: 'caption-hidden' }) captionHidden = false;
  @property({ attribute: false }) columns: GridColumn[] = [];
  @property({ attribute: false }) rows: GridRow[] = [];
  @property({ type: String, attribute: 'sort-by' }) sortBy = '';
  @property({ type: String, attribute: 'sort-direction' })
  sortDirection: GridSortDirection = 'none';
  @property({ type: String }) responsive: GridResponsiveMode = 'stacked';
  @property({ type: Boolean, attribute: 'sticky-header' }) stickyHeader = false;
  @property({ type: String }) selectable: GridSelectionMode = 'none';
  @property({ attribute: false }) selectedRowIds: string[] = [];
  @property({ type: Boolean }) loading = false;
  @property({ type: String, attribute: 'error-message' }) errorMessage = '';
  @property({ type: String, attribute: 'empty-message' }) emptyMessage = '';
  @property({ type: Boolean }) striped = false;
  @property({ type: Boolean }) bordered = false;

  @state() private _instanceId = generateId('civ-data-grid');

  override createRenderRoot() {
    return this;
  }

  override render() {
    const wrapperClasses = [
      'civ-data-grid',
      `civ-data-grid--${this.responsive}`,
      this.stickyHeader ? 'civ-data-grid--sticky' : '',
      this.striped ? 'civ-data-grid--striped' : '',
      this.bordered ? 'civ-data-grid--bordered' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${wrapperClasses}">
        ${this._renderSelectionStatus()}
        ${this._renderTable()}
      </div>
    `;
  }

  private _renderTable(): TemplateResult {
    const caption = this.caption || t('dataGridLabel');
    const captionClass = this.captionHidden ? 'civ-sr-only' : 'civ-data-grid__caption';

    return html`
      <div
        class="civ-data-grid__scroll"
        role="${this.responsive === 'scroll' ? 'region' : 'presentation'}"
        aria-label="${this.responsive === 'scroll' ? caption : ''}"
        tabindex="${this.responsive === 'scroll' ? '0' : '-1'}"
      >
        <table class="civ-data-grid__table">
          <caption class="${captionClass}">${caption}</caption>
          <thead class="civ-data-grid__thead">
            <tr>
              ${this.selectable === 'multiple'
                ? html`
                    <th scope="col" class="civ-data-grid__th civ-data-grid__th--select">
                      ${this._renderSelectAllCheckbox()}
                    </th>
                  `
                : nothing}
              ${this.selectable === 'single'
                ? html`<th scope="col" class="civ-data-grid__th civ-data-grid__th--select"><span class="civ-sr-only">${t('dataGridSelectRow').replace('{row}', '')}</span></th>`
                : nothing}
              ${this.columns.map((col) => this._renderHeaderCell(col))}
              ${this._hasAnyRowActions() ? html`<th scope="col" class="civ-data-grid__th civ-data-grid__th--actions"><span class="civ-sr-only">Actions</span></th>` : nothing}
            </tr>
          </thead>
          <tbody class="civ-data-grid__tbody">
            ${this._renderBody()}
          </tbody>
        </table>
      </div>
    `;
  }

  private _renderHeaderCell(col: GridColumn): TemplateResult {
    const isSorted = this.sortBy === col.key;
    const ariaSort = isSorted
      ? (this.sortDirection === 'asc'
          ? 'ascending'
          : this.sortDirection === 'desc'
            ? 'descending'
            : 'none')
      : 'none';
    const alignClass = col.align ? `civ-data-grid__th--align-${col.align}` : '';
    const widthStyle = col.width ? `width: ${col.width};` : '';

    if (!col.sortable) {
      return html`
        <th
          scope="col"
          class="civ-data-grid__th ${alignClass}"
          style="${widthStyle}"
        >${col.header}</th>
      `;
    }

    const sortIcon = isSorted
      ? (this.sortDirection === 'asc' ? 'chevron-up' : 'chevron-down')
      : 'unfold-more';
    const sortLabel = isSorted && this.sortDirection === 'asc'
      ? t('dataGridSortDescending').replace('{column}', col.header)
      : t('dataGridSortAscending').replace('{column}', col.header);

    return html`
      <th
        scope="col"
        class="civ-data-grid__th civ-data-grid__th--sortable ${alignClass}"
        aria-sort="${ariaSort}"
        style="${widthStyle}"
      >
        <button
          type="button"
          class="civ-data-grid__sort-btn"
          aria-label="${sortLabel}"
          @click="${() => this._onSortClick(col.key)}"
        >
          <span>${col.header}</span>
          <civ-icon name="${sortIcon}" aria-hidden="true"></civ-icon>
        </button>
      </th>
    `;
  }

  private _renderBody(): TemplateResult | TemplateResult[] {
    if (this.loading) {
      const colCount = this._totalColumnCount();
      return html`
        <tr>
          <td colspan="${colCount}" class="civ-data-grid__state civ-data-grid__state--loading" role="status" aria-live="polite">
            <civ-icon name="loading" aria-hidden="true"></civ-icon>
            ${t('dataGridLoading')}
          </td>
        </tr>
      `;
    }

    if (this.errorMessage) {
      const colCount = this._totalColumnCount();
      return html`
        <tr>
          <td colspan="${colCount}" class="civ-data-grid__state civ-data-grid__state--error" role="alert">
            <civ-icon name="error" aria-hidden="true"></civ-icon>
            ${this.errorMessage}
          </td>
        </tr>
      `;
    }

    if (!this.rows || this.rows.length === 0) {
      const colCount = this._totalColumnCount();
      return html`
        <tr>
          <td colspan="${colCount}" class="civ-data-grid__state civ-data-grid__state--empty">
            ${this.emptyMessage || t('dataGridEmpty')}
          </td>
        </tr>
      `;
    }

    return this.rows.map((row, rowIndex) => this._renderRow(row, rowIndex));
  }

  private _renderRow(row: GridRow, rowIndex: number): TemplateResult {
    const isSelected = this.selectedRowIds.includes(row.id);
    const rowClass = [
      'civ-data-grid__tr',
      isSelected ? 'civ-data-grid__tr--selected' : '',
      row.disabled ? 'civ-data-grid__tr--disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <tr
        class="${rowClass}"
        data-row-id="${row.id}"
        aria-selected="${this.selectable !== 'none' ? String(isSelected) : ''}"
      >
        ${this.selectable !== 'none' ? this._renderSelectCell(row, isSelected) : nothing}
        ${this.columns.map((col) => this._renderBodyCell(col, row, rowIndex))}
        ${this._hasAnyRowActions() ? this._renderActionsCell(row) : nothing}
      </tr>
    `;
  }

  private _renderBodyCell(col: GridColumn, row: GridRow, rowIndex: number): TemplateResult {
    const raw = row.cells?.[col.key];
    const value = col.formatter ? col.formatter(raw, row, rowIndex) : (raw ?? '');
    const alignClass = col.align ? `civ-data-grid__td--align-${col.align}` : '';
    // The mobile stacked pattern uses a data-label attribute so CSS can
    // render the column header next to the value in narrow viewports.
    return html`
      <td class="civ-data-grid__td ${alignClass}" data-label="${col.header}">${value as unknown as TemplateResult}</td>
    `;
  }

  private _renderSelectCell(row: GridRow, isSelected: boolean): TemplateResult {
    const label = t('dataGridSelectRow').replace('{row}', row.id);
    if (this.selectable === 'single') {
      return html`
        <td class="civ-data-grid__td civ-data-grid__td--select">
          <label class="civ-data-grid__select-wrap">
            <input
              type="radio"
              name="${this._instanceId}-selection"
              .checked="${isSelected}"
              ?disabled="${row.disabled}"
              aria-label="${label}"
              @change="${() => this._toggleRowSelected(row.id)}"
            />
          </label>
        </td>
      `;
    }
    return html`
      <td class="civ-data-grid__td civ-data-grid__td--select">
        <label class="civ-data-grid__select-wrap">
          <input
            type="checkbox"
            .checked="${isSelected}"
            ?disabled="${row.disabled}"
            aria-label="${label}"
            @change="${() => this._toggleRowSelected(row.id)}"
          />
        </label>
      </td>
    `;
  }

  private _renderSelectAllCheckbox(): TemplateResult {
    const enabledRows = this.rows.filter((r) => !r.disabled);
    const selectedEnabled = enabledRows.filter((r) => this.selectedRowIds.includes(r.id));
    const allSelected = enabledRows.length > 0 && selectedEnabled.length === enabledRows.length;
    const someSelected = selectedEnabled.length > 0 && !allSelected;
    return html`
      <label class="civ-data-grid__select-wrap">
        <input
          type="checkbox"
          .checked="${allSelected}"
          .indeterminate="${someSelected}"
          ?disabled="${enabledRows.length === 0}"
          aria-label="${t('dataGridSelectAll')}"
          @change="${this._onSelectAllChange}"
        />
      </label>
    `;
  }

  private _renderActionsCell(row: GridRow): TemplateResult {
    const actions = row.actions ?? [];
    if (actions.length === 0) {
      return html`<td class="civ-data-grid__td civ-data-grid__td--actions"></td>`;
    }
    const label = t('dataGridRowActions').replace('{row}', row.id);
    return html`
      <td class="civ-data-grid__td civ-data-grid__td--actions">
        <civ-menu
          label="${label}"
          @civ-menu-select="${(e: Event) => this._onActionSelect(e, row)}"
        >
          <civ-button
            data-civ-menu-trigger
            variant="tertiary"
            icon-start="more-vert"
            icon-only
            label="${label}"
          ></civ-button>
          ${actions.map((action) => html`
            <civ-menu-item
              value="${action.id}"
              label="${action.label}"
              icon="${action.icon ?? ''}"
              ?disabled="${action.disabled}"
              ?destructive="${action.destructive}"
              href="${action.href ?? ''}"
            ></civ-menu-item>
          `)}
        </civ-menu>
      </td>
    `;
  }

  private _renderSelectionStatus(): TemplateResult | typeof nothing {
    if (this.selectable === 'none' || this.selectedRowIds.length === 0) return nothing;
    const text = t('dataGridSelectionStatus')
      .replace('{count}', String(this.selectedRowIds.length))
      .replace('{total}', String(this.rows.length));
    return html`
      <p class="civ-data-grid__selection-status" aria-live="polite">${text}</p>
    `;
  }

  private _onSortClick(columnKey: string): void {
    let nextDirection: GridSortDirection;
    if (this.sortBy !== columnKey) {
      nextDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      nextDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      nextDirection = 'none';
    } else {
      nextDirection = 'asc';
    }
    dispatch(this, 'civ-sort', {
      column: nextDirection === 'none' ? '' : columnKey,
      direction: nextDirection,
    });
  }

  private _toggleRowSelected(rowId: string): void {
    let next: string[];
    if (this.selectable === 'single') {
      next = this.selectedRowIds.includes(rowId) ? [] : [rowId];
    } else {
      next = this.selectedRowIds.includes(rowId)
        ? this.selectedRowIds.filter((id) => id !== rowId)
        : [...this.selectedRowIds, rowId];
    }
    dispatch(this, 'civ-selection-change', { selectedRowIds: next });
  }

  private _onSelectAllChange = (e: Event): void => {
    const checked = (e.target as HTMLInputElement).checked;
    const enabledIds = this.rows.filter((r) => !r.disabled).map((r) => r.id);
    const next = checked ? enabledIds : [];
    dispatch(this, 'civ-selection-change', { selectedRowIds: next });
  };

  private _onActionSelect(e: Event, row: GridRow): void {
    const detail = (e as CustomEvent).detail;
    const action = (row.actions ?? []).find((a) => a.id === detail.value);
    if (!action) return;
    dispatch(this, 'civ-row-action', { rowId: row.id, action: action.id, row });
  }

  private _totalColumnCount(): number {
    let count = this.columns.length;
    if (this.selectable !== 'none') count += 1;
    if (this._hasAnyRowActions()) count += 1;
    return count;
  }

  private _hasAnyRowActions(): boolean {
    return this.rows.some((r) => Array.isArray(r.actions) && r.actions.length > 0);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-data-grid': CivDataGrid;
  }
}
