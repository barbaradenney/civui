/**
 * generate_print_css tool — reads a FormSchema, outputs @media print CSS
 * tailored to the form's features (wizard, repeatable, conditional, table).
 */
import type { FormSchema } from '../schema/index.js';

export interface PrintCssResult {
  css: string;
  features: string[];
}

const BASE_CSS = `  /* Base print styles */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-size: 12pt;
    line-height: 1.4;
    color: #000;
    background: #fff;
  }
  [class*="civ-focus-ring"],
  :focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
  civ-fieldset, fieldset, civ-form, form {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.25em 1em;
  }
  dt {
    font-weight: bold;
  }
  dd {
    margin: 0;
  }`;

const WIZARD_CSS = `  /* Wizard: show all steps, hide nav */
  [data-civ-step] {
    display: block !important;
  }
  [data-civ-step][hidden] {
    display: block !important;
  }
  [data-civ-step-nav] {
    display: none !important;
  }
  [data-civ-progress] {
    display: none !important;
  }`;

const REPEATABLE_CSS = `  /* Repeatable: hide add/remove buttons */
  [data-civ-repeatable-add] {
    display: none !important;
  }
  [data-civ-repeatable-remove] {
    display: none !important;
  }`;

const CONDITIONAL_CSS = `  /* Conditional: show all conditional sections */
  [data-civ-show-when] {
    display: block !important;
  }
  [data-civ-hide-when] {
    display: block !important;
  }`;

const TABLE_CSS = `  /* Table: print-friendly table styles */
  [data-civ-layout="table"] table {
    width: 100%;
    border-collapse: collapse;
  }
  [data-civ-layout="table"] th,
  [data-civ-layout="table"] td {
    border: 1px solid #000;
    padding: 4px 8px;
    text-align: left;
  }
  [data-civ-layout="table"] thead {
    display: table-header-group;
  }
  [data-civ-layout="table"] tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }`;

export function generatePrintCss(schema: FormSchema): PrintCssResult {
  const features: string[] = ['base'];
  const cssParts: string[] = [BASE_CSS];

  // Check for wizard steps
  if (schema.steps && schema.steps.length > 0) {
    features.push('wizard');
    cssParts.push(WIZARD_CSS);
  }

  // Check for repeatable sections
  const hasRepeatable = schema.sections.some((s) => s.repeatable);
  if (hasRepeatable) {
    features.push('repeatable');
    cssParts.push(REPEATABLE_CSS);
  }

  // Check for conditional visibility
  const hasConditional = schema.sections.some((s) =>
    s.visibleWhen || s.fields.some((f) => f.visibleWhen),
  );
  if (hasConditional) {
    features.push('conditional');
    cssParts.push(CONDITIONAL_CSS);
  }

  // Check for table layout
  const hasTable = schema.sections.some((s) => s.layout === 'table');
  if (hasTable) {
    features.push('table');
    cssParts.push(TABLE_CSS);
  }

  const css = `@media print {\n${cssParts.join('\n\n')}\n}`;

  return { css, features };
}
