/**
 * generate_decision_notice tool — render a formal decision notice with
 * merge-field substitution, legal citations, appeal info, and print support.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface DecisionNoticeResult {
  html: string;
  javascript: string;
  features: string[];
  mergedFields: string[];
  missingFields: string[];
}

/**
 * Generate a decision notice HTML document from a schema's decisionNotice
 * configuration, a specific decision key, and form data for merge fields.
 */
export function generateDecisionNotice(
  schema: FormSchema,
  decision: string,
  formData: Record<string, string>,
  options?: { date?: Date },
): DecisionNoticeResult {
  if (!schema.decisionNotice) {
    throw new Error('Schema must have a decisionNotice configuration');
  }

  const template = schema.decisionNotice.templates.find(
    (t) => t.decision === decision,
  );
  if (!template) {
    throw new Error(`No template found for decision "${decision}"`);
  }

  const features: string[] = ['decision-notice', 'merge-fields'];
  const mergedFields: string[] = [];
  const missingFields: string[] = [];

  // --- Merge fields ---
  // Find all {{fieldName}} patterns in the body template
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
      return `<mark data-civ-merge-field="${escapeHtml(fieldName)}" class="civ-bg-warning-lighter civ-px-1">{{${escapeHtml(fieldName)}}}</mark>`;
    },
  );

  // --- HTML structure ---
  const htmlParts: string[] = [];

  htmlParts.push(
    `<article data-civ-decision-notice class="civ-max-w-prose civ-mx-auto">`,
  );

  // Header
  const noticeDate = options?.date ?? new Date();
  const isoDate = noticeDate.toISOString().split('T')[0];
  const formattedDate = noticeDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  htmlParts.push(`  <header class="civ-border-b civ-pb-4 civ-mb-6">`);
  if (schema.decisionNotice.agencyName) {
    htmlParts.push(
      `    <p class="civ-text-lg civ-font-bold">${escapeHtml(schema.decisionNotice.agencyName)}</p>`,
    );
  }
  htmlParts.push(
    `    <time datetime="${isoDate}">${formattedDate}</time>`,
  );
  if (schema.title) {
    htmlParts.push(
      `    <p>Re: ${escapeHtml(schema.title)}</p>`,
    );
  }
  htmlParts.push(`  </header>`);

  // Subject
  htmlParts.push(
    `  <h2 class="civ-text-xl civ-font-bold civ-mb-4">${escapeHtml(template.subject)}</h2>`,
  );

  // Body
  htmlParts.push(
    `  <div data-civ-notice-body class="civ-mb-6">`,
    `    ${mergedBody}`,
    `  </div>`,
  );

  // Legal citations
  if (template.legalCitations && template.legalCitations.length > 0) {
    features.push('legal-citations');
    htmlParts.push(
      `  <section data-civ-legal-citations class="civ-mt-6 civ-border-t civ-pt-4">`,
      `    <h3>Legal basis</h3>`,
      `    <ul>`,
    );
    for (const citation of template.legalCitations) {
      htmlParts.push(`      <li>${escapeHtml(citation)}</li>`);
    }
    htmlParts.push(`    </ul>`, `  </section>`);
  }

  // Appeal info
  if (template.appealInfo) {
    features.push('appeal-info');
    htmlParts.push(
      `  <aside data-civ-appeal-info class="civ-mt-6 civ-p-4 civ-bg-info-lighter civ-border civ-rounded" role="note">`,
      `    <h3>Appeal rights</h3>`,
      `    <p>${escapeHtml(template.appealInfo)}</p>`,
      `  </aside>`,
    );
  }

  // Footer
  htmlParts.push(
    `  <footer class="civ-mt-8 civ-border-t civ-pt-4">`,
    `    <p>___________________________</p>`,
    `    <p>Authorized signature</p>`,
    `    <button type="button" data-civ-print>Print this notice</button>`,
    `  </footer>`,
  );

  htmlParts.push(`</article>`);

  // Always include print feature
  features.push('print');

  // Missing fields feature
  if (missingFields.length > 0) {
    features.push('missing-fields');
  }

  // --- JavaScript ---
  const jsLines: string[] = [
    '(function() {',
    '  // Print button handler',
    '  var printBtn = document.querySelector("[data-civ-print]");',
    '  if (printBtn) {',
    '    printBtn.addEventListener("click", function() {',
    '      window.print();',
    '    });',
    '  }',
    '})();',
  ];

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    mergedFields,
    missingFields,
  };
}
