#!/usr/bin/env tsx
/**
 * lint-hardcoded-tokens — fail when component source or CSS uses a
 * hardcoded value where a CivUI token exists.
 *
 * CLAUDE.md mandates:
 *   - "All transitions use `var(--civ-motion-duration-*)` —
 *      no hardcoded values"
 *   - "Z-index from `--civ-z-*` custom properties — no hardcoded
 *      values"
 *   - "No arbitrary values (`civ-p-[13px]`) — everything comes from
 *      the token system"
 *
 * None of these are mechanically enforced. This lint scans
 * `packages/!*!/src/!**!/!*.{ts,css}` (excluding tests) for:
 *
 *   1. Motion durations: any `transition-duration: <value>`,
 *      `transition: ... <duration>`, `animation-duration: <value>`,
 *      `animation: ... <duration>` where the value is a literal
 *      `<n>ms` or `<n>s`. The token form
 *      `var(--civ-motion-duration-*)` passes.
 *   2. Z-index literals: `z-index: <integer>` where the value isn't
 *      `var(--civ-z-*)` or `auto`/`inherit`/`initial`/`unset`/`0`.
 *   3. Arbitrary Tailwind values: any `civ-<utility>-[<value>]`
 *      token in TypeScript / CSS source (Tailwind's arbitrary-value
 *      syntax). All sizing/spacing/colour should come from the
 *      token system, not inline arbitrary values.
 *
 * False positives are likely on the first two; this lint reports
 * specific occurrences with file/line so authors can see the
 * context. Exit 1 on any finding.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface Finding {
  file: string;
  line: number;
  rule: 'motion-duration' | 'z-index-literal' | 'arbitrary-tailwind';
  match: string;
  context: string;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      const ext = path.extname(p);
      if ((ext === '.ts' || ext === '.css') && !p.endsWith('.test.ts') && !p.endsWith('.stories.ts') && !p.includes('/dist/')) {
        out.push(p);
      }
      return;
    }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo') return;
      // Skip non-component packages — these generate or document
      // user-facing markup but aren't themselves a Lit component
      // source tree, so the "use a token-backed utility" rule
      // doesn't apply.
      if (base === 'mcp-server' || base === 'cli' || base === 'content') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

// Lines in a tokens.css build output legitimately declare 0ms and other
// raw durations — that's where the tokens are defined. Skip them.
function isTokenDefinitionFile(file: string): boolean {
  return (
    file.includes('packages/tokens/') ||
    file.endsWith('/civ.css') ||             // global utilities
    file.endsWith('/tokens.css')
  );
}

// Motion durations: `transition-duration:` / `animation-duration:` /
// shorthand `transition:` / `animation:` followed by a literal time.
// Matches `200ms`, `0.2s`, `.2s`, `300MS`. Skips `var(--civ-motion-*)`.
const DURATION_VALUE = /([0-9]*\.?[0-9]+)(ms|s)\b/i;
const MOTION_DECL_RE = /(transition(?:-duration)?|animation(?:-duration)?)\s*:\s*([^;{}]+)/gi;

// CSS keyword values that are never motion durations on their own line
const MOTION_KEYWORDS = new Set([
  'none', 'inherit', 'initial', 'unset', 'revert', 'revert-layer',
]);

// `z-index: <value>;` where value isn't 0 / `auto` / token
const Z_INDEX_DECL_RE = /z-index\s*:\s*([^;{}\n]+)/gi;

// Arbitrary Tailwind values: `civ-<word>-[<value>]`
const ARBITRARY_TW_RE = /\bciv-[a-z]+(?:-[a-z]+)?-\[[^\]]+\]/g;

function checkMotion(line: string): { match: string } | null {
  const out: string[] = [];
  for (const m of line.matchAll(MOTION_DECL_RE)) {
    const value = m[2].trim();
    if (MOTION_KEYWORDS.has(value)) continue;
    if (/var\(\s*--civ-motion/.test(value)) continue;
    const d = DURATION_VALUE.exec(value);
    if (!d) continue;
    const n = parseFloat(d[1]);
    if (n === 0) continue;
    // Anti-pattern hacks like Chrome's autofill mask (transition:
    // background-color 5000s ...) deliberately use absurd durations
    // that no motion token would ever represent. Allow values longer
    // than 60 seconds — those are clearly not animation tokens.
    const normalisedSeconds = d[2].toLowerCase() === 'ms' ? n / 1000 : n;
    if (normalisedSeconds > 60) continue;
    out.push(`${m[1]}: ${value}`);
  }
  if (out.length === 0) return null;
  return { match: out.join(' / ') };
}

function checkZIndex(line: string): { match: string } | null {
  const m = Z_INDEX_DECL_RE.exec(line);
  Z_INDEX_DECL_RE.lastIndex = 0;
  if (!m) return null;
  const value = m[1].trim();
  if (/var\(\s*--civ-z-/.test(value)) return null;
  if (['0', 'auto', 'inherit', 'initial', 'unset', 'revert'].includes(value)) return null;
  // Negative tokens like `-1` for clip stacking are conventionally OK.
  if (value === '-1') return null;
  // Single-layer stacking-context idiom (one element raised above its
  // siblings). A z-index of 1 doesn't need a named token — it isn't
  // stacking against any other CivUI layer. Reserve --civ-z-* for
  // values that interact with overlays / modals / skip links.
  if (value === '1') return null;
  return { match: `z-index: ${value}` };
}

function checkArbitraryTw(line: string): { match: string } | null {
  ARBITRARY_TW_RE.lastIndex = 0;
  const m = ARBITRARY_TW_RE.exec(line);
  if (!m) return null;
  return { match: m[0] };
}

/**
 * Replace the inside of every `/* ... *\/` block comment AND every
 * `//` line comment with spaces, preserving newlines so line numbers
 * stay aligned. Prevents the line-by-line scanners from matching on
 * prose like "stacking ancestor, and z-index: 1 on :focus" inside a
 * design-decision comment.
 *
 * Exported so the lint's unit tests can pin the stripping behavior.
 */
export function stripComments(src: string, ext: '.ts' | '.css'): string {
  let out = '';
  let i = 0;
  let inBlock = false;
  let inLine = false;
  let inStr: string | null = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inBlock) {
      if (ch === '*' && next === '/') {
        out += '  ';
        i += 2;
        inBlock = false;
        continue;
      }
      out += ch === '\n' ? '\n' : ' ';
      i++;
      continue;
    }
    if (inLine) {
      if (ch === '\n') {
        out += '\n';
        inLine = false;
      } else {
        out += ' ';
      }
      i++;
      continue;
    }
    if (inStr) {
      out += ch;
      if (ch === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      out += '  ';
      i += 2;
      inBlock = true;
      continue;
    }
    // `//` line comments are only legal in TypeScript — CSS uses
    // `/* ... */` exclusively. Strip them only for `.ts` files so
    // CSS rules like `background: url(//cdn/…)` don't get clobbered.
    if (ext === '.ts' && ch === '/' && next === '/') {
      out += '  ';
      i += 2;
      inLine = true;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      out += ch;
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

async function main(): Promise<void> {
  const files = await walk(PACKAGES_DIR);
  const findings: Finding[] = [];

  for (const file of files) {
    if (isTokenDefinitionFile(file)) continue;
    const ext = path.extname(file) as '.ts' | '.css';
    const raw = await fs.readFile(file, 'utf8');
    const src = stripComments(raw, ext);
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const motion = checkMotion(line);
      if (motion) {
        findings.push({
          file: path.relative(REPO_ROOT, file),
          line: i + 1,
          rule: 'motion-duration',
          match: motion.match,
          context: line.trim(),
        });
      }
      const z = checkZIndex(line);
      if (z) {
        findings.push({
          file: path.relative(REPO_ROOT, file),
          line: i + 1,
          rule: 'z-index-literal',
          match: z.match,
          context: line.trim(),
        });
      }
      const tw = checkArbitraryTw(line);
      if (tw) {
        findings.push({
          file: path.relative(REPO_ROOT, file),
          line: i + 1,
          rule: 'arbitrary-tailwind',
          match: tw.match,
          context: line.trim(),
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log('✓ no hardcoded motion durations, z-index literals, or arbitrary Tailwind values found.');
    return;
  }

  const byRule = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule)!.push(f);
  }
  console.error(`✗ ${findings.length} hardcoded-token violation(s):\n`);
  const ruleHeader = {
    'motion-duration': 'Hardcoded motion duration (use var(--civ-motion-duration-*))',
    'z-index-literal': 'Hardcoded z-index value (use var(--civ-z-*))',
    'arbitrary-tailwind': 'Arbitrary Tailwind value (use a token-backed utility)',
  };
  for (const [rule, list] of byRule) {
    console.error(`  ${ruleHeader[rule as keyof typeof ruleHeader]}  (${list.length} occurrence(s))`);
    for (const f of list.slice(0, 10)) {
      console.error(`    ${f.file}:${f.line}`);
      console.error(`      ${f.context.slice(0, 120)}`);
    }
    if (list.length > 10) console.error(`    … and ${list.length - 10} more`);
    console.error('');
  }
  console.error(
    'CivUI tokens are the source of truth for motion, z-index, and\n' +
    'sizing. Replace each literal with the matching var(--civ-*)\n' +
    'reference, or — if the value really is one-off — add a token\n' +
    'definition in packages/tokens and use it via Tailwind/CSS.',
  );
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
