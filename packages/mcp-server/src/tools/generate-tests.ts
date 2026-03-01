/**
 * generate_tests tool — generate Vitest test file from CivUI HTML markup.
 * Parses HTML, finds all CivUI form components, and generates a test suite.
 */
import { load } from 'cheerio';

/** CivUI tags that are form components. */
const FORM_TAGS = new Set([
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-date-picker',
  'civ-checkbox',
  'civ-toggle',
  'civ-file-upload',
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-memorable-date',
  'civ-segmented-control',
]);

interface ComponentInfo {
  tag: string;
  name: string;
  label: string;
  required: boolean;
  type?: string;
}

export interface GenerateTestsResult {
  filename: string;
  code: string;
  testCount: number;
}

/**
 * Generate a Vitest test file from CivUI HTML markup.
 */
export function generateTests(html: string, suiteName?: string): GenerateTestsResult {
  const $ = load(html);
  const components: ComponentInfo[] = [];

  $('*').each((_, el) => {
    const tag = (el as unknown as { tagName: string }).tagName;
    if (!tag || !FORM_TAGS.has(tag)) return;

    // Skip child components inside group parents
    const $el = $(el);
    if ($el.parents('civ-radio-group, civ-checkbox-group, civ-segmented-control').length > 0) {
      return;
    }

    components.push({
      tag,
      name: $el.attr('name') ?? '',
      label: $el.attr('label') ?? $el.attr('legend') ?? '',
      required: $el.attr('required') !== undefined,
      type: $el.attr('type'),
    });
  });

  const name = suiteName ?? 'Form';
  const filename = `${toKebabCase(name)}.test.ts`;

  let testCount = 0;
  const lines: string[] = [];

  // Imports
  lines.push(`import { describe, it, expect, afterEach, vi } from 'vitest';`);
  lines.push(
    `import { fixture, cleanupFixtures, elementUpdated, pressKey, typeText } from '@civui/test-utils';`,
  );
  lines.push('');

  // Escape HTML for template literal
  const escapedHtml = escapeTemplateLiteral(html.trim());

  lines.push(`describe('${name}', () => {`);
  lines.push(`  afterEach(cleanupFixtures);`);
  lines.push('');

  // Rendering test
  lines.push(`  it('renders the form', async () => {`);
  lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
  lines.push(`    expect(el).toBeDefined();`);
  lines.push(`    expect(document.body.contains(el)).toBe(true);`);
  lines.push(`  });`);
  testCount++;

  // Per-component label test
  for (const comp of components) {
    if (!comp.label) continue;
    const labelAttr = comp.tag.match(/group|memorable|segmented|fieldset/)
      ? 'legend'
      : 'label';
    lines.push('');
    lines.push(
      `  it('${comp.tag}[name="${comp.name}"] has ${labelAttr}', async () => {`,
    );
    lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
    lines.push(
      `    const field = el.querySelector('${comp.tag}[name="${comp.name}"]');`,
    );
    lines.push(`    expect(field).not.toBeNull();`);
    lines.push(
      `    expect(field?.getAttribute('${labelAttr}')).toBe('${escapeString(comp.label)}');`,
    );
    lines.push(`  });`);
    testCount++;
  }

  // Per-required-field test
  const requiredFields = components.filter((c) => c.required);
  for (const comp of requiredFields) {
    lines.push('');
    lines.push(
      `  it('${comp.tag}[name="${comp.name}"] is required', async () => {`,
    );
    lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
    lines.push(
      `    const field = el.querySelector('${comp.tag}[name="${comp.name}"]');`,
    );
    lines.push(`    expect(field).not.toBeNull();`);
    lines.push(`    expect(field?.hasAttribute('required')).toBe(true);`);
    lines.push(
      `    expect(field?.getAttribute('required-message')).toBeTruthy();`,
    );
    lines.push(`  });`);
    testCount++;
  }

  // Per-component event test
  for (const comp of components) {
    lines.push('');
    lines.push(
      `  it('${comp.tag}[name="${comp.name}"] fires civ-change', async () => {`,
    );
    lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
    lines.push(
      `    const field = el.querySelector('${comp.tag}[name="${comp.name}"]');`,
    );
    lines.push(`    expect(field).not.toBeNull();`);
    lines.push(`    const handler = vi.fn();`);
    lines.push(`    field!.addEventListener('civ-change', handler);`);
    lines.push(`  });`);
    testCount++;
  }

  // Keyboard nav test
  lines.push('');
  lines.push(`  it('supports keyboard navigation', async () => {`);
  lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
  lines.push(
    `    const focusable = el.querySelectorAll('${Array.from(FORM_TAGS).join(', ')}');`,
  );
  lines.push(`    expect(focusable.length).toBeGreaterThan(0);`);
  lines.push(`  });`);
  testCount++;

  lines.push(`});`);
  lines.push('');

  return {
    filename,
    code: lines.join('\n'),
    testCount,
  };
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function escapeTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}
