#!/usr/bin/env npx tsx
/**
 * CivUI Schema Validator CLI
 *
 * Walks every `packages/schema/src/components/*.schema.ts`, runs the
 * structural validator from `@civui/schema/validate` on each, and reports
 * errors / warnings. Exits non-zero on any error.
 *
 * The schema-parity check verifies that schemas match the Lit source.
 * This tool verifies that schemas are *internally* well-formed —
 * catches things TypeScript misses: invalid enum defaults, render-order
 * elements with unknown types, form behavior contradictions.
 *
 * Usage:
 *   npx tsx tools/validate-schemas.ts        # report errors, exit 1 on any error
 *   npx tsx tools/validate-schemas.ts --strict   # also fail on warnings
 */

import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { validateAll } from '../packages/schema/src/validate.js';

const ROOT = join(import.meta.dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'packages/schema/src/components');

async function main(): Promise<void> {
  const strict = process.argv.includes('--strict');
  const files = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith('.schema.ts'))
    .sort();

  const schemas = await Promise.all(
    files.map(async (f) => {
      const path = join(COMPONENTS_DIR, f);
      const mod = await import(pathToFileURL(path).href);
      return mod.default ?? mod;
    }),
  );

  const result = validateAll(schemas);
  for (const e of result.errors) {
    console.log(`✗ ${e.path}: ${e.message}`);
  }
  for (const w of result.warnings) {
    console.log(`⚠ ${w.path}: ${w.message}`);
  }

  const errCount = result.errors.length;
  const warnCount = result.warnings.length;
  console.log(`\n${schemas.length} schema(s) validated — ${errCount} error(s), ${warnCount} warning(s).`);

  if (errCount > 0 || (strict && warnCount > 0)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
