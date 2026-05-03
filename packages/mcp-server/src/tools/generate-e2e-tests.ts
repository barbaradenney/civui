/**
 * generate_e2e_tests tool — generate Playwright end-to-end tests
 * from a FormSchema, covering validation, submission, form-steps flow,
 * conditional fields, repeatable sections, and save/resume.
 */
import type { FormSchema } from '../schema/index.js';
import { collectFields, slugify } from './html-utils.js';

export interface E2eTestsResult {
  filename: string;
  code: string;
  testCount: number;
  features: string[];
}

/** Map field type to the Playwright interaction for filling (no indentation). */
function fillAction(field: { type: string; name: string; label: string; options?: { value: string; label: string }[] }): string[] {
  const selector = `[data-civ-field="${field.name}"]`;
  switch (field.type) {
    case 'checkbox':
    case 'toggle':
      return [`await page.locator('${selector} input[type="checkbox"]').check();`];
    case 'select':
      if (field.options && field.options.length > 0) {
        return [`await page.locator('${selector} select').selectOption('${field.options[0].value}');`];
      }
      return [`await page.locator('${selector} select').selectOption({ index: 1 });`];
    case 'radio':
      if (field.options && field.options.length > 0) {
        return [`await page.locator('${selector} input[value="${field.options[0].value}"]').click();`];
      }
      return [`await page.locator('${selector} input[type="radio"]').first().click();`];
    case 'checkbox-group':
      if (field.options && field.options.length > 0) {
        return [`await page.locator('${selector} input[value="${field.options[0].value}"]').check();`];
      }
      return [`await page.locator('${selector} input[type="checkbox"]').first().check();`];
    case 'file':
      return [`await page.locator('${selector} input[type="file"]').setInputFiles('test-file.pdf');`];
    case 'textarea':
      return [`await page.locator('${selector} textarea').fill('Test response');`];
    case 'memorable-date':
      return [
        `await page.locator('${selector} [data-civ-month]').fill('01');`,
        `await page.locator('${selector} [data-civ-day]').fill('15');`,
        `await page.locator('${selector} [data-civ-year]').fill('1990');`,
      ];
    case 'date':
      return [`await page.locator('${selector} input').fill('2024-01-15');`];
    default:
      // text, email, tel, number, password, search, url, ssn, zip, combobox
      return [`await page.locator('${selector} input').fill('Test value');`];
  }
}

/**
 * Generate Playwright end-to-end tests from a FormSchema.
 */
export function generateE2eTests(
  schema: FormSchema,
  options?: { baseUrl?: string; suiteName?: string },
): E2eTestsResult {
  const baseUrl = options?.baseUrl ?? 'http://localhost:3000';
  const suiteName = options?.suiteName ?? schema.title ?? 'Form';
  const slug = slugify(suiteName);
  const filename = `${slug}.e2e.test.ts`;

  const features: string[] = [];
  const allFields = collectFields(schema);
  const requiredFields = allFields.filter((f) => f.required);
  const hasFormSteps = !!(schema.steps && schema.steps.length > 0);
  const hasConditional = allFields.some((f) => f.visibleWhen);
  const hasRepeatable = schema.sections.some((s) => s.repeatable);
  const hasSaveResume = !!schema.saveResume;

  const lines: string[] = [];

  lines.push("import { test, expect } from '@playwright/test';");
  lines.push('');
  lines.push(`test.describe('${suiteName}', () => {`);
  lines.push(`  test.beforeEach(async ({ page }) => {`);
  lines.push(`    await page.goto('${baseUrl}');`);
  lines.push(`  });`);

  // --- Test 1: validation errors on empty submit ---
  lines.push('');
  lines.push(`  test('shows validation errors on empty submit', async ({ page }) => {`);
  lines.push(`    await page.locator('[type="submit"]').click();`);
  if (requiredFields.length > 0) {
    lines.push(`    await expect(page.locator('[role="alert"]')).toBeVisible();`);
  }
  lines.push(`    await expect(page.locator('[data-civ-error-summary]')).toBeVisible();`);
  lines.push(`  });`);
  features.push('validation');

  // --- Test 2: fills and submits form successfully ---
  lines.push('');
  lines.push(`  test('fills and submits form successfully', async ({ page }) => {`);
  for (const field of allFields) {
    if (field.visibleWhen) continue; // skip conditional fields
    for (const action of fillAction(field)) {
      lines.push(`    ${action}`);
    }
  }
  lines.push('');
  lines.push(`    await page.locator('[type="submit"]').click();`);
  lines.push(`    await expect(page.locator('[data-civ-confirmation]')).toBeVisible();`);
  lines.push(`  });`);
  features.push('submission');

  // --- Test 3: form steps (if applicable) ---
  if (hasFormSteps) {
    lines.push('');
    lines.push(`  test('completes form steps', async ({ page }) => {`);
    for (let i = 0; i < schema.steps!.length; i++) {
      const step = schema.steps![i];
      lines.push(`    // Step ${i + 1}: ${step.title}`);
      lines.push(`    await expect(page.locator('[data-civ-step-title]')).toContainText('${step.title}');`);

      // Fill fields for this step
      const stepSections = schema.sections.filter((s) => s.step === i);
      for (const section of stepSections) {
        for (const field of section.fields) {
          if (field.visibleWhen) continue;
          for (const action of fillAction(field)) {
            lines.push(`    ${action}`);
          }
        }
      }

      if (i < schema.steps!.length - 1) {
        lines.push(`    await page.locator('[data-civ-next]').click();`);
      }
    }
    lines.push(`    await page.locator('[type="submit"]').click();`);
    lines.push(`    await expect(page.locator('[data-civ-confirmation]')).toBeVisible();`);
    lines.push(`  });`);
    features.push('form-steps');
  }

  // --- Test 4: conditional fields (if applicable) ---
  if (hasConditional) {
    const conditionalField = allFields.find((f) => f.visibleWhen)!;
    lines.push('');
    lines.push(`  test('shows conditional fields', async ({ page }) => {`);
    lines.push(`    // Field "${conditionalField.name}" should be hidden initially`);
    lines.push(`    await expect(page.locator('[data-civ-field="${conditionalField.name}"]')).toBeHidden();`);
    lines.push('');
    lines.push(`    // Trigger the condition to show the field`);
    lines.push(`    // (Fill in the controlling field to reveal "${conditionalField.name}")`);
    lines.push(`    // TODO: Fill the controlling field with the value that triggers visibility`);
    lines.push('');
    lines.push(`    await expect(page.locator('[data-civ-field="${conditionalField.name}"]')).toBeVisible();`);
    lines.push(`  });`);
    features.push('conditional');
  }

  // --- Test 5: repeatable sections (if applicable) ---
  if (hasRepeatable) {
    const repeatableSection = schema.sections.find((s) => s.repeatable)!;
    const heading = repeatableSection.heading ?? 'Section';
    lines.push('');
    lines.push(`  test('adds and removes repeatable items', async ({ page }) => {`);
    lines.push(`    // Add a new "${heading}" instance`);
    lines.push(`    const addButton = page.locator('[data-civ-repeatable-add]');`);
    lines.push(`    await addButton.click();`);
    lines.push('');
    lines.push(`    // Verify a new instance was added`);
    lines.push(`    const items = page.locator('[data-civ-repeatable-item]');`);
    lines.push(`    await expect(items).toHaveCount(2);`);
    lines.push('');
    lines.push(`    // Remove the second instance`);
    lines.push(`    await page.locator('[data-civ-repeatable-remove]').last().click();`);
    lines.push(`    await expect(items).toHaveCount(1);`);
    lines.push(`  });`);
    features.push('repeatable');
  }

  // --- Test 6: save and resume (if applicable) ---
  if (hasSaveResume) {
    lines.push('');
    lines.push(`  test('saves and resumes form progress', async ({ page }) => {`);
    lines.push(`    // Fill some fields`);
    if (allFields.length > 0) {
      const field = allFields.find((f) => !f.visibleWhen) ?? allFields[0];
      for (const action of fillAction(field)) {
        lines.push(`    ${action}`);
      }
    }
    lines.push('');
    lines.push(`    // Save progress`);
    lines.push(`    await page.locator('[data-civ-save]').click();`);
    lines.push(`    await expect(page.locator('[data-civ-last-saved]')).toBeVisible();`);
    lines.push('');
    lines.push(`    // Reload and verify data persisted`);
    lines.push(`    await page.reload();`);
    if (allFields.length > 0) {
      const field = allFields.find((f) => !f.visibleWhen) ?? allFields[0];
      if (['text', 'email', 'tel', 'number', 'password', 'search', 'url', 'ssn', 'zip', 'textarea'].includes(field.type)) {
        const inputTag = field.type === 'textarea' ? 'textarea' : 'input';
        lines.push(`    await expect(page.locator('[data-civ-field="${field.name}"] ${inputTag}')).toHaveValue('Test value');`);
      }
    }
    lines.push(`  });`);
    features.push('save-resume');
  }

  lines.push('});');
  lines.push('');

  const code = lines.join('\n');

  // Count tests: 2 base + conditional features
  let testCount = 2;
  if (hasFormSteps) testCount++;
  if (hasConditional) testCount++;
  if (hasRepeatable) testCount++;
  if (hasSaveResume) testCount++;

  return { filename, code, testCount, features };
}
