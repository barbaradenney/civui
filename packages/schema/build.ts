#!/usr/bin/env npx tsx
/**
 * Build script for @civui/schema.
 *
 * Runs `tsc` to compile TypeScript → JS + .d.ts in `dist/`, then writes
 * three categories of JSON artifacts:
 *
 *   - `dist/contracts.json`         — every schema in one file, keyed by name
 *   - `dist/contracts/<name>.json`  — one file per schema (mirrors src/components/)
 *   - `dist/contract.schema.json`   — JSON Schema describing the SHAPE of a
 *                                     CivUI schema document (so authors of
 *                                     custom / external schemas can validate
 *                                     with any standard JSON Schema tool)
 *
 * Consumers without TypeScript can read the JSON forms directly:
 *
 *     import contracts from '@civui/schema/contracts.json';
 *     const button = contracts['civ-button'];
 *
 * Or fetch a single component:
 *
 *     import button from '@civui/schema/contracts/civ-button.json';
 */

import { execSync } from 'child_process';
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC_COMPONENTS = join(HERE, 'src/components');
const DIST = join(HERE, 'dist');
const DIST_CONTRACTS = join(DIST, 'contracts');

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

async function loadSchemaModules(): Promise<Record<string, unknown>> {
  const files = readdirSync(SRC_COMPONENTS)
    .filter((f) => f.endsWith('.schema.ts'))
    .sort();
  const out: Record<string, unknown> = {};
  for (const f of files) {
    const path = join(SRC_COMPONENTS, f);
    const mod = await import(pathToFileURL(path).href);
    const schema = (mod.default ?? mod) as { name: string };
    out[schema.name] = schema;
  }
  return out;
}

/**
 * JSON Schema (Draft 2020-12) describing the shape of a CivUI component
 * contract document. Mirrors the TypeScript types in schema.types.ts —
 * the `as const` arrays exported there are the source of truth, and
 * `tools/__tests__/schema-parity.test.ts` would catch drift if we
 * forgot to update one side.
 */
function buildContractSchema(): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://github.com/anthropics/civui/blob/main/packages/schema/dist/contract.schema.json',
    title: 'CivUI Component Contract',
    description:
      'Schema document describing a CivUI component\'s public contract — props, events, accessibility role, render order, and form behavior. Platform-neutral; consumed by code generators and the schema-parity CI gate.',
    type: 'object',
    required: ['$schema', 'name', 'description', 'category', 'extends', 'isGroup', 'props', 'events', 'a11y', 'renderOrder', 'form'],
    additionalProperties: false,
    properties: {
      $schema: { type: 'string', const: '1.0', description: 'Contract version' },
      name: { type: 'string', pattern: '^civ-[a-z][a-z0-9-]*$', description: 'Component custom-element tag name' },
      description: { type: 'string', minLength: 10 },
      category: {
        type: 'string',
        enum: ['form-control', 'form-group', 'form-container', 'ui', 'feedback', 'navigation'],
      },
      extends: { type: 'string', enum: ['CivFormElement', 'CivBaseElement'] },
      isGroup: { type: 'boolean' },
      props: {
        type: 'object',
        additionalProperties: { $ref: '#/$defs/PropDef' },
      },
      events: {
        type: 'object',
        additionalProperties: { $ref: '#/$defs/EventDef' },
      },
      a11y: { $ref: '#/$defs/A11yDef' },
      renderOrder: {
        type: 'array',
        minItems: 1,
        items: { $ref: '#/$defs/RenderElement' },
      },
      form: { $ref: '#/$defs/FormBehavior' },
      widths: {
        type: 'object',
        additionalProperties: { $ref: '#/$defs/WidthVariant' },
      },
      platform: { type: 'object', description: 'Platform-specific overrides that can\'t be abstracted' },
    },
    $defs: {
      PropDef: {
        type: 'object',
        required: ['type', 'description'],
        properties: {
          type: { type: 'string', enum: ['string', 'boolean', 'number', 'enum', 'array'] },
          description: { type: 'string' },
          default: { type: ['string', 'number', 'boolean'] },
          required: { type: 'boolean' },
          values: { type: 'array', items: { type: 'string' } },
          items: { type: 'object', additionalProperties: { $ref: '#/$defs/PropDef' } },
          reflect: { type: 'boolean' },
          attribute: { type: 'string' },
          webOnly: { type: 'boolean', description: 'Excluded from cross-platform parity check' },
        },
        additionalProperties: false,
      },
      EventDef: {
        type: 'object',
        required: ['description', 'detail'],
        properties: {
          description: { type: 'string' },
          detail: {
            type: 'object',
            additionalProperties: { $ref: '#/$defs/EventDetailField' },
          },
        },
        additionalProperties: false,
      },
      EventDetailField: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['string', 'boolean', 'number', 'string[]', 'File[]', 'object'] },
          description: { type: 'string' },
        },
        additionalProperties: false,
      },
      A11yDef: {
        type: 'object',
        // role is optional — display-only components (civ-image,
        // civ-icon, civ-button, civ-link, etc.) render native elements
        // whose implicit role IS the contract; declaring a redundant
        // role here would mislead cross-platform contractors.
        required: ['requiredIndicator', 'errorAnnouncement'],
        properties: {
          role: { type: 'string' },
          requiredIndicator: { type: 'string', enum: ['asterisk', 'text', 'none'] },
          errorAnnouncement: { type: 'string', enum: ['assertive', 'polite', 'none'] },
          describedBy: { type: 'array', items: { type: 'string' } },
          ariaAttributes: {
            type: 'object',
            additionalProperties: { type: ['string', 'boolean'] },
          },
        },
      },
      RenderElement: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            enum: ['label', 'hint', 'error', 'input', 'select', 'checkbox', 'switch', 'button', 'slot', 'container'],
          },
          condition: { type: 'string' },
          bindings: { type: 'object', additionalProperties: { type: 'string' } },
          children: { type: 'array', items: { $ref: '#/$defs/RenderElement' } },
        },
      },
      FormBehavior: {
        type: 'object',
        required: ['valueMode', 'formAssociated', 'resetBehavior'],
        properties: {
          valueMode: { type: 'string', enum: ['string', 'boolean', 'multi', 'file', 'none'] },
          formAssociated: { type: 'boolean' },
          resetBehavior: { type: 'string', enum: ['restore-default-value', 'restore-default-checked', 'clear-files', 'none'] },
        },
      },
      WidthVariant: {
        type: 'object',
        required: ['webClass'],
        properties: {
          webClass: { type: 'string' },
          iosPoints: { type: ['number', 'null'] },
          androidDp: { type: ['number', 'null'] },
        },
      },
    },
  };
}

async function main(): Promise<void> {
  // 1) Compile TypeScript → JS / .d.ts via tsc.
  console.log('▸ tsc -p packages/schema');
  execSync('tsc -p .', { cwd: HERE, stdio: 'inherit' });

  // 2) Generate JSON contract artifacts.
  ensureDir(DIST_CONTRACTS);
  const schemas = await loadSchemaModules();

  // Master file: all 53 schemas keyed by component name.
  const masterPath = join(DIST, 'contracts.json');
  writeFileSync(masterPath, JSON.stringify(schemas, null, 2) + '\n');
  console.log(`▸ wrote ${Object.keys(schemas).length} schemas to dist/contracts.json`);

  // One file per schema, mirroring src/components/.
  for (const [name, schema] of Object.entries(schemas)) {
    const outPath = join(DIST_CONTRACTS, `${name}.json`);
    writeFileSync(outPath, JSON.stringify(schema, null, 2) + '\n');
  }
  console.log(`▸ wrote ${Object.keys(schemas).length} per-component files to dist/contracts/`);

  // 3) JSON Schema describing the contract format itself.
  const contractSchemaPath = join(DIST, 'contract.schema.json');
  writeFileSync(contractSchemaPath, JSON.stringify(buildContractSchema(), null, 2) + '\n');
  console.log(`▸ wrote dist/contract.schema.json (JSON Schema for the contract format)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
