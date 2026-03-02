import { describe, it, expect } from 'vitest';
import { generateDataTable } from './generate-data-table.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  dataTable: {
    caption: 'Monthly expenses',
    columns: [
      { id: 'description', label: 'Description', type: 'text', required: true },
      { id: 'amount', label: 'Amount', type: 'currency' },
      { id: 'date', label: 'Date', type: 'date' },
      { id: 'category', label: 'Category', type: 'select', options: [
        { value: 'housing', label: 'Housing' },
        { value: 'food', label: 'Food' },
      ]},
    ],
    minRows: 1,
    maxRows: 10,
    showTotals: ['amount'],
    sortable: true,
  },
  sections: [],
};

describe('generateDataTable', () => {
  it('throws when schema has no dataTable config', () => {
    const noTable: FormSchema = { sections: [] };
    expect(() => generateDataTable(noTable)).toThrow('Schema must have a dataTable configuration');
  });

  it('returns html, javascript, features, columns', () => {
    const result = generateDataTable(schema);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('columns');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.columns)).toBe(true);
  });

  it('columns matches column ids from config', () => {
    const result = generateDataTable(schema);
    expect(result.columns).toEqual(['description', 'amount', 'date', 'category']);
  });

  it('HTML has data-civ-data-table wrapper', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('data-civ-data-table');
  });

  it('caption text is rendered', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('<caption>Monthly expenses</caption>');
  });

  it('column headers are rendered with scope="col"', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('scope="col"');
    expect(result.html).toContain('Description');
    expect(result.html).toContain('Amount');
    expect(result.html).toContain('Date');
    expect(result.html).toContain('Category');
  });

  it('default initial rows is 1 (from minRows)', () => {
    const result = generateDataTable(schema);
    const rowMatches = result.html.match(/data-civ-table-row/g);
    expect(rowMatches).toHaveLength(1);
  });

  it('custom initialRows option overrides minRows', () => {
    const result = generateDataTable(schema, { initialRows: 3 });
    const rowMatches = result.html.match(/data-civ-table-row/g);
    expect(rowMatches).toHaveLength(3);
  });

  it('currency column gets type="number" with step="0.01" and inputmode="decimal"', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('type="number"');
    expect(result.html).toContain('step="0.01"');
    expect(result.html).toContain('inputmode="decimal"');
  });

  it('select column renders select element with options', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('<select');
    expect(result.html).toContain('<option value="housing">Housing</option>');
    expect(result.html).toContain('<option value="food">Food</option>');
  });

  it('required columns get required attribute on inputs', () => {
    const result = generateDataTable(schema);
    // The description column is required; its input should have a required attribute
    expect(result.html).toMatch(/name="description\[0\]"[^>]*required/);
  });

  it('totals footer shows for showTotals columns (data-civ-total)', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('data-civ-total="amount"');
    expect(result.html).toContain('<tfoot>');
    expect(result.html).toContain('Total');
  });

  it('sort buttons appear when sortable is true', () => {
    const result = generateDataTable(schema);
    expect(result.html).toContain('data-civ-sort="description"');
    expect(result.html).toContain('data-civ-sort="amount"');
    expect(result.html).toContain('data-civ-sort="date"');
    expect(result.html).toContain('data-civ-sort="category"');
  });

  it('features include data-table, add-remove-rows, totals, sortable, currency, aria-live', () => {
    const result = generateDataTable(schema);
    expect(result.features).toContain('data-table');
    expect(result.features).toContain('add-remove-rows');
    expect(result.features).toContain('totals');
    expect(result.features).toContain('sortable');
    expect(result.features).toContain('currency');
    expect(result.features).toContain('aria-live');
  });
});
