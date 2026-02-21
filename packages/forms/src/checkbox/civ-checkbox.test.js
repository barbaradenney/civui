import { describe, it, expect, afterEach } from 'vitest';
import './civ-checkbox.js';
import './civ-checkbox-group.js';
function createFixture(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    return container.firstElementChild;
}
function cleanup() {
    document.body.innerHTML = '';
}
async function waitForUpdate(el) {
    if ('updateComplete' in el) {
        await el.updateComplete;
    }
    // Also wait for any child custom elements
    const children = el.querySelectorAll('civ-checkbox, civ-checkbox-group');
    for (const child of children) {
        if ('updateComplete' in child) {
            await child.updateComplete;
        }
    }
}
afterEach(cleanup);
describe('civ-checkbox', () => {
    it('renders with a label', async () => {
        const el = createFixture('<civ-checkbox label="Agree to terms"></civ-checkbox>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('Agree to terms');
    });
    it('renders a checkbox input', async () => {
        const el = createFixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');
        await waitForUpdate(el);
        const input = el.querySelector('input[type="checkbox"]');
        expect(input).not.toBeNull();
    });
    it('associates label with checkbox via for/id', async () => {
        const el = createFixture('<civ-checkbox label="Agree"></civ-checkbox>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        const input = el.querySelector('input');
        expect(label.getAttribute('for')).toBe(input.id);
    });
    it('reflects checked state', async () => {
        const el = createFixture('<civ-checkbox label="Agree" checked></civ-checkbox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.checked).toBe(true);
    });
    it('defaults to unchecked', async () => {
        const el = createFixture('<civ-checkbox label="Agree"></civ-checkbox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.checked).toBe(false);
    });
    it('fires civ-change on click', async () => {
        const el = createFixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        let eventDetail = null;
        el.addEventListener('civ-change', ((e) => {
            eventDetail = e.detail;
        }));
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        expect(eventDetail).toEqual({ checked: true, value: 'on' });
    });
    it('renders description text', async () => {
        const el = createFixture('<civ-checkbox label="Agree" description="By checking this you agree to our terms"></civ-checkbox>');
        await waitForUpdate(el);
        const desc = el.querySelector('span');
        expect(desc).not.toBeNull();
        expect(desc.textContent).toContain('By checking this');
    });
    it('renders tile variant with border', async () => {
        const el = createFixture('<civ-checkbox label="Option A" tile></civ-checkbox>');
        await waitForUpdate(el);
        const wrapper = el.querySelector('div > div');
        expect(wrapper).not.toBeNull();
        // Tile variant should have border classes on outer wrapper
        const outerDiv = el.querySelector('.civ-border');
        expect(outerDiv).not.toBeNull();
    });
    it('renders error message', async () => {
        const el = createFixture('<civ-checkbox label="Agree" error="You must agree"></civ-checkbox>');
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('You must agree');
    });
    it('renders disabled state', async () => {
        const el = createFixture('<civ-checkbox label="Agree" disabled></civ-checkbox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.disabled).toBe(true);
    });
    it('shows required indicator', async () => {
        const el = createFixture('<civ-checkbox label="Agree" required></civ-checkbox>');
        await waitForUpdate(el);
        const abbr = el.querySelector('abbr');
        expect(abbr).not.toBeNull();
        expect(abbr.textContent).toBe('*');
    });
    it('uses Light DOM', async () => {
        const el = createFixture('<civ-checkbox label="Agree"></civ-checkbox>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
        expect(el.querySelector('input')).not.toBeNull();
    });
    it('defaults value to "on"', async () => {
        const el = createFixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');
        await waitForUpdate(el);
        expect(el.value).toBe('on');
    });
    it('has static formAssociated = true', () => {
        const Ctor = customElements.get('civ-checkbox');
        expect(Ctor.formAssociated).toBe(true);
    });
});
describe('civ-checkbox-group', () => {
    it('renders with a legend', async () => {
        const el = createFixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" name="toppings" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" name="toppings" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);
        await waitForUpdate(el);
        const legend = el.querySelector('legend');
        expect(legend).not.toBeNull();
        expect(legend.textContent).toContain('Toppings');
    });
    it('wraps children in a fieldset', async () => {
        const el = createFixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);
        await waitForUpdate(el);
        const fieldset = el.querySelector('fieldset');
        expect(fieldset).not.toBeNull();
    });
    it('renders group error', async () => {
        const el = createFixture(`
      <civ-checkbox-group legend="Toppings" error="Select at least one">
        <civ-checkbox label="Cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Select at least one');
    });
    it('renders group hint', async () => {
        const el = createFixture(`
      <civ-checkbox-group legend="Toppings" hint="Choose your favorites">
        <civ-checkbox label="Cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);
        await waitForUpdate(el);
        const spans = el.querySelectorAll('span');
        const hintSpan = Array.from(spans).find((s) => s.textContent === 'Choose your favorites');
        expect(hintSpan).not.toBeNull();
    });
    it('uses Light DOM', async () => {
        const el = createFixture(`
      <civ-checkbox-group legend="Options">
        <civ-checkbox label="A"></civ-checkbox>
      </civ-checkbox-group>
    `);
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
        expect(el.querySelector('fieldset')).not.toBeNull();
    });
});
//# sourceMappingURL=civ-checkbox.test.js.map