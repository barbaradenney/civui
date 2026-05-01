import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { icons, getMaterialSymbolName } from './icon-library.js';
import type { IconDef } from './icon-library.js';

/**
 * Material Symbols icon component.
 *
 * Renders a Material Symbols Outlined glyph via the icon font's ligature
 * lookup — the symbol name is the element's text content. Icons inherit
 * `color` and scale with `font-size`.
 *
 * The `material-symbols-outlined` class (and font) ships with the
 * `material-symbols` package; consumers must import
 * `@civui/core/styles` (or `material-symbols/outlined.css`) once.
 *
 * @element civ-icon
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
    if (!def) {
      if (this.name) {
        console.warn(`[civ-icon] Unknown icon name: "${this.name}". Check icon-library.ts for available names.`);
      }
      return nothing;
    }

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
    if (transforms.length) styleParts.push(`transform:${transforms.join(' ')}`);
    const styleStr = styleParts.join(';');

    const symbol = getMaterialSymbolName(this.name);

    return html`<span
      class="civ-icon civ-icon--${this.name} material-symbols-outlined"
      style=${styleStr || nothing}
      role=${isDecorative ? 'none' : 'img'}
      aria-hidden=${isDecorative ? 'true' : 'false'}
      aria-label=${isDecorative ? nothing : accessibleLabel}
      translate="no"
    >${symbol}</span>`;
  }
}
