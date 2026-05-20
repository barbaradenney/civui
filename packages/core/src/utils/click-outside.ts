/**
 * Create a click-outside handler that calls `onClickOutside` when a click
 * occurs outside the host element. Returns add/remove functions for the
 * document listener. Safe to call add() multiple times — duplicate
 * listeners are prevented.
 *
 * Skips the click event that was in flight when `add()` was called. Why:
 * popups (civ-action-sheet, civ-menu) call `add()` from inside their own
 * `open` reactive flow, which Lit runs in a microtask. During real mouse
 * dispatch, Chrome drains microtasks between bubble-phase listeners — so
 * even `queueMicrotask`-deferred listener attachment happens before the
 * click reaches `document`, and the popup closes on the very click that
 * opened it. We detect "called from inside event dispatch" via
 * `window.event` and skip the next handler invocation in that case.
 *
 * Programmatic `add()` (no event in flight) doesn't set the skip flag,
 * so a genuine outside click after a programmatic open closes normally.
 */
export function clickOutside(host: Element, onClickOutside: () => void) {
  let active = false;
  let skipNext = false;

  const handler = (e: MouseEvent) => {
    if (skipNext) {
      skipNext = false;
      return;
    }
    const path = e.composedPath();
    if (!path.includes(host)) {
      onClickOutside();
    }
  };

  return {
    add: () => {
      if (active) return;
      // `window.event` is non-standard but universally supported; it
      // returns the currently-dispatching event during sync event flow
      // and is undefined otherwise.
      if ((window as any).event) {
        skipNext = true;
      }
      document.addEventListener('click', handler);
      active = true;
    },
    remove: () => {
      document.removeEventListener('click', handler);
      active = false;
      skipNext = false;
    },
    handler,
  };
}
