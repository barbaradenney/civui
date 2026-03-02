/**
 * inline_sub_forms tool — flatten subForm refs into a single merged schema
 * with no subForms or ref sections remaining.
 */
import type { FormSchema, FormSection, CrossFieldRule } from '../schema/index.js';
import { prefixFields, prefixCondition } from './compose-forms.js';

export interface InlineSubFormsResult {
  schema: FormSchema;
  inlinedCount: number;
  namespacedFields: string[];
  warnings: string[];
}

/**
 * Inline all subForm refs in a schema, producing a flat schema with no
 * subForms or ref sections.
 */
export function inlineSubForms(schema: FormSchema): InlineSubFormsResult {
  // No subForms at all → passthrough
  if (!schema.subForms || Object.keys(schema.subForms).length === 0) {
    const hasRefs = schema.sections.some((s) => s.ref);
    const warnings: string[] = [];
    if (hasRefs) {
      for (const section of schema.sections) {
        if (section.ref) {
          warnings.push(`Section references subForm "${section.ref}" but no subForms are defined`);
        }
      }
    }
    return {
      schema: { ...schema, subForms: undefined },
      inlinedCount: 0,
      namespacedFields: [],
      warnings,
    };
  }

  const resolvedSections: FormSection[] = [];
  const namespacedFields: string[] = [];
  const warnings: string[] = [];
  let inlinedCount = 0;
  const allRules: CrossFieldRule[] = [...(schema.crossFieldRules ?? [])];

  for (const section of schema.sections) {
    if (!section.ref) {
      resolvedSections.push(section);
      continue;
    }

    const subForm = schema.subForms[section.ref];
    if (!subForm) {
      warnings.push(`Section references unknown subForm "${section.ref}"`);
      resolvedSections.push(section);
      continue;
    }

    const ns = section.namespace ?? section.ref;
    const prefixed = prefixFields(subForm.fields, ns);

    // Track namespaced field names
    for (const f of prefixed) {
      namespacedFields.push(f.name);
      if (f.children) {
        for (const c of f.children) {
          namespacedFields.push(c.name);
        }
      }
    }

    resolvedSections.push({
      ...section,
      heading: section.heading ?? subForm.description,
      fields: prefixed,
      visibleWhen: section.visibleWhen
        ? prefixCondition(section.visibleWhen, ns)
        : undefined,
      ref: undefined,
      namespace: undefined,
    });

    inlinedCount++;
  }

  // Prefix cross-field rules that reference subForm fields
  // (rules already on the schema stay as-is; we only need to handle
  //  rules that might be within subForm definitions, but the schema
  //  type doesn't store those — so we just keep existing rules)

  const mergedSchema: FormSchema = {
    ...schema,
    sections: resolvedSections,
    crossFieldRules: allRules.length > 0 ? allRules : undefined,
    subForms: undefined,
  };

  return {
    schema: mergedSchema,
    inlinedCount,
    namespacedFields,
    warnings,
  };
}
