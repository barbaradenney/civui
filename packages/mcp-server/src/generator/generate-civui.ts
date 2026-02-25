import type { FormSchema, FormField, FormSection } from '../schema/index.js';
import { getComponentMapping } from './component-map.js';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attr(name: string, value: string | number | boolean | undefined): string {
  if (value === undefined || value === false) return '';
  if (value === true) return ` ${name}`;
  return ` ${name}="${escapeAttr(String(value))}"`;
}

function indent(html: string, level: number): string {
  const prefix = '  '.repeat(level);
  return html
    .split('\n')
    .map((line) => (line.trim() ? prefix + line : ''))
    .join('\n');
}

function generateRequiredMessage(label: string): string {
  return `${label} is required`;
}

function generateField(field: FormField, indentLevel: number): string {
  const mapping = getComponentMapping(field.type);
  const lines: string[] = [];

  const hint = field.hint ?? mapping.defaultHint;
  const requiredMessage = field.required
    ? generateRequiredMessage(field.label)
    : undefined;

  if (mapping.isGroup && mapping.childTag && field.children?.length) {
    let opening = `<${mapping.tag}`;
    opening += attr(mapping.labelProp, field.label);
    opening += attr('name', field.name);
    if (hint) opening += attr('hint', hint);
    if (field.required) {
      opening += ' required';
      opening += attr('required-message', requiredMessage!);
    }
    if (field.disabled) opening += ' disabled';
    opening += '>';
    lines.push(opening);

    for (const child of field.children) {
      let childLine = `  <${mapping.childTag}`;
      childLine += attr('label', child.label);
      childLine += attr('value', child.value ?? child.name);
      if (child.disabled) childLine += ' disabled';
      childLine += `></${mapping.childTag}>`;
      lines.push(childLine);
    }

    lines.push(`</${mapping.tag}>`);
  } else if (mapping.isGroup && mapping.childTag && field.options?.length) {
    let opening = `<${mapping.tag}`;
    opening += attr(mapping.labelProp, field.label);
    opening += attr('name', field.name);
    if (hint) opening += attr('hint', hint);
    if (field.required) {
      opening += ' required';
      opening += attr('required-message', requiredMessage!);
    }
    if (field.disabled) opening += ' disabled';
    opening += '>';
    lines.push(opening);

    for (const opt of field.options) {
      let childLine = `  <${mapping.childTag}`;
      childLine += attr('label', opt.label);
      childLine += attr('value', opt.value);
      if (opt.disabled) childLine += ' disabled';
      childLine += `></${mapping.childTag}>`;
      lines.push(childLine);
    }

    lines.push(`</${mapping.tag}>`);
  } else {
    let line = `<${mapping.tag}`;
    line += attr(mapping.labelProp, field.label);
    line += attr('name', field.name);

    if (mapping.inputType) {
      line += attr('type', mapping.inputType);
    }

    if (hint) line += attr('hint', hint);
    if (field.required) {
      line += ' required';
      line += attr('required-message', requiredMessage!);
    }
    if (field.disabled) line += ' disabled';
    if (field.placeholder) line += attr('placeholder', field.placeholder);
    if (field.value) line += attr('value', field.value);
    if (field.maxlength !== undefined) line += attr('maxlength', field.maxlength);
    if (field.minlength !== undefined) line += attr('minlength', field.minlength);
    if (field.pattern) line += attr('pattern', field.pattern);
    if (field.min) line += attr('min', field.min);
    if (field.max) line += attr('max', field.max);
    if (field.accept) line += attr('accept', field.accept);
    if (field.multiple) line += ' multiple';
    if (field.maxFiles !== undefined) line += attr('max-files', field.maxFiles);
    if (field.maxSize !== undefined) line += attr('max-size', field.maxSize);
    const autocomplete = field.autocomplete ?? mapping.defaultAutocomplete;
    if (autocomplete) line += attr('autocomplete', autocomplete);
    const inputmode = field.inputmode ?? mapping.defaultInputmode;
    if (inputmode) line += attr('inputmode', inputmode);
    if (field.rows !== undefined) line += attr('rows', field.rows);

    line += `></${mapping.tag}>`;
    lines.push(line);
  }

  return indent(lines.join('\n'), indentLevel);
}

function generateSection(section: FormSection, indentLevel: number): string {
  const parts: string[] = [];

  if (section.heading) {
    parts.push(indent(`<civ-fieldset legend="${escapeAttr(section.heading)}">`, indentLevel));
    for (const field of section.fields) {
      parts.push(generateField(field, indentLevel + 1));
    }
    parts.push(indent('</civ-fieldset>', indentLevel));
  } else {
    for (const field of section.fields) {
      parts.push(generateField(field, indentLevel));
    }
  }

  return parts.join('\n');
}

export interface GenerateOptions {
  wrapInCivForm?: boolean;
}

export function generateCivUI(
  schema: FormSchema,
  options: GenerateOptions = {},
): string {
  const { wrapInCivForm = true } = options;
  const parts: string[] = [];
  const baseIndent = wrapInCivForm ? 1 : 0;

  if (wrapInCivForm) {
    let formOpen = '<civ-form';
    if (schema.action) formOpen += attr('action', schema.action);
    if (schema.method) formOpen += attr('method', schema.method);
    formOpen += '>';
    parts.push(formOpen);
  }

  for (const section of schema.sections) {
    parts.push(generateSection(section, baseIndent));
  }

  if (wrapInCivForm) {
    parts.push('</civ-form>');
  }

  return parts.filter(Boolean).join('\n\n');
}
