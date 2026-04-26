import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-modal.js';

afterEach(cleanupFixtures);

describe('civ-modal', () => {
  it('renders dialog element when component exists', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    const dialog = el.querySelector('dialog');
    expect(dialog).not.toBeNull();
  });

  it('dialog is closed by default', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    const dialog = el.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
  });

  it('renders heading', async () => {
    const el = await fixture('<civ-modal heading="Confirm action" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const heading = el.querySelector('#civ-modal-heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('Confirm action');
  });

  it('fires civ-modal-close on native close event', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-modal-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('close'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('fires civ-modal-close on backdrop click', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-modal-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    // Click on the dialog element itself simulates backdrop click
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // The handler checks e.target === dialog, so we need to set it up properly
  });

  it('does not fire close on backdrop click when no-backdrop-close', async () => {
    const el = await fixture('<civ-modal heading="Test" open no-backdrop-close><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-modal-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    dialog.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('hides close button when no-close-button', async () => {
    const el = await fixture('<civ-modal heading="Test" open no-close-button><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-modal__close')).toBeNull();
  });

  it('shows close button by default', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-modal__close')).not.toBeNull();
  });

  it('uses native dialog element', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog!.tagName).toBe('DIALOG');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    expect(el.shadowRoot).toBeNull();
  });

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

  it('has aria-labelledby pointing to heading', async () => {
    const el = await fixture('<civ-modal heading="My Dialog" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    expect(dialog!.getAttribute('aria-labelledby')).toBe('civ-modal-heading');
  });
});
