#!/usr/bin/env tsx
/**
 * lint-contrast — enforce WCAG contrast minimums on the blessed
 * color combinations defined in `packages/tokens/src/color.tokens.json`
 * and `color-dark.tokens.json`. Runs in both light and dark mode and
 * fails CI on regressions.
 *
 * Background
 * ----------
 * The audit in `.claude/rules/colors.md` measured contrast ratios
 * for every recipe combination + every common surface pairing. Most
 * pairs sit at AA (4.5:1) or AAA (7:1); two — `success-dark + white`
 * and `warning-dark + white` — sit just over AA at 4.59-4.63. Any
 * minor saturation drift in a future palette tune could push them
 * under. This lint surfaces the drift the moment it lands.
 *
 * What it does
 * ------------
 * 1. Loads both token JSONs.
 * 2. For each entry in `PAIRS`, resolves the bg and text token paths
 *    to hex values (separately for light + dark mode).
 * 3. Computes the WCAG 2.1 luminance contrast ratio.
 * 4. Fails if the ratio drops below `minRatio` in either mode.
 *
 * Threshold semantics
 * -------------------
 * `minRatio: 4.5` — WCAG SC 1.4.3 AA for normal-sized body text.
 * `minRatio: 3.0` — WCAG SC 1.4.11 non-text contrast OR SC 1.4.3 AA
 *                   for large text (≥18pt regular or ≥14pt bold).
 *                   Use for icon-only surfaces or large-display text.
 *
 * Adding a new pair
 * -----------------
 * When introducing a new component that bg/text-pairs two tokens:
 *   1. Add an entry to PAIRS with the expected minRatio.
 *   2. Run the lint. If it fails, the combination doesn't hit the
 *      threshold — either pick a darker text shade or shrink the
 *      saturation of the bg.
 *   3. If the lint fails on an existing pair, the palette tune broke
 *      WCAG. Fix the palette (don't lower the threshold).
 *
 * What it does NOT cover
 * ----------------------
 * - Author-applied class combinations on consumer markup (e.g. a
 *   developer writing `civ-bg-warning-light` + `civ-text-warning-DEFAULT`).
 *   That's a documentation + review concern; the lint catches the
 *   token-pair shape, not arbitrary author-choice.
 * - **Rendered cascade combinations.** When a child element sets an
 *   explicit `color` and an ancestor sets an explicit `background-
 *   color`, the lint does NOT walk the selector chain to discover
 *   the rendered pair. Example: `.civ-eyebrow { color: base-dark }`
 *   is fine on a white surface (passes), and `.civ-link-card--primary
 *   { background: primary-DEFAULT; color: white }` is fine in isolation
 *   (white-on-primary passes). The CASCADE — eyebrow rendered inside
 *   primary link-card — produces base-dark gray on primary blue at
 *   1.00:1 (invisible). The fix is to add an explicit PAIR for the
 *   rendered combination (see "Link-card variant rendered combinations"
 *   below) OR write a CSS-AST crawler that discovers them automatically.
 *   The pragmatic policy is: when a variant sets bg and a child element
 *   sets explicit color (not `inherit`), add the rendered pair here.
 * - Components that compose their own bg/text from non-token sources
 *   (none today — all CivUI components use tokens).
 * - Forced-colors mode (system-color override — measured by the OS,
 *   not by token ratio).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const LIGHT_TOKENS = path.join(REPO_ROOT, 'packages/tokens/src/color.tokens.json');
const DARK_TOKENS = path.join(REPO_ROOT, 'packages/tokens/src/color-dark.tokens.json');

/**
 * Blessed color pairs that MUST hit their contrast threshold in BOTH
 * light and dark mode. Token paths are dotted (e.g. `primary.dark`,
 * `tag.blue.bg`), resolved against the respective mode's JSON tree.
 *
 * Categories:
 *   1. Recipe — badge/count secondary (lightest bg + darkest/dark text;
 *      all five intents follow the uniform pattern as of the
 *      2026-05-28 error-ladder normalization)
 *   2. Recipe — badge/count primary (dark bg + white text)
 *   3. Recipe — count tertiary (transparent bg ≈ surface + dark text)
 *   4. Body text on surface
 *   5. Hint text on surface
 *   6. Link colors
 *   7. Status text colors (error, success-dark — NOT success-DEFAULT)
 *   8. Tag categorical pairs (8 pre-composed bg/text pairs)
 *
 * If you want to verify a pair that's intentionally below AA (the
 * `success-DEFAULT` non-text-only case), use `minRatio: 3.0` so the
 * lint still catches regressions without falsely flagging the
 * documented-decorative pair.
 */
interface ContrastPair {
  name: string;
  bg: string;
  text: string;
  /** AA for body (4.5) or AA-large/non-text (3.0). */
  minRatio: 4.5 | 3.0;
}

export const PAIRS: ContrastPair[] = [
  // 1. Recipe — secondary (lightest bg + dark text). All five intents
  //    follow the uniform pattern as of the 2026-05-28 error-ladder
  //    normalization.
  { name: 'badge/count secondary info',    bg: 'info.lightest',    text: 'info.dark',       minRatio: 4.5 },
  { name: 'badge/count secondary success', bg: 'success.lightest', text: 'success.darkest', minRatio: 4.5 },
  { name: 'badge/count secondary warning', bg: 'warning.lightest', text: 'warning.darkest', minRatio: 4.5 },
  { name: 'badge/count secondary error',   bg: 'error.lightest',   text: 'error.dark',      minRatio: 4.5 },
  { name: 'badge/count secondary neutral', bg: 'base.lightest',    text: 'base.darker',     minRatio: 4.5 },

  // 2. Recipe — primary (dark bg + white text)
  { name: 'badge/count primary info',     bg: 'info.dark',     text: 'white.DEFAULT', minRatio: 4.5 },
  { name: 'badge/count primary success',  bg: 'success.dark',  text: 'white.DEFAULT', minRatio: 4.5 },
  { name: 'badge/count primary warning',  bg: 'warning.dark',  text: 'white.DEFAULT', minRatio: 4.5 },
  { name: 'badge/count primary error',    bg: 'error.DEFAULT', text: 'white.DEFAULT', minRatio: 4.5 },
  { name: 'badge/count primary neutral',  bg: 'base.darker',   text: 'white.DEFAULT', minRatio: 4.5 },

  // 3. Recipe — count tertiary (text on surface)
  { name: 'count tertiary info on surface',    bg: 'white.DEFAULT', text: 'info.dark',    minRatio: 4.5 },
  { name: 'count tertiary success on surface', bg: 'white.DEFAULT', text: 'success.dark', minRatio: 4.5 },
  { name: 'count tertiary warning on surface', bg: 'white.DEFAULT', text: 'warning.dark', minRatio: 4.5 },
  { name: 'count tertiary error on surface',   bg: 'white.DEFAULT', text: 'error.dark',   minRatio: 4.5 },

  // 4. Body text on surface
  { name: 'body base-darkest on surface', bg: 'white.DEFAULT', text: 'base.darkest', minRatio: 4.5 },

  // 5. Hint text on surface
  { name: 'hint base-dark on surface', bg: 'white.DEFAULT', text: 'base.dark', minRatio: 4.5 },
  { name: 'hint base on surface',      bg: 'white.DEFAULT', text: 'base.DEFAULT', minRatio: 4.5 },

  // 6. Link colors
  { name: 'link primary on surface',      bg: 'white.DEFAULT', text: 'primary.DEFAULT', minRatio: 4.5 },
  { name: 'link primary-dark on surface', bg: 'white.DEFAULT', text: 'primary.dark',    minRatio: 4.5 },

  // 7. Status text colors (the AA-safe ones — civ-text-error, civ-text-success-dark)
  { name: 'civ-text-error on surface',         bg: 'white.DEFAULT', text: 'error.DEFAULT', minRatio: 4.5 },
  { name: 'civ-text-error-dark on surface',    bg: 'white.DEFAULT', text: 'error.dark',    minRatio: 4.5 },
  { name: 'civ-text-success-dark on surface',  bg: 'white.DEFAULT', text: 'success.dark',  minRatio: 4.5 },

  // 7b. `*-darkest` text shades on surface. Light-mode darkest variants
  //     are advertised by the token JSON `$description` as AAA / hero
  //     text colors — gate the claim at 7:1 so a future palette tune
  //     can't silently regress them to plain AA. (Dark-mode counterparts
  //     measured against base-darkest in section 11.)
  { name: 'civ-text-error-darkest on surface',   bg: 'white.DEFAULT', text: 'error.darkest',   minRatio: 7.0 },
  { name: 'civ-text-info-darkest on surface',    bg: 'white.DEFAULT', text: 'info.darkest',    minRatio: 7.0 },
  { name: 'civ-text-warning-darkest on surface', bg: 'white.DEFAULT', text: 'warning.darkest', minRatio: 4.5 },
  { name: 'civ-text-success-darkest on surface', bg: 'white.DEFAULT', text: 'success.darkest', minRatio: 4.5 },

  // 7c. The mid-tone `*-lighter` shades (introduced 2026-05-27 for
  //     warning/success/info, extended to error on 2026-05-28) fail
  //     AA when paired with the same family's `-dark` text
  //     (success-lighter + success-dark = 3.32, warning-lighter +
  //     warning-dark = 3.92). Document the safe pairing — `-lighter`
  //     bg pairs with `-darkest` text, not `-dark`. These pairs
  //     enforce that constraint.
  { name: 'success-lighter bg + success-darkest text', bg: 'success.lighter', text: 'success.darkest', minRatio: 4.5 },
  { name: 'warning-lighter bg + warning-darkest text', bg: 'warning.lighter', text: 'warning.darkest', minRatio: 4.5 },
  { name: 'info-lighter bg + info-darkest text',       bg: 'info.lighter',    text: 'info.darkest',    minRatio: 4.5 },
  { name: 'error-lighter bg + error-darkest text',     bg: 'error.lighter',   text: 'error.darkest',   minRatio: 4.5 },

  // 7d. error-lighter is also consumed in real CSS as the hover step
  //     in the danger-button gradient `lightest (rest) → lighter
  //     (hover) → light (active)`. The hover text color is
  //     `error-dark`, so this pair must also clear AA.
  { name: 'error-lighter bg + error-dark text (danger hover)', bg: 'error.lighter', text: 'error.dark', minRatio: 4.5 },

  // 8. Link-card variant rendered combinations — codify the bg + text
  //    pair the variant paints. The eyebrow + heading + description
  //    inside each variant inherit the variant's color, so these
  //    pairs ALSO guarantee the eyebrow renders legibly. (Originally
  //    motivated by the .civ-eyebrow + .civ-link-card--primary
  //    cascade bug: .civ-eyebrow set color: base-dark explicitly,
  //    rendering 1.00:1 on primary-DEFAULT.)
  { name: 'link-card primary bg/text',    bg: 'primary.DEFAULT',  text: 'white.DEFAULT',  minRatio: 4.5 },
  { name: 'link-card secondary bg/text',  bg: 'primary.lightest', text: 'primary.dark',   minRatio: 4.5 },
  { name: 'link-card tertiary bg/text',   bg: 'white.DEFAULT',    text: 'primary.dark',   minRatio: 4.5 },
  // link-card --critical is intentionally OFF this list. The variant
  // uses a literal #1b1b1b text color (not a token) because no token
  // stays dark in both modes for the warning-light surface — see the
  // CSS rule and audit-debt "Non-inverting dark-text token for
  // warning-light surfaces". If the literal is replaced with a token
  // in a future palette pass, add the rendered pair back here.
  { name: 'link-card danger bg/text',     bg: 'error.DEFAULT',    text: 'white.DEFAULT',  minRatio: 4.5 },

  // 9. Tag categorical pairs (8 colors)
  { name: 'tag blue (bg+text)',   bg: 'tag.blue.bg',   text: 'tag.blue.text',   minRatio: 4.5 },
  { name: 'tag teal (bg+text)',   bg: 'tag.teal.bg',   text: 'tag.teal.text',   minRatio: 4.5 },
  { name: 'tag red (bg+text)',    bg: 'tag.red.bg',    text: 'tag.red.text',    minRatio: 4.5 },
  { name: 'tag green (bg+text)',  bg: 'tag.green.bg',  text: 'tag.green.text',  minRatio: 4.5 },
  { name: 'tag yellow (bg+text)', bg: 'tag.yellow.bg', text: 'tag.yellow.text', minRatio: 4.5 },
  { name: 'tag orange (bg+text)', bg: 'tag.orange.bg', text: 'tag.orange.text', minRatio: 4.5 },
  { name: 'tag purple (bg+text)', bg: 'tag.purple.bg', text: 'tag.purple.text', minRatio: 4.5 },
  { name: 'tag gray (bg+text)',   bg: 'tag.gray.bg',   text: 'tag.gray.text',   minRatio: 4.5 },

  // Decorative — these are intentionally below AA body but above
  // non-text floor. The lint catches regressions if they drop below 3.0.
  { name: 'civ-text-success-DEFAULT on surface (icon/large only)',
    bg: 'white.DEFAULT', text: 'success.DEFAULT', minRatio: 3.0 },
];

/** Compute sRGB relative luminance per WCAG 2.1. */
export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`expected 6 or 8 hex chars, got: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const linearize = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Compute WCAG 2.1 contrast ratio between two hex colors. */
export function contrastRatio(hex1: string, hex2: string): number {
  const L1 = relativeLuminance(hex1);
  const L2 = relativeLuminance(hex2);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolve a dotted-path token reference against a token tree.
 *  e.g. `primary.dark` → look up `color.primary.dark.$value`. */
export function resolveToken(tokens: any, dottedPath: string): string {
  const segments = dottedPath.split('.');
  let cur: any = tokens.color;
  for (const seg of segments) {
    if (cur == null || typeof cur !== 'object') {
      throw new Error(`token path ${dottedPath} hit non-object at segment "${seg}"`);
    }
    cur = cur[seg];
  }
  if (cur == null || typeof cur !== 'object' || !('$value' in cur)) {
    throw new Error(`token path ${dottedPath} did not resolve to a leaf with $value`);
  }
  const val = cur.$value;
  if (typeof val !== 'string' || !val.startsWith('#')) {
    throw new Error(`token path ${dottedPath} resolved to non-hex value: ${val}`);
  }
  return val;
}

interface Failure {
  pair: string;
  mode: 'light' | 'dark';
  bg: string;
  text: string;
  ratio: number;
  minRatio: number;
}

export function evaluatePairs(
  lightTokens: any,
  darkTokens: any,
  pairs: ContrastPair[] = PAIRS,
): Failure[] {
  const failures: Failure[] = [];
  for (const pair of pairs) {
    for (const [mode, tokens] of [
      ['light', lightTokens] as const,
      ['dark', darkTokens] as const,
    ]) {
      let bgHex: string, textHex: string;
      try {
        bgHex = resolveToken(tokens, pair.bg);
        textHex = resolveToken(tokens, pair.text);
      } catch (e) {
        // Token resolution failure is treated as a pair failure with
        // synthetic 0:1 ratio so the error surfaces in CI output.
        failures.push({
          pair: pair.name,
          mode,
          bg: pair.bg,
          text: pair.text,
          ratio: 0,
          minRatio: pair.minRatio,
        });
        continue;
      }
      const r = contrastRatio(bgHex, textHex);
      if (r < pair.minRatio) {
        failures.push({
          pair: pair.name,
          mode,
          bg: `${pair.bg} (${bgHex})`,
          text: `${pair.text} (${textHex})`,
          ratio: r,
          minRatio: pair.minRatio,
        });
      }
    }
  }
  return failures;
}

async function main(): Promise<void> {
  const [lightRaw, darkRaw] = await Promise.all([
    fs.readFile(LIGHT_TOKENS, 'utf8'),
    fs.readFile(DARK_TOKENS, 'utf8'),
  ]);
  const lightTokens = JSON.parse(lightRaw);
  const darkTokens = JSON.parse(darkRaw);

  const failures = evaluatePairs(lightTokens, darkTokens);

  if (failures.length === 0) {
    console.log(
      `✓ ${PAIRS.length} contrast pair(s) × 2 modes — every combination ` +
      `hits its minRatio (4.5 body / 3.0 non-text).`,
    );
    return;
  }

  console.error(
    `✗ ${failures.length} contrast regression(s) across PAIRS (light + dark mode):\n`,
  );
  for (const f of failures) {
    console.error(`  ${f.pair} [${f.mode}]`);
    console.error(`    bg:    ${f.bg}`);
    console.error(`    text:  ${f.text}`);
    console.error(`    ratio: ${f.ratio.toFixed(2)} (need ≥ ${f.minRatio.toFixed(1)})`);
    console.error('');
  }
  console.error(
    'WCAG SC 1.4.3 (AA body text): 4.5:1. SC 1.4.11 (non-text contrast)\n' +
    'and SC 1.4.3 large text: 3.0:1.\n\n' +
    'A failure means either:\n' +
    '  1. A palette tune regressed an existing pair below its threshold.\n' +
    '     Pick a darker text shade or de-saturate the bg until the\n' +
    '     ratio clears.\n' +
    '  2. A new component is using a combination that doesn\'t meet\n' +
    '     contrast. Switch to a documented AA-safe shade (see the\n' +
    '     "Contrast & WCAG" section of .claude/rules/colors.md).\n\n' +
    'Do NOT lower the minRatio threshold to pass the lint — the\n' +
    'threshold IS the WCAG requirement.',
  );
  printRuleLink('contrast');
  process.exit(1);
}

// Only run when invoked directly (not when a sibling lint imports
// PAIRS / the helpers — e.g. lint-dark-recipe-contrast.ts).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
