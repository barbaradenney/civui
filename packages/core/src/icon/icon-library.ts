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
  loading: {
    label: 'Loading',
    path: 'M12 4V2C6.48 2 2 6.48 2 12h2c0-4.42 3.58-8 8-8z',
    ios: 'progress.indicator',
    android: 'progress_activity',
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

const _builtInIconNames = new Set(Object.keys(icons));

/** Reset icon registry to built-in icons only (for test isolation). */
export function resetIcons(): void {
  for (const key of Object.keys(icons)) {
    if (!_builtInIconNames.has(key)) {
      delete icons[key];
    }
  }
}

/** Get all registered icon names. */
export function getIconNames(): string[] {
  return Object.keys(icons);
}
