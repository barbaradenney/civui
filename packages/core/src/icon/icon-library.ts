/**
 * CivUI Icon Library
 *
 * Icons are rendered purely via CSS pseudo-elements (::before / ::after).
 * Each icon is a CSS class (`civ-icon--{name}`) applied to a 1em × 1em
 * container. Icons inherit `color` and scale with `font-size`.
 *
 * Platform mappings: `ios` maps to SF Symbols, `android` to Material Symbols.
 */

export type IconDef = {
  /** Human-readable name for aria-label fallback. */
  label: string;
  /** SF Symbol name for iOS/macOS. */
  ios?: string;
  /** Material Symbol name for Android. */
  android?: string;
};

export const icons: Record<string, IconDef> = {
  // ── Navigation ──────────────────────────────────────────────

  'chevron-right': { label: 'Next', ios: 'chevron.right', android: 'chevron_right' },
  'chevron-left': { label: 'Previous', ios: 'chevron.left', android: 'chevron_left' },
  'chevron-down': { label: 'Expand', ios: 'chevron.down', android: 'expand_more' },
  'chevron-up': { label: 'Collapse', ios: 'chevron.up', android: 'expand_less' },
  'arrow-right': { label: 'Right', ios: 'arrow.right', android: 'arrow_forward' },
  'arrow-left': { label: 'Left', ios: 'arrow.left', android: 'arrow_back' },
  'arrow-up': { label: 'Up', ios: 'arrow.up', android: 'arrow_upward' },
  'arrow-down': { label: 'Down', ios: 'arrow.down', android: 'arrow_downward' },
  'arrow-back': { label: 'Go back', ios: 'arrow.uturn.backward', android: 'undo' },
  'external-link': { label: 'Opens in new tab', ios: 'arrow.up.right.square', android: 'open_in_new' },

  // ── Actions ─────────────────────────────────────────────────

  close: { label: 'Close', ios: 'xmark', android: 'close' },
  plus: { label: 'Add', ios: 'plus', android: 'add' },
  minus: { label: 'Remove', ios: 'minus', android: 'remove' },
  menu: { label: 'Menu', ios: 'line.3.horizontal', android: 'menu' },
  'more-vertical': { label: 'More options', ios: 'ellipsis', android: 'more_vert' },
  'more-horizontal': { label: 'More options', ios: 'ellipsis', android: 'more_horiz' },
  search: { label: 'Search', ios: 'magnifyingglass', android: 'search' },
  edit: { label: 'Edit', ios: 'pencil', android: 'edit' },

  // ── Status / Feedback ───────────────────────────────────────

  check: { label: 'Success', ios: 'checkmark', android: 'check' },
  'check-circle': { label: 'Success', ios: 'checkmark.circle', android: 'check_circle' },
  error: { label: 'Error', ios: 'exclamationmark.circle', android: 'error' },
  warning: { label: 'Warning', ios: 'exclamationmark.triangle', android: 'warning' },
  info: { label: 'Information', ios: 'info.circle', android: 'info' },
  help: { label: 'Help', ios: 'questionmark.circle', android: 'help' },

  // ── Form / Input ────────────────────────────────────────────

  'required-indicator': { label: 'Required', ios: 'asterisk', android: 'emergency' },
  'sort-asc': { label: 'Sorted ascending', ios: 'chevron.up', android: 'arrow_upward' },
  'sort-desc': { label: 'Sorted descending', ios: 'chevron.down', android: 'arrow_downward' },
  'sort-none': { label: 'Unsorted', ios: 'arrow.up.arrow.down', android: 'unfold_more' },
  calendar: { label: 'Calendar', ios: 'calendar', android: 'calendar_today' },

  // ── Media / Content ─────────────────────────────────────────

  upload: { label: 'Upload', ios: 'arrow.up.doc', android: 'upload' },
  download: { label: 'Download', ios: 'arrow.down.doc', android: 'download' },
  filter: { label: 'Filter', ios: 'line.3.horizontal.decrease', android: 'filter_list' },
  copy: { label: 'Copy', ios: 'doc.on.doc', android: 'content_copy' },
  trash: { label: 'Delete', ios: 'trash', android: 'delete' },

  // ── UI Chrome ───────────────────────────────────────────────

  grip: { label: 'Drag handle', ios: 'line.3.horizontal', android: 'drag_handle' },
  loading: { label: 'Loading', ios: 'progress.indicator', android: 'progress_activity' },
  lock: { label: 'Locked', ios: 'lock', android: 'lock' },
  home: { label: 'Home', ios: 'house', android: 'home' },
  settings: { label: 'Settings', ios: 'gearshape', android: 'settings' },
  star: { label: 'Favorite', ios: 'star', android: 'star_border' },
  'star-filled': { label: 'Favorited', ios: 'star.fill', android: 'star' },
  print: { label: 'Print', ios: 'printer', android: 'print' },
  user: { label: 'User account', ios: 'person', android: 'person' },
  mail: { label: 'Email', ios: 'envelope', android: 'mail' },
  eye: { label: 'Show', ios: 'eye', android: 'visibility' },
  'eye-off': { label: 'Hide', ios: 'eye.slash', android: 'visibility_off' },
  phone: { label: 'Phone', ios: 'phone', android: 'phone' },
  location: { label: 'Location', ios: 'location', android: 'location_on' },
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
