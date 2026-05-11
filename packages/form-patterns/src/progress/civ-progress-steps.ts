import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, announce, dispatch, t, interpolate, warnInvalidProp } from '@civui/core';

/**
 * CivUI Progress
 *
 * A segmented progress bar for multi-step forms. Each step is a
 * small rectangle — filled for completed, highlighted for current,
 * and empty for upcoming. Compact at any screen size with no
 * responsive breakpoints needed.
 *
 * @element civ-progress-steps
 *
 * @prop {string} steps - JSON string of step labels
 *   Simple: '["Personal Info","Address","Review"]'
 * @prop {number} current - Current step index (0-based)
 * @prop {boolean} clickable - When true, completed steps become clickable
 * @prop {string} errorSteps - JSON array of step indices with errors
 *
 * @fires civ-step-click - When a completed segment is clicked, detail: { step: number }
 */
@customElement('civ-progress-steps')
export class CivProgressSteps extends CivBaseElement {
  @property({ type: String }) steps = '[]';
  @property({ type: Number }) current = 0;
  @property({ type: Boolean }) clickable = false;
  @property({ type: String, attribute: 'error-steps' }) errorSteps = '[]';

  private _cachedSteps: string | null = null;
  private _cachedStepData: Array<{ label: string }> = [];
  private _cachedErrorSteps: string | null = null;
  private _cachedErrorSet: Set<number> = new Set();

  private _getStepData(): Array<{ label: string }> {
    if (this._cachedSteps === this.steps) return this._cachedStepData;
    this._cachedSteps = this.steps;
    if (!this.steps) {
      this._cachedStepData = [];
      return this._cachedStepData;
    }
    try {
      const parsed = JSON.parse(this.steps);
      if (!Array.isArray(parsed)) {
        warnInvalidProp('civ-progress-steps', 'steps', 'an array of step labels (strings or {label} objects)', this.steps);
        this._cachedStepData = [];
        return this._cachedStepData;
      }
      this._cachedStepData = parsed.map((item: string | { label: string }) =>
        typeof item === 'string' ? { label: item } : item
      );
    } catch {
      warnInvalidProp('civ-progress-steps', 'steps', 'a JSON array of step labels', this.steps);
      this._cachedStepData = [];
    }
    return this._cachedStepData;
  }

  private _getErrorSet(): Set<number> {
    if (this._cachedErrorSteps === this.errorSteps) return this._cachedErrorSet;
    this._cachedErrorSteps = this.errorSteps;
    if (!this.errorSteps) {
      this._cachedErrorSet = new Set();
      return this._cachedErrorSet;
    }
    try {
      const parsed = JSON.parse(this.errorSteps);
      if (!Array.isArray(parsed)) {
        warnInvalidProp('civ-progress-steps', 'error-steps', 'a JSON array of step indices', this.errorSteps);
        this._cachedErrorSet = new Set();
      } else {
        this._cachedErrorSet = new Set(parsed);
      }
    } catch {
      warnInvalidProp('civ-progress-steps', 'error-steps', 'a JSON array of step indices', this.errorSteps);
      this._cachedErrorSet = new Set();
    }
    return this._cachedErrorSet;
  }

  private get _safeCurrent(): number {
    const total = this._getStepData().length;
    if (total === 0) return 0;
    return Math.max(0, Math.min(this.current, total - 1));
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('current')) {
      const stepData = this._getStepData();
      const idx = this._safeCurrent;
      const step = stepData[idx];
      if (step) {
        announce(interpolate(t('progressStepLabel'), {
          step: idx + 1,
          total: stepData.length,
          label: step.label,
        }));
      }
    }
  }

  override render() {
    const stepData = this._getStepData();
    if (stepData.length === 0) return nothing;

    const current = this._safeCurrent;
    const errorSet = this._getErrorSet();

    return html`
      <div role="group" aria-label="${t('progressStepsLabel')}">
        <div class="civ-progress-segments">
          ${stepData.map((step, i) => this._renderSegment(step, i, stepData.length, current, errorSet))}
        </div>
      </div>
    `;
  }

  private _renderSegment(
    step: { label: string },
    index: number,
    total: number,
    current: number,
    errorSet: Set<number>,
  ) {
    const isCompleted = index < current;
    const isCurrent = index === current;
    const hasError = errorSet.has(index);

    const segmentClass = [
      'civ-progress-segment',
      hasError ? 'civ-progress-segment--error' : '',
      !hasError && isCompleted ? 'civ-progress-segment--completed' : '',
      !hasError && isCurrent ? 'civ-progress-segment--current' : '',
    ].filter(Boolean).join(' ');

    const ariaLabel = interpolate(t('progressStepLabel'), {
      step: index + 1,
      total,
      label: step.label,
    });

    if (this.clickable && isCompleted) {
      return html`
        <button
          type="button"
          class="${segmentClass}"
          aria-label="${ariaLabel}"
          aria-current="${isCurrent ? 'step' : nothing}"
          @click="${() => this._onStepClick(index)}"
        ></button>
      `;
    }

    return html`
      <div
        class="${segmentClass}"
        role="listitem"
        aria-label="${ariaLabel}"
        aria-current="${isCurrent ? 'step' : nothing}"
      ></div>
    `;
  }

  private _onStepClick(step: number): void {
    dispatch(this, 'civ-step-click', { step });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-progress-steps': CivProgressSteps;
  }
}
