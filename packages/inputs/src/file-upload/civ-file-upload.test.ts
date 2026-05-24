import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-file-upload.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-file-upload', () => {
  it('renders a hidden file input', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="file"></civ-file-upload>');

    const input = el.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('file');
  });

  it('renders a dropzone', async () => {
    const el = await fixture('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone');
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

  it('dropzone is keyboard accessible', async () => {
    const el = await fixture('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone') as HTMLElement;
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

  it('renders the dropzone as a real <button> so the global focus ring applies', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone')!;
    expect(dropzone.tagName).toBe('BUTTON');
  });

  it('renders Remove as a close-button-icon real <button> with the standard aria-label', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    el._addFiles([file]);
    await elementUpdated(el);

    const removeBtn = el.querySelector('[data-file-remove]')!;
    expect(removeBtn.tagName).toBe('BUTTON');
    expect(removeBtn.className).toContain('civ-close-btn');
    expect(removeBtn.getAttribute('aria-label')).toBe('Remove test.pdf');
    expect(removeBtn.querySelector('civ-icon[name="close"]')).not.toBeNull();
  });

  it('does not use deprecated focus: outline classes on dropzone', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone');
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

  it('includes the removed file name in the remove announcement', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc" multiple></civ-file-upload>') as any;
    el._addFiles([new File(['a'], 'alpha.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.removeFile(0);
    await new Promise((r) => requestAnimationFrame(r));

    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion!.textContent).toContain('Removed alpha.pdf');
    expect(liveRegion!.textContent).toContain('0 file(s) selected');
  });

  it('announces retry and clears progress milestones for the file', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc" multiple></civ-file-upload>') as any;
    el._addFiles([new File(['a'], 'alpha.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    // Force the file into an error state so retry is meaningful.
    const fileRef = el._files[0].file;
    el._files[0].status = 'error';
    el._files[0].error = 'Network failure';
    el._progressMilestones.set(fileRef, 50);
    await elementUpdated(el);

    el._retryUpload(0);
    await new Promise((r) => requestAnimationFrame(r));

    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion!.textContent).toContain('Retrying upload of alpha.pdf');
    expect(el._progressMilestones.has(fileRef)).toBe(false);
  });

  it('throttles progress announcements to 25/50/75/100 milestones', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;
    const bigFile = new File(['x'], 'big.zip', { type: 'application/zip' });

    el._announceProgress(bigFile, 'big.zip', 10);
    el._announceProgress(bigFile, 'big.zip', 24);
    expect(el._progressMilestones.get(bigFile)).toBeUndefined();

    el._announceProgress(bigFile, 'big.zip', 30);
    expect(el._progressMilestones.get(bigFile)).toBe(25);

    el._announceProgress(bigFile, 'big.zip', 60);
    expect(el._progressMilestones.get(bigFile)).toBe(50);

    el._announceProgress(bigFile, 'big.zip', 100);
    expect(el._progressMilestones.get(bigFile)).toBe(100);
  });

  describe('i18n overrides', () => {
    it('uses custom drag-text', async () => {
      const el = await fixture('<civ-file-upload label="Upload" drag-text="Arrastra archivos aquí o"></civ-file-upload>');

      const dropzone = el.querySelector('.civ-dropzone');
      expect(dropzone!.textContent).toContain('Arrastra archivos aquí o');
    });

    it('uses custom browse-text', async () => {
      const el = await fixture('<civ-file-upload label="Upload" browse-text="elegir de carpeta"></civ-file-upload>');

      const dropzone = el.querySelector('.civ-dropzone');
      expect(dropzone!.textContent).toContain('elegir de carpeta');
    });

    it('interpolates remove-aria-label with the file name', async () => {
      const el = await fixture('<civ-file-upload label="Upload" remove-aria-label="Eliminar {name}"></civ-file-upload>') as any;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      el._addFiles([file]);
      await elementUpdated(el);

      const btn = el.querySelector('[data-file-remove]') as HTMLButtonElement;
      expect(btn.getAttribute('aria-label')).toBe('Eliminar test.pdf');
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

      el.removeFile(0);

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

describe('disabled', () => {
  it('dropzone is disabled when disabled', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" disabled></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone') as HTMLButtonElement;
    expect(dropzone).not.toBeNull();
    expect(dropzone.disabled).toBe(true);
  });

  it('dropzone is not disabled when not disabled', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone') as HTMLButtonElement;
    expect(dropzone).not.toBeNull();
    expect(dropzone.disabled).toBe(false);
  });
});

describe('aria-required', () => {
  it('dropzone has aria-required="true" when required', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload" required></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone');
    expect(dropzone).not.toBeNull();
    expect(dropzone!.getAttribute('aria-required')).toBe('true');
  });

  it('dropzone omits aria-required when not required', async () => {
    const el = await fixture<HTMLElement>('<civ-file-upload label="Upload"></civ-file-upload>');

    const dropzone = el.querySelector('.civ-dropzone');
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

    const removeButtons = el.querySelectorAll('[data-file-remove]');
    expect(removeButtons.length).toBe(2);

    el.removeFile(0);
    await el.updateComplete;

    expect(el.files.length).toBe(1);
    expect(el.files[0].name).toBe('b.pdf');
  });
});

describe('civ-file-upload destructive-action hook', () => {
  afterEach(cleanupFixtures);

  it('fires cancelable civ-file-upload-before-remove that aborts on preventDefault', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc" multiple></civ-file-upload>') as any;
    el._addFiles([new File(['a'], 'alpha.pdf', { type: 'application/pdf' })]);
    await el.updateComplete;
    expect(el.files.length).toBe(1);

    let removed = false;
    el.addEventListener('civ-file-removed', () => { removed = true; });
    el.addEventListener('civ-file-upload-before-remove', (e: Event) => e.preventDefault());

    el.removeFile(0);
    await el.updateComplete;

    // Nothing changed — file still in the list, civ-file-removed didn't fire.
    expect(el.files.length).toBe(1);
    expect(removed).toBe(false);
  });

  it('skipConfirm: true bypasses the cancelable hook', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc" multiple></civ-file-upload>') as any;
    el._addFiles([new File(['a'], 'alpha.pdf', { type: 'application/pdf' })]);
    await el.updateComplete;

    // Consumer pattern: preventDefault on the first pass, then re-call
    // with skipConfirm: true from the modal's confirm handler.
    let beforeCalls = 0;
    el.addEventListener('civ-file-upload-before-remove', (e: CustomEvent) => {
      beforeCalls++;
      e.preventDefault();
      el.removeFile(e.detail.index, { skipConfirm: true });
    });

    el.removeFile(0);
    await el.updateComplete;

    // Only one before-remove fired (re-entry was skipped), file IS gone.
    expect(beforeCalls).toBe(1);
    expect(el.files.length).toBe(0);
  });

  it('civ-file-upload-before-remove is cancelable and carries the removal payload', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;
    el._addFiles([new File(['a'], 'alpha.pdf', { type: 'application/pdf' })]);
    await el.updateComplete;

    let captured: CustomEvent | null = null;
    el.addEventListener('civ-file-upload-before-remove', (e: CustomEvent) => { captured = e; });
    el.removeFile(0);

    expect(captured).not.toBeNull();
    expect(captured!.cancelable).toBe(true);
    expect(captured!.detail.index).toBe(0);
    expect(captured!.detail.name).toBe('alpha.pdf');
    expect(captured!.detail.isInitial).toBe(false);
  });

  it('without listeners, the normal removal path still works', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc" multiple></civ-file-upload>') as any;
    el._addFiles([new File(['a'], 'alpha.pdf', { type: 'application/pdf' })]);
    await el.updateComplete;

    let removed = false;
    el.addEventListener('civ-file-removed', () => { removed = true; });
    el.removeFile(0);
    await el.updateComplete;

    expect(el.files.length).toBe(0);
    expect(removed).toBe(true);
  });
});

describe('civ-file-upload duplicate detection', () => {
  afterEach(cleanupFixtures);

  it('rejects a duplicate by name + size + lastModified', async () => {
    const el = await fixture('<civ-file-upload label="Docs" multiple></civ-file-upload>') as any;
    const lastModified = Date.now();
    const a = new File(['content'], 'report.pdf', { type: 'application/pdf', lastModified });
    el._addFiles([a]);
    await el.updateComplete;
    expect(el.files.length).toBe(1);

    // Same name + same size + same lastModified → duplicate
    const dup = new File(['content'], 'report.pdf', { type: 'application/pdf', lastModified });
    el._addFiles([dup]);
    await el.updateComplete;

    expect(el.files.length).toBe(1);
    expect(el.error).toContain('already in the list');
  });

  it('does NOT reject a same-named file with a different size', async () => {
    const el = await fixture('<civ-file-upload label="Docs" multiple></civ-file-upload>') as any;
    el._addFiles([new File(['short'], 'a.pdf', { type: 'application/pdf', lastModified: 1 })]);
    await el.updateComplete;

    el._addFiles([new File(['much longer content here'], 'a.pdf', { type: 'application/pdf', lastModified: 2 })]);
    await el.updateComplete;

    expect(el.files.length).toBe(2);
  });

  it('allows re-adding a removed file', async () => {
    const el = await fixture('<civ-file-upload label="Docs" multiple></civ-file-upload>') as any;
    const lastModified = 1;
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf', lastModified });
    el._addFiles([file]);
    await el.updateComplete;
    expect(el.files.length).toBe(1);

    el.removeFile(0);
    await el.updateComplete;
    expect(el.files.length).toBe(0);

    el._addFiles([new File(['content'], 'report.pdf', { type: 'application/pdf', lastModified })]);
    await el.updateComplete;
    expect(el.files.length).toBe(1);
  });

  it('reports duplicates alongside other validation errors', async () => {
    const el = await fixture('<civ-file-upload label="Docs" multiple max-size="100"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'ok.pdf', { type: 'application/pdf', lastModified: 1 })]);
    await el.updateComplete;

    el._addFiles([
      new File(['x'], 'ok.pdf', { type: 'application/pdf', lastModified: 1 }), // duplicate
      new File(['x'.repeat(200)], 'big.pdf', { type: 'application/pdf', lastModified: 2 }), // too big
    ]);
    await el.updateComplete;

    expect(el.files.length).toBe(1);
    expect(el.error).toContain('already in the list');
    expect(el.error).toContain('exceeds the maximum size');
  });
});

describe('civ-file-upload capture prop', () => {
  afterEach(cleanupFixtures);

  it('omits the capture attribute by default', async () => {
    const el = await fixture('<civ-file-upload label="Photo"></civ-file-upload>');
    const input = el.querySelector('input[type="file"]')!;
    expect(input.hasAttribute('capture')).toBe(false);
  });

  it('passes capture="environment" through to the file input', async () => {
    const el = await fixture('<civ-file-upload label="Document scan" capture="environment"></civ-file-upload>');
    const input = el.querySelector('input[type="file"]')!;
    expect(input.getAttribute('capture')).toBe('environment');
  });

  it('passes capture="user" through to the file input', async () => {
    const el = await fixture('<civ-file-upload label="Selfie" capture="user"></civ-file-upload>');
    const input = el.querySelector('input[type="file"]')!;
    expect(input.getAttribute('capture')).toBe('user');
  });
});

describe('civ-file-upload initialFiles (draft restore)', () => {
  afterEach(cleanupFixtures);

  it('hydrates the file list from initialFiles on first connect', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" multiple></civ-file-upload>') as any;
    el.initialFiles = [
      { id: 'srv-1', name: 'tax-return.pdf', size: 1024, type: 'application/pdf', url: '/files/srv-1' },
      { id: 'srv-2', name: 'w2.pdf', size: 2048, type: 'application/pdf' },
    ];
    await elementUpdated(el);

    expect(el.files.length).toBe(2);
    expect(el.files[0].name).toBe('tax-return.pdf');
    expect(el.querySelectorAll('.civ-file-item').length).toBe(2);
  });

  it('renders the file name as a download link when url is provided', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el.initialFiles = [
      { id: 'srv-1', name: 'report.pdf', size: 100, url: 'https://example.test/report.pdf' },
    ];
    await elementUpdated(el);

    const link = el.querySelector('.civ-file-item a') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.href).toBe('https://example.test/report.pdf');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(link.textContent).toBe('report.pdf');
  });

  it('renders the file name as plain text (no anchor) when no url is provided', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el.initialFiles = [{ id: 'srv-1', name: 'report.pdf', size: 100 }];
    await elementUpdated(el);

    expect(el.querySelector('.civ-file-item a')).toBeNull();
    const item = el.querySelector('.civ-file-item')!;
    expect(item.textContent).toContain('report.pdf');
  });

  it('hydration is idempotent — assigning initialFiles twice does not duplicate', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" multiple></civ-file-upload>') as any;
    el.initialFiles = [{ id: 'srv-1', name: 'a.pdf', size: 100 }];
    await elementUpdated(el);
    expect(el.files.length).toBe(1);

    // Reassigning post-hydration is intentionally ignored to avoid mid-flow surprises.
    el.initialFiles = [
      { id: 'srv-1', name: 'a.pdf', size: 100 },
      { id: 'srv-2', name: 'b.pdf', size: 200 },
    ];
    await elementUpdated(el);

    expect(el.files.length).toBe(1);
  });

  it('rejects a re-uploaded file that matches an initial file by name + size', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" multiple></civ-file-upload>') as any;
    el.initialFiles = [{ id: 'srv-1', name: 'report.pdf', size: 11, type: 'application/pdf' }];
    await elementUpdated(el);

    el._addFiles([new File(['hello world'], 'report.pdf', { type: 'application/pdf', lastModified: 1 })]);
    await el.updateComplete;

    expect(el.files.length).toBe(1);
    expect(el.error).toContain('already in the list');
  });

  it('fires civ-file-removed with isInitial=true and the server id when an initial file is removed', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el.initialFiles = [{ id: 'srv-1', name: 'report.pdf', size: 100 }];
    await elementUpdated(el);

    let captured: any = null;
    el.addEventListener('civ-file-removed', ((e: CustomEvent) => { captured = e.detail; }) as EventListener);

    el.removeFile(0);
    await elementUpdated(el);

    expect(captured).not.toBeNull();
    expect(captured.isInitial).toBe(true);
    expect(captured.id).toBe('srv-1');
    expect(captured.name).toBe('report.pdf');
    expect(el.files.length).toBe(0);
    expect(el.removedInitialFileIds).toEqual(['srv-1']);
  });

  it('fires civ-file-removed with isInitial=false for browser-side files', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'new.pdf', { type: 'application/pdf', lastModified: 1 })]);
    await elementUpdated(el);

    let captured: any = null;
    el.addEventListener('civ-file-removed', ((e: CustomEvent) => { captured = e.detail; }) as EventListener);

    el.removeFile(0);
    await elementUpdated(el);

    expect(captured.isInitial).toBe(false);
    expect(captured.id).toBeUndefined();
  });

  it('keptInitialFileIds reflects which initial files are still present', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" multiple></civ-file-upload>') as any;
    el.initialFiles = [
      { id: 'srv-1', name: 'a.pdf', size: 100 },
      { id: 'srv-2', name: 'b.pdf', size: 200 },
      { id: 'srv-3', name: 'c.pdf', size: 300 },
    ];
    await elementUpdated(el);

    expect(el.keptInitialFileIds).toEqual(['srv-1', 'srv-2', 'srv-3']);

    el.removeFile(1);
    await elementUpdated(el);
    expect(el.keptInitialFileIds).toEqual(['srv-1', 'srv-3']);
    expect(el.removedInitialFileIds).toEqual(['srv-2']);
  });

  it('formResetCallback restores initial files and clears removed-id tracking', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el.initialFiles = [{ id: 'srv-1', name: 'a.pdf', size: 100 }];
    await elementUpdated(el);

    el.removeFile(0);
    await elementUpdated(el);
    expect(el.files.length).toBe(0);
    expect(el.removedInitialFileIds).toEqual(['srv-1']);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.files.length).toBe(1);
    expect(el.removedInitialFileIds).toEqual([]);
    expect(el.keptInitialFileIds).toEqual(['srv-1']);
  });
});

describe('civ-file-upload upload status API', () => {
  afterEach(cleanupFixtures);

  it('setFileStatus updates progress and announces uploading', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'uploading', { progress: 25 });
    await elementUpdated(el);
    expect(el._files[0].status).toBe('uploading');
    expect(el._files[0].progress).toBe(25);
  });

  it('setFileStatus marks success', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'success');
    await elementUpdated(el);
    expect(el._files[0].status).toBe('success');
  });

  it('setFileStatus marks error with message', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'error', { error: 'Server rejected file' });
    await elementUpdated(el);
    expect(el._files[0].status).toBe('error');
    expect(el._files[0].error).toBe('Server rejected file');
  });

  it('setFileStatus is a no-op for an out-of-range index', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    expect(() => el.setFileStatus(99, 'success')).not.toThrow();
  });

  it('getAbortController returns a fresh AbortController per file (memoized)', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    const ctrl = el.getAbortController(0);
    expect(ctrl).toBeInstanceOf(AbortController);
    // Idempotent — same controller returned on second call
    expect(el.getAbortController(0)).toBe(ctrl);
  });

  it('getAbortController returns undefined for an out-of-range index', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    expect(el.getAbortController(99)).toBeUndefined();
  });
});

describe('civ-file-upload password-protected files', () => {
  it('renders an inline password input + Unlock button when status is locked', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'medical-record.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const unlockBlock = el.querySelector('[data-file-unlock]');
    expect(unlockBlock).not.toBeNull();
    const passwordInput = unlockBlock!.querySelector('civ-text-input');
    expect(passwordInput).not.toBeNull();
    expect(passwordInput!.getAttribute('type')).toBe('password');
    expect(passwordInput!.getAttribute('autocomplete')).toBe('off');
    expect(passwordInput!.hasAttribute('reveal-password')).toBe(true);
  });

  it('renders a lock icon (not error icon) for locked files', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const fileItem = el.querySelector('.civ-file-item')!;
    expect(fileItem.querySelector('civ-icon[name="lock"]')).not.toBeNull();
    expect(fileItem.querySelector('civ-icon[name="error"]')).toBeNull();
  });

  it('fires civ-file-unlock with the password and transitions to uploading', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'protected.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const events: CustomEvent[] = [];
    el.addEventListener('civ-file-unlock', (e: CustomEvent) => events.push(e));

    // Simulate the user typing a password
    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    passwordInput.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: 'hunter2' },
      bubbles: true,
    }));
    await elementUpdated(el);

    // Click Unlock
    const unlockBtn = el.querySelector('[data-file-unlock] civ-action-button')!;
    unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await elementUpdated(el);

    expect(events).toHaveLength(1);
    expect(events[0].detail.index).toBe(0);
    expect(events[0].detail.name).toBe('protected.pdf');
    expect(events[0].detail.password).toBe('hunter2');
    expect(events[0].detail.file).toBeInstanceOf(File);

    // File moves to uploading so the user gets immediate feedback
    expect(el._files[0].status).toBe('uploading');
  });

  it('does not fire civ-file-unlock when the password is empty', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const events: CustomEvent[] = [];
    el.addEventListener('civ-file-unlock', (e: CustomEvent) => events.push(e));

    const unlockBtn = el.querySelector('[data-file-unlock] civ-action-button')!;
    unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await elementUpdated(el);

    expect(events).toHaveLength(0);
    expect(el._files[0].status).toBe('locked');
  });

  it('re-prompts with the incorrect-password error when the consumer reports a failure', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    // Consumer flow: user submitted, decrypt failed, consumer re-locks with error
    el.setFileStatus(0, 'locked', { error: 'Incorrect password. Try again.' });
    await elementUpdated(el);

    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    expect(passwordInput.getAttribute('error')).toBe('Incorrect password. Try again.');
  });

  it('does not retain the password after unlock dispatch', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    el._addFiles([file]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    passwordInput.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: 'sensitive-dob-password' },
      bubbles: true,
    }));
    await elementUpdated(el);

    expect(el._passwordEntries.get(el._files[0].file)).toBe('sensitive-dob-password');

    const unlockBtn = el.querySelector('[data-file-unlock] civ-action-button')!;
    unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await elementUpdated(el);

    // Password buffer cleared so it doesn't linger in component memory
    expect(el._passwordEntries.get(el._files[0].file)).toBeUndefined();
  });

  it('clears the password buffer when the file is removed mid-unlock', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const fileRef = el._files[0].file;
    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    passwordInput.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: 'patient-dob' },
      bubbles: true,
    }));
    await elementUpdated(el);
    expect(el._passwordEntries.get(fileRef)).toBe('patient-dob');

    el.removeFile(0);
    await elementUpdated(el);
    expect(el._passwordEntries.get(fileRef)).toBeUndefined();
  });

  it('hides the unlock affordance when the file is readonly', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" readonly></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    // The unlock block still renders (it's inside __content, not __actions),
    // but the disabled state cascades from the host
    const unlockBlock = el.querySelector('[data-file-unlock]');
    expect(unlockBlock).not.toBeNull();
  });

  it('announces "Unlocking {name}" when unlock fires', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'med.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const announceSpy = vi.spyOn(el, 'announce');

    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    passwordInput.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: 'pw' },
      bubbles: true,
    }));
    await elementUpdated(el);

    const unlockBtn = el.querySelector('[data-file-unlock] civ-action-button')!;
    unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await elementUpdated(el);

    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('med.pdf'));
  });

  it('Enter in the password field submits the unlock', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const events: CustomEvent[] = [];
    el.addEventListener('civ-file-unlock', (e: CustomEvent) => events.push(e));

    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    passwordInput.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: 'pw' },
      bubbles: true,
    }));
    await elementUpdated(el);

    passwordInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    }));
    await elementUpdated(el);

    expect(events).toHaveLength(1);
    expect(events[0].detail.password).toBe('pw');
  });

  it('contextualizes the password input label with the file name', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'patient-record.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    expect(passwordInput.getAttribute('label')).toBe('Password to unlock patient-record.pdf');
    // Hint dropped — label carries the context, no double-information
    expect(passwordInput.hasAttribute('hint')).toBe(false);
  });

  it('announces "Enter a password" + focuses the input when Unlock is clicked with no password', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const announceSpy = vi.spyOn(el, 'announce');
    const events: CustomEvent[] = [];
    el.addEventListener('civ-file-unlock', (e: CustomEvent) => events.push(e));

    const unlockBtn = el.querySelector('[data-file-unlock] civ-action-button')!;
    unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await elementUpdated(el);

    expect(events).toHaveLength(0);
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('Enter a password'));
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('a.pdf'));
  });

  it('moves focus to the row\'s Cancel button after unlock', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);

    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    passwordInput.dispatchEvent(new CustomEvent('civ-input', {
      detail: { value: 'pw' },
      bubbles: true,
    }));
    await elementUpdated(el);

    const unlockBtn = el.querySelector('[data-file-unlock] civ-action-button')!;
    unlockBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Settle: parent updateComplete, then child civ-action-button's render,
    // then the queued focus call inside _afterUpdate's async fn.
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    const actions = el.querySelector('.civ-file-item__actions')!;
    const focusTarget = actions.querySelector('civ-action-button button');
    expect(focusTarget).not.toBeNull();
    // Document active element should be inside the actions cluster
    expect(actions.contains(document.activeElement)).toBe(true);
  });
});

describe('civ-file-upload setFileStatus error-clearing', () => {
  it('clears stale file.error when transitioning without opts.error', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'error', { error: 'Server returned 503' });
    await elementUpdated(el);
    expect(el._files[0].error).toBe('Server returned 503');

    // Server now says "actually that file is encrypted" — transition without
    // opts.error must clear the stale 503 message
    el.setFileStatus(0, 'locked');
    await elementUpdated(el);
    expect(el._files[0].error).toBeUndefined();

    // Password input renders with no error
    const passwordInput = el.querySelector('[data-file-unlock] civ-text-input')!;
    expect(passwordInput.getAttribute('error')).toBe('');
  });

  it('preserves file.error when opts.error is passed explicitly', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    el.setFileStatus(0, 'locked', { error: 'Incorrect password. Try again.' });
    await elementUpdated(el);
    expect(el._files[0].error).toBe('Incorrect password. Try again.');
  });

  it('uses immutable file-row updates (array element identity changes)', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    const before = el._files[0];
    el.setFileStatus(0, 'uploading', { progress: 50 });
    await elementUpdated(el);
    const after = el._files[0];
    expect(after).not.toBe(before);
    expect(after.file).toBe(before.file);
    expect(after.status).toBe('uploading');
    expect(after.progress).toBe(50);
  });
});

describe('civ-file-upload dragenter/dragleave depth tracking', () => {
  // jsdom has no DragEvent constructor — exercise handlers directly with
  // shape-compatible event mocks. The depth-tracking logic is the unit
  // under test, not DOM event dispatch.
  const mockDragEvent = (relatedTarget: EventTarget | null = document.body) => ({
    preventDefault: () => {},
    relatedTarget,
  } as DragEvent);

  it('keeps the dropzone highlighted when the cursor moves between child spans', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    // User enters the dropzone (parent) → depth 1, dragging=true
    el._onDragEnter(mockDragEvent());
    await elementUpdated(el);
    expect(el._dragging).toBe(true);

    // Cursor moves to a child span: enter fires on child (depth 2),
    // leave fires on parent (depth 1). Still inside → highlight stays.
    el._onDragEnter(mockDragEvent());
    el._onDragLeave(mockDragEvent());
    await elementUpdated(el);
    expect(el._dragging).toBe(true);
    expect(el._dragDepth).toBe(1);
  });

  it('drops the highlight only when the depth counter returns to zero', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    el._onDragEnter(mockDragEvent());
    await elementUpdated(el);
    expect(el._dragging).toBe(true);

    el._onDragLeave(mockDragEvent());
    await elementUpdated(el);
    expect(el._dragging).toBe(false);
    expect(el._dragDepth).toBe(0);
  });

  it('resets depth + highlight when the cursor exits the document (relatedTarget=null)', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    el._onDragEnter(mockDragEvent());
    el._onDragEnter(mockDragEvent());
    await elementUpdated(el);
    expect(el._dragDepth).toBe(2);

    el._onDragLeave(mockDragEvent(null));
    await elementUpdated(el);
    expect(el._dragging).toBe(false);
    expect(el._dragDepth).toBe(0);
  });

  it('resets depth on drop', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;

    el._onDragEnter(mockDragEvent());
    el._onDragEnter(mockDragEvent());
    await elementUpdated(el);
    expect(el._dragDepth).toBe(2);

    // Drop resets depth even though we got 2 enters
    el._onDrop({ preventDefault: () => {}, dataTransfer: { files: [] } } as unknown as DragEvent);
    await elementUpdated(el);
    expect(el._dragDepth).toBe(0);
    expect(el._dragging).toBe(false);
  });
});

describe('civ-file-upload compact variant', () => {
  it('compact + single: trigger shows the filename, no list rendered', async () => {
    const el = await fixture('<civ-file-upload label="Upload" variant="compact" name="doc"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'report.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    const triggerText = el.querySelector('.civ-input')!.textContent!.trim();
    expect(triggerText).toContain('report.pdf');
    // No list — the trigger alone shows the chosen file
    expect(el.querySelector('ul.civ-list-none')).toBeNull();
    expect(el.querySelector('.civ-file-item')).toBeNull();
  });

  it('compact + multiple + N>1: trigger shows the count summary, list renders for per-file remove', async () => {
    const el = await fixture('<civ-file-upload label="Upload" variant="compact" multiple name="doc"></civ-file-upload>') as any;
    el._addFiles([
      new File(['a'], 'a.pdf', { type: 'application/pdf' }),
      new File(['b'], 'b.pdf', { type: 'application/pdf' }),
      new File(['c'], 'c.pdf', { type: 'application/pdf' }),
    ]);
    await elementUpdated(el);

    // Trigger shows "3 files chosen", not the comma-joined names
    const triggerText = el.querySelector('.civ-input')!.textContent!.trim();
    expect(triggerText).toBe('3 files chosen');

    // File list IS rendered so the user can remove individual files
    expect(el.querySelector('ul.civ-list-none')).not.toBeNull();
    expect(el.querySelectorAll('.civ-file-item')).toHaveLength(3);
    expect(el.querySelectorAll('[data-file-remove]')).toHaveLength(3);
  });

  it('compact + multiple + 1: trigger shows the filename (matches single-file UX)', async () => {
    const el = await fixture('<civ-file-upload label="Upload" variant="compact" multiple name="doc"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'only.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    const triggerText = el.querySelector('.civ-input')!.textContent!.trim();
    expect(triggerText).toBe('only.pdf');
    // List still renders so the user can still remove the single file
    expect(el.querySelectorAll('.civ-file-item')).toHaveLength(1);
  });

  it('compact button has an accessible name from this.label', async () => {
    const el = await fixture('<civ-file-upload label="Upload your tax return" variant="compact" name="tax"></civ-file-upload>') as any;
    const button = el.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Upload your tax return');
  });

  it('compact variant exposes aria-required and aria-invalid on the button', async () => {
    const el = await fixture('<civ-file-upload label="Upload" variant="compact" name="doc" required error="Required field"></civ-file-upload>') as any;
    const button = el.querySelector('button')!;
    expect(button.getAttribute('aria-required')).toBe('true');
    expect(button.getAttribute('aria-invalid')).toBe('true');
  });

  it('compact variant uses BEM modifier classes instead of inline border-radius styles', async () => {
    const el = await fixture('<civ-file-upload label="Upload" variant="compact" name="doc"></civ-file-upload>') as any;
    const input = el.querySelector('.civ-input')!;
    const action = el.querySelector('.civ-action-btn')!;
    expect(input.classList.contains('civ-input--joined-end')).toBe(true);
    expect(action.classList.contains('civ-action-btn--joined-start')).toBe(true);
    // No inline styles — modifier classes carry the border / radius overrides
    expect(input.getAttribute('style')).toBeNull();
    expect(action.getAttribute('style')).toBeNull();
  });
});

describe('civ-file-upload status icons are aria-hidden', () => {
  it('hides the success icon from assistive tech (filename + announce convey the state)', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'success');
    await elementUpdated(el);

    const icon = el.querySelector('civ-icon[name="check-circle"]')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('hides the error icon from assistive tech', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);
    el.setFileStatus(0, 'error', { error: 'Server timeout' });
    await elementUpdated(el);

    const icon = el.querySelector('civ-icon[name="error"]')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('civ-file-upload hidden input', () => {
  it('does not carry the required attribute (would be unfocusable on submit)', async () => {
    const el = await fixture('<civ-file-upload label="Upload" name="doc" required></civ-file-upload>') as any;
    const hidden = el.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hidden.hasAttribute('required')).toBe(false);
    // aria-required still surfaces on the dropzone for AT messaging
    const dropzone = el.querySelector('.civ-dropzone')!;
    expect(dropzone.getAttribute('aria-required')).toBe('true');
  });
});

describe('civ-file-upload interactions', () => {
  afterEach(cleanupFixtures);

  it('clicking the dropzone forwards to the hidden file input', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    const dropzone = el.querySelector('.civ-dropzone') as HTMLButtonElement;
    dropzone.click();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('disabled dropzone click does not forward to the hidden input', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" disabled></civ-file-upload>') as any;
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    el._onDropzoneClick();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('dragover sets dragging state', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._onDragOver({ preventDefault: () => {} });
    await elementUpdated(el);
    expect(el._dragging).toBe(true);
  });

  it('dragover does not set dragging when disabled', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" disabled></civ-file-upload>') as any;
    el._onDragOver({ preventDefault: () => {} });
    expect(el._dragging).toBe(false);
  });

  it('dragleave clears dragging state', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._dragging = true;
    el._onDragLeave();
    expect(el._dragging).toBe(false);
  });

  it('show-all expander toggles _showAllFiles state', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs" multiple></civ-file-upload>') as any;
    // 6 files exceeds the default _FILE_LIST_LIMIT of 5
    const files = Array.from({ length: 6 }, (_, i) =>
      new File(['x'], `f${i}.pdf`, { type: 'application/pdf' })
    );
    el._addFiles(files);
    await elementUpdated(el);

    expect(el._showAllFiles).toBe(false);
    el._onShowAllFiles();
    await elementUpdated(el);
    expect(el._showAllFiles).toBe(true);
  });

  it('_onFileSelect forwards files from the input event to _addFiles', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);
    expect(el._files.length).toBe(1);
    expect(el._files[0].name).toBe('a.pdf');
  });

  it('cancelUpload aborts the controller, marks error, fires civ-upload-cancel', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    el._addFiles([new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    await elementUpdated(el);

    const ctrl = el.getAbortController(0);
    const events: any[] = [];
    el.addEventListener('civ-upload-cancel', (e: any) => events.push(e.detail));

    el._cancelUpload(0);
    await elementUpdated(el);

    expect(ctrl.signal.aborted).toBe(true);
    expect(el._files[0].status).toBe('error');
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('a.pdf');
  });

  it('cancelUpload is a no-op for an out-of-range index', async () => {
    const el = await fixture('<civ-file-upload label="Docs" name="docs"></civ-file-upload>') as any;
    expect(() => el._cancelUpload(99)).not.toThrow();
  });

  it('wires hint and error IDs into aria-describedby when chrome is set', async () => {
    const el = await fixture(
      '<civ-file-upload label="Upload" hint="PDF only" error="Required" name="docs"></civ-file-upload>',
    );
    const dropzone = el.querySelector('.civ-dropzone') as HTMLElement;
    const describedBy = dropzone.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(' ').filter(Boolean);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});

describe('civ-file-upload readonly', () => {
  it('hides the upload trigger when readonly', async () => {
    const el = await fixture('<civ-file-upload legend="Upload" readonly></civ-file-upload>');
    // The choose-file button only renders when not readonly.
    expect(el.querySelector('.civ-dropzone__trigger')).toBeNull();
  });

  it('disables the file input when readonly', async () => {
    const el = await fixture('<civ-file-upload legend="Upload" readonly></civ-file-upload>');
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
