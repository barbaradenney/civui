import { html, nothing, type TemplateResult } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t, generateId, devWarn } from '@civui/core';
import '@civui/actions/action-button';
import '@civui/controls/checkbox';
import '@civui/overlays/menu';
import { applyAggregator } from '../aggregate/grid-aggregate.js';
import './civ-data-grid.types.js';
import type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridSortKey,
  GridResponsiveMode,
  GridSelectionMode,
  GridExpandTemplate,
  GridGroupLabel,
  GridCellInputType,
  GridCellOption,
  GridColumnFilter,
  GridFilterValue,
  GridFilters,
  GridAggregator,
} from './civ-data-grid.types.js';

export type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridSortKey,
  GridResponsiveMode,
  GridSelectionMode,
  GridExpandTemplate,
  GridGroupLabel,
  GridCellInputType,
  GridCellOption,
  GridColumnFilter,
  GridFilterValue,
  GridFilters,
  GridAggregator,
};

/**
 * CivUI Data Grid
 *
 * Semantic `<table>`-based data grid for admin and back-office screens.
 * Renders sortable column headers, selectable rows, per-row action menus,
 * and integrates with `civ-pagination`. Mobile (≤480px) stacks each row
 * into a vertical block via CSS — no JS re-template.
 *
 * **Why semantic `<table>` by default?** The WAI-ARIA APG recommends
 * semantic `<table>` for predominantly readable tabular data, even when
 * sortable. `role="grid"` requires 2D arrow-key navigation that's overkill
 * when the user just wants to read rows. For admin screens with lots of
 * interactive cells (edit, expand, actions, sort), set `keyboardNav`
 * — the grid promotes to `role="grid"` with roving tabindex and arrow-key
 * navigation per the WAI-ARIA Grid Pattern.
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
 * @prop {string} sortBy - Currently-sorted column key. Empty string = no active sort. When `multiSort` is on, this reflects the PRIMARY sort key (mirrors `sortKeys[0]`) for backward-compat readers; the full stack is in `sortKeys`.
 * @prop {string} sortDirection - 'asc' | 'desc' | 'none'. When `multiSort` is on, mirrors `sortKeys[0].direction` (or `'none'` when the stack is empty).
 * @prop {boolean} multiSort - Opt into multi-column sort. When enabled, Shift-click a sortable header to add it to the sort stack; plain click replaces the stack. Position badges (1, 2, 3…) render next to chevrons when the stack has more than one key.
 * @prop {Array} sortKeys - Multi-column sort stack (controlled). Each entry is `{ key, direction }`; entries earlier in the array are higher-priority. Update in response to `civ-sort` (which always includes `sortKeys` in its detail).
 * @prop {string} responsive - 'stacked' (default) collapses to vertical blocks on mobile; 'scroll' wraps in a horizontal scroll region.
 * @prop {boolean} stickyHeader - Sticks the header row to the top while scrolling vertically.
 * @prop {string} selectable - 'none' | 'single' | 'multiple' — row-selection mode.
 * @prop {Array} selectedRowIds - IDs of currently-selected rows (controlled). Items must match `row.id`.
 * @prop {boolean} loading - Show loading state instead of rows.
 * @prop {string} errorMessage - Show error state with this message instead of rows.
 * @prop {string} emptyMessage - Override the default "No data" empty-state message.
 * @prop {boolean} striped - Apply zebra striping to body rows.
 * @prop {boolean} bordered - Apply borders between cells.
 * @prop {boolean} interactive - When true, clicking a row (outside the select / actions cells) fires `civ-row-activate`. Use to wire a master-detail drawer or a navigate-to-record flow.
 * @prop {Array} expandedRowIds - IDs of currently-expanded rows (controlled). Update in response to `civ-row-expand`.
 * @prop {Function} expandTemplate - `(row) => string | TemplateResult` — renders the detail content shown when a row is expanded. Required when any row has `expandable: true`.
 * @prop {boolean} keyboardNav - Promote the table to `role="grid"` with 2D arrow-key navigation per the WAI-ARIA Grid Pattern. See the data-grid doc page "Keyboard navigation" section for the full key map and behavior notes.
 * @prop {Object} filters - Active filter values keyed by column.key (controlled). Update in response to `civ-filter-change`. See the doc page "Column filtering" section.
 * @prop {boolean} stickyFooter - Pin the aggregator footer to the bottom of the scrolling container.
 * @prop {boolean} showGroupSubtotals - When `groupBy` is set and any column has an `aggregate`, render a subtotal row at the bottom of each expanded group (default `true`).
 *
 * @fires civ-sort - { column, direction, sortKeys } — user clicked a sortable column header. `column` + `direction` describe the just-toggled column (for backward-compat consumers); `sortKeys` is the full target stack (always present, single-element when `multiSort` is off).
 * @fires civ-selection-change - { selectedRowIds } — selection changed via checkbox
 * @fires civ-row-action - { rowId, action, row } — user activated a row-action item
 * @fires civ-row-activate - { rowId, row } — user clicked a row body when `interactive` is set (master-detail trigger)
 * @fires civ-row-expand - { rowId, expanded, row } — user toggled an expandable row's chevron
 * @fires civ-cell-edit-start - { rowId, columnKey, row } — user activated edit mode on an editable cell
 * @fires civ-cell-edit-commit - { rowId, columnKey, value, row } — user committed a valid new value (Enter / blur / click-outside)
 * @fires civ-cell-edit-cancel - { rowId, columnKey, row } — user cancelled an edit (Escape)
 * @fires civ-group-toggle - { groupKey, expanded } — user toggled a group header's chevron
 * @fires civ-filter-change - { filters, columnKey } — user changed a per-column filter input; `filters` is the new full state, `columnKey` identifies which column changed
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
 *
 * // Multi-sort: opt in via `multiSort` and read `sortKeys` from the event.
 * // Shift-click a header to add it as a secondary / tertiary key; the
 * // event carries the full target stack.
 * grid.multiSort = true;
 * grid.sortKeys = [];
 * grid.addEventListener('civ-sort', (e) => {
 *   grid.sortKeys = e.detail.sortKeys;
 *   fetchData({ sortKeys: grid.sortKeys });
 * });
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
  @property({ type: Boolean, attribute: 'multi-sort' }) multiSort = false;
  @property({ attribute: false }) sortKeys?: GridSortKey[];
  @property({ type: String }) responsive: GridResponsiveMode = 'stacked';
  @property({ type: Boolean, attribute: 'sticky-header' }) stickyHeader = false;
  @property({ type: String }) selectable: GridSelectionMode = 'none';
  @property({ attribute: false }) selectedRowIds: string[] = [];
  @property({ type: Boolean }) loading = false;
  @property({ type: String, attribute: 'error-message' }) errorMessage = '';
  @property({ type: String, attribute: 'empty-message' }) emptyMessage = '';
  @property({ type: Boolean }) striped = false;
  @property({ type: Boolean }) bordered = false;
  @property({ type: Boolean }) interactive = false;
  @property({ attribute: false }) expandedRowIds: string[] = [];
  @property({ attribute: false }) expandTemplate?: GridExpandTemplate;
  @property({ type: String, attribute: 'group-by' }) groupBy = '';
  @property({ attribute: false }) expandedGroups?: string[];
  @property({ attribute: false }) groupLabel?: GridGroupLabel;
  @property({ type: Boolean, attribute: 'keyboard-nav' }) keyboardNav = false;
  @property({ attribute: false }) filters: GridFilters = {};
  @property({ type: Boolean, attribute: 'sticky-footer' }) stickyFooter = false;
  @property({ type: Boolean, attribute: 'show-group-subtotals' }) showGroupSubtotals = true;

  /**
   * Roving-tabindex position when `keyboardNav` is on. Plain fields (not
   * `@state`) so we can update them in response to focus changes without
   * triggering a Lit re-render — the tabindex sync runs imperatively in
   * `_applyKeyboardNav()`. `_pendingFocus` flags that we should call
   * `.focus()` after the next render (post-arrow-key, post-edit-exit).
   *
   * `_colMemory` is the desired column position from the most recent
   * horizontal navigation (ArrowLeft/Right, Home/End, mouse click). When
   * vertical navigation lands on a single-cell row (group header, detail
   * row) the focus collapses to col 0, but `_colMemory` stays put so the
   * NEXT vertical move can restore the user's column on a multi-col row.
   * Matches Excel / Google Sheets behavior.
   */
  private _focusedRow = 0;
  private _focusedCol = 0;
  private _colMemory = 0;
  private _pendingFocus = false;

  /** Internal edit-mode tracking — one cell at a time. */
  @state() private _editingCell: { rowId: string; columnKey: string } | null = null;
  /** Validation error from the current edit (rendered inline below the input). */
  @state() private _editError = '';

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
      this.keyboardNav ? 'civ-data-grid--keyboard-nav' : '',
      this.stickyFooter && this._hasAnyAggregate() ? 'civ-data-grid--sticky-footer' : '',
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
    const captionId = `${this._instanceId}-caption`;
    // When keyboardNav is on the scroll wrapper's tabindex=0 would create a
    // second tab stop (wrapper + focused cell), contradicting the
    // single-tab-stop contract. Drop it — arrow keys handle horizontal
    // traversal, and we scroll cells into view explicitly on focus.
    const scrollTabindex = this.responsive === 'scroll' && !this.keyboardNav ? '0' : '-1';

    return html`
      <div
        class="civ-data-grid__scroll"
        role="${this.responsive === 'scroll' ? 'region' : 'presentation'}"
        aria-label="${this.responsive === 'scroll' ? caption : ''}"
        tabindex="${scrollTabindex}"
      >
        <table
          class="civ-data-grid__table"
          aria-labelledby="${captionId}"
          @keydown="${this._onTableKeydown}"
          @focusin="${this._onTableFocusin}"
        >
          <caption id="${captionId}" class="${captionClass}">${caption}</caption>
          <thead class="civ-data-grid__thead">
            <tr>
              ${this._hasAnyExpandable()
                ? html`<th scope="col" class="civ-data-grid__th civ-data-grid__th--expand" aria-hidden="true"></th>`
                : nothing}
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
              ${this._visibleColumns.map((col) => this._renderHeaderCell(col))}
              ${this._hasAnyRowActions() ? html`<th scope="col" class="civ-data-grid__th civ-data-grid__th--actions"><span class="civ-sr-only">Actions</span></th>` : nothing}
            </tr>
            ${this._hasAnyFilter() ? this._renderFilterRow() : nothing}
          </thead>
          <tbody class="civ-data-grid__tbody">
            ${this._renderBody()}
          </tbody>
          ${this._hasAnyAggregate() ? this._renderFooter() : nothing}
        </table>
      </div>
    `;
  }

  private _renderHeaderCell(col: GridColumn): TemplateResult {
    // Resolve the column's current sort state — in multi-sort mode read
    // from the sortKeys stack; otherwise use the single sortBy / sortDirection.
    const sortInfo = this._sortInfoForColumn(col.key);
    const isSorted = sortInfo !== null;
    const ariaSort = isSorted
      ? (sortInfo.direction === 'asc' ? 'ascending' : 'descending')
      : 'none';
    const alignClass = col.align ? `civ-data-grid__th--align-${col.align}` : '';
    const widthStyle = col.width ? `width: ${col.width};` : '';
    const sticky = this._stickyAttrs(col);
    const cellStyle = `${widthStyle}${sticky.style}`;

    if (!col.sortable) {
      return html`
        <th
          scope="col"
          class="civ-data-grid__th ${alignClass} ${sticky.cls}"
          style="${cellStyle}"
        >${col.header}</th>
      `;
    }

    const sortIcon = isSorted
      ? (sortInfo.direction === 'asc' ? 'chevron-up' : 'chevron-down')
      : 'unfold-more';
    const sortLabelBase = isSorted && sortInfo.direction === 'asc'
      ? t('dataGridSortDescending').replace('{column}', col.header)
      : t('dataGridSortAscending').replace('{column}', col.header);
    // Position badge: render "1, 2, 3…" next to the chevron when the
    // multi-sort stack has more than one key, so the priority order is
    // visible. Skipped for the single-key case to keep the visual quiet.
    const showPositionBadge = this.multiSort
      && isSorted
      && this._activeSortKeys().length > 1;
    // For screen reader users, also append the sort priority to the
    // button's aria-label — the badge is aria-hidden because the number
    // alone reads poorly out of context.
    const sortLabel = showPositionBadge && sortInfo
      ? sortLabelBase + t('dataGridSortPositionSuffix').replace(
          '{position}', String(sortInfo.position + 1),
        )
      : sortLabelBase;

    return html`
      <th
        scope="col"
        class="civ-data-grid__th civ-data-grid__th--sortable ${alignClass} ${sticky.cls}"
        aria-sort="${ariaSort}"
        style="${cellStyle}"
      >
        <button
          type="button"
          class="civ-data-grid__sort-btn"
          aria-label="${sortLabel}"
          @click="${(e: MouseEvent) => this._onSortClick(col.key, e.shiftKey)}"
        >
          <span>${col.header}</span>
          <civ-icon name="${sortIcon}" aria-hidden="true"></civ-icon>
          ${showPositionBadge && sortInfo
            ? html`<span class="civ-data-grid__sort-position" aria-hidden="true">${sortInfo.position + 1}</span>`
            : nothing}
        </button>
      </th>
    `;
  }

  /**
   * Look up a column's current sort state. In multi-sort mode, returns
   * `{ direction, position }` from `sortKeys` (or null if absent). In
   * single-sort mode, returns `{ direction, position: 0 }` when this
   * column is the active sort, or null otherwise.
   */
  private _sortInfoForColumn(columnKey: string): { direction: 'asc' | 'desc'; position: number } | null {
    if (this.multiSort) {
      const idx = (this.sortKeys ?? []).findIndex((k) => k.key === columnKey);
      if (idx === -1) return null;
      return { direction: this.sortKeys![idx].direction, position: idx };
    }
    if (this.sortBy === columnKey && (this.sortDirection === 'asc' || this.sortDirection === 'desc')) {
      return { direction: this.sortDirection, position: 0 };
    }
    return null;
  }

  /** Current active sort keys — `sortKeys` in multi-sort mode, or a
   *  synthetic single-element array derived from `sortBy` / `sortDirection`. */
  private _activeSortKeys(): GridSortKey[] {
    if (this.multiSort) return this.sortKeys ?? [];
    if (this.sortBy && (this.sortDirection === 'asc' || this.sortDirection === 'desc')) {
      return [{ key: this.sortBy, direction: this.sortDirection }];
    }
    return [];
  }

  private _renderBody(): TemplateResult | Array<TemplateResult | TemplateResult[]> {
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

    if (this.groupBy) {
      return this._renderGroupedBody();
    }
    return this.rows.map((row, rowIndex) => this._renderRow(row, rowIndex));
  }

  /**
   * Render rows in groups. Groups appear in the order their first member
   * appears in `rows` (consumer pre-sorts to control group order). Each
   * group emits a header row followed by — if expanded — its data rows.
   */
  private _renderGroupedBody(): Array<TemplateResult | TemplateResult[]> {
    const groups = this._buildGroups();
    const showSubtotals = this.showGroupSubtotals && this._hasAnyAggregate();
    const out: Array<TemplateResult | TemplateResult[]> = [];
    let rowIndex = 0;
    for (const [groupKey, groupRows] of groups) {
      out.push(this._renderGroupHeader(groupKey, groupRows));
      if (this._isGroupExpanded(groupKey)) {
        for (const row of groupRows) {
          out.push(this._renderRow(row, rowIndex));
          rowIndex++;
        }
        if (showSubtotals) {
          out.push(this._renderGroupSubtotalRow(groupKey, groupRows));
        }
      } else {
        rowIndex += groupRows.length;
      }
    }
    return out;
  }

  /**
   * Insertion-ordered map from group key (stringified) → rows. Memoized
   * via `_groupsCache` so the grouping pass runs once per render set and
   * not once per cell-render call. Invalidated in `willUpdate` when
   * `rows` or `groupBy` change.
   */
  private _buildGroups(): Map<string, GridRow[]> {
    if (this._groupsCache === undefined) {
      const map = new Map<string, GridRow[]>();
      for (const row of this.rows) {
        const raw = row.cells?.[this.groupBy];
        // Stringify so Map keys are stable when the value is `null`,
        // `undefined`, a number, etc. The empty-string key catches missing
        // values; the header label falls back to the i18n "(no value)" string.
        const key = raw == null ? '' : String(raw);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(row);
      }
      this._groupsCache = map;
    }
    return this._groupsCache;
  }

  private _isGroupExpanded(groupKey: string): boolean {
    // When the consumer hasn't set `expandedGroups`, all groups are expanded.
    if (!this.expandedGroups) return true;
    return this.expandedGroups.includes(groupKey);
  }

  private _renderGroupHeader(groupKey: string, groupRows: GridRow[]): TemplateResult {
    const isExpanded = this._isGroupExpanded(groupKey);
    const colspan = this._totalColumnCount();
    const label = this.groupLabel
      ? this.groupLabel(groupKey, groupRows)
      : `${groupKey || t('dataGridGroupNoValue')} (${groupRows.length})`;
    const ariaLabel = isExpanded
      ? t('dataGridCollapseGroup').replace('{group}', groupKey || '—')
      : t('dataGridExpandGroup').replace('{group}', groupKey || '—');
    return html`
      <tr class="civ-data-grid__tr--group" data-group-key="${groupKey}">
        <td
          class="civ-data-grid__td civ-data-grid__td--group"
          colspan="${colspan}"
        >
          <button
            type="button"
            class="civ-data-grid__group-toggle"
            aria-expanded="${isExpanded ? 'true' : 'false'}"
            aria-label="${ariaLabel}"
            @click="${() => this._onToggleGroup(groupKey)}"
          >
            <civ-icon
              name="${isExpanded ? 'chevron-down' : 'chevron-right'}"
              aria-hidden="true"
            ></civ-icon>
            <span class="civ-data-grid__group-label">${label}</span>
          </button>
        </td>
      </tr>
    `;
  }

  private _onToggleGroup(groupKey: string): void {
    const nextExpanded = !this._isGroupExpanded(groupKey);
    dispatch(this, 'civ-group-toggle', {
      groupKey,
      expanded: nextExpanded,
    });
  }

  // ---------------------------------------------------------------------------
  // Column filtering (opt-in via `column.filter`)
  // ---------------------------------------------------------------------------

  /** True if any visible column has a filter config. */
  private _hasAnyFilter(): boolean {
    return this._visibleColumns.some((c) => !!c.filter);
  }

  /**
   * Render the filter row beneath the column headers. Special columns
   * (expand chevron, selection, row-actions) get empty placeholder cells
   * so the row aligns with the headers above and the data rows below.
   * Columns without a `filter` config also render an empty placeholder
   * — so the row reads visually like a complete header row.
   */
  private _renderFilterRow(): TemplateResult {
    return html`
      <tr
        class="civ-data-grid__filter-row"
        aria-label="${t('dataGridFilterRowLabel')}"
      >
        ${this._hasAnyExpandable()
          ? html`<td class="civ-data-grid__td civ-data-grid__filter-cell civ-data-grid__filter-cell--placeholder"></td>`
          : nothing}
        ${this.selectable !== 'none'
          ? html`<td class="civ-data-grid__td civ-data-grid__filter-cell civ-data-grid__filter-cell--placeholder"></td>`
          : nothing}
        ${this._visibleColumns.map((col) => this._renderFilterCell(col))}
        ${this._hasAnyRowActions()
          ? html`<td class="civ-data-grid__td civ-data-grid__filter-cell civ-data-grid__filter-cell--placeholder"></td>`
          : nothing}
      </tr>
    `;
  }

  private _renderFilterCell(col: GridColumn): TemplateResult {
    if (!col.filter) {
      return html`<td class="civ-data-grid__td civ-data-grid__filter-cell civ-data-grid__filter-cell--placeholder"></td>`;
    }
    const sticky = this._stickyAttrs(col);
    const cellClass = `civ-data-grid__td civ-data-grid__filter-cell ${sticky.cls}`;
    const cellStyle = sticky.style;
    const current = this.filters[col.key];
    switch (col.filter.type) {
      case 'text':
        return html`
          <td class="${cellClass}" style="${cellStyle}">
            <input
              type="text"
              class="civ-data-grid__filter-input"
              aria-label="${t('dataGridFilterByColumn').replace('{column}', col.header)}"
              placeholder="${col.filter.placeholder ?? ''}"
              .value="${current?.type === 'text' ? current.value : ''}"
              @input="${(e: Event) => this._onFilterInput(col, e)}"
            />
          </td>
        `;
      case 'select': {
        const opts = col.filter.options;
        const placeholder = col.filter.placeholder ?? t('dataGridFilterSelectAll');
        const value = current?.type === 'select' ? current.value : '';
        return html`
          <td class="${cellClass}" style="${cellStyle}">
            <select
              class="civ-data-grid__filter-input"
              aria-label="${t('dataGridFilterByColumn').replace('{column}', col.header)}"
              .value="${value}"
              @change="${(e: Event) => this._onFilterInput(col, e)}"
            >
              <option value="">${placeholder}</option>
              ${opts.map(
                (o) => html`
                  <option value="${o.value}" ?selected="${value === o.value}">${o.label}</option>
                `,
              )}
            </select>
          </td>
        `;
      }
      case 'number-range': {
        const min = current?.type === 'number-range' ? current.min : undefined;
        const max = current?.type === 'number-range' ? current.max : undefined;
        return html`
          <td class="${cellClass}" style="${cellStyle}">
            <div class="civ-data-grid__filter-range">
              <input
                type="number"
                class="civ-data-grid__filter-input civ-data-grid__filter-input--range"
                aria-label="${t('dataGridFilterMin').replace('{column}', col.header)}"
                placeholder="${col.filter.minPlaceholder ?? 'Min'}"
                .value="${min == null ? '' : String(min)}"
                @input="${(e: Event) => this._onFilterRangeInput(col, e, 'min')}"
              />
              <input
                type="number"
                class="civ-data-grid__filter-input civ-data-grid__filter-input--range"
                aria-label="${t('dataGridFilterMax').replace('{column}', col.header)}"
                placeholder="${col.filter.maxPlaceholder ?? 'Max'}"
                .value="${max == null ? '' : String(max)}"
                @input="${(e: Event) => this._onFilterRangeInput(col, e, 'max')}"
              />
            </div>
          </td>
        `;
      }
    }
  }

  private _onFilterInput(col: GridColumn, e: Event): void {
    const target = e.currentTarget as HTMLInputElement | HTMLSelectElement;
    const rawValue = target.value;
    const next: GridFilters = { ...this.filters };
    if (col.filter?.type === 'text') {
      if (rawValue === '') delete next[col.key];
      else next[col.key] = { type: 'text', value: rawValue };
    } else if (col.filter?.type === 'select') {
      if (rawValue === '') delete next[col.key];
      else next[col.key] = { type: 'select', value: rawValue };
    }
    dispatch(this, 'civ-filter-change', { filters: next, columnKey: col.key });
  }

  private _onFilterRangeInput(col: GridColumn, e: Event, bound: 'min' | 'max'): void {
    const target = e.currentTarget as HTMLInputElement;
    const rawValue = target.value;
    const current = this.filters[col.key];
    const existing = current?.type === 'number-range' ? current : { type: 'number-range' as const };
    const next: GridFilters = { ...this.filters };
    const updated: GridFilterValue = {
      type: 'number-range',
      min: bound === 'min'
        ? (rawValue === '' ? undefined : Number(rawValue))
        : existing.min,
      max: bound === 'max'
        ? (rawValue === '' ? undefined : Number(rawValue))
        : existing.max,
    };
    // Drop the entry entirely when both bounds are clear — keeps the
    // filters map free of empty noise.
    if (updated.type === 'number-range' && updated.min === undefined && updated.max === undefined) {
      delete next[col.key];
    } else {
      next[col.key] = updated;
    }
    dispatch(this, 'civ-filter-change', { filters: next, columnKey: col.key });
  }

  // ---------------------------------------------------------------------------
  // Aggregator footer + per-group subtotals
  // ---------------------------------------------------------------------------

  /** True if any visible column declares an `aggregate`. */
  private _hasAnyAggregate(): boolean {
    return this._visibleColumns.some((c) => !!c.aggregate);
  }

  /**
   * Render `<tfoot>` with one row of aggregator cells, computed from the
   * full `rows` set (the consumer is responsible for filtering /
   * paginating before assignment). Special columns (expand, select,
   * actions) render placeholder cells so columns align with header and
   * body.
   */
  private _renderFooter(): TemplateResult {
    return html`
      <tfoot class="civ-data-grid__tfoot">
        <tr class="civ-data-grid__tfoot-row">
          ${this._hasAnyExpandable()
            ? html`<td class="civ-data-grid__td civ-data-grid__tfoot-cell civ-data-grid__tfoot-cell--placeholder"></td>`
            : nothing}
          ${this.selectable !== 'none'
            ? html`<td class="civ-data-grid__td civ-data-grid__tfoot-cell civ-data-grid__tfoot-cell--placeholder"></td>`
            : nothing}
          ${this._visibleColumns.map((col) => this._renderFooterCell(col, this.rows))}
          ${this._hasAnyRowActions()
            ? html`<td class="civ-data-grid__td civ-data-grid__tfoot-cell civ-data-grid__tfoot-cell--placeholder"></td>`
            : nothing}
        </tr>
      </tfoot>
    `;
  }

  private _renderFooterCell(col: GridColumn, scopedRows: readonly GridRow[]): TemplateResult {
    const sticky = this._stickyAttrs(col);
    const alignClass = col.align ? `civ-data-grid__td--align-${col.align}` : '';
    const cellClass = `civ-data-grid__td civ-data-grid__tfoot-cell ${alignClass} ${sticky.cls}`;
    if (!col.aggregate) {
      return html`<td class="${cellClass} civ-data-grid__tfoot-cell--placeholder" style="${sticky.style}"></td>`;
    }
    const value = applyAggregator(scopedRows, col);
    return html`
      <td class="${cellClass}" style="${sticky.style}">${value as unknown as TemplateResult}</td>
    `;
  }

  /**
   * Render a per-group subtotal row. Same column layout as a data row
   * but each cell shows its column's aggregator value computed from the
   * group's rows. Only inserted when `showGroupSubtotals` is true and at
   * least one column has an `aggregate`.
   */
  private _renderGroupSubtotalRow(groupKey: string, groupRows: readonly GridRow[]): TemplateResult {
    return html`
      <tr
        class="civ-data-grid__tr--group-subtotal"
        data-group-subtotal-for="${groupKey}"
      >
        ${this._hasAnyExpandable()
          ? html`<td class="civ-data-grid__td civ-data-grid__tfoot-cell civ-data-grid__tfoot-cell--placeholder"></td>`
          : nothing}
        ${this.selectable !== 'none'
          ? html`<td class="civ-data-grid__td civ-data-grid__tfoot-cell civ-data-grid__tfoot-cell--placeholder"></td>`
          : nothing}
        ${this._visibleColumns.map((col) => this._renderFooterCell(col, groupRows))}
        ${this._hasAnyRowActions()
          ? html`<td class="civ-data-grid__td civ-data-grid__tfoot-cell civ-data-grid__tfoot-cell--placeholder"></td>`
          : nothing}
      </tr>
    `;
  }

  private _renderRow(row: GridRow, rowIndex: number): TemplateResult | TemplateResult[] {
    const isSelected = this.selectedRowIds.includes(row.id);
    // Gate isExpanded on row.expandable so a consumer-error case (id in
    // expandedRowIds for a non-expandable row) doesn't apply the
    // --expanded class to a row that can't actually expand.
    const isExpanded = !!row.expandable && this._isExpanded(row.id);
    const showExpandColumn = this._hasAnyExpandable();
    const rowClass = [
      'civ-data-grid__tr',
      isSelected ? 'civ-data-grid__tr--selected' : '',
      row.disabled ? 'civ-data-grid__tr--disabled' : '',
      this.interactive && !row.disabled ? 'civ-data-grid__tr--interactive' : '',
      isExpanded ? 'civ-data-grid__tr--expanded' : '',
    ].filter(Boolean).join(' ');

    const onRowClick = this.interactive && !row.disabled
      ? (e: Event) => this._onRowActivate(e, row)
      : undefined;

    const detailId = `${this._instanceId}-detail-${row.id}`;

    const dataRow = html`
      <tr
        class="${rowClass}"
        data-row-id="${row.id}"
        aria-selected="${this.selectable !== 'none' ? String(isSelected) : ''}"
        @click="${onRowClick}"
      >
        ${showExpandColumn ? this._renderExpandCell(row, isExpanded, detailId) : nothing}
        ${this.selectable !== 'none' ? this._renderSelectCell(row, isSelected) : nothing}
        ${this._visibleColumns.map((col) => this._renderBodyCell(col, row, rowIndex))}
        ${this._hasAnyRowActions() ? this._renderActionsCell(row) : nothing}
      </tr>
    `;

    if (!isExpanded) {
      return dataRow;
    }

    // Render the detail row immediately below the data row. The colspan
    // covers every visible column including expand / select / actions.
    const detailRow = html`
      <tr class="civ-data-grid__tr--detail" data-detail-for="${row.id}">
        <td
          id="${detailId}"
          class="civ-data-grid__td civ-data-grid__td--detail"
          colspan="${this._totalColumnCount()}"
        >${this._renderExpandTemplate(row)}</td>
      </tr>
    `;
    return [dataRow, detailRow];
  }

  private _renderExpandCell(row: GridRow, isExpanded: boolean, detailId: string): TemplateResult {
    if (!row.expandable) {
      return html`<td class="civ-data-grid__td civ-data-grid__td--expand"></td>`;
    }
    const label = isExpanded
      ? t('dataGridCollapseRow').replace('{row}', row.id)
      : t('dataGridExpandRow').replace('{row}', row.id);
    return html`
      <td class="civ-data-grid__td civ-data-grid__td--expand">
        <button
          type="button"
          class="civ-data-grid__expand-toggle"
          aria-expanded="${isExpanded ? 'true' : 'false'}"
          aria-controls="${detailId}"
          aria-label="${label}"
          ?disabled="${row.disabled}"
          @click="${(e: Event) => this._onToggleExpand(e, row)}"
        >
          <civ-icon
            name="${isExpanded ? 'chevron-down' : 'chevron-right'}"
            aria-hidden="true"
          ></civ-icon>
        </button>
      </td>
    `;
  }

  private _renderExpandTemplate(row: GridRow): string | number | TemplateResult {
    if (this.expandTemplate) return this.expandTemplate(row);
    return '';
  }

  private _hasAnyExpandable(): boolean {
    if (this._anyExpandableCache === undefined) {
      this._anyExpandableCache = this.rows.some((r) => !!r.expandable);
    }
    return this._anyExpandableCache;
  }

  private _isExpanded(rowId: string): boolean {
    return this.expandedRowIds.includes(rowId);
  }

  private _onToggleExpand(e: Event, row: GridRow): void {
    // Don't bubble to the row-click activation handler.
    e.stopPropagation();
    if (row.disabled) return;
    const nextExpanded = !this._isExpanded(row.id);
    dispatch(this, 'civ-row-expand', {
      rowId: row.id,
      expanded: nextExpanded,
      row,
    });
  }

  private _onRowActivate(e: Event, row: GridRow): void {
    const target = e.target as HTMLElement;
    // Two fences, both required:
    // 1) Cell-class check — covers everything inside the select cell
    //    (checkbox/radio) and the actions cell (whose kebab trigger
    //    is a `<civ-action-button>` host that wraps a native button).
    //    `closest('button')` would also find the inner button, but
    //    the cell-class check is a clearer signal of intent.
    // 2) Interactive-descendant check — covers anchors and form
    //    controls a consumer's cell formatter might render
    //    (a `<civ-tag>` wrapping a link, a `<select>` inside a cell, etc).
    if (target.closest('.civ-data-grid__td--select, .civ-data-grid__td--actions')) {
      return;
    }
    if (target.closest('a, button, input, select, textarea, [role="button"]')) {
      return;
    }
    dispatch(this, 'civ-row-activate', { rowId: row.id, row });
  }

  /** Memoization cache for the two row-set queries that the render path
   *  hits repeatedly. Invalidated in `willUpdate` when `rows` changes
   *  (which is the only reactive prop that affects them). */
  private _anyExpandableCache?: boolean;
  private _anyRowActionsCache?: boolean;
  /** Per-column sticky-offset map. Invalidated when `columns` change. */
  private _stickyCache?: Map<string, { side: 'start' | 'end'; offset: string; isFirst: boolean; isLast: boolean }>;
  /** Insertion-ordered rows-by-group cache. Invalidated when `rows` or `groupBy` change. */
  private _groupsCache?: Map<string, GridRow[]>;
  /** Per-instance dedupe for the sticky-without-width warning. */
  private _warnedStickyWithoutWidth = false;

  override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate?.(changed);
    if (changed.has('rows')) {
      this._anyExpandableCache = undefined;
      this._anyRowActionsCache = undefined;
      this._groupsCache = undefined;
    }
    if (changed.has('groupBy')) {
      this._groupsCache = undefined;
    }
    if (changed.has('columns')) {
      this._stickyCache = undefined;
    }
    // Multi-sort → single-sort mirror. When `multiSort` is on, sortBy /
    // sortDirection are derived from `sortKeys[0]` — kept in sync here so
    // backward-compat readers (and the schema docs that promised "mirrors
    // the primary key") observe consistent state. Writing them directly
    // while multiSort is on is overridden on the next render; consumers
    // should manage `sortKeys` and let this hook fan out.
    if (this.multiSort) {
      const primary = this.sortKeys?.[0];
      const nextSortBy = primary?.key ?? '';
      const nextSortDirection: GridSortDirection = primary?.direction ?? 'none';
      if (this.sortBy !== nextSortBy) this.sortBy = nextSortBy;
      if (this.sortDirection !== nextSortDirection) this.sortDirection = nextSortDirection;
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated?.(changed);
    if (changed.has('interactive') || changed.has('rows')) {
      this._maybeWarnInteractiveWithoutActions();
    }
    if (changed.has('rows') || changed.has('expandTemplate')) {
      this._maybeWarnExpandableWithoutTemplate();
    }
    if (changed.has('groupBy') || changed.has('columns') || changed.has('rows')) {
      this._maybeWarnGroupByMismatch();
    }
    if (this.keyboardNav) {
      this._applyKeyboardNav();
    } else if (changed.has('keyboardNav')) {
      this._clearKeyboardNav();
    }
  }

  /** Per-instance dedupe so the interactive/actions warning only fires once per grid. */
  private _warnedInteractiveWithoutActions = false;

  /**
   * Mouse-only affordances are an a11y anti-pattern. When `interactive=true`
   * the row body click fires `civ-row-activate`, but there's no keyboard
   * equivalent at the row level (we deliberately don't override `<tr>`
   * with `role="button"`). Consumers need to add a per-row "View details"
   * action so keyboard / switch-control users can reach the same flow.
   * This warning fires once per instance when interactive is on and no
   * row has actions yet — silenced once any row has actions wired.
   */
  private _maybeWarnInteractiveWithoutActions(): void {
    if (this._warnedInteractiveWithoutActions) return;
    if (!this.interactive) return;
    if (!this.rows || this.rows.length === 0) return;
    if (this._hasAnyRowActions()) return;
    this._warnedInteractiveWithoutActions = true;
    devWarn(
      'civ-data-grid',
      'interactive=true without any row.actions creates a mouse-only affordance. Add a "View details" action (or similar) so keyboard / switch-control users can reach the same destination as the row click.',
    );
  }

  /** Per-instance dedupe for the expandable-without-template warning. */
  private _warnedExpandableWithoutTemplate = false;

  /**
   * When any row has `expandable: true` but `expandTemplate` is not set,
   * expanding the row renders an empty `<td>`. The chevron functions
   * (aria-expanded toggles, event fires) but the detail content is blank
   * — confusing for consumers who forgot to wire the template. Warn once
   * per instance until the template is provided.
   */
  private _maybeWarnExpandableWithoutTemplate(): void {
    if (this._warnedExpandableWithoutTemplate) return;
    if (!this._hasAnyExpandable()) return;
    if (this.expandTemplate) return;
    this._warnedExpandableWithoutTemplate = true;
    devWarn(
      'civ-data-grid',
      'Rows with `expandable: true` are present but `expandTemplate` is not set. Expanded rows will render a blank detail cell. Set `grid.expandTemplate = (row) => …` to render the detail content.',
    );
  }

  /** Per-instance dedupe for the groupBy-mismatch warning. */
  private _warnedGroupByMismatch = false;

  /**
   * When `groupBy` is set but doesn't match any column.key AND no row's
   * cells actually contains the key, every row lands under the empty-
   * string group with the "(no value)" label. Silently confusing — the
   * grid renders as one big group. Warn once per instance so the
   * consumer sees the typo.
   */
  private _maybeWarnGroupByMismatch(): void {
    if (this._warnedGroupByMismatch) return;
    if (!this.groupBy) return;
    if (!this.rows || this.rows.length === 0) return;
    const knownColumn = this.columns.some((c) => c.key === this.groupBy);
    const presentInData = this.rows.some(
      (r) => r.cells != null && this.groupBy in r.cells,
    );
    if (knownColumn || presentInData) return;
    this._warnedGroupByMismatch = true;
    devWarn(
      'civ-data-grid',
      `groupBy="${this.groupBy}" doesn't match any column.key, and no row's cells contains that key — every row will land under the empty "(no value)" group. Double-check the key.`,
    );
  }

  private _renderBodyCell(col: GridColumn, row: GridRow, rowIndex: number): TemplateResult {
    const raw = row.cells?.[col.key];
    const alignClass = col.align ? `civ-data-grid__td--align-${col.align}` : '';
    const isEditable = !!col.editable && !row.disabled;
    const isEditing = isEditable && this._isEditing(row.id, col.key);
    const sticky = this._stickyAttrs(col);

    if (isEditing) {
      return this._renderEditCell(col, row, raw, alignClass, sticky);
    }

    const value = col.formatter ? col.formatter(raw, row, rowIndex) : (raw ?? '');
    const editableClass = isEditable ? 'civ-data-grid__td--editable' : '';
    const onClick = isEditable
      ? (e: Event) => this._onCellClick(e, row, col)
      : undefined;
    // The mobile stacked pattern uses a data-label attribute so CSS can
    // render the column header next to the value in narrow viewports.
    //
    // For editable cells we wrap the value in a real <button> so the cell
    // is a keyboard focus stop. Native button semantics (Enter / Space
    // activate, role="button" announced) replace the "click a div" anti-
    // pattern we'd have with just a clickable <td>. The button bubbles
    // its click to the td's @click handler — same code path as a direct
    // mouse click on the cell.
    if (isEditable) {
      const editLabel = t('dataGridEditCell').replace('{column}', col.header);
      return html`
        <td
          class="civ-data-grid__td ${alignClass} ${editableClass} ${sticky.cls}"
          data-label="${col.header}"
          style="${sticky.style}"
          @click="${onClick}"
        >
          <button
            type="button"
            class="civ-data-grid__edit-cell-trigger"
            aria-label="${editLabel}"
          >${value as unknown as TemplateResult}</button>
        </td>
      `;
    }
    return html`
      <td
        class="civ-data-grid__td ${alignClass} ${sticky.cls}"
        data-label="${col.header}"
        style="${sticky.style}"
      >${value as unknown as TemplateResult}</td>
    `;
  }

  private _renderEditCell(
    col: GridColumn,
    row: GridRow,
    raw: unknown,
    alignClass: string,
    sticky: { style: string; cls: string } = { style: '', cls: '' },
  ): TemplateResult {
    const inputType = col.inputType ?? 'text';
    const errorId = `${this._instanceId}-edit-error-${row.id}-${col.key}`;
    const showError = this._editError !== '';
    const errorClass = showError ? 'civ-data-grid__td--edit-error' : '';
    return html`
      <td
        class="civ-data-grid__td civ-data-grid__td--editing ${alignClass} ${errorClass} ${sticky.cls}"
        data-label="${col.header}"
        style="${sticky.style}"
      >
        ${inputType === 'select'
          ? this._renderEditSelect(col, row, raw, showError ? errorId : undefined)
          : this._renderEditInput(col, row, raw, inputType, showError ? errorId : undefined)}
        ${showError
          ? html`<p
              id="${errorId}"
              class="civ-data-grid__edit-error"
              role="alert"
            >${this._editError}</p>`
          : nothing}
      </td>
    `;
  }

  private _renderEditInput(
    col: GridColumn,
    row: GridRow,
    raw: unknown,
    inputType: 'text' | 'number',
    errorId: string | undefined,
  ): TemplateResult {
    return html`
      <input
        class="civ-data-grid__edit-input"
        type="${inputType}"
        .value="${raw == null ? '' : String(raw)}"
        aria-label="${col.header}"
        aria-invalid="${errorId ? 'true' : 'false'}"
        aria-describedby="${errorId ?? nothing}"
        @keydown="${(e: KeyboardEvent) => this._onEditKeydown(e, row, col)}"
        @blur="${(e: Event) => this._onEditBlur(e, row, col)}"
        ${ref((el) => this._focusEditInput(el as HTMLInputElement | undefined))}
      />
    `;
  }

  private _renderEditSelect(
    col: GridColumn,
    row: GridRow,
    raw: unknown,
    errorId: string | undefined,
  ): TemplateResult {
    const options = col.options ?? [];
    return html`
      <select
        class="civ-data-grid__edit-input"
        .value="${raw == null ? '' : String(raw)}"
        aria-label="${col.header}"
        aria-invalid="${errorId ? 'true' : 'false'}"
        aria-describedby="${errorId ?? nothing}"
        @keydown="${(e: KeyboardEvent) => this._onEditKeydown(e, row, col)}"
        @blur="${(e: Event) => this._onEditBlur(e, row, col)}"
        ${ref((el) => this._focusEditInput(el as HTMLSelectElement | undefined))}
      >
        ${options.map(
          (opt) => html`
            <option value="${opt.value}" ?selected="${String(raw) === opt.value}">${opt.label}</option>
          `,
        )}
      </select>
    `;
  }

  private _focusEditInput(el: HTMLInputElement | HTMLSelectElement | undefined): void {
    if (!el) return;
    // Defer to next microtask so the input is attached when we focus.
    queueMicrotask(() => {
      if (!el.isConnected) return;
      el.focus();
      if ('select' in el && typeof el.select === 'function') {
        try { el.select(); } catch { /* selects don't support .select */ }
      }
    });
  }

  private _isEditing(rowId: string, columnKey: string): boolean {
    return this._editingCell?.rowId === rowId && this._editingCell?.columnKey === columnKey;
  }

  private _onCellClick(e: Event, row: GridRow, col: GridColumn): void {
    // Don't fire civ-row-activate when an editable cell is clicked —
    // the cell-click is the edit trigger. Stop propagation so the row's
    // click handler skips this event.
    if (this.interactive) e.stopPropagation();
    if (!col.editable || row.disabled) return;
    if (this._isEditing(row.id, col.key)) return;
    this._editingCell = { rowId: row.id, columnKey: col.key };
    this._editError = '';
    dispatch(this, 'civ-cell-edit-start', { rowId: row.id, columnKey: col.key, row });
  }

  private _onEditKeydown(e: KeyboardEvent, row: GridRow, col: GridColumn): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._commitEdit(e.currentTarget as HTMLInputElement | HTMLSelectElement, row, col);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._cancelEdit(row, col);
    }
  }

  private _onEditBlur(e: Event, row: GridRow, col: GridColumn): void {
    // Blur commits — matches Google Sheets / Excel UX.
    this._commitEdit(e.currentTarget as HTMLInputElement | HTMLSelectElement, row, col);
  }

  private _commitEdit(
    input: HTMLInputElement | HTMLSelectElement,
    row: GridRow,
    col: GridColumn,
  ): void {
    if (!this._isEditing(row.id, col.key)) return;
    const rawValue = input.value;
    let value: unknown;
    if (col.inputType === 'number') {
      if (rawValue === '') {
        value = '';
      } else {
        const parsed = Number(rawValue);
        if (Number.isNaN(parsed)) {
          // jsdom / older browsers may admit non-numeric input despite the
          // type="number" hint. Treat as a validation failure so the
          // consumer never sees `NaN` on the committed event detail.
          this._editError = 'Please enter a valid number';
          queueMicrotask(() => input.isConnected && input.focus());
          return;
        }
        value = parsed;
      }
    } else {
      value = rawValue;
    }
    if (col.validate) {
      const error = col.validate(value, row);
      if (error) {
        this._editError = error;
        // Keep the user in edit mode so they can correct.
        // Re-focus the input next microtask in case blur caused this.
        queueMicrotask(() => input.isConnected && input.focus());
        return;
      }
    }
    this._editError = '';
    this._editingCell = null;
    // When keyboardNav is on, the edit input is the focused element; after
    // commit we re-render to the static cell, then send focus back to the
    // cell so the user can arrow-key away without dropping out of the grid.
    if (this.keyboardNav) this._pendingFocus = true;
    dispatch(this, 'civ-cell-edit-commit', {
      rowId: row.id,
      columnKey: col.key,
      value,
      row,
    });
  }

  private _cancelEdit(row: GridRow, col: GridColumn): void {
    if (!this._isEditing(row.id, col.key)) return;
    this._editingCell = null;
    this._editError = '';
    if (this.keyboardNav) this._pendingFocus = true;
    dispatch(this, 'civ-cell-edit-cancel', { rowId: row.id, columnKey: col.key, row });
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
        <div class="civ-data-grid__select-wrap">
          <civ-checkbox
            spacing="sm"
            aria-label="${label}"
            .checked="${isSelected}"
            ?disabled="${row.disabled}"
            disable-analytics
            @civ-change="${() => this._toggleRowSelected(row.id)}"
          ></civ-checkbox>
        </div>
      </td>
    `;
  }

  private _renderSelectAllCheckbox(): TemplateResult {
    const enabledRows = this.rows.filter((r) => !r.disabled);
    const selectedEnabled = enabledRows.filter((r) => this.selectedRowIds.includes(r.id));
    const allSelected = enabledRows.length > 0 && selectedEnabled.length === enabledRows.length;
    const someSelected = selectedEnabled.length > 0 && !allSelected;
    return html`
      <div class="civ-data-grid__select-wrap">
        <civ-checkbox
          spacing="sm"
          aria-label="${t('dataGridSelectAll')}"
          .checked="${allSelected}"
          .indeterminate="${someSelected}"
          ?disabled="${enabledRows.length === 0}"
          disable-analytics
          @civ-change="${this._onSelectAllChange}"
        ></civ-checkbox>
      </div>
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
          <civ-action-button
            data-civ-menu-trigger
            variant="tertiary"
            icon-start="more-vert"
            icon-only
            label="${label}"
          ></civ-action-button>
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

  private _onSortClick(columnKey: string, shiftKey: boolean): void {
    const nextKeys = this._computeNextSortKeys(columnKey, shiftKey);
    // Find what changed for the just-toggled column so the event detail
    // can carry the column / direction backward-compat shape.
    const prevEntry = this._activeSortKeys().find((k) => k.key === columnKey);
    const nextEntry = nextKeys.find((k) => k.key === columnKey);
    let column: string;
    let direction: GridSortDirection;
    if (nextEntry) {
      column = columnKey;
      direction = nextEntry.direction;
    } else if (prevEntry) {
      // Toggled off — report 'none' for this column.
      column = '';
      direction = 'none';
    } else {
      // Edge case (shouldn't happen): report cleared.
      column = '';
      direction = 'none';
    }
    dispatch(this, 'civ-sort', { column, direction, sortKeys: nextKeys });
  }

  /**
   * Pure state machine for the sort stack — single-sort cycle when
   * `multiSort` is off (or no Shift), multi-sort add / cycle / remove
   * when Shift is held and `multiSort` is on. Single-sort cycle:
   * asc → desc → none. Shift+click cycle in multi-sort: add (asc) → desc
   * → remove from stack.
   */
  private _computeNextSortKeys(columnKey: string, shiftKey: boolean): GridSortKey[] {
    // Defensive guard — only honor sort interactions for columns that
    // declared `sortable: true`. The header doesn't render a sort button
    // for non-sortable columns, but programmatic / synthetic callers
    // shouldn't be able to insert garbage.
    const col = this.columns.find((c) => c.key === columnKey);
    if (!col?.sortable) return this._activeSortKeys();

    const current = this._activeSortKeys();
    if (!this.multiSort || !shiftKey) {
      // Plain click — single-key sort. Cycle the clicked column's
      // direction (asc → desc → none) and replace the stack with just
      // that result. The "cycle from current state" rule keeps the
      // gesture predictable even when the clicked column was already in
      // a multi-sort stack at some other position.
      const existing = current.find((k) => k.key === columnKey);
      if (existing) {
        if (existing.direction === 'asc') return [{ key: columnKey, direction: 'desc' }];
        return []; // desc → cleared
      }
      return [{ key: columnKey, direction: 'asc' }];
    }
    // Shift+click in multi-sort mode — modify the existing stack.
    const idx = current.findIndex((k) => k.key === columnKey);
    if (idx === -1) {
      // Column not yet in stack — append with asc.
      return [...current, { key: columnKey, direction: 'asc' }];
    }
    const entry = current[idx];
    if (entry.direction === 'asc') {
      // Cycle to desc, in place.
      const next = [...current];
      next[idx] = { key: columnKey, direction: 'desc' };
      return next;
    }
    // desc — remove from stack.
    return current.filter((k) => k.key !== columnKey);
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
    const checked = (e as CustomEvent<{ checked: boolean }>).detail.checked;
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

  private get _visibleColumns(): GridColumn[] {
    return this.columns.filter((c) => !c.hidden);
  }

  /**
   * Build the per-column sticky cache. For 'start' columns, offsets
   * accumulate left-to-right; for 'end' columns, accumulate right-to-
   * left. Each column needs `width` to participate in the offset
   * calculation; the first sticky column on either edge can omit width
   * (offset is 0). When a non-first sticky column omits width, we fire
   * a dev warning (offset would be `calc(0 + auto)` which CSS can't
   * compute).
   */
  private _getStickyInfo(col: GridColumn) {
    if (this._stickyCache === undefined) {
      this._stickyCache = new Map();
      const visible = this._visibleColumns;
      const startCols = visible.filter((c) => c.sticky === 'start');
      const endCols = visible.filter((c) => c.sticky === 'end');
      let needWarning = false;

      startCols.forEach((c, i) => {
        if (i > 0 && !c.width) needWarning = true;
        const offset = i === 0
          ? '0'
          : startCols.slice(0, i).map((p) => p.width ?? '0').join(' + ');
        this._stickyCache!.set(c.key, {
          side: 'start',
          offset: i === 0 ? '0' : `calc(${offset})`,
          isFirst: i === 0,
          isLast: i === startCols.length - 1,
        });
      });

      // For end-edge, iterate in reverse column order so the *rightmost*
      // sticky column gets offset 0, and earlier ones accumulate the
      // widths of those that come after them.
      const endReversed = [...endCols].reverse();
      endReversed.forEach((c, i) => {
        if (i > 0 && !c.width) needWarning = true;
        const offset = i === 0
          ? '0'
          : endReversed.slice(0, i).map((p) => p.width ?? '0').join(' + ');
        this._stickyCache!.set(c.key, {
          side: 'end',
          offset: i === 0 ? '0' : `calc(${offset})`,
          isFirst: i === 0,
          isLast: i === endReversed.length - 1,
        });
      });

      if (needWarning && !this._warnedStickyWithoutWidth) {
        this._warnedStickyWithoutWidth = true;
        devWarn(
          'civ-data-grid',
          'Multiple sticky columns on the same edge require explicit `width` on every column except the first. Without widths, CSS can\'t compute the cumulative offset and sticky cells will overlap. Set `column.width` (e.g. \'12rem\', \'120px\') on each.',
        );
      }
    }
    return this._stickyCache.get(col.key);
  }

  /**
   * Generate the inline style + class list for a sticky header / body
   * cell. Returns empty strings when the column is not sticky so the
   * caller can interpolate unconditionally.
   */
  private _stickyAttrs(col: GridColumn): { style: string; cls: string } {
    const info = this._getStickyInfo(col);
    if (!info) return { style: '', cls: '' };
    const side = info.side;
    const property = side === 'start' ? 'inset-inline-start' : 'inset-inline-end';
    const style = `position: sticky; ${property}: ${info.offset};`;
    const cls = [
      'civ-data-grid__cell--sticky',
      `civ-data-grid__cell--sticky-${side}`,
      // Boundary cell — the inner edge facing the scrolling content.
      // For sticky-start that's the rightmost pinned column (last in
      // natural order = `isLast`); for sticky-end, the leftmost pinned
      // column — which is the *last* entry we emitted because we
      // iterate end columns in reverse order in _getStickyInfo.
      info.isLast && side === 'start' ? 'civ-data-grid__cell--sticky-boundary-start' : '',
      info.isLast && side === 'end' ? 'civ-data-grid__cell--sticky-boundary-end' : '',
    ].filter(Boolean).join(' ');
    return { style, cls };
  }

  private _totalColumnCount(): number {
    let count = this._visibleColumns.length;
    if (this.selectable !== 'none') count += 1;
    if (this._hasAnyRowActions()) count += 1;
    if (this._hasAnyExpandable()) count += 1;
    return count;
  }

  private _hasAnyRowActions(): boolean {
    if (this._anyRowActionsCache === undefined) {
      this._anyRowActionsCache = this.rows.some(
        (r) => Array.isArray(r.actions) && r.actions.length > 0,
      );
    }
    return this._anyRowActionsCache;
  }

  // ---------------------------------------------------------------------------
  // Keyboard-grid navigation (opt-in via `keyboardNav`)
  //
  // Implements the WAI-ARIA Grid Pattern:
  //   https://www.w3.org/WAI/ARIA/apg/patterns/grid/
  //
  // The table becomes a single tab stop. Inner controls (sort buttons, expand
  // toggles, action menus, edit triggers, checkboxes) drop to `tabindex=-1`
  // so they don't claim Tab — arrow keys move between cells and Enter / Space
  // activate the cell's primary control.
  // ---------------------------------------------------------------------------

  /**
   * Return the table cells laid out as a 2D array, one entry per `<th>` /
   * `<td>` keyed by render row × cell-within-row. Group-header and
   * detail-row cells appear as a single-element row (they span all columns
   * via colspan) — navigating in / out of them stays at col 0.
   *
   * Rows that render a state placeholder (`loading` / `error` / empty)
   * are excluded — they keep their `role="status"` / `role="alert"` live-
   * region semantics and the consumer's keyboard nav should bypass them.
   */
  private _allCells(): HTMLElement[][] {
    const trs = Array.from(
      this.querySelectorAll('thead tr, tbody tr, tfoot tr'),
    ) as HTMLElement[];
    return trs
      .filter((tr) => !tr.querySelector(':scope > .civ-data-grid__state'))
      .map((tr) =>
        Array.from(tr.querySelectorAll(':scope > th, :scope > td')) as HTMLElement[],
      );
  }

  /** Locate a cell's (row, col) position in the current grid. */
  private _findCellIndex(cell: HTMLElement): { r: number; c: number } | null {
    const cells = this._allCells();
    for (let r = 0; r < cells.length; r++) {
      const c = cells[r].indexOf(cell);
      if (c !== -1) return { r, c };
    }
    return null;
  }

  /**
   * Set the focused-cell position from a directly-known cell element. When
   * `updateMemory` is true and the row has more than one cell, the column
   * is also recorded as the desired-column for the column-memory model.
   */
  private _syncFocusFromCell(cell: HTMLElement, updateMemory: boolean): boolean {
    const pos = this._findCellIndex(cell);
    if (!pos) return false;
    this._focusedRow = pos.r;
    this._focusedCol = pos.c;
    if (updateMemory) {
      const cells = this._allCells();
      if ((cells[pos.r]?.length ?? 1) > 1) this._colMemory = pos.c;
    }
    return true;
  }

  private _applyKeyboardNav(): void {
    const cells = this._allCells();
    if (cells.length === 0) return;
    // Clamp focus to the current grid bounds — rows / columns may have
    // shrunk since we last navigated.
    if (this._focusedRow > cells.length - 1) this._focusedRow = cells.length - 1;
    if (this._focusedRow < 0) this._focusedRow = 0;
    const rowLen = cells[this._focusedRow]?.length ?? 1;
    if (this._focusedCol > rowLen - 1) this._focusedCol = rowLen - 1;
    if (this._focusedCol < 0) this._focusedCol = 0;

    const table = this.querySelector('table.civ-data-grid__table');
    table?.setAttribute('role', 'grid');
    // WAI-ARIA Grid Pattern — when multi-row selection is supported, the
    // grid container must declare it so AT can offer the right interaction.
    if (this.selectable === 'multiple') {
      table?.setAttribute('aria-multiselectable', 'true');
    } else {
      table?.removeAttribute('aria-multiselectable');
    }

    cells.forEach((rowEls, r) => {
      const tr = rowEls[0]?.parentElement;
      tr?.setAttribute('role', 'row');
      rowEls.forEach((cell, c) => {
        const isHeader = cell.tagName === 'TH';
        cell.setAttribute('role', isHeader ? 'columnheader' : 'gridcell');
        cell.tabIndex = r === this._focusedRow && c === this._focusedCol ? 0 : -1;
      });
    });

    // Inner controls — excluded from the page tab order. The editing cell's
    // input is the one exception: it needs to stay focusable so Tab from
    // outside still reaches it after a programmatic focus().
    this.querySelectorAll(
      '.civ-data-grid__th button, .civ-data-grid__td button, .civ-data-grid__td input, .civ-data-grid__td select, .civ-data-grid__td a, .civ-data-grid__td [role="button"]',
    ).forEach((el) => {
      if ((el as HTMLElement).closest('.civ-data-grid__td--editing')) return;
      (el as HTMLElement).tabIndex = -1;
    });

    if (this._pendingFocus) {
      this._pendingFocus = false;
      const target = cells[this._focusedRow]?.[this._focusedCol];
      target?.focus();
      // Bring the focused cell into view when the table sits inside a
      // horizontally-scrolling region. `block: 'nearest'` keeps vertical
      // scroll quiet when the row is already visible. jsdom doesn't
      // implement scrollIntoView, so guard the call so tests don't throw.
      if (typeof target?.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  }

  /**
   * Undo `_applyKeyboardNav` when the consumer flips `keyboardNav` off.
   * The grid reverts to plain semantic-table behavior (no role overrides,
   * inner controls regain default tab order).
   */
  private _clearKeyboardNav(): void {
    const table = this.querySelector('table.civ-data-grid__table');
    table?.removeAttribute('role');
    table?.removeAttribute('aria-multiselectable');
    this.querySelectorAll('thead tr, tbody tr').forEach((tr) =>
      tr.removeAttribute('role'),
    );
    this.querySelectorAll('.civ-data-grid__th, .civ-data-grid__td').forEach((el) => {
      el.removeAttribute('role');
      el.removeAttribute('tabindex');
    });
    this.querySelectorAll(
      '.civ-data-grid__th button, .civ-data-grid__td button, .civ-data-grid__td input, .civ-data-grid__td select, .civ-data-grid__td a, .civ-data-grid__td [role="button"]',
    ).forEach((el) => el.removeAttribute('tabindex'));
  }

  private _onTableKeydown = (e: KeyboardEvent): void => {
    if (!this.keyboardNav) return;
    const target = e.target as HTMLElement;
    // Edit-mode inputs have their own keymap (Enter commits, Escape cancels);
    // let those handlers run first.
    if (target.closest('.civ-data-grid__td--editing')) return;
    // When an open <civ-menu> sits inside a cell (the row-actions kebab),
    // its keydown handler is bound to `document` — i.e. it fires AFTER the
    // grid's, not before. Bail so the menu can consume keys it owns
    // (Escape to close, Arrow keys to move between items) before this
    // handler decides what to do with them. After the menu closes, focus
    // returns to the trigger inside the cell and this guard lifts on the
    // next key press.
    if (target.closest('civ-menu[open]')) return;

    // Sync focused cell from the event target — covers mouse/programmatic
    // focus that didn't go through `_onTableFocusin` (e.g. a focus call
    // synchronous with the keydown, or a test dispatching keydown without
    // a prior focus event). Cheap when the indices are already correct.
    const targetCell = target.closest(
      '.civ-data-grid__th, .civ-data-grid__td',
    ) as HTMLElement | null;
    if (targetCell) this._syncFocusFromCell(targetCell, true);

    let handled = true;
    switch (e.key) {
      case 'ArrowRight': this._moveCol(1); break;
      case 'ArrowLeft': this._moveCol(-1); break;
      case 'ArrowDown': this._moveRow(1); break;
      case 'ArrowUp': this._moveRow(-1); break;
      case 'Home': {
        if (e.ctrlKey || e.metaKey) this._focusedRow = 0;
        this._focusedCol = 0;
        this._colMemory = 0;
        this._pendingFocus = true;
        this._applyKeyboardNav();
        break;
      }
      case 'End': {
        const cells = this._allCells();
        if (e.ctrlKey || e.metaKey) this._focusedRow = cells.length - 1;
        this._focusedCol = (cells[this._focusedRow]?.length ?? 1) - 1;
        this._colMemory = this._focusedCol;
        this._pendingFocus = true;
        this._applyKeyboardNav();
        break;
      }
      case 'PageDown': this._moveRow(10); break;
      case 'PageUp': this._moveRow(-10); break;
      case 'Enter':
      case ' ':
        this._activateFocusedCell(false, e.shiftKey);
        break;
      case 'F2':
        this._activateFocusedCell(true);
        break;
      case 'Escape':
        // WAI-ARIA Grid Pattern "actionable cell" — when focus is on an
        // inner control of a cell (a sort button, a kebab trigger after
        // its menu has closed), Escape returns focus to the cell so the
        // user can continue arrow-keying. Inner widgets that own Escape
        // (e.g. <civ-menu> while open) are already handled by the
        // open-menu guard above; this branch only fires when no inner
        // widget claimed the key.
        if (targetCell && target !== targetCell) {
          targetCell.focus();
        } else {
          handled = false;
        }
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };

  private _moveRow(delta: number): void {
    const cells = this._allCells();
    if (cells.length === 0) return;
    this._focusedRow = Math.max(0, Math.min(cells.length - 1, this._focusedRow + delta));
    const rowLen = cells[this._focusedRow]?.length ?? 1;
    // Column memory: restore the user's preferred column when the new row
    // has it; otherwise clamp to what's available but DON'T overwrite the
    // memory — so transit through single-cell group / detail rows preserves
    // the user's column position.
    this._focusedCol = Math.min(this._colMemory, rowLen - 1);
    this._pendingFocus = true;
    this._applyKeyboardNav();
  }

  private _moveCol(delta: number): void {
    const cells = this._allCells();
    if (cells.length === 0) return;
    const rowLen = cells[this._focusedRow]?.length ?? 1;
    this._focusedCol = Math.max(0, Math.min(rowLen - 1, this._focusedCol + delta));
    // Explicit horizontal navigation — this is the new desired column.
    this._colMemory = this._focusedCol;
    this._pendingFocus = true;
    this._applyKeyboardNav();
  }

  /**
   * Activate the focused cell. `preferEdit` (F2) is a stricter variant
   * that only clicks the edit trigger — other controls (sort, expand,
   * menu) are no-ops on F2.
   */
  private _activateFocusedCell(preferEdit: boolean, shiftKey = false): void {
    const cells = this._allCells();
    const cell = cells[this._focusedRow]?.[this._focusedCol];
    if (!cell) return;

    if (preferEdit) {
      const trigger = cell.querySelector(
        '.civ-data-grid__edit-cell-trigger',
      ) as HTMLElement | null;
      trigger?.click();
      return;
    }

    // Enter / Space — activate the primary inner control if present.
    // For "action" controls (buttons, links, checkbox/radio inputs), click
    // them. For text-entry controls (text/number inputs, selects), focus
    // them so the user can begin typing — Esc returns to the cell.
    const ctrl = cell.querySelector(
      'button, input, select, a, [role="button"]',
    ) as HTMLElement | null;
    if (ctrl) {
      const isToggle = ctrl instanceof HTMLInputElement
        && (ctrl.type === 'checkbox' || ctrl.type === 'radio');
      const isAction = isToggle
        || ctrl instanceof HTMLButtonElement
        || ctrl instanceof HTMLAnchorElement
        || ctrl.getAttribute('role') === 'button';
      if (isAction) {
        // Preserve modifier keys on the synthetic click so Shift+Enter on
        // a sort header honors the multi-sort gesture (otherwise the
        // keyboard path is mouse-only).
        if (shiftKey) {
          ctrl.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            shiftKey: true,
          }));
        } else {
          ctrl.click();
        }
      } else {
        ctrl.focus();
      }
      return;
    }

    // No inner control — when the row is interactive, fire row-activate so
    // master-detail flows have a keyboard path.
    if (this.interactive) {
      const tr = cell.closest('tr');
      const rowId = tr?.getAttribute('data-row-id');
      if (rowId) {
        const row = this.rows.find((r) => r.id === rowId);
        if (row && !row.disabled) {
          dispatch(this, 'civ-row-activate', { rowId: row.id, row });
        }
      }
    }
  }

  /**
   * When focus enters a cell directly (e.g. user clicks a cell or an inner
   * control), sync the roving-tabindex position to match so subsequent
   * arrow keys navigate from where the user actually is. We sync tabindex
   * imperatively here rather than via a re-render — re-rendering during
   * a focus event would yank focus away.
   */
  private _onTableFocusin = (e: FocusEvent): void => {
    if (!this.keyboardNav) return;
    const target = e.target as HTMLElement;
    const cell = target.closest(
      '.civ-data-grid__th, .civ-data-grid__td',
    ) as HTMLElement | null;
    if (!cell) return;
    if (!this._syncFocusFromCell(cell, true)) return;
    // Sync tabindex imperatively here rather than via a re-render —
    // re-rendering during a focus event would yank focus away.
    const r = this._focusedRow;
    const c = this._focusedCol;
    this._allCells().forEach((rowEls, ri) =>
      rowEls.forEach((cellEl, ci) => {
        cellEl.tabIndex = ri === r && ci === c ? 0 : -1;
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-data-grid': CivDataGrid;
  }
}
