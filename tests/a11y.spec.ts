import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Real-browser axe-core sweep across a representative subset of Storybook
 * stories. The earlier jsdom axe pass (in @civui/compound) catches DOM /
 * ARIA structure violations; this one catches the things jsdom can't see —
 * contrast ratios, focus-order, and any rendering issue that depends on
 * a real layout engine.
 *
 * Uses the pre-built Storybook static export so the test isn't gated on
 * the dev server.
 *
 * To run: `pnpm storybook:build && pnpm test:a11y`. Skipped if the static
 * build isn't present.
 */

const STATIC_INDEX = path.resolve(process.cwd(), 'storybook-static/index.json');

type StoryEntry = { id: string; title: string; type?: string };

function loadStories(): StoryEntry[] {
  if (!fs.existsSync(STATIC_INDEX)) return [];
  const idx = JSON.parse(fs.readFileSync(STATIC_INDEX, 'utf8')) as {
    entries: Record<string, StoryEntry>;
  };
  return Object.values(idx.entries).filter((e) => e.type === 'story');
}

/**
 * One representative story per top-level component. Picking the first story
 * per component family keeps the sweep fast (~30 stories instead of 1000+)
 * while still surfacing real-browser issues that affect every variant.
 */
/**
 * Components excluded from the sweep:
 * - `civ-icon-editor` is a Storybook-only authoring tool, not a shipped
 *   component; its development-only state has known a11y holes.
 * - `civ-action-sheet`'s default story renders the sheet closed, so the
 *   `#storybook-root *` selector never resolves. The action-sheet's a11y
 *   surface is covered by the jsdom axe pass when the sheet is open.
 */
const EXCLUDED_TITLES = /^(Core\/Icon\/Editor|Overlays\/Action Sheet)$/;

function pickRepresentative(stories: StoryEntry[]): StoryEntry[] {
  const seen = new Set<string>();
  const picked: StoryEntry[] = [];
  for (const s of stories) {
    if (s.id.includes('drupal-sdc')) continue;
    if (s.title.startsWith('Contract/')) continue;
    if (EXCLUDED_TITLES.test(s.title)) continue;
    const key = s.title.split('/').slice(0, 2).join('/');
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(s);
  }
  return picked;
}

const stories = pickRepresentative(loadStories());

test.describe('axe-core real-browser a11y sweep', () => {
  if (stories.length === 0) {
    test.skip(true, 'No storybook-static/index.json — run `pnpm storybook:build` first.');
  }

  for (const story of stories) {
    test(`${story.title}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForSelector('#storybook-root *', { timeout: 10_000 });
      await page.waitForTimeout(200);

      const result = await new AxeBuilder({ page })
        .include('#storybook-root')
        .analyze();

      expect(
        result.violations,
        `${story.title} has axe violations:\n${result.violations.map((v) => `  • ${v.id} (${v.impact}) — ${v.help}`).join('\n')}`,
      ).toEqual([]);
    });
  }
});
