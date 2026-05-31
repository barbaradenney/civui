#!/usr/bin/env tsx
/**
 * lint-button-row — flag default `<civ-button>` clusters wrapped in a
 * plain `civ-flex` container instead of `.civ-button-row`.
 *
 * Why
 * ---
 * The default `<civ-button>` is the only button that goes full-width on
 * mobile (≤480px) — the CSS flips `civ-button { display: block }` +
 * `.civ-btn { width: 100% }` there for a comfortable tap target. But that
 * only takes effect when the button's host can actually stretch. Wrapping
 * one or more default buttons in `<div class="civ-flex civ-gap-*">` makes
 * each button a flex ITEM that only gets its intrinsic (content) width —
 * so the full-width-on-mobile flip is silently defeated. A single button
 * is left content-width; a pair shares the row at ~50% each.
 *
 * `.civ-button-row` is the design-system utility for exactly this: it
 * stacks the buttons full-width on mobile and lays them out as a row above
 * 480px. Use it for primary + secondary form-flow clusters (Submit /
 * Cancel, Save / Back, etc.) and for a lone form-submit button.
 *
 * Documented in `.claude/rules/common-traps.md` →
 * "`civ-flex civ-gap-*` button rows don't go full-width on mobile".
 *
 * What it flags (and what it deliberately does NOT)
 * -------------------------------------------------
 * FLAG: a `civ-flex` container that
 *   - is NOT already `.civ-button-row`,
 *   - is NOT a variant gallery (`civ-flex-wrap` — those intentionally show
 *     buttons side-by-side and must stay regular width),
 *   - is NOT already a vertical stack (`civ-flex-col` — those stack, but
 *     are layout sections, not button clusters; see note below),
 *   - directly holds one or more DEFAULT `<civ-button>` elements, AND
 *   - holds NO `<civ-action-button>` / `<civ-text-button>` /
 *     `<civ-button-group>` (those are toolbars / inline affordances that
 *     are SUPPOSED to keep their regular width — only the default blue
 *     button goes full-width).
 *
 * The default-button match uses an exact tag boundary (`<civ-button` +
 * whitespace or `>`), so `<civ-button-group>` and `<civ-action-button>`
 * never count as a default button.
 *
 * `flex-col` is excluded because those wrappers are almost always demo
 * section stacks (`civ-flex civ-flex-col civ-gap-N` holding `<div>`
 * sections), not button clusters — flagging them produced noise. A real
 * vertical button cluster should still use `.civ-button-row` (which stacks
 * on mobile anyway), but we don't force the issue here to keep the lint
 * false-positive-free.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const SCAN_ROOTS = ['packages', 'apps/docs/docs'];
const SCAN_EXTENSIONS = new Set(['.stories.ts', '.mdx', '.twig']);

export interface ButtonRowFinding {
  /** 1-based line of the offending `<div class="civ-flex …">` opener. */
  line: number;
  /** The offending class attribute value. */
  cls: string;
  /** How many default `<civ-button>` children it holds. */
  buttons: number;
}

/**
 * Scan a file's text for `civ-flex` containers that should be
 * `.civ-button-row`. Pure + exported for unit testing.
 */
export function scanContent(text: string): ButtonRowFinding[] {
  const findings: ButtonRowFinding[] = [];
  // Match a `<div … class="… civ-flex …">…</div>`. Non-greedy body; this
  // catches leaf flex containers (the ones directly wrapping buttons).
  // Nested flex layout containers are skipped via the `inner` guard below.
  const div = /<div\b[^>]*\bclass="([^"]*\bciv-flex\b[^"]*)"[^>]*>([\s\S]*?)<\/div>/g;
  for (const m of text.matchAll(div)) {
    const cls = m[1];
    const inner = m[2];

    // Already the right utility.
    if (/\bciv-button-row\b/.test(cls)) continue;
    // Variant gallery (side-by-side by design) or vertical section stack.
    if (/\bciv-flex-wrap\b/.test(cls) || /\bflex-wrap\b/.test(cls)) continue;
    if (/\bciv-flex-col\b/.test(cls) || /\bflex-col\b/.test(cls)) continue;
    // A nested flex div means this is a layout container, not a leaf
    // button cluster — the inner one is handled on its own iteration.
    if (/<div\b[^>]*\bclass="[^"]*\bciv-flex\b/.test(inner)) continue;

    // Count DEFAULT civ-button (exact tag boundary, so civ-button-group /
    // civ-action-button do NOT match).
    const buttons = (inner.match(/<civ-button[\s>]/g) ?? []).length;
    if (buttons === 0) continue;
    // Toolbars / inline affordances keep their regular width — exclude any
    // cluster that mixes in non-default button affordances.
    if (/<civ-action-button[\s>]|<civ-text-button[\s>]|<civ-button-group[\s>]/.test(inner)) continue;

    const line = text.slice(0, m.index ?? 0).split('\n').length;
    findings.push({ line, cls, buttons });
  }
  return findings;
}

async function walk(dir: string, out: string[]): Promise<void> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist') continue;
      await walk(full, out);
    } else if ([...SCAN_EXTENSIONS].some((ext) => e.name.endsWith(ext))) {
      out.push(full);
    }
  }
}

async function main(): Promise<void> {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) await walk(path.join(REPO_ROOT, root), files);

  let total = 0;
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    const findings = scanContent(text);
    if (findings.length === 0) continue;
    if (total === 0) {
      console.error('✗ default <civ-button> cluster(s) wrapped in civ-flex instead of .civ-button-row:\n');
    }
    const rel = path.relative(REPO_ROOT, file);
    for (const f of findings) {
      total++;
      console.error(`  ${rel}:${f.line}`);
      console.error(`    ${f.buttons} default civ-button in  class="${f.cls}"`);
      console.error(`    → wrap in <div class="civ-button-row">; it stacks full-width on mobile and rows above 480px.\n`);
    }
  }

  if (total === 0) {
    console.log('✓ no default civ-button clusters use a plain civ-flex wrapper — all use .civ-button-row or are variant galleries / toolbars.');
    return;
  }

  console.error(
    `Only the default <civ-button> goes full-width on mobile; a civ-flex\n` +
    `wrapper defeats that (each button gets only its content width). Action\n` +
    `buttons, text buttons, and filter chips keep their regular width and are\n` +
    `not flagged.`,
  );
  printRuleLink('button-row');
  process.exit(1);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
