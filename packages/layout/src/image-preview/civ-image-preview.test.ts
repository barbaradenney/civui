import { describe, it, expect, afterEach } from 'vitest';
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
});
