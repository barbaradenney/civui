/**
 * extract_strings tool — extract translatable strings from CivUI HTML markup.
 * Walks all elements with text attributes and generates an i18n string map.
 */
import { load } from 'cheerio';

/** Attributes that contain user-facing text. */
const TEXT_ATTRIBUTES = [
  'label',
  'legend',
  'hint',
  'error',
  'required-message',
  'placeholder',
  'description',
  'empty-label',
  'no-results-text',
] as const;

/** Child tags whose labels are translatable options. */
const OPTION_CHILDREN: Record<string, string> = {
  'civ-radio-group': 'civ-radio',
  'civ-checkbox-group': 'civ-checkbox',
  'civ-segmented-control': 'civ-segment',
  'civ-select': 'option',
  'civ-combobox': 'option',
};

export interface ExtractStringsResult {
  strings: Record<string, string>;
  count: number;
}

/**
 * Extract all translatable strings from CivUI HTML markup.
 * Keys follow the pattern `{name}.{attribute}` for field attributes
 * and `{parentName}.option.{value}` for child option labels.
 */
export function extractStrings(html: string): ExtractStringsResult {
  const $ = load(html);
  const strings: Record<string, string> = {};

  // Walk all elements looking for text attributes
  $('*').each((_, el) => {
    const $el = $(el);
    const name = $el.attr('name') ?? '';
    if (!name) return;

    for (const attr of TEXT_ATTRIBUTES) {
      const value = $el.attr(attr);
      if (value && value.trim()) {
        strings[`${name}.${attr}`] = value;
      }
    }

    // civ-form-fieldset can carry a group-level legend / hint that applies
    // to the inner controls.
    const wrapper = $el.closest('civ-form-fieldset');
    if (wrapper.length > 0) {
      for (const attr of TEXT_ATTRIBUTES) {
        const key = `${name}.${attr}`;
        if (strings[key]) continue;
        const value = wrapper.attr(attr);
        if (value && value.trim()) {
          strings[key] = value;
        }
      }
    }
  });

  // Walk option children for translatable labels
  for (const [parentTag, childTag] of Object.entries(OPTION_CHILDREN)) {
    $(parentTag).each((_, parentEl) => {
      const $parent = $(parentEl);
      const parentName = $parent.attr('name') ?? '';
      if (!parentName) return;

      $parent.find(childTag).each((_, childEl) => {
        const $child = $(childEl);
        const value = $child.attr('value') ?? '';
        const label =
          $child.attr('label') ?? $child.text().trim() ?? value;
        if (label && value) {
          strings[`${parentName}.option.${value}`] = label;
        }
      });
    });
  }

  return {
    strings,
    count: Object.keys(strings).length,
  };
}
