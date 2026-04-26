import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-country.js';
import type { CivCountry } from './civ-country.js';

describe('civ-country', () => {
  afterEach(cleanupFixtures);

  it('renders with default label', async () => {
    const el = await fixture('<civ-country name="country"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox') as any;
    expect(combobox.getAttribute('label')).toBe('Country');
  });

  it('pins United States first by default', async () => {
    const el = await fixture('<civ-country name="country"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox') as any;
    expect(combobox.options[0].value).toBe('US');
    expect(combobox.options[0].label).toBe('United States');
  });

  it('does not pin US when us-first is false', async () => {
    const el = await fixture('<civ-country name="country"></civ-country>') as CivCountry;
    el.usFirst = false;
    await elementUpdated(el);
    const combobox = el.querySelector('civ-combobox') as any;
    // US should be in alphabetical position (after "U" countries), not first
    expect(combobox.options[0].value).toBe('AF');
  });

  it('includes all 195 countries by default', async () => {
    const el = await fixture('<civ-country name="country"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox') as any;
    expect(combobox.options.length).toBe(195);
  });

  it('filters to include list when provided', async () => {
    const el = await fixture('<civ-country name="country" include="US,CA,MX"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox') as any;
    expect(combobox.options.length).toBe(3);
    expect(combobox.options.map((o: any) => o.value).sort()).toEqual(['CA', 'MX', 'US']);
  });

  it('excludes countries from exclude list', async () => {
    const el = await fixture('<civ-country name="country" exclude="KP,IR,SY"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox') as any;
    expect(combobox.options.length).toBe(192);
    expect(combobox.options.some((o: any) => o.value === 'KP')).toBe(false);
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-country name="country" label="Country of birth"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox') as any;
    expect(combobox.getAttribute('label')).toBe('Country of birth');
  });

  it('dispatches civ-change event', async () => {
    const el = await fixture('<civ-country name="country"></civ-country>') as CivCountry;
    const combobox = el.querySelector('civ-combobox')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    combobox.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'US', label: 'United States' }, bubbles: true }));
    expect(received).toBe('US');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-country name="country"></civ-country>') as CivCountry;
    el.value = 'US';
    el.formResetCallback();
    expect(el.value).toBe('');
  });
});
