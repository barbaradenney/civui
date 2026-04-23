import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Page Header
 *
 * A structured page heading with four slot areas: tag, eyebrow,
 * heading, and subheading. Use data-* attributes to assign children.
 *
 * @element civ-page-header
 * @prop {string} spacing - Bottom margin size: 'default' or 'sm'
 */
@customElement('civ-page-header')
export class CivPageHeader extends LightDomSlotMixin(CivBaseElement) {
  /** Bottom margin size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-tag': '[data-civ-page-header-tag]',
      'data-eyebrow': '[data-civ-page-header-eyebrow]',
      'data-heading': '[data-civ-page-header-heading]',
      'data-subheading': '[data-civ-page-header-subheading]',
      default: '[data-civ-page-header-heading]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <div class="${[
        'civ-page-header',
        this.spacing === 'sm' ? 'civ-page-header--sm' : '',
      ].filter(Boolean).join(' ')}">
        ${this._hasSlottedChildren('data-tag') ? html`
          <div class="civ-page-header__tag" data-civ-page-header-tag></div>
        ` : nothing}
        ${this._hasSlottedChildren('data-eyebrow') ? html`
          <div class="civ-page-header__eyebrow" data-civ-page-header-eyebrow></div>
        ` : nothing}
        <div class="civ-page-header__heading" data-civ-page-header-heading></div>
        ${this._hasSlottedChildren('data-subheading') ? html`
          <div class="civ-page-header__subheading" data-civ-page-header-subheading></div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-page-header': CivPageHeader;
  }
}
