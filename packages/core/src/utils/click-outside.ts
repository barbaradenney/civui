/**
 * Create a click-outside handler that calls `onClickOutside` when a click
 * occurs outside the host element. Returns add/remove functions for the
 * document listener. Safe to call add() multiple times — duplicate
 * listeners are prevented.
 */
export function clickOutside(host: Element, onClickOutside: () => void) {
  let active = false;

  const handler = (e: MouseEvent) => {
    const path = e.composedPath();
    if (!path.includes(host)) {
      onClickOutside();
    }
  };

  return {
    add: () => {
      if (active) return;
      document.addEventListener('click', handler);
      active = true;
    },
    remove: () => {
      document.removeEventListener('click', handler);
      active = false;
    },
    handler,
  };
}
