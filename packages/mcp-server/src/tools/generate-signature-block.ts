/**
 * generate_signature_block tool — generate an accessible signature block
 * with legal attestation text for government forms. Supports typed, drawn
 * (canvas-based), and checkbox signature modes.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface SignatureBlockResult {
  html: string;
  javascript: string;
  features: string[];
  fields: string[];
}

const DEFAULT_LEGAL_TEXT =
  'I certify that the information provided is true and correct to the best of my knowledge.';

export function generateSignatureBlock(
  schema: FormSchema,
  options?: {
    type?: 'typed' | 'drawn' | 'checkbox';
    legalText?: string;
    witnessRequired?: boolean;
    dateRequired?: boolean;
    printNameRequired?: boolean;
    titleRequired?: boolean;
  },
): SignatureBlockResult {
  // Merge schema.signature config with options; options take precedence
  const sigConfig = schema.signature;
  const type = options?.type ?? sigConfig?.type ?? 'typed';
  const legalText = options?.legalText ?? sigConfig?.legalText ?? DEFAULT_LEGAL_TEXT;
  const witnessRequired = options?.witnessRequired ?? sigConfig?.witnessRequired ?? false;
  const dateRequired = options?.dateRequired ?? sigConfig?.dateRequired ?? false;
  const printNameRequired = options?.printNameRequired ?? sigConfig?.printNameRequired ?? false;
  const titleRequired = options?.titleRequired ?? sigConfig?.titleRequired ?? false;

  const features: string[] = ['signature'];
  const fields: string[] = [];
  const htmlParts: string[] = [];
  const jsLines: string[] = [];

  // --- HTML ---
  htmlParts.push(`<fieldset data-civ-signature>`);
  htmlParts.push(`  <legend>Signature</legend>`);

  // Legal text blockquote
  htmlParts.push(
    `  <blockquote role="note" class="civ-border-s-4 civ-border-base civ-ps-4 civ-my-4 civ-text-sm">`,
    `    ${escapeHtml(legalText)}`,
    `  </blockquote>`,
  );

  // Type-specific signature control
  if (type === 'typed') {
    features.push('typed-signature');
    fields.push('signature');
    htmlParts.push(
      `  <civ-text-input name="signature" label="Type your full legal name" required class="civ-signature-typed"></civ-text-input>`,
    );
  } else if (type === 'drawn') {
    features.push('drawn-signature', 'canvas');
    fields.push('signature-data');
    htmlParts.push(
      `  <div data-civ-signature-pad-container>`,
      `    <label>Draw your signature</label>`,
      `    <canvas data-civ-signature-pad width="400" height="150" class="civ-border civ-rounded civ-w-full" role="img" aria-label="Signature drawing area"></canvas>`,
      `    <input type="hidden" name="signature-data">`,
      `    <button type="button" data-civ-signature-clear class="civ-mt-2 civ-px-3 civ-py-1 civ-text-sm civ-rounded civ-border">Clear</button>`,
      `  </div>`,
    );
  } else {
    // checkbox
    features.push('checkbox-signature');
    fields.push('signature-agree');
    htmlParts.push(
      `  <civ-checkbox name="signature-agree" label="I agree to the above statement" required></civ-checkbox>`,
    );
  }

  // Optional fields
  if (printNameRequired) {
    features.push('print-name');
    fields.push('signature-print-name');
    htmlParts.push(
      `  <civ-text-input name="signature-print-name" label="Printed name" required></civ-text-input>`,
    );
  }

  if (titleRequired) {
    features.push('title-field');
    fields.push('signature-title');
    htmlParts.push(
      `  <civ-text-input name="signature-title" label="Title" required></civ-text-input>`,
    );
  }

  if (dateRequired) {
    features.push('date-field');
    fields.push('signature-date');
    htmlParts.push(
      `  <civ-text-input name="signature-date" label="Date" required placeholder="MM/DD/YYYY"></civ-text-input>`,
    );
  }

  // Witness section
  if (witnessRequired) {
    features.push('witness');
    fields.push('witness-name', 'witness-date');
    htmlParts.push(
      `  <fieldset data-civ-witness>`,
      `    <legend>Witness</legend>`,
      `    <civ-text-input name="witness-name" label="Witness name" required></civ-text-input>`,
      `    <civ-text-input name="witness-date" label="Witness date" required></civ-text-input>`,
      `  </fieldset>`,
    );
  }

  htmlParts.push(`</fieldset>`);

  // --- JavaScript ---
  jsLines.push('(function() {');

  if (type === 'typed') {
    jsLines.push(
      '  var input = document.querySelector("[data-civ-signature] civ-text-input[name=\\"signature\\"]");',
      '  if (input) {',
      '    input.addEventListener("blur", function() {',
      '      var value = input.value || "";',
      '      if (value) {',
      '        input.dispatchEvent(new CustomEvent("civ-signature-complete", {',
      '          bubbles: true,',
      '          detail: { type: "typed", value: value, timestamp: new Date().toISOString() }',
      '        }));',
      '      }',
      '    });',
      '  }',
    );
  } else if (type === 'drawn') {
    jsLines.push(
      '  var canvas = document.querySelector("[data-civ-signature-pad]");',
      '  var hiddenInput = document.querySelector("[data-civ-signature-pad-container] input[name=\\"signature-data\\"]");',
      '  var clearBtn = document.querySelector("[data-civ-signature-clear]");',
      '  if (canvas) {',
      '    var ctx = canvas.getContext("2d");',
      '    var drawing = false;',
      '',
      '    function getPos(e) {',
      '      var rect = canvas.getBoundingClientRect();',
      '      var clientX = e.touches ? e.touches[0].clientX : e.clientX;',
      '      var clientY = e.touches ? e.touches[0].clientY : e.clientY;',
      '      return { x: clientX - rect.left, y: clientY - rect.top };',
      '    }',
      '',
      '    function startDraw(e) {',
      '      drawing = true;',
      '      var pos = getPos(e);',
      '      ctx.beginPath();',
      '      ctx.moveTo(pos.x, pos.y);',
      '      e.preventDefault();',
      '    }',
      '',
      '    function draw(e) {',
      '      if (!drawing) return;',
      '      var pos = getPos(e);',
      '      ctx.lineTo(pos.x, pos.y);',
      '      ctx.stroke();',
      '      e.preventDefault();',
      '    }',
      '',
      '    function endDraw() {',
      '      if (!drawing) return;',
      '      drawing = false;',
      '      var dataUrl = canvas.toDataURL();',
      '      if (hiddenInput) { hiddenInput.value = dataUrl; }',
      '      canvas.dispatchEvent(new CustomEvent("civ-signature-complete", {',
      '        bubbles: true,',
      '        detail: { type: "drawn", dataUrl: dataUrl, timestamp: new Date().toISOString() }',
      '      }));',
      '    }',
      '',
      '    canvas.addEventListener("mousedown", startDraw);',
      '    canvas.addEventListener("mousemove", draw);',
      '    canvas.addEventListener("mouseup", endDraw);',
      '    canvas.addEventListener("touchstart", startDraw);',
      '    canvas.addEventListener("touchmove", draw);',
      '    canvas.addEventListener("touchend", endDraw);',
      '',
      '    if (clearBtn) {',
      '      clearBtn.addEventListener("click", function() {',
      '        ctx.clearRect(0, 0, canvas.width, canvas.height);',
      '        if (hiddenInput) { hiddenInput.value = ""; }',
      '      });',
      '    }',
      '  }',
    );
  } else {
    // checkbox
    jsLines.push(
      '  var checkbox = document.querySelector("[data-civ-signature] civ-checkbox[name=\\"signature-agree\\"]");',
      '  if (checkbox) {',
      '    checkbox.addEventListener("civ-change", function(e) {',
      '      if (e.detail && e.detail.checked) {',
      '        checkbox.dispatchEvent(new CustomEvent("civ-signature-complete", {',
      '          bubbles: true,',
      '          detail: { type: "checkbox", agreed: true, timestamp: new Date().toISOString() }',
      '        }));',
      '      }',
      '    });',
      '  }',
    );
  }

  jsLines.push('})();');

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features: [...new Set(features)],
    fields,
  };
}
