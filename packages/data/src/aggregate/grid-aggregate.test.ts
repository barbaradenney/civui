import { describe, it, expect } from 'vitest';
import {
  sum,
  avg,
  count,
  min,
  max,
  applyAggregator,
} from './grid-aggregate.js';
import type { GridColumn, GridRow } from '../data-grid/civ-data-grid.types.js';

const col: GridColumn = { key: 'amount', header: 'Amount' };

const rows: GridRow[] = [
  { id: '1', cells: { amount: 100 } },
  { id: '2', cells: { amount: 250 } },
  { id: '3', cells: { amount: 50 } },
];

const mixed: GridRow[] = [
  { id: '1', cells: { amount: 100 } },
  { id: '2', cells: { amount: null } },
  { id: '3', cells: { amount: '' } },
  { id: '4', cells: { amount: 'N/A' } },
  { id: '5', cells: { amount: 200 } },
];

describe('grid-aggregate', () => {
  it('sum adds finite numeric cells', () => {
    expect(sum(rows, col)).toBe(400);
  });

  it('sum skips null / empty / non-numeric cells', () => {
    expect(sum(mixed, col)).toBe(300);
  });

  it('sum of empty rows is 0', () => {
    expect(sum([], col)).toBe(0);
  });

  it('avg averages finite numeric cells', () => {
    expect(avg(rows, col)).toBeCloseTo(133.33, 2);
  });

  it('avg of empty rows is 0', () => {
    expect(avg([], col)).toBe(0);
  });

  it('avg ignores non-numeric cells (denominator excludes them)', () => {
    expect(avg(mixed, col)).toBe(150);
  });

  it('count counts non-null / non-empty cells', () => {
    expect(count(rows, col)).toBe(3);
    expect(count(mixed, col)).toBe(3); // 100, "N/A", 200 are present and non-empty
  });

  it('count treats empty-string cell as missing', () => {
    const r: GridRow[] = [
      { id: '1', cells: { amount: '' } },
      { id: '2', cells: { amount: 0 } },
    ];
    expect(count(r, col)).toBe(1); // 0 counts, '' doesn't
  });

  it('min returns the smallest finite value', () => {
    expect(min(rows, col)).toBe(50);
  });

  it('max returns the largest finite value', () => {
    expect(max(rows, col)).toBe(250);
  });

  it('min / max return 0 for an empty (numerically) row set', () => {
    expect(min([], col)).toBe(0);
    expect(max([], col)).toBe(0);
    // All non-numeric values → empty numeric set.
    const r: GridRow[] = [{ id: 'x', cells: { amount: 'N/A' } }];
    expect(min(r, col)).toBe(0);
    expect(max(r, col)).toBe(0);
  });

  it('applyAggregator dispatches on the string form', () => {
    expect(applyAggregator(rows, { ...col, aggregate: 'sum' })).toBe(400);
    expect(applyAggregator(rows, { ...col, aggregate: 'count' })).toBe(3);
    expect(applyAggregator(rows, { ...col, aggregate: 'min' })).toBe(50);
    expect(applyAggregator(rows, { ...col, aggregate: 'max' })).toBe(250);
    expect(applyAggregator(rows, { ...col, aggregate: 'avg' })).toBeCloseTo(133.33, 2);
  });

  it('applyAggregator invokes the function form with rows + col', () => {
    const aggregate = (rs: readonly GridRow[], c: GridColumn) =>
      `$${sum(rs, c).toFixed(2)}`;
    const result = applyAggregator(rows, { ...col, aggregate });
    expect(result).toBe('$400.00');
  });

  it('applyAggregator returns empty string when column has no aggregator', () => {
    expect(applyAggregator(rows, col)).toBe('');
  });
});
