/**
 * Detect if an element is in a right-to-left context.
 * Reads the computed `direction` CSS property on every call so
 * dynamic direction changes (e.g. lang attribute swap) are
 * picked up immediately. One `getComputedStyle` per render is
 * negligible.
 */
export function isRtl(el: Element): boolean {
  return getComputedStyle(el).direction === 'rtl';
}
