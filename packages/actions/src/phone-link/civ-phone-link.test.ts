import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-phone-link.js';
import type { CivPhoneLink } from './civ-phone-link.js';

describe('civ-phone-link', () => {
  afterEach(cleanupFixtures);

  it('renders tel: href from number prop', async () => {
    const el = await fixture('<civ-phone-link number="800-555-1234"></civ-phone-link>') as CivPhoneLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('href')).toBe('tel:8005551234');
  });

  it('formats 10-digit number for display', async () => {
    const el = await fixture('<civ-phone-link number="8005551234"></civ-phone-link>') as CivPhoneLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('label')).toBe('(800) 555-1234');
  });

  it('uses label override when provided', async () => {
    const el = await fixture('<civ-phone-link number="8005551234" label="Call us"></civ-phone-link>') as CivPhoneLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('label')).toBe('Call us');
  });

  it('includes phone icon', async () => {
    const el = await fixture('<civ-phone-link number="8005551234"></civ-phone-link>') as CivPhoneLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('icon-start')).toBe('phone');
  });

  it('preserves + prefix for international numbers', async () => {
    const el = await fixture('<civ-phone-link number="+44 20 7946 0958"></civ-phone-link>') as CivPhoneLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('href')).toBe('tel:+442079460958');
  });
});
