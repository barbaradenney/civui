import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-marital-status.js';
import type { CivMaritalStatus } from './civ-marital-status.js';

describe('civ-marital-status', () => {
  afterEach(cleanupFixtures);

  it('renders with 5 marital status options', async () => {
    const el = await fixture<CivMaritalStatus>('<civ-marital-status name="maritalStatus"></civ-marital-status>');
    await elementUpdated(el);

    const select = el.querySelector('[data-marital-status-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(5);
    expect(select.options[0].value).toBe('never-married');
    expect(select.options[4].value).toBe('widowed');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-marital-status') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-marital-status name="maritalStatus"></civ-marital-status>');
    expect(el.shadowRoot).toBeNull();
  });
});
