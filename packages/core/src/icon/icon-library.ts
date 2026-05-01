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

  // ── Imported from cssicon.space ────────────────────────────

  'audio': { label: 'Audio' },
  'audio-solid': { label: 'Audio Solid' },
  'battery': { label: 'Battery' },
  'battery-0': { label: 'Battery 0' },
  'battery-1': { label: 'Battery 1' },
  'battery-3': { label: 'Battery 3' },
  'battery-solid': { label: 'Battery Solid' },
  'battery-solid-0': { label: 'Battery Solid 0' },
  'battery-solid-1': { label: 'Battery Solid 1' },
  'battery-solid-3': { label: 'Battery Solid 3' },
  'bell': { label: 'Bell' },
  'bell-solid': { label: 'Bell Solid' },
  'bookmark': { label: 'Bookmark' },
  'bookmark-solid': { label: 'Bookmark Solid' },
  'browser': { label: 'Browser' },
  'browser-solid': { label: 'Browser Solid' },
  'camera': { label: 'Camera' },
  'camera-solid': { label: 'Camera Solid' },
  'card': { label: 'Card' },
  'card-solid': { label: 'Card Solid' },
  'center-align': { label: 'Center Align' },
  'chat': { label: 'Chat' },
  'chat-solid': { label: 'Chat Solid' },
  'clock': { label: 'Clock' },
  'clock-h3m30': { label: 'Clock H3m30' },
  'clock-h3m30-solid': { label: 'Clock H3m30 Solid' },
  'clock-h9m0': { label: 'Clock H9m0' },
  'clock-h9m0-solid': { label: 'Clock H9m0 Solid' },
  'clock-h9m30': { label: 'Clock H9m30' },
  'clock-h9m30-solid': { label: 'Clock H9m30 Solid' },
  'clock-solid': { label: 'Clock Solid' },
  'cloud': { label: 'Cloud' },
  'cloud-download': { label: 'Cloud Download' },
  'cloud-download-solid': { label: 'Cloud Download Solid' },
  'cloud-lightning': { label: 'Cloud Lightning' },
  'cloud-raindrop': { label: 'Cloud Raindrop' },
  'cloud-solid': { label: 'Cloud Solid' },
  'cloud-upload': { label: 'Cloud Upload' },
  'cloud-upload-solid': { label: 'Cloud Upload Solid' },
  'code': { label: 'Code' },
  'edit-solid': { label: 'Edit Solid' },
  'export': { label: 'Export' },
  'eye-solid': { label: 'Eye Solid' },
  'eye-solid2': { label: 'Eye Solid2' },
  'eye-solid3': { label: 'Eye Solid3' },
  'flag': { label: 'Flag' },
  'flag-solid': { label: 'Flag Solid' },
  'float': { label: 'Float' },
  'float-solid': { label: 'Float Solid' },
  'focus': { label: 'Focus' },
  'grin': { label: 'Grin' },
  'grin-solid': { label: 'Grin Solid' },
  'grin-wink': { label: 'Grin Wink' },
  'heart': { label: 'Heart' },
  'heart-solid': { label: 'Heart Solid' },
  'import': { label: 'Import' },
  'indent': { label: 'Indent' },
  'justified': { label: 'Justified' },
  'key': { label: 'Key' },
  'key-solid': { label: 'Key Solid' },
  'key2': { label: 'Key2' },
  'key2-solid': { label: 'Key2 Solid' },
  'keyboard': { label: 'Keyboard' },
  'keyboard-solid': { label: 'Keyboard Solid' },
  'laptop': { label: 'Laptop' },
  'laptop-solid': { label: 'Laptop Solid' },
  'laugh': { label: 'Laugh' },
  'laugh-solid': { label: 'Laugh Solid' },
  'left-align': { label: 'Left Align' },
  'left-double-quote': { label: 'Left Double Quote' },
  'left-double-quote-solid': { label: 'Left Double Quote Solid' },
  'left-single-quote': { label: 'Left Single Quote' },
  'left-single-quote-solid': { label: 'Left Single Quote Solid' },
  'link': { label: 'Link' },
  'lock-solid': { label: 'Lock Solid' },
  'magnify': { label: 'Magnify' },
  'magnify-solid': { label: 'Magnify Solid' },
  'mail-solid': { label: 'Mail Solid' },
  'map': { label: 'Map' },
  'minify': { label: 'Minify' },
  'minify-solid': { label: 'Minify Solid' },
  'mobile': { label: 'Mobile' },
  'mobile-solid': { label: 'Mobile Solid' },
  'moon': { label: 'Moon' },
  'moon-solid': { label: 'Moon Solid' },
  'more': { label: 'More' },
  'more-solid': { label: 'More Solid' },
  'more-vertical-solid': { label: 'More Vertical Solid' },
  'mouse': { label: 'Mouse' },
  'mouse-solid': { label: 'Mouse Solid' },
  'mustache': { label: 'Mustache' },
  'mustache-solid': { label: 'Mustache Solid' },
  'navigate': { label: 'Navigate' },
  'navigate-solid': { label: 'Navigate Solid' },
  'no-raindrop': { label: 'No Raindrop' },
  'outdent': { label: 'Outdent' },
  'paperclip': { label: 'Paperclip' },
  'paragraph-direction': { label: 'Paragraph Direction' },
  'pensive': { label: 'Pensive' },
  'pensive-solid': { label: 'Pensive Solid' },
  'picture': { label: 'Picture' },
  'picture-solid': { label: 'Picture Solid' },
  'pilcrow': { label: 'Pilcrow' },
  'pilcrow-solid': { label: 'Pilcrow Solid' },
  'pin': { label: 'Pin' },
  'pin-solid': { label: 'Pin Solid' },
  'print-solid': { label: 'Print Solid' },
  'profile': { label: 'Profile' },
  'profile-solid': { label: 'Profile Solid' },
  'rain': { label: 'Rain' },
  'raindrop': { label: 'Raindrop' },
  'raindrop-solid': { label: 'Raindrop Solid' },
  'refresh': { label: 'Refresh' },
  'relieved': { label: 'Relieved' },
  'relieved-smiley': { label: 'Relieved Smiley' },
  'relieved-smiley-solid': { label: 'Relieved Smiley Solid' },
  'relieved-solid': { label: 'Relieved Solid' },
  'remove': { label: 'Remove' },
  'retweet': { label: 'Retweet' },
  'right-align': { label: 'Right Align' },
  'right-double-quote': { label: 'Right Double Quote' },
  'right-double-quote-solid': { label: 'Right Double Quote Solid' },
  'right-single-quote': { label: 'Right Single Quote' },
  'right-single-quote-solid': { label: 'Right Single Quote Solid' },
  'sad': { label: 'Sad' },
  'sad-solid': { label: 'Sad Solid' },
  'search-solid': { label: 'Search Solid' },
  'shutdown': { label: 'Shutdown' },
  'signal': { label: 'Signal' },
  'smile': { label: 'Smile' },
  'smile-solid': { label: 'Smile Solid' },
  'smiley': { label: 'Smiley' },
  'smiley-solid': { label: 'Smiley Solid' },
  'snow': { label: 'Snow' },
  'stop': { label: 'Stop' },
  'stop-solid': { label: 'Stop Solid' },
  'suitcase': { label: 'Suitcase' },
  'suitcase-1': { label: 'Suitcase 1' },
  'suitcase-2': { label: 'Suitcase 2' },
  'suitcase-3': { label: 'Suitcase 3' },
  'sun': { label: 'Sun' },
  'sun-brightness': { label: 'Sun Brightness' },
  'sun-horizon': { label: 'Sun Horizon' },
  'sun-horizon-solid': { label: 'Sun Horizon Solid' },
  'sun-raindrop': { label: 'Sun Raindrop' },
  'sun-raindrop-solid': { label: 'Sun Raindrop Solid' },
  'sun-solid': { label: 'Sun Solid' },
  'sunrise': { label: 'Sunrise' },
  'sunrise-solid': { label: 'Sunrise Solid' },
  'sunset': { label: 'Sunset' },
  'sunset-solid': { label: 'Sunset Solid' },
  'tablet': { label: 'Tablet' },
  'tablet-solid': { label: 'Tablet Solid' },
  'tag': { label: 'Tag' },
  'tag-solid': { label: 'Tag Solid' },
  'target': { label: 'Target' },
  'target-solid': { label: 'Target Solid' },
  'tougue': { label: 'Tougue' },
  'tougue-solid': { label: 'Tougue Solid' },
  'trash-solid': { label: 'Trash Solid' },
  'tv': { label: 'Tv' },
  'tv-solid': { label: 'Tv Solid' },
  'unamused': { label: 'Unamused' },
  'unamused-solid': { label: 'Unamused Solid' },
  'unlock': { label: 'Unlock' },
  'unlock-solid': { label: 'Unlock Solid' },
  'upload2': { label: 'Upload2' },
  'watch': { label: 'Watch' },
  'watch-solid': { label: 'Watch Solid' },
  'wink': { label: 'Wink' },
  'wink-laugh': { label: 'Wink Laugh' },
  'wink-smiley': { label: 'Wink Smiley' },
  'wink-tougue': { label: 'Wink Tougue' },
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
