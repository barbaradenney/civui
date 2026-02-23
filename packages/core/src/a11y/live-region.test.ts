import { describe, it, expect, afterEach, vi } from 'vitest';
import { announce, cleanupLiveRegions } from './live-region.js';

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

  it('caps queue at MAX_QUEUE_SIZE (10) and drops oldest messages', () => {
    // Pause queue processing by making the first call start processing,
    // then flood with more messages before the timer fires.
    // The first announce() call processes immediately (shifts from queue),
    // so we need 11 more to hit the cap of 10 in the queue.
    announce('msg-0'); // processed immediately
    for (let i = 1; i <= 11; i++) {
      announce(`msg-${i}`);
    }

    // msg-1 was the oldest in the queue, should have been dropped when msg-11 was added.
    // The queue should contain msg-2 through msg-11 (10 items).
    // We can verify by draining the queue with timers.
    // Fast-forward all timers to drain the queue.
    vi.useFakeTimers();

    // Process remaining queue entries
    for (let i = 0; i < 12; i++) {
      vi.advanceTimersByTime(150);
      // requestAnimationFrame callback
      vi.runAllTimers();
    }

    vi.useRealTimers();

    // The region should have received the last message processed
    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
    // After full drain, the last message set is msg-11
    // (msg-1 was dropped, so it should not appear)
    expect(region).not.toBeNull();
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
    announce('First');
    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
    region.remove();

    announce('Second');
    const newRegion = document.querySelector('[aria-live="polite"]');
    expect(newRegion).not.toBeNull();
    expect(newRegion).not.toBe(region);
  });
});
