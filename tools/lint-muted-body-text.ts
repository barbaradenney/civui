#!/usr/bin/env tsx
/**
 * lint-muted-body-text — forbid muted/gray text classes on `<p>` body
 * text in Storybook stories, doc MDX, and Drupal Twig templates.
 *
 * Per CLAUDE.md and government-patterns.md:
 *   "Do not use gray text classes (`civ-text-base-dark`,
 *    `civ-text-base-light`, `civ-text-base`) on labels, headings,
 *    descriptions, or body text. All text inherits the default color
 *    (`base-darkest`). Visual hierarchy is achieved through font size
 *    and weight, not color muting. Gray text is acceptable for: hint
 *    text, disabled states, and placeholder text."
 *
 * This lint catches the recurring trap of dropping `civ-text-muted`
 * on a descriptive `<p>` (e.g. the "Government Payment Setup"
 * direct-deposit story rendered its intro paragraph in light gray
 * before this rule). Hint text inside a CivUI form component renders
 * through the `.civ-hint` class — it does not need any of the
 * forbidden classes — so paragraph body text in stories / docs has no
 * legitimate reason to opt into muted gray.
 *
 * Strategy
 * --------
 * 1. Walk story / mdx / twig files (we don't scan component source —
 *    components legitimately use these tokens inside `.civ-hint`,
 *    `.civ-required-mark`, disabled-state opacity, etc.).
 * 2. Also walk MCP-server HTML generators
 *    (`packages/mcp-server/src/tools/generate-*.ts`) and the example
 *    resource JSON (`packages/mcp-server/src/resources/*.json`).
 *    These produce HTML for downstream consumers, so a forbidden
 *    class in a template propagates to every form built with the
 *    MCP server. The regex matches both raw HTML (`<p class="…">`)
 *    and JSON-escaped HTML (`<p class=\"…\">`).
 * 3. For each file, regex-scan `<p>` tags and check the `class`
 *    attribute for any of FORBIDDEN_CLASSES.
 * 4. Skip the allowlisted files — `colors.stories.ts` and
 *    `typography.stories.ts` exist specifically to demonstrate the
 *    muted tokens.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS: string[] = [
  'packages',
  'apps/docs/docs',
];

const SCAN_EXTENSIONS = new Set(['.stories.ts', '.mdx', '.twig']);

/**
 * Path-suffix patterns that opt extra files into the scan even
 * though their extension isn't in SCAN_EXTENSIONS. We want to lint
 * the MCP-server HTML generators (which emit `<p>` tags inside
 * string templates) and the example resource JSON (which contains
 * JSON-escaped HTML snippets).
 */
const EXTRA_PATH_PATTERNS: RegExp[] = [
  /packages\/mcp-server\/src\/tools\/generate-[^/]+\.ts$/,
  // Only the example HTML resource — other JSON files (e.g.
  // common-traps.json) contain documentation that intentionally
  // shows the forbidden pattern as a "don't do this" example.
  /packages\/mcp-server\/src\/resources\/component-examples\.json$/,
];

/**
 * Class names forbidden on `<p>` body text. `civ-text-base-darkest`
 * is the default color and is intentionally NOT in this list — an
 * explicit darkest is harmless redundancy.
 */
const FORBIDDEN_CLASSES = [
  'civ-text-muted',
  'civ-text-base-dark',
  'civ-text-base-light',
  'civ-text-base-lighter',
  'civ-text-base-lightest',
  'civ-text-base',
];

/**
 * Files exempt from the rule. Both demonstrate the muted token by
 * design — they're the swatch / sample pages.
 */
const ALLOWLIST = new Set([
  'packages/core/src/colors/colors.stories.ts',
  'packages/core/src/typography/typography.stories.ts',
]);

/**
 * Per-line content escape hatch — when a scanned line contains one
 * of these substrings, treat it as a known demonstration of the
 * muted token and skip the check for that line. Used to allow the
 * typography swatch entry inside `component-examples.json` to keep
 * its `<p class="civ-text-muted">Muted (16px, lighter)</p>` side-by-
 * side row.
 */
const LINE_CONTENT_EXEMPTIONS: string[] = [
  'Muted (16px, lighter)',
];

interface Finding {
  file: string;
  line: number;
  forbidden: string[];
  context: string;
}

function hasScanExtension(filename: string): boolean {
  for (const ext of SCAN_EXTENSIONS) {
    if (filename.endsWith(ext)) return true;
  }
  for (const re of EXTRA_PATH_PATTERNS) {
    if (re.test(filename)) return true;
  }
  return false;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      if (hasScanExtension(p)) out.push(p);
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

function scanLine(line: string): string[] {
  for (const marker of LINE_CONTENT_EXEMPTIONS) {
    if (line.includes(marker)) return [];
  }
  // Match <p ... class="..."> openers. We DO NOT match the closing
  // `>` because in multi-line templates the class attribute can be
  // on the same line while the opener spans further. The class
  // attribute alone is enough to flag.
  //
  // Two attribute shapes are accepted:
  //   <p class="foo bar">             ← raw HTML in stories / mdx / twig
  //   <p class=\"foo bar\">           ← JSON-escaped HTML in component-examples.json
  // The leading `\\?` lets the regex consume the optional backslash
  // produced by JSON string-escaping, and the character class
  // `[^"'\\]+` stops at either kind of quote terminator.
  const out: string[] = [];
  for (const m of line.matchAll(/<p\b[^>]*?\bclass\s*=\s*\\?["']([^"'\\]+)\\?["']/g)) {
    const classes = m[1].split(/\s+/);
    for (const forbidden of FORBIDDEN_CLASSES) {
      // Special-case bare `civ-text-base` — must not match
      // `civ-text-base-darkest` etc. (handled because we tokenize on
      // whitespace and compare exact strings).
      if (classes.includes(forbidden)) out.push(forbidden);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    const found = await walk(path.join(REPO_ROOT, root));
    files.push(...found);
  }

  const findings: Finding[] = [];
  for (const file of files) {
    const rel = path.relative(REPO_ROOT, file);
    if (ALLOWLIST.has(rel)) continue;
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const hits = scanLine(lines[i]);
      if (hits.length > 0) {
        findings.push({
          file: rel,
          line: i + 1,
          forbidden: Array.from(new Set(hits)),
          context: lines[i].trim().slice(0, 140),
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log(`✓ no <p> body text in stories / mdx / twig / mcp-server templates uses muted/gray text classes.`);
    return;
  }

  console.error(`✗ ${findings.length} <p> tag(s) with forbidden muted/gray class(es):\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  — ${f.forbidden.join(', ')}`);
    console.error(`    ${f.context}`);
    console.error('');
  }
  console.error(
    'Body paragraph text should inherit the default color (base-darkest).\n' +
    'Visual hierarchy comes from font size and weight, not color muting.\n' +
    'Gray text is reserved for hint text (which uses .civ-hint internally),\n' +
    'disabled states (via .civ-opacity-disabled), and placeholders.\n\n' +
    'Drop the class from the <p>, or move the muted treatment to a smaller\n' +
    'secondary element (e.g. a <span> caption) if the design needs it.\n\n' +
    'If a file legitimately demonstrates these tokens, add it to ALLOWLIST\n' +
    'in tools/lint-muted-body-text.ts.',
  );
  printRuleLink('muted-body-text');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
