import { describe, it, expect, afterEach } from 'vitest';
import './civ-form-fieldset.js';
import type { CivFormFieldset } from './civ-form-fieldset.js';

// @civui/core sits below @civui/test-utils in the dep graph, so we can't
// import its `fixture` / `cleanupFixtures` helpers here. Use a small
// inline equivalent.
const _fixtures: HTMLElement[] = [];
async function mount(html: string): Promise<HTMLElement> {
  const tpl = document.createElement('div');
  tpl.innerHTML = html.trim();
  const el = tpl.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  _fixtures.push(el);
  if ('updateComplete' in el) await (el as any).updateComplete;
  return el;
}

afterEach(() => {
  while (_fixtures.length) {
    const el = _fixtures.pop()!;
    el.remove();
  }
});

describe('civ-form-fieldset rendering', () => {
  it('renders a <fieldset> with the legend text', async () => {
    const el = await mount(`<civ-form-fieldset legend="Mailing address"></civ-form-fieldset>`);
    const fs = el.querySelector('fieldset');
    expect(fs).not.toBeNull();
    expect(fs!.textContent).toContain('Mailing address');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await mount(`<civ-form-fieldset legend="x"></civ-form-fieldset>`);
    expect(el.shadowRoot).toBeNull();
  });

  it('renders hint text and links it via aria-describedby', async () => {
    const el = await mount(`<civ-form-fieldset legend="Address" hint="Enter your mailing address"></civ-form-fieldset>`);
    const fs = el.querySelector('fieldset')!;
    const describedBy = fs.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const hint = el.querySelector(`#${describedBy!.split(' ')[0]}`);
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toContain('Enter your mailing address');
  });

  it('renders error with role="alert" and sets aria-invalid', async () => {
    const el = await mount(`<civ-form-fieldset legend="Address" error="Address required"></civ-form-fieldset>`);
    const fs = el.querySelector('fieldset')!;
    expect(fs.getAttribute('aria-invalid')).toBe('true');
    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain('Address required');
  });

  it('cascades disabled to the fieldset', async () => {
    const el = await mount(`<civ-form-fieldset legend="x" disabled></civ-form-fieldset>`);
    const fs = el.querySelector('fieldset')!;
    expect(fs.hasAttribute('disabled')).toBe(true);
  });

  it('absorbs civ-error-change events from children and re-renders the error', async () => {
    const el = (await mount(`
      <civ-form-fieldset legend="Address">
        <span id="child">child</span>
      </civ-form-fieldset>
    `)) as CivFormFieldset;
    const child = el.querySelector('#child')!;
    child.dispatchEvent(new CustomEvent('civ-error-change', {
      detail: { error: 'Child rejected the value' },
      bubbles: true,
    }));
    await (el as any).updateComplete;
    expect(el.error).toBe('Child rejected the value');
    const alert = el.querySelector('[role="alert"]');
    expect(alert!.textContent).toContain('Child rejected the value');
  });
});
