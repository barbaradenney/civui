#!/usr/bin/env tsx
/**
 * Headless end-to-end smoke test for a regenerated VA form page.
 *
 * Boots a Chromium instance via Playwright, loads the dev server's
 * copy of the form, and reports whether:
 *   - the page resolves (HTTP 200)
 *   - no console errors fired during load
 *   - every `<civ-*>` custom element in the DOM has been upgraded
 *     (i.e. `customElements.get(tag)` is defined)
 *   - the intro page's two start buttons rendered and are clickable
 *   - clicking one of them transitions to the task-list hub
 *
 * Run with the dev server already up on :5173:
 *
 *   pnpm --filter civ-site dev &           # leave running
 *   pnpm --filter civ-site verify-form     # checks 21-526ez by default
 *   pnpm --filter civ-site verify-form 10-10ez
 *
 * The check is a sanity pass — it does NOT fill the entire form. If
 * the intro → hub transition works and components register, the
 * upstream wiring (CDN-rewrite, Vite aliases, component registration)
 * is verified. Subsequent breakage is more likely component-specific.
 */
// `@playwright/test` re-exports the browser API; the standalone
// `playwright` package isn't a devDep on this repo.
import { chromium } from '@playwright/test';

const FORM = process.argv[2] ?? '21-526ez';
const URL = `http://localhost:5173/forms/${FORM}.html`;

interface CheckResult {
  name: string;
  pass: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail?: string): void {
  results.push({ name, pass, detail });
}

async function main(): Promise<void> {
  console.log(`Verifying ${URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });

  // Track failed network requests so we can attribute "components
  // don't register" to the actual underlying 404 (e.g. CDN-imports).
  const failedRequests: { url: string; status: number }[] = [];
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      failedRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  // Load the page. `networkidle` doesn't work with Vite dev — its HMR
  // WebSocket keeps the network "active" forever. Wait for `load`,
  // then poll until at least one civ-button is upgraded, which means
  // the local civui.ts module finished resolving + registering.
  const response = await page.goto(URL, { waitUntil: 'load', timeout: 15_000 });
  record('page loads (HTTP 200)', response?.status() === 200, `status=${response?.status()}`);

  // Wait for component registration to finish. Polls customElements
  // until civ-button is defined or the timeout expires.
  try {
    await page.waitForFunction(() => customElements.get('civ-button') !== undefined, null, {
      timeout: 10_000,
    });
  } catch {
    // Fall through — the registration check below will record the failure.
  }

  // Custom elements registration. We sample the DOM for every `<civ-*>`
  // tag present and ask the browser whether the constructor is defined.
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

  // Intro start buttons: data-start-signed-in + data-start-guest are the
  // generator's stable hooks on the two civ-button elements.
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

  // Intro → hub transition. The generator wires both start buttons to
  // toggle the intro section off and the hub section on. We click the
  // guest button, wait for the hub to be visible, and confirm.
  await page.locator('civ-button[data-start-guest]').click();
  // Give the click handler a tick to swap sections.
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

  // Failed network requests (CDN 404s, missing module files, etc).
  record(
    'no failed network requests',
    failedRequests.length === 0,
    failedRequests.length > 0
      ? failedRequests.map((r) => `${r.status} ${r.url}`).join('\n      ')
      : '0 failures',
  );

  // Console errors.
  record(
    'no console errors',
    consoleErrors.length === 0,
    consoleErrors.length > 0 ? consoleErrors.join('\n      ') : '0 errors',
  );

  await browser.close();

  // Report.
  console.log('');
  let allPass = true;
  for (const r of results) {
    const mark = r.pass ? '✓' : '✗';
    console.log(`  ${mark} ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
    if (!r.pass) allPass = false;
  }
  console.log('');
  if (allPass) {
    console.log(`All checks passed for ${FORM}.`);
  } else {
    const failed = results.filter((r) => !r.pass).length;
    console.error(`${failed} check(s) failed for ${FORM}.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
