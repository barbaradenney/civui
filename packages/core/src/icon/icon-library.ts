/**
 * Icon definitions using layered Unicode characters.
 *
 * Each icon is an array of "layers" — a Unicode character plus optional
 * CSS transforms (scale, rotate, translate) that position it within
 * a 1em × 1em box.  The container uses `position: relative` with
 * `overflow: hidden`, and every layer is `position: absolute` centered
 * in the box.  Because the characters are text, they inherit `color`
 * and scale with `font-size`.
 */

export interface IconLayer {
  /** The Unicode character(s) to render. */
  char: string;
  /** CSS transform string applied to this layer. */
  transform?: string;
  /** Optional opacity (0–1). */
  opacity?: number;
  /** Optional font-weight (e.g., 'bold', '700', 'normal'). */
  weight?: string;
}

export type IconDef = {
  /** Human-readable name for aria-label fallback. */
  label: string;
  /** Layers rendered bottom-to-top. */
  layers: IconLayer[];
};

/**
 * Built-in icon definitions.
 *
 * Design constraints:
 * - Only Unicode box-drawing, block, geometric, math, and symbol characters
 * - No emoji (no codepoints above U+2FFF except box-drawing/blocks)
 * - Every icon must be legible at 16px (1em default)
 */
/**
 * Base scale: 1.0 = fits the 1em box naturally.
 * All single-character icons use scale(1.0) as the baseline.
 * Multi-layer icons scale containers to ~0.9 and inner elements smaller.
 * This ensures all icons appear optically similar in size.
 */
export const icons: Record<string, IconDef> = {
  // ── Navigation ──────────────────────────────────────────────

  'chevron-right': {
    label: 'Next',
    layers: [{ char: '⌃', transform: 'scale(1.0) rotate(90deg)' }],
  },
  'chevron-left': {
    label: 'Previous',
    layers: [{ char: '⌃', transform: 'scale(1.0) rotate(-90deg)' }],
  },
  'chevron-down': {
    label: 'Expand',
    layers: [{ char: '⌃', transform: 'scale(1.0) rotate(180deg)' }],
  },
  'chevron-up': {
    label: 'Collapse',
    layers: [{ char: '⌃', transform: 'scale(1.0)' }],
  },
  'arrow-right': {
    label: 'Right',
    layers: [{ char: '→', transform: 'scale(1.0)' }],
  },
  'arrow-left': {
    label: 'Left',
    layers: [{ char: '←', transform: 'scale(1.0)' }],
  },
  'arrow-up': {
    label: 'Up',
    layers: [{ char: '↑', transform: 'scale(1.0)' }],
  },
  'arrow-down': {
    label: 'Down',
    layers: [{ char: '↓', transform: 'scale(1.0)' }],
  },
  'arrow-back': {
    label: 'Go back',
    layers: [{ char: '↩', transform: 'scale(1.0)' }],
  },
  'external-link': {
    label: 'Opens in new tab',
    layers: [
      { char: '□', transform: 'scale(0.75) translate(-10%, 10%)' },
      { char: '↗', transform: 'scale(0.6) translate(25%, -25%)' },
    ],
  },

  // ── Actions ─────────────────────────────────────────────────

  close: {
    label: 'Close',
    layers: [{ char: '✕', transform: 'scale(0.9)', weight: 'bold' }],
  },
  plus: {
    label: 'Add',
    layers: [{ char: '+', transform: 'scale(1.0)', weight: 'bold' }],
  },
  minus: {
    label: 'Remove',
    layers: [{ char: '−', transform: 'scale(1.0)', weight: 'bold' }],
  },
  menu: {
    label: 'Menu',
    layers: [{ char: '≡', transform: 'scale(1.0)' }],
  },
  'more-vertical': {
    label: 'More options',
    layers: [{ char: '⋮', transform: 'scale(1.0)' }],
  },
  'more-horizontal': {
    label: 'More options',
    layers: [{ char: '⋯', transform: 'scale(1.0)' }],
  },
  search: {
    label: 'Search',
    layers: [{ char: '⌕', transform: 'scale(1.0)' }],
  },
  edit: {
    label: 'Edit',
    layers: [{ char: '✎', transform: 'scale(1.0)' }],
  },

  // ── Status / Feedback ───────────────────────────────────────

  check: {
    label: 'Success',
    layers: [{ char: '✓', transform: 'scale(1.0)', weight: 'bold' }],
  },
  'check-circle': {
    label: 'Success',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '✓', transform: 'scale(0.6)', weight: 'bold' },
    ],
  },
  error: {
    label: 'Error',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '!', transform: 'scale(0.55)', weight: 'bold' },
    ],
  },
  warning: {
    label: 'Warning',
    layers: [
      { char: '△', transform: 'scale(1.1)' },
      { char: '!', transform: 'scale(0.45) translate(0%, 10%)', weight: 'bold' },
    ],
  },
  info: {
    label: 'Information',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: 'i', transform: 'scale(0.55) translate(0%, 2%)', weight: 'bold' },
    ],
  },
  help: {
    label: 'Help',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '?', transform: 'scale(0.55)', weight: 'bold' },
    ],
  },

  // ── Form / Input ────────────────────────────────────────────

  'required-indicator': {
    label: 'Required',
    layers: [{ char: '✱', transform: 'scale(0.7)' }],
  },
  'sort-asc': {
    label: 'Sorted ascending',
    layers: [{ char: '▲', transform: 'scale(0.7)' }],
  },
  'sort-desc': {
    label: 'Sorted descending',
    layers: [{ char: '▼', transform: 'scale(0.7)' }],
  },
  'sort-none': {
    label: 'Unsorted',
    layers: [
      { char: '▲', transform: 'scale(0.5) translate(0%, -35%)', opacity: 0.4 },
      { char: '▼', transform: 'scale(0.5) translate(0%, 35%)', opacity: 0.4 },
    ],
  },
  calendar: {
    label: 'Calendar',
    layers: [
      { char: '□', transform: 'scale(0.9) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.55) translate(0%, -42%)' },
      { char: '⋯', transform: 'scale(0.45) translate(0%, 15%)' },
    ],
  },

  // ── Media / Content ─────────────────────────────────────────

  upload: {
    label: 'Upload',
    layers: [
      { char: '↑', transform: 'scale(0.9) translate(0%, -10%)' },
      { char: '▔', transform: 'scale(0.6) translate(0%, 50%)' },
    ],
  },
  download: {
    label: 'Download',
    layers: [
      { char: '↓', transform: 'scale(0.9) translate(0%, -10%)' },
      { char: '▔', transform: 'scale(0.6) translate(0%, 50%)' },
    ],
  },
  copy: {
    label: 'Copy',
    layers: [
      { char: '□', transform: 'scale(0.6) translate(-12%, 12%)' },
      { char: '□', transform: 'scale(0.6) translate(12%, -12%)' },
    ],
  },
  trash: {
    label: 'Delete',
    layers: [
      { char: '▔', transform: 'scale(0.6) translate(0%, -35%)' },
      { char: '▕', transform: 'scale(0.25) translate(0%, -80%)' },
      { char: '□', transform: 'scale(0.55) translate(0%, 15%)' },
    ],
  },

  // ── UI Chrome ───────────────────────────────────────────────

  grip: {
    label: 'Drag handle',
    layers: [
      { char: '⠿', transform: 'scale(1.0)' },
    ],
  },
  loading: {
    label: 'Loading',
    layers: [
      { char: '◔', transform: 'scale(1.0)' },
    ],
  },
  lock: {
    label: 'Locked',
    layers: [
      { char: '□', transform: 'scale(0.6) translate(0%, 15%)' },
      { char: '◠', transform: 'scale(0.45) translate(0%, -30%)' },
    ],
  },
  home: {
    label: 'Home',
    layers: [
      { char: '△', transform: 'scale(0.85) translate(0%, -15%)' },
      { char: '▪', transform: 'scale(0.3) translate(0%, 45%)' },
    ],
  },
  settings: {
    label: 'Settings',
    layers: [
      { char: '⊕', transform: 'scale(1.0)' },
    ],
  },
  filter: {
    label: 'Filter',
    layers: [
      { char: '▽', transform: 'scale(0.9)' },
    ],
  },
  star: {
    label: 'Favorite',
    layers: [
      { char: '☆', transform: 'scale(1.0)' },
    ],
  },
  'star-filled': {
    label: 'Favorited',
    layers: [
      { char: '★', transform: 'scale(1.0)' },
    ],
  },
  print: {
    label: 'Print',
    layers: [
      { char: '□', transform: 'scale(0.8) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.45) translate(0%, -40%)' },
      { char: '▁', transform: 'scale(0.45) translate(0%, 48%)' },
    ],
  },
  user: {
    label: 'User account',
    layers: [
      { char: '○', transform: 'scale(0.5) translate(0%, -30%)' },
      { char: '◠', transform: 'scale(0.7) translate(0%, 30%)' },
    ],
  },
  mail: {
    label: 'Email',
    layers: [
      { char: '□', transform: 'scale(0.9) translate(0%, 5%)' },
      { char: '▽', transform: 'scale(0.5) translate(0%, -18%)' },
    ],
  },
};

/**
 * Register a custom icon or override a built-in one.
 */
export function registerIcon(name: string, def: IconDef): void {
  icons[name] = def;
}

/** Store original icon keys for reset */
const _builtInIconNames = new Set(Object.keys(icons));

/** Reset icon registry to built-in icons only (for test isolation). */
export function resetIcons(): void {
  for (const key of Object.keys(icons)) {
    if (!_builtInIconNames.has(key)) {
      delete icons[key];
    }
  }
}

/**
 * Get all registered icon names.
 */
export function getIconNames(): string[] {
  return Object.keys(icons);
}
