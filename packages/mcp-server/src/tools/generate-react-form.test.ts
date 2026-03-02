import { describe, it, expect } from 'vitest';
import { generateReactForm } from './generate-react-form.js';
import type { FormSchema } from '../schema/index.js';

describe('generateReactForm', () => {
  it('maps text field to civ-text-input', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-text-input');
    expect(result.fieldCount).toBe(1);
  });

  it('maps email type with type="email"', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'email', name: 'email', label: 'Email' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('type="email"');
  });

  it('maps tel type with type="tel"', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'tel', name: 'phone', label: 'Phone' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('type="tel"');
  });

  it('maps number type with type="number"', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'number', name: 'age', label: 'Age' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('type="number"');
  });

  it('maps SSN with type="text" and maxlength="11"', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'ssn', name: 'ssn', label: 'SSN' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('type="text"');
    expect(result.tsx).toContain('maxlength="11"');
  });

  it('maps select with option children', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'select',
          name: 'state',
          label: 'State',
          options: [{ value: 'ca', label: 'California' }, { value: 'ny', label: 'New York' }],
        }],
      }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-select');
    expect(result.tsx).toContain('<option');
    expect(result.tsx).toContain('California');
  });

  it('maps combobox with option children', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'combobox',
          name: 'city',
          label: 'City',
          options: [{ value: 'la', label: 'Los Angeles' }],
        }],
      }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-combobox');
    expect(result.tsx).toContain('<option');
  });

  it('maps radio group with civ-radio children', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'radio',
          name: 'color',
          label: 'Color',
          children: [
            { type: 'radio', name: 'red', label: 'Red', value: 'red' },
            { type: 'radio', name: 'blue', label: 'Blue', value: 'blue' },
          ],
        }],
      }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-radio-group');
    expect(result.tsx).toContain('<civ-radio');
    expect(result.tsx).toContain('value="red"');
  });

  it('maps checkbox-group with civ-checkbox children', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'checkbox-group',
          name: 'benefits',
          label: 'Benefits',
          children: [
            { type: 'checkbox', name: 'health', label: 'Health', value: 'health' },
            { type: 'checkbox', name: 'dental', label: 'Dental', value: 'dental' },
          ],
        }],
      }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-checkbox-group');
    expect(result.tsx).toContain('<civ-checkbox');
  });

  it('maps toggle to civ-toggle', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'toggle', name: 'notify', label: 'Notifications' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-toggle');
  });

  it('maps date to civ-date-picker', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'date', name: 'start', label: 'Start date' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-date-picker');
  });

  it('maps memorable-date to civ-memorable-date', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'memorable-date', name: 'dob', label: 'Date of birth' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-memorable-date');
  });

  it('maps segmented-control with civ-segment children', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        fields: [{
          type: 'segmented-control',
          name: 'view',
          label: 'View',
          options: [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }],
        }],
      }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-segmented-control');
    expect(result.tsx).toContain('<civ-segment');
  });

  it('includes file upload (not skipped like RN)', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'file', name: 'doc', label: 'Document' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<civ-file-upload');
    expect(result.fieldCount).toBe(1);
    expect(result.warnings).toHaveLength(0);
  });

  it('wraps sections with headings in fieldset', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{
        heading: 'Personal Info',
        fields: [{ type: 'text', name: 'name', label: 'Name' }],
      }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('<fieldset>');
    expect(result.tsx).toContain('Personal Info');
  });

  it('uses custom component name', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const result = generateReactForm(schema, { componentName: 'ContactForm' });
    expect(result.tsx).toContain('function ContactForm()');
  });

  it('generates useState hooks in useState mode', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const result = generateReactForm(schema, { stateManagement: 'useState' });
    expect(result.tsx).toContain('useState');
  });

  it('generates useForm in react-hook-form mode', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const result = generateReactForm(schema, { stateManagement: 'react-hook-form' });
    expect(result.tsx).toContain('useForm');
    expect(result.features).toContain('react-hook-form');
  });

  it('generates FormData interface when includeTypes is true', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name' }] }],
    };
    const result = generateReactForm(schema, { includeTypes: true });
    expect(result.tsx).toContain('interface FormData');
    expect(result.features).toContain('typescript');
  });

  it('sets required attribute on required fields', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('required');
  });

  it('sets disabled attribute on disabled fields', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', disabled: true }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('disabled');
  });

  it('passes hint props through', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [{ fields: [{ type: 'text', name: 'name', label: 'Name', hint: 'Enter your full name' }] }],
    };
    const result = generateReactForm(schema);
    expect(result.tsx).toContain('hint="Enter your full name"');
  });
});
