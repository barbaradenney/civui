import { describe, it, expect } from 'vitest';
import { migrateSavedData } from './migrate-saved-data.js';
import type { FormSchema } from '../schema/index.js';

describe('migrateSavedData', () => {
  const baseSchema: FormSchema = {
    sections: [
      {
        fields: [
          { type: 'text', name: 'first-name', label: 'First name' },
          { type: 'text', name: 'last-name', label: 'Last name' },
          { type: 'email', name: 'email', label: 'Email' },
        ],
      },
    ],
  };

  it('direct match: same field names copy values', () => {
    const result = migrateSavedData(baseSchema, baseSchema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
      'email': 'jane@example.com',
    });
    expect(result.values['first-name']).toBe('Jane');
    expect(result.values['last-name']).toBe('Doe');
    expect(result.values['email']).toBe('jane@example.com');
    expect(result.mappedCount).toBe(3);
    expect(result.droppedFields).toHaveLength(0);
  });

  it('explicit rename: fieldMappings maps old → new name', () => {
    const newSchema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'given-name', label: 'Given name' },
            { type: 'text', name: 'family-name', label: 'Family name' },
            { type: 'email', name: 'email', label: 'Email' },
          ],
        },
      ],
    };
    const result = migrateSavedData(baseSchema, newSchema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
      'email': 'jane@example.com',
    }, {
      'first-name': 'given-name',
      'last-name': 'family-name',
    });
    expect(result.values['given-name']).toBe('Jane');
    expect(result.values['family-name']).toBe('Doe');
    expect(result.values['email']).toBe('jane@example.com');
    expect(result.mappedCount).toBe(3);
    expect(result.droppedFields).toHaveLength(0);
  });

  it('dropped fields: old fields not in new schema', () => {
    const newSchema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'first-name', label: 'First name' },
          ],
        },
      ],
    };
    const result = migrateSavedData(baseSchema, newSchema, {
      'first-name': 'Jane',
      'last-name': 'Doe',
      'email': 'jane@example.com',
    });
    expect(result.mappedCount).toBe(1);
    expect(result.droppedFields).toContain('last-name');
    expect(result.droppedFields).toContain('email');
    expect(result.droppedFields).toHaveLength(2);
  });

  it('unmapped fields: new fields with no value', () => {
    const newSchema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'first-name', label: 'First name' },
            { type: 'text', name: 'middle-name', label: 'Middle name' },
          ],
        },
      ],
    };
    const result = migrateSavedData(baseSchema, newSchema, {
      'first-name': 'Jane',
    });
    expect(result.unmappedFields).toContain('middle-name');
  });

  it('type mismatch: warns when field type changes', () => {
    const newSchema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'select', name: 'first-name', label: 'First name', options: [{ value: 'Jane', label: 'Jane' }] },
          ],
        },
      ],
    };
    const result = migrateSavedData(baseSchema, newSchema, {
      'first-name': 'Jane',
    });
    expect(result.values['first-name']).toBe('Jane');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Type mismatch');
    expect(result.warnings[0]).toContain('text');
    expect(result.warnings[0]).toContain('select');
  });

  it('repeatable fields: preserves indices and maps base name', () => {
    const oldSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'deps',
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
            { type: 'text', name: 'age', label: 'Age' },
          ],
        },
      ],
    };
    const newSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'deps',
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
            { type: 'text', name: 'age', label: 'Age' },
          ],
        },
      ],
    };
    const result = migrateSavedData(oldSchema, newSchema, {
      'deps[0].name': 'Alice',
      'deps[0].age': '10',
      'deps[1].name': 'Bob',
      'deps[1].age': '8',
    });
    expect(result.values['deps[0].name']).toBe('Alice');
    expect(result.values['deps[1].age']).toBe('8');
    expect(result.mappedCount).toBe(4);
  });

  it('repeatable fields: applies key mapping', () => {
    const oldSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'deps',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
      ],
    };
    const newSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'dependents',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
      ],
    };
    const result = migrateSavedData(oldSchema, newSchema, {
      'deps[0].name': 'Alice',
    }, {
      deps: 'dependents',
    });
    expect(result.values['dependents[0].name']).toBe('Alice');
    expect(result.mappedCount).toBe(1);
  });

  it('repeatable fields: applies field name mapping within repeatable', () => {
    const oldSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'desc', label: 'Description' }],
        },
      ],
    };
    const newSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'description', label: 'Description' }],
        },
      ],
    };
    const result = migrateSavedData(oldSchema, newSchema, {
      'items[0].desc': 'Widget',
    }, {
      desc: 'description',
    });
    expect(result.values['items[0].description']).toBe('Widget');
    expect(result.mappedCount).toBe(1);
  });

  it('repeatable fields: drops when key no longer repeatable', () => {
    const oldSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const newSchema: FormSchema = {
      sections: [
        {
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const result = migrateSavedData(oldSchema, newSchema, {
      'items[0].x': 'value',
    });
    expect(result.droppedFields).toContain('items[0].x');
    expect(result.mappedCount).toBe(0);
  });

  it('repeatable fields: drops when field removed from repeatable section', () => {
    const oldSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            { type: 'text', name: 'b', label: 'B' },
          ],
        },
      ],
    };
    const newSchema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'a', label: 'A' }],
        },
      ],
    };
    const result = migrateSavedData(oldSchema, newSchema, {
      'items[0].a': 'val-a',
      'items[0].b': 'val-b',
    });
    expect(result.values['items[0].a']).toBe('val-a');
    expect(result.droppedFields).toContain('items[0].b');
  });

  it('handles empty saved values', () => {
    const result = migrateSavedData(baseSchema, baseSchema, {});
    expect(result.mappedCount).toBe(0);
    expect(result.droppedFields).toHaveLength(0);
    expect(result.values).toEqual({});
  });

  it('handles array values (checkbox-group)', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'checkbox-group', name: 'prefs', label: 'Preferences', children: [] },
          ],
        },
      ],
    };
    const result = migrateSavedData(schema, schema, {
      prefs: ['a', 'b', 'c'],
    });
    expect(result.values['prefs']).toEqual(['a', 'b', 'c']);
    expect(result.mappedCount).toBe(1);
  });

  it('handles no fieldMappings parameter', () => {
    const result = migrateSavedData(baseSchema, baseSchema, {
      'first-name': 'Jane',
    });
    expect(result.values['first-name']).toBe('Jane');
    expect(result.mappedCount).toBe(1);
  });

  it('type mismatch warning for renamed fields', () => {
    const oldSchema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'phone', label: 'Phone' }] }],
    };
    const newSchema: FormSchema = {
      sections: [{ fields: [{ type: 'tel', name: 'telephone', label: 'Telephone' }] }],
    };
    const result = migrateSavedData(oldSchema, newSchema, {
      phone: '555-1234',
    }, {
      phone: 'telephone',
    });
    expect(result.values['telephone']).toBe('555-1234');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Type mismatch');
  });

  it('unmapped does not include fields that got repeatable values', () => {
    const schema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
      ],
    };
    const result = migrateSavedData(schema, schema, {
      'items[0].name': 'Widget',
    });
    expect(result.unmappedFields).not.toContain('name');
  });
});
