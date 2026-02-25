import { describe, it, expect } from 'vitest';
import { generateCivUI } from './generate-civui.js';
import type { FormSchema } from '../schema/index.js';

describe('generateCivUI', () => {
  it('generates a simple text input', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'fullName', label: 'Full name', required: true },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-form>');
    expect(html).toContain('</civ-form>');
    expect(html).toContain('<civ-text-input');
    expect(html).toContain('label="Full name"');
    expect(html).toContain('name="fullName"');
    expect(html).toContain('required');
    expect(html).toContain('required-message="Full name is required"');
  });

  it('generates email type with type attribute', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'email', name: 'email', label: 'Email address' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('type="email"');
    expect(html).toContain('<civ-text-input');
  });

  it('generates ssn field with default hint', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'ssn', name: 'ssn', label: 'Social Security number', required: true },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('hint="For example: 123 45 6789"');
  });

  it('generates memorable-date with legend and default hint', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'memorable-date', name: 'dob', label: 'Date of birth' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-memorable-date');
    expect(html).toContain('legend="Date of birth"');
    expect(html).toContain('hint="For example: January 15 1990"');
  });

  it('generates radio group with children', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'radio',
              name: 'contact',
              label: 'Preferred contact method',
              required: true,
              options: [
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'mail', label: 'Mail' },
              ],
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-radio-group');
    expect(html).toContain('legend="Preferred contact method"');
    expect(html).toContain('<civ-radio label="Email" value="email"></civ-radio>');
    expect(html).toContain('<civ-radio label="Phone" value="phone"></civ-radio>');
    expect(html).toContain('</civ-radio-group>');
  });

  it('generates checkbox-group with options', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'checkbox-group',
              name: 'interests',
              label: 'Select all that apply',
              options: [
                { value: 'edu', label: 'Education' },
                { value: 'health', label: 'Healthcare' },
              ],
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-checkbox-group');
    expect(html).toContain('legend="Select all that apply"');
    expect(html).toContain('<civ-checkbox label="Education" value="edu"></civ-checkbox>');
    expect(html).toContain('</civ-checkbox-group>');
  });

  it('generates select component', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'select', name: 'state', label: 'State' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-select');
    expect(html).toContain('label="State"');
  });

  it('generates textarea with rows and maxlength', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'textarea',
              name: 'desc',
              label: 'Description',
              rows: 8,
              maxlength: 2000,
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-textarea');
    expect(html).toContain('rows="8"');
    expect(html).toContain('maxlength="2000"');
  });

  it('generates file upload with accept and multiple', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'file',
              name: 'documents',
              label: 'Upload documents',
              accept: '.pdf,.jpg',
              multiple: true,
              maxFiles: 5,
              maxSize: 10485760,
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-file-upload');
    expect(html).toContain('accept=".pdf,.jpg"');
    expect(html).toContain('multiple');
    expect(html).toContain('max-files="5"');
    expect(html).toContain('max-size="10485760"');
  });

  it('generates date-picker (not deprecated date-input)', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'date', name: 'appointmentDate', label: 'Appointment date' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-date-picker');
    expect(html).not.toContain('civ-date-input');
  });

  it('wraps sections with headings in civ-fieldset', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Personal Information',
          fields: [
            { type: 'text', name: 'name', label: 'Full name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-fieldset legend="Personal Information">');
    expect(html).toContain('</civ-fieldset>');
  });

  it('does not wrap sections without headings', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Full name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).not.toContain('civ-fieldset');
  });

  it('respects wrapInCivForm: false', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Full name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema, { wrapInCivForm: false });
    expect(html).not.toContain('civ-form');
    expect(html).toContain('<civ-text-input');
  });

  it('includes form action and method', () => {
    const schema: FormSchema = {
      action: '/submit',
      method: 'POST',
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Full name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('action="/submit"');
    expect(html).toContain('method="POST"');
  });

  it('escapes HTML in attribute values', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'x', label: 'Value with "quotes" & <tags>' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('label="Value with &quot;quotes&quot; &amp; &lt;tags&gt;"');
  });

  it('generates toggle component', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'toggle', name: 'notifications', label: 'Email notifications' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-toggle');
    expect(html).toContain('label="Email notifications"');
  });

  it('uses explicit hint over default hint', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'memorable-date',
              name: 'dob',
              label: 'Date of birth',
              hint: 'Enter the date on your birth certificate',
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('hint="Enter the date on your birth certificate"');
    expect(html).not.toContain('For example: January 15 1990');
  });

  it('generates radio group with children field array', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'radio',
              name: 'choice',
              label: 'Pick one',
              children: [
                { type: 'radio', name: 'a', label: 'Option A', value: 'a' },
                { type: 'radio', name: 'b', label: 'Option B', value: 'b' },
              ],
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-radio-group');
    expect(html).toContain('<civ-radio label="Option A" value="a"></civ-radio>');
    expect(html).toContain('<civ-radio label="Option B" value="b"></civ-radio>');
  });

  it('generates a complete multi-section form', () => {
    const schema: FormSchema = {
      title: 'Benefits Application',
      action: '/apply',
      method: 'POST',
      sections: [
        {
          heading: 'Personal Information',
          fields: [
            { type: 'text', name: 'fullName', label: 'Full name', required: true },
            { type: 'email', name: 'email', label: 'Email address', required: true, autocomplete: 'email' },
            { type: 'memorable-date', name: 'dob', label: 'Date of birth', required: true },
          ],
        },
        {
          heading: 'Preferences',
          fields: [
            {
              type: 'radio',
              name: 'contact',
              label: 'Preferred contact method',
              options: [
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
              ],
            },
            { type: 'toggle', name: 'notifications', label: 'Receive notifications' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-form action="/apply" method="POST">');
    expect(html).toContain('<civ-fieldset legend="Personal Information">');
    expect(html).toContain('<civ-fieldset legend="Preferences">');
    expect(html).toContain('</civ-form>');
  });

  // --- Edge cases ---

  it('handles radio group with no children and no options gracefully', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'radio', name: 'empty', label: 'Empty group' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    // Falls through to non-group branch — renders as a self-closing tag
    expect(html).toContain('<civ-radio-group');
    expect(html).toContain('legend="Empty group"');
  });

  it('handles empty sections array', () => {
    const schema: FormSchema = { sections: [] };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-form>');
    expect(html).toContain('</civ-form>');
  });

  it('auto-adds autocomplete="email" for email fields', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'email', name: 'email', label: 'Email' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('autocomplete="email"');
  });

  it('explicit autocomplete overrides default', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'email', name: 'email', label: 'Email', autocomplete: 'work email' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('autocomplete="work email"');
    expect(html).not.toMatch(/autocomplete="email"/);
  });

  it('auto-adds inputmode="numeric" for SSN fields', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'ssn', name: 'ssn', label: 'SSN' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('inputmode="numeric"');
  });

  it('auto-adds autocomplete="postal-code" and inputmode="numeric" for zip', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'zip', name: 'zip', label: 'ZIP code' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('autocomplete="postal-code"');
    expect(html).toContain('inputmode="numeric"');
  });

  it('auto-adds autocomplete="tel" and inputmode="tel" for tel fields', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'tel', name: 'phone', label: 'Phone' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('autocomplete="tel"');
    expect(html).toContain('inputmode="tel"');
  });

  it('escapes single quotes in attribute values', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'x', label: "It's a label" },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain("label=\"It&#39;s a label\"");
  });
});
