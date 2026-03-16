/**
 * Create a click-outside handler that calls `onClickOutside` when a click
 * occurs outside the host element. Returns add/remove functions for the
 * document listener.
 */
export function clickOutside(host: Element, onClickOutside: () => void) {
  const handler = (e: MouseEvent) => {
    const path = e.composedPath();
    if (!path.includes(host)) {
      onClickOutside();
    }
  };

  return {
    add: () => document.addEventListener('click', handler),
    remove: () => document.removeEventListener('click', handler),
    handler,
  };
}
