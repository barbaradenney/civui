/**
 * Single source of truth for the props / events that every component
 * inherits from CivBaseElement / CivFormElement / the boolean-form
 * subclass. The schema-parity check, the Drupal SDC sync, the contract
 * docs generator, and the schema validator all need to agree on which
 * names to treat as inherited (skipped from cross-platform diffing,
 * required on the wrapper rather than the component).
 *
 * Adding a new framework-level prop requires editing this file once;
 * the consumers re-import.
 */

/** Form / base props every component inherits — filtered from cross-platform diffs. */
export const INHERITED_FORM_PROPS: ReadonlySet<string> = new Set([
  'label',
  'name',
  'value',
  'hint',
  'error',
  'required',
  'requiredMessage',
  'disabled',
  'readonly',
  'touched',
  'disableAnalytics',
]);

/**
 * Props provided by `LegendHeadingMixin`
 * (packages/core/src/base/legend-heading-mixin.ts). Filtered ONLY for
 * components that actually compose the mixin in their `extends` /
 * `mixin(...)` chain. A bare `size` prop on a non-heading component
 * (e.g. `civ-image.size`, `civ-spinner.size`, `civ-image-preview.size`)
 * is a real component-specific prop and should be diffed normally.
 *
 * The schema-parity parser uses `LEGEND_HEADING_MIXIN_PATTERN` to
 * detect mixin use in the Lit source; if absent, these props are NOT
 * treated as inherited.
 */
export const LEGEND_HEADING_MIXIN_PROPS: ReadonlySet<string> = new Set([
  'headingLevel',
  'size',
]);

/** Regex used by the parity tool to detect LegendHeadingMixin composition. */
export const LEGEND_HEADING_MIXIN_PATTERN = /LegendHeadingMixin\s*\(/;

/** Boolean-form base props that components extending CivBooleanFormElement inherit. */
export const INHERITED_BOOLEAN_PROPS: ReadonlySet<string> = new Set(['checked', 'description']);

/** Events fired by base classes — schemas don't need to declare them; parity skips them on both sides. */
export const INHERITED_FORM_EVENTS: ReadonlySet<string> = new Set(['civ-analytics', 'civ-reset']);

/**
 * Events that the base CivFormElement class dispatches via `_handleInput`
 * / `_handleChange`. Subclasses delegating to those helpers don't dispatch
 * explicitly — the schema can declare the event but the source-side check
 * shouldn't flag the absence as drift.
 */
export const BASE_DISPATCHED_EVENTS: ReadonlySet<string> = new Set(['civ-input', 'civ-change']);
