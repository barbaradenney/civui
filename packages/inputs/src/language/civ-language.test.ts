import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-language.js';
import type { CivLanguage } from './civ-language.js';

describe('civ-language', () => {
  afterEach(cleanupFixtures);

  it('renders with 15 language options', async () => {
    const el = await fixture<CivLanguage>('<civ-language name="language"></civ-language>');
    await elementUpdated(el);

    const select = el.querySelector('[data-language-select]') as any;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(15);
    expect(select.options[0].value).toBe('en');
    expect(select.options[14].value).toBe('other');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-language') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-language name="language"></civ-language>');
    expect(el.shadowRoot).toBeNull();
  });
});
