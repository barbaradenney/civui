import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch } from '@civui/core';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';
export type AlertHeadingLevel = 2 | 3 | 4 | 5 | 6;

// Inline SVG close icon (16x16) — avoids external icon dependency
const closeIcon = html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.354 4.354a.5.5 0 0 0-.708-.708L8 7.293 4.354 3.646a.5.5 0 1 0-.708.708L7.293 8l-3.647 3.646a.5.5 0 0 0 .708.708L8 8.707l3.646 3.647a.5.5 0 0 0 .708-.708L8.707 8l3.647-3.646z"/></svg>`;

/**
 * CivUI Alert
 *
 * An accessible alert component for informational, warning, error, or
 * success messages. Supports a heading, dismissible close button, and
 * slim (compact) variant.
 *
 * Body text is set via the `label` property. If `label` is not set,
 * initial Light DOM text content is used as a fallback.
 *
 * @element civ-alert
 *
 * @prop {AlertVariant} variant - Alert type (sets colors + ARIA role)
 * @prop {string} heading - Optional heading text
 * @prop {AlertHeadingLevel} headingLevel - Heading element level (2-6)
 * @prop {string} label - Body text (preferred over child text)
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
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: AlertHeadingLevel = 4;
  @property({ type: String }) label = '';
  @property({ type: Boolean }) dismissible = false;
  @property({ type: Boolean }) slim = false;

  private _initialText = '';
  private _headingId = this.generateId('heading');

  override connectedCallback(): void {
    super.connectedCallback();
    // Capture initial text content before Lit renders (fallback for label prop)
    if (!this._initialText) {
      this._initialText = this.textContent?.trim() || '';
    }
  }

  private get _bodyText(): string {
    return this.label || this._initialText;
  }

  private _renderHeading() {
    if (this.slim || !this.heading) return nothing;

    const level = Math.max(2, Math.min(6, this.headingLevel)) as AlertHeadingLevel;
    // Use role="heading" + aria-level for dynamic heading level
    // without needing a switch over h2-h6 tag names
    return html`
      <p id="${this._headingId}" class="civ-alert__heading"
         role="heading" aria-level="${level}"
      >${this.heading}</p>
    `;
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
    const hasHeading = !this.slim && this.heading;

    return html`
      <div
        class="${classes}"
        role="${role}"
        aria-labelledby="${hasHeading ? this._headingId : nothing}"
        aria-label="${hasHeading ? nothing : `${this.variant} alert`}"
      >
        <div class="civ-flex civ-justify-between civ-items-start">
          <div>
            ${this._renderHeading()}
            <div class="civ-alert__body">${this._bodyText}</div>
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
    const allowed = dispatch(this, 'civ-dismiss', undefined, true);
    if (!allowed) return;
    this.sendAnalytics('dismiss');
    this.announce('Alert dismissed', 'polite');
    // Defer removal so screen readers can announce and event propagation completes
    queueMicrotask(() => this.remove());
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-alert': CivAlert;
  }
}
