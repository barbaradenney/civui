/**
 * generate_address_block tool — generate a standalone US address fieldset
 * with autocomplete attributes, ZIP validation, and civ-address-change event.
 */
import type { FormSection } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface AddressBlockResult {
  html: string;
  javascript: string;
  features: string[];
  fields: string[];
  section: FormSection;
}

export const US_STATES: Array<{ value: string; label: string }> = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export const US_TERRITORIES: Array<{ value: string; label: string }> = [
  { value: 'DC', label: 'District of Columbia' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'GU', label: 'Guam' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'U.S. Virgin Islands' },
];

export const MILITARY_ADDRESSES: Array<{ value: string; label: string }> = [
  { value: 'AA', label: 'Armed Forces Americas' },
  { value: 'AE', label: 'Armed Forces Europe' },
  { value: 'AP', label: 'Armed Forces Pacific' },
];

function buildStateOptions(
  includeTerritories: boolean,
  includeMilitary: boolean,
): Array<{ value: string; label: string }> {
  const options = [...US_STATES];
  if (includeTerritories) {
    options.push(...US_TERRITORIES);
  }
  if (includeMilitary) {
    options.push(...MILITARY_ADDRESSES);
  }
  return options;
}

function renderSelectOptions(
  options: Array<{ value: string; label: string }>,
): string {
  const lines: string[] = [];
  for (const opt of options) {
    lines.push(
      `          <option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`,
    );
  }
  return lines.join('\n');
}

/**
 * Generate a standalone US address fieldset with autocomplete, ZIP validation,
 * and a composite civ-address-change event.
 */
export function generateAddressBlock(options?: {
  includeTerritories?: boolean;
  includeMilitary?: boolean;
  label?: string;
}): AddressBlockResult {
  const includeTerritories = options?.includeTerritories ?? false;
  const includeMilitary = options?.includeMilitary ?? false;
  const label = options?.label ?? 'Mailing address';

  const features: string[] = ['address-block', 'autocomplete', 'zip-validation'];
  if (includeTerritories) {
    features.push('territories');
  }
  if (includeMilitary) {
    features.push('military-addresses');
  }

  const stateOptions = buildStateOptions(includeTerritories, includeMilitary);

  // Build HTML
  const htmlLines: string[] = [
    `<fieldset data-civ-address-block class="civ-border civ-p-4 civ-rounded">`,
    `  <legend class="civ-text-lg civ-font-bold civ-px-2">${escapeHtml(label)}</legend>`,
    ``,
    `  <div class="civ-mb-4">`,
    `    <civ-text-input`,
    `      label="Street address"`,
    `      name="street-1"`,
    `      autocomplete="address-line1"`,
    `      required`,
    `    ></civ-text-input>`,
    `  </div>`,
    ``,
    `  <div class="civ-mb-4">`,
    `    <civ-text-input`,
    `      label="Street address line 2"`,
    `      name="street-2"`,
    `      autocomplete="address-line2"`,
    `      hint="Apartment, suite, unit, building, floor, etc."`,
    `    ></civ-text-input>`,
    `  </div>`,
    ``,
    `  <div class="civ-mb-4">`,
    `    <civ-text-input`,
    `      label="City"`,
    `      name="city"`,
    `      autocomplete="address-level2"`,
    `      required`,
    `    ></civ-text-input>`,
    `  </div>`,
    ``,
    `  <div class="civ-grid civ-grid-cols-2 civ-gap-4">`,
    `    <div class="civ-mb-4">`,
    `      <civ-select`,
    `        label="State"`,
    `        name="state"`,
    `        autocomplete="address-level1"`,
    `        required`,
    `      >`,
    `        <option value="">- Select -</option>`,
    renderSelectOptions(stateOptions),
    `      </civ-select>`,
    `    </div>`,
    ``,
    `    <div class="civ-mb-4">`,
    `      <civ-text-input`,
    `        label="ZIP code"`,
    `        name="zip"`,
    `        autocomplete="postal-code"`,
    `        required`,
    `        pattern="^\\d{5}(-\\d{4})?$"`,
    `        inputmode="numeric"`,
    `        maxlength="10"`,
    `        hint="For example: 12345 or 12345-6789"`,
    `      ></civ-text-input>`,
    `      <span data-civ-zip-error class="civ-text-error civ-text-sm" role="alert" hidden></span>`,
    `    </div>`,
    `  </div>`,
    `</fieldset>`,
  ];

  const html = htmlLines.join('\n');

  // Build JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  var block = document.querySelector("[data-civ-address-block]");',
    '  if (!block) return;',
    '',
    '  var zipInput = block.querySelector("[name=\\"zip\\"]");',
    '  var zipError = block.querySelector("[data-civ-zip-error]");',
    '  var zipPattern = /^\\d{5}(-\\d{4})?$/;',
    '',
    '  // ZIP validation on blur',
    '  if (zipInput) {',
    '    zipInput.addEventListener("blur", function() {',
    '      var val = (zipInput.value || "").trim();',
    '      if (val && !zipPattern.test(val)) {',
    '        zipInput.setAttribute("aria-invalid", "true");',
    '        if (zipError) {',
    '          zipError.textContent = "Enter a valid ZIP code (for example: 12345 or 12345-6789)";',
    '          zipError.hidden = false;',
    '        }',
    '      } else {',
    '        zipInput.removeAttribute("aria-invalid");',
    '        if (zipError) {',
    '          zipError.textContent = "";',
    '          zipError.hidden = true;',
    '        }',
    '      }',
    '    });',
    '  }',
    '',
    '  // Dispatch composite address change event on any field civ-change',
    '  block.addEventListener("civ-change", function() {',
    '    var street1 = (block.querySelector("[name=\\"street-1\\"]") || {}).value || "";',
    '    var street2 = (block.querySelector("[name=\\"street-2\\"]") || {}).value || "";',
    '    var city = (block.querySelector("[name=\\"city\\"]") || {}).value || "";',
    '    var state = (block.querySelector("[name=\\"state\\"]") || {}).value || "";',
    '    var zip = (block.querySelector("[name=\\"zip\\"]") || {}).value || "";',
    '',
    '    block.dispatchEvent(new CustomEvent("civ-address-change", {',
    '      bubbles: true,',
    '      detail: { street1: street1, street2: street2, city: city, state: state, zip: zip }',
    '    }));',
    '  });',
    '})();',
  ];

  const javascript = jsLines.join('\n');

  const fields: string[] = ['street-1', 'street-2', 'city', 'state', 'zip'];

  // Build FormSection
  const sectionFields = buildSectionFields(stateOptions);
  const section: FormSection = {
    heading: label,
    fields: sectionFields,
  };

  return { html, javascript, features, fields, section };
}

function buildSectionFields(
  stateOptions: Array<{ value: string; label: string }>,
): FormSection['fields'] {
  return [
    {
      type: 'text',
      name: 'street-1',
      label: 'Street address',
      required: true,
      autocomplete: 'address-line1',
    },
    {
      type: 'text',
      name: 'street-2',
      label: 'Street address line 2',
      hint: 'Apartment, suite, unit, building, floor, etc.',
      autocomplete: 'address-line2',
    },
    {
      type: 'text',
      name: 'city',
      label: 'City',
      required: true,
      autocomplete: 'address-level2',
    },
    {
      type: 'select',
      name: 'state',
      label: 'State',
      required: true,
      autocomplete: 'address-level1',
      options: stateOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    },
    {
      type: 'text',
      name: 'zip',
      label: 'ZIP code',
      required: true,
      autocomplete: 'postal-code',
      inputmode: 'numeric',
      maxlength: 10,
      pattern: '^\\d{5}(-\\d{4})?$',
      hint: 'For example: 12345 or 12345-6789',
    },
  ];
}
