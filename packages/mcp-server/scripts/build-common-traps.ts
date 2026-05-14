#!/usr/bin/env tsx
/**
 * Build-time copy of `.claude/rules/common-traps.md` into a TS string
 * constant the MCP server can import. Same baked-at-build-time pattern
 * as `build-component-examples.ts` — keeps the published mcp-server
 * package self-contained without adding runtime fs dependencies.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../../..');
const SRC = join(ROOT, '.claude/rules/common-traps.md');
const OUT = join(__dirname, '../src/resources/common-traps.json');

function main(): void {
  const md = readFileSync(SRC, 'utf-8');
  // Emit as JSON so the embedded markdown's "don't do this" code
  // examples don't trip the .ts-aware lints (jsdoc-props, color-class,
  // fieldset-wrapper, etc.) — JSON is opaque to them.
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ markdown: md }, null, 2) + '\n');
  console.log(
    `[build-common-traps] embedded ${md.split('\n').length} lines from ${relative(ROOT, SRC)} → ${relative(ROOT, OUT)}`,
  );
}

main();
