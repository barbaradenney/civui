import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-image-preview.js';
import type { CivImagePreview } from './civ-image-preview.js';

describe('civ-image-preview', () => {
  afterEach(cleanupFixtures);

  it('renders nothing when src is empty', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview></civ-image-preview>');
    expect(el.querySelector('figure')).toBeNull();
  });

  it('renders an image with src and alt', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test image"></civ-image-preview>');
    const img = el.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('test.jpg');
    expect(img!.getAttribute('alt')).toBe('Test image');
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

  it('uses lazy loading', async () => {
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
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImagePreview>('<civ-image-preview src="test.jpg"></civ-image-preview>');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('missing an alt attribute')
    );
    warnSpy.mockRestore();
  });

  it('does not warn when alt text is provided', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Photo"></civ-image-preview>');
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('applies border and rounded classes to image', async () => {
    const el = await fixture<CivImagePreview>('<civ-image-preview src="test.jpg" alt="Test"></civ-image-preview>');
    const img = el.querySelector('img');
    expect(img!.classList.contains('civ-rounded')).toBe(true);
    expect(img!.classList.contains('civ-border')).toBe(true);
  });
});
