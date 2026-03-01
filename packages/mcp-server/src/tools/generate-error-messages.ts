/**
 * generate_error_messages tool — generate a complete error message library
 * for every field and constraint in a FormSchema.
 */
import type { FormSchema, FormField } from '../schema/index.js';

export interface ErrorMessageMap {
  messages: Record<string, Record<string, string>>;
  fieldCount: number;
  messageCount: number;
}

/** Detect well-known pattern types from the regex string. */
function classifyPattern(pattern: string): 'email' | 'ssn' | 'zip' | 'phone' | 'other' {
  const lower = pattern.toLowerCase();
  if (lower.includes('@') || lower.includes('email')) return 'email';
  if (lower.includes('\\d{3}') && lower.includes('\\d{2}') && lower.includes('\\d{4}')) return 'ssn';
  if (/^\^?\\d\{5\}/.test(pattern) || lower.includes('zip')) return 'zip';
  if (lower.includes('tel') || lower.includes('phone') || (lower.includes('\\d{3}') && lower.includes('\\d{4}') && !lower.includes('\\d{2}'))) return 'phone';
  return 'other';
}

/** Determine if a type uses "Select" vs "Enter" vs "Upload" as its required action verb. */
function getRequiredMessage(field: FormField): string {
  const label = field.label;
  switch (field.type) {
    case 'select':
    case 'combobox':
    case 'radio':
      return `Select your ${label}`;
    case 'checkbox':
    case 'toggle':
      return `Select ${label}`;
    case 'checkbox-group':
      return `Select your ${label}`;
    case 'file':
      return `Upload your ${label}`;
    default:
      return `Enter your ${label}`;
  }
}

/** Format file size in MB. */
function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

/** Format accept string for human display. */
function formatAccept(accept: string): string {
  const parts = accept.split(',').map((s) => s.trim());
  const labels = parts.map((part) => {
    const ext = part.replace(/^\./, '').toUpperCase();
    if (part.startsWith('.')) return ext;
    // MIME type
    const mime: Record<string, string> = {
      'application/pdf': 'PDF',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'text/plain': 'TXT',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    };
    return mime[part] ?? ext;
  });
  return labels.join(', ');
}

/**
 * Generate a complete error message library for all fields in a form schema.
 */
export function generateErrorMessages(schema: FormSchema): ErrorMessageMap {
  const messages: Record<string, Record<string, string>> = {};
  let messageCount = 0;
  let fieldCount = 0;

  function processField(field: FormField): void {
    const fieldMessages: Record<string, string> = {};
    const label = field.label;

    // required
    if (field.required) {
      fieldMessages.required = getRequiredMessage(field);
    }

    // pattern
    if (field.pattern) {
      const kind = classifyPattern(field.pattern);
      switch (kind) {
        case 'email':
          fieldMessages.pattern = 'Enter a valid email address';
          break;
        case 'ssn':
          fieldMessages.pattern = 'Enter a valid Social Security number (XXX-XX-XXXX)';
          break;
        case 'zip':
          fieldMessages.pattern = 'Enter a 5-digit ZIP code';
          break;
        case 'phone':
          fieldMessages.pattern = 'Enter a valid phone number';
          break;
        default:
          fieldMessages.pattern = `${label} must match the required format`;
          break;
      }
    }

    // Also handle type-based patterns for ssn/email/zip/tel even without explicit pattern
    if (!field.pattern) {
      if (field.type === 'email') {
        fieldMessages.pattern = 'Enter a valid email address';
      } else if (field.type === 'ssn') {
        fieldMessages.pattern = 'Enter a valid Social Security number (XXX-XX-XXXX)';
      } else if (field.type === 'zip') {
        fieldMessages.pattern = 'Enter a 5-digit ZIP code';
      } else if (field.type === 'tel') {
        fieldMessages.pattern = 'Enter a valid phone number';
      }
    }

    // minlength + maxlength
    if (field.minlength != null && field.maxlength != null) {
      fieldMessages.length = `${label} must be between ${field.minlength} and ${field.maxlength} characters`;
    } else if (field.minlength != null) {
      fieldMessages.minlength = `${label} must be at least ${field.minlength} characters`;
    } else if (field.maxlength != null) {
      fieldMessages.maxlength = `${label} must be ${field.maxlength} characters or fewer`;
    }

    // min + max (number)
    if (field.min != null && field.max != null) {
      fieldMessages.range = `${label} must be between ${field.min} and ${field.max}`;
    } else if (field.min != null) {
      fieldMessages.min = `${label} must be ${field.min} or more`;
    } else if (field.max != null) {
      fieldMessages.max = `${label} must be ${field.max} or less`;
    }

    // file accept
    if (field.accept) {
      fieldMessages.accept = `Upload a ${formatAccept(field.accept)} file`;
    }

    // file maxFiles
    if (field.maxFiles != null) {
      fieldMessages.maxFiles = `You can upload up to ${field.maxFiles} files`;
    }

    // file maxSize
    if (field.maxSize != null) {
      fieldMessages.maxSize = `Each file must be smaller than ${formatSize(field.maxSize)}`;
    }

    if (Object.keys(fieldMessages).length > 0) {
      messages[field.name] = fieldMessages;
      messageCount += Object.keys(fieldMessages).length;
      fieldCount++;
    }

    // Process children
    if (field.children) {
      for (const child of field.children) {
        processField(child);
      }
    }
  }

  for (const section of schema.sections) {
    for (const field of section.fields) {
      processField(field);
    }
  }

  // Cross-field rules
  if (schema.crossFieldRules) {
    for (const rule of schema.crossFieldRules) {
      if (rule.then.action === 'setError' && rule.then.targets) {
        for (const target of rule.then.targets) {
          if (!messages[target]) {
            messages[target] = {};
            fieldCount++;
          }
          const msg = rule.then.message ?? rule.description;
          messages[target][`rule:${rule.id}`] = msg;
          messageCount++;
        }
      }
    }
  }

  return { messages, fieldCount, messageCount };
}
