import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-image.js';
import type { CivImage } from './civ-image.js';

afterEach(cleanupFixtures);

describe('civ-image', () => {
  it('renders an <img> with the given src and alt', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" alt="A veteran salutes the flag"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/photo.jpg');
    expect(img.getAttribute('alt')).toBe('A veteran salutes the flag');
  });

  it('renders alt="" verbatim for decorative images', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/flourish.svg" alt=""></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.hasAttribute('alt')).toBe(true);
    expect(img.getAttribute('alt')).toBe('');
  });

  it('sets loading="lazy" and decoding="async" by default', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('respects loading="eager" opt-in', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/hero.jpg" alt="hero" loading="eager"></civ-image>',
    );
    expect(el.querySelector('img')!.getAttribute('loading')).toBe('eager');
  });

  it('applies inline aspect-ratio from the ratio prop', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="16:9"></civ-image>',
    );
    const box = el.querySelector<HTMLElement>('.civ-image__box')!;
    expect(box.style.aspectRatio).toBe('16 / 9');
  });

  it('computes aspect-ratio from width/height when ratio="auto"', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" width="800" height="600"></civ-image>',
    );
    const box = el.querySelector<HTMLElement>('.civ-image__box')!;
    expect(box.style.aspectRatio).toBe('800 / 600');
  });

  it('explicit ratio overrides width/height', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" width="800" height="600" ratio="1:1"></civ-image>',
    );
    const box = el.querySelector<HTMLElement>('.civ-image__box')!;
    expect(box.style.aspectRatio).toBe('1 / 1');
  });

  it('forwards intrinsic width/height to the <img>', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" width="800" height="600"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('800');
    expect(img.getAttribute('height')).toBe('600');
  });

  it('thumbnail variant renders the <img> directly (no box wrapper)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/avatar.jpg" alt="John Smith" variant="thumbnail"></civ-image>',
    );
    expect(el.querySelector('.civ-image__box')).toBeNull();
    expect(el.querySelector('img')).not.toBeNull();
  });

  it('reflects variant attribute to the host for CSS targeting', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/avatar.jpg" alt="John" variant="thumbnail"></civ-image>',
    );
    expect(el.getAttribute('variant')).toBe('thumbnail');
  });

  it('reflects size attribute for thumbnails', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/avatar.jpg" alt="John" variant="thumbnail" size="48"></civ-image>',
    );
    expect(el.getAttribute('size')).toBe('48');
  });

  it('reflects rounded attribute', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/avatar.jpg" alt="John" variant="thumbnail" rounded></civ-image>',
    );
    expect(el.hasAttribute('rounded')).toBe(true);
  });

  it('reflects fit attribute for object-fit CSS targeting', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" fit="contain"></civ-image>',
    );
    expect(el.getAttribute('fit')).toBe('contain');
  });

  it('dev-warns when alt is omitted entirely', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImage>('<civ-image src="/x.jpg"></civ-image>');
    const calls = warnSpy.mock.calls.flat().join(' ');
    expect(calls).toContain('civ-image');
    expect(calls).toMatch(/alt/i);
    warnSpy.mockRestore();
  });

  it('does NOT warn when alt is an explicit empty string', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImage>('<civ-image src="/decor.svg" alt=""></civ-image>');
    const altWarnings = warnSpy.mock.calls
      .flat()
      .filter((m) => typeof m === 'string' && m.includes('alt'));
    expect(altWarnings.length).toBe(0);
    warnSpy.mockRestore();
  });

  it('dev-warns when content variant has no ratio and no dimensions', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImage>('<civ-image src="/x.jpg" alt="x"></civ-image>');
    const calls = warnSpy.mock.calls.flat().join(' ');
    expect(calls).toMatch(/ratio|width|height|CLS/i);
    warnSpy.mockRestore();
  });

  it('does NOT warn about dimensions when ratio is set', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImage>('<civ-image src="/x.jpg" alt="x" ratio="16:9"></civ-image>');
    const dimWarnings = warnSpy.mock.calls
      .flat()
      .filter((m) => typeof m === 'string' && /ratio|width|height|CLS/i.test(m));
    expect(dimWarnings.length).toBe(0);
    warnSpy.mockRestore();
  });

  it('does NOT warn about dimensions for thumbnail variant', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImage>(
      '<civ-image src="/avatar.jpg" alt="x" variant="thumbnail"></civ-image>',
    );
    const dimWarnings = warnSpy.mock.calls
      .flat()
      .filter((m) => typeof m === 'string' && /ratio|width|height|CLS/i.test(m));
    expect(dimWarnings.length).toBe(0);
    warnSpy.mockRestore();
  });

  it('updates reactively when src changes', async () => {
    const el = await fixture<CivImage>('<civ-image src="/a.jpg" alt="a"></civ-image>');
    el.src = '/b.jpg';
    await elementUpdated(el);
    expect(el.querySelector('img')!.getAttribute('src')).toBe('/b.jpg');
  });
});
