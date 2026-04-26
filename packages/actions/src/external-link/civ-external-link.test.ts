import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-external-link.js';
import type { CivExternalLink } from './civ-external-link.js';

describe('civ-external-link', () => {
  afterEach(cleanupFixtures);

  it('renders with target="_blank" and rel="noopener noreferrer"', async () => {
    const el = await fixture('<civ-external-link href="https://va.gov" label="VA.gov"></civ-external-link>') as CivExternalLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('includes external-link icon', async () => {
    const el = await fixture('<civ-external-link href="https://va.gov" label="VA.gov"></civ-external-link>') as CivExternalLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('icon-end')).toBe('external-link');
  });

  it('includes screen reader text for new tab', async () => {
    const el = await fixture('<civ-external-link href="https://va.gov" label="VA.gov"></civ-external-link>') as CivExternalLink;
    const srText = el.querySelector('.civ-sr-only');
    expect(srText).not.toBeNull();
    expect(srText!.textContent).toContain('opens in new tab');
  });

  it('passes disabled to child link', async () => {
    const el = await fixture('<civ-external-link href="https://va.gov" label="VA.gov" disabled></civ-external-link>') as CivExternalLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.hasAttribute('disabled')).toBe(true);
  });
});
