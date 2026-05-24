import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-timeline-item.js';
import type { CivTimelineItem } from './civ-timeline-item.js';

afterEach(cleanupFixtures);

describe('civ-timeline-item', () => {
  it('renders the action label', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="Application submitted"></civ-timeline-item>
    `);
    const action = el.querySelector('.civ-timeline-item__action')!;
    expect(action.textContent).toBe('Application submitted');
  });

  it('renders the actor when provided', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item
        action="Approved"
        actor="J. Martinez (Reviewer)"
      ></civ-timeline-item>
    `);
    const actor = el.querySelector('.civ-timeline-item__actor')!;
    expect(actor.textContent).toBe('J. Martinez (Reviewer)');
  });

  it('omits the actor element when actor is empty', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="Logged"></civ-timeline-item>
    `);
    expect(el.querySelector('.civ-timeline-item__actor')).toBeNull();
  });

  it('wraps the timestamp in <time> with machine-readable datetime attr', async () => {
    const iso = '2026-01-15T10:30:00.000Z';
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item
        action="Submitted"
        timestamp="${iso}"
      ></civ-timeline-item>
    `);
    const time = el.querySelector('time')!;
    expect(time).not.toBeNull();
    expect(time.getAttribute('datetime')).toBe(iso);
  });

  it('omits the timestamp element entirely when timestamp is empty', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X"></civ-timeline-item>
    `);
    expect(el.querySelector('time')).toBeNull();
  });

  it('renders unparseable timestamps as plain text (no <time> wrapper)', async () => {
    // <time datetime="not-a-date"> is invalid HTML5 — render the raw
    // value in a <span> instead so assistive tech doesn't see a
    // bogus machine-readable date.
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item
        action="X"
        timestamp="not-a-date"
        timestamp-format="absolute"
      ></civ-timeline-item>
    `);
    const time = el.querySelector('time');
    expect(time).toBeNull();
    const fallback = el.querySelector('.civ-timeline-item__timestamp')!;
    expect(fallback).not.toBeNull();
    expect(fallback.tagName.toLowerCase()).toBe('span');
    expect(fallback.textContent).toContain('not-a-date');
  });

  it('renders absolute-only format without a relative parenthesis', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item
        action="X"
        timestamp="2026-01-15T10:30:00Z"
        timestamp-format="absolute"
      ></civ-timeline-item>
    `);
    const rel = el.querySelector('.civ-timeline-item__timestamp-relative');
    expect(rel).toBeNull();
  });

  it('renders the rail with aria-hidden so the dot/line are skipped by SR', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="success"></civ-timeline-item>
    `);
    const rail = el.querySelector('.civ-timeline-item__rail')!;
    expect(rail.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the default intent icon inside the dot for success', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="success"></civ-timeline-item>
    `);
    const icon = el.querySelector('.civ-timeline-item__dot-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('check');
  });

  it('renders no icon for neutral intent (plain dot)', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="neutral"></civ-timeline-item>
    `);
    expect(el.querySelector('.civ-timeline-item__dot-icon')).toBeNull();
  });

  it('honors explicit icon override', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="success" icon="mail"></civ-timeline-item>
    `);
    const icon = el.querySelector('.civ-timeline-item__dot-icon')!;
    expect(icon.getAttribute('name')).toBe('mail');
  });

  it('suppresses the icon when icon="" (empty override)', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="success" icon=""></civ-timeline-item>
    `);
    expect(el.querySelector('.civ-timeline-item__dot-icon')).toBeNull();
  });

  it('treats icon=undefined (JS-set) the same as null — uses intent default', async () => {
    // A TypeScript consumer writing `el.icon = undefined` should NOT
    // accidentally render <civ-icon name="undefined">; the resolver
    // must treat null and undefined identically.
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="success" icon=""></civ-timeline-item>
    `);
    (el as unknown as { icon: string | null | undefined }).icon = undefined;
    await elementUpdated(el);
    const icon = el.querySelector('.civ-timeline-item__dot-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('check');
  });

  it('relative-time renders "an hour ago" / "1 hour ago" near the 60-minute boundary, not "60 minutes ago"', async () => {
    // The previous fixed-divisor cascade reported 3599 seconds as
    // "60 minutes ago" because the if-cascade compared raw `abs`,
    // not the rounded display value. The fix bumps to the next-larger
    // unit when the rounded value crosses the boundary.
    const sec = 3599;
    const iso = new Date(Date.now() - sec * 1000).toISOString();
    const el = await fixture<CivTimelineItem>(
      `<civ-timeline-item action="X" timestamp="${iso}" timestamp-format="relative"></civ-timeline-item>`,
    );
    const time = el.querySelector('time')!;
    expect(time.textContent!.trim()).not.toContain('60 minutes');
    // Either "1 hour ago" or "an hour ago" depending on the locale's
    // numeric: 'auto' rendering — both contain "hour" though.
    expect(time.textContent!.trim()).toMatch(/hour/i);
  });

  it('reflects intent to the host attribute for CSS targeting', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X" intent="warning"></civ-timeline-item>
    `);
    await elementUpdated(el);
    expect(el.getAttribute('intent')).toBe('warning');
  });

  it('relocates body content into the body container', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="Approved">
        <span class="body-marker">All documentation verified.</span>
      </civ-timeline-item>
    `);
    await elementUpdated(el);
    const body = el.querySelector('.civ-timeline-item__body')!;
    expect(body.querySelector('.body-marker')).not.toBeNull();
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivTimelineItem>(`
      <civ-timeline-item action="X"></civ-timeline-item>
    `);
    expect(el.getAttribute('role')).toBe('listitem');
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-timeline-item action="X"></civ-timeline-item>`);
    expect(el.shadowRoot).toBeNull();
  });
});
