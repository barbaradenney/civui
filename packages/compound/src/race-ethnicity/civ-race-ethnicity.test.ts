import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import { setLocaleStrings, resetLocaleStrings } from '@civui/core';
import './civ-race-ethnicity.js';
import type { CivRaceEthnicity } from './civ-race-ethnicity.js';

describe('civ-race-ethnicity', () => {
  afterEach(cleanupFixtures);

  it('renders ethnicity radio group and race checkbox group', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demographics" name="demo"></civ-race-ethnicity>');
    await elementUpdated(el);

    const radios = el.querySelectorAll('civ-radio');
    expect(radios.length).toBe(3);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    expect(checkboxes.length).toBe(6);
  });

  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-race-ethnicity legend="Race and ethnicity" name="demo"></civ-race-ethnicity>');

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Race and ethnicity');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-race-ethnicity') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders ethnicity options with correct labels', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
    await elementUpdated(el);

    const radios = el.querySelectorAll('civ-radio');
    const labels = Array.from(radios).map(r => r.getAttribute('label'));
    expect(labels).toContain('Hispanic or Latino');
    expect(labels).toContain('Not Hispanic or Latino');
    expect(labels).toContain('Prefer not to answer');
  });

  it('renders race options with correct labels', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
    await elementUpdated(el);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    const labels = Array.from(checkboxes).map(c => c.getAttribute('label'));
    expect(labels).toContain('American Indian or Alaska Native');
    expect(labels).toContain('Asian');
    expect(labels).toContain('Black or African American');
    expect(labels).toContain('White');
  });

  it('renders ethnicity radio group with correct name', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
    await elementUpdated(el);

    const radioGroup = el.querySelector('civ-radio-group');
    expect(radioGroup).not.toBeNull();
    expect(radioGroup!.getAttribute('name')).toContain('demo');
  });

  it('renders race checkbox group with correct name', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
    await elementUpdated(el);

    const checkboxGroup = el.querySelector('civ-checkbox-group');
    expect(checkboxGroup).not.toBeNull();
    expect(checkboxGroup!.getAttribute('name')).toContain('demo');
  });

  it('supports required prop', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo" required></civ-race-ethnicity>');
    await elementUpdated(el);

    expect(el.required).toBe(true);
  });

  it('supports disabled prop', async () => {
    const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo" disabled></civ-race-ethnicity>');
    await elementUpdated(el);

    expect(el.disabled).toBe(true);
  });

  it('passes ethnicity-error to radio group', async () => {
    const el = await fixture<CivRaceEthnicity>(
      '<civ-race-ethnicity legend="Demo" name="demo" ethnicity-error="Required"></civ-race-ethnicity>'
    );
    await elementUpdated(el);

    const radioGroup = el.querySelector('civ-radio-group');
    expect(radioGroup?.getAttribute('error')).toBe('Required');
  });

  it('passes race-error to checkbox group', async () => {
    const el = await fixture<CivRaceEthnicity>(
      '<civ-race-ethnicity legend="Demo" name="demo" race-error="Select at least one"></civ-race-ethnicity>'
    );
    await elementUpdated(el);

    const checkboxGroup = el.querySelector('civ-checkbox-group');
    expect(checkboxGroup?.getAttribute('error')).toBe('Select at least one');
  });

  it('renders custom ethnicity and race legends', async () => {
    const el = await fixture<CivRaceEthnicity>(
      '<civ-race-ethnicity legend="Demo" name="demo" ethnicity-legend="Ethnicity" race-legend="Race"></civ-race-ethnicity>'
    );
    await elementUpdated(el);

    const legends = el.querySelectorAll('legend');
    const texts = Array.from(legends).map(l => l.textContent?.trim());
    expect(texts).toContain('Ethnicity');
    expect(texts).toContain('Race');
  });

  it('renders Race section before Ethnicity section', async () => {
    const el = await fixture<CivRaceEthnicity>(
      '<civ-race-ethnicity legend="Demographics" name="demo"></civ-race-ethnicity>'
    );
    await elementUpdated(el);

    // The compound's outer legend is "Demographics"; sub-section legends
    // appear inside civ-checkbox-group (Race) and inside civ-radio-group
    // (Ethnicity), each of which renders its own self-contained fieldset.
    const allLegends = Array.from(el.querySelectorAll('legend')).map(
      (l) => l.textContent?.replace(/\(required\)/g, '').trim(),
    );
    const subLegends = allLegends.filter((t) => t !== 'Demographics');
    expect(subLegends[0]).toBe('Race');
    expect(subLegends[1]).toBe('Ethnicity');
  });

  it('forwards variant to inner radio and checkbox groups', async () => {
    const el = await fixture<CivRaceEthnicity>(
      '<civ-race-ethnicity legend="Demo" name="demo" layout="list"></civ-race-ethnicity>'
    );
    await elementUpdated(el);

    expect(el.querySelector('civ-checkbox-group')?.getAttribute('layout')).toBe('list');
    expect(el.querySelector('civ-radio-group')?.getAttribute('layout')).toBe('list');
  });

  describe('event handlers', () => {
    it('updates `value` and fires civ-input + civ-change when ethnicity changes', async () => {
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
      await elementUpdated(el);

      const inputs: any[] = [];
      const changes: any[] = [];
      el.addEventListener('civ-input', (e: any) => inputs.push(e.detail.value));
      el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

      const radioGroup = el.querySelector('civ-radio-group')!;
      radioGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'hispanic-latino' }, bubbles: true }));
      await elementUpdated(el);

      expect(JSON.parse(el.value).ethnicity).toBe('hispanic-latino');
      expect(inputs[0].ethnicity).toBe('hispanic-latino');
      expect(changes[0].ethnicity).toBe('hispanic-latino');
    });

    it('updates `value` on race civ-input (multi-select) but does not fire civ-change', async () => {
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
      await elementUpdated(el);

      const inputs: any[] = [];
      const changes: any[] = [];
      el.addEventListener('civ-input', (e: any) => inputs.push(e.detail.value));
      el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

      const checkboxGroup = el.querySelector('civ-checkbox-group')!;
      checkboxGroup.dispatchEvent(new CustomEvent('civ-input', { detail: { values: ['white', 'asian'] }, bubbles: true }));
      await elementUpdated(el);

      expect(JSON.parse(el.value).race).toEqual(['white', 'asian']);
      expect(inputs).toHaveLength(1);
      expect(changes).toHaveLength(0);
    });

    it('fires civ-change when race selection commits', async () => {
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
      await elementUpdated(el);

      const changes: any[] = [];
      el.addEventListener('civ-change', (e: any) => changes.push(e.detail.value));

      const checkboxGroup = el.querySelector('civ-checkbox-group')!;
      checkboxGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { values: ['black'] }, bubbles: true }));
      await elementUpdated(el);

      expect(changes).toHaveLength(1);
      expect(changes[0].race).toEqual(['black']);
    });

    it('formResetCallback restores empty data and clears errors', async () => {
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>') as any;
      el.value = JSON.stringify({ ethnicity: 'hispanic', race: ['white'] });
      el.ethnicityError = 'Required';
      el.raceError = 'Required';
      await elementUpdated(el);

      el.formResetCallback();
      await elementUpdated(el);

      expect(el._data.ethnicity).toBe('');
      expect(el._data.race).toEqual([]);
      expect(el.ethnicityError).toBe('');
      expect(el.raceError).toBe('');
    });

    it('willUpdate re-parses value when set externally', async () => {
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>') as any;
      el.value = JSON.stringify({ ethnicity: 'not-hispanic-latino', race: ['asian'] });
      await elementUpdated(el);

      expect(el._data.ethnicity).toBe('not-hispanic-latino');
      expect(el._data.race).toEqual(['asian']);
    });

    it('handles malformed JSON value (returns empty)', async () => {
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo" value="not-json"></civ-race-ethnicity>') as any;
      await elementUpdated(el);

      expect(el._data.ethnicity).toBe('');
      expect(el._data.race).toEqual([]);
    });
  });

  describe('i18n', () => {
    afterEach(() => resetLocaleStrings());

    it('translates the race/ethnicity legends, hint, and option labels via setLocaleStrings', async () => {
      setLocaleStrings({
        raceEthnicityRaceLegend: 'Raza',
        raceEthnicityEthnicityLegend: 'Origen étnico',
        raceEthnicityRaceHint: 'Seleccione una o más',
        raceOptionAsian: 'Asiático',
        presetEthnicityHispanicLatino: 'Hispano o latino',
      });

      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
      await elementUpdated(el);

      const groupLegends = Array.from(el.querySelectorAll('civ-checkbox-group, civ-radio-group'))
        .map((g) => g.getAttribute('legend'));
      expect(groupLegends).toContain('Raza');
      expect(groupLegends).toContain('Origen étnico');

      expect(el.querySelector('civ-checkbox-group')!.getAttribute('hint')).toBe('Seleccione una o más');

      const checkboxLabels = Array.from(el.querySelectorAll('civ-checkbox')).map((c) => c.getAttribute('label'));
      expect(checkboxLabels).toContain('Asiático');

      const radioLabels = Array.from(el.querySelectorAll('civ-radio')).map((r) => r.getAttribute('label'));
      expect(radioLabels).toContain('Hispano o latino');
    });

    it('keeps option VALUES stable when labels are translated (cross-platform contract)', async () => {
      setLocaleStrings({ raceOptionAsian: 'Asiático', presetEthnicityHispanicLatino: 'Hispano o latino' });
      const el = await fixture<CivRaceEthnicity>('<civ-race-ethnicity legend="Demo" name="demo"></civ-race-ethnicity>');
      await elementUpdated(el);

      const checkboxValues = Array.from(el.querySelectorAll('civ-checkbox')).map((c) => c.getAttribute('value'));
      expect(checkboxValues).toContain('asian');
      const radioValues = Array.from(el.querySelectorAll('civ-radio')).map((r) => r.getAttribute('value'));
      expect(radioValues).toContain('hispanic-latino');
    });
  });
});
