#!/usr/bin/env tsx
/**
 * lint-dark-recipe-contrast — gate the semantic-intent recipe's bg/text
 * pairs for WCAG contrast in DARK mode, derived directly from the
 * `RECIPE` map in lint-semantic-color-recipe.ts.
 *
 * Background
 * ----------
 * Two existing lints each cover half of this:
 *   - `lint:semantic-color-recipe` checks that the CSS rules in
 *     components.css use the right token *names* (e.g. the error
 *     secondary badge must paint `--civ-color-error-lightest`). Token
 *     names are mode-agnostic — the same `var(--civ-color-…)` resolves
 *     to the light hex or the dark hex per `prefers-color-scheme` — so
 *     this lint says nothing about whether the dark-mode *values*
 *     behind those names actually clear contrast.
 *   - `lint:contrast` checks WCAG ratios in both modes, but against a
 *     hand-maintained `PAIRS` list that *mirrors* `RECIPE`. The two can
 *     silently drift: add a sixth intent to `RECIPE`, wire its CSS, and
 *     `lint:semantic-color-recipe` passes — but unless someone also
 *     remembers to add the matching `PAIRS` entry, the new intent's
 *     dark-mode contrast ships ungated.
 *
 * `.claude/rules/colors.md` → "Recipe consistency across modes" calls
 * this out: "The semantic-color-recipe lint validates the light palette
 * pairs but not the dark palette pairs … A drift in
 * color-dark.tokens.json that breaks contrast would ship silently."
 *
 * What it does
 * ------------
 * `RECIPE` is the single source of truth. For every emphasis × intent
 * whose expectation names BOTH a `bg` and a `text` token (i.e. a
 * self-contained text-on-bg pair — `secondary` and `primary`; `dot`
 * has no text and `tertiary` has no bg, so they're skipped):
 *
 *   1. Resolve both token names against `color-dark.tokens.json`.
 *   2. Assert the WCAG 2.1 ratio clears AA (4.5:1 body text).
 *   3. Assert the pair is represented in `lint-contrast`'s `PAIRS`, so
 *      a future `RECIPE` addition can't quietly fall out of the
 *      canonical contrast gate.
 *
 * Because the pairs are derived from `RECIPE`, adding a new intent
 * automatically gets dark-mode contrast gating for free — no second
 * list to keep in sync.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { RECIPE } from './lint-semantic-color-recipe.js';
import { PAIRS, contrastRatio, resolveToken } from './lint-contrast.js';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DARK_TOKENS = path.join(REPO_ROOT, 'packages/tokens/src/color-dark.tokens.json');

/** AA body-text floor (WCAG SC 1.4.3). */
const MIN_RATIO = 4.5;

/**
 * Convert a recipe token name (`--civ-color-info-lightest`) to the
 * dotted path `lint-contrast.resolveToken` expects (`info.lightest`).
 * Every value used in RECIPE is a single `family-shade` pair, so
 * splitting on the first hyphen after the prefix is sufficient
 * (`base-darker` → `base.darker`, `white-DEFAULT` → `white.DEFAULT`).
 */
export function tokenNameToDotted(name: string): string {
  const bare = name.replace('--civ-color-', '');
  return bare.replace('-', '.');
}

export interface DerivedPair {
  /** e.g. `secondary.error` */
  label: string;
  bg: string; // dotted path
  text: string; // dotted path
}

/** Flatten RECIPE into the self-contained (bg AND text) pairs. */
export function derivePairs(recipe: typeof RECIPE = RECIPE): DerivedPair[] {
  const pairs: DerivedPair[] = [];
  for (const [emphasis, intents] of Object.entries(recipe)) {
    for (const [intent, exp] of Object.entries(intents)) {
      if (!exp || exp.bg == null || exp.text == null) continue;
      pairs.push({
        label: `${emphasis}.${intent}`,
        bg: tokenNameToDotted(exp.bg),
        text: tokenNameToDotted(exp.text),
      });
    }
  }
  return pairs;
}

export interface DarkRecipeFinding {
  label: string;
  kind: 'contrast' | 'coverage';
  detail: string;
}

/** True if some PAIRS entry resolves the same (bg, text) dotted paths. */
function coveredByContrastPairs(pair: DerivedPair): boolean {
  return PAIRS.some((p) => p.bg === pair.bg && p.text === pair.text);
}

export function evaluateDarkRecipe(
  darkTokens: unknown,
  pairs: DerivedPair[] = derivePairs(),
): DarkRecipeFinding[] {
  const findings: DarkRecipeFinding[] = [];
  for (const pair of pairs) {
    // 1. Dark-mode contrast.
    let bgHex: string, textHex: string;
    try {
      bgHex = resolveToken(darkTokens, pair.bg);
      textHex = resolveToken(darkTokens, pair.text);
    } catch (e) {
      findings.push({
        label: pair.label,
        kind: 'contrast',
        detail: `token resolution failed in dark palette: ${(e as Error).message}`,
      });
      continue;
    }
    const ratio = contrastRatio(bgHex, textHex);
    if (ratio < MIN_RATIO) {
      findings.push({
        label: pair.label,
        kind: 'contrast',
        detail:
          `dark-mode ${pair.text} (${textHex}) on ${pair.bg} (${bgHex}) ` +
          `= ${ratio.toFixed(2)}:1, need ≥ ${MIN_RATIO.toFixed(1)}`,
      });
    }

    // 2. Coverage parity with lint-contrast PAIRS.
    if (!coveredByContrastPairs(pair)) {
      findings.push({
        label: pair.label,
        kind: 'coverage',
        detail:
          `recipe pair { bg: '${pair.bg}', text: '${pair.text}' } is not in ` +
          `lint-contrast PAIRS — add it so both light and dark contrast ` +
          `stay gated by lint:contrast too.`,
      });
    }
  }
  return findings;
}

async function main(): Promise<void> {
  const darkTokens = JSON.parse(await fs.readFile(DARK_TOKENS, 'utf8'));
  const pairs = derivePairs();
  const findings = evaluateDarkRecipe(darkTokens, pairs);

  if (findings.length === 0) {
    console.log(
      `✓ ${pairs.length} semantic-recipe bg/text pair(s) (derived from RECIPE) ` +
      `clear AA in dark mode and are covered by lint-contrast PAIRS.`,
    );
    return;
  }

  console.error(`✗ ${findings.length} dark-mode recipe issue(s):\n`);
  for (const f of findings) {
    console.error(`  [${f.kind}] ${f.label}`);
    console.error(`    ${f.detail}`);
    console.error('');
  }
  console.error(
    'RECIPE (in tools/lint-semantic-color-recipe.ts) is the source of\n' +
    'truth. A `contrast` failure means a color-dark.tokens.json value\n' +
    'regressed below AA — pick a different dark shade (don\'t lower the\n' +
    'threshold). A `coverage` failure means a new RECIPE entry needs a\n' +
    'matching PAIRS entry in tools/lint-contrast.ts.',
  );
  printRuleLink('dark-recipe-contrast');
  process.exit(1);
}

// Only run when invoked directly (not when imported by the test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
