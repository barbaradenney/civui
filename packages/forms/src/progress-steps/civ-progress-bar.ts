import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Progress Bar
 *
 * A percentage-based progress indicator for dynamic forms where
 * the number of steps isn't fixed. Shows a filled bar with
 * percentage label and optional status text.
 *
 * @element civ-progress-bar
 *
 * @prop {number} value - Current progress percentage (0-100)
 * @prop {string} label - Accessible label for the progress bar
 * @prop {string} status - Optional status text (e.g., "3 of 8 sections complete")
 * @prop {boolean} showPercent - Show percentage text (default true)
 */
@customElement('civ-progress-bar')
export class CivProgressBar extends CivBaseElement {
  @property({ type: Number }) value = 0;
  @property({ type: String }) label = 'Progress';
  @property({ type: String }) status = '';
  @property({ type: Boolean, attribute: 'show-percent' }) showPercent = true;

  override render() {
    const clamped = Math.max(0, Math.min(100, this.value));
    const isComplete = clamped >= 100;

    return html`
      <div class="civ-mb-4">
        <div class="civ-flex civ-justify-between civ-items-center civ-mb-1">
          ${this.status
            ? html`<span class="civ-text-sm civ-text-muted">${this.status}</span>`
            : html`<span></span>`}
          ${this.showPercent
            ? html`<span class="civ-text-sm civ-font-bold civ-text-body">${Math.round(clamped)}%</span>`
            : nothing}
        </div>
        <div
          class="civ-progress-track"
          role="progressbar"
          aria-valuenow="${Math.round(clamped)}"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="${this.label}"
        >
          <div
            class="civ-progress-fill ${isComplete ? 'civ-progress-fill--complete' : ''}"
            style="width: ${clamped}%"
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-progress-bar': CivProgressBar;
  }
}
