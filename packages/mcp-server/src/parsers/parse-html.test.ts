import { describe, it, expect } from 'vitest';
import { parseHTML } from './parse-html.js';

describe('parseHTML', () => {
  it('parses a simple text input with label', () => {
    const html = `
      <form>
        <label for="name">Full name</label>
        <input type="text" id="name" name="name" required />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections).toHaveLength(1);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('text');
    expect(field.name).toBe('name');
    expect(field.label).toBe('Full name');
    expect(field.required).toBe(true);
  });

  it('parses email input type', () => {
    const html = `
      <form>
        <label for="email">Email</label>
        <input type="email" id="email" name="email" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].type).toBe('email');
  });

  it('infers field type from name (ssn)', () => {
    const html = `
      <form>
        <label for="ssn">Social Security number</label>
        <input type="text" id="ssn" name="ssn" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].type).toBe('ssn');
  });

  it('infers memorable-date from name containing "dob"', () => {
    const html = `
      <form>
        <label for="dob">Date of birth</label>
        <input type="text" id="dob" name="dob" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].type).toBe('memorable-date');
  });

  it('infers zip from name containing "zip"', () => {
    const html = `
      <form>
        <label for="zip">ZIP code</label>
        <input type="text" id="zip" name="zip" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].type).toBe('zip');
  });

  it('parses a textarea', () => {
    const html = `
      <form>
        <label for="desc">Description</label>
        <textarea id="desc" name="desc" rows="5" maxlength="500"></textarea>
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('textarea');
    expect(field.rows).toBe(5);
    expect(field.maxlength).toBe(500);
  });

  it('parses a select with options', () => {
    const html = `
      <form>
        <label for="state">State</label>
        <select id="state" name="state" required>
          <option value="">Select...</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </select>
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('select');
    expect(field.required).toBe(true);
    expect(field.options).toHaveLength(2); // empty value option excluded
    expect(field.options![0]).toEqual({ value: 'CA', label: 'California' });
    expect(field.options![1]).toEqual({ value: 'NY', label: 'New York' });
  });

  it('groups radio buttons by name', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Contact method</legend>
          <label><input type="radio" name="contact" value="email" /> Email</label>
          <label><input type="radio" name="contact" value="phone" /> Phone</label>
        </fieldset>
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('radio');
    expect(field.label).toBe('Contact method');
    expect(field.options).toHaveLength(2);
    expect(field.options![0].value).toBe('email');
    expect(field.options![1].value).toBe('phone');
  });

  it('groups checkboxes by shared name', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Interests</legend>
          <label><input type="checkbox" name="interests" value="edu" /> Education</label>
          <label><input type="checkbox" name="interests" value="health" /> Healthcare</label>
        </fieldset>
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('checkbox-group');
    expect(field.options).toHaveLength(2);
  });

  it('parses standalone checkbox', () => {
    const html = `
      <form>
        <label><input type="checkbox" name="terms" required /> I agree to terms</label>
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('checkbox');
    expect(field.required).toBe(true);
  });

  it('parses fieldsets as sections with headings', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Personal Info</legend>
          <label for="n">Name</label>
          <input id="n" name="name" />
        </fieldset>
        <fieldset>
          <legend>Address</legend>
          <label for="city">City</label>
          <input id="city" name="city" />
        </fieldset>
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections).toHaveLength(2);
    expect(schema.sections[0].heading).toBe('Personal Info');
    expect(schema.sections[1].heading).toBe('Address');
  });

  it('extracts form action and method', () => {
    const html = `<form action="/submit" method="post"><input name="x" /></form>`;
    const schema = parseHTML(html);
    expect(schema.action).toBe('/submit');
    expect(schema.method).toBe('POST');
  });

  it('skips hidden and submit inputs', () => {
    const html = `
      <form>
        <input type="hidden" name="csrf" value="abc" />
        <input type="submit" value="Submit" />
        <label for="x">Name</label>
        <input id="x" name="name" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields).toHaveLength(1);
    expect(schema.sections[0].fields[0].name).toBe('name');
  });

  it('resolves label from parent label element', () => {
    const html = `
      <form>
        <label>Your name <input name="name" /></label>
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].label).toBe('Your name');
  });

  it('falls back to aria-label', () => {
    const html = `
      <form>
        <input name="search" aria-label="Search" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].label).toBe('Search');
  });

  it('parses file input with accept and multiple', () => {
    const html = `
      <form>
        <label for="docs">Documents</label>
        <input type="file" id="docs" name="docs" accept=".pdf" multiple />
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.type).toBe('file');
    expect(field.accept).toBe('.pdf');
    expect(field.multiple).toBe(true);
  });

  it('extracts page title from h1', () => {
    const html = `
      <h1>Benefits Application</h1>
      <form>
        <label for="n">Name</label>
        <input id="n" name="name" />
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.title).toBe('Benefits Application');
  });

  it('extracts maxlength and pattern from text input', () => {
    const html = `
      <form>
        <label for="code">Code</label>
        <input id="code" name="code" maxlength="10" pattern="[A-Z]{3}" />
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.maxlength).toBe(10);
    expect(field.pattern).toBe('[A-Z]{3}');
  });

  // --- Edge cases ---

  it('handles empty HTML string', () => {
    const schema = parseHTML('');
    expect(schema.sections).toHaveLength(0);
  });

  it('handles HTML with no form element (bare inputs)', () => {
    const html = `
      <label for="x">Name</label>
      <input id="x" name="name" />
    `;
    const schema = parseHTML(html);
    expect(schema.sections).toHaveLength(1);
    expect(schema.sections[0].fields[0].name).toBe('name');
  });

  it('assigns deterministic names to unnamed inputs', () => {
    const html = `
      <form>
        <label>A <input /></label>
        <label>B <input /></label>
      </form>
    `;
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].name).toBe('field_1');
    expect(schema.sections[0].fields[1].name).toBe('field_2');
  });

  it('handles names with special CSS characters safely', () => {
    const html = `
      <form>
        <label><input type="checkbox" name="opts[]" value="a" /> A</label>
        <label><input type="checkbox" name="opts[]" value="b" /> B</label>
      </form>
    `;
    // Should not throw — the CSS selector for name="opts[]" is escaped
    const schema = parseHTML(html);
    expect(schema.sections[0].fields[0].type).toBe('checkbox-group');
  });

  it('handles nested fieldsets without duplicating fields', () => {
    const html = `
      <form>
        <fieldset>
          <legend>Outer</legend>
          <label for="a">A</label>
          <input id="a" name="a" />
          <fieldset>
            <legend>Inner</legend>
            <label for="b">B</label>
            <input id="b" name="b" />
          </fieldset>
        </fieldset>
      </form>
    `;
    const schema = parseHTML(html);
    // Fields should not be duplicated across sections
    const allFieldNames = schema.sections.flatMap((s) => s.fields.map((f) => f.name));
    expect(allFieldNames).toContain('a');
    expect(allFieldNames).toContain('b');
    // Each field appears exactly once
    expect(allFieldNames.filter((n) => n === 'a')).toHaveLength(1);
    expect(allFieldNames.filter((n) => n === 'b')).toHaveLength(1);
  });

  it('handles select with optgroup', () => {
    const html = `
      <form>
        <label for="state">State</label>
        <select id="state" name="state">
          <optgroup label="West">
            <option value="CA">California</option>
            <option value="WA">Washington</option>
          </optgroup>
          <optgroup label="East">
            <option value="NY">New York</option>
          </optgroup>
        </select>
      </form>
    `;
    const schema = parseHTML(html);
    const field = schema.sections[0].fields[0];
    expect(field.options).toHaveLength(3);
  });

  it('handles label for attribute pointing to non-existent id', () => {
    const html = `
      <form>
        <label for="nonexistent">Ghost</label>
        <input name="orphan" />
      </form>
    `;
    const schema = parseHTML(html);
    // Should fall back to name as label
    expect(schema.sections[0].fields[0].label).toBe('orphan');
  });
});
