import { interpolate, sanitizeHref, t } from '@civui/core';
import type { RepeaterRow, RepeaterRowSummary } from './repeater-types.js';

/**
 * Pure helpers for civ-repeater.
 *
 * Everything in this file is intentionally `this`-free so the same
 * logic can serve the declarative route-mode render path and the
 * imperative inline / form-steps DOM builders without copy-paste.
 *
 * Tests can also import these directly to verify the fallback chain
 * (summary resolution, edit-href interpolation, heading levels) in
 * isolation from the Lit lifecycle.
 */

/** Options for {@link resolveSummary}. */
export interface ResolveSummaryOptions {
  /** Optional consumer-supplied function — wins over template / fields. */
  rowSummary?: RepeaterRowSummary;
  /** `{prop}`-style template, e.g. `{firstName} {lastName} ({relationship})`. */
  summaryTemplate?: string;
  /** Comma-separated row property names to join with a space. */
  summaryFields?: string;
  /** Used in the final "{itemLabel} {index+1}" fallback. */
  itemLabel: string;
}

/**
 * Resolve the summary text for a row through the documented fallback chain:
 *   rowSummary fn → summary-template → summary-fields join → "{itemLabel} {index+1}".
 */
export function resolveSummary(
  row: RepeaterRow,
  index: number,
  opts: ResolveSummaryOptions,
): string {
  if (typeof opts.rowSummary === 'function') {
    return opts.rowSummary(row, index);
  }
  if (opts.summaryTemplate) {
    return opts.summaryTemplate.replace(/\{([\w$]+)\}/g, (_, key: string) => {
      const v = row[key];
      return v == null ? '' : String(v);
    });
  }
  if (opts.summaryFields) {
    const parts = opts.summaryFields
      .split(',')
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => {
        const v = row[f];
        return v == null ? '' : String(v);
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
  }
  return interpolate(t('repeaterItemLabel'), { item: opts.itemLabel, index: String(index + 1) });
}

/** Options for {@link resolveEditHref}. */
export interface ResolveEditHrefOptions {
  /** URL template with `{id}` and/or `{index}` placeholders. Empty disables. */
  editHrefPattern: string;
  /** Row property to source `{id}` from. */
  idField: string;
  /**
   * Called once per `idField` when a row is missing the id, so the caller
   * can de-dupe warnings across renders without leaking instance state
   * into this pure helper.
   */
  onMissingId?: (idField: string) => void;
}

/**
 * Interpolate `{id}` and `{index}` into the configured pattern. Returns
 * an empty string when no pattern is set (no Edit affordance).
 *
 * `{id}` is sourced from `row[idField]`. When the field is missing or
 * empty the helper falls back to `{index}` and calls `onMissingId` so
 * the caller can emit a dev warning exactly once per idField (rather
 * than once per row × render).
 *
 * Defense-in-depth: the final href is sanitized through `sanitizeHref`
 * here even though civ-link / civ-button do the same — keeps the unsafe
 * scheme blocked even if the pattern itself interpolates an attacker-
 * controlled token.
 */
export function resolveEditHref(
  row: RepeaterRow,
  index: number,
  opts: ResolveEditHrefOptions,
): string {
  if (!opts.editHrefPattern) return '';
  let href = opts.editHrefPattern;
  if (href.includes('{id}')) {
    const raw = row[opts.idField];
    if (raw == null || raw === '') {
      opts.onMissingId?.(opts.idField);
      href = href.replace('{id}', String(index));
    } else {
      href = href.replace('{id}', encodeURIComponent(String(raw)));
    }
  }
  if (href.includes('{index}')) {
    href = href.replace('{index}', String(index));
  }
  return sanitizeHref(href);
}

/**
 * Heading level for per-row headings. The legend's level + 1 so row
 * headings sit one level deeper in the page outline. Falls back to
 * `h3` when the legend isn't promoted; clamped at `h6`.
 */
export function rowHeadingLevel(legendLevel: number | undefined): 1 | 2 | 3 | 4 | 5 | 6 {
  const base = legendLevel ?? 2;
  return Math.min(6, base + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}

/** Localized "Dependent 1" / "Item 3" text for a per-row heading. */
export function rowHeadingText(itemLabel: string, index: number): string {
  return interpolate(t('repeaterItemLabel'), { item: itemLabel, index: String(index + 1) });
}

/**
 * Build the form-steps summary line from the saved field values.
 *
 * Picks up to three non-empty, non-JSON-blob values and joins with
 * commas. Falls back to "{itemLabel} {index+1}" when nothing usable
 * remains.
 */
export function resolveFormStepsSummary(
  data: Record<string, string>,
  index: number,
  itemLabel: string,
): string {
  const values = Object.values(data)
    .filter(v => v && v.trim() && !v.startsWith('{'))
    .slice(0, 3);
  return values.length > 0 ? values.join(', ') : `${itemLabel} ${index + 1}`;
}
