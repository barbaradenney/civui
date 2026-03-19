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
  /** SF Symbol name for iOS/macOS (e.g., "checkmark"). */
  ios?: string;
  /** Material Symbol name for Android (e.g., "check"). */
  android?: string;
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

  'chevron-right': { label: 'Next', ios: 'chevron.right', android: 'chevron_right' },
  'chevron-left': { label: 'Previous', ios: 'chevron.left', android: 'chevron_left' },
  'chevron-down': { label: 'Expand', ios: 'chevron.down', android: 'expand_more' },
  'chevron-up': { label: 'Collapse', ios: 'chevron.up', android: 'expand_less' },
  'arrow-right': { label: 'Right', ios: 'arrow.right', android: 'arrow_forward' },
  'arrow-left': { label: 'Left', ios: 'arrow.left', android: 'arrow_back' },
  'arrow-up': { label: 'Up', ios: 'arrow.up', android: 'arrow_upward' },
  'arrow-down': { label: 'Down', ios: 'arrow.down', android: 'arrow_downward' },

  // Navigation (Layers — complex shapes)
  'arrow-back': {
    label: 'Go back',
    type: 'layers',
    layers: [{ char: '↩', transform: 'scale(1.0)' }],
    ios: 'arrow.uturn.backward',
    android: 'undo',
  },
  'external-link': {
    label: 'Opens in new tab',
    type: 'layers',
    layers: [
      { char: '↗', transform: 'scale(1) translate(8%, -8%)' },
      { char: '¬', transform: 'scale(1) translate(-18%, 46%) rotate(-180deg)' },
      { char: '¬', transform: 'scale(1) translate(-47%, -10%) rotate(-90deg)' },
    ],
    ios: 'arrow.up.right.square',
    android: 'open_in_new',
  },

  // ── Actions (CSS) ─────────────────────────────────────────

  close: { label: 'Close', ios: 'xmark', android: 'close' },
  plus: { label: 'Add', ios: 'plus', android: 'add' },
  minus: { label: 'Remove', ios: 'minus', android: 'remove' },
  menu: { label: 'Menu', ios: 'line.3.horizontal', android: 'menu' },
  'more-vertical': { label: 'More options', ios: 'ellipsis', android: 'more_vert' },
  'more-horizontal': { label: 'More options', ios: 'ellipsis', android: 'more_horiz' },
  search: { label: 'Search', ios: 'magnifyingglass', android: 'search' },

  // Actions (Layers — complex shapes)
  'edit': {
    label: 'Edit',
    type: 'layers',
    layers: [
      { char: '▯', transform: 'scale(1.15) translate(-14%, -11%) rotate(-45deg)' },
      { char: '╶', transform: 'scale(0.75) translate(44%, 12%) rotate(90deg)' },
      { char: '╶', transform: 'scale(0.75) translate(7%, 30%)' },
    ],
    ios: 'pencil',
    android: 'edit',
  },

  // ── Status / Feedback (CSS) ───────────────────────────────

  check: { label: 'Success', ios: 'checkmark', android: 'check' },

  // Status (Layers — circle + inner symbol)
  'check-circle': {
    label: 'Success',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '✓', transform: 'scale(0.6)', weight: 'bold' },
    ],
    ios: 'checkmark.circle',
    android: 'check_circle',
  },
  error: {
    label: 'Error',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '!', transform: 'scale(0.55)', weight: 'bold' },
    ],
    ios: 'exclamationmark.circle',
    android: 'error',
  },
  warning: {
    label: 'Warning',
    type: 'layers',
    layers: [
      { char: '△', transform: 'scale(1.15) translate(0%, -1%)' },
      { char: '!', transform: 'scale(0.4) translate(0%, 24%)', weight: 'bold' },
    ],
    ios: 'exclamationmark.triangle',
    android: 'warning',
  },
  info: {
    label: 'Information',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: 'i', transform: 'scale(0.55) translate(0%, 2%)', weight: 'bold' },
    ],
    ios: 'info.circle',
    android: 'info',
  },
  help: {
    label: 'Help',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(1.0)' },
      { char: '?', transform: 'scale(0.55)', weight: 'bold' },
    ],
    ios: 'questionmark.circle',
    android: 'help',
  },

  // ── Form / Input (CSS) ────────────────────────────────────

  'required-indicator': { label: 'Required', ios: 'asterisk', android: 'emergency' },
  'sort-asc': { label: 'Sorted ascending', ios: 'chevron.up', android: 'arrow_upward' },
  'sort-desc': { label: 'Sorted descending', ios: 'chevron.down', android: 'arrow_downward' },
  'sort-none': { label: 'Unsorted', ios: 'arrow.up.arrow.down', android: 'unfold_more' },

  // Form (Layers — complex shapes)
  calendar: {
    label: 'Calendar',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.9) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.55) translate(0%, -42%)' },
      { char: '⋯', transform: 'scale(0.45) translate(0%, 15%)' },
    ],
    ios: 'calendar',
    android: 'calendar_today',
  },

  // ── Media / Content (CSS) ─────────────────────────────────

  upload: { label: 'Upload', ios: 'arrow.up.doc', android: 'upload' },
  download: { label: 'Download', ios: 'arrow.down.doc', android: 'download' },
  filter: { label: 'Filter', ios: 'line.3.horizontal.decrease', android: 'filter_list' },

  // Media (Layers — complex shapes)
  copy: {
    label: 'Copy',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.6) translate(-12%, 12%)' },
      { char: '□', transform: 'scale(0.6) translate(12%, -12%)' },
    ],
    ios: 'doc.on.doc',
    android: 'content_copy',
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
    ios: 'trash',
    android: 'delete',
  },

  // ── UI Chrome (CSS) ───────────────────────────────────────

  grip: { label: 'Drag handle', ios: 'line.3.horizontal', android: 'drag_handle' },

  // UI Chrome (Layers — complex shapes)
  loading: {
    label: 'Loading',
    type: 'layers',
    layers: [{ char: '◔', transform: 'scale(1.0)' }],
    ios: 'progress.indicator',
    android: 'progress_activity',
  },
  lock: {
    label: 'Locked',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.6) translate(0%, 15%)' },
      { char: '◠', transform: 'scale(0.45) translate(0%, -30%)' },
    ],
    ios: 'lock',
    android: 'lock',
  },
  home: {
    label: 'Home',
    type: 'layers',
    layers: [
      { char: '△', transform: 'scale(0.85) translate(0%, -15%)' },
      { char: '▪', transform: 'scale(0.3) translate(0%, 45%)' },
    ],
    ios: 'house',
    android: 'home',
  },
  settings: {
    label: 'Settings',
    type: 'layers',
    layers: [{ char: '⊕', transform: 'scale(1.0)' }],
    ios: 'gearshape',
    android: 'settings',
  },
  star: {
    label: 'Favorite',
    type: 'layers',
    layers: [{ char: '☆', transform: 'scale(1.0)' }],
    ios: 'star',
    android: 'star_border',
  },
  'star-filled': {
    label: 'Favorited',
    type: 'layers',
    layers: [{ char: '★', transform: 'scale(1.0)' }],
    ios: 'star.fill',
    android: 'star',
  },
  print: {
    label: 'Print',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.8) translate(0%, 5%)' },
      { char: '▔', transform: 'scale(0.45) translate(0%, -40%)' },
      { char: '▁', transform: 'scale(0.45) translate(0%, 48%)' },
    ],
    ios: 'printer',
    android: 'print',
  },
  user: {
    label: 'User account',
    type: 'layers',
    layers: [
      { char: '○', transform: 'scale(0.5) translate(0%, -30%)' },
      { char: '◠', transform: 'scale(0.7) translate(0%, 30%)' },
    ],
    ios: 'person',
    android: 'person',
  },
  mail: {
    label: 'Email',
    type: 'layers',
    layers: [
      { char: '□', transform: 'scale(0.9) translate(0%, 5%)' },
      { char: '▽', transform: 'scale(0.5) translate(0%, -18%)' },
    ],
    ios: 'envelope',
    android: 'mail',
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
