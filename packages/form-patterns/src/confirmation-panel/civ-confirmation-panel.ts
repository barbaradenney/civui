import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Confirmation Panel
 *
 * Post-submission success surface for government forms. Renders an
 * accessible status header, an optional reference-number callout (or
 * pending-reference message), a "what happens next" section, and an
 * action row. Aligned with the USWDS confirmation pattern — restrained
 * left-border success treatment rather than a full-bleed banner.
 *
 * The host receives focus on mount (so screen readers announce the
 * heading immediately) and is exposed as a `role="status"` region.
 * Set `no-autofocus` to suppress this when the surrounding page is
 * managing focus itself.
 *
 * **Heading level:** Defaults to `1` because confirmation pages
 * almost always replace the form page entirely. Lower it to `2` when
 * the panel is embedded inside another page.
 *
 * **Reference number:** Pass `reference` to render the bordered
 * summary-box callout. When the reference is not yet known (async
 * backend), omit the prop and fill the `pending-reference` slot
 * instead.
 *
 * @element civ-confirmation-panel
 *
 * @prop {string} heading - Success message heading. Required for
 *   accessible labelling.
 * @prop {number} headingLevel - Heading level 1-6 (default: 1).
 * @prop {string} reference - Optional reference / case / confirmation
 *   number. When set, renders the bordered summary-box callout.
 * @prop {string} referenceLabel - Label shown above the reference
 *   number (default: "Reference number").
 * @prop {boolean} noAutofocus - When true, the panel does not focus
 *   the heading on mount. Use when the surrounding page manages
 *   focus / SR announcements itself.
 *
 * @slot - Body content shown under the heading (typically 1–2
 *   short paragraphs confirming what happened and what was sent).
 *   Any direct child without a `data-*` slot marker lands here.
 * @slot data-pending-reference - Element marked with the
 *   `data-pending-reference` attribute. Rendered in place of the
 *   reference callout when `reference` is omitted (e.g. "We'll
 *   email your reference number within 24 hours").
 * @slot data-next-steps - Element marked with the `data-next-steps`
 *   attribute. "What happens next" block — author the heading and
 *   paragraphs / list freely.
 * @slot data-actions - Element marked with the `data-actions`
 *   attribute. Buttons / links cluster. Wrapped automatically in
 *   `civ-button-row` so primary + secondary stack on mobile.
 *
 * @example
 * ```html
 * <civ-confirmation-panel
 *   heading="Application complete"
 *   reference="HDJ2-123F"
 * >
 *   <p>We have sent a confirmation email to sarah@example.gov.</p>
 *
 *   <div data-next-steps>
 *     <h2>What happens next</h2>
 *     <p>Your application will be reviewed within 5 working days.</p>
 *   </div>
 *
 *   <div data-actions>
 *     <civ-button label="Print confirmation" variant="secondary"></civ-button>
 *     <civ-link href="/dashboard">Return to dashboard</civ-link>
 *   </div>
 * </civ-confirmation-panel>
 * ```
 */
@customElement('civ-confirmation-panel')
export class CivConfirmationPanel extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return {
      'data-pending-reference': '[data-civ-confirmation-pending]',
      'data-next-steps': '[data-civ-confirmation-next-steps]',
      'data-actions': '[data-civ-confirmation-actions]',
      default: '[data-civ-confirmation-body]',
    };
  }

  /** Success message heading. */
  @property({ type: String }) heading = '';

  /** Heading level (1-6). Defaults to 1 because confirmation pages
   *  typically replace the form page entirely. */
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = 1;

  /** Optional reference / case / confirmation number. */
  @property({ type: String }) reference = '';

  /** Label shown above the reference number. */
  @property({ type: String, attribute: 'reference-label' })
  referenceLabel = 'Reference number';

  /** When true, suppress the auto-focus / SR-announce on mount. */
  @property({ type: Boolean, attribute: 'no-autofocus' }) noAutofocus = false;

  private _headingId = this.generateId('confirmation-heading');

  override firstUpdated(): void {
    this._relocateSlots();
    if (!this.noAutofocus) {
      // Defer to the next frame so the rendered heading is in place
      // and the live region has a chance to attach.
      queueMicrotask(() => this._focusHeading());
    }
  }

  private _focusHeading(): void {
    // generateId() produces an ID-safe token, so a plain getElementById
    // lookup avoids needing CSS.escape (which jsdom doesn't ship).
    const headingEl = this.querySelector<HTMLElement>(
      `[id="${this._headingId}"]`,
    );
    if (!headingEl) return;
    // The heading is a static <p role="heading">; make it programmatically
    // focusable just long enough to move focus, then drop tabindex so the
    // user's Tab key doesn't land on it again.
    headingEl.setAttribute('tabindex', '-1');
    headingEl.focus({ preventScroll: false });
    if (this.heading) this.announce(this.heading, 'polite');
  }

  override render() {
    const hasReference = Boolean(this.reference);

    return html`
      <section
        class="civ-confirmation-panel"
        role="status"
        aria-labelledby="${this.heading ? this._headingId : nothing}"
      >
        <div class="civ-confirmation-panel__header">
          <civ-icon
            class="civ-confirmation-panel__icon"
            name="check-circle"
            aria-hidden="true"
          ></civ-icon>
          ${this.heading
            ? html`<p
                id="${this._headingId}"
                class="civ-confirmation-panel__heading"
                role="heading"
                aria-level="${this.headingLevel}"
              >${this.heading}</p>`
            : nothing}
        </div>

        <div
          class="civ-confirmation-panel__body"
          data-civ-confirmation-body
        ></div>

        ${hasReference
          ? html`
              <div class="civ-confirmation-panel__reference" role="group">
                <p class="civ-confirmation-panel__reference-label">
                  ${this.referenceLabel}
                </p>
                <p class="civ-confirmation-panel__reference-value">
                  ${this.reference}
                </p>
              </div>
            `
          : html`
              <div
                class="civ-confirmation-panel__pending"
                data-civ-confirmation-pending
              ></div>
            `}

        <div
          class="civ-confirmation-panel__next-steps"
          data-civ-confirmation-next-steps
        ></div>

        <div
          class="civ-confirmation-panel__actions civ-button-row"
          data-civ-confirmation-actions
        ></div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-confirmation-panel': CivConfirmationPanel;
  }
}
