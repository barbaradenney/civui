import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-conditional.js';
import '@civui/inputs';

afterEach(cleanupFixtures);

describe('civ-conditional', () => {
  it('renders hidden by default', async () => {
    const el = await fixture('<civ-conditional when="color" equals="red"><p>Red content</p></civ-conditional>');
    await elementUpdated(el);

    const container = el.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container).not.toBeNull();
    expect(container.classList.contains('civ-conditional--hidden')).toBe(true);
  });

  it('shows content when matching civ-input event is dispatched', async () => {
    const el = await fixture('<civ-conditional when="color" equals="red"><p>Red content</p></civ-conditional>');
    await elementUpdated(el);

    // Simulate a civ-input event from a field named "color" with value "red"
    const fakeField = document.createElement('div');
    (fakeField as any).name = 'color';
    document.body.appendChild(fakeField);
    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'red' }, bubbles: true }));
    await elementUpdated(el);

    const container = el.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--visible')).toBe(true);

    fakeField.remove();
  });

  it('evaluates a prefilled checkbox-group on initial load via getCheckedValues', async () => {
    // A checkbox-group exposes getCheckedValues(), not a `values` array.
    // On load the conditional must read the checked values, not the
    // serialized "a,b" value string, or a prefilled group mis-hides.
    const root = await fixture(`
      <div>
        <civ-checkbox-group name="fruit" legend="Fruit" value="apple,pear">
          <civ-checkbox value="apple" label="Apple" checked></civ-checkbox>
          <civ-checkbox value="pear" label="Pear" checked></civ-checkbox>
          <civ-checkbox value="plum" label="Plum"></civ-checkbox>
        </civ-checkbox-group>
        <civ-conditional when="fruit" includes="apple"><p>Apple content</p></civ-conditional>
      </div>
    `);
    await elementUpdated(root);
    const cond = root.querySelector('civ-conditional') as HTMLElement;
    await elementUpdated(cond);

    const container = cond.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--visible')).toBe(true);
  });

  it('stays hidden when the prefilled checkbox-group does not include the target value', async () => {
    const root = await fixture(`
      <div>
        <civ-checkbox-group name="fruit" legend="Fruit" value="pear">
          <civ-checkbox value="apple" label="Apple"></civ-checkbox>
          <civ-checkbox value="pear" label="Pear" checked></civ-checkbox>
        </civ-checkbox-group>
        <civ-conditional when="fruit" includes="apple"><p>Apple content</p></civ-conditional>
      </div>
    `);
    await elementUpdated(root);
    const cond = root.querySelector('civ-conditional') as HTMLElement;
    await elementUpdated(cond);

    const container = cond.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--hidden')).toBe(true);
  });

  it('hides content when value no longer matches', async () => {
    const el = await fixture('<civ-conditional when="color" equals="red"><p>Red content</p></civ-conditional>') as any;
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'color';
    document.body.appendChild(fakeField);

    // Show it
    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'red' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--visible')).toBe(true);

    // Hide it
    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'blue' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('supports not-equals mode', async () => {
    const el = await fixture('<civ-conditional when="status" not-equals="inactive"><p>Active content</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'status';
    document.body.appendChild(fakeField);

    // Should show when value is NOT "inactive"
    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'active' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--visible')).toBe(true);

    // Should hide when value IS "inactive"
    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'inactive' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('ignores events from non-matching field names', async () => {
    const el = await fixture('<civ-conditional when="color" equals="red"><p>Red</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'size';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'red' }, bubbles: true }));
    await elementUpdated(el);

    const container = el.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('checks initial state from existing field in DOM', async () => {
    // Create a field first
    const field = document.createElement('input');
    field.name = 'flavor';
    (field as any).value = 'chocolate';
    document.body.appendChild(field);

    const el = await fixture('<civ-conditional when="flavor" equals="chocolate"><p>Chocolate!</p></civ-conditional>');
    await elementUpdated(el);

    const container = el.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--visible')).toBe(true);

    field.remove();
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-conditional when="x" equals="y"><p>Content</p></civ-conditional>');

    expect(el.shadowRoot).toBeNull();
  });

  it('responds to civ-change events as well', async () => {
    const el = await fixture('<civ-conditional when="color" equals="red"><p>Red</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'color';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'red' }, bubbles: true }));
    await elementUpdated(el);

    const container = el.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--visible')).toBe(true);

    fakeField.remove();
  });

  it('cleans up event listeners on disconnect', async () => {
    const el = await fixture('<civ-conditional when="color" equals="red"><p>Red</p></civ-conditional>') as any;
    await elementUpdated(el);

    el.remove();

    // After removal, dispatching an event should not cause errors
    const fakeField = document.createElement('div');
    (fakeField as any).name = 'color';
    document.body.appendChild(fakeField);
    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'red' }, bubbles: true }));
    // Should not throw
    fakeField.remove();
  });

  it('shows content when value is in includes list', async () => {
    const el = await fixture('<civ-conditional when="role" includes="admin, editor"><p>Privileged</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'role';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'editor' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--visible')).toBe(true);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'viewer' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('shows content when field has any value (has-value)', async () => {
    const el = await fixture('<civ-conditional when="email" has-value><p>Email provided</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'email';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'test@example.com' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--visible')).toBe(true);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('shows content when value matches regex pattern', async () => {
    const el = await fixture('<civ-conditional when="zip" matches="^\\d{5}$"><p>Valid ZIP</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'zip';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '90210' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--visible')).toBe(true);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'abc' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('handles invalid regex gracefully', async () => {
    const el = await fixture('<civ-conditional when="x" matches="[invalid"><p>Content</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'x';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'test' }, bubbles: true }));
    await elementUpdated(el);
    expect((el.querySelector('[data-civ-conditional-content]') as HTMLElement).classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });

  it('stays hidden when neither equals nor not-equals is set', async () => {
    const el = await fixture('<civ-conditional when="color"><p>Content</p></civ-conditional>');
    await elementUpdated(el);

    const fakeField = document.createElement('div');
    (fakeField as any).name = 'color';
    document.body.appendChild(fakeField);

    fakeField.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'red' }, bubbles: true }));
    await elementUpdated(el);

    const container = el.querySelector('[data-civ-conditional-content]') as HTMLElement;
    expect(container.classList.contains('civ-conditional--hidden')).toBe(true);

    fakeField.remove();
  });
});
