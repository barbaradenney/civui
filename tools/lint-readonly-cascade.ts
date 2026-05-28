#!/usr/bin/env tsx
/**
 * lint-readonly-cascade — two complementary checks that keep CivUI's
 * `readonly` contract honest.
 *
 * CHECK 1 — compound cascade (compound / form-patterns)
 * -----------------------------------------------------
 * Every compound component that renders an inner readonly-supporting
 * civui control AND forwards `?disabled="${this.disabled}"` to it MUST
 * also forward `?readonly="${this.readonly}"`.
 *
 * CivUI's `readonly` contract: when set on a parent compound (address,
 * name, direct-deposit, …), the user can see the values but not edit
 * them. The browser does not natively cascade `readonly` to descendants
 * the way `<fieldset disabled>` cascades `disabled`. So each compound
 * has to forward the prop to every leaf control itself. Forgetting one
 * cascade is silent: the field stays editable, the parent's `readonly`
 * is a lie, and reviewers usually don't notice because the visual
 * difference (text cursor on hover) is subtle.
 *
 * Scope: `packages/compound/src` + `packages/form-patterns/src`.
 * Tags considered readonly-supporting are in `READONLY_TAGS` (extend it
 * when a new readonly-supporting input ships). Selection-only controls
 * (radio, checkbox, segmented) are excluded — HTML doesn't define
 * readonly for them; lock those with `disabled`.
 *
 * CHECK 2 — native control readonly (inputs)
 * ------------------------------------------
 * Every input component that renders its OWN native `<input>` /
 * `<textarea>` and binds `?disabled` to it MUST also bind `?readonly`.
 * This is the leaf-level mirror of check 1: the civ-date-picker shipped
 * for months with an editable input under `readonly` because the native
 * `<input>` never received `?readonly` (the trigger button and
 * `_toggleDialog` didn't guard it either). Combobox / text-input /
 * textarea / number all do this correctly; date-picker was the gap.
 *
 * `<input>` types that don't support readonly (checkbox, radio, file,
 * hidden, submit, reset, button, image, range, color) are skipped by
 * type. `<select>` is not scanned — HTML `<select>` has no `readonly`
 * attribute (lock it with `disabled`). Genuine exceptions go in
 * `NATIVE_READONLY_ALLOWLIST`.
 *
 * Run via `pnpm lint:readonly-cascade`. Wired into
 * `pnpm validate:lints` so the drift-lints CI gate catches it.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { stripComments } from './lint-utils/strip-comments.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS = [
  path.join('packages', 'compound', 'src'),
  path.join('packages', 'form-patterns', 'src'),
];

/** Roots scanned by CHECK 2 (native `<input>` / `<textarea>` readonly). */
const NATIVE_SCAN_ROOTS = [
  path.join('packages', 'inputs', 'src'),
];

/**
 * `<input>` types that don't accept the `readonly` attribute per the
 * HTML spec. A control of one of these types is locked with `disabled`,
 * not `readonly`, so it's exempt from CHECK 2.
 */
const NON_READONLY_INPUT_TYPES = new Set([
  'checkbox', 'radio', 'file', 'hidden', 'submit', 'reset', 'button', 'image', 'range', 'color',
]);

/**
 * Components whose native control legitimately binds `?disabled` without
 * `?readonly` and can't be distinguished by `<input type>` alone. Empty
 * today — add a `civ-<name>` entry with a one-line rationale if a real
 * exception appears.
 */
const NATIVE_READONLY_ALLOWLIST = new Set<string>([]);

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
 * Locate the index of the `>` that closes the opening tag starting at
 * `from`, skipping `>` characters that appear inside quoted attribute
 * values (a regex literal in a `pattern="…"`, for example). Returns -1
 * if no close is found before EOF.
 */
function findOpenTagClose(content: string, from: number): number {
  let i = from;
  let inStr: string | null = null;
  while (i < content.length) {
    const ch = content[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') inStr = ch;
      else if (ch === '>') return i;
    }
    i++;
  }
  return -1;
}

/**
 * Find every opening tag of an element from READONLY_TAGS in the
 * file, returning the tag's start index, end index, and tag name.
 * Tags may span multiple lines.
 */
export function findOpenTags(content: string): Array<{ tag: string; start: number; end: number }> {
  const tags: Array<{ tag: string; start: number; end: number }> = [];
  const re = /<(civ-[a-z-]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const tag = m[1];
    if (!READONLY_TAGS.has(tag)) continue;
    const start = m.index;
    const end = findOpenTagClose(content, start + m[0].length);
    if (end === -1) continue;
    tags.push({ tag, start, end });
  }
  return tags;
}

/**
 * Find every native `<input>` / `<textarea>` opening tag, returning its
 * element name and span. Used by CHECK 2.
 */
export function findNativeOpenTags(content: string): Array<{ tag: string; start: number; end: number }> {
  const tags: Array<{ tag: string; start: number; end: number }> = [];
  const re = /<(input|textarea)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const start = m.index;
    const end = findOpenTagClose(content, start + m[0].length);
    if (end === -1) continue;
    tags.push({ tag: m[1].toLowerCase(), start, end });
  }
  return tags;
}

/**
 * CHECK 2 scanner: given an input component's source and the component
 * tag it defines (e.g. `civ-date-picker`), return native controls that
 * bind `?disabled` but not `?readonly`. `<input>` types that don't
 * support readonly are skipped, and allowlisted components are exempt.
 */
export function findNativeReadonlyGaps(content: string, componentTag: string, file = '<inline>'): Finding[] {
  if (NATIVE_READONLY_ALLOWLIST.has(componentTag)) return [];
  const findings: Finding[] = [];
  for (const { tag, start, end } of findNativeOpenTags(content)) {
    const opening = content.slice(start, end + 1);
    if (tag === 'input') {
      // Skip input types that can't be readonly. A static `type="x"`
      // literal is read directly; a dynamic `type="${…}"` binding is
      // treated as text-like (included) since we can't prove otherwise.
      const typeMatch = opening.match(/\btype\s*=\s*"([a-z]+)"/i);
      if (typeMatch && NON_READONLY_INPUT_TYPES.has(typeMatch[1].toLowerCase())) continue;
    }
    const hasDisabled = /[?.]?disabled\s*=/.test(opening);
    if (!hasDisabled) continue;
    const hasReadonly = /[?.]?readonly\s*=/.test(opening);
    if (hasReadonly) continue;
    const line = content.slice(0, start).split('\n').length;
    const firstLine = opening.split('\n', 1)[0];
    const snippet = firstLine.length > 100 ? firstLine.slice(0, 100) + '…' : firstLine;
    findings.push({ file, line, tag, snippet });
  }
  return findings;
}

/**
 * Pure-function scanner: given a file's text and its display path,
 * return cascade gaps. Used by the file-walking entry point AND
 * by the unit tests (so they don't need to write fixture files).
 */
export function findCascadeGaps(content: string, file = '<inline>'): Finding[] {
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
    findings.push({ file, line, tag, snippet });
  }
  return findings;
}

async function scanFile(file: string): Promise<Finding[]> {
  const relative = path.relative(REPO_ROOT, file);
  const raw = await fs.readFile(file, 'utf-8');
  // Strip JSDoc / inline comments so example markup inside doc
  // blocks (e.g. `<civ-select ?disabled="…">`) isn't flagged.
  const content = stripComments(raw, '.ts');
  return findCascadeGaps(content, relative);
}

/**
 * Derive the custom-element tag a source file defines from its
 * `@customElement('civ-…')` decorator. Falls back to '' (which is never
 * in the allowlist, so the file is still scanned).
 */
function componentTagOf(source: string): string {
  const m = source.match(/@customElement\(\s*['"]([a-z0-9-]+)['"]\s*\)/i);
  return m ? m[1] : '';
}

async function scanNativeFile(file: string): Promise<Finding[]> {
  const relative = path.relative(REPO_ROOT, file);
  const raw = await fs.readFile(file, 'utf-8');
  const content = stripComments(raw, '.ts');
  const tag = componentTagOf(content);
  return findNativeReadonlyGaps(content, tag, relative);
}

async function main(): Promise<void> {
  const cascadeFindings: Finding[] = [];
  for (const root of SCAN_ROOTS) {
    const rootPath = path.join(REPO_ROOT, root);
    for await (const file of walk(rootPath)) {
      cascadeFindings.push(...(await scanFile(file)));
    }
  }

  const nativeFindings: Finding[] = [];
  for (const root of NATIVE_SCAN_ROOTS) {
    const rootPath = path.join(REPO_ROOT, root);
    for await (const file of walk(rootPath)) {
      nativeFindings.push(...(await scanNativeFile(file)));
    }
  }

  if (cascadeFindings.length === 0 && nativeFindings.length === 0) {
    console.log('✓ readonly is respected: compound cascades forward it, and native input/textarea controls bind it alongside disabled.');
    return;
  }

  if (cascadeFindings.length > 0) {
    console.error(`✗ ${cascadeFindings.length} readonly-cascade gap(s) — compound forwards disabled but not readonly:\n`);
    console.error('Why: CivUI compounds don\'t natively cascade `readonly` to children');
    console.error('     the way <fieldset disabled> cascades disabled. Forgetting the');
    console.error('     forward leaves the leaf field editable when the parent is');
    console.error('     readonly. Add `?readonly="${this.readonly}"` to the opening');
    console.error('     tag, next to the existing `?disabled` line.\n');
    for (const { file, line, tag, snippet } of cascadeFindings) {
      console.error(`  ${file}:${line}  <${tag} … ?disabled …> (missing ?readonly)`);
      console.error(`    ${snippet}`);
    }
    console.error('');
  }

  if (nativeFindings.length > 0) {
    console.error(`✗ ${nativeFindings.length} native-control readonly gap(s) — input/textarea binds disabled but not readonly:\n`);
    console.error('Why: a form input that supports `disabled` should also honor');
    console.error('     `readonly` on its native control. Without it a readonly');
    console.error('     field stays editable (the civ-date-picker bug). Add');
    console.error('     `?readonly="${this.readonly}"` next to the `?disabled` bind,');
    console.error('     or allowlist the component in NATIVE_READONLY_ALLOWLIST.\n');
    for (const { file, line, tag, snippet } of nativeFindings) {
      console.error(`  ${file}:${line}  <${tag} … ?disabled …> (missing ?readonly)`);
      console.error(`    ${snippet}`);
    }
  }

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
