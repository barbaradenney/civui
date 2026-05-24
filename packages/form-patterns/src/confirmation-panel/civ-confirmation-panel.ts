import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, devWarn, t } from '@civui/core';
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
 * On mount, focus moves to the heading. The host is exposed as a
 * `role="status"` region labelled by the heading, so screen readers
 * announce it politely on first paint. (Announcement is left to the
 * region's implicit live region — the component does NOT additionally
 * call `announce()` to avoid duplicate read-outs.) Set `no-autofocus`
 * to opt out when the surrounding page manages focus itself.
 *
 * When `heading` is omitted, a fallback `aria-label` is set so the
 * region still has an accessible name; a dev-mode warning suggests
 * setting a real heading.
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
    if (!this.heading) {
      devWarn(
        'civ-confirmation-panel',
        'Rendered without a `heading` — set one so screen readers can ' +
        'announce the confirmation. A generic fallback aria-label is being ' +
        'used; this is not a substitute for a real success message.',
        'no-heading',
      );
    }
    if (!this.noAutofocus && this.heading) {
      // Defer to the next microtask so the rendered heading is in place
      // before we try to move focus.
      queueMicrotask(() => this._focusHeading());
    }
  }

  /**
   * Re-fire the auto-focus when an async consumer populates `heading`
   * after mount (initial mount had empty heading → firstUpdated didn't
   * focus; later property assignment renders the heading element for
   * the first time and needs the same focus treatment).
   */
  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!this.noAutofocus && changed.has('heading')) {
      const prev = changed.get('heading') as string | undefined;
      if (!prev && this.heading) {
        queueMicrotask(() => this._focusHeading());
      }
    }
  }

  private _focusHeading(): void {
    // Skip if the panel was removed between scheduling and the microtask
    // running (e.g. SPA route change race).
    if (!this.isConnected) return;
    // generateId() produces an ID-safe token, so a plain getElementById
    // lookup avoids needing CSS.escape (which jsdom doesn't ship).
    const headingEl = this.querySelector<HTMLElement>(
      `[id="${this._headingId}"]`,
    );
    if (!headingEl) return;
    // The heading is a static <p role="heading">; tabindex="-1" makes it
    // programmatically focusable (mouse + JS) without putting it in the
    // sequential Tab order. The attribute is left in place so subsequent
    // re-focuses (e.g. anchor links, screen-reader rotor) keep working.
    headingEl.setAttribute('tabindex', '-1');
    headingEl.focus({ preventScroll: true });
    // Announcement is handled by the section's role="status" implicit
    // live region — calling announce() here would cause a duplicate
    // read-out on screen readers that pick up both signals.
  }

  override render() {
    const hasReference = Boolean(this.reference);
    // Clamp the heading level to the valid ARIA range (1–6); a bad
    // attribute value like heading-level="0" or "foo" would otherwise
    // emit aria-level="0" / "NaN" which is invalid.
    const level = Math.min(
      6,
      Math.max(1, Number(this.headingLevel) || 1),
    );

    return html`
      <section
        class="civ-confirmation-panel"
        role="status"
        aria-labelledby="${this.heading ? this._headingId : nothing}"
        aria-label="${this.heading ? nothing : t('confirmationDefaultLabel')}"
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
                aria-level="${level}"
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
