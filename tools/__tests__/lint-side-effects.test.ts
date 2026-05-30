/**
 * Tests for tools/lint-side-effects.ts.
 *
 * The lint asserts every component package declares `"sideEffects": true`
 * so a bundler can't tree-shake away the custom-element registration that
 * lives in the re-exported `civ-*.js` modules. These tests cover the pure
 * `checkSideEffects` decision over an in-memory map of package.json
 * objects, plus a guard that the real workspace packages comply.
 */
import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { checkSideEffects, COMPONENT_PACKAGES } from '../lint-side-effects.js';

function allTrue(): Record<string, { sideEffects?: unknown }> {
  return Object.fromEntries(COMPONENT_PACKAGES.map((p) => [p, { sideEffects: true }]));
}

describe('checkSideEffects', () => {
  it('passes when every component package declares sideEffects: true', () => {
    expect(checkSideEffects(allTrue())).toEqual([]);
  });

  it('flags a package missing the field', () => {
    const map = allTrue();
    delete map.actions.sideEffects;
    const findings = checkSideEffects(map);
    expect(findings).toEqual([{ pkg: 'actions', value: undefined, reason: 'missing' }]);
  });

  it('flags a package with sideEffects: false (the dangerous case)', () => {
    const map = allTrue();
    map.inputs.sideEffects = false;
    const findings = checkSideEffects(map);
    expect(findings).toEqual([{ pkg: 'inputs', value: false, reason: 'not-true' }]);
  });

  it('flags a civ-*.js glob — it does not protect the re-export entry', () => {
    const map = allTrue();
    map.overlays.sideEffects = ['**/civ-*.js'];
    const findings = checkSideEffects(map);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ pkg: 'overlays', reason: 'not-true' });
  });

  it('reports multiple offenders at once', () => {
    const map = allTrue();
    delete map.core.sideEffects;
    map.data.sideEffects = false;
    const pkgs = checkSideEffects(map).map((f) => f.pkg).sort();
    expect(pkgs).toEqual(['core', 'data']);
  });

  it('ignores packages not in the component list', () => {
    const map = allTrue();
    (map as Record<string, unknown>).tokens = { sideEffects: false }; // pure lib — not checked
    expect(checkSideEffects(map)).toEqual([]);
  });
});

describe('workspace compliance', () => {
  it('every real component package declares sideEffects: true', async () => {
    const repoRoot = path.resolve(import.meta.dirname, '..', '..');
    const map: Record<string, { sideEffects?: unknown }> = {};
    for (const pkg of COMPONENT_PACKAGES) {
      const p = path.join(repoRoot, 'packages', pkg, 'package.json');
      map[pkg] = JSON.parse(await fs.readFile(p, 'utf-8'));
    }
    expect(checkSideEffects(map)).toEqual([]);
  });
});
