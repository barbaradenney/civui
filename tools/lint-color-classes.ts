#!/usr/bin/env tsx
/**
 * lint-color-classes — verify every `civ-{text|bg|border|ring|fill|
 * stroke|divide}-{color-family}-{shade}` class used anywhere in the
 * repo refers to an actual color token defined in
 * `packages/tokens/dist/css/tokens.css`.
 *
 * Catches the recurring "shade that doesn't exist" trap:
 *   civ-text-success-vivid          ← `vivid` exists only on primary
 *   civ-bg-purple-darkest           ← purple stops at `dark`
 *   civ-border-accent-cool-darkest  ← accent-cool stops at `dark`
 *
 * The canonical historical example was `civ-text-success-darker`,
 * which the trauma-informed audit hit because the rendered story
 * still looked wrong; that shade has since been added (the semantic
 * ladders gained `darker` in the 2026-05-29 alignment), so the
 * examples above use shades that remain undefined. A static lint
 * surfaces these the moment they're typed.
 *
 * Strategy
 * --------
 * 1. Parse the tokens CSS for every `--civ-color-{family}-{shade}`
 *    custom property. Both the `{family}-{shade}` form and the bare
 *    `{family}` form (Tailwind shorthand for `-DEFAULT`) are valid.
 * 2. Walk source / story / doc / css files and pull every potential
 *    color class. Only flag classes where:
 *      - the prefix is a color utility (text / bg / border / …), AND
 *      - the first segment of the suffix is a known color family
 *        (primary / error / success / warning / info / base /
 *        accent-cool / accent-warm / purple), AND
 *      - the full suffix doesn't match a known token.
 *    This sidesteps font-size / spacing / layout false positives
 *    (`civ-text-sm`, `civ-border-s-2`) — those classes don't start
 *    with a color-family token.
 * 3. Skip matches inside `<civ-X` tag-name contexts so the element
 *    name `civ-text-input` doesn't get misread as a class.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const TOKENS_CSS = path.join(REPO_ROOT, 'packages/tokens/dist/css/tokens.css');

interface Finding {
  cls: string;
  file: string;
  line: number;
  context: string;
}

const SCAN_ROOTS: string[] = [
  'packages',
  'apps/docs/docs',
];

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.mdx', '.md', '.html', '.twig']);

const COLOR_PREFIXES = ['text', 'bg', 'border', 'ring', 'fill', 'stroke', 'divide', 'outline'];

interface TokenSets {
  /** family names that have a -DEFAULT shade (so `civ-text-{family}` is valid) */
  families: Set<string>;
  /** complete {family}-{shade} suffix strings (e.g. "success-lighter") */
  validSuffixes: Set<string>;
  /** family-name prefixes used to decide whether a class is color-related */
  familyPrefixes: string[];
}

async function readTokens(): Promise<TokenSets> {
  const families = new Set<string>();
  const validSuffixes = new Set<string>();
  let css: string;
  try {
    css = await fs.readFile(TOKENS_CSS, 'utf8');
  } catch {
    throw new Error(
      `tokens.css not found at ${TOKENS_CSS}. Run \`pnpm --filter @civui/tokens build\` first.`,
    );
  }
  for (const m of css.matchAll(/--civ-color-([a-zA-Z][a-zA-Z0-9-]*?):/g)) {
    const raw = m[1];
    if (raw.endsWith('-DEFAULT')) {
      const family = raw.slice(0, -'-DEFAULT'.length);
      families.add(family);
      validSuffixes.add(family);          // bare family form
      validSuffixes.add(raw);             // family-DEFAULT explicit
    } else {
      validSuffixes.add(raw);
      // First hyphen-separated piece is the family; multi-piece names
      // like `accent-cool-light` need the family `accent-cool`.
      // We accumulate families heuristically by trimming trailing
      // shade keywords.
    }
  }
  // Build family-prefix list by stripping trailing shade tokens from
  // the validSuffixes we've seen.
  const SHADES = new Set([
    'lightest', 'lighter', 'light', 'vivid',
    'dark', 'darker', 'darkest',
  ]);
  for (const suffix of validSuffixes) {
    // Find the longest prefix that, after stripping a -shade, equals a known suffix prefix.
    const segs = suffix.split('-');
    if (segs.length === 1) continue;
    const last = segs[segs.length - 1];
    if (SHADES.has(last)) {
      families.add(segs.slice(0, -1).join('-'));
    } else {
      // No -shade ending; entire string is a family (no DEFAULT).
      families.add(suffix);
    }
  }
  return {
    families,
    validSuffixes,
    familyPrefixes: [...families].sort((a, b) => b.length - a.length), // longest first for prefix matching
  };
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      if (SCAN_EXTENSIONS.has(path.extname(p))) out.push(p);
      return;
    }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo' || base === 'build') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

function startsWithFamily(suffix: string, familyPrefixes: string[]): string | null {
  for (const f of familyPrefixes) {
    if (suffix === f) return f;
    if (suffix.startsWith(f + '-')) return f;
  }
  return null;
}

async function main(): Promise<void> {
  const { validSuffixes, familyPrefixes } = await readTokens();

  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    const found = await walk(path.join(REPO_ROOT, root));
    files.push(...found);
  }

  const findings: Finding[] = [];

  // Build the regex for color-utility class matches. We exclude matches
  // that are immediately preceded by `<` so element names (`<civ-text-
  // input>`) don't trip the check.
  const CLASS_RE = new RegExp(
    `(?<![<])\\bciv-(${COLOR_PREFIXES.join('|')})-([a-z][a-z0-9-]+)\\b`,
    'g',
  );

  for (const file of files) {
    if (file.endsWith('tokens.css') || file.includes('/dist/') || file.includes('/build/')) continue;
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split('\n');

    for (const m of src.matchAll(CLASS_RE)) {
      const prefix = m[1];
      const suffix = m[2];
      // Decide if this is a color-utility class. It is only if the
      // suffix starts with a known color family. Otherwise it's a
      // typography / spacing / layout utility that we don't validate.
      if (!startsWithFamily(suffix, familyPrefixes)) continue;
      if (validSuffixes.has(suffix)) continue;

      const offset = m.index ?? 0;
      const lineNumber = src.slice(0, offset).split('\n').length;
      findings.push({
        cls: `civ-${prefix}-${suffix}`,
        file: path.relative(REPO_ROOT, file),
        line: lineNumber,
        context: lines[lineNumber - 1]?.trim().slice(0, 120) ?? '',
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ all civ-{text|bg|border|...}-{color}-{shade} classes resolve ` +
      `to a token in packages/tokens.`,
    );
    return;
  }

  const grouped = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!grouped.has(f.cls)) grouped.set(f.cls, []);
    grouped.get(f.cls)!.push(f);
  }
  console.error(`✗ ${findings.length} unknown color-class use(s) across ${grouped.size} distinct class(es):\n`);
  for (const [cls, list] of grouped) {
    console.error(`  .${cls}  (${list.length} use${list.length === 1 ? '' : 's'})`);
    for (const f of list.slice(0, 3)) {
      console.error(`    ${f.file}:${f.line}`);
      console.error(`      ${f.context}`);
    }
    if (list.length > 3) console.error(`    … and ${list.length - 3} more`);
    console.error('');
  }
  console.error(
    'These classes use a color suffix that doesn\'t resolve to any\n' +
    '`--civ-color-{family}-{shade}` token. Either:\n' +
    '  - Use a real shade (lightest / lighter / light / dark / darker / darkest, as defined per family).\n' +
    '  - Add the missing shade to the token JSON if the design calls for it.\n' +
    '  - Verify the family name is spelled correctly (e.g. `error`, not `danger`).',
  );
  printRuleLink('color-classes');
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
