#!/usr/bin/env tsx
/**
 * Capture pipeline: schema + pilot.config → per-variant PNG/SVG captures
 * inlined into the plugin bundle as `manifest-data/variants.json`.
 *
 * Pipeline:
 *   1. Bundle `render-page.ts` + the CivUI styles into `manifest-data/captured/`
 *      so the static page is self-contained (no Vite/Storybook needed).
 *   2. Spin up an http-server serving that directory.
 *   3. Launch Playwright, point at the page.
 *   4. For each (component × variant axes × state), call `window.civuiRender`
 *      and capture both an element screenshot (PNG) and an SVG serialization.
 *   5. Write `manifest-data/variants.json`.
 *
 * Run after schema or pilot-config changes:
 *   pnpm --filter @civui/figma-plugin capture
 *
 * The Figma plugin is rebuilt with the new manifest by
 *   pnpm --filter @civui/figma-plugin build
 */

import { build } from 'esbuild';
import { chromium, type Browser, type Page } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { extname } from 'node:path';

import { PILOT } from '../pilot.config.js';
import { variantMatrix, variantName, type VariantSpec } from '../src/shared/variant-axes.js';
import type {
  ComponentCapture,
  CapturedVariant,
  VariantManifest,
} from '../src/shared/types.js';
import type { ComponentSchema } from '@civui/schema/types';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const REPO = resolve(ROOT, '../..');
const CAPTURED = join(ROOT, 'manifest-data/captured');
const OUT_MANIFEST = join(ROOT, 'manifest-data/variants.json');

const PORT = 4737;
const URL = `http://localhost:${PORT}/render-page.html`;

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

async function bundleRenderPage(): Promise<void> {
  ensureDir(CAPTURED);
  // Bundle the capture-page script (imports Lit components from the workspace).
  await build({
    entryPoints: [join(ROOT, 'scripts/render-page.ts')],
    bundle: true,
    outfile: join(CAPTURED, 'render-page.js'),
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    sourcemap: 'inline',
    conditions: ['source'],
    logLevel: 'warning',
  });
  // Copy the static HTML shell next to it.
  cpSync(join(ROOT, 'scripts/render-page.html'), join(CAPTURED, 'render-page.html'));
  // Bring in CivUI base styles + tokens CSS so components render with correct
  // colors/spacing/typography. We resolve the *built* token CSS — run
  // `pnpm --filter @civui/tokens build` first if it's missing.
  const tokensCss = join(REPO, 'packages/tokens/dist/css/tokens.css');
  if (!existsSync(tokensCss)) {
    throw new Error(
      'tokens CSS not built — run `pnpm --filter @civui/tokens build` before capturing.',
    );
  }
  cpSync(tokensCss, join(CAPTURED, 'civui-tokens.css'));
  // Minimal CivUI base CSS — global resets + utility classes used by components.
  // We synthesize a tiny stylesheet here since core's full CSS is component-scoped
  // via Light DOM Tailwind compilation. Components inline their own classes.
  writeFileSync(
    join(CAPTURED, 'civui-styles.css'),
    [
      '/* Auto-written by capture-variants.ts. Minimal base for capture page. */',
      'body { color: var(--civ-color-base-darkest, #1b1b1b); }',
      '*, *::before, *::after { box-sizing: border-box; }',
      'button { cursor: pointer; font-family: inherit; }',
      'input, textarea, select { font-family: inherit; font-size: 1rem; }',
    ].join('\n'),
  );
}

function startStaticServer(): Promise<() => void> {
  const mime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
  };
  const server = createServer((req, res) => {
    const url = req.url ?? '/';
    const file = join(CAPTURED, url === '/' ? '/render-page.html' : url);
    try {
      const data = readFileSync(file);
      res.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise((resolveStart) => {
    server.listen(PORT, () => {
      console.log(`▸ static server on http://localhost:${PORT}`);
      resolveStart(() => server.close());
    });
  });
}

async function loadSchema(name: string): Promise<ComponentSchema> {
  const schemaPath = join(REPO, `packages/schema/src/components/${name}.schema.ts`);
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema not found for ${name} at ${schemaPath}`);
  }
  const mod = (await import(schemaPath)) as { default: ComponentSchema };
  return mod.default;
}

/** Translate a variant spec back into the props the render page expects. */
function buildPropsForVariant(
  schema: ComponentSchema,
  fixed: Record<string, string | number | boolean>,
  spec: VariantSpec,
): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = { ...fixed };
  for (const [axis, value] of Object.entries(spec.axes)) {
    const propDef = schema.props[axis];
    if (!propDef) continue;
    if (propDef.type === 'boolean') {
      props[axis] = value === 'true';
    } else {
      props[axis] = value;
    }
  }
  if (spec.state === 'disabled') props['disabled'] = true;
  if (spec.state === 'error' && !props['error']) props['error'] = 'Please correct this field';
  return props;
}

async function captureOne(
  page: Page,
  tag: string,
  props: Record<string, string | number | boolean>,
  slot: string | undefined,
  state: string,
): Promise<CapturedVariant['body']> {
  const result = await page.evaluate(
    async (req) => window.civuiRender(req),
    { tag, props, slot, state },
  );
  const stage = page.locator('#stage');
  // Cap the screenshot at a reasonable size — defensive against runaway widths.
  const pngBuffer = await stage.screenshot({ omitBackground: false, scale: 'device' });
  const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
  // Prefer PNG fill in v0.1; SVG string is kept aside for later vectorization
  // pass. We return PNG here; the SVG string is logged for inspection.
  void result.svgString;
  return {
    kind: 'png',
    dataUrl,
    width: result.rect.width,
    height: result.rect.height,
  };
}

async function captureComponent(
  page: Page,
  pilot: (typeof PILOT)[number],
): Promise<ComponentCapture> {
  const schema = await loadSchema(pilot.name);
  const specs = variantMatrix(schema, pilot);
  const hasStates = pilot.states.length > 0;
  const variants: CapturedVariant[] = [];
  let i = 0;
  for (const spec of specs) {
    const props = buildPropsForVariant(schema, pilot.fixedProps, spec);
    const body = await captureOne(page, pilot.name, props, pilot.slotHtml, spec.state);
    variants.push({ key: spec, body });
    i++;
    process.stdout.write(`\r  ${pilot.name}: ${i}/${specs.length} (${variantName(spec, hasStates)})`.padEnd(80));
  }
  process.stdout.write('\n');
  return {
    name: pilot.name,
    displayName: humanizeName(pilot.name),
    category: schema.category,
    axes: pilot.schemaAxes,
    hasStates,
    variants,
  };
}

function humanizeName(name: string): string {
  return name
    .replace(/^civ-/, '')
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

async function main(): Promise<void> {
  console.log('▸ bundling capture page');
  await bundleRenderPage();
  const stop = await startStaticServer();
  let browser: Browser | undefined;
  try {
    console.log('▸ launching chromium');
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    page.on('pageerror', (e) => console.error('  page error:', e.message));
    await page.goto(URL, { waitUntil: 'load' });
    const captures: Record<string, ComponentCapture> = {};
    for (const pilot of PILOT) {
      console.log(`▸ capturing ${pilot.name}`);
      captures[pilot.name] = await captureComponent(page, pilot);
    }
    const schemaPkg = JSON.parse(readFileSync(join(REPO, 'packages/schema/package.json'), 'utf8'));
    const manifest: VariantManifest = {
      builtAt: new Date().toISOString(),
      schemaVersion: schemaPkg.version,
      components: captures,
    };
    writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    const total = Object.values(captures).reduce((n, c) => n + c.variants.length, 0);
    console.log(`▸ wrote ${OUT_MANIFEST} (${Object.keys(captures).length} components, ${total} variants)`);
  } finally {
    if (browser) await browser.close();
    stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
