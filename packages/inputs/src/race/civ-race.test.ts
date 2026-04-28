import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-race.js';
import type { CivRace } from './civ-race.js';

describe('civ-race', () => {
  afterEach(cleanupFixtures);

  it('renders 6 OMB race checkboxes', async () => {
    const el = await fixture<CivRace>('<civ-race name="race"></civ-race>');
    await elementUpdated(el);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    expect(checkboxes.length).toBe(6);
  });

  it('includes all OMB categories', async () => {
    const el = await fixture<CivRace>('<civ-race name="race"></civ-race>');
    await elementUpdated(el);

    const values = Array.from(el.querySelectorAll('civ-checkbox')).map(
      (cb: any) => cb.value,
    );
    expect(values).toContain('american-indian-alaska-native');
    expect(values).toContain('asian');
    expect(values).toContain('black-african-american');
    expect(values).toContain('native-hawaiian-pacific-islander');
    expect(values).toContain('white');
    expect(values).toContain('prefer-not-to-answer');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-race') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-race name="race"></civ-race>');
    expect(el.shadowRoot).toBeNull();
  });
});
