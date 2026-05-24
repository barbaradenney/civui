import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-drawer.js';

afterEach(() => {
  cleanupFixtures();
  document.body.style.overflow = '';
});

describe('civ-drawer', () => {
  it('renders a native dialog element', async () => {
    const el = await fixture('<civ-drawer heading="Test"><p>Content</p></civ-drawer>');
    const dialog = el.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog!.tagName).toBe('DIALOG');
  });

  it('dialog is closed by default', async () => {
    const el = await fixture('<civ-drawer heading="Test"><p>Content</p></civ-drawer>');
    const dialog = el.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
  });

  it('renders heading text and gives it a unique id', async () => {
    const el = await fixture('<civ-drawer heading="Filters" open><p>Content</p></civ-drawer>');
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('Filters');
    expect(heading!.id).toMatch(/^civ-drawer-[\w-]+-heading$/);
  });

  it('sets aria-labelledby to the heading id when heading is present', async () => {
    const el = await fixture('<civ-drawer heading="Filters" open><p>Content</p></civ-drawer>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    const heading = el.querySelector('[role="heading"]');
    expect(dialog!.getAttribute('aria-labelledby')).toBe(heading!.id);
  });

  it('two open drawers on the page have unique heading ids', async () => {
    const a = await fixture('<civ-drawer heading="A" open><p>A</p></civ-drawer>');
    const b = await fixture('<civ-drawer heading="B" open><p>B</p></civ-drawer>');
    await elementUpdated(a);
    await elementUpdated(b);
    const idA = a.querySelector('[role="heading"]')!.id;
    const idB = b.querySelector('[role="heading"]')!.id;
    expect(idA).not.toBe(idB);
  });

  it('does not set aria-labelledby when heading is empty', async () => {
    const el = await fixture('<civ-drawer open><p>Content</p></civ-drawer>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    expect(dialog!.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('uses aria-label as fallback when no heading (mobile-menu pattern)', async () => {
    const el = await fixture('<civ-drawer label="Main menu" open><nav>nav</nav></civ-drawer>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog');
    expect(dialog!.getAttribute('aria-label')).toBe('Main menu');
  });
});

describe('civ-drawer position', () => {
  it('defaults to start position', async () => {
    const el = await fixture('<civ-drawer heading="Test"><p>Content</p></civ-drawer>') as any;
    expect(el.position).toBe('start');
    const dialog = el.querySelector('dialog')!;
    expect(dialog.classList.contains('civ-drawer--start')).toBe(true);
    expect(dialog.classList.contains('civ-drawer--end')).toBe(false);
  });

  it('renders end-position class when position="end"', async () => {
    const el = await fixture('<civ-drawer position="end" heading="Test"><p>Content</p></civ-drawer>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog')!;
    expect(dialog.classList.contains('civ-drawer--end')).toBe(true);
    expect(dialog.classList.contains('civ-drawer--start')).toBe(false);
  });

  it('reflects position attribute to the host', async () => {
    const el = await fixture('<civ-drawer position="end"></civ-drawer>') as any;
    expect(el.getAttribute('position')).toBe('end');
  });

  it('switches class when position changes at runtime', async () => {
    const el = await fixture('<civ-drawer heading="Test"><p>Content</p></civ-drawer>') as any;
    await elementUpdated(el);
    expect(el.querySelector('dialog')!.classList.contains('civ-drawer--start')).toBe(true);

    el.position = 'end';
    await elementUpdated(el);
    expect(el.querySelector('dialog')!.classList.contains('civ-drawer--end')).toBe(true);
    expect(el.querySelector('dialog')!.classList.contains('civ-drawer--start')).toBe(false);
  });
});

describe('civ-drawer width', () => {
  it('applies the default width as a CSS custom property', async () => {
    const el = await fixture('<civ-drawer heading="Test"></civ-drawer>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog') as HTMLElement;
    // Default schema value is `min(320px, 90vw)`
    expect(dialog.style.getPropertyValue('--civ-drawer-width')).toBe('min(320px, 90vw)');
  });

  it('applies a custom width as a CSS custom property', async () => {
    const el = await fixture('<civ-drawer width="360px" heading="Test"></civ-drawer>');
    await elementUpdated(el);
    const dialog = el.querySelector('dialog') as HTMLElement;
    expect(dialog.style.getPropertyValue('--civ-drawer-width')).toBe('360px');
  });
});

describe('civ-drawer close behavior', () => {
  it('fires civ-close on cancel event (Escape)', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('prevents Escape close when no-escape-close is set', async () => {
    const el = await fixture('<civ-drawer heading="Test" open no-escape-close><p>Content</p></civ-drawer>');
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
    const el = await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    dialog.dispatchEvent(new Event('close'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire close on backdrop click when no-backdrop-close', async () => {
    const el = await fixture('<civ-drawer heading="Test" open no-backdrop-close><p>Content</p></civ-drawer>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const dialog = el.querySelector('dialog')!;
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: dialog });
    dialog.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('civ-drawer close button', () => {
  it('shows close button by default', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-drawer__close')).not.toBeNull();
  });

  it('hides close button when no-close-button', async () => {
    const el = await fixture('<civ-drawer heading="Test" open no-close-button><p>Content</p></civ-drawer>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-drawer__close')).toBeNull();
  });

  it('fires civ-close when close button clicked', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const closeBtn = el.querySelector('.civ-drawer__close') as HTMLElement;
    closeBtn.click();
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('civ-drawer body scroll lock', () => {
  it('locks body scroll when open', async () => {
    await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>') as any;
    await elementUpdated(el);

    el.open = false;
    await elementUpdated(el);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores the prior body overflow value rather than clearing it', async () => {
    document.body.style.overflow = 'visible';

    const el = await fixture('<civ-drawer heading="Test" open><p>Content</p></civ-drawer>') as any;
    await elementUpdated(el);
    expect(document.body.style.overflow).toBe('hidden');

    el.open = false;
    await elementUpdated(el);
    expect(document.body.style.overflow).toBe('visible');
  });
});

describe('civ-drawer slots', () => {
  it('renders default-slot content into the content container', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p class="payload">Body</p></civ-drawer>');
    await elementUpdated(el);
    const content = el.querySelector('[data-civ-drawer-content]')!;
    expect(content.querySelector('.payload')).not.toBeNull();
  });

  it('renders footer slot content into the footer container', async () => {
    const el = await fixture(`
      <civ-drawer heading="Test" open>
        <p>Body</p>
        <div data-drawer-footer>
          <button class="apply">Apply</button>
        </div>
      </civ-drawer>
    `);
    await elementUpdated(el);
    const footer = el.querySelector('[data-civ-drawer-footer]')!;
    expect(footer).not.toBeNull();
    expect(footer.querySelector('.apply')).not.toBeNull();
  });

  it('does not render footer container when no footer slot content is supplied', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p>Body</p></civ-drawer>');
    await elementUpdated(el);
    expect(el.querySelector('[data-civ-drawer-footer]')).toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-drawer heading="Test"><p>Content</p></civ-drawer>');
    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-drawer sticky header & footer', () => {
  it('header is sticky by default', async () => {
    const el = await fixture('<civ-drawer heading="Test" open><p>Body</p></civ-drawer>');
    await elementUpdated(el);
    const header = el.querySelector('.civ-drawer__header')!;
    expect(header.classList.contains('civ-drawer__header--sticky')).toBe(true);
  });

  it('header is not sticky when no-sticky-header is set', async () => {
    const el = await fixture('<civ-drawer heading="Test" open no-sticky-header><p>Body</p></civ-drawer>');
    await elementUpdated(el);
    const header = el.querySelector('.civ-drawer__header')!;
    expect(header.classList.contains('civ-drawer__header--sticky')).toBe(false);
  });

  it('footer is sticky by default when slot is filled', async () => {
    const el = await fixture(`
      <civ-drawer heading="Test" open>
        <p>Body</p>
        <div data-drawer-footer><button>Apply</button></div>
      </civ-drawer>
    `);
    await elementUpdated(el);
    const footer = el.querySelector('.civ-drawer__footer')!;
    expect(footer.classList.contains('civ-drawer__footer--sticky')).toBe(true);
  });

  it('footer is not sticky when no-sticky-footer is set', async () => {
    const el = await fixture(`
      <civ-drawer heading="Test" open no-sticky-footer>
        <p>Body</p>
        <div data-drawer-footer><button>Apply</button></div>
      </civ-drawer>
    `);
    await elementUpdated(el);
    const footer = el.querySelector('.civ-drawer__footer')!;
    expect(footer.classList.contains('civ-drawer__footer--sticky')).toBe(false);
  });

  it('renders header and footer inside the scrollable body container', async () => {
    // Body is the scroll container; sticky positioning requires both
    // header and footer to live inside it.
    const el = await fixture(`
      <civ-drawer heading="Test" open>
        <p>Body</p>
        <div data-drawer-footer><button>Apply</button></div>
      </civ-drawer>
    `);
    await elementUpdated(el);
    const body = el.querySelector('[data-civ-drawer-body]')!;
    expect(body.querySelector('.civ-drawer__header')).not.toBeNull();
    expect(body.querySelector('.civ-drawer__footer')).not.toBeNull();
  });
});
