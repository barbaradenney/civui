#!/usr/bin/env tsx
/**
 * lint-wcag-text-spacing — enforce that any `text-overflow` clipping
 * declaration in `packages/core/src/styles/components.css` is either
 * on an allowlisted class (truncation by design) OR carries a
 * `/* clip ok: <reason> *\/` annotation explaining why losing content
 * under WCAG SC 1.4.12 (Text Spacing) is acceptable at that location.
 *
 * Background
 * ----------
 * WCAG 2.1 SC 1.4.12 requires that users can override the following
 * without losing content:
 *
 *   - `line-height` to at least 1.5× the font-size
 *   - paragraph spacing to at least 2× the font-size
 *   - `letter-spacing` to at least 0.12× the font-size
 *   - `word-spacing` to at least 0.16× the font-size
 *
 * Under those overrides, text grows. CSS patterns that clip overflow
 * content can therefore hide content the user paid for. The two
 * highest-risk shapes:
 *
 *   1. `overflow: hidden` + `text-overflow: ellipsis` (intentional
 *      truncation — the design IS to clip)
 *   2. `overflow: hidden` + `white-space: nowrap` + a width constraint
 *      (single-line clip — same intent expressed differently)
 *
 * Other patterns (fixed `height: <px>`, `overflow: hidden` alone) are
 * either covered by the `lint-hardcoded-spacing` allowlist (which
 * already gates decorative dimensions) or are not text-bearing in
 * practice (icons, dots, spinners, skeletons, scrim, drawer containers).
 * The signal-to-noise is highest if we scope this lint narrowly to
 * `text-overflow`.
 *
 * What it does
 * ------------
 * Scans components.css for every `text-overflow: ellipsis|clip|<value>`
 * declaration:
 *
 *   1. PASS if the enclosing rule's selector targets an entry in
 *      `ALLOWLIST_CLASSES` below — the truncation is design-intentional
 *      AND the host component provides an accessible escape (a `title`
 *      attribute, `aria-label`, or expanded view).
 *   2. PASS if a `/* clip ok: <reason> *\/` comment appears immediately
 *      above the declaration (within the same rule body, no blank line
 *      between).
 *   3. FAIL otherwise — text-overflow clipping must be a deliberate
 *      choice with documented mitigation.
 *
 * Adding a new entry to ALLOWLIST_CLASSES documents that the host
 * component handles WCAG 1.4.12 mitigation in source (typically by
 * wiring a `title=` or `aria-label=` carrying the full content). A
 * `/* clip ok: ... *\/` annotation documents a single-declaration
 * exemption with its specific rationale. Both require deliberate
 * edits that show up in code review.
 *
 * What it does NOT cover
 * ----------------------
 * - Fixed `height: <px|rem>` on text-containing blocks. Caught by
 *   `lint-hardcoded-spacing` (which gates ALL hardcoded dimensions
 *   in components.css and requires either an allowlisted class or a
 *   `/* not density: <reason> *\/` annotation).
 * - `white-space: nowrap` on currency / amount cells. These are
 *   correct: numeric content shouldn't break mid-value. The
 *   surrounding container must grow horizontally — that's a layout
 *   concern, not a text-spacing concern.
 * - `overflow: hidden` on chip pill shapes. Used to clip inner
 *   element corners against the `border-radius: 9999px`; the chip
 *   itself is `inline-flex` and grows with its content.
 * - jsdom-based assertions of "no clipping under user overrides".
 *   jsdom doesn't run layout, so a runtime test can't measure
 *   actual visible clipping. The static lint is a strict
 *   over-approximation: it catches every pattern that COULD clip,
 *   requires documentation, and stays cheap.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const COMPONENTS_CSS = path.join(
  REPO_ROOT,
  'packages/core/src/styles/components.css',
);

/**
 * Allowlist of CSS class roots where `text-overflow` clipping is
 * design-intentional AND the host component provides an accessible
 * escape so the full content remains reachable under WCAG 1.4.12.
 *
 * Each entry must have a one-line comment naming the mitigation
 * (typically the source-level `title=` / `aria-label=` that exposes
 * the full text to assistive tech AND user-hover).
 */
const ALLOWLIST_CLASSES: string[] = [
  // Decorative cursive preview of the typed signature. The actual
  // signature value is stored in the form control's `value` (not the
  // preview node), and `<civ-signature>` renders it again in a non-
  // truncated form on submission review. The preview itself is purely
  // visual — clipping is acceptable because the data isn't lost.
  'civ-signature-preview__cursive',
];

interface Finding {
  selector: string;
  line: number;
  value: string;
}

interface Block {
  openLine: number;
  selector: string;
  body: string[];
  bodyLines: number[];
}

/** Parse top-level rule blocks. Skips comments and recursive @-rules. */
function* parseRules(css: string): Generator<Block> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const len = stripped.length;
  type Frame = { selectorStart: number; openLine: number; isAtRule: boolean; selector: string };
  const stack: Frame[] = [];
  let segStart = 0;

  const lineOf = (offset: number): number => {
    let n = 1;
    for (let j = 0; j < offset && j < len; j++) if (stripped[j] === '\n') n++;
    return n;
  };

  let i = 0;
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
      if (!frame) { i++; continue; }
      if (!frame.isAtRule && frame.selector) {
        const body = css.slice(frame.selectorStart, i);
        const bodyLines = body.split('\n');
        yield {
          openLine: frame.openLine,
          selector: frame.selector,
          body: bodyLines,
          bodyLines: bodyLines.map((_, idx) => frame.openLine + idx),
        };
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

/** Extract simple class tokens from a CSS selector list. */
export function extractClasses(selector: string): string[] {
  const classes: string[] = [];
  for (const part of selector.split(',')) {
    for (const compound of part.trim().split(/[\s>+~]+/)) {
      for (const m of compound.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) {
        classes.push(m[1]);
      }
    }
  }
  return classes;
}

export function isClassAllowed(selector: string): boolean {
  const classes = extractClasses(selector);
  const allowSet = new Set(ALLOWLIST_CLASSES);
  for (const cls of classes) {
    if (allowSet.has(cls)) return true;
    const dd = cls.indexOf('--');
    if (dd !== -1 && allowSet.has(cls.slice(0, dd))) return true;
  }
  return false;
}

const TEXT_OVERFLOW_RE = /^[ \t]*text-overflow[ \t]*:[ \t]*([^;]+?)[ \t]*(?:;|$)/i;

/** Returns the `text-overflow` value if the line declares one, else null. */
export function parseTextOverflowDecl(line: string): string | null {
  const m = line.match(TEXT_OVERFLOW_RE);
  if (!m) return null;
  return m[1].trim();
}

/** Walk backwards from `declIdx` looking for a `clip ok:` annotation
 *  in the contiguous stanza of preceding lines (until a blank line or
 *  a non-matching comment breaks the stanza). */
export function isAnnotated(bodyLines: string[], declIdx: number): boolean {
  for (let j = declIdx; j >= 0; j--) {
    if (j === declIdx) continue;
    const line = bodyLines[j];
    if (line.includes('clip ok:')) return true;
    if (line.trim() === '') return false;
    if (line.includes('/*') && !line.includes('clip ok:')) {
      // Look ahead within the comment to allow multi-line `clip ok:`
      // markers where the trigger phrase is on a line below the `/*`.
      for (let k = j; k <= declIdx; k++) {
        if (bodyLines[k].includes('clip ok:')) return true;
        if (k > j && bodyLines[k].includes('/*')) break;
      }
      return false;
    }
  }
  return false;
}

async function main(): Promise<void> {
  let css: string;
  try {
    css = await fs.readFile(COMPONENTS_CSS, 'utf8');
  } catch {
    throw new Error(`components.css not found at ${COMPONENTS_CSS}`);
  }

  const findings: Finding[] = [];

  for (const block of parseRules(css)) {
    if (isClassAllowed(block.selector)) continue;

    for (let i = 0; i < block.body.length; i++) {
      const lineText = block.body[i];
      const lineNumber = block.bodyLines[i];
      const value = parseTextOverflowDecl(lineText);
      if (value === null) continue;
      // `clip` and `ellipsis` are the truncation values. Other values
      // (`""`, `<string>`, `fade`) are also clipping by definition.
      // `unset` / `initial` / `inherit` would reset to default (clip);
      // we still flag those for explicitness.
      if (isAnnotated(block.body, i)) continue;
      findings.push({
        selector: block.selector.replace(/\s+/g, ' ').trim().slice(0, 100),
        line: lineNumber,
        value,
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ every text-overflow declaration in components.css is on an ` +
      `allowlisted class or carries a /* clip ok: <reason> */ annotation.`,
    );
    return;
  }

  console.error(
    `✗ ${findings.length} undocumented text-overflow clip(s) in components.css:\n`,
  );
  for (const f of findings) {
    const rel = path.relative(REPO_ROOT, COMPONENTS_CSS);
    console.error(`  ${rel}:${f.line}`);
    console.error(`    selector: ${f.selector}`);
    console.error(`    text-overflow: ${f.value}`);
    console.error('');
  }
  console.error(
    'WCAG SC 1.4.12 (Text Spacing) requires that text content remain\n' +
    'readable when users override line-height, letter-spacing, word-\n' +
    'spacing, and paragraph spacing. `text-overflow: ellipsis|clip`\n' +
    'hides content that grows past its container, violating that.\n\n' +
    'Each violation must do ONE of:\n' +
    '  1. Drop the clipping declaration and let the content wrap.\n' +
    '     This is the WCAG-compliant default — text grows to a second\n' +
    '     line under user-overrides instead of disappearing.\n' +
    '  2. Add the class root to ALLOWLIST_CLASSES in\n' +
    '     tools/lint-wcag-text-spacing.ts with a one-line comment\n' +
    '     explaining how the host component provides an accessible\n' +
    '     escape (typically a `title=` / `aria-label=` carrying the\n' +
    '     full text, or a non-truncated review surface elsewhere).\n' +
    '  3. Add a `/* clip ok: <reason> */` comment immediately above\n' +
    '     the declaration to exempt a single line. Reason should\n' +
    '     name the mitigation that preserves user access.',
  );
  printRuleLink('typography');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
