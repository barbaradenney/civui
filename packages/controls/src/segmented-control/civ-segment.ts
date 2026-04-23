import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

/**
 * CivUI Segment
 *
 * Individual segment option within a civ-segmented-control.
 * Uses `role="radio"` for WAI-ARIA radiogroup semantics.
 *
 * **Must be used as a child of `<civ-segmented-control>`.**
 * The parent group manages selection, keyboard navigation (roving tabindex),
 * disabled state, and position styling via `data-civ-segment-position`.
 *
 * @example
 * ```html
 * <civ-segmented-control legend="View" name="view" value="list">
 *   <civ-segment label="List" value="list"></civ-segment>
 *   <civ-segment label="Grid" value="grid"></civ-segment>
 * </civ-segmented-control>
 * ```
 *
 * @element civ-segment
 *
 * @prop {string} label - Segment label text
 * @prop {string} value - Value when this segment is selected
 * @prop {boolean} selected - Whether this segment is currently selected (managed by parent)
 * @prop {boolean} disabled - Whether this segment is disabled
 *
 * @fires civ-change - When this segment is selected (bubbles to parent group), detail: { value }
 */
@customElement('civ-segment')
export class CivSegment extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  override render() {
    return html`
      <button
        type="button"
        role="radio"
        aria-checked="${this.selected ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        tabindex="${this.selected ? 0 : -1}"
        @click="${this._onSelect}"
        class="civ-segment-btn focus-visible:civ-focus-ring"
      >
        ${this.label}
      </button>
    `;
  }

  private _onSelect(): void {
    if (this.disabled) return;
    // Only dispatch civ-change — parent group intercepts and re-dispatches both events
    dispatch(this, 'civ-change', { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-segment': CivSegment;
  }
}
