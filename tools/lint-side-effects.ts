#!/usr/bin/env tsx
/**
 * lint-side-effects — guard the tree-shaking safety of component packages.
 *
 * Background
 * ----------
 * Every CivUI component registers its custom element via the
 * `@customElement('civ-…')` decorator, which calls
 * `customElements.define()` at module-evaluation time. That registration
 * is a SIDE EFFECT.
 *
 * The sub-path exports (`@civui/actions/button` →
 * `dist/button/index.js`) are thin re-export barrels — `export { CivButton }
 * from './civ-button.js'`. The registration lives one level down in
 * `civ-button.js`. A consumer who imports the sub-path purely for the
 * side effect (`import '@civui/actions/button'`) relies on the bundler
 * KEEPING that re-export chain even though nothing is used from it.
 *
 * That only works when the package's `sideEffects` field is truthy.
 * With `sideEffects: false`, a bundler (esbuild / Rollup / Webpack /
 * Vite) treats the re-export entry as pure, sees the export is unused,
 * and tree-shakes the entire chain away — the bundle drops from ~108 KB
 * to ~56 bytes and the custom element is NEVER registered. The
 * consumer's `<civ-button>` then silently renders as an unknown
 * element. (Verified empirically with esbuild during the bundle audit.)
 *
 * A `civ-*.js` GLOB does not work either: it marks the re-export
 * `index.js` entry itself as side-effect-free, so the unused re-export
 * is dropped before the glob-matched registration file is ever reached.
 * The only safe value is `true`.
 *
 * What it does
 * ------------
 * Asserts every component package (those that ship `@customElement`
 * registrations) declares `"sideEffects": true` in its package.json.
 * Pure-data / helper packages (tokens, schema, test-utils, content,
 * storybook-utils, cli, mcp-server) are intentionally NOT required to —
 * they have no element registrations and benefit from full
 * tree-shaking.
 *
 * Wired into `pnpm validate:lints` and the drift-lints CI gate.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

/**
 * Component packages that register custom elements and therefore MUST
 * declare `sideEffects: true`. Keep in sync with the workspace — a new
 * component package needs an entry here (and the field set).
 */
export const COMPONENT_PACKAGES = [
  'core',
  'actions',
  'inputs',
  'layout',
  'navigation',
  'overlays',
  'feedback',
  'compound',
  'form-patterns',
  'data',
];

export interface SideEffectsFinding {
  pkg: string;
  value: unknown;
  reason: 'missing' | 'not-true';
}

/** Pure check over a map of package name → parsed package.json. */
export function checkSideEffects(
  pkgJsons: Record<string, { sideEffects?: unknown }>,
): SideEffectsFinding[] {
  const findings: SideEffectsFinding[] = [];
  for (const pkg of COMPONENT_PACKAGES) {
    const json = pkgJsons[pkg];
    if (!json) continue;
    if (!('sideEffects' in json) || json.sideEffects === undefined) {
      findings.push({ pkg, value: undefined, reason: 'missing' });
    } else if (json.sideEffects !== true) {
      findings.push({ pkg, value: json.sideEffects, reason: 'not-true' });
    }
  }
  return findings;
}

async function main(): Promise<void> {
  const pkgJsons: Record<string, { sideEffects?: unknown }> = {};
  for (const pkg of COMPONENT_PACKAGES) {
    const p = path.join(REPO_ROOT, 'packages', pkg, 'package.json');
    pkgJsons[pkg] = JSON.parse(await fs.readFile(p, 'utf-8'));
  }

  const findings = checkSideEffects(pkgJsons);

  if (findings.length === 0) {
    console.log(
      `✓ all ${COMPONENT_PACKAGES.length} component packages declare ` +
      `"sideEffects": true (custom-element registrations are tree-shake safe).`,
    );
    return;
  }

  console.error(
    `✗ ${findings.length} component package(s) have an unsafe sideEffects setting:\n`,
  );
  for (const f of findings) {
    console.error(`  @civui/${f.pkg}/package.json`);
    if (f.reason === 'missing') {
      console.error('    sideEffects is not declared (defaults to true today,');
      console.error('    but the intent is undocumented and unprotected).');
    } else {
      console.error(`    sideEffects is ${JSON.stringify(f.value)} — must be true.`);
      console.error('    A `false` (or a civ-*.js glob) tree-shakes away the');
      console.error('    custom-element registration: <civ-*> silently fails to');
      console.error('    register. Only `true` keeps the re-export chain alive.');
    }
    console.error('');
  }
  console.error(
    'Set `"sideEffects": true` on each flagged package. See the docstring\n' +
    'at the top of tools/lint-side-effects.ts for the full rationale.',
  );
  process.exit(1);
}

// Only run when invoked directly, so the test can import the pure check.
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
