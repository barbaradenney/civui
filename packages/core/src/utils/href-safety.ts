/**
 * Shared href-sanitization helpers for the components that accept a
 * user-supplied `href` prop (civ-link, civ-link-card, civ-list-item,
 * civ-skip-link). Each previously defined its own
 *   /^\s*javascript\s*:/i
 * pattern and `_safeHref` getter. This file is the single source of
 * truth.
 *
 * The check is intentionally narrow: `javascript:` is the high-risk
 * XSS vector for HTML anchors. `data:` and `vbscript:` are also
 * unsafe in some contexts; if the threat model expands, extend the
 * pattern here rather than per-component.
 */

const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

/**
 * @returns `true` when the supplied href does NOT match a known unsafe
 *          protocol. Empty / undefined inputs are considered safe
 *          (the rendered element omits its `href` attribute).
 */
export function isSafeHref(href: string | null | undefined): boolean {
  if (!href) return true;
  return !UNSAFE_HREF_PATTERN.test(href);
}

/**
 * @returns the href when safe, or an empty string when unsafe. Use in
 *          render paths that always need a string value.
 */
export function sanitizeHref(href: string | null | undefined): string {
  if (!href) return '';
  return isSafeHref(href) ? href : '';
}
