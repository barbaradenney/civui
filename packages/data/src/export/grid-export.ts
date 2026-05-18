import type { GridColumn, GridRow } from '../data-grid/civ-data-grid.types.js';

/**
 * Options for `gridExport`.
 *
 * - `format`: `'csv'` (default) emits comma-separated values with RFC 4180
 *   quoting; `'json'` emits a `JSON.stringify`'d array of `row.cells`
 *   objects.
 * - `filename`: optional name for the returned `File`. Defaults to
 *   `'export.csv'` / `'export.json'`.
 * - `includeHidden`: when `false` (default), columns with `hidden: true`
 *   are omitted. Set `true` to export *every* declared column regardless
 *   of visibility — useful when the UI hides a column the data still
 *   matters for downstream.
 * - `useFormatter`: when `true` (CSV only — default `false`), the column's
 *   `formatter` callback is invoked to produce the cell's text. Most
 *   formatters return Lit `TemplateResult` which doesn't stringify
 *   usefully; only enable this when you've authored formatters that
 *   return plain strings / numbers.
 * - `selectedRowIds`: when provided, only export rows whose `id` is in
 *   this array. Pairs with `grid.selectedRowIds` for "export selection"
 *   workflows.
 */
export interface GridExportOptions {
  format?: 'csv' | 'json';
  filename?: string;
  includeHidden?: boolean;
  useFormatter?: boolean;
  selectedRowIds?: string[];
}

/**
 * Generate a downloadable export of a `civ-data-grid`'s data.
 *
 * Returns a `File` (a `Blob` with a name) which the consumer can
 * surface via an anchor download, `navigator.share`, or any other
 * Blob-consuming path. Pure function — no DOM mutation, no event
 * dispatch. Works in any environment with the standard `Blob`/`File`
 * web API.
 *
 * @example CSV with selection-only export
 * ```ts
 * const blob = gridExport(grid.rows, grid.columns, {
 *   format: 'csv',
 *   filename: 'selected-applications.csv',
 *   selectedRowIds: grid.selectedRowIds,
 * });
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url; a.download = blob.name; a.click();
 * URL.revokeObjectURL(url);
 * ```
 */
export function gridExport(
  rows: readonly GridRow[],
  columns: readonly GridColumn[],
  options: GridExportOptions = {},
): File {
  const {
    format = 'csv',
    includeHidden = false,
    useFormatter = false,
    selectedRowIds,
  } = options;
  const filename = options.filename
    ?? (format === 'csv' ? 'export.csv' : 'export.json');

  const exportColumns = includeHidden
    ? [...columns]
    : columns.filter((c) => !c.hidden);

  const exportRows = selectedRowIds
    ? rows.filter((r) => selectedRowIds.includes(r.id))
    : [...rows];

  if (format === 'json') {
    const out = exportRows.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of exportColumns) {
        obj[col.key] = row.cells?.[col.key];
      }
      return obj;
    });
    return new File([JSON.stringify(out, null, 2)], filename, {
      type: 'application/json',
    });
  }

  // CSV: RFC 4180 — wrap in double quotes when the value contains a
  // comma, double quote, or newline. Escape embedded double quotes by
  // doubling them. Always quote header cells so columns whose `header`
  // contains a comma stay aligned.
  const csvCell = (value: unknown): string => {
    if (value == null) return '';
    const s = typeof value === 'string' ? value : String(value);
    if (/[",\r\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = exportColumns
    .map((c) => csvCell(c.header))
    .join(',');

  const dataLines = exportRows.map((row, rowIndex) =>
    exportColumns
      .map((col) => {
        const raw = row.cells?.[col.key];
        const value = useFormatter && col.formatter
          ? col.formatter(raw, row, rowIndex)
          : raw;
        return csvCell(value);
      })
      .join(','),
  );

  const csv = [headerLine, ...dataLines].join('\r\n');
  return new File([csv], filename, { type: 'text/csv' });
}
