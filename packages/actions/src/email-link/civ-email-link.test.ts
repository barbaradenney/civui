import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-email-link.js';
import type { CivEmailLink } from './civ-email-link.js';

describe('civ-email-link', () => {
  afterEach(cleanupFixtures);

  it('renders mailto: href from address prop', async () => {
    const el = await fixture('<civ-email-link address="help@va.gov"></civ-email-link>') as CivEmailLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('href')).toBe('mailto:help@va.gov');
  });

  it('defaults display text to the address', async () => {
    const el = await fixture('<civ-email-link address="help@va.gov"></civ-email-link>') as CivEmailLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('label')).toBe('help@va.gov');
  });

  it('uses label override', async () => {
    const el = await fixture('<civ-email-link address="help@va.gov" label="Email us"></civ-email-link>') as CivEmailLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('label')).toBe('Email us');
  });

  it('includes subject in mailto when provided', async () => {
    const el = await fixture('<civ-email-link address="help@va.gov" subject="Benefits question"></civ-email-link>') as CivEmailLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('href')).toBe('mailto:help@va.gov?subject=Benefits%20question');
  });

  it('includes mail icon', async () => {
    const el = await fixture('<civ-email-link address="help@va.gov"></civ-email-link>') as CivEmailLink;
    const link = el.querySelector('civ-link') as any;
    expect(link.getAttribute('icon-start')).toBe('mail');
  });
});
