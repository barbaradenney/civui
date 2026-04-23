import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-file-upload.js';

afterEach(cleanupFixtures);

describe('civ-file-upload', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-file-upload label="Upload document"></civ-file-upload>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Upload document');
  });

  it('renders a hidden file input', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="file"></civ-file-upload>');

    const input = el.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('file');
  });

  it('renders a dropzone', async () => {
    const el = await fixture('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.textContent).toContain('Drag files here');
  });

  it('shows accepted file types', async () => {
    const el = await fixture('<civ-file-upload label="Upload" accept=".pdf,.jpg"></civ-file-upload>');

    const text = el.textContent;
    expect(text).toContain('PDF and JPEG');
  });

  it('shows max file size', async () => {
    const el = await fixture('<civ-file-upload label="Upload" max-size="5242880"></civ-file-upload>');

    const text = el.textContent;
    expect(text).toContain('5.0 MB');
  });

  it('sets accept on file input', async () => {
    const el = await fixture('<civ-file-upload label="Upload" accept="image/*"></civ-file-upload>');

    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('image/*');
  });

  it('sets multiple on file input', async () => {
    const el = await fixture('<civ-file-upload label="Upload" multiple></civ-file-upload>');

    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it('renders error with alert role', async () => {
    const el = await fixture('<civ-file-upload label="Upload" error="File too large"></civ-file-upload>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('File too large');
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-file-upload label="Upload" required></civ-file-upload>');

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-file-upload label="Upload" hint="PDF or image files only"></civ-file-upload>');

    const spans = el.querySelectorAll('span');
    const hint = Array.from(spans).find((s) => s.textContent === 'PDF or image files only');
    expect(hint).not.toBeNull();
  });

  it('dropzone is keyboard accessible', async () => {
    const el = await fixture('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]') as HTMLElement;
    expect(dropzone.tabIndex).toBe(0);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-file-upload label="Upload"></civ-file-upload>');

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-file-upload') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class to dropzone', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('applies focus-visible ring class to Remove button', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    el._addFiles([file]);
    await elementUpdated(el);

    const removeBtn = el.querySelector('button[aria-label^="Remove"]');
    expect(removeBtn).not.toBeNull();
    expect(removeBtn!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes on dropzone', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone!.className).not.toContain('focus:civ-outline-2');
    expect(dropzone!.className).not.toContain('focus:civ-outline-primary');
    expect(dropzone!.className).not.toContain('focus:civ-outline-offset-0');
  });

  it('announces when files are added', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    el._addFiles([file]);

    // announce() updates the live region after a rAF
    await new Promise((r) => requestAnimationFrame(r));
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion!.textContent).toContain('1 file(s) added');
    expect(liveRegion!.textContent).toContain('1 file(s) selected');
  });

  describe('i18n overrides', () => {
    it('uses custom drag-text', async () => {
      const el = await fixture('<civ-file-upload label="Upload" drag-text="Arrastra archivos aquí o"></civ-file-upload>');

      const dropzone = el.querySelector('[role="button"]');
      expect(dropzone!.textContent).toContain('Arrastra archivos aquí o');
    });

    it('uses custom browse-text', async () => {
      const el = await fixture('<civ-file-upload label="Upload" browse-text="elegir de carpeta"></civ-file-upload>');

      const dropzone = el.querySelector('[role="button"]');
      expect(dropzone!.textContent).toContain('elegir de carpeta');
    });

    it('uses custom remove-text and remove-aria-label', async () => {
      const el = await fixture('<civ-file-upload label="Upload" remove-text="Eliminar" remove-aria-label="Eliminar {name}"></civ-file-upload>') as any;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);
      await elementUpdated(el);

      const btn = Array.from(el.querySelectorAll('button')).find((b: any) => b.textContent.trim() === 'Eliminar') as HTMLElement;
      expect(btn).not.toBeNull();
      expect(btn!.getAttribute('aria-label')).toBe('Eliminar test.pdf');
    });

    it('uses custom file-size-error with interpolation', async () => {
      const el = await fixture('<civ-file-upload label="Upload" max-size="1024" file-size-error="{name} supera el tamaño máximo de {size}"></civ-file-upload>') as any;

      const file = new File(['x'.repeat(2048)], 'big.pdf', { type: 'application/pdf' });
      el._addFiles([file]);
      await elementUpdated(el);

      expect(el.error).toBe('big.pdf supera el tamaño máximo de 1.0 KB');
    });

    it('uses custom files-list-label', async () => {
      const el = await fixture('<civ-file-upload label="Upload" files-list-label="Archivos seleccionados"></civ-file-upload>') as any;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);
      await elementUpdated(el);

      const ul = el.querySelector('ul');
      expect(ul!.getAttribute('aria-label')).toBe('Archivos seleccionados');
    });
  });

  describe('analytics', () => {
    it('fires civ-analytics with upload action on file add', async () => {
      const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      const uploadCall = handler.mock.calls.find((c: any) => c[0].detail.action === 'upload');
      expect(uploadCall).toBeTruthy();
      expect(uploadCall[0].detail.componentName).toBe('civ-file-upload');
      expect(uploadCall[0].detail.details.fileCount).toBe(1);
    });

    it('fires civ-analytics with remove action on file remove', async () => {
      const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      el._removeFile(0);

      const removeCall = handler.mock.calls.find((c: any) => c[0].detail.action === 'remove');
      expect(removeCall).toBeTruthy();
      expect(removeCall[0].detail.details.fileCount).toBe(0);
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = await fixture('<civ-file-upload label="Upload" name="doc" disable-analytics></civ-file-upload>') as any;

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);

      expect(handler).not.toHaveBeenCalled();
    });

    it('never includes file content or value in analytics payload', async () => {
      const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

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

describe('file type validation', () => {
  it('rejects files that do not match accept attribute', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" accept=".pdf"></civ-file-upload>');

    const comp = el as any;
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    comp._addFiles([file]);
    await elementUpdated(el);

    expect(comp._files.length).toBe(0);
    expect(comp.error).toContain('photo.jpg');
  });

  it('accepts files matching .pdf extension', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" accept=".pdf"></civ-file-upload>');

    const comp = el as any;
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
    comp._addFiles([file]);
    await elementUpdated(el);

    expect(comp._files.length).toBe(1);
    expect(comp._files[0].name).toBe('report.pdf');
  });

  it('accepts files matching image/* wildcard', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" accept="image/*"></civ-file-upload>');

    const comp = el as any;
    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    comp._addFiles([file]);
    await elementUpdated(el);

    expect(comp._files.length).toBe(1);
    expect(comp._files[0].name).toBe('photo.png');
  });

  it('rejects image/* wildcard for non-image files', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" accept="image/*"></civ-file-upload>');

    const comp = el as any;
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    comp._addFiles([file]);
    await elementUpdated(el);

    expect(comp._files.length).toBe(0);
    expect(comp.error).toContain('doc.pdf');
  });

  it('adds files that pass both accept and maxSize validation', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" accept=".pdf" max-size="10240"></civ-file-upload>');

    const comp = el as any;
    const file = new File(['small content'], 'ok.pdf', { type: 'application/pdf' });
    comp._addFiles([file]);
    await elementUpdated(el);

    expect(comp._files.length).toBe(1);
    expect(comp._files[0].name).toBe('ok.pdf');
  });

  it('rejects files that pass accept but exceed maxSize', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" accept=".pdf" max-size="10"></civ-file-upload>');

    const comp = el as any;
    const file = new File(['x'.repeat(100)], 'big.pdf', { type: 'application/pdf' });
    comp._addFiles([file]);
    await elementUpdated(el);

    expect(comp._files.length).toBe(0);
    expect(comp.error).toContain('big.pdf');
  });
});

describe('aria-disabled', () => {
  it('dropzone has aria-disabled="true" when disabled', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" disabled></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.getAttribute('aria-disabled')).toBe('true');
  });

  it('dropzone omits aria-disabled when not disabled', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.hasAttribute('aria-disabled')).toBe(false);
  });
});

describe('aria-required', () => {
  it('dropzone has aria-required="true" when required', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" required></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.getAttribute('aria-required')).toBe('true');
  });

  it('dropzone omits aria-required when not required', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('[role="button"]');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.hasAttribute('aria-required')).toBe(false);
  });

  it('enforces maxFiles limit', async () => {
    const el = await fixture<HTMLElement>(
      '<civ-file-upload label="Upload" multiple max-files="2"></civ-file-upload>',
    ) as any;

    const file1 = new File(['a'], 'a.pdf', { type: 'application/pdf' });
    const file2 = new File(['b'], 'b.pdf', { type: 'application/pdf' });
    const file3 = new File(['c'], 'c.pdf', { type: 'application/pdf' });

    el._addFiles([file1, file2, file3]);
    await el.updateComplete;

    expect(el.files.length).toBe(2);
    expect(el.error).toContain('2');
  });

  it('resets files on formResetCallback', async () => {
    const el = await fixture<HTMLElement>(
      '<civ-file-upload label="Upload" multiple></civ-file-upload>',
    ) as any;

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    el._addFiles([file]);
    await el.updateComplete;
    expect(el.files.length).toBe(1);

    el.formResetCallback();
    await el.updateComplete;
    expect(el.files.length).toBe(0);
    expect(el.value).toBe('');
    expect(el.error).toBe('');
  });

  it('handles drop event with files', async () => {
    const el = await fixture<HTMLElement>(
      '<civ-file-upload label="Upload"></civ-file-upload>',
    ) as any;

    const file = new File(['content'], 'dropped.txt', { type: 'text/plain' });
    const dropEvent = new Event('drop', { bubbles: true }) as any;
    dropEvent.preventDefault = () => {};
    dropEvent.dataTransfer = { files: [file] };

    const dropzone = el.querySelector('[role="button"]');
    el._onDrop(dropEvent);
    await el.updateComplete;

    expect(el.files.length).toBe(1);
    expect(el.files[0].name).toBe('dropped.txt');
  });

  it('moves focus after file removal', async () => {
    const el = await fixture<HTMLElement>(
      '<civ-file-upload label="Upload" multiple></civ-file-upload>',
    ) as any;

    const file1 = new File(['a'], 'a.pdf', { type: 'application/pdf' });
    const file2 = new File(['b'], 'b.pdf', { type: 'application/pdf' });
    el._addFiles([file1, file2]);
    await el.updateComplete;

    const removeButtons = el.querySelectorAll('.civ-file-remove-btn');
    expect(removeButtons.length).toBe(2);

    el._removeFile(0);
    await el.updateComplete;

    expect(el.files.length).toBe(1);
    expect(el.files[0].name).toBe('b.pdf');
  });
});
