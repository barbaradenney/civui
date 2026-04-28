import { describe, it, expect } from 'vitest';
import { getComponentMapping, getAllMappings } from './component-map.js';

describe('component-map', () => {
  it('maps text to civ-text-input with label prop', () => {
    const mapping = getComponentMapping('text');
    expect(mapping.tag).toBe('civ-text-input');
    expect(mapping.labelProp).toBe('label');
    expect(mapping.isGroup).toBe(false);
  });

  it('maps email to civ-text-input with type="email"', () => {
    const mapping = getComponentMapping('email');
    expect(mapping.tag).toBe('civ-text-input');
    expect(mapping.inputType).toBe('email');
  });

  it('maps ssn to civ-text-input with default hint', () => {
    const mapping = getComponentMapping('ssn');
    expect(mapping.tag).toBe('civ-text-input');
    expect(mapping.defaultHint).toBe('For example: 123 45 6789');
  });

  it('maps zip to civ-text-input with default hint', () => {
    const mapping = getComponentMapping('zip');
    expect(mapping.defaultHint).toBe('For example: 12345 or 12345-6789');
  });

  it('maps textarea to civ-textarea', () => {
    const mapping = getComponentMapping('textarea');
    expect(mapping.tag).toBe('civ-textarea');
    expect(mapping.labelProp).toBe('label');
  });

  it('maps select to civ-select', () => {
    const mapping = getComponentMapping('select');
    expect(mapping.tag).toBe('civ-select');
  });

  it('maps combobox to civ-combobox', () => {
    const mapping = getComponentMapping('combobox');
    expect(mapping.tag).toBe('civ-combobox');
  });

  it('maps radio to civ-radio-group with legend and children', () => {
    const mapping = getComponentMapping('radio');
    expect(mapping.tag).toBe('civ-radio-group');
    expect(mapping.labelProp).toBe('legend');
    expect(mapping.isGroup).toBe(true);
    expect(mapping.childTag).toBe('civ-radio');
  });

  it('maps checkbox to civ-checkbox', () => {
    const mapping = getComponentMapping('checkbox');
    expect(mapping.tag).toBe('civ-checkbox');
    expect(mapping.labelProp).toBe('label');
    expect(mapping.isGroup).toBe(false);
  });

  it('maps checkbox-group to civ-checkbox-group with children', () => {
    const mapping = getComponentMapping('checkbox-group');
    expect(mapping.tag).toBe('civ-checkbox-group');
    expect(mapping.labelProp).toBe('legend');
    expect(mapping.isGroup).toBe(true);
    expect(mapping.childTag).toBe('civ-checkbox');
  });

  it('maps date to civ-date-picker', () => {
    const mapping = getComponentMapping('date');
    expect(mapping.tag).toBe('civ-date-picker');
    expect(mapping.defaultHint).toBeTruthy();
  });

  it('maps memorable-date to civ-memorable-date with label', () => {
    const mapping = getComponentMapping('memorable-date');
    expect(mapping.tag).toBe('civ-memorable-date');
    expect(mapping.labelProp).toBe('label');
    expect(mapping.defaultHint).toBe('For example: January 15 1990');
  });

  it('maps file to civ-file-upload', () => {
    const mapping = getComponentMapping('file');
    expect(mapping.tag).toBe('civ-file-upload');
  });

  it('maps toggle to civ-toggle', () => {
    const mapping = getComponentMapping('toggle');
    expect(mapping.tag).toBe('civ-toggle');
  });

  it('has mappings for all field types', () => {
    const allMappings = getAllMappings();
    const expectedTypes = [
      'text', 'email', 'tel', 'number', 'password', 'search', 'url',
      'ssn', 'zip', 'textarea', 'select', 'combobox', 'radio',
      'checkbox', 'checkbox-group', 'date', 'memorable-date', 'file', 'toggle',
    ];
    for (const type of expectedTypes) {
      expect(allMappings).toHaveProperty(type);
    }
  });

  it('email has defaultAutocomplete="email"', () => {
    expect(getComponentMapping('email').defaultAutocomplete).toBe('email');
  });

  it('tel has defaultAutocomplete and defaultInputmode', () => {
    const mapping = getComponentMapping('tel');
    expect(mapping.defaultAutocomplete).toBe('tel');
    expect(mapping.defaultInputmode).toBe('tel');
  });

  it('ssn has defaultInputmode="numeric"', () => {
    expect(getComponentMapping('ssn').defaultInputmode).toBe('numeric');
  });

  it('zip has defaultAutocomplete and defaultInputmode', () => {
    const mapping = getComponentMapping('zip');
    expect(mapping.defaultAutocomplete).toBe('postal-code');
    expect(mapping.defaultInputmode).toBe('numeric');
  });

  it('url has defaultAutocomplete="url"', () => {
    expect(getComponentMapping('url').defaultAutocomplete).toBe('url');
  });
});
