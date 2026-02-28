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
});
