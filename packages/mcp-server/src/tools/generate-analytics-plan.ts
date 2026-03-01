/**
 * generate_analytics_plan tool — generate an instrumentation plan for form analytics.
 * Produces events, funnel steps, drop-off risks, and PRA metrics.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { TIME_PER_TYPE, collectFields } from './shared-utils.js';

export interface AnalyticsEvent {
  name: string;
  trigger: string;
  fields: string[];
  description: string;
}

export interface FunnelStep {
  name: string;
  fieldCount: number;
  requiredFieldCount: number;
  expectedCompletionRate: number;
}

export interface DropOffRisk {
  section: string;
  risk: 'low' | 'medium' | 'high';
  reason: string;
}

export interface PraMetrics {
  estimatedCompletionMinutes: number;
  totalFields: number;
  burdenHoursPerResponse: number;
}

export interface AnalyticsPlanResult {
  events: AnalyticsEvent[];
  funnel: FunnelStep[];
  dropOffRisks: DropOffRisk[];
  praMetrics: PraMetrics;
  summary: string;
}

/** Check if a field is sensitive/complex. */
function isSensitiveField(field: FormField): boolean {
  return field.type === 'ssn' || field.name.toLowerCase().includes('ssn');
}

function isFileField(field: FormField): boolean {
  return field.type === 'file';
}

function isDateField(field: FormField): boolean {
  return field.type === 'memorable-date' || field.type === 'date';
}

/**
 * Generate an analytics instrumentation plan for a form schema.
 */
export function generateAnalyticsPlan(schema: FormSchema): AnalyticsPlanResult {
  const allFields = collectFields(schema.sections);
  const events: AnalyticsEvent[] = [];

  // Per-field events
  for (const field of allFields) {
    events.push({
      name: `field-focus:${field.name}`,
      trigger: 'focus',
      fields: [field.name],
      description: `User focuses on ${field.label}`,
    });
    events.push({
      name: `field-blur:${field.name}`,
      trigger: 'blur',
      fields: [field.name],
      description: `User leaves ${field.label}`,
    });
    events.push({
      name: `field-change:${field.name}`,
      trigger: 'civ-change',
      fields: [field.name],
      description: `User changes value of ${field.label}`,
    });
  }

  // Section events
  for (let i = 0; i < schema.sections.length; i++) {
    const section = schema.sections[i];
    const sectionName = section.heading ?? `Section ${i + 1}`;
    events.push({
      name: `section-enter:${i}`,
      trigger: 'scroll-into-view',
      fields: section.fields.map((f) => f.name),
      description: `User reaches ${sectionName}`,
    });
  }

  // Wizard step events
  if (schema.steps) {
    for (let i = 0; i < schema.steps.length; i++) {
      events.push({
        name: `step-change:${i}`,
        trigger: 'step-navigation',
        fields: [],
        description: `User navigates to step "${schema.steps[i].title}"`,
      });
    }
  }

  // Form-level events
  events.push({
    name: 'form-submit',
    trigger: 'submit',
    fields: allFields.map((f) => f.name),
    description: 'User submits the form',
  });
  events.push({
    name: 'form-abandon',
    trigger: 'beforeunload',
    fields: [],
    description: 'User leaves the page without submitting',
  });
  events.push({
    name: 'error-shown',
    trigger: 'validation-error',
    fields: [],
    description: 'Validation error displayed to user',
  });
  events.push({
    name: 'error-cleared',
    trigger: 'error-clear',
    fields: [],
    description: 'Validation error resolved by user',
  });

  // Funnel steps
  const funnel: FunnelStep[] = [];
  let completionRate = 95;

  if (schema.steps && schema.steps.length > 0) {
    // Wizard-based funnel
    for (let i = 0; i < schema.steps.length; i++) {
      const stepSections = schema.sections.filter((s) => s.step === i);
      const stepFields = collectFields(stepSections);
      const requiredCount = stepFields.filter((f) => f.required).length;
      const hasSensitive = stepFields.some(isSensitiveField);
      const hasFile = stepFields.some(isFileField);
      const manyRequired = requiredCount > 5;

      let decay = 2;
      if (hasSensitive || hasFile || manyRequired) decay = 5;

      completionRate = Math.max(0, completionRate - decay);

      funnel.push({
        name: schema.steps[i].title,
        fieldCount: stepFields.length,
        requiredFieldCount: requiredCount,
        expectedCompletionRate: completionRate,
      });
    }
  } else {
    // Section-based funnel
    for (let i = 0; i < schema.sections.length; i++) {
      const section = schema.sections[i];
      const sectionFields = collectFields([section]);
      const requiredCount = sectionFields.filter((f) => f.required).length;
      const hasSensitive = sectionFields.some(isSensitiveField);
      const hasFile = sectionFields.some(isFileField);
      const manyRequired = requiredCount > 5;

      let decay = 2;
      if (hasSensitive || hasFile || manyRequired) decay = 5;

      completionRate = Math.max(0, completionRate - decay);

      funnel.push({
        name: section.heading ?? `Section ${i + 1}`,
        fieldCount: sectionFields.length,
        requiredFieldCount: requiredCount,
        expectedCompletionRate: completionRate,
      });
    }
  }

  // Drop-off risks
  const dropOffRisks: DropOffRisk[] = [];

  for (let i = 0; i < schema.sections.length; i++) {
    const section = schema.sections[i];
    const sectionFields = collectFields([section]);
    const sectionName = section.heading ?? `Section ${i + 1}`;
    const requiredCount = sectionFields.filter((f) => f.required).length;

    if (sectionFields.some(isSensitiveField)) {
      dropOffRisks.push({
        section: sectionName,
        risk: 'high',
        reason: 'Contains sensitive information (SSN)',
      });
    }

    if (sectionFields.some(isFileField)) {
      dropOffRisks.push({
        section: sectionName,
        risk: 'high',
        reason: 'Requires file upload',
      });
    }

    if (requiredCount > 5) {
      dropOffRisks.push({
        section: sectionName,
        risk: 'medium',
        reason: `Has ${requiredCount} required fields`,
      });
    }

    if (sectionFields.some(isDateField)) {
      dropOffRisks.push({
        section: sectionName,
        risk: 'medium',
        reason: 'Contains date fields requiring specific format',
      });
    }
  }

  // PRA metrics
  let totalSeconds = 0;
  for (const field of allFields) {
    totalSeconds += TIME_PER_TYPE[field.type] ?? 30;
  }
  const estimatedCompletionMinutes = Math.ceil(totalSeconds / 60);
  const burdenHoursPerResponse = parseFloat((totalSeconds / 3600).toFixed(2));

  const praMetrics: PraMetrics = {
    estimatedCompletionMinutes,
    totalFields: allFields.length,
    burdenHoursPerResponse,
  };

  // Summary
  const summary = [
    `Analytics plan for ${schema.title ?? 'form'}: ${events.length} events, ${funnel.length} funnel steps.`,
    dropOffRisks.length > 0
      ? `${dropOffRisks.filter((r) => r.risk === 'high').length} high-risk and ${dropOffRisks.filter((r) => r.risk === 'medium').length} medium-risk drop-off points identified.`
      : 'No significant drop-off risks identified.',
    `Estimated completion: ${estimatedCompletionMinutes} minutes (${burdenHoursPerResponse} burden hours).`,
  ].join(' ');

  return { events, funnel, dropOffRisks, praMetrics, summary };
}
