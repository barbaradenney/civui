import type {
  GridColumn,
  GridFilters,
  GridRow,
} from '../data-grid/civ-data-grid.types.js';

/**
 * Apply the data-grid's active filters to a row array client-side.
 *
 * Pure function — returns a new array of rows that satisfy every active
 * filter. Use as the default response handler for `civ-filter-change` when
 * filtering happens in the browser:
 *
 * ```ts
 * grid.addEventListener('civ-filter-change', (e) => {
 *   const { filters } = e.detail;
 *   grid.filters = filters;
 *   grid.rows = applyGridFilters(originalRows, columns, filters);
 * });
 * ```
 *
 * For server-side filtering, pass `filters` to your query API instead and
 * ignore this helper.
 *
 * Filter semantics:
 * - `text` — case-insensitive substring match against `String(cell)`.
 * - `select` — exact-equal `String(cell) === value`.
 * - `number-range` — `Number(cell)` between `min` and `max` (both inclusive,
 *   both optional). Rows where the cell can't parse to a finite number are
 *   excluded from a range filter — matches Google Sheets behavior.
 *
 * Multiple active filters AND together; a row must pass every filter.
 */
export function applyGridFilters(
  rows: readonly GridRow[],
  columns: readonly GridColumn[],
  filters: GridFilters,
): GridRow[] {
  const keys = Object.keys(filters);
  if (keys.length === 0) return [...rows];
  const colByKey = new Map(columns.map((c) => [c.key, c]));
  return rows.filter((row) => {
    for (const key of keys) {
      const filter = filters[key];
      const col = colByKey.get(key);
      if (!col) continue; // filter for an unknown column → ignore
      const cell = row.cells?.[key];
      if (!matchesFilter(cell, filter)) return false;
    }
    return true;
  });
}

function matchesFilter(
  cell: unknown,
  filter: GridFilters[string],
): boolean {
  switch (filter.type) {
    case 'text': {
      if (filter.value === '') return true;
      const needle = filter.value.toLowerCase();
      const hay = cell == null ? '' : String(cell).toLowerCase();
      return hay.includes(needle);
    }
    case 'select': {
      if (filter.value === '') return true;
      return cell != null && String(cell) === filter.value;
    }
    case 'number-range': {
      if (filter.min === undefined && filter.max === undefined) return true;
      // Treat null / undefined / '' as "no value" — excluded from a range
      // filter, matching Google Sheets / Excel behavior. Without this
      // guard `Number(null) === 0` would silently include null cells in
      // any range that covers zero.
      if (cell == null || cell === '') return false;
      const n = Number(cell);
      if (!Number.isFinite(n)) return false;
      if (filter.min !== undefined && n < filter.min) return false;
      if (filter.max !== undefined && n > filter.max) return false;
      return true;
    }
  }
}
