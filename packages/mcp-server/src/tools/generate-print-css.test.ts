import { describe, it, expect } from 'vitest';
import { generatePrintCss } from './generate-print-css.js';
import type { FormSchema } from '../schema/index.js';

describe('generatePrintCss', () => {
  it('always includes base feature and @media print wrapper', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generatePrintCss(schema);
    expect(result.css).toContain('@media print');
    expect(result.css).toContain('Base print styles');
    expect(result.features).toContain('base');
  });

  it('includes focus ring removal in base styles', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generatePrintCss(schema);
    expect(result.css).toContain('outline: none');
    expect(result.css).toContain('box-shadow: none');
  });

  it('includes page-break-inside avoidance in base styles', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generatePrintCss(schema);
    expect(result.css).toContain('page-break-inside: avoid');
  });

  it('includes dl grid formatting in base styles', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generatePrintCss(schema);
    expect(result.css).toContain('display: grid');
    expect(result.css).toContain('grid-template-columns');
  });

  it('includes wizard CSS when schema has steps', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'x', label: 'X' }] },
        { step: 1, fields: [{ type: 'text', name: 'y', label: 'Y' }] },
      ],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toContain('wizard');
    expect(result.css).toContain('data-civ-step');
    expect(result.css).toContain('data-civ-step-nav');
    expect(result.css).toContain('data-civ-progress');
    expect(result.css).toContain('display: none !important');
  });

  it('excludes wizard CSS when no steps', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generatePrintCss(schema);
    expect(result.features).not.toContain('wizard');
    expect(result.css).not.toContain('data-civ-step-nav');
  });

  it('includes repeatable CSS when schema has repeatable sections', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Items',
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'item', label: 'Item' }],
        },
      ],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toContain('repeatable');
    expect(result.css).toContain('data-civ-repeatable-add');
    expect(result.css).toContain('data-civ-repeatable-remove');
  });

  it('includes conditional CSS when fields have visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text', name: 'x', label: 'X',
              visibleWhen: { field: 'y', operator: 'eq', value: '1' },
            },
          ],
        },
      ],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toContain('conditional');
    expect(result.css).toContain('data-civ-show-when');
    expect(result.css).toContain('data-civ-hide-when');
  });

  it('includes conditional CSS when sections have visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Spouse',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [{ type: 'text', name: 'spouse', label: 'Spouse' }],
        },
      ],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toContain('conditional');
  });

  it('includes table CSS when schema has table layout sections', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Income',
          repeatable: true,
          repeatableKey: 'income',
          layout: 'table',
          fields: [{ type: 'text', name: 'source', label: 'Source' }],
        },
      ],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toContain('table');
    expect(result.css).toContain('data-civ-layout="table"');
    expect(result.css).toContain('border-collapse');
    expect(result.css).toContain('table-header-group');
  });

  it('includes all features for complex schema', () => {
    const schema: FormSchema = {
      steps: [{ title: 'S1' }],
      sections: [
        {
          step: 0,
          heading: 'Info',
          repeatable: true,
          repeatableKey: 'info',
          layout: 'table',
          fields: [
            {
              type: 'text', name: 'x', label: 'X',
              visibleWhen: { field: 'y', operator: 'eq', value: '1' },
            },
          ],
        },
      ],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toContain('base');
    expect(result.features).toContain('wizard');
    expect(result.features).toContain('repeatable');
    expect(result.features).toContain('conditional');
    expect(result.features).toContain('table');
    expect(result.features).toHaveLength(5);
  });

  it('only includes base for minimal schema', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    const result = generatePrintCss(schema);
    expect(result.features).toEqual(['base']);
  });

  it('handles empty schema', () => {
    const schema: FormSchema = { sections: [] };
    const result = generatePrintCss(schema);
    expect(result.css).toContain('@media print');
    expect(result.features).toEqual(['base']);
  });
});
