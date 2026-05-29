#!/usr/bin/env tsx
/**
 * lint-hardcoded-hex — fail on bare hex color literals in
 * `components.css` / `civ.css` that aren't a `var(--token, #fallback)`
 * defensive fallback.
 *
 * Why
 * ---
 * Every color in CivUI's rendered CSS should flow through a
 * `--civ-color-*` token so it participates in the palette, dark-mode
 * swap, and forced-colors handling. A bare `color: #1b1b1b;` bypasses
 * all of that. `.claude/rules/colors.md` → "Token hygiene — no
 * hardcoded hex" documents the discipline; this lint is the
 * forward-looking gate so a future paste-in doesn't slip past review.
 *
 * Acceptable hex
 * --------------
 *   1. `var(--civ-color-x, #fallback)` — the token resolves first; the
 *      hex is only a safety net for when the tokens CSS hasn't loaded.
 *      These are stripped before scanning, so the fallback hex is
 *      never flagged.
 *   2. A rule whose selector is on ALLOWLIST_CLASSES (a deliberate,
 *      documented literal). Currently empty — every color flows
 *      through a token.
 *   3. A declaration carrying a `/​* hex ok: <reason> *​/` annotation on
 *      its own line or the line immediately above.
 *
 * Everything else is a violation.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const FILES = [
  'packages/core/src/styles/components.css',
  'packages/core/src/styles/civ.css',
];

/**
 * Selectors permitted to use a literal hex. Matched as a substring of
 * the rule's selector, so `.civ-link-card--critical:hover` is covered
 * by the `civ-link-card--critical` entry.
 */
export const ALLOWLIST_CLASSES: ReadonlyArray<{ cls: string; reason: string }> = [
  // Currently empty: every color in components.css / civ.css flows
  // through a token. The former `civ-link-card--critical` entry was
  // retired once its literal #1b1b1b moved to the non-inverting
  // `warning-ink` token. Add a new entry only for a genuinely
  // unavoidable literal, with a one-line rationale.
];

/** Replace all chars of a match with spaces but keep newlines, so byte
 *  offsets and line numbers are preserved after stripping. */
function blankPreservingNewlines(s: string): string {
  return s.replace(/[^\n]/g, ' ');
}

/** Strip `/* … *​/` block comments, preserving offsets + line numbers. */
export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, blankPreservingNewlines);
}

/** Remove `var(… )` spans (one level of nesting), preserving offsets,
 *  so the fallback hex inside `var(--x, #fff)` is not scanned. */
export function stripVarSpans(s: string): string {
  let prev: string;
  do {
    prev = s;
    s = s.replace(/var\((?:[^()]|\([^()]*\))*\)/g, blankPreservingNewlines);
  } while (s !== prev);
  return s;
}

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

interface Block {
  selector: string;
  bodyStart: number; // offset into the stripped text
  body: string;
}

/** Yield leaf rule blocks (skips @-rule wrappers but descends into
 *  their nested rules). Adapted from lint-semantic-color-recipe.ts. */
function* parseRules(stripped: string): Generator<Block> {
  const len = stripped.length;
  let i = 0;
  type Frame = { selectorStart: number; isAtRule: boolean; selector: string };
  const stack: Frame[] = [];
  let segStart = 0;
  while (i < len) {
    const ch = stripped[i];
    if (ch === '{') {
      const rawSelector = stripped.slice(segStart, i).trim();
      stack.push({
        selectorStart: i + 1,
        isAtRule: rawSelector.startsWith('@'),
        selector: rawSelector,
      });
      segStart = i + 1;
      i++;
      continue;
    }
    if (ch === '}') {
      const frame = stack.pop();
      if (frame && !frame.isAtRule && frame.selector) {
        yield {
          selector: frame.selector,
          bodyStart: frame.selectorStart,
          body: stripped.slice(frame.selectorStart, i),
        };
      }
      segStart = i + 1;
      i++;
      continue;
    }
    if (ch === ';') { segStart = i + 1; i++; continue; }
    i++;
  }
}

export interface HexFinding {
  file: string;
  line: number;
  hex: string;
  selector: string;
}

function lineOf(text: string, offset: number): number {
  let n = 1;
  for (let j = 0; j < offset && j < text.length; j++) if (text[j] === '\n') n++;
  return n;
}

export function scanCss(
  css: string,
  file: string,
  allowlist: ReadonlyArray<{ cls: string; reason: string }> = ALLOWLIST_CLASSES,
): HexFinding[] {
  const findings: HexFinding[] = [];
  const stripped = stripComments(css);
  const scannable = stripVarSpans(stripped);
  const originalLines = css.split('\n');

  for (const block of parseRules(stripped)) {
    // Allowlisted selector?
    if (allowlist.some((a) => block.selector.includes(a.cls))) continue;

    // Re-derive the scannable (var-stripped) slice for this body.
    const bodyScannable = scannable.slice(block.bodyStart, block.bodyStart + block.body.length);
    let m: RegExpExecArray | null;
    HEX_RE.lastIndex = 0;
    while ((m = HEX_RE.exec(bodyScannable))) {
      const absOffset = block.bodyStart + m.index;
      const line = lineOf(stripped, absOffset);
      // Annotation escape hatch: `/* hex ok: … */` on this line or above.
      const here = originalLines[line - 1] ?? '';
      const above = originalLines[line - 2] ?? '';
      if (/hex ok/i.test(here) || /hex ok/i.test(above)) continue;
      findings.push({ file, line, hex: m[0], selector: block.selector });
    }
  }
  return findings;
}

async function main(): Promise<void> {
  const findings: HexFinding[] = [];
  for (const rel of FILES) {
    const css = await fs.readFile(path.join(REPO_ROOT, rel), 'utf8');
    findings.push(...scanCss(css, rel));
  }

  if (findings.length === 0) {
    console.log(`✓ no bare hex color literals in components.css / civ.css (outside var() fallbacks + allowlist).`);
    return;
  }

  console.error(`✗ ${findings.length} bare hex literal(s):\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.hex}`);
    console.error(`    selector: ${f.selector}`);
    console.error('');
  }
  console.error(
    'Color should flow through a --civ-color-* token, not a literal hex.\n' +
    'Four valid responses:\n' +
    '  1. Use a token: color: var(--civ-color-<family>-<shade>);\n' +
    '  2. Keep it as a defensive fallback: var(--civ-color-x, #fallback);\n' +
    '  3. Annotate a deliberate literal with /* hex ok: <reason> */;\n' +
    '  4. Add the selector to ALLOWLIST_CLASSES in tools/lint-hardcoded-hex.ts.',
  );
  printRuleLink('hardcoded-hex');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
