/**
 * visualize_form_flow tool — reads a FormSchema, outputs a Mermaid flowchart
 * showing form steps, sections, conditional visibility, cross-field rules,
 * and cascading option dependencies.
 */
import type { FormSchema, ConditionExpression } from '../schema/index.js';
import { isSimpleCondition } from '../schema/index.js';

export interface VisualizeResult {
  mermaid: string;
  nodeCount: number;
  edgeCount: number;
  summary: string;
}

function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

function escapeLabel(text: string): string {
  return text.replace(/"/g, '#quot;');
}

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

function conditionLabel(cond: ConditionExpression): string {
  if (isSimpleCondition(cond)) {
    const val = Array.isArray(cond.value) ? cond.value.join(',') : (cond.value ?? '');
    return `${cond.operator} ${val}`.trim();
  }
  if (cond.allOf) return 'allOf';
  if (cond.anyOf) return 'anyOf';
  return 'compound';
}

export function visualizeFormFlow(schema: FormSchema): VisualizeResult {
  const lines: string[] = ['flowchart TD'];
  let nodeCount = 0;
  let edgeCount = 0;
  const fieldNodes = new Set<string>();

  const formStepNodes = schema.steps ?? [];
  const hasFormSteps = formStepNodes.length > 0;

  // Helper to ensure a field node exists
  function ensureFieldNode(fieldName: string): string {
    const nodeId = `field_${sanitizeId(fieldName)}`;
    if (!fieldNodes.has(fieldName)) {
      fieldNodes.add(fieldName);
      lines.push(`  ${nodeId}[${escapeLabel(fieldName)}]`);
      nodeCount++;
    }
    return nodeId;
  }

  // Step nodes
  if (hasFormSteps) {
    lines.push('  START((Start))');
    nodeCount++;

    for (let i = 0; i < formStepNodes.length; i++) {
      lines.push(`  step${i}([Step ${i + 1}: ${escapeLabel(formStepNodes[i].title)}])`);
      nodeCount++;
    }

    // Sequential step flow
    lines.push(`  START ==> step0`);
    edgeCount++;
    for (let i = 0; i < formStepNodes.length - 1; i++) {
      lines.push(`  step${i} ==> step${i + 1}`);
      edgeCount++;
    }
  }

  // Section nodes
  const sectionsByStep = new Map<number, number[]>();
  for (let i = 0; i < schema.sections.length; i++) {
    const section = schema.sections[i];
    const sectionName = section.heading ?? `Section ${i + 1}`;
    const sectionId = `sec_${sanitizeId(sectionName.toLowerCase().replace(/\s+/g, '_'))}_${i}`;

    if (section.repeatable) {
      if (section.layout === 'table') {
        lines.push(`  ${sectionId}[/${escapeLabel(sectionName)} - table\\]`);
      } else {
        lines.push(`  ${sectionId}{{${escapeLabel(sectionName)} - repeatable}}`);
      }
    } else {
      lines.push(`  ${sectionId}(${escapeLabel(sectionName)})`);
    }
    nodeCount++;

    // Link section to step
    const stepNum = section.step ?? 0;
    if (hasFormSteps) {
      lines.push(`  step${stepNum} --- ${sectionId}`);
      edgeCount++;
    }

    if (!sectionsByStep.has(stepNum)) sectionsByStep.set(stepNum, []);
    sectionsByStep.get(stepNum)!.push(i);

    // Section-level visibility
    if (section.visibleWhen) {
      const condFields = extractConditionFields(section.visibleWhen);
      const label = conditionLabel(section.visibleWhen);
      for (const condField of condFields) {
        const fieldNodeId = ensureFieldNode(condField);
        lines.push(`  ${fieldNodeId} -.->|"${escapeLabel(label)}"| ${sectionId}`);
        edgeCount++;
      }
    }

    // Field-level conditions
    for (const field of section.fields) {
      if (field.visibleWhen) {
        const condFields = extractConditionFields(field.visibleWhen);
        const label = conditionLabel(field.visibleWhen);
        const targetId = ensureFieldNode(field.name);
        for (const condField of condFields) {
          const sourceId = ensureFieldNode(condField);
          lines.push(`  ${sourceId} -.->|"${escapeLabel(label)}"| ${targetId}`);
          edgeCount++;
        }
      }

      // Cascading options
      if (field.optionsFrom) {
        const parentId = ensureFieldNode(field.optionsFrom.field);
        const childId = ensureFieldNode(field.name);
        lines.push(`  ${parentId} -- cascading --> ${childId}`);
        edgeCount++;
      }
    }
  }

  // Cross-field rules
  if (schema.crossFieldRules) {
    for (const rule of schema.crossFieldRules) {
      const condFields = extractConditionFields(rule.when);
      for (const condField of condFields) {
        const sourceId = ensureFieldNode(condField);
        for (const target of rule.then.targets) {
          const targetId = ensureFieldNode(target);
          lines.push(`  ${sourceId} -.->|"rule: ${escapeLabel(rule.description)}"| ${targetId}`);
          edgeCount++;
        }
      }
    }
  }

  const mermaid = lines.join('\n');

  // Build summary
  const summaryParts: string[] = [];
  if (hasFormSteps) summaryParts.push(`${formStepNodes.length} form steps`);
  const conditionalCount = schema.sections.reduce((count, s) => {
    return count + s.fields.filter((f) => f.visibleWhen).length + (s.visibleWhen ? 1 : 0);
  }, 0);
  if (conditionalCount > 0) summaryParts.push(`${conditionalCount} conditional`);
  const cascadingCount = schema.sections.reduce((count, s) => {
    return count + s.fields.filter((f) => f.optionsFrom).length;
  }, 0);
  if (cascadingCount > 0) summaryParts.push(`${cascadingCount} cascading`);
  const ruleCount = schema.crossFieldRules?.length ?? 0;
  if (ruleCount > 0) summaryParts.push(`${ruleCount} cross-field rules`);

  const summary = `${nodeCount} nodes, ${edgeCount} edges${summaryParts.length > 0 ? ': ' + summaryParts.join(', ') : ''}`;

  return { mermaid, nodeCount, edgeCount, summary };
}
