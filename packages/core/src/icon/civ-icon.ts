import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { icons } from './icon-library.js';
import type { IconDef, IconLayer } from './icon-library.js';

/**
 * An icon component using CSS-drawn shapes or layered Unicode characters.
 *
 * CSS icons render as a single `<span>` with no inner content — the icon
 * shape is drawn entirely via `::before`/`::after` pseudo-elements.
 * Legacy layer icons render as stacked Unicode character `<span>` elements.
 *
 * All icons inherit `color` and scale with `font-size`, so they
 * automatically match surrounding text.
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

    const isCss = !def.type || def.type === 'css';

    return html`
      <span
        class="civ-icon ${isCss ? `civ-icon--${this.name}` : ''}"
        style=${fontSize ? `font-size:${fontSize}` : nothing}
        role=${isDecorative ? 'presentation' : 'img'}
        aria-hidden=${isDecorative ? 'true' : 'false'}
        aria-label=${isDecorative ? nothing : accessibleLabel}
      >${isCss ? nothing : def.layers?.map((layer) => this._renderLayer(layer))}</span>
    `;
  }

  private _renderLayer(layer: IconLayer) {
    const style = [
      layer.transform ? `transform:${layer.transform}` : '',
      layer.opacity !== undefined ? `opacity:${layer.opacity}` : '',
      layer.weight ? `font-weight:${layer.weight}` : '',
    ]
      .filter(Boolean)
      .join(';');

    return html`<span class="civ-icon__layer" style=${style || nothing} aria-hidden="true">${layer.char}</span>`;
  }
}
