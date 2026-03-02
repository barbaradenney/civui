/**
 * generate_section_progress tool — generate a section completion checklist
 * with progress tracking for multi-section government forms.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml, slugify } from './html-utils.js';

export interface SectionStatus {
  sectionHeading: string;
  totalFields: number;
  requiredFields: number;
  status: 'complete' | 'incomplete' | 'not-started';
  anchor: string;
}

export interface SectionProgressResult {
  html: string;
  javascript: string;
  sections: SectionStatus[];
  overallPercentage: number;
  features: string[];
}

function countFields(fields: FormSchema['sections'][0]['fields']): {
  total: number;
  required: number;
  requiredNames: string[];
} {
  let total = 0;
  let required = 0;
  const requiredNames: string[] = [];

  for (const field of fields) {
    total++;
    if (field.required) {
      required++;
      requiredNames.push(field.name);
    }
    if (field.children) {
      const sub = countFields(field.children);
      total += sub.total;
      required += sub.required;
      requiredNames.push(...sub.requiredNames);
    }
  }

  return { total, required, requiredNames };
}

export function generateSectionProgress(
  schema: FormSchema,
  completedValues?: Record<string, string | string[]>,
): SectionProgressResult {
  const features: string[] = ['section-progress'];
  const sections: SectionStatus[] = [];
  let totalRequired = 0;
  let totalFilled = 0;

  for (let i = 0; i < schema.sections.length; i++) {
    const section = schema.sections[i];
    const heading = section.heading ?? `Section ${i + 1}`;
    const anchor = `section-${slugify(heading)}`;
    const { total, required, requiredNames } = countFields(section.fields);

    let filledCount = 0;
    if (completedValues && required > 0) {
      for (const name of requiredNames) {
        const val = completedValues[name];
        if (val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0)) {
          filledCount++;
        }
      }
    }

    totalRequired += required;
    totalFilled += filledCount;

    let status: SectionStatus['status'];
    if (required === 0) {
      status = 'complete';
    } else if (!completedValues) {
      status = 'not-started';
    } else if (filledCount === required) {
      status = 'complete';
    } else if (filledCount > 0) {
      status = 'incomplete';
    } else {
      status = 'not-started';
    }

    sections.push({ sectionHeading: heading, totalFields: total, requiredFields: required, status, anchor });
  }

  const overallPercentage =
    totalRequired === 0 ? 100 : Math.round((totalFilled / totalRequired) * 100);

  // Generate HTML
  const htmlParts: string[] = [
    `<nav aria-label="Section progress" data-civ-section-progress class="civ-p-4 civ-border civ-rounded">`,
    `  <p class="civ-font-bold civ-mb-2">Progress: ${overallPercentage}%</p>`,
    `  <ol class="civ-list-none civ-p-0">`,
  ];

  for (const s of sections) {
    const icon =
      s.status === 'complete'
        ? '&#10003;'
        : s.status === 'incomplete'
          ? '&#9679;'
          : '&#9675;';
    const ariaLabel = `${s.sectionHeading}: ${s.status}`;
    htmlParts.push(
      `    <li class="civ-py-1">`,
      `      <a href="#${escapeHtml(s.anchor)}" class="civ-flex civ-items-center civ-gap-2" aria-label="${escapeHtml(ariaLabel)}">`,
      `        <span aria-hidden="true">${icon}</span>`,
      `        <span>${escapeHtml(s.sectionHeading)}</span>`,
      `      </a>`,
      `    </li>`,
    );
  }

  htmlParts.push(`  </ol>`, `</nav>`);

  // Generate JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  var progressNav = document.querySelector("[data-civ-section-progress]");',
    '  if (!progressNav) return;',
    '',
    '  document.addEventListener("civ-change", function(e) {',
    '    // Recalculate section completion on field changes',
    '    var sections = ' + JSON.stringify(sections.map((s) => ({ heading: s.sectionHeading, anchor: s.anchor, requiredFields: s.requiredFields }))) + ';',
    '    var total = 0;',
    '    var filled = 0;',
    '    sections.forEach(function(section) {',
    '      total += section.requiredFields;',
    '      var sectionEl = document.getElementById(section.anchor);',
    '      if (sectionEl) {',
    '        var required = sectionEl.querySelectorAll("[required]");',
    '        required.forEach(function(field) {',
    '          if (field.value) filled++;',
    '        });',
    '      }',
    '    });',
    '    var pct = total === 0 ? 100 : Math.round((filled / total) * 100);',
    '    var pEl = progressNav.querySelector("p");',
    '    if (pEl) pEl.textContent = "Progress: " + pct + "%";',
    '  });',
    '})();',
  ];

  features.push('anchor-links');

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    sections,
    overallPercentage,
    features,
  };
}
