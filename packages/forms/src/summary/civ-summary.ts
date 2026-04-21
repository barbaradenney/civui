import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, interpolate, t } from '@civui/core';

export interface SummarySection {
  /** Section heading (e.g., "Personal information"). */
  heading: string;
  /** Optional href or step ID for the edit link. */
  editHref?: string;
  /** Key-value pairs to display. */
  items: SummaryItem[];
}

export interface SummaryItem {
  /** Label (e.g., "First name"). */
  label: string;
  /** Value to display. Falsy values render as "Not provided". */
  value?: string | string[];
  /** Where the data came from. Shows an annotation tag when set to 'profile'. */
  source?: 'profile' | 'user' | 'api';
}

/**
 * CivUI Summary
 *
 * Read-only review page that displays form data before final submission.
 * Renders a structured list of sections, each with a heading, edit link,
 * and key-value pairs.
 *
 * @element civ-summary
 *
 * @example
 * ```html
 * <civ-summary heading="Review your information">
 * </civ-summary>
 * ```
 *
 * Then set sections via JS:
 * ```js
 * summary.sections = [
 *   {
 *     heading: 'Personal information',
 *     editHref: '#step-1',
 *     items: [
 *       { label: 'First name', value: 'Jane' },
 *       { label: 'Last name', value: 'Doe' },
 *     ],
 *   },
 * ];
 * ```
 *
 * @fires civ-summary-edit - When an edit link is clicked, detail: { section: string, href: string }
 */
@customElement('civ-summary')
export class CivSummary extends CivBaseElement {
  /** Main heading for the summary page. */
  @property({ type: String }) heading = '';

  /** Sections to display. Set via JS property. */
  @property({ type: Array }) sections: SummarySection[] = [];

  override render() {
    return html`
      <div class="civ-summary" role="region" aria-label="${this.heading || 'Summary'}">
        ${this.heading ? html`<h2 class="civ-heading-xl">${this.heading}</h2>` : nothing}
        ${this.sections.map(section => this._renderSection(section))}
      </div>
    `;
  }

  private _isSafeHref(href: string): boolean {
    return /^(#|\/|https?:\/\/)/.test(href);
  }

  private _renderSection(section: SummarySection) {
    const safeHref = section.editHref && this._isSafeHref(section.editHref)
      ? section.editHref
      : undefined;

    return html`
      <div class="civ-summary-section civ-mb-6 civ-border-b civ-border-base-lighter civ-pb-4">
        <div class="civ-flex civ-justify-between civ-items-center civ-mb-3">
          <h3 class="civ-heading-md">${section.heading}</h3>
          ${safeHref ? html`
            <a
              href="${safeHref}"
              class="civ-link"
              aria-label="${interpolate(t('summaryEditAriaLabel'), { section: section.heading })}"
              @click="${(e: Event) => this._onEdit(e, section)}"
            >${t('summaryEditLink')}</a>
          ` : nothing}
        </div>
        <dl class="civ-summary-list">
          ${section.items.map(item => this._renderItem(item))}
        </dl>
      </div>
    `;
  }

  private _renderItem(item: SummaryItem) {
    const hasValue = Array.isArray(item.value)
      ? item.value.length > 0
      : Boolean(item.value);

    return html`
      <div class="civ-summary-item civ-flex civ-flex-wrap civ-py-2">
        <dt class="civ-font-medium civ-text-muted civ-summary-label">${item.label}</dt>
        <dd class="civ-flex-1 civ-min-w-0">
          ${hasValue
            ? Array.isArray(item.value)
              ? item.value.map(v => html`<span class="civ-block">${v}</span>`)
              : item.value
            : html`<span class="civ-text-muted civ-italic">${t('summaryNotProvided')}</span>`}
          ${item.source === 'profile'
            ? html`<civ-tag label="${t('summarySourceProfile')}" variant="gray" tag-style="secondary" class="civ-ms-1"></civ-tag>`
            : nothing}
        </dd>
      </div>
    `;
  }

  private _onEdit(_e: Event, section: SummarySection): void {
    dispatch(this, 'civ-summary-edit', {
      section: section.heading,
      href: section.editHref || '',
    });
    this.sendAnalytics('click', { section: section.heading });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-summary': CivSummary;
  }
}
