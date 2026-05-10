/**
 * Structural types describing the public surface of CivUI sub-components
 * that compound components reach into via `querySelector`. These let
 * compounds drop `as any` on `querySelector(...)` results and instead
 * type-check the property access.
 *
 * Why interfaces (not class imports): a compound that just wants to set
 * options on a `civ-select` shouldn't need to import the full CivSelect
 * class — the runtime element registration happens elsewhere, and a
 * heavyweight class import would create cross-package coupling. The
 * interface captures only the property the compound mutates.
 *
 * If a compound needs more than the listed properties, prefer extending
 * the interface here over hand-rolling a one-off `as any` at the call
 * site — keeps the contract centralized.
 */

/**
 * A `civ-select`-like element: anything with a settable `options` array.
 * Compounds set `el.options = [{value, label}, ...]` after first render
 * to populate the dropdown.
 */
export interface SelectLike extends HTMLElement {
  options: Array<{ value: string; label: string }>;
}
