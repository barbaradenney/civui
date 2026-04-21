import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import '../read-only-field/civ-read-only-field.js';

export interface SummarySection {
  /** Section heading (e.g., "Personal information"). */
  heading: string;
  /** Optional href or step ID for the edit link. */
  editHref?: string;
  /** Key-value pairs to display. */
  items: SummaryItem[];
  /** When true, section shows profile data — edit link text changes. */
  locked?: boolean;
}

export interface SummaryItem {
  /** Label (e.g., "First name"). */
  label: string;
  /** Value to display. Falsy values render as "Not provided". */
  value?: string | string[];
  /** Inline edit link for this specific item. */
  editHref?: string;
  /** Custom edit link text (default: "Edit"). */
  editLabel?: string;
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
    // Section-level editHref applies to all items that don't have their own
    const sectionEditHref = section.editHref && this._isSafeHref(section.editHref)
      ? section.editHref
      : undefined;

    const sectionEditLabel = section.locked
      ? t('summaryEditProfile')
      : undefined;

    const showDividers = section.items.length > 1;

    return html`
      <div class="civ-summary-section">
        <dl class="civ-summary-list civ-m-0">
          ${section.items.map((item, i) => {
            const itemEditHref = item.editHref || sectionEditHref || '';
            const itemEditLabel = item.editLabel || sectionEditLabel || '';
            return html`
              <civ-read-only-field
                label="${item.label}"
                value="${Array.isArray(item.value) ? '' : (item.value || '')}"
                .values="${Array.isArray(item.value) ? item.value : []}"
                edit-href="${itemEditHref}"
                edit-label="${itemEditLabel}"
                action-label="${item.action?.label || ''}"
                action-href="${item.action?.href || ''}"
              ></civ-read-only-field>
              ${showDividers && i < section.items.length - 1
                ? html`<civ-divider spacing="sm"></civ-divider>`
                : nothing}
            `;
          })}
        </dl>
      </div>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-summary': CivSummary;
  }
}
