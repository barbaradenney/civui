import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-modal.js';

afterEach(() => {
  cleanupFixtures();
  document.body.style.overflow = '';
});

describe('civ-modal', () => {
  it('renders a native dialog element', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    const dialog = el.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog!.tagName).toBe('DIALOG');
  });

  it('dialog is closed by default', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    const dialog = el.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
  });

  it('renders heading text and gives it a unique id', async () => {
    const el = await fixture('<civ-modal heading="Confirm action" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('Confirm action');
    // Heading ID is generated per-instance (not the old hardcoded
    // `civ-modal-heading`) so two modals on the same page don't
    // collide on aria-labelledby.
    expect(heading!.id).toMatch(/^civ-modal-[\w-]+-heading$/);
  });

  it('sets aria-labelledby to the heading id when heading is present', async () => {
    const el = await fixture('<civ-modal heading="My Dialog" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    const heading = el.querySelector('[role="heading"]');
    expect(dialog!.getAttribute('aria-labelledby')).toBe(heading!.id);
  });

  it('two open modals on the page have unique heading ids', async () => {
    const a = await fixture('<civ-modal heading="A" open><p>A</p></civ-modal>');
    const b = await fixture('<civ-modal heading="B" open><p>B</p></civ-modal>');
    await elementUpdated(a);
    await elementUpdated(b);
    const idA = a.querySelector('[role="heading"]')!.id;
    const idB = b.querySelector('[role="heading"]')!.id;
    expect(idA).not.toBe(idB);
  });

  it('does not set aria-labelledby when heading is empty', async () => {
    const el = await fixture('<civ-modal open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    expect(dialog!.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('uses aria-label as fallback when no heading', async () => {
    const el = await fixture('<civ-modal label="Confirmation dialog" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    expect(dialog!.getAttribute('aria-label')).toBe('Confirmation dialog');
  });
});

describe('civ-modal close behavior', () => {
  it('fires civ-close on cancel event (Escape)', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('prevents Escape close when no-escape-close is set', async () => {
    const el = await fixture('<civ-modal heading="Test" open no-escape-close><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);

    expect(handler).not.toHaveBeenCalled();
    expect(cancelEvent.defaultPrevented).toBe(true);
  });

  it('fires civ-close on native close event', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('close'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire close on backdrop click when no-backdrop-close', async () => {
    const el = await fixture('<civ-modal heading="Test" open no-backdrop-close><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    // Simulate click directly on dialog element (backdrop area)
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: dialog });
    dialog.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('civ-modal close button', () => {
  it('shows close button by default', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-modal__close')).not.toBeNull();
  });

  it('hides close button when no-close-button', async () => {
    const el = await fixture('<civ-modal heading="Test" open no-close-button><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-modal__close')).toBeNull();
  });

  it('fires civ-close when close button clicked', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const closeBtn = el.querySelector('.civ-modal__close') as HTMLElement;
    closeBtn.click();
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('civ-modal body scroll lock', () => {
  it('locks body scroll when open', async () => {
    await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>') as any;
    await elementUpdated(el);

    el.open = false;
    await elementUpdated(el);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores the prior body overflow value rather than clearing it', async () => {
    // Host page set its own inline overflow before the modal opened.
    document.body.style.overflow = 'visible';

    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>') as any;
    await elementUpdated(el);
    expect(document.body.style.overflow).toBe('hidden');

    el.open = false;
    await elementUpdated(el);
    // Modal must restore the prior value, not blank it.
    expect(document.body.style.overflow).toBe('visible');
  });
});

describe('civ-modal slots', () => {
  it('renders footer slot when content is present', async () => {
    const el = await fixture(`
      <civ-modal heading="Test" open>
        <p>Body</p>
        <div data-modal-footer>
          <button>OK</button>
        </div>
      </civ-modal>
    `);
    await elementUpdated(el);
    expect(el.querySelector('[data-civ-modal-footer]')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-modal spacing', () => {
  it('defaults to spacing="default" with no host attribute', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect((el as unknown as { spacing: string }).spacing).toBe('default');
    expect(el.getAttribute('spacing')).toBe('default');
  });

  it('reflects spacing="sm" to the host attribute', async () => {
    const el = await fixture('<civ-modal heading="Test" spacing="sm"><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect((el as unknown as { spacing: string }).spacing).toBe('sm');
    expect(el.getAttribute('spacing')).toBe('sm');
  });

  it('keeps dialog + header/body/footer structure across density changes', async () => {
    const el = await fixture(`
      <civ-modal heading="Test" spacing="sm" open>
        <p>Body content</p>
        <div data-modal-footer><button>OK</button></div>
      </civ-modal>
    `);
    await elementUpdated(el);
    expect(el.querySelector('dialog.civ-modal')).not.toBeNull();
    expect(el.querySelector('.civ-modal__header')).not.toBeNull();
    expect(el.querySelector('.civ-modal__body')).not.toBeNull();
    expect(el.querySelector('.civ-modal__footer')).not.toBeNull();
  });
});

describe('civ-modal required decision', () => {
  it('blocks all close methods when fully locked', async () => {
    const el = await fixture(
      '<civ-modal heading="Confirm" open no-close-button no-backdrop-close no-escape-close><p>Content</p></civ-modal>'
    );
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    // No close button
    expect(el.querySelector('.civ-modal__close')).toBeNull();

    // Escape blocked
    const dialog = el.querySelector('dialog')!;
    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);
    expect(cancelEvent.defaultPrevented).toBe(true);

    // No close event fired
    expect(handler).not.toHaveBeenCalled();
  });
});
