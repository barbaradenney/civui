import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomContainerMixin } from '@civui/core';

/**
 * CivUI Card
 *
 * A bordered container for grouping related content. Provides consistent
 * padding, border, and optional spacing variants.
 *
 * @element civ-card
 *
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 *
 * @example
 * ```html
 * <civ-card>
 *   <h3>Section title</h3>
 *   <p>Card content goes here.</p>
 * </civ-card>
 * ```
 */
@customElement('civ-card')
export class CivCard extends LightDomContainerMixin(CivBaseElement) {
  /** Padding size. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  override firstUpdated(): void {
    this._relocateChildren('[data-civ-card-content]');
  }

  override render() {
    const classes = [
      'civ-card',
      this.spacing === 'sm' ? 'civ-card--sm' : '',
    ].filter(Boolean).join(' ');

    return html`<div class="${classes}" data-civ-card-content></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-card': CivCard;
  }
}
