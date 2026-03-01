/**
 * analyze_relationships tool — analyze a FormSchema and produce an
 * entity-relationship summary.
 */
import type { FormSchema, FormSection, ConditionExpression } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';

export interface Entity {
  name: string;
  type: string;
  fields: string[];
  repeatable: boolean;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'one-to-many' | 'conditional' | 'cross-field';
  description: string;
}

export interface RelationshipAnalysis {
  entities: Entity[];
  relationships: Relationship[];
  summary: string;
}

/** Patterns for inferring entity types from field names. */
const ENTITY_PATTERNS: { pattern: RegExp; type: string }[] = [
  { pattern: /(?:street|city|state|zip|postal|address)/i, type: 'address' },
  { pattern: /(?:first[-_]?name|last[-_]?name|ssn|dob|date[-_]?of[-_]?birth)/i, type: 'person' },
  { pattern: /(?:phone|tel|mobile|fax)/i, type: 'contact' },
  { pattern: /(?:email)/i, type: 'contact' },
  { pattern: /(?:employer|company|organization)/i, type: 'organization' },
  { pattern: /(?:account|routing|bank)/i, type: 'financial' },
];

/** Extract all field names referenced in a ConditionExpression (recursive). */
function extractConditionFields(cond: ConditionExpression): string[] {
  if (isSimpleCondition(cond)) {
    return [cond.field];
  }
  const fields: string[] = [];
  if (cond.allOf) {
    for (const c of cond.allOf) fields.push(...extractConditionFields(c));
  }
  if (cond.anyOf) {
    for (const c of cond.anyOf) fields.push(...extractConditionFields(c));
  }
  return fields;
}

function inferEntityType(fieldNames: string[]): string {
  const typeCounts: Record<string, number> = {};

  for (const name of fieldNames) {
    for (const { pattern, type } of ENTITY_PATTERNS) {
      if (pattern.test(name)) {
        typeCounts[type] = (typeCounts[type] ?? 0) + 1;
      }
    }
  }

  let best = 'unknown';
  let bestCount = 0;
  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > bestCount) {
      best = type;
      bestCount = count;
    }
  }

  return best;
}

function sectionToEntity(section: FormSection, index: number): Entity | null {
  if (section.fields.length === 0) return null;

  const name = section.heading ?? `Section ${index + 1}`;
  const fieldNames = section.fields.map((f) => f.name);
  const repeatable = !!section.repeatable;

  // Determine entity type: use explicit entityType from fields, or infer
  const explicitTypes = section.fields
    .filter((f) => f.entityType)
    .map((f) => f.entityType!);
  const type = explicitTypes.length > 0
    ? explicitTypes[0]
    : inferEntityType(fieldNames);

  return { name, type, fields: fieldNames, repeatable };
}

/**
 * Analyze a FormSchema and produce entity-relationship summary.
 */
export function analyzeRelationships(schema: FormSchema): RelationshipAnalysis {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];

  // Extract entities from sections
  for (let i = 0; i < schema.sections.length; i++) {
    const entity = sectionToEntity(schema.sections[i], i);
    if (entity) entities.push(entity);
  }

  // Detect one-to-many from repeatable sections
  for (const entity of entities) {
    if (entity.repeatable) {
      relationships.push({
        from: schema.title ?? 'Form',
        to: entity.name,
        type: 'one-to-many',
        description: `${entity.name} can have multiple entries`,
      });
    }
  }

  // Detect conditional relationships from visibleWhen/requiredWhen
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.visibleWhen) {
        const condFields = extractConditionFields(field.visibleWhen);
        for (const fromField of condFields) {
          relationships.push({
            from: fromField,
            to: field.name,
            type: 'conditional',
            description: `${field.name} is conditionally visible based on ${fromField}`,
          });
        }
      }
      if (field.requiredWhen) {
        const condFields = extractConditionFields(field.requiredWhen);
        for (const fromField of condFields) {
          relationships.push({
            from: fromField,
            to: field.name,
            type: 'conditional',
            description: `${field.name} is conditionally required based on ${fromField}`,
          });
        }
      }
    }
  }

  // Detect cross-field rule relationships
  if (schema.crossFieldRules) {
    for (const rule of schema.crossFieldRules) {
      const condFields = extractConditionFields(rule.when);
      for (const target of rule.then.targets) {
        for (const fromField of condFields) {
          relationships.push({
            from: fromField,
            to: target,
            type: 'cross-field',
            description: rule.description,
          });
        }
      }
    }
  }

  // Build summary
  const summaryParts: string[] = [];
  if (entities.length > 0) {
    summaryParts.push(`${entities.length} ${entities.length === 1 ? 'entity' : 'entities'} identified: ${entities.map((e) => `${e.name} (${e.type})`).join(', ')}.`);
  } else {
    summaryParts.push('No entities identified.');
  }

  const oneToMany = relationships.filter((r) => r.type === 'one-to-many');
  if (oneToMany.length > 0) {
    summaryParts.push(`${oneToMany.length} one-to-many ${oneToMany.length === 1 ? 'relationship' : 'relationships'}: ${oneToMany.map((r) => r.to).join(', ')}.`);
  }

  const conditional = relationships.filter((r) => r.type === 'conditional');
  if (conditional.length > 0) {
    summaryParts.push(`${conditional.length} conditional ${conditional.length === 1 ? 'dependency' : 'dependencies'}.`);
  }

  const crossField = relationships.filter((r) => r.type === 'cross-field');
  if (crossField.length > 0) {
    summaryParts.push(`${crossField.length} cross-field ${crossField.length === 1 ? 'rule' : 'rules'}.`);
  }

  if (relationships.length === 0) {
    summaryParts.push('No relationships detected.');
  }

  return {
    entities,
    relationships,
    summary: summaryParts.join(' '),
  };
}
