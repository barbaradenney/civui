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
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORMS_DIR = join(__dirname, '..', 'forms');
const DIST_DIR = join(__dirname, '..', 'dist');
const SERVER_URL = 'http://localhost:5173';
const SERVER_PORT = 5173;

interface ServerHandle {
  /** Stop the server we started, or no-op if we adopted an existing one. */
  teardown: () => Promise<void>;
  /** True when we spawned http-server against `dist/`; false when we adopted an existing dev server. */
  spawned: boolean;
}

async function isPortAlive(): Promise<boolean> {
  try {
    const resp = await fetch(SERVER_URL, { signal: AbortSignal.timeout(500) });
    // Any HTTP response means something's listening; we don't care about status here.
    return resp.status > 0;
  } catch {
    return false;
  }
}

/**
 * Make sure something is serving on :5173 before we hand the URL to
 * Playwright. Strategy:
 *
 *   1. If a server already responds — use it. The developer is running
 *      `pnpm --filter civ-site dev` and we adopt that session.
 *   2. Otherwise spawn `npx http-server dist/` and wait for it to come
 *      up. Used by `pnpm validate` after `validate:builds` produces
 *      dist/. Self-contained, no manual dev-server prep.
 *
 * Errors out clearly if neither option is available (no port, no dist).
 */
async function ensureServer(): Promise<ServerHandle> {
  if (await isPortAlive()) {
    return { teardown: async () => {}, spawned: false };
  }

  if (!existsSync(join(DIST_DIR, 'forms'))) {
    throw new Error(
      `Nothing is serving ${SERVER_URL} and ${DIST_DIR} doesn't exist.\n` +
        `Either:\n` +
        `  - run \`pnpm --filter civ-site dev\` in another shell (hot-reloading), or\n` +
        `  - run \`pnpm --filter civ-site build\` first to produce dist/.`,
    );
  }

  // `npx http-server -s` is silent so it doesn't clutter validate output.
  // The package itself is downloaded once and cached by npm.
  const proc = spawn('npx', ['--yes', 'http-server', DIST_DIR, '-p', String(SERVER_PORT), '-s'], {
    stdio: 'pipe',
    detached: false,
  });
  // Surface fatal spawn errors but otherwise discard the noise.
  proc.on('error', (err) => {
    console.error(`failed to start http-server: ${err.message}`);
  });

  // Poll until the port responds, max ~10s.
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (await isPortAlive()) {
      return { teardown: () => stopServer(proc), spawned: true };
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  await stopServer(proc);
  throw new Error(`http-server failed to come up on :${SERVER_PORT} within 10s.`);
}

async function stopServer(proc: ChildProcess): Promise<void> {
  if (proc.exitCode !== null) return; // already exited
  proc.kill('SIGTERM');
  // Give it a tick to exit cleanly, then SIGKILL.
  for (let i = 0; i < 10; i++) {
    if (proc.exitCode !== null) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  if (proc.exitCode === null) proc.kill('SIGKILL');
}

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

    // The generator's runtime wraps click-handler wiring in
    // `onReady` with `setTimeout(fn, 100)` after DOMContentLoaded.
    // In dist mode the bundled JS finishes so fast that the
    // `customElements.get(...)` poll above unblocks before that
    // setTimeout fires, so Playwright clicked the start button
    // before any listener was attached. A short post-registration
    // wait (longer than the generator's 100ms timer) closes the race.
    await page.waitForTimeout(200);

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

    // Intro → hub transition. Poll for the section swap rather than a
    // fixed wait — the click handler runs through the generator's
    // runtime script which can take a beat to wire up after component
    // registration, especially with the bundled dist/ output where
    // every form's JS is loaded as one file.
    await page.locator('civ-button[data-start-guest]').click();
    let hubVisible = { hubHidden: true, introHidden: false };
    const transitionDeadline = Date.now() + 3000;
    while (Date.now() < transitionDeadline) {
      hubVisible = await page.evaluate(() => {
        const hub = document.querySelector('section[data-page="hub"]');
        const intro = document.querySelector('section[data-page="intro"]');
        return {
          hubHidden: hub?.hasAttribute('hidden') ?? true,
          introHidden: intro?.hasAttribute('hidden') ?? false,
        };
      });
      if (!hubVisible.hubHidden && hubVisible.introHidden) break;
      await page.waitForTimeout(100);
    }
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

/**
 * Exercise the signed-in / prefill flow on one representative form.
 * The runtime that handles prefill is generated identically into every
 * form, so testing once at the end of a sweep is enough.
 *
 * Asserts: pressing the prefill Continue button when every field in
 * the chapter is prefilled marks the chapter Complete and lands the
 * user back on the hub (regression caught by this: a scope bug threw
 * silently inside the prefill setup and the Continue click did
 * nothing).
 */
async function verifyPrefillFlow(browser: Browser): Promise<FormResult> {
  const form = '21-526ez';
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

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 15_000 });
    await page.waitForFunction(() => customElements.get('civ-button') !== undefined, null, {
      timeout: 10_000,
    });
    await page.waitForTimeout(200);

    // Signed-in path applies the sample prefill before opening the hub.
    await page.locator('civ-button[data-start-signed-in]').click();
    await page.waitForTimeout(300);

    // Personal info gets every field prefilled in the sample data, so
    // its prefill review should be the visible content inside the
    // chapter.
    await page.locator('civ-list-item[data-chapter-id="personal-info"] a').click();
    await page.waitForTimeout(300);

    const reviewState = await page.evaluate(() => {
      const review = document.querySelector('[data-chapter="personal-info"] [data-prefill-review]');
      const steps = document.querySelector('[data-chapter="personal-info"] [data-chapter-steps]');
      return {
        reviewShown: review ? !(review as HTMLElement).hidden : false,
        stepsHidden: steps ? (steps as HTMLElement).hidden : false,
      };
    });
    record('prefill review is visible on the prefilled chapter', reviewState.reviewShown);
    record('chapter form steps are hidden behind the review', reviewState.stepsHidden);

    await page.locator('[data-chapter="personal-info"] [data-prefill-continue]').click();
    await page.waitForTimeout(300);

    const after = await page.evaluate(() => {
      const hub = document.querySelector('section[data-page="hub"]') as HTMLElement | null;
      const item = document.querySelector('civ-list-item[data-chapter-id="personal-info"]');
      const badge = item && item.querySelector('civ-badge');
      return {
        hubVisible: hub ? !hub.hidden : false,
        badgeLabel: badge ? badge.getAttribute('label') : null,
        badgeVariant: badge ? badge.getAttribute('variant') : null,
      };
    });
    record(
      'clicking prefill Continue lands on the hub',
      after.hubVisible,
      after.hubVisible ? 'hub visible' : 'hub still hidden',
    );
    record(
      'clicking prefill Continue marks the chapter Complete',
      after.badgeLabel === 'Complete' && after.badgeVariant === 'success',
      `badge=${after.badgeLabel}/${after.badgeVariant}`,
    );
    record(
      'no console errors during prefill flow',
      consoleErrors.length === 0,
      consoleErrors.length > 0 ? consoleErrors.join('\n      ') : '0 errors',
    );
  } catch (err) {
    record('prefill flow ran to completion', false, (err as Error).message);
  } finally {
    await context.close();
  }

  return { form: 'prefill flow (' + form + ')', checks };
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

  const server = await ensureServer();
  const browser = await chromium.launch({ headless: true });
  try {
    if (isSweep) {
      const source = server.spawned ? `dist/ via http-server` : `existing dev server`;
      console.log(`Sweeping ${forms.length} form(s) against ${SERVER_URL} (${source})\n`);
    }
    const failedForms: string[] = [];
    for (const form of forms) {
      const result = await verifyForm(browser, form);
      const pass = isSweep ? printSweepRow(result) : printSingleFormReport(result);
      if (!pass) failedForms.push(form);
    }

    // Sweep mode also exercises the signed-in / prefill flow once at
    // the end. The runtime is generated identically into every form,
    // so a single pass is enough — and a regression here is invisible
    // to the per-form check, which only walks the guest path.
    let prefillPassed = true;
    if (isSweep) {
      const prefillResult = await verifyPrefillFlow(browser);
      prefillPassed = printSweepRow(prefillResult);
      console.log('');
      const totalLine =
        failedForms.length === 0 && prefillPassed
          ? `All ${forms.length} form(s) passed every check, prefill flow OK.`
          : (failedForms.length > 0
              ? `${failedForms.length} of ${forms.length} form(s) failed: ${failedForms.join(', ')}`
              : '')
            + (!prefillPassed
              ? `${failedForms.length > 0 ? '\n' : ''}prefill flow failed.`
              : '');
      if (failedForms.length === 0 && prefillPassed) console.log(totalLine);
      else console.error(totalLine);
    }
    if (failedForms.length > 0 || !prefillPassed) process.exit(1);
  } finally {
    await browser.close();
    await server.teardown();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
