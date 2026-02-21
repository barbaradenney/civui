import { describe, it, expect, afterEach, vi } from 'vitest';
import './civds-file-upload.js';

function createFixture(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as HTMLElement;
}

function cleanup(): void {
  document.body.innerHTML = '';
}

async function waitForUpdate(el: HTMLElement): Promise<void> {
  if ('updateComplete' in el) await (el as any).updateComplete;
}

afterEach(cleanup);

describe('civds-file-upload', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civds-file-upload label="Upload document"></civds-file-upload>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Upload document');
  });

  it('renders a hidden file input', async () => {
    const el = createFixture('<civds-file-upload label="Upload" name="file"></civds-file-upload>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('file');
  });

  it('renders a dropzone', async () => {
    const el = createFixture('<civds-file-upload label="Upload"></civds-file-upload>');
    await waitForUpdate(el);

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.textContent).toContain('Drag files here');
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

    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('image/*');
  });

  it('sets multiple on file input', async () => {
    const el = createFixture('<civds-file-upload label="Upload" multiple></civds-file-upload>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it('renders error with alert role', async () => {
    const el = createFixture('<civds-file-upload label="Upload" error="File too large"></civds-file-upload>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('File too large');
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

    const dropzone = el.querySelector('[role="button"]') as HTMLElement;
    expect(dropzone.tabIndex).toBe(0);
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civds-file-upload label="Upload"></civds-file-upload>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-file-upload') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class to dropzone', async () => {
    const el = createFixture('<civds-file-upload label="Upload" name="doc"></civds-file-upload>');
    await waitForUpdate(el);

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone!.className).toContain('focus-visible:civds-focus-ring');
  });

  it('does not use deprecated focus: outline classes on dropzone', async () => {
    const el = createFixture('<civds-file-upload label="Upload" name="doc"></civds-file-upload>');
    await waitForUpdate(el);

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone!.className).not.toContain('focus:civds-outline-2');
    expect(dropzone!.className).not.toContain('focus:civds-outline-primary');
    expect(dropzone!.className).not.toContain('focus:civds-outline-offset-0');
  });

  describe('analytics', () => {
    it('fires civds-analytics with upload action on file add', async () => {
      const el = createFixture('<civds-file-upload label="Upload" name="doc"></civds-file-upload>') as any;
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      const uploadCall = handler.mock.calls.find((c: any) => c[0].detail.action === 'upload');
      expect(uploadCall).toBeTruthy();
      expect(uploadCall[0].detail.componentName).toBe('civds-file-upload');
      expect(uploadCall[0].detail.details.fileCount).toBe(1);
    });

    it('fires civds-analytics with remove action on file remove', async () => {
      const el = createFixture('<civds-file-upload label="Upload" name="doc"></civds-file-upload>') as any;
      await waitForUpdate(el);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      el._removeFile(0);

      const removeCall = handler.mock.calls.find((c: any) => c[0].detail.action === 'remove');
      expect(removeCall).toBeTruthy();
      expect(removeCall[0].detail.details.fileCount).toBe(0);
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = createFixture('<civds-file-upload label="Upload" name="doc" disable-analytics></civds-file-upload>') as any;
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      expect(handler).not.toHaveBeenCalled();
    });

    it('never includes file content or value in analytics payload', async () => {
      const el = createFixture('<civds-file-upload label="Upload" name="doc"></civds-file-upload>') as any;
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      const file = new File(['sensitive'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      for (const call of handler.mock.calls) {
        const detail = call[0].detail;
        expect(detail).not.toHaveProperty('value');
        expect(detail).not.toHaveProperty('files');
      }
    });
  });
});
