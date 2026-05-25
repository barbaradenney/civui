/**
 * Test helpers for civ-repeater.
 *
 * Centralize the DOM-query shapes the test suite uses so the BEM class
 * names (`civ-list-item__content`, `civ-list-item__actions`) and the
 * data-attribute conventions (`data-civ-repeater-row`,
 * `data-civ-repeater-rows`) live in one place. If those strings ever
 * change, the test file barely notices.
 *
 * Intentionally NOT exported from the package barrel — these are test
 * fixtures, not consumer API.
 */

/** All row elements in the repeater, in DOM order. */
export function getRows(el: Element): NodeListOf<Element> {
  return el.querySelectorAll('[data-civ-repeater-row]');
}

/** The Nth row element. Returns null if out of bounds. */
export function getRow(el: Element, index: number): Element | null {
  return getRows(el).item(index);
}

/** The Add button (real `<civ-button href>` in route mode, or `<civ-button>` in inline/form-steps). */
export function getAddButton(el: Element): Element | null {
  return el.querySelector(':scope > fieldset > civ-button');
}

/** The Remove button inside a specific row (matched via `[danger]`). */
export function getRowRemoveButton(el: Element, index: number): Element | null {
  return getRow(el, index)?.querySelector('civ-action-button[danger]') ?? null;
}

/**
 * The Edit affordance inside a route-mode row. Matches the polymorphic
 * `<civ-action-button href="…">` rendered alongside Remove.
 */
export function getRowEditLink(el: Element, index: number): Element | null {
  return getRow(el, index)?.querySelector('civ-action-button[href]') ?? null;
}

/** Number of rows currently rendered. */
export function rowCount(el: Element): number {
  return getRows(el).length;
}
