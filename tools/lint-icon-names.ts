#!/usr/bin/env tsx
/**
 * lint-icon-names — every `<civ-icon name="…">` reference in
 * component source must resolve to an icon registered in
 * `packages/core/src/icon/icon-library.ts`. Unregistered names
 * render as `nothing` and emit a dev-only console warning — the
 * icon just disappears in production, silently breaking the UI.
 *
 * Scope: source files only (`civ-*.ts` outside test/stories). Story
 * and test files are exempt because they can legitimately demo
 * consumer-registered icons via `registerIcon('agency-seal', …)`.
 *
 * Allowlist: the literal "typo" name is intentional — it appears
 * in JSDoc as the documented example of an unregistered icon.
 *
 * To extend: add the new icon's path / native mappings to
 * `icon-library.ts`. The lint picks it up automatically.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { stripComments } from './lint-utils/strip-comments.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');
const ICON_LIBRARY = path.join(PACKAGES_DIR, 'core/src/icon/icon-library.ts');

/** Icon names intentionally referenced unregistered (e.g. dev-warn examples). */
const ALLOWLIST = new Set<string>([
  'typo', // civ-icon.ts uses this as the dev-warn example
]);

interface Finding {
  file: string;
  line: number;
  iconName: string;
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.turbo') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (
      e.isFile() &&
      e.name.endsWith('.ts') &&
      !e.name.endsWith('.test.ts') &&
      !e.name.endsWith('.stories.ts') &&
      !e.name.endsWith('.d.ts')
    ) {
      yield full;
    }
  }
}

async function loadRegisteredIcons(): Promise<Set<string>> {
  const src = await fs.readFile(ICON_LIBRARY, 'utf-8');
  const names = new Set<string>();
  // Match `name: {` or `'name': {` only at indent level 2 (top-level
  // entries in the `icons` object). Quoted names cover the dashed
  // identifiers like `'check-circle'`.
  const re = /^ {2}'?([a-z][a-z0-9-]*)'?:\s*\{$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    // Skip the IconDef type literal at the top of the file —
    // its fields (label, path, symbol, ios, android) sit at the
    // same indent. Filter by what looks like a kebab-case icon
    // name vs. a TypeScript field name.
    if (['label', 'path', 'symbol', 'ios', 'android'].includes(m[1])) continue;
    names.add(m[1]);
  }
  return names;
}

async function scanFile(file: string, registered: Set<string>): Promise<Finding[]> {
  const relative = path.relative(REPO_ROOT, file);
  const raw = await fs.readFile(file, 'utf-8');
  const content = stripComments(raw, '.ts');
  const findings: Finding[] = [];

  const re = /<civ-icon[^>]*\bname="([a-z][a-z0-9-]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const iconName = m[1];
    if (registered.has(iconName)) continue;
    if (ALLOWLIST.has(iconName)) continue;
    const line = content.slice(0, m.index).split('\n').length;
    findings.push({ file: relative, line, iconName });
  }
  return findings;
}

async function main(): Promise<void> {
  const registered = await loadRegisteredIcons();
  if (registered.size === 0) {
    console.error('✗ failed to load any registered icons from icon-library.ts');
    process.exit(1);
  }

  const findings: Finding[] = [];
  for await (const file of walk(PACKAGES_DIR)) {
    const results = await scanFile(file, registered);
    findings.push(...results);
  }

  if (findings.length === 0) {
    console.log(`✓ every <civ-icon name="…"> in component source resolves to one of ${registered.size} registered icons.`);
    return;
  }

  console.error(`✗ ${findings.length} <civ-icon name="…"> reference(s) to unregistered icon(s):\n`);
  console.error('Why: civ-icon renders nothing (with a dev-only console warn) when');
  console.error('     the name isn\'t registered. In production the icon disappears');
  console.error('     silently. Add the icon to packages/core/src/icon/icon-library.ts');
  console.error('     or change the reference to a registered name.\n');

  for (const { file, line, iconName } of findings) {
    console.error(`  ${file}:${line}  <civ-icon name="${iconName}">  (not in icon-library.ts)`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
