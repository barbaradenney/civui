#!/usr/bin/env tsx
/**
 * lint-schema-analytics-event — for every covered component whose Lit
 * source documents `@fires civ-analytics`, the component's schema MUST
 * declare the `civ-analytics` event.
 *
 * Why
 * ---
 * `civ-analytics` is the cross-cutting analytics event dispatched by
 * `sendAnalytics()` (from `CivBaseElement`). Components that surface it
 * as public API mark it with a JSDoc `@fires civ-analytics` tag —
 * `lint:jsdoc-events` already guarantees that tag corresponds to a real
 * dispatch. The schema is the platform-neutral CONTRACT, so it must
 * list every public event the component fires. Historically the two
 * drifted: civ-combobox and civ-date-picker both documented
 * `@fires civ-analytics` but omitted it from their schema, which the
 * 2026-05-29 component audits caught one at a time. This lint gates the
 * whole set so a new (or existing) component can't document the event
 * in JSDoc while leaving it out of the contract.
 *
 * Rule
 * ----
 * For each `COVERED_COMPONENTS` entry:
 *   - read the Lit source; if it has `@fires civ-analytics`, the
 *     schema file (`packages/schema/src/components/<name>.schema.ts`)
 *     must contain a `'civ-analytics'` event key.
 *
 * The check is intentionally one-directional (JSDoc → schema). The
 * inverse — components that CALL `sendAnalytics()` without documenting
 * `@fires` — is a separate JSDoc-completeness concern and is not gated
 * here.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { COVERED_COMPONENTS } from './schema-parity.js';
import { printRuleLink } from './lint-rule-links.js';

const ROOT = join(import.meta.dirname, '..');

/** True when a Lit source documents the analytics event as public API. */
export function sourceFiresAnalytics(source: string): boolean {
  return /@fires\s+civ-analytics\b/.test(source);
}

/** True when a schema source declares the civ-analytics event key. */
export function schemaDeclaresAnalytics(schemaSource: string): boolean {
  return /['"]civ-analytics['"]\s*:/.test(schemaSource);
}

export interface AnalyticsFinding {
  name: string;
  schemaPath: string;
}

/**
 * Pure core: given the component specs and a reader, return the
 * components that document `@fires civ-analytics` but whose schema
 * omits the event. Injectable readers keep this unit-testable.
 */
export function findMissingAnalytics(
  components: ReadonlyArray<{ name: string; source: string }>,
  readSource: (relPath: string) => string | null,
  readSchema: (name: string) => string | null,
): AnalyticsFinding[] {
  const findings: AnalyticsFinding[] = [];
  for (const c of components) {
    const src = readSource(c.source);
    if (src == null || !sourceFiresAnalytics(src)) continue;
    const schema = readSchema(c.name);
    if (schema == null) continue; // no schema file — not in scope here
    if (!schemaDeclaresAnalytics(schema)) {
      findings.push({
        name: c.name,
        schemaPath: `packages/schema/src/components/${c.name}.schema.ts`,
      });
    }
  }
  return findings;
}

function readRel(relPath: string): string | null {
  const abs = join(ROOT, relPath);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null;
}

function readSchemaByName(name: string): string | null {
  return readRel(`packages/schema/src/components/${name}.schema.ts`);
}

function main(): void {
  const findings = findMissingAnalytics(
    COVERED_COMPONENTS,
    readRel,
    readSchemaByName,
  );

  if (findings.length === 0) {
    console.log(
      '✓ every covered component that documents @fires civ-analytics declares the event in its schema.',
    );
    return;
  }

  console.error(
    `✗ ${findings.length} component(s) document @fires civ-analytics but omit it from their schema:\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.name}`);
    console.error(`    add the 'civ-analytics' event to ${f.schemaPath}`);
    console.error('');
  }
  console.error(
    "Add the event to the schema's `events` block:\n" +
    "    'civ-analytics': {\n" +
    "      description: 'Analytics tracking event fired on interaction',\n" +
    '      detail: {\n' +
    "        componentName: { type: 'string', description: 'Tag name of the dispatcher' },\n" +
    "        action: { type: 'string', description: 'The user action that triggered the event' },\n" +
    '      },\n' +
    '    },\n' +
    'then run `pnpm sync:doc-tables` and commit the regenerated events partials.',
  );
  printRuleLink('schema-analytics-event');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
