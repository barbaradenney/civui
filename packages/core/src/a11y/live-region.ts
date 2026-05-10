/**
 * Announce a message to screen readers via live regions.
 * Uses two separate regions (polite and assertive) to avoid conflicts.
 * Queues rapid announcements so they don't overwrite each other.
 */

let politeRegion: HTMLElement | null = null;
let assertiveRegion: HTMLElement | null = null;

const QUEUE_DELAY = 150;
const MAX_QUEUE_SIZE = 10;

/**
 * Standard debounce intervals for screen-reader announcements that
 * fire on user typing. Components that announce per-keystroke (combobox
 * search, textarea/text-input character counts) should debounce so
 * SRs don't read every intermediate value.
 *
 * Two named values cover the existing cases:
 *  - SEARCH_ANNOUNCE_MS — "X results found" after a search input lands.
 *    300ms feels responsive without being chatty (combobox).
 *  - COUNT_ANNOUNCE_MS — character-count updates on free-form text.
 *    1000ms is long because the count moves on every keystroke; we
 *    only want to interrupt the user when they pause (textarea,
 *    text-input).
 */
export const SEARCH_ANNOUNCE_MS = 300;
export const COUNT_ANNOUNCE_MS = 1000;
let politeQueue: string[] = [];
let assertiveQueue: string[] = [];
let politeTimer: ReturnType<typeof setTimeout> | null = null;
let assertiveTimer: ReturnType<typeof setTimeout> | null = null;
let politeRafId: number | null = null;
let assertiveRafId: number | null = null;

const SR_ONLY_STYLES = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
};

function createRegion(priority: 'polite' | 'assertive'): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const el = document.createElement('div');
  el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  Object.assign(el.style, SR_ONLY_STYLES);
  document.body.appendChild(el);
  return el;
}

function ensureRegion(priority: 'polite' | 'assertive'): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (priority === 'assertive') {
    if (!assertiveRegion || !document.body.contains(assertiveRegion)) {
      assertiveRegion = createRegion('assertive');
    }
    return assertiveRegion;
  }
  if (!politeRegion || !document.body.contains(politeRegion)) {
    politeRegion = createRegion('polite');
  }
  return politeRegion;
}

function processQueue(priority: 'polite' | 'assertive'): void {
  const queue = priority === 'assertive' ? assertiveQueue : politeQueue;
  if (queue.length === 0) return;

  const message = queue.shift() ?? '';
  const region = ensureRegion(priority);
  if (!region) return;

  // Clear then set to ensure announcement even if same message
  region.textContent = '';
  const rafId = requestAnimationFrame(() => {
    region.textContent = message;
    if (priority === 'assertive') {
      assertiveRafId = null;
    } else {
      politeRafId = null;
    }
  });
  if (priority === 'assertive') {
    assertiveRafId = rafId;
  } else {
    politeRafId = rafId;
  }

  // Schedule next message if queue has more
  if (queue.length > 0) {
    const timer = setTimeout(() => processQueue(priority), QUEUE_DELAY);
    if (priority === 'assertive') {
      assertiveTimer = timer;
    } else {
      politeTimer = timer;
    }
  } else {
    if (priority === 'assertive') {
      assertiveTimer = null;
    } else {
      politeTimer = null;
    }
  }
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (!message || !message.trim()) return;
  if (priority === 'assertive') {
    if (assertiveQueue.length >= MAX_QUEUE_SIZE) assertiveQueue.shift();
    assertiveQueue.push(message);
    if (!assertiveTimer) {
      processQueue('assertive');
    }
  } else {
    if (politeQueue.length >= MAX_QUEUE_SIZE) politeQueue.shift();
    politeQueue.push(message);
    if (!politeTimer) {
      processQueue('polite');
    }
  }
}

/**
 * Cancel all pending announcements. Useful when navigating away
 * from a page or dismissing a component that queued announcements.
 */
export function cancelAnnouncements(priority?: 'polite' | 'assertive'): void {
  if (!priority || priority === 'polite') {
    politeQueue = [];
    if (politeTimer) { clearTimeout(politeTimer); politeTimer = null; }
    if (politeRafId != null) { cancelAnimationFrame(politeRafId); politeRafId = null; }
    if (politeRegion) politeRegion.textContent = '';
  }
  if (!priority || priority === 'assertive') {
    assertiveQueue = [];
    if (assertiveTimer) { clearTimeout(assertiveTimer); assertiveTimer = null; }
    if (assertiveRafId != null) { cancelAnimationFrame(assertiveRafId); assertiveRafId = null; }
    if (assertiveRegion) assertiveRegion.textContent = '';
  }
}

/**
 * Clean up live region state. Call this between tests to prevent
 * state leakage. Clears queues, timers, and removes DOM elements.
 */
export function cleanupLiveRegions(): void {
  politeQueue = [];
  assertiveQueue = [];
  if (politeTimer) { clearTimeout(politeTimer); politeTimer = null; }
  if (assertiveTimer) { clearTimeout(assertiveTimer); assertiveTimer = null; }
  if (politeRafId != null) { cancelAnimationFrame(politeRafId); politeRafId = null; }
  if (assertiveRafId != null) { cancelAnimationFrame(assertiveRafId); assertiveRafId = null; }
  if (politeRegion) { politeRegion.remove(); politeRegion = null; }
  if (assertiveRegion) { assertiveRegion.remove(); assertiveRegion = null; }
}
