import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-profile-card.js';
import '../read-only-field/civ-read-only-field.js';
import type { CivProfileCard } from './civ-profile-card.js';

describe('civ-profile-card', () => {
  afterEach(cleanupFixtures);

  it('renders with default heading', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card>
        <civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>
      </civ-profile-card>
    `);
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading).toBeTruthy();
    expect(heading!.textContent).toContain('personal information');
  });

  it('renders custom heading', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card heading="Your verified info">
        <civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>
      </civ-profile-card>
    `);
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.textContent).toContain('Your verified info');
  });

  it('renders profile link when href is set', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card profile-href="/profile/settings">
        <civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>
      </civ-profile-card>
    `);
    await elementUpdated(el);
    const link = el.querySelector('civ-link');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('href')).toBe('/profile/settings');
  });

  it('hides profile link when no href', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card>
        <civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>
      </civ-profile-card>
    `);
    await elementUpdated(el);
    const link = el.querySelector('civ-link');
    expect(link).toBeNull();
  });

  it('relocates slotted children', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card>
        <civ-read-only-field label="SSN" value="●●●-●●-6789"></civ-read-only-field>
      </civ-profile-card>
    `);
    await elementUpdated(el);
    const container = el.querySelector('[data-civ-profile-card-content]');
    expect(container).toBeTruthy();
    const field = container!.querySelector('civ-read-only-field');
    expect(field).toBeTruthy();
    expect(field!.getAttribute('value')).toBe('●●●-●●-6789');
  });

  it('has gray background styling', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card>
        <civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>
      </civ-profile-card>
    `);
    await elementUpdated(el);
    const card = el.querySelector('.civ-profile-card');
    expect(card).toBeTruthy();
    expect(card!.classList.contains('civ-bg-base-lightest')).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivProfileCard>(`
      <civ-profile-card>
        <civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>
      </civ-profile-card>
    `);
    expect(el.shadowRoot).toBeNull();
  });
});
