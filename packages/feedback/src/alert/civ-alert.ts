import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  CivBaseElement,
  LightDomSlotMixin,
  dispatch,
  renderCloseButton,
  t,
} from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';
export type AlertStyle = 'primary' | 'secondary' | 'tertiary';
export type AlertHeadingLevel = 2 | 3 | 4 | 5 | 6;


/**
 * CivUI Alert
 *
 * An accessible alert component for informational, warning, error, or
 * success messages. Supports a heading, dismissible close button, and
 * slim (compact) variant.
 *
 * **Body content:** set via the `label` prop for plain text, or by
 * placing children inside the host for rich content (paragraphs,
 * links, or composed components like `<civ-notice>` and `<civ-link>`).
 * If `label` is set, it takes precedence and any captured children
 * stay hidden — set one OR the other, not both.
 *
 * **Heading level:** Renders at `heading-level` (default 4). Set to one
 * level below the nearest parent heading in your document outline.
 *
 * @element civ-alert
 *
 * @prop {AlertVariant} variant - Alert type (sets colors + ARIA role)
 * @prop {AlertStyle} alertStyle - Visual treatment (primary, secondary, tertiary)
 * @prop {string} heading - Optional heading text
 * @prop {AlertHeadingLevel} headingLevel - Heading element level (2-6)
 * @prop {string} label - Body text (preferred over child content)
 * @prop {boolean} dismissible - Shows close button
 * @prop {boolean} slim - Compact single-line variant (no heading)
 * @prop {string} spacing - Padding size: 'default' or 'sm' (sm applies slim layout)
 *
 * @slot - Body content. Used when `label` is unset. Accepts text or
 *   rich markup including composed CivUI components.
 *
 * @fires civ-dismiss - When close button is clicked
 * @fires civ-analytics - Analytics tracking event on dismiss
 */
@customElement('civ-alert')
export class CivAlert extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) variant: AlertVariant = 'info';
  @property({ type: String, attribute: 'alert-style' }) alertStyle: AlertStyle = 'secondary';
  @property({ type: String }) heading = '';
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: AlertHeadingLevel = 4;
  @property({ type: String }) label = '';
  @property({ type: Boolean }) dismissible = false;
  @property({ type: Boolean }) slim = false;

  /** Padding size: 'default' or 'sm' for compact layouts (applies slim styling). */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  private readonly _headingId = this.generateId('heading');

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-alert-body-slot]' };
  }

  /**
   * The slot target div is rendered ONLY when `label` is unset, so
   * the mixin's `updated()` hook finds a target to relocate children
   * into. When `label` IS set, the slot target is absent — the
   * mixin's querySelector returns null and the captured children
   * stay hidden in `_slottedChildren`. This preserves the
   * "label wins" rule from the original LightDomTextMixin behavior.
   *
   * On the "label unset" path: text nodes (so
   * `<civ-alert>Plain text</civ-alert>` still works as a fallback)
   * AND element children (so consumers can compose `<civ-notice>` or
   * other markup inside the alert) both flow into the body. The
   * mixin's empty-check + idempotent appendChild keeps the
   * relocation correct across re-renders.
   */

  override render() {
    const classes = [
      'civ-alert',
      `civ-alert--${this.variant}`,
      `civ-alert--style-${this.alertStyle}`,
      (this.slim || this.spacing === 'sm') ? 'civ-alert--slim' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const role = this.variant === 'error' ? 'alert' : 'status';
    const hasHeading = !this.slim && this.heading;
    const level = Math.max(2, Math.min(6, this.headingLevel)) as AlertHeadingLevel;
    const variantLabelKey = `alertLabel${this.variant.charAt(0).toUpperCase()}${this.variant.slice(1)}` as
      'alertLabelInfo' | 'alertLabelWarning' | 'alertLabelError' | 'alertLabelSuccess';

    return html`
      <div
        class="${classes}"
        role="${role}"
        aria-labelledby="${hasHeading ? this._headingId : nothing}"
        aria-label="${hasHeading ? nothing : t(variantLabelKey)}"
      >
        <div class="civ-alert__content">
          <div class="civ-flex civ-justify-between civ-items-start">
            <div>
              ${hasHeading ? html`
                <p id="${this._headingId}" class="civ-alert__heading"
                   role="heading" aria-level="${level}"
                >${this.heading}</p>
              ` : nothing}
              <div class="civ-alert__body">${
                this.label
                  ? this.label
                  : html`<div data-civ-alert-body-slot></div>`
              }</div>
            </div>
            ${this.dismissible
              ? renderCloseButton({
                  label: t('alertDismissLabel'),
                  onClick: this._onDismiss,
                })
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private _onDismiss(): void {
    const allowed = dispatch(this, 'civ-dismiss', undefined, true);
    if (!allowed) return;
    this.sendAnalytics('dismiss');
    this.announce(t('alertDismissedMessage'), 'polite');
    // Defer removal so screen readers can announce and event propagation completes
    queueMicrotask(() => this.remove());
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-alert': CivAlert;
  }
}
