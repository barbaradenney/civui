#!/usr/bin/env tsx
/**
 * lint-safelist-stale — flag Tailwind safelist entries that protect
 * classes Tailwind doesn't actually generate.
 *
 * Background: CivUI safelists patterns like `/^civ-tag--/` under the
 * theory that Tailwind would purge dynamically-constructed utilities
 * (`civ-tag--${this.variant}`) without them. But every class in the
 * current safelist resolves to a *component* class defined in
 * `packages/core/src/styles/components.css` — not a Tailwind utility.
 * Tailwind doesn't manage or purge those, so the safelist entries
 * are no-ops. Tailwind itself logs `safelist pattern X doesn't
 * match any Tailwind CSS classes` warnings for them, but the
 * storybook build only treats those as warnings.
 *
 * This lint surfaces dead safelist entries as a hard failure so they
 * get pruned. An entry counts as live only if:
 *   - it is referenced in source as a template literal AND
 *   - the matching class is NOT already declared as a plain CSS rule
 *     in `packages/core/src/styles/*.css`.
 *
 * If both conditions fail, the entry doesn't help anyone and should
 * be deleted from the safelist.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

const CONFIG_FILES = [
  'tailwind.config.ts',
  'apps/civ-site/tailwind.config.ts',
];

interface SafelistEntry {
  configFile: string;
  raw: string;          // original source snippet
  /** For pattern entries, the literal prefix before any regex chars. */
  prefix: string;
  /** Full regex source as written. */
  regexSource: string | null;
  /** True if entry is a plain string literal. */
  isLiteral: boolean;
}

function parseSafelist(configSrc: string, configFile: string): SafelistEntry[] {
  const out: SafelistEntry[] = [];
  // Find `safelist: [ ... ],` block.
  const m = /safelist\s*:\s*\[([\s\S]*?)\]/m.exec(configSrc);
  if (!m) return out;
  const body = m[1];
  // Pattern entries: { pattern: /^civ-X/ }
  for (const pm of body.matchAll(/\{\s*pattern\s*:\s*\/([^/]+)\/\s*\}/g)) {
    const regexSource = pm[1];
    // Strip leading ^ and any trailing escapes to get the literal prefix.
    let prefix = regexSource.replace(/^\^/, '');
    // Stop at the first regex metachar.
    const meta = prefix.search(/[.\\*+?(){}\[\]|]/);
    if (meta >= 0) prefix = prefix.slice(0, meta);
    out.push({
      configFile,
      raw: pm[0],
      prefix,
      regexSource,
      isLiteral: false,
    });
  }
  // Bare string literals: 'civ-divider--sm', "civ-foo"
  for (const sm of body.matchAll(/['"]([^'"]+)['"]/g)) {
    out.push({
      configFile,
      raw: sm[0],
      prefix: sm[1],
      regexSource: null,
      isLiteral: true,
    });
  }
  return out;
}

async function walk(dir: string, exts: Set<string>): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      if (exts.has(path.extname(p)) && !p.includes('/dist/') && !p.includes('/node_modules/')) {
        out.push(p);
      }
      return;
    }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

function buildMatcher(entry: SafelistEntry): RegExp {
  if (entry.isLiteral) {
    // Match the literal class name as a word.
    const escaped = entry.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`);
  }
  // For pattern entries, look for the literal prefix anywhere a class
  // name could appear. The full regex semantics aren't important —
  // the safelist patterns are all `/^civ-X-/` style, so the literal
  // prefix is the only thing we need to find in source.
  const escaped = entry.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}`);
}

async function loadComponentCss(): Promise<string> {
  const cssDir = path.join(REPO_ROOT, 'packages/core/src/styles');
  const out: string[] = [];
  try {
    for (const name of await fs.readdir(cssDir)) {
      if (name.endsWith('.css')) {
        out.push(await fs.readFile(path.join(cssDir, name), 'utf8'));
      }
    }
  } catch {
    // styles dir missing → treat as empty
  }
  return out.join('\n');
}

interface StaleReason {
  entry: SafelistEntry;
  reasons: string[];
}

async function main(): Promise<void> {
  const entries: SafelistEntry[] = [];
  for (const rel of CONFIG_FILES) {
    const abs = path.join(REPO_ROOT, rel);
    try {
      const src = await fs.readFile(abs, 'utf8');
      entries.push(...parseSafelist(src, rel));
    } catch {
      // Config file may not exist in some checkouts; skip silently.
    }
  }

  if (entries.length === 0) {
    console.log('✓ no safelist entries found (lint-safelist-stale).');
    return;
  }

  const componentCss = await loadComponentCss();
  const files = await walk(path.join(REPO_ROOT, 'packages'), new Set(['.ts', '.css']));
  const sources: Array<{ file: string; src: string }> = [];
  for (const f of files) {
    if (f.endsWith('.test.ts')) continue;
    sources.push({ file: f, src: await fs.readFile(f, 'utf8') });
  }

  const stale: StaleReason[] = [];
  for (const entry of entries) {
    const reasons: string[] = [];

    // Reason 1: matching class is already declared as a plain CSS rule
    // in components.css/civ.css. Tailwind doesn't manage those, so the
    // safelist entry is a no-op.
    const cssClassRe = new RegExp(
      `\\.${entry.prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}[\\w-]*\\s*[\\{,:]`,
    );
    if (cssClassRe.test(componentCss)) {
      reasons.push('class defined as plain CSS in packages/core/src/styles — Tailwind does not manage it');
    }

    // Reason 2: no source file references the prefix at all.
    const matcher = buildMatcher(entry);
    let hit = false;
    for (const { src } of sources) {
      if (matcher.test(src)) { hit = true; break; }
    }
    if (!hit) {
      reasons.push('no source file references the prefix');
    }

    if (reasons.length > 0) stale.push({ entry, reasons });
  }

  if (stale.length === 0) {
    console.log(`✓ ${entries.length} safelist entr(ies) — all match real Tailwind utility usage.`);
    return;
  }

  const grouped = new Map<string, StaleReason[]>();
  for (const e of stale) {
    if (!grouped.has(e.entry.configFile)) grouped.set(e.entry.configFile, []);
    grouped.get(e.entry.configFile)!.push(e);
  }
  console.error(`✗ ${stale.length} stale safelist entr(ies) across ${grouped.size} config file(s):\n`);
  for (const [file, list] of grouped) {
    console.error(`  ${file}`);
    for (const { entry, reasons } of list) {
      const label = entry.isLiteral ? `'${entry.prefix}'` : `/${entry.regexSource}/`;
      console.error(`    ${label}`);
      for (const r of reasons) {
        console.error(`      - ${r}`);
      }
    }
    console.error('');
  }
  console.error(
    'Tailwind safelist entries protect dynamically-constructed CSS\n' +
    '*utilities* from JIT purging. They have no effect on plain CSS\n' +
    'rules in components.css/civ.css — those are not generated by\n' +
    'Tailwind and never purged.\n\n' +
    'For each flagged entry, either:\n' +
    '  - Delete the safelist entry (it is doing nothing today), or\n' +
    '  - If the class IS supposed to be a Tailwind utility, replace\n' +
    '    the plain-CSS definition with a Tailwind @apply / @layer\n' +
    '    utility rule so the safelist starts being meaningful.',
  );
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
