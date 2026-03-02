/**
 * generate_field_dependencies_graph tool — Mermaid diagram of field-level
 * dependencies from conditions, visibleWhen, and requiredWhen.
 */
import type { FormSchema, ConditionExpression, SimpleCondition } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';
import { collectFields } from './html-utils.js';

export interface FieldDependenciesGraphResult {
  mermaid: string;
  nodes: string[];
  edges: Array<{ from: string; to: string; type: string }>;
  features: string[];
}

function extractConditionFields(cond: ConditionExpression): string[] {
  if (isSimpleCondition(cond)) {
    return [(cond as SimpleCondition).field];
  }
  const compound = cond as { allOf?: ConditionExpression[]; anyOf?: ConditionExpression[] };
  const fields: string[] = [];
  if (compound.allOf) {
    for (const c of compound.allOf) fields.push(...extractConditionFields(c));
  }
  if (compound.anyOf) {
    for (const c of compound.anyOf) fields.push(...extractConditionFields(c));
  }
  return fields;
}

export function generateFieldDependenciesGraph(
  schema: FormSchema,
): FieldDependenciesGraphResult {
  if (!schema.sections || schema.sections.length === 0) {
    throw new Error('Schema must have at least one section');
  }

  const allFields = collectFields(schema);
  const fieldNames = new Set(allFields.map((f) => f.name));
  const nodes: string[] = [];
  const edges: Array<{ from: string; to: string; type: string }> = [];
  const features: string[] = ['dependency-graph', 'mermaid'];

  // Collect nodes
  for (const name of fieldNames) {
    nodes.push(name);
  }

  // Collect edges from visibleWhen conditions
  for (const field of allFields) {
    if (field.visibleWhen) {
      const deps = extractConditionFields(field.visibleWhen);
      for (const dep of deps) {
        if (fieldNames.has(dep)) {
          edges.push({ from: dep, to: field.name, type: 'visible' });
        }
      }
      if (!features.includes('conditional-edges')) features.push('conditional-edges');
    }

    if (field.requiredWhen) {
      const deps = extractConditionFields(field.requiredWhen);
      for (const dep of deps) {
        if (fieldNames.has(dep)) {
          edges.push({ from: dep, to: field.name, type: 'required' });
        }
      }
      if (!features.includes('conditional-edges')) features.push('conditional-edges');
    }

    // Cascading options
    if (field.optionsFrom) {
      if (fieldNames.has(field.optionsFrom.field)) {
        edges.push({ from: field.optionsFrom.field, to: field.name, type: 'cascading' });
      }
      if (!features.includes('computed-fields')) features.push('computed-fields');
    }
  }

  // Cross-field rules
  if (schema.crossFieldRules) {
    for (const rule of schema.crossFieldRules) {
      const deps = extractConditionFields(rule.when);
      for (const dep of deps) {
        for (const target of rule.then.targets) {
          if (fieldNames.has(dep) && fieldNames.has(target)) {
            edges.push({ from: dep, to: target, type: `rule-${rule.then.action}` });
          }
        }
      }
      if (!features.includes('conditional-edges')) features.push('conditional-edges');
    }
  }

  // Section visibleWhen
  for (const section of schema.sections) {
    if (section.visibleWhen) {
      const deps = extractConditionFields(section.visibleWhen);
      for (const dep of deps) {
        for (const field of section.fields) {
          if (fieldNames.has(dep)) {
            edges.push({ from: dep, to: field.name, type: 'section-visible' });
          }
        }
      }
      if (!features.includes('conditional-edges')) features.push('conditional-edges');
    }
  }

  // Generate Mermaid
  const mermaidLines: string[] = ['graph TD'];

  for (const node of nodes) {
    mermaidLines.push(`  ${sanitizeId(node)}["${node}"]`);
  }

  for (const edge of edges) {
    const style = edge.type === 'visible' || edge.type === 'required' || edge.type.startsWith('rule-') || edge.type === 'section-visible'
      ? '-.->'
      : '-->';
    const label = edge.type;
    mermaidLines.push(`  ${sanitizeId(edge.from)} ${style}|${label}| ${sanitizeId(edge.to)}`);
  }

  return {
    mermaid: mermaidLines.join('\n'),
    nodes,
    edges,
    features,
  };
}

/** Sanitize a field name into a valid Mermaid node ID. */
function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}
