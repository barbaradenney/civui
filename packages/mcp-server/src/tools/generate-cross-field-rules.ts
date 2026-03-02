/**
 * generate_cross_field_rules tool — parse natural-language descriptions
 * into CrossFieldRule[] with field reference validation.
 */
import type { FormSchema, CrossFieldRule, ConditionExpression } from '../schema/index.js';
import { collectFields } from './html-utils.js';

export interface CrossFieldRulesResult {
  rules: CrossFieldRule[];
  ruleCount: number;
  referencedFields: string[];
  unresolvedFields: string[];
}

type Action = 'require' | 'show' | 'hide' | 'setError';

const ACTION_MAP: Record<string, Action> = {
  require: 'require',
  show: 'show',
  hide: 'hide',
  'set error on': 'setError',
  'set error': 'setError',
};

/**
 * Parse a single natural-language description into action, target, and condition parts.
 *
 * Patterns:
 *  - "<action> <target> when <condition>"
 *  - "set error on <target> when <condition>"
 */
function parseDescription(desc: string): {
  action: Action;
  target: string;
  conditionText: string;
} | null {
  const lower = desc.trim().toLowerCase();

  // "set error on <target> when <condition>"
  let m = lower.match(
    /^set\s+error\s+on\s+(\S+)\s+when\s+(.+)$/,
  );
  if (m) {
    return { action: 'setError', target: m[1], conditionText: m[2] };
  }

  // "<action> <target> when <condition>"
  m = lower.match(/^(require|show|hide)\s+(\S+)\s+when\s+(.+)$/);
  if (m) {
    const action = ACTION_MAP[m[1]];
    if (!action) return null;
    return { action, target: m[2], conditionText: m[3] };
  }

  return null;
}

/**
 * Parse a condition text into a ConditionExpression.
 *
 * Handles:
 *  - "<field> is <value>"  → eq
 *  - "<field> is not <value>"  → neq
 *  - "<field> exists"  → exists
 *  - "<field> not exists" / "<field> does not exist"  → notExists
 *  - "<field> is one of <v1>, <v2>, ..."  → in
 *  - compound with " and " / " or "
 */
function parseCondition(text: string): ConditionExpression | null {
  const trimmed = text.trim();

  // Check for compound " and " / " or " (split on top-level connectors only)
  // We split on " and " or " or " that are not inside "one of" lists
  const andParts = splitCompound(trimmed, ' and ');
  if (andParts.length > 1) {
    const conditions = andParts.map((p) => parseCondition(p)).filter(Boolean) as ConditionExpression[];
    if (conditions.length === 0) return null;
    return { allOf: conditions };
  }

  const orParts = splitCompound(trimmed, ' or ');
  if (orParts.length > 1) {
    const conditions = orParts.map((p) => parseCondition(p)).filter(Boolean) as ConditionExpression[];
    if (conditions.length === 0) return null;
    return { anyOf: conditions };
  }

  // "<field> is one of <values>"
  let m = trimmed.match(/^(\S+)\s+is\s+one\s+of\s+(.+)$/i);
  if (m) {
    const field = m[1];
    const values = m[2].split(',').map((v) => v.trim());
    return { field, operator: 'in', value: values };
  }

  // "<field> does not exist"
  m = trimmed.match(/^(\S+)\s+does\s+not\s+exist$/i);
  if (m) {
    return { field: m[1], operator: 'notExists' };
  }

  // "<field> not exists"
  m = trimmed.match(/^(\S+)\s+not\s+exists$/i);
  if (m) {
    return { field: m[1], operator: 'notExists' };
  }

  // "<field> exists"
  m = trimmed.match(/^(\S+)\s+exists$/i);
  if (m) {
    return { field: m[1], operator: 'exists' };
  }

  // "<field> is not <value>"
  m = trimmed.match(/^(\S+)\s+is\s+not\s+(.+)$/i);
  if (m) {
    return { field: m[1], operator: 'neq', value: m[2].trim() };
  }

  // "<field> is <value>"
  m = trimmed.match(/^(\S+)\s+is\s+(.+)$/i);
  if (m) {
    return { field: m[1], operator: 'eq', value: m[2].trim() };
  }

  return null;
}

/** Split text on a connector but not within "one of ..." clauses. */
function splitCompound(text: string, connector: string): string[] {
  // Simple approach: split on connector and check if it creates valid parts
  const parts = text.split(connector);
  if (parts.length <= 1) return parts;

  // Rejoin parts that are within "one of" lists (contain commas after "one of")
  const result: string[] = [];
  let current = '';
  for (const part of parts) {
    if (current) {
      current += connector + part;
    } else {
      current = part;
    }

    // Check if current forms a complete condition (has an operator keyword)
    if (hasOperator(current)) {
      result.push(current.trim());
      current = '';
    }
  }
  if (current) {
    if (result.length > 0) {
      result[result.length - 1] += connector + current;
    } else {
      result.push(current.trim());
    }
  }

  return result;
}

/** Check if a text fragment contains a recognizable operator. */
function hasOperator(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /\s+(is\s+one\s+of|is\s+not|is|exists|not\s+exists|does\s+not\s+exist)\b/.test(t);
}

/** Collect all field names referenced in a condition. */
function collectConditionFields(cond: ConditionExpression): string[] {
  if ('field' in cond) {
    return [cond.field as string];
  }
  const names: string[] = [];
  const compound = cond as { allOf?: ConditionExpression[]; anyOf?: ConditionExpression[] };
  if (compound.allOf) {
    for (const c of compound.allOf) names.push(...collectConditionFields(c));
  }
  if (compound.anyOf) {
    for (const c of compound.anyOf) names.push(...collectConditionFields(c));
  }
  return names;
}

/**
 * Generate CrossFieldRule[] from natural-language descriptions.
 */
export function generateCrossFieldRules(
  schema: FormSchema,
  descriptions: string[],
): CrossFieldRulesResult {
  const fields = collectFields(schema);
  const fieldNames = new Set(fields.map((f) => f.name));
  const rules: CrossFieldRule[] = [];
  const allReferenced = new Set<string>();
  const unresolved = new Set<string>();

  for (let i = 0; i < descriptions.length; i++) {
    const desc = descriptions[i];
    if (!desc.trim()) continue;

    const parsed = parseDescription(desc);
    if (!parsed) {
      // Skip unparseable descriptions
      continue;
    }

    const condition = parseCondition(parsed.conditionText);
    if (!condition) continue;

    // Collect referenced fields
    const condFields = collectConditionFields(condition);
    const allFields = [parsed.target, ...condFields];

    for (const f of allFields) {
      allReferenced.add(f);
      if (!fieldNames.has(f)) {
        unresolved.add(f);
      }
    }

    const rule: CrossFieldRule = {
      id: `rule-${rules.length + 1}`,
      description: desc.trim(),
      when: condition,
      then: {
        action: parsed.action,
        targets: [parsed.target],
      },
    };

    rules.push(rule);
  }

  return {
    rules,
    ruleCount: rules.length,
    referencedFields: Array.from(allReferenced),
    unresolvedFields: Array.from(unresolved),
  };
}
