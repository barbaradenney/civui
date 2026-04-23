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

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
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

  it('cascades disabled to child inputs inside fieldset', async () => {
    const el = await fixture<HTMLElement>(`
      <civ-fieldset legend="Address" disabled>
        <input type="text" id="street" />
        <input type="text" id="city" />
      </civ-fieldset>
    `);
    await elementUpdated(el);

    const street = el.querySelector('#street') as HTMLInputElement;
    const city = el.querySelector('#city') as HTMLInputElement;
    // Children should be inside the fieldset, inheriting disabled
    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.contains(street)).toBe(true);
    expect(fieldset.contains(city)).toBe(true);
  });

  it('re-moves children after disconnect and reconnect', async () => {
    const el = await fixture<HTMLElement>(`
      <civ-fieldset legend="Name">
        <input type="text" id="first" />
      </civ-fieldset>
    `);
    await elementUpdated(el);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.contains(el.querySelector('#first'))).toBe(true);

    // Disconnect and reconnect
    const parent = el.parentElement!;
    parent.removeChild(el);
    parent.appendChild(el);
    await elementUpdated(el);

    const fieldset2 = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset2.contains(el.querySelector('#first'))).toBe(true);
  });

  it('moves children inside the fieldset element', async () => {
    const el = await fixture<HTMLElement>(`
      <civ-fieldset legend="Name">
        <input type="text" id="first" />
        <input type="text" id="last" />
      </civ-fieldset>
    `);
    await elementUpdated(el);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    const first = el.querySelector('#first');
    const last = el.querySelector('#last');
    expect(fieldset.contains(first)).toBe(true);
    expect(fieldset.contains(last)).toBe(true);
  });
});
