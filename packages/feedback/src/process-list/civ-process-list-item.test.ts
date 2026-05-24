import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-process-list-item.js';
import type { CivProcessListItem } from './civ-process-list-item.js';

afterEach(cleanupFixtures);

describe('civ-process-list-item', () => {
  it('renders the heading', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="Gather documents"></civ-process-list-item>
    `);
    const heading = el.querySelector('.civ-process-list-item__heading');
    expect(heading?.textContent).toBe('Gather documents');
  });

  it('omits the heading element when no heading is set', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item></civ-process-list-item>
    `);
    expect(el.querySelector('.civ-process-list-item__heading')).toBeNull();
  });

  it('applies role="listitem" to the host', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="X"></civ-process-list-item>
    `);
    expect(el.getAttribute('role')).toBe('listitem');
  });

  it('renders the heading with the requested aria-level', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="Step" heading-level="4"></civ-process-list-item>
    `);
    const heading = el.querySelector('.civ-process-list-item__heading')!;
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('4');
  });

  it('clamps heading-level into the 2-6 range', async () => {
    const tooHigh = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="X" heading-level="9"></civ-process-list-item>
    `);
    const tooLow = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="Y" heading-level="1"></civ-process-list-item>
    `);
    expect(
      tooHigh.querySelector('.civ-process-list-item__heading')!.getAttribute('aria-level'),
    ).toBe('6');
    expect(
      tooLow.querySelector('.civ-process-list-item__heading')!.getAttribute('aria-level'),
    ).toBe('2');
  });

  it('default state renders an empty marker (CSS counter fills the number)', async () => {
    // The auto-incremented step number is rendered via a CSS counter
    // on the parent <ol>'s ::before pseudo-element; in jsdom, what we
    // assert is that the marker contains NO rendered children so the
    // pseudo can take over.
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="One"></civ-process-list-item>
    `);
    const marker = el.querySelector('.civ-process-list-item__marker')!;
    expect(marker.querySelector('civ-icon')).toBeNull();
  });

  it('complete state renders a check icon inside the marker', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="Done" state="complete"></civ-process-list-item>
    `);
    await elementUpdated(el);
    const icon = el.querySelector('.civ-process-list-item__marker civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('check');
  });

  it('reflects the state attribute on the host', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="X" state="complete"></civ-process-list-item>
    `);
    expect(el.getAttribute('state')).toBe('complete');
  });

  it('explicit icon prop overrides the auto-number and the complete check', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="Verify email" icon="mail"></civ-process-list-item>
    `);
    await elementUpdated(el);
    const icon = el.querySelector('.civ-process-list-item__marker civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('mail');
  });

  it('marks the rail as aria-hidden so screen readers skip the marker geometry', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="X"></civ-process-list-item>
    `);
    const rail = el.querySelector('.civ-process-list-item__rail');
    expect(rail?.getAttribute('aria-hidden')).toBe('true');
  });

  it('relocates slotted body content into the body container', async () => {
    const el = await fixture<CivProcessListItem>(`
      <civ-process-list-item heading="Step One">
        <p>Detail paragraph for this step.</p>
      </civ-process-list-item>
    `);
    await elementUpdated(el);
    const body = el.querySelector('.civ-process-list-item__body')!;
    expect(body.querySelector('p')?.textContent).toBe(
      'Detail paragraph for this step.',
    );
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-process-list-item heading="X"></civ-process-list-item>`);
    expect(el.shadowRoot).toBeNull();
  });
});
