/**
 * Dev-mode console.warn helpers.
 *
 * Several CivUI components accept JSON-string attributes
 * (support-resources, civ-progress-steps' steps, etc.). When the
 * consumer passes malformed JSON or the wrong shape, the converter
 * silently falls back to an empty default — and nothing renders. The
 * form-pattern audit caught at least one such bug (the housing-address
 * support-resources story passing a plain English sentence).
 *
 * Use `warnInvalidProp(tag, prop, expectation, received)` from inside
 * a property converter or render path to surface the silent fallback.
 *
 * Suppression: set `globalThis.CIV_DEV = false` (e.g. in production
 * bundles) to quiet every dev-warn at runtime.
 */

interface CivDevFlag {
  CIV_DEV?: unknown;
}

function isDev(): boolean {
  if (typeof console === 'undefined') return false;
  const flag = (globalThis as CivDevFlag).CIV_DEV;
  // Default: warn unless explicitly disabled.
  return flag !== false;
}

function shorten(s: string, max = 80): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * Warn that a CivUI component prop value was rejected and the
 * component fell back to its default. Useful in attribute converters
 * and prop-validation paths.
 */
export function warnInvalidProp(
  tag: string,
  prop: string,
  expectation: string,
  received: unknown,
): void {
  if (!isDev()) return;
  const formatted =
    typeof received === 'string'
      ? `"${shorten(received)}"`
      : shorten(JSON.stringify(received) ?? String(received));
  console.warn(
    `[${tag}] ${prop} must be ${expectation}. Got ${formatted}. ` +
    `Falling back to default — no value applied.`,
  );
}
