/**
 * form_to_schema tool — reverse of generate, converts CivUI HTML back to FormSchema.
 * Parses CivUI markup and extracts structure as a FormSchema object.
 */
import { load } from 'cheerio';
import { getAllMappings } from '../generator/component-map.js';
import type { FormSchema, FormSection, FormField, FieldOption, ConditionExpression } from '../schema/index.js';

/** Build reverse map: (tag, inputType?) → FieldType */
function buildReverseMap(): Map<string, string> {
  const mappings = getAllMappings();
  const reverse = new Map<string, string>();

  for (const [fieldType, mapping] of Object.entries(mappings)) {
    if (mapping.inputType) {
      reverse.set(`${mapping.tag}:${mapping.inputType}`, fieldType);
    } else {
      // Only set if there's no more specific entry
      if (!reverse.has(mapping.tag)) {
        reverse.set(mapping.tag, fieldType);
      }
    }
  }

  return reverse;
}

function resolveFieldType(tag: string, inputType?: string): string {
  const reverseMap = buildReverseMap();

  if (inputType) {
    const specific = reverseMap.get(`${tag}:${inputType}`);
    if (specific) return specific;
  }

  return reverseMap.get(tag) ?? 'text';
}

function parseOptions(
  $: ReturnType<typeof load>,
  $el: ReturnType<ReturnType<typeof load>>,
  childTag: string,
): FieldOption[] | undefined {
  const options: FieldOption[] = [];
  $el.find(childTag).each((_: number, child: any) => {
    const $child = $(child);
    const value = $child.attr('value') ?? '';
    const label = $child.attr('label') ?? value;
    const option: FieldOption = { value, label };
    const disabled = $child.attr('disabled');
    if (disabled !== undefined) option.disabled = true;
    options.push(option);
  });
  return options.length > 0 ? options : undefined;
}

/** Parse a data-civ-show-when/hide-when/require-when attribute into a ConditionExpression. */
function parseConditionAttr(attrValue: string): ConditionExpression | undefined {
  if (!attrValue) return undefined;

  if (attrValue.endsWith(' exists')) {
    return { field: attrValue.replace(/ exists$/, ''), operator: 'exists' };
  }
  if (attrValue.endsWith(' notExists')) {
    return { field: attrValue.replace(/ notExists$/, ''), operator: 'notExists' };
  }

  const inMatch = attrValue.match(/^(.+?) in (.+)$/);
  if (inMatch) {
    return { field: inMatch[1], operator: 'in', value: inMatch[2].split(',') };
  }

  const notInMatch = attrValue.match(/^(.+?) notIn (.+)$/);
  if (notInMatch) {
    return { field: notInMatch[1], operator: 'notIn', value: notInMatch[2].split(',') };
  }

  const neqMatch = attrValue.match(/^(.+?)!=(.+)$/);
  if (neqMatch) {
    return { field: neqMatch[1], operator: 'neq', value: neqMatch[2] };
  }

  const eqMatch = attrValue.match(/^(.+?)=(.+)$/);
  if (eqMatch) {
    return { field: eqMatch[1], operator: 'eq', value: eqMatch[2] };
  }

  return undefined;
}

/** Strip array indices from field names: dependents[0].name → name */
function stripArrayPrefix(name: string): string {
  return name.replace(/^[^[]+\[\d+\]\./, '');
}

function extractField($: ReturnType<typeof load>, el: any, insideRepeatable = false): FormField | null {
  const $el = $(el);
  const tag = el.tagName;
  if (!tag || !tag.startsWith('civ-')) return null;

  const inputType = $el.attr('type') ?? undefined;
  const type = resolveFieldType(tag, inputType) as FormField['type'];
  const rawName = $el.attr('name') ?? '';
  const name = insideRepeatable ? stripArrayPrefix(rawName) : rawName;
  const label = $el.attr('label') ?? $el.attr('legend') ?? '';

  const field: FormField = { type, name, label };

  // Optional string attributes
  const hint = $el.attr('hint');
  if (hint) field.hint = hint;

  const placeholder = $el.attr('placeholder');
  if (placeholder) field.placeholder = placeholder;

  const value = $el.attr('value');
  if (value !== undefined) field.value = value;

  const autocomplete = $el.attr('autocomplete');
  if (autocomplete) field.autocomplete = autocomplete;

  const inputmode = $el.attr('inputmode');
  if (inputmode) field.inputmode = inputmode;

  const pattern = $el.attr('pattern');
  if (pattern) field.pattern = pattern;

  const min = $el.attr('min');
  if (min) field.min = min;

  const max = $el.attr('max');
  if (max) field.max = max;

  const accept = $el.attr('accept');
  if (accept) field.accept = accept;

  // Boolean attributes
  if ($el.attr('required') !== undefined) field.required = true;
  if ($el.attr('disabled') !== undefined) field.disabled = true;
  if ($el.attr('multiple') !== undefined) field.multiple = true;

  // Numeric attributes
  const maxlength = $el.attr('maxlength');
  if (maxlength) field.maxlength = parseInt(maxlength, 10);

  const minlength = $el.attr('minlength');
  if (minlength) field.minlength = parseInt(minlength, 10);

  const maxFiles = $el.attr('max-files');
  if (maxFiles) field.maxFiles = parseInt(maxFiles, 10);

  const maxSize = $el.attr('max-size');
  if (maxSize) field.maxSize = parseInt(maxSize, 10);

  const rows = $el.attr('rows');
  if (rows) field.rows = parseInt(rows, 10);

  // Extract child options for group components
  const childTagMap: Record<string, string> = {
    'civ-radio-group': 'civ-radio',
    'civ-checkbox-group': 'civ-checkbox',
    'civ-segmented-control': 'civ-segment',
  };
  const childTag = childTagMap[tag];
  if (childTag) {
    const options = parseOptions($, $el, childTag);
    if (options) field.options = options;
  }

  // Extract options from select/combobox option elements
  if (tag === 'civ-select' || tag === 'civ-combobox') {
    const optionsAttr = $el.attr('options');
    if (optionsAttr) {
      try {
        field.options = JSON.parse(optionsAttr);
      } catch {
        // ignore parse errors
      }
    } else {
      const options: FieldOption[] = [];
      $el.find('option').each((_: number, opt: any) => {
        const $opt = $(opt);
        const val = $opt.attr('value') ?? $opt.text().trim();
        const lbl = $opt.text().trim() || val;
        options.push({ value: val, label: lbl });
      });
      if (options.length > 0) field.options = options;
    }
  }

  // Conditional visibility / required
  const showWhen = $el.attr('data-civ-show-when');
  if (showWhen) {
    const cond = parseConditionAttr(showWhen);
    if (cond) field.visibleWhen = cond;
  }
  const hideWhen = $el.attr('data-civ-hide-when');
  if (hideWhen) {
    const cond = parseConditionAttr(hideWhen);
    if (cond) {
      // hide-when with neq operator means "visible when eq"
      field.visibleWhen = cond;
    }
  }
  const requireWhen = $el.attr('data-civ-require-when');
  if (requireWhen) {
    const cond = parseConditionAttr(requireWhen);
    if (cond) field.requiredWhen = cond;
  }

  return field;
}

/** CivUI tags that are form components (not structural). */
const FORM_COMPONENT_TAGS = new Set([
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-date-picker',
  'civ-checkbox',
  'civ-toggle',
  'civ-file-upload',
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-memorable-date',
  'civ-segmented-control',
]);

const FORM_SELECTOR = Array.from(FORM_COMPONENT_TAGS).join(', ');

/**
 * Convert CivUI HTML markup back to a FormSchema.
 *
 * @param html - CivUI HTML markup
 * @returns FormSchema object
 */
export function formToSchema(html: string): FormSchema {
  const $ = load(html);
  const schema: FormSchema = { sections: [] };

  // Extract form-level attrs
  const $form = $('civ-form').first();
  if ($form.length) {
    const action = $form.attr('action');
    if (action) schema.action = action;
    const method = $form.attr('method');
    if (method) schema.method = method;
  }

  // Extract title from first heading
  const $heading = $('h1, h2, h3').first();
  if ($heading.length) {
    schema.title = $heading.text().trim();
  }

  // Process repeatable containers first
  const processedEls = new Set<any>();

  $('[data-civ-repeatable]').each((_, containerEl) => {
    const $container = $(containerEl);
    const repeatableKey = $container.attr('data-civ-repeatable') ?? '';
    const repeatableMinAttr = $container.attr('data-civ-repeatable-min');
    const repeatableMaxAttr = $container.attr('data-civ-repeatable-max');

    // Look for a fieldset heading inside
    const $innerFieldset = $container.children('civ-fieldset').first();
    const heading = $innerFieldset.length ? $innerFieldset.attr('legend') : undefined;

    const section: FormSection = {
      heading,
      fields: [],
      repeatable: true,
      repeatableKey,
    };

    if (repeatableMinAttr) section.repeatableMin = parseInt(repeatableMinAttr, 10);
    if (repeatableMaxAttr) section.repeatableMax = parseInt(repeatableMaxAttr, 10);

    const searchRoot = $innerFieldset.length ? $innerFieldset : $container;
    searchRoot.find(FORM_SELECTOR).each((_, el) => {
      // Skip template elements
      if ($(el).closest('[data-civ-repeatable-template]').length > 0) return;
      // Skip child components of groups
      if ($(el).parents('civ-radio-group, civ-checkbox-group, civ-segmented-control').length > 0) return;

      const field = extractField($, el, true);
      if (field) {
        section.fields.push(field);
        processedEls.add(el);
      }
    });

    if (section.fields.length > 0) {
      schema.sections.push(section);
    }
    // Mark all elements inside the container as processed
    $container.find(FORM_SELECTOR).each((_, el) => { processedEls.add(el); });
    processedEls.add(containerEl);
  });

  // Process fieldsets as sections
  $('civ-fieldset').each((_, fieldsetEl) => {
    if (processedEls.has(fieldsetEl)) return;
    const $fieldset = $(fieldsetEl);
    // Skip nested fieldsets (they'll be processed by their parent)
    if ($fieldset.parents('civ-fieldset').length > 0) return;
    // Skip fieldsets inside repeatable containers
    if ($fieldset.parents('[data-civ-repeatable]').length > 0) return;

    const section: FormSection = {
      heading: $fieldset.attr('legend'),
      fields: [],
    };

    $fieldset.find(FORM_SELECTOR).each((_, el) => {
      if (processedEls.has(el)) return;
      // Skip components inside nested fieldsets
      const $el = $(el);
      const closestFieldset = $el.closest('civ-fieldset');
      if (closestFieldset.length && closestFieldset[0] !== fieldsetEl) return;

      const field = extractField($, el);
      if (field) {
        section.fields.push(field);
        processedEls.add(el);
      }
    });

    if (section.fields.length > 0) {
      schema.sections.push(section);
    }
    processedEls.add(fieldsetEl);
  });

  // Process remaining non-fieldset components
  const remainingSection: FormSection = { fields: [] };

  $(FORM_SELECTOR).each((_, el) => {
    if (processedEls.has(el)) return;
    // Skip child components of groups (e.g., civ-radio inside civ-radio-group)
    const $el = $(el);
    if ($el.parents('civ-radio-group, civ-checkbox-group, civ-segmented-control').length > 0) {
      return;
    }
    // Skip elements inside repeatable containers
    if ($el.parents('[data-civ-repeatable]').length > 0) return;
    // Skip template elements
    if ($el.closest('[data-civ-repeatable-template]').length > 0) return;

    const field = extractField($, el);
    if (field) {
      remainingSection.fields.push(field);
    }
  });

  if (remainingSection.fields.length > 0) {
    schema.sections.push(remainingSection);
  }

  return schema;
}
