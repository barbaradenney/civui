import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-metric-group.js';
import '../metric-tile/civ-metric-tile.js';
import type { CivMetricGroup } from './civ-metric-group.js';

afterEach(cleanupFixtures);

describe('civ-metric-group', () => {
  it('relocates slotted tiles into the inner grid container', async () => {
    const el = await fixture<CivMetricGroup>(`
      <civ-metric-group>
        <civ-metric-tile label="A" value="1"></civ-metric-tile>
        <civ-metric-tile label="B" value="2"></civ-metric-tile>
        <civ-metric-tile label="C" value="3"></civ-metric-tile>
      </civ-metric-group>
    `);
    const inner = el.querySelector('.civ-metric-group')!;
    const tiles = el.querySelectorAll('civ-metric-tile');
    expect(tiles).toHaveLength(3);
    for (const tile of Array.from(tiles)) {
      expect(inner.contains(tile)).toBe(true);
    }
  });

  it('exposes the columns prop on the inner grid as a CSS custom property', async () => {
    const el = await fixture<CivMetricGroup>(`
      <civ-metric-group columns="3">
        <civ-metric-tile label="A" value="1"></civ-metric-tile>
      </civ-metric-group>
    `);
    const inner = el.querySelector<HTMLElement>('.civ-metric-group')!;
    expect(inner.style.getPropertyValue('--civ-metric-group-cols')).toBe('3');
  });

  it('defaults to 4 columns', async () => {
    const el = await fixture<CivMetricGroup>(`
      <civ-metric-group>
        <civ-metric-tile label="A" value="1"></civ-metric-tile>
      </civ-metric-group>
    `);
    const inner = el.querySelector<HTMLElement>('.civ-metric-group')!;
    expect(inner.style.getPropertyValue('--civ-metric-group-cols')).toBe('4');
  });

  it('clamps columns to the supported range (2-6)', async () => {
    const el = await fixture<CivMetricGroup>(`
      <civ-metric-group columns="12">
        <civ-metric-tile label="A" value="1"></civ-metric-tile>
      </civ-metric-group>
    `);
    let inner = el.querySelector<HTMLElement>('.civ-metric-group')!;
    expect(inner.style.getPropertyValue('--civ-metric-group-cols')).toBe('6');

    el.columns = 1;
    await elementUpdated(el);
    inner = el.querySelector<HTMLElement>('.civ-metric-group')!;
    expect(inner.style.getPropertyValue('--civ-metric-group-cols')).toBe('2');
  });
});
