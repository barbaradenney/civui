/**
 * check_contrast tool — WCAG 2.1 contrast ratio checker.
 * Resolves CivUI design token names or hex colors and computes contrast ratios.
 *
 * Token resolution
 * ----------------
 * Light + dark palettes are imported from `@civui/tokens` (the generated
 * `dist/js/tokens.js`) so there is no hand-maintained mirror — the
 * canonical JSON is the only source. The flattener walks `tokens.color`
 * to produce `{ 'primary-lightest': '#d9e8f6', 'primary': '#005ea2',
 * 'accent-cool-lightest': '#e1f3f8', 'tag-blue-bg': '#1a4480', … }`.
 * Trailing `-DEFAULT` segments collapse to the bare family name so
 * `civ-text-primary` resolves to the DEFAULT shade.
 *
 * Dark-mode resolution opts in via the `mode` parameter on
 * `checkContrast()` (and the MCP tool surface). The dark palette only
 * defines color tokens (per `color-dark.tokens.json` scope), so the
 * flattener for `darkTokens` produces the same shape and falls back to
 * the light value for any path the dark JSON doesn't define — that
 * matches the rendered CSS cascade behavior (a missing dark override
 * inherits the light variable).
 */
import { tokens, darkTokens } from '@civui/tokens';

type ColorTree = { [k: string]: string | ColorTree };

/**
 * Walk a `color` token tree and flatten to a `{ 'family-shade': hex }`
 * map. Collapses `DEFAULT` to the bare family name (`primary` instead
 * of `primary-DEFAULT`) so users typing `civ-text-primary` resolve
 * cleanly. Three-level paths (`accent.cool.lightest`,
 * `tag.blue.bg`) recurse through the same code path.
 */
export function flattenColors(tree: ColorTree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === 'string') {
      if (key === 'DEFAULT') {
        // Bare family alias — `color.primary.DEFAULT` → `primary`.
        // If `prefix` is empty here we're flattening a value that has
        // no parent path (shouldn't happen for the color tree), skip.
        if (prefix) out[prefix] = value;
      } else {
        out[prefix ? `${prefix}-${key}` : key] = value;
      }
    } else if (value && typeof value === 'object') {
      const newPrefix = prefix ? `${prefix}-${key}` : key;
      Object.assign(out, flattenColors(value, newPrefix));
    }
  }
  return out;
}

const LIGHT_COLORS: Record<string, string> = flattenColors(
  (tokens.color ?? {}) as ColorTree,
);

/**
 * Dark palette only defines color tokens; for any path the dark JSON
 * doesn't override (none today since validateDarkTokenParity in
 * `packages/tokens/build/build-tokens.js` enforces 1:1 parity), fall
 * back to the light value. This mirrors the rendered CSS cascade.
 */
const DARK_COLORS: Record<string, string> = {
  ...LIGHT_COLORS,
  ...flattenColors((darkTokens.color ?? {}) as ColorTree),
};

export type ContrastMode = 'light' | 'dark';

export interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  ratioString: string;
  normalText: { aa: boolean; aaa: boolean };
  largeText: { aa: boolean; aaa: boolean };
  wcag21Level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  mode: ContrastMode;
}

/** Parse a 3- or 6-digit hex color to [r, g, b] in 0–255. */
export function parseHex(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Convert an 8-bit sRGB channel to linear. */
export function sRGBtoLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Compute relative luminance per WCAG 2.1. */
export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

/** Compute contrast ratio between two luminances. */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Resolve a color input to a hex string.
 * Accepts hex (`#005ea2`) or a token name (`primary`, `text-primary`, `civ-bg-error-light`).
 * Strips common Tailwind prefixes: `text-`, `bg-`, `civ-text-`, `civ-bg-`, `border-`, `civ-border-`.
 */
export function resolveColor(input: string, mode: ContrastMode = 'light'): string {
  const trimmed = input.trim();

  // Already a hex color
  if (trimmed.startsWith('#')) return trimmed;

  // Strip common prefixes
  let token = trimmed;
  for (const prefix of ['civ-text-', 'civ-bg-', 'civ-border-', 'text-', 'bg-', 'border-']) {
    if (token.startsWith(prefix)) {
      token = token.slice(prefix.length);
      break;
    }
  }

  const palette = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const hex = palette[token];
  if (!hex) {
    throw new Error(
      `Unknown color token: "${input}". Available tokens (${mode} mode): ` +
        Object.keys(palette).sort().join(', '),
    );
  }
  return hex;
}

/**
 * Check WCAG 2.1 contrast ratio between foreground and background colors.
 *
 * @param mode  `'light'` (default) resolves tokens against the light
 *              palette; `'dark'` resolves against the dark palette so
 *              consumers can validate the rendered contrast a dark-mode
 *              user sees. Hex inputs are unaffected by the mode flag.
 */
export function checkContrast(
  foreground: string,
  background: string,
  mode: ContrastMode = 'light',
): ContrastResult {
  const fgHex = resolveColor(foreground, mode);
  const bgHex = resolveColor(background, mode);

  const [fgR, fgG, fgB] = parseHex(fgHex);
  const [bgR, bgG, bgB] = parseHex(bgHex);

  const fgLum = relativeLuminance(fgR, fgG, fgB);
  const bgLum = relativeLuminance(bgR, bgG, bgB);

  const ratio = contrastRatio(fgLum, bgLum);
  const rounded = Math.round(ratio * 100) / 100;

  const normalAA = ratio >= 4.5;
  const normalAAA = ratio >= 7;
  const largeAA = ratio >= 3;
  const largeAAA = ratio >= 4.5;

  let wcag21Level: ContrastResult['wcag21Level'];
  if (normalAAA) {
    wcag21Level = 'AAA';
  } else if (normalAA) {
    wcag21Level = 'AA';
  } else if (largeAA) {
    wcag21Level = 'AA Large';
  } else {
    wcag21Level = 'Fail';
  }

  return {
    foreground: fgHex,
    background: bgHex,
    ratio: rounded,
    ratioString: `${rounded}:1`,
    normalText: { aa: normalAA, aaa: normalAAA },
    largeText: { aa: largeAA, aaa: largeAAA },
    wcag21Level,
    mode,
  };
}
