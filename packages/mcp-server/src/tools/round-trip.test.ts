/**
 * Round-trip tests: schema → generateCivUI() → formToSchema() → compare.
 * Verifies that round-trippable properties survive the generate→parse cycle.
 *
 * Known non-round-trippable: crossFieldRules, auto-generated hints/required-messages,
 * entityType, subForms, autocomplete/inputmode defaults.
 */
import { describe, it, expect } from 'vitest';
import { generateCivUI } from '../generator/index.js';
import { formToSchema } from './form-to-schema.js';
import type { FormSchema, FormField, FormSection } from '../schema/index.js';

/** Compare round-trippable properties of fields. */
function compareField(original: FormField, recovered: FormField, context: string) {
  expect(recovered.type, `${context} type`).toBe(original.type);
  expect(recovered.name, `${context} name`).toBe(original.name);
  expect(recovered.label, `${context} label`).toBe(original.label);
  if (original.required) {
    expect(recovered.required, `${context} required`).toBe(true);
  }
  if (original.disabled) {
    expect(recovered.disabled, `${context} disabled`).toBe(true);
  }
  if (original.placeholder) {
    expect(recovered.placeholder, `${context} placeholder`).toBe(original.placeholder);
  }
  if (original.maxlength !== undefined) {
    expect(recovered.maxlength, `${context} maxlength`).toBe(original.maxlength);
  }
  if (original.minlength !== undefined) {
    expect(recovered.minlength, `${context} minlength`).toBe(original.minlength);
  }
  if (original.pattern) {
    expect(recovered.pattern, `${context} pattern`).toBe(original.pattern);
  }
  if (original.accept) {
    expect(recovered.accept, `${context} accept`).toBe(original.accept);
  }
  if (original.multiple) {
    expect(recovered.multiple, `${context} multiple`).toBe(true);
  }
  if (original.options) {
    expect(recovered.options?.length, `${context} options count`).toBe(original.options.length);
    for (let i = 0; i < original.options.length; i++) {
      expect(recovered.options![i].value, `${context} option[${i}].value`).toBe(original.options[i].value);
      expect(recovered.options![i].label, `${context} option[${i}].label`).toBe(original.options[i].label);
    }
  }
}

describe('round-trip: schema → HTML → schema', () => {
  it('round-trips a simple form', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'full-name', label: 'Full name' },
            { type: 'email', name: 'email', label: 'Email address' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    expect(recovered.sections.length).toBeGreaterThanOrEqual(1);
    const allFields = recovered.sections.flatMap((s) => s.fields);
    expect(allFields).toHaveLength(2);
    compareField(schema.sections[0].fields[0], allFields[0], 'full-name');
    compareField(schema.sections[0].fields[1], allFields[1], 'email');
  });

  it('round-trips fieldset sections', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Personal Information',
          fields: [
            { type: 'text', name: 'first-name', label: 'First name' },
            { type: 'text', name: 'last-name', label: 'Last name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    expect(recovered.sections[0].heading).toBe('Personal Information');
    expect(recovered.sections[0].fields).toHaveLength(2);
  });

  it('round-trips required fields with validation', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            { type: 'text', name: 'bio', label: 'Bio', maxlength: 500, minlength: 10 },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const allFields = recovered.sections.flatMap((s) => s.fields);
    expect(allFields[0].required).toBe(true);
    expect(allFields[1].maxlength).toBe(500);
    expect(allFields[1].minlength).toBe(10);
  });

  it('round-trips select options', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'radio',
              name: 'color',
              label: 'Favorite color',
              options: [
                { value: 'red', label: 'Red' },
                { value: 'blue', label: 'Blue' },
                { value: 'green', label: 'Green' },
              ],
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const field = recovered.sections.flatMap((s) => s.fields).find((f) => f.name === 'color');
    expect(field).toBeDefined();
    expect(field!.options).toHaveLength(3);
    expect(field!.options![0].value).toBe('red');
    expect(field!.options![2].label).toBe('Green');
  });

  it('round-trips conditional visibility', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'spouse-name',
              label: 'Spouse name',
              visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const field = recovered.sections.flatMap((s) => s.fields).find((f) => f.name === 'spouse-name');
    expect(field!.visibleWhen).toEqual({ field: 'married', operator: 'eq', value: 'yes' });
  });

  it('round-trips repeatable sections', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'deps',
          repeatableMin: 1,
          repeatableMax: 5,
          fields: [
            { type: 'text', name: 'dep-name', label: 'Dependent name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const section = recovered.sections[0];
    expect(section.repeatable).toBe(true);
    expect(section.repeatableKey).toBe('deps');
    expect(section.repeatableMin).toBe(1);
    expect(section.repeatableMax).toBe(5);
    expect(section.heading).toBe('Dependents');
    expect(section.fields[0].name).toBe('dep-name');
  });

  it('round-trips file upload', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'file',
              name: 'docs',
              label: 'Upload documents',
              accept: '.pdf,.doc',
              multiple: true,
              maxFiles: 5,
              maxSize: 10485760,
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const field = recovered.sections.flatMap((s) => s.fields).find((f) => f.name === 'docs');
    expect(field!.accept).toBe('.pdf,.doc');
    expect(field!.multiple).toBe(true);
    expect(field!.maxFiles).toBe(5);
    expect(field!.maxSize).toBe(10485760);
  });

  it('round-trips complex combo (fieldsets + conditionals + required)', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Applicant',
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            {
              type: 'radio',
              name: 'veteran',
              label: 'Are you a veteran?',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'text',
              name: 'service-branch',
              label: 'Service branch',
              visibleWhen: { field: 'veteran', operator: 'eq', value: 'yes' },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    expect(recovered.sections[0].heading).toBe('Applicant');
    const fields = recovered.sections[0].fields;
    expect(fields[0].required).toBe(true);
    expect(fields[2].visibleWhen).toEqual({ field: 'veteran', operator: 'eq', value: 'yes' });
  });

  it('round-trips form steps', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [
        {
          step: 0,
          heading: 'Personal',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
        {
          step: 1,
          heading: 'Contact',
          fields: [{ type: 'email', name: 'email', label: 'Email' }],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    expect(recovered.steps).toHaveLength(2);
    expect(recovered.steps![0].title).toBe('Step 1');
    expect(recovered.steps![1].title).toBe('Step 2');
    const personalSection = recovered.sections.find((s) => s.heading === 'Personal');
    expect(personalSection?.step).toBe(0);
  });

  it('round-trips compound conditions (allOf)', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'spouse-income',
              label: 'Spouse income',
              visibleWhen: {
                allOf: [
                  { field: 'married', operator: 'eq', value: 'yes' },
                  { field: 'filing', operator: 'eq', value: 'joint' },
                ],
              },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const field = recovered.sections.flatMap((s) => s.fields).find((f) => f.name === 'spouse-income');
    expect(field!.visibleWhen).toBeDefined();
    const vw = field!.visibleWhen as any;
    expect(vw.allOf).toHaveLength(2);
    expect(vw.allOf[0].field).toBe('married');
    expect(vw.allOf[1].field).toBe('filing');
  });

  it('round-trips cascading options (optionsFrom)', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'select', name: 'county', label: 'County',
              optionsFrom: {
                field: 'state',
                map: {
                  CA: [{ value: 'la', label: 'Los Angeles' }, { value: 'sf', label: 'San Francisco' }],
                  TX: [{ value: 'harris', label: 'Harris' }],
                },
              },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const field = recovered.sections.flatMap((s) => s.fields).find((f) => f.name === 'county');
    expect(field!.optionsFrom).toBeDefined();
    expect(field!.optionsFrom!.field).toBe('state');
    expect(field!.optionsFrom!.map.CA).toHaveLength(2);
    expect(field!.optionsFrom!.map.TX).toHaveLength(1);
    expect(field!.optionsFrom!.map.CA[0].value).toBe('la');
  });

  it('round-trips table layout (layout, tableColumns, field labels)', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Income Sources',
          repeatable: true,
          repeatableKey: 'income',
          layout: 'table',
          fields: [
            { type: 'text', name: 'source', label: 'Source' },
            { type: 'text', name: 'amount', label: 'Amount' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const section = recovered.sections.find((s) => s.repeatableKey === 'income');
    expect(section).toBeDefined();
    expect(section!.layout).toBe('table');
    expect(section!.heading).toBe('Income Sources');
    expect(section!.repeatable).toBe(true);
    expect(section!.fields).toHaveLength(2);
    expect(section!.fields[0].name).toBe('source');
    expect(section!.fields[0].label).toBe('Source');
    expect(section!.fields[1].name).toBe('amount');
    expect(section!.fields[1].label).toBe('Amount');
    expect(section!.tableColumns).toEqual(['source', 'amount']);
  });

  it('round-trips cascading options inside a table section', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Location',
          repeatable: true,
          repeatableKey: 'loc',
          layout: 'table',
          fields: [
            { type: 'select', name: 'state', label: 'State', options: [
              { value: 'CA', label: 'California' },
              { value: 'TX', label: 'Texas' },
            ] },
            {
              type: 'select', name: 'county', label: 'County',
              optionsFrom: {
                field: 'state',
                map: {
                  CA: [{ value: 'la', label: 'Los Angeles' }],
                  TX: [{ value: 'harris', label: 'Harris' }],
                },
              },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const recovered = formToSchema(html);
    const section = recovered.sections.find((s) => s.repeatableKey === 'loc');
    expect(section).toBeDefined();
    expect(section!.layout).toBe('table');
    // Cascading field should round-trip
    const countyField = section!.fields.find((f) => f.name === 'county');
    expect(countyField).toBeDefined();
    expect(countyField!.optionsFrom).toBeDefined();
    expect(countyField!.optionsFrom!.field).toBe('state');
    expect(countyField!.optionsFrom!.map.CA).toHaveLength(1);
    expect(countyField!.optionsFrom!.map.TX).toHaveLength(1);
  });
});
