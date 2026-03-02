/**
 * generate_i18n_files tool — generate JSON locale bundles for internationalization.
 * Extracts all user-facing strings from a FormSchema and produces base locale (en)
 * plus target locale placeholder files.
 */
import type { FormSchema } from '../schema/index.js';
import { collectFields } from './shared-utils.js';
import { generateErrorMessages } from './generate-error-messages.js';

export interface LocaleBundle {
  locale: string;
  strings: Record<string, string>;
  count: number;
}

export interface I18nFilesResult {
  bundles: LocaleBundle[];
  baseLocale: string;
  targetLocales: string[];
  stringCount: number;
  features: string[];
  typescript: string;
}

/**
 * Generate JSON locale bundles from a FormSchema.
 */
export function generateI18nFiles(
  schema: FormSchema,
  options?: {
    baseLocale?: string;
    targetLocales?: string[];
    includeOptions?: boolean;
    includeErrors?: boolean;
    keyFormat?: 'flat' | 'nested';
  },
): I18nFilesResult {
  const baseLocale = options?.baseLocale ?? 'en';
  const targetLocales = options?.targetLocales ?? ['es'];
  const includeOptions = options?.includeOptions ?? true;
  const includeErrors = options?.includeErrors ?? false;
  const keyFormat = options?.keyFormat ?? 'flat';

  const features: string[] = [];
  const allFields = collectFields(schema.sections);
  const baseStrings: Record<string, string> = {};

  // Extract meta strings
  if (schema.title) {
    baseStrings['meta.title'] = schema.title;
  }
  if (schema.description) {
    baseStrings['meta.description'] = schema.description;
  }
  baseStrings['meta.submitLabel'] = 'Submit';

  // Extract field strings
  for (const field of allFields) {
    baseStrings[`${field.name}.label`] = field.label;
    if (field.hint) {
      baseStrings[`${field.name}.hint`] = field.hint;
    }
    if (field.placeholder) {
      baseStrings[`${field.name}.placeholder`] = field.placeholder;
    }

    // Include option labels
    if (includeOptions && field.options) {
      features.push('options');
      for (const opt of field.options) {
        baseStrings[`${field.name}.option.${opt.value}`] = opt.label;
      }
    }

    // Include children option labels
    if (includeOptions && field.children) {
      features.push('options');
      for (const child of field.children) {
        const val = child.value ?? child.name;
        baseStrings[`${field.name}.option.${val}`] = child.label;
      }
    }
  }

  // Include error messages
  if (includeErrors) {
    features.push('errors');
    const errResult = generateErrorMessages(schema);
    for (const [fieldName, msgs] of Object.entries(errResult.messages)) {
      for (const [msgKey, msgVal] of Object.entries(msgs)) {
        baseStrings[`${fieldName}.error.${msgKey}`] = msgVal;
      }
    }
  }

  // Track nested-keys feature
  if (keyFormat === 'nested') {
    features.push('nested-keys');
  }

  const stringCount = Object.keys(baseStrings).length;

  const bundles: LocaleBundle[] = [
    {
      locale: baseLocale,
      strings: baseStrings,
      count: stringCount,
    },
  ];

  // Build target locale bundles
  if (targetLocales.length > 0) {
    features.push('multi-locale');
  }
  for (const locale of targetLocales) {
    const targetStrings: Record<string, string> = {};
    for (const [key, value] of Object.entries(baseStrings)) {
      targetStrings[key] = `[TODO: translate] ${value}`;
    }
    bundles.push({
      locale,
      strings: targetStrings,
      count: stringCount,
    });
  }

  // Generate TypeScript helper
  const typescript = `import en from './${baseLocale}.json';
${targetLocales.map((l) => `import ${l} from './${l}.json';`).join('\n')}

const locales: Record<string, Record<string, string>> = {
  ${baseLocale}: en,
  ${targetLocales.map((l) => `${l}: ${l}`).join(',\n  ')},
};

export function t(key: string, locale: string = '${baseLocale}'): string {
  const bundle = locales[locale] ?? locales['${baseLocale}'];
  return bundle[key] ?? key;
}
`;

  return {
    bundles,
    baseLocale,
    targetLocales,
    stringCount,
    features: [...new Set(features)],
    typescript,
  };
}
