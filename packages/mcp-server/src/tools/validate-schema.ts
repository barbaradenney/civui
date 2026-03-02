/**
 * validate_schema tool — validate a FormSchema for internal consistency,
 * detecting dangling references, missing options, invalid ranges, etc.
 */
import type { FormSchema, ConditionExpression } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';
import { collectFields } from './html-utils.js';

export interface SchemaError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidateSchemaResult {
  valid: boolean;
  errors: SchemaError[];
  warnings: SchemaError[];
  fieldCount: number;
  sectionCount: number;
}

/** Collect all field names referenced in a ConditionExpression. */
function conditionFields(cond: ConditionExpression): string[] {
  if (isSimpleCondition(cond)) {
    return [cond.field];
  }
  const names: string[] = [];
  if (cond.allOf) {
    for (const c of cond.allOf) names.push(...conditionFields(c));
  }
  if (cond.anyOf) {
    for (const c of cond.anyOf) names.push(...conditionFields(c));
  }
  return names;
}

/**
 * Validate a FormSchema for internal consistency.
 */
export function validateSchema(schema: FormSchema): ValidateSchemaResult {
  const issues: SchemaError[] = [];
  const allFields = collectFields(schema);
  const fieldNames = new Set(allFields.map((f) => f.name));

  // --- 1. Duplicate field names ---
  const seen = new Map<string, string>();
  for (let si = 0; si < schema.sections.length; si++) {
    const section = schema.sections[si];
    const checkField = (field: { name: string }, fi: number, parent?: string) => {
      const path = parent ?? `sections[${si}].fields[${fi}]`;
      const prev = seen.get(field.name);
      if (prev) {
        issues.push({
          path,
          message: `Duplicate field name "${field.name}" (first at ${prev})`,
          severity: 'error',
        });
      } else {
        seen.set(field.name, path);
      }
    };
    for (let fi = 0; fi < section.fields.length; fi++) {
      const field = section.fields[fi];
      checkField(field, fi);
      if (field.children) {
        for (let ci = 0; ci < field.children.length; ci++) {
          checkField(
            field.children[ci],
            fi,
            `sections[${si}].fields[${fi}].children[${ci}]`,
          );
        }
      }
    }
  }

  // --- Checks 2–7: walk all fields including children ---
  const choiceTypes = new Set(['select', 'radio', 'combobox', 'checkbox-group']);

  for (let si = 0; si < schema.sections.length; si++) {
    const section = schema.sections[si];

    // 6. Section visibleWhen references unknown field
    if (section.visibleWhen) {
      for (const ref of conditionFields(section.visibleWhen)) {
        if (!fieldNames.has(ref)) {
          issues.push({
            path: `sections[${si}].visibleWhen`,
            message: `Section visibleWhen references unknown field "${ref}"`,
            severity: 'error',
          });
        }
      }
    }

    const checkFieldIssues = (field: typeof section.fields[number], path: string) => {
      // 2. Missing options for choice fields
      if (
        choiceTypes.has(field.type) &&
        (!field.options || field.options.length === 0) &&
        !field.optionsFrom
      ) {
        issues.push({
          path,
          message: `Field "${field.name}" (${field.type}) requires options or optionsFrom`,
          severity: 'error',
        });
      }

      // 3. Number field min > max
      if (
        field.type === 'number' &&
        field.min !== undefined &&
        field.max !== undefined
      ) {
        const minVal = Number(field.min);
        const maxVal = Number(field.max);
        if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
          issues.push({
            path,
            message: `Field "${field.name}" has min (${field.min}) > max (${field.max})`,
            severity: 'error',
          });
        }
      }

      // 4. visibleWhen references unknown field
      if (field.visibleWhen) {
        for (const ref of conditionFields(field.visibleWhen)) {
          if (!fieldNames.has(ref)) {
            issues.push({
              path: `${path}.visibleWhen`,
              message: `visibleWhen references unknown field "${ref}"`,
              severity: 'error',
            });
          }
        }
      }

      // 5. requiredWhen references unknown field
      if (field.requiredWhen) {
        for (const ref of conditionFields(field.requiredWhen)) {
          if (!fieldNames.has(ref)) {
            issues.push({
              path: `${path}.requiredWhen`,
              message: `requiredWhen references unknown field "${ref}"`,
              severity: 'error',
            });
          }
        }
      }

      // 7. optionsFrom.field references unknown field
      if (field.optionsFrom && !fieldNames.has(field.optionsFrom.field)) {
        issues.push({
          path: `${path}.optionsFrom`,
          message: `optionsFrom references unknown field "${field.optionsFrom.field}"`,
          severity: 'error',
        });
      }
    };

    for (let fi = 0; fi < section.fields.length; fi++) {
      const field = section.fields[fi];
      checkFieldIssues(field, `sections[${si}].fields[${fi}]`);
      if (field.children) {
        for (let ci = 0; ci < field.children.length; ci++) {
          checkFieldIssues(field.children[ci], `sections[${si}].fields[${fi}].children[${ci}]`);
        }
      }
    }
  }

  // --- 8 & 9. crossFieldRules references ---
  if (schema.crossFieldRules) {
    for (let ri = 0; ri < schema.crossFieldRules.length; ri++) {
      const rule = schema.crossFieldRules[ri];
      // Check condition references
      for (const ref of conditionFields(rule.when)) {
        if (!fieldNames.has(ref)) {
          issues.push({
            path: `crossFieldRules[${ri}].when`,
            message: `Cross-field rule "${rule.id}" condition references unknown field "${ref}"`,
            severity: 'error',
          });
        }
      }
      // Check target references
      for (const target of rule.then.targets) {
        if (!fieldNames.has(target)) {
          issues.push({
            path: `crossFieldRules[${ri}].then.targets`,
            message: `Cross-field rule "${rule.id}" targets unknown field "${target}"`,
            severity: 'error',
          });
        }
      }
    }
  }

  // --- 10. Wizard steps mismatch ---
  if (schema.steps) {
    const distinctStepValues = new Set(
      schema.sections.map((s) => s.step).filter((s) => s !== undefined),
    );
    if (schema.steps.length !== distinctStepValues.size) {
      issues.push({
        path: 'steps',
        message: `steps.length (${schema.steps.length}) does not match distinct section step values (${distinctStepValues.size})`,
        severity: 'warning',
      });
    }
  }

  // --- 11. Workflow transition references unknown state/actor ---
  if (schema.workflow) {
    const stateIds = new Set(schema.workflow.states.map((s) => s.id));
    const actorIds = new Set((schema.actors ?? []).map((a) => a.id));
    for (let ti = 0; ti < schema.workflow.transitions.length; ti++) {
      const t = schema.workflow.transitions[ti];
      if (!stateIds.has(t.from)) {
        issues.push({
          path: `workflow.transitions[${ti}]`,
          message: `Transition references unknown state "${t.from}"`,
          severity: 'error',
        });
      }
      if (!stateIds.has(t.to)) {
        issues.push({
          path: `workflow.transitions[${ti}]`,
          message: `Transition references unknown state "${t.to}"`,
          severity: 'error',
        });
      }
      if (!actorIds.has(t.actor)) {
        issues.push({
          path: `workflow.transitions[${ti}]`,
          message: `Transition references unknown actor "${t.actor}"`,
          severity: 'error',
        });
      }
    }
  }

  // --- 12. formChain dependsOn references unknown schemaRef ---
  if (schema.formChain) {
    const schemaRefs = new Set(schema.formChain.forms.map((f) => f.schemaRef));
    for (let fi = 0; fi < schema.formChain.forms.length; fi++) {
      const form = schema.formChain.forms[fi];
      if (form.dependsOn) {
        for (const dep of form.dependsOn) {
          if (!schemaRefs.has(dep)) {
            issues.push({
              path: `formChain.forms[${fi}].dependsOn`,
              message: `Form "${form.schemaRef}" dependsOn unknown schemaRef "${dep}"`,
              severity: 'error',
            });
          }
        }
      }
    }
  }

  // --- 13. dataTable showTotals references non-numeric column ---
  if (schema.dataTable && schema.dataTable.showTotals) {
    const numericColumns = new Set(
      schema.dataTable.columns
        .filter((c) => c.type === 'number' || c.type === 'currency')
        .map((c) => c.id),
    );
    for (const colId of schema.dataTable.showTotals) {
      if (!numericColumns.has(colId)) {
        issues.push({
          path: 'dataTable.showTotals',
          message: `showTotals references non-numeric column "${colId}"`,
          severity: 'error',
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fieldCount: allFields.length,
    sectionCount: schema.sections.length,
  };
}
