import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type CardColor = 'blue' | 'teal' | 'red' | 'green' | 'yellow' | 'orange' | 'purple' | 'gray';
export type CardStyle = 'primary' | 'secondary' | 'tertiary';

/**
 * CivUI Card
 *
 * A structured container with slot areas: header, body, footer, and
 * optional start/end flanking areas for icons or custom content.
 *
 * **Slot attributes:**
 * - `data-card-header` — top header section
 * - `data-card-footer` — bottom footer section
 * - `data-card-start` — left flanking area (icon, number, avatar)
 * - `data-card-end` — right flanking area (icon, tag, badge)
 * - (default) — body content
 *
 * **Colors:** blue, teal, red, green, yellow, orange, purple, gray
 *
 * @element civ-card
 * @prop {CardColor} color - Color variant (default: none/neutral)
 * @prop {CardStyle} cardStyle - Emphasis style
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Shorthand: icon name for start area
 * @prop {string} iconEnd - Shorthand: icon name for end area
 */
@customElement('civ-card')
export class CivCard extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) color: CardColor | '' = '';
  @property({ type: String, attribute: 'card-style' }) cardStyle: CardStyle = 'tertiary';
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-card-header': '[data-civ-card-header]',
      'data-card-footer': '[data-civ-card-footer]',
      'data-card-start': '[data-civ-card-start]',
      'data-card-end': '[data-civ-card-end]',
      default: '[data-civ-card-body]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const colorStyle = this.color
      ? (this.cardStyle === 'primary' ? `civ-card--${this.color}-primary` : `civ-card--${this.color}`)
      : `civ-card--${this.cardStyle}`;

    const classes = [
      'civ-card',
      colorStyle,
      this.spacing === 'sm' ? 'civ-card--sm' : '',
    ].filter(Boolean).join(' ');

    const hasStart = this.iconStart || this._hasSlottedChildren('data-card-start');
    const hasEnd = this.iconEnd || this._hasSlottedChildren('data-card-end');
    const hasFlank = hasStart || hasEnd;

    return html`
      <div class="${classes}">
        ${this._hasSlottedChildren('data-card-header') ? html`
          <div class="civ-card__header" data-civ-card-header></div>
        ` : nothing}

        ${hasFlank ? html`
          <div class="civ-card__body-layout">
            ${hasStart ? html`
              <div class="civ-card__start" data-civ-card-start>
                ${this.iconStart && !this._hasSlottedChildren('data-card-start')
                  ? html`<civ-icon class="civ-card__icon" name="${this.iconStart}" aria-hidden="true"></civ-icon>`
                  : nothing}
              </div>
            ` : nothing}
            <div class="civ-card__body" data-civ-card-body></div>
            ${hasEnd ? html`
              <div class="civ-card__end" data-civ-card-end>
                ${this.iconEnd && !this._hasSlottedChildren('data-card-end')
                  ? html`<civ-icon class="civ-card__icon" name="${this.iconEnd}" aria-hidden="true"></civ-icon>`
                  : nothing}
              </div>
            ` : nothing}
          </div>
        ` : html`
          <div class="civ-card__body" data-civ-card-body></div>
        `}

        ${this._hasSlottedChildren('data-card-footer') ? html`
          <div class="civ-card__footer" data-civ-card-footer></div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-card': CivCard;
  }
}
