#!/usr/bin/env node

/**
 * Schema Validation CLI
 *
 * Validates all component schemas for correctness before code generation.
 * Run: pnpm --filter @civui/codegen validate
 */

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateAll } from '@civui/schema/validate';
import type { ComponentSchema } from '@civui/schema/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(__dirname, '..', '..', 'schema', 'src', 'components');

async function main(): Promise<void> {
  const files = readdirSync(schemaDir).filter((f) => f.endsWith('.schema.ts'));
  const schemas: ComponentSchema[] = [];

  for (const file of files) {
    const mod = await import(join(schemaDir, file));
    schemas.push(mod.default);
  }

  console.log(`\nValidating ${schemas.length} schemas...\n`);

  const result = validateAll(schemas);

  if (result.warnings.length > 0) {
    console.log(`⚠ ${result.warnings.length} warning(s):`);
    for (const w of result.warnings) {
      console.log(`  ⚠ ${w.path}: ${w.message}`);
    }
    console.log('');
  }

  if (result.errors.length > 0) {
    console.log(`✗ ${result.errors.length} error(s):`);
    for (const e of result.errors) {
      console.log(`  ✗ ${e.path}: ${e.message}`);
    }
    console.log('');
    process.exit(1);
  }

  console.log(`✓ All ${schemas.length} schemas are valid.`);
  if (result.warnings.length > 0) {
    console.log(`  (${result.warnings.length} warning(s) — not blocking)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
