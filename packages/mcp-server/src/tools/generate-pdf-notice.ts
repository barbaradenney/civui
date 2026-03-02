/**
 * generate_pdf_notice tool — print-optimized decision notice with @media
 * print CSS. Wraps generateDecisionNotice() with print-specific styling.
 */
import type { FormSchema } from '../schema/index.js';
import { generateDecisionNotice } from './generate-decision-notice.js';
import { escapeHtml } from './html-utils.js';

export interface PdfNoticeResult {
  html: string;
  css: string;
  features: string[];
  mergedFields: string[];
  missingFields: string[];
}

export function generatePdfNotice(
  schema: FormSchema,
  decision: string,
  formData: Record<string, string>,
  options?: {
    includeHeader?: boolean;
    pageSize?: 'letter' | 'a4';
    orientation?: 'portrait' | 'landscape';
  },
): PdfNoticeResult {
  // Reuse existing decision notice generation
  const notice = generateDecisionNotice(schema, decision, formData);

  const includeHeader = options?.includeHeader !== false;
  const pageSize = options?.pageSize ?? 'letter';
  const orientation = options?.orientation ?? 'portrait';

  const features: string[] = ['pdf-notice', 'print-css', 'page-breaks'];
  if (includeHeader) features.push('running-header');

  // Wrap the notice HTML in a print-optimized container
  const htmlParts: string[] = [];

  htmlParts.push(`<div data-civ-pdf-notice class="civ-max-w-prose civ-mx-auto">`);

  if (includeHeader && schema.decisionNotice?.agencyName) {
    htmlParts.push(
      `  <div data-civ-print-header class="civ-text-center civ-mb-4 civ-pb-2 civ-border-b">`,
      `    <p class="civ-font-bold">${escapeHtml(schema.decisionNotice.agencyName)}</p>`,
      `  </div>`,
    );
  }

  // Strip the outer article tag from the notice and insert the content
  const innerHtml = notice.html
    .replace(/^<article[^>]*>/, '')
    .replace(/<\/article>$/, '');
  htmlParts.push(innerHtml);

  // Hide print button and other non-print elements
  htmlParts.push(`</div>`);

  // Generate @media print CSS
  const size = pageSize === 'a4' ? 'A4' : 'letter';
  const orient = orientation === 'landscape' ? ' landscape' : '';

  const cssLines: string[] = [
    `@page {`,
    `  size: ${size}${orient};`,
    `  margin: 1in;`,
    `}`,
    '',
    `@media print {`,
    `  .civ-no-print,`,
    `  [data-civ-print] {`,
    `    display: none !important;`,
    `  }`,
    '',
    `  [data-civ-pdf-notice] {`,
    `    max-width: 100%;`,
    `    margin: 0;`,
    `    font-size: 12pt;`,
    `    color: #000;`,
    `    background: #fff;`,
    `  }`,
    '',
    `  [data-civ-pdf-notice] section,`,
    `  [data-civ-pdf-notice] aside,`,
    `  [data-civ-pdf-notice] fieldset {`,
    `    page-break-inside: avoid;`,
    `  }`,
    '',
    `  [data-civ-pdf-notice] header {`,
    `    page-break-after: avoid;`,
    `  }`,
    '',
    `  [data-civ-pdf-notice] * {`,
    `    border-color: #000 !important;`,
    `  }`,
    '',
    `  [data-civ-print-header] {`,
    `    position: running(header);`,
    `  }`,
    '',
    `  @page {`,
    `    @top-center {`,
    `      content: element(header);`,
    `    }`,
    `  }`,
    `}`,
  ];

  return {
    html: htmlParts.join('\n'),
    css: cssLines.join('\n'),
    features,
    mergedFields: notice.mergedFields,
    missingFields: notice.missingFields,
  };
}
