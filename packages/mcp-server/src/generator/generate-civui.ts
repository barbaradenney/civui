import type { FormSchema, FormField, FormSection, ConditionExpression, CompoundCondition, StepDefinition } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';
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

function conditionToDataAttr(cond: ConditionExpression): string {
  if (!isSimpleCondition(cond)) {
    return JSON.stringify(cond);
  }
  const val = Array.isArray(cond.value) ? cond.value.join(',') : (cond.value ?? '');
  switch (cond.operator) {
    case 'eq': return `${cond.field}=${val}`;
    case 'neq': return `${cond.field}!=${val}`;
    case 'in': return `${cond.field} in ${val}`;
    case 'notIn': return `${cond.field} notIn ${val}`;
    case 'exists': return `${cond.field} exists`;
    case 'notExists': return `${cond.field} notExists`;
    default: return `${cond.field}=${val}`;
  }
}

function appendConditionalAttrs(line: string, field: FormField): string {
  if (field.visibleWhen) {
    if (isSimpleCondition(field.visibleWhen) && field.visibleWhen.operator === 'neq') {
      line += attr('data-civ-hide-when', conditionToDataAttr(field.visibleWhen));
    } else {
      line += attr('data-civ-show-when', conditionToDataAttr(field.visibleWhen));
    }
  }
  if (field.requiredWhen) {
    line += attr('data-civ-require-when', conditionToDataAttr(field.requiredWhen));
  }
  return line;
}

function generateField(field: FormField, indentLevel: number): string {
  const mapping = getComponentMapping(field.type);
  const lines: string[] = [];

  const hint = field.hint ?? mapping.defaultHint;
  const isConditionallyRequired = !!field.requiredWhen;
  const requiredMessage = (field.required && !isConditionallyRequired)
    ? generateRequiredMessage(field.label)
    : undefined;

  if (mapping.isGroup && mapping.childTag && field.children?.length) {
    let opening = `<${mapping.tag}`;
    opening += attr(mapping.labelProp, field.label);
    opening += attr('name', field.name);
    if (hint) opening += attr('hint', hint);
    if (field.required && !isConditionallyRequired) {
      opening += ' required';
      opening += attr('required-message', requiredMessage!);
    }
    if (field.disabled) opening += ' disabled';
    opening = appendConditionalAttrs(opening, field);
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
    if (field.required && !isConditionallyRequired) {
      opening += ' required';
      opening += attr('required-message', requiredMessage!);
    }
    if (field.disabled) opening += ' disabled';
    opening = appendConditionalAttrs(opening, field);
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
    if (field.required && !isConditionallyRequired) {
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

    line = appendConditionalAttrs(line, field);
    if (field.optionsFrom) {
      line += attr('data-civ-options-from', field.optionsFrom.field);
    }
    line += `></${mapping.tag}>`;
    lines.push(line);

    // Emit cascading options map as a sibling script
    if (field.optionsFrom) {
      lines.push(`<script type="application/json" data-civ-options-map="${escapeAttr(field.name)}">${JSON.stringify(field.optionsFrom.map)}</script>`);
    }
  }

  return indent(lines.join('\n'), indentLevel);
}

function generateTableField(field: FormField, indentLevel: number): string {
  const mapping = getComponentMapping(field.type);
  let line = `<${mapping.tag}`;
  line += attr('aria-label', field.label);
  line += attr('name', field.name);
  if (mapping.inputType) {
    line += attr('type', mapping.inputType);
  }
  const hint = field.hint ?? mapping.defaultHint;
  if (hint) line += attr('hint', hint);
  if (field.required) {
    line += ' required';
    line += attr('required-message', generateRequiredMessage(field.label));
  }
  if (field.disabled) line += ' disabled';
  if (field.placeholder) line += attr('placeholder', field.placeholder);
  if (field.value) line += attr('value', field.value);
  if (field.optionsFrom) {
    line += attr('data-civ-options-from', field.optionsFrom.field);
  }
  line += `></${mapping.tag}>`;

  const parts: string[] = [];
  parts.push(indent(line, indentLevel));

  if (field.optionsFrom) {
    parts.push(indent(
      `<script type="application/json" data-civ-options-map="${escapeAttr(field.name)}">${JSON.stringify(field.optionsFrom.map)}</script>`,
      indentLevel,
    ));
  }

  return parts.join('\n');
}

function generateTableSection(section: FormSection, indentLevel: number): string {
  const parts: string[] = [];
  const key = section.repeatableKey!;
  const addLabel = section.repeatableAddLabel ?? 'Add row';
  const removeLabel = section.repeatableRemoveLabel ?? 'Remove row';
  const sectionVisibleWhen = section.visibleWhen;

  // Determine column order
  const columns = section.tableColumns?.length
    ? section.fields.filter((f) => section.tableColumns!.includes(f.name))
        .sort((a, b) => section.tableColumns!.indexOf(a.name) - section.tableColumns!.indexOf(b.name))
    : section.fields;

  let repeatableOpen = `<div data-civ-repeatable="${escapeAttr(key)}" data-civ-layout="table"`;
  if (section.repeatableMin !== undefined) {
    repeatableOpen += ` data-civ-repeatable-min="${section.repeatableMin}"`;
  }
  if (section.repeatableMax !== undefined) {
    repeatableOpen += ` data-civ-repeatable-max="${section.repeatableMax}"`;
  }
  if (sectionVisibleWhen) {
    repeatableOpen += attr('data-civ-show-when', conditionToDataAttr(sectionVisibleWhen));
  }
  repeatableOpen += ` aria-live="polite">`;
  parts.push(indent(repeatableOpen, indentLevel));

  if (section.heading) {
    parts.push(indent(`<h3>${escapeAttr(section.heading)}</h3>`, indentLevel + 1));
  }

  parts.push(indent('<table class="civ-w-full civ-border-collapse">', indentLevel + 1));

  // thead
  parts.push(indent('<thead>', indentLevel + 2));
  parts.push(indent('<tr>', indentLevel + 3));
  for (const col of columns) {
    parts.push(indent(`<th scope="col">${escapeAttr(col.label)}</th>`, indentLevel + 4));
  }
  parts.push(indent('<th scope="col"><span class="civ-sr-only">Actions</span></th>', indentLevel + 4));
  parts.push(indent('</tr>', indentLevel + 3));
  parts.push(indent('</thead>', indentLevel + 2));

  // tbody with first row
  parts.push(indent('<tbody>', indentLevel + 2));
  parts.push(indent('<tr data-civ-repeatable-item>', indentLevel + 3));
  for (const col of columns) {
    const prefixed = { ...col, name: prefixFieldName(col.name, key, 0) };
    parts.push(indent(`<td>${generateTableField(prefixed, 0).trim()}</td>`, indentLevel + 4));
  }
  parts.push(indent(`<td><button type="button" data-civ-repeatable-remove>${escapeAttr(removeLabel)}</button></td>`, indentLevel + 4));
  parts.push(indent('</tr>', indentLevel + 3));
  parts.push(indent('</tbody>', indentLevel + 2));

  parts.push(indent('</table>', indentLevel + 1));
  parts.push(indent(`<button type="button" data-civ-repeatable-add>${escapeAttr(addLabel)}</button>`, indentLevel + 1));
  parts.push(indent('</div>', indentLevel));

  return parts.join('\n');
}

function prefixFieldName(name: string, key: string, index: number): string {
  return `${key}[${index}].${name}`;
}

function generateSection(section: FormSection, indentLevel: number): string {
  // Dispatch to table generator for table layout
  if (section.layout === 'table' && section.repeatable && section.repeatableKey) {
    return generateTableSection(section, indentLevel);
  }

  const parts: string[] = [];

  // For repeatable sections, prefix field names and wrap in container
  const fields = section.repeatable && section.repeatableKey
    ? section.fields.map((f) => ({
        ...f,
        name: prefixFieldName(f.name, section.repeatableKey!, 0),
      }))
    : section.fields;

  const addLabel = section.repeatableAddLabel ?? 'Add another item';
  const removeLabel = section.repeatableRemoveLabel ?? 'Remove this item';

  // Determine if we need a section visibleWhen wrapper
  const sectionVisibleWhen = section.visibleWhen;
  const needsVisibilityWrapper = !!sectionVisibleWhen && !section.repeatable && !section.heading;

  if (section.repeatable && section.repeatableKey) {
    let repeatableOpen = `<div data-civ-repeatable="${escapeAttr(section.repeatableKey)}"`;
    if (section.repeatableMin !== undefined) {
      repeatableOpen += ` data-civ-repeatable-min="${section.repeatableMin}"`;
    }
    if (section.repeatableMax !== undefined) {
      repeatableOpen += ` data-civ-repeatable-max="${section.repeatableMax}"`;
    }
    if (sectionVisibleWhen) {
      repeatableOpen += attr('data-civ-show-when', conditionToDataAttr(sectionVisibleWhen));
    }
    repeatableOpen += ` aria-live="polite">`;
    parts.push(indent(repeatableOpen, indentLevel));

    if (section.heading) {
      parts.push(indent(`<civ-fieldset legend="${escapeAttr(section.heading)}">`, indentLevel + 1));
      for (const field of fields) {
        parts.push(generateField(field, indentLevel + 2));
      }
      parts.push(indent(`<button type="button" data-civ-repeatable-remove>${escapeAttr(removeLabel)}</button>`, indentLevel + 2));
      parts.push(indent('</civ-fieldset>', indentLevel + 1));
    } else {
      for (const field of fields) {
        parts.push(generateField(field, indentLevel + 1));
      }
      parts.push(indent(`<button type="button" data-civ-repeatable-remove>${escapeAttr(removeLabel)}</button>`, indentLevel + 1));
    }

    parts.push(indent(`<button type="button" data-civ-repeatable-add>${escapeAttr(addLabel)}</button>`, indentLevel + 1));
    parts.push(indent('</div>', indentLevel));
  } else if (section.heading) {
    let fieldsetOpen = `<civ-fieldset legend="${escapeAttr(section.heading)}"`;
    if (sectionVisibleWhen) {
      fieldsetOpen += attr('data-civ-show-when', conditionToDataAttr(sectionVisibleWhen));
    }
    fieldsetOpen += '>';
    parts.push(indent(fieldsetOpen, indentLevel));
    for (const field of fields) {
      parts.push(generateField(field, indentLevel + 1));
    }
    parts.push(indent('</civ-fieldset>', indentLevel));
  } else if (needsVisibilityWrapper) {
    let wrapperOpen = `<div`;
    wrapperOpen += attr('data-civ-show-when', conditionToDataAttr(sectionVisibleWhen!));
    wrapperOpen += '>';
    parts.push(indent(wrapperOpen, indentLevel));
    for (const field of fields) {
      parts.push(generateField(field, indentLevel + 1));
    }
    parts.push(indent('</div>', indentLevel));
  } else {
    for (const field of fields) {
      parts.push(generateField(field, indentLevel));
    }
  }

  return parts.join('\n');
}

function generateProgressIndicator(steps: StepDefinition[], indentLevel: number): string {
  const lines: string[] = [];
  lines.push(indent('<nav data-civ-progress aria-label="Form progress">', indentLevel));
  lines.push(indent('<ol>', indentLevel + 1));
  for (let i = 0; i < steps.length; i++) {
    const ariaCurrent = i === 0 ? ' aria-current="step"' : '';
    lines.push(indent(`<li data-civ-progress-step="${i}"${ariaCurrent}>${escapeAttr(steps[i].title)}</li>`, indentLevel + 2));
  }
  lines.push(indent('</ol>', indentLevel + 1));
  lines.push(indent('</nav>', indentLevel));
  return lines.join('\n');
}

function generateStepNav(indentLevel: number): string {
  const lines: string[] = [];
  lines.push(indent('<div data-civ-step-nav>', indentLevel));
  lines.push(indent('<button type="button" data-civ-step-prev disabled>Previous</button>', indentLevel + 1));
  lines.push(indent('<button type="button" data-civ-step-next>Next</button>', indentLevel + 1));
  lines.push(indent('</div>', indentLevel));
  return lines.join('\n');
}

export interface GenerateOptions {
  wrapInCivForm?: boolean;
}

function resolveRefSections(schema: FormSchema): FormSection[] {
  if (!schema.subForms) return schema.sections;

  return schema.sections.map((section) => {
    if (!section.ref) return section;

    const subForm = schema.subForms![section.ref];
    if (!subForm) return section;

    const ns = section.namespace ?? section.ref;
    const resolvedFields = subForm.fields.map((f) => ({
      ...f,
      name: `${ns}.${f.name}`,
      visibleWhen: f.visibleWhen
        ? prefixConditionFields(f.visibleWhen, ns)
        : undefined,
      requiredWhen: f.requiredWhen
        ? prefixConditionFields(f.requiredWhen, ns)
        : undefined,
    }));

    return {
      ...section,
      fields: resolvedFields,
      ref: undefined,
    };
  });
}

function prefixConditionFields(cond: ConditionExpression, ns: string): ConditionExpression {
  if (isSimpleCondition(cond)) {
    return { ...cond, field: `${ns}.${cond.field}` };
  }
  const result: CompoundCondition = {};
  if (cond.allOf) {
    result.allOf = cond.allOf.map((c) => prefixConditionFields(c, ns));
  }
  if (cond.anyOf) {
    result.anyOf = cond.anyOf.map((c) => prefixConditionFields(c, ns));
  }
  return result;
}

export function generateCivUI(
  schema: FormSchema,
  options: GenerateOptions = {},
): string {
  const { wrapInCivForm = true } = options;
  const parts: string[] = [];
  const baseIndent = wrapInCivForm ? 1 : 0;

  const resolvedSections = resolveRefSections(schema);

  if (wrapInCivForm) {
    let formOpen = '<civ-form';
    if (schema.action) formOpen += attr('action', schema.action);
    if (schema.method) formOpen += attr('method', schema.method);
    formOpen += '>';
    parts.push(formOpen);
  }

  // Form steps mode: group sections by step
  if (schema.steps && schema.steps.length > 0) {
    parts.push(generateProgressIndicator(schema.steps, baseIndent));
    parts.push('');

    // Group sections by step
    const stepSections = new Map<number, FormSection[]>();
    for (const section of resolvedSections) {
      const step = section.step ?? 0;
      if (!stepSections.has(step)) stepSections.set(step, []);
      stepSections.get(step)!.push(section);
    }

    for (let i = 0; i < schema.steps.length; i++) {
      const hidden = i > 0 ? ' hidden' : '';
      parts.push(indent(`<div data-civ-step="${i}"${hidden}>`, baseIndent));
      const sections = stepSections.get(i) ?? [];
      for (const section of sections) {
        parts.push(generateSection(section, baseIndent + 1));
      }
      parts.push(indent('</div>', baseIndent));
      parts.push('');
    }

    parts.push(generateStepNav(baseIndent));
  } else {
    for (const section of resolvedSections) {
      parts.push(generateSection(section, baseIndent));
    }
  }

  if (wrapInCivForm) {
    parts.push('</civ-form>');
  }

  return parts.filter(Boolean).join('\n\n');
}
