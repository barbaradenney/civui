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
