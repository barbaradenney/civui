import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

// Inline SVG close icon (16x16) — avoids external icon dependency
const closeIcon = html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.354 4.354a.5.5 0 0 0-.708-.708L8 7.293 4.354 3.646a.5.5 0 1 0-.708.708L7.293 8l-3.647 3.646a.5.5 0 0 0 .708.708L8 8.707l3.646 3.647a.5.5 0 0 0 .708-.708L8.707 8l3.647-3.646z"/></svg>`;

/**
 * CivUI Alert
 *
 * An accessible alert component for informational, warning, error, or
 * success messages. Supports a heading, dismissible close button, and
 * slim (compact) variant.
 *
 * @element civ-alert
 *
 * @prop {AlertVariant} variant - Alert type (sets colors + ARIA role)
 * @prop {string} heading - Optional heading text
 * @prop {boolean} dismissible - Shows close button
 * @prop {boolean} slim - Compact single-line variant (no heading)
 *
 * @fires civ-dismiss - When close button is clicked
 * @fires civ-analytics - Analytics tracking event on dismiss
 */
@customElement('civ-alert')
export class CivAlert extends CivBaseElement {
  @property({ type: String }) variant: AlertVariant = 'info';
  @property({ type: String }) heading = '';
  @property({ type: Boolean }) dismissible = false;
  @property({ type: Boolean }) slim = false;

  private _bodyText = '';

  override connectedCallback(): void {
    super.connectedCallback();
    // Capture initial text content before Lit renders
    if (!this._bodyText) {
      this._bodyText = this.textContent?.trim() || '';
    }
  }

  override render() {
    const classes = [
      'civ-alert',
      `civ-alert--${this.variant}`,
      this.slim ? 'civ-alert--slim' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const role = this.variant === 'error' ? 'alert' : 'status';

    return html`
      <div
        class="${classes}"
        role="${role}"
        aria-label="${this.heading || `${this.variant} alert`}"
      >
        <div class="civ-flex civ-justify-between civ-items-start">
          <div>
            ${!this.slim && this.heading
              ? html`<h4 class="civ-alert__heading">${this.heading}</h4>`
              : nothing}
            <div>${this._bodyText}</div>
          </div>
          ${this.dismissible
            ? html`
                <button
                  type="button"
                  class="civ-alert__dismiss focus-visible:civ-focus-ring"
                  aria-label="Dismiss alert"
                  @click="${this._onDismiss}"
                >${closeIcon}</button>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _onDismiss(): void {
    dispatch(this, 'civ-dismiss');
    this.sendAnalytics('dismiss');
    this.remove();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-alert': CivAlert;
  }
}
