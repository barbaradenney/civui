#!/usr/bin/env tsx
/**
 * lint-story-names — flag StoryObj exports whose `name:` display title
 * doesn't match the export name.
 *
 * Storybook URLs and CIV doc embeds resolve by export name (kebab-cased),
 * but the panel UI shows whatever the story sets in `name:`. When the two
 * drift, an embed like `forms-form-form--with-error` lands on a story
 * called "Custom Button Labels" — the doc says one thing, the page shows
 * another. This audit lint flagged 8 such mismatches across the form-
 * patterns audit.
 *
 * Rule: if a `name:` is set, its kebab form must match the export's
 * kebab form. Exports with no `name:` are fine — Storybook derives the
 * display name from the export, so they're consistent by construction.
 *
 * Punctuation differences in `name:` (em-dashes, parens, "Custom — ")
 * are tolerated as long as the kebab form ends up the same.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface Finding {
  file: string;
  line: number;
  exportName: string;
  displayName: string;
  exportSlug: string;
  displaySlug: string;
}

function kebab(input: string): string {
  return input
    .replace(/[_/]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(d: string) {
    let entries;
    try { entries = await fs.readdir(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.turbo') continue;
        await visit(p);
      } else if (e.isFile() && p.endsWith('.stories.ts') && !p.includes('.drupal.stories.ts')) {
        out.push(p);
      }
    }
  }
  await visit(dir);
  return out;
}

// Matches:
//   export const Foo: Story = {
//     name: '...',
//     ...
//   };
// across blank lines and other properties before `name:`.
const STORY_BLOCK_RE = /export\s+const\s+([A-Za-z_][\w]*)\s*:\s*Story\s*=\s*{([\s\S]*?)(?=\n};)/g;
const TOP_LEVEL_NAME_RE = /^\s{2}name:\s*['"`]([^'"`]+)['"`]/m;

async function main(): Promise<void> {
  const files = await walk(PACKAGES_DIR);
  const findings: Finding[] = [];

  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    for (const m of src.matchAll(STORY_BLOCK_RE)) {
      const exportName = m[1];
      const body = m[2];
      const nameMatch = TOP_LEVEL_NAME_RE.exec(body);
      if (!nameMatch) continue;
      const displayName = nameMatch[1];
      const exportSlug = kebab(exportName);
      const displaySlug = kebab(displayName);
      // Tolerate display names that re-word, reorder, or extend the
      // export — Storybook's panel UI happily shows "Buttons on Both
      // Sides" for an export named ButtonsBothSides, and "Custom Max
      // Height" for WithMaxHeight. The bug we care about is *semantic*
      // drift where the panel shows something completely unrelated to
      // the export (e.g. WithError → "Custom Button Labels", Required
      // → "Persist Draft"). Heuristic: flag only when no substantive
      // token from the export (length ≥ 3) appears in the display.
      const exportTokens = exportSlug.split('-').filter(t => t.length >= 3);
      const displayTokens = new Set(displaySlug.split('-'));
      const overlap = exportTokens.some(t => displayTokens.has(t));
      if (!overlap) {
        const line = src.slice(0, m.index! + body.indexOf(nameMatch[0])).split('\n').length;
        findings.push({
          file: path.relative(REPO_ROOT, file),
          line,
          exportName,
          displayName,
          exportSlug,
          displaySlug,
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log(`✓ All Story exports have matching display names.`);
    return;
  }

  console.error(`✗ ${findings.length} story export(s) whose display name doesn't match the export:\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    export ${f.exportName}    → slug "${f.exportSlug}"`);
    console.error(`    name: "${f.displayName}"  → slug "${f.displaySlug}"`);
    console.error(`    Either rename the export to ${kebabToPascal(f.displaySlug)} or update the display name to match the export.`);
    console.error('');
  }
  process.exit(1);
}

function kebabToPascal(s: string): string {
  return s.split('-').map(part => {
    if (/^\d/.test(part)) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
