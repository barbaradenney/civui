import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { icons } from './icon-library.js';
import type { IconDef } from './icon-library.js';

/**
 * A CSS-only icon component.
 *
 * Each icon is rendered as a single `<span>` with no inner content — the
 * shape is drawn entirely via CSS `::before`/`::after` pseudo-elements
 * defined in `components.css`.
 *
 * Icons inherit `color` and scale with `font-size`, so they automatically
 * match surrounding text.
 *
 * All icons are implemented in pure CSS — no SVG needed.
 *
 * @example
 * ```html
 * <civ-icon name="check"></civ-icon>
 * <civ-icon name="error" class="civ-text-error civ-text-2xl"></civ-icon>
 * <civ-icon name="search" label="Search documents"></civ-icon>
 * ```
 */
@customElement('civ-icon')
export class CivIcon extends CivBaseElement {
  /** The icon name from the built-in library or a registered custom icon. */
  @property({ reflect: true })
  name = '';

  /**
   * Accessible label. When set, renders `role="img"` + `aria-label`.
   * When omitted, renders `aria-hidden="true"` (decorative icon).
   */
  @property()
  label = '';

  /**
   * Size shorthand — maps to `font-size` on the host.
   * Accepts any CSS length value: `sm` (0.75em), `md` (1em), `lg` (1.5em),
   * `xl` (2em), `2xl` (3em), or an explicit value like `24px`.
   */
  @property({ reflect: true })
  size = '';

  /**
   * Rotation in degrees. Common values: 90, 180, 270.
   */
  @property({ type: Number })
  rotate?: number;

  /**
   * Flip direction: 'horizontal', 'vertical', or 'both'.
   */
  @property({ type: String })
  flip?: string;

  private static _sizeMap: Record<string, string> = {
    sm: '0.75em',
    md: '1em',
    lg: '1.5em',
    xl: '2em',
    '2xl': '3em',
  };

  private _getIconDef(): IconDef | undefined {
    return icons[this.name];
  }

  override render() {
    const def = this._getIconDef();
    if (!def) return nothing;

    const isDecorative = !this.label;
    const accessibleLabel = this.label || def.label;
    const fontSize = this.size
      ? CivIcon._sizeMap[this.size] ?? this.size
      : undefined;

    const transforms: string[] = [];
    if (this.rotate) transforms.push(`rotate(${this.rotate}deg)`);
    if (this.flip === 'horizontal') transforms.push('scaleX(-1)');
    else if (this.flip === 'vertical') transforms.push('scaleY(-1)');
    else if (this.flip === 'both') transforms.push('scale(-1)');

    const styleParts: string[] = [];
    if (fontSize) styleParts.push(`font-size:${fontSize}`);
    if (transforms.length) styleParts.push(`display:inline-block`, `transform:${transforms.join(' ')}`);
    const styleStr = styleParts.join(';');

    return html`
      <span
        class="civ-icon civ-icon--${this.name}"
        style=${styleStr || nothing}
        role=${isDecorative ? 'presentation' : 'img'}
        aria-hidden=${isDecorative ? 'true' : 'false'}
        aria-label=${isDecorative ? nothing : accessibleLabel}
      ></span>
    `;
  }
}
