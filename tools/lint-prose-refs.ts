#!/usr/bin/env tsx
/**
 * lint-prose-refs — verify every `<civ-X>` / `</civ-X>` reference in
 * long-form CivUI documentation (CLAUDE.md, AGENTS.md, `.claude/rules/*.md`,
 * apps/docs/docs/**\/*.mdx) resolves to a registered custom element.
 *
 * Catches the "civ-form-field bullet survived Phase 4" / "civ-progress-bar
 * survived rename" class of bugs surfaced by the form-pattern audit, where
 * narrative prose outlives the code it describes.
 *
 * Strategy
 * --------
 * 1. Build the set of registered custom elements by grepping every
 *    `@customElement('civ-...')` decorator under packages/.
 * 2. Walk the long-form doc paths and pull out every `<civ-X` /
 *    `</civ-X` token (tag-style only — these are unambiguously
 *    custom-element refs, CSS classes never appear in angle brackets).
 * 3. Flag any tag whose name isn't in the registered set.
 *
 * Explicit intentional refs to deleted components — e.g. changelog
 * entries documenting Phase-4 removals — live in CHANGELOG_ALLOWLIST
 * below. Add a file there only when the page's purpose is to discuss
 * a thing that no longer exists.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface ProseRef {
  tag: string;
  file: string;
  line: number;
  context: string;
}

const DOC_PATHS: string[] = [
  'CLAUDE.md',
  'AGENTS.md',
  '.claude/rules',
  'apps/docs/docs',
];

/**
 * Pages whose purpose is documenting removed / deprecated APIs.
 * References to dead components in these files are deliberate.
 */
const CHANGELOG_ALLOWLIST: ReadonlySet<string> = new Set([
  // Common-traps doc deliberately shows the bad-example contrast
  // (`<civ-form-field>` next to "✗ stale", `<civ-progress-bar>` as a
  // known-not-an-element). Future migration / upgrade history pages
  // belong here too.
  '.claude/rules/common-traps.md',
]);

/**
 * Tag names used as illustrative placeholders ("imagine a new
 * `<civ-thing>`"), not as real component references.
 */
const PLACEHOLDER_TAGS: ReadonlySet<string> = new Set([
  'civ-thing',
  'civ-existing',
  'civ-foo',
  'civ-bar',
  'civ-name', // already in real components, but listed defensively
]);

const CUSTOM_ELEMENT_TAG_RE = /@customElement\(['"]([^'"]+)['"]\)/g;
const TAG_REF_RE = /<\/?(civ-[a-z][a-z0-9-]*)\b/g;

async function walk(target: string, suffix: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      if (p.endsWith(suffix)) out.push(p);
      return;
    }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo' || base === 'build') return;
      const entries = await fs.readdir(p);
      for (const name of entries) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(target);
  return out;
}

async function collectRegisteredTags(): Promise<Set<string>> {
  const tsFiles = await walk(PACKAGES_DIR, '.ts');
  const tags = new Set<string>();
  for (const file of tsFiles) {
    if (file.includes('/dist/') || file.endsWith('.test.ts')) continue;
    const src = await fs.readFile(file, 'utf8');
    for (const m of src.matchAll(CUSTOM_ELEMENT_TAG_RE)) {
      tags.add(m[1]);
    }
  }
  return tags;
}

async function collectDocFiles(): Promise<string[]> {
  const out: string[] = [];
  for (const docPath of DOC_PATHS) {
    const abs = path.join(REPO_ROOT, docPath);
    let stat;
    try { stat = await fs.stat(abs); } catch { continue; }
    if (stat.isFile()) {
      out.push(abs);
    } else {
      const found = await walk(abs, '.md');
      const mdx = await walk(abs, '.mdx');
      out.push(...found, ...mdx);
    }
  }
  return out;
}

async function collectRefs(files: string[]): Promise<ProseRef[]> {
  const refs: ProseRef[] = [];
  for (const file of files) {
    const rel = path.relative(REPO_ROOT, file);
    if (CHANGELOG_ALLOWLIST.has(rel)) continue;
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split('\n');
    for (const m of src.matchAll(TAG_REF_RE)) {
      const offset = m.index ?? 0;
      const lineNumber = src.slice(0, offset).split('\n').length;
      refs.push({
        tag: m[1],
        file: rel,
        line: lineNumber,
        context: lines[lineNumber - 1]?.trim().slice(0, 120) ?? '',
      });
    }
  }
  return refs;
}

async function main(): Promise<void> {
  const [registered, docFiles] = await Promise.all([
    collectRegisteredTags(),
    collectDocFiles(),
  ]);
  const refs = await collectRefs(docFiles);

  const broken = refs.filter(r =>
    !registered.has(r.tag) && !PLACEHOLDER_TAGS.has(r.tag),
  );

  if (broken.length === 0) {
    console.log(`✓ ${refs.length} <civ-*> reference(s) across ${docFiles.length} doc files — all resolve to registered components.`);
    return;
  }

  // Group by tag to make the output skim-able.
  const grouped = new Map<string, ProseRef[]>();
  for (const r of broken) {
    if (!grouped.has(r.tag)) grouped.set(r.tag, []);
    grouped.get(r.tag)!.push(r);
  }

  console.error(`✗ ${broken.length} unknown <civ-*> reference(s) across ${grouped.size} tag(s):\n`);
  for (const [tag, list] of grouped) {
    console.error(`  <${tag}>  (${list.length} use${list.length === 1 ? '' : 's'})`);
    for (const r of list.slice(0, 5)) {
      console.error(`    ${r.file}:${r.line}`);
      console.error(`      ${r.context}`);
    }
    if (list.length > 5) console.error(`    … and ${list.length - 5} more`);
    console.error('');
  }
  console.error(
    'These tags are referenced in prose but no `@customElement(...)` matches.\n' +
    'Either:\n' +
    '  - rename the reference to the current component, or\n' +
    '  - delete the reference if it documents a removed API, or\n' +
    '  - add the file path to CHANGELOG_ALLOWLIST in tools/lint-prose-refs.ts\n' +
    '    if the page exists to discuss the removed thing.',
  );
  printRuleLink('prose-refs');
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
