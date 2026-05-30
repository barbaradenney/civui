#!/usr/bin/env tsx
/**
 * lint-option-value-parity — a component's hardcoded option-value
 * vocabulary must match across web (canonical) and its iOS / Android
 * counterparts.
 *
 * Why
 * ---
 * `pnpm parity:schema` checks prop *names*, `lint:schema-enum-values`
 * checks enum *prop* value sets against the Lit source, and
 * `lint:schema-default-values` checks default values — but none of them
 * look at the option-value vocabularies a component hardcodes (the
 * `value` strings behind a fixed radio/checkbox list). The 2026-05
 * civ-race-ethnicity audit found exactly this drift: web shipped
 * `hispanic-latino` / `not-hispanic-latino` while iOS shipped `hispanic`
 * / `not-hispanic` and a disambiguated `ethnicity-prefer-not` /
 * `race-prefer-not`, and Android matched neither fully. A form submitted
 * from each platform produced different stored values for the same
 * answer — a silent cross-platform data-integrity bug.
 *
 * What this lints
 * ---------------
 * For every component in the curated `OPTION_COMPONENTS` registry:
 *   - extract the canonical option values from the Lit source's inline
 *     `value: '...'` option-object literals (web is the source of truth
 *     per CLAUDE.md);
 *   - assert every canonical value appears as a quoted string literal in
 *     each native counterpart.
 *
 * Presence-check (canonical ⊆ native), not set-equality, because native
 * option vocabularies are expressed in platform-specific shapes that
 * vary by component — iOS positional tuples `("value", "label")`,
 * Android `CivRadioOption(value = "value", ...)`, etc. — so a uniform
 * structural parser would over-capture unrelated string literals
 * (`Text("Ethnicity")`, accessibility labels). A renamed/drifted value
 * still fails: the canonical value is absent from the native source.
 *
 * Registry scope: only components that HARDCODE an inline option array
 * with real native counterparts belong here. Components that resolve
 * options from the shared `@civui/core` preset registry, or whose native
 * counterparts are EmptyView stubs (no option arrays), are out of scope.
 * A registry entry assumes the web file's `value: '...'` string literals
 * are exclusively option values.
 *
 * Caught by: `pnpm lint:option-value-parity`. Wired into
 * `pnpm validate:lints` and the drift-lints CI gate.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

export interface OptionComponent {
  name: string;
  web: string;
  ios: string;
  android: string;
}

/**
 * Components whose hardcoded option-value vocabulary must stay in sync
 * across platforms. Add an entry when a component ships an inline
 * `value: '...'` option list with real (non-stub) native counterparts.
 */
export const OPTION_COMPONENTS: OptionComponent[] = [
  {
    name: 'civ-race-ethnicity',
    web: 'packages/compound/src/race-ethnicity/civ-race-ethnicity.ts',
    ios: 'packages/ios/Sources/CivUI/CivRaceEthnicity.swift',
    android: 'packages/android/src/main/kotlin/gov/civui/components/CivRaceEthnicity.kt',
  },
];

/**
 * Extract the canonical option values from a Lit source: every
 * `value: '...'` / `value: "..."` string literal, de-duplicated and in
 * first-seen order.
 */
export function extractWebOptionValues(src: string): string[] {
  const re = /value:\s*['"]([^'"]+)['"]/g;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Does the native source contain `value` as an exact quoted string
 * literal (`"value"` or `'value'`)? The surrounding quotes anchor the
 * match so `"asian"` doesn't match inside `"asian-american"`.
 */
export function nativeContainsValue(src: string, value: string): boolean {
  return new RegExp(`['"]${escapeRegExp(value)}['"]`).test(src);
}

/** Canonical values absent (as quoted literals) from the native source. */
export function missingFromNative(nativeSrc: string, canonical: string[]): string[] {
  return canonical.filter((v) => !nativeContainsValue(nativeSrc, v));
}

export interface Finding {
  component: string;
  platform: 'iOS' | 'Android';
  file: string;
  missing: string[];
}

export function collectFindings(components: OptionComponent[] = OPTION_COMPONENTS): {
  findings: Finding[];
  errors: string[];
} {
  const findings: Finding[] = [];
  const errors: string[] = [];

  for (const c of components) {
    const webPath = join(ROOT, c.web);
    if (!existsSync(webPath)) {
      errors.push(`${c.name}: web source not found at ${c.web}`);
      continue;
    }
    const canonical = extractWebOptionValues(readFileSync(webPath, 'utf-8'));
    if (canonical.length === 0) {
      errors.push(`${c.name}: no \`value: '...'\` option literals found in ${c.web} — misconfigured registry entry?`);
      continue;
    }

    for (const [platform, rel] of [['iOS', c.ios], ['Android', c.android]] as const) {
      const p = join(ROOT, rel);
      if (!existsSync(p)) {
        errors.push(`${c.name}: ${platform} source not found at ${rel}`);
        continue;
      }
      const missing = missingFromNative(readFileSync(p, 'utf-8'), canonical);
      if (missing.length > 0) {
        findings.push({ component: c.name, platform, file: rel, missing });
      }
    }
  }
  return { findings, errors };
}

function main(): void {
  const { findings, errors } = collectFindings();

  if (errors.length > 0) {
    console.error('✗ option-value-parity registry errors:\n');
    for (const e of errors) console.error(`  ${e}`);
    console.error('');
    process.exit(1);
  }

  if (findings.length === 0) {
    console.log(`✓ option values match across platforms for ${OPTION_COMPONENTS.length} component(s).`);
    return;
  }

  console.error(`✗ ${findings.length} option-value parity drift(s) detected.\n`);
  console.error('Why: a hardcoded option value that differs across platforms means');
  console.error('     the same answer is stored as a different string on web vs');
  console.error('     iOS / Android — a silent cross-platform data-integrity bug.\n');
  for (const f of findings) {
    console.error(`  ${f.component} (${f.platform}: ${f.file})`);
    console.error(`    missing canonical value(s): ${f.missing.map((v) => JSON.stringify(v)).join(', ')}\n`);
  }
  console.error('Fix: update the native option values to match the canonical web');
  console.error('     values (the Lit source is the contract reference).');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
