/**
 * check_contrast tool — WCAG 2.1 contrast ratio checker.
 * Resolves CivUI design token names or hex colors and computes contrast ratios.
 */

/** Light-mode token colors from color.tokens.json. */
const TOKEN_COLORS: Record<string, string> = {
  // Primary
  'primary-lightest': '#d9e8f6',
  'primary-lighter': '#73b3e7',
  'primary-light': '#2378c3',
  'primary': '#005ea2',
  'primary-vivid': '#0050d8',
  'primary-dark': '#1a4480',
  'primary-darker': '#162e51',

  // Error
  'error-lightest': '#faf0f0',
  'error-lighter': '#f4e3db',
  'error-light': '#d63e04',
  'error': '#b50909',
  'error-dark': '#8b0a03',
  'error-darkest': '#5a0602',

  // Warning
  'warning-lightest': '#faf3d1',
  'warning-lighter': '#fcedb7',
  'warning-light': '#fee685',
  'warning': '#e5a000',
  'warning-dark': '#936f38',
  'warning-darkest': '#6b4c11',

  // Success
  'success-lightest': '#ecf3ec',
  'success-lighter': '#b8e6b8',
  'success-light': '#70e17b',
  'success': '#00a91c',
  'success-dark': '#4d8055',
  'success-darkest': '#1a4d1a',

  // Info
  'info-lightest': '#e7f6f8',
  'info-lighter': '#c5ecf2',
  'info-light': '#99deea',
  'info': '#00bde3',
  'info-dark': '#2e6276',
  'info-darkest': '#1d4554',

  // Base (neutrals)
  'base-lightest': '#f0f0f0',
  'base-lighter': '#dfe1e2',
  'base-light': '#a9aeb1',
  'base': '#71767a',
  'base-dark': '#565c65',
  'base-darker': '#3d4551',
  'base-darkest': '#1b1b1b',

  // White & black
  'white': '#ffffff',
  'black': '#000000',

  // Accent - cool
  'accent-cool-lightest': '#e1f3f8',
  'accent-cool-light': '#97d4ea',
  'accent-cool': '#00bde3',
  'accent-cool-dark': '#28a0cb',

  // Accent - warm
  'accent-warm-lightest': '#f2e4d4',
  'accent-warm-light': '#ffbc78',
  'accent-warm': '#fa9441',
  'accent-warm-dark': '#c05600',
};

export interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  ratioString: string;
  normalText: { aa: boolean; aaa: boolean };
  largeText: { aa: boolean; aaa: boolean };
  wcag21Level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
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
export function resolveColor(input: string): string {
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

  const hex = TOKEN_COLORS[token];
  if (!hex) {
    throw new Error(
      `Unknown color token: "${input}". Available tokens: ${Object.keys(TOKEN_COLORS).join(', ')}`,
    );
  }
  return hex;
}

/**
 * Check WCAG 2.1 contrast ratio between foreground and background colors.
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const fgHex = resolveColor(foreground);
  const bgHex = resolveColor(background);

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
  };
}
