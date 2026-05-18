import { describe, it, expect } from 'vitest';
import { applyGridFilters } from './grid-filter.js';
import type { GridColumn, GridRow } from '../data-grid/civ-data-grid.types.js';

const columns: GridColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'status', header: 'Status' },
  { key: 'amount', header: 'Amount' },
];

const rows: GridRow[] = [
  { id: '1', cells: { name: 'Smith, John', status: 'Active', amount: 100 } },
  { id: '2', cells: { name: 'Doe, Jane', status: 'Pending', amount: 250 } },
  { id: '3', cells: { name: 'Reyes, Maria', status: 'Active', amount: 50 } },
  { id: '4', cells: { name: 'Chen, Wei', status: 'Denied', amount: 0 } },
];

describe('applyGridFilters', () => {
  it('returns a shallow copy when filters is empty', () => {
    const out = applyGridFilters(rows, columns, {});
    expect(out).toEqual(rows);
    expect(out).not.toBe(rows);
  });

  it('text filter matches a case-insensitive substring', () => {
    const out = applyGridFilters(rows, columns, {
      name: { type: 'text', value: 'smith' },
    });
    expect(out.map((r) => r.id)).toEqual(['1']);
  });

  it('text filter with empty string is a no-op (treats as cleared)', () => {
    const out = applyGridFilters(rows, columns, {
      name: { type: 'text', value: '' },
    });
    expect(out).toHaveLength(4);
  });

  it('text filter against null / undefined cell value matches empty string', () => {
    const r: GridRow[] = [{ id: 'x', cells: { name: null as any } }];
    const out = applyGridFilters(r, columns, {
      name: { type: 'text', value: '' },
    });
    expect(out).toHaveLength(1);
  });

  it('select filter matches exact value', () => {
    const out = applyGridFilters(rows, columns, {
      status: { type: 'select', value: 'Active' },
    });
    expect(out.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('select filter does not match partial values', () => {
    const out = applyGridFilters(rows, columns, {
      status: { type: 'select', value: 'Act' },
    });
    expect(out).toHaveLength(0);
  });

  it('select filter with empty string is a no-op', () => {
    const out = applyGridFilters(rows, columns, {
      status: { type: 'select', value: '' },
    });
    expect(out).toHaveLength(4);
  });

  it('number-range filter respects both bounds (inclusive)', () => {
    const out = applyGridFilters(rows, columns, {
      amount: { type: 'number-range', min: 50, max: 100 },
    });
    expect(out.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('number-range filter with only min behaves as ≥', () => {
    const out = applyGridFilters(rows, columns, {
      amount: { type: 'number-range', min: 100 },
    });
    expect(out.map((r) => r.id)).toEqual(['1', '2']);
  });

  it('number-range filter with only max behaves as ≤', () => {
    const out = applyGridFilters(rows, columns, {
      amount: { type: 'number-range', max: 50 },
    });
    expect(out.map((r) => r.id)).toEqual(['3', '4']);
  });

  it('number-range filter excludes rows whose cell is non-numeric', () => {
    const mixed: GridRow[] = [
      ...rows,
      { id: '5', cells: { name: 'X', status: 'X', amount: 'N/A' } },
      { id: '6', cells: { name: 'Y', status: 'Y', amount: null } },
    ];
    const out = applyGridFilters(mixed, columns, {
      amount: { type: 'number-range', min: 0 },
    });
    expect(out.map((r) => r.id)).toEqual(['1', '2', '3', '4']);
  });

  it('number-range filter with both bounds undefined is a no-op', () => {
    const out = applyGridFilters(rows, columns, {
      amount: { type: 'number-range' },
    });
    expect(out).toHaveLength(4);
  });

  it('multiple filters AND together', () => {
    const out = applyGridFilters(rows, columns, {
      status: { type: 'select', value: 'Active' },
      amount: { type: 'number-range', min: 75 },
    });
    expect(out.map((r) => r.id)).toEqual(['1']);
  });

  it('ignores filter entries whose key matches no column', () => {
    const out = applyGridFilters(rows, columns, {
      nonexistent: { type: 'text', value: 'foo' },
      status: { type: 'select', value: 'Denied' },
    });
    expect(out.map((r) => r.id)).toEqual(['4']);
  });

  it('does not mutate the input rows array', () => {
    const before = rows.map((r) => r.id);
    applyGridFilters(rows, columns, {
      name: { type: 'text', value: 'doe' },
    });
    expect(rows.map((r) => r.id)).toEqual(before);
  });
});
