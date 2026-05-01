import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, interpolate, t } from '@civui/core';
import '@civui/navigation/link';
import '@civui/layout/divider';
import '@civui/layout/list';
import '../data-field/civ-data-field.js';

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
 * **Heading level:** Main heading renders at `heading-level` (default 2).
 * Section headings auto-render one level below. If the summary sits under
 * an `h1` page title, the default is correct. Under an `h2` section, set
 * `heading-level="3"`.
 *
 * @element civ-summary
 *
 * Edit links are rendered as `<civ-link>` elements that navigate
 * directly. Consumers running in an SPA that needs to intercept
 * navigation (e.g., to confirm before leaving the review) can listen
 * for the cancelable `civ-edit` event and call `preventDefault()` to
 * suppress the default navigation.
 *
 * @fires civ-edit - Cancelable. Fires when the user clicks any edit
 *   link. Detail: `{ section, item?, href }`. Calling `preventDefault()`
 *   on the event suppresses the default `<a>` navigation.
 */
@customElement('civ-summary')
export class CivSummary extends CivBaseElement {
  /** Main heading for the summary page. */
  @property({ type: String }) heading = '';

  /** Heading level 2-6 (default: 2). */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: 2 | 3 | 4 | 5 | 6 = 2;

  /** Sections to display. Set via JS property. */
  @property({ type: Array, attribute: false }) sections: SummarySection[] = [];

  override render() {
    return html`
      <div
        class="civ-summary"
        role="region"
        aria-label="${this.heading || t('summaryDefaultHeading')}"
        @click="${this._onEditClick}"
      >
        ${this.heading ? html`<span class="civ-heading-xl civ-block" role="heading" aria-level="${this.headingLevel}">${this.heading}</span>` : nothing}
        ${this.sections.map(section => this._renderSection(section))}
      </div>
    `;
  }

  /**
   * Capture clicks on rendered edit links and fire a cancelable
   * `civ-edit` event so SPAs can intercept navigation. Resolves the
   * section (and item, if applicable) from `data-civ-summary-*`
   * attributes stamped during render. The section-edit civ-link
   * carries them directly; per-item edits live inside
   * <civ-data-field>, which is the element that carries the
   * dataset, so we walk up to it.
   */
  private _onEditClick(e: MouseEvent): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const owner = target.closest<HTMLElement>('[data-civ-summary-section-index]');
    if (!owner) return;
    // Only fire when the click came from an actual link descendant —
    // skip stray clicks on the host's empty space.
    const link = target.closest('a, civ-link');
    if (!link) return;

    const section = this.sections[Number(owner.dataset.civSummarySectionIndex)];
    if (!section) return;
    const itemIdx = owner.dataset.civSummaryItemIndex;
    const item = itemIdx !== undefined ? section.items[Number(itemIdx)] : undefined;
    const href = (link as HTMLElement).getAttribute('href') ?? '';

    const detail: { section: SummarySection; item?: SummaryItem; href: string } = {
      section,
      href,
    };
    if (item) detail.item = item;

    const allowed = dispatch(this, 'civ-edit', detail, /* cancelable */ true);
    if (!allowed) {
      // Listener called preventDefault — suppress the default navigation.
      e.preventDefault();
    }
  }

  private _isSafeHref(href: string): boolean {
    // Allow fragment, relative path, http(s), tel, mailto, sms
    return /^(#|\/(?!\/)|https?:\/\/|tel:|mailto:|sms:)/.test(href);
  }

  private _renderSection(section: SummarySection) {
    const sectionIndex = this.sections.indexOf(section);
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
            <span class="civ-heading-md" role="heading" aria-level="${Math.min(6, this.headingLevel + 1)}">${section.heading}</span>
            ${showHeaderEdit ? html`
              <civ-link
                href="${sectionEditHref}"
                variant="tertiary"
                label="${sectionEditLabel}"
                aria-label="${interpolate(t('summaryEditAriaLabel'), { section: section.heading })}"
                data-civ-summary-section-index="${sectionIndex}"
              ></civ-link>
            ` : nothing}
          </div>
        ` : nothing}
        <civ-list ?dividers="${showDividers}">
          ${section.items.map((item, i) => {
            // Per-row edit: use item's own editHref, or section's if no heading (flat mode)
            const rawHref = item.editHref || (!section.heading ? (sectionEditHref || '') : '');
            const itemEditHref = rawHref && this._isSafeHref(rawHref) ? rawHref : '';
            const itemEditLabel = item.editLabel || (!section.heading ? (section.locked ? t('summaryEditProfile') : '') : '');
            return html`
              <civ-list-item>
                <civ-data-field
                  label="${item.label}"
                  value="${Array.isArray(item.value) ? '' : (item.value || '')}"
                  .values="${Array.isArray(item.value) ? item.value : []}"
                  edit-href="${itemEditHref}"
                  edit-label="${itemEditLabel}"
                  data-civ-summary-section-index="${sectionIndex}"
                  data-civ-summary-item-index="${i}"
                ></civ-data-field>
              </civ-list-item>
            `;
          })}
        </civ-list>
      </div>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'civ-summary': CivSummary;
  }
}
