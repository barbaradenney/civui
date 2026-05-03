/**
 * generate_form_steps tool — generate a multi-step form from a FormSchema
 * that has steps defined. Produces HTML, JavaScript, features, and step summary.
 */
import type { FormSchema } from '../schema/index.js';
import { generateCivUI } from '../generator/index.js';
import { generateCompanionJs } from './generate-companion-js.js';

export interface StepSummary {
  stepIndex: number;
  title: string;
  description?: string;
  fieldCount: number;
  fieldNames: string[];
}

export interface FormStepsResult {
  html: string;
  javascript: string;
  features: string[];
  stepSummary: StepSummary[];
}

/**
 * Generate a multi-step form from a FormSchema.
 * The schema must have a `steps` array defined.
 */
export function generateFormSteps(schema: FormSchema): FormStepsResult {
  if (!schema.steps || schema.steps.length === 0) {
    throw new Error('Schema must have a non-empty `steps` array to generate a form-steps');
  }

  const html = generateCivUI(schema);
  const { javascript, features } = generateCompanionJs(schema);

  // Build step summary
  const stepSummary: StepSummary[] = schema.steps.map((step, i) => {
    const sectionFields = schema.sections
      .filter((s) => (s.step ?? 0) === i)
      .flatMap((s) => s.fields);

    return {
      stepIndex: i,
      title: step.title,
      description: step.description,
      fieldCount: sectionFields.length,
      fieldNames: sectionFields.map((f) => f.name),
    };
  });

  return { html, javascript, features, stepSummary };
}
