/**
 * generate_mock_data tool — deterministic test data generation from schema
 * using a seeded PRNG.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { collectFields } from './html-utils.js';

export interface MockDataResult {
  data: Record<string, string>[];
  fieldCount: number;
  features: string[];
}

/** Simple linear congruential generator for deterministic output. */
function createPrng(seed: number) {
  let state = seed;
  return {
    next(): number {
      state = (state * 1664525 + 1013904223) & 0x7fffffff;
      return state / 0x7fffffff;
    },
    nextInt(min: number, max: number): number {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
  };
}

const FIRST_NAMES = ['James', 'Maria', 'David', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Linda'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const STREETS = ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Blvd', '654 Maple Dr'];
const CITIES = ['Springfield', 'Riverside', 'Fairview', 'Madison', 'Georgetown'];

function generateFieldValue(
  field: FormField,
  prng: ReturnType<typeof createPrng>,
  index: number,
): string {
  // For optional fields, 80% fill rate
  if (!field.required && prng.next() > 0.8) {
    return '';
  }

  switch (field.type) {
    case 'email':
      return `user${index + 1}@example.gov`;
    case 'tel':
      return `(555) 0${String(prng.nextInt(100, 999)).padStart(3, '0')}-${String(prng.nextInt(1000, 9999))}`;
    case 'number':
      return String(
        prng.nextInt(
          field.min ? parseInt(field.min, 10) : 1,
          field.max ? parseInt(field.max, 10) : 100,
        ),
      );
    case 'date':
    case 'memorable-date': {
      const year = prng.nextInt(1950, 2005);
      const month = String(prng.nextInt(1, 12)).padStart(2, '0');
      const day = String(prng.nextInt(1, 28)).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    case 'select':
    case 'radio':
    case 'combobox':
    case 'segmented-control':
      if (field.options && field.options.length > 0) {
        return prng.pick(field.options).value;
      }
      return `option-${prng.nextInt(1, 5)}`;
    case 'checkbox':
    case 'toggle':
      return prng.next() > 0.5 ? 'true' : 'false';
    case 'checkbox-group':
      if (field.options && field.options.length > 0) {
        const count = prng.nextInt(1, Math.min(3, field.options.length));
        const picked: string[] = [];
        for (let i = 0; i < count; i++) {
          const opt = prng.pick(field.options);
          if (!picked.includes(opt.value)) picked.push(opt.value);
        }
        return picked.join(',');
      }
      return 'option-1';
    case 'ssn':
      return `000-00-${String(prng.nextInt(1000, 9999))}`;
    case 'zip':
      return String(prng.nextInt(10000, 99999));
    case 'url':
      return `https://example.gov/page-${prng.nextInt(1, 100)}`;
    case 'password':
      return `Pass${prng.nextInt(1000, 9999)}!`;
    case 'file':
      return `document-${prng.nextInt(1, 100)}.pdf`;
    case 'textarea':
      return `This is sample text for the ${field.label} field. It contains enough content to be realistic for testing purposes.`;
    default: {
      // text, search, etc. — try to guess by field name
      const n = field.name.toLowerCase();
      if (n.includes('first') && n.includes('name')) return prng.pick(FIRST_NAMES);
      if (n.includes('last') && n.includes('name')) return prng.pick(LAST_NAMES);
      if (n.includes('name')) return `${prng.pick(FIRST_NAMES)} ${prng.pick(LAST_NAMES)}`;
      if (n.includes('address') || n.includes('street')) return prng.pick(STREETS);
      if (n.includes('city')) return prng.pick(CITIES);
      if (n.includes('state')) return prng.pick(['CA', 'NY', 'TX', 'FL', 'IL']);
      return `Sample ${field.label} ${index + 1}`;
    }
  }
}

export function generateMockData(
  schema: FormSchema,
  options?: { seed?: number; count?: number; locale?: string },
): MockDataResult {
  if (!schema.sections || schema.sections.length === 0) {
    throw new Error('Schema must have at least one section');
  }

  const seed = options?.seed ?? 42;
  const count = options?.count ?? 1;
  const prng = createPrng(seed);
  const fields = collectFields(schema);

  const features: string[] = ['mock-data', 'deterministic', 'seeded'];
  if (options?.locale) {
    features.push('locale-aware');
  }

  const data: Record<string, string>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, string> = {};
    for (const field of fields) {
      const value = generateFieldValue(field, prng, i);
      if (value !== '') {
        record[field.name] = value;
      }
    }
    data.push(record);
  }

  return {
    data,
    fieldCount: fields.length,
    features,
  };
}
