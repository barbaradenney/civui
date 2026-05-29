#!/usr/bin/env tsx
/**
 * lint-status-body-text — forbid the bare semantic-DEFAULT text classes
 * `civ-text-success`, `civ-text-warning`, `civ-text-info` on `<p>` body
 * text in Storybook stories, doc MDX, Drupal Twig, and the MCP-server
 * HTML generators.
 *
 * Why
 * ---
 * The `*-DEFAULT` shade of these three intents fails WCAG SC 1.4.3 AA
 * (4.5:1) at body-text size on a white surface:
 *   - success-DEFAULT (#00a91c) → 3.14:1   (AA-large / non-text only)
 *   - warning-DEFAULT (#e5a000) → 1.84:1   (fails everything)
 *   - info-DEFAULT    (#00bde3) → 2.58:1   (fails body + non-text)
 *
 * A developer reaching for `civ-text-success` to colour a status
 * sentence gets a WCAG-failing render with no error. The AA-safe
 * shades are `-dark` / `-darkest`:
 *   - success → `civ-text-success-dark`    (4.63:1, AA)
 *   - warning → `civ-text-warning-darkest`  (7.05:1 on warning-lightest)
 *   - info    → `civ-text-info-darkest`     (AAA)
 *   - error   → `civ-text-error` is already AA (6.98:1) — not flagged.
 *
 * This is the sibling of `lint:muted-body-text` (which forbids gray
 * tokens on body text) and is called out in
 * `.claude/rules/colors.md` → "What NOT to do" and
 * `.claude/rules/government-patterns.md` → "Text color rules".
 *
 * Strategy mirrors lint-muted-body-text: walk story / mdx / twig files
 * plus the MCP-server HTML generators + the example resource JSON,
 * regex-scan `<p>` openers, and flag any FORBIDDEN class found in the
 * `class` attribute (exact whitespace-tokenized match, so
 * `civ-text-success-dark` is NOT flagged).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS: string[] = ['packages', 'apps/docs/docs'];

const SCAN_EXTENSIONS = new Set(['.stories.ts', '.mdx', '.twig']);

const EXTRA_PATH_PATTERNS: RegExp[] = [
  /packages\/mcp-server\/src\/tools\/generate-[^/]+\.ts$/,
  /packages\/mcp-server\/src\/resources\/component-examples\.json$/,
];

/**
 * Bare `*-DEFAULT` semantic text classes that fail AA at body size.
 * `civ-text-error` is intentionally absent (6.98:1, passes AA), as are
 * the `-dark` / `-darkest` shades (the documented fixes).
 */
export const FORBIDDEN_CLASSES = [
  'civ-text-success',
  'civ-text-warning',
  'civ-text-info',
];

/** Files that demonstrate the swatches by design. */
const ALLOWLIST = new Set([
  'packages/core/src/colors/colors.stories.ts',
  'packages/core/src/typography/typography.stories.ts',
]);

interface Finding {
  file: string;
  line: number;
  forbidden: string[];
  context: string;
}

function hasScanExtension(filename: string): boolean {
  for (const ext of SCAN_EXTENSIONS) if (filename.endsWith(ext)) return true;
  for (const re of EXTRA_PATH_PATTERNS) if (re.test(filename)) return true;
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
      for (const name of await fs.readdir(p)) await visit(path.join(p, name));
    }
  }
  await visit(dir);
  return out;
}

/**
 * Scan one line for `<p ... class="...">` openers carrying a forbidden
 * class. Accepts raw HTML and JSON-escaped (`class=\"…\"`) forms, same
 * as lint-muted-body-text. Exact whitespace-tokenized comparison so
 * `civ-text-success-dark` (a valid AA shade) is not a false positive.
 */
export function scanLine(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(/<p\b[^>]*?\bclass\s*=\s*\\?["']([^"'\\]+)\\?["']/g)) {
    const classes = m[1].split(/\s+/);
    for (const forbidden of FORBIDDEN_CLASSES) {
      if (classes.includes(forbidden)) out.push(forbidden);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) files.push(...await walk(path.join(REPO_ROOT, root)));

  const findings: Finding[] = [];
  for (const file of files) {
    const rel = path.relative(REPO_ROOT, file);
    if (ALLOWLIST.has(rel)) continue;
    const lines = (await fs.readFile(file, 'utf8')).split('\n');
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
    console.log(`✓ no <p> body text uses a bare AA-failing semantic text class (success/warning/info DEFAULT).`);
    return;
  }

  console.error(`✗ ${findings.length} <p> tag(s) with an AA-failing semantic text class:\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  — ${f.forbidden.join(', ')}`);
    console.error(`    ${f.context}`);
    console.error('');
  }
  console.error(
    'The bare *-DEFAULT shade of success/warning/info fails WCAG AA at\n' +
    'body-text size (success 3.14:1, warning 1.84:1, info 2.58:1 on white).\n' +
    'Use the AA-safe shade instead:\n' +
    '  civ-text-success  → civ-text-success-dark   (4.63:1)\n' +
    '  civ-text-warning  → civ-text-warning-darkest (on warning-lightest)\n' +
    '  civ-text-info     → civ-text-info-darkest    (AAA)\n' +
    'civ-text-error is already AA-safe and is not flagged.\n\n' +
    'If a file legitimately demonstrates these tokens, add it to ALLOWLIST\n' +
    'in tools/lint-status-body-text.ts.',
  );
  printRuleLink('status-body-text');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
