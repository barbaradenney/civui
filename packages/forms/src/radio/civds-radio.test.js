import { describe, it, expect, afterEach } from 'vitest';
import './civds-radio.js';
import './civds-radio-group.js';
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
    const children = el.querySelectorAll('civds-radio, civds-radio-group');
    for (const child of children) {
        if ('updateComplete' in child) {
            await child.updateComplete;
        }
    }
}
afterEach(cleanup);
describe('civds-radio', () => {
    it('renders with a label', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a"></civds-radio>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('Option A');
    });
    it('renders a radio input', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a" name="choice"></civds-radio>');
        await waitForUpdate(el);
        const input = el.querySelector('input[type="radio"]');
        expect(input).not.toBeNull();
        expect(input.name).toBe('choice');
    });
    it('associates label with radio via for/id', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a"></civds-radio>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        const input = el.querySelector('input');
        expect(label.getAttribute('for')).toBe(input.id);
    });
    it('reflects checked state', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a" checked></civds-radio>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.checked).toBe(true);
    });
    it('defaults to unchecked', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a"></civds-radio>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.checked).toBe(false);
    });
    it('fires civds-change when selected', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a" name="choice"></civds-radio>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        let eventDetail = null;
        el.addEventListener('civds-change', ((e) => {
            eventDetail = e.detail;
        }));
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        expect(eventDetail).toEqual({ value: 'a' });
    });
    it('renders description text', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a" description="This is option A"></civds-radio>');
        await waitForUpdate(el);
        const desc = el.querySelector('span');
        expect(desc).not.toBeNull();
        expect(desc.textContent).toContain('This is option A');
    });
    it('renders tile variant', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a" tile></civds-radio>');
        await waitForUpdate(el);
        const border = el.querySelector('.civds-border');
        expect(border).not.toBeNull();
    });
    it('renders disabled state', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a" disabled></civds-radio>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.disabled).toBe(true);
    });
    it('uses Light DOM', async () => {
        const el = createFixture('<civds-radio label="Option A" value="a"></civds-radio>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
        expect(el.querySelector('input')).not.toBeNull();
    });
});
describe('civds-radio-group', () => {
    it('renders with a legend', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color">
        <civds-radio label="Red" value="red"></civds-radio>
        <civds-radio label="Blue" value="blue"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        const legend = el.querySelector('legend');
        expect(legend).not.toBeNull();
        expect(legend.textContent).toContain('Color');
    });
    it('wraps children in a fieldset', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color">
        <civds-radio label="Red" value="red"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        const fieldset = el.querySelector('fieldset');
        expect(fieldset).not.toBeNull();
    });
    it('syncs name to child radios', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color">
        <civds-radio label="Red" value="red"></civds-radio>
        <civds-radio label="Blue" value="blue"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        const radios = el.querySelectorAll('civds-radio');
        for (const radio of radios) {
            expect(radio.name).toBe('color');
        }
    });
    it('renders group error', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color" error="Please select a color">
        <civds-radio label="Red" value="red"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Please select a color');
    });
    it('renders group hint', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color" hint="Pick your favorite">
        <civds-radio label="Red" value="red"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        const spans = el.querySelectorAll('span');
        const hintSpan = Array.from(spans).find((s) => s.textContent === 'Pick your favorite');
        expect(hintSpan).not.toBeNull();
    });
    it('shows required indicator', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color" required>
        <civds-radio label="Red" value="red"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        const abbr = el.querySelector('abbr');
        expect(abbr).not.toBeNull();
        expect(abbr.textContent).toBe('*');
    });
    it('uses Light DOM', async () => {
        const el = createFixture(`
      <civds-radio-group legend="Color" name="color">
        <civds-radio label="Red" value="red"></civds-radio>
      </civds-radio-group>
    `);
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
        expect(el.querySelector('fieldset')).not.toBeNull();
    });
    it('has static formAssociated = true', () => {
        const Ctor = customElements.get('civds-radio-group');
        expect(Ctor.formAssociated).toBe(true);
    });
});
//# sourceMappingURL=civds-radio.test.js.map