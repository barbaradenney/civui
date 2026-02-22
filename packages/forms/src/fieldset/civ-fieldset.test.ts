import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-fieldset.js';

afterEach(cleanupFixtures);

describe('civ-fieldset', () => {
  it('renders a native fieldset', async () => {
    const el = await fixture('<civ-fieldset legend="Personal info"></civ-fieldset>');

    expect(el.querySelector('fieldset')).not.toBeNull();
  });

  it('renders a legend', async () => {
    const el = await fixture('<civ-fieldset legend="Personal info"></civ-fieldset>');

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Personal info');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-fieldset legend="Address" hint="Your mailing address"></civ-fieldset>');

    const spans = el.querySelectorAll('span');
    const hint = Array.from(spans).find((s) => s.textContent === 'Your mailing address');
    expect(hint).not.toBeNull();
  });

  it('renders error with alert role', async () => {
    const el = await fixture('<civ-fieldset legend="Address" error="Address is incomplete"></civ-fieldset>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Address is incomplete');
  });

  it('sets aria-describedby on fieldset', async () => {
    const el = await fixture('<civ-fieldset legend="Address" hint="Required" error="Missing"></civ-fieldset>');

    const fieldset = el.querySelector('fieldset');
    const describedBy = fieldset!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const ids = describedBy!.split(' ');
    expect(ids.length).toBe(2);
    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('shows required indicator on legend', async () => {
    const el = await fixture('<civ-fieldset legend="Address" required></civ-fieldset>');

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders slotted children', async () => {
    const el = await fixture(`
      <civ-fieldset legend="Name">
        <input type="text" id="first" />
        <input type="text" id="last" />
      </civ-fieldset>
    `);

    expect(el.querySelector('#first')).not.toBeNull();
    expect(el.querySelector('#last')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-fieldset legend="Info"></civ-fieldset>');

    expect(el.shadowRoot).toBeNull();
  });
});

describe('fieldset disabled', () => {
  it('renders disabled attribute on native fieldset when disabled property is set', async () => {
    const el = await fixture<HTMLElement>('<civ-fieldset legend="Address" disabled></civ-fieldset>');

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.disabled).toBe(true);
  });

  it('does not render disabled attribute on native fieldset when not disabled', async () => {
    const el = await fixture<HTMLElement>('<civ-fieldset legend="Address"></civ-fieldset>');

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.disabled).toBe(false);
  });
});
