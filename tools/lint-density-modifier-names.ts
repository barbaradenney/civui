#!/usr/bin/env tsx
/**
 * lint-density-modifier-names — enforce the system-wide `--sm`
 * density-modifier naming convention.
 *
 * Background
 * ----------
 * Per `.claude/rules/density-convention.md`, the BEM modifier for a
 * single denser-than-default render is `--sm`. The audit that codified
 * the convention also cleared the historical drift (`--compact`,
 * `--slim`). This lint stops the next one from creeping back in.
 *
 * Forbidden modifier suffixes:
 *   --compact / --slim / --cozy / --tight / --small / --dense /
 *   --condensed / --mini / --tiny
 *
 * Allowed alternatives:
 *   --sm    — the canonical single dense step
 *   --xs    — only when a 3-step ladder is genuinely needed; document
 *             the second step in `density-convention.md` in the same PR
 *
 * What it does
 * ------------
 * Scans `packages/core/src/styles/components.css` for any CSS selector
 * containing a forbidden modifier suffix on a `civ-*` class. Each
 * finding prints the line, the offending selector token, and the
 * suggested replacement (`--sm`).
 *
 * ALLOWLIST below stays empty unless we explicitly accept a non-`--sm`
 * density step in code review — adding an entry is a deliberate signal
 * that we're departing from the convention for a documented reason.
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
 * Forbidden suffixes on a `civ-*` BEM modifier. Anchored so we only
 * match the full token (`--slim` matches but `--slim-extended` does
 * not — fine, the latter doesn't exist today).
 */
const FORBIDDEN = [
  'compact',
  'slim',
  'cozy',
  'tight',
  'small',
  'dense',
  'condensed',
  'mini',
  'tiny',
];

/**
 * Allowlist of explicitly-accepted offending tokens. Empty by design —
 * the convention is that every density step is `--sm` (or `--xs` for
 * the rare 3-step ladder). Add an entry only with a comment that
 * justifies the exception and points to the density-convention.md
 * section that documents the new contract.
 */
const ALLOWLIST: ReadonlyArray<{ selector: string; reason: string }> = [
  // none
];

interface Finding {
  line: number;
  selector: string;
  offending: string;
  excerpt: string;
}

async function main(): Promise<void> {
  const css = await fs.readFile(COMPONENTS_CSS, 'utf8');
  const lines = css.split('\n');

  // Compile one regex that captures the offending civ-*--{forbidden}
  // token wherever it appears in a selector. `\b` after the suffix
  // anchors against extra characters, so `--slim-extra` is not flagged.
  const pattern = new RegExp(
    `\\.civ-[a-z0-9-]+--(${FORBIDDEN.join('|')})\\b`,
    'g',
  );

  const findings: Finding[] = [];
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    // Only scan selector lines (those containing `{` open or
    // declarations between rules — selectors are above `{`). The
    // simplest signal: the line opens a rule (`{` at end) or is part
    // of a selector list (ends with `,`).
    if (!text.includes('.civ-')) continue;
    // Skip pure comment lines.
    if (text.trim().startsWith('/*') || text.trim().startsWith('//')) continue;

    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const offending = m[0]; // e.g. `.civ-table--compact`
      // Check allowlist (full selector substring match).
      const allowed = ALLOWLIST.some(
        (entry) => offending.includes(entry.selector),
      );
      if (allowed) continue;
      findings.push({
        line: i + 1,
        selector: offending,
        offending: m[1],
        excerpt: text.trim().slice(0, 120),
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `✓ components.css uses the --sm density-modifier convention. ` +
      `No forbidden suffixes (${FORBIDDEN.join(' / ')}) found.`,
    );
    return;
  }

  console.error(
    `✗ ${findings.length} forbidden density-modifier name(s) in components.css:\n`,
  );
  for (const f of findings) {
    const rel = path.relative(REPO_ROOT, COMPONENTS_CSS);
    console.error(`  ${rel}:${f.line}`);
    console.error(`    selector:    ${f.selector}`);
    console.error(`    suggestion:  ${f.selector.replace(`--${f.offending}`, '--sm')}`);
    console.error(`    ${f.excerpt}`);
    console.error('');
  }
  console.error(
    'The system-wide density-modifier convention is `--sm`. Rename the\n' +
    'CSS class and every consumer (templates, stories, docs, tests).\n' +
    'If a 3-step ladder is genuinely needed, `--xs` is the second step —\n' +
    'document the new ladder in `.claude/rules/density-convention.md` and\n' +
    'add an allowlist entry in `tools/lint-density-modifier-names.ts`.',
  );
  printRuleLink('density-modifier-names');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
