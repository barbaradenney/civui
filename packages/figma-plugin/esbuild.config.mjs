#!/usr/bin/env node
// Build the Figma plugin sandbox bundle (code.js) and the UI HTML bundle.
//
// The Figma plugin runtime is a QuickJS-like sandbox: no Node, no fetch
// (without networkAccess), no DOM. The UI runs in a normal iframe with
// full browser APIs. We bundle them separately and inline the variant
// manifest + token subset into code.js at build time so the plugin
// doesn't need network access at runtime.

import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = HERE;
const DIST = join(ROOT, 'dist');
const MANIFEST_DATA = join(ROOT, 'manifest-data');
const WATCH = process.argv.includes('--watch');

if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

function readJsonOrEmpty(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

// Inline the variant manifest + tokens subset as JSON constants the
// plugin bundle can read synchronously. If they haven't been generated
// yet, we ship empty objects so the plugin still loads.
const variantManifest = readJsonOrEmpty(join(MANIFEST_DATA, 'variants.json'), { components: {} });
const tokenSubset = readJsonOrEmpty(join(MANIFEST_DATA, 'tokens.json'), { colors: {}, spacing: {}, radii: {} });

const define = {
  __VARIANT_MANIFEST__: JSON.stringify(variantManifest),
  __TOKEN_SUBSET__: JSON.stringify(tokenSubset),
};

const codeOptions = {
  entryPoints: [join(ROOT, 'src/code.ts')],
  bundle: true,
  outfile: join(DIST, 'code.js'),
  target: 'es2017',
  format: 'iife',
  platform: 'browser',
  define,
  logLevel: 'info',
};

const uiOptions = {
  entryPoints: [join(ROOT, 'src/ui/ui.ts')],
  bundle: true,
  outfile: join(DIST, 'ui.js'),
  target: 'es2017',
  format: 'iife',
  platform: 'browser',
  logLevel: 'info',
};

function writeUiHtml() {
  const shell = readFileSync(join(ROOT, 'src/ui/ui.html'), 'utf8');
  const js = readFileSync(join(DIST, 'ui.js'), 'utf8');
  const html = shell.replace('<!-- UI_BUNDLE -->', `<script>${js}</script>`);
  writeFileSync(join(DIST, 'ui.html'), html);
  console.log('▸ wrote dist/ui.html (UI bundle inlined)');
}

if (WATCH) {
  const codeCtx = await context(codeOptions);
  const uiCtx = await context(uiOptions);
  await codeCtx.watch();
  await uiCtx.watch();
  setInterval(writeUiHtml, 500);
  console.log('▸ esbuild watching');
} else {
  await build(codeOptions);
  await build(uiOptions);
  writeUiHtml();
}
