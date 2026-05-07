/**
 * Schema Validator
 *
 * Validates CivUI component schemas for correctness before code generation.
 * Catches common mistakes: missing required fields, invalid prop types,
 * misconfigured render order, and inconsistent form behavior.
 */

import {
  COMPONENT_BASE_CLASSES,
  COMPONENT_CATEGORIES,
  FORM_VALUE_MODES,
  PROP_TYPES,
  RENDER_ELEMENT_TYPES,
  type ComponentSchema,
  type FormValueMode,
  type PropType,
} from './schema.types.js';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

// All accepted-value lists are imported from schema.types.ts so the runtime
// validator and the compile-time TS unions cannot drift. Adding a new
// category, render type, etc. requires touching exactly one file.
const VALID_PROP_TYPES: readonly PropType[] = PROP_TYPES;
const VALID_VALUE_MODES: readonly FormValueMode[] = FORM_VALUE_MODES;
const VALID_RENDER_TYPES: readonly string[] = RENDER_ELEMENT_TYPES;
const VALID_CATEGORIES: readonly string[] = COMPONENT_CATEGORIES;
const VALID_BASE_CLASSES: readonly string[] = COMPONENT_BASE_CLASSES;

export function validateSchema(schema: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!schema || typeof schema !== 'object') {
    errors.push({ path: '', message: 'Schema must be a non-null object', severity: 'error' });
    return errors;
  }

  const s = schema as Record<string, unknown>;

  // Required top-level fields
  validateRequired(s, 'name', 'string', errors);
  validateRequired(s, 'description', 'string', errors);
  validateRequired(s, '$schema', 'string', errors);
  validateRequired(s, 'category', 'string', errors);
  validateRequired(s, 'extends', 'string', errors);

  if (typeof s['name'] === 'string' && !s['name'].startsWith('civ-')) {
    errors.push({ path: 'name', message: `Component name must start with "civ-", got "${s['name']}"`, severity: 'error' });
  }

  if (typeof s['category'] === 'string' && !VALID_CATEGORIES.includes(s['category'])) {
    errors.push({ path: 'category', message: `Invalid category "${s['category']}". Must be one of: ${VALID_CATEGORIES.join(', ')}`, severity: 'error' });
  }

  if (typeof s['extends'] === 'string' && !VALID_BASE_CLASSES.includes(s['extends'])) {
    errors.push({ path: 'extends', message: `Invalid base class "${s['extends']}". Must be one of: ${VALID_BASE_CLASSES.join(', ')}`, severity: 'error' });
  }

  if (typeof s['isGroup'] !== 'boolean') {
    errors.push({ path: 'isGroup', message: 'isGroup must be a boolean', severity: 'error' });
  }

  // Props validation
  if (s['props'] && typeof s['props'] === 'object') {
    validateProps(s['props'] as Record<string, unknown>, errors);
  } else {
    errors.push({ path: 'props', message: 'props must be an object', severity: 'error' });
  }

  // Events validation
  if (s['events'] && typeof s['events'] === 'object') {
    validateEvents(s['events'] as Record<string, unknown>, errors);
  } else {
    errors.push({ path: 'events', message: 'events must be an object', severity: 'error' });
  }

  // A11y validation
  if (s['a11y'] && typeof s['a11y'] === 'object') {
    validateA11y(s['a11y'] as Record<string, unknown>, errors);
  } else {
    errors.push({ path: 'a11y', message: 'a11y must be an object', severity: 'error' });
  }

  // RenderOrder validation
  if (Array.isArray(s['renderOrder'])) {
    validateRenderOrder(s['renderOrder'] as unknown[], s['props'] as Record<string, unknown>, errors);
  } else {
    errors.push({ path: 'renderOrder', message: 'renderOrder must be an array', severity: 'error' });
  }

  // Form validation
  if (s['form'] && typeof s['form'] === 'object') {
    validateForm(s['form'] as Record<string, unknown>, s as unknown as ComponentSchema, errors);
  } else {
    errors.push({ path: 'form', message: 'form must be an object', severity: 'error' });
  }

  // Note: a previous "isGroup components should have a `legend` prop" check
  // was removed. CivUI's composition pattern wraps groups in
  // `civ-form-fieldset`, which owns the legend — the group component itself
  // doesn't carry the `legend` prop. The check produced false positives on
  // every covered group component (memorable-date, filter-chip-group, ...).

  // Widths validation
  if (s['widths'] !== undefined) {
    validateWidths(s['widths'] as Record<string, unknown>, errors);
  }

  return errors;
}

function validateRequired(obj: Record<string, unknown>, field: string, type: string, errors: ValidationError[]): void {
  if (obj[field] === undefined) {
    errors.push({ path: field, message: `Required field "${field}" is missing`, severity: 'error' });
  } else if (typeof obj[field] !== type) {
    errors.push({ path: field, message: `"${field}" must be a ${type}, got ${typeof obj[field]}`, severity: 'error' });
  }
}

function validateProps(props: Record<string, unknown>, errors: ValidationError[]): void {
  for (const [name, propRaw] of Object.entries(props)) {
    const path = `props.${name}`;

    if (!propRaw || typeof propRaw !== 'object') {
      errors.push({ path, message: 'Prop definition must be an object', severity: 'error' });
      continue;
    }

    const prop = propRaw as Record<string, unknown>;

    if (!prop['type'] || !VALID_PROP_TYPES.includes(prop['type'] as PropType)) {
      errors.push({ path: `${path}.type`, message: `Invalid prop type "${prop['type']}". Must be one of: ${VALID_PROP_TYPES.join(', ')}`, severity: 'error' });
    }

    if (!prop['description'] || typeof prop['description'] !== 'string') {
      errors.push({ path: `${path}.description`, message: 'Prop must have a string description', severity: 'warning' });
    }

    // Enum must have values
    if (prop['type'] === 'enum') {
      if (!Array.isArray(prop['values']) || prop['values'].length === 0) {
        errors.push({ path: `${path}.values`, message: 'Enum props must have a non-empty "values" array', severity: 'error' });
      }
      if (prop['default'] !== undefined && Array.isArray(prop['values']) && !prop['values'].includes(prop['default'])) {
        errors.push({ path: `${path}.default`, message: `Default value "${prop['default']}" is not in the values array`, severity: 'error' });
      }
    }

    // Array must have items — but webOnly arrays are JS-only (e.g. typed
    // sections / values arrays passed via property, not HTML attribute), so
    // there's no cross-platform items shape to declare.
    if (prop['type'] === 'array' && !prop['items'] && !prop['webOnly']) {
      errors.push({ path: `${path}.items`, message: 'Array props should have an "items" definition', severity: 'warning' });
    }

    // Reflect must be boolean
    if (prop['reflect'] !== undefined && typeof prop['reflect'] !== 'boolean') {
      errors.push({ path: `${path}.reflect`, message: 'reflect must be a boolean', severity: 'error' });
    }
  }
}

function validateEvents(events: Record<string, unknown>, errors: ValidationError[]): void {
  for (const [name, eventRaw] of Object.entries(events)) {
    const path = `events.${name}`;

    if (!name.startsWith('civ-')) {
      errors.push({ path, message: `Event name "${name}" should start with "civ-"`, severity: 'warning' });
    }

    if (!eventRaw || typeof eventRaw !== 'object') {
      errors.push({ path, message: 'Event definition must be an object', severity: 'error' });
      continue;
    }

    const event = eventRaw as Record<string, unknown>;

    if (!event['description'] || typeof event['description'] !== 'string') {
      errors.push({ path: `${path}.description`, message: 'Event must have a string description', severity: 'warning' });
    }

    if (!event['detail'] || typeof event['detail'] !== 'object') {
      errors.push({ path: `${path}.detail`, message: 'Event must have a detail object', severity: 'error' });
    }
  }
}

function validateA11y(a11y: Record<string, unknown>, errors: ValidationError[]): void {
  if (!a11y['role'] || typeof a11y['role'] !== 'string') {
    errors.push({ path: 'a11y.role', message: 'a11y must have a string role', severity: 'error' });
  }

  const validIndicators = ['asterisk', 'text', 'none'];
  if (a11y['requiredIndicator'] && !validIndicators.includes(a11y['requiredIndicator'] as string)) {
    errors.push({ path: 'a11y.requiredIndicator', message: `Invalid requiredIndicator. Must be one of: ${validIndicators.join(', ')}`, severity: 'error' });
  }

  const validAnnouncements = ['assertive', 'polite', 'none'];
  if (a11y['errorAnnouncement'] && !validAnnouncements.includes(a11y['errorAnnouncement'] as string)) {
    errors.push({ path: 'a11y.errorAnnouncement', message: `Invalid errorAnnouncement. Must be one of: ${validAnnouncements.join(', ')}`, severity: 'error' });
  }
}

function validateRenderOrder(renderOrder: unknown[], props: Record<string, unknown>, errors: ValidationError[]): void {
  if (renderOrder.length === 0) {
    errors.push({ path: 'renderOrder', message: 'renderOrder must have at least one element', severity: 'error' });
    return;
  }

  for (let i = 0; i < renderOrder.length; i++) {
    const el = renderOrder[i] as Record<string, unknown>;
    const path = `renderOrder[${i}]`;

    if (!el['type'] || !VALID_RENDER_TYPES.includes(el['type'] as string)) {
      errors.push({ path: `${path}.type`, message: `Invalid render element type "${el['type']}"`, severity: 'error' });
    }

    // The previous "Binding references unknown prop" check was dropped — it
    // had too many false positives. Schema bindings legitimately reference
    // slot names, ARIA role values, child-component refs (e.g. `street`
    // inside `civ-address`), i18n keys, and inherited form props that are
    // filtered from `props`. The validator can't distinguish those from
    // typos without re-implementing significant schema semantics, and the
    // cost / value didn't justify the noise. The render tree still gets
    // structural validation (element types, children recursion).

    // Validate children recursively
    if (el['children'] && Array.isArray(el['children'])) {
      validateRenderOrder(el['children'] as unknown[], props, errors);
    }
  }
}

function validateForm(form: Record<string, unknown>, schema: ComponentSchema, errors: ValidationError[]): void {
  if (!form['valueMode'] || !VALID_VALUE_MODES.includes(form['valueMode'] as FormValueMode)) {
    errors.push({ path: 'form.valueMode', message: `Invalid valueMode "${form['valueMode']}". Must be one of: ${VALID_VALUE_MODES.join(', ')}`, severity: 'error' });
  }

  if (typeof form['formAssociated'] !== 'boolean') {
    errors.push({ path: 'form.formAssociated', message: 'formAssociated must be a boolean', severity: 'error' });
  }

  // CivBaseElement components shouldn't be formAssociated
  if (schema.extends === 'CivBaseElement' && form['formAssociated'] === true) {
    errors.push({ path: 'form.formAssociated', message: 'Components extending CivBaseElement should not be formAssociated', severity: 'warning' });
  }

  // Boolean valueMode should have a "checked" prop
  if (form['valueMode'] === 'boolean') {
    const props = schema.props;
    if (!props['checked']) {
      errors.push({ path: 'form.valueMode', message: 'Boolean valueMode components should have a "checked" prop', severity: 'warning' });
    }
  }
}

function validateWidths(widths: Record<string, unknown>, errors: ValidationError[]): void {
  for (const [key, widthRaw] of Object.entries(widths)) {
    const path = `widths.${key}`;
    if (!widthRaw || typeof widthRaw !== 'object') {
      errors.push({ path, message: 'Width variant must be an object', severity: 'error' });
      continue;
    }

    const width = widthRaw as Record<string, unknown>;
    if (typeof width['webClass'] !== 'string') {
      errors.push({ path: `${path}.webClass`, message: 'Width must have a string webClass', severity: 'error' });
    }
    if (width['iosPoints'] !== null && typeof width['iosPoints'] !== 'number') {
      errors.push({ path: `${path}.iosPoints`, message: 'iosPoints must be a number or null', severity: 'error' });
    }
    if (width['androidDp'] !== null && typeof width['androidDp'] !== 'number') {
      errors.push({ path: `${path}.androidDp`, message: 'androidDp must be a number or null', severity: 'error' });
    }
  }
}

/**
 * Validate all schemas and return a summary.
 * Throws if any errors are found (warnings are reported but don't throw).
 */
export function validateAll(schemas: ComponentSchema[]): { valid: boolean; errors: ValidationError[]; warnings: ValidationError[] } {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  for (const schema of schemas) {
    const results = validateSchema(schema);
    for (const r of results) {
      const prefixed = { ...r, path: `${schema.name}.${r.path}` };
      if (r.severity === 'error') allErrors.push(prefixed);
      else allWarnings.push(prefixed);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
