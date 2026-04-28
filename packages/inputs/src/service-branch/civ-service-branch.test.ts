import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-service-branch.js';
import type { CivServiceBranch } from './civ-service-branch.js';

describe('civ-service-branch', () => {
  afterEach(cleanupFixtures);

  it('renders with 6 active branches by default', async () => {
    const el = await fixture<CivServiceBranch>('<civ-service-branch name="branch"></civ-service-branch>');
    await elementUpdated(el);

    const select = el.querySelector('[data-service-branch-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(6);
    expect(select.options[0].value).toBe('army');
    expect(select.options[5].value).toBe('space-force');
  });

  it('includes reserve and guard with show-reserve', async () => {
    const el = await fixture<CivServiceBranch>('<civ-service-branch name="branch" show-reserve></civ-service-branch>');
    await elementUpdated(el);

    const select = el.querySelector('[data-service-branch-select]') as any;
    expect(select.options.length).toBe(13); // 6 active + 7 reserve/guard
    const values = select.options.map((o: any) => o.value);
    expect(values).toContain('army-reserve');
    expect(values).toContain('army-national-guard');
    expect(values).toContain('air-national-guard');
  });

  it('includes historical branches with show-historical', async () => {
    const el = await fixture<CivServiceBranch>('<civ-service-branch name="branch" show-historical></civ-service-branch>');
    await elementUpdated(el);

    const select = el.querySelector('[data-service-branch-select]') as any;
    expect(select.options.length).toBe(11); // 6 active + 5 historical
    const values = select.options.map((o: any) => o.value);
    expect(values).toContain('army-air-corps');
    expect(values).toContain('noaa');
    expect(values).toContain('usphs');
  });

  it('includes all tiers when both flags are set', async () => {
    const el = await fixture<CivServiceBranch>('<civ-service-branch name="branch" show-reserve show-historical></civ-service-branch>');
    await elementUpdated(el);

    const select = el.querySelector('[data-service-branch-select]') as any;
    expect(select.options.length).toBe(18); // 6 + 7 + 5
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-service-branch') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-service-branch name="branch"></civ-service-branch>');
    expect(el.shadowRoot).toBeNull();
  });
});
