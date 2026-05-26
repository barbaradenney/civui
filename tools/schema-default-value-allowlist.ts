/**
 * Schema default-value drift allowlist.
 *
 * Surfaced by `pnpm lint:schema-default-values`. Each entry is a real
 * drift between the schema's `default:` and a native platform's source
 * default — known when the lint was introduced (2026-05-26) but
 * deferred to a focused cleanup pass.
 *
 * The lint reports allowlisted entries as warnings (visible in CI logs)
 * but does not fail on them. Entries are keyed by
 * `${componentName}:${propName}:${platform}` (e.g.
 * `civ-badge:emphasis:ios`).
 *
 * Why an allowlist instead of fixing everything in one PR
 * -------------------------------------------------------
 * ~45 native source files would need single-line default-value edits
 * to align with the schema contract. Most are SwiftUI `EmptyView()` /
 * Kotlin `Column { }` placeholder stubs (low-risk to change), but a
 * handful are real implementations (`civ-text-input.width`,
 * `civ-checkbox.tile`) where the default-value change has behavioral
 * implications a reviewer needs to look at. Bundling them into a
 * separate "align native defaults with schema" branch lets each
 * platform owner sign off without conflating the lint-introduction PR.
 *
 * Lifecycle
 * ---------
 *   1. Each follow-up PR that aligns native defaults must REMOVE the
 *      cleared entries from this allowlist in the same change.
 *   2. A stale entry (in this allowlist but no longer drifting) causes
 *      `pnpm lint:schema-default-values` to fail. The lint forces the
 *      cleanup to keep this file honest.
 *   3. Adding a new entry requires a deliberate edit — discouraging
 *      future drift from sneaking past CI.
 *
 * Tracking: `.claude/rules/audit-debt.md` → "Native default-value
 * drift cleanup (post lint-schema-default-values landing)".
 */
export const SCHEMA_DEFAULT_VALUE_ALLOWLIST: ReadonlySet<string> = new Set([
  // Native enum / string defaults that pick a wrong fallback value.
  'civ-badge:emphasis:ios',
  'civ-badge:emphasis:android',
  'civ-card:cardStyle:ios',
  'civ-card:cardStyle:android',
  'civ-combobox:width:ios',
  'civ-combobox:width:android',
  'civ-select:width:ios',
  'civ-select:width:android',
  'civ-text-input:width:ios',
  'civ-text-input:width:android',
  'civ-text-input:mask:ios',
  'civ-relationship:preset:ios',
  'civ-relationship:preset:android',
  'civ-image:ratio:ios',
  'civ-image:ratio:android',
  'civ-image:size:ios',
  'civ-image:size:android',
  // Native boolean defaults flipped relative to schema.
  'civ-checkbox:tile:ios',
  'civ-checkbox:tile:android',
  'civ-checkbox-group:tile:ios',
  'civ-checkbox-group:tile:android',
  'civ-radio:tile:ios',
  'civ-radio:tile:android',
  'civ-radio-group:tile:ios',
  'civ-radio:checked:android',
  'civ-back-to-top:hidden:ios',
  'civ-back-to-top:hidden:android',
  'civ-data-grid:showGroupSubtotals:ios',
  'civ-data-grid:showGroupSubtotals:android',
  'civ-address:hideStreet2:ios',
  'civ-address:hideStreet2:android',
  'civ-name:hideMiddle:ios',
  'civ-name:hideMiddle:android',
  'civ-name:hideSuffix:ios',
  'civ-name:hideSuffix:android',
  'civ-progress-percent:hidePercent:ios',
  'civ-progress-percent:hidePercent:android',
  // Native number defaults differing from schema.
  'civ-back-to-top:threshold:ios',
  'civ-back-to-top:threshold:android',
  'civ-combobox:minQueryLength:ios',
  'civ-combobox:minQueryLength:android',
  'civ-pagination:pageSize:ios',
  'civ-pagination:pageSize:android',
  'civ-repeater:min:ios',
  'civ-repeater:min:android',
  'civ-spinner:delay:ios',
  'civ-spinner:delay:android',
  'civ-spinner:minDuration:ios',
  'civ-spinner:minDuration:android',
]);
