import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, interpolate, t } from '@civui/core';
import '../read-only-field/civ-read-only-field.js';

export type SummarySectionStatus = 'not-started' | 'in-progress' | 'complete' | 'cannot-start' | 'error';

const STATUS_TAG: Record<SummarySectionStatus, { label: string; variant: string; style?: string }> = {
  'not-started': { label: 'Not started', variant: 'blue' },
  'in-progress': { label: 'In progress', variant: 'teal' },
  'complete': { label: 'Complete', variant: 'green', style: 'primary' },
  'cannot-start': { label: 'Cannot start yet', variant: 'gray' },
  'error': { label: 'Error', variant: 'red' },
};

export interface SummarySection {
  /** Section heading (e.g., "Personal information"). */
  heading: string;
  /** Optional href or step ID for the edit link. */
  editHref?: string;
  /** Key-value pairs to display. */
  items: SummaryItem[];
  /** Optional status indicator for hub-page usage. */
  status?: SummarySectionStatus;
  /** When true, section shows profile data — edit link goes to profile, not form step. */
  locked?: boolean;
}

export interface SummaryItem {
  /** Label (e.g., "First name"). */
  label: string;
  /** Value to display. Falsy values render as "Not provided". */
  value?: string | string[];
  /** Optional inline action link (e.g., for conflict resolution). */
  action?: { label: string; href: string };
}

/**
 * CivUI Summary
 *
 * Displays form data as structured sections with label/value pairs.
 * Works for both review pages (end of form) and hub pages (mid-form)
 * when combined with status indicators.
 *
 * @element civ-summary
 *
 * @fires civ-summary-edit - When an edit link is clicked, detail: { section, href }
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

    const editLabel = section.locked
      ? t('summaryEditProfile')
      : t('summaryEditLink');

    const editAriaLabel = section.locked
      ? `${t('summaryEditProfile')} — ${section.heading}`
      : interpolate(t('summaryEditAriaLabel'), { section: section.heading });

    const statusTag = section.status ? STATUS_TAG[section.status] : undefined;

    return html`
      <div class="civ-summary-section civ-py-4 civ-border-b civ-border-base-lighter">
        <div class="civ-flex civ-justify-between civ-items-center civ-mb-2">
          <h3 class="civ-heading-md">${section.heading}</h3>
          <div class="civ-flex civ-items-center civ-gap-3">
            ${statusTag ? html`
              <civ-tag
                label="${statusTag.label}"
                variant="${statusTag.variant}"
                tag-style="${statusTag.style || 'secondary'}"
              ></civ-tag>
            ` : nothing}
          ${safeHref ? html`
            <civ-link
              href="${safeHref}"
              variant="tertiary"
              label="${editLabel}"
              aria-label="${editAriaLabel}"
              @click="${(e: Event) => this._onEdit(e, section)}"
            ></civ-link>
          ` : nothing}
          </div>
        </div>
        <dl class="civ-summary-list civ-m-0">
          ${section.items.map(item => html`
            <civ-read-only-field
              label="${item.label}"
              value="${Array.isArray(item.value) ? '' : (item.value || '')}"
              .values="${Array.isArray(item.value) ? item.value : []}"
              action-label="${item.action?.label || ''}"
              action-href="${item.action?.href || ''}"
            ></civ-read-only-field>
          `)}
        </dl>
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
