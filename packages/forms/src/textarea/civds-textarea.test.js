import { describe, it, expect, afterEach } from 'vitest';
import './civds-textarea.js';
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
describe('civds-textarea', () => {
    it('renders with a label', async () => {
        const el = createFixture('<civds-textarea label="Comments"></civds-textarea>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('Comments');
    });
    it('renders a textarea element', async () => {
        const el = createFixture('<civds-textarea label="Comments" name="comments"></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        expect(textarea).not.toBeNull();
        expect(textarea.name).toBe('comments');
    });
    it('associates label with textarea via for/id', async () => {
        const el = createFixture('<civds-textarea label="Comments"></civds-textarea>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        const textarea = el.querySelector('textarea');
        expect(label.getAttribute('for')).toBe(textarea.id);
    });
    it('renders with configurable rows', async () => {
        const el = createFixture('<civds-textarea label="Bio" rows="10"></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        expect(textarea.rows).toBe(10);
    });
    it('defaults to 5 rows', async () => {
        const el = createFixture('<civds-textarea label="Bio"></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        expect(textarea.rows).toBe(5);
    });
    it('shows character count when maxlength is set', async () => {
        const el = createFixture('<civds-textarea label="Bio" maxlength="200"></civds-textarea>');
        await waitForUpdate(el);
        const counter = el.querySelector('[aria-live="polite"]');
        expect(counter).not.toBeNull();
        expect(counter.textContent).toContain('200 characters remaining');
    });
    it('does not show character count without maxlength', async () => {
        const el = createFixture('<civds-textarea label="Bio"></civds-textarea>');
        await waitForUpdate(el);
        const counter = el.querySelector('[aria-live="polite"]');
        expect(counter).toBeNull();
    });
    it('updates character count on input', async () => {
        const el = createFixture('<civds-textarea label="Bio" maxlength="200"></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        textarea.value = 'Hello world';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await waitForUpdate(el);
        const counter = el.querySelector('[aria-live="polite"]');
        expect(counter.textContent).toContain('189 characters remaining');
    });
    it('renders error message with alert role', async () => {
        const el = createFixture('<civds-textarea label="Bio" error="Too short"></civds-textarea>');
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('Too short');
    });
    it('sets aria-invalid when error is present', async () => {
        const el = createFixture('<civds-textarea label="Bio" error="Required"></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        expect(textarea.getAttribute('aria-invalid')).toBe('true');
    });
    it('renders hint text', async () => {
        const el = createFixture('<civds-textarea label="Bio" hint="Keep it brief"></civds-textarea>');
        await waitForUpdate(el);
        const hint = el.querySelector('span:not([role])');
        expect(hint).not.toBeNull();
        expect(hint.textContent).toBe('Keep it brief');
    });
    it('shows required indicator', async () => {
        const el = createFixture('<civds-textarea label="Bio" required></civds-textarea>');
        await waitForUpdate(el);
        const abbr = el.querySelector('abbr');
        expect(abbr).not.toBeNull();
        expect(abbr.textContent).toBe('*');
    });
    it('renders disabled state', async () => {
        const el = createFixture('<civds-textarea label="Bio" disabled></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        expect(textarea.disabled).toBe(true);
    });
    it('fires civds-input event on input', async () => {
        const el = createFixture('<civds-textarea label="Bio" name="bio"></civds-textarea>');
        await waitForUpdate(el);
        const textarea = el.querySelector('textarea');
        let eventDetail = null;
        el.addEventListener('civds-input', ((e) => {
            eventDetail = e.detail;
        }));
        textarea.value = 'Hello';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        expect(eventDetail).toEqual({ value: 'Hello' });
    });
    it('uses Light DOM (no shadow root)', async () => {
        const el = createFixture('<civds-textarea label="Bio"></civds-textarea>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
        expect(el.querySelector('textarea')).not.toBeNull();
    });
    it('has static formAssociated = true', () => {
        const Ctor = customElements.get('civds-textarea');
        expect(Ctor.formAssociated).toBe(true);
    });
});
//# sourceMappingURL=civds-textarea.test.js.map