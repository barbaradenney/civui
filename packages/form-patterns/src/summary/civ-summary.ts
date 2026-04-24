import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import '@civui/ui';
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
 * Edit links are rendered as `<civ-link>` elements that navigate directly.
 */
@customElement('civ-summary')
export class CivSummary extends CivBaseElement {
  /** Main heading for the summary page. */
  @property({ type: String }) heading = '';

  /** Sections to display. Set via JS property. */
  @property({ type: Array, attribute: false }) sections: SummarySection[] = [];

  override render() {
    return html`
      <div class="civ-summary" role="region" aria-label="${this.heading || 'Summary'}">
        ${this.heading ? html`<h2 class="civ-heading-xl">${this.heading}</h2>` : nothing}
        ${this.sections.map(section => this._renderSection(section))}
      </div>
    `;
  }

  private _isSafeHref(href: string): boolean {
    // Allow fragment, relative path (but not protocol-relative //), and http(s)
    return /^(#|\/(?!\/)|https?:\/\/)/.test(href);
  }

  private _renderSection(section: SummarySection) {
    const sectionEditHref = section.editHref && this._isSafeHref(section.editHref)
      ? section.editHref
      : undefined;

    const sectionEditLabel = section.locked
      ? t('summaryEditProfile')
      : t('summaryEditLink');

    // If section has a heading, show the edit link in the header (not per-row)
    const showHeaderEdit = section.heading && sectionEditHref;
    const showDividers = section.items.length > 1;

    return html`
      <div class="civ-summary-section">
        ${section.heading ? html`
          <div class="civ-flex civ-justify-between civ-items-center civ-mb-2">
            <h3 class="civ-heading-md">${section.heading}</h3>
            ${showHeaderEdit ? html`
              <civ-link
                href="${sectionEditHref}"
                variant="tertiary"
                label="${sectionEditLabel}"
                aria-label="${sectionEditLabel} ${section.heading}"
              ></civ-link>
            ` : nothing}
          </div>
        ` : nothing}
        <div class="civ-summary-list">
          ${section.items.map((item, i) => {
            // Per-row edit: use item's own editHref, or section's if no heading (flat mode)
            const rawHref = item.editHref || (!section.heading ? (sectionEditHref || '') : '');
            const itemEditHref = rawHref && this._isSafeHref(rawHref) ? rawHref : '';
            const itemEditLabel = item.editLabel || (!section.heading ? (section.locked ? t('summaryEditProfile') : '') : '');
            return html`
              <civ-read-only-field
                label="${item.label}"
                value="${Array.isArray(item.value) ? '' : (item.value || '')}"
                .values="${Array.isArray(item.value) ? item.value : []}"
                edit-href="${itemEditHref}"
                edit-label="${itemEditLabel}"
              ></civ-read-only-field>
              ${showDividers && i < section.items.length - 1
                ? html`<civ-divider spacing="sm"></civ-divider>`
                : nothing}
            `;
          })}
        </div>
      </div>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-summary': CivSummary;
  }
}
