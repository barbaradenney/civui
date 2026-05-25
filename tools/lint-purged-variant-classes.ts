#!/usr/bin/env tsx
/**
 * lint-purged-variant-classes — fail when a `civ-X--Y` BEM modifier
 * selector exists in components.css but the resolved class name is
 * never referenced as a literal string in any TypeScript source.
 *
 * The class of bug this catches (commit f315b575):
 *
 *   Components used to build danger classes via template literal:
 *
 *     `civ-action-btn--${this.variant}-danger`
 *
 *   Tailwind's content scanner parses TypeScript for static class
 *   strings; it doesn't evaluate template literals. With no literal
 *   match, Tailwind treats the corresponding rule in components.css
 *   as unused and silently drops it. The symptom is invisible — no
 *   console error, no test failure, just buttons rendering without
 *   their danger color.
 *
 *   Post-slice-6.2 refactor: danger is now emitted as a standalone
 *   `civ-btn--danger` / `civ-action-btn--danger` / `civ-link--danger`
 *   class, and CSS uses compound selectors. Both halves are static
 *   string literals in the source, so Tailwind preserves both rules.
 *   This lint continues to guard against future regressions where a
 *   per-variant modifier class is reintroduced via template literal.
 *
 * To prevent: every `.civ-X--Y` selector in components.css whose
 * class doesn't appear as a literal string in any `*.ts` file is
 * flagged. The fix is usually to tighten a test assertion to use the
 * full resolved class name (better test quality + Tailwind protection).
 *
 * Scope: selectors written as `.civ-X--Y` (BEM modifier — class with a
 * double-dash). Single-name classes (`.civ-foo`) are usually written
 * literally where they're applied; the bug we're catching is the
 * dynamically-constructed modifier case.
 *
 * Usage: pnpm lint:purged-variants
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');

const STYLESHEET_PATHS = [
  'packages/core/src/styles/components.css',
  'packages/core/src/styles/civ.css',
];

const SOURCE_ROOTS = ['packages'];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'storybook-static', '.next']);
const SOURCE_EXTS = new Set(['.ts', '.tsx']);

function* walk(path: string): Generator<string> {
  let stat;
  try { stat = statSync(path); } catch { return; }
  if (stat.isFile()) { yield path; return; }
  if (!stat.isDirectory()) return;
  for (const entry of readdirSync(path)) {
    if (SKIP_DIRS.has(entry)) continue;
    yield* walk(join(path, entry));
  }
}

/**
 * Pull every `.civ-X--Y[...rest]` selector out of the CSS files and
 * return the bare class names. We capture the modifier-pattern
 * specifically (a class with at least one `--` separator), since
 * those are the BEM variants typically built via template literal.
 */
export function variantClassesIn(css: string): Set<string> {
  const found = new Set<string>();
  // Strip comments to avoid matching class names mentioned in prose.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Match a class selector: `.civ-X--Y`. Allow any modifier characters
  // (letters, digits, dashes) after the `--`. Stop at the first
  // non-class-name character (`,`, ` `, `>`, `+`, `~`, `:`, `[`, `{`, `.`).
  const re = /\.(civ-[a-z][a-z0-9-]*--[a-z][a-z0-9-]*)/g;
  for (const m of stripped.matchAll(re)) {
    found.add(m[1]);
  }
  return found;
}

/**
 * Return the set of class names that appear as a literal string in
 * any TS source file under SOURCE_ROOTS. Class names can appear in
 * many forms (template-literal STATIC PARTS still count, e.g.
 * `` `civ-foo--bar ${dynamic}` `` contains `civ-foo--bar` as a
 * literal substring), so a simple substring check is sufficient.
 *
 * Tests and stories DO count — the goal is "Tailwind's content
 * scanner can see this string somewhere in the scanned TS surface."
 */
export function literalClassesInTs(targetClasses: Set<string>): Set<string> {
  const seen = new Set<string>();
  for (const root of SOURCE_ROOTS) {
    for (const file of walk(join(ROOT, root))) {
      if (!SOURCE_EXTS.has(extname(file))) continue;
      const text = readFileSync(file, 'utf-8');
      for (const cls of targetClasses) {
        if (seen.has(cls)) continue;
        // The class name is bordered by a non-class-name character on
        // both sides (`-`, letters, digits ARE part of class names;
        // everything else is a boundary). Use a word-boundary-ish
        // check via lookahead.
        const re = new RegExp(`(^|[^a-zA-Z0-9_-])${escapeRegex(cls)}([^a-zA-Z0-9_-]|$)`);
        if (re.test(text)) seen.add(cls);
      }
    }
  }
  return seen;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface LintResult {
  missing: string[];
  totalVariantClasses: number;
}

export function runLint(): LintResult {
  const allClasses = new Set<string>();
  for (const rel of STYLESHEET_PATHS) {
    let text: string;
    try { text = readFileSync(join(ROOT, rel), 'utf-8'); } catch { continue; }
    for (const cls of variantClassesIn(text)) allClasses.add(cls);
  }
  const seen = literalClassesInTs(allClasses);
  const missing: string[] = [];
  for (const cls of allClasses) {
    if (!seen.has(cls)) missing.push(cls);
  }
  missing.sort();
  return { missing, totalVariantClasses: allClasses.size };
}

function main(): number {
  const { missing, totalVariantClasses } = runLint();
  if (missing.length === 0) {
    console.log(`✓ ${totalVariantClasses} BEM variant classes scanned — every one is referenced as a literal in TS source.`);
    return 0;
  }
  console.log(`✗ ${missing.length} of ${totalVariantClasses} BEM variant classes have no literal TS reference.\n`);
  console.log('Tailwind\'s content scanner reads TypeScript for static class strings.');
  console.log('When a `civ-X--Y` selector exists in components.css but the resolved');
  console.log('class name is constructed via template literal (and never written');
  console.log('literally in any *.ts file), Tailwind purges the rule from the build');
  console.log('output. The rendered component silently loses its variant styling.\n');
  console.log('Fix by referencing the resolved class name as a literal in a test or');
  console.log('story — typically by tightening a test from `toContain(\'danger\')` to');
  console.log('`toContain(\'civ-X--variant-danger\')`.\n');
  for (const cls of missing) {
    console.log(`  ${cls}`);
  }
  return 1;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try { return import.meta.url === pathToFileURL(argv).href; }
  catch { return false; }
}

if (isCliInvocation()) process.exit(main());
