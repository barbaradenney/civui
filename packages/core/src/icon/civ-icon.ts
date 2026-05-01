import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { icons } from './icon-library.js';
import type { IconDef } from './icon-library.js';

/**
 * CivUI icon component.
 *
 * Built-in icons render as pure CSS shapes via the `.civ-icon--{name}`
 * class — no font, no SVG, no extra HTTP requests. Icons inherit `color`
 * (via `currentColor`) and scale with `font-size`.
 *
 * For icons registered with a `symbol` (Material Symbols glyph name),
 * the component renders the font ligature instead. That path requires
 * the consumer to opt in to the font:
 *
 *   import '@civui/core/styles/material-symbols';
 *   registerIcon('home', { label: 'Home', symbol: 'home' });
 *
 * @element civ-icon
 *
 * @example
 * ```html
 * <civ-icon name="check"></civ-icon>
 * <civ-icon name="error" class="civ-text-error civ-text-2xl"></civ-icon>
 * <civ-icon name="check" label="Approved"></civ-icon>
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

  /** Rotation in degrees. Common values: 90, 180, 270. */
  @property({ type: Number })
  rotate?: number;

  /** Flip direction: 'horizontal', 'vertical', or 'both'. */
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
        console.warn(`[civ-icon] Unknown icon name: "${this.name}". Register it with registerIcon() or check icon-library.ts for available names.`);
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
    if (transforms.length) styleParts.push(`display:inline-block`, `transform:${transforms.join(' ')}`);
    const styleStr = styleParts.join(';') || nothing;

    const role = isDecorative ? 'none' : 'img';
    const ariaHidden = isDecorative ? 'true' : 'false';
    const ariaLabel = isDecorative ? nothing : accessibleLabel;

    if (def.symbol) {
      return html`<span
        class="civ-icon civ-icon--${this.name} material-symbols-outlined"
        style=${styleStr}
        role=${role}
        aria-hidden=${ariaHidden}
        aria-label=${ariaLabel}
        translate="no"
      >${def.symbol}</span>`;
    }

    return html`<span
      class="civ-icon civ-icon--${this.name}"
      style=${styleStr}
      role=${role}
      aria-hidden=${ariaHidden}
      aria-label=${ariaLabel}
    ></span>`;
  }
}
