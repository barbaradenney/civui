/**
 * CivUI Icon Library
 *
 * Built-in icons render as pure CSS pseudo-element shapes — no font, no
 * SVG, no external dependencies. Each one is a `civ-icon--{name}` class
 * defined in `packages/core/src/styles/components.css`.
 *
 * The default registry is intentionally small (only the icons CivUI's
 * own components reference). Consumers can extend it via `registerIcon()`:
 *
 *   // Custom CSS class authored alongside the consumer's stylesheet
 *   registerIcon('agency-seal', { label: 'Agency seal' });
 *
 *   // Or use the optional Material Symbols font for a wider catalog:
 *   import '@civui/core/styles/material-symbols';
 *   registerIcon('home', { label: 'Home', symbol: 'home' });
 *
 * Native platform mappings (`ios`, `android`) are preserved for the
 * SwiftUI / Compose implementations.
 */

export type IconDef = {
  /** Human-readable name for aria-label fallback. */
  label: string;
  /**
   * Material Symbols glyph name. When set (and no matching
   * `civ-icon--{name}` CSS class exists), the icon renders via font
   * ligature — requires the consumer to import
   * `@civui/core/styles/material-symbols`.
   */
  symbol?: string;
  /** SF Symbol name for iOS/macOS native. */
  ios?: string;
  /** Material Symbols name for Android native. */
  android?: string;
};

/**
 * Built-in icon set.
 *
 * Each entry corresponds to a `.civ-icon--{name}` rule in components.css.
 * Adding an icon here without the matching CSS will result in an empty
 * 1em × 1em box at runtime.
 */
export const icons: Record<string, IconDef> = {
  check: { label: 'Success', ios: 'checkmark', android: 'check' },
  'check-circle': { label: 'Success', ios: 'checkmark.circle', android: 'check_circle' },
  'chevron-down': { label: 'Expand', ios: 'chevron.down', android: 'expand_more' },
  'chevron-left': { label: 'Previous', ios: 'chevron.left', android: 'chevron_left' },
  'chevron-right': { label: 'Next', ios: 'chevron.right', android: 'chevron_right' },
  close: { label: 'Close', ios: 'xmark', android: 'close' },
  download: { label: 'Download', ios: 'arrow.down.doc', android: 'download' },
  error: { label: 'Error', ios: 'exclamationmark.circle', android: 'error' },
  'external-link': { label: 'Opens in new tab', ios: 'arrow.up.right.square', android: 'open_in_new' },
  info: { label: 'Information', ios: 'info.circle', android: 'info' },
  loading: { label: 'Loading', ios: 'progress.indicator', android: 'progress_activity' },
  mail: { label: 'Email', ios: 'envelope', android: 'mail' },
  phone: { label: 'Phone', ios: 'phone', android: 'call' },
  warning: { label: 'Warning', ios: 'exclamationmark.triangle', android: 'warning' },
};

/**
 * Register a custom icon or override a built-in one.
 *
 * @example
 * ```ts
 * // Pure-CSS icon (consumer ships their own .civ-icon--agency-seal rule)
 * registerIcon('agency-seal', { label: 'Agency seal' });
 *
 * // Material Symbols font fallback
 * // (requires `import '@civui/core/styles/material-symbols'`)
 * registerIcon('home', { label: 'Home', symbol: 'home' });
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
