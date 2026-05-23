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

  it('applies the size class', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0" size="lg"></civ-spinner>');
    await elementUpdated(el);
    const span = el.querySelector('.civ-spinner')!;
    expect(span.className).toContain('civ-spinner--lg');
  });

  it('defaults to md size', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner--md')).not.toBeNull();
  });

  it('sets role="status" and aria-live on the visible wrapper', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    const span = el.querySelector('.civ-spinner')!;
    expect(span.getAttribute('role')).toBe('status');
    expect(span.getAttribute('aria-live')).toBe('polite');
  });

  it('renders the default "Loading…" label as visually-hidden text', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    const sr = el.querySelector('.civ-sr-only')!;
    expect(sr.textContent).toBe('Loading…');
  });

  it('renders a custom label', async () => {
    const el = await fixture<CivSpinner>(
      '<civ-spinner delay="0" label="Saving your application…"></civ-spinner>',
    );
    await elementUpdated(el);
    expect(el.querySelector('.civ-sr-only')!.textContent).toBe('Saving your application…');
  });

  it('marks the SVG as decorative (aria-hidden)', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner delay="0"></civ-spinner>');
    await elementUpdated(el);
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
  });

  it('cancels the pending delay timer when disconnected before paint', async () => {
    const el = await fixture<CivSpinner>('<civ-spinner></civ-spinner>');
    el.remove();
    vi.advanceTimersByTime(500);
    await elementUpdated(el);
    expect(el.querySelector('.civ-spinner')).toBeNull();
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
