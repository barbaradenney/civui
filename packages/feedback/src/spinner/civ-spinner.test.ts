import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-spinner.js';
import type { CivSpinner } from './civ-spinner.js';

afterEach(cleanupFixtures);

// Tailwind content-scanner protection (`pnpm lint:purged-variants`).
// civ-spinner builds size classes via template literal:
//   civ-spinner--sm  civ-spinner--md  civ-spinner--lg

describe('civ-spinner', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing before the delay elapses', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner></civ-spinner>');
    expect(el.querySelector('.civ-spinner')).toBeNull();
  });

  it('renders the spinner after the delay elapses', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner></civ-spinner>');
    vi.advanceTimersByTime(250);
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner')).not.toBeNull();
  });

  it('renders immediately when delay=0', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner')).not.toBeNull();
  });

  it('applies the sm size class', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0" size="sm"></civ-spinner>');
    await elementUpdated(el);
    const span = el.querySelector('.civ-spinner')!;
    expect(span.className).toContain('civ-spinner--sm');
  });

  it('applies the md size class (default)', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner--md')).not.toBeNull();
  });

  it('applies the lg size class', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0" size="lg"></civ-spinner>');
    await elementUpdated(el);
    const span = el.querySelector('.civ-spinner')!;
    expect(span.className).toContain('civ-spinner--lg');
  });

  it('host gains role="img" + aria-label once visible (so AT users discovering it later hear the label)', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Loading…');
  });

  it('host has NO role/aria-label before delay elapses (pre-visible)', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner></civ-spinner>');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('uses the explicit label when set', async () => {
    const el = await fixture<CivSpinner>(
      '<civ-spinner delay="0" label="Saving your application…"></civ-spinner>',
    );
    await elementUpdated(el);
    expect(el.getAttribute('aria-label')).toBe('Saving your application…');
  });

  it('marks the SVG as decorative (aria-hidden)', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
  });

  it('decorative=true suppresses host role and aria-label', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0" decorative></civ-spinner>');
    await elementUpdated(el);
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-label')).toBe(false);
    // SVG still renders so the visual spinner is preserved.
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('cancels the pending delay timer when disconnected before paint', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner></civ-spinner>');
    el.remove();
    vi.advanceTimersByTime(500);
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner')).toBeNull();
  });

  it('resets visibility + AT state on disconnect so reconnect re-honors the delay contract', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="200"></civ-spinner>');
    vi.advanceTimersByTime(250);
    await elementUpdated(el);
    // Visible + AT semantics applied.
    expect(el.querySelector('.civ-spinner')).not.toBeNull();
    expect(el.getAttribute('role')).toBe('img');

    // Detach.
    el.remove();
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-label')).toBe(false);

    // Reattach. We should NOT see the spinner immediately — the
    // delay timer needs to elapse again on the second mount.
    document.body.appendChild(el);
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner')).toBeNull();

    vi.advanceTimersByTime(250);
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner')).not.toBeNull();
  });

  it('waitForMinDuration resolves immediately when not yet visible', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner></civ-spinner>');
    await expect(el.waitForMinDuration()).resolves.toBeUndefined();
  });

  it('waitForMinDuration holds for the remaining duration once shown', async () => {
    const el = await fixture<CivSpinner>(
      '<civ-spinner delay="0" min-duration="500"></civ-spinner>',
    );
    await elementUpdated(el);
    const promise = el.waitForMinDuration();
    let resolved = false;
    promise.then(() => { resolved = true; });

    vi.advanceTimersByTime(250);
    await Promise.resolve();
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(300);
    await promise;
    expect(resolved).toBe(true);
  });
});
