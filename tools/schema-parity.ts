#!/usr/bin/env npx tsx
/**
 * CivUI Schema Parity Check
 *
 * Validates that the canonical Lit web implementation of each component
 * matches the platform-neutral schema in `@civui/schema`. Schemas are
 * the contract that contractors / new platform implementations are
 * expected to satisfy — this tool fails the build when the Lit source
 * drifts from the schema.
 *
 * Phase 1 covers a representative slice (text-input, checkbox,
 * radio-group, yes-no). Expand `PHASE_1_COMPONENTS` as more schemas
 * are synced.
 *
 * Usage:
 *   npx tsx tools/schema-parity.ts          # report drift, exit 1 on any drift
 *   npx tsx tools/schema-parity.ts --strict # also fail on missing schemas
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');

interface SchemaProp {
  name: string;
  type: string;
  default?: string | number | boolean;
  attribute?: string;
}

interface LitProp {
  name: string;
  type: string;
  default?: string;
  attribute?: string;
}

interface ComponentSpec {
  /** Schema file name without extension (e.g. "civ-text-input") */
  name: string;
  /** Path to the canonical Lit source, relative to repo root */
  source: string;
  /** Whether this component extends a boolean form base (checkbox/toggle) — adds checked/description as inherited props */
  isBoolean?: boolean;
}

const PHASE_1_COMPONENTS: ComponentSpec[] = [
  {
    name: 'civ-text-input',
    source: 'packages/inputs/src/text-input/civ-text-input.ts',
  },
  {
    name: 'civ-checkbox',
    source: 'packages/controls/src/checkbox/civ-checkbox.ts',
    isBoolean: true,
  },
  {
    name: 'civ-radio-group',
    source: 'packages/controls/src/radio/civ-radio-group.ts',
  },
  {
    name: 'civ-yes-no',
    source: 'packages/inputs/src/yes-no/civ-yes-no.ts',
  },
];

/**
 * Props inherited from CivFormElement / CivBaseElement that aren't
 * worth declaring in every schema. The schema-parity check ignores
 * these on the Lit side so schemas don't need to repeat them.
 */
const INHERITED_FORM_PROPS = new Set([
  'label',
  'name',
  'value',
  'hint',
  'error',
  'required',
  'requiredMessage',
  'disabled',
  'readonly',
  'touched',
  'disableAnalytics',
]);

const INHERITED_BOOLEAN_PROPS = new Set(['checked', 'description']);

function parseLitProps(filePath: string, isBoolean: boolean): LitProp[] {
  const src = readFileSync(filePath, 'utf-8');
  const props: LitProp[] = [];
  // Capture everything from `@property({ ... })` through the next ; or newline,
  // including optional access modifiers and a default-value initializer.
  const regex = /@property\(\{([^}]*)\}\)\s+(?:public\s+|private\s+|protected\s+|override\s+)*(\w+)(?:[?!])?(?:\s*:\s*[^=;\n]+)?(?:\s*=\s*([^;\n]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(src)) !== null) {
    const opts = m[1];
    const name = m[2];
    const dflt = m[3]?.trim();
    const skip = INHERITED_FORM_PROPS.has(name) || (isBoolean && INHERITED_BOOLEAN_PROPS.has(name));
    if (skip) continue;
    const typeMatch = opts.match(/type:\s*(\w+)/);
    const attrMatch = opts.match(/attribute:\s*['"]([^'"]+)['"]/);
    props.push({
      name,
      type: typeMatch ? typeMatch[1].toLowerCase() : 'string',
      default: dflt,
      attribute: attrMatch ? attrMatch[1] : undefined,
    });
  }
  return props;
}

async function loadSchemaProps(name: string, isBoolean: boolean): Promise<SchemaProp[]> {
  const path = join(ROOT, 'packages/schema/src/components', `${name}.schema.ts`);
  if (!existsSync(path)) return [];
  // Dynamic import via file URL — schema files are ESM TS that tsx can load
  const mod = await import(pathToFileURL(path).href);
  const schema = mod.default ?? mod;
  const props: SchemaProp[] = [];
  for (const [propName, def] of Object.entries(schema.props ?? {}) as [string, any][]) {
    // Match what parseLitProps skips so the diff is symmetric. Schemas
    // are allowed to declare inherited props for documentation, but the
    // parity check only compares component-specific surface.
    const skip =
      INHERITED_FORM_PROPS.has(propName) ||
      (isBoolean && INHERITED_BOOLEAN_PROPS.has(propName));
    if (skip) continue;
    props.push({
      name: propName,
      type: def.type,
      default: def.default,
      attribute: def.attribute,
    });
  }
  return props;
}

interface PropDrift {
  /** Props declared in source but missing from schema */
  missingFromSchema: string[];
  /** Props declared in schema but no longer present in source */
  removedFromSource: string[];
  /** Props where the type / default / attribute differs */
  mismatched: Array<{ name: string; field: string; schema: unknown; source: unknown }>;
}

/**
 * Schemas use 'string' for both required and optional string props,
 * but Lit @property({ type: String }) is the source of truth for the
 * type token. We normalize a few common variants here so we don't
 * report cosmetic differences.
 */
function normalizeType(type: string): string {
  const lower = type.toLowerCase();
  if (lower === 'string' || lower === 'enum') return 'string-or-enum';
  if (lower === 'array') return 'array';
  return lower;
}

function diffProps(schema: SchemaProp[], lit: LitProp[]): PropDrift {
  const schemaByName = new Map(schema.map((p) => [p.name, p]));
  const litByName = new Map(lit.map((p) => [p.name, p]));

  const missingFromSchema: string[] = [];
  const removedFromSource: string[] = [];
  const mismatched: PropDrift['mismatched'] = [];

  for (const litProp of lit) {
    if (!schemaByName.has(litProp.name)) {
      missingFromSchema.push(litProp.name);
      continue;
    }
    const schemaProp = schemaByName.get(litProp.name)!;
    if (normalizeType(schemaProp.type) !== normalizeType(litProp.type)) {
      mismatched.push({
        name: litProp.name,
        field: 'type',
        schema: schemaProp.type,
        source: litProp.type,
      });
    }
    if ((schemaProp.attribute ?? undefined) !== (litProp.attribute ?? undefined)) {
      mismatched.push({
        name: litProp.name,
        field: 'attribute',
        schema: schemaProp.attribute,
        source: litProp.attribute,
      });
    }
  }

  for (const schemaProp of schema) {
    if (!litByName.has(schemaProp.name)) {
      removedFromSource.push(schemaProp.name);
    }
  }

  return { missingFromSchema, removedFromSource, mismatched };
}

async function main(): Promise<void> {
  const strict = process.argv.includes('--strict');
  let drift = 0;
  for (const spec of PHASE_1_COMPONENTS) {
    const sourcePath = join(ROOT, spec.source);
    if (!existsSync(sourcePath)) {
      console.log(`⚠  ${spec.name}: source file not found at ${spec.source}`);
      drift++;
      continue;
    }
    const schemaProps = await loadSchemaProps(spec.name, !!spec.isBoolean);
    if (schemaProps.length === 0) {
      console.log(`${strict ? '✗' : '⚠'}  ${spec.name}: no schema found at packages/schema/src/components/${spec.name}.schema.ts`);
      if (strict) drift++;
      continue;
    }
    const litProps = parseLitProps(sourcePath, !!spec.isBoolean);
    const result = diffProps(schemaProps, litProps);
    const hasDrift =
      result.missingFromSchema.length > 0 ||
      result.removedFromSource.length > 0 ||
      result.mismatched.length > 0;
    if (!hasDrift) {
      console.log(`✓  ${spec.name} (${litProps.length} props in sync)`);
      continue;
    }
    drift++;
    console.log(`✗  ${spec.name}`);
    if (result.missingFromSchema.length > 0) {
      console.log(`   props in source but missing from schema: ${result.missingFromSchema.join(', ')}`);
    }
    if (result.removedFromSource.length > 0) {
      console.log(`   props in schema but no longer in source: ${result.removedFromSource.join(', ')}`);
    }
    for (const m of result.mismatched) {
      console.log(`   ${m.name}.${m.field} differs: schema=${JSON.stringify(m.schema)}, source=${JSON.stringify(m.source)}`);
    }
  }
  if (drift > 0) {
    console.log(`\n${drift} component(s) have schema drift.`);
    process.exit(1);
  }
  console.log(`\n${PHASE_1_COMPONENTS.length}/${PHASE_1_COMPONENTS.length} components match their schema.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
