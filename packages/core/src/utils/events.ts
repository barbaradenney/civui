/**
 * Dispatch a typed custom event that bubbles and is composed.
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
