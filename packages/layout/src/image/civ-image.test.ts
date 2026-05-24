import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-image.js';
import type { CivImage } from './civ-image.js';

afterEach(cleanupFixtures);

describe('civ-image', () => {
  // Most rendering tests don't care about the dev-warn output; the
  // dedicated dev-warn tests below explicitly spy on console.warn.
  // Mock at the suite level so unrelated tests don't flood stderr.
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('renders an <img> with the given src and alt', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" alt="A veteran salutes the flag" ratio="16:9"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/photo.jpg');
    expect(img.getAttribute('alt')).toBe('A veteran salutes the flag');
  });

  it('renders alt="" verbatim for decorative images', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/flourish.svg" alt="" ratio="21:9"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.hasAttribute('alt')).toBe(true);
    expect(img.getAttribute('alt')).toBe('');
  });

  it('omits the alt attribute entirely when alt is undefined (so the bug is visible to QA)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" ratio="1:1"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.hasAttribute('alt')).toBe(false);
  });

  it('sets loading="lazy" and decoding="async" by default', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('respects loading="eager" opt-in', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/hero.jpg" alt="hero" ratio="16:9" loading="eager"></civ-image>',
    );
    expect(el.querySelector('img')!.getAttribute('loading')).toBe('eager');
  });

  it('respects decoding="sync" opt-in', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/hero.jpg" alt="hero" ratio="16:9" decoding="sync"></civ-image>',
    );
    expect(el.querySelector('img')!.getAttribute('decoding')).toBe('sync');
  });

  it('forwards fetch-priority="high" to the <img> as fetchpriority', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/hero.jpg" alt="hero" ratio="16:9" fetch-priority="high"></civ-image>',
    );
    expect(el.querySelector('img')!.getAttribute('fetchpriority')).toBe('high');
  });

  it('omits fetchpriority when value is the "auto" default', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1"></civ-image>',
    );
    expect(el.querySelector('img')!.hasAttribute('fetchpriority')).toBe(false);
  });

  it('forwards crossorigin and referrerpolicy when set', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1" crossorigin="anonymous" referrerpolicy="no-referrer"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('crossorigin')).toBe('anonymous');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('applies inline aspect-ratio from the ratio prop directly on the <img>', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="16:9"></civ-image>',
    );
    const img = el.querySelector<HTMLImageElement>('img')!;
    expect(img.style.aspectRatio).toBe('16 / 9');
  });

  it('computes aspect-ratio from width/height when ratio="auto"', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" width="800" height="600"></civ-image>',
    );
    const img = el.querySelector<HTMLImageElement>('img')!;
    expect(img.style.aspectRatio).toBe('800 / 600');
  });

  it('explicit ratio overrides width/height', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" width="800" height="600" ratio="1:1"></civ-image>',
    );
    const img = el.querySelector<HTMLImageElement>('img')!;
    expect(img.style.aspectRatio).toBe('1 / 1');
  });

  it('forwards intrinsic width/height to the <img>', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" width="800" height="600"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('800');
    expect(img.getAttribute('height')).toBe('600');
  });

  it('drops non-finite width/height (e.g. width="auto") rather than emitting width="NaN"', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1"></civ-image>',
    );
    // Programmatically force NaN as if a consumer passed a non-numeric attr.
    (el as any).width = Number('abc');
    (el as any).height = Number('abc');
    await elementUpdated(el);
    const img = el.querySelector('img')!;
    expect(img.hasAttribute('width')).toBe(false);
    expect(img.hasAttribute('height')).toBe(false);
  });

  it('drops zero width/height (treats as missing, not 0×0)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1" width="0" height="0"></civ-image>',
    );
    const img = el.querySelector('img')!;
    expect(img.hasAttribute('width')).toBe(false);
    expect(img.hasAttribute('height')).toBe(false);
  });

  it('returns nothing when src is empty (no broken-image glyph)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image alt="x" ratio="1:1"></civ-image>',
    );
    expect(el.querySelector('img')).toBeNull();
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
      '<civ-image src="/x.jpg" alt="x" ratio="1:1" fit="contain"></civ-image>',
    );
    expect(el.getAttribute('fit')).toBe('contain');
  });

  // ── Dev-warn behavior ─────────────────────────────────────────

  it('dev-warns when alt is omitted entirely', async () => {
    await fixture<CivImage>('<civ-image src="/x.jpg" ratio="1:1"></civ-image>');
    const altCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /civ-image.*alt/i.test(m),
    );
    expect(altCalls.length).toBeGreaterThan(0);
  });

  it('dev-warns when alt is set then cleared via removeAttribute (catches null, not just undefined)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1"></civ-image>',
    );
    warnSpy.mockClear();
    el.removeAttribute('alt');
    await elementUpdated(el);
    const altCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /civ-image.*alt/i.test(m),
    );
    expect(altCalls.length).toBeGreaterThan(0);
  });

  it('does NOT warn when alt is an explicit empty string', async () => {
    await fixture<CivImage>('<civ-image src="/decor.svg" alt="" ratio="1:1"></civ-image>');
    const altCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /civ-image.*\balt\b/i.test(m),
    );
    expect(altCalls.length).toBe(0);
  });

  it('dev-warns when content variant has no ratio and no dimensions', async () => {
    await fixture<CivImage>('<civ-image src="/x.jpg" alt="x"></civ-image>');
    const calls = warnSpy.mock.calls.flat().join(' ');
    expect(calls).toMatch(/ratio|width|height/i);
  });

  it('does NOT warn about dimensions when ratio is set', async () => {
    await fixture<CivImage>('<civ-image src="/x.jpg" alt="x" ratio="16:9"></civ-image>');
    const dimCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /reserve layout|CLS/i.test(m),
    );
    expect(dimCalls.length).toBe(0);
  });

  it('does NOT warn about dimensions for thumbnail variant', async () => {
    await fixture<CivImage>(
      '<civ-image src="/avatar.jpg" alt="x" variant="thumbnail"></civ-image>',
    );
    const dimCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /reserve layout|CLS/i.test(m),
    );
    expect(dimCalls.length).toBe(0);
  });

  it('warns when thumbnail size is invalid (off the stepped scale)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" variant="thumbnail"></civ-image>',
    );
    warnSpy.mockClear();
    (el as any).size = '40';
    await elementUpdated(el);
    const sizeCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /size/i.test(m),
    );
    expect(sizeCalls.length).toBeGreaterThan(0);
  });

  it('warns when rounded is set on the content variant (which ignores it)', async () => {
    await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="16:9" rounded></civ-image>',
    );
    const roundedCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /rounded/i.test(m),
    );
    expect(roundedCalls.length).toBeGreaterThan(0);
  });

  it('warns when consumer attaches srcset/sizes/etc. (silently dropped attributes)', async () => {
    await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" ratio="1:1" srcset="/x-2x.jpg 2x" sizes="(max-width: 480px) 100vw"></civ-image>',
    );
    const dropCalls = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /srcset|sizes/i.test(m),
    );
    expect(dropCalls.length).toBeGreaterThan(0);
  });

  it('updates reactively when src changes', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/a.jpg" alt="a" ratio="1:1"></civ-image>',
    );
    el.src = '/b.jpg';
    await elementUpdated(el);
    expect(el.querySelector('img')!.getAttribute('src')).toBe('/b.jpg');
  });

  it('honors thumbnail variant + custom ratio (unified render path)', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/x.jpg" alt="x" variant="thumbnail" size="64" ratio="16:9"></civ-image>',
    );
    const img = el.querySelector<HTMLImageElement>('img')!;
    // The aspect-ratio is set on the <img> regardless of variant,
    // so a thumbnail with a custom ratio actually works now.
    expect(img.style.aspectRatio).toBe('16 / 9');
  });

  // ── Modern image formats (WebP / AVIF) ──────────────────────────

  it('renders a bare <img> when no alternate formats are set', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" alt="x" ratio="16:9"></civ-image>',
    );
    expect(el.querySelector('picture')).toBeNull();
    expect(el.querySelector('img')).not.toBeNull();
  });

  it('wraps the <img> in <picture> when webp-src is set', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" webp-src="/photo.webp" alt="x" ratio="16:9"></civ-image>',
    );
    const picture = el.querySelector('picture');
    expect(picture).not.toBeNull();
    expect(picture!.querySelector('img')).not.toBeNull();
  });

  it('emits <source type="image/webp"> with the webp URL', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" webp-src="/photo.webp" alt="x" ratio="16:9"></civ-image>',
    );
    const source = el.querySelector('source[type="image/webp"]')!;
    expect(source).not.toBeNull();
    expect(source.getAttribute('srcset')).toBe('/photo.webp');
  });

  it('emits <source type="image/avif"> with the avif URL', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" avif-src="/photo.avif" alt="x" ratio="16:9"></civ-image>',
    );
    const source = el.querySelector('source[type="image/avif"]')!;
    expect(source).not.toBeNull();
    expect(source.getAttribute('srcset')).toBe('/photo.avif');
  });

  it('lists AVIF before WebP so browsers prefer the smaller format', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/p.jpg" webp-src="/p.webp" avif-src="/p.avif" alt="x" ratio="16:9"></civ-image>',
    );
    const sources = el.querySelectorAll('source');
    expect(sources.length).toBe(2);
    expect(sources[0].getAttribute('type')).toBe('image/avif');
    expect(sources[1].getAttribute('type')).toBe('image/webp');
  });

  it('keeps the original src as the universal <img> fallback inside <picture>', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/photo.jpg" webp-src="/photo.webp" avif-src="/photo.avif" alt="x" ratio="16:9"></civ-image>',
    );
    const img = el.querySelector('picture img')!;
    expect(img.getAttribute('src')).toBe('/photo.jpg');
  });

  it('preserves all <img> attributes (alt, loading, decoding, width/height, aspect-ratio) inside <picture>', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/p.jpg" webp-src="/p.webp" alt="hero" ratio="16:9" width="800" height="450" loading="eager" decoding="sync"></civ-image>',
    );
    const img = el.querySelector('picture img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('hero');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('decoding')).toBe('sync');
    expect(img.getAttribute('width')).toBe('800');
    expect(img.getAttribute('height')).toBe('450');
    expect(img.style.aspectRatio).toBe('16 / 9');
  });

  it('thumbnail variant still wraps in <picture> when alternates are set', async () => {
    const el = await fixture<CivImage>(
      '<civ-image src="/a.jpg" webp-src="/a.webp" alt="A" variant="thumbnail" size="48"></civ-image>',
    );
    expect(el.querySelector('picture')).not.toBeNull();
    expect(el.querySelector('source[type="image/webp"]')).not.toBeNull();
  });
});
