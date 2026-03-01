/**
 * estimate_burden tool — estimate PRA burden for a government form schema.
 * Calculates time estimates, complexity, and reading level.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { TIME_PER_TYPE, collectFields } from './shared-utils.js';

export interface BurdenEstimate {
  totalFields: number;
  requiredFields: number;
  optionalFields: number;
  fieldsByType: Record<string, number>;
  sectionCount: number;
  estimatedSeconds: number;
  estimatedMinutes: number;
  estimatedTimeDisplay: string;
  readingLevel: string;
  complexity: 'low' | 'medium' | 'high';
  repeatableSections: number;
  estimatedRepeatableItems: number;
}

/** Analyze reading level of labels and hints. */
function analyzeReadingLevel(fields: FormField[]): string {
  const words: string[] = [];
  for (const field of fields) {
    if (field.label) {
      words.push(...field.label.split(/\s+/));
    }
    if (field.hint) {
      words.push(...field.hint.split(/\s+/));
    }
  }

  if (words.length === 0) return 'N/A';

  const avgWordLength =
    words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / words.length;
  const avgWordsPerLabel =
    fields.filter((f) => f.label).length > 0
      ? words.length / fields.filter((f) => f.label).length
      : 0;

  if (avgWordLength <= 4 && avgWordsPerLabel <= 3) return 'Simple (grade 5–6)';
  if (avgWordLength <= 5 && avgWordsPerLabel <= 5) return 'Plain (grade 7–8)';
  if (avgWordLength <= 6 && avgWordsPerLabel <= 8) return 'Moderate (grade 9–10)';
  return 'Complex (grade 11+)';
}

/**
 * Estimate the PRA burden for a form schema.
 */
export function estimateBurden(schema: FormSchema): BurdenEstimate {
  const allFields = collectFields(schema.sections);
  const totalFields = allFields.length;
  const requiredFields = allFields.filter((f) => f.required).length;
  const optionalFields = totalFields - requiredFields;

  const fieldsByType: Record<string, number> = {};
  let estimatedSeconds = 0;

  for (const field of allFields) {
    fieldsByType[field.type] = (fieldsByType[field.type] ?? 0) + 1;
    estimatedSeconds += TIME_PER_TYPE[field.type] ?? 30;
  }

  // Account for repeatable sections
  let repeatableSections = 0;
  let estimatedRepeatableItems = 0;

  for (const section of schema.sections) {
    if (section.repeatable) {
      repeatableSections++;
      const repeatCount = Math.max(section.repeatableMin ?? 0, 1);
      estimatedRepeatableItems += repeatCount;

      // Add extra time for repeated items beyond the first (already counted)
      if (repeatCount > 1) {
        let sectionSeconds = 0;
        for (const field of section.fields) {
          sectionSeconds += TIME_PER_TYPE[field.type] ?? 30;
        }
        estimatedSeconds += sectionSeconds * (repeatCount - 1);
      }
    }
  }

  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  let estimatedTimeDisplay: string;
  if (estimatedMinutes < 1) {
    estimatedTimeDisplay = 'Less than 1 minute';
  } else if (estimatedMinutes === 1) {
    estimatedTimeDisplay = '1 minute';
  } else {
    estimatedTimeDisplay = `${estimatedMinutes} minutes`;
  }

  const readingLevel = analyzeReadingLevel(allFields);

  let complexity: BurdenEstimate['complexity'];
  if (totalFields <= 5) {
    complexity = 'low';
  } else if (totalFields <= 15) {
    complexity = 'medium';
  } else {
    complexity = 'high';
  }

  return {
    totalFields,
    requiredFields,
    optionalFields,
    fieldsByType,
    sectionCount: schema.sections.length,
    estimatedSeconds,
    estimatedMinutes,
    estimatedTimeDisplay,
    readingLevel,
    complexity,
    repeatableSections,
    estimatedRepeatableItems,
  };
}
