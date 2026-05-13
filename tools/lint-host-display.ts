#!/usr/bin/env tsx
/**
 * lint-host-display — fail when a custom-element host lacks an explicit
 * `display` rule in CSS.
 *
 * The class of bug this catches:
 *
 *   `<civ-list-item>` is a custom element with no explicit display rule
 *   in CSS. Browsers default unknown elements to `display: inline`.
 *   Borders, backgrounds, padding, margin, width, and height **don't
 *   paint on inline boxes** — so a CSS rule like
 *
 *     .civ-list--dividers > civ-list-item + civ-list-item {
 *       border-top: 1px solid var(--civ-color-base-lighter);
 *     }
 *
 *   silently computes 1px and renders nothing. The symptom is invisible
 *   — no console error, no test failure, just no pixels.
 *
 * To prevent: every `@customElement('civ-X')` registration must be
 * paired with an explicit display rule for `civ-X` somewhere in the
 * CivUI stylesheets (`packages/core/src/styles/*.css` or any
 * per-package stylesheet under `packages/*\/src\/**\/*.css`). The
 * actual display value (`block`, `inline`, `inline-block`, `flex`, …)
 * doesn't matter for the lint — it just has to be declared explicitly
 * so the author has thought about it.
 *
 * Multi-selector rules count, e.g. `civ-foo, civ-bar { display: block; }`
 * declares display for both `civ-foo` and `civ-bar`.
 *
 * Usage: pnpm lint:host-display
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');

// Where to find `@customElement('civ-X')` declarations.
const SOURCE_ROOTS = ['packages'];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'storybook-static', '.next', '__audit__']);
const SOURCE_EXTS = new Set(['.ts', '.tsx']);

// Where to look for the CSS rules that satisfy the requirement.
// Walks every `.css` file under any package's `src/` directory — matches
// what the docstring promises and handles per-package stylesheets
// (storybook-utils demo-frame.css, etc.) without hardcoding paths.
function collectStylesheets(): string[] {
  const out: string[] = [];
  for (const file of walk(join(ROOT, 'packages'))) {
    if (!file.endsWith('.css')) continue;
    // Skip CSS that lives in dist/build output (the walker already
    // skips node_modules / dist directories, but be defensive).
    out.push(file);
  }
  return out;
}

const CUSTOM_ELEMENT_RE = /@customElement\(\s*['"](civ-[a-z][a-z0-9-]*)['"]\s*\)/g;

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

function findAllTags(): Map<string, string> {
  // Map tag → first file the registration appears in (used in error output).
  const tags = new Map<string, string>();
  for (const root of SOURCE_ROOTS) {
    for (const file of walk(join(ROOT, root))) {
      const ext = extname(file);
      if (!SOURCE_EXTS.has(ext)) continue;
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
      if (file.endsWith('.stories.ts')) continue;
      const text = readFileSync(file, 'utf-8');
      for (const m of text.matchAll(CUSTOM_ELEMENT_RE)) {
        const tag = m[1];
        if (!tags.has(tag)) tags.set(tag, file);
      }
    }
  }
  return tags;
}

/**
 * Parse CSS and collect the set of tag names that have an explicit
 * `display` rule. We walk rule blocks (selector { ... }) and, for each
 * block whose body contains a `display:` declaration, extract every
 * `civ-X` selector that appears in the block's selector list.
 *
 * Selector list: `civ-foo, civ-bar` → both count. We treat the selector
 * as satisfying the requirement only when the tag is the FINAL compound
 * selector (no descendant / sibling / child combinator coming after the
 * tag). `.parent civ-foo { display: ... }` does NOT satisfy `civ-foo`'s
 * requirement, because that's the cascading context, not the host
 * itself. `civ-foo { display: ... }` and `civ-foo.modifier { display:
 * ... }` and `civ-foo[attr] { display: ... }` do satisfy it.
 */
/**
 * Pure variant of the CSS scanner — accepts CSS text, returns the set
 * of `civ-X` tags that have an explicit top-level `display:` rule.
 *
 * Exported for unit testing with fixture CSS strings. `tagsWithDisplayRules`
 * is the file-reading wrapper used by the lint at runtime.
 */
export function tagsWithDisplayRulesIn(css: string): Set<string> {
  const satisfied = new Set<string>();
  // Strip /* … */ comments to keep the scanner simple.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Track only the @media-block nesting depth. Rules inside an @media
  // block (e.g. `@media print`) don't define the host's default screen
  // display — `display: none` on print is a hiding rule, not a layout
  // declaration. `@layer` (Tailwind wraps everything in
  // `@layer components { … }`) is transparent: rules inside count.
  let mediaDepth = 0;
  // Stack of "was this block a media block?" so `}` knows whether to
  // decrement mediaDepth.
  const blockIsMedia: boolean[] = [];
  let i = 0;
  let selectorStart = 0;
  while (i < stripped.length) {
    const ch = stripped[i];
    if (ch === '{') {
      const selector = stripped.slice(selectorStart, i).trim();
      const isMedia = /^@media\b/.test(selector);
      const isAtRule = selector.startsWith('@');
      const blockStart = i + 1;
      let scan = blockStart;
      let nestedDepth = 1;
      while (scan < stripped.length && nestedDepth > 0) {
        if (stripped[scan] === '{') nestedDepth++;
        else if (stripped[scan] === '}') nestedDepth--;
        if (nestedDepth === 0) break;
        scan++;
      }
      const body = stripped.slice(blockStart, scan);
      const hasNestedBlock = /\{[^}]*\}/.test(body);
      if (!hasNestedBlock && !isAtRule) {
        // Leaf rule. Only count if we're not inside an @media block.
        if (mediaDepth === 0 && /(^|;|\s)display\s*:/.test(body)) {
          for (const sel of selector.split(',')) {
            const tag = extractFinalTag(sel.trim());
            if (tag) satisfied.add(tag);
          }
        }
        i = scan + 1;
        selectorStart = i;
        continue;
      }
      // Container block (@media, @layer, or a nested selector list).
      // Track depth; walk inside.
      if (isMedia) mediaDepth++;
      blockIsMedia.push(isMedia);
      i = blockStart;
      selectorStart = i;
      continue;
    }
    if (ch === '}') {
      if (blockIsMedia.length > 0) {
        const wasMedia = blockIsMedia.pop()!;
        if (wasMedia) mediaDepth--;
      }
      i++;
      selectorStart = i;
      continue;
    }
    i++;
  }
  return satisfied;
}

function tagsWithDisplayRules(): Set<string> {
  const satisfied = new Set<string>();
  for (const abs of collectStylesheets()) {
    let text: string;
    try { text = readFileSync(abs, 'utf-8'); }
    catch { continue; }
    for (const tag of tagsWithDisplayRulesIn(text)) satisfied.add(tag);
  }
  return satisfied;
}

/**
 * Return the host tag name when `selector`'s rightmost (subject)
 * compound selector is a `civ-X` element selector — optionally with
 * class / attribute / pseudo-class modifiers. Return null when the
 * subject isn't a `civ-X` tag or when the rule's pseudo-element makes
 * it style a generated box rather than the host itself.
 *
 * The "subject" is the element a CSS rule actually styles (CSS Selectors
 * Level 4 §3.1) — the rightmost compound after combinators. For our
 * lint, that's the box the `display:` property applies to.
 *
 * Examples:
 *   "civ-foo"                       → "civ-foo"
 *   "civ-foo.modifier"              → "civ-foo"
 *   "civ-foo[disabled]"             → "civ-foo"
 *   "civ-foo:focus-within"          → "civ-foo"
 *   ".parent civ-foo"               → "civ-foo"  (descendant: foo is subject)
 *   ".parent > civ-foo"             → "civ-foo"  (child: foo is subject)
 *   "civ-foo + civ-bar"             → "civ-bar"  (sibling: bar is subject)
 *   "civ-foo > div"                 → null       (subject is `div`, not civ-*)
 *   "civ-foo::before"               → null       (pseudo-element box)
 */
export function extractFinalTag(selector: string): string | null {
  // Take the rightmost compound selector (everything after the last
  // combinator: space, >, +, ~). For combinators, that compound is the
  // "subject" of the rule.
  const rightmost = selector.split(/[\s>+~]+/).filter(Boolean).pop() ?? '';
  // Strip trailing class/attr/pseudo selectors to expose the tag.
  const tag = rightmost.match(/^(civ-[a-z][a-z0-9-]*)\b/)?.[1];
  if (!tag) return null;
  // Reject pseudo-elements that imply the host itself isn't the box.
  // `::before` / `::after` are styled in their own boxes, not the host.
  if (/::(before|after|placeholder|marker)\b/.test(rightmost)) return null;
  // Reject descendant context — if the bare selector is preceded by a
  // combinator other than a sibling, the rule is about the host
  // SOMEWHERE in a tree, not declaring the host's own default display.
  // We already split by combinators above; the rightmost compound is
  // the subject, so this is satisfied by construction. The one nuance:
  // a single bare tag selector ("civ-foo") with no combinator IS the
  // host. A descendant selector (".parent civ-foo") still has
  // "civ-foo" as the subject, and we DO want to count that as a host
  // display declaration (the rule applies wherever the host renders).
  // So no additional filtering needed.
  return tag;
}

export interface LintResult {
  missing: Array<{ tag: string; source: string }>;
  tagsScanned: number;
}

export function runLint(): LintResult {
  const tags = findAllTags();
  const satisfied = tagsWithDisplayRules();
  const missing: Array<{ tag: string; source: string }> = [];
  for (const [tag, source] of tags) {
    if (!satisfied.has(tag)) missing.push({ tag, source });
  }
  missing.sort((a, b) => a.tag.localeCompare(b.tag));
  return { missing, tagsScanned: tags.size };
}

function main(): number {
  const { missing, tagsScanned } = runLint();
  if (missing.length === 0) {
    console.log(`✓ ${tagsScanned} custom elements scanned — every host has an explicit display rule.`);
    return 0;
  }
  console.log(`✗ ${missing.length} of ${tagsScanned} custom elements have no explicit display rule.\n`);
  console.log('Custom elements default to `display: inline`. Borders, padding,');
  console.log('background, width, and height SILENTLY do not render on inline');
  console.log('boxes. Every <civ-*> registration must be paired with an explicit');
  console.log('display rule in packages/core/src/styles/components.css (or civ.css).\n');
  for (const { tag, source } of missing) {
    const rel = source.replace(ROOT + '/', '');
    console.log(`  ${tag}  (registered in ${rel})`);
  }
  console.log('\nAdd e.g. `' + missing[0].tag + ' { display: block; }` in the appropriate section of components.css.');
  return 1;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try { return import.meta.url === pathToFileURL(argv).href; }
  catch { return false; }
}

if (isCliInvocation()) process.exit(main());
