/**
 * generate_bilingual_form tool — generate a bilingual form with language
 * toggle, side-by-side, or inline rendering modes. Supports RTL languages
 * and localStorage-based language preference persistence.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface BilingualFormResult {
  html: string;
  javascript: string;
  features: string[];
  translatedFields: string[];
  untranslatedFields: string[];
}

/** Languages that use right-to-left script. */
const RTL_PREFIXES = ['ar', 'he', 'fa', 'ur'];

function isRtl(lang: string): boolean {
  return RTL_PREFIXES.some((prefix) => lang.startsWith(prefix));
}

function renderFieldHtml(
  field: FormField,
  options?: { labelOverride?: string; nameSuffix?: string },
): string {
  const label = escapeHtml(options?.labelOverride ?? field.label);
  const baseName = escapeHtml(field.name);
  const name = options?.nameSuffix ? `${baseName}-${escapeHtml(options.nameSuffix)}` : baseName;
  const hint = field.hint ? ` hint="${escapeHtml(field.hint)}"` : '';
  const req = field.required ? ' required' : '';

  switch (field.type) {
    case 'textarea':
      return `<civ-textarea label="${label}" name="${name}"${hint}${req}></civ-textarea>`;
    case 'select':
      return `<civ-select label="${label}" name="${name}"${hint}${req}></civ-select>`;
    case 'radio':
      return `<civ-radio-group legend="${label}" name="${name}"${hint}${req}></civ-radio-group>`;
    case 'checkbox':
      return `<civ-checkbox label="${label}" name="${name}"${req}></civ-checkbox>`;
    case 'checkbox-group':
      return `<civ-checkbox-group legend="${label}" name="${name}"${hint}${req}></civ-checkbox-group>`;
    case 'date':
      return `<civ-date-picker label="${label}" name="${name}"${hint}${req}></civ-date-picker>`;
    case 'memorable-date':
      return `<civ-memorable-date label="${label}" name="${name}"${hint}${req}></civ-memorable-date>`;
    case 'file':
      return `<civ-file-upload label="${label}" name="${name}"${req}></civ-file-upload>`;
    case 'toggle':
      return `<civ-toggle label="${label}" name="${name}"${req}></civ-toggle>`;
    default:
      return `<civ-text-input label="${label}" name="${name}"${hint}${req}></civ-text-input>`;
  }
}

/**
 * Generate a bilingual form from a schema's bilingual configuration and a
 * translation map. Supports toggle, side-by-side, and inline rendering modes.
 */
export function generateBilingualForm(
  schema: FormSchema,
  translations: Record<string, string>,
  options?: { mode?: 'toggle' | 'side-by-side' | 'inline' },
): BilingualFormResult {
  if (!schema.bilingual) {
    throw new Error('Schema must have a bilingual configuration');
  }

  const {
    primaryLanguage,
    secondaryLanguage,
    primaryLabel,
    secondaryLabel,
  } = schema.bilingual;

  const mode = options?.mode ?? schema.bilingual.mode ?? 'toggle';
  const rtl = isRtl(secondaryLanguage);
  const dirAttr = rtl ? ' dir="rtl"' : '';

  // Classify fields as translated or untranslated
  const translatedFields: string[] = [];
  const untranslatedFields: string[] = [];

  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (translations[field.label] !== undefined) {
        translatedFields.push(field.name);
      } else {
        untranslatedFields.push(field.name);
      }
    }
  }

  // --- Build HTML ---
  const htmlParts: string[] = [];

  // Language switch buttons
  const escapedPrimary = escapeHtml(primaryLanguage);
  const escapedSecondary = escapeHtml(secondaryLanguage);
  const primaryBtnLabel = escapeHtml(primaryLabel ?? primaryLanguage);
  const secondaryBtnLabel = escapeHtml(secondaryLabel ?? secondaryLanguage);

  htmlParts.push(
    `<div data-civ-lang-switch role="group" aria-label="Language selection" class="civ-mb-4 civ-flex civ-gap-2">`,
    `  <button type="button" data-civ-lang-btn="${escapedPrimary}" aria-pressed="true" class="civ-px-3 civ-py-1 civ-rounded civ-border">${primaryBtnLabel}</button>`,
    `  <button type="button" data-civ-lang-btn="${escapedSecondary}" aria-pressed="false" class="civ-px-3 civ-py-1 civ-rounded civ-border">${secondaryBtnLabel}</button>`,
    `</div>`,
  );

  // Content rendering per mode
  if (mode === 'toggle') {
    htmlParts.push(`<div data-civ-bilingual-form data-civ-bilingual-mode="toggle">`);

    for (const section of schema.sections) {
      // Section heading
      if (section.heading) {
        const heading = escapeHtml(section.heading);
        const translatedHeading = translations[section.heading]
          ? escapeHtml(translations[section.heading])
          : heading;

        htmlParts.push(
          `  <h3 data-civ-lang="${escapedPrimary}" lang="${escapedPrimary}">${heading}</h3>`,
          `  <h3 data-civ-lang="${escapedSecondary}" lang="${escapedSecondary}" hidden>${translatedHeading}</h3>`,
        );
      }

      // Fields
      for (const field of section.fields) {
        // Primary language version
        htmlParts.push(
          `  <div data-civ-lang="${escapedPrimary}" lang="${escapedPrimary}">`,
          `    ${renderFieldHtml(field)}`,
          `  </div>`,
        );

        // Secondary language version
        const translatedLabel = translations[field.label];
        const secondaryField = translatedLabel
          ? renderFieldHtml(field, { labelOverride: translatedLabel, nameSuffix: secondaryLanguage })
          : renderFieldHtml(field);

        htmlParts.push(
          `  <div data-civ-lang="${escapedSecondary}" lang="${escapedSecondary}"${dirAttr} hidden>`,
          `    ${secondaryField}`,
          `  </div>`,
        );
      }
    }

    htmlParts.push(`</div>`);
  } else if (mode === 'side-by-side') {
    htmlParts.push(`<div data-civ-bilingual-form data-civ-bilingual-mode="side-by-side">`);

    for (const section of schema.sections) {
      if (section.heading) {
        const heading = escapeHtml(section.heading);
        const translatedHeading = translations[section.heading]
          ? escapeHtml(translations[section.heading])
          : heading;

        htmlParts.push(
          `  <div class="civ-grid civ-grid-cols-2 civ-gap-4">`,
          `    <h3 lang="${escapedPrimary}">${heading}</h3>`,
          `    <h3 lang="${escapedSecondary}"${dirAttr}>${translatedHeading}</h3>`,
          `  </div>`,
        );
      }

      htmlParts.push(`  <div class="civ-grid civ-grid-cols-2 civ-gap-4">`);

      // Primary column
      htmlParts.push(`    <div lang="${escapedPrimary}">`);
      for (const field of section.fields) {
        htmlParts.push(`      ${renderFieldHtml(field)}`);
      }
      htmlParts.push(`    </div>`);

      // Secondary column
      htmlParts.push(`    <div lang="${escapedSecondary}"${dirAttr}>`);
      for (const field of section.fields) {
        const translatedLabel = translations[field.label];
        const secondaryField = translatedLabel
          ? renderFieldHtml(field, { labelOverride: translatedLabel, nameSuffix: secondaryLanguage })
          : renderFieldHtml(field);
        htmlParts.push(`      ${secondaryField}`);
      }
      htmlParts.push(`    </div>`);

      htmlParts.push(`  </div>`);
    }

    htmlParts.push(`</div>`);
  } else {
    // inline mode
    htmlParts.push(`<div data-civ-bilingual-form data-civ-bilingual-mode="inline">`);

    for (const section of schema.sections) {
      if (section.heading) {
        const heading = escapeHtml(section.heading);
        const translatedHeading = translations[section.heading]
          ? escapeHtml(translations[section.heading])
          : null;

        if (translatedHeading) {
          htmlParts.push(
            `  <h3>${heading} <span data-civ-lang="${escapedSecondary}" lang="${escapedSecondary}" class="civ-text-sm civ-text-base-dark">(${translatedHeading})</span></h3>`,
          );
        } else {
          htmlParts.push(`  <h3>${heading}</h3>`);
        }
      }

      for (const field of section.fields) {
        const translatedLabel = translations[field.label];
        if (translatedLabel) {
          const inlineLabel = `${escapeHtml(field.label)} <span data-civ-lang="${escapedSecondary}" lang="${escapedSecondary}" class="civ-text-sm civ-text-base-dark">(${escapeHtml(translatedLabel)})</span>`;
          const name = escapeHtml(field.name);
          const hint = field.hint ? ` hint="${escapeHtml(field.hint)}"` : '';
          const req = field.required ? ' required' : '';

          // Use label attribute with inline translation
          switch (field.type) {
            case 'radio':
              htmlParts.push(`  <civ-radio-group legend="${inlineLabel}" name="${name}"${hint}${req}></civ-radio-group>`);
              break;
            case 'checkbox-group':
              htmlParts.push(`  <civ-checkbox-group legend="${inlineLabel}" name="${name}"${hint}${req}></civ-checkbox-group>`);
              break;
            case 'memorable-date':
              htmlParts.push(`  <civ-memorable-date label="${inlineLabel}" name="${name}"${hint}${req}></civ-memorable-date>`);
              break;
            default:
              htmlParts.push(`  ${renderFieldHtml({ ...field, label: `${field.label} (${translatedLabel})` })}`);
              break;
          }
        } else {
          htmlParts.push(`  ${renderFieldHtml(field)}`);
        }
      }
    }

    htmlParts.push(`</div>`);
  }

  // --- Build JavaScript ---
  const jsLines: string[] = [
    '(function() {',
    '  var STORAGE_KEY = "civ-lang-preference";',
    '',
    '  function switchLanguage(lang) {',
    '    // Update button states',
    '    var buttons = document.querySelectorAll("[data-civ-lang-btn]");',
    '    for (var i = 0; i < buttons.length; i++) {',
    '      var btn = buttons[i];',
    '      var isActive = btn.getAttribute("data-civ-lang-btn") === lang;',
    '      btn.setAttribute("aria-pressed", isActive ? "true" : "false");',
    '    }',
    '',
    '    // Toggle visibility of language-tagged elements',
    '    var langElements = document.querySelectorAll("[data-civ-lang]");',
    '    for (var j = 0; j < langElements.length; j++) {',
    '      var el = langElements[j];',
    '      if (el.getAttribute("data-civ-lang") === lang) {',
    '        el.removeAttribute("hidden");',
    '      } else {',
    '        el.setAttribute("hidden", "");',
    '      }',
    '    }',
    '',
    '    // Persist preference',
    '    try {',
    '      localStorage.setItem(STORAGE_KEY, lang);',
    '    } catch (e) {',
    '      // localStorage may be unavailable',
    '    }',
    '',
    '    // Dispatch language change event',
    '    document.dispatchEvent(new CustomEvent("civ-language-change", {',
    '      bubbles: true,',
    '      detail: { language: lang }',
    '    }));',
    '  }',
    '',
    '  // Click handler for language buttons',
    '  var switchEl = document.querySelector("[data-civ-lang-switch]");',
    '  if (switchEl) {',
    '    switchEl.addEventListener("click", function(e) {',
    '      var btn = e.target.closest("[data-civ-lang-btn]");',
    '      if (!btn) return;',
    '      var lang = btn.getAttribute("data-civ-lang-btn");',
    '      if (lang) {',
    '        switchLanguage(lang);',
    '      }',
    '    });',
    '  }',
    '',
    '  // On load: restore preference from localStorage',
    '  try {',
    '    var saved = localStorage.getItem(STORAGE_KEY);',
    '    if (saved) {',
    '      switchLanguage(saved);',
    '    }',
    '  } catch (e) {',
    '    // localStorage may be unavailable',
    '  }',
    '})();',
  ];

  // --- Build features ---
  const features: string[] = ['bilingual', 'language-toggle'];

  if (mode === 'side-by-side') {
    features.push('side-by-side');
  }
  if (mode === 'inline') {
    features.push('inline');
  }
  if (rtl) {
    features.push('rtl-support');
  }
  features.push('localStorage');

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    translatedFields,
    untranslatedFields,
  };
}
