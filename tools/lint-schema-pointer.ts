#!/usr/bin/env tsx
/**
 * lint-schema-pointer — every top-of-file "// Schema:" or
 * "// Preset wrapper — contract:" comment under packages/ must
 * resolve to a real schema file on disk.
 *
 * Why
 * ---
 * Component files declare where their contract lives in a comment at
 * the top:
 *
 *   // Schema: packages/schema/src/components/civ-text-input.schema.ts
 *
 * When a schema is renamed or moved, the comment becomes a lie and
 * a future reader trying to "go to schema" gets a 404. Worse: a
 * comment pointing at a schema that never existed (e.g., a preset
 * wrapper inheriting from a base contract) silently misleads.
 *
 * This lint walks every `civ-*.ts` source file, extracts the path
 * referenced in its schema-pointer comment (if any), and confirms
 * the path resolves.
 *
 * Accepted prefixes
 * -----------------
 *  - "// Schema: <path>"
 *  - "// Preset wrapper — contract: <path>"  (em-dash)
 *  - "// Preset wrapper - contract: <path>"  (hyphen — defensive)
 *
 * Run via `pnpm lint:schema-pointer`. Wired into
 * `pnpm validate:lints` so the drift-lints CI gate catches it.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS = ['packages'];

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.turbo',
  'coverage',
]);

interface Finding {
  file: string;
  line: number;
  target: string;
  snippet: string;
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRECTORIES.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (
      e.isFile() &&
      e.name.startsWith('civ-') &&
      e.name.endsWith('.ts') &&
      !e.name.endsWith('.test.ts') &&
      !e.name.endsWith('.stories.ts') &&
      !e.name.endsWith('.d.ts')
    ) {
      yield full;
    }
  }
}

/**
 * Pull every schema-pointer line out of the first 10 lines of a file.
 * Returns the target path (verbatim from the comment) and the line
 * number it lives on.
 */
function extractPointers(content: string): Array<{ target: string; line: number }> {
  const out: Array<{ target: string; line: number }> = [];
  const lines = content.split('\n').slice(0, 10);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m =
      line.match(/^\s*\/\/\s*Schema:\s*(.+?)\s*$/) ??
      line.match(/^\s*\/\/\s*Preset wrapper[\s—-]+contract:\s*(.+?)\s*$/);
    if (m) {
      out.push({ target: m[1], line: i + 1 });
    }
  }
  return out;
}

async function scanFile(file: string): Promise<Finding[]> {
  const relative = path.relative(REPO_ROOT, file);
  const content = await fs.readFile(file, 'utf-8');
  const findings: Finding[] = [];

  for (const { target, line } of extractPointers(content)) {
    const abs = path.isAbsolute(target) ? target : path.join(REPO_ROOT, target);
    try {
      const stat = await fs.stat(abs);
      if (!stat.isFile()) {
        findings.push({ file: relative, line, target, snippet: `not a file: ${target}` });
      }
    } catch {
      findings.push({ file: relative, line, target, snippet: `not found: ${target}` });
    }
  }

  return findings;
}

async function main(): Promise<void> {
  const findings: Finding[] = [];

  for (const root of SCAN_ROOTS) {
    const rootPath = path.join(REPO_ROOT, root);
    for await (const file of walk(rootPath)) {
      const results = await scanFile(file);
      findings.push(...results);
    }
  }

  if (findings.length === 0) {
    console.log('✓ every schema-pointer comment resolves to a real schema file.');
    return;
  }

  console.error(`✗ ${findings.length} schema-pointer comment(s) reference a missing file.\n`);
  console.error('Why: schema-pointer comments are documentation contracts. A');
  console.error('     comment pointing at a missing schema lies to anyone who');
  console.error('     follows the link. For preset wrappers without their own');
  console.error('     schema, point at the underlying schema with the prefix');
  console.error('     "// Preset wrapper — contract: …" instead.\n');

  for (const { file, line, target, snippet } of findings) {
    console.error(`  ${file}:${line}  ${snippet}`);
    void target;
  }

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
