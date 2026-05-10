import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Visual regression sweep — pixel-diffs each representative story against
 * a committed baseline. Local-friendly alternative to Chromatic / Percy:
 * baselines live in `tests/__snapshots__/` and are committed to git.
 *
 * To establish baselines for a new story (or after an intentional visual
 * change): `pnpm test:visual --update-snapshots`.
 *
 * Failures produce an HTML diff under `playwright-report/`.
 *
 * Stories included: same representative subset as the axe sweep — one
 * story per top-level component family. ~30 snapshots.
 *
 * The `maxDiffPixelRatio: 0.01` threshold tolerates sub-pixel
 * antialiasing differences while still catching meaningful regressions.
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

test.describe('visual regression sweep', () => {
  if (stories.length === 0) {
    test.skip(true, 'No storybook-static/index.json — run `pnpm storybook:build` first.');
  }

  test.use({ viewport: { width: 800, height: 600 } });

  for (const story of stories) {
    test(`${story.title}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForSelector('#storybook-root *', { timeout: 10_000 });
      // Allow custom fonts and async layout to settle. Without this, the
      // first run after a fresh build sometimes captures the fallback font.
      await page.waitForFunction(() => document.fonts.ready);
      await page.waitForTimeout(300);

      // Component name as a stable file-safe key
      const key = story.id.replace(/[^a-z0-9-]/gi, '_');
      await expect(page).toHaveScreenshot(`${key}.png`, {
        fullPage: false,
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
