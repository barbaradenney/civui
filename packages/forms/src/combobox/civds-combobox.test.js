import { describe, it, expect, afterEach } from 'vitest';
import './civds-combobox.js';
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
    if ('updateComplete' in el)
        await el.updateComplete;
}
const STATES = [
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
];
afterEach(cleanup);
describe('civds-combobox', () => {
    it('renders with a label', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('State');
    });
    it('renders a text input with combobox role', async () => {
        const el = createFixture('<civds-combobox label="State" name="state"></civds-combobox>');
        await waitForUpdate(el);
        const input = el.querySelector('input[role="combobox"]');
        expect(input).not.toBeNull();
    });
    it('sets aria-autocomplete="list"', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
    });
    it('starts with aria-expanded="false"', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });
    it('opens listbox on focus', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        await waitForUpdate(el);
        const input = el.querySelector('input');
        input.dispatchEvent(new Event('focus'));
        await waitForUpdate(el);
        expect(input.getAttribute('aria-expanded')).toBe('true');
        const listbox = el.querySelector('[role="listbox"]');
        expect(listbox).not.toBeNull();
    });
    it('renders options in listbox', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        el._open = true;
        await waitForUpdate(el);
        const options = el.querySelectorAll('[role="option"]');
        expect(options.length).toBe(5);
        expect(options[0].textContent).toContain('California');
    });
    it('filters options on input', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        await waitForUpdate(el);
        const input = el.querySelector('input');
        input.value = 'Co';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await waitForUpdate(el);
        const options = el.querySelectorAll('[role="option"]');
        expect(options.length).toBe(2); // Colorado, Connecticut
    });
    it('shows "No results found" when no matches', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        await waitForUpdate(el);
        const input = el.querySelector('input');
        input.value = 'ZZZ';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await waitForUpdate(el);
        const noResults = el.querySelector('[role="status"]');
        expect(noResults).not.toBeNull();
        expect(noResults.textContent).toContain('No results found');
    });
    it('selects option on click', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        el._open = true;
        await waitForUpdate(el);
        let eventDetail = null;
        el.addEventListener('civds-change', ((e) => {
            eventDetail = e.detail;
        }));
        const firstOption = el.querySelector('[role="option"]');
        firstOption.click();
        await waitForUpdate(el);
        expect(eventDetail).toEqual({ value: 'CA', label: 'California' });
        expect(el.value).toBe('CA');
    });
    it('closes on Escape', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        el._open = true;
        await waitForUpdate(el);
        const input = el.querySelector('input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await waitForUpdate(el);
        expect(el._open).toBe(false);
    });
    it('navigates with arrow keys', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        el._open = true;
        await waitForUpdate(el);
        const input = el.querySelector('input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await waitForUpdate(el);
        expect(el._activeIndex).toBe(0);
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await waitForUpdate(el);
        expect(el._activeIndex).toBe(1);
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        await waitForUpdate(el);
        expect(el._activeIndex).toBe(0);
    });
    it('selects on Enter', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        el.options = STATES;
        el._open = true;
        el._activeIndex = 1;
        await waitForUpdate(el);
        const input = el.querySelector('input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await waitForUpdate(el);
        expect(el.value).toBe('CO');
        expect(el._open).toBe(false);
    });
    it('renders error with alert role', async () => {
        const el = createFixture('<civds-combobox label="State" error="Required"></civds-combobox>');
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
    });
    it('sets aria-invalid when error is present', async () => {
        const el = createFixture('<civds-combobox label="State" error="Bad"></civds-combobox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });
    it('shows required indicator', async () => {
        const el = createFixture('<civds-combobox label="State" required></civds-combobox>');
        await waitForUpdate(el);
        const abbr = el.querySelector('abbr');
        expect(abbr).not.toBeNull();
    });
    it('renders disabled state', async () => {
        const el = createFixture('<civds-combobox label="State" disabled></civds-combobox>');
        await waitForUpdate(el);
        const input = el.querySelector('input');
        expect(input.disabled).toBe(true);
    });
    it('uses Light DOM', async () => {
        const el = createFixture('<civds-combobox label="State"></civds-combobox>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
    });
    it('has static formAssociated = true', () => {
        const Ctor = customElements.get('civds-combobox');
        expect(Ctor.formAssociated).toBe(true);
    });
});
//# sourceMappingURL=civds-combobox.test.js.map