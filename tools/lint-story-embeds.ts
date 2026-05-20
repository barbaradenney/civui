#!/usr/bin/env tsx
/**
 * lint-story-embeds — validate every <StoryEmbed id="..." /> reference in
 * apps/docs/docs against the actual story exports in packages/*\/src.
 *
 * Catches:
 *   • Doc references a renamed/removed export (slug no longer resolves).
 *   • Doc invents a slug that never existed.
 *   • Story title was renamed (changes the meta-prefix half of the slug).
 *
 * The check is grep-based — no Storybook process is started. Storybook slug
 * format: `<kebab(meta.title)>--<kebab(exportName)>`. Underscores in export
 * names collapse to a single dash, matching what Storybook emits.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'apps/docs/docs');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface StoryRef {
  id: string;            // storybook slug, e.g. forms-form-form--default
  file: string;          // .mdx path
  line: number;
}

interface KnownStory {
  id: string;
  file: string;
  exportName: string;
}

/** Storybook's kebab transform for titles + export names.
 *  Mirrors @storybook/csf's `sanitize`: alpha↔digit boundaries also get a
 *  dash (so `Step1Hub` becomes `step-1-hub`, not `step1-hub`).
 */
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

async function walk(dir: string, suffix: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(d: string) {
    let entries;
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.turbo' || e.name === 'build') continue;
        await visit(p);
      } else if (e.isFile() && p.endsWith(suffix)) {
        out.push(p);
      }
    }
  }
  await visit(dir);
  return out;
}

const STORY_EMBED_RE = /<StoryEmbed\s+id=["']([^"']+)["']/g;
const META_TITLE_RE = /title:\s*['"]([^'"]+)['"]/;
const EXPORT_RE = /export\s+const\s+([A-Za-z_][\w]*)\s*:\s*Story\s*=/g;

async function collectDocRefs(): Promise<StoryRef[]> {
  const mdxFiles = await walk(DOCS_DIR, '.mdx');
  const refs: StoryRef[] = [];
  for (const file of mdxFiles) {
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      const matches = line.matchAll(STORY_EMBED_RE);
      for (const m of matches) {
        refs.push({ id: m[1], file: path.relative(REPO_ROOT, file), line: i + 1 });
      }
    });
  }
  return refs;
}

async function collectKnownStories(): Promise<KnownStory[]> {
  const storyFiles = await walk(PACKAGES_DIR, '.stories.ts');
  const known: KnownStory[] = [];
  for (const file of storyFiles) {
    // .drupal.stories.ts files were previously excluded here; they're now
    // included so the "Drupal SDC" section in component docs validates.
    const src = await fs.readFile(file, 'utf8');
    const titleMatch = META_TITLE_RE.exec(src);
    if (!titleMatch) continue;
    const titleSlug = kebab(titleMatch[1]);

    for (const exportMatch of src.matchAll(EXPORT_RE)) {
      const exportName = exportMatch[1];
      const exportSlug = kebab(exportName);
      const id = `${titleSlug}--${exportSlug}`;
      known.push({ id, file: path.relative(REPO_ROOT, file), exportName });
    }
  }
  return known;
}

async function main(): Promise<void> {
  const [refs, known] = await Promise.all([collectDocRefs(), collectKnownStories()]);
  const knownIds = new Set(known.map(k => k.id));

  const broken: StoryRef[] = refs.filter(r => !knownIds.has(r.id));

  if (broken.length === 0) {
    console.log(`✓ ${refs.length} <StoryEmbed> refs across ${new Set(refs.map(r => r.file)).size} mdx file(s) — all resolve.`);
    return;
  }

  console.error(`✗ ${broken.length} broken <StoryEmbed> reference(s):\n`);
  for (const b of broken) {
    console.error(`  ${b.file}:${b.line}`);
    console.error(`    id="${b.id}"`);
    // Suggest the closest known id by edit distance over kebab parts.
    const closest = suggestClosest(b.id, knownIds);
    if (closest) console.error(`    did you mean: id="${closest}"?`);
    console.error('');
  }
  printRuleLink('story-embeds');
  process.exit(1);
}

function suggestClosest(missing: string, knownIds: Set<string>): string | null {
  let best: { id: string; d: number } | null = null;
  for (const candidate of knownIds) {
    const d = distance(missing, candidate);
    if (d < 8 && (!best || d < best.d)) best = { id: candidate, d };
  }
  return best?.id ?? null;
}

function distance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 12) return 99;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
