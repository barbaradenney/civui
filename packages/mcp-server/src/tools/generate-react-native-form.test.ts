import { describe, it, expect } from 'vitest';
import { generateReactNativeForm } from './generate-react-native-form.js';
import type { FormSchema } from '../schema/index.js';

describe('generateReactNativeForm', () => {
  it('maps text field to TextInput', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'text', name: 'full-name', label: 'Full name' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<TextInput');
    expect(result.tsx).toContain('name="full-name"');
    expect(result.tsx).toContain('label="Full name"');
    expect(result.imports).toContain('TextInput');
    expect(result.fieldCount).toBe(1);
  });

  it('maps email type with type prop', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'email', name: 'email', label: 'Email' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<TextInput');
    expect(result.tsx).toContain('type="email"');
  });

  it('maps tel type with type prop', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'tel', name: 'phone', label: 'Phone' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('type="tel"');
  });

  it('maps number type with type prop', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'number', name: 'age', label: 'Age' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('type="number"');
  });

  it('maps SSN to TextInput with maxLength and placeholder', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'ssn', name: 'ssn', label: 'Social Security number' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<TextInput');
    expect(result.tsx).toContain('type="text"');
    expect(result.tsx).toContain('maxLength={11}');
    expect(result.tsx).toContain('placeholder="XXX-XX-XXXX"');
  });

  it('maps select with options', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'select',
              name: 'state',
              label: 'State',
              options: [
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
              ],
            },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<Select');
    expect(result.tsx).toContain('options={');
    expect(result.tsx).toContain('"CA"');
    expect(result.imports).toContain('Select');
  });

  it('maps combobox with options', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'combobox',
              name: 'agency',
              label: 'Agency',
              options: [{ value: 'doj', label: 'DOJ' }],
            },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<Combobox');
    expect(result.imports).toContain('Combobox');
  });

  it('maps radio group with legend and children options', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'radio',
              name: 'contact',
              label: 'Contact method',
              children: [
                { type: 'radio', name: 'email-opt', label: 'Email', value: 'email' },
                { type: 'radio', name: 'phone-opt', label: 'Phone', value: 'phone' },
              ],
            },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<RadioGroup');
    expect(result.tsx).toContain('legend="Contact method"');
    expect(result.tsx).toContain('"email"');
    expect(result.imports).toContain('RadioGroup');
  });

  it('maps checkbox as single boolean', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'checkbox', name: 'agree', label: 'I agree' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<Checkbox');
    expect(result.tsx).toContain('label="I agree"');
    expect(result.imports).toContain('Checkbox');
  });

  it('maps checkbox-group with legend', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'checkbox-group',
              name: 'interests',
              label: 'Interests',
              children: [
                { type: 'checkbox', name: 'edu', label: 'Education', value: 'edu' },
                { type: 'checkbox', name: 'health', label: 'Healthcare', value: 'health' },
              ],
            },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<CheckboxGroup');
    expect(result.tsx).toContain('legend="Interests"');
    expect(result.imports).toContain('CheckboxGroup');
  });

  it('maps toggle', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'toggle', name: 'notifications', label: 'Notifications' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<Toggle');
    expect(result.imports).toContain('Toggle');
  });

  it('maps DatePicker with min/max', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'date',
              name: 'appointment',
              label: 'Appointment',
              min: '2026-01-01',
              max: '2026-12-31',
            },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<DatePicker');
    expect(result.tsx).toContain('min="2026-01-01"');
    expect(result.tsx).toContain('max="2026-12-31"');
    expect(result.imports).toContain('DatePicker');
  });

  it('maps MemorableDate with legend', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'memorable-date', name: 'dob', label: 'Date of birth' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<MemorableDate');
    expect(result.tsx).toContain('legend="Date of birth"');
    expect(result.imports).toContain('MemorableDate');
  });

  it('maps SegmentedControl with legend and options', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            {
              type: 'segmented-control',
              name: 'view',
              label: 'View mode',
              options: [
                { value: 'list', label: 'List' },
                { value: 'grid', label: 'Grid' },
              ],
            },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<SegmentedControl');
    expect(result.tsx).toContain('legend="View mode"');
    expect(result.imports).toContain('SegmentedControl');
  });

  it('skips file field with warning', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'file', name: 'docs', label: 'Documents' },
            { type: 'text', name: 'name', label: 'Name' },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).not.toContain('FileUpload');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('file');
    expect(result.warnings[0]).toContain('docs');
    expect(result.fieldCount).toBe(1);
  });

  it('renders multiple sections with ScrollView', () => {
    const schema: FormSchema = {
      title: 'Multi Section',
      sections: [
        {
          heading: 'Personal Info',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
        {
          heading: 'Contact',
          fields: [{ type: 'email', name: 'email', label: 'Email' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('ScrollView');
    expect(result.tsx).toContain('Personal Info');
    expect(result.tsx).toContain('Contact');
    expect(result.features).toContain('scroll-view');
    expect(result.features).toContain('sections');
  });

  it('uses custom screen name', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const result = generateReactNativeForm(schema, { screenName: 'ContactScreen' });
    expect(result.tsx).toContain('export default function ContactScreen()');
  });

  it('generates validation with includeValidation', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'full-name', label: 'Full name', required: true },
            { type: 'email', name: 'email', label: 'Email', required: true },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema, { includeValidation: true });
    expect(result.tsx).toContain('validate');
    expect(result.tsx).toContain('useState');
    expect(result.tsx).toContain('Full name is required');
    expect(result.tsx).toContain('Email is required');
    expect(result.features).toContain('validation');
  });

  it('generates required fields in validation', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            { type: 'text', name: 'note', label: 'Note' },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema, { includeValidation: true });
    expect(result.tsx).toContain('Name is required');
    expect(result.tsx).not.toContain('Note is required');
  });

  it('deduplicates imports', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            { type: 'email', name: 'b', label: 'B' },
            { type: 'tel', name: 'c', label: 'C' },
          ],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    // All three map to TextInput — should only appear once in imports
    const textInputCount = result.imports.filter((i) => i === 'TextInput').length;
    expect(textInputCount).toBe(1);
    expect(result.fieldCount).toBe(3);
  });

  it('maps textarea with rows', () => {
    const schema: FormSchema = {
      title: 'Test',
      sections: [
        {
          fields: [{ type: 'textarea', name: 'notes', label: 'Notes', rows: 8 }],
        },
      ],
    };
    const result = generateReactNativeForm(schema);
    expect(result.tsx).toContain('<Textarea');
    expect(result.tsx).toContain('rows={8}');
    expect(result.imports).toContain('Textarea');
  });
});
