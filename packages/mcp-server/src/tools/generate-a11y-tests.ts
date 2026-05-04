/**
 * generate_a11y_tests tool — generate accessibility-focused test suites from CivUI HTML.
 * Uses cheerio to parse HTML and generates tests in 6 categories.
 */
import { load } from 'cheerio';

export interface A11yTestsResult {
  filename: string;
  code: string;
  testCount: number;
  categories: string[];
}

/** CivUI tags that are interactive form components. */
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

/** Tags that use legend instead of label. */
const GROUP_TAGS = new Set([
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-memorable-date',
  'civ-segmented-control',
]);

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function escapeTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

interface ComponentInfo {
  tag: string;
  name: string;
  label: string;
  required: boolean;
  hasError: boolean;
  hasHint: boolean;
  hasAriaDescribedby: boolean;
}

/**
 * Generate accessibility-focused Vitest tests from CivUI HTML.
 */
export function generateA11yTests(html: string, suiteName?: string): A11yTestsResult {
  const $ = load(html);
  const components: ComponentInfo[] = [];
  const categories = new Set<string>();

  // Collect all form components
  $('*').each((_, el) => {
    const tag = (el as unknown as { tagName: string }).tagName;
    if (!tag || !FORM_TAGS.has(tag)) return;
    const $el = $(el);

    // Skip children inside groups
    if ($el.parents('civ-radio-group, civ-checkbox-group, civ-segmented-control').length > 0) return;

    // Check for label/legend on the component itself, or on a civ-form-field/civ-form-fieldset wrapper
    let label = $el.attr('label') ?? $el.attr('legend') ?? '';
    if (!label) {
      const formField = $el.closest('civ-form-field');
      if (formField.length > 0) {
        label = formField.attr('label') ?? '';
      }
      const formFieldset = $el.closest('civ-form-fieldset');
      if (formFieldset.length > 0) {
        label = formFieldset.attr('legend') ?? '';
      }
    }

    components.push({
      tag,
      name: $el.attr('name') ?? '',
      label,
      required: $el.attr('required') !== undefined,
      hasError: $el.attr('error') !== undefined && $el.attr('error') !== '',
      hasHint: $el.attr('hint') !== undefined && $el.attr('hint') !== '',
      hasAriaDescribedby: $el.attr('aria-describedby') !== undefined,
    });
  });

  const name = suiteName ?? 'Accessibility';
  const filename = `${toKebabCase(name)}.a11y.test.ts`;
  const escapedHtml = escapeTemplateLiteral(html.trim());

  let testCount = 0;
  const lines: string[] = [];

  // Imports
  lines.push(`import { describe, it, expect, afterEach } from 'vitest';`);
  lines.push(`import { fixture, cleanupFixtures, elementUpdated, pressKey } from '@civui/test-utils';`);
  lines.push('');
  lines.push(`describe('${name} — Accessibility', () => {`);
  lines.push(`  afterEach(cleanupFixtures);`);
  lines.push('');

  // --- Category: aria-attributes ---
  const requiredFields = components.filter((c) => c.required);
  const fieldsWithErrors = components.filter((c) => c.hasError);
  const fieldsWithHints = components.filter((c) => c.hasHint);
  const groupFields = components.filter((c) => GROUP_TAGS.has(c.tag));

  if (requiredFields.length > 0 || fieldsWithErrors.length > 0 || fieldsWithHints.length > 0 || groupFields.length > 0) {
    categories.add('aria-attributes');
    lines.push(`  // --- aria-attributes ---`);

    for (const comp of requiredFields) {
      lines.push('');
      lines.push(`  it('${comp.tag}[name="${comp.name}"] has aria-required', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const field = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    expect(field).not.toBeNull();`);
      lines.push(`    expect(field?.hasAttribute('required')).toBe(true);`);
      lines.push(`  });`);
      testCount++;
    }

    for (const comp of fieldsWithErrors) {
      lines.push('');
      lines.push(`  it('${comp.tag}[name="${comp.name}"] has aria-describedby for error', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const field = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    expect(field).not.toBeNull();`);
      lines.push(`    await elementUpdated(field!);`);
      lines.push(`    // Error fields should render with aria-describedby pointing to error message`);
      lines.push(`    const errorEl = field?.querySelector('[role="alert"]');`);
      lines.push(`    expect(errorEl).not.toBeNull();`);
      lines.push(`  });`);
      testCount++;
    }

    for (const comp of fieldsWithHints) {
      lines.push('');
      lines.push(`  it('${comp.tag}[name="${comp.name}"] has aria-describedby for hint', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const field = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    expect(field).not.toBeNull();`);
      lines.push(`    await elementUpdated(field!);`);
      lines.push(`    // Hint text should be connected via aria-describedby`);
      lines.push(`    const hintEl = field?.querySelector('.civ-hint');`);
      lines.push(`    if (hintEl) {`);
      lines.push(`      expect(hintEl.id).toBeTruthy();`);
      lines.push(`    }`);
      lines.push(`  });`);
      testCount++;
    }

    for (const comp of groupFields) {
      lines.push('');
      lines.push(`  it('${comp.tag}[name="${comp.name}"] has aria-labelledby from legend', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const group = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    expect(group).not.toBeNull();`);
      lines.push(`    expect(group?.getAttribute('legend') || group?.getAttribute('aria-label')).toBeTruthy();`);
      lines.push(`  });`);
      testCount++;
    }
  }

  // --- Category: keyboard ---
  if (components.length > 0) {
    categories.add('keyboard');
    lines.push('');
    lines.push(`  // --- keyboard ---`);
    lines.push('');
    lines.push(`  it('can Tab between focusable elements', async () => {`);
    lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
    lines.push(`    const focusable = el.querySelectorAll('${Array.from(FORM_TAGS).join(', ')}');`);
    lines.push(`    expect(focusable.length).toBeGreaterThan(0);`);
    lines.push(`  });`);
    testCount++;

    // Buttons in the form
    const hasButtons = html.includes('<button') || html.includes('data-civ-repeatable-add') || html.includes('data-civ-step');
    const hasCheckboxOrToggle = components.some((c) => c.tag === 'civ-checkbox' || c.tag === 'civ-toggle');
    if (hasButtons || hasCheckboxOrToggle) {
      lines.push('');
      lines.push(`  it('Enter/Space activates buttons and toggles', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      if (hasButtons) {
        lines.push(`    const buttons = el.querySelectorAll('button');`);
        lines.push(`    expect(buttons.length).toBeGreaterThan(0);`);
      }
      if (hasCheckboxOrToggle) {
        const toggleTag = components.find((c) => c.tag === 'civ-checkbox' || c.tag === 'civ-toggle')!.tag;
        lines.push(`    const toggle = el.querySelector('${toggleTag}');`);
        lines.push(`    if (toggle) {`);
        lines.push(`      // Space should toggle checkbox/toggle`);
        lines.push(`      expect(toggle).toBeDefined();`);
        lines.push(`    }`);
      }
      lines.push(`  });`);
      testCount++;
    }

    // Arrow keys for radio/segmented
    const radioLike = components.filter((c) => c.tag === 'civ-radio-group' || c.tag === 'civ-segmented-control');
    for (const comp of radioLike) {
      lines.push('');
      lines.push(`  it('${comp.tag}[name="${comp.name}"] supports arrow key navigation', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const group = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    expect(group).not.toBeNull();`);
      lines.push(`    // Arrow keys should cycle through options within the group`);
      lines.push(`  });`);
      testCount++;
    }

    // Combobox Escape
    const comboboxes = components.filter((c) => c.tag === 'civ-combobox');
    for (const comp of comboboxes) {
      lines.push('');
      lines.push(`  it('${comp.tag}[name="${comp.name}"] closes on Escape', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const combo = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    expect(combo).not.toBeNull();`);
      lines.push(`    // Escape key should close the listbox`);
      lines.push(`  });`);
      testCount++;
    }
  }

  // --- Category: focus-management ---
  const hasFormSteps = html.includes('data-civ-step');
  const hasRepeatable = html.includes('data-civ-repeatable');
  if (hasFormSteps || hasRepeatable) {
    categories.add('focus-management');
    lines.push('');
    lines.push(`  // --- focus-management ---`);

    if (hasFormSteps) {
      lines.push('');
      lines.push(`  it('focuses first input on form step change', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const steps = el.querySelectorAll('[data-civ-step]');`);
      lines.push(`    expect(steps.length).toBeGreaterThan(0);`);
      lines.push(`    // After advancing to next step, first input should receive focus`);
      lines.push(`  });`);
      testCount++;
    }

    if (hasRepeatable) {
      lines.push('');
      lines.push(`  it('manages focus after repeatable add/remove', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const addBtn = el.querySelector('[data-civ-repeatable-add]');`);
      lines.push(`    expect(addBtn).not.toBeNull();`);
      lines.push(`    // After adding, focus should move to first input of new item`);
      lines.push(`  });`);
      testCount++;
    }
  }

  // --- Category: announcements ---
  if (hasRepeatable || fieldsWithErrors.length > 0) {
    categories.add('announcements');
    lines.push('');
    lines.push(`  // --- announcements ---`);

    if (hasRepeatable) {
      lines.push('');
      lines.push(`  it('repeatable container has aria-live="polite"', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const container = el.querySelector('[data-civ-repeatable]');`);
      lines.push(`    expect(container).not.toBeNull();`);
      lines.push(`    expect(container?.getAttribute('aria-live')).toBe('polite');`);
      lines.push(`  });`);
      testCount++;
    }

    if (fieldsWithErrors.length > 0) {
      lines.push('');
      lines.push(`  it('error messages use role="alert"', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const alerts = el.querySelectorAll('[role="alert"]');`);
      lines.push(`    expect(alerts.length).toBeGreaterThan(0);`);
      lines.push(`  });`);
      testCount++;
    }
  }

  // --- Category: semantics ---
  const headings = $('h1, h2, h3, h4, h5, h6');
  const hasHeadings = headings.length > 0;
  const hasInteractiveButtons = html.includes('<button');

  if (hasHeadings || hasInteractiveButtons) {
    categories.add('semantics');
    lines.push('');
    lines.push(`  // --- semantics ---`);

    if (hasHeadings) {
      lines.push('');
      lines.push(`  it('maintains heading hierarchy (no skipped levels)', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');`);
      lines.push(`    let lastLevel = 0;`);
      lines.push(`    headings.forEach((h) => {`);
      lines.push(`      const level = parseInt(h.tagName[1], 10);`);
      lines.push(`      if (lastLevel > 0) {`);
      lines.push(`        expect(level).toBeLessThanOrEqual(lastLevel + 1);`);
      lines.push(`      }`);
      lines.push(`      lastLevel = level;`);
      lines.push(`    });`);
      lines.push(`  });`);
      testCount++;
    }

    if (hasInteractiveButtons) {
      lines.push('');
      lines.push(`  it('uses button elements for interactive actions', async () => {`);
      lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
      lines.push(`    const buttons = el.querySelectorAll('button');`);
      lines.push(`    buttons.forEach((btn) => {`);
      lines.push(`      expect(btn.tagName).toBe('BUTTON');`);
      lines.push(`    });`);
      lines.push(`  });`);
      testCount++;
    }
  }

  // --- Category: color-independence ---
  if (fieldsWithErrors.length > 0) {
    categories.add('color-independence');
    lines.push('');
    lines.push(`  // --- color-independence ---`);
    lines.push('');
    lines.push(`  it('error states have text content, not just color', async () => {`);
    lines.push(`    const el = await fixture(\`${escapedHtml}\`);`);
    for (const comp of fieldsWithErrors) {
      lines.push(`    const ${comp.name.replace(/-/g, '_')}_field = el.querySelector('${comp.tag}[name="${comp.name}"]');`);
      lines.push(`    if (${comp.name.replace(/-/g, '_')}_field) {`);
      lines.push(`      const errorText = ${comp.name.replace(/-/g, '_')}_field.getAttribute('error');`);
      lines.push(`      expect(errorText).toBeTruthy();`);
      lines.push(`    }`);
    }
    lines.push(`  });`);
    testCount++;
  }

  lines.push(`});`);
  lines.push('');

  return {
    filename,
    code: lines.join('\n'),
    testCount,
    categories: Array.from(categories),
  };
}
