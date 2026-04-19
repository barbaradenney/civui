import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-prefill-notice.js';

afterEach(cleanupFixtures);

describe('civ-prefill-notice', () => {
  it('renders default heading and body text', async () => {
    const el = await fixture('<civ-prefill-notice></civ-prefill-notice>');
    expect(el.textContent).toContain('prefilled');
  });

  it('renders custom heading', async () => {
    const el = await fixture('<civ-prefill-notice heading="Custom heading"></civ-prefill-notice>');
    expect(el.textContent).toContain('Custom heading');
  });

  it('renders profile link when href is provided', async () => {
    const el = await fixture('<civ-prefill-notice profile-href="/profile"></civ-prefill-notice>');
    const link = el.querySelector('a.civ-link');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('/profile');
  });

  it('omits link when no href', async () => {
    const el = await fixture('<civ-prefill-notice></civ-prefill-notice>');
    const link = el.querySelector('a');
    expect(link).toBeNull();
  });

  it('has role="status"', async () => {
    const el = await fixture('<civ-prefill-notice></civ-prefill-notice>');
    const notice = el.querySelector('[role="status"]');
    expect(notice).not.toBeNull();
  });

  it('uses alert info styling', async () => {
    const el = await fixture('<civ-prefill-notice></civ-prefill-notice>');
    const div = el.querySelector('.civ-alert--info');
    expect(div).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-prefill-notice></civ-prefill-notice>');
    expect(el.shadowRoot).toBeNull();
  });
});
