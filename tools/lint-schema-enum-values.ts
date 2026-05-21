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
function parseTypeAliases(src: string): Map<string, string[] | null> {
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
 * Parse a string like `'a' | 'b' | 'c'` (with optional surrounding
 * whitespace / newlines / parens) into ['a','b','c']. Returns null
 * if any member isn't a single-quoted string literal — that means
 * the union isn't a plain enum and we shouldn't compare values.
 */
function parseLiteralUnion(body: string): string[] | null {
  const cleaned = body.replace(/[()]/g, '').trim();
  if (!cleaned) return null;
  const parts = cleaned.split('|').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const values: string[] = [];
  for (const part of parts) {
    const litMatch = part.match(/^['"]([^'"]*)['"]$/);
    if (!litMatch) return null;
    values.push(litMatch[1]);
  }
  return values;
}

/**
 * Resolve a type expression (e.g., `FooVariant`, `'a' | 'b'`,
 * `FooColor | ''`) to a sorted unique list of string-literal values,
 * using `aliases` to look up named types. Returns null if any part
 * of the union isn't resolvable to a literal.
 */
function resolveTypeExpression(typeExpr: string, aliases: Map<string, string[] | null>): string[] | null {
  const cleaned = typeExpr.replace(/[()]/g, '').trim();
  if (!cleaned) return null;
  const parts = cleaned.split('|').map((p) => p.trim()).filter(Boolean);
  const acc: string[] = [];
  for (const part of parts) {
    const litMatch = part.match(/^['"]([^'"]*)['"]$/);
    if (litMatch) {
      acc.push(litMatch[1]);
      continue;
    }
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
    const propTypes = parseLitPropTypes(sourceSrc);

    for (const [propName, propDef] of Object.entries(schema.props as Record<string, any>)) {
      if (propDef?.type !== 'enum' || !Array.isArray(propDef?.values)) continue;
      const schemaValues: string[] = propDef.values;

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
