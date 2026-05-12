#!/usr/bin/env tsx
/**
 * lint-jsdoc-events — verify every `@fires` tag in a component's
 * class-level JSDoc names a real CustomEvent that the same class
 * actually dispatches.
 *
 * Catches the same docstring-drift trap as `lint-jsdoc-props`, but
 * for events:
 *   • component renames `civ-foo-changed` → `civ-foo-change` but
 *     the @fires line keeps the old name
 *   • component drops a dispatch but @fires survives
 *   • component adds a dispatch but forgets the @fires entry
 *
 * Dispatch detection looks for either of:
 *   - `dispatch(this, 'civ-foo')`   (the helper from @civui/core)
 *   - `new CustomEvent('civ-foo')` / `new CustomEvent("civ-foo")`
 *   - `this.dispatchEvent(new CustomEvent('civ-foo'))`
 *
 * Inherited events (`civ-input`, `civ-change`, `civ-analytics`,
 * `civ-reset`) are dispatched by base helpers in CivFormElement.
 * The lint seeds them for any class that extends a form base so
 * documenting them in @fires doesn't get flagged.
 *
 * Pass with no findings.
 * Exit 1 on findings.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface MismatchEntry {
  file: string;
  tag: string;
  name: string;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      if (p.endsWith('.ts') && !p.endsWith('.test.ts') && !p.endsWith('.stories.ts') && !p.includes('/dist/')) {
        out.push(p);
      }
      return;
    }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

const COMPONENT_BLOCK_RE = /\/\*\*([\s\S]*?)\*\/\s*@customElement\(['"]([^'"]+)['"]\)/g;

// `@fires civ-foo` or `@fires civ-foo-bar - description`
const JSDOC_FIRES_RE = /@fires\s+([a-zA-Z][\w-]*)/g;

// dispatch(this, 'civ-foo') / dispatch(this, "civ-foo")
const DISPATCH_HELPER_RE = /\bdispatch\s*\(\s*this\s*,\s*['"]([a-zA-Z][\w-]*)['"]/g;

// new CustomEvent('civ-foo') / dispatchEvent(new CustomEvent('civ-foo'))
const CUSTOM_EVENT_RE = /\bnew\s+CustomEvent\s*\(\s*['"]([a-zA-Z][\w-]*)['"]/g;

interface Component {
  file: string;
  tag: string;
  jsdocEvents: Set<string>;
  dispatchedEvents: Set<string>;
}

// Events dispatched by base-class helpers. A class extending one of
// these bases may document them in @fires without explicitly
// dispatching them itself.
//   CivBaseElement.sendAnalytics() → dispatches civ-analytics
//   CivFormElement._handleInput()  → dispatches civ-input
//   CivFormElement._handleChange() → dispatches civ-change
//   CivFormElement.formResetCallback() → dispatches civ-reset
const INHERITED_EVENTS_BY_BASE: Record<string, string[]> = {
  CivBaseElement: ['civ-analytics'],
  CivFormElement: ['civ-input', 'civ-change', 'civ-analytics', 'civ-reset'],
  CivBooleanFormElement: ['civ-input', 'civ-change', 'civ-analytics', 'civ-reset'],
  CivCompoundElement: ['civ-input', 'civ-change', 'civ-analytics', 'civ-reset'],
  PresetInputWrapper: ['civ-input', 'civ-change', 'civ-analytics', 'civ-reset'],
};

function seedInheritedEvents(classBody: string, classDeclaration: string): Set<string> {
  const inherited = new Set<string>();
  const matched = `${classDeclaration} ${classBody}`;
  for (const [base, events] of Object.entries(INHERITED_EVENTS_BY_BASE)) {
    if (new RegExp(`\\b${base}\\b`).test(matched)) {
      for (const e of events) inherited.add(e);
    }
  }
  return inherited;
}

async function audit(): Promise<Component[]> {
  const files = await walk(PACKAGES_DIR);
  const components: Component[] = [];
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    for (const blockMatch of src.matchAll(COMPONENT_BLOCK_RE)) {
      const jsdocBody = blockMatch[1];
      const tag = blockMatch[2];

      if (tag.includes('${')) continue;

      const jsdocEvents = new Set<string>();
      for (const m of jsdocBody.matchAll(JSDOC_FIRES_RE)) {
        jsdocEvents.add(m[1]);
      }
      if (jsdocEvents.size === 0) continue; // nothing to lint for this component

      const classStart = blockMatch.index! + blockMatch[0].length;
      const restOfFile = src.slice(classStart);
      const nextDecorator = restOfFile.search(/\n@customElement/);
      const classBody = nextDecorator >= 0 ? restOfFile.slice(0, nextDecorator) : restOfFile;

      const classDeclMatch = /class\s+\w+\s+extends[^{]+/.exec(classBody);
      const classDeclaration = classDeclMatch?.[0] ?? '';

      const dispatchedEvents = new Set<string>();
      for (const m of classBody.matchAll(DISPATCH_HELPER_RE)) {
        dispatchedEvents.add(m[1]);
      }
      for (const m of classBody.matchAll(CUSTOM_EVENT_RE)) {
        dispatchedEvents.add(m[1]);
      }
      for (const e of seedInheritedEvents(classBody, classDeclaration)) {
        dispatchedEvents.add(e);
      }

      components.push({ file, tag, jsdocEvents, dispatchedEvents });
    }
  }
  return components;
}

function findMismatches(components: Component[]): MismatchEntry[] {
  const out: MismatchEntry[] = [];
  for (const c of components) {
    for (const evt of c.jsdocEvents) {
      if (!c.dispatchedEvents.has(evt)) {
        out.push({
          file: path.relative(REPO_ROOT, c.file),
          tag: c.tag,
          name: evt,
        });
      }
    }
  }
  return out;
}

async function main(): Promise<void> {
  const components = await audit();
  const findings = findMismatches(components);

  const documentedCount = components.length;
  if (findings.length === 0) {
    console.log(`✓ ${documentedCount} component(s) with @fires tags — every event names a real dispatch.`);
    return;
  }

  const grouped = new Map<string, MismatchEntry[]>();
  for (const f of findings) {
    if (!grouped.has(f.file)) grouped.set(f.file, []);
    grouped.get(f.file)!.push(f);
  }
  console.error(`✗ ${findings.length} JSDoc @fires / dispatch mismatch(es) across ${grouped.size} file(s):\n`);
  for (const [file, list] of grouped) {
    console.error(`  ${file}  (<${list[0].tag}>)`);
    for (const m of list) {
      console.error(`    @fires ${m.name} — no matching dispatch(this, '${m.name}') or new CustomEvent('${m.name}')`);
    }
    console.error('');
  }
  console.error(
    'Each `@fires` tag in the class-level JSDoc must correspond to a real\n' +
    'event dispatch in the same class. Either:\n' +
    '  - Remove the stale @fires entry, or\n' +
    '  - Rename the @fires entry to match the actual event name, or\n' +
    '  - Add the missing dispatch call if the docstring is correct.',
  );
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
