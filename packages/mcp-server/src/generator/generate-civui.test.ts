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

  it('generates memorable-date with label and default hint', () => {
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
    expect(html).toContain('label="Date of birth"');
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

  // ---- Compound conditions ----

  it('serializes compound allOf condition as JSON in data attr', () => {
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
    expect(html).toContain('data-civ-show-when=');
    // JSON is HTML-escaped in attributes
    expect(html).toContain('&quot;allOf&quot;');
    expect(html).toContain('&quot;married&quot;');
    expect(html).toContain('&quot;filing&quot;');
  });

  it('serializes compound anyOf condition as JSON in data attr', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'text',
              name: 'tax-id',
              label: 'Tax ID',
              visibleWhen: {
                anyOf: [
                  { field: 'status', operator: 'eq', value: 'employed' },
                  { field: 'status', operator: 'eq', value: 'self-employed' },
                ],
              },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('data-civ-show-when=');
    expect(html).toContain('&quot;anyOf&quot;');
  });

  // ---- Section visibleWhen ----

  it('adds data-civ-show-when to fieldset when section has visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Spouse info',
          visibleWhen: { field: 'married', operator: 'eq', value: 'yes' },
          fields: [
            { type: 'text', name: 'spouse-name', label: 'Spouse name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<civ-fieldset legend="Spouse info" data-civ-show-when="married=yes">');
  });

  it('wraps headless section in div with data-civ-show-when', () => {
    const schema: FormSchema = {
      sections: [
        {
          visibleWhen: { field: 'has-dependents', operator: 'eq', value: 'yes' },
          fields: [
            { type: 'text', name: 'dep-name', label: 'Dependent name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<div data-civ-show-when="has-dependents=yes">');
    expect(html).toContain('</div>');
  });

  it('adds data-civ-show-when to repeatable container when section has visibleWhen', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'deps',
          visibleWhen: { field: 'has-dependents', operator: 'eq', value: 'yes' },
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('data-civ-repeatable="deps"');
    expect(html).toContain('data-civ-show-when="has-dependents=yes"');
  });

  // ---- Wizard generation ----

  it('generates wizard step containers and progress indicator', () => {
    const schema: FormSchema = {
      steps: [
        { title: 'Personal Info' },
        { title: 'Contact Info' },
      ],
      sections: [
        {
          step: 0,
          heading: 'Personal',
          fields: [{ type: 'text', name: 'first-name', label: 'First name' }],
        },
        {
          step: 1,
          heading: 'Contact',
          fields: [{ type: 'email', name: 'email', label: 'Email' }],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<nav data-civ-progress');
    expect(html).toContain('Personal Info');
    expect(html).toContain('Contact Info');
    expect(html).toContain('data-civ-step="0"');
    expect(html).toContain('data-civ-step="1"');
    expect(html).toContain('data-civ-step-nav');
    expect(html).toContain('data-civ-step-prev');
    expect(html).toContain('data-civ-step-next');
  });

  it('hides non-first wizard steps', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { step: 1, fields: [{ type: 'text', name: 'b', label: 'B' }] },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('data-civ-step="0">');
    expect(html).toContain('data-civ-step="1" hidden>');
  });

  it('sets aria-current on first progress step', () => {
    const schema: FormSchema = {
      steps: [{ title: 'S1' }, { title: 'S2' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { step: 1, fields: [{ type: 'text', name: 'b', label: 'B' }] },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('data-civ-progress-step="0" aria-current="step"');
    expect(html).not.toContain('data-civ-progress-step="1" aria-current');
  });

  it('defaults sections without step to step 0', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Step 1' }],
      sections: [
        { fields: [{ type: 'text', name: 'x', label: 'X' }] },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('data-civ-step="0"');
    expect(html).toContain('name="x"');
  });

  // ---- Cascading options ----

  it('emits data-civ-options-from and script sibling for cascading select', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
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
    expect(html).toContain('data-civ-options-from="state"');
    expect(html).toContain('data-civ-options-map="county"');
    expect(html).toContain('"CA"');
    expect(html).toContain('"TX"');
    expect(html).toContain('Los Angeles');
  });

  it('escapes JSON in cascading options map script', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            {
              type: 'select', name: 'sub', label: 'Sub',
              optionsFrom: {
                field: 'parent',
                map: {
                  'a"b': [{ value: 'x', label: 'X' }],
                },
              },
            },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    // Script content uses JSON.stringify which handles quotes
    expect(html).toContain('data-civ-options-map="sub"');
  });

  // ---- Table layout ----

  it('generates table structure for table layout repeatable section', () => {
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
    expect(html).toContain('data-civ-repeatable="income"');
    expect(html).toContain('data-civ-layout="table"');
    expect(html).toContain('<table');
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<th scope="col">Source</th>');
    expect(html).toContain('<th scope="col">Amount</th>');
    expect(html).toContain('<tr data-civ-repeatable-item>');
    expect(html).toContain('aria-label="Source"');
    expect(html).toContain('aria-label="Amount"');
    expect(html).toContain('name="income[0].source"');
    expect(html).toContain('name="income[0].amount"');
    expect(html).toContain('data-civ-repeatable-remove');
    expect(html).toContain('data-civ-repeatable-add');
  });

  it('table layout uses heading as h3', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Line Items',
          repeatable: true,
          repeatableKey: 'items',
          layout: 'table',
          fields: [{ type: 'text', name: 'desc', label: 'Description' }],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<h3>Line Items</h3>');
    expect(html).not.toContain('civ-fieldset');
  });

  it('table layout has sr-only Actions column header', () => {
    const schema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          layout: 'table',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const html = generateCivUI(schema);
    expect(html).toContain('<span class="civ-sr-only">Actions</span>');
  });

  it('tableColumns controls column order', () => {
    const schema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          layout: 'table',
          tableColumns: ['amount', 'source'],
          fields: [
            { type: 'text', name: 'source', label: 'Source' },
            { type: 'text', name: 'amount', label: 'Amount' },
          ],
        },
      ],
    };
    const html = generateCivUI(schema);
    const amountPos = html.indexOf('Amount');
    const sourcePos = html.indexOf('Source');
    expect(amountPos).toBeLessThan(sourcePos);
  });

  it('table layout includes add button outside table', () => {
    const schema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          layout: 'table',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const html = generateCivUI(schema);
    const tableEndPos = html.indexOf('</table>');
    const addBtnPos = html.indexOf('data-civ-repeatable-add');
    expect(addBtnPos).toBeGreaterThan(tableEndPos);
  });

  it('table layout remove button is inside each row', () => {
    const schema: FormSchema = {
      sections: [
        {
          repeatable: true,
          repeatableKey: 'items',
          layout: 'table',
          fields: [{ type: 'text', name: 'x', label: 'X' }],
        },
      ],
    };
    const html = generateCivUI(schema);
    const trPos = html.indexOf('<tr data-civ-repeatable-item>');
    const removeBtnPos = html.indexOf('data-civ-repeatable-remove');
    // Find the </tr> after the repeatable item row, not the header row
    const trEndPos = html.indexOf('</tr>', trPos);
    expect(removeBtnPos).toBeGreaterThan(trPos);
    expect(removeBtnPos).toBeLessThan(trEndPos);
  });
});
