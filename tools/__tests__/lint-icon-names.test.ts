/**
 * Smoke test for tools/lint-icon-names.ts — the actual integration
 * lives in `pnpm lint:icon-names` which runs against the real repo.
 * This test just ensures the icon-library parsing doesn't regress
 * (it nearly missed quoted keys like `'check-circle': {` because
 * the original regex anchored on bare identifiers).
 */
import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const ICON_LIBRARY = path.join(REPO_ROOT, 'packages/core/src/icon/icon-library.ts');

describe('icon library parsing', () => {
  it('the lint\'s registered-icons regex finds at least 15 icons (sanity)', async () => {
    const src = await fs.readFile(ICON_LIBRARY, 'utf-8');
    const re = /^ {2}'?([a-z][a-z0-9-]*)'?:\s*\{$/gm;
    const names = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      if (['label', 'path', 'symbol', 'ios', 'android'].includes(m[1])) continue;
      names.add(m[1]);
    }
    expect(names.size).toBeGreaterThanOrEqual(15);
    // Spot-check a few known names — bare + quoted.
    expect(names.has('plus')).toBe(true);
    expect(names.has('chevron-down')).toBe(true);
    expect(names.has('check-circle')).toBe(true);
    expect(names.has('more-horiz')).toBe(true);
  });
});
