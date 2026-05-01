/**
 * CivUI Icon Library
 *
 * Icons are rendered with the Material Symbols Outlined font on the web.
 * Each registered name maps to a Material Symbols glyph name (`android`
 * field) plus optional SF Symbol name for iOS native (`ios` field) and a
 * human-readable label for accessibility.
 */

export type IconDef = {
  /** Human-readable name for aria-label fallback. */
  label: string;
  /** SF Symbol name for iOS/macOS. */
  ios?: string;
  /**
   * Material Symbols name. Used for web rendering and Android native.
   * Web falls back to `name.replace(/-/g, '_')` when omitted.
   */
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

  // ── Extended set (Material Symbols glyphs) ────────────────

  audio: { label: 'Audio', android: 'graphic_eq' },
  'audio-solid': { label: 'Audio', android: 'volume_up' },
  battery: { label: 'Battery', android: 'battery_full' },
  'battery-0': { label: 'Battery empty', android: 'battery_0_bar' },
  'battery-1': { label: 'Battery low', android: 'battery_1_bar' },
  'battery-3': { label: 'Battery medium', android: 'battery_3_bar' },
  'battery-solid': { label: 'Battery', android: 'battery_full' },
  'battery-solid-0': { label: 'Battery empty', android: 'battery_0_bar' },
  'battery-solid-1': { label: 'Battery low', android: 'battery_1_bar' },
  'battery-solid-3': { label: 'Battery medium', android: 'battery_3_bar' },
  bell: { label: 'Notifications', android: 'notifications' },
  'bell-solid': { label: 'Notifications', android: 'notifications_active' },
  bookmark: { label: 'Bookmark', android: 'bookmark_border' },
  'bookmark-solid': { label: 'Bookmark', android: 'bookmark' },
  browser: { label: 'Browser', android: 'web' },
  'browser-solid': { label: 'Browser', android: 'web_asset' },
  camera: { label: 'Camera', android: 'photo_camera' },
  'camera-solid': { label: 'Camera', android: 'photo_camera' },
  card: { label: 'Card', android: 'credit_card' },
  'card-solid': { label: 'Card', android: 'credit_card' },
  'center-align': { label: 'Center align', android: 'format_align_center' },
  chat: { label: 'Chat', android: 'chat_bubble_outline' },
  'chat-solid': { label: 'Chat', android: 'chat_bubble' },
  clock: { label: 'Clock', android: 'schedule' },
  'clock-h3m30': { label: 'Clock', android: 'schedule' },
  'clock-h3m30-solid': { label: 'Clock', android: 'access_time_filled' },
  'clock-h9m0': { label: 'Clock', android: 'schedule' },
  'clock-h9m0-solid': { label: 'Clock', android: 'access_time_filled' },
  'clock-h9m30': { label: 'Clock', android: 'schedule' },
  'clock-h9m30-solid': { label: 'Clock', android: 'access_time_filled' },
  'clock-solid': { label: 'Clock', android: 'access_time_filled' },
  cloud: { label: 'Cloud', android: 'cloud' },
  'cloud-download': { label: 'Cloud download', android: 'cloud_download' },
  'cloud-download-solid': { label: 'Cloud download', android: 'cloud_download' },
  'cloud-lightning': { label: 'Storm', android: 'thunderstorm' },
  'cloud-raindrop': { label: 'Rainy', android: 'rainy' },
  'cloud-solid': { label: 'Cloud', android: 'cloud' },
  'cloud-upload': { label: 'Cloud upload', android: 'cloud_upload' },
  'cloud-upload-solid': { label: 'Cloud upload', android: 'cloud_upload' },
  code: { label: 'Code', android: 'code' },
  'edit-solid': { label: 'Edit', android: 'edit' },
  export: { label: 'Export', android: 'ios_share' },
  'eye-solid': { label: 'Show', android: 'visibility' },
  'eye-solid2': { label: 'Show', android: 'visibility' },
  'eye-solid3': { label: 'Show', android: 'visibility' },
  flag: { label: 'Flag', android: 'flag' },
  'flag-solid': { label: 'Flag', android: 'flag' },
  float: { label: 'Wrap text', android: 'wrap_text' },
  'float-solid': { label: 'Wrap text', android: 'wrap_text' },
  focus: { label: 'Focus', android: 'center_focus_strong' },
  grin: { label: 'Grin', android: 'sentiment_satisfied' },
  'grin-solid': { label: 'Grin', android: 'sentiment_very_satisfied' },
  'grin-wink': { label: 'Wink', android: 'sentiment_satisfied' },
  heart: { label: 'Favorite', android: 'favorite_border' },
  'heart-solid': { label: 'Favorite', android: 'favorite' },
  import: { label: 'Import', android: 'file_download' },
  indent: { label: 'Indent', android: 'format_indent_increase' },
  justified: { label: 'Justified', android: 'format_align_justify' },
  key: { label: 'Key', android: 'key' },
  'key-solid': { label: 'Key', android: 'key' },
  key2: { label: 'Key', android: 'vpn_key' },
  'key2-solid': { label: 'Key', android: 'vpn_key' },
  keyboard: { label: 'Keyboard', android: 'keyboard' },
  'keyboard-solid': { label: 'Keyboard', android: 'keyboard' },
  laptop: { label: 'Laptop', android: 'laptop' },
  'laptop-solid': { label: 'Laptop', android: 'laptop' },
  laugh: { label: 'Laugh', android: 'mood' },
  'laugh-solid': { label: 'Laugh', android: 'mood' },
  'left-align': { label: 'Left align', android: 'format_align_left' },
  'left-double-quote': { label: 'Quote', android: 'format_quote' },
  'left-double-quote-solid': { label: 'Quote', android: 'format_quote' },
  'left-single-quote': { label: 'Quote', android: 'format_quote' },
  'left-single-quote-solid': { label: 'Quote', android: 'format_quote' },
  link: { label: 'Link', android: 'link' },
  'lock-solid': { label: 'Locked', android: 'lock' },
  magnify: { label: 'Zoom in', android: 'zoom_in' },
  'magnify-solid': { label: 'Zoom in', android: 'zoom_in' },
  'mail-solid': { label: 'Email', android: 'email' },
  map: { label: 'Map', android: 'map' },
  minify: { label: 'Zoom out', android: 'zoom_out' },
  'minify-solid': { label: 'Zoom out', android: 'zoom_out' },
  mobile: { label: 'Mobile', android: 'smartphone' },
  'mobile-solid': { label: 'Mobile', android: 'smartphone' },
  moon: { label: 'Dark mode', android: 'dark_mode' },
  'moon-solid': { label: 'Dark mode', android: 'dark_mode' },
  more: { label: 'More', android: 'more_horiz' },
  'more-solid': { label: 'More', android: 'more_horiz' },
  'more-vertical-solid': { label: 'More options', android: 'more_vert' },
  mouse: { label: 'Mouse', android: 'mouse' },
  'mouse-solid': { label: 'Mouse', android: 'mouse' },
  mustache: { label: 'Face', android: 'face' },
  'mustache-solid': { label: 'Face', android: 'face' },
  navigate: { label: 'Navigate', android: 'navigation' },
  'navigate-solid': { label: 'Navigate', android: 'navigation' },
  'no-raindrop': { label: 'No rain', android: 'cloud_off' },
  outdent: { label: 'Outdent', android: 'format_indent_decrease' },
  paperclip: { label: 'Attachment', android: 'attach_file' },
  'paragraph-direction': { label: 'Text direction', android: 'format_textdirection_l_to_r' },
  pensive: { label: 'Sad', android: 'sentiment_dissatisfied' },
  'pensive-solid': { label: 'Sad', android: 'sentiment_very_dissatisfied' },
  picture: { label: 'Image', android: 'image' },
  'picture-solid': { label: 'Image', android: 'image' },
  pilcrow: { label: 'Paragraph', android: 'format_paragraph' },
  'pilcrow-solid': { label: 'Paragraph', android: 'format_paragraph' },
  pin: { label: 'Pin', android: 'push_pin' },
  'pin-solid': { label: 'Pin', android: 'push_pin' },
  'print-solid': { label: 'Print', android: 'print' },
  profile: { label: 'Profile', android: 'account_circle' },
  'profile-solid': { label: 'Profile', android: 'account_circle' },
  rain: { label: 'Rain', android: 'rainy' },
  raindrop: { label: 'Water', android: 'water_drop' },
  'raindrop-solid': { label: 'Water', android: 'water_drop' },
  refresh: { label: 'Refresh', android: 'refresh' },
  relieved: { label: 'Relieved', android: 'sentiment_satisfied' },
  'relieved-smiley': { label: 'Smile', android: 'sentiment_satisfied' },
  'relieved-smiley-solid': { label: 'Smile', android: 'sentiment_satisfied' },
  'relieved-solid': { label: 'Relieved', android: 'sentiment_satisfied' },
  remove: { label: 'Remove', android: 'remove' },
  retweet: { label: 'Repost', android: 'cached' },
  'right-align': { label: 'Right align', android: 'format_align_right' },
  'right-double-quote': { label: 'Quote', android: 'format_quote' },
  'right-double-quote-solid': { label: 'Quote', android: 'format_quote' },
  'right-single-quote': { label: 'Quote', android: 'format_quote' },
  'right-single-quote-solid': { label: 'Quote', android: 'format_quote' },
  sad: { label: 'Sad', android: 'sentiment_dissatisfied' },
  'sad-solid': { label: 'Sad', android: 'sentiment_dissatisfied' },
  'search-solid': { label: 'Search', android: 'search' },
  shutdown: { label: 'Shut down', android: 'power_settings_new' },
  signal: { label: 'Signal', android: 'signal_cellular_alt' },
  smile: { label: 'Smile', android: 'sentiment_satisfied' },
  'smile-solid': { label: 'Smile', android: 'sentiment_satisfied' },
  smiley: { label: 'Happy', android: 'mood' },
  'smiley-solid': { label: 'Happy', android: 'mood' },
  snow: { label: 'Snow', android: 'ac_unit' },
  stop: { label: 'Stop', android: 'stop_circle' },
  'stop-solid': { label: 'Stop', android: 'stop_circle' },
  suitcase: { label: 'Work', android: 'work' },
  'suitcase-1': { label: 'Work', android: 'work' },
  'suitcase-2': { label: 'Work', android: 'work' },
  'suitcase-3': { label: 'Work', android: 'work' },
  sun: { label: 'Light mode', android: 'light_mode' },
  'sun-brightness': { label: 'Brightness', android: 'wb_sunny' },
  'sun-horizon': { label: 'Twilight', android: 'wb_twilight' },
  'sun-horizon-solid': { label: 'Twilight', android: 'wb_twilight' },
  'sun-raindrop': { label: 'Partly sunny', android: 'partly_cloudy_day' },
  'sun-raindrop-solid': { label: 'Partly sunny', android: 'partly_cloudy_day' },
  'sun-solid': { label: 'Light mode', android: 'light_mode' },
  sunrise: { label: 'Sunrise', android: 'wb_twilight' },
  'sunrise-solid': { label: 'Sunrise', android: 'wb_twilight' },
  sunset: { label: 'Sunset', android: 'wb_twilight' },
  'sunset-solid': { label: 'Sunset', android: 'wb_twilight' },
  tablet: { label: 'Tablet', android: 'tablet' },
  'tablet-solid': { label: 'Tablet', android: 'tablet' },
  tag: { label: 'Tag', android: 'label' },
  'tag-solid': { label: 'Tag', android: 'label' },
  target: { label: 'Target', android: 'gps_fixed' },
  'target-solid': { label: 'Target', android: 'gps_fixed' },
  tougue: { label: 'Tongue out', android: 'mood' },
  'tougue-solid': { label: 'Tongue out', android: 'mood' },
  'trash-solid': { label: 'Delete', android: 'delete' },
  tv: { label: 'TV', android: 'tv' },
  'tv-solid': { label: 'TV', android: 'tv' },
  unamused: { label: 'Neutral', android: 'sentiment_neutral' },
  'unamused-solid': { label: 'Neutral', android: 'sentiment_neutral' },
  unlock: { label: 'Unlocked', android: 'lock_open' },
  'unlock-solid': { label: 'Unlocked', android: 'lock_open' },
  upload2: { label: 'Upload', android: 'upload' },
  watch: { label: 'Watch', android: 'watch' },
  'watch-solid': { label: 'Watch', android: 'watch' },
  wink: { label: 'Wink', android: 'mood' },
  'wink-laugh': { label: 'Wink', android: 'mood' },
  'wink-smiley': { label: 'Wink', android: 'mood' },
  'wink-tougue': { label: 'Wink', android: 'mood' },
};

/**
 * Resolve the Material Symbols glyph name for an icon.
 * Falls back to the icon name with hyphens converted to underscores.
 */
export function getMaterialSymbolName(name: string): string {
  return icons[name]?.android ?? name.replace(/-/g, '_');
}

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
