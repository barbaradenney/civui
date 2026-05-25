#!/usr/bin/env tsx
/**
 * lint-hardcoded-spacing — enforce that
 * padding/margin/gap/font-size/line-height/width/height in
 * `packages/core/src/styles/components.css` use design-token
 * variables (so they respond to `[data-civ-scale="dense|spacious"]`),
 * unless the declaration is on a documented decorative-exception
 * class or carries a `/* not density: <reason> *\/` annotation.
 *
 * Background
 * ----------
 * Per `.claude/rules/density-convention.md`, the page-level scale
 * mechanism (`[data-civ-scale="dense|spacious"]` on a parent) works
 * by retuning `--civ-spacing-*` and `--civ-typography-fontSize-*`
 * tokens. Any padding / gap / font-size declaration that reads from
 * those tokens responds automatically — no per-component code
 * needed. Hardcoded `rem` / `px` values bypass the scale system and
 * produce visible drift inside dense admin surfaces.
 *
 * Decorative exceptions (hardcoded is fine):
 *   - WCAG SC 2.5.5 tap-target floors (44px, 40px, 32px)
 *   - Spinner / skeleton size ladders
 *   - Decorative thumbnail / avatar / signature-cursive dimensions
 *   - Scrollbar-thumb sizes
 *   - Viewport-relative dialog dimensions (vh/vw/dvh/dvw — these are
 *     intentional for overlays; the lint only flags `rem`/`px`)
 *
 * What it does
 * ------------
 * For every declaration in components.css that matches one of the
 * targeted property names and uses a `rem` or `px` literal:
 *
 *   1. PASS if the enclosing rule's selector targets an entry in
 *      `ALLOWLIST_CLASSES` below — the whole class is documented as
 *      decorative.
 *   2. PASS if the lines immediately preceding the declaration (in
 *      the same rule body, after the last blank line / non-comment
 *      stanza separator) contain a `/* not density: ... *\/` comment.
 *   3. PASS if the unit is `em` (font-relative, scales with parent
 *      `font-size` which is token-driven) or `%` (parent-relative).
 *   4. FAIL otherwise.
 *
 * Adding a new entry to ALLOWLIST_CLASSES documents that the class
 * is INTENTIONALLY scale-exempt. Adding a `/* not density: ... *\/`
 * comment in CSS documents a single-declaration exemption with its
 * specific reason. Both require deliberate edits that surface in
 * code review.
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
 * Allowlist of CSS class roots whose declarations may carry
 * hardcoded `rem` / `px` values for padding / margin / gap /
 * font-size / line-height / width / height. Each entry is matched
 * against the simple-class tokens parsed from a rule's selector.
 * A class with a `--<modifier>` suffix also passes when its BEM
 * root is listed (so `.civ-spinner--sm` passes via `civ-spinner`).
 *
 * Categories (kept loose so the rationale is greppable in the file):
 *
 *   1. Tap-target floors (WCAG SC 2.5.5 — 44 / 40 / 32 px minimums)
 *   2. Decorative size ladders (icons / spinners / skeletons / avatars)
 *   3. Timeline + process-list rail chrome (decorative dot/line/marker)
 *   4. Toggle / switch dimensions (visible track + WCAG hit area)
 *   5. Date / data-grid icon-button cells
 *   6. Popover / dialog viewport-anchored dimensions (vw/vh allowed,
 *      but min-width / max-width in rem is also intentional chrome)
 *   7. Signature / decorative-font surfaces
 *   8. Field-width utility ladder (consumer-facing sizing API)
 *   9. Mobile-bottom-sheet anchored overlays
 *  10. Visually-hidden screen-reader text (1px clip)
 *
 * If you find yourself adding a new entry that doesn't fit any of
 * the categories above, please first reach for a `var(--civ-spacing-*)`
 * token. If the dimension is genuinely placement-specific and not a
 * density step, add the entry AND a one-line comment explaining
 * the rationale.
 */
const ALLOWLIST_CLASSES: string[] = [
  // 1. Tap-target floors (WCAG SC 2.5.5 — must hold even under [data-civ-scale="dense"])
  'civ-action-btn',
  'civ-close-btn',
  'civ-file-retry-btn',
  'civ-back-to-top__button',
  'civ-chip__remove',
  'civ-datepicker-day',
  'civ-data-grid__expand-toggle',
  'civ-data-grid__td--expand',

  // 2. Decorative size ladders — icons / loading / placeholders
  'civ-icon',           // em-relative icon sizing
  'civ-spinner',        // discrete sm/md/lg ladder
  'civ-skeleton',       // text/heading/block/circle placeholder ladder
  'civ-badge',          // min-width floor for numeric badge pill
  'civ-badge--dot',     // 8px decorative dot
  'civ-dropzone--large', // file-upload large variant fixed height

  // 3. Timeline + process-list rail chrome (decorative dots / lines / markers)
  'civ-timeline-item__dot',
  'civ-timeline-item__dot-icon',
  'civ-timeline-item__rail',
  'civ-timeline-item__line',
  'civ-timeline-item__content',
  'civ-process-list-item__marker',
  'civ-process-list-item__marker-icon',
  'civ-process-list-item__rail',
  'civ-process-list-item__line',

  // 4. Toggle / switch dimensions (visible track + WCAG hit area floor)
  'civ-toggle-track',
  'civ-toggle-thumb',
  'civ-toggle-check',

  // 5. Date / data-grid icon-button cells — tap-target floors
  'civ-text-btn',         // em-relative inline button sizing
  'civ-input-icon',       // em-relative icon
  'civ-combobox-chevron', // em-relative icon
  'civ-link-card__icon',
  'civ-page-header__icon',
  'civ-card__icon',
  'civ-metric-tile__icon',
  'civ-metric-tile__delta-icon',
  'civ-error-text',

  // 6. Popover / dialog viewport-anchored dimensions
  'civ-modal',                       // dialog uses vw/vh (selector is `dialog.civ-modal`)
  'civ-drawer',                      // dialog uses vw/vh
  'civ-combobox-listbox',            // mobile dropdown max-height: 50vh/50dvh
  'civ-popover__panel',              // popover chrome min/max-width
  'civ-button-group__overflow-panel', // overflow panel chrome
  'civ-side-nav__trigger',           // tap-target padding
  'civ-side-nav__link',              // tap-target padding
  'civ-on-this-page__link',          // tap-target padding

  // 7. Signature / decorative-font surfaces
  'civ-signature-preview',
  'civ-signature-preview__cursive',
  'civ-signature-signed-at',

  // 8. Field-width utility ladder (consumer-facing sizing API). These
  //    are explicit width affordances — the consumer asks for
  //    "narrow / medium / wide" and the component honors it
  //    regardless of page density. Tokenizing these into a
  //    `--civ-field-width-*` family is tracked in audit-debt.
  'civ-field-width-xs',
  'civ-field-width-sm',
  'civ-field-width-md',
  'civ-field-width-lg',
  'civ-memorable-date__month',
  'civ-memorable-date__day',
  'civ-memorable-date__year',
  'civ-income__amount',
  'civ-income__frequency',
  'civ-time-picker__hour',
  'civ-time-picker__minute',
  'civ-time-picker__period',
  'civ-time-picker__time-input',
  'civ-file-item__unlock',

  // 8a. Input chrome offsets — the leading/trailing icon and trailing-
  //     action variants reserve a fixed inline padding to leave room
  //     for the icon/button affordance. The icon dimensions are
  //     decoratively-sized (em-relative against the input's font), so
  //     the gutter is a placement-specific chrome offset, not density.
  'civ-input-with-leading-icon',
  'civ-input-with-trailing-icon',
  'civ-input-with-trailing-action',
  'civ-input-with-trailing-reveal',
  'civ-datepicker-month-select',
  'civ-datepicker-year-select',
  'civ-side-nav__sublist',         // sublist indentation chrome

  // 8b. Fixed table-column widths — selection and per-row actions
  //     columns must size against their visual chrome (checkbox /
  //     kebab icon), not against the page-level scale. Otherwise
  //     dense-mode rows would crop the checkbox.
  'civ-data-grid__th--select',
  'civ-data-grid__th--actions',

  // 9. Border-width declarations matching `\bwidth\b` in property name
  //    (these are visual emphasis, not spatial density)
  'civ-fieldset',                 // [aria-invalid] left rail width
  'civ-tab-nav__link--current',   // bottom border-width
  'civ-alert--full-width',        // top/bottom border-width
  'civ-button-group--vertical',   // separator border-width
  'civ-progress-segment',         // progress bar height (decorative bar dim)
  'civ-progress-track',           // progress bar height
  'civ-progress-track--sm',       // sm variant height

  // 10. Visually-hidden screen-reader-only chrome (1px clip pattern)
  'civ-data-grid__thead',         // .civ-data-grid--stacked sr-only thead
  'civ-group-list',               // -1px border-collapse trick on tiles

  // 11. Accordion content padding — bespoke layout, documented in audit-debt
  'civ-accordion-item__content',

  // 12. Compositional callout variants
  'civ-callout',                  // [emphasis='secondary'] border width

  // 13. Read-more CSS custom property declaration
  'civ-read-more',

  // 14. Tab strip overlap trick — -2px margin-bottom slides the link
  //     under the strip's bottom border so the current-tab indicator
  //     can override it cleanly. Not a density value.
  'civ-tab',
  'civ-tab-nav__link',

  // 15. Alert collapsible — calc(1em + 0.5rem) chrome offset for
  //     the icon-aligned body indent
  'civ-alert--collapsible',

  // 16. Scrollbar dimensions (decorative thumb size)
  'civ-scroll-x',

  // 17. Image thumbnail size ladder — already annotated above for
  //     the per-size width rules; allowlist the host so the lint
  //     reaches the right verdict for the `img` descendant selector.
  'civ-image',
];

interface Block {
  openLine: number;
  selector: string;
  body: string[];
  bodyLines: number[];
}

interface Finding {
  selector: string;
  line: number;
  property: string;
  value: string;
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

/** Strip nested `{...}` content from a body string so inner declarations
 *  aren't attributed to the outer selector. Preserves newlines. */
function stripNestedBlocks(body: string): string {
  let depth = 0;
  let out = '';
  for (const ch of body) {
    if (ch === '{') { depth++; out += ' '; continue; }
    if (ch === '}') { depth = Math.max(0, depth - 1); out += ' '; continue; }
    if (depth > 0 && ch !== '\n') { out += ' '; continue; }
    out += ch;
  }
  return out;
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

/** Extract the tag-name portion of any compound that leads with one. */
function extractTags(selector: string): string[] {
  const tags: string[] = [];
  for (const part of selector.split(',')) {
    for (const compound of part.trim().split(/[\s>+~]+/)) {
      const m = compound.match(/^([a-z][a-z0-9-]*)/);
      if (m) tags.push(m[1]);
    }
  }
  return tags;
}

export function isClassAllowed(selector: string): boolean {
  const classes = extractClasses(selector);
  const tags = extractTags(selector);
  const allowSet = new Set(ALLOWLIST_CLASSES);

  // Direct class hit.
  for (const cls of classes) {
    if (allowSet.has(cls)) return true;
  }
  // Custom-element tag hit (allowlist doubles as tag list — `civ-foo`
  // entries match `<civ-foo>` selectors with no class).
  for (const tag of tags) {
    if (allowSet.has(tag)) return true;
  }
  // BEM `--modifier` of an allowed root.
  for (const cls of classes) {
    const dd = cls.indexOf('--');
    if (dd !== -1 && allowSet.has(cls.slice(0, dd))) return true;
  }
  return false;
}

/** Match a CSS property declaration with a hardcoded rem/px value.
 *  Returns the property name + value, or null if not a target. */
const TARGET_PROPS = [
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'padding-inline',
  'padding-inline-start',
  'padding-inline-end',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'margin-inline',
  'margin-inline-start',
  'margin-inline-end',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'gap',
  'row-gap',
  'column-gap',
  'font-size',
  'line-height',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
];
const PROP_RE = new RegExp(
  `^[ \\t]*(${TARGET_PROPS.join('|')})[ \\t]*:[ \\t]*([^;]+?)[ \\t]*(?:;|$)`,
  'i',
);
const REM_PX_LITERAL = /(?:^|[\s(,/])(-?\d+(?:\.\d+)?)(rem|px)\b/i;

/** Return { property, value } if the line is a target declaration with
 *  a `rem` / `px` literal in its value, AND not entirely token-based. */
export function parseHardcodedDecl(
  line: string,
): { property: string; value: string } | null {
  const m = line.match(PROP_RE);
  if (!m) return null;
  const value = m[2];
  // Token-driven values pass entirely, including `var(--token, 16px)`
  // patterns where the rem/px literal is only a defensive fallback.
  // The fallback never fires when the token resolves, which it always
  // does because tokens are built into civ.css.
  if (value.includes('var(')) return null;
  // Token-only values pass: must contain a `rem` / `px` literal that
  // is NOT inside a var() to be a real hit.
  if (!REM_PX_LITERAL.test(value)) return null;
  // 0 / 0px / 0rem are not real spatial values.
  if (/^\s*0(?:px|rem)?\s*$/.test(value)) return null;
  return { property: m[1].toLowerCase(), value: value.trim() };
}

/** Determine whether a declaration line is exempted by an upstream
 *  `/* not density: ... *\/` comment within the same rule body.
 *
 *  The comment applies to the contiguous stanza of declarations that
 *  follow it (until the next comment OR a blank line). We walk
 *  backwards from `declIdx` and:
 *    - skip declaration lines
 *    - skip in-comment continuation lines
 *    - if we hit a line containing `not density:` → exempt
 *    - if we hit a blank line → not exempt
 *    - if we hit a different (non-`not density:`) comment → not exempt
 */
export function isAnnotated(bodyLines: string[], declIdx: number): boolean {
  for (let j = declIdx; j >= 0; j--) {
    const line = bodyLines[j];
    if (j === declIdx) continue;
    if (line.includes('not density:')) return true;
    // Blank line breaks the stanza.
    if (line.trim() === '') return false;
    // A comment that's NOT a `not density` marker also breaks the stanza.
    // (Walk through multi-line comments — only the closing `*/` matters
    //  if the opening `/*` carried a different prefix.)
    if (line.includes('/*') && !line.includes('not density:')) {
      // Allow the closing line of a multi-line `not density:` block:
      // look ahead within the comment to see if any line contains
      // the marker.
      let foundMarker = false;
      for (let k = j; k <= declIdx; k++) {
        if (bodyLines[k].includes('not density:')) { foundMarker = true; break; }
        if (k > j && bodyLines[k].includes('/*')) break;
      }
      return foundMarker;
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

    const scanText = stripNestedBlocks(block.body.join('\n'));
    const scanLines = scanText.split('\n');

    for (let i = 0; i < scanLines.length; i++) {
      const lineText = scanLines[i];
      const lineNumber = block.bodyLines[i];
      const decl = parseHardcodedDecl(lineText);
      if (!decl) continue;
      if (isAnnotated(block.body, i)) continue;
      findings.push({
        selector: block.selector.replace(/\s+/g, ' ').trim().slice(0, 100),
        line: lineNumber,
        property: decl.property,
        value: decl.value,
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ every padding / margin / gap / font-size / width / height in ` +
      `components.css uses a design token, an allowlisted decorative class, ` +
      `or a /* not density: ... */ annotation.`,
    );
    return;
  }

  console.error(
    `✗ ${findings.length} hardcoded spacing / sizing declaration(s) in components.css:\n`,
  );
  for (const f of findings) {
    const rel = path.relative(REPO_ROOT, COMPONENTS_CSS);
    console.error(`  ${rel}:${f.line}`);
    console.error(`    selector: ${f.selector}`);
    console.error(`    ${f.property}: ${f.value}`);
    console.error('');
  }
  console.error(
    'Each violation must do ONE of:\n' +
    '  1. Use a design token: `var(--civ-spacing-N)` or a Tailwind\n' +
    '     `civ-{p,m,gap}-N` utility (the config maps these to tokens).\n' +
    '  2. Add the class root to ALLOWLIST_CLASSES in\n' +
    '     tools/lint-hardcoded-spacing.ts with a category comment\n' +
    '     explaining why the class is intentionally scale-exempt\n' +
    '     (tap-target floor, decorative ladder, viewport-anchored,\n' +
    '     etc.).\n' +
    '  3. Add a `/* not density: <reason> */` comment immediately\n' +
    '     above the declaration to exempt a single line. The comment\n' +
    '     applies to the contiguous stanza of declarations beneath it.',
  );
  printRuleLink('density-convention');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
