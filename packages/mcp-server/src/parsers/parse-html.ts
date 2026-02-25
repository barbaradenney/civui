import * as cheerio from 'cheerio';
import type { FormSchema, FormField, FormSection, FieldType, FieldOption } from '../schema/index.js';

// cheerio 1.x uses domhandler types internally but doesn't re-export them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheerioNode = any;

/**
 * Escape special CSS selector characters in a value used inside an attribute selector.
 * Covers the chars that break `[name="..."]` selectors.
 */
function escapeCssAttrValue(value: string): string {
  return value.replace(/([\\"\]^$*+?.(){}|])/g, '\\$1');
}

function resolveLabel(
  $: cheerio.CheerioAPI,
  el: CheerioNode,
): string {
  const id = $(el).attr('id');
  if (id) {
    const labelEl = $(`label[for="${escapeCssAttrValue(id)}"]`);
    if (labelEl.length) return labelEl.first().text().trim();
  }

  const parentLabel = $(el).closest('label');
  if (parentLabel.length) {
    const clone = parentLabel.clone();
    clone.find('input, select, textarea').remove();
    return clone.text().trim();
  }

  return (
    $(el).attr('aria-label') ||
    $(el).attr('placeholder') ||
    $(el).attr('name') ||
    ''
  );
}

function inferFieldType(
  el: CheerioNode,
  $: cheerio.CheerioAPI,
): FieldType {
  const tagName = el.tagName?.toLowerCase() as string | undefined;
  const type = $(el).attr('type')?.toLowerCase() ?? 'text';
  const name = ($(el).attr('name') ?? '').toLowerCase();

  if (tagName === 'textarea') return 'textarea';
  if (tagName === 'select') return 'select';

  if (type === 'checkbox') return 'checkbox';
  if (type === 'radio') return 'radio';
  if (type === 'file') return 'file';
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  if (type === 'number') return 'number';
  if (type === 'password') return 'password';
  if (type === 'search') return 'search';
  if (type === 'url') return 'url';
  if (type === 'date') return 'date';

  if (name.includes('ssn') || name.includes('social')) return 'ssn';
  if (name.includes('zip') || name.includes('postal')) return 'zip';
  if (name.includes('dob') || name.includes('birth') || name.includes('date_of_birth'))
    return 'memorable-date';
  if (name.includes('email')) return 'email';
  if (name.includes('phone') || name.includes('tel')) return 'tel';

  return 'text';
}

function omitUndefined(obj: FormField): FormField {
  const result: Partial<FormField> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result as FormField;
}

function parseNumber(val: string | undefined): number | undefined {
  if (val === undefined) return undefined;
  const num = parseInt(val, 10);
  return isNaN(num) ? undefined : num;
}

function extractOptions(
  $: cheerio.CheerioAPI,
  selectEl: ReturnType<cheerio.CheerioAPI>,
): FieldOption[] {
  const options: FieldOption[] = [];
  selectEl.find('option').each((_: number, opt: CheerioNode) => {
    const value = $(opt).attr('value');
    const label = $(opt).text().trim();
    if (value !== undefined && value !== '') {
      options.push({
        value,
        label: label || value,
        ...($(opt).attr('disabled') !== undefined ? { disabled: true } : {}),
      });
    }
  });
  return options;
}

export function parseHTML(html: string): FormSchema {
  const $ = cheerio.load(html);
  const sections: FormSection[] = [];

  // Deterministic counter for unnamed fields
  let unnamedFieldCounter = 0;

  const radioGroups = new Map<string, { labels: string[]; values: string[]; required: boolean; container: CheerioNode }>();
  const checkboxGroups = new Map<string, { labels: string[]; values: string[]; required: boolean; container: CheerioNode }>();

  // Pre-scan for grouped inputs (radios and checkboxes sharing a name)
  $('input[type="radio"]').each((_: number, el: CheerioNode) => {
    const name = $(el).attr('name');
    if (!name) return;
    const label = resolveLabel($, el);
    const value = $(el).attr('value') ?? '';
    const existing = radioGroups.get(name);
    if (existing) {
      existing.labels.push(label);
      existing.values.push(value);
      if ($(el).attr('required') !== undefined) existing.required = true;
    } else {
      radioGroups.set(name, {
        labels: [label],
        values: [value],
        required: $(el).attr('required') !== undefined,
        container: $(el).closest('fieldset').get(0) ?? null,
      });
    }
  });

  const checkboxNames = new Map<string, number>();
  $('input[type="checkbox"]').each((_: number, el: CheerioNode) => {
    const name = $(el).attr('name');
    if (!name) return;
    checkboxNames.set(name, (checkboxNames.get(name) ?? 0) + 1);
  });

  for (const [name, count] of checkboxNames) {
    if (count > 1) {
      const escaped = escapeCssAttrValue(name);
      $(`input[type="checkbox"][name="${escaped}"]`).each((_: number, el: CheerioNode) => {
        const label = resolveLabel($, el);
        const value = $(el).attr('value') ?? '';
        const existing = checkboxGroups.get(name);
        if (existing) {
          existing.labels.push(label);
          existing.values.push(value);
          if ($(el).attr('required') !== undefined) existing.required = true;
        } else {
          checkboxGroups.set(name, {
            labels: [label],
            values: [value],
            required: $(el).attr('required') !== undefined,
            container: $(el).closest('fieldset').get(0) ?? null,
          });
        }
      });
    }
  }

  const processedNames = new Set<string>();

  function processElement(el: CheerioNode): FormField | null {
    const tagName = el.tagName?.toLowerCase() as string | undefined;
    if (!tagName) return null;

    if (!['input', 'select', 'textarea'].includes(tagName)) return null;

    const name = $(el).attr('name') ?? '';
    if (processedNames.has(name) && name) return null;

    const inputType = $(el).attr('type')?.toLowerCase();

    // Skip hidden and submit inputs
    if (inputType === 'hidden' || inputType === 'submit' || inputType === 'button' || inputType === 'reset')
      return null;

    // Handle radio groups
    if (inputType === 'radio' && name) {
      const group = radioGroups.get(name);
      if (!group) return null;
      processedNames.add(name);

      const legend =
        group.container
          ? $(group.container).find('legend').first().text().trim()
          : '';

      return {
        type: 'radio',
        name,
        label: legend || name,
        required: group.required || undefined,
        options: group.values.map((v, i) => ({
          value: v,
          label: group.labels[i] || v,
        })),
      };
    }

    // Handle checkbox groups
    if (inputType === 'checkbox' && name && checkboxGroups.has(name)) {
      const group = checkboxGroups.get(name)!;
      processedNames.add(name);

      const legend =
        group.container
          ? $(group.container).find('legend').first().text().trim()
          : '';

      return {
        type: 'checkbox-group',
        name,
        label: legend || name,
        required: group.required || undefined,
        options: group.values.map((v, i) => ({
          value: v,
          label: group.labels[i] || v,
        })),
      };
    }

    if (name) processedNames.add(name);

    const label = resolveLabel($, el);
    const fieldType = inferFieldType(el, $);

    const field: FormField = {
      type: fieldType,
      name: name || `field_${++unnamedFieldCounter}`,
      label,
      required: $(el).attr('required') !== undefined ? true : undefined,
      disabled: $(el).attr('disabled') !== undefined ? true : undefined,
      placeholder: $(el).attr('placeholder') || undefined,
      maxlength: parseNumber($(el).attr('maxlength')),
      minlength: parseNumber($(el).attr('minlength')),
      pattern: $(el).attr('pattern') || undefined,
      min: $(el).attr('min') || undefined,
      max: $(el).attr('max') || undefined,
      autocomplete: $(el).attr('autocomplete') || undefined,
      inputmode: $(el).attr('inputmode') || undefined,
    };

    if (tagName === 'textarea') {
      field.rows = parseNumber($(el).attr('rows'));
    }

    if (tagName === 'select') {
      field.options = extractOptions($, $(el));
    }

    if (inputType === 'file') {
      field.accept = $(el).attr('accept') || undefined;
      field.multiple = $(el).attr('multiple') !== undefined ? true : undefined;
    }

    // Strip keys with undefined values
    return omitUndefined(field);
  }

  // Process fieldsets as sections
  const fieldsets = $('fieldset');
  const processedFieldsets = new Set<CheerioNode>();

  fieldsets.each((_: number, fieldset: CheerioNode) => {
    const legend = $(fieldset).find('> legend').first().text().trim();
    const fields: FormField[] = [];

    $(fieldset)
      .find('input, select, textarea')
      .each((_: number, el: CheerioNode) => {
        const field = processElement(el);
        if (field) fields.push(field);
      });

    if (fields.length > 0) {
      sections.push({
        heading: legend || undefined,
        fields,
      });
      processedFieldsets.add(fieldset);
    }
  });

  // Process remaining form elements not in fieldsets
  const remainingFields: FormField[] = [];
  $('input, select, textarea').each((_: number, el: CheerioNode) => {
    if ($(el).closest('fieldset').length > 0 && processedFieldsets.size > 0) {
      const closestFieldset = $(el).closest('fieldset').get(0);
      if (closestFieldset && processedFieldsets.has(closestFieldset)) return;
    }
    const field = processElement(el);
    if (field) remainingFields.push(field);
  });

  if (remainingFields.length > 0) {
    sections.push({ fields: remainingFields });
  }

  // Extract title from form or page
  const title =
    $('form').attr('aria-label') ||
    $('h1').first().text().trim() ||
    undefined;

  const action = $('form').attr('action') || undefined;
  const method = $('form').attr('method')?.toUpperCase() || undefined;

  return {
    title,
    action,
    method,
    sections,
  };
}
