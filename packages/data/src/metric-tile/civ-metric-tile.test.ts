import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-metric-tile.js';
import type { CivMetricTile } from './civ-metric-tile.js';

afterEach(cleanupFixtures);

describe('civ-metric-tile', () => {
  it('renders label and value', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Applications" value="1,234"></civ-metric-tile>
    `);
    expect(el.querySelector('.civ-metric-tile__label')?.textContent).toBe('Applications');
    expect(el.querySelector('.civ-metric-tile__value')?.textContent).toBe('1,234');
  });

  it('applies the shared civ-card chrome on its root container', async () => {
    // The metric tile composes civ-card's visual treatment via shared
    // CSS classes so every "flat surface" container in CivUI looks the
    // same. The root carries both .civ-metric-tile (internal layout)
    // and .civ-card .civ-card--tertiary (shared chrome).
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="X" value="1"></civ-metric-tile>
    `);
    const root = el.querySelector('.civ-metric-tile')!;
    expect(root.classList.contains('civ-card')).toBe(true);
    expect(root.classList.contains('civ-card--tertiary')).toBe(true);
  });

  it('omits the label header when only a value is set', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile value="42"></civ-metric-tile>
    `);
    expect(el.querySelector('.civ-metric-tile__label')).toBeNull();
    expect(el.querySelector('.civ-metric-tile__value')?.textContent).toBe('42');
  });

  it('renders the unit suffix when set', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Avg. response" value="230" unit="ms"></civ-metric-tile>
    `);
    expect(el.querySelector('.civ-metric-tile__unit')?.textContent).toBe('ms');
  });

  it('renders the icon when set', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile icon="check" label="Approved" value="47"></civ-metric-tile>
    `);
    const icon = el.querySelector('civ-icon.civ-metric-tile__icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('name')).toBe('check');
  });

  it('renders the delta with an up-arrow when trend is up', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Users" value="1,234" delta="+12%" trend="up" intent="positive"></civ-metric-tile>
    `);
    const delta = el.querySelector('.civ-metric-tile__delta');
    expect(delta?.classList.contains('civ-metric-tile__delta--positive')).toBe(true);
    expect(el.querySelector('.civ-metric-tile__delta-text')?.textContent).toBe('+12%');
    expect(el.querySelector('.civ-metric-tile__delta-icon')?.getAttribute('name')).toBe('arrow-up');
  });

  it('renders the delta with a down-arrow when trend is down', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Errors" value="47" delta="+8%" trend="down" intent="negative"></civ-metric-tile>
    `);
    const delta = el.querySelector('.civ-metric-tile__delta');
    expect(delta?.classList.contains('civ-metric-tile__delta--negative')).toBe(true);
    expect(el.querySelector('.civ-metric-tile__delta-icon')?.getAttribute('name')).toBe('arrow-down');
  });

  it('renders the delta with a minus icon when trend is flat', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Latency" value="230ms" delta="0%" trend="flat"></civ-metric-tile>
    `);
    expect(el.querySelector('.civ-metric-tile__delta-icon')?.getAttribute('name')).toBe('minus');
  });

  it('omits the delta section when no delta or trend is set', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Total" value="100"></civ-metric-tile>
    `);
    expect(el.querySelector('.civ-metric-tile__delta')).toBeNull();
  });

  it('renders the description when set', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="Users" value="1,234" description="vs. last 30 days"></civ-metric-tile>
    `);
    expect(el.querySelector('.civ-metric-tile__description')?.textContent).toBe(
      'vs. last 30 days',
    );
  });

  it('reflects trend and intent attributes to the host', async () => {
    const el = await fixture<CivMetricTile>(`
      <civ-metric-tile label="x" value="1"></civ-metric-tile>
    `);
    el.trend = 'up';
    el.intent = 'positive';
    await elementUpdated(el);
    expect(el.getAttribute('trend')).toBe('up');
    expect(el.getAttribute('intent')).toBe('positive');
  });
});
