import { describe, it, expect, afterEach } from 'vitest';
import './civ-select.js';
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
}
afterEach(cleanup);
describe('civ-select', () => {
    it('renders with a label', async () => {
        const el = createFixture('<civ-select label="State"></civ-select>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('State');
    });
    it('renders a select element', async () => {
        const el = createFixture('<civ-select label="State" name="state"></civ-select>');
        await waitForUpdate(el);
        const select = el.querySelector('select');
        expect(select).not.toBeNull();
        expect(select.name).toBe('state');
    });
    it('associates label with select via for/id', async () => {
        const el = createFixture('<civ-select label="State"></civ-select>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        const select = el.querySelector('select');
        expect(label.getAttribute('for')).toBe(select.id);
    });
    it('renders default empty option', async () => {
        const el = createFixture('<civ-select label="State"></civ-select>');
        await waitForUpdate(el);
        const options = el.querySelectorAll('option');
        expect(options.length).toBe(1);
        expect(options[0].textContent).toContain('- Select -');
        expect(options[0].value).toBe('');
    });
    it('renders custom empty label', async () => {
        const el = createFixture('<civ-select label="State" empty-label="Choose one"></civ-select>');
        await waitForUpdate(el);
        const options = el.querySelectorAll('option');
        expect(options[0].textContent).toContain('Choose one');
    });
    it('renders options from property', async () => {
        const el = createFixture('<civ-select label="State" name="state"></civ-select>');
        el.options = [
            { value: 'CA', label: 'California' },
            { value: 'NY', label: 'New York' },
            { value: 'TX', label: 'Texas' },
        ];
        await waitForUpdate(el);
        const options = el.querySelectorAll('option');
        // 1 empty + 3 real options
        expect(options.length).toBe(4);
        expect(options[1].value).toBe('CA');
        expect(options[1].textContent).toContain('California');
        expect(options[2].value).toBe('NY');
        expect(options[3].value).toBe('TX');
    });
    it('renders disabled options', async () => {
        const el = createFixture('<civ-select label="State"></civ-select>');
        el.options = [
            { value: 'CA', label: 'California' },
            { value: 'XX', label: 'Unavailable', disabled: true },
        ];
        await waitForUpdate(el);
        const options = el.querySelectorAll('option');
        expect(options[2].disabled).toBe(true);
    });
    it('renders error message with alert role', async () => {
        const el = createFixture('<civ-select label="State" error="Selection required"></civ-select>');
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Selection required');
    });
    it('sets aria-invalid when error is present', async () => {
        const el = createFixture('<civ-select label="State" error="Required"></civ-select>');
        await waitForUpdate(el);
        const select = el.querySelector('select');
        expect(select.getAttribute('aria-invalid')).toBe('true');
    });
    it('renders hint text', async () => {
        const el = createFixture('<civ-select label="State" hint="Your state of residence"></civ-select>');
        await waitForUpdate(el);
        const spans = el.querySelectorAll('span');
        const hintSpan = Array.from(spans).find((s) => s.textContent === 'Your state of residence');
        expect(hintSpan).not.toBeNull();
    });
    it('shows required indicator', async () => {
        const el = createFixture('<civ-select label="State" required></civ-select>');
        await waitForUpdate(el);
        const abbr = el.querySelector('abbr');
        expect(abbr).not.toBeNull();
        expect(abbr.textContent).toBe('*');
    });
    it('renders disabled state', async () => {
        const el = createFixture('<civ-select label="State" disabled></civ-select>');
        await waitForUpdate(el);
        const select = el.querySelector('select');
        expect(select.disabled).toBe(true);
    });
    it('fires civ-change event on selection', async () => {
        const el = createFixture('<civ-select label="State" name="state"></civ-select>');
        el.options = [
            { value: 'CA', label: 'California' },
            { value: 'NY', label: 'New York' },
        ];
        await waitForUpdate(el);
        const select = el.querySelector('select');
        let eventDetail = null;
        el.addEventListener('civ-change', ((e) => {
            eventDetail = e.detail;
        }));
        select.value = 'CA';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        expect(eventDetail).toEqual({ value: 'CA' });
    });
    it('uses Light DOM (no shadow root)', async () => {
        const el = createFixture('<civ-select label="State"></civ-select>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
        expect(el.querySelector('select')).not.toBeNull();
    });
    it('has static formAssociated = true', () => {
        const Ctor = customElements.get('civ-select');
        expect(Ctor.formAssociated).toBe(true);
    });
});
//# sourceMappingURL=civ-select.test.js.map