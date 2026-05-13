/**
 * Token accessors inside the plugin sandbox. The token subset is
 * inlined into the bundle at build time as `__TOKEN_SUBSET__` (see
 * esbuild.config.mjs `define`).
 *
 * Designers get token-driven container styling without the plugin
 * needing network access or filesystem reads at runtime.
 */

import type { TokenSubset } from '../shared/types';

declare const __TOKEN_SUBSET__: TokenSubset;

const TOKENS: TokenSubset = __TOKEN_SUBSET__;

/**
 * Look up a color token by dotted path (e.g., `primary` for the DEFAULT
 * shade, `primary-dark`, `base-darkest`). Falls back to white if missing,
 * but logs a console warning so missing tokens are visible during dev.
 */
export function color(path: string): RGB {
  const t = TOKENS.colors[path];
  if (!t) {
    console.warn(`[civui-figma] missing color token: ${path}`);
    return { r: 1, g: 1, b: 1 };
  }
  return { r: t.r, g: t.g, b: t.b };
}

export function colorRGBA(path: string): RGBA {
  const t = TOKENS.colors[path];
  if (!t) return { r: 1, g: 1, b: 1, a: 1 };
  return t;
}

export function spacing(path: string, fallback = 8): number {
  return TOKENS.spacing[path] ?? fallback;
}

export function radius(path: string, fallback = 4): number {
  return TOKENS.radii[path] ?? fallback;
}

export function fontFamily(): string {
  return TOKENS.typography.fontFamily;
}
