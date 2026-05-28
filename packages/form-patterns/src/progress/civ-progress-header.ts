import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, announce, t, interpolate } from '@civui/core';

/**
 * CivUI Progress Header
 *
 * A step counter for multi-step forms. Displays
 * "Step X of Y: Title" with configurable emphasis and heading level.
 *
 * Three emphasis levels:
 * - `primary` — divider lines, large heading, generous spacing. Use as a standalone page heading.
 * - `secondary` — no dividers, base font. Use inline in form sections.
 * - `tertiary` — compact, small font. Use alongside civ-progress-steps or civ-progress-percent.
 *
 * Pure display — no navigation or back link. The parent component
 * (typically `civ-form-step`) handles back navigation separately.
 *
 * @element civ-progress-header
 *
 * @prop {number} current - Current step index (0-based, clamped to 0..total-1)
 * @prop {number} total - Total number of steps
 * @prop {string} stepTitle - Title of the current step
 * @prop {'primary'|'secondary'|'tertiary'} emphasis - Visual emphasis level (renamed from `size`; the prop never controlled pixel size, only prominence)
 * @prop {number} headingLevel - Semantic heading level (1–6)
 */
@customElement('civ-progress-header')
export class CivProgressHeader extends CivBaseElement {
  /** Current step index (0-based). Clamped to valid range. */
  @property({ type: Number }) current = 0;

  /** Total number of steps. */
  @property({ type: Number }) total = 0;

  /** Title of the current step. */
  @property({ type: String, attribute: 'step-title' }) stepTitle = '';

  /** Visual emphasis: 'primary' (large with dividers), 'secondary' (medium, default), 'tertiary' (compact). */
  @property({ type: String }) emphasis: 'primary' | 'secondary' | 'tertiary' = 'secondary';

  /** Semantic heading level (1–6). */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: number = 2;

  /** Clamp current to valid range. */
  private get _safeCurrent(): number {
    if (this.total <= 0) return 0;
    return Math.max(0, Math.min(this.current, this.total - 1));
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    // Announce only on an actual step change, never on the initial mount
    // (old value is undefined on first render). Otherwise "Step 1 of N"
    // fires as the page loads.
    if (changed.has('current') && changed.get('current') !== undefined && this.total > 1) {
      announce(interpolate(t('progressStepLabel'), {
        step: this._safeCurrent + 1,
        total: this.total,
        label: this.stepTitle,
      }), 'polite');
    }
  }

  override render() {
    if (this.total <= 1) return nothing;

    const idx = this._safeCurrent;

    return html`
      <div class="civ-progress-header--${this.emphasis}">
        <span class="civ-progress-header__counter">
          ${interpolate(t('progressStepsCounter'), { current: String(idx + 1), total: String(this.total) })}:
        </span>
        <span class="civ-progress-header__title"
          role="heading" aria-level="${this.headingLevel}"
        >${this.stepTitle}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-progress-header': CivProgressHeader;
  }
}
