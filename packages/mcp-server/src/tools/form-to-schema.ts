/**
 * form_to_schema tool — reverse of generate, converts CivUI HTML back to FormSchema.
 * Parses CivUI markup and extracts structure as a FormSchema object.
 */
import { load } from 'cheerio';
import { getAllMappings } from '../generator/component-map.js';
import type { FormSchema, FormSection, FormField, FieldOption, ConditionExpression, StepDefinition } from '../schema/index.js';

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

  // Try JSON parse for compound conditions (starts with '{')
  if (attrValue.trimStart().startsWith('{')) {
    try {
      return JSON.parse(attrValue) as ConditionExpression;
    } catch {
      // Fall through to simple parsing
    }
  }

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
  // Check for label/legend on the component itself, or on a civ-form-field/civ-form-fieldset wrapper
  const $wrapper = $el.closest('civ-form-field, civ-form-fieldset');
  let label = $el.attr('label') ?? $el.attr('legend') ?? $el.attr('aria-label') ?? '';
  if (!label && $wrapper.length > 0) {
    label = $wrapper.attr('label') ?? $wrapper.attr('legend') ?? '';
  }

  const field: FormField = { type, name, label };

  // Optional string attributes — check element first, then wrapper
  const hint = $el.attr('hint') ?? ($wrapper.length > 0 ? $wrapper.attr('hint') : undefined);
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

  // Cascading options
  const optionsFromField = $el.attr('data-civ-options-from');
  if (optionsFromField) {
    const fieldName = $el.attr('name') ?? '';
    const mapScript = $(`script[data-civ-options-map="${fieldName}"]`);
    if (mapScript.length) {
      try {
        const map = JSON.parse(mapScript.text());
        field.optionsFrom = { field: optionsFromField, map };
      } catch {
        // If JSON is invalid, still record the dependency without map
        field.optionsFrom = { field: optionsFromField, map: {} };
      }
    } else {
      field.optionsFrom = { field: optionsFromField, map: {} };
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

  // Detect form steps
  const $stepContainers = $('[data-civ-step]');
  const $progress = $('[data-civ-progress]');
  if ($stepContainers.length > 0 && $progress.length > 0) {
    const steps: StepDefinition[] = [];
    $progress.find('[data-civ-progress-step]').each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      steps.push({ title });
    });
    if (steps.length > 0) {
      schema.steps = steps;
    }
  }

  // Process repeatable containers first
  const processedEls = new Set<any>();

  $('[data-civ-repeatable]').each((_, containerEl) => {
    const $container = $(containerEl);
    const repeatableKey = $container.attr('data-civ-repeatable') ?? '';
    const repeatableMinAttr = $container.attr('data-civ-repeatable-min');
    const repeatableMaxAttr = $container.attr('data-civ-repeatable-max');

    // Detect table layout
    const isTable = $container.attr('data-civ-layout') === 'table';

    // Look for a fieldset heading inside, or h3 for table layout
    const $innerFieldset = $container.children('civ-fieldset').first();
    let heading: string | undefined;
    if (isTable) {
      const $h3 = $container.children('h3').first();
      heading = $h3.length ? $h3.text().trim() : undefined;
    } else {
      heading = $innerFieldset.length ? $innerFieldset.attr('legend') : undefined;
    }

    const section: FormSection = {
      heading,
      fields: [],
      repeatable: true,
      repeatableKey,
    };

    if (isTable) {
      section.layout = 'table';
      // Extract tableColumns from thead
      const tableColumns: string[] = [];
      $container.find('thead th[scope="col"]').each((_, th) => {
        const text = $(th).text().trim();
        if (text && text !== 'Actions') {
          tableColumns.push(text);
        }
      });
      // Extract field names from first row to map column labels to field names
      const fieldNames: string[] = [];
      const $firstRow = $container.find('tbody tr[data-civ-repeatable-item]').first();
      if ($firstRow.length) {
        $firstRow.find(FORM_SELECTOR).each((_, el) => {
          const rawName = $(el).attr('name') ?? '';
          const name = stripArrayPrefix(rawName);
          if (name) fieldNames.push(name);
        });
      }
      if (fieldNames.length > 0) {
        section.tableColumns = fieldNames;
      }
    }

    if (repeatableMinAttr) section.repeatableMin = parseInt(repeatableMinAttr, 10);
    if (repeatableMaxAttr) section.repeatableMax = parseInt(repeatableMaxAttr, 10);

    // Detect section visibleWhen
    const containerShowWhen = $container.attr('data-civ-show-when');
    if (containerShowWhen) {
      const cond = parseConditionAttr(containerShowWhen);
      if (cond) section.visibleWhen = cond;
    }

    // Detect step assignment
    const $parentStep = $container.closest('[data-civ-step]');
    if ($parentStep.length) {
      section.step = parseInt($parentStep.attr('data-civ-step')!, 10);
    }

    let searchRoot;
    if (isTable) {
      // For table layout, extract from the first row only
      searchRoot = $container.find('tbody tr[data-civ-repeatable-item]').first();
    } else {
      searchRoot = $innerFieldset.length ? $innerFieldset : $container;
    }
    if (searchRoot.length) {
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
    }

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

    // Detect section visibleWhen
    const fieldsetShowWhen = $fieldset.attr('data-civ-show-when');
    if (fieldsetShowWhen) {
      const cond = parseConditionAttr(fieldsetShowWhen);
      if (cond) section.visibleWhen = cond;
    }

    // Detect step assignment
    const $parentStep = $fieldset.closest('[data-civ-step]');
    if ($parentStep.length) {
      section.step = parseInt($parentStep.attr('data-civ-step')!, 10);
    }

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

  // Process sections inside step containers that have data-civ-show-when wrappers (non-fieldset divs)
  $('[data-civ-step] > div[data-civ-show-when], div[data-civ-show-when]').each((_, wrapperEl) => {
    const $wrapper = $(wrapperEl);
    // Skip repeatable containers and fieldsets — already handled
    if ($wrapper.attr('data-civ-repeatable') !== undefined) return;
    if (processedEls.has(wrapperEl)) return;

    const section: FormSection = {
      fields: [],
    };

    const showWhen = $wrapper.attr('data-civ-show-when');
    if (showWhen) {
      const cond = parseConditionAttr(showWhen);
      if (cond) section.visibleWhen = cond;
    }

    const $parentStep = $wrapper.closest('[data-civ-step]');
    if ($parentStep.length) {
      section.step = parseInt($parentStep.attr('data-civ-step')!, 10);
    }

    $wrapper.find(FORM_SELECTOR).each((_, el) => {
      if (processedEls.has(el)) return;
      const $el = $(el);
      if ($el.parents('civ-radio-group, civ-checkbox-group, civ-segmented-control').length > 0) return;
      if ($el.parents('[data-civ-repeatable]').length > 0) return;

      const field = extractField($, el);
      if (field) {
        section.fields.push(field);
        processedEls.add(el);
      }
    });

    if (section.fields.length > 0) {
      schema.sections.push(section);
    }
    processedEls.add(wrapperEl);
  });

  // Process remaining non-fieldset components (including inside step containers)
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
      // Detect step assignment for remaining fields
      const $parentStep = $el.closest('[data-civ-step]');
      if ($parentStep.length && schema.steps) {
        const stepNum = parseInt($parentStep.attr('data-civ-step')!, 10);
        // Create a per-step section for remaining fields
        let stepSection = schema.sections.find((s) => s.step === stepNum && !s.heading && !s.repeatable && !s.visibleWhen);
        if (!stepSection) {
          stepSection = { fields: [], step: stepNum };
          schema.sections.push(stepSection);
        }
        stepSection.fields.push(field);
      } else {
        remainingSection.fields.push(field);
      }
    }
  });

  if (remainingSection.fields.length > 0) {
    schema.sections.push(remainingSection);
  }

  return schema;
}
