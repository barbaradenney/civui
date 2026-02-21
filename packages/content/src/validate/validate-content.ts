export type Severity = 'error' | 'warning';

export interface ValidationIssue {
  file: string;
  path: string;
  severity: Severity;
  message: string;
}

/**
 * Validate parsed form content JSON.
 * Returns an array of issues — empty means valid.
 */
export function validateFormContent(data: unknown, file: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    issues.push({ file, path: '', severity: 'error', message: 'Content must be an object.' });
    return issues;
  }

  const obj = data as Record<string, unknown>;

  if (!('fields' in obj) || typeof obj.fields !== 'object' || obj.fields === null) {
    issues.push({
      file,
      path: 'fields',
      severity: 'error',
      message: '"fields" object is required.',
    });
    return issues;
  }

  const fields = obj.fields as Record<string, unknown>;

  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    const fieldPath = `fields.${fieldName}`;

    if (typeof fieldValue !== 'object' || fieldValue === null) {
      issues.push({
        file,
        path: fieldPath,
        severity: 'error',
        message: `Field "${fieldName}" must be an object.`,
      });
      continue;
    }

    const field = fieldValue as Record<string, unknown>;

    if (!('label' in field) || typeof field.label !== 'string') {
      issues.push({
        file,
        path: `${fieldPath}.label`,
        severity: 'error',
        message: `Field "${fieldName}" must have a "label" string.`,
      });
    } else if (field.label.trim() === '') {
      issues.push({
        file,
        path: `${fieldPath}.label`,
        severity: 'error',
        message: `Field "${fieldName}" has an empty label.`,
      });
    }

    if ('errors' in field && field.errors != null) {
      if (typeof field.errors !== 'object' || Array.isArray(field.errors)) {
        issues.push({
          file,
          path: `${fieldPath}.errors`,
          severity: 'error',
          message: `Field "${fieldName}" errors must be an object.`,
        });
      } else {
        const errors = field.errors as Record<string, unknown>;
        for (const [rule, message] of Object.entries(errors)) {
          if (typeof message !== 'string') {
            issues.push({
              file,
              path: `${fieldPath}.errors.${rule}`,
              severity: 'error',
              message: `Error "${rule}" in field "${fieldName}" must be a string.`,
            });
          }
        }
      }
    }
  }

  return issues;
}
