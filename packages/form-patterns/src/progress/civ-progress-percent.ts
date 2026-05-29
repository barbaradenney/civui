import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

/**
 * CivUI Progress Bar
 *
 * A percentage-based progress indicator for dynamic forms where
 * the number of steps isn't fixed. Shows a filled bar with
 * percentage label and optional status text.
 *
 * @element civ-progress-percent
 *
 * @prop {number} value - Current progress percentage (0-100)
 * @prop {string} label - Accessible label for the progress bar
 * @prop {string} status - Optional status text (e.g., "3 of 8 sections complete")
 * @prop {boolean} hidePercent - Hide percentage text (default false; percent renders)
 */
@customElement('civ-progress-percent')
export class CivProgressPercent extends CivBaseElement {
  @property({ type: Number }) value = 0;
  /** Accessible label for the bar. Empty falls back to the localized default. */
  @property({ type: String }) label = '';
  @property({ type: String }) status = '';
  @property({ type: Boolean, attribute: 'hide-percent' }) hidePercent = false;

  override render() {
    const clamped = Math.max(0, Math.min(100, this.value));
    const isComplete = clamped >= 100;

    const hasHeader = this.status || !this.hidePercent;

    return html`
      <div>
        ${hasHeader ? html`
          <div class="civ-flex civ-justify-between civ-items-center civ-mb-1">
            ${this.status
              ? html`<span class="civ-text-sm">${this.status}</span>`
              : html`<span></span>`}
            ${!this.hidePercent
              ? html`<span class="civ-text-sm civ-font-bold civ-text-body">${Math.round(clamped)}%</span>`
              : nothing}
          </div>
        ` : nothing}
        <div
          class="civ-progress-track"
          role="progressbar"
          aria-valuenow="${Math.round(clamped)}"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="${this.label || t('progressBarLabel')}"
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
    'civ-progress-percent': CivProgressPercent;
  }
}
