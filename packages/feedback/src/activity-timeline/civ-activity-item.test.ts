import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-activity-item.js';
import type { CivActivityItem } from './civ-activity-item.js';

afterEach(cleanupFixtures);

describe('civ-activity-item', () => {
  it('renders the action label', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="Application submitted"></civ-activity-item>
    `);
    const action = el.querySelector('.civ-activity-item__action')!;
    expect(action.textContent).toBe('Application submitted');
  });

  it('renders the actor when provided', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item
        action="Approved"
        actor="J. Martinez (Reviewer)"
      ></civ-activity-item>
    `);
    const actor = el.querySelector('.civ-activity-item__actor')!;
    expect(actor.textContent).toBe('J. Martinez (Reviewer)');
  });

  it('omits the actor element when actor is empty', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="Logged"></civ-activity-item>
    `);
    expect(el.querySelector('.civ-activity-item__actor')).toBeNull();
  });

  it('wraps the timestamp in <time> with machine-readable datetime attr', async () => {
    const iso = '2026-01-15T10:30:00.000Z';
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item
        action="Submitted"
        timestamp="${iso}"
      ></civ-activity-item>
    `);
    const time = el.querySelector('time')!;
    expect(time).not.toBeNull();
    expect(time.getAttribute('datetime')).toBe(iso);
  });

  it('omits the timestamp element entirely when timestamp is empty', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X"></civ-activity-item>
    `);
    expect(el.querySelector('time')).toBeNull();
  });

  it('falls back to raw value when timestamp is not parseable', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item
        action="X"
        timestamp="not-a-date"
        timestamp-format="absolute"
      ></civ-activity-item>
    `);
    const time = el.querySelector('time')!;
    expect(time.textContent).toContain('not-a-date');
  });

  it('renders absolute-only format without a relative parenthesis', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item
        action="X"
        timestamp="2026-01-15T10:30:00Z"
        timestamp-format="absolute"
      ></civ-activity-item>
    `);
    const rel = el.querySelector('.civ-activity-item__timestamp-relative');
    expect(rel).toBeNull();
  });

  it('renders the rail with aria-hidden so the dot/line are skipped by SR', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X" intent="success"></civ-activity-item>
    `);
    const rail = el.querySelector('.civ-activity-item__rail')!;
    expect(rail.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the default intent icon inside the dot for success', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X" intent="success"></civ-activity-item>
    `);
    const icon = el.querySelector('.civ-activity-item__dot-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('check');
  });

  it('renders no icon for neutral intent (plain dot)', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X" intent="neutral"></civ-activity-item>
    `);
    expect(el.querySelector('.civ-activity-item__dot-icon')).toBeNull();
  });

  it('honors explicit icon override', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X" intent="success" icon="mail"></civ-activity-item>
    `);
    const icon = el.querySelector('.civ-activity-item__dot-icon')!;
    expect(icon.getAttribute('name')).toBe('mail');
  });

  it('suppresses the icon when icon="" (empty override)', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X" intent="success" icon=""></civ-activity-item>
    `);
    expect(el.querySelector('.civ-activity-item__dot-icon')).toBeNull();
  });

  it('reflects intent to the host attribute for CSS targeting', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X" intent="warning"></civ-activity-item>
    `);
    await elementUpdated(el);
    expect(el.getAttribute('intent')).toBe('warning');
  });

  it('relocates body content into the body container', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="Approved">
        <span class="body-marker">All documentation verified.</span>
      </civ-activity-item>
    `);
    await elementUpdated(el);
    const body = el.querySelector('.civ-activity-item__body')!;
    expect(body.querySelector('.body-marker')).not.toBeNull();
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivActivityItem>(`
      <civ-activity-item action="X"></civ-activity-item>
    `);
    expect(el.getAttribute('role')).toBe('listitem');
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-activity-item action="X"></civ-activity-item>`);
    expect(el.shadowRoot).toBeNull();
  });
});
