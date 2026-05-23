import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-skeleton.js';
import type { CivSkeleton } from './civ-skeleton.js';

afterEach(cleanupFixtures);

describe('civ-skeleton', () => {
  it('renders a text-variant placeholder by default', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    const node = el.querySelector('.civ-skeleton')!;
    expect(node).not.toBeNull();
    expect(node.className).toContain('civ-skeleton--text');
  });

  it('applies the heading variant class', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton variant="heading"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--heading')).not.toBeNull();
  });

  it('applies the block variant class', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton variant="block"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--block')).not.toBeNull();
  });

  it('applies the circle variant class', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton variant="circle"></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--circle')).not.toBeNull();
  });

  it('host is aria-hidden so it is never announced', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('defaults to 100% width for text variant', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    expect(node.style.width).toBe('100%');
  });

  it('defaults to 2.5rem width for circle variant', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton variant="circle"></civ-skeleton>');
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    expect(node.style.width).toBe('2.5rem');
  });

  it('respects an explicit width prop', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton width="12rem"></civ-skeleton>');
    const node = el.querySelector<HTMLElement>('.civ-skeleton')!;
    expect(node.style.width).toBe('12rem');
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

  it('updates reactively when variant changes', async () => {
    const el = await fixture<CivSkeleton>('<civ-skeleton></civ-skeleton>');
    expect(el.querySelector('.civ-skeleton--text')).not.toBeNull();
    el.variant = 'block';
    await elementUpdated(el);
    expect(el.querySelector('.civ-skeleton--block')).not.toBeNull();
    expect(el.querySelector('.civ-skeleton--text')).toBeNull();
  });
});
