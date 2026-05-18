import type { GridColumn, GridRow } from '../data-grid/civ-data-grid.types.js';

/**
 * Built-in aggregator helpers shared by the data-grid's footer / group
 * subtotal rendering and exported for consumers who compose custom
 * function aggregators:
 *
 * ```ts
 * import { sum, avg, count } from '@civui/data/aggregate';
 *
 * column.aggregate = (rows, col) => `$${sum(rows, col).toFixed(2)}`;
 * ```
 *
 * All helpers extract `row.cells[col.key]` for each row, then:
 * - `sum`, `avg`, `min`, `max` parse via `Number()` and discard non-
 *   finite values (null, undefined, '', 'N/A', etc.) — matches Google
 *   Sheets / Excel `SUM` / `AVERAGE` / `MIN` / `MAX` behavior.
 * - `count` counts rows whose cell is present and non-empty (matches
 *   Excel `COUNTA`, not `COUNT`).
 * - `min` / `max` on an empty set return `0` (a neutral display) rather
 *   than `Infinity` / `-Infinity`.
 */

function numericValues(rows: readonly GridRow[], col: GridColumn): number[] {
  const out: number[] = [];
  for (const row of rows) {
    const raw = row.cells?.[col.key];
    if (raw == null || raw === '') continue;
    const n = Number(raw);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

export function sum(rows: readonly GridRow[], col: GridColumn): number {
  return numericValues(rows, col).reduce((a, b) => a + b, 0);
}

export function avg(rows: readonly GridRow[], col: GridColumn): number {
  const v = numericValues(rows, col);
  if (v.length === 0) return 0;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

export function count(rows: readonly GridRow[], col: GridColumn): number {
  let n = 0;
  for (const row of rows) {
    const raw = row.cells?.[col.key];
    if (raw != null && raw !== '') n++;
  }
  return n;
}

export function min(rows: readonly GridRow[], col: GridColumn): number {
  const v = numericValues(rows, col);
  if (v.length === 0) return 0;
  return Math.min(...v);
}

export function max(rows: readonly GridRow[], col: GridColumn): number {
  const v = numericValues(rows, col);
  if (v.length === 0) return 0;
  return Math.max(...v);
}

/**
 * Apply the string form of `column.aggregate` to a row subset. Returns
 * `''` when the column has no aggregator. Used internally by the
 * data-grid's footer / subtotal rendering; consumers usually call the
 * primitives directly.
 */
export function applyAggregator(
  rows: readonly GridRow[],
  col: GridColumn,
): string | number {
  const agg = col.aggregate;
  if (!agg) return '';
  if (typeof agg === 'function') return agg(rows, col);
  switch (agg) {
    case 'sum': return sum(rows, col);
    case 'avg': return avg(rows, col);
    case 'count': return count(rows, col);
    case 'min': return min(rows, col);
    case 'max': return max(rows, col);
  }
}
