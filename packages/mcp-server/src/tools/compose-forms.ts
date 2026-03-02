/**
 * compose_forms tool — merge multiple FormSchemas into one unified schema.
 * Resolves ref sections, applies namespaces, validates no name collisions.
 */
import type { FormSchema, FormSection, FormField, CrossFieldRule, ConditionExpression, CompoundCondition } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';

export interface ComposeResult {
  schema: FormSchema;
  namespaces: string[];
  resolvedRefs: string[];
  fieldCount: number;
}

/** Prefix a field reference in a ConditionExpression with a namespace (recursive). */
export function prefixCondition(cond: ConditionExpression, ns: string): ConditionExpression {
  if (isSimpleCondition(cond)) {
    return { ...cond, field: `${ns}.${cond.field}` };
  }
  const result: CompoundCondition = {};
  if (cond.allOf) {
    result.allOf = cond.allOf.map((c) => prefixCondition(c, ns));
  }
  if (cond.anyOf) {
    result.anyOf = cond.anyOf.map((c) => prefixCondition(c, ns));
  }
  return result;
}

/** Prefix all field names in a section with a namespace. */
export function prefixFields(fields: FormField[], ns: string): FormField[] {
  return fields.map((f) => ({
    ...f,
    name: `${ns}.${f.name}`,
    visibleWhen: f.visibleWhen ? prefixCondition(f.visibleWhen, ns) : undefined,
    requiredWhen: f.requiredWhen ? prefixCondition(f.requiredWhen, ns) : undefined,
    children: f.children
      ? f.children.map((c) => ({ ...c, name: `${ns}.${c.name}` }))
      : undefined,
  }));
}

/** Prefix field references in a CrossFieldRule. */
export function prefixRule(rule: CrossFieldRule, ns: string): CrossFieldRule {
  return {
    ...rule,
    id: `${ns}.${rule.id}`,
    when: prefixCondition(rule.when, ns),
    then: {
      ...rule.then,
      targets: rule.then.targets.map((t) => `${ns}.${t}`),
    },
  };
}

/** Count all fields across sections. */
function countFields(sections: FormSection[]): number {
  let count = 0;
  for (const section of sections) {
    count += section.fields.length;
    for (const field of section.fields) {
      if (field.children) count += field.children.length;
    }
  }
  return count;
}

/** Collect all field names from sections and find duplicates. */
function findDuplicateNames(sections: FormSection[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.name) {
        if (seen.has(field.name)) duplicates.add(field.name);
        seen.add(field.name);
      }
      if (field.children) {
        for (const child of field.children) {
          if (child.name) {
            if (seen.has(child.name)) duplicates.add(child.name);
            seen.add(child.name);
          }
        }
      }
    }
  }
  return Array.from(duplicates);
}

/**
 * Merge multiple FormSchemas into one unified schema.
 *
 * @param primary - The primary schema
 * @param subForms - Additional schemas to merge with namespaces
 */
export function composeForms(
  primary: FormSchema,
  subForms?: Record<string, { schema: FormSchema; namespace: string }>,
): ComposeResult {
  const resolvedSections: FormSection[] = [];
  const namespaces: string[] = [];
  const resolvedRefs: string[] = [];
  const allRules: CrossFieldRule[] = [...(primary.crossFieldRules ?? [])];

  // Resolve ref sections in primary
  for (const section of primary.sections) {
    if (section.ref && primary.subForms?.[section.ref]) {
      const subForm = primary.subForms[section.ref];
      const ns = section.namespace ?? section.ref;
      resolvedRefs.push(section.ref);
      resolvedSections.push({
        ...section,
        fields: prefixFields(subForm.fields, ns),
        visibleWhen: section.visibleWhen ? prefixCondition(section.visibleWhen, ns) : undefined,
        ref: undefined,
      });
    } else {
      resolvedSections.push(section);
    }
  }

  // Merge external schemas
  if (subForms) {
    for (const [, { schema: extSchema, namespace }] of Object.entries(subForms)) {
      namespaces.push(namespace);
      for (const section of extSchema.sections) {
        resolvedSections.push({
          ...section,
          fields: prefixFields(section.fields, namespace),
          visibleWhen: section.visibleWhen ? prefixCondition(section.visibleWhen, namespace) : undefined,
        });
      }
      // Prefix cross-field rules from external schemas
      if (extSchema.crossFieldRules) {
        for (const rule of extSchema.crossFieldRules) {
          allRules.push(prefixRule(rule, namespace));
        }
      }
    }
  }

  // Validate no name collisions
  const duplicates = findDuplicateNames(resolvedSections);
  if (duplicates.length > 0) {
    throw new Error(`Name collision after composition: ${duplicates.join(', ')}`);
  }

  const mergedSchema: FormSchema = {
    ...primary,
    sections: resolvedSections,
    crossFieldRules: allRules.length > 0 ? allRules : undefined,
    subForms: undefined,
  };

  return {
    schema: mergedSchema,
    namespaces,
    resolvedRefs,
    fieldCount: countFields(resolvedSections),
  };
}
