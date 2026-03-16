/**
 * Detect if an element is in a right-to-left context.
 * Reads the computed `direction` CSS property.
 * Caches per element to avoid repeated style recalculations.
 */
const rtlCache = new WeakMap<Element, boolean>();

export function isRtl(el: Element): boolean {
  let cached = rtlCache.get(el);
  if (cached === undefined) {
    cached = getComputedStyle(el).direction === 'rtl';
    rtlCache.set(el, cached);
  }
  return cached;
}
