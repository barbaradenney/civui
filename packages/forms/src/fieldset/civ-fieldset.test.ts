import { describe, it, expect, afterEach } from 'vitest';
import './civ-fieldset.js';

function createFixture(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as HTMLElement;
}

function cleanup(): void {
  document.body.innerHTML = '';
}

async function waitForUpdate(el: HTMLElement): Promise<void> {
  if ('updateComplete' in el) await (el as any).updateComplete;
}

afterEach(cleanup);

describe('civ-fieldset', () => {
  it('renders a native fieldset', async () => {
    const el = createFixture('<civ-fieldset legend="Personal info"></civ-fieldset>');
    await waitForUpdate(el);

    expect(el.querySelector('fieldset')).not.toBeNull();
  });

  it('renders a legend', async () => {
    const el = createFixture('<civ-fieldset legend="Personal info"></civ-fieldset>');
    await waitForUpdate(el);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Personal info');
  });

  it('renders hint text', async () => {
    const el = createFixture('<civ-fieldset legend="Address" hint="Your mailing address"></civ-fieldset>');
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hint = Array.from(spans).find((s) => s.textContent === 'Your mailing address');
    expect(hint).not.toBeNull();
  });

  it('renders error with alert role', async () => {
    const el = createFixture('<civ-fieldset legend="Address" error="Address is incomplete"></civ-fieldset>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Address is incomplete');
  });

  it('sets aria-describedby on fieldset', async () => {
    const el = createFixture('<civ-fieldset legend="Address" hint="Required" error="Missing"></civ-fieldset>');
    await waitForUpdate(el);

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
    const el = createFixture('<civ-fieldset legend="Address" required></civ-fieldset>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders slotted children', async () => {
    const el = createFixture(`
      <civ-fieldset legend="Name">
        <input type="text" id="first" />
        <input type="text" id="last" />
      </civ-fieldset>
    `);
    await waitForUpdate(el);

    expect(el.querySelector('#first')).not.toBeNull();
    expect(el.querySelector('#last')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civ-fieldset legend="Info"></civ-fieldset>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });
});
