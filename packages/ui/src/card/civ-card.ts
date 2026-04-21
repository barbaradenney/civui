import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Card
 *
 * A structured container with three slot areas: header, body, and footer.
 * Use `data-card-header` and `data-card-footer` attributes to assign
 * children to those sections. Everything else goes into the body.
 *
 * @element civ-card
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 */
@customElement('civ-card')
export class CivCard extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

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
    const classes = [
      'civ-card',
      this.spacing === 'sm' ? 'civ-card--sm' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}">
        ${this._hasSlottedChildren('data-card-header') ? html`
          <div class="civ-card__header" data-civ-card-header></div>
        ` : nothing}

        <div class="civ-card__body" data-civ-card-body></div>

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
