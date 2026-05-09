/**
 * generate_eligibility_screener tool — generate an eligibility screening
 * UI from a FormSchema with an eligibility configuration. Produces HTML
 * with yes-no, select, and number questions, plus client-side JS that
 * evaluates disqualification conditions and shows a pass/fail result.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface EligibilityScreenerResult {
  html: string;
  javascript: string;
  features: string[];
  questionCount: number;
}

/**
 * Generate an eligibility screener UI from a FormSchema.
 * The schema must have an `eligibility` configuration defined.
 */
export function generateEligibilityScreener(schema: FormSchema): EligibilityScreenerResult {
  if (!schema.eligibility) {
    throw new Error('Schema must have an eligibility configuration');
  }

  const { questions, passMessage, failMessage } = schema.eligibility;
  const features: string[] = ['eligibility-screener'];

  const hasYesNo = questions.some((q) => q.type === 'yes-no');
  const hasSelect = questions.some((q) => q.type === 'select');
  const hasNumber = questions.some((q) => q.type === 'number');
  const hasDisqualify = questions.some((q) => q.disqualifyWhen);

  if (hasYesNo) features.push('yes-no-questions');
  if (hasSelect) features.push('select-questions');
  if (hasNumber) features.push('number-questions');
  if (hasDisqualify) features.push('disqualify-conditions');

  // --- Build HTML ---
  const htmlLines: string[] = [];
  htmlLines.push('<fieldset data-civ-eligibility>');
  htmlLines.push('  <legend>Check your eligibility</legend>');

  for (const q of questions) {
    const escapedId = escapeHtml(q.id);
    const escapedText = escapeHtml(q.text);
    const hintAttr = q.explanation ? ` hint="${escapeHtml(q.explanation)}"` : '';

    switch (q.type) {
      case 'yes-no':
        htmlLines.push(`  <civ-radio-group legend="${escapedText}" required${hintAttr} name="${escapedId}">`);
        htmlLines.push(`    <civ-radio value="yes" label="Yes"></civ-radio>`);
        htmlLines.push(`    <civ-radio value="no" label="No"></civ-radio>`);
        htmlLines.push(`  </civ-radio-group>`);
        break;

      case 'select':
        htmlLines.push(`  <civ-form-field label="${escapedText}" required${hintAttr}>`);
        htmlLines.push(`    <civ-select name="${escapedId}" required>`);
        if (q.options) {
          for (const opt of q.options) {
            htmlLines.push(`      <option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`);
          }
        }
        htmlLines.push(`    </civ-select>`);
        htmlLines.push(`  </civ-form-field>`);
        break;

      case 'number':
        htmlLines.push(`  <civ-form-field label="${escapedText}" required${hintAttr}>`);
        htmlLines.push(`    <civ-text-input name="${escapedId}" type="number" inputmode="numeric" required></civ-text-input>`);
        htmlLines.push(`  </civ-form-field>`);
        break;
    }
  }

  htmlLines.push('  <div data-civ-eligibility-result aria-live="polite" class="civ-mt-4 civ-p-4 civ-rounded civ-border" hidden></div>');
  htmlLines.push('  <button type="button" data-civ-eligibility-check class="civ-mt-4 civ-px-4 civ-py-2 civ-rounded civ-bg-primary civ-text-white">Check eligibility</button>');
  htmlLines.push('</fieldset>');

  const html = htmlLines.join('\n');

  // --- Build JS ---
  const jsPassMessage = JSON.stringify(passMessage ?? 'Based on your answers, you appear to be eligible');
  const jsFailMessage = JSON.stringify(failMessage ?? 'Based on your answers, you may not be eligible');

  const questionsJson = JSON.stringify(
    questions.map((q) => ({
      id: q.id,
      type: q.type,
      disqualifyWhen: q.disqualifyWhen ?? null,
    })),
  );

  const javascript = `(function() {
  'use strict';

  var fieldset = document.querySelector('[data-civ-eligibility]');
  if (!fieldset) return;

  var checkBtn = fieldset.querySelector('[data-civ-eligibility-check]');
  var resultDiv = fieldset.querySelector('[data-civ-eligibility-result]');
  if (!checkBtn || !resultDiv) return;

  var questions = ${questionsJson};

  function getFieldValue(name) {
    var el = fieldset.querySelector('[name="' + name + '"]');
    if (!el) return undefined;
    return el.value || el.getAttribute('value') || '';
  }

  function evaluateDisqualify(question) {
    var value = getFieldValue(question.id);
    if (value === undefined || value === '' || !question.disqualifyWhen) return false;

    if (question.type === 'number') {
      var match = question.disqualifyWhen.match(/^([<>]=?|===?|!==?)\\s*(-?\\d+\\.?\\d*)$/);
      if (match) {
        var op = match[1];
        var num = parseFloat(match[2]);
        var val = parseFloat(value);
        if (isNaN(val)) return false;
        switch (op) {
          case '<': return val < num;
          case '<=': return val <= num;
          case '>': return val > num;
          case '>=': return val >= num;
          default: return false;
        }
      }
    }

    return value === question.disqualifyWhen;
  }

  checkBtn.addEventListener('click', function() {
    var disqualifiedBy = [];

    for (var i = 0; i < questions.length; i++) {
      if (evaluateDisqualify(questions[i])) {
        disqualifiedBy.push(questions[i].id);
      }
    }

    var eligible = disqualifiedBy.length === 0;

    resultDiv.removeAttribute('hidden');
    resultDiv.className = 'civ-mt-4 civ-p-4 civ-rounded civ-border ' +
      (eligible ? 'civ-bg-success-lighter' : 'civ-bg-error-lighter');
    resultDiv.textContent = eligible
      ? ${jsPassMessage}
      : ${jsFailMessage};

    fieldset.dispatchEvent(new CustomEvent('civ-eligibility-result', {
      bubbles: true,
      detail: { eligible: eligible, disqualifiedBy: disqualifiedBy }
    }));
  });
})();`;

  return {
    html,
    javascript,
    features,
    questionCount: questions.length,
  };
}
