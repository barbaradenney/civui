/**
 * Icon definitions.
 *
 * Icons are either CSS-based (rendered purely via CSS pseudo-elements)
 * or layer-based (using layered Unicode characters for complex shapes).
 *
 * CSS icons render as `<span class="civ-icon civ-icon--{name}">` with
 * no inner content — the CSS classes handle everything via `::before`
 * and `::after` pseudo-elements.
 *
 * Layer icons render as a stack of absolutely-positioned `<span>` elements
 * inside a 1em × 1em box.  Characters inherit `color` and scale with
 * `font-size`, so icons automatically match surrounding text.
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

export type IconType = 'css' | 'layers';

export type IconDef = {
  /** Human-readable name for aria-label fallback. */
  label: string;
  /** Rendering type: 'css' (default) or 'layers' (Unicode fallback). */
  type?: IconType;
  /** Layers rendered bottom-to-top. Only used when type is 'layers'. */
  layers?: IconLayer[];
};

/**
 * Built-in icon definitions.
 *
 * CSS icons (type omitted or 'css') are rendered purely via CSS classes.
 * Layer icons (type: 'layers') use Unicode characters for complex shapes
 * that need more than 2 pseudo-elements — these will be upgraded to SVG
 * in Phase 2.
 */
export const icons: Record<string, IconDef> = {
  // ── Navigation (CSS) ──────────────────────────────────────

  'chevron-right': { label: 'Next' },
  'chevron-left': { label: 'Previous' },
  'chevron-down': { label: 'Expand' },
  'chevron-up': { label: 'Collapse' },
  'arrow-right': { label: 'Right' },
  'arrow-left': { label: 'Left' },
  'arrow-up': { label: 'Up' },
  'arrow-down': { label: 'Down' },

  // Navigation (Layers — complex shapes)
  'arrow-back': {
    label: 'Go back',
    type: 'layers',
    layers: [{ char: '↩', transform: 'scale(1.0)' }],
  },
  'external-link': {
    label: 'Opens in new tab',
    type: 'layers',
    layers: [
      { char: '↗', transform: 'scale(1) translate(8%, -8%)' },
      { char: '¬', transform: 'scale(1) translate(-18%, 46%) rotate(-180deg)' },
      { char: '¬', transform: 'scale(1) translate(-47%, -10%) rotate(-90deg)' },
    ],
  },

  // ── Actions (CSS) ─────────────────────────────────────────

  close: { label: 'Close' },
  plus: { label: 'Add' },
  minus: { label: 'Remove' },
  menu: { label: 'Menu' },
  'more-vertical': { label: 'More options' },
  'more-horizontal': { label: 'More options' },
  search: { label: 'Search' },

  // Actions (Layers — complex shapes)
  'edit': {
    label: 'Edit',
    type: 'layers',
    layers: [
      { char: '▯', transform: 'scale(1.15) translate(-14%, -11%) rotate(-45deg)' },
      { char: '╶', transform: 'scale(0.75) translate(44%, 12%) rotate(90deg)' },
      { char: '╶', transform: 'scale(0.75) translate(7%, 30%)' },
    ],
  },

  // ── Status / Feedback (CSS) ───────────────────────────────

  check: { label: 'Success' },

  // Status (Layers — circle + inner symbol)
  'check-circle': {
    label: 'Success',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '✓', transform: 'scale(0.6)', weight: 'bold' },
    ],
  },
  error: {
    label: 'Error',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '!', transform: 'scale(0.55)', weight: 'bold' },
    ],
  },
  warning: {
    label: 'Warning',
    type: 'layers',
    layers: [
      { char: '△', transform: 'scale(1.15) translate(0%, -1%)' },
      { char: '!', transform: 'scale(0.4) translate(0%, 24%)', weight: 'bold' },
    ],
  },
  info: {
    label: 'Information',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: 'i', transform: 'scale(0.55) translate(0%, 2%)', weight: 'bold' },
    ],
  },
  help: {
    label: 'Help',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '?', transform: 'scale(0.55)', weight: 'bold' },
    ],
  },

  // ── Form / Input (CSS) ────────────────────────────────────

  'required-indicator': { label: 'Required' },
  'sort-asc': { label: 'Sorted ascending' },
  'sort-desc': { label: 'Sorted descending' },
  'sort-none': { label: 'Unsorted' },

  // Form (Layers — complex shapes)
  calendar: {
    label: 'Calendar',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.9) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.55) translate(0%, -42%)' },
      { char: '⋯', transform: 'scale(0.45) translate(0%, 15%)' },
    ],
  },

  // ── Media / Content (CSS) ─────────────────────────────────

  upload: { label: 'Upload' },
  download: { label: 'Download' },
  filter: { label: 'Filter' },

  // Media (Layers — complex shapes)
  copy: {
    label: 'Copy',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.6) translate(-12%, 12%)' },
      { char: '□', transform: 'scale(0.6) translate(12%, -12%)' },
    ],
  },
  'trash': {
    label: 'Delete',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.55) translate(-3%, 13%)' },
      { char: '│', transform: 'scale(0.35) translate(-4%, 26%)' },
      { char: '│', transform: 'scale(0.35) translate(23%, 26%)' },
      { char: '│', transform: 'scale(0.35) translate(-33%, 26%)' },
      { char: '‑', transform: 'scale(1.35) translate(-1%, -17%)' },
      { char: '‐', transform: 'scale(0.55) translate(-3%, -24%) rotate(-180deg)' },
    ],
  },

  // ── UI Chrome (CSS) ───────────────────────────────────────

  grip: { label: 'Drag handle' },

  // UI Chrome (Layers — complex shapes)
  loading: {
    label: 'Loading',
    type: 'layers',
    layers: [{ char: '◔', transform: 'scale(1.0)' }],
  },
  lock: {
    label: 'Locked',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.6) translate(0%, 15%)' },
      { char: '◠', transform: 'scale(0.45) translate(0%, -30%)' },
    ],
  },
  home: {
    label: 'Home',
    type: 'layers',
    layers: [
      { char: '△', transform: 'scale(0.85) translate(0%, -15%)' },
      { char: '▪', transform: 'scale(0.3) translate(0%, 45%)' },
    ],
  },
  settings: {
    label: 'Settings',
    type: 'layers',
    layers: [{ char: '⊕', transform: 'scale(1.0)' }],
  },
  star: {
    label: 'Favorite',
    type: 'layers',
    layers: [{ char: '☆', transform: 'scale(1.0)' }],
  },
  'star-filled': {
    label: 'Favorited',
    type: 'layers',
    layers: [{ char: '★', transform: 'scale(1.0)' }],
  },
  print: {
    label: 'Print',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.8) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.45) translate(0%, -40%)' },
      { char: '▁', transform: 'scale(0.45) translate(0%, 48%)' },
    ],
  },
  user: {
    label: 'User account',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(0.5) translate(0%, -30%)' },
      { char: '◠', transform: 'scale(0.7) translate(0%, 30%)' },
    ],
  },
  mail: {
    label: 'Email',
    type: 'layers',
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
