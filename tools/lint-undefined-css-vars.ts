#!/usr/bin/env tsx
/**
 * lint-undefined-css-vars — fail when a `var(--civ-*)` reference
 * points at a CSS custom property that isn't actually defined.
 *
 * The class of bug this catches:
 *
 *   `var(--civ-color-error-darker)` — looks plausible, but `error` has
 *   no `darker` shade in the token system (only `-lighter`, `-light`,
 *   `-DEFAULT`, `-dark`). The `var()` falls back to the initial value
 *   (typically `unset` / `inherit` / a built-in default), so the
 *   element renders without color. No error is thrown — the symptom
 *   is invisible until someone notices the rendered output looks
 *   wrong, and even then it's easy to misattribute to a different
 *   layer (specificity, cascade, etc.).
 *
 * Defined tokens come from packages/tokens/dist/css/tokens.css (the
 * Style Dictionary build output) — this is the canonical set of
 * `--civ-*` variables every consumer can rely on.
 *
 * Scope: all CSS files under packages/ plus inline styles in TS
 * (template-literal `style="..."` blocks).
 *
 * Allowlist: this lint reports references to `--civ-*` names ONLY.
 * References to other namespaces (Tailwind internals, browser
 * defaults) are ignored. The check is bordered by `--civ-` prefix on
 * both sides so partial matches don't slip through.
 *
 * Usage: pnpm lint:undefined-css-vars
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');

const TOKEN_DEFINITION_PATHS = [
  'packages/tokens/dist/css/tokens.css',
];

// Where to look for `var(--civ-*)` references.
const SCAN_ROOTS = ['packages'];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'storybook-static', '.next', '.turbo']);
const SCAN_EXTS = new Set(['.css', '.ts', '.tsx']);

// Some `--civ-*` variables are set DYNAMICALLY at runtime (via
// .style.setProperty in TS) and therefore don't appear in tokens.css.
// They're legitimate references that the lint shouldn't flag. List
// them here with a one-line justification.
const RUNTIME_DEFINED_VARS = new Set<string>([
  // Consumer-overridable layout hook with a CSS-level fallback. The
  // var() reference has a `, 70vh` fallback so it renders correctly
  // even when no consumer sets the variable. Sites can tune the
  // overlay height via `--civ-action-sheet-max-height: ...` on a
  // wrapper.
  '--civ-action-sheet-max-height',
  // Set by civ-drawer at render time via inline style — the prop
  // `width` is forwarded as `style="--civ-drawer-width: ${width}"`.
  // The CSS reference has a `min(320px, 90vw)` fallback so the
  // unstyled state still renders. Width is a per-instance API
  // surface, not a global design token.
  '--civ-drawer-width',
  // Mentioned only inside a string literal in civ-icon-editor's
  // SVG-pattern detector — not a real CSS reference, just a token
  // that the editor scans for when matching icon shapes.
  '--civ-icon-stroke',
]);

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
 * Parse all `--civ-X` declarations (`--civ-X: value;`) from a CSS
 * string and return the set of declared variable names (with leading
 * `--`).
 */
export function definedCivVarsIn(css: string): Set<string> {
  const defined = new Set<string>();
  // Match `  --civ-X: ...;` declarations. The `:` after the name is
  // the disambiguator that distinguishes a declaration from a
  // reference (which would be `var(--civ-X)`).
  const re = /(--civ-[a-zA-Z0-9_-]+)\s*:/g;
  for (const m of css.matchAll(re)) {
    defined.add(m[1]);
  }
  return defined;
}

/**
 * Extract every `var(--civ-X[, fallback])` reference from `text` and
 * return the set of referenced variable names. The optional fallback
 * after a comma is preserved (we just don't need it for the check).
 */
export function referencedCivVarsIn(text: string): Set<string> {
  const referenced = new Set<string>();
  // Strip CSS block comments so commented-out references don't count.
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '');
  // Match `var(--civ-X)` and `var(--civ-X, fallback)`. Stop the name
  // at whitespace, `,`, or `)`.
  const re = /\bvar\(\s*(--civ-[a-zA-Z0-9_-]+)/g;
  for (const m of stripped.matchAll(re)) {
    referenced.add(m[1]);
  }
  return referenced;
}

export interface UndefinedRef {
  name: string;
  file: string;
}

export interface LintResult {
  undefined: UndefinedRef[];
  tokensDefined: number;
  varsReferenced: number;
}

export function runLint(): LintResult {
  // 1. Collect every defined --civ-* token from the canonical token CSS.
  const defined = new Set<string>();
  for (const rel of TOKEN_DEFINITION_PATHS) {
    let text: string;
    try { text = readFileSync(join(ROOT, rel), 'utf-8'); } catch { continue; }
    for (const name of definedCivVarsIn(text)) defined.add(name);
  }

  // 2. Also accept anything defined inside any scanned CSS file — some
  //    components.css rules declare local CSS variables for scoped
  //    layout (e.g. `--civ-focus-shadow-radius`) that aren't tokens
  //    but are legitimately referenced via var().
  for (const root of SCAN_ROOTS) {
    for (const file of walk(join(ROOT, root))) {
      if (extname(file) !== '.css') continue;
      const text = readFileSync(file, 'utf-8');
      for (const name of definedCivVarsIn(text)) defined.add(name);
    }
  }

  // 3. And accept runtime-defined vars (from the allowlist above).
  for (const name of RUNTIME_DEFINED_VARS) defined.add(name);

  // 4. Walk every CSS/TS file and collect var(--civ-*) references.
  const undefinedRefs: UndefinedRef[] = [];
  const seen = new Set<string>(); // dedupe per (name, file)
  let varsReferenced = 0;
  for (const root of SCAN_ROOTS) {
    for (const file of walk(join(ROOT, root))) {
      if (!SCAN_EXTS.has(extname(file))) continue;
      // Skip the auto-generated tokens.css itself — it defines, doesn't reference.
      if (file.endsWith('/tokens.css')) continue;
      const text = readFileSync(file, 'utf-8');
      for (const name of referencedCivVarsIn(text)) {
        varsReferenced++;
        if (defined.has(name)) continue;
        const key = `${name}::${file}`;
        if (seen.has(key)) continue;
        seen.add(key);
        undefinedRefs.push({ name, file });
      }
    }
  }

  undefinedRefs.sort((a, b) => a.name.localeCompare(b.name) || a.file.localeCompare(b.file));
  return { undefined: undefinedRefs, tokensDefined: defined.size, varsReferenced };
}

function main(): number {
  const { undefined: refs, tokensDefined, varsReferenced } = runLint();
  if (refs.length === 0) {
    console.log(`✓ ${varsReferenced} var(--civ-*) references scanned against ${tokensDefined} defined tokens — all resolve.`);
    return 0;
  }
  console.log(`✗ ${refs.length} var(--civ-*) reference(s) point at undefined tokens.\n`);
  console.log('CSS `var()` silently falls back to the initial value when the variable');
  console.log('isn\'t defined — the symptom is invisible until someone notices the');
  console.log('rendered output looks wrong. Check the token name against');
  console.log('packages/tokens/dist/css/tokens.css for the canonical set, or add a');
  console.log('local declaration in the same CSS file.\n');
  for (const { name, file } of refs) {
    const rel = file.replace(ROOT + '/', '');
    console.log(`  ${name}  (in ${rel})`);
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
