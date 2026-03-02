/**
 * generate_email_template tool — generate an HTML email (confirmation or
 * decision) with inline CSS, table layout, and plain text fallback.
 * Email-client compatible: no <style> blocks, all CSS inline, table layout.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml, deterministicHex, collectFields } from './html-utils.js';

export interface EmailTemplateResult {
  html: string;
  subject: string;
  plainText: string;
  features: string[];
  mergedFields?: string[];
  missingFields?: string[];
}

const HEADER_BG = '#1a4480';
const HEADER_COLOR = '#ffffff';
const BODY_BG = '#ffffff';
const FOOTER_BG = '#f0f0f0';
const FOOTER_COLOR = '#71767a';
const BORDER_COLOR = '#dfe1e2';
const MAX_WIDTH = '600';

function tableRow(label: string, value: string): string {
  return [
    '<tr>',
    `  <td style="padding:8px 12px;border-bottom:1px solid ${BORDER_COLOR};font-weight:bold;width:40%;vertical-align:top;">${label}</td>`,
    `  <td style="padding:8px 12px;border-bottom:1px solid ${BORDER_COLOR};vertical-align:top;">${value}</td>`,
    '</tr>',
  ].join('\n');
}

function wrapDocument(bodyContent: string, subject: string): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    `  <title>${escapeHtml(subject)}</title>`,
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '</head>',
    `<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1b1b1b;">`,
    `  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">`,
    '    <tr>',
    '      <td align="center" style="padding:20px 10px;">',
    `        <table role="presentation" width="${MAX_WIDTH}" cellpadding="0" cellspacing="0" style="max-width:${MAX_WIDTH}px;width:100%;background-color:${BODY_BG};">`,
    bodyContent,
    '        </table>',
    '      </td>',
    '    </tr>',
    '  </table>',
    '</body>',
    '</html>',
  ].join('\n');
}

function generateConfirmationEmail(
  schema: FormSchema,
  formData: Record<string, string | string[]>,
  options: { replyTo?: string; subject?: string },
): EmailTemplateResult {
  const features: string[] = ['email', 'confirmation', 'inline-css', 'table-layout'];

  const title = schema.title ?? 'Form';
  const seed = (schema.title ?? '') + Object.keys(formData).length;
  const confirmationNumber = `CIV-${deterministicHex(seed)}`;
  const subject = options.subject ?? `${title} — Submission Confirmation`;

  features.push('confirmation-number');

  const bodyParts: string[] = [];

  // Header
  bodyParts.push(
    `          <tr>`,
    `            <td style="background-color:${HEADER_BG};color:${HEADER_COLOR};padding:20px 24px;font-size:20px;font-weight:bold;">`,
    `              ${escapeHtml(title)}`,
    `            </td>`,
    `          </tr>`,
  );

  // Confirmation banner
  bodyParts.push(
    `          <tr>`,
    `            <td style="padding:24px;background-color:${BODY_BG};">`,
    `              <p style="margin:0 0 8px 0;font-size:18px;font-weight:bold;color:#2e8540;">Your form has been submitted</p>`,
    `              <p style="margin:0 0 16px 0;">Confirmation number: <strong>${escapeHtml(confirmationNumber)}</strong></p>`,
  );

  // Submission data table
  const allFields = collectFields(schema);
  bodyParts.push(
    `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER_COLOR};border-collapse:collapse;margin-bottom:16px;">`,
  );
  for (const field of allFields) {
    const raw = formData[field.name];
    let displayValue: string;
    if (raw === undefined || raw === '') {
      displayValue = '<em>Not provided</em>';
    } else if (Array.isArray(raw)) {
      displayValue = raw.length > 0 ? escapeHtml(raw.join(', ')) : '<em>Not provided</em>';
    } else {
      displayValue = escapeHtml(raw);
    }
    bodyParts.push(`                ${tableRow(escapeHtml(field.label), displayValue)}`);
  }
  bodyParts.push(`              </table>`);

  bodyParts.push(
    `            </td>`,
    `          </tr>`,
  );

  // Footer
  bodyParts.push(
    `          <tr>`,
    `            <td style="background-color:${FOOTER_BG};color:${FOOTER_COLOR};padding:16px 24px;font-size:14px;">`,
    `              <p style="margin:0;">This is an automated confirmation. Please keep this email for your records.</p>`,
  );
  if (options.replyTo) {
    bodyParts.push(
      `              <p style="margin:8px 0 0 0;">Questions? Reply to <a href="mailto:${escapeHtml(options.replyTo)}" style="color:${HEADER_BG};">${escapeHtml(options.replyTo)}</a></p>`,
    );
    features.push('reply-to');
  }
  bodyParts.push(
    `            </td>`,
    `          </tr>`,
  );

  const html = wrapDocument(bodyParts.join('\n'), subject);

  // Plain text fallback
  const plainLines: string[] = [
    title,
    '='.repeat(title.length),
    '',
    'Your form has been submitted.',
    `Confirmation number: ${confirmationNumber}`,
    '',
    'Submitted information:',
  ];
  for (const field of allFields) {
    const raw = formData[field.name];
    const val = raw === undefined || raw === ''
      ? 'Not provided'
      : Array.isArray(raw) ? raw.join(', ') : raw;
    plainLines.push(`  ${field.label}: ${val}`);
  }
  plainLines.push('');
  plainLines.push('This is an automated confirmation. Please keep this email for your records.');
  if (options.replyTo) {
    plainLines.push(`Questions? Contact ${options.replyTo}`);
  }

  return {
    html,
    subject,
    plainText: plainLines.join('\n'),
    features,
  };
}

/** Flatten formData values to strings (join arrays with ", "). */
function flattenFormData(data: Record<string, string | string[]>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  return result;
}

function generateDecisionEmail(
  schema: FormSchema,
  formData: Record<string, string>,
  options: {
    decision: string;
    replyTo?: string;
    subject?: string;
  },
): EmailTemplateResult {
  if (!schema.decisionNotice) {
    throw new Error('Schema must have a decisionNotice configuration');
  }

  const template = schema.decisionNotice.templates.find(
    (t) => t.decision === options.decision,
  );
  if (!template) {
    throw new Error(`No template found for decision "${options.decision}"`);
  }

  const features: string[] = ['email', 'decision', 'inline-css', 'table-layout', 'merge-fields'];
  const mergedFields: string[] = [];
  const missingFields: string[] = [];

  const title = schema.title ?? 'Form';
  const subject = options.subject ?? `${title} — ${template.subject}`;

  // Merge fields
  const mergedBody = template.bodyTemplate.replace(
    /\{\{(\w+)\}\}/g,
    (_match, fieldName: string) => {
      const value = formData[fieldName];
      if (value !== undefined && value !== '') {
        if (!mergedFields.includes(fieldName)) {
          mergedFields.push(fieldName);
        }
        return escapeHtml(value);
      }
      if (!missingFields.includes(fieldName)) {
        missingFields.push(fieldName);
      }
      return `[${escapeHtml(fieldName)}]`;
    },
  );

  const bodyParts: string[] = [];

  // Header
  const agencyName = schema.decisionNotice.agencyName;
  bodyParts.push(
    `          <tr>`,
    `            <td style="background-color:${HEADER_BG};color:${HEADER_COLOR};padding:20px 24px;font-size:20px;font-weight:bold;">`,
    `              ${escapeHtml(agencyName ?? title)}`,
    `            </td>`,
    `          </tr>`,
  );

  // Body
  bodyParts.push(
    `          <tr>`,
    `            <td style="padding:24px;background-color:${BODY_BG};">`,
    `              <h2 style="margin:0 0 16px 0;font-size:20px;color:#1b1b1b;">${escapeHtml(template.subject)}</h2>`,
    `              <p style="margin:0 0 16px 0;">Re: ${escapeHtml(title)}</p>`,
    `              <div style="margin:0 0 16px 0;">${mergedBody}</div>`,
  );

  // Legal citations
  if (template.legalCitations && template.legalCitations.length > 0) {
    features.push('legal-citations');
    bodyParts.push(
      `              <hr style="border:none;border-top:1px solid ${BORDER_COLOR};margin:16px 0;">`,
      `              <p style="font-weight:bold;margin:0 0 8px 0;">Legal basis</p>`,
      `              <ul style="margin:0;padding-left:20px;">`,
    );
    for (const citation of template.legalCitations) {
      bodyParts.push(`                <li>${escapeHtml(citation)}</li>`);
    }
    bodyParts.push(`              </ul>`);
  }

  // Appeal info
  if (template.appealInfo) {
    features.push('appeal-info');
    bodyParts.push(
      `              <div style="margin:16px 0;padding:12px;background-color:#e7f6f8;border:1px solid ${BORDER_COLOR};">`,
      `                <p style="font-weight:bold;margin:0 0 4px 0;">Appeal rights</p>`,
      `                <p style="margin:0;">${escapeHtml(template.appealInfo)}</p>`,
      `              </div>`,
    );
  }

  bodyParts.push(
    `            </td>`,
    `          </tr>`,
  );

  // Footer
  bodyParts.push(
    `          <tr>`,
    `            <td style="background-color:${FOOTER_BG};color:${FOOTER_COLOR};padding:16px 24px;font-size:14px;">`,
    `              <p style="margin:0;">This is an official notice. Please retain for your records.</p>`,
  );
  if (options.replyTo) {
    bodyParts.push(
      `              <p style="margin:8px 0 0 0;">Questions? Reply to <a href="mailto:${escapeHtml(options.replyTo)}" style="color:${HEADER_BG};">${escapeHtml(options.replyTo)}</a></p>`,
    );
    features.push('reply-to');
  }
  bodyParts.push(
    `            </td>`,
    `          </tr>`,
  );

  if (missingFields.length > 0) {
    features.push('missing-fields');
  }

  const html = wrapDocument(bodyParts.join('\n'), subject);

  // Plain text fallback
  const plainLines: string[] = [
    agencyName ?? title,
    '='.repeat((agencyName ?? title).length),
    '',
    template.subject,
    `Re: ${title}`,
    '',
    template.bodyTemplate.replace(/\{\{(\w+)\}\}/g, (_match, fieldName: string) => {
      const value = formData[fieldName];
      return value !== undefined && value !== '' ? value : `[${fieldName}]`;
    }),
  ];
  if (template.legalCitations && template.legalCitations.length > 0) {
    plainLines.push('', 'Legal basis:');
    for (const citation of template.legalCitations) {
      plainLines.push(`  - ${citation}`);
    }
  }
  if (template.appealInfo) {
    plainLines.push('', `Appeal rights: ${template.appealInfo}`);
  }
  plainLines.push('');
  plainLines.push('This is an official notice. Please retain for your records.');
  if (options.replyTo) {
    plainLines.push(`Questions? Contact ${options.replyTo}`);
  }

  return {
    html,
    subject,
    plainText: plainLines.join('\n'),
    features,
    mergedFields,
    missingFields,
  };
}

/**
 * Generate an HTML email template from a FormSchema.
 */
export function generateEmailTemplate(
  schema: FormSchema,
  options: {
    type: 'confirmation' | 'decision';
    formData?: Record<string, string | string[]>;
    decision?: string;
    replyTo?: string;
    subject?: string;
  },
): EmailTemplateResult {
  if (options.type === 'confirmation') {
    return generateConfirmationEmail(schema, options.formData ?? {}, {
      replyTo: options.replyTo,
      subject: options.subject,
    });
  }

  if (!options.decision) {
    throw new Error('Decision type requires options.decision');
  }

  return generateDecisionEmail(
    schema,
    flattenFormData(options.formData ?? {}),
    {
      decision: options.decision,
      replyTo: options.replyTo,
      subject: options.subject,
    },
  );
}
