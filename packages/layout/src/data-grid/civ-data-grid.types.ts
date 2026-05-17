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
   * Optional formatter that turns the raw cell value into displayable content.
   * Return a string, number, or Lit `TemplateResult` for richer output (e.g. badges, links).
   * The formatter receives `(value, row, rowIndex)`.
   */
  formatter?: (value: unknown, row: GridRow, rowIndex: number) => string | number | TemplateResult;
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
}
