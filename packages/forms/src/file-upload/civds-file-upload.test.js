import { describe, it, expect, afterEach } from 'vitest';
import './civds-file-upload.js';
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
afterEach(cleanup);
describe('civds-file-upload', () => {
    it('renders with a label', async () => {
        const el = createFixture('<civds-file-upload label="Upload document"></civds-file-upload>');
        await waitForUpdate(el);
        const label = el.querySelector('label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('Upload document');
    });
    it('renders a hidden file input', async () => {
        const el = createFixture('<civds-file-upload label="Upload" name="file"></civds-file-upload>');
        await waitForUpdate(el);
        const input = el.querySelector('input[type="file"]');
        expect(input).not.toBeNull();
        expect(input.name).toBe('file');
    });
    it('renders a dropzone', async () => {
        const el = createFixture('<civds-file-upload label="Upload"></civds-file-upload>');
        await waitForUpdate(el);
        const dropzone = el.querySelector('[role="button"]');
        expect(dropzone).not.toBeNull();
        expect(dropzone.textContent).toContain('Drag files here');
    });
    it('shows accepted file types', async () => {
        const el = createFixture('<civds-file-upload label="Upload" accept=".pdf,.jpg"></civds-file-upload>');
        await waitForUpdate(el);
        const text = el.textContent;
        expect(text).toContain('.pdf,.jpg');
    });
    it('shows max file size', async () => {
        const el = createFixture('<civds-file-upload label="Upload" max-size="5242880"></civds-file-upload>');
        await waitForUpdate(el);
        const text = el.textContent;
        expect(text).toContain('5.0 MB');
    });
    it('sets accept on file input', async () => {
        const el = createFixture('<civds-file-upload label="Upload" accept="image/*"></civds-file-upload>');
        await waitForUpdate(el);
        const input = el.querySelector('input[type="file"]');
        expect(input.accept).toBe('image/*');
    });
    it('sets multiple on file input', async () => {
        const el = createFixture('<civds-file-upload label="Upload" multiple></civds-file-upload>');
        await waitForUpdate(el);
        const input = el.querySelector('input[type="file"]');
        expect(input.multiple).toBe(true);
    });
    it('renders error with alert role', async () => {
        const el = createFixture('<civds-file-upload label="Upload" error="File too large"></civds-file-upload>');
        await waitForUpdate(el);
        const errorEl = el.querySelector('[role="alert"]');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toBe('File too large');
    });
    it('shows required indicator', async () => {
        const el = createFixture('<civds-file-upload label="Upload" required></civds-file-upload>');
        await waitForUpdate(el);
        const abbr = el.querySelector('abbr');
        expect(abbr).not.toBeNull();
    });
    it('renders hint text', async () => {
        const el = createFixture('<civds-file-upload label="Upload" hint="PDF or image files only"></civds-file-upload>');
        await waitForUpdate(el);
        const spans = el.querySelectorAll('span');
        const hint = Array.from(spans).find((s) => s.textContent === 'PDF or image files only');
        expect(hint).not.toBeNull();
    });
    it('dropzone is keyboard accessible', async () => {
        const el = createFixture('<civds-file-upload label="Upload"></civds-file-upload>');
        await waitForUpdate(el);
        const dropzone = el.querySelector('[role="button"]');
        expect(dropzone.tabIndex).toBe(0);
    });
    it('uses Light DOM', async () => {
        const el = createFixture('<civds-file-upload label="Upload"></civds-file-upload>');
        await waitForUpdate(el);
        expect(el.shadowRoot).toBeNull();
    });
    it('has static formAssociated = true', () => {
        const Ctor = customElements.get('civds-file-upload');
        expect(Ctor.formAssociated).toBe(true);
    });
});
//# sourceMappingURL=civds-file-upload.test.js.map