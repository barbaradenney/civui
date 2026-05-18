import { describe, it, expect } from 'vitest';
import { gridExport } from './grid-export.js';
import type { GridColumn, GridRow } from '../data-grid/civ-data-grid.types.js';

const columns: GridColumn[] = [
  { key: 'id', header: 'Application ID' },
  { key: 'applicant', header: 'Applicant' },
  { key: 'status', header: 'Status' },
];

const rows: GridRow[] = [
  { id: '1', cells: { id: 'A-001', applicant: 'Smith, John', status: 'Open' } },
  { id: '2', cells: { id: 'A-002', applicant: 'Doe, Jane', status: 'Closed' } },
];

async function readBlobText(blob: Blob): Promise<string> {
  return await blob.text();
}

describe('gridExport — CSV', () => {
  it('emits a CSV File by default', async () => {
    const file = gridExport(rows, columns);
    expect(file.type).toBe('text/csv');
    expect(file.name).toBe('export.csv');
  });

  it('uses a header row from column.header', async () => {
    const file = gridExport(rows, columns);
    const text = await readBlobText(file);
    const [header] = text.split('\r\n');
    // First two columns are simple; "Applicant" has no comma so no quoting.
    expect(header).toBe('Application ID,Applicant,Status');
  });

  it('quotes values containing commas, double-quotes, or newlines (RFC 4180)', async () => {
    const file = gridExport(
      [
        { id: '1', cells: { name: 'Smith, John A.', notes: 'He said "hi"', extra: 'a\nb' } },
      ],
      [
        { key: 'name', header: 'Name' },
        { key: 'notes', header: 'Notes' },
        { key: 'extra', header: 'Extra' },
      ],
    );
    const text = await readBlobText(file);
    const [, row] = text.split('\r\n');
    expect(row).toBe('"Smith, John A.","He said ""hi""","a\nb"');
  });

  it('does not quote plain values; only quotes when a value contains a delimiter', async () => {
    const file = gridExport(rows, columns);
    const text = await readBlobText(file);
    // "Open" / "Closed" / "A-001" — no commas, no quoting.
    expect(text).toContain(',Open');
    expect(text).toContain(',Closed');
    // "Smith, John" contains a comma → must be quoted.
    expect(text).toMatch(/A-001,"Smith, John"/);
  });

  it('renders null / undefined / missing cells as empty', async () => {
    const file = gridExport(
      [{ id: '1', cells: { id: 'A-1' } }], // applicant + status missing
      columns,
    );
    const text = await readBlobText(file);
    expect(text.split('\r\n')[1]).toBe('A-1,,');
  });

  it('uses CRLF line endings for cross-platform compatibility', async () => {
    const file = gridExport(rows, columns);
    const text = await readBlobText(file);
    expect(text).toMatch(/\r\n/);
  });

  it('omits hidden columns by default', async () => {
    const cols: GridColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'secret', header: 'Secret', hidden: true },
      { key: 'applicant', header: 'Applicant' },
    ];
    const file = gridExport(rows, cols);
    const text = await readBlobText(file);
    const [header] = text.split('\r\n');
    expect(header).toBe('ID,Applicant');
  });

  it('includes hidden columns when includeHidden=true', async () => {
    const cols: GridColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'secret', header: 'Secret', hidden: true },
    ];
    const file = gridExport(
      [{ id: '1', cells: { id: 'A-1', secret: 'shh' } }],
      cols,
      { includeHidden: true },
    );
    const text = await readBlobText(file);
    expect(text).toContain('Secret');
    expect(text).toContain('shh');
  });

  it('filters rows by selectedRowIds when provided', async () => {
    const file = gridExport(rows, columns, { selectedRowIds: ['2'] });
    const text = await readBlobText(file);
    const lines = text.split('\r\n');
    expect(lines.length).toBe(2); // header + one row
    expect(lines[1]).toContain('A-002');
    expect(lines[1]).not.toContain('A-001');
  });

  it('exports zero rows (header only) when selectedRowIds matches nothing', async () => {
    const file = gridExport(rows, columns, { selectedRowIds: ['nope'] });
    const text = await readBlobText(file);
    const lines = text.split('\r\n');
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe('Application ID,Applicant,Status');
  });

  it('skips column.formatter by default (CSV needs plain values, formatter often returns TemplateResult)', async () => {
    const cols: GridColumn[] = [
      { key: 'status', header: 'Status', formatter: () => 'FORMATTED' },
    ];
    const file = gridExport(
      [{ id: '1', cells: { status: 'Open' } }],
      cols,
    );
    const text = await readBlobText(file);
    expect(text).toContain('Open');
    expect(text).not.toContain('FORMATTED');
  });

  it('uses column.formatter when useFormatter=true', async () => {
    const cols: GridColumn[] = [
      { key: 'status', header: 'Status', formatter: (v) => `[${v}]` },
    ];
    const file = gridExport(
      [{ id: '1', cells: { status: 'Open' } }],
      cols,
      { useFormatter: true },
    );
    const text = await readBlobText(file);
    expect(text).toContain('[Open]');
  });

  it('accepts a custom filename', async () => {
    const file = gridExport(rows, columns, { filename: 'applications-2026-05.csv' });
    expect(file.name).toBe('applications-2026-05.csv');
  });

  it('coerces non-string values to strings', async () => {
    const cols: GridColumn[] = [
      { key: 'count', header: 'Count' },
      { key: 'active', header: 'Active' },
    ];
    const file = gridExport(
      [{ id: '1', cells: { count: 42, active: true } }],
      cols,
    );
    const text = await readBlobText(file);
    expect(text.split('\r\n')[1]).toBe('42,true');
  });
});

describe('gridExport — JSON', () => {
  it('emits a JSON File when format="json"', async () => {
    const file = gridExport(rows, columns, { format: 'json' });
    expect(file.type).toBe('application/json');
    expect(file.name).toBe('export.json');
  });

  it('emits an array of cell objects', async () => {
    const file = gridExport(rows, columns, { format: 'json' });
    const text = await readBlobText(file);
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0]).toEqual({
      id: 'A-001', applicant: 'Smith, John', status: 'Open',
    });
  });

  it('preserves native types (no string coercion)', async () => {
    const cols: GridColumn[] = [
      { key: 'count', header: 'Count' },
      { key: 'active', header: 'Active' },
    ];
    const file = gridExport(
      [{ id: '1', cells: { count: 42, active: true } }],
      cols,
      { format: 'json' },
    );
    const parsed = JSON.parse(await readBlobText(file));
    expect(parsed[0]).toEqual({ count: 42, active: true });
    expect(typeof parsed[0].count).toBe('number');
    expect(typeof parsed[0].active).toBe('boolean');
  });

  it('omits hidden columns by default in JSON too', async () => {
    const cols: GridColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'secret', header: 'Secret', hidden: true },
    ];
    const file = gridExport(
      [{ id: '1', cells: { id: 'A-1', secret: 'shh' } }],
      cols,
      { format: 'json' },
    );
    const parsed = JSON.parse(await readBlobText(file));
    expect(parsed[0]).toEqual({ id: 'A-1' });
    expect(parsed[0].secret).toBeUndefined();
  });

  it('filters rows by selectedRowIds', async () => {
    const file = gridExport(rows, columns, {
      format: 'json',
      selectedRowIds: ['2'],
    });
    const parsed = JSON.parse(await readBlobText(file));
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('A-002');
  });

  it('emits pretty-printed JSON (2-space indent)', async () => {
    const file = gridExport(rows, columns, { format: 'json' });
    const text = await readBlobText(file);
    expect(text).toMatch(/^\[\n  \{\n    "id"/);
  });
});
