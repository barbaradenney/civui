import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

/**
 * CivUI Segment
 *
 * Individual segment option within a civ-segmented-control.
 * Uses `role="radio"` for WAI-ARIA radiogroup semantics.
 *
 * @element civ-segment
 *
 * @prop {string} label - Segment label text
 * @prop {string} value - Value when this segment is selected
 * @prop {boolean} selected - Whether this segment is currently selected
 * @prop {boolean} disabled - Whether this segment is disabled
 *
 * @fires civ-input - When this segment is selected (input event), detail: { value }
 * @fires civ-change - When this segment is selected (bubbles to parent group), detail: { value }
 */
@customElement('civ-segment')
export class CivSegment extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  override render() {
    const position = this.getAttribute('data-civ-segment-position') || '';

    const classes = [
      'civ-px-4',
      'civ-py-2',
      'civ-text-sm',
      'civ-font-sans',
      'civ-font-medium',
      'civ-border',
      this.selected
        ? 'civ-bg-primary civ-text-white civ-border-primary'
        : 'civ-bg-white civ-text-base-darkest civ-border-base-light',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : 'civ-cursor-pointer',
      'focus-visible:civ-focus-ring',
      position === 'first' ? 'civ-rounded-l' : '',
      position === 'last' ? 'civ-rounded-r' : '',
      position === 'only' ? 'civ-rounded' : '',
      position === 'last' || position === 'middle' ? 'civ-border-l-0' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <button
        type="button"
        role="radio"
        aria-checked="${this.selected ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        tabindex="${this.selected ? 0 : -1}"
        @click="${this._onSelect}"
        class="${classes}"
      >
        ${this.label}
      </button>
    `;
  }

  private _onSelect(): void {
    if (this.disabled) return;
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-segment': CivSegment;
  }
}
