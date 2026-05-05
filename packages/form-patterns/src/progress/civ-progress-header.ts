import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, announce, t, interpolate } from '@civui/core';

/**
 * CivUI Progress Header
 *
 * A compact step counter for multi-step forms. Displays
 * "Step X of Y: Title" with configurable heading level and size.
 *
 * Pure display — no navigation or back link. The parent component
 * (typically `civ-form-step`) handles back navigation separately.
 *
 * @element civ-progress-header
 *
 * @prop {number} current - Current step index (0-based, clamped to 0..total-1)
 * @prop {number} total - Total number of steps
 * @prop {string} stepTitle - Title of the current step
 * @prop {string} headerSize - Heading size ('sm' | 'md' | 'lg' | 'xl')
 * @prop {string} headerSpacing - Spacing variant ('default' | 'compact')
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

  /** Heading size: applies civ-heading-{size} class. */
  @property({ type: String, attribute: 'header-size' }) headerSize: 'sm' | 'md' | 'lg' | 'xl' = 'lg';

  /** Spacing variant: 'compact' removes borders and reduces margin. */
  @property({ type: String, attribute: 'header-spacing' }) headerSpacing: 'default' | 'compact' = 'default';

  /** Semantic heading level (1–6). */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: number = 2;

  /** Clamp current to valid range. */
  private get _safeCurrent(): number {
    if (this.total <= 0) return 0;
    return Math.max(0, Math.min(this.current, this.total - 1));
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('current') && this.total > 1) {
      announce(interpolate(t('progressStepsCounter'), {
        current: String(this._safeCurrent + 1),
        total: String(this.total),
      }), 'polite');
    }
  }

  override render() {
    if (this.total <= 1) return nothing;

    const idx = this._safeCurrent;
    const headerClass = this.headerSpacing === 'compact'
      ? 'civ-progress-header civ-progress-header--compact'
      : 'civ-progress-header';

    return html`
      <div class="${headerClass}">
        <span class="civ-progress-header__counter">
          ${interpolate(t('progressStepsCounter'), { current: String(idx + 1), total: String(this.total) })}:
        </span>
        <span class="civ-heading-${this.headerSize} civ-progress-header__title"
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
