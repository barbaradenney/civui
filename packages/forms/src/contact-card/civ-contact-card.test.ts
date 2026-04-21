import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-contact-card.js';
import type { CivContactCard } from './civ-contact-card.js';

describe('civ-contact-card', () => {
  afterEach(cleanupFixtures);

  it('renders in view mode by default', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card
        label="Phone number"
        name="phone"
        value="555-123-4567"
        field-type="phone"
      ></civ-contact-card>
    `);
    await elementUpdated(el);
    const dt = el.querySelector('dt');
    const dd = el.querySelector('dd');
    expect(dt!.textContent).toContain('Phone number');
    expect(dd!.textContent).toContain('555-123-4567');
  });

  it('shows edit button', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card label="Email" name="email" value="test@example.com" field-type="email"></civ-contact-card>
    `);
    await elementUpdated(el);
    const button = el.querySelector('civ-button');
    expect(button).toBeTruthy();
    expect(button!.getAttribute('label')).toBe('Edit');
  });

  it('switches to edit mode on edit click', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card label="Phone" name="phone" value="555-0000" field-type="phone"></civ-contact-card>
    `);
    await elementUpdated(el);
    const editBtn = el.querySelector('civ-button') as HTMLElement;
    editBtn.click();
    await elementUpdated(el);
    // In edit mode, should have a text input
    const input = el.querySelector('civ-text-input');
    expect(input).toBeTruthy();
  });

  it('shows profile warning when profile-update is set', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card
        label="Phone"
        name="phone"
        value="555-0000"
        field-type="phone"
        profile-update
        profile-href="/profile"
      ></civ-contact-card>
    `);
    await elementUpdated(el);
    // Enter edit mode
    const editBtn = el.querySelector('civ-button') as HTMLElement;
    editBtn.click();
    await elementUpdated(el);
    const alert = el.querySelector('civ-alert');
    expect(alert).toBeTruthy();
  });

  it('fires civ-contact-update on update', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card label="Email" name="email" value="old@test.com" field-type="email" profile-update></civ-contact-card>
    `);
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-contact-update', handler as EventListener);

    // Enter edit mode
    el.querySelector('civ-button')!.click();
    await elementUpdated(el);

    // Click Update
    const buttons = el.querySelectorAll('civ-button');
    const updateBtn = Array.from(buttons).find(b => b.getAttribute('label') === 'Update');
    updateBtn!.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.name).toBe('email');
    expect(detail.updateProfile).toBe(true);
  });

  it('returns to view mode on cancel', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card label="Phone" name="phone" value="555-0000" field-type="phone"></civ-contact-card>
    `);
    await elementUpdated(el);

    // Enter edit mode
    el.querySelector('civ-button')!.click();
    await elementUpdated(el);
    expect(el.querySelector('civ-text-input')).toBeTruthy();

    // Click Cancel
    const buttons = el.querySelectorAll('civ-button');
    const cancelBtn = Array.from(buttons).find(b => b.getAttribute('label') === 'Cancel');
    cancelBtn!.click();
    await elementUpdated(el);

    // Back in view mode
    expect(el.querySelector('civ-text-input')).toBeNull();
    expect(el.querySelector('dt')).toBeTruthy();
  });

  it('shows "Not provided" for empty value', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card label="Phone" name="phone" value="" field-type="phone"></civ-contact-card>
    `);
    await elementUpdated(el);
    const dd = el.querySelector('dd');
    expect(dd!.textContent).toContain('Not provided');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivContactCard>(`
      <civ-contact-card label="Phone" name="phone" value="555" field-type="phone"></civ-contact-card>
    `);
    expect(el.shadowRoot).toBeNull();
  });
});
