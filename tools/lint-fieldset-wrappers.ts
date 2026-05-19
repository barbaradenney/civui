#!/usr/bin/env npx tsx
/**
 * CivUI Self-Contained Group-Component Lint
 *
 * The six "group" form components are self-contained — they render their
 * own <fieldset> + legend / hint / error when given a `legend` prop, and
 * **must not** be wrapped in an external <civ-fieldset>. Doing so
 * produces nested fieldsets with double legends and breaks slot
 * relocation.
 *
 * This audit-only check scans packages, docs, and code generators for
 * the anti-pattern and fails the build with a list of file:line
 * locations.
 *
 * Self-contained group components covered:
 *   civ-memorable-date, civ-radio-group, civ-checkbox-group,
 *   civ-yes-no, civ-segmented-control, civ-date-range-picker
 *
 * Usage: pnpm lint:fieldsets
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { pathToFileURL } from 'url';
import { printRuleLink } from './lint-rule-links.js';

const ROOT = join(import.meta.dirname, '..');

const SELF_CONTAINED_GROUPS = [
  'civ-memorable-date',
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-yes-no',
  'civ-segmented-control',
  'civ-date-range-picker',
];

// Files / directories the linter should scan
const SCAN_ROOTS = [
  'packages',
  'apps/docs/docs',
  'docs',
  '.github/copilot-instructions.md',
];

// Subdirectories to skip
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'storybook-static',
  '.next',
]);

// File suffixes the linter should NOT scan (the components' own files
// are exempt — they implement the pattern, not consume it)
const SKIP_FILES = new Set([
  // Component impls + their stories (the components implement the
  // pattern, not consume it). Test files are skipped via the .test.ts
  // suffix check below — they legitimately exercise legacy back-compat
  // input patterns.
  'civ-memorable-date.ts',
  'civ-memorable-date.stories.ts',
  'civ-radio-group.ts',
  'civ-checkbox-group.ts',
  'civ-yes-no.ts',
  'civ-segmented-control.ts',
  'civ-date-range-picker.ts',
  // Validators that legitimately reference the strings
  'rules.ts',
  'suggest-fix.ts',
]);

// File extensions to scan
const SCAN_EXTS = new Set(['.ts', '.tsx', '.mdx', '.md', '.html', '.twig']);

interface Violation {
  file: string;
  line: number;
  fieldsetLine: number;
  inner: string;
  snippet: string;
}

const GROUPS_REGEX = new RegExp(
  `<(${SELF_CONTAINED_GROUPS.join('|')})\\b`,
);

function* walk(path: string): Generator<string> {
  try {
    const stat = statSync(path);
    if (stat.isFile()) {
      yield path;
      return;
    }
    if (!stat.isDirectory()) return;
  } catch {
    return;
  }
  for (const entry of readdirSync(path)) {
    if (SKIP_DIRS.has(entry)) continue;
    yield* walk(join(path, entry));
  }
}

/**
 * Strip inline-backtick spans from a line so markdown prose like
 * `<civ-fieldset>` (a tag NAME, not a tag USE) doesn't get counted
 * as either an open or a close. We only strip single-backtick spans —
 * triple-backtick fenced blocks contain real example HTML that the
 * linter SHOULD scan (anti-patterns in code samples propagate).
 */
function stripInlineTicks(line: string): string {
  return line.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
}

/**
 * Walk lines tracking civ-fieldset open/close depth. When a
 * self-contained group component opens at depth > 0, emit a violation.
 *
 * Triple-backtick fences (```html ... ```) toggle a code-block flag —
 * they're scanned for the anti-pattern (example HTML in docs counts).
 * Inline backticks `like this` are stripped so prose tag references
 * don't trip the linter.
 */
function lintFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');

  // Stack of line numbers where civ-fieldset opens are pending close
  const openStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = stripInlineTicks(raw);

    const opens = (line.match(/<civ-fieldset\b/g) || []).length;
    const closes = (line.match(/<\/civ-fieldset>/g) || []).length;

    for (let o = 0; o < opens; o++) openStack.push(i + 1);

    if (openStack.length > 0) {
      const m = line.match(GROUPS_REGEX);
      if (m) {
        violations.push({
          file: filePath,
          line: i + 1,
          fieldsetLine: openStack[openStack.length - 1],
          inner: m[1],
          snippet: raw.trim().slice(0, 100),
        });
      }
    }

    for (let c = 0; c < closes && openStack.length > 0; c++) openStack.pop();
  }

  return violations;
}

export function runLint(): { violations: Violation[]; filesScanned: number } {
  const violations: Violation[] = [];
  let filesScanned = 0;

  for (const root of SCAN_ROOTS) {
    for (const file of walk(join(ROOT, root))) {
      const ext = extname(file);
      if (!SCAN_EXTS.has(ext)) continue;
      const base = file.split('/').pop() ?? '';
      if (SKIP_FILES.has(base)) continue;
      // Tests can exercise legacy back-compat HTML deliberately —
      // skip them so the linter only flags consumer / doc / generator
      // code that actively propagates the anti-pattern.
      if (base.endsWith('.test.ts') || base.endsWith('.test.tsx')) continue;
      filesScanned++;
      violations.push(...lintFile(file));
    }
  }

  return { violations, filesScanned };
}

function main(): number {
  const { violations, filesScanned } = runLint();

  if (violations.length === 0) {
    console.log(`✓ ${filesScanned} files scanned — no self-contained group components wrapped in civ-fieldset.`);
    return 0;
  }

  console.log(`✗ ${violations.length} violations found across ${filesScanned} files scanned.\n`);
  console.log('Self-contained group components must NOT be wrapped in <civ-fieldset>.');
  console.log('Pass `legend` directly on the component — it renders its own fieldset.\n');

  for (const v of violations) {
    const rel = v.file.replace(ROOT + '/', '');
    console.log(`  ${rel}:${v.line}  <${v.inner}>  (inside fieldset opened at line ${v.fieldsetLine})`);
    console.log(`    ${v.snippet}`);
  }
  console.log();
  printRuleLink('fieldsets');
  return 1;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try {
    return import.meta.url === pathToFileURL(argv).href;
  } catch {
    return false;
  }
}

if (isCliInvocation()) {
  process.exit(main());
}
