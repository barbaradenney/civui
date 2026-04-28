import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-suffix.js';
import type { CivSuffix } from './civ-suffix.js';

describe('civ-suffix', () => {
  afterEach(cleanupFixtures);

  it('renders with 6 suffix options', async () => {
    const el = await fixture<CivSuffix>('<civ-suffix name="suffix"></civ-suffix>');
    await elementUpdated(el);

    const select = el.querySelector('[data-suffix-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(6);
    expect(select.options[0].value).toBe('Jr.');
    expect(select.options[5].value).toBe('V');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-suffix') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-suffix name="suffix"></civ-suffix>');
    expect(el.shadowRoot).toBeNull();
  });
});
