/**
 * Dispatch a typed custom event that bubbles and is composed.
 *
 * Both `bubbles` and `composed` are set to `true` so events cross
 * component boundaries (relevant if Shadow DOM is ever introduced).
 * Native events (e.g. `input`, `change`) are NOT re-dispatched —
 * CivUI uses custom event names (`civ-input`, `civ-change`) to
 * avoid interference with native event flow.
 */
export function dispatch<T>(element: HTMLElement, name: string, detail?: T, cancelable = false): boolean {
  return element.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable,
    }),
  );
}

/**
 * Forward clicks on tile padding to the inner input.
 * Ignores clicks on the label (already handled natively) and
 * any child content (hint, error) — only the tile div itself triggers.
 */
export function forwardTileClick(host: HTMLElement, e: Event): void {
  if (e.target !== e.currentTarget) return;
  const input = host.querySelector('input');
  if (input && !input.disabled) input.click();
}
