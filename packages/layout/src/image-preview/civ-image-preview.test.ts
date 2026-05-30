import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-image-preview.js';
import type { CivImagePreview } from './civ-image-preview.js';

describe('civ-image-preview', () => {
  afterEach(cleanupFixtures);
  // Most rendering tests don't care about the dev-warns civ-image fires
  // (CLS warnings when no dimensions are passed). Mock at the suite
  // level so unrelated tests don't flood stderr. Dedicated dev-warn
  // tests below explicitly spy + assert on the relevant message.
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('renders nothing when src is empty', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview></civ-image-preview>');
    expect(el.querySelector('figure')).toBeNull();
  });

  it('renders an image with src and alt (delegated to civ-image)', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test image"></civ-image-preview>');
    // The inner civ-image renders a real <img>; assert against it
    // since that's what AT + browsers see.
    const img = el.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('test.jpg');
    expect(img!.getAttribute('alt')).toBe('Test image');
  });

  it('composes civ-image as the inner image element', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    expect(el.querySelector('civ-image')).not.toBeNull();
  });

  it('renders filename in caption', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test" filename="photo.jpg"></civ-image-preview>');
    const caption = el.querySelector('figcaption');
    expect(caption).not.toBeNull();
    expect(caption!.textContent).toContain('photo.jpg');
  });

  it('renders file size in caption', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test" file-size="2.4 MB"></civ-image-preview>');
    const caption = el.querySelector('figcaption');
    expect(caption!.textContent).toContain('2.4 MB');
  });

  it('defaults to md size (240px max-width)', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    const figure = el.querySelector('figure') as HTMLElement;
    expect(figure.style.maxWidth).toBe('240px');
  });

  it('applies sm size', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test" size="sm"></civ-image-preview>');
    const figure = el.querySelector('figure') as HTMLElement;
    expect(figure.style.maxWidth).toBe('120px');
  });

  it('applies full size', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test" size="full"></civ-image-preview>');
    const figure = el.querySelector('figure') as HTMLElement;
    expect(figure.style.maxWidth).toBe('100%');
  });

  it('uses lazy loading (inherited from civ-image default)', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    const img = el.querySelector('img');
    expect(img!.getAttribute('loading')).toBe('lazy');
  });

  it('hides caption when no filename or file-size', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    expect(el.querySelector('figcaption')).toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders figure element as container', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    expect(el.querySelector('figure')).not.toBeNull();
  });

  it('applies lg size', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test" size="lg"></civ-image-preview>');
    const figure = el.querySelector('figure') as HTMLElement;
    expect(figure.style.maxWidth).toBe('360px');
  });

  it('renders both filename and fileSize together', async () => {
    const el = await fixture<CivImagePreview>(
      '<civ-image-preview src="test.jpg" alt="Test" filename="photo.jpg" file-size="1.2 MB"></civ-image-preview>'
    );
    const caption = el.querySelector('figcaption');
    expect(caption!.textContent).toContain('photo.jpg');
    expect(caption!.textContent).toContain('1.2 MB');
  });

  it('warns when alt text is missing', async () => {
    await fixture<CivImagePreview>('<civ-image-preview src="test.jpg"></civ-image-preview>');
    const altWarnings = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /civ-image-preview.*alt/i.test(m),
    );
    expect(altWarnings.length).toBeGreaterThan(0);
  });

  it('does not warn (about alt) when alt text is provided', async () => {
    await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Photo"></civ-image-preview>');
    // Filter for the image-preview's own alt warning specifically —
    // the inner civ-image may fire an unrelated CLS warn since this
    // fixture doesn't pass dimensions; that's not what this test
    // asserts.
    const altWarnings = warnSpy.mock.calls.flat().filter(
      (m) => typeof m === 'string' && /civ-image-preview.*alt/i.test(m),
    );
    expect(altWarnings.length).toBe(0);
  });

  it('applies a flat border to the inner civ-image host (no rounded corners)', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    const civImage = el.querySelector('civ-image')!;
    expect(civImage.classList.contains('civ-border')).toBe(true);
    expect(civImage.classList.contains('civ-overflow-hidden')).toBe(true);
    // Display-only upload-preview thumbnail — corners stay flat per
    // design-rules.md "Only interactive elements get rounded corners"
    // (same category as civ-file-preview).
    expect(civImage.classList.contains('civ-rounded')).toBe(false);
  });

  it('forwards webp-src + avif-src to the inner civ-image for format negotiation', async () => {
    const el = await fixture<CivImagePreview>(
      '<civ-image-preview src="/p.jpg" webp-src="/p.webp" avif-src="/p.avif" alt="x"></civ-image-preview>'
    );
    const civImage = el.querySelector('civ-image')!;
    expect(civImage.getAttribute('webp-src')).toBe('/p.webp');
    expect(civImage.getAttribute('avif-src')).toBe('/p.avif');
    // The inner civ-image actually emits a <picture> with both <source> children.
    expect(el.querySelector('picture source[type="image/webp"]')).not.toBeNull();
    expect(el.querySelector('picture source[type="image/avif"]')).not.toBeNull();
  });

  it('forwards width + height to the inner civ-image (for CLS prevention)', async () => {
    const el = await fixture<CivImagePreview>(
      '<civ-image-preview src="/p.jpg" alt="x" width="800" height="600"></civ-image-preview>'
    );
    const img = el.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('800');
    expect(img.getAttribute('height')).toBe('600');
    // Aspect-ratio inline style derived from width/height.
    expect((img as HTMLImageElement).style.aspectRatio).toBe('800 / 600');
  });
});
