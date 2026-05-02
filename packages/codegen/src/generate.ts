#!/usr/bin/env node

/**
 * CivUI Code Generator
 *
 * Reads component schemas and generates platform-specific implementations:
 * - Lit 3 web components (TypeScript)
 * - SwiftUI views (Swift)
 * - Jetpack Compose composables (Kotlin)
 *
 * Usage:
 *   npx tsx packages/codegen/src/generate.ts
 *   npx tsx packages/codegen/src/generate.ts civ-text-input
 *   npx tsx packages/codegen/src/generate.ts --platform web
 *   npx tsx packages/codegen/src/generate.ts --platform ios
 *   npx tsx packages/codegen/src/generate.ts --platform android
 *   npx tsx packages/codegen/src/generate.ts --dry-run
 */

import { writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateLit } from './generators/lit.js';
import { generateSwiftUI } from './generators/swiftui.js';
import { generateCompose } from './generators/compose.js';
import type { ComponentSchema } from '@civui/schema/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const schemaDir = join(rootDir, 'schema', 'src', 'components');

// Output directories
const outputDirs = {
  web: (name: string) => join(rootDir, 'codegen', 'dist', 'web', name),
  ios: (_name: string) => join(rootDir, 'codegen', 'dist', 'ios'),
  android: (_name: string) => join(rootDir, 'codegen', 'dist', 'android'),
};

type Platform = 'web' | 'ios' | 'android';

interface GenerateOptions {
  platforms: Platform[];
  components: string[];
  dryRun: boolean;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    platforms: ['web', 'ios', 'android'],
    components: [],
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--platform' && args[i + 1]) {
      options.platforms = [args[++i] as Platform];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (!arg.startsWith('-')) {
      options.components.push(arg);
    }
  }

  return options;
}

async function loadSchemas(filter: string[]): Promise<ComponentSchema[]> {
  const files = readdirSync(schemaDir).filter((f) => f.endsWith('.schema.ts'));
  const schemas: ComponentSchema[] = [];

  for (const file of files) {
    const name = file.replace('.schema.ts', '');
    if (filter.length > 0 && !filter.includes(name)) continue;

    const mod = await import(join(schemaDir, file));
    schemas.push(mod.default);
  }

  return schemas;
}

function writeOutput(path: string, content: string, dryRun: boolean): void {
  if (dryRun) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`[DRY RUN] Would write: ${path}`);
    console.log('='.repeat(70));
    console.log(content);
    return;
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf-8');
  console.log(`  ✓ ${path}`);
}

function stripCivPrefix(name: string): string {
  return name.replace(/^civ-/, '');
}

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

async function main(): Promise<void> {
  const options = parseArgs();
  const schemas = await loadSchemas(options.components);

  if (schemas.length === 0) {
    console.error('No schemas found. Check packages/schema/src/components/');
    process.exit(1);
  }

  console.log(`\nCivUI Code Generator`);
  console.log(`Platforms: ${options.platforms.join(', ')}`);
  console.log(`Components: ${schemas.map((s) => s.name).join(', ')}`);
  if (options.dryRun) console.log('Mode: DRY RUN');
  console.log('');

  for (const schema of schemas) {
    const stripped = stripCivPrefix(schema.name);
    const pascalName = `Civ${toPascalCase(stripped)}`;

    console.log(`Generating ${schema.name}...`);

    if (options.platforms.includes('web')) {
      const code = generateLit(schema);
      const outPath = join(outputDirs.web(stripped), `${schema.name}.generated.ts`);
      writeOutput(outPath, code, options.dryRun);
    }

    if (options.platforms.includes('ios')) {
      const code = generateSwiftUI(schema);
      const outPath = join(outputDirs.ios(stripped), `${pascalName}.generated.swift`);
      writeOutput(outPath, code, options.dryRun);
    }

    if (options.platforms.includes('android')) {
      const code = generateCompose(schema);
      const outPath = join(outputDirs.android(stripped), `${pascalName}.generated.kt`);
      writeOutput(outPath, code, options.dryRun);
    }
  }

  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
