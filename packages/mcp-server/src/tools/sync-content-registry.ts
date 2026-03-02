/**
 * sync_content_registry tool — compare a FormContent registry against a FormSchema
 * to find missing, stale, and mismatched content entries.
 */
import type { FormSchema } from '../schema/index.js';
import { collectFields } from './shared-utils.js';
import type { FormContent } from './generate-content-registry.js';

export interface SyncIssue {
  type: 'missing' | 'stale' | 'label-mismatch' | 'hint-mismatch' | 'placeholder-mismatch';
  field: string;
  expected?: string;
  actual?: string;
}

export interface SyncContentResult {
  inSync: boolean;
  issues: SyncIssue[];
  missingFields: string[];
  staleFields: string[];
  mismatches: SyncIssue[];
  patch: Record<string, unknown>;
  report: string;
  summary: string;
}

/**
 * Compare a FormContent registry against a FormSchema and identify discrepancies.
 */
export function syncContentRegistry(
  schema: FormSchema,
  content: FormContent,
): SyncContentResult {
  const allFields = collectFields(schema.sections);
  const schemaFieldNames = new Set(allFields.map((f) => f.name));
  const contentFieldNames = new Set(Object.keys(content.fields));

  const issues: SyncIssue[] = [];
  const missingFields: string[] = [];
  const staleFields: string[] = [];
  const mismatches: SyncIssue[] = [];
  const patch: Record<string, Record<string, string>> = {};

  // Check for missing fields (in schema but not in content)
  for (const field of allFields) {
    if (!contentFieldNames.has(field.name)) {
      missingFields.push(field.name);
      const issue: SyncIssue = {
        type: 'missing',
        field: field.name,
        expected: field.label,
      };
      issues.push(issue);

      // Build patch entry
      const patchEntry: Record<string, string> = { label: field.label };
      if (field.hint) patchEntry.hint = field.hint;
      if (field.placeholder) patchEntry.placeholder = field.placeholder;
      patch[field.name] = patchEntry;
    }
  }

  // Check for stale fields (in content but not in schema)
  for (const name of contentFieldNames) {
    if (!schemaFieldNames.has(name)) {
      staleFields.push(name);
      issues.push({
        type: 'stale',
        field: name,
        actual: content.fields[name].label,
      });
    }
  }

  // Check for mismatches (in both but different values)
  for (const field of allFields) {
    if (!contentFieldNames.has(field.name)) continue;

    const contentField = content.fields[field.name];

    if (contentField.label !== field.label) {
      const issue: SyncIssue = {
        type: 'label-mismatch',
        field: field.name,
        expected: field.label,
        actual: contentField.label,
      };
      issues.push(issue);
      mismatches.push(issue);

      if (!patch[field.name]) patch[field.name] = {};
      patch[field.name].label = field.label;
    }

    if (field.hint && contentField.hint !== field.hint) {
      const issue: SyncIssue = {
        type: 'hint-mismatch',
        field: field.name,
        expected: field.hint,
        actual: contentField.hint ?? '',
      };
      issues.push(issue);
      mismatches.push(issue);

      if (!patch[field.name]) patch[field.name] = {};
      patch[field.name].hint = field.hint;
    }

    if (field.placeholder && contentField.placeholder !== field.placeholder) {
      const issue: SyncIssue = {
        type: 'placeholder-mismatch',
        field: field.name,
        expected: field.placeholder,
        actual: contentField.placeholder ?? '',
      };
      issues.push(issue);
      mismatches.push(issue);

      if (!patch[field.name]) patch[field.name] = {};
      patch[field.name].placeholder = field.placeholder;
    }
  }

  // Check meta title
  const schemaTitle = schema.title ?? 'Untitled Form';
  if (content.meta.title !== schemaTitle) {
    const issue: SyncIssue = {
      type: 'label-mismatch',
      field: 'meta.title',
      expected: schemaTitle,
      actual: content.meta.title,
    };
    issues.push(issue);
    mismatches.push(issue);
  }

  const inSync = issues.length === 0;

  // Generate markdown report
  const reportLines: string[] = ['# Content Registry Sync Report\n'];

  if (inSync) {
    reportLines.push('All content is in sync with the schema.\n');
  } else {
    if (missingFields.length > 0) {
      reportLines.push(`## Missing Fields (${missingFields.length})\n`);
      for (const name of missingFields) {
        reportLines.push(`- \`${name}\``);
      }
      reportLines.push('');
    }

    if (staleFields.length > 0) {
      reportLines.push(`## Stale Fields (${staleFields.length})\n`);
      for (const name of staleFields) {
        reportLines.push(`- \`${name}\``);
      }
      reportLines.push('');
    }

    if (mismatches.length > 0) {
      reportLines.push(`## Mismatches (${mismatches.length})\n`);
      for (const m of mismatches) {
        reportLines.push(`- **${m.field}** (${m.type}): expected "${m.expected}", got "${m.actual}"`);
      }
      reportLines.push('');
    }
  }

  const report = reportLines.join('\n');

  const parts: string[] = [];
  if (missingFields.length > 0) parts.push(`${missingFields.length} missing`);
  if (staleFields.length > 0) parts.push(`${staleFields.length} stale`);
  if (mismatches.length > 0) parts.push(`${mismatches.length} mismatched`);
  const summary = inSync ? 'Content is in sync.' : parts.join(', ') + '.';

  return {
    inSync,
    issues,
    missingFields,
    staleFields,
    mismatches,
    patch,
    report,
    summary,
  };
}
