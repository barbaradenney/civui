import { describe, it, expect, afterEach, vi } from 'vitest';
import { announce, cleanupLiveRegions, QUEUE_DELAY } from './live-region.js';

afterEach(() => {
  cleanupLiveRegions();
  vi.restoreAllMocks();
});

describe('live-region', () => {
  it('creates a polite live region on first announce', () => {
    announce('Hello');

    const region = document.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();
    expect(region!.getAttribute('role')).toBe('status');
    expect(region!.getAttribute('aria-atomic')).toBe('true');
  });

  it('creates an assertive live region with role="alert"', () => {
    announce('Error occurred', 'assertive');

    const region = document.querySelector('[aria-live="assertive"]');
    expect(region).not.toBeNull();
    expect(region!.getAttribute('role')).toBe('alert');
  });

  it('applies sr-only styles to hide region visually', () => {
    announce('Hidden text');

    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(region.style.position).toBe('absolute');
    expect(region.style.overflow).toBe('hidden');
  });

  it('defaults to polite priority', () => {
    announce('Default priority');

    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
  });

  it('announces a rapid burst one at a time, spaced by QUEUE_DELAY', () => {
    vi.useFakeTimers();
    announce('alpha');
    announce('bravo');

    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;

    // The first message paints on the next animation frame. The second is
    // held in the queue (announce() does NOT drain it into the same frame).
    vi.advanceTimersToNextTimer(); // run the first message's raf
    expect(region.textContent).toBe('alpha');
    // 'bravo' is still pending — a delay timer is scheduled, not painted yet.
    expect(region.textContent).not.toBe('bravo');

    // After the QUEUE_DELAY plus its own frame, the second message paints.
    vi.advanceTimersByTime(QUEUE_DELAY);
    vi.advanceTimersToNextTimer(); // run the second message's raf
    expect(region.textContent).toBe('bravo');

    vi.useRealTimers();
  });

  it('caps queue at MAX_QUEUE_SIZE (10) and drops the oldest pending message', () => {
    vi.useFakeTimers();
    // The first announce drains immediately on the next frame; while it is
    // in flight, the rest accumulate in the queue. 'drop-me' is the oldest
    // pending entry, so once the queue fills to the cap it gets evicted and
    // must never reach the live region.
    announce('first');
    announce('drop-me');
    for (let i = 2; i <= 11; i++) {
      announce(`keep-${i}`); // pushes the queue past the cap of 10
    }

    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
    const seen: string[] = [];
    // Step through every scheduled raf / delay timer, recording what each
    // one paints. Deterministic under fake timers (no microtask reliance).
    for (let i = 0; i < 60 && vi.getTimerCount() > 0; i++) {
      vi.advanceTimersToNextTimer();
      if (region.textContent) seen.push(region.textContent);
    }
    vi.useRealTimers();

    expect(seen).toContain('first');
    expect(seen).toContain('keep-11');
    // Evicted by the cap — would have been announced if the queue never
    // accumulated (the pre-fix behaviour, where every announce drained
    // immediately and the cap never engaged).
    expect(seen).not.toContain('drop-me');
  });

  it('cleanupLiveRegions removes DOM elements and resets state', () => {
    announce('Before cleanup');
    announce('Another message', 'assertive');

    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(document.querySelector('[aria-live="assertive"]')).not.toBeNull();

    cleanupLiveRegions();

    expect(document.querySelector('[aria-live="polite"]')).toBeNull();
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
  });

  it('re-creates region if removed from DOM between announcements', () => {
    vi.useFakeTimers();
    announce('First');
    vi.advanceTimersToNextTimer(); // flush 'First' so nothing is in flight
    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
    region.remove();

    // With nothing in flight, the next announce processes immediately and
    // ensureRegion() recreates the removed region.
    announce('Second');
    const newRegion = document.querySelector('[aria-live="polite"]');
    expect(newRegion).not.toBeNull();
    expect(newRegion).not.toBe(region);
    vi.useRealTimers();
  });
});
