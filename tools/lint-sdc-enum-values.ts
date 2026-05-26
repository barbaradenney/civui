#!/usr/bin/env tsx
/**
 * lint-sdc-enum-values — every Drupal SDC `enum: [...]` array must match
 * the corresponding schema's `values: [...]` array.
 *
 * Why
 * ---
 * `pnpm sync:drupal` is append-only — it adds missing props to SDC YAMLs
 * but doesn't prune stale entries. When a schema enum value is REMOVED
 * (audit-debt example: civ-link.variant `tertiary`, dropped from the
 * schema after a design pass), the Drupal SDC YAML keeps the orphan
 * value indefinitely. Drupal authors who pick the orphan value get an
 * unstyled component, with no validation error from the SDC contract.
 *
 * What this lints
 * ---------------
 * For every component in `COVERED_COMPONENTS` (in `tools/schema-parity.ts`)
 * with a `drupal:` path, walk the schema's enum props and compare each
 * `values: [...]` array against the Drupal YAML's `enum: [...]` array.
 *
 * Reports drift in two directions:
 *
 *   - **orphan-in-drupal**:    YAML enum has values the schema doesn't list
 *     (Drupal authors can pick a value that won't render)
 *   - **drupal-over-constrains**: schema isn't enum but YAML has one
 *     (rare — YAML hand-edited or stale sync; locks Drupal authors out
 *     of values the schema accepts)
 *
 * Skipped (intentionally narrower than the symmetric check on enum values):
 *   - Schema prop missing from YAML entirely (parity:schema covers that).
 *   - Schema enum where YAML omits the enum constraint or under-declares
 *     values (this is widespread existing drift — most SDC YAMLs were
 *     generated before the schemas added enum constraints to props, and
 *     sync is append-only. Tightening these is a separate "tighten Drupal
 *     SDC constraints" pass, tracked in audit-debt).
 *   - Schema values containing `''` (empty string) — sync deliberately
 *     filters these before writing YAML, so the lint mirrors the filter.
 *
 * Caught by: `pnpm lint:sdc-enum-values`. Wired into `pnpm validate:lints`
 * and the drift-lints CI gate.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { camelToSnake } from './schema-parity.js';

const ROOT = join(import.meta.dirname, '..');

interface Finding {
  schemaFile: string;
  yamlFile: string;
  prop: string;
  yamlKey: string;
  kind: 'orphan-in-drupal' | 'drupal-over-constrains';
  schemaValues?: string[];
  yamlValues?: string[];
  detail: string;
}

/**
 * Parse SDC YAML's prop → enum-values map. Walks lines tracking
 * indentation, finds the props.properties block, captures each
 * prop's `enum: [...]` array. Returns a map keyed by the SDC key
 * (snake_case, e.g. `new_tab`).
 */
export function parseSdcEnums(src: string): Map<string, string[]> {
  const enums = new Map<string, string[]>();
  const lines = src.split('\n');
  let state: 'before-props' | 'in-props' | 'in-properties' | 'done' = 'before-props';
  let propsIndent = 0;
  let baseIndent = 0;
  let currentName: string | null = null;
  let currentIndent = 0;
  for (const line of lines) {
    if (state === 'done') break;
    const m = line.match(/^(\s*)([\w-]+)\s*:(.*)$/);
    if (!m) continue;
    const indent = m[1].length;
    const key = m[2];
    const rest = m[3];
    if (state === 'before-props') {
      if (key === 'props' && indent === 0) {
        state = 'in-props';
        propsIndent = indent;
      }
      continue;
    }
    if (state === 'in-props') {
      if (indent <= propsIndent) { state = 'done'; break; }
      if (key === 'properties' && indent === propsIndent + 2) {
        state = 'in-properties';
        baseIndent = indent;
      }
      continue;
    }
    // state === 'in-properties'
    if (indent <= baseIndent) { state = 'done'; break; }
    if (indent === baseIndent + 2) {
      currentName = key;
      currentIndent = indent;
    } else if (currentName && key === 'enum' && indent > currentIndent) {
      const values = parseEnumLiteral(rest);
      if (values) enums.set(currentName, values);
    }
  }
  return enums;
}

/**
 * Parse the value side of `enum: [...]`. Returns the parsed string
 * array, or null if the line doesn't conform. Handles:
 *
 *   enum: ['a', 'b', 'c']            → string values
 *   enum: ["a", "b", "c"]            → string values (double-quoted)
 *   enum: [2, 3, 4, 5, 6]            → integer values, stringified
 *   enum: ['mixed', 2, 'values']     → mixed, stringified
 */
function parseEnumLiteral(rest: string): string[] | null {
  const trimmed = rest.trim();
  const arrayMatch = trimmed.match(/^\[(.*)\]\s*$/);
  if (!arrayMatch) return null;
  const inner = arrayMatch[1].trim();
  if (inner === '') return [];
  const parts = inner.split(',').map((p) => p.trim()).filter(Boolean);
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
 * Compute the SDC key for a schema prop. Mirrors `drupalKeyFor` in
 * `tools/sync-drupal-sdc.ts` (prefer `def.attribute` with `-` → `_`,
 * else camelToSnake).
 */
function drupalKeyFor(propName: string, def: any): string {
  if (def?.attribute) return def.attribute.replace(/-/g, '_');
  return camelToSnake(propName);
}

/**
 * Filter schema enum values the way `sync-drupal-sdc.ts` does before
 * writing the YAML — drops empty-string sentinels. Without this, a
 * schema with `values: ['', 'chip', 'inline']` would falsely diff
 * against the YAML's `enum: ['chip', 'inline']`.
 */
function normalizeSchemaValues(values: any[]): string[] {
  return values.filter((v) => v !== '').map(String);
}

function arraysDiffer(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return true;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.some((v, i) => v !== sb[i]);
}

async function main(): Promise<void> {
  const parity = await import(pathToFileURL(join(ROOT, 'tools/schema-parity.ts')).href);
  const covered: Array<{ name: string; drupal?: string }> = parity.COVERED_COMPONENTS ?? [];

  const findings: Finding[] = [];
  let checkedCount = 0;
  let propsCompared = 0;

  for (const spec of covered) {
    if (!spec.drupal) continue;
    const yamlPath = join(ROOT, spec.drupal);
    const yamlSrc = readFileSync(yamlPath, 'utf-8');
    const yamlEnums = parseSdcEnums(yamlSrc);

    const schemaPath = join(ROOT, `packages/schema/src/components/${spec.name}.schema.ts`);
    const schemaMod = await import(pathToFileURL(schemaPath).href);
    const schema = schemaMod.default ?? schemaMod;
    if (!schema?.props) continue;
    checkedCount++;

    for (const [propName, def] of Object.entries(schema.props as Record<string, any>)) {
      const yamlKey = drupalKeyFor(propName, def);
      const yamlValues = yamlEnums.get(yamlKey);

      if (def?.type === 'enum' && Array.isArray(def.values)) {
        // Only flag orphans (YAML values the schema rejects). The
        // symmetric direction (schema values the YAML doesn't list,
        // and "schema is enum but YAML has no enum at all") is real
        // drift but widespread across the existing SDCs — tracked
        // separately as audit-debt.
        if (!yamlValues) continue;
        const schemaValues = normalizeSchemaValues(def.values);
        propsCompared++;

        if (arraysDiffer(schemaValues, yamlValues)) {
          const orphan = yamlValues.filter((v) => !schemaValues.includes(v));
          if (orphan.length > 0) {
            findings.push({
              schemaFile: `packages/schema/src/components/${spec.name}.schema.ts`,
              yamlFile: spec.drupal,
              prop: propName,
              yamlKey,
              kind: 'orphan-in-drupal',
              schemaValues,
              yamlValues,
              detail: `YAML lists but schema rejects: ${orphan.map((v) => JSON.stringify(v)).join(', ')}`,
            });
          }
        }
      } else if (yamlValues && yamlValues.length > 0) {
        // Schema isn't an enum prop, but YAML constrains values.
        // Probably a hand-edit or stale sync. Flag.
        findings.push({
          schemaFile: `packages/schema/src/components/${spec.name}.schema.ts`,
          yamlFile: spec.drupal,
          prop: propName,
          yamlKey,
          kind: 'drupal-over-constrains',
          yamlValues,
          detail: `schema prop is type \`${def?.type ?? 'unknown'}\` (not enum) but Drupal YAML enum lists: ${yamlValues.map((v) => JSON.stringify(v)).join(', ')}`,
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log(`✓ SDC enum values match schema values across ${checkedCount} component(s) (${propsCompared} enum prop(s) compared).`);
    return;
  }

  console.error(`✗ ${findings.length} SDC enum drift(s) detected.\n`);
  console.error('Why: `pnpm sync:drupal` is append-only — when a schema enum value');
  console.error('     is removed, the Drupal SDC YAML keeps the orphan silently.');
  console.error('     Drupal authors who pick the orphan get an unstyled component.\n');

  for (const f of findings) {
    console.error(`  ${f.yamlFile}  ${f.yamlKey}`);
    console.error(`    schema: ${f.schemaFile}  ${f.prop}`);
    if (f.schemaValues !== undefined) console.error(`    schema values: ${JSON.stringify(f.schemaValues)}`);
    if (f.yamlValues !== undefined) console.error(`    yaml values:   ${JSON.stringify(f.yamlValues)}`);
    console.error(`    → ${f.detail}\n`);
  }

  console.error('Fix: edit the SDC YAML by hand to match the schema, OR — if the');
  console.error('     schema needs to grow — add the value to `values:` in the');
  console.error('     schema and run `pnpm sync:drupal` to regenerate.');

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
