import { describe, it, expect, afterEach } from 'vitest';
import './civds-form.js';
import '../text-input/civds-text-input.js';
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
    const children = el.querySelectorAll('civds-text-input');
    for (const child of children) {
        await waitForUpdate(child);
    }
}
afterEach(cleanup);
describe('civds-form', () => {
    it('uses Light DOM', async () => {
        const el = createFixture('<civds-form></civds-form>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
    });
    it('renders children as descendants', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name"></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        const input = el.querySelector('civds-text-input');
        expect(input).not.toBeNull();
    });
    it('does not show error summary initially', async () => {
        const el = createFixture('<civds-form></civds-form>');
        await waitForUpdate(el);
        const summary = el.querySelector('[data-civds-error-summary]');
        expect(summary).toBeNull();
    });
    it('validates required fields', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" required></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        const errors = el.validate();
        expect(errors.length).toBe(1);
        expect(errors[0].name).toBe('name');
        expect(errors[0].message).toContain('Name');
    });
    it('returns empty errors for valid form', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name"></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        const errors = el.validate();
        expect(errors.length).toBe(0);
    });
    it('returns no errors when required field has a value', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" value="John" required></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        const errors = el.validate();
        expect(errors.length).toBe(0);
    });
    it('shows error summary after validation fails', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" required></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        // Trigger validation by clicking submit
        el._errors = el.validate();
        await waitForUpdate(el);
        const summary = el.querySelector('[data-civds-error-summary]');
        expect(summary).not.toBeNull();
        expect(summary.textContent).toContain('1 error');
    });
    it('fires civds-invalid on invalid submit', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Email" name="email" required></civds-text-input>
        <button type="submit">Submit</button>
      </civds-form>
    `);
        await waitForChildren(el);
        let eventDetail = null;
        el.addEventListener('civds-invalid', ((e) => {
            eventDetail = e.detail;
        }));
        // Click the submit button
        const btn = el.querySelector('button[type="submit"]');
        btn.click();
        await waitForUpdate(el);
        expect(eventDetail).not.toBeNull();
        expect(eventDetail.errors.length).toBe(1);
    });
    it('fires civds-submit when form is valid', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" value="John"></civds-text-input>
        <button type="submit">Submit</button>
      </civds-form>
    `);
        await waitForChildren(el);
        let submitted = false;
        el.addEventListener('civds-submit', () => {
            submitted = true;
        });
        const btn = el.querySelector('button[type="submit"]');
        btn.click();
        await waitForUpdate(el);
        expect(submitted).toBe(true);
    });
    it('clears errors on clearErrors()', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" required></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        el.clearErrors();
        await waitForUpdate(el);
        expect(el._errors.length).toBe(0);
        const summary = el.querySelector('[data-civds-error-summary]');
        expect(summary).toBeNull();
    });
    it('clears errors on reset button click', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" required></civds-text-input>
        <button type="reset">Reset</button>
      </civds-form>
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
      <civds-form>
        <civds-text-input label="Name" name="name" required></civds-text-input>
        <civds-text-input label="Email" name="email" required></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        const links = el.querySelectorAll('[data-civds-error-summary] a');
        expect(links.length).toBe(2);
        for (const link of links) {
            const href = link.getAttribute('href');
            expect(href).toMatch(/^#/);
        }
    });
    it('counts multiple errors correctly', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="First" name="first" required></civds-text-input>
        <civds-text-input label="Last" name="last" required></civds-text-input>
        <civds-text-input label="Email" name="email" required></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        el._errors = el.validate();
        await waitForUpdate(el);
        const summary = el.querySelector('[data-civds-error-summary]');
        expect(summary.textContent).toContain('3 errors');
    });
    it('collects form data from children', async () => {
        const el = createFixture(`
      <civds-form>
        <civds-text-input label="Name" name="name" value="John"></civds-text-input>
        <civds-text-input label="Email" name="email" value="john@test.com"></civds-text-input>
      </civds-form>
    `);
        await waitForChildren(el);
        const data = el.getFormData();
        expect(data.name).toBe('John');
        expect(data.email).toBe('john@test.com');
    });
});
//# sourceMappingURL=civds-form.test.js.map