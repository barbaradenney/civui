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
export const icons: Record<string, IconDef> = {
  // ── Navigation ──────────────────────────────────────────────

  'chevron-right': {
    label: 'Next',
    layers: [{ char: '⌃', transform: 'scale(1.2) rotate(90deg)' }],
  },
  'chevron-left': {
    label: 'Previous',
    layers: [{ char: '⌃', transform: 'scale(1.2) rotate(-90deg)' }],
  },
  'chevron-down': {
    label: 'Expand',
    layers: [{ char: '⌃', transform: 'scale(1.2) rotate(180deg)' }],
  },
  'chevron-up': {
    label: 'Collapse',
    layers: [{ char: '⌃', transform: 'scale(1.2)' }],
  },
  'arrow-right': {
    label: 'Right',
    layers: [{ char: '→', transform: 'scale(1.2)' }],
  },
  'arrow-left': {
    label: 'Left',
    layers: [{ char: '←', transform: 'scale(1.2)' }],
  },
  'arrow-up': {
    label: 'Up',
    layers: [{ char: '↑', transform: 'scale(1.2)' }],
  },
  'arrow-down': {
    label: 'Down',
    layers: [{ char: '↓', transform: 'scale(1.2)' }],
  },
  'arrow-back': {
    label: 'Go back',
    layers: [{ char: '↩', transform: 'scale(1.1)' }],
  },
  'external-link': {
    label: 'Opens in new tab',
    layers: [
      { char: '□', transform: 'scale(0.8) translate(-8%, 8%)' },
      { char: '↗', transform: 'scale(0.7) translate(18%, -18%)' },
    ],
  },

  // ── Actions ─────────────────────────────────────────────────

  close: {
    label: 'Close',
    layers: [{ char: '✕', transform: 'scale(1.1)' }],
  },
  plus: {
    label: 'Add',
    layers: [{ char: '+', transform: 'scale(1.3)' }],
  },
  minus: {
    label: 'Remove',
    layers: [{ char: '−', transform: 'scale(1.3)' }],
  },
  menu: {
    label: 'Menu',
    layers: [{ char: '≡', transform: 'scale(1.3)' }],
  },
  'more-vertical': {
    label: 'More options',
    layers: [{ char: '⋮', transform: 'scale(1.3)' }],
  },
  'more-horizontal': {
    label: 'More options',
    layers: [{ char: '⋯', transform: 'scale(1.3)' }],
  },
  search: {
    label: 'Search',
    layers: [
      { char: '○', transform: 'scale(0.7) translate(-15%, -15%)' },
      { char: '╲', transform: 'scale(0.5) translate(40%, 40%)' },
    ],
  },
  edit: {
    label: 'Edit',
    layers: [
      { char: '╱', transform: 'scale(0.9) translate(-5%, 5%)' },
      { char: '▁', transform: 'scale(0.3) translate(-60%, 120%)' },
    ],
  },

  // ── Status / Feedback ───────────────────────────────────────

  check: {
    label: 'Success',
    layers: [{ char: '✓', transform: 'scale(1.2)' }],
  },
  'check-circle': {
    label: 'Success',
    layers: [
      { char: '○', transform: 'scale(1.2)' },
      { char: '✓', transform: 'scale(0.7)' },
    ],
  },
  error: {
    label: 'Error',
    layers: [
      { char: '△', transform: 'scale(1.2)' },
      { char: '!', transform: 'scale(0.65) translate(0%, 12%)' },
    ],
  },
  warning: {
    label: 'Warning',
    layers: [
      { char: '△', transform: 'scale(1.2)' },
      { char: '!', transform: 'scale(0.65) translate(0%, 12%)' },
    ],
  },
  info: {
    label: 'Information',
    layers: [
      { char: '○', transform: 'scale(1.2)' },
      { char: 'i', transform: 'scale(0.7) translate(0%, 2%)' },
    ],
  },
  help: {
    label: 'Help',
    layers: [
      { char: '○', transform: 'scale(1.2)' },
      { char: '?', transform: 'scale(0.7)' },
    ],
  },

  // ── Form / Input ────────────────────────────────────────────

  'required-indicator': {
    label: 'Required',
    layers: [{ char: '✱', transform: 'scale(0.7)' }],
  },
  'sort-asc': {
    label: 'Sorted ascending',
    layers: [{ char: '▲', transform: 'scale(0.8)' }],
  },
  'sort-desc': {
    label: 'Sorted descending',
    layers: [{ char: '▼', transform: 'scale(0.8)' }],
  },
  'sort-none': {
    label: 'Unsorted',
    layers: [
      { char: '▲', transform: 'scale(0.55) translate(0%, -35%)', opacity: 0.4 },
      { char: '▼', transform: 'scale(0.55) translate(0%, 35%)', opacity: 0.4 },
    ],
  },
  calendar: {
    label: 'Calendar',
    layers: [
      { char: '□', transform: 'scale(1.0) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.6) translate(0%, -42%)' },
      { char: '⋯', transform: 'scale(0.5) translate(0%, 15%)' },
    ],
  },

  // ── Media / Content ─────────────────────────────────────────

  upload: {
    label: 'Upload',
    layers: [
      { char: '↑', transform: 'scale(1.0) translate(0%, -10%)' },
      { char: '▔', transform: 'scale(0.7) translate(0%, 50%)' },
    ],
  },
  download: {
    label: 'Download',
    layers: [
      { char: '↓', transform: 'scale(1.0) translate(0%, -10%)' },
      { char: '▔', transform: 'scale(0.7) translate(0%, 50%)' },
    ],
  },
  copy: {
    label: 'Copy',
    layers: [
      { char: '□', transform: 'scale(0.7) translate(-12%, 12%)' },
      { char: '□', transform: 'scale(0.7) translate(12%, -12%)' },
    ],
  },
  trash: {
    label: 'Delete',
    layers: [
      { char: '▔', transform: 'scale(0.7) translate(0%, -35%)' },
      { char: '▕', transform: 'scale(0.3) translate(0%, -80%)' },
      { char: '□', transform: 'scale(0.65) translate(0%, 15%)' },
    ],
  },

  // ── UI Chrome ───────────────────────────────────────────────

  grip: {
    label: 'Drag handle',
    layers: [
      { char: '⠿', transform: 'scale(1.2)' },
    ],
  },
  loading: {
    label: 'Loading',
    layers: [
      { char: '◔', transform: 'scale(1.2)' },
    ],
  },
  lock: {
    label: 'Locked',
    layers: [
      { char: '□', transform: 'scale(0.7) translate(0%, 15%)' },
      { char: '◠', transform: 'scale(0.5) translate(0%, -30%)' },
    ],
  },
  home: {
    label: 'Home',
    layers: [
      { char: '△', transform: 'scale(0.9) translate(0%, -15%)' },
      { char: '▪', transform: 'scale(0.35) translate(0%, 45%)' },
    ],
  },
  settings: {
    label: 'Settings',
    layers: [
      { char: '⊕', transform: 'scale(1.3)' },
    ],
  },
  filter: {
    label: 'Filter',
    layers: [
      { char: '▽', transform: 'scale(1.1)' },
    ],
  },
  star: {
    label: 'Favorite',
    layers: [
      { char: '☆', transform: 'scale(1.3)' },
    ],
  },
  'star-filled': {
    label: 'Favorited',
    layers: [
      { char: '★', transform: 'scale(1.3)' },
    ],
  },
  print: {
    label: 'Print',
    layers: [
      { char: '□', transform: 'scale(0.9) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.5) translate(0%, -40%)' },
      { char: '▁', transform: 'scale(0.5) translate(0%, 48%)' },
    ],
  },
  user: {
    label: 'User account',
    layers: [
      { char: '○', transform: 'scale(0.55) translate(0%, -30%)' },
      { char: '◠', transform: 'scale(0.8) translate(0%, 30%)' },
    ],
  },
  mail: {
    label: 'Email',
    layers: [
      { char: '□', transform: 'scale(1.0) translate(0%, 5%)' },
      { char: '▽', transform: 'scale(0.55) translate(0%, -18%)' },
    ],
  },
};

/**
 * Register a custom icon or override a built-in one.
 */
export function registerIcon(name: string, def: IconDef): void {
  icons[name] = def;
}

/**
 * Get all registered icon names.
 */
export function getIconNames(): string[] {
  return Object.keys(icons);
}
