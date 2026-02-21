import { describe, it, expect, afterEach } from 'vitest';
import './civ-form.js';
import '../text-input/civ-text-input.js';
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
async function waitForChildren(el) {
    await waitForUpdate(el);
    const children = el.querySelectorAll('civ-text-input');
    for (const child of children) {
        await waitForUpdate(child);
    }
}
afterEach(cleanup);
describe('civ-form', () => {
    it('uses Light DOM', async () => {
        const el = createFixture('<civ-form></civ-form>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
    });
    it('renders children as descendants', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        const input = el.querySelector('civ-text-input');
        expect(input).not.toBeNull();
    });
    it('does not show error summary initially', async () => {
        const el = createFixture('<civ-form></civ-form>');
        await waitForUpdate(el);
        const summary = el.querySelector('[data-civ-error-summary]');
        expect(summary).toBeNull();
    });
    it('validates required fields', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        const errors = el.validate();
        expect(errors.length).toBe(1);
        expect(errors[0].name).toBe('name');
        expect(errors[0].message).toContain('Name');
    });
    it('returns empty errors for valid form', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        const errors = el.validate();
        expect(errors.length).toBe(0);
    });
    it('returns no errors when required field has a value', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John" required></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        const errors = el.validate();
        expect(errors.length).toBe(0);
    });
    it('shows error summary after validation fails', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        // Trigger validation by clicking submit
        el._errors = el.validate();
        await waitForUpdate(el);
        const summary = el.querySelector('[data-civ-error-summary]');
        expect(summary).not.toBeNull();
        expect(summary.textContent).toContain('1 error');
    });
    it('fires civ-invalid on invalid submit', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Email" name="email" required></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);
        await waitForChildren(el);
        let eventDetail = null;
        el.addEventListener('civ-invalid', ((e) => {
            eventDetail = e.detail;
        }));
        // Click the submit button
        const btn = el.querySelector('button[type="submit"]');
        btn.click();
        await waitForUpdate(el);
        expect(eventDetail).not.toBeNull();
        expect(eventDetail.errors.length).toBe(1);
    });
    it('fires civ-submit when form is valid', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);
        await waitForChildren(el);
        let submitted = false;
        el.addEventListener('civ-submit', () => {
            submitted = true;
        });
        const btn = el.querySelector('button[type="submit"]');
        btn.click();
        await waitForUpdate(el);
        expect(submitted).toBe(true);
    });
    it('clears errors on clearErrors()', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        el.clearErrors();
        await waitForUpdate(el);
        expect(el._errors.length).toBe(0);
        const summary = el.querySelector('[data-civ-error-summary]');
        expect(summary).toBeNull();
    });
    it('clears errors on reset button click', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <button type="reset">Reset</button>
      </civ-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        const btn = el.querySelector('button[type="reset"]');
        btn.click();
        await waitForUpdate(el);
        expect(el._errors.length).toBe(0);
    });
    it('error summary contains links for each error', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        const links = el.querySelectorAll('[data-civ-error-summary] a');
        expect(links.length).toBe(2);
        for (const link of links) {
            const href = link.getAttribute('href');
            expect(href).toMatch(/^#/);
        }
    });
    it('counts multiple errors correctly', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="First" name="first" required></civ-text-input>
        <civ-text-input label="Last" name="last" required></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        const summary = el.querySelector('[data-civ-error-summary]');
        expect(summary.textContent).toContain('3 errors');
    });
    it('collects form data from children', async () => {
        const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John"></civ-text-input>
        <civ-text-input label="Email" name="email" value="john@test.com"></civ-text-input>
      </civ-form>
    `);
        await waitForChildren(el);
        const data = el.getFormData();
        expect(data.name).toBe('John');
        expect(data.email).toBe('john@test.com');
    });
});
//# sourceMappingURL=civ-form.test.js.map