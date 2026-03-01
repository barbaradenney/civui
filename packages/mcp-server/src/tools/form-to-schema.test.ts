import { describe, it, expect } from 'vitest';
import { formToSchema } from './form-to-schema.js';

describe('formToSchema', () => {
  it('extracts a simple text input', () => {
    const html = '<civ-text-input label="Full name" name="full-name"></civ-text-input>';
    const schema = formToSchema(html);
    expect(schema.sections).toHaveLength(1);
    expect(schema.sections[0].fields[0].label).toBe('Full name');
    expect(schema.sections[0].fields[0].name).toBe('full-name');
    expect(schema.sections[0].fields[0].type).toBe('text');
  });

  it('extracts form-level attributes from civ-form', () => {
    const html = '<civ-form action="/submit" method="POST"><civ-text-input label="Name" name="name"></civ-text-input></civ-form>';
    const schema = formToSchema(html);
    expect(schema.action).toBe('/submit');
    expect(schema.method).toBe('POST');
  });

  it('extracts title from first heading', () => {
    const html = '<h2>Contact Us</h2><civ-text-input label="Name" name="name"></civ-text-input>';
    const schema = formToSchema(html);
    expect(schema.title).toBe('Contact Us');
  });

  it('organizes fieldsets as sections with headings', () => {
    const html = `
      <civ-fieldset legend="Personal Info">
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-fieldset>
      <civ-fieldset legend="Contact">
        <civ-text-input label="Email" name="email"></civ-text-input>
      </civ-fieldset>
    `;
    const schema = formToSchema(html);
    expect(schema.sections).toHaveLength(2);
    expect(schema.sections[0].heading).toBe('Personal Info');
    expect(schema.sections[1].heading).toBe('Contact');
  });

  it('extracts radio group with child options', () => {
    const html = `
      <civ-radio-group legend="Preference" name="pref">
        <civ-radio label="Option A" value="a"></civ-radio>
        <civ-radio label="Option B" value="b"></civ-radio>
      </civ-radio-group>
    `;
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('radio');
    expect(field.options).toHaveLength(2);
    expect(field.options![0]).toEqual({ value: 'a', label: 'Option A' });
  });

  it('extracts boolean and numeric attributes', () => {
    const html = '<civ-text-input label="Bio" name="bio" required maxlength="500" minlength="10"></civ-text-input>';
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.required).toBe(true);
    expect(field.maxlength).toBe(500);
    expect(field.minlength).toBe(10);
  });

  it('extracts hint and placeholder', () => {
    const html = '<civ-text-input label="SSN" name="ssn" hint="For example: 123 45 6789" placeholder="000 00 0000"></civ-text-input>';
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.hint).toBe('For example: 123 45 6789');
    expect(field.placeholder).toBe('000 00 0000');
  });

  it('extracts select with option elements', () => {
    const html = `
      <civ-select label="State" name="state">
        <option value="CA">California</option>
        <option value="NY">New York</option>
      </civ-select>
    `;
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('select');
    expect(field.options).toHaveLength(2);
    expect(field.options![0]).toEqual({ value: 'CA', label: 'California' });
  });

  it('extracts file upload attributes', () => {
    const html = '<civ-file-upload label="Documents" name="docs" accept=".pdf" multiple max-files="5" max-size="10485760"></civ-file-upload>';
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('file');
    expect(field.accept).toBe('.pdf');
    expect(field.multiple).toBe(true);
    expect(field.maxFiles).toBe(5);
    expect(field.maxSize).toBe(10485760);
  });

  it('maps memorable-date correctly', () => {
    const html = '<civ-memorable-date legend="Date of birth" name="dob" hint="For example: January 15 1990"></civ-memorable-date>';
    const schema = formToSchema(html);
    expect(schema.sections[0].fields[0].type).toBe('memorable-date');
  });

  it('maps date-picker correctly', () => {
    const html = '<civ-date-picker label="Appointment" name="appt" hint="mm/dd/yyyy"></civ-date-picker>';
    const schema = formToSchema(html);
    expect(schema.sections[0].fields[0].type).toBe('date');
  });

  it('maps toggle correctly', () => {
    const html = '<civ-toggle label="Notifications" name="notify" value="true"></civ-toggle>';
    const schema = formToSchema(html);
    expect(schema.sections[0].fields[0].type).toBe('toggle');
  });

  it('returns empty sections for empty HTML', () => {
    const schema = formToSchema('');
    expect(schema.sections).toHaveLength(0);
  });

  it('parses repeatable section with data-civ-repeatable attributes', () => {
    const html = `
      <div data-civ-repeatable="dependents" data-civ-repeatable-min="1" data-civ-repeatable-max="5" aria-live="polite">
        <civ-fieldset legend="Dependent">
          <civ-text-input label="Name" name="dependents[0].name"></civ-text-input>
          <civ-text-input label="Relationship" name="dependents[0].relationship"></civ-text-input>
          <button type="button" data-civ-repeatable-remove>Remove</button>
        </civ-fieldset>
        <button type="button" data-civ-repeatable-add>Add another</button>
      </div>
    `;
    const schema = formToSchema(html);
    expect(schema.sections).toHaveLength(1);
    const section = schema.sections[0];
    expect(section.repeatable).toBe(true);
    expect(section.repeatableKey).toBe('dependents');
    expect(section.repeatableMin).toBe(1);
    expect(section.repeatableMax).toBe(5);
    // Field names should have array prefix stripped
    expect(section.fields[0].name).toBe('name');
    expect(section.fields[1].name).toBe('relationship');
  });

  it('parses conditional visibility attributes', () => {
    const html = `
      <civ-radio-group legend="Married?" name="married">
        <civ-radio label="Yes" value="yes"></civ-radio>
        <civ-radio label="No" value="no"></civ-radio>
      </civ-radio-group>
      <civ-text-input label="Spouse name" name="spouse-name" data-civ-show-when="married=yes"></civ-text-input>
      <civ-text-input label="Service dates" name="service-dates" data-civ-require-when="is-veteran=yes"></civ-text-input>
    `;
    const schema = formToSchema(html);
    const spouseField = schema.sections[0].fields.find((f) => f.name === 'spouse-name');
    expect(spouseField?.visibleWhen).toEqual({ field: 'married', operator: 'eq', value: 'yes' });

    const serviceField = schema.sections[0].fields.find((f) => f.name === 'service-dates');
    expect(serviceField?.requiredWhen).toEqual({ field: 'is-veteran', operator: 'eq', value: 'yes' });
  });

  it('handles mixed fieldset and non-fieldset components', () => {
    const html = `
      <civ-fieldset legend="Section A">
        <civ-text-input label="In section" name="in-section"></civ-text-input>
      </civ-fieldset>
      <civ-text-input label="Outside" name="outside"></civ-text-input>
    `;
    const schema = formToSchema(html);
    expect(schema.sections).toHaveLength(2);
    expect(schema.sections[0].heading).toBe('Section A');
    expect(schema.sections[1].heading).toBeUndefined();
  });

  // ---- Compound JSON conditions ----

  it('parses compound JSON condition from data-civ-show-when attribute', () => {
    const cond = JSON.stringify({
      allOf: [
        { field: 'married', operator: 'eq', value: 'yes' },
        { field: 'filing', operator: 'eq', value: 'joint' },
      ],
    });
    const html = `<civ-text-input label="Spouse income" name="spouse-income" data-civ-show-when='${cond}'></civ-text-input>`;
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.visibleWhen).toHaveProperty('allOf');
    const vw = field.visibleWhen as any;
    expect(vw.allOf).toHaveLength(2);
    expect(vw.allOf[0].field).toBe('married');
    expect(vw.allOf[1].field).toBe('filing');
  });

  it('parses compound anyOf condition from data attr', () => {
    const cond = JSON.stringify({
      anyOf: [
        { field: 'status', operator: 'eq', value: 'employed' },
        { field: 'status', operator: 'eq', value: 'self-employed' },
      ],
    });
    const html = `<civ-text-input label="Tax ID" name="tax-id" data-civ-show-when='${cond}'></civ-text-input>`;
    const schema = formToSchema(html);
    const field = schema.sections[0].fields[0];
    expect(field.visibleWhen).toHaveProperty('anyOf');
  });

  // ---- Section visibleWhen ----

  it('extracts section visibleWhen from fieldset data-civ-show-when', () => {
    const html = `
      <civ-fieldset legend="Spouse" data-civ-show-when="married=yes">
        <civ-text-input label="Spouse name" name="spouse-name"></civ-text-input>
      </civ-fieldset>
    `;
    const schema = formToSchema(html);
    expect(schema.sections[0].visibleWhen).toEqual({
      field: 'married', operator: 'eq', value: 'yes',
    });
  });

  it('extracts section visibleWhen from div wrapper', () => {
    const html = `
      <div data-civ-show-when="has-deps=yes">
        <civ-text-input label="Dep name" name="dep-name"></civ-text-input>
      </div>
    `;
    const schema = formToSchema(html);
    const section = schema.sections.find((s) => s.visibleWhen);
    expect(section).toBeDefined();
    expect(section!.visibleWhen).toEqual({
      field: 'has-deps', operator: 'eq', value: 'yes',
    });
  });

  // ---- Wizard step detection ----

  it('detects wizard steps from data-civ-step containers', () => {
    const html = `
      <civ-form>
        <nav data-civ-progress aria-label="Progress">
          <ol>
            <li data-civ-progress-step="0">Personal</li>
            <li data-civ-progress-step="1">Contact</li>
          </ol>
        </nav>
        <div data-civ-step="0">
          <civ-text-input label="Name" name="name"></civ-text-input>
        </div>
        <div data-civ-step="1">
          <civ-text-input label="Email" name="email"></civ-text-input>
        </div>
      </civ-form>
    `;
    const schema = formToSchema(html);
    expect(schema.steps).toHaveLength(2);
    expect(schema.steps![0].title).toBe('Personal');
    expect(schema.steps![1].title).toBe('Contact');
  });

  it('assigns step number to sections from parent data-civ-step', () => {
    const html = `
      <civ-form>
        <nav data-civ-progress><ol><li data-civ-progress-step="0">S1</li><li data-civ-progress-step="1">S2</li></ol></nav>
        <div data-civ-step="0">
          <civ-fieldset legend="Info">
            <civ-text-input label="Name" name="name"></civ-text-input>
          </civ-fieldset>
        </div>
        <div data-civ-step="1">
          <civ-text-input label="Email" name="email"></civ-text-input>
        </div>
      </civ-form>
    `;
    const schema = formToSchema(html);
    const infoSection = schema.sections.find((s) => s.heading === 'Info');
    expect(infoSection?.step).toBe(0);
  });

  // ---- Cascading options ----

  it('parses data-civ-options-from and script map', () => {
    const html = `
      <civ-select label="State" name="state" options='[{"value":"CA","label":"CA"}]'></civ-select>
      <civ-select label="County" name="county" data-civ-options-from="state"></civ-select>
      <script type="application/json" data-civ-options-map="county">{"CA":[{"value":"la","label":"Los Angeles"}]}</script>
    `;
    const schema = formToSchema(html);
    const county = schema.sections[0].fields.find((f) => f.name === 'county');
    expect(county?.optionsFrom).toBeDefined();
    expect(county?.optionsFrom?.field).toBe('state');
    expect(county?.optionsFrom?.map.CA).toEqual([{ value: 'la', label: 'Los Angeles' }]);
  });

  it('handles missing script gracefully for cascading options', () => {
    const html = `
      <civ-select label="County" name="county" data-civ-options-from="state"></civ-select>
    `;
    const schema = formToSchema(html);
    const county = schema.sections[0].fields.find((f) => f.name === 'county');
    expect(county?.optionsFrom).toBeDefined();
    expect(county?.optionsFrom?.field).toBe('state');
    expect(county?.optionsFrom?.map).toEqual({});
  });

  // ---- Table layout ----

  it('detects table layout from data-civ-layout="table"', () => {
    const html = `
      <div data-civ-repeatable="income" data-civ-layout="table" aria-live="polite">
        <h3>Income Sources</h3>
        <table class="civ-w-full civ-border-collapse">
          <thead><tr><th scope="col">Source</th><th scope="col">Amount</th><th scope="col"><span class="civ-sr-only">Actions</span></th></tr></thead>
          <tbody>
            <tr data-civ-repeatable-item>
              <td><civ-text-input aria-label="Source" name="income[0].source"></civ-text-input></td>
              <td><civ-text-input aria-label="Amount" name="income[0].amount"></civ-text-input></td>
              <td><button type="button" data-civ-repeatable-remove>Remove row</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" data-civ-repeatable-add>Add row</button>
      </div>
    `;
    const schema = formToSchema(html);
    const section = schema.sections.find((s) => s.repeatableKey === 'income');
    expect(section).toBeDefined();
    expect(section!.layout).toBe('table');
    expect(section!.heading).toBe('Income Sources');
    expect(section!.repeatable).toBe(true);
  });

  it('extracts tableColumns from table layout', () => {
    const html = `
      <div data-civ-repeatable="items" data-civ-layout="table" aria-live="polite">
        <table>
          <thead><tr><th scope="col">Name</th><th scope="col">Price</th><th scope="col"><span class="civ-sr-only">Actions</span></th></tr></thead>
          <tbody>
            <tr data-civ-repeatable-item>
              <td><civ-text-input aria-label="Name" name="items[0].name"></civ-text-input></td>
              <td><civ-text-input aria-label="Price" name="items[0].price"></civ-text-input></td>
              <td><button type="button" data-civ-repeatable-remove>Remove</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" data-civ-repeatable-add>Add</button>
      </div>
    `;
    const schema = formToSchema(html);
    const section = schema.sections.find((s) => s.repeatableKey === 'items');
    expect(section?.tableColumns).toEqual(['name', 'price']);
  });

  it('extracts field labels from aria-label in table layout', () => {
    const html = `
      <div data-civ-repeatable="items" data-civ-layout="table" aria-live="polite">
        <table>
          <thead><tr><th scope="col">Source</th><th scope="col"><span class="civ-sr-only">Actions</span></th></tr></thead>
          <tbody>
            <tr data-civ-repeatable-item>
              <td><civ-text-input aria-label="Source" name="items[0].source"></civ-text-input></td>
              <td><button type="button" data-civ-repeatable-remove>Remove</button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" data-civ-repeatable-add>Add</button>
      </div>
    `;
    const schema = formToSchema(html);
    const section = schema.sections.find((s) => s.repeatableKey === 'items');
    expect(section?.fields[0].label).toBe('Source');
    expect(section?.fields[0].name).toBe('source');
  });
});
