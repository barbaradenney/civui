/**
 * generate_document_checklist tool — generate an accessible document upload
 * checklist with per-requirement file inputs, format/size validation, and
 * status tracking via civ-document-status events.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface DocumentChecklistResult {
  html: string;
  javascript: string;
  features: string[];
  requirementCount: number;
}

/**
 * Generate an accessible document upload checklist from a form schema's
 * documents configuration.
 */
export function generateDocumentChecklist(schema: FormSchema): DocumentChecklistResult {
  if (!schema.documents) {
    throw new Error('Schema must have a documents configuration');
  }

  const { requirements, maxTotalSizeMb } = schema.documents;
  const features: string[] = ['document-checklist'];

  if (requirements.some((r) => r.required !== false)) {
    features.push('required-documents');
  }
  if (requirements.some((r) => r.acceptedFormats)) {
    features.push('format-validation');
  }
  if (requirements.some((r) => r.maxSizeMb)) {
    features.push('size-validation');
  }
  if (requirements.some((r) => r.alternatives && r.alternatives.length > 0)) {
    features.push('alternatives');
  }

  // Build HTML
  const htmlParts: string[] = [];

  htmlParts.push(
    `<section data-civ-document-checklist aria-labelledby="doc-checklist-heading">`,
    `  <h2 id="doc-checklist-heading">Required documents</h2>`,
    `  <ul role="list" class="civ-space-y-4">`,
  );

  for (const req of requirements) {
    const id = escapeHtml(req.id);
    const label = escapeHtml(req.label);
    const isRequired = req.required !== false;
    const badgeClass = isRequired
      ? 'civ-text-xs civ-ms-2 civ-px-2 civ-py-0.5 civ-rounded civ-bg-error-lighter civ-text-error'
      : 'civ-text-xs civ-ms-2 civ-px-2 civ-py-0.5 civ-rounded civ-bg-base-lighter';
    const badgeText = isRequired ? 'Required' : 'Optional';

    htmlParts.push(
      `    <li data-civ-doc-item="${id}" class="civ-border civ-rounded civ-p-4">`,
      `      <span data-civ-doc-status="pending" aria-hidden="true" class="civ-me-2">\u25CB</span>`,
      `      <span data-civ-doc-status-text class="civ-sr-only">Pending</span>`,
      `      <strong>${label}</strong>`,
      `      <span class="${badgeClass}">${badgeText}</span>`,
    );

    if (req.description) {
      htmlParts.push(
        `      <p class="civ-text-sm civ-mt-1">${escapeHtml(req.description)}</p>`,
      );
    }

    if (req.acceptedFormats) {
      htmlParts.push(
        `      <p class="civ-text-xs civ-text-base-dark civ-mt-1">Accepted formats: ${escapeHtml(req.acceptedFormats.join(', '))}</p>`,
      );
    }

    if (req.maxSizeMb) {
      htmlParts.push(
        `      <p class="civ-text-xs civ-text-base-dark">Maximum file size: ${req.maxSizeMb} MB</p>`,
      );
    }

    if (req.alternatives && req.alternatives.length > 0) {
      htmlParts.push(
        `      <p class="civ-text-sm civ-mt-1">Or provide: ${escapeHtml(req.alternatives.join(', '))}</p>`,
      );
    }

    // Build file upload attributes
    const uploadAttrs: string[] = [
      `name="doc-${id}"`,
    ];

    if (req.acceptedFormats) {
      const acceptValue = req.acceptedFormats.map((f) => `.${f}`).join(',');
      uploadAttrs.push(`accept="${escapeHtml(acceptValue)}"`);
    }

    if (req.maxSizeMb) {
      uploadAttrs.push(`max-size="${req.maxSizeMb}"`);
    }

    htmlParts.push(
      `      <civ-file-upload label="Upload ${label}" class="civ-mt-2" ${uploadAttrs.join(' ')}></civ-file-upload>`,
    );

    htmlParts.push(`    </li>`);
  }

  htmlParts.push(`  </ul>`);

  if (maxTotalSizeMb) {
    htmlParts.push(
      `  <p class="civ-text-sm civ-mt-4">Maximum total upload size: ${maxTotalSizeMb} MB</p>`,
    );
  }

  htmlParts.push(`</section>`);

  // Build JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  var checklist = document.querySelector("[data-civ-document-checklist]");',
    '  if (!checklist) return;',
    '',
    '  // Requirement metadata for validation',
    '  var requirements = {',
  ];

  for (const req of requirements) {
    const formats = req.acceptedFormats
      ? '[' + req.acceptedFormats.map((f) => JSON.stringify(f.toLowerCase())).join(', ') + ']'
      : 'null';
    const maxSize = req.maxSizeMb ? String(req.maxSizeMb) : 'null';
    jsLines.push(`    ${JSON.stringify(req.id)}: { formats: ${formats}, maxSizeMb: ${maxSize} },`);
  }

  jsLines.push(
    '  };',
    '',
    '  checklist.addEventListener("change", function(e) {',
    '    var fileInput = e.target;',
    '    if (!fileInput || !fileInput.name || !fileInput.name.startsWith("doc-")) return;',
    '',
    '    var docId = fileInput.name.substring(4);',
    '    var item = checklist.querySelector(\'[data-civ-doc-item="\' + docId + \'"]\');',
    '    if (!item) return;',
    '',
    '    var statusEl = item.querySelector("[data-civ-doc-status]");',
    '    var req = requirements[docId];',
    '    var files = fileInput.files;',
    '',
    '    var statusTextEl = item.querySelector("[data-civ-doc-status-text]");',
    '',
    '    if (!files || files.length === 0) {',
    '      if (statusEl) {',
    '        statusEl.textContent = "\u25CB";',
    '        statusEl.setAttribute("data-civ-doc-status", "pending");',
    '      }',
    '      if (statusTextEl) statusTextEl.textContent = "Pending";',
    '      checklist.dispatchEvent(new CustomEvent("civ-document-status", {',
    '        bubbles: true,',
    '        detail: { id: docId, status: "pending", fileName: null, errors: [] }',
    '      }));',
    '      return;',
    '    }',
    '',
    '    var file = files[0];',
    '    var errors = [];',
    '',
    '    // Validate file extension',
    '    if (req && req.formats) {',
    '      var ext = file.name.split(".").pop();',
    '      if (ext) ext = ext.toLowerCase();',
    '      if (req.formats.indexOf(ext) === -1) {',
    '        errors.push("File format not accepted. Accepted formats: " + req.formats.join(", "));',
    '      }',
    '    }',
    '',
    '    // Validate file size',
    '    if (req && req.maxSizeMb) {',
    '      var sizeMb = file.size / (1024 * 1024);',
    '      if (sizeMb > req.maxSizeMb) {',
    '        errors.push("File exceeds maximum size of " + req.maxSizeMb + " MB");',
    '      }',
    '    }',
    '',
    '    if (errors.length > 0) {',
    '      if (statusEl) {',
    '        statusEl.textContent = "\u2717";',
    '        statusEl.setAttribute("data-civ-doc-status", "error");',
    '      }',
    '      if (statusTextEl) statusTextEl.textContent = "Error";',
    '      checklist.dispatchEvent(new CustomEvent("civ-document-status", {',
    '        bubbles: true,',
    '        detail: { id: docId, status: "error", fileName: file.name, errors: errors }',
    '      }));',
    '    } else {',
    '      if (statusEl) {',
    '        statusEl.textContent = "\u2713";',
    '        statusEl.setAttribute("data-civ-doc-status", "complete");',
    '      }',
    '      if (statusTextEl) statusTextEl.textContent = "Complete";',
    '      checklist.dispatchEvent(new CustomEvent("civ-document-status", {',
    '        bubbles: true,',
    '        detail: { id: docId, status: "complete", fileName: file.name, errors: [] }',
    '      }));',
    '    }',
    '  });',
    '})();',
  );

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    requirementCount: requirements.length,
  };
}
