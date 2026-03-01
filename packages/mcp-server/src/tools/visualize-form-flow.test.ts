import { describe, it, expect } from 'vitest';
import { visualizeFormFlow } from './visualize-form-flow.js';
import type { FormSchema } from '../schema/index.js';

describe('visualizeFormFlow', () => {
  it('generates flowchart for simple schema with one section', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Personal Info',
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
          ],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('flowchart TD');
    expect(result.mermaid).toContain('Personal Info');
    expect(result.nodeCount).toBeGreaterThan(0);
    expect(result.edgeCount).toBe(0);
  });

  it('generates wizard step nodes with sequential flow', () => {
    const schema: FormSchema = {
      steps: [
        { title: 'Step 1' },
        { title: 'Step 2' },
      ],
      sections: [
        { step: 0, heading: 'Personal', fields: [{ type: 'text', name: 'name', label: 'Name' }] },
        { step: 1, heading: 'Contact', fields: [{ type: 'email', name: 'email', label: 'Email' }] },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('START((Start))');
    expect(result.mermaid).toContain('step0([Step 1: Step 1])');
    expect(result.mermaid).toContain('step1([Step 2: Step 2])');
    expect(result.mermaid).toContain('START ==> step0');
    expect(result.mermaid).toContain('step0 ==> step1');
    expect(result.summary).toContain('2 wizard steps');
  });

  it('links sections to their steps', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Only Step' }],
      sections: [
        { step: 0, heading: 'Info', fields: [{ type: 'text', name: 'x', label: 'X' }] },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('step0 --- sec_info_0');
  });

  it('renders repeatable sections with hexagon shape', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Employers',
          repeatable: true,
          repeatableKey: 'employers',
          fields: [{ type: 'text', name: 'company', label: 'Company' }],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('{{Employers - repeatable}}');
  });

  it('renders table layout sections with trapezoid shape', () => {
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
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('[/Income - table\\]');
  });

  it('creates conditional visibility edges from field visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'select', name: 'status', label: 'Status', options: [{ value: 'a', label: 'A' }] },
            {
              type: 'text', name: 'details', label: 'Details',
              visibleWhen: { field: 'status', operator: 'eq', value: 'a' },
            },
          ],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('field_status');
    expect(result.mermaid).toContain('field_details');
    expect(result.mermaid).toContain('-.->');
    expect(result.mermaid).toContain('eq a');
    expect(result.summary).toContain('1 conditional');
  });

  it('creates conditional visibility edges from section visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [{ type: 'radio', name: 'married', label: 'Married', children: [
            { type: 'radio', name: 'yes', label: 'Yes' },
            { type: 'radio', name: 'no', label: 'No' },
          ] }],
        },
        {
          heading: 'Spouse Info',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [{ type: 'text', name: 'spouse-name', label: 'Spouse name' }],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('field_married');
    expect(result.mermaid).toContain('sec_spouse_info_1');
    expect(result.mermaid).toContain('-.->');
  });

  it('creates cascading option edges', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'select', name: 'state', label: 'State', options: [{ value: 'CA', label: 'CA' }] },
            {
              type: 'select', name: 'county', label: 'County',
              optionsFrom: {
                field: 'state',
                map: { CA: [{ value: 'la', label: 'Los Angeles' }] },
              },
            },
          ],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('field_state -- cascading --> field_county');
    expect(result.summary).toContain('1 cascading');
  });

  it('creates cross-field rule edges', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'select', name: 'veteran', label: 'Veteran', options: [] },
            { type: 'text', name: 'service-dates', label: 'Service dates' },
          ],
        },
      ],
      crossFieldRules: [
        {
          id: 'r1',
          description: 'Veterans need service dates',
          when: { field: 'veteran', operator: 'eq', value: 'yes' },
          then: { action: 'require', targets: ['service-dates'] },
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('rule: Veterans need service dates');
    expect(result.summary).toContain('1 cross-field rules');
  });

  it('handles compound conditions (allOf/anyOf)', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            { type: 'text', name: 'b', label: 'B' },
            {
              type: 'text', name: 'c', label: 'C',
              visibleWhen: {
                allOf: [
                  { field: 'a', operator: 'eq', value: '1' },
                  { field: 'b', operator: 'eq', value: '2' },
                ],
              },
            },
          ],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('field_a');
    expect(result.mermaid).toContain('field_b');
    expect(result.mermaid).toContain('field_c');
    expect(result.edgeCount).toBeGreaterThanOrEqual(2);
  });

  it('returns correct node and edge counts', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Info',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.nodeCount).toBe(1); // 1 section
    expect(result.edgeCount).toBe(0);
  });

  it('produces valid summary string', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Simple',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.summary).toMatch(/\d+ nodes, \d+ edges/);
  });

  it('handles empty schema gracefully', () => {
    const schema: FormSchema = { sections: [] };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('flowchart TD');
    expect(result.nodeCount).toBe(0);
    expect(result.edgeCount).toBe(0);
  });

  it('escapes special characters in labels', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Info "quoted"',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('#quot;');
    expect(result.mermaid).not.toContain('"quoted"');
  });

  it('deduplicates field nodes referenced multiple times', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'trigger', label: 'Trigger' },
            {
              type: 'text', name: 'a', label: 'A',
              visibleWhen: { field: 'trigger', operator: 'eq', value: '1' },
            },
            {
              type: 'text', name: 'b', label: 'B',
              visibleWhen: { field: 'trigger', operator: 'eq', value: '2' },
            },
          ],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    // 'trigger' field node should appear only once
    const matches = result.mermaid.match(/field_trigger\[/g);
    expect(matches).toHaveLength(1);
  });

  it('handles duplicate section headings without ID collision', () => {
    const schema: FormSchema = {
      sections: [
        { heading: 'Address', fields: [{ type: 'text', name: 'street1', label: 'Street' }] },
        { heading: 'Address', fields: [{ type: 'text', name: 'street2', label: 'Street' }] },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.mermaid).toContain('sec_address_0');
    expect(result.mermaid).toContain('sec_address_1');
    expect(result.nodeCount).toBe(2);
  });

  it('combines wizard, conditional, and cascading in summary', () => {
    const schema: FormSchema = {
      steps: [{ title: 'S1' }, { title: 'S2' }],
      sections: [
        {
          step: 0,
          fields: [
            { type: 'select', name: 'state', label: 'State', options: [{ value: 'CA', label: 'CA' }] },
            {
              type: 'select', name: 'county', label: 'County',
              optionsFrom: { field: 'state', map: { CA: [{ value: 'la', label: 'LA' }] } },
            },
          ],
        },
        {
          step: 1,
          heading: 'Extra',
          visibleWhen: { field: 'state', operator: 'eq', value: 'CA' },
          fields: [{ type: 'text', name: 'extra', label: 'Extra' }],
        },
      ],
    };
    const result = visualizeFormFlow(schema);
    expect(result.summary).toContain('2 wizard steps');
    expect(result.summary).toContain('1 conditional');
    expect(result.summary).toContain('1 cascading');
  });
});
