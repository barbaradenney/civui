import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type CardColor = 'blue' | 'teal' | 'red' | 'green' | 'yellow' | 'orange' | 'purple' | 'gray';
export type CardStyle = 'primary' | 'secondary' | 'tertiary';

/**
 * CivUI Card
 *
 * A structured container with three slot areas: header, body, and footer.
 * Use `data-card-header` and `data-card-footer` attributes to assign
 * children to those sections. Everything else goes into the body.
 *
 * **Colors:** blue, teal, red, green, yellow, orange, purple, gray
 * (same palette as civ-tag)
 *
 * **Styles:**
 * - `primary` — filled dark background, white text
 * - `secondary` — light tint background
 * - `tertiary` (default) — white background with border outline
 *
 * @element civ-card
 * @prop {CardColor} color - Color variant (default: none/neutral)
 * @prop {CardStyle} cardStyle - Emphasis style
 * @prop {string} spacing - Padding size: 'default' or 'sm'
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

    const hasIcons = this.iconStart || this.iconEnd;

    return html`
      <div class="${classes}">
        ${this._hasSlottedChildren('data-card-header') ? html`
          <div class="civ-card__header" data-civ-card-header></div>
        ` : nothing}

        ${hasIcons ? html`
          <div class="civ-card__body-layout">
            ${this.iconStart ? html`<civ-icon class="civ-card__icon" name="${this.iconStart}" aria-hidden="true"></civ-icon>` : nothing}
            <div class="civ-card__body" data-civ-card-body></div>
            ${this.iconEnd ? html`<civ-icon class="civ-card__icon" name="${this.iconEnd}" aria-hidden="true"></civ-icon>` : nothing}
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
