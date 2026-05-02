import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
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
});
