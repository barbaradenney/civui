import { describe, it, expect } from 'vitest';
import { generateFieldDependenciesGraph } from './generate-field-dependencies-graph.js';
import type { FormSchema } from '../schema/index.js';

function simpleSchema(): FormSchema {
  return {
    sections: [
      {
        fields: [
          { type: 'text', name: 'a', label: 'A' },
          { type: 'text', name: 'b', label: 'B' },
        ],
      },
    ],
  };
}

function conditionalSchema(): FormSchema {
  return {
    sections: [
      {
        fields: [
          { type: 'radio', name: 'hasSpouse', label: 'Do you have a spouse?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
          {
            type: 'text',
            name: 'spouseName',
            label: 'Spouse name',
            visibleWhen: { field: 'hasSpouse', operator: 'eq', value: 'yes' },
          },
          {
            type: 'text',
            name: 'spouseSsn',
            label: 'Spouse SSN',
            requiredWhen: { field: 'hasSpouse', operator: 'eq', value: 'yes' },
          },
        ],
      },
    ],
  };
}

function cascadingSchema(): FormSchema {
  return {
    sections: [
      {
        fields: [
          { type: 'select', name: 'country', label: 'Country', options: [{ value: 'us', label: 'US' }] },
          {
            type: 'select',
            name: 'state',
            label: 'State',
            optionsFrom: { field: 'country', map: { us: [{ value: 'CA', label: 'California' }] } },
          },
        ],
      },
    ],
  };
}

describe('generateFieldDependenciesGraph', () => {
  it('throws when schema has no sections', () => {
    expect(() =>
      generateFieldDependenciesGraph({ sections: [] }),
    ).toThrow('Schema must have at least one section');
  });

  it('returns mermaid, nodes, edges, features', () => {
    const result = generateFieldDependenciesGraph(simpleSchema());
    expect(result).toHaveProperty('mermaid');
    expect(result).toHaveProperty('nodes');
    expect(result).toHaveProperty('edges');
    expect(result).toHaveProperty('features');
  });

  it('nodes include all field names', () => {
    const result = generateFieldDependenciesGraph(simpleSchema());
    expect(result.nodes).toContain('a');
    expect(result.nodes).toContain('b');
  });

  it('no edges for schema without conditions', () => {
    const result = generateFieldDependenciesGraph(simpleSchema());
    expect(result.edges).toHaveLength(0);
  });

  it('mermaid output starts with graph TD', () => {
    const result = generateFieldDependenciesGraph(simpleSchema());
    expect(result.mermaid).toMatch(/^graph TD/);
  });

  it('features include dependency-graph and mermaid', () => {
    const result = generateFieldDependenciesGraph(simpleSchema());
    expect(result.features).toContain('dependency-graph');
    expect(result.features).toContain('mermaid');
  });

  it('visibleWhen creates edges with conditional-edges feature', () => {
    const result = generateFieldDependenciesGraph(conditionalSchema());
    expect(result.edges.some((e) => e.from === 'hasSpouse' && e.to === 'spouseName' && e.type === 'visible')).toBe(true);
    expect(result.features).toContain('conditional-edges');
  });

  it('requiredWhen creates edges', () => {
    const result = generateFieldDependenciesGraph(conditionalSchema());
    expect(result.edges.some((e) => e.from === 'hasSpouse' && e.to === 'spouseSsn' && e.type === 'required')).toBe(true);
  });

  it('cascading options create edges with computed-fields feature', () => {
    const result = generateFieldDependenciesGraph(cascadingSchema());
    expect(result.edges.some((e) => e.from === 'country' && e.to === 'state' && e.type === 'cascading')).toBe(true);
    expect(result.features).toContain('computed-fields');
  });

  it('mermaid uses dashed arrows for conditional edges', () => {
    const result = generateFieldDependenciesGraph(conditionalSchema());
    expect(result.mermaid).toContain('-.->');
  });

  it('cross-field rules create edges', () => {
    const schema: FormSchema = {
      sections: [{ fields: [
        { type: 'text', name: 'income', label: 'Income' },
        { type: 'text', name: 'taxDoc', label: 'Tax Document' },
      ] }],
      crossFieldRules: [{
        id: 'r1',
        description: 'High income requires tax doc',
        when: { field: 'income', operator: 'exists' },
        then: { action: 'require', targets: ['taxDoc'] },
      }],
    };
    const result = generateFieldDependenciesGraph(schema);
    expect(result.edges.some((e) => e.from === 'income' && e.to === 'taxDoc')).toBe(true);
  });

  it('handles compound conditions', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'a', label: 'A' },
          { type: 'text', name: 'b', label: 'B' },
          {
            type: 'text', name: 'c', label: 'C',
            visibleWhen: { allOf: [
              { field: 'a', operator: 'eq', value: 'x' },
              { field: 'b', operator: 'eq', value: 'y' },
            ] },
          },
        ],
      }],
    };
    const result = generateFieldDependenciesGraph(schema);
    expect(result.edges.some((e) => e.from === 'a' && e.to === 'c')).toBe(true);
    expect(result.edges.some((e) => e.from === 'b' && e.to === 'c')).toBe(true);
  });
});
