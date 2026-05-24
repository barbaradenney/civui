// Schema: packages/schema/src/components/civ-notice.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type NoticeIntent = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type NoticeSpacing = 'default' | 'sm';
export type NoticeIconStyle = 'filled' | 'outline';
export type NoticeHeadingLevel = 2 | 3 | 4 | 5 | 6;

const DEFAULT_ICONS_FILLED: Record<NoticeIntent, string> = {
  info: 'info-fill',
  warning: 'warning-fill',
  error: 'error-fill',
  success: 'check-circle-fill',
  neutral: 'info-fill',
};

const DEFAULT_ICONS_OUTLINE: Record<NoticeIntent, string> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'check-circle',
  neutral: 'info',
};

/**
 * CivUI Notice
 *
 * Icon-prefixed emphasis text for highlighting a specific passage
 * inside longer content — legal, safety, or financial consequences a
 * reader could miss in flowing prose. Based on GOV.UK's "warning text"
 * pattern, extended with semantic intents (info / warning / error /
 * success / neutral) so the same affordance handles emphasis across
 * the system.
 *
 * Distinct from `civ-alert` (a notification you hand the user, with
 * dismiss + ARIA live region) and `civ-callout` (a panel with
 * background + larger padding). Notice is the lightweight inline
 * variant: no background, no dismiss, no heading slot — just a large
 * semantic icon and bold paragraphs.
 *
 * Content is supplied via the `header` and `body` props so the
 * component owns the HTML. For rich body content with inline links,
 * use `civ-callout` instead.
 *
 * @element civ-notice
 *
 * @prop {NoticeIntent} intent - Severity / color treatment (`info`, `warning`, `error`, `success`, `neutral`). Default `info`.
 * @prop {NoticeSpacing} spacing - `default` (GOV.UK presence — larger icon + bold text) or `sm` (inline-compact). Default `default`.
 * @prop {NoticeIconStyle} iconStyle - `filled` (default) uses the solid Material Icons variants for heavier presence; `outline` uses the lighter outlined glyphs.
 * @prop {string} icon - Override for the intent's default icon
 * @prop {string} header - Optional heading text (renders bold)
 * @prop {NoticeHeadingLevel} headingLevel - Heading level 2-6 (default 3) when `header` is set
 * @prop {string} body - Body text rendered below the header
 * @prop {string} srPrefix - Optional visually-hidden screen-reader prefix (e.g. "Warning:"). Empty by default — opt-in per placement.
 *
 * @example
 * ```html
 * <civ-notice
 *   intent="warning"
 *   header="You must register"
 *   body="You can be fined up to $5,000 if you do not register."
 * ></civ-notice>
 *
 * <civ-notice intent="info" spacing="sm" body="This step is optional."></civ-notice>
 *
 * <!-- Outline icon variant for a lighter visual touch -->
 * <civ-notice intent="info" icon-style="outline" body="..."></civ-notice>
 * ```
 */
@customElement('civ-notice')
export class CivNotice extends CivBaseElement {
  @property({ type: String, reflect: true }) intent: NoticeIntent = 'info';
  @property({ type: String, reflect: true }) spacing: NoticeSpacing = 'default';
  @property({ type: String, attribute: 'icon-style', reflect: true })
  iconStyle: NoticeIconStyle = 'filled';
  @property({ type: String }) icon = '';
  @property({ type: String }) header = '';
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel: NoticeHeadingLevel = 3;
  @property({ type: String }) body = '';
  @property({ type: String, attribute: 'sr-prefix' }) srPrefix = '';

  private get _iconName(): string {
    if (this.icon) return this.icon;
    const map = this.iconStyle === 'outline' ? DEFAULT_ICONS_OUTLINE : DEFAULT_ICONS_FILLED;
    return map[this.intent] ?? map.info;
  }

  override render() {
    const level = Math.max(2, Math.min(6, this.headingLevel)) as NoticeHeadingLevel;
    return html`
      <div class="civ-notice civ-notice--${this.intent} civ-notice--${this.spacing}">
        <civ-icon
          class="civ-notice__icon"
          name="${this._iconName}"
          aria-hidden="true"
        ></civ-icon>
        ${this.srPrefix
          ? html`<span class="civ-sr-only">${this.srPrefix}</span>`
          : nothing}
        <div class="civ-notice__content">
          ${this.header
            ? html`<p
                class="civ-notice__header"
                role="heading"
                aria-level="${level}"
              >${this.header}</p>`
            : nothing}
          ${this.body
            ? html`<p class="civ-notice__body">${this.body}</p>`
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-notice': CivNotice;
  }
}
