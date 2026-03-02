/**
 * generate_summary tool — generate a read-only HTML summary of form values
 * for review pages, grouped by section with <dl> elements.
 */
import type { FormSchema, FormSection } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface SummaryResult {
  html: string;
  fieldCount: number;
  sectionCount: number;
}

function formatValue(value: string | string[] | undefined): string {
  if (value === undefined || value === '') return '<em>Not provided</em>';
  if (Array.isArray(value)) {
    return value.length > 0 ? escapeHtml(value.join(', ')) : '<em>Not provided</em>';
  }
  return escapeHtml(value);
}

function renderSectionSummary(
  section: FormSection,
  values: Record<string, string | string[]>,
  _sectionIndex: number,
  hasSteps: boolean,
  stepIndex?: number,
): string {
  const lines: string[] = [];
  const heading = section.heading;

  if (heading) {
    lines.push(`<h3>${escapeHtml(heading)}</h3>`);
  }

  if (section.repeatable && section.repeatableKey) {
    // Find all instances of this repeatable section
    const key = section.repeatableKey;
    const pattern = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[(\\d+)\\]\\.`);
    const indices = new Set<number>();
    for (const name of Object.keys(values)) {
      const match = name.match(pattern);
      if (match) indices.add(parseInt(match[1], 10));
    }

    const sortedIndices = Array.from(indices).sort((a, b) => a - b);
    for (const idx of sortedIndices) {
      lines.push(`<div class="civ-summary-group">`);
      lines.push(`  <h4>${escapeHtml(heading ?? key)} ${idx + 1}</h4>`);
      lines.push('  <dl>');
      for (const field of section.fields) {
        const fullName = `${key}[${idx}].${field.name}`;
        const val = values[fullName];
        lines.push(`    <dt>${escapeHtml(field.label)}</dt>`);
        lines.push(`    <dd>${formatValue(val)}</dd>`);
      }
      lines.push('  </dl>');
      lines.push('</div>');
    }

    // If no instances found, render one empty group
    if (sortedIndices.length === 0) {
      lines.push('<dl>');
      for (const field of section.fields) {
        lines.push(`  <dt>${escapeHtml(field.label)}</dt>`);
        lines.push(`  <dd>${formatValue(undefined)}</dd>`);
      }
      lines.push('</dl>');
    }
  } else {
    lines.push('<dl>');
    for (const field of section.fields) {
      const val = values[field.name];
      lines.push(`  <dt>${escapeHtml(field.label)}</dt>`);
      lines.push(`  <dd>${formatValue(val)}</dd>`);
    }
    lines.push('</dl>');
  }

  // Add edit link for wizard forms
  if (hasSteps && stepIndex !== undefined) {
    lines.push(`<a href="#step-${stepIndex}">Edit</a>`);
  }

  return lines.join('\n');
}

/**
 * Generate a read-only HTML summary of form values.
 */
export function generateSummary(
  schema: FormSchema,
  values: Record<string, string | string[]>,
): SummaryResult {
  const parts: string[] = [];
  const hasSteps = !!(schema.steps && schema.steps.length > 0);

  if (schema.title) {
    parts.push(`<h2>${escapeHtml(schema.title)} — Summary</h2>`);
  }

  let fieldCount = 0;
  let sectionCount = 0;

  for (const section of schema.sections) {
    sectionCount++;
    fieldCount += section.fields.length;
    const stepIndex = section.step;
    parts.push(renderSectionSummary(section, values, sectionCount, hasSteps, stepIndex));
  }

  const html = parts.join('\n\n');
  return { html, fieldCount, sectionCount };
}
