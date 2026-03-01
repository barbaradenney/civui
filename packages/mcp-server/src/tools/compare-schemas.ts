/**
 * compare_schemas tool — structured diff between two FormSchema versions.
 * Detects added, removed, changed, and moved fields/sections/steps/rules,
 * plus breaking change detection.
 */
import type { FormSchema, FormField, FormSection, CrossFieldRule } from '../schema/index.js';

export interface SchemaChange {
  type: 'field' | 'section' | 'step' | 'rule';
  name: string;
  section?: string;
  details: Record<string, unknown>;
}

export interface CompareResult {
  added: SchemaChange[];
  removed: SchemaChange[];
  changed: SchemaChange[];
  moved: SchemaChange[];
  summary: string;
  breakingChanges: string[];
}

interface FieldInfo {
  field: FormField;
  sectionIndex: number;
  sectionHeading?: string;
}

/** Build a map of field name → field info. */
function buildFieldMap(schema: FormSchema): Map<string, FieldInfo> {
  const map = new Map<string, FieldInfo>();
  for (let i = 0; i < schema.sections.length; i++) {
    const section = schema.sections[i];
    for (const field of section.fields) {
      map.set(field.name, {
        field,
        sectionIndex: i,
        sectionHeading: section.heading,
      });
      if (field.children) {
        for (const child of field.children) {
          map.set(child.name, { field: child, sectionIndex: i, sectionHeading: section.heading });
        }
      }
    }
  }
  return map;
}

/** Properties to compare on fields. */
const FIELD_PROPS: (keyof FormField)[] = [
  'type', 'required', 'label', 'hint', 'pattern', 'min', 'max',
  'minlength', 'maxlength', 'placeholder', 'accept', 'maxFiles', 'maxSize', 'disabled',
];

/** Compare two field options arrays. */
function optionsChanged(a?: FormField['options'], b?: FormField['options']): boolean {
  if (!a && !b) return false;
  if (!a || !b) return true;
  if (a.length !== b.length) return true;
  return a.some((opt, i) => opt.value !== b[i].value || opt.label !== b[i].label);
}

/** Compare two sections' structural properties. */
function sectionPropsChanged(a: FormSection, b: FormSection): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  if (a.heading !== b.heading) changes.heading = { before: a.heading, after: b.heading };
  if (!!a.repeatable !== !!b.repeatable) changes.repeatable = { before: !!a.repeatable, after: !!b.repeatable };
  if (a.repeatableKey !== b.repeatableKey) changes.repeatableKey = { before: a.repeatableKey, after: b.repeatableKey };
  if (a.layout !== b.layout) changes.layout = { before: a.layout, after: b.layout };
  if (a.step !== b.step) changes.step = { before: a.step, after: b.step };
  if (a.namespace !== b.namespace) changes.namespace = { before: a.namespace, after: b.namespace };
  return changes;
}

/**
 * Compare two FormSchema versions and produce a structured diff.
 */
export function compareSchemas(before: FormSchema, after: FormSchema): CompareResult {
  const added: SchemaChange[] = [];
  const removed: SchemaChange[] = [];
  const changed: SchemaChange[] = [];
  const moved: SchemaChange[] = [];
  const breakingChanges: string[] = [];

  const beforeMap = buildFieldMap(before);
  const afterMap = buildFieldMap(after);

  // Field comparisons
  for (const [name, afterInfo] of afterMap) {
    if (!beforeMap.has(name)) {
      added.push({
        type: 'field',
        name,
        section: afterInfo.sectionHeading,
        details: { fieldType: afterInfo.field.type },
      });
    }
  }

  for (const [name, beforeInfo] of beforeMap) {
    if (!afterMap.has(name)) {
      removed.push({
        type: 'field',
        name,
        section: beforeInfo.sectionHeading,
        details: { fieldType: beforeInfo.field.type },
      });
      if (beforeInfo.field.required) {
        breakingChanges.push(`Required field "${name}" was removed`);
      }
      continue;
    }

    const afterInfo = afterMap.get(name)!;
    const fieldChanges: Record<string, unknown> = {};

    // Check property changes
    for (const prop of FIELD_PROPS) {
      const bVal = beforeInfo.field[prop];
      const aVal = afterInfo.field[prop];
      if (bVal !== aVal) {
        fieldChanges[prop] = { before: bVal, after: aVal };
      }
    }

    // Check options
    if (optionsChanged(beforeInfo.field.options, afterInfo.field.options)) {
      fieldChanges.options = {
        before: beforeInfo.field.options?.map((o) => o.value),
        after: afterInfo.field.options?.map((o) => o.value),
      };

      // Breaking: option value removed
      if (beforeInfo.field.options) {
        const afterValues = new Set(afterInfo.field.options?.map((o) => o.value) ?? []);
        for (const opt of beforeInfo.field.options) {
          if (!afterValues.has(opt.value)) {
            breakingChanges.push(`Option "${opt.value}" removed from "${name}"`);
          }
        }
      }
    }

    // Check visibleWhen
    const bvw = JSON.stringify(beforeInfo.field.visibleWhen ?? null);
    const avw = JSON.stringify(afterInfo.field.visibleWhen ?? null);
    if (bvw !== avw) {
      fieldChanges.visibleWhen = { before: beforeInfo.field.visibleWhen, after: afterInfo.field.visibleWhen };
    }

    // Check requiredWhen
    const brw = JSON.stringify(beforeInfo.field.requiredWhen ?? null);
    const arw = JSON.stringify(afterInfo.field.requiredWhen ?? null);
    if (brw !== arw) {
      fieldChanges.requiredWhen = { before: beforeInfo.field.requiredWhen, after: afterInfo.field.requiredWhen };
    }

    if (Object.keys(fieldChanges).length > 0) {
      changed.push({
        type: 'field',
        name,
        section: afterInfo.sectionHeading,
        details: fieldChanges,
      });

      // Breaking: type changed
      if (fieldChanges.type) {
        breakingChanges.push(
          `Field "${name}" type changed from "${(fieldChanges.type as Record<string, unknown>).before}" to "${(fieldChanges.type as Record<string, unknown>).after}"`,
        );
      }
    }

    // Check moved
    if (beforeInfo.sectionIndex !== afterInfo.sectionIndex) {
      moved.push({
        type: 'field',
        name,
        details: {
          fromSection: beforeInfo.sectionHeading ?? `Section ${beforeInfo.sectionIndex}`,
          toSection: afterInfo.sectionHeading ?? `Section ${afterInfo.sectionIndex}`,
        },
      });
    }
  }

  // Section comparisons
  const maxSections = Math.max(before.sections.length, after.sections.length);
  for (let i = 0; i < maxSections; i++) {
    const bSection = before.sections[i];
    const aSection = after.sections[i];

    if (!bSection && aSection) {
      added.push({
        type: 'section',
        name: aSection.heading ?? `Section ${i}`,
        details: { index: i },
      });
    } else if (bSection && !aSection) {
      removed.push({
        type: 'section',
        name: bSection.heading ?? `Section ${i}`,
        details: { index: i },
      });
      breakingChanges.push(`Section "${bSection.heading ?? `Section ${i}`}" was removed`);
    } else if (bSection && aSection) {
      const sectionChanges = sectionPropsChanged(bSection, aSection);
      if (Object.keys(sectionChanges).length > 0) {
        changed.push({
          type: 'section',
          name: aSection.heading ?? bSection.heading ?? `Section ${i}`,
          details: sectionChanges,
        });

        // Breaking: repeatable → non-repeatable
        if (sectionChanges.repeatable) {
          const change = sectionChanges.repeatable as { before: boolean; after: boolean };
          if (change.before && !change.after) {
            breakingChanges.push(`Section "${bSection.heading ?? `Section ${i}`}" changed from repeatable to non-repeatable`);
          }
        }
      }
    }
  }

  // Step comparisons
  const beforeSteps = before.steps ?? [];
  const afterSteps = after.steps ?? [];
  const maxSteps = Math.max(beforeSteps.length, afterSteps.length);
  for (let i = 0; i < maxSteps; i++) {
    const bStep = beforeSteps[i];
    const aStep = afterSteps[i];
    if (!bStep && aStep) {
      added.push({ type: 'step', name: aStep.title, details: { index: i } });
    } else if (bStep && !aStep) {
      removed.push({ type: 'step', name: bStep.title, details: { index: i } });
    } else if (bStep && aStep && (bStep.title !== aStep.title || bStep.description !== aStep.description)) {
      changed.push({
        type: 'step',
        name: aStep.title,
        details: {
          title: bStep.title !== aStep.title ? { before: bStep.title, after: aStep.title } : undefined,
          description: bStep.description !== aStep.description ? { before: bStep.description, after: aStep.description } : undefined,
        },
      });
    }
  }

  // Rule comparisons
  const beforeRules = new Map<string, CrossFieldRule>();
  const afterRules = new Map<string, CrossFieldRule>();
  for (const rule of before.crossFieldRules ?? []) beforeRules.set(rule.id, rule);
  for (const rule of after.crossFieldRules ?? []) afterRules.set(rule.id, rule);

  for (const [id, rule] of afterRules) {
    if (!beforeRules.has(id)) {
      added.push({ type: 'rule', name: id, details: { description: rule.description } });
    }
  }
  for (const [id, rule] of beforeRules) {
    if (!afterRules.has(id)) {
      removed.push({ type: 'rule', name: id, details: { description: rule.description } });
    } else {
      const aRule = afterRules.get(id)!;
      if (JSON.stringify(rule) !== JSON.stringify(aRule)) {
        changed.push({ type: 'rule', name: id, details: { before: rule, after: aRule } });
      }
    }
  }

  // Summary
  const parts: string[] = [];
  if (added.length > 0) parts.push(`${added.length} added`);
  if (removed.length > 0) parts.push(`${removed.length} removed`);
  if (changed.length > 0) parts.push(`${changed.length} changed`);
  if (moved.length > 0) parts.push(`${moved.length} moved`);
  if (breakingChanges.length > 0) parts.push(`${breakingChanges.length} breaking`);
  const summary = parts.length > 0
    ? `Schema diff: ${parts.join(', ')}.`
    : 'Schemas are identical.';

  return { added, removed, changed, moved, summary, breakingChanges };
}
