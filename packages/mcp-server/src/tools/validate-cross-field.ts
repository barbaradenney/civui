/**
 * validate_cross_field tool — evaluate cross-field rules and conditional
 * requirements against field values.
 */
import type { FormSchema, ConditionExpression } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';

export interface CrossFieldError {
  ruleId: string;
  field: string;
  message: string;
}

export interface FiredRule {
  ruleId: string;
  description: string;
  action: string;
  targets: string[];
}

export interface CrossFieldResult {
  firedRules: FiredRule[];
  conditionallyRequired: string[];
  conditionallyVisible: string[];
  conditionallyHidden: string[];
  errors: CrossFieldError[];
}

type Values = Record<string, string | string[]>;

/** Resolve a field name against values, supporting wildcard matching for repeatable fields. */
function getFieldValue(values: Values, field: string): string | string[] | undefined {
  // Direct match first
  if (field in values) return values[field];

  // Check for repeatable wildcard: dependents[*].name matches dependents[0].name
  if (field.includes('[*]')) {
    const pattern = field.replace(/\[\*\]/g, '\\[\\d+\\]');
    const regex = new RegExp(`^${pattern}$`);
    for (const key of Object.keys(values)) {
      if (regex.test(key)) return values[key];
    }
  }

  return undefined;
}

function evaluateSimpleCondition(cond: { field: string; operator: string; value?: string | string[] }, values: Values): boolean {
  const raw = getFieldValue(values, cond.field);
  const val = Array.isArray(raw) ? raw : (raw !== undefined ? String(raw) : undefined);

  switch (cond.operator) {
    case 'eq':
      return val === cond.value;
    case 'neq':
      return val !== cond.value;
    case 'in': {
      const allowed = Array.isArray(cond.value) ? cond.value : [cond.value ?? ''];
      if (Array.isArray(val)) return val.some((v) => allowed.includes(v));
      return allowed.includes(val ?? '');
    }
    case 'notIn': {
      const blocked = Array.isArray(cond.value) ? cond.value : [cond.value ?? ''];
      if (Array.isArray(val)) return !val.some((v) => blocked.includes(v));
      return !blocked.includes(val ?? '');
    }
    case 'exists':
      return val !== undefined && val !== null && val !== '';
    case 'notExists':
      return val === undefined || val === null || val === '';
    default:
      return false;
  }
}

function evaluateCondition(cond: ConditionExpression, values: Values): boolean {
  if (isSimpleCondition(cond)) {
    return evaluateSimpleCondition(cond, values);
  }

  // Compound condition
  if (cond.allOf) {
    return cond.allOf.every((c) => evaluateCondition(c, values));
  }
  if (cond.anyOf) {
    return cond.anyOf.some((c) => evaluateCondition(c, values));
  }

  return false;
}

/**
 * Evaluate cross-field rules and conditional requirements.
 */
export function validateCrossField(
  schema: FormSchema,
  values: Values,
): CrossFieldResult {
  const firedRules: FiredRule[] = [];
  const conditionallyRequired: string[] = [];
  const conditionallyVisible: string[] = [];
  const conditionallyHidden: string[] = [];
  const errors: CrossFieldError[] = [];

  // Evaluate crossFieldRules
  if (schema.crossFieldRules) {
    for (const rule of schema.crossFieldRules) {
      if (evaluateCondition(rule.when, values)) {
        firedRules.push({
          ruleId: rule.id,
          description: rule.description,
          action: rule.then.action,
          targets: rule.then.targets,
        });

        switch (rule.then.action) {
          case 'require':
            for (const target of rule.then.targets) {
              conditionallyRequired.push(target);
              const targetVal = getFieldValue(values, target);
              if (targetVal === undefined || targetVal === '' || (Array.isArray(targetVal) && targetVal.length === 0)) {
                errors.push({
                  ruleId: rule.id,
                  field: target,
                  message: rule.then.message ?? `${target} is required`,
                });
              }
            }
            break;
          case 'show':
            conditionallyVisible.push(...rule.then.targets);
            break;
          case 'hide':
            conditionallyHidden.push(...rule.then.targets);
            break;
          case 'setError':
            for (const target of rule.then.targets) {
              errors.push({
                ruleId: rule.id,
                field: target,
                message: rule.then.message ?? `Validation error on ${target}`,
              });
            }
            break;
        }
      }
    }
  }

  // Evaluate per-field requiredWhen and visibleWhen
  for (const section of schema.sections) {
    // Evaluate section-level visibleWhen
    if (section.visibleWhen) {
      if (!evaluateCondition(section.visibleWhen, values)) {
        // Section is hidden — add all section fields to conditionallyHidden
        for (const field of section.fields) {
          conditionallyHidden.push(field.name);
        }
        continue; // Skip per-field evaluation for hidden sections
      }
    }

    for (const field of section.fields) {
      if (field.requiredWhen && evaluateCondition(field.requiredWhen, values)) {
        conditionallyRequired.push(field.name);
        const fieldVal = getFieldValue(values, field.name);
        if (fieldVal === undefined || fieldVal === '' || (Array.isArray(fieldVal) && fieldVal.length === 0)) {
          errors.push({
            ruleId: `requiredWhen:${field.name}`,
            field: field.name,
            message: `${field.label} is required`,
          });
        }
      }

      // Evaluate visibleWhen to determine visibility state
      if (field.visibleWhen) {
        if (evaluateCondition(field.visibleWhen, values)) {
          conditionallyVisible.push(field.name);
        } else {
          conditionallyHidden.push(field.name);
        }
      }
    }
  }

  return {
    firedRules,
    conditionallyRequired,
    conditionallyVisible,
    conditionallyHidden,
    errors,
  };
}
