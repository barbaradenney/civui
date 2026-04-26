import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-us-state.js';
import type { CivUsState } from './civ-us-state.js';

describe('civ-us-state', () => {
  afterEach(cleanupFixtures);

  it('renders with default label', async () => {
    const el = await fixture('<civ-us-state name="state"></civ-us-state>') as CivUsState;
    const select = el.querySelector('civ-select') as any;
    expect(select.getAttribute('label')).toBe('State');
  });

  it('populates 51 options (50 states + DC) by default', async () => {
    const el = await fixture('<civ-us-state name="state"></civ-us-state>') as CivUsState;
    await elementUpdated(el);
    const select = el.querySelector('[data-us-state-select]') as any;
    expect(select.options.length).toBe(51);
  });

  it('includes territories when include-territories is set', async () => {
    const el = await fixture('<civ-us-state name="state" include-territories></civ-us-state>') as CivUsState;
    await elementUpdated(el);
    const select = el.querySelector('[data-us-state-select]') as any;
    expect(select.options.length).toBe(56);
    expect(select.options.some((o: any) => o.value === 'PR')).toBe(true);
  });

  it('dispatches civ-change event', async () => {
    const el = await fixture('<civ-us-state name="state"></civ-us-state>') as CivUsState;
    const select = el.querySelector('civ-select')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    select.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'CA' }, bubbles: true }));
    expect(received).toBe('CA');
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-us-state name="state" label="State of residence"></civ-us-state>') as CivUsState;
    const select = el.querySelector('civ-select') as any;
    expect(select.getAttribute('label')).toBe('State of residence');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-us-state name="state"></civ-us-state>') as CivUsState;
    el.value = 'CA';
    el.formResetCallback();
    expect(el.value).toBe('');
  });
});
