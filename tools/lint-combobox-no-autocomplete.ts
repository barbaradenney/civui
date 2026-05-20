#!/usr/bin/env tsx
/**
 * lint-combobox-no-autocomplete — forbid the `autocomplete` HTML
 * attribute on `<civ-combobox>` and combobox-derived presets
 * (`<civ-country>`, etc.) anywhere in the repo.
 *
 * Why
 * ---
 * Browser autofill dropdowns compete with the combobox's own listbox.
 * When the browser offers a saved value (e.g., a country name), it
 * either visually stacks on top of the combobox's options or fills
 * the field with a string that doesn't match any real option — leaving
 * the field in a broken state where the visible label says "United
 * Sta..." but the underlying value is empty.
 *
 * `<civ-combobox>` hardcodes `autocomplete="off"` on its internal
 * `<input>`. Any `autocomplete=` attribute on the host custom element
 * is either:
 *   (a) silently ignored (it doesn't propagate to the inner input
 *       because civ-combobox doesn't declare it as a `@property`), OR
 *   (b) actively misleading — a maintainer reading the code expects
 *       autocomplete to work, doesn't realize the inner input
 *       overrides it.
 *
 * Either way it's a code smell. Worse: it may cue browser autofill
 * heuristics that read attributes on neighboring elements, weakening
 * the off-by-default.
 *
 * Scope
 * -----
 * Scans `.ts`, `.tsx`, `.stories.ts`, `.mdx`, and `.twig` files for:
 *   <civ-combobox … autocomplete=…>
 *   <civ-country … autocomplete=…>
 * Includes attribute split across lines.
 *
 * Add new combobox-wrapping presets to the COMBOBOX_TAGS list below
 * if any are introduced (e.g., a hypothetical civ-state combobox).
 *
 * Run via `pnpm lint:combobox-no-autocomplete`. Wired into
 * `pnpm validate:lints` so the drift-lints CI gate catches it.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { stripComments } from './lint-utils/strip-comments.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS = ['packages', 'apps', 'tools'];

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.mdx', '.twig']);

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.next',
  '.docusaurus',
  'storybook-static',
  'coverage',
  '.turbo',
]);

/**
 * Custom elements that wrap (or are) civ-combobox. Adding
 * `autocomplete=` to any of these short-circuits the combobox's
 * built-in `autocomplete="off"` defense.
 */
const COMBOBOX_TAGS = ['civ-combobox', 'civ-country'];

/**
 * Files allowed to mention `<civ-combobox … autocomplete=…>` because
 * they document the anti-pattern (this lint itself, the lint rule's
 * docs page if any). Empty for now — extend if needed.
 */
const ALLOWLIST: string[] = [
  'tools/lint-combobox-no-autocomplete.ts',
];

interface Finding {
  file: string;
  line: number;
  tag: string;
  snippet: string;
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRECTORIES.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile()) {
      const ext = path.extname(e.name);
      // Match either standalone extensions or compound .stories.ts
      if (SCAN_EXTENSIONS.has(ext)) yield full;
    }
  }
}

function tagRegex(tag: string): RegExp {
  // Match `<tag ... autocomplete=...>` across multi-line attributes.
  // `[^>]*?` is non-greedy so the regex doesn't run past the next `>`.
  // `\s` covers whitespace including newlines (with the `s` flag).
  return new RegExp(`<${tag}\\b[^>]*?\\sautocomplete\\s*=`, 'is');
}

async function scanFile(file: string): Promise<Finding[]> {
  const relative = path.relative(REPO_ROOT, file);
  if (ALLOWLIST.includes(relative)) return [];

  const raw = await fs.readFile(file, 'utf-8');
  // Strip JS/TS comments so JSDoc examples like
  // `<civ-combobox autocomplete="off">` inside `/* ... */` blocks
  // don't get flagged. Only .ts / .tsx go through the stripper —
  // .mdx and .twig use other comment forms and rarely show this
  // pattern in their bodies.
  const ext = path.extname(file);
  const content = (ext === '.ts' || ext === '.tsx') ? stripComments(raw, '.ts') : raw;
  const findings: Finding[] = [];

  for (const tag of COMBOBOX_TAGS) {
    const re = tagRegex(tag);
    const match = content.match(re);
    if (!match) continue;
    // Find the line number of the match by counting newlines before
    // the match index.
    const idx = match.index ?? 0;
    const line = content.slice(0, idx).split('\n').length;
    const snippet = match[0].length > 120 ? match[0].slice(0, 120) + '…' : match[0];
    findings.push({ file: relative, line, tag, snippet });
  }

  return findings;
}

async function main(): Promise<void> {
  const findings: Finding[] = [];

  for (const root of SCAN_ROOTS) {
    const rootPath = path.join(REPO_ROOT, root);
    for await (const file of walk(rootPath)) {
      const results = await scanFile(file);
      findings.push(...results);
    }
  }

  if (findings.length === 0) {
    console.log('✓ no `autocomplete=` attributes on civ-combobox or combobox-derived presets.');
    return;
  }

  console.error(`✗ ${findings.length} autocomplete= reference(s) on combobox elements.\n`);
  console.error('Why: <civ-combobox> sets autocomplete="off" internally on its');
  console.error('     inner <input>. Browser autofill dropdowns compete with the');
  console.error('     combobox listbox and break the field. Drop the attribute.');
  console.error('     See lint-combobox-no-autocomplete.ts for full rationale.\n');

  for (const { file, line, tag, snippet } of findings) {
    console.error(`  ${file}:${line}  <${tag} … autocomplete=…>`);
    console.error(`    ${snippet}`);
  }

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
