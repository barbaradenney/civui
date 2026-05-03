/**
 * scaffold_from_template tool — return a pre-built FormSchema by template name,
 * with optional overrides and feature detection.
 */
import type { FormSchema } from '../schema/index.js';
import { FORM_TEMPLATES } from '../resources/form-templates.js';
import { collectFields } from './html-utils.js';

export interface ScaffoldResult {
  schema: FormSchema;
  templateName: string;
  fieldCount: number;
  sectionCount: number;
  features: string[];
}

interface ParsedTemplate {
  name: string;
  json: string;
}

/** Parse the FORM_TEMPLATES markdown into individual templates. */
function parseTemplates(): ParsedTemplate[] {
  const templates: ParsedTemplate[] = [];
  const regex = /## \d+\.\s+(.+?)\n[\s\S]*?```json\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(FORM_TEMPLATES)) !== null) {
    templates.push({
      name: match[1].trim(),
      json: match[2].trim(),
    });
  }
  return templates;
}

/** Fuzzy match a template name: exact, case-insensitive, or partial. */
function findTemplate(
  templates: ParsedTemplate[],
  name: string,
): ParsedTemplate | undefined {
  const lower = name.toLowerCase();

  // Exact match
  const exact = templates.find((t) => t.name === name);
  if (exact) return exact;

  // Case-insensitive match
  const ci = templates.find((t) => t.name.toLowerCase() === lower);
  if (ci) return ci;

  // Partial match
  const partial = templates.find((t) => t.name.toLowerCase().includes(lower));
  if (partial) return partial;

  return undefined;
}

/** Detect features present in a schema. */
function detectFeatures(schema: FormSchema): string[] {
  const features: string[] = [];
  if (schema.workflow) features.push('workflow');
  if (schema.delegation) features.push('delegation');
  if (schema.feedback) features.push('feedback');
  if (schema.steps && schema.steps.length > 0) features.push('form-steps');
  if (schema.saveResume) features.push('saveResume');
  if (schema.eligibility) features.push('eligibility');
  if (schema.documents) features.push('documents');
  if (schema.formChain) features.push('formChain');
  if (schema.bilingual) features.push('bilingual');
  if (schema.dataTable) features.push('dataTable');
  if (schema.signature) features.push('signature');
  if (schema.timeoutWarning) features.push('timeoutWarning');
  if (schema.crossFieldRules && schema.crossFieldRules.length > 0) features.push('crossFieldRules');
  if (schema.subForms && Object.keys(schema.subForms).length > 0) features.push('subForms');
  if (schema.actors && schema.actors.length > 0) features.push('multiActor');
  if (schema.sections.some((s) => s.repeatable)) features.push('repeatable');
  if (schema.sections.some((s) => s.editableBy)) features.push('sectionPermissions');
  return features;
}

/**
 * Return a pre-built FormSchema by template name.
 */
export function scaffoldFromTemplate(
  templateName: string,
  overrides?: { title?: string; action?: string; method?: string },
): ScaffoldResult {
  const templates = parseTemplates();
  const found = findTemplate(templates, templateName);

  if (!found) {
    const available = templates.map((t) => t.name).join(', ');
    throw new Error(
      `Unknown template "${templateName}". Available templates: ${available}`,
    );
  }

  const schema: FormSchema = JSON.parse(found.json);

  // Apply overrides
  if (overrides?.title !== undefined) schema.title = overrides.title;
  if (overrides?.action !== undefined) schema.action = overrides.action;
  if (overrides?.method !== undefined) schema.method = overrides.method;

  const fields = collectFields(schema);
  const features = detectFeatures(schema);

  return {
    schema,
    templateName: found.name,
    fieldCount: fields.length,
    sectionCount: schema.sections.length,
    features,
  };
}
