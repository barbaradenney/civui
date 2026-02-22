/**
 * Announce a message to screen readers via live regions.
 * Uses two separate regions (polite and assertive) to avoid conflicts.
 * Queues rapid announcements so they don't overwrite each other.
 */

let politeRegion: HTMLElement | null = null;
let assertiveRegion: HTMLElement | null = null;

const QUEUE_DELAY = 150;
let politeQueue: string[] = [];
let assertiveQueue: string[] = [];
let politeTimer: ReturnType<typeof setTimeout> | null = null;
let assertiveTimer: ReturnType<typeof setTimeout> | null = null;

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

function createRegion(priority: 'polite' | 'assertive'): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  Object.assign(el.style, SR_ONLY_STYLES);
  document.body.appendChild(el);
  return el;
}

function ensureRegion(priority: 'polite' | 'assertive'): HTMLElement {
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

  const message = queue.shift()!;
  const region = ensureRegion(priority);

  // Clear then set to ensure announcement even if same message
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });

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
  if (priority === 'assertive') {
    assertiveQueue.push(message);
    if (!assertiveTimer) {
      processQueue('assertive');
    }
  } else {
    politeQueue.push(message);
    if (!politeTimer) {
      processQueue('polite');
    }
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
  if (politeRegion) { politeRegion.remove(); politeRegion = null; }
  if (assertiveRegion) { assertiveRegion.remove(); assertiveRegion = null; }
}
