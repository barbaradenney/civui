import { html, nothing, type TemplateResult } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t, generateId, devWarn } from '@civui/core';
import '@civui/actions/action-button';
import '@civui/overlays/menu';
import './civ-data-grid.types.js';
import type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridResponsiveMode,
  GridSelectionMode,
  GridExpandTemplate,
  GridCellInputType,
  GridCellOption,
} from './civ-data-grid.types.js';

export type {
  GridColumn,
  GridRow,
  GridRowAction,
  GridSortDirection,
  GridResponsiveMode,
  GridSelectionMode,
  GridExpandTemplate,
  GridCellInputType,
  GridCellOption,
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
 * @prop {boolean} interactive - When true, clicking a row (outside the select / actions cells) fires `civ-row-activate`. Use to wire a master-detail drawer or a navigate-to-record flow.
 * @prop {Array} expandedRowIds - IDs of currently-expanded rows (controlled). Update in response to `civ-row-expand`.
 * @prop {Function} expandTemplate - `(row) => string | TemplateResult` — renders the detail content shown when a row is expanded. Required when any row has `expandable: true`.
 *
 * @fires civ-sort - { column, direction } — user clicked a sortable column header
 * @fires civ-selection-change - { selectedRowIds } — selection changed via checkbox
 * @fires civ-row-action - { rowId, action, row } — user activated a row-action item
 * @fires civ-row-activate - { rowId, row } — user clicked a row body when `interactive` is set (master-detail trigger)
 * @fires civ-row-expand - { rowId, expanded, row } — user toggled an expandable row's chevron
 * @fires civ-cell-edit-start - { rowId, columnKey, row } — user activated edit mode on an editable cell
 * @fires civ-cell-edit-commit - { rowId, columnKey, value, row } — user committed a valid new value (Enter / blur / click-outside)
 * @fires civ-cell-edit-cancel - { rowId, columnKey, row } — user cancelled an edit (Escape)
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
  @property({ type: Boolean }) interactive = false;
  @property({ attribute: false }) expandedRowIds: string[] = [];
  @property({ attribute: false }) expandTemplate?: GridExpandTemplate;

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
      ? (this.sortDirection === 'asc' ? 'chevron-up' : 'chevron-down')
      : 'unfold-more';
    const sortLabel = isSorted && this.sortDirection === 'asc'
      ? t('dataGridSortDescending').replace('{column}', col.header)
      : t('dataGridSortAscending').replace('{column}', col.header);

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
          @click="${() => this._onSortClick(col.key)}"
        >
          <span>${col.header}</span>
          <civ-icon name="${sortIcon}" aria-hidden="true"></civ-icon>
        </button>
      </th>
    `;
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

    return this.rows.map((row, rowIndex) => this._renderRow(row, rowIndex));
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
  /** Per-instance dedupe for the sticky-without-width warning. */
  private _warnedStickyWithoutWidth = false;

  override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate?.(changed);
    if (changed.has('rows')) {
      this._anyExpandableCache = undefined;
      this._anyRowActionsCache = undefined;
    }
    if (changed.has('columns')) {
      this._stickyCache = undefined;
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
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-data-grid': CivDataGrid;
  }
}
