/**
 * generate_content_registry tool — generate a FormContent JSON from a FormSchema,
 * ready for registerContent() from @civui/content.
 */
import type { FormSchema } from '../schema/index.js';
import { collectFields, toCamelCase } from './shared-utils.js';
import { generateErrorMessages } from './generate-error-messages.js';

export interface FieldContent {
  label: string;
  hint?: string;
  placeholder?: string;
  errors?: Record<string, string>;
}

export interface FormContent {
  meta: {
    title: string;
    description?: string;
    submitLabel: string;
  };
  fields: Record<string, FieldContent>;
}

export interface ContentRegistryResult {
  content: FormContent;
  typescript: string;
  fieldCount: number;
  features: string[];
}

/**
 * Generate a FormContent JSON and registerContent() TypeScript code from a FormSchema.
 */
export function generateContentRegistry(
  schema: FormSchema,
  options?: { locale?: string; includeErrors?: boolean },
): ContentRegistryResult {
  const locale = options?.locale;
  const includeErrors = options?.includeErrors ?? false;

  const features: string[] = [];
  const fields: Record<string, FieldContent> = {};

  // Get error messages if requested
  let errorMap: Record<string, Record<string, string>> | undefined;
  if (includeErrors) {
    const errResult = generateErrorMessages(schema);
    errorMap = errResult.messages;
    features.push('errors');
  }

  let hasHints = false;
  let hasPlaceholders = false;

  const allFields = collectFields(schema.sections);

  for (const field of allFields) {
    const entry: FieldContent = { label: field.label };

    if (field.hint) {
      entry.hint = field.hint;
      hasHints = true;
    }

    if (field.placeholder) {
      entry.placeholder = field.placeholder;
      hasPlaceholders = true;
    }

    if (includeErrors && errorMap && errorMap[field.name]) {
      entry.errors = errorMap[field.name];
    }

    fields[field.name] = entry;
  }

  if (hasHints) features.push('hints');
  if (hasPlaceholders) features.push('placeholders');
  if (locale) features.push('locale-aware');

  const content: FormContent = {
    meta: {
      title: schema.title ?? 'Untitled Form',
      ...(schema.description ? { description: schema.description } : {}),
      submitLabel: 'Submit',
    },
    fields,
  };

  // Generate TypeScript code
  const formId = toCamelCase(
    (schema.title ?? 'untitled-form').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  );
  const contentJson = JSON.stringify(content, null, 2);
  const typescript = `import { registerContent } from '@civui/content';
import type { FormContent } from '@civui/content';

const content: FormContent = ${contentJson};

registerContent('${formId}', content);
`;

  return {
    content,
    typescript,
    fieldCount: Object.keys(fields).length,
    features,
  };
}
