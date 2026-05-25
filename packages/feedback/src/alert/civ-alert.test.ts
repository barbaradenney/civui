import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-alert.js';
import type { CivAlert, AlertIntent } from './civ-alert.js';

afterEach(cleanupFixtures);

// Tailwind content-scanner protection (`pnpm lint:purged-variants`).
// civ-alert builds card-style classes via template literal:
//   civ-alert--style-primary
//   civ-alert--style-secondary
//   civ-alert--style-tertiary

describe('civ-alert', () => {
  it('renders with default info variant', async () => {
    const el = await fixture('<civ-alert>This is informational.</civ-alert>');

    const alert = el.querySelector('.civ-alert');
    expect(alert).not.toBeNull();
    expect(alert!.className).toContain('civ-alert--info');
  });

  it('renders info variant with correct classes', async () => {
    const el = await fixture('<civ-alert intent="info">Info message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--info');
  });

  it('renders warning variant with correct classes', async () => {
    const el = await fixture('<civ-alert intent="warning">Warning message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--warning');
  });

  it('renders error variant with correct classes', async () => {
    const el = await fixture('<civ-alert intent="error">Error message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--error');
  });

  it('renders success variant with correct classes', async () => {
    const el = await fixture('<civ-alert intent="success">Success message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--success');
  });

  it('renders neutral variant with correct classes', async () => {
    const el = await fixture('<civ-alert intent="neutral">Neutral message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--neutral');
  });

  it('uses role="status" on neutral variant', async () => {
    const el = await fixture('<civ-alert intent="neutral">Neutral.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('status');
  });

  it('uses role="status" on info variant', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    const alert = el.querySelector('[role="status"]');
    expect(alert).not.toBeNull();
  });

  it('uses role="alert" on error variant', async () => {
    const el = await fixture('<civ-alert intent="error">Error.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('alert');
  });

  it('uses role="status" on warning variant', async () => {
    const el = await fixture('<civ-alert intent="warning">Warning.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('status');
  });

  it('uses role="status" on success variant', async () => {
    const el = await fixture('<civ-alert intent="success">Success.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('status');
  });

  // prefix-slot tests
  it('routes data-civ-alert-prefix children into the prefix slot, above the heading', async () => {
    const el = await fixture(`
      <civ-alert heading="Application status">
        <civ-badge data-civ-alert-prefix label="In review"></civ-badge>
        <p>Body text.</p>
      </civ-alert>
    `);
    const prefix = el.querySelector('.civ-alert__prefix')!;
    expect(prefix).not.toBeNull();
    expect(prefix.querySelector('civ-badge')).not.toBeNull();
    // Heading sits after the prefix slot in source order.
    const heading = el.querySelector('.civ-alert__heading')!;
    const order = prefix.compareDocumentPosition(heading);
    // DOCUMENT_POSITION_FOLLOWING = heading is after prefix.
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('leaves the prefix wrapper empty when no children are routed to it', async () => {
    const el = await fixture('<civ-alert heading="Standalone">Body.</civ-alert>');
    const prefix = el.querySelector('.civ-alert__prefix')!;
    expect(prefix).not.toBeNull();
    expect(prefix.children.length).toBe(0);
  });

  // heading tests
  it('renders heading with role="heading" when provided', async () => {
    const el = await fixture('<civ-alert heading="Important">Body text.</civ-alert>');

    const heading = el.querySelector('.civ-alert__heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Important');
    expect(heading!.getAttribute('role')).toBe('heading');
    expect(heading!.getAttribute('aria-level')).toBe('4');
  });

  it('renders heading with custom level', async () => {
    const el = await fixture('<civ-alert heading="Title" heading-level="2">Body.</civ-alert>');

    const heading = el.querySelector('.civ-alert__heading')!;
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('clamps heading level to valid range', async () => {
    const el = await fixture('<civ-alert heading="Title" heading-level="1">Body.</civ-alert>') as CivAlert;

    const heading = el.querySelector('.civ-alert__heading')!;
    // Level 1 is clamped to 2
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('hides heading when slim is true', async () => {
    const el = await fixture('<civ-alert heading="Important" slim>Body text.</civ-alert>');

    const heading = el.querySelector('.civ-alert__heading');
    expect(heading).toBeNull();
  });

  // aria-labelledby vs aria-label
  it('uses aria-labelledby pointing to heading when heading is present', async () => {
    const el = await fixture('<civ-alert heading="Important">Body.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    const headingEl = el.querySelector('.civ-alert__heading')!;
    expect(alert.getAttribute('aria-labelledby')).toBe(headingEl.id);
    expect(alert.hasAttribute('aria-label')).toBe(false);
  });

  it('uses aria-label fallback when no heading', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('aria-label')).toBe('Informational alert');
    expect(alert.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('uses aria-label with variant name when no heading', async () => {
    const el = await fixture('<civ-alert intent="error">Error.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('aria-label')).toBe('Error alert');
  });

  it('uses aria-label when slim hides heading', async () => {
    const el = await fixture('<civ-alert heading="Title" slim>Body.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('aria-label')).toBe('Informational alert');
    expect(alert.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('applies sm modifier class when slim is true', async () => {
    const el = await fixture('<civ-alert slim>Compact message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--sm');
  });

  it('applies sm modifier class when spacing="sm"', async () => {
    const el = await fixture('<civ-alert spacing="sm">Compact message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--sm');
  });

  it('shows dismiss button when dismissible is true', async () => {
    const el = await fixture('<civ-alert dismissible>Dismissible alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn');
    expect(btn).not.toBeNull();
  });

  it('hides dismiss button when dismissible is false', async () => {
    const el = await fixture('<civ-alert>Non-dismissible alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn');
    expect(btn).toBeNull();
  });

  it('fires civ-dismiss event on dismiss click', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-dismiss', handler as EventListener);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('removes element from DOM on dismiss', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const parent = el.parentElement!;
    expect(parent.contains(el)).toBe(true);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    // Removal is deferred via queueMicrotask for screen reader announcement
    await new Promise((r) => queueMicrotask(r));
    expect(parent.contains(el)).toBe(false);
  });

  it('prevents dismiss when civ-dismiss event is cancelled', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');
    const parent = el.parentElement!;

    el.addEventListener('civ-dismiss', (e) => e.preventDefault());

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    await new Promise((r) => queueMicrotask(r));
    expect(parent.contains(el)).toBe(true);
  });

  it('dismiss button has aria-label', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn')!;
    expect(btn.getAttribute('aria-label')).toBe('Dismiss alert');
  });

  it('renders the dismiss button as a real <button> so the global focus ring applies', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn')!;
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders body content with civ-alert__body class', async () => {
    const el = await fixture('<civ-alert>This is the body text.</civ-alert>');

    const body = el.querySelector('.civ-alert__body');
    expect(body).not.toBeNull();
    expect(body!.textContent).toContain('This is the body text.');
  });

  // label prop tests
  it('uses label prop as body text', async () => {
    const el = await fixture('<civ-alert label="From label prop."></civ-alert>');

    expect(el.textContent).toContain('From label prop.');
  });

  it('label prop takes precedence over child text', async () => {
    const el = await fixture('<civ-alert label="Label wins">Child text</civ-alert>');

    expect(el.textContent).toContain('Label wins');
  });

  it('updates body when label prop changes', async () => {
    const el = await fixture('<civ-alert label="Original"></civ-alert>') as CivAlert;

    el.label = 'Updated';
    await elementUpdated(el);

    expect(el.textContent).toContain('Updated');
  });

  it('fires analytics event on dismiss', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-alert');
    expect(detail.action).toBe('dismiss');
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-alert dismissible disable-analytics>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('clamps heading level to upper bound of 6', async () => {
    const el = await fixture('<civ-alert heading="Title" heading-level="9">Body.</civ-alert>') as CivAlert;

    const heading = el.querySelector('.civ-alert__heading')!;
    expect(heading.getAttribute('aria-level')).toBe('6');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('.civ-alert')).not.toBeNull();
  });

  // ── Collapsible mode ────────────────────────────────────────
  describe('collapsible mode', () => {
    it('wraps heading + body in <details>/<summary> when collapsible + heading are set', async () => {
      const el = await fixture(
        '<civ-alert collapsible heading="Details">Body content.</civ-alert>',
      );
      const details = el.querySelector('details.civ-alert__details');
      expect(details).not.toBeNull();
      const summary = details!.querySelector('summary.civ-alert__summary');
      expect(summary).not.toBeNull();
      // Heading is inside summary (the toggle surface).
      expect(summary!.querySelector('.civ-alert__heading')?.textContent).toBe('Details');
      // Body is a sibling of summary (collapses with the <details>).
      expect(details!.querySelector('.civ-alert__body')?.textContent).toContain('Body content.');
      expect(el.querySelector('.civ-alert')?.classList.contains('civ-alert--collapsible')).toBe(true);
    });

    it('starts closed by default and reflects the open attribute', async () => {
      const el = await fixture<CivAlert>(
        '<civ-alert collapsible heading="Details">Body.</civ-alert>',
      );
      expect(el.open).toBe(false);
      expect(el.hasAttribute('open')).toBe(false);
      const details = el.querySelector('details.civ-alert__details') as HTMLDetailsElement;
      expect(details.open).toBe(false);
    });

    it('starts open when open attribute is set on the host', async () => {
      const el = await fixture<CivAlert>(
        '<civ-alert collapsible open heading="Details">Body.</civ-alert>',
      );
      expect(el.open).toBe(true);
      const details = el.querySelector('details.civ-alert__details') as HTMLDetailsElement;
      expect(details.open).toBe(true);
    });

    it('fires civ-toggle on expand and collapse', async () => {
      const el = await fixture<CivAlert>(
        '<civ-alert collapsible heading="Details">Body.</civ-alert>',
      );
      const handler = vi.fn();
      el.addEventListener('civ-toggle', handler);
      const details = el.querySelector('details.civ-alert__details') as HTMLDetailsElement;
      details.open = true;
      details.dispatchEvent(new Event('toggle'));
      await elementUpdated(el);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail).toEqual({ open: true });
      expect(el.open).toBe(true);

      details.open = false;
      details.dispatchEvent(new Event('toggle'));
      await elementUpdated(el);
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler.mock.calls[1][0].detail).toEqual({ open: false });
    });

    it('renders close button alongside summary when collapsible + dismissible', async () => {
      const el = await fixture(
        '<civ-alert collapsible dismissible heading="Details">Body.</civ-alert>',
      );
      const details = el.querySelector('details.civ-alert__details');
      const closeBtn = el.querySelector('.civ-close-btn');
      expect(details).not.toBeNull();
      expect(closeBtn).not.toBeNull();
      // The close button must NOT be inside the summary — otherwise
      // clicking it would also toggle the details.
      expect(closeBtn!.closest('summary')).toBeNull();
    });

    it('dismiss click stops propagation so it does not toggle a collapsible alert', async () => {
      const el = await fixture<CivAlert>(
        '<civ-alert collapsible dismissible heading="Details">Body.</civ-alert>',
      );
      const toggleHandler = vi.fn();
      el.addEventListener('civ-toggle', toggleHandler);
      const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
      btn.click();
      // dismiss may microtask-defer removal; sync check that no
      // toggle fired during the dismiss click itself.
      expect(toggleHandler).not.toHaveBeenCalled();
    });

    it('falls back to non-collapsible render with a dev warning when heading is missing', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Reset the devWarn dedupe so this test always sees the warning even
      // if another test in the file triggered the same key.
      const { resetDevWarnDedupe } = await import('@civui/core');
      resetDevWarnDedupe();
      const el = await fixture('<civ-alert collapsible>Body with no heading.</civ-alert>');
      expect(el.querySelector('details.civ-alert__details')).toBeNull();
      expect(el.querySelector('.civ-alert__body')?.textContent).toContain('Body with no heading.');
      expect(warn).toHaveBeenCalled();
      const message = warn.mock.calls[0]?.[0] as string;
      expect(message).toContain('civ-alert');
      expect(message).toContain('collapsible');
      warn.mockRestore();
    });
  });

  // ── Full-width site banner mode ─────────────────────────────
  describe('full-width mode', () => {
    it('applies the civ-alert--full-width class', async () => {
      const el = await fixture('<civ-alert full-width heading="Site notice">Body.</civ-alert>');
      expect(el.querySelector('.civ-alert')?.classList.contains('civ-alert--full-width')).toBe(true);
    });

    it('switches role to "region" regardless of variant (landmark, not live region)', async () => {
      // role="alert" / role="status" would re-announce the banner on
      // every page navigation — wrong for a persistent site-wide notice.
      const cases: AlertIntent[] = ['info', 'warning', 'error', 'success', 'neutral'];
      for (const variant of cases) {
        const el = await fixture(
          `<civ-alert full-width intent="${variant}" heading="Site notice">Body.</civ-alert>`,
        );
        expect(el.querySelector('.civ-alert')?.getAttribute('role')).toBe('region');
      }
    });

    it('uses aria-label (from heading) instead of aria-labelledby in full-width mode', async () => {
      const el = await fixture(
        '<civ-alert full-width heading="System maintenance">Body.</civ-alert>',
      );
      const banner = el.querySelector('.civ-alert')!;
      expect(banner.getAttribute('aria-label')).toBe('System maintenance');
      // No aria-labelledby because a landmark's name comes from
      // aria-label directly (avoids depending on heading-id lookup
      // across nested constraint).
      expect(banner.getAttribute('aria-labelledby')).toBeNull();
    });

    it('falls back to the variant label for aria-label when no heading', async () => {
      const el = await fixture(
        '<civ-alert full-width intent="warning">Body without heading.</civ-alert>',
      );
      const banner = el.querySelector('.civ-alert')!;
      // The variant-label string ("Warning", "Information", etc.)
      // becomes the landmark's accessible name.
      expect(banner.getAttribute('aria-label')).toBeTruthy();
      expect(banner.getAttribute('aria-label')?.length).toBeGreaterThan(0);
    });

    it('reflects full-width to the host attribute', async () => {
      const el = await fixture<CivAlert>('<civ-alert>Body.</civ-alert>');
      expect(el.hasAttribute('full-width')).toBe(false);
      el.fullWidth = true;
      await elementUpdated(el);
      expect(el.hasAttribute('full-width')).toBe(true);
    });
  });
});
