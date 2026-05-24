#!/usr/bin/env tsx
/**
 * lint-border-radius — enforce the design rule "only interactive
 * elements get rounded corners."
 *
 * Background
 * ----------
 * Static surfaces in CivUI (cards, metric tiles, image thumbnails,
 * help-content panels) deliberately have flat corners. Rounded corners
 * are reserved for affordances the user can actuate (buttons, inputs,
 * links, controls) or transient surfaces that contain those affordances
 * (modal / drawer / action-sheet top corners, popover panels). Drift
 * away from that rule produces inconsistent visual chrome and trains
 * users to read "rounded" as a meaningless decoration rather than a
 * signal of interactivity.
 *
 * What it does
 * ------------
 * Scans packages/core/src/styles/components.css, finds every CSS rule
 * block that applies a non-zero border-radius (either via the
 * `border-radius:` declaration or via a Tailwind `civ-rounded[-*]`
 * utility in `@apply`), and verifies the selector's targeted class
 * appears in ALLOWLIST below.
 *
 * Adding a new entry to ALLOWLIST is a deliberate decision — it
 * documents that the class is INTENTIONALLY rounded. A failure means:
 *
 *   - The selector is genuinely interactive (button / input / link /
 *     control / popover panel / pill) — add it to ALLOWLIST.
 *   - The selector is a static container — remove the border-radius
 *     and consider composing <civ-card> or <civ-callout> instead of
 *     hand-rolling chrome (see .claude/rules/design-rules.md).
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
 * Allowlist of CSS class roots that may apply border-radius. Each entry
 * is matched against the simple-class tokens parsed from a rule's
 * selector list. A block passes if ANY allowed class appears in ANY of
 * the rule's selectors.
 *
 * Categories (kept loose so the rationale is greppable in the file):
 *
 *   1. Buttons + button-shaped controls
 *   2. Form inputs
 *   3. Selection controls (checkbox / radio / tile / toggle)
 *   4. Links
 *   5. Chips / pills / tags / badges (interactive AND display)
 *   6. Date-picker cells + nav buttons
 *   7. Popover / dropdown / overlay panels
 *   8. Loading / decorative shapes (spinner / skeleton)
 *   9. Input-group flush-border corner utilities
 *
 * Pills and badges are included even though some are display-only —
 * the user agreed these can keep rounded corners because the pill
 * shape IS their identity (it would look broken with square corners).
 * Static container-shaped surfaces (card / metric-tile / callout /
 * image preview / info block) are NOT on this list and MUST stay flat.
 */
const ALLOWLIST: string[] = [
  // 1. Buttons + button-shaped controls
  'civ-btn',
  'civ-btn--link',
  'civ-text-btn',
  'civ-icon-btn',
  'civ-close-btn',
  'civ-action-btn',
  'civ-confirm-btn',
  'civ-toggle-btn',
  'civ-back-to-top__button',
  'civ-pagination__page',
  'civ-pagination__nav',
  'civ-pagination__page-size-select',
  'civ-bulk-actions',
  'civ-bulk-actions__btn',
  'civ-column-visibility__btn',
  'civ-data-grid__expand-toggle',
  'civ-data-grid__edit-input',
  'civ-data-grid__sort-position', // pill numeric badge
  'civ-input-prefix',
  'civ-input-suffix',
  'civ-input-action',
  'civ-combobox-chevron',
  'civ-datepicker-cal-btn',
  'civ-segment-btn',
  'civ-dropzone',

  // 2. Form inputs
  'civ-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-currency-input__input',

  // 3. Selection controls
  'civ-check-input', // native input chrome
  'civ-radio-input',
  'civ-check-tile',
  'civ-toggle__track',
  'civ-toggle__thumb',
  'civ-toggle-track', // single-dash variant used in older switch markup
  'civ-toggle-thumb',
  'civ-segmented-control__option',

  // 4. Links + link-card
  'civ-link-card',
  'civ-skip-link',

  // 5. Chips / pills / tags / badges (rounded by identity)
  'civ-filter-chip',
  'civ-tag', // explicit `border-radius: 0` lines are still excluded by the parser
  'civ-badge',
  'civ-count',
  'civ-chip',

  // 6. Date-picker cells + nav buttons
  'civ-datepicker-day',
  'civ-datepicker-nav-btn',
  'civ-datepicker-month-select',
  'civ-datepicker-year-select',
  'civ-datepicker-today-btn',
  'civ-datepicker-clear-btn',

  // 7. Popover / dropdown / overlay panels (top corners, etc.)
  'civ-modal',
  'civ-action-sheet',
  'civ-drawer',
  'civ-bottom-sheet',
  'civ-popover',
  'civ-menu',
  'civ-combobox-listbox',
  'civ-datepicker-dialog',
  'civ-time-picker-dialog',
  'civ-tooltip',
  'civ-toast',
  'civ-popover__panel',

  // 8. Loading / decorative shapes
  'civ-spinner',
  'civ-skeleton',
  'civ-avatar',
  'civ-timeline-item__dot', // colored rail dot — decorative pill geometry
  'civ-process-list-item__marker', // numbered/check rail marker — decorative pill
  'civ-image__img', // <civ-image variant="thumbnail" rounded> consumer opt-in

  // 9. Input-group flush-border corner utilities
  'civ-input-group__addon',
  'civ-input-group__action',
  'civ-input-group__first',
  'civ-input-group__last',

  // 10. Tabs (interactive)
  'civ-tabs__tab',
  'civ-tab-nav__link',
  'civ-side-nav__link',
  'civ-on-this-page__link',
  'civ-breadcrumb__link',
  'civ-nav__link',
  'civ-disclosure__summary',
  'civ-accordion-item__summary',
  'civ-accordion-item__trigger', // clickable header
  'civ-menu-item',

  // 13. Native scrollbar pseudo-elements (the thumb is draggable)
  // The lint extracts classes only (not ::pseudo-elements), so we
  // whitelist the host class .civ-scroll-x.
  'civ-scroll-x',
  'civ-scroll-y',

  // 11. File-upload dropzone (clickable)
  'civ-file-upload-dropzone',
  'civ-file-preview-thumb-action', // remove-file action button

  // 12. Misc interactive small surfaces
  'civ-data-grid__sort-btn',
  'civ-data-grid__action-btn',
  'civ-data-grid__action-menu',
  'civ-data-grid__sort-priority',
  'civ-data-grid__bulk-actions-btn',

  // 14. Accordion variants — these are DELIBERATE styling exceptions.
  // Tertiary frames the whole accordion as one card; secondary frames
  // each item as its own card; primary's open-state content panel
  // completes the trigger's button-like rounded shape (the trigger
  // squares its bottom, the content takes the rounded bottom). If we
  // decide to apply the rule strictly to accordion, remove these and
  // accept that the card-styled variants lose their identity.
  'civ-accordion__inner--tertiary',
  'civ-accordion-item', // for `.civ-accordion__inner--secondary > civ-accordion-item`
  'civ-accordion-item__content', // open-state visual extension of the trigger
];

interface Block {
  /** 1-indexed line where the rule block opens (the `{`). */
  openLine: number;
  /** Raw selector text (everything between previous `}` and the `{`). */
  selector: string;
  /** Body lines collected between `{` and the matching `}`. */
  body: string[];
  /** Line numbers (1-indexed) corresponding to body[]. */
  bodyLines: number[];
}

interface Finding {
  selector: string;
  line: number;
  reason: string;
  excerpt: string;
}

/**
 * Tokenize a CSS file into top-level rule blocks. Skips `/* … *\/`
 * comments and ignores `@layer { … }` / `@media { … }` wrappers — we
 * recurse into those rather than treating them as rules.
 *
 * This is not a full CSS parser; it relies on the fact that
 * components.css uses balanced braces and doesn't contain
 * brace-bearing string literals or url() with unbalanced parens.
 */
function* parseRules(css: string): Generator<Block> {
  const lines = css.split('\n');
  // Strip block comments first so braces inside them don't fool us.
  // Track original line numbers via per-character index.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, ' '),
  );

  const len = stripped.length;
  let i = 0;
  // Stack of selectors currently nested above us. We yield the
  // INNERMOST rule for each balanced brace pair that's not an `@`-rule
  // wrapper (@layer, @media, @supports). Inner rules get the deepest
  // selector context; the lint only cares about the actual rule's
  // selector, not the layer name.
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
        const body = css.slice(frame.selectorStart, i);
        const bodyLines = body.split('\n');
        const startLine = frame.openLine;
        yield {
          openLine: startLine,
          selector: frame.selector,
          body: bodyLines,
          bodyLines: bodyLines.map((_, idx) => startLine + idx),
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

/** Return true if the line applies a non-zero border-radius. */
export function appliesRadius(line: string): { yes: boolean; via?: string } {
  // Explicit declaration: border-radius / border-*-radius / border-top-left-radius etc.
  const declMatch = line.match(/\bborder(?:-[a-z-]+)?-radius\s*:\s*([^;]+)/i);
  if (declMatch) {
    const value = declMatch[1].trim().toLowerCase();
    // Keyword resets.
    if (value === 'none' || value === 'unset' || value === 'initial' || value === 'inherit') {
      return { yes: false };
    }
    // Numeric resets — handles both single-value `0` / `0px` / `0%`
    // and the multi-value shorthand `0 0 0 0` (and any subset).
    // Splits on whitespace and checks that every token parses as
    // explicit zero with optional `px` or `%` suffix.
    const tokens = value.split(/\s+/).filter(Boolean);
    if (tokens.length > 0 && tokens.every((t) => /^0(?:px|%)?$/.test(t))) {
      return { yes: false };
    }
    return { yes: true, via: 'border-radius' };
  }
  // Tailwind utility inside @apply: civ-rounded / civ-rounded-* / civ-rounded-s / civ-rounded-e etc.
  // Exclude `civ-rounded-none` and `civ-rounded-0`.
  const tailwindMatch = line.match(/\bciv-rounded(?:-[a-z0-9]+)*\b/);
  if (tailwindMatch) {
    const token = tailwindMatch[0];
    if (token === 'civ-rounded-none' || token === 'civ-rounded-0') return { yes: false };
    return { yes: true, via: token };
  }
  return { yes: false };
}

/**
 * Blank out the contents of nested `{...}` blocks, preserving newlines
 * so line-number alignment is unaffected. Used when scanning an outer
 * rule's body so a native-CSS-nested inner rule's `border-radius:`
 * declaration isn't double-attributed to the outer selector. Today
 * components.css doesn't use native nesting, but the lint is built
 * to handle it the moment someone adopts the feature.
 */
export function stripNestedBlocks(body: string): string {
  let depth = 0;
  let out = '';
  for (const ch of body) {
    if (ch === '{') { depth++; out += ' '; continue; }
    if (ch === '}') { depth--; out += ' '; continue; }
    if (depth === 0) { out += ch; continue; }
    // Inside a nested block — preserve newlines for line-number
    // alignment, replace other characters with spaces.
    out += ch === '\n' ? '\n' : ' ';
  }
  return out;
}

/** Extract every class name (without the leading dot) and every tag
 *  selector from a selector list. Walks descendant / child / sibling
 *  combinators so a selector like `.foo civ-action-button button`
 *  surfaces both `civ-action-button` and `button` as tags, not just
 *  the leading simple selector. */
export function extractSimpleTokens(selector: string): { classes: string[]; tags: string[] } {
  const classes: string[] = [];
  const tags: string[] = [];
  for (const part of selector.split(',')) {
    // Split on whitespace AND combinators so each "compound" piece is
    // examined separately. Brackets and pseudos stay attached to their
    // compound (`a[href]:hover` remains one token).
    for (const compound of part.trim().split(/[\s>+~]+/)) {
      if (!compound) continue;
      // Pull class tokens.
      for (const m of compound.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) {
        classes.push(m[1]);
      }
      // Pull leading tag token of this compound (before any . [ : etc.).
      const tagMatch = compound.match(/^([a-z][a-z0-9-]*)/);
      if (tagMatch) tags.push(tagMatch[1]);
    }
  }
  return { classes, tags };
}

/** Native HTML interactive tags that may have border-radius applied
 *  via a tag-only selector. */
const INTERACTIVE_TAGS = new Set([
  'button',
  'input',
  'textarea',
  'select',
  'summary',
  'a',
]);

export function isAllowed(selector: string): boolean {
  const { classes, tags } = extractSimpleTokens(selector);
  const allowSet = new Set(ALLOWLIST);

  // 1. Any selector targeting a native interactive tag passes.
  for (const tag of tags) {
    if (INTERACTIVE_TAGS.has(tag)) return true;
  }

  // 2. Any class OR custom-element tag matching the allowlist passes.
  // Custom-element names look like `civ-foo`; we let the allowlist
  // double as the tag-name allowlist so accordion-item etc. can be
  // referenced without separately maintaining a tag list.
  for (const cls of classes) {
    if (allowSet.has(cls)) return true;
  }
  for (const tag of tags) {
    if (allowSet.has(tag)) return true;
  }

  // 3. Class with a `--` modifier of an allowed root passes (BEM modifiers).
  for (const cls of classes) {
    const dashDash = cls.indexOf('--');
    if (dashDash !== -1) {
      const root = cls.slice(0, dashDash);
      if (allowSet.has(root)) return true;
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
    if (isAllowed(block.selector)) continue;

    // Strip the contents of any nested `{...}` blocks (native CSS
    // nesting) so we don't double-attribute an inner declaration to
    // the outer selector. Newlines are preserved so line numbers
    // still align with `block.bodyLines`.
    const scanText = stripNestedBlocks(block.body.join('\n'));
    const scanLines = scanText.split('\n');

    for (let i = 0; i < scanLines.length; i++) {
      const lineText = scanLines[i];
      const lineNumber = block.bodyLines[i];
      const verdict = appliesRadius(lineText);
      if (!verdict.yes) continue;
      findings.push({
        selector: block.selector.replace(/\s+/g, ' ').trim().slice(0, 100),
        line: lineNumber,
        reason: verdict.via!,
        excerpt: lineText.trim().slice(0, 120),
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ every border-radius / civ-rounded use in components.css applies to ` +
      `an allowed interactive / popover / pill class.`,
    );
    return;
  }

  console.error(
    `✗ ${findings.length} border-radius use(s) outside the allowlist:\n`,
  );
  for (const f of findings) {
    const rel = path.relative(REPO_ROOT, COMPONENTS_CSS);
    console.error(`  ${rel}:${f.line}`);
    console.error(`    selector: ${f.selector}`);
    console.error(`    via:      ${f.reason}`);
    console.error(`    ${f.excerpt}`);
    console.error('');
  }
  console.error(
    'If the selector targets an interactive element (button / input /\n' +
    'link / control / popover / pill), add its class root to ALLOWLIST in\n' +
    `tools/lint-border-radius.ts.\n\n` +
    'If the selector is a static container, remove the border-radius —\n' +
    'consider composing <civ-card> or <civ-callout> instead of hand-rolling\n' +
    'chrome (see .claude/rules/design-rules.md).',
  );
  printRuleLink('border-radius');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
