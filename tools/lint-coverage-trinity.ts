#!/usr/bin/env tsx
/**
 * lint-coverage-trinity — verify every CivUI component carries its
 * doc / test / contract trinity:
 *
 *   1. A co-located `*.test.ts` file        (unit coverage)
 *   2. A co-located `*.stories.ts` file     (Storybook playground)
 *   3. For cross-platform components, a
 *      `packages/schema/src/components/civ-<name>.schema.ts` file
 *      (the platform-neutral contract)
 *
 * Cross-platform-component coverage is determined by membership in
 * the `COVERED_COMPONENTS` list inside `tools/schema-parity.ts` —
 * the canonical "which components should be on iOS / Android /
 * Drupal" registry. A component that isn't in that list is
 * assumed web-only (overlays, layout utilities, etc.) and the
 * schema is not required.
 *
 * The lint finds every `@customElement('civ-X')` in the
 * `packages/` tree, derives the expected co-located paths, and
 * reports each missing file.
 *
 * Pass with no findings.
 * Exit 1 on findings.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');
const SCHEMA_DIR = path.join(REPO_ROOT, 'packages/schema/src/components');
const SCHEMA_PARITY_FILE = path.join(REPO_ROOT, 'tools/schema-parity.ts');

interface Finding {
  tag: string;
  source: string;
  missing: 'test' | 'stories' | 'schema';
  expected: string;
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
      // Skip non-Lit-component packages.
      if (base === 'mcp-server' || base === 'cli' || base === 'content' || base === 'test-utils' || base === 'tokens') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

/**
 * Coverage is also satisfied when *any* `.test.ts` / `.stories.ts`
 * file in the same directory references the tag — paired components
 * (civ-radio + civ-radio-group, civ-list + civ-list-item, etc.) often
 * share the parent's tests and stories, and that's the intended shape.
 */
async function siblingReferencesTag(dir: string, suffix: '.test.ts' | '.stories.ts', tag: string): Promise<boolean> {
  let names: string[];
  try { names = await fs.readdir(dir); } catch { return false; }
  for (const name of names) {
    if (!name.endsWith(suffix)) continue;
    const src = await fs.readFile(path.join(dir, name), 'utf8');
    if (new RegExp(`<${tag}\\b`).test(src)) return true;
    if (new RegExp(`['"]${tag}['"]`).test(src)) return true;
  }
  return false;
}

/** Parse tools/schema-parity.ts for the `name:` field of each COVERED_COMPONENTS entry. */
async function loadCoveredTags(): Promise<Set<string>> {
  const src = await fs.readFile(SCHEMA_PARITY_FILE, 'utf8');
  const tags = new Set<string>();
  // Extract the COVERED_COMPONENTS block.
  const blockMatch = /const\s+COVERED_COMPONENTS[^=]*=\s*\[([\s\S]*?)\];/.exec(src);
  if (!blockMatch) return tags;
  for (const m of blockMatch[1].matchAll(/name:\s*'([^']+)'/g)) {
    tags.add(m[1]);
  }
  return tags;
}

// Match `@customElement('civ-X')` but not the JSDoc-escaped form
// `\@customElement('civ-X')` that appears inside doc examples.
const COMPONENT_DECL_RE = /(?<!\\)@customElement\(['"]([^'"]+)['"]\)/g;

async function main(): Promise<void> {
  const covered = await loadCoveredTags();
  const files = await walk(PACKAGES_DIR);
  const findings: Finding[] = [];
  let totalComponents = 0;

  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    for (const m of src.matchAll(COMPONENT_DECL_RE)) {
      const tag = m[1];
      if (tag.includes('${')) continue; // scaffold template
      totalComponents++;

      // Expected co-located paths. Source files live under
      //   packages/<pkg>/src/<dir>/<file>.ts
      // The test sibling is <file>.test.ts; stories sibling is
      // <file>.stories.ts. Schema lives at packages/schema/src/
      // components/<tag>.schema.ts when it's a covered component.
      const dir = path.dirname(file);
      const base = path.basename(file, '.ts');
      const testPath = path.join(dir, `${base}.test.ts`);
      const storiesPath = path.join(dir, `${base}.stories.ts`);

      const rel = (p: string) => path.relative(REPO_ROOT, p);

      if (!(await fileExists(testPath))) {
        const sibling = await siblingReferencesTag(dir, '.test.ts', tag);
        if (!sibling) {
          findings.push({ tag, source: rel(file), missing: 'test', expected: rel(testPath) });
        }
      }
      if (!(await fileExists(storiesPath))) {
        const sibling = await siblingReferencesTag(dir, '.stories.ts', tag);
        if (!sibling) {
          findings.push({ tag, source: rel(file), missing: 'stories', expected: rel(storiesPath) });
        }
      }
      if (covered.has(tag)) {
        const schemaPath = path.join(SCHEMA_DIR, `${tag}.schema.ts`);
        if (!(await fileExists(schemaPath))) {
          findings.push({ tag, source: rel(file), missing: 'schema', expected: rel(schemaPath) });
        }
      }
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ ${totalComponents} component(s) — each has a co-located *.test.ts, ` +
      `*.stories.ts, and (for cross-platform components) a schema.ts.`,
    );
    return;
  }

  const grouped = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!grouped.has(f.tag)) grouped.set(f.tag, []);
    grouped.get(f.tag)!.push(f);
  }
  console.error(`✗ ${findings.length} coverage gap(s) across ${grouped.size} component(s):\n`);
  for (const [tag, list] of grouped) {
    console.error(`  <${tag}>  (${list[0].source})`);
    for (const f of list) {
      console.error(`    missing ${f.missing}: ${f.expected}`);
    }
    console.error('');
  }
  console.error(
    'Every CivUI component should have:\n' +
    '  - A `*.test.ts` next to the source — even a smoke test\n' +
    '    catches registration / render-time regressions.\n' +
    '  - A `*.stories.ts` next to the source — even a single\n' +
    '    Default story documents the affordance.\n' +
    '  - A schema in `packages/schema/src/components/` if the\n' +
    '    component is in COVERED_COMPONENTS — that contract drives\n' +
    '    the iOS / Android / Drupal parity gates.\n',
  );
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
