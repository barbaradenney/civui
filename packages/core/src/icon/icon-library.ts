/**
 * CivUI Icon Library
 *
 * Icons render as inline SVG with `currentColor` fill — no font files,
 * no external requests. Each icon uses a Material Icons Outlined path in a
 * 24×24 viewBox that scales with font-size and inherits the parent's text color.
 *
 * The default registry contains only the icons CivUI's own components use.
 * Consumers can extend it via `registerIcon()`:
 *
 *   registerIcon('agency-seal', {
 *     label: 'Agency seal',
 *     path: 'M12 2L2 7l10 5 10-5-10-5z...',
 *   });
 *
 * Native platform mappings (`ios`, `android`) are preserved for the
 * SwiftUI / Compose implementations.
 */

export type IconDef = {
  /** Human-readable name for aria-label fallback. */
  label: string;
  /** SVG path `d` attribute. Multiple paths separated by `|||`. viewBox is 0 0 24 24. */
  path: string;
  /**
   * Material Symbols glyph name. When set and no `path` is provided,
   * the icon renders via font ligature — requires the consumer to import
   * `@civui/core/styles/material-symbols`.
   */
  symbol?: string;
  /** SF Symbol name for iOS/macOS native. */
  ios?: string;
  /** Material Symbols name for Android native. */
  android?: string;
};

/**
 * Built-in icon set — Material Icons Outlined, 24×24 fill-based SVG paths.
 */
export const icons: Record<string, IconDef> = {
  plus: {
    label: 'Add',
    path: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    ios: 'plus',
    android: 'add',
  },
  check: {
    label: 'Success',
    path: 'M8.5 16.586l-4.95-4.95 2.122-2.121L8.5 12.343l8.828-8.828 2.122 2.121z',
    ios: 'checkmark',
    android: 'check',
  },
  'check-circle': {
    label: 'Success',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z',
    ios: 'checkmark.circle',
    android: 'check_circle',
  },
  'check-circle-fill': {
    label: 'Success',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    ios: 'checkmark.circle.fill',
    android: 'check_circle',
  },
  'chevron-down': {
    label: 'Expand',
    path: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z',
    ios: 'chevron.down',
    android: 'expand_more',
  },
  'chevron-left': {
    label: 'Previous',
    path: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z',
    ios: 'chevron.left',
    android: 'chevron_left',
  },
  'chevron-right': {
    label: 'Next',
    path: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z',
    ios: 'chevron.right',
    android: 'chevron_right',
  },
  'chevron-up': {
    label: 'Collapse',
    path: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
    ios: 'chevron.up',
    android: 'expand_less',
  },
  'more-vert': {
    label: 'More actions',
    path: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    ios: 'ellipsis',
    android: 'more_vert',
  },
  'more-horiz': {
    label: 'More actions',
    path: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    ios: 'ellipsis',
    android: 'more_horiz',
  },
  'unfold-more': {
    label: 'Sort',
    path: 'M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z',
    ios: 'arrow.up.arrow.down',
    android: 'unfold_more',
  },
  'view-column': {
    label: 'View columns',
    path: 'M14.67 5v14H9.33V5h5.34zm1 14H21V5h-5.33v14zm-7.34 0V5H3v14h5.33z',
    ios: 'rectangle.split.3x1',
    android: 'view_column',
  },
  search: {
    label: 'Search',
    path: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    ios: 'magnifyingglass',
    android: 'search',
  },
  close: {
    label: 'Close',
    path: 'M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z',
    ios: 'xmark',
    android: 'close',
  },
  download: {
    label: 'Download',
    path: 'M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z',
    ios: 'arrow.down.doc',
    android: 'download',
  },
  error: {
    label: 'Error',
    path: 'M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
    ios: 'exclamationmark.circle',
    android: 'error',
  },
  'error-fill': {
    label: 'Error',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    ios: 'exclamationmark.circle.fill',
    android: 'error',
  },
  'external-link': {
    label: 'Opens in new tab',
    path: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    ios: 'arrow.up.right.square',
    android: 'open_in_new',
  },
  info: {
    label: 'Information',
    path: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    ios: 'info.circle',
    android: 'info',
  },
  'info-fill': {
    label: 'Information',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    ios: 'info.circle.fill',
    android: 'info',
  },
  loading: {
    label: 'Loading',
    path: 'M12 4V2C6.48 2 2 6.48 2 12h2c0-4.42 3.58-8 8-8z',
    ios: 'progress.indicator',
    android: 'progress_activity',
  },
  lock: {
    label: 'Locked',
    path: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z',
    ios: 'lock',
    android: 'lock',
  },
  mail: {
    label: 'Email',
    path: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z',
    ios: 'envelope',
    android: 'mail',
  },
  phone: {
    label: 'Phone',
    path: 'M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z',
    ios: 'phone',
    android: 'call',
  },
  warning: {
    label: 'Warning',
    path: 'M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z',
    ios: 'exclamationmark.triangle',
    android: 'warning',
  },
  'warning-fill': {
    label: 'Warning',
    path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
  },
  // ─── Common UI actions ─────────────────────────────────────────
  edit: {
    label: 'Edit',
    path: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    ios: 'pencil',
    android: 'edit',
  },
  trash: {
    label: 'Delete',
    path: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    ios: 'trash',
    android: 'delete',
  },
  copy: {
    label: 'Copy',
    path: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
    ios: 'doc.on.doc',
    android: 'content_copy',
  },
  print: {
    label: 'Print',
    path: 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z',
    ios: 'printer',
    android: 'print',
  },
  share: {
    label: 'Share',
    path: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
    ios: 'square.and.arrow.up',
    android: 'share',
  },
  open: {
    label: 'Open',
    path: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    ios: 'arrow.up.right.square',
    android: 'open_in_new',
  },
  // ─── Navigation arrows ─────────────────────────────────────────
  'arrow-back': {
    label: 'Back',
    path: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    ios: 'arrow.left',
    android: 'arrow_back',
  },
  'arrow-down': {
    label: 'Down',
    path: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
    ios: 'arrow.down',
    android: 'arrow_downward',
  },
  'arrow-left': {
    label: 'Left',
    path: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    ios: 'arrow.left',
    android: 'arrow_back',
  },
  'arrow-right': {
    label: 'Right',
    path: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
    ios: 'arrow.right',
    android: 'arrow_forward',
  },
  'arrow-up': {
    label: 'Up',
    path: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
    ios: 'arrow.up',
    android: 'arrow_upward',
  },
  // ─── Common content / chrome ──────────────────────────────────
  home: {
    label: 'Home',
    path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    ios: 'house',
    android: 'home',
  },
  menu: {
    label: 'Menu',
    path: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    ios: 'line.3.horizontal',
    android: 'menu',
  },
  minus: {
    label: 'Remove',
    path: 'M19 13H5v-2h14v2z',
    ios: 'minus',
    android: 'remove',
  },
  help: {
    label: 'Help',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    ios: 'questionmark.circle',
    android: 'help',
  },
  settings: {
    label: 'Settings',
    path: 'M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z',
    ios: 'gearshape',
    android: 'settings',
  },
  // ─── People / docs / time ─────────────────────────────────────
  person: {
    label: 'Person',
    path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    ios: 'person',
    android: 'person',
  },
  user: {
    label: 'User',
    path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    ios: 'person',
    android: 'person',
  },
  document: {
    label: 'Document',
    path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-8h8v2H8zm0 4h8v2H8z',
    ios: 'doc.text',
    android: 'description',
  },
  calendar: {
    label: 'Calendar',
    path: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z',
    ios: 'calendar',
    android: 'calendar_today',
  },
  location: {
    label: 'Location',
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    ios: 'mappin.and.ellipse',
    android: 'location_on',
  },
  // ─── Aliases ──────────────────────────────────────────────────
  // Material Icons uses the abbreviated `more-vert` / `more-horiz`
  // (already registered above). Several stories were authored with
  // the longer English names; register aliases pointing at the same
  // SVG paths so both spellings work.
  'more-vertical': {
    label: 'More',
    path: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    ios: 'ellipsis',
    android: 'more_vert',
  },
  'more-horizontal': {
    label: 'More',
    path: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    ios: 'ellipsis',
    android: 'more_horiz',
  },
};

/**
 * Register a custom icon or override a built-in one.
 *
 * @example
 * ```ts
 * registerIcon('agency-seal', {
 *   label: 'Agency seal',
 *   path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
 * });
 * ```
 */
export function registerIcon(name: string, def: IconDef): void {
  icons[name] = def;
}

// Snapshot the built-in registry at module-load time so `resetIcons()`
// can restore mutated entries (not just drop newly-added ones). A test
// that calls `registerIcon('home', { path: '' })` was clobbering the
// built-in `home` def, and `resetIcons()` only deleted *additions* —
// the mutated built-in stayed broken for the next test.
const _builtInIconSnapshot: Record<string, IconDef> = Object.fromEntries(
  Object.entries(icons).map(([name, def]) => [name, { ...def }]),
);
const _builtInIconNames = new Set(Object.keys(icons));

/** Reset icon registry to built-in icons only (for test isolation). */
export function resetIcons(): void {
  for (const key of Object.keys(icons)) {
    if (!_builtInIconNames.has(key)) {
      delete icons[key];
    } else {
      // Restore the original built-in def in case a test mutated it.
      icons[key] = { ..._builtInIconSnapshot[key] };
    }
  }
}

/** Get all registered icon names. */
export function getIconNames(): string[] {
  return Object.keys(icons);
}
