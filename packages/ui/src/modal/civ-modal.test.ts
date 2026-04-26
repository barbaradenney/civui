import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-modal.js';

afterEach(() => {
  cleanupFixtures();
  document.body.style.overflow = '';
});

describe('civ-modal', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture('<civ-modal heading="Test"><p>Content</p></civ-modal>');
    expect(el.querySelector('.civ-modal')).toBeNull();
  });

  it('renders dialog when open', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.getAttribute('aria-modal')).toBe('true');
  });

  it('renders heading', async () => {
    const el = await fixture('<civ-modal heading="Confirm action" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    const heading = el.querySelector('#civ-modal-heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('Confirm action');
  });

  it('renders backdrop', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-modal-backdrop')).not.toBeNull();
  });

  it('fires civ-modal-close on Escape', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-modal-close', handler as EventListener);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('fires civ-modal-close on backdrop click', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-modal-close', handler as EventListener);

    const backdrop = el.querySelector('.civ-modal-backdrop') as HTMLElement;
    backdrop.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire close on backdrop click when no-backdrop-close', async () => {
    const el = await fixture('<civ-modal heading="Test" open no-backdrop-close><p>Content</p></civ-modal>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-modal-close', handler as EventListener);

    const backdrop = el.querySelector('.civ-modal-backdrop') as HTMLElement;
    backdrop.click();
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

  it('sets body overflow hidden when open', async () => {
    await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', async () => {
    const el = await fixture('<civ-modal heading="Test" open><p>Content</p></civ-modal>') as any;
    await elementUpdated(el);

    el.open = false;
    await elementUpdated(el);
    expect(document.body.style.overflow).toBe('');
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
});
