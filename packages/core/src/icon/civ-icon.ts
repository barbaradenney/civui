import { html, svg, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { icons } from './icon-library.js';
import type { IconDef } from './icon-library.js';

/**
 * CivUI icon component.
 *
 * Renders inline SVG paths — no font files, no external requests, no
 * pseudo-element hacks. Icons inherit `color` (via `currentColor`) and
 * scale with `font-size`. All paths use a 24×24 viewBox with stroke-based
 * rendering (round caps and joins).
 *
 * For icons registered with a `symbol` (Material Symbols glyph name)
 * and no `path`, the component renders the font ligature instead.
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
   * Accepts: `sm` (0.875em), `md` (1em), `lg` (1.5em),
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
    sm: '0.875em',
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
    if (transforms.length) styleParts.push(`transform:${transforms.join(' ')}`);
    const styleStr = styleParts.join(';') || undefined;

    // Material Symbols font fallback (when path is empty but symbol is set)
    if (!def.path && def.symbol) {
      return html`<span
        class="civ-icon material-symbols-outlined"
        style=${styleStr || nothing}
        role=${isDecorative ? 'none' : 'img'}
        aria-hidden=${isDecorative ? 'true' : 'false'}
        aria-label=${isDecorative ? nothing : accessibleLabel}
        translate="no"
      >${def.symbol}</span>`;
    }

    // Split multi-path strings (separated by |||)
    const paths = (def.path || '').split('|||').filter(Boolean);

    // Loading icon gets the spin animation class
    const isLoading = this.name === 'loading';

    return html`<svg
      class="civ-icon ${isLoading ? 'civ-icon--loading' : ''}"
      style=${styleStr || nothing}
      viewBox="0 0 24 24"
      fill="currentColor"
      role=${isDecorative ? 'none' : 'img'}
      aria-hidden=${isDecorative ? 'true' : 'false'}
      aria-label=${isDecorative ? nothing : accessibleLabel}
      xmlns="http://www.w3.org/2000/svg"
    >${paths.map(d => svg`<path d="${d}"/>`)}</svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-icon': CivIcon;
  }
}
