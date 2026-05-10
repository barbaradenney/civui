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

/**
 * The shared shape of any CivUI form control that `civ-form-field` /
 * `civ-form-fieldset` cascades wrapper-level props onto. Every CivUI
 * form-input class declares these as `@property` reactive fields, so the
 * structural assignment matches at runtime; this type just lets the wrapper
 * cascade without `as any`.
 *
 * `requiredMessage` is optional because a few group components don't
 * accept it (the wrapper checks `if (this.requiredMessage)` before
 * assigning).
 */
export interface FormControlLike extends HTMLElement {
  label: string;
  hint: string;
  error: string;
  required: boolean;
  disabled: boolean;
  requiredMessage?: string;
}
