#!/usr/bin/env tsx
/**
 * lint-readonly-cascade — every compound component that renders an
 * inner readonly-supporting civui control AND forwards
 * `?disabled="${this.disabled}"` to it MUST also forward
 * `?readonly="${this.readonly}"`.
 *
 * Why
 * ---
 * CivUI's `readonly` contract: when set on a parent compound (address,
 * name, direct-deposit, …), the user can see the values but not edit
 * them. The browser does not natively cascade `readonly` to descendants
 * the way `<fieldset disabled>` cascades `disabled`. So each compound
 * has to forward the prop to every leaf control itself.
 *
 * Forgetting one cascade is silent: the field stays editable, the
 * parent's `readonly` is a lie, and reviewers usually don't notice
 * because the visual difference (textcursor on hover) is subtle.
 *
 * This lint catches the gap at CI time. Every `?disabled` on a
 * readonly-supporting tag must have a matching `?readonly` somewhere
 * in the same opening tag.
 *
 * Scope
 * -----
 * - Scans `packages/compound/src` and `packages/form-patterns/src`
 *   only. Inputs themselves are leaf controls and own their `readonly`
 *   rendering directly.
 * - Tags considered "readonly-supporting": every input that reads
 *   `this.readonly` in its template (the list below is derived from
 *   `this.readonly` in its source. Selection-only controls (radio,
 *   checkbox) are excluded — HTML does not define readonly for them.
 *
 * To extend
 * ---------
 * If a new readonly-supporting input ships, add its tag to
 * `READONLY_TAGS`. Selection-only controls (radio, checkbox) are not
 * in the list because HTML doesn't define readonly for them — use
 * `disabled` to lock those.
 *
 * Run via `pnpm lint:readonly-cascade`. Wired into
 * `pnpm validate:lints` so the drift-lints CI gate catches it.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS = [
  path.join('packages', 'compound', 'src'),
  path.join('packages', 'form-patterns', 'src'),
];

/**
 * Inputs that meaningfully consume `this.readonly` in their templates.
 * Selection controls (radio, checkbox, segmented) are excluded — HTML
 * does not define `readonly` for them.
 */
const READONLY_TAGS = new Set([
  'civ-combobox',
  'civ-country',
  'civ-currency',
  'civ-date-picker',
  'civ-date-range-picker',
  'civ-ein',
  'civ-email',
  'civ-file-upload',
  'civ-memorable-date',
  'civ-number',
  'civ-phone',
  'civ-routing-number',
  'civ-select',
  'civ-ssn',
  'civ-text-input',
  'civ-textarea',
  'civ-time-picker',
  'civ-va-file-number',
  'civ-yes-no',
  'civ-zip',
]);

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
    if (e.name === 'node_modules' || e.name === 'dist') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile() && full.endsWith('.ts') && !full.endsWith('.test.ts') && !full.endsWith('.stories.ts')) {
      yield full;
    }
  }
}

/**
 * Find every opening tag of an element from READONLY_TAGS in the
 * file, returning the tag's start index, end index, and tag name.
 * Tags may span multiple lines.
 */
function findOpenTags(content: string): Array<{ tag: string; start: number; end: number }> {
  const tags: Array<{ tag: string; start: number; end: number }> = [];
  const re = /<(civ-[a-z-]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const tag = m[1];
    if (!READONLY_TAGS.has(tag)) continue;
    const start = m.index;
    // Find the matching `>` that closes the opening tag — accounting
    // for `>` inside attribute values via a simple state machine.
    let i = start + m[0].length;
    let inStr: string | null = null;
    while (i < content.length) {
      const ch = content[i];
      if (inStr) {
        if (ch === inStr) inStr = null;
      } else {
        if (ch === '"' || ch === "'" || ch === '`') inStr = ch;
        else if (ch === '>') break;
      }
      i++;
    }
    if (i >= content.length) continue;
    tags.push({ tag, start, end: i });
  }
  return tags;
}

async function scanFile(file: string): Promise<Finding[]> {
  const relative = path.relative(REPO_ROOT, file);
  const content = await fs.readFile(file, 'utf-8');
  const findings: Finding[] = [];

  for (const { tag, start, end } of findOpenTags(content)) {
    const opening = content.slice(start, end + 1);
    // Only flag when the host actually forwards disabled — opening
    // tags without ?disabled may legitimately not need readonly
    // either (e.g., decorative/static usage).
    const hasDisabled = /[?.]?disabled\s*=/.test(opening);
    if (!hasDisabled) continue;
    // Accept any binding form: `?readonly`, `.readonly`, or bare
    // `readonly="..."`. All forward the prop to the child.
    const hasReadonly = /[?.]?readonly\s*=/.test(opening);
    if (hasReadonly) continue;
    const line = content.slice(0, start).split('\n').length;
    const firstLine = opening.split('\n', 1)[0];
    const snippet = firstLine.length > 100 ? firstLine.slice(0, 100) + '…' : firstLine;
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
    console.log('✓ every readonly-supporting <civ-*> with `?disabled` also forwards `?readonly`.');
    return;
  }

  console.error(`✗ ${findings.length} readonly-cascade gap(s) — compound forwards disabled but not readonly:\n`);
  console.error('Why: CivUI compounds don\'t natively cascade `readonly` to children');
  console.error('     the way <fieldset disabled> cascades disabled. Forgetting the');
  console.error('     forward leaves the leaf field editable when the parent is');
  console.error('     readonly. Add `?readonly="${this.readonly}"` to the opening');
  console.error('     tag, next to the existing `?disabled` line.\n');

  for (const { file, line, tag, snippet } of findings) {
    console.error(`  ${file}:${line}  <${tag} … ?disabled …> (missing ?readonly)`);
    console.error(`    ${snippet}`);
  }

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
