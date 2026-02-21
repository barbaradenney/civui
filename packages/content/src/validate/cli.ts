import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateFormContent } from './validate-content.js';
import type { ValidationIssue } from './validate-content.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', '..', 'content');

function walkJson(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkJson(full));
    } else if (entry.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

function run(): void {
  const files = walkJson(CONTENT_DIR);

  if (files.length === 0) {
    console.log('No content files found in content/');
    process.exit(0);
  }

  const allIssues: ValidationIssue[] = [];

  for (const file of files) {
    const rel = relative(CONTENT_DIR, file);
    const raw = readFileSync(file, 'utf-8');

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      allIssues.push({ file: rel, path: '', severity: 'error', message: 'Invalid JSON.' });
      continue;
    }

    const issues = validateFormContent(data, rel);
    allIssues.push(...issues);
  }

  if (allIssues.length === 0) {
    console.log(`Validated ${files.length} content file(s) — no issues found.`);
    process.exit(0);
  }

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');

  for (const issue of allIssues) {
    const icon = issue.severity === 'error' ? 'ERR' : 'WARN';
    const loc = issue.path ? `${issue.file} > ${issue.path}` : issue.file;
    console.error(`[${icon}] ${loc}: ${issue.message}`);
  }

  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length > 0 ? 1 : 0);
}

run();
