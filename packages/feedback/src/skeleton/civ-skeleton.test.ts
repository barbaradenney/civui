import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import { resetDevWarnDedupe } from '@civui/core';
import './civ-skeleton.js';
import type { CivSkeleton } from './civ-skeleton.js';

afterEach(cleanupFixtures);

describe('civ-skeleton', () => {
  // Suppress the dev-warns ("no aria-busy ancestor") that fire on
  // every fixture, except where we explicitly assert against them.
  // Reset the cross-instance dedupe set so each test can independently
  // re-trigger devWarn calls that other components may have fired.
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetDevWarnDedupe();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('renders a text-variant placeholder by default', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    const node = el.querySelector('.civ-skeleton')!;
    expect(node).not.toBeNull();
    expect(node.className).toContain('civ-skeleton--text');
  });

  it('applies the heading variant class', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton shape="heading"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--heading')).not.toBeNull();
  });

  it('applies the block variant class', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton shape="block"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--block')).not.toBeNull();
  });

  it('applies the circle variant class', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton shape="circle"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--circle')).not.toBeNull();
  });

  it('host is aria-hidden so it is never announced', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('preserves an explicit aria-hidden="false" set before mount', async () => {
    const el = document.createElement('civ-skeleton') as CivSkeleton;
    el.setAttribute('aria-hidden', 'false');
    document.body.appendChild(el);
    await elementUpdated(el);
    // Don't clobber the consumer's explicit opt-out.
    expect(el.getAttribute('aria-hidden')).toBe('false');
  });

  it('defaults to 100% width for text variant', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    expect(node.style.width).toBe('100%');
  });

  it('defaults to 2.5rem width for circle variant', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton shape="circle"></civ-skeleton>');
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    expect(node.style.width).toBe('2.5rem');
  });

  it('respects an explicit width prop matching a CSS length pattern', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton width="12rem"></civ-skeleton>');
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    expect(node.style.width).toBe('12rem');
  });

  it('rejects a width that contains extra CSS declarations (injection guard)', async () => {
    const el = await fixture<CivSkeleton>(
      '<civ-skeleton width="100%; background: red"></civ-skeleton>',
    );
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    // Falls back to the default; the injected `background: red` is NOT applied.
    expect(node.style.width).toBe('100%');
    expect(node.style.background).toBe('');
  });

  it('dev-warns on an invalid width', async () => {
    await fixture<CivSkeleton>('<civ-skeleton width="100%; background: red"></civ-skeleton>');
    const widthWarnings = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /width/i.test(m),
    );
    expect(widthWarnings.length).toBeGreaterThan(0);
  });

  it('renders a single line when lines=1', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    expect(el.querySelectorAll('.civ-skeleton--text').length).toBe(1);
    expect(el.querySelector('.civ-skeleton-stack')).toBeNull();
  });

  it('renders N stacked lines when lines>1', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton lines="3"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton-stack')).not.toBeNull();
    expect(el.querySelectorAll('.civ-skeleton--text').length).toBe(3);
  });

  it('narrows the last line to 70% to mimic paragraph ragged-right', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton lines="3"></civ-skeleton>');
    const lines = el.querySelectorAll<HTMLElement>('.civ-skeleton--text');
    expect(lines[0].style.width).toBe('100%');
    expect(lines[2].style.width).toBe('70%');
  });

  it('renders nothing when lines=0', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton lines="0"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton')).toBeNull();
  });

  it('renders nothing when lines is negative', async () => {
    const el = await fixture<CivSkeleton>(
      '<civ-skeleton lines="-2"></civ-skeleton>',
    );
    expect(el.querySelector('.civ-skeleton')).toBeNull();
  });

  it('clamps lines to MAX_LINES (50)', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton lines="9999"></civ-skeleton>');
    expect(el.querySelectorAll('.civ-skeleton--text').length).toBe(50);
  });

  it('updates reactively when variant changes', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--text')).not.toBeNull();
    el.shape = 'block';
    await elementUpdated(el);
    expect(el.querySelector('.civ-skeleton--block')).not.toBeNull();
    expect(el.querySelector('.civ-skeleton--text')).toBeNull();
  });

  it('dev-warns when no ancestor has aria-busy="true"', async () => {
    await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    const busyWarnings = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /aria-busy/i.test(m),
    );
    expect(busyWarnings.length).toBeGreaterThan(0);
  });

  it('does NOT warn when an ancestor has aria-busy="true"', async () => {
    // Build the parent first, then the child — fixture() inserts the
    // markup so connectedCallback runs with the aria-busy already
    // visible on the ancestor.
    await fixture<HTMLElement>(
      '<div aria-busy="true"><civ-skeleton></civ-skeleton></div>',
    );
    const busyWarnings = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /aria-busy/i.test(m),
    );
    expect(busyWarnings.length).toBe(0);
  });
});
