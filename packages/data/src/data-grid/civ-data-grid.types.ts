import type { TemplateResult } from 'lit';

/** Sort direction for a sortable column. `'none'` clears the sort. */
export type GridSortDirection = 'asc' | 'desc' | 'none';

/**
 * Mobile responsive behavior for narrow viewports (≤480px).
 * - `'stacked'` — each row collapses to a vertical label/value block (USWDS stacked pattern).
 * - `'scroll'` — wraps the table in a horizontally-scrollable region; rows stay tabular.
 */
export type GridResponsiveMode = 'stacked' | 'scroll';

/** Selection mode. Use `'multiple'` for bulk actions, `'single'` for radio-style picks. */
export type GridSelectionMode = 'none' | 'single' | 'multiple';

/** Horizontal text alignment within a cell. */
export type GridCellAlign = 'start' | 'center' | 'end' | 'numeric';

/** Input type for an editable cell. Drives which input element the grid swaps in. */
export type GridCellInputType = 'text' | 'number' | 'select';

/** Option for an editable column with `inputType: 'select'`. */
export interface GridCellOption {
  value: string;
  label: string;
}

/**
 * Per-column filter configuration. Set on a column to render a filter
 * input in the filter row beneath the headers. Three variants:
 * - `text` — case-insensitive substring match against the cell's stringified value.
 * - `select` — exact match against one of the supplied options.
 * - `number-range` — pair of min/max inputs; cell value parsed as a number and bounded.
 *
 * The filter row is consumer-controlled: each change fires `civ-filter-change`
 * with the new filter state; the consumer applies the filter to its data and
 * updates the grid's `rows`. Use the `applyGridFilters` utility from
 * `@civui/data/filter` for client-side filtering.
 */
export type GridColumnFilter =
  | { type: 'text'; placeholder?: string }
  | { type: 'select'; options: GridCellOption[]; placeholder?: string }
  | { type: 'number-range'; minPlaceholder?: string; maxPlaceholder?: string };

/**
 * Filter value held in the grid's `filters` map, keyed by column.key. Each
 * value's shape matches its column's filter `type`.
 */
export type GridFilterValue =
  | { type: 'text'; value: string }
  | { type: 'select'; value: string }
  | { type: 'number-range'; min?: number; max?: number };

/** Map of active filter values, keyed by `column.key`. */
export type GridFilters = Record<string, GridFilterValue>;

/**
 * Per-column aggregator for the footer row and per-group subtotal rows.
 *
 * String form: built-in aggregators that operate on the column's cell
 * values. `sum` / `avg` / `min` / `max` parse cells via `Number()` and
 * silently drop non-numeric / null / empty entries. `count` counts rows
 * whose cell is not null / undefined / empty string.
 *
 * Function form: full control. Receives the row subset for the
 * aggregate context (the whole grid, a filtered slice, a single group)
 * plus the column definition. Return a string or number — the grid
 * renders it verbatim, so the function is the right place to format
 * (`'$' + sum(rows, col).toFixed(2)`, etc.). Use the helpers exported
 * from `@civui/data/aggregate` to compose.
 */
export type GridAggregator =
  | 'sum'
  | 'avg'
  | 'count'
  | 'min'
  | 'max'
  | ((rows: readonly GridRow[], col: GridColumn) => string | number);

/**
 * Column definition. Set via the grid's `columns` JS property.
 */
export interface GridColumn {
  /** Stable identifier — keys into `row.cells` and identifies the column for sort events. */
  key: string;
  /** Human-readable header text rendered in `<th>`. */
  header: string;
  /** When true, the header becomes a sort button and dispatches `civ-sort` on click. */
  sortable?: boolean;
  /** Horizontal alignment of the cell content. Numeric values typically use `'numeric'`. */
  align?: GridCellAlign;
  /** CSS width value applied to the column (e.g. `'12rem'`, `'25%'`). */
  width?: string;
  /**
   * When true, the column is omitted from both header and body rendering.
   * Compose with `civ-column-visibility` to give users a toggle, or set
   * statically to hide a column based on user role / feature flags.
   */
  hidden?: boolean;
  /**
   * Pin this column to the leading (`'start'`) or trailing (`'end'`) edge
   * so it stays visible while the rest of the table scrolls horizontally
   * (only takes effect with `responsive="scroll"` or when the table
   * overflows its container). When multiple columns share the same edge,
   * they stack in their natural column order — each subsequent sticky
   * column's offset accumulates the preceding ones' widths, so multi-
   * column sticky requires explicit `width` values. A dev-mode warning
   * fires if you set `sticky` without `width` on a second sticky column.
   */
  sticky?: 'start' | 'end';
  /**
   * Optional formatter that turns the raw cell value into displayable content.
   * Return a string, number, or Lit `TemplateResult` for richer output (e.g. badges, links).
   * The formatter receives `(value, row, rowIndex)`.
   */
  formatter?: (value: unknown, row: GridRow, rowIndex: number) => string | number | TemplateResult;
  /**
   * When true, cells in this column become click-to-edit. Disabled rows
   * (`row.disabled`) are not editable even when this is set. Edit mode
   * swaps the cell's text for an input of `inputType` (default `'text'`);
   * Enter / blur / click-outside commit, Escape cancels.
   */
  editable?: boolean;
  /** Input variant when the cell is editable. Defaults to `'text'`. */
  inputType?: GridCellInputType;
  /** Options for `inputType: 'select'`. Ignored for other input types. */
  options?: GridCellOption[];
  /**
   * Per-cell validator. Returns an error message (non-empty string) to
   * block commit and show the error inline, or `null` / empty string to
   * accept. Runs on Enter / blur before the commit event fires.
   */
  validate?: (value: unknown, row: GridRow) => string | null;
  /**
   * Per-column filter configuration. When set, a filter input renders in
   * the filter row beneath the headers. The grid dispatches
   * `civ-filter-change` with the new filter state on every input — the
   * consumer manages `filters` and re-renders `rows` accordingly.
   * Special cells (selection, expand, actions) render an empty
   * placeholder in the filter row to keep columns aligned.
   */
  filter?: GridColumnFilter;
  /**
   * Per-column aggregator for the footer row and (when `groupBy` is set)
   * per-group subtotal rows. Built-in: `'sum' | 'avg' | 'count' | 'min' |
   * 'max'`. Pass a function for custom formatting:
   * `aggregate: (rows, col) => '$' + sum(rows, col).toFixed(2)`. The
   * footer renders automatically when ANY column has `aggregate` set;
   * non-aggregated columns get an empty placeholder cell so columns
   * align. Use the helpers from `@civui/data/aggregate` to compose.
   */
  aggregate?: GridAggregator;
}

/**
 * Per-row action surfaced via the kebab menu in the trailing actions column.
 */
export interface GridRowAction {
  /** Stable identifier surfaced in the `civ-row-action` event detail. */
  id: string;
  /** Human-readable action label. Keep it specific ("Remove dependent", not "Remove"). */
  label: string;
  /** Apply destructive (red) styling for delete-style actions. */
  destructive?: boolean;
  /** Disable the action when not applicable to this row. */
  disabled?: boolean;
  /**
   * When set, the action renders as a link rather than a button — the menu will
   * still emit `civ-row-action`, and the consumer can `preventDefault()` on the
   * underlying anchor click for SPA routing.
   */
  href?: string;
  /** Optional leading icon name (resolved via the global icon library). */
  icon?: string;
}

/**
 * Row data. Set via the grid's `rows` JS property.
 */
export interface GridRow {
  /** Stable identifier. Required for selection / row-action correlation. */
  id: string;
  /** Cell values keyed by column.key. The raw value passed to a column's formatter. */
  cells: Record<string, unknown>;
  /** When true, the row is non-interactive (cannot be selected; actions still render). */
  disabled?: boolean;
  /** Row-action menu entries. Omit or pass an empty array to suppress the actions column. */
  actions?: GridRowAction[];
  /**
   * When true, the row gets a leading expand-chevron column and an
   * expandable detail row below it. The grid's `expandTemplate` prop
   * renders the detail content for this row when it's in `expandedRowIds`.
   * Mixing expandable + non-expandable rows is allowed — the expand
   * column shows a chevron only on expandable rows.
   */
  expandable?: boolean;
}

/**
 * Callback that renders the detail content for an expanded row. Return a
 * string, number, or Lit `TemplateResult` — same shape as a column
 * formatter. The grid wraps the result in a `<td colspan="N">` inside a
 * new `<tr>` immediately below the data row.
 */
export type GridExpandTemplate = (row: GridRow) => string | number | TemplateResult;

/**
 * Callback that turns a raw group key (whatever value is in
 * `row.cells[groupBy]`) into the human-readable label shown in the
 * group header. Receives the group key + the rows in that group so the
 * label can include a count or aggregate.
 */
export type GridGroupLabel = (groupKey: string, rows: readonly GridRow[]) => string;
