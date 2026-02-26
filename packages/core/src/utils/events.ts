/**
 * Dispatch a typed custom event that bubbles and is composed.
 *
 * Both `bubbles` and `composed` are set to `true` so events cross
 * component boundaries (relevant if Shadow DOM is ever introduced).
 * Native events (e.g. `input`, `change`) are NOT re-dispatched —
 * CivUI uses custom event names (`civ-input`, `civ-change`) to
 * avoid interference with native event flow.
 */
export function dispatch<T>(element: HTMLElement, name: string, detail?: T): boolean {
  return element.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
