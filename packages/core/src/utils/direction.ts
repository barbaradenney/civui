/**
 * Detect if an element is in a right-to-left context.
 * Reads the computed `direction` CSS property.
 */
export function isRtl(el: Element): boolean {
  return getComputedStyle(el).direction === 'rtl';
}
