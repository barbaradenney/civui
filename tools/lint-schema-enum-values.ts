#!/usr/bin/env tsx
/**
 * lint-schema-enum-values — every enum prop in a schema must match the
 * string-literal union in its Lit source.
 *
 * Why
 * ---
 * `pnpm parity:schema` only validates prop *names* across platforms,
 * not enum *values*. So a schema can declare
 *
 *   variant: { type: 'enum', values: ['gray', 'primary', 'success', …] }
 *
 * while the Lit source actually accepts
 *
 *   variant: 'blue' | 'orange' | 'purple' | 'gray'
 *
 * and the drift goes uncaught. The auto-generated Props tables in
 * the docs then surface the wrong allowed values to contractors
 * implementing iOS / Android. We hit this on civ-alert.alertStyle,
 * civ-tag.variant, civ-link-card.{variant,color}, and civ-card.color
 * — the schemas had been filled in with a generic semantic palette
 * that didn't match the source.
 *
 * What this lints
 * ---------------
 * For every schema in `packages/schema/src/components/civ-*.schema.ts`
 * whose props include `type: 'enum'`, find the corresponding Lit
 * source file (via `COVERED_COMPONENTS` in `tools/schema-parity.ts`),
 * locate the matching `@property` declaration, and extract the type
 * union from one of:
 *
 *   - inline:  `variant: 'a' | 'b' = 'a'`
 *   - alias:   `variant: FooVariant = 'a'`  →  `export type FooVariant = 'a' | 'b'`
 *   - alias + extension:  `color: FooColor | '' = ''`
 *
 * Compare to the schema's `values: [...]` array. Mismatches are
 * reported in both directions:
 *
 *   - source has values the schema doesn't list  → docs under-promise
 *   - schema lists values the source doesn't accept  → docs lie
 *
 * Skipped cases (warned, not failed):
 *   - source type is bare `string` (no union)  → schema is documentation-only
 *   - prop not found in the source file  → the schema may describe a
 *     prop that exists on a parent class
 *
 * Caught by: `pnpm lint:schema-enum-values`. Wired into
 * `pnpm validate:lints` and the drift-lints CI gate.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { extractBraceBlock } from './schema-parity.js';

const ROOT = join(import.meta.dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'packages/schema/src/components');
const PACKAGES_DIR = join(ROOT, 'packages');

interface Finding {
  schemaFile: string;
  sourceFile: string;
  prop: string;
  kind: 'missing-in-source' | 'missing-in-schema' | 'no-source-prop' | 'no-source-union';
  schemaValues?: string[];
  sourceValues?: string[];
  detail?: string;
}

/** Map `civ-foo.schema.ts` → `packages/.../civ-foo.ts` via COVERED_COMPONENTS. */
async function loadSourceMap(): Promise<Map<string, string>> {
  const parityModule = await import(pathToFileURL(join(ROOT, 'tools/schema-parity.ts')).href);
  const covered: Array<{ name: string; source: string }> = parityModule.COVERED_COMPONENTS
    ?? parityModule.default?.COVERED_COMPONENTS
    ?? [];
  const map = new Map<string, string>();
  for (const spec of covered) {
    map.set(spec.name, join(ROOT, spec.source));
  }
  return map;
}

/**
 * Parse `export type Foo = 'a' | 'b' | 'c'` and `type Foo = …`
 * declarations into a name → values map. Handles multi-line unions
 * and parenthesized groups; ignores object types, function types,
 * and unions that contain non-string-literal members (those return
 * `null` to signal "not a plain string-literal union").
 */
export function parseTypeAliases(src: string): Map<string, string[] | null> {
  const aliases = new Map<string, string[] | null>();
  const aliasRegex = /^\s*(?:export\s+)?type\s+(\w+)\s*=\s*([\s\S]*?);/gm;
  let m: RegExpExecArray | null;
  while ((m = aliasRegex.exec(src)) !== null) {
    const name = m[1];
    const body = m[2].replace(/^[\s|()]+|[\s|()]+$/g, '').trim();
    const values = parseLiteralUnion(body);
    aliases.set(name, values);
  }
  return aliases;
}

/**
 * Like `parseTypeAliases` but only captures `export type Name = …`
 * declarations — used to build the cross-package map, where only
 * *exported* types are importable by a component source file.
 */
export function parseExportedTypeAliases(src: string): Map<string, string[] | null> {
  const aliases = new Map<string, string[] | null>();
  const aliasRegex = /^\s*export\s+type\s+(\w+)\s*=\s*([\s\S]*?);/gm;
  let m: RegExpExecArray | null;
  while ((m = aliasRegex.exec(src)) !== null) {
    const name = m[1];
    const body = m[2].replace(/^[\s|()]+|[\s|()]+$/g, '').trim();
    aliases.set(name, parseLiteralUnion(body));
  }
  return aliases;
}

/**
 * Collect the set of identifiers brought in by `import { … }` /
 * `import type { … }` statements. Handles `A as B` (records the local
 * alias `B`). We gate cross-package resolution on this set so we only
 * resolve a bare identifier against another package when the source
 * file actually imports a type by that name — never a coincidental
 * same-named local type elsewhere in the repo.
 */
export function parseImportedTypeNames(src: string): Set<string> {
  const names = new Set<string>();
  const importRegex = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"][^'"]+['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(src)) !== null) {
    for (const raw of m[1].split(',')) {
      const part = raw.trim().replace(/^type\s+/, '');
      if (!part) continue;
      const asMatch = part.match(/^\w+\s+as\s+(\w+)$/);
      names.add(asMatch ? asMatch[1] : part.split(/\s/)[0]);
    }
  }
  return names;
}

/** Recursively collect `.ts` source files under a dir, skipping
 * node_modules / dist / .d.ts / test / story files. */
export function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      out.push(...collectTsFiles(full));
    } else if (
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.d.ts') &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.stories.ts')
    ) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Build a repo-wide map of exported string-literal type aliases. A
 * name defined identically in multiple files keeps its value set; a
 * name with *conflicting* definitions maps to `null` (ambiguous →
 * resolution skipped, never a false positive). Non-literal exported
 * types are ignored.
 */
export function collectExternalAliasMap(srcFiles: string[]): Map<string, string[] | null> {
  const merged = new Map<string, string[] | null>();
  const firstSeen = new Map<string, string>();
  for (const file of srcFiles) {
    const exported = parseExportedTypeAliases(readFileSync(file, 'utf-8'));
    for (const [name, values] of exported) {
      if (values === null) continue;
      const key = JSON.stringify([...values].sort());
      if (!firstSeen.has(name)) {
        firstSeen.set(name, key);
        merged.set(name, values);
      } else if (firstSeen.get(name) !== key) {
        merged.set(name, null); // conflicting definitions → ambiguous
      }
    }
  }
  return merged;
}

/**
 * Parse a string like `'a' | 'b' | 'c'` (with optional surrounding
 * whitespace / newlines / parens) into ['a','b','c']. Also accepts
 * integer-literal unions like `2 | 3 | 4 | 5 | 6` (stringified).
 * Returns null if any member isn't a string-literal or integer
 * literal — mixed-type or non-literal unions don't compare cleanly.
 */
export function parseLiteralUnion(body: string): string[] | null {
  const cleaned = body.replace(/[()]/g, '').trim();
  if (!cleaned) return null;
  const parts = cleaned.split('|').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const values: string[] = [];
  for (const part of parts) {
    const strMatch = part.match(/^['"]([^'"]*)['"]$/);
    if (strMatch) { values.push(strMatch[1]); continue; }
    if (/^-?\d+(?:\.\d+)?$/.test(part)) { values.push(part); continue; }
    return null;
  }
  return values;
}

/**
 * Resolve a type expression (e.g., `FooVariant`, `'a' | 'b'`,
 * `FooColor | ''`) to a sorted unique list of string-literal values,
 * using `aliases` to look up named types. Returns null if any part
 * of the union isn't resolvable to a literal.
 */
export function resolveTypeExpression(typeExpr: string, aliases: Map<string, string[] | null>): string[] | null {
  const cleaned = typeExpr.replace(/[()]/g, '').trim();
  if (!cleaned) return null;
  const parts = cleaned.split('|').map((p) => p.trim()).filter(Boolean);
  const acc: string[] = [];
  for (const part of parts) {
    const strMatch = part.match(/^['"]([^'"]*)['"]$/);
    if (strMatch) { acc.push(strMatch[1]); continue; }
    // Integer literal (`2 | 3 | 4 | 5 | 6` for headingLevel).
    if (/^-?\d+(?:\.\d+)?$/.test(part)) { acc.push(part); continue; }
    // Strip generic parameters or array suffix — anything other than
    // a bare identifier means "not a plain literal union", skip.
    if (!/^\w+$/.test(part)) return null;
    if (!aliases.has(part)) return null;
    const aliasValues = aliases.get(part);
    if (aliasValues === null) return null; // alias itself wasn't a literal union
    acc.push(...(aliasValues ?? []));
  }
  // Dedup, preserve first-occurrence order.
  return Array.from(new Set(acc));
}

/**
 * Walk `src` for every `@property(...)` declaration, return a map of
 * propName → typeAnnotation (e.g., `'a' | 'b'`, `FooVariant`,
 * `FooColor | ''`). Mirrors the brace-scanning approach used in
 * `parseLitPropsFromSource` but extracts the type annotation that
 * the parity check throws away.
 */
function parseLitPropTypes(src: string): Map<string, string> {
  const types = new Map<string, string>();
  const headerRegex = /@property\s*\(\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(src)) !== null) {
    const openBrace = m.index + m[0].length - 1;
    const block = extractBraceBlock(src, openBrace);
    if (!block) continue;
    let after = block.endIndex;
    if (src[after] !== ')') continue;
    after++;
    // Match `<modifiers> name: Type [= default]`. Capture the type
    // annotation between `:` and either `=` or `;`/newline.
    const declRegex = /\s*(?:(?:public|private|protected|override|readonly|static|accessor|declare)\s+|@\w+\s*)*(\w+)[?!]?\s*:\s*([^=;\n]+?)(?:\s*=|\s*[;\n])/y;
    declRegex.lastIndex = after;
    const declMatch = declRegex.exec(src);
    if (!declMatch) continue;
    const name = declMatch[1];
    const typeExpr = declMatch[2].trim();
    types.set(name, typeExpr);
  }
  return types;
}

function arraysDifferent(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return true;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.some((v, i) => v !== sb[i]);
}

async function main(): Promise<void> {
  const sourceMap = await loadSourceMap();
  const schemaFiles = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith('.schema.ts'))
    .sort();

  // Repo-wide map of exported string-literal type aliases, so a prop
  // typed with a type imported from another package (e.g. civ-select's
  // `preset: SelectPresetName` from @civui/core) resolves instead of
  // being silently skipped. Built once.
  const externalAliases = collectExternalAliasMap(collectTsFiles(PACKAGES_DIR));

  const findings: Finding[] = [];

  for (const schemaFile of schemaFiles) {
    const schemaPath = join(COMPONENTS_DIR, schemaFile);
    const mod = await import(pathToFileURL(schemaPath).href);
    const schema = mod.default ?? mod;
    if (!schema?.name || !schema?.props) continue;

    const sourcePath = sourceMap.get(schema.name);
    if (!sourcePath) continue; // not in COVERED_COMPONENTS — skip

    const sourceSrc = readFileSync(sourcePath, 'utf-8');
    const aliases = parseTypeAliases(sourceSrc);
    // Merge in cross-package types the source imports, unless a local
    // alias of the same name already exists (local wins).
    for (const name of parseImportedTypeNames(sourceSrc)) {
      if (!aliases.has(name) && externalAliases.has(name)) {
        aliases.set(name, externalAliases.get(name)!);
      }
    }
    const propTypes = parseLitPropTypes(sourceSrc);

    for (const [propName, propDef] of Object.entries(schema.props as Record<string, any>)) {
      if (propDef?.type !== 'enum' || !Array.isArray(propDef?.values)) continue;
      // Integer enum values (e.g. `[2, 3, 4, 5, 6]` for civ-alert.headingLevel)
      // need to be stringified for comparison — `parseLiteralUnion` returns
      // string-form numeric literals from the TS source.
      const schemaValues: string[] = propDef.values.map((v: string | number) => String(v));

      const sourceType = propTypes.get(propName);
      if (!sourceType) {
        findings.push({
          schemaFile: `packages/schema/src/components/${schemaFile}`,
          sourceFile: sourcePath.replace(`${ROOT}/`, ''),
          prop: propName,
          kind: 'no-source-prop',
        });
        continue;
      }

      const sourceValues = resolveTypeExpression(sourceType, aliases);
      if (sourceValues === null) {
        // Source type is bare `string` or a non-literal union. Schema
        // is documenting more than the type system enforces — that's
        // fine, just skip the comparison.
        continue;
      }

      if (arraysDifferent(schemaValues, sourceValues)) {
        const missingInSchema = sourceValues.filter((v) => !schemaValues.includes(v));
        const missingInSource = schemaValues.filter((v) => !sourceValues.includes(v));
        if (missingInSchema.length > 0) {
          findings.push({
            schemaFile: `packages/schema/src/components/${schemaFile}`,
            sourceFile: sourcePath.replace(`${ROOT}/`, ''),
            prop: propName,
            kind: 'missing-in-schema',
            schemaValues,
            sourceValues,
            detail: `source accepts but schema doesn't list: ${missingInSchema.map((v) => JSON.stringify(v)).join(', ')}`,
          });
        }
        if (missingInSource.length > 0) {
          findings.push({
            schemaFile: `packages/schema/src/components/${schemaFile}`,
            sourceFile: sourcePath.replace(`${ROOT}/`, ''),
            prop: propName,
            kind: 'missing-in-source',
            schemaValues,
            sourceValues,
            detail: `schema lists but source rejects: ${missingInSource.map((v) => JSON.stringify(v)).join(', ')}`,
          });
        }
      }
    }
  }

  const drifts = findings.filter((f) => f.kind === 'missing-in-schema' || f.kind === 'missing-in-source');
  if (drifts.length === 0) {
    console.log(`✓ schema enum values match the Lit source unions across ${sourceMap.size} covered components.`);
    return;
  }

  console.error(`✗ ${drifts.length} schema enum value drift(s) detected.\n`);
  console.error('Why: the schemas in @civui/schema are the contract that');
  console.error('     auto-generated docs (Props tables) and native platform');
  console.error('     implementations rely on. An enum prop whose `values:`');
  console.error('     array drifts from the Lit source TS union lies to');
  console.error('     contractors and ships misleading docs.\n');

  for (const f of drifts) {
    console.error(`  ${f.schemaFile}  ${f.prop}`);
    console.error(`    source: ${f.sourceFile}`);
    console.error(`    schema values: ${JSON.stringify(f.schemaValues)}`);
    console.error(`    source values: ${JSON.stringify(f.sourceValues)}`);
    console.error(`    → ${f.detail}\n`);
  }

  console.error('Fix: update the schema\'s `values:` array (and `description:`)');
  console.error('     to match the source TS union, OR widen / narrow the');
  console.error('     source type — whichever is the source of truth.');

  process.exit(1);
}

// Only run when invoked directly (not when the test suite imports the
// exported helpers).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
