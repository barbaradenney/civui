import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-download-link.js';
import type { CivDownloadLink } from './civ-download-link.js';

describe('civ-download-link', () => {
  afterEach(cleanupFixtures);

  it('renders with download attribute', async () => {
    const el = await fixture('<civ-download-link href="/forms/10-10EZ.pdf" label="Download form" filename="10-10EZ.pdf"></civ-download-link>') as CivDownloadLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('download')).toBe('10-10EZ.pdf');
  });

  it('includes download icon', async () => {
    const el = await fixture('<civ-download-link href="/file.pdf" label="Get file"></civ-download-link>') as CivDownloadLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('icon-start')).toBe('download');
  });

  it('displays file size when provided', async () => {
    const el = await fixture('<civ-download-link href="/file.pdf" label="Get file" file-size="2.4 MB"></civ-download-link>') as CivDownloadLink;
    const sizeText = el.querySelector('.civ-text-sm');
    expect(sizeText).not.toBeNull();
    expect(sizeText!.textContent).toContain('2.4 MB');
  });

  it('omits file size when not provided', async () => {
    const el = await fixture('<civ-download-link href="/file.pdf" label="Get file"></civ-download-link>') as CivDownloadLink;
    const sizeText = el.querySelector('.civ-text-sm');
    expect(sizeText).toBeNull();
  });
});
