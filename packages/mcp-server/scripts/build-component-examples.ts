#!/usr/bin/env tsx
/**
 * Build-time extractor: scans every `*.stories.ts` file in the
 * monorepo and produces a JSON map of canonical usage snippets
 * keyed by component name. The MCP server's `get_component_examples`
 * tool reads this JSON at runtime.
 *
 * Baked at build time (rather than scanned at runtime) so the
 * published `@civui/mcp-server` package doesn't need the source
 * stories to ship examples — the JSON travels in `dist/resources/`.
 *
 * Story extraction is intentionally regex-based, not AST-based:
 *
 * - Stories are simple. Each file has a `meta` block with a `title`
 *   like `Forms/Inputs/Text Input`, followed by `export const NAME:
 *   Story = { ... render: () => html\`...\` }` blocks.
 * - Adding a TypeScript AST parser to the build pipeline for this
 *   one extractor isn't worth the install footprint.
 * - If the regex misses a story or grabs the wrong block, the cost
 *   is one missed example — not a correctness bug. The tool
 *   reports "no examples found for civ-X" rather than producing
 *   stale or wrong output.
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../../..');
const OUT = join(__dirname, '../src/resources/component-examples.json');

/** Tag → snippets[] map. */
type ExamplesByTag = Record<string, Example[]>;

interface Example {
  /** Story export name (e.g. `Default`, `WithIcons`). */
  story: string;
  /** Optional human-friendly display name from `name:` field. */
  name?: string;
  /** Storybook category from the file's meta `title`. */
  category: string;
  /** The rendered HTML template string (the body inside `html\`...\``). */
  html: string;
  /** File the story came from (relative to repo root, for traceability). */
  source: string;
}

/** Recursively walk directory yielding `*.stories.ts` paths. */
function* walkStories(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.build') continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) {
      yield* walkStories(full);
    } else if (entry.endsWith('.stories.ts') && !entry.endsWith('.drupal.stories.ts')) {
      yield full;
    }
  }
}

/** Read the meta-block title for a stories file. */
function extractTitle(src: string): string {
  const m = src.match(/title:\s*['"`]([^'"`]+)['"`]/);
  return m?.[1] ?? '';
}

/**
 * Find the primary `<civ-*>` tag referenced in a story's HTML body.
 * Used to bucket examples by component when a single stories file
 * covers multiple tags (e.g. checkbox + checkbox-group).
 */
function extractPrimaryTag(html: string): string {
  const m = html.match(/<(civ-[a-z][\w-]*)/);
  return m?.[1] ?? '';
}

/**
 * Parse out every `export const NAME: Story = { ... }` block,
 * extracting the inner `html\`...\`` template.
 *
 * Limitations (documented, not silently broken):
 * - Only finds template literals tagged with `html\`...\``.
 * - Stops at the first `\`` that isn't preceded by a backslash —
 *   doesn't handle template literals with nested backticks. None
 *   of our stories use that today.
 * - Skips stories whose `render` resolves to a function call (e.g.
 *   `render: someFactory()`) — those need to be hand-written if we
 *   ever want them in the catalog.
 */
function extractStories(src: string): Array<{ story: string; name?: string; html: string }> {
  const out: Array<{ story: string; name?: string; html: string }> = [];
  // Match `export const FOO: Story = { ... }` — non-greedy across newlines.
  const storyBlock = /export const (\w+)\s*:\s*Story\s*=\s*\{([\s\S]*?)\n\};/g;
  let m: RegExpExecArray | null;
  while ((m = storyBlock.exec(src)) !== null) {
    const storyName = m[1];
    const body = m[2];

    // Optional display name override (`name: 'Pretty Title'`).
    const nameMatch = body.match(/\bname:\s*['"`]([^'"`]+)['"`]/);

    // The render template. Match `html\`...\`` non-greedy and stop at
    // the first closing backtick (none of our stories nest backticks
    // — escaping that would need a real tokenizer).
    const htmlMatch = body.match(/html`([\s\S]*?)`/);
    if (!htmlMatch) continue;
    const html = htmlMatch[1].trim();
    if (!html) continue;

    out.push({
      story: storyName,
      name: nameMatch?.[1],
      html,
    });
  }
  return out;
}

function main(): void {
  const examples: ExamplesByTag = {};
  let storyCount = 0;
  let fileCount = 0;

  for (const file of walkStories(join(ROOT, 'packages'))) {
    fileCount++;
    const src = readFileSync(file, 'utf-8');
    const category = extractTitle(src);
    const rel = relative(ROOT, file);
    const stories = extractStories(src);

    for (const s of stories) {
      const tag = extractPrimaryTag(s.html);
      if (!tag) continue;
      if (!examples[tag]) examples[tag] = [];
      examples[tag].push({
        story: s.story,
        name: s.name,
        category,
        html: s.html,
        source: rel,
      });
      storyCount++;
    }
  }

  // Stable ordering — sort tags alphabetically, stories by story name.
  const sortedTags = Object.keys(examples).sort();
  const sorted: ExamplesByTag = {};
  for (const tag of sortedTags) {
    sorted[tag] = examples[tag].sort((a, b) => a.story.localeCompare(b.story));
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');

  console.log(
    `[build-component-examples] wrote ${storyCount} examples across ${sortedTags.length} components from ${fileCount} story files → ${relative(ROOT, OUT)}`,
  );
}

main();
