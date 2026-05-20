#!/usr/bin/env tsx
/**
 * Append a "Drupal SDC" section to every component doc page that has a
 * matching `.drupal.stories.ts`. Idempotent — skips pages that already
 * include the section.
 *
 * Pattern: derive the storybook ID prefix from the page's first
 * `<StoryEmbed id="..." />`. If `<prefix>-drupal-sdc--default` exists
 * (computed from the title in each `.drupal.stories.ts`), append a
 * section linking to the SDC source + embedding the Default Drupal story.
 *
 * Run: `pnpm tsx tools/add-drupal-sdc-section.ts`
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'apps/docs/docs/components');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');
const DRUPAL_COMPONENTS_DIR = path.join(REPO_ROOT, 'packages/drupal/civui/components');
const SECTION_MARKER = '## Drupal SDC';

interface DrupalStory {
  /** Storybook id of the Default variant, e.g. `forms-inputs-text-input-drupal-sdc--default`. */
  storyId: string;
  /** The SDC slug — the directory name under `packages/drupal/civui/components/`. */
  sdcSlug: string;
  /** Path to the source `.drupal.stories.ts` (for traceability). */
  source: string;
}

/** Storybook converts a title like 'Forms/Inputs/Text Input/Drupal SDC' to 'forms-inputs-text-input-drupal-sdc'. */
function titleToStorySlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) { out.push(p); return; }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo' || base === 'build') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

/**
 * Discover the SDC slug a `.drupal.stories.ts` references. Each story
 * imports its Twig template from `packages/drupal/civui/components/<slug>/<slug>.twig`,
 * so we pull the slug out of the first such import.
 */
function extractSdcSlug(storySrc: string): string | null {
  const m = storySrc.match(/drupal\/civui\/components\/([^/]+)\/[^/]+\.twig/);
  return m ? m[1] : null;
}

async function findDrupalStories(): Promise<Map<string, DrupalStory>> {
  const files = (await walk(PACKAGES_DIR)).filter((p) => p.endsWith('.drupal.stories.ts'));
  const byPrefix = new Map<string, DrupalStory>();
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    const titleMatch = src.match(/title:\s*'([^']+)'/);
    if (!titleMatch) continue;
    const title = titleMatch[1];
    const titleSlug = titleToStorySlug(title); // e.g. 'forms-inputs-text-input-drupal-sdc'
    // The web-story prefix is the title minus the trailing '-drupal-sdc'.
    if (!titleSlug.endsWith('-drupal-sdc')) continue;
    const webPrefix = titleSlug.slice(0, -'-drupal-sdc'.length);
    const sdcSlug = extractSdcSlug(src);
    if (!sdcSlug) continue;
    byPrefix.set(webPrefix, {
      storyId: `${titleSlug}--default`,
      sdcSlug,
      source: path.relative(REPO_ROOT, file),
    });
  }
  return byPrefix;
}

/**
 * Verify that a component.yml exists for the SDC slug — guards against
 * stories whose Twig import path doesn't match a real SDC directory.
 */
async function sdcExists(slug: string): Promise<boolean> {
  try {
    await fs.stat(path.join(DRUPAL_COMPONENTS_DIR, slug, `${slug}.component.yml`));
    return true;
  } catch {
    return false;
  }
}

/**
 * Make sure the MDX file imports `StoryEmbed`. Every page already does,
 * but check defensively so a fresh page that adopted the partial-tables
 * pattern but never embedded a story still works.
 */
function ensureStoryEmbedImport(content: string): string {
  if (/import\s+StoryEmbed\s+from\s+["']@site\/src\/components\/StoryEmbed["'];?/.test(content)) {
    return content;
  }
  // Insert after the frontmatter / first import block.
  const fmMatch = content.match(/^(---[\s\S]*?---\n+)/);
  const insertAt = fmMatch ? fmMatch[1].length : 0;
  return content.slice(0, insertAt) + `import StoryEmbed from "@site/src/components/StoryEmbed";\n` + content.slice(insertAt);
}

function renderSection(story: DrupalStory): string {
  return `
## Drupal SDC

This component is also published as a [Drupal Single Directory Component (SDC)](https://www.drupal.org/docs/develop/theming-drupal/using-single-directory-components) at \`packages/drupal/civui/components/${story.sdcSlug}/\`. Include it from any Twig template — the SDC emits the underlying \`<civ-*>\` markup, and CivUI's JavaScript upgrades it on the client:

\`\`\`twig
{% include 'civui:${story.sdcSlug}' with {
  // props mirror the Component-Specific Props table above
} only %}
\`\`\`

The component schema lives in [\`${story.sdcSlug}.component.yml\`](pathname:///civui/storybook/?path=/story/${story.storyId}) and the template in [\`${story.sdcSlug}.twig\`](pathname:///civui/storybook/?path=/story/${story.storyId}). The story below renders the SDC through Storybook's Twig plugin so you can see the exact output:

<StoryEmbed id="${story.storyId}" />
`;
}

async function processPage(filePath: string, byPrefix: Map<string, DrupalStory>): Promise<'added' | 'already-done' | 'no-match' | 'no-embed'> {
  const content = await fs.readFile(filePath, 'utf8');
  if (content.includes(SECTION_MARKER)) return 'already-done';

  const embedMatch = content.match(/<StoryEmbed[^>]+id="([^"]+)"/);
  if (!embedMatch) return 'no-embed';

  const storyId = embedMatch[1];
  const prefix = storyId.split('--')[0];
  const drupal = byPrefix.get(prefix);
  if (!drupal) return 'no-match';
  if (!(await sdcExists(drupal.sdcSlug))) return 'no-match';

  const withImport = ensureStoryEmbedImport(content);
  // Append, trimming any trailing whitespace so the file ends cleanly.
  const next = withImport.replace(/\s*$/, '') + '\n' + renderSection(drupal) + '\n';
  await fs.writeFile(filePath, next, 'utf8');
  return 'added';
}

async function main(): Promise<void> {
  const byPrefix = await findDrupalStories();
  console.log(`Discovered ${byPrefix.size} Drupal SDC default-story prefixes.\n`);

  const docs = (await walk(DOCS_DIR)).filter((p) => p.endsWith('.mdx') && !path.basename(p).startsWith('_'));

  const counts = { added: 0, 'already-done': 0, 'no-match': 0, 'no-embed': 0 };
  const noMatch: string[] = [];
  for (const file of docs) {
    const status = await processPage(file, byPrefix);
    counts[status]++;
    if (status === 'no-match') noMatch.push(path.relative(REPO_ROOT, file));
  }

  console.log(`Pages added:        ${counts.added}`);
  console.log(`Already had section: ${counts['already-done']}`);
  console.log(`No matching SDC:    ${counts['no-match']}`);
  console.log(`No <StoryEmbed>:    ${counts['no-embed']}`);
  if (noMatch.length) {
    console.log(`\nPages with no matching Drupal SDC (components without a .drupal.stories.ts):`);
    for (const p of noMatch) console.log(`  ${p}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
