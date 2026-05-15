#!/usr/bin/env tsx
/**
 * Headless end-to-end smoke test for one or more regenerated VA form
 * pages.
 *
 * Boots a Chromium instance via Playwright, loads the dev server's
 * copy of each form, and reports whether:
 *   - the page resolves (HTTP 200)
 *   - no console errors fired during load
 *   - every `<civ-*>` custom element in the DOM has been upgraded
 *     (i.e. `customElements.get(tag)` is defined)
 *   - the intro page's two start buttons rendered and are clickable
 *   - clicking one of them transitions to the task-list hub
 *
 * Run with the dev server already up on :5173:
 *
 *   pnpm --filter civ-site dev &                # leave running
 *   pnpm --filter civ-site verify-form          # checks 21-526ez (default)
 *   pnpm --filter civ-site verify-form 10-10ez  # checks one specific form
 *   pnpm --filter civ-site verify-form all      # sweeps every form in forms/
 *
 * Single-form mode prints verbose per-check output and the form's
 * civ-* tag list. `all` mode prints one summary line per form and
 * only expands details when a form fails — kept terse so a 20-form
 * sweep fits on a screen.
 *
 * The check is a sanity pass — it does NOT fill the entire form. If
 * the intro → hub transition works and components register, the
 * upstream wiring (CDN-rewrite, Vite aliases, component registration)
 * is verified. Subsequent breakage is more likely component-specific.
 */
// `@playwright/test` re-exports the browser API; the standalone
// `playwright` package isn't a devDep on this repo.
import { chromium, type Browser } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORMS_DIR = join(__dirname, '..', 'forms');

interface CheckResult {
  name: string;
  pass: boolean;
  detail?: string;
}

interface FormResult {
  form: string;
  checks: CheckResult[];
}

function listAllForms(): string[] {
  return readdirSync(FORMS_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => f.replace(/\.html$/, ''))
    .sort();
}

async function verifyForm(browser: Browser, form: string): Promise<FormResult> {
  const url = `http://localhost:5173/forms/${form}.html`;
  const context = await browser.newContext();
  const page = await context.newPage();
  const checks: CheckResult[] = [];
  const record = (name: string, pass: boolean, detail?: string): void => {
    checks.push({ name, pass, detail });
  };

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });

  // Failed network requests so we can attribute "components don't
  // register" to the actual underlying 404 (e.g. CDN-imports).
  const failedRequests: { url: string; status: number }[] = [];
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      failedRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  try {
    // `networkidle` doesn't work with Vite dev — HMR WebSocket keeps
    // the network "active" forever. Wait for `load`, then poll until
    // civ-button is upgraded, which means the local civui.ts module
    // finished resolving + registering.
    const response = await page.goto(url, { waitUntil: 'load', timeout: 15_000 });
    record('page loads (HTTP 200)', response?.status() === 200, `status=${response?.status()}`);

    try {
      await page.waitForFunction(() => customElements.get('civ-button') !== undefined, null, {
        timeout: 10_000,
      });
    } catch {
      // Fall through — the registration check below will record the failure.
    }

    // Custom elements: sample every `<civ-*>` tag and check whether
    // the browser has a constructor for it.
    const customElementReport = await page.evaluate(() => {
      const tags = new Set<string>();
      document.querySelectorAll('*').forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag.startsWith('civ-')) tags.add(tag);
      });
      const result: Record<string, boolean> = {};
      tags.forEach((tag) => {
        result[tag] = customElements.get(tag) !== undefined;
      });
      return result;
    });
    const civTags = Object.keys(customElementReport);
    const unregistered = civTags.filter((t) => !customElementReport[t]);
    record(
      `${civTags.length} civ-* custom elements on intro page`,
      civTags.length > 0,
      civTags.join(', '),
    );
    record(
      'all civ-* tags upgraded (customElements.get(...) defined)',
      unregistered.length === 0,
      unregistered.length > 0 ? `missing: ${unregistered.join(', ')}` : 'all defined',
    );

    // Intro start buttons.
    const startButtons = await page.evaluate(() => {
      const signedIn = document.querySelector('civ-button[data-start-signed-in]');
      const guest = document.querySelector('civ-button[data-start-guest]');
      return {
        hasSignedIn: !!signedIn,
        hasGuest: !!guest,
        signedInRendered: signedIn?.shadowRoot
          ? signedIn.shadowRoot.querySelector('button') !== null
          : signedIn?.querySelector('button') !== null,
      };
    });
    record('intro page has "Start signed-in" button', startButtons.hasSignedIn);
    record('intro page has "Start guest" button', startButtons.hasGuest);
    record('start buttons rendered a native <button>', startButtons.signedInRendered);

    // Intro → hub transition.
    await page.locator('civ-button[data-start-guest]').click();
    await page.waitForTimeout(200);
    const hubVisible = await page.evaluate(() => {
      const hub = document.querySelector('section[data-page="hub"]');
      const intro = document.querySelector('section[data-page="intro"]');
      return {
        hubHidden: hub?.hasAttribute('hidden') ?? true,
        introHidden: intro?.hasAttribute('hidden') ?? false,
      };
    });
    record('clicking start guest reveals the hub section', !hubVisible.hubHidden);
    record('clicking start guest hides the intro section', hubVisible.introHidden);

    record(
      'no failed network requests',
      failedRequests.length === 0,
      failedRequests.length > 0
        ? failedRequests.map((r) => `${r.status} ${r.url}`).join('\n      ')
        : '0 failures',
    );

    record(
      'no console errors',
      consoleErrors.length === 0,
      consoleErrors.length > 0 ? consoleErrors.join('\n      ') : '0 errors',
    );
  } catch (err) {
    record('verification ran to completion', false, (err as Error).message);
  } finally {
    await context.close();
  }

  return { form, checks };
}

function printSingleFormReport(result: FormResult): boolean {
  console.log(`Verifying http://localhost:5173/forms/${result.form}.html\n`);
  let allPass = true;
  for (const c of result.checks) {
    const mark = c.pass ? '✓' : '✗';
    console.log(`  ${mark} ${c.name}${c.detail ? `  (${c.detail})` : ''}`);
    if (!c.pass) allPass = false;
  }
  console.log('');
  if (allPass) {
    console.log(`All checks passed for ${result.form}.`);
  } else {
    const failed = result.checks.filter((c) => !c.pass).length;
    console.error(`${failed} check(s) failed for ${result.form}.`);
  }
  return allPass;
}

function printSweepRow(result: FormResult): boolean {
  const failedChecks = result.checks.filter((c) => !c.pass);
  const allPass = failedChecks.length === 0;
  const mark = allPass ? '✓' : '✗';
  console.log(`  ${mark} ${result.form}`);
  if (!allPass) {
    for (const c of failedChecks) {
      console.log(`      ✗ ${c.name}${c.detail ? `  (${c.detail})` : ''}`);
    }
  }
  return allPass;
}

async function main(): Promise<void> {
  const arg = process.argv[2] ?? '21-526ez';
  const isSweep = arg === 'all';
  const forms = isSweep ? listAllForms() : [arg];

  const browser = await chromium.launch({ headless: true });
  try {
    if (isSweep) {
      console.log(`Sweeping ${forms.length} form(s) against http://localhost:5173\n`);
    }
    const failedForms: string[] = [];
    for (const form of forms) {
      const result = await verifyForm(browser, form);
      const pass = isSweep ? printSweepRow(result) : printSingleFormReport(result);
      if (!pass) failedForms.push(form);
    }
    if (isSweep) {
      console.log('');
      if (failedForms.length === 0) {
        console.log(`All ${forms.length} form(s) passed every check.`);
      } else {
        console.error(
          `${failedForms.length} of ${forms.length} form(s) failed: ${failedForms.join(', ')}`,
        );
      }
    }
    if (failedForms.length > 0) process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
