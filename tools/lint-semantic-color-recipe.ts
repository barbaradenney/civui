#!/usr/bin/env tsx
/**
 * lint-semantic-color-recipe — enforce the shared bg/text recipe for
 * semantic-intent components (civ-badge, civ-count) plus the static
 * soft-bg + intent-tint rules on alert / card / process-list-item /
 * timeline-item that migrated to the new `*-lightest` shades during
 * the 2026-05-27 shade-ladder restructure.
 *
 * Background
 * ----------
 * `civ-badge` and `civ-count` both render the five semantic intents
 * `info / success / warning / error / neutral` at three emphases
 * (`secondary`, `primary`, and a dot/tertiary variant per component).
 * The colour treatment is the same for the same intent across both
 * components — the visual cue for "this is an error" should not be
 * paler in a count pill than in a badge pill. Historically `civ-count`
 * picked `error-lightest` for its error-secondary while `civ-badge`
 * picked `error-lighter`; the inconsistency went unnoticed for months
 * because no test or CI gate compared the two CSS rule blocks.
 *
 * The 2026-05-27 shade-ladder restructure renamed the softest pale
 * surface from `<intent>-lighter` to `<intent>-lightest` for info /
 * success / warning, and inserted a new mid-tone at `<intent>-lighter`.
 * (`error` stayed at `error-lighter` because it didn't restructure.)
 * Several rules outside the badge/count recipe migrated to the new
 * tokens: alert--style-secondary backgrounds, card-secondary colored
 * variants, process-list-item complete-state marker, timeline-item
 * dot. A refactor renaming `*-lightest` back to `*-lighter` "for
 * brevity" would silently re-introduce the new (darker) mid-tone
 * visual — these EXTENDED_SELECTORS gate that drift.
 *
 * What it does
 * ------------
 * Parses `packages/core/src/styles/components.css`, runs two passes:
 *
 *   1. Combinatorial recipe — finds every rule whose selector
 *      matches `.civ-{badge|count}--style-{emphasis}.civ-…--{intent}`
 *      (or the dot / tertiary equivalents), extracts the
 *      `background-color` and `color` declarations, and verifies they
 *      match RECIPE.
 *
 *   2. Static selectors — looks up each entry in EXTENDED_SELECTORS
 *      and verifies the rule body contains the expected bg + text
 *      tokens. Both the `background-color: var(--civ-color-X)` form
 *      and the `@apply civ-bg-X` Tailwind utility form are accepted
 *      since components.css mixes the two for historical reasons.
 *
 * RECIPE / EXTENDED_SELECTORS are the single source of truth. Drift
 * fails CI. Each documented exception is encoded inline (today: error
 * is special-cased in both the secondary recipe entry and several
 * card/alert selectors because `error` didn't restructure on
 * 2026-05-27 — its softest surface is still `error-lighter`, not
 * `error-lightest`). Adding a new exception requires editing this
 * file — the change is deliberate and shows up in code review.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const COMPONENTS_CSS = path.join(
  REPO_ROOT,
  'packages/core/src/styles/components.css',
);

type Intent = 'info' | 'success' | 'warning' | 'error' | 'neutral';
type Emphasis = 'secondary' | 'primary' | 'dot' | 'tertiary';
type Component = 'badge' | 'count';

interface Expectation {
  /** Expected background-color CSS variable name (or `null` if the rule
   *  is text-only — e.g. tertiary). */
  bg: string | null;
  /** Expected color (text) CSS variable name (or `null` if the rule
   *  is bg-only — e.g. dot). */
  text: string | null;
}

/**
 * The single source of truth for the semantic-intent recipe.
 *
 * Secondary  — bg: `<intent>-lightest` for info/success/warning,
 *              `error-lighter` (error didn't restructure in the
 *              2026-05-27 shade-ladder pass), `base-lightest` for
 *              neutral; text: darkest available shade that hits AA
 *              on the bg (info/error: `-dark`; success/warning:
 *              `-darkest`; neutral: `base-darker`).
 *
 * Primary    — bg: `<intent>-dark` (error: `error-DEFAULT` for brand
 *              saturation; neutral: `base-darker`);
 *              text: `white-DEFAULT`.
 *
 * Dot        — (badge only) bg: same shade as primary.
 *
 * Tertiary   — (count only) text: `<intent>-dark`; neutral inherits
 *              parent color so it has no rule at all.
 */
export const RECIPE: Record<Emphasis, Partial<Record<Intent, Expectation>>> = {
  secondary: {
    info:    { bg: '--civ-color-info-lightest',    text: '--civ-color-info-dark' },
    success: { bg: '--civ-color-success-lightest', text: '--civ-color-success-darkest' },
    warning: { bg: '--civ-color-warning-lightest', text: '--civ-color-warning-darkest' },
    error:   { bg: '--civ-color-error-lighter',    text: '--civ-color-error-dark' },
    neutral: { bg: '--civ-color-base-lightest',    text: '--civ-color-base-darker' },
  },
  primary: {
    info:    { bg: '--civ-color-info-dark',     text: '--civ-color-white-DEFAULT' },
    success: { bg: '--civ-color-success-dark',  text: '--civ-color-white-DEFAULT' },
    warning: { bg: '--civ-color-warning-dark',  text: '--civ-color-white-DEFAULT' },
    error:   { bg: '--civ-color-error-DEFAULT', text: '--civ-color-white-DEFAULT' },
    neutral: { bg: '--civ-color-base-darker',   text: '--civ-color-white-DEFAULT' },
  },
  dot: {
    info:    { bg: '--civ-color-info-dark',     text: null },
    success: { bg: '--civ-color-success-dark',  text: null },
    warning: { bg: '--civ-color-warning-dark',  text: null },
    error:   { bg: '--civ-color-error-DEFAULT', text: null },
    neutral: { bg: '--civ-color-base-darker',   text: null },
  },
  tertiary: {
    info:    { bg: null, text: '--civ-color-info-dark' },
    success: { bg: null, text: '--civ-color-success-dark' },
    warning: { bg: null, text: '--civ-color-warning-dark' },
    error:   { bg: null, text: '--civ-color-error-dark' },
    // neutral: no rule — count tertiary neutral keeps `color: inherit`
    // so it blends with the host text. Encoded as an omission here.
  },
};

/** Which emphasis variants each component supports. */
const SUPPORTED: Record<Component, ReadonlySet<Emphasis>> = {
  badge: new Set<Emphasis>(['secondary', 'primary', 'dot']),
  count: new Set<Emphasis>(['secondary', 'primary', 'tertiary']),
};

/**
 * EXTENDED_SELECTORS — static lookup of soft-bg / intent-tint rules
 * outside the badge/count combinatorial recipe.
 *
 * Each entry's `bg` and `text` fields name the expected shade (without
 * the `--civ-color-` prefix). The lint accepts either the CSS-var form
 * `background-color: var(--civ-color-<shade>)` OR the Tailwind utility
 * form `@apply civ-bg-<shade>` (alert--style-secondary uses the
 * utility form; the other selectors use plain var).
 *
 * Notes per family:
 * - civ-alert--style-secondary uses `*-lightest` for info / warning /
 *   success / neutral, `error-lighter` for error (didn't restructure).
 *   Text colours on these rules are set by the separate
 *   `.civ-alert--style-secondary .civ-alert__heading|__body` rules
 *   (always `base-darkest`) — not at restructure risk, not gated here.
 * - civ-card categorical secondary mirrors the semantic mapping:
 *   blue→primary, teal→info, red→error, green→success, yellow→warning,
 *   orange→accent.warm, purple→purple, gray→base. Each carries a
 *   matching text shade.
 * - civ-process-list-item complete-state marker uses success-lightest
 *   bg + success-darkest text (the new AAA pairing).
 * - civ-timeline-item dot uses `*-DEFAULT` bg + `*-lightest` text —
 *   that's an icon-on-color contrast pattern, not a soft-bg pattern,
 *   but gating it locks the lightest-shade choice for the icon.
 */
export const EXTENDED_SELECTORS: ReadonlyArray<{
  selector: string;
  bg?: string;
  text?: string;
}> = [
  // ── civ-alert secondary tinted bg ───────────────────────────────
  { selector: '.civ-alert--style-secondary.civ-alert--info',    bg: 'info-lightest' },
  { selector: '.civ-alert--style-secondary.civ-alert--warning', bg: 'warning-lightest' },
  { selector: '.civ-alert--style-secondary.civ-alert--success', bg: 'success-lightest' },
  { selector: '.civ-alert--style-secondary.civ-alert--error',   bg: 'error-lighter' },
  { selector: '.civ-alert--style-secondary.civ-alert--neutral', bg: 'base-lightest' },

  // ── civ-card categorical secondary (light tint) ─────────────────
  { selector: '.civ-card--blue',   bg: 'primary-lightest',     text: 'primary-dark' },
  { selector: '.civ-card--teal',   bg: 'info-lightest',        text: 'info-dark' },
  { selector: '.civ-card--red',    bg: 'error-lighter',        text: 'error-dark' },
  { selector: '.civ-card--green',  bg: 'success-lightest',     text: 'success-darkest' },
  { selector: '.civ-card--yellow', bg: 'warning-lightest',     text: 'warning-darkest' },
  { selector: '.civ-card--orange', bg: 'accent-warm-lightest', text: 'accent-warm-darkest' },
  { selector: '.civ-card--purple', bg: 'purple-lightest',      text: 'purple-dark' },
  { selector: '.civ-card--gray',   bg: 'base-lightest',        text: 'base-darker' },

  // ── civ-process-list-item complete state marker ─────────────────
  {
    selector: "civ-process-list-item[state='complete'] .civ-process-list-item__marker",
    bg: 'success-lightest',
    text: 'success-darkest',
  },

  // ── civ-timeline-item dot (bg = brand, icon = pale for contrast) ─
  { selector: "civ-timeline-item[intent='success'] .civ-timeline-item__dot", bg: 'success-DEFAULT', text: 'success-lightest' },
  { selector: "civ-timeline-item[intent='info'] .civ-timeline-item__dot",    bg: 'info-DEFAULT',    text: 'info-lightest' },
  { selector: "civ-timeline-item[intent='warning'] .civ-timeline-item__dot", bg: 'warning-DEFAULT', text: 'warning-lightest' },
  { selector: "civ-timeline-item[intent='error'] .civ-timeline-item__dot",   bg: 'error-DEFAULT',   text: 'error-lightest' },
  { selector: "civ-timeline-item[intent='neutral'] .civ-timeline-item__dot", bg: 'base-DEFAULT',    text: 'base-lightest' },
];

/**
 * Verify the rule body sets the given property to the expected shade.
 * Accepts two forms:
 *   - `background-color: var(--civ-color-<shade>);` (or with fallback)
 *   - `@apply civ-bg-<shade>;` for bg, `@apply civ-text-<shade>;` for text
 *
 * The Tailwind utility form is checked with a word-boundary regex so
 * `civ-bg-info-lightest` doesn't trip a sibling like
 * `civ-bg-info-lightest-something`.
 */
export function bodyHasToken(
  body: string,
  kind: 'bg' | 'text',
  shade: string,
): boolean {
  const utility = kind === 'bg' ? `civ-bg-${shade}` : `civ-text-${shade}`;
  // Allowed boundary chars after the utility class: whitespace, `;`,
  // closing brace `}`, end-of-string. `(?![\w-])` rejects suffix
  // characters that would make this a different class name.
  const utilRe = new RegExp(
    String.raw`(?<![\w-])${utility}(?![\w-])`,
  );
  if (utilRe.test(body)) return true;

  const property = kind === 'bg' ? 'background-color' : 'color';
  return extractVar(body, property) === `--civ-color-${shade}`;
}

const INTENTS: readonly Intent[] = ['info', 'success', 'warning', 'error', 'neutral'];
const COMPONENTS: readonly Component[] = ['badge', 'count'];

interface Finding {
  file: string;
  line: number;
  selector: string;
  detail: string;
}

interface SeenKey {
  component: Component;
  emphasis: Emphasis;
  intent: Intent;
  line: number;
  selector: string;
  actualBg: string | null;
  actualText: string | null;
}

/**
 * Parse one top-level CSS rule's body for `background-color: var(--…)`
 * and `color: var(--…)`. Returns the variable name (e.g.
 * `--civ-color-info-lighter`) without the surrounding `var(…)`
 * wrapper, or `null` if the rule doesn't set that property or sets it
 * to something other than a single var().
 *
 * Three correctness traps the regex guards against:
 *
 *   1. Word-boundary mismatch — `\bcolor\s*:` would also match
 *      `background-color:` because `\b` fires at the `-` separator
 *      (hyphen is a non-word char). Use a negative lookbehind
 *      `(?<![\w-])` so the property name must be preceded by
 *      whitespace, `;`, `{`, or be at start-of-body — never glued to
 *      a preceding identifier fragment like `background-`.
 *
 *   2. var() fallback syntax — `var(--x, #fff)` and `var(--x,
 *      var(--y))` are legal CSS. The capture stops at the first `,`
 *      or `)` so the recipe value is the first identifier only;
 *      anything more complex is rejected (returns null) rather than
 *      silently misread.
 *
 *   3. Multiple declarations within one rule — last one wins (CSS
 *      cascade). Iterate all matches and keep the final value.
 */
export function extractVar(body: string, property: 'background-color' | 'color'): string | null {
  const re = new RegExp(
    String.raw`(?<![\w-])${property}\s*:\s*var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,[^)]*)?\)\s*;`,
    'g',
  );
  let match: RegExpExecArray | null;
  let last: string | null = null;
  while ((match = re.exec(body))) {
    last = match[1];
  }
  return last;
}

/**
 * Match a selector against the recipe shape. Returns the matched
 * component / emphasis / intent triple, or null if the selector
 * isn't a semantic-recipe rule we care about.
 *
 * Examples we want to match:
 *   .civ-badge--style-secondary.civ-badge--info
 *   .civ-count--style-primary.civ-count--error
 *   .civ-badge--dot.civ-badge--neutral
 *   .civ-count--style-tertiary.civ-count--info
 *   .civ-badge--style-secondary.civ-badge--info:hover     ← state decorator
 *   .civ-badge--style-primary.civ-badge--info:not(:disabled)
 *
 * Examples we DON'T match (so they don't trip the lint):
 *   .civ-badge--style-secondary               (no intent half)
 *   .civ-badge                                (base class)
 *   .civ-badge-anchor                         (different surface)
 *
 * Tail decorators (`:pseudo` / `[attr]`) are allowed so a future
 * state-decorated drift rule like `.civ-badge--style-primary.
 * civ-badge--info:not(:disabled) { background: WRONG; }` can't
 * silently bypass the recipe check by appending a pseudo-class.
 */
export function classifySelector(
  selector: string,
): { component: Component; emphasis: Emphasis; intent: Intent } | null {
  // Normalize whitespace.
  const sel = selector.replace(/\s+/g, ' ').trim();

  const re =
    /^\.civ-(badge|count)--(?:style-(secondary|primary|tertiary)|(dot))\.civ-\1--(info|success|warning|error|neutral)(?:[:[].*)?$/;
  const m = sel.match(re);
  if (!m) return null;

  const component = m[1] as Component;
  const emphasis = (m[2] ?? m[3]) as Emphasis;
  const intent = m[4] as Intent;

  if (!SUPPORTED[component].has(emphasis)) return null;
  return { component, emphasis, intent };
}

interface Block {
  selector: string;
  openLine: number;
  body: string;
}

/**
 * Tokenize the CSS into top-level rule blocks. Skips block comments
 * and `@media` / `@layer` / `@supports` wrappers — the lint only
 * cares about leaf rules. Adapted from lint-border-radius.ts; the
 * shape works because components.css uses balanced braces and no
 * brace-bearing string literals.
 *
 * The yielded `body` is sliced from the COMMENT-STRIPPED text
 * (`stripped`), not the original `css`, so commented-out
 * declarations inside a rule body don't fool `extractVar`. A note
 * like `/* old: background-color: var(--civ-color-error-lightest); *​/`
 * inside a recipe rule would otherwise be read as a live declaration.
 */
function* parseRules(css: string): Generator<Block> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, ' '),
  );
  const len = stripped.length;
  let i = 0;
  type Frame = { selectorStart: number; openLine: number; isAtRule: boolean; selector: string };
  const stack: Frame[] = [];
  let segStart = 0;

  function lineOf(offset: number): number {
    let n = 1;
    for (let j = 0; j < offset && j < len; j++) if (stripped[j] === '\n') n++;
    return n;
  }

  while (i < len) {
    const ch = stripped[i];
    if (ch === '{') {
      const rawSelector = stripped.slice(segStart, i).trim();
      const isAtRule = rawSelector.startsWith('@');
      stack.push({
        selectorStart: i + 1,
        openLine: lineOf(i),
        isAtRule,
        selector: rawSelector,
      });
      segStart = i + 1;
      i++;
      continue;
    }
    if (ch === '}') {
      const frame = stack.pop();
      if (!frame) {
        i++;
        continue;
      }
      if (!frame.isAtRule && frame.selector) {
        const body = stripped.slice(frame.selectorStart, i);
        yield { selector: frame.selector, openLine: frame.openLine, body };
      }
      segStart = i + 1;
      i++;
      continue;
    }
    if (ch === ';') {
      segStart = i + 1;
      i++;
      continue;
    }
    i++;
  }
}

async function main(): Promise<void> {
  let css: string;
  try {
    css = await fs.readFile(COMPONENTS_CSS, 'utf8');
  } catch {
    throw new Error(`components.css not found at ${COMPONENTS_CSS}`);
  }

  const findings: Finding[] = [];
  const seen: SeenKey[] = [];

  for (const block of parseRules(css)) {
    const classified = classifySelector(block.selector);
    if (!classified) continue;
    const { component, emphasis, intent } = classified;
    const expected = RECIPE[emphasis][intent];
    if (!expected) {
      // The rule exists but we have no expectation for this combo
      // (e.g. a future intent we haven't catalogued). Flag it as a
      // recipe-vocabulary mismatch so the lint and the recipe stay
      // in lockstep.
      findings.push({
        file: COMPONENTS_CSS,
        line: block.openLine,
        selector: block.selector,
        detail:
          `No RECIPE entry for ${emphasis}.${intent}. Add an expectation ` +
          `to RECIPE in tools/lint-semantic-color-recipe.ts or remove ` +
          `the rule.`,
      });
      continue;
    }

    const actualBg = extractVar(block.body, 'background-color');
    const actualText = extractVar(block.body, 'color');
    seen.push({
      component,
      emphasis,
      intent,
      line: block.openLine,
      selector: block.selector,
      actualBg,
      actualText,
    });

    if (expected.bg !== null && actualBg !== expected.bg) {
      findings.push({
        file: COMPONENTS_CSS,
        line: block.openLine,
        selector: block.selector,
        detail:
          `bg expected var(${expected.bg}), got ` +
          (actualBg ? `var(${actualBg})` : '<missing or non-var>'),
      });
    }
    if (expected.text !== null && actualText !== expected.text) {
      findings.push({
        file: COMPONENTS_CSS,
        line: block.openLine,
        selector: block.selector,
        detail:
          `text expected var(${expected.text}), got ` +
          (actualText ? `var(${actualText})` : '<missing or non-var>'),
      });
    }
  }

  // Cross-check: every recipe entry must have a corresponding rule on
  // disk. Catches the inverse drift — someone deleted a CSS rule and
  // forgot to update the recipe (or shipped a new component variant
  // without filling in all five intents).
  for (const component of COMPONENTS) {
    for (const emphasis of SUPPORTED[component]) {
      for (const intent of INTENTS) {
        const expected = RECIPE[emphasis][intent];
        if (!expected) continue; // intentionally absent (e.g. count tertiary neutral)
        const hit = seen.find(
          (s) => s.component === component && s.emphasis === emphasis && s.intent === intent,
        );
        if (!hit) {
          findings.push({
            file: COMPONENTS_CSS,
            line: 0,
            selector: `.civ-${component}--${emphasis === 'dot' ? 'dot' : `style-${emphasis}`}.civ-${component}--${intent}`,
            detail:
              `No rule found for this selector. Either add the CSS rule ` +
              `or remove the RECIPE entry in ` +
              `tools/lint-semantic-color-recipe.ts.`,
          });
        }
      }
    }
  }

  // ── Pass 2: EXTENDED_SELECTORS static lookup ──────────────────
  // Index the parsed blocks by canonical-whitespace selector so the
  // O(rules × selectors) outer loop becomes O(rules + selectors).
  const blocksBySelector = new Map<string, Block>();
  for (const block of parseRules(css)) {
    const canon = block.selector.replace(/\s+/g, ' ').trim();
    // First occurrence wins — duplicate selector blocks are unusual
    // and the first-wins choice keeps the failure mode "your edit at
    // the canonical site drifted" rather than "the lint missed your
    // copy at the bottom of the file".
    if (!blocksBySelector.has(canon)) blocksBySelector.set(canon, block);
  }

  for (const entry of EXTENDED_SELECTORS) {
    const canon = entry.selector.replace(/\s+/g, ' ').trim();
    const block = blocksBySelector.get(canon);
    if (!block) {
      findings.push({
        file: COMPONENTS_CSS,
        line: 0,
        selector: entry.selector,
        detail:
          `No rule found for this selector. Either add the CSS rule ` +
          `or remove the entry from EXTENDED_SELECTORS in ` +
          `tools/lint-semantic-color-recipe.ts.`,
      });
      continue;
    }

    if (entry.bg && !bodyHasToken(block.body, 'bg', entry.bg)) {
      const actualVar = extractVar(block.body, 'background-color');
      findings.push({
        file: COMPONENTS_CSS,
        line: block.openLine,
        selector: entry.selector,
        detail:
          `bg expected civ-bg-${entry.bg} or var(--civ-color-${entry.bg}); ` +
          `got ${actualVar ? `var(${actualVar})` : '<missing or non-recipe form>'}`,
      });
    }
    if (entry.text && !bodyHasToken(block.body, 'text', entry.text)) {
      const actualVar = extractVar(block.body, 'color');
      findings.push({
        file: COMPONENTS_CSS,
        line: block.openLine,
        selector: entry.selector,
        detail:
          `text expected civ-text-${entry.text} or var(--civ-color-${entry.text}); ` +
          `got ${actualVar ? `var(${actualVar})` : '<missing or non-recipe form>'}`,
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ civ-badge + civ-count semantic-intent rules in components.css ` +
      `match the shared recipe across all ${COMPONENTS.length} components × ` +
      `${INTENTS.length} intents, and all ${EXTENDED_SELECTORS.length} ` +
      `static intent-tint selectors carry the expected shades.`,
    );
    return;
  }

  console.error(
    `✗ ${findings.length} semantic-color recipe violation(s):\n`,
  );
  for (const f of findings) {
    const rel = path.relative(REPO_ROOT, f.file);
    const loc = f.line > 0 ? `${rel}:${f.line}` : rel;
    console.error(`  ${loc}`);
    console.error(`    selector: ${f.selector}`);
    console.error(`    ${f.detail}`);
    console.error('');
  }
  console.error(
    'The recipe lives in RECIPE at the top of\n' +
    'tools/lint-semantic-color-recipe.ts. If the change is deliberate\n' +
    '(e.g. design team altered the secondary text shade), update both\n' +
    'the CSS and the RECIPE map in the same commit.',
  );
  printRuleLink('semantic-color-recipe');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
