#!/usr/bin/env tsx
/**
 * lint-between-block-cadence — enforce the vertical-rhythm
 * convention documented in `.claude/rules/spacing.md`.
 *
 * Background
 * ----------
 * CivUI components fall into one of three rhythm tiers:
 *
 *   Tier 1  Top-of-page heading (mb-6 / 30px). Just civ-page-header
 *           + heading-xl. Out of scope for this lint (one-off).
 *
 *   Tier 2  Block-stack (mb-4 / 20px). Components that sit between
 *           sibling blocks in the normal page flow — they OWN their
 *           bottom margin so consumers can drop them in a vertical
 *           stack and get consistent rhythm without thinking.
 *
 *   Tier 3  Gap-controlled (no margin). Components that typically
 *           live inside a flex/grid parent that controls cadence via
 *           `gap`. Adding margin-bottom would double-space inside a
 *           `civ-gap-4` parent.
 *
 * The canonical drift mode: a new Tier 2 component lands without
 * mb-4 (visible inconsistency in any stack of mixed-component
 * content), or a Tier 3 component picks up mb-4 "for consistency"
 * (silent double-spacing inside its target grid layout).
 *
 * What it does
 * ------------
 * For each component listed in `TIER_2_COMPONENTS`:
 *   PASS if the component's CSS rule body declares `civ-mb-{n}` at
 *   the expected step (4 by default; some variants document a
 *   different step in `expectedMb`).
 *   FAIL if mb is absent or set to a different step.
 *
 * For each component listed in `TIER_3_COMPONENTS`:
 *   PASS if the component's top-level rule body declares no
 *   `civ-mb-{n}` other than `civ-mb-0` (margin-reset is fine).
 *   FAIL if mb is set — the component shouldn't carry one.
 *
 * The lint reads the rule body by finding the `.civ-X {` (or bare
 * `civ-X {` for element-targeted host rules) selector and capturing
 * everything up to the matching `}`. Top-level rules only — nested
 * `@media` blocks are ignored on purpose since the canonical rhythm
 * lives at the top.
 *
 * Adding a new component
 * ----------------------
 * Pick the tier first (see spacing.md "Three rhythm tiers"):
 *   - Tier 2: add an entry to `TIER_2_COMPONENTS`. The component MUST
 *     own its mb-4 in components.css. CI will enforce it.
 *   - Tier 3: add an entry to `TIER_3_COMPONENTS`. The component
 *     must NOT carry a top-level mb. CI will enforce it.
 *
 * If a component doesn't fit either tier (e.g. one-off Tier 1
 * components like page-header, or compound primitives like
 * civ-button that aren't a block-level container), leave it out
 * of both lists.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const COMPONENTS_CSS = path.join(
  REPO_ROOT,
  'packages/core/src/styles/components.css',
);

interface Tier2Entry {
  /** The CSS selector (class or element) that should carry the mb. */
  selector: string;
  /** Expected mb step (4 by default; page-header--sm uses 3). */
  expectedMb: number;
  /** Short rationale shown in failure output. */
  rationale: string;
}

/**
 * Tier 2 components — block-stack. Each MUST own its bottom margin
 * in components.css so consumers can stack them without re-thinking
 * spacing.
 */
export const TIER_2_COMPONENTS: Tier2Entry[] = [
  {
    selector: '.civ-fieldset',
    expectedMb: 4,
    rationale: 'multi-field grouping; sits between other form sections',
  },
  {
    selector: '.civ-card',
    expectedMb: 4,
    rationale: 'standalone content block; sits between siblings in a stack',
  },
  {
    selector: '.civ-alert',
    expectedMb: 4,
    rationale: 'status banner; usually placed inline above content',
  },
  {
    selector: '.civ-form-error-summary',
    expectedMb: 4,
    rationale: 'error list at the top of a failing form',
  },
  {
    selector: '.civ-filterable-list__filters',
    expectedMb: 4,
    rationale: 'filter row above a list, sits between other content',
  },
  // `.civ-input-group` is NOT in this list. It's a flex layout
  // primitive that strips `civ-mb-4` from its children (joined
  // input+button on one row) — see the comment on line 3827 of
  // components.css. It's a single-row layout unit, not a stack-
  // rhythm block.
  {
    selector: '.civ-page-header--sm',
    expectedMb: 3,
    rationale: 'smaller page-header variant — one step down from the default mb-6',
  },
];

/**
 * Tier 3 components — gap-controlled. Each must NOT carry a
 * top-level margin-bottom (other than mb-0 reset). The component's
 * typical placement is inside a flex/grid container that supplies
 * cadence via `gap`; mb here would double-space.
 */
export const TIER_3_COMPONENTS: string[] = [
  '.civ-callout',
  'civ-callout',  // host-targeted bare selector
  '.civ-notice',
  '.civ-section-intro',
  'civ-section-intro',
  '.civ-link-card',
  '.civ-metric-tile',
  '.civ-metric-group',
  '.civ-itemized-total',
  '.civ-support-resources',
  '.civ-process-list',
  '.civ-timeline',
  '.civ-data-grid',
  '.civ-divider',
  '.civ-data-field',
  '.civ-list',
];

/**
 * Capture the body of the first rule whose selector list contains
 * `selector` exactly, at the canonical "top level" of a CivUI
 * stylesheet. The whole file is wrapped in `@layer components { … }`,
 * so the top-level rules actually sit at depth 1 inside the layer.
 *
 * Wrapper at-rules (`@layer`, `@media`, `@supports`, `@container`)
 * are transparent — the parser recurses into their bodies looking
 * for the selector. Plain CSS rule bodies are opaque (we don't
 * descend into them; that would falsely match a nested selector
 * inside another component's rule).
 *
 * Returns null if no matching rule is found.
 */
export function findRuleBody(css: string, selector: string): string | null {
  // Strip comments first so brace counting isn't confused by `{` /
  // `}` inside CSS comment blocks.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

  function scan(text: string): string | null {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open === -1) return null;
      const head = text.slice(i, open);
      let depth = 1;
      let j = open + 1;
      while (j < text.length && depth > 0) {
        const ch = text[j];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        j++;
      }
      const close = j - 1;
      const body = text.slice(open + 1, close);
      const trimmedHead = head.trim();

      if (/^@(layer|media|supports|container)\b/.test(trimmedHead)) {
        const found = scan(body);
        if (found !== null) return found;
      } else {
        const selectors = trimmedHead
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (selectors.includes(selector)) {
          return body;
        }
      }
      i = close + 1;
    }
    return null;
  }

  return scan(stripped);
}

/**
 * Find every `civ-mb-N` token in a rule body. Returns an array of
 * the numeric N values (e.g. ['4', '0', '3']). Excludes commented-
 * out occurrences (CSS comment blocks) by stripping comments first.
 */
export function findMarginBottomSteps(body: string): string[] {
  const noComments = body.replace(/\/\*[\s\S]*?\*\//g, '');
  const matches = noComments.match(/civ-mb-([0-9.]+)/g) ?? [];
  return matches.map((m) => m.replace('civ-mb-', ''));
}

interface Failure {
  selector: string;
  tier: 2 | 3;
  reason: string;
}

export function evaluate(css: string): Failure[] {
  const failures: Failure[] = [];

  for (const entry of TIER_2_COMPONENTS) {
    const body = findRuleBody(css, entry.selector);
    if (body === null) {
      failures.push({
        selector: entry.selector,
        tier: 2,
        reason: `rule not found in components.css — expected civ-mb-${entry.expectedMb} (${entry.rationale})`,
      });
      continue;
    }
    const steps = findMarginBottomSteps(body);
    if (!steps.includes(String(entry.expectedMb))) {
      failures.push({
        selector: entry.selector,
        tier: 2,
        reason:
          steps.length === 0
            ? `missing civ-mb-${entry.expectedMb} (${entry.rationale})`
            : `expected civ-mb-${entry.expectedMb} but rule declares civ-mb-${steps.join(', civ-mb-')} (${entry.rationale})`,
      });
    }
  }

  for (const selector of TIER_3_COMPONENTS) {
    const body = findRuleBody(css, selector);
    if (body === null) continue; // bare selectors that don't exist are fine
    const steps = findMarginBottomSteps(body).filter((s) => s !== '0');
    if (steps.length > 0) {
      failures.push({
        selector,
        tier: 3,
        reason: `must not carry margin-bottom; rule declares civ-mb-${steps.join(', civ-mb-')}. Tier 3 components are gap-controlled — adding mb here double-spaces inside flex/grid parents.`,
      });
    }
  }

  return failures;
}

async function main(): Promise<void> {
  const css = await fs.readFile(COMPONENTS_CSS, 'utf8');
  const failures = evaluate(css);

  if (failures.length === 0) {
    console.log(
      `✓ ${TIER_2_COMPONENTS.length} Tier 2 component(s) carry the expected ` +
      `mb step; ${TIER_3_COMPONENTS.length} Tier 3 component(s) carry no mb.`,
    );
    return;
  }

  console.error(`✗ ${failures.length} rhythm-tier violation(s):\n`);
  for (const f of failures) {
    console.error(`  [Tier ${f.tier}] ${f.selector}`);
    console.error(`    ${f.reason}`);
    console.error('');
  }
  console.error(
    'See .claude/rules/spacing.md "Three rhythm tiers" for the contract.\n' +
    'If a component genuinely belongs in a different tier, move it between\n' +
    'TIER_2_COMPONENTS and TIER_3_COMPONENTS in tools/lint-between-block-\n' +
    'cadence.ts in the same change.',
  );
  printRuleLink('spacing');
  process.exit(1);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
