import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-action-link.js';
import type { CivActionLink } from './civ-action-link.js';

describe('civ-action-link', () => {
  afterEach(cleanupFixtures);

  it('renders a phone link with tel: href', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="phone" number="8005551234"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement & { href: string };
    expect(link.getAttribute('href')).toBe('tel:8005551234');
  });

  it('formats 10-digit phone for display', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="phone" number="8005551234"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement & { label: string };
    expect(link.getAttribute('label')).toBe('(800) 555-1234');
  });

  it('renders an email link with mailto: href', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="email" address="help@va.gov"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement & { href: string };
    expect(link.getAttribute('href')).toBe('mailto:help@va.gov');
  });

  it('includes subject in mailto href', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="email" address="help@va.gov" subject="Question"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement & { href: string };
    expect(link.getAttribute('href')).toBe('mailto:help@va.gov?subject=Question');
  });

  it('uses label override for display text', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="phone" number="8005551234" label="Call us"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement & { label: string };
    expect(link.getAttribute('label')).toBe('Call us');
  });

  it('uses phone icon for type=phone', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="phone" number="123"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement;
    expect(link.getAttribute('icon-start')).toBe('phone');
  });

  it('uses mail icon for type=email', async () => {
    const el = await fixture<CivActionLink>('<civ-action-link type="email" address="a@b.com"></civ-action-link>');
    const link = el.querySelector('civ-link') as HTMLElement;
    expect(link.getAttribute('icon-start')).toBe('mail');
  });
});
